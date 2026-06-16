"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User } from "lucide-react";

/**
 * AgentChat — natural-language interface to the CeloNeutral agent.
 * Sends the message to /api/agent (server-side, where the key lives) and shows
 * the agent's structured *proposal*. It never moves funds from the browser.
 */

type Msg = { role: "user" | "agent"; text: string };

const SUGGESTIONS = [
  "Put my idle funds to work",
  "Pay 50 cUSD to 0xabc...123 for invoice 12",
  "How does the vault earn yield?",
];

export default function AgentChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "agent",
      text: 'Hi — I\'m the CeloNeutral agent. Tell me what to do in plain English, like "put idle funds to work" or "pay 50 cUSD to 0x… for invoice 12".',
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;
    setMsgs((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      let reply = "Sorry, I couldn't process that.";
      const r = data.result;
      if (r) {
        if (r.action === "pay")
          reply = `Proposed payment: ${r.amount} cUSD → ${r.to} (ref: ${r.ref}). ${r.explanation ?? ""}\n\nThe autonomous agent executes this under its guardrails.`;
        else if (r.action === "supply")
          reply = `Proposed: supply ${r.amount} cUSD to the lending market for yield. ${r.explanation ?? ""}`;
        else reply = r.explanation ?? reply;
      } else if (data.error) {
        reply = data.error;
      }
      setMsgs((m) => [...m, { role: "agent", text: reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "agent", text: "Something went wrong reaching the agent." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[520px] flex-col rounded-3xl border border-ink-800 bg-ink-900 shadow-gold">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-ink-800 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display font-semibold text-white">CeloNeutral Agent</p>
          <p className="text-xs text-gold">online · AI-powered</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <AnimatePresence initial={false}>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "agent" && <Bot className="mt-1 h-4 w-4 shrink-0 text-gold" />}
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-gold text-ink-950"
                    : "bg-ink-850 text-neutral-200"
                }`}
              >
                {m.text}
              </div>
              {m.role === "user" && <User className="mt-1 h-4 w-4 shrink-0 text-neutral-500" />}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin text-gold" /> thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 px-5 pb-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full border border-ink-800 bg-ink-850 px-3 py-1 text-xs text-neutral-400 transition-colors hover:border-gold/40 hover:text-gold"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-ink-800 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Tell the agent what to do…"
          className="flex-1 rounded-xl border border-ink-800 bg-ink-950 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-ink-950 transition-transform hover:scale-105 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
