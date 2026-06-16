"use client";

import { motion } from "framer-motion";
import { fmtUSD } from "@/lib/format";

/**
 * DashboardPreview — animated TVL/yield headline numbers.
 * Numbers tick upward on mount to feel live; replace with on-chain reads
 * (totalDeposits from the vault) once deployed.
 */
import { useEffect, useState } from "react";

function useCountUp(target: number, duration = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setV(target * (1 - Math.pow(1 - p, 3))); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export default function DashboardPreview() {
  const tvl = useCountUp(128450);
  const yieldEarned = useCountUp(8932);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-ink-800 bg-ink-900 p-6"
      >
        <p className="text-sm text-neutral-400">Total value in vault</p>
        <p className="mt-1 font-display text-4xl font-bold text-gradient-gold">
          {fmtUSD(tvl, 0)}
        </p>
        <p className="mt-1 text-xs text-neutral-500">cUSD deposited across all users</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-ink-800 bg-ink-900 p-6"
      >
        <p className="text-sm text-neutral-400">Yield generated</p>
        <p className="mt-1 font-display text-4xl font-bold text-white">{fmtUSD(yieldEarned, 0)}</p>
        <p className="mt-1 text-xs text-neutral-500">Distributed to depositors to date</p>
      </motion.div>
    </div>
  );
}
