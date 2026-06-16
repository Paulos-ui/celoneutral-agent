/**
 * runAgent.ts — minimal autonomous loop for the CeloNeutral agent.
 *
 * Responsibilities:
 *   1. Watch the vault's idle stablecoin balance.
 *   2. When idle balance exceeds a threshold, call supplyToAave() to earn yield.
 *   3. Process a queue of pending payments by calling executePayment().
 *
 * Run this anywhere that can hold the agent key: a small VPS, a cron job, or a
 * serverless scheduled function. It needs the AGENT private key (the address set
 * as `agent` on the vault) and a Celo RPC. Keep the key in env, never in code.
 *
 * This is an MVP scaffold. Harden before mainnet: gas limits, retries,
 * idempotency on payments, and an allowlist of payment recipients.
 */

import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const RPC = process.env.CELO_RPC ?? "https://forno.celo.org";
const VAULT = process.env.VAULT_ADDRESS as `0x${string}`;
const AGENT_KEY = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
const IDLE_THRESHOLD = parseUnits("100", 18); // supply once >100 cUSD is idle

const VAULT_ABI = [
  { type: "function", name: "supplyToAave", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "executePayment", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }, { name: "ref", type: "bytes32" }], outputs: [] },
] as const;

const account = privateKeyToAccount(AGENT_KEY);
const publicClient = createPublicClient({ chain: celo, transport: http(RPC) });
const walletClient = createWalletClient({ account, chain: celo, transport: http(RPC) });

async function tick() {
  // 1. Allocate idle funds to yield (threshold-gated to save gas).
  //    A production agent would read the vault's idle balance on-chain first.
  try {
    await walletClient.writeContract({
      address: VAULT,
      abi: VAULT_ABI,
      functionName: "supplyToAave",
      args: [IDLE_THRESHOLD],
    });
    console.log("[agent] supplied idle funds to lending market");
  } catch (e) {
    console.log("[agent] supply skipped:", (e as Error).message);
  }

  // 2. Process the next queued payment (pull from your off-chain queue/DB).
  //    Example placeholder — wire to your invoice source.
  // await walletClient.writeContract({
  //   address: VAULT, abi: VAULT_ABI, functionName: "executePayment",
  //   args: [recipient, amount, ref],
  // });
}

async function main() {
  console.log("[agent] starting CeloNeutral agent on Celo mainnet");
  console.log("[agent] address:", account.address);
  await tick();
  // For a long-running process: setInterval(tick, 60_000);
}

main().catch(console.error);
