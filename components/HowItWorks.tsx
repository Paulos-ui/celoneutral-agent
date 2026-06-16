"use client";

import { motion } from "framer-motion";
import { Wallet, Sparkles, Send, ArrowDownToLine } from "lucide-react";

const steps = [
  { icon: Wallet, title: "Deposit stablecoins", desc: "Deposit cUSD or USDC into your non-custodial vault. You keep control — the contract only ever moves funds you've approved." },
  { icon: Sparkles, title: "Agent earns yield", desc: "The autonomous agent allocates idle balance to a Celo lending market, so your stablecoins earn yield automatically instead of sitting still." },
  { icon: Send, title: "Pay from your position", desc: "Settle real-world payments straight from the vault. The agent executes the transfer on-chain — no manual withdraw-then-send round trip." },
  { icon: ArrowDownToLine, title: "Withdraw anytime", desc: "Pull your principal back whenever you want. No lock-up, no directional risk — just stablecoin yield and instant settlement." },
];

const card = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <div className="text-center">
        <span className="text-sm font-medium uppercase tracking-widest text-gold">
          How it works
        </span>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Yield and payments, fully automated
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
          One agent handles the whole loop — so your stablecoins are always
          working and always spendable.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-ink-800 bg-ink-900 p-7 transition-colors hover:border-gold/40"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-ink-950">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-display text-5xl font-bold text-ink-800 transition-colors group-hover:text-gold/20">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-neutral-400">{s.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
