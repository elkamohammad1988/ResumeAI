import { GoogleGenAI } from "@google/genai";
import { env, features } from "@/lib/env";

let _client: GoogleGenAI | null = null;

function gemini(): GoogleGenAI {
  if (!features.gemini || !env.GEMINI_API_KEY) {
    throw new Error(
      "Gemini is not configured. Set GEMINI_API_KEY in your environment.",
    );
  }
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return _client;
}

/**
 * Single-shot text generation. Returns the joined text content.
 * Throws on API errors so callers can surface real messages to the user.
 */
export async function generateText(
  prompt: string,
  systemInstruction = "You are an expert resume writer.",
): Promise<string> {
  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const result = await gemini().models.generateContent({
    model,
    contents: prompt,
    config: { systemInstruction },
  });
  return result.text || "";
}
