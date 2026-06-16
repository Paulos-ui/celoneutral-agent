"use client";

import { motion } from "framer-motion";
import { MessageSquare, Cpu, ShieldCheck, Send } from "lucide-react";

/**
 * AgentGuide — an animated, step-by-step explainer shown beside the chat so users
 * understand how the AI agent turns plain English into safe on-chain actions.
 */

const steps = [
  {
    icon: MessageSquare,
    title: "1 · Say it in plain English",
    desc: 'Type a request like "put my idle funds to work" or "pay 50 cUSD to 0x… for invoice 12". No commands to memorize.',
  },
  {
    icon: Cpu,
    title: "2 · The AI understands intent",
    desc: "A Groq-powered model parses your message into a precise, structured on-chain action — an amount, a recipient, a purpose.",
  },
  {
    icon: ShieldCheck,
    title: "3 · Guardrails check it",
    desc: "Hard-coded rules clamp the amount, enforce a recipient allowlist, and reject anything outside limits. The model can only propose.",
  },
  {
    icon: Send,
    title: "4 · The agent executes on Celo",
    desc: "Approved actions run autonomously through the vault on Celo mainnet — supplying funds for yield or settling a payment.",
  },
];

const item = {
  hidden: { opacity: 0, x: 24 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function AgentGuide() {
  return (
    <div className="relative">
      <h3 className="font-display text-2xl font-bold tracking-tight text-white">
        How to use the agent
      </h3>
      <p className="mt-2 text-sm text-neutral-400">
        From a sentence to a safe on-chain action in four steps.
      </p>

      {/* Vertical connector line */}
      <div className="absolute left-[22px] top-[96px] bottom-4 w-px bg-gradient-to-b from-gold/40 to-transparent" />

      <div className="mt-6 space-y-5">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              custom={i}
              variants={item}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="relative flex gap-4"
            >
              <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-ink-900 text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <div className="pt-1">
                <p className="font-semibold text-white">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-400">{s.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="mt-6 rounded-xl border border-ink-800 bg-ink-900 p-4 text-xs text-neutral-500"
      >
        The chat shows the agent&apos;s <span className="text-gold">proposed</span> action.
        Fund-moving steps run through the autonomous agent under its own guardrails —
        the AI never holds your keys.
      </motion.p>
    </div>
  );
}
