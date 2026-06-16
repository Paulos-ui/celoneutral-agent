"use client";

import { motion } from "framer-motion";
import { useAccount, useReadContract } from "wagmi";
import StatCard from "@/components/StatCard";
import DashboardPreview from "@/components/DashboardPreview";
import { VAULT_ABI, VAULT_ADDRESS } from "@/lib/contracts";
import { fmtUSD, toNumber } from "@/lib/format";

/**
 * Dashboard — shows protocol-wide stats plus the connected user's position.
 * Reads `balanceOf(user)` and `totalDeposits()` from the vault when available.
 */
export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  const { data: userBalance } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const position = userBalance ? toNumber(userBalance as bigint) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-sm font-medium uppercase tracking-widest text-gold">
          Dashboard
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Your position
        </h1>
        <p className="mt-2 text-neutral-400">
          Live view of the vault and your deposited stablecoins.
        </p>
      </motion.div>

      <div className="mt-10">
        <DashboardPreview />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Your deposit"
          value={isConnected ? fmtUSD(position, 2) : "—"}
          sub={isConnected ? "cUSD in the vault" : "Connect wallet to view"}
        />
        <StatCard label="Current APY" value="7.2%" sub="Variable · lending market" />
        <StatCard label="Network" value="Celo" sub="Mainnet · chainId 42220" />
      </div>

      {!isConnected && (
        <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-center text-neutral-300">
          Connect your wallet to see your live position and yield.
        </div>
      )}
    </div>
  );
}
