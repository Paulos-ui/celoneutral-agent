"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { Loader2, ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import {
  VAULT_ABI,
  VAULT_ADDRESS,
  STABLE_ADDRESS,
  ERC20_ABI,
} from "@/lib/contracts";

/**
 * Deposit / withdraw flow against the live CeloNeutralVault.
 * Deposit is a two-step ERC-20 pattern: approve the vault, then deposit.
 * Amounts use 18 decimals (cUSD). For native USDC (6 decimals) adjust.
 */
const DECIMALS = 18;

export default function DepositPage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  const { writeContractAsync, isPending } = useWriteContract();

  const { data: allowance } = useReadContract({
    address: STABLE_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, VAULT_ADDRESS] : undefined,
    query: { enabled: Boolean(address) },
  });

  async function handleDeposit() {
    if (!amount) return;
    const value = parseUnits(amount, DECIMALS);
    // Step 1: approve if needed
    if (!allowance || (allowance as bigint) < value) {
      await writeContractAsync({
        address: STABLE_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [VAULT_ADDRESS, value],
      });
    }
    // Step 2: deposit
    await writeContractAsync({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [value],
    });
    setAmount("");
  }

  async function handleWithdraw() {
    if (!amount) return;
    const value = parseUnits(amount, DECIMALS);
    await writeContractAsync({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [value],
    });
    setAmount("");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-center font-display text-4xl font-bold tracking-tight">
          {tab === "deposit" ? "Deposit" : "Withdraw"}
        </h1>
        <p className="mt-2 text-center text-neutral-400">
          {tab === "deposit"
            ? "Deposit cUSD to start earning yield."
            : "Withdraw your principal anytime."}
        </p>
      </motion.div>

      <div className="mt-8 rounded-3xl border border-ink-800 bg-ink-900 p-6 shadow-gold">
        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-ink-850 p-1">
          {(["deposit", "withdraw"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-gold text-ink-950" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t === "deposit" ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpToLine className="h-4 w-4" />}
              {t}
            </button>
          ))}
        </div>

        <label className="text-sm text-neutral-400">Amount (cUSD)</label>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-2 w-full rounded-xl border border-ink-800 bg-ink-950 px-4 py-3.5 text-lg text-white outline-none focus:border-gold/50"
        />

        <button
          disabled={!isConnected || isPending || !amount}
          onClick={tab === "deposit" ? handleDeposit : handleWithdraw}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 font-semibold text-ink-950 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {!isConnected
            ? "Connect wallet first"
            : tab === "deposit"
            ? "Approve & deposit"
            : "Withdraw"}
        </button>

        <p className="mt-4 text-center text-xs text-neutral-600">
          Transactions settle on Celo mainnet. Gas is paid in CELO.
          Not financial advice — DeFi involves risk.
        </p>
      </div>
    </div>
  );
}
