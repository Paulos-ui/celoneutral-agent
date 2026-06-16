"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { Loader2, ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { TOKENS, TokenKey, ERC20_ABI, VAULT_ABI, ZERO_ADDRESS } from "@/lib/contracts";

/**
 * Deposit / withdraw against the CeloNeutralVault.
 * Supports multiple assets (cUSD, CELO) — each backed by its own vault instance.
 * Deposit is a two-step ERC-20 pattern: approve the vault, then deposit.
 */
export default function DepositPage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [tokenKey, setTokenKey] = useState<TokenKey>("cUSD");
  const [amount, setAmount] = useState("");

  const token = TOKENS[tokenKey];
  const vaultLive = token.vault !== ZERO_ADDRESS;

  const { writeContractAsync, isPending } = useWriteContract();

  const { data: allowance } = useReadContract({
    address: token.token,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, token.vault] : undefined,
    query: { enabled: Boolean(address) && vaultLive },
  });

  async function handleDeposit() {
    if (!amount || !vaultLive) return;
    const value = parseUnits(amount, token.decimals);
    if (!allowance || (allowance as bigint) < value) {
      await writeContractAsync({
        address: token.token,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [token.vault, value],
      });
    }
    await writeContractAsync({
      address: token.vault,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [value],
    });
    setAmount("");
  }

  async function handleWithdraw() {
    if (!amount || !vaultLive) return;
    await writeContractAsync({
      address: token.vault,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [parseUnits(amount, token.decimals)],
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
            ? `Deposit ${token.symbol} to start earning yield.`
            : `Withdraw your ${token.symbol} principal anytime.`}
        </p>
      </motion.div>

      <div className="mt-8 rounded-3xl border border-ink-800 bg-ink-900 p-6 shadow-gold">
        {/* Token toggle */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-ink-850 p-1">
          {(Object.keys(TOKENS) as TokenKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTokenKey(k)}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                tokenKey === k ? "bg-gold text-ink-950" : "text-neutral-400 hover:text-white"
              }`}
            >
              {TOKENS[k].symbol}
            </button>
          ))}
        </div>

        {/* Deposit / withdraw tabs */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-ink-850 p-1">
          {(["deposit", "withdraw"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-ink-900 text-gold" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t === "deposit" ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpToLine className="h-4 w-4" />}
              {t}
            </button>
          ))}
        </div>

        {!vaultLive ? (
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-center text-sm text-neutral-300">
            The {token.symbol} vault isn&apos;t deployed yet. Deploy it and set
            <code className="mx-1 text-gold">NEXT_PUBLIC_VAULT_ADDRESS_CELO</code>
            to enable {token.symbol} deposits.
          </div>
        ) : (
          <>
            <label className="text-sm text-neutral-400">Amount ({token.symbol})</label>
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
                ? `Approve & deposit ${token.symbol}`
                : `Withdraw ${token.symbol}`}
            </button>
          </>
        )}

        <p className="mt-4 text-center text-xs text-neutral-600">
          Transactions settle on Celo mainnet. Gas is paid in CELO. Yield is not active
          in this version — funds return as principal. Not financial advice.
        </p>
      </div>
    </div>
  );
}
