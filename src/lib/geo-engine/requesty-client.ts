/**
 * Unified Requesty AI Client for QuerySonar
 * Routes AI queries and multi-engine probing through Requesty AI Gateway (https://router.requesty.ai/v1)
 * utilizing the 200 free daily requests tier or pay-as-you-go router.
 */

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export interface RequestyChatRequest {
  model?: string;
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface RequestyChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export function getCleanRequestyKey(): string {
  const raw = process.env.REQUESTY_API_KEY || "";
  return raw.replace(/^["'\s]+|["'\s]+$/g, "");
}

/**
 * Standard model mapping for Requesty AI gateway
 * Using real verified zero-cost free models on Requesty AI
 */
export const REQUESTY_MODEL_MAP: Record<string, string> = {
  openai: process.env.REQUESTY_OPENAI_MODEL || "mistral/leanstral-1-5",
  claude: process.env.REQUESTY_CLAUDE_MODEL || "mistral/leanstral-1-5",
  gemini: process.env.REQUESTY_GEMINI_MODEL || "mistral/leanstral-1-5",
  perplexity: process.env.REQUESTY_PERPLEXITY_MODEL || "mistral/leanstral-1-5",
  deepseek: process.env.REQUESTY_DEEPSEEK_MODEL || "mistral/leanstral-1-5",
  grok: process.env.REQUESTY_GROK_MODEL || "mistral/leanstral-1-5",
  default: process.env.REQUESTY_DEFAULT_MODEL || "mistral/leanstral-1-5",
};

// Internal queue to prevent hitting Requesty's in-flight concurrency limit (1-2 concurrent on free tier)
let inFlightCount = 0;
const MAX_CONCURRENT_REQUESTY = 1;
const queueWaiters: Array<() => void> = [];

async function acquireRequestyLock(): Promise<void> {
  if (inFlightCount < MAX_CONCURRENT_REQUESTY) {
    inFlightCount++;
    return;
  }
  return new Promise<void>((resolve) => {
    queueWaiters.push(() => {
      inFlightCount++;
      resolve();
    });
  });
}

function releaseRequestyLock(): void {
  inFlightCount = Math.max(0, inFlightCount - 1);
  const next = queueWaiters.shift();
  if (next) {
    next();
  }
}

/**
 * Calls Requesty AI chat completions endpoint with OpenAI compatibility
 * Includes concurrency throttling and automatic 429 retry backoff.
 */
export async function callRequestyChatCompletion({
  model = REQUESTY_MODEL_MAP.default,
  systemPrompt,
  userPrompt,
  maxTokens = 1200,
  temperature = 0.25,
  timeoutMs = 25000,
}: RequestyChatRequest): Promise<RequestyChatResponse | null> {
  const apiKey = getCleanRequestyKey();
  if (!apiKey) return null;

  await acquireRequestyLock();

  const maxRetries = 3;
  let attempt = 0;

  try {
    while (attempt <= maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const messages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userPrompt },
      ];

      try {
        const res = await fetch("https://router.requesty.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "QuerySonar Brand Intelligence",
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
          }),
          signal: controller.signal,
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
                  totalTokens: parsedJson.usage?.total_tokens || 0,
                },
              };
            }
          }
        } else if (res.status === 429 && attempt <= maxRetries) {
          const waitTime = attempt * 1200 + Math.floor(Math.random() * 500);
          console.warn(`[Requesty] In-flight rate limit (429) on attempt ${attempt}. Retrying in ${waitTime}ms...`);
          clearTimeout(timeout);
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        } else {
          const errText = await res.text().catch(() => "");
          console.warn(`Requesty API returned error (${res.status}) for ${model}:`, errText);
        }
      } catch (err: any) {
        if (err?.name === "AbortError" && attempt <= maxRetries) {
          console.warn(`[Requesty] Timeout for ${model} on attempt ${attempt}, retrying...`);
          continue;
        }
        console.warn(`Requesty request failed for ${model}:`, err);
      } finally {
        clearTimeout(timeout);
      }

      break;
    }
  } finally {
    releaseRequestyLock();
  }

  return null;
}
