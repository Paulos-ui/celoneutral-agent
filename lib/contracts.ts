import type { Address } from "viem";

/** On-chain addresses, token registry, and ABIs used by the frontend. */

export const CELO_CHAIN_ID = 42220;
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

// cUSD vault (your existing deployment). Also used by the dashboard.
export const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? ZERO_ADDRESS) as Address;
export const STABLE_ADDRESS = (process.env.NEXT_PUBLIC_STABLE_ADDRESS ??
  "0x765DE816845861e75A25fCA122bb6898B8B1282a") as Address; // cUSD mainnet

export const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID ?? "";

/**
 * Multi-asset support. CELO is both the native gas token AND an ERC-20, so it
 * reuses the exact same vault contract — each asset just gets its own instance.
 * Deploy a CELO vault and set NEXT_PUBLIC_VAULT_ADDRESS_CELO to enable it.
 */
export type TokenKey = "cUSD" | "CELO";

export const TOKENS: Record<
  TokenKey,
  { symbol: string; token: Address; vault: Address; decimals: number }
> = {
  cUSD: {
    symbol: "cUSD",
    token: STABLE_ADDRESS,
    vault: VAULT_ADDRESS,
    decimals: 18,
  },
  CELO: {
    symbol: "CELO",
    token: "0x471EcE3750Da237f93B8E339c536989b8978a438" as Address, // CELO ERC-20
    vault: (process.env.NEXT_PUBLIC_VAULT_ADDRESS_CELO ?? ZERO_ADDRESS) as Address,
    decimals: 18,
  },
};

// Minimal ERC-20 ABI (approve + allowance + balance).
export const ERC20_ABI = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;

// CeloNeutralVault ABI — methods the UI calls.
export const VAULT_ABI = [
  { type: "function", name: "deposit", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalDeposits", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;
