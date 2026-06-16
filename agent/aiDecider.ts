/**
 * aiDecider.ts — AI decision layer for the CeloNeutral agent, powered by Groq.
 *
 * SECURITY:
 *  - GROQ_API_KEY is read from the environment and used ONLY here, server-side
 *    (inside the agent process). Never expose it to the browser: no NEXT_PUBLIC_
 *    prefix, never send it to the frontend.
 *  - The model only PROPOSES an action. The hard limits in enforceGuardrails()
 *    are enforced in code, so a bad, hallucinated, or manipulated model response
 *    can never move funds outside the rules. Treat model output as untrusted.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile"; // pick any model from Groq's model list

export type VaultState = {
  idleBalance: number; // stablecoin sitting idle in the vault
  totalDeposits: number;
  pendingPayments: { to: string; amount: number; ref: string }[];
};

export type AgentAction =
  | { action: "supply"; amount: number }
  | { action: "pay"; to: string; amount: number; ref: string }
  | { action: "hold"; reason: string };

// ── Hard guardrails (enforced in code, NOT trusted to the model) ──
const MAX_SUPPLY = 10_000; // never supply more than this per decision
const MAX_PAYMENT = 1_000; // never pay more than this in a single tx
const RECIPIENT_ALLOWLIST = new Set<string>([
  // "0xMerchantAddressHere...",  // only addresses listed here can be paid
]);

/** Ask the LLM for a recommended action, then clamp it to the rules. */
export async function decideAction(state: VaultState): Promise<AgentAction> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set in environment");

  const system = `You are the decision engine for an onchain stablecoin vault agent on Celo.
Given the vault state, choose ONE action that maximises safe yield while clearing due payments.
Respond ONLY with a single JSON object, no prose, in one of these exact shapes:
{"action":"supply","amount":<number>}
{"action":"pay","to":"<0x address>","amount":<number>,"ref":"<string>"}
{"action":"hold","reason":"<string>"}`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Vault state:\n${JSON.stringify(state, null, 2)}` },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";

  let proposed: AgentAction;
  try {
    proposed = JSON.parse(raw);
  } catch {
    return { action: "hold", reason: "unparseable model output" };
  }

  return enforceGuardrails(proposed, state);
}

/** Clamp and validate the model's proposal against the hard rules above. */
function enforceGuardrails(a: AgentAction, state: VaultState): AgentAction {
  if (a.action === "supply") {
    const amount = Math.min(Math.max(a.amount ?? 0, 0), MAX_SUPPLY, state.idleBalance);
    return amount > 0
      ? { action: "supply", amount }
      : { action: "hold", reason: "no idle funds to supply" };
  }

  if (a.action === "pay") {
    if (!RECIPIENT_ALLOWLIST.has(a.to)) {
      return { action: "hold", reason: `recipient ${a.to} not allowlisted` };
    }
    const amount = Math.min(Math.max(a.amount ?? 0, 0), MAX_PAYMENT, state.idleBalance);
    return amount > 0
      ? { action: "pay", to: a.to, amount, ref: a.ref ?? "" }
      : { action: "hold", reason: "invalid payment amount" };
  }

  return { action: "hold", reason: a.action === "hold" ? a.reason : "unknown action" };
}
