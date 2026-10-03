/**
 * Unified OpenRouter Multi-Model Client for QuerySonar
 * Routes requests to real AI models (ChatGPT, Claude, DeepSeek, Grok, Perplexity)
 * using a single unified OPENROUTER_API_KEY.
 */

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export interface OpenRouterChatRequest {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface OpenRouterChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export function getCleanOpenRouterKey(): string {
  const raw = process.env.OPENROUTER_API_KEY || "";
  return raw.replace(/^["'\s]+|["'\s]+$/g, "");
}

export async function callOpenRouterChatCompletion({
  model,
  systemPrompt,
  userPrompt,
  maxTokens = 1200,
  temperature = 0.25,
  timeoutMs = 7000
}: OpenRouterChatRequest): Promise<OpenRouterChatResponse | null> {
  const apiKey = getCleanOpenRouterKey();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const messages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    { role: "user", content: userPrompt }
  ];

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "QuerySonar Brand Intelligence",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature
      }),
      signal: controller.signal
    });

    if (res.ok) {
      const rawText = await res.text();
      const trimmed = rawText.trim();
      const firstBrace = trimmed.indexOf("{");
      const lastBrace = trimmed.lastIndexOf("}");
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        const parsedJson = JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
        const content =
          parsedJson?.choices?.[0]?.message?.content ||
          parsedJson?.choices?.[0]?.text ||
          "";

        if (content && typeof content === "string" && content.trim()) {
          clearTimeout(timeout);
          return {
            content: content.trim(),
            model: parsedJson.model || model,
            usage: {
              promptTokens: parsedJson.usage?.prompt_tokens || 0,
              completionTokens: parsedJson.usage?.completion_tokens || 0,
              totalTokens: parsedJson.usage?.total_tokens || 0
            }
          };
        }
      }
    } else {
      const errText = await res.text().catch(() => "");
      console.warn(`[OpenRouter] HTTP error ${res.status} for model ${model}:`, errText.slice(0, 300));
    }
  } catch (err) {
    console.warn(`[OpenRouter] Request failed for ${model}:`, err);
  } finally {
    clearTimeout(timeout);
  }

  return null;
}
