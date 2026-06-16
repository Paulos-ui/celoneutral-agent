"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gold-radial" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-4xl px-4 pt-20 pb-16 text-center"
      >
        <motion.div variants={item} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-sm text-gold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            Built on Celo · Autonomous Onchain Agent
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
        >
          Earn yield on stablecoins.
          <br />
          <span className="text-gradient-gold">Pay straight from it.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400"
        >
          CeloNeutral is an autonomous agent that puts your cUSD and USDC to work
          earning yield, then settles real-world payments directly from your
          position — no manual withdrawals, no idle capital.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/deposit"
            className="group inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 font-semibold text-ink-950 shadow-gold transition-transform hover:scale-[1.03] active:scale-100"
          >
            Start earning
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-900 px-8 py-3.5 font-medium text-white transition-colors hover:border-gold/40 hover:bg-ink-850"
          >
            View dashboard
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-neutral-500"
        >
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" /> Non-custodial vault
          </span>
          <span className="inline-flex items-center gap-2">
            <Zap className="h-4 w-4 text-gold" /> ERC-8004 registered agent
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold" /> Live on Celo mainnet
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
