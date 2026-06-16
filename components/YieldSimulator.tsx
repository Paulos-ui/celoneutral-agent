"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { fmtUSD } from "@/lib/format";

const APY_SCENARIOS = [
  { label: "Conservative", apy: 4 },
  { label: "Base", apy: 7 },
  { label: "Optimistic", apy: 11 },
];

export default function YieldSimulator() {
  const [deposit, setDeposit] = useState(5000);
  const [months, setMonths] = useState(12);
  const [apy, setApy] = useState(7);

  const { final, earned } = useMemo(() => {
    const r = apy / 100 / 12; // monthly rate
    const f = deposit * Math.pow(1 + r, months);
    return { final: f, earned: f - deposit };
  }, [deposit, months, apy]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-24">
      <div className="text-center">
        <span className="text-sm font-medium uppercase tracking-widest text-gold">Try it</span>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Estimate your yield
        </h2>
      </div>

      <div className="mt-12 rounded-3xl border border-ink-800 bg-ink-900 p-8 shadow-gold">
        <label className="flex items-center justify-between text-sm text-neutral-400">
          <span>Deposit</span>
          <span className="font-semibold text-white">{fmtUSD(deposit, 0)}</span>
        </label>
        <input
          type="range" min={100} max={100000} step={100}
          value={deposit}
          onChange={(e) => setDeposit(Number(e.target.value))}
          className="mt-2 w-full accent-gold"
        />

        <label className="mt-6 flex items-center justify-between text-sm text-neutral-400">
          <span>Time horizon</span>
          <span className="font-semibold text-white">{months} months</span>
        </label>
        <input
          type="range" min={1} max={36} step={1}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="mt-2 w-full accent-gold"
        />

        <div className="mt-6 grid grid-cols-3 gap-2">
          {APY_SCENARIOS.map((s) => (
            <button
              key={s.label}
              onClick={() => setApy(s.apy)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                apy === s.apy
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-ink-800 bg-ink-850 text-neutral-400 hover:border-gold/40"
              }`}
            >
              {s.label}
              <span className="block text-xs opacity-70">{s.apy}% APY</span>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-ink-950 p-6 text-center">
          <p className="text-sm text-neutral-400">Projected balance</p>
          <motion.p
            key={final}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1 font-display text-5xl font-bold text-gradient-gold"
          >
            {fmtUSD(final, 0)}
          </motion.p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold">
            <TrendingUp className="h-4 w-4" />
            +{fmtUSD(earned, 0)} earned
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-600">
          Illustrative estimate based on a fixed APY and monthly compounding.
          Actual yield varies and is not guaranteed.
        </p>
      </div>
    </section>
  );
}
