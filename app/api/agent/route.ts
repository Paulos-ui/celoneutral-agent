import { NextRequest } from "next/server";

/**
 * POST /api/agent
 * Server-side only. Holds GROQ_API_KEY (never exposed to the browser) and turns a
 * natural-language message into a structured, guardrailed action *proposal*.
 * It does NOT move funds — the autonomous agent executes proposals under its own
 * guardrails. This route is the safe, demo-facing intent parser.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MAX_PAYMENT = 1000; // display-side clamp

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return Response.json({ error: "AI is not configured on the server." }, { status: 500 });

  let message: string;
  try {
    ({ message } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!message || typeof message !== "string") {
    return Response.json({ error: "A 'message' string is required." }, { status: 400 });
  }

  const system = `You parse a user's natural-language request to a stablecoin vault agent on Celo into a structured action.
Respond ONLY with a single JSON object, no prose, in one of these shapes:
{"action":"pay","to":"<0x address>","amount":<number>,"ref":"<string>","explanation":"<one friendly sentence>"}
{"action":"supply","amount":<number>,"explanation":"<one friendly sentence>"}
{"action":"info","explanation":"<answer to a general question about the vault>"}
{"action":"unknown","explanation":"<why you could not parse it>"}`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: message },
        ],
      }),
    });
    if (!res.ok) return Response.json({ error: "The AI service returned an error." }, { status: 502 });

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");

    // Light guardrail so the displayed proposal can't show an unbounded amount.
    if (parsed.action === "pay" && typeof parsed.amount === "number") {
      parsed.amount = Math.min(Math.max(parsed.amount, 0), MAX_PAYMENT);
    }
    return Response.json({ result: parsed });
  } catch {
    return Response.json({ error: "Could not parse the AI response." }, { status: 500 });
  }
}
