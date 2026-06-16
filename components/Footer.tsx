import { AGENT_ID } from "@/lib/contracts";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-800 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gold">
            <span className="text-xs font-bold text-ink-950">C</span>
          </div>
          <span className="text-sm text-neutral-400">
            CeloNeutral Agent — stable yield + payments on Celo
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-600">
          <span>Built on Celo mainnet</span>
          {AGENT_ID && <span>ERC-8004 agentId: {AGENT_ID}</span>}
          <span>Not financial advice · DeFi involves risk</span>
        </div>
      </div>
    </footer>
  );
}
