import AgentChat from "@/components/AgentChat";
import AgentGuide from "@/components/AgentGuide";

export const metadata = {
  title: "AI Agent — CeloNeutral",
  description: "Talk to the CeloNeutral agent in plain English to manage yield and payments on Celo.",
};

export default function AgentPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <span className="text-sm font-medium uppercase tracking-widest text-gold">AI Agent</span>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Talk to your vault
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
          Manage yield and payments in plain English. The agent turns your words into
          safe, guardrailed on-chain actions on Celo.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-10 md:grid-cols-2">
        <AgentChat />
        <AgentGuide />
      </div>
    </div>
  );
}
