const GEMINI_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyBTHq5SgNGW2xUeyiJwiuJQxliBn4oE1UA";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export async function callGemini(
  prompt: string,
  opts?: { temp?: number; maxTokens?: number }
): Promise<string> {
  const models = ["gemini-2.5-flash", "gemma-3-27b-it"];
  const delays = [0, 3000, 6000, 10000, 15000];

  for (const model of models) {
    for (let i = 0; i < delays.length; i++) {
      if (delays[i]) await new Promise((r) => setTimeout(r, delays[i]));
      try {
        const res = await fetch(
          `${BASE}/${model}:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: opts?.temp ?? 0.7,
                maxOutputTokens: opts?.maxTokens ?? 4096,
              },
            }),
          }
        );
        const data = await res.json();
        if (res.ok) {
          return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
        const msg = data?.error?.message || "";
        if (
          res.status === 503 ||
          msg.includes("high demand") ||
          msg.includes("overloaded")
        ) {
          continue;
        }
        break;
      } catch {
        continue;
      }
    }
  }
  throw new Error("Gemini AI dang qua tai. Vui long thu lai sau 30 giay.");
}

export function extractJSON<T>(text: string, fallback: T): T {
  try {
    const d = JSON.parse(text.trim());
    if (d && typeof d === "object") return d as T;
  } catch {
    // fallthrough
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const d = JSON.parse(match[0]);
      if (d && typeof d === "object") return d as T;
    } catch {
      // fallthrough
    }
  }
  return fallback;
}
