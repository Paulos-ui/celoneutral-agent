/**
 * runAgent.ts — CeloNeutral autonomous AI agent.
 *
 * Each tick it:
 *   1. Reads real vault state from Celo (idle balance + total deposits).
 *   2. Asks the Groq-powered decision layer what to do (guardrailed in aiDecider).
 *   3. Executes the resulting action on-chain via the vault.
 *
 * Run server-side only (holds the agent key). Schedule with cron / systemd /
 * a serverless timer. Secrets come from agent/.env — never commit them.
 */

import "dotenv/config";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  formatUnits,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { decideAction, VaultState } from "./aiDecider";

const RPC = process.env.CELO_RPC ?? "https://forno.celo.org";
const VAULT = process.env.VAULT_ADDRESS as `0x${string}`;
const STABLE = (process.env.STABLE_ADDRESS ??
  "0x765DE816845861e75A25fCA122bb6898B8B1282a") as `0x${string}`; // cUSD
const AGENT_KEY = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
const DECIMALS = 18;

const VAULT_ABI = [
  { type: "function", name: "totalDeposits", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "supplyToAave", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "executePayment", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }, { name: "ref", type: "bytes32" }], outputs: [] },
] as const;

const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const publicClient = createPublicClient({ chain: celo, transport: http(RPC) });

/** Read the live vault state from Celo. */
async function readState(): Promise<VaultState> {
  const [idleRaw, depositsRaw] = await Promise.all([
    publicClient.readContract({ address: STABLE, abi: ERC20_ABI, functionName: "balanceOf", args: [VAULT] }),
    publicClient.readContract({ address: VAULT, abi: VAULT_ABI, functionName: "totalDeposits" }),
  ]);
  return {
    idleBalance: Number(formatUnits(idleRaw as bigint, DECIMALS)),
    totalDeposits: Number(formatUnits(depositsRaw as bigint, DECIMALS)),
    pendingPayments: [], // wire to your invoice queue / DB
  };
}

async function tick() {
  const account = privateKeyToAccount(AGENT_KEY);
  const walletClient = createWalletClient({ account, chain: celo, transport: http(RPC) });

  const state = await readState();
  console.log("[agent] state:", state);

  const decision = await decideAction(state);
  console.log("[agent] decision:", decision);

  if (decision.action === "supply") {
    const hash = await walletClient.writeContract({
      address: VAULT, abi: VAULT_ABI, functionName: "supplyToAave",
      args: [parseUnits(String(decision.amount), DECIMALS)],
    });
    console.log("[agent] supply tx:", hash);
  } else if (decision.action === "pay") {
    const hash = await walletClient.writeContract({
      address: VAULT, abi: VAULT_ABI, functionName: "executePayment",
      args: [
        decision.to as `0x${string}`,
        parseUnits(String(decision.amount), DECIMALS),
        stringToHex(decision.ref, { size: 32 }),
      ],
    });
    console.log("[agent] payment tx:", hash);
  } else {
    console.log("[agent] holding:", decision.reason);
  }
}

async function main() {
  console.log("[agent] CeloNeutral AI agent starting on Celo mainnet");
  console.log("[agent] vault:", VAULT);
  await tick();
  // For continuous operation: setInterval(() => tick().catch(console.error), 60_000);
}

main().catch(console.error);
