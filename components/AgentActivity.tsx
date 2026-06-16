"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, ArrowDownToLine, ArrowUpToLine } from "lucide-react";

/**
 * AgentActivity — the page's signature element.
 * A simulated live feed of the agent's actions (yield allocation + payments)
 * to make the autonomous behaviour tangible. This is illustrative UI; the
 * real feed reads on-chain events from the vault in production.
 */

type Event = { kind: "yield" | "pay" | "deposit" | "withdraw"; text: string; amount: string };

const POOL: Event[] = [
  { kind: "yield", text: "Allocated idle balance to lending market", amount: "+ yield" },
  { kind: "pay", text: "Settled invoice to merchant 0x4f…b21", amount: "−$240.00" },
  { kind: "deposit", text: "New deposit detected", amount: "+$1,500.00" },
  { kind: "yield", text: "Compounded accrued interest", amount: "+$12.84" },
  { kind: "pay", text: "Paid supplier 0x9a…e07", amount: "−$88.50" },
  { kind: "withdraw", text: "Processed user withdrawal", amount: "−$500.00" },
];

const ICONS = {
  yield: Sparkles,
  pay: Send,
  deposit: ArrowDownToLine,
  withdraw: ArrowUpToLine,
};

export default function AgentActivity() {
  const [feed, setFeed] = useState<Event[]>(POOL.slice(0, 4));

  useEffect(() => {
    const id = setInterval(() => {
      const next = POOL[Math.floor(Math.random() * POOL.length)];
      setFeed((f) => [next, ...f].slice(0, 4));
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 pb-16">
      <div className="rounded-3xl border border-ink-800 bg-ink-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-white">Agent activity</h3>
          <span className="inline-flex items-center gap-2 text-xs text-gold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" /> live
          </span>
        </div>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {feed.map((e, i) => {
              const Icon = ICONS[e.kind];
              const negative = e.amount.startsWith("−");
              return (
                <motion.div
                  key={`${e.text}-${i}`}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center justify-between rounded-xl bg-ink-850 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-gold" />
                    <span className="text-sm text-neutral-300">{e.text}</span>
                  </div>
                  <span className={`text-sm font-medium ${negative ? "text-neutral-400" : "text-gold"}`}>
                    {e.amount}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <p className="mt-4 text-center text-xs text-neutral-600">
          Illustrative feed. In production this streams real vault events from Celo.
        </p>
      </div>
    </section>
  );
}
