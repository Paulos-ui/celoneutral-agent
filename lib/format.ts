import { formatUnits } from "viem";

/** Format a USD-pegged amount for display. */
export const fmtUSD = (n: number, max = 2) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: max,
  });

/** Format a percentage (input already in percent, e.g. 7.2 -> "7.20%"). */
export const fmtPct = (n: number) => `${n.toFixed(2)}%`;

/** Convert an on-chain bigint balance (18 decimals for cUSD) to a number. */
export const toNumber = (value: bigint, decimals = 18) =>
  Number(formatUnits(value, decimals));
