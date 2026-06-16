"use client";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900 p-6 transition-colors hover:border-gold/30">
      <p className="text-sm font-medium text-neutral-400">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}
