import { EngineProber, ProbeRequest, ProbeResponse, Citation, TopCompetitor } from "../types";
import { probeViaGeminiSynthesis, generateLiveWebGroundedFallback } from "./gemini-fallback";
import { callOpenRouterChatCompletion } from "../openrouter-client";
import { callRequestyChatCompletion, REQUESTY_MODEL_MAP, getCleanRequestyKey } from "../requesty-client";

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_TIMEOUT_MS = 6_000;

type GeminiWebChunk = {
  web?: {
    uri?: string;
    title?: string;
  };
};

export class GeminiProber implements EngineProber {
  engine = "gemini" as const;
  
  async probe(request: ProbeRequest): Promise<ProbeResponse> {
    const rawKey = process.env.GEMINI_API_KEY;
    const apiKey = rawKey && rawKey.startsWith("AIza") ? rawKey : undefined;

    const systemInstruction = [
      "You are powering a brand visibility audit for QuerySonar.",
      "Answer the buyer query naturally and objectively as an AI recommendation engine.",
      `Target brand being audited: ${request.brandProfile.name}.`,
      request.brandProfile.websiteUrl ? `Target brand website: ${request.brandProfile.websiteUrl}.` : "",
      request.brandProfile.targetLocation ? `Target market/location focus: ${request.brandProfile.targetLocation}. Evaluate recommendations for searchers in this market.` : "",
      "Do not force the target brand into the recommendation if the evidence does not support it.",
      "Start with a concise ranked list of the top 5 recommended products or companies.",
      "For every recommended product or company, include a line exactly like: Best for: <short positioning>.",
      "At the very end, append one machine-readable line exactly in this format:",
      "QUERYSONAR_RECOMMENDATIONS_JSON: [{\"rank\":1,\"name\":\"Product or company\",\"bestFor\":\"short positioning\",\"reason\":\"short evidence-based reason\"}]"
    ].filter(Boolean).join("\n");

    if (!apiKey) {
      // 1. Try OpenRouter Gemini model
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (openRouterKey) {
        const candidateModels = ["google/gemini-2.0-flash-001", "google/gemini-flash-1.5"];
        for (const m of candidateModels) {
          try {
            const res = await callOpenRouterChatCompletion({
              model: m,
              systemPrompt: systemInstruction,
              userPrompt: request.query,
              timeoutMs: 8000
            });
            if (res && res.content) {
              const recommendations = this.extractRecommendations(res.content);
              const rawResponse = this.stripRecommendationJson(res.content);
              const citations = this.extractCitationsFromText(rawResponse);
              return {
                engine: this.engine,
                query: request.query,
                rawResponse,
                citations,
                timestamp: new Date(),
                status: "live",
                statusReason: `Live Gemini response via OpenRouter (${res.model}).`,
                model: res.model,
                recommendations
              };
            }
          } catch {}
        }
      }

      // 2. Try Requesty AI Gateway (Fallback via REQUESTY_API_KEY)
      if (getCleanRequestyKey()) {
        try {
          const res = await callRequestyChatCompletion({
            model: REQUESTY_MODEL_MAP.gemini,
            systemPrompt: systemInstruction,
            userPrompt: request.query,
            timeoutMs: 25000
          });
          if (res && res.content) {
            const recommendations = this.extractRecommendations(res.content);
            const rawResponse = this.stripRecommendationJson(res.content);
            const citations = this.extractCitationsFromText(rawResponse);
            return {
              engine: this.engine,
              query: request.query,
              rawResponse,
              citations,
              timestamp: new Date(),
              status: "live",
              statusReason: `Live Gemini response via Requesty AI (${res.model}).`,
              model: res.model,
              recommendations
            };
          }
        } catch (err) {
          console.warn("Requesty AI call failed for Gemini:", err);
        }
      }

      const synthesisRes = await probeViaGeminiSynthesis(this.engine, request);
      if (synthesisRes) return synthesisRes;
      return generateLiveWebGroundedFallback(this.engine, request);
    }

    const preferredModel = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    // Fast production models with low latency
    const candidateModels = Array.from(
      new Set([
        preferredModel,
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b"
      ])
    ).filter(Boolean);

    const enableGrounding = process.env.GEMINI_ENABLE_GROUNDING !== "false";
    let usedModel = preferredModel;

    try {
      const systemInstruction = [
        "You are powering a brand visibility audit for QuerySonar.",
        "Answer the buyer query naturally and objectively as an AI recommendation engine.",
        `Target brand being audited: ${request.brandProfile.name}.`,
        request.brandProfile.websiteUrl ? `Target brand website: ${request.brandProfile.websiteUrl}.` : "",
        enableGrounding ? "Use Google Search grounding when current web evidence can improve the answer." : "",
        "Do not force the target brand into the recommendation if the evidence does not support it.",
        "Start with a concise ranked list of the top 5 recommended products or companies.",
        "For every recommended product or company, include a line exactly like: Best for: <short positioning>.",
        "At the very end, append one machine-readable line exactly in this format:",
        "QUERYSONAR_RECOMMENDATIONS_JSON: [{\"rank\":1,\"name\":\"Product or company\",\"bestFor\":\"short positioning\",\"reason\":\"short evidence-based reason\"}]"
      ].filter(Boolean).join("\n");

      let data: any = null;
      let usedGrounding = enableGrounding;

      for (const model of candidateModels) {
        usedModel = model;
        usedGrounding = enableGrounding;

        // Try with grounding first if enabled
        if (enableGrounding) {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 5000);
          data = await this.generateContent({
            apiKey,
            model,
            query: request.query,
            systemInstruction,
            signal: ctrl.signal,
            useGrounding: true
          });
          clearTimeout(t);
        }

        // If grounded attempt failed or returned no text, retry without grounding
        if (!data || !data.ok) {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 5000);
          data = await this.generateContent({
            apiKey,
            model,
            query: request.query,
            systemInstruction,
            signal: ctrl.signal,
            useGrounding: false
          });
          clearTimeout(t);
          usedGrounding = false;
        }

        if (data && data.ok) {
          const responseText = this.getResponseText(data);
          if (responseText) {
            break; // Successfully got response
          }
        }
      }

      if (!data || !data.ok) {
        const synthesisRes = await probeViaGeminiSynthesis(this.engine, request);
        if (synthesisRes) return synthesisRes;
        return generateLiveWebGroundedFallback(this.engine, request);
      }

      let candidate = data.candidates?.[0];
      let responseText = this.getResponseText(data);

      if (!responseText) {
        const synthesisRes = await probeViaGeminiSynthesis(this.engine, request);
        if (synthesisRes) return synthesisRes;
        return generateLiveWebGroundedFallback(this.engine, request);
      }

      const recommendations = this.extractRecommendations(responseText);
      const rawResponse = this.stripRecommendationJson(responseText);
      
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      const citations: Citation[] = groundingChunks
        .map((chunk: GeminiWebChunk) => chunk.web)
        .filter((web: any): web is { uri?: string; title?: string } => Boolean(web?.uri))
        .map((web: { uri?: string; title?: string }) => {
          const uri = web.uri || "";
          let domain = "";
          try { domain = new URL(uri).hostname; } catch {}
          return {
            url: uri,
            domain,
            title: web.title || `Source from ${domain}`
          };
        });

      return {
        engine: this.engine,
        query: request.query,
        rawResponse,
        citations,
        timestamp: new Date(),
        status: "live",
        statusReason: usedGrounding && citations.length > 0
          ? "Live Gemini response grounded with Google Search."
          : "Live Gemini intelligence response.",
        model: usedModel,
        recommendations
      };
    } catch (err) {
      const synthesisRes = await probeViaGeminiSynthesis(this.engine, request);
      if (synthesisRes) return synthesisRes;
      return generateLiveWebGroundedFallback(this.engine, request);
    }
  }

  private async generateContent({
    apiKey,
    model,
    query,
    systemInstruction,
    signal,
    useGrounding
  }: {
    apiKey: string;
    model: string;
    query: string;
    systemInstruction: string;
    signal: AbortSignal;
    useGrounding: boolean;
  }): Promise<{
    ok: true;
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      groundingMetadata?: { groundingChunks?: GeminiWebChunk[] };
      finishReason?: string;
    }>;
    promptFeedback?: { blockReason?: string };
  } | {
    ok: false;
    status: number;
    errorMessage: string;
  }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: query }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          ...(useGrounding ? { tools: [{ googleSearch: {} }] } : {}),
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2200,
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      });

      if (res.ok) {
        return { ok: true, ...(await res.json()) };
      }

      const errorBody = await res.text();
      return {
        ok: false,
        status: res.status,
        errorMessage: `Gemini API error: ${res.status} ${res.statusText} ${errorBody}`
      };
    } catch (fetchErr: any) {
      return {
        ok: false,
        status: 500,
        errorMessage: fetchErr?.message || "Network error"
      };
    }
  }

  private getResponseText(data: {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  }): string {
    return data.candidates?.[0]?.content?.parts
      ?.map(part => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() || "";
  }

  private extractRecommendations(text: string): TopCompetitor[] {
    const marker = "QUERYSONAR_RECOMMENDATIONS_JSON:";
    const markerIndex = text.lastIndexOf(marker);
    if (markerIndex < 0) return [];

    const jsonText = text
      .slice(markerIndex + marker.length)
      .replace(/```(?:json)?/gi, "")
      .replace(/```/g, "")
      .trim();
    const arrayStart = jsonText.indexOf("[");
    const arrayEnd = jsonText.lastIndexOf("]");
    if (arrayStart < 0 || arrayEnd < arrayStart) return [];

    try {
      const parsed = JSON.parse(jsonText.slice(arrayStart, arrayEnd + 1));
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((item): TopCompetitor | null => {
          if (!item || typeof item.name !== "string") return null;
          return {
            name: item.name.trim(),
            bestFor: typeof item.bestFor === "string" && item.bestFor.trim()
              ? item.bestFor.trim()
              : "Not specified in the response.",
            reason: typeof item.reason === "string" && item.reason.trim()
              ? item.reason.trim()
              : "Ranked as a top recommended option in the AI response.",
            mentionedByEngines: [this.engine],
            rank: typeof item.rank === "number" ? item.rank : undefined
          };
        })
        .filter((item): item is TopCompetitor => Boolean(item?.name));
    } catch {
      return [];
    }
  }

  private extractCitationsFromText(text: string): Citation[] {
    const citations: Citation[] = [];
    const seen = new Set<string>();

    const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
    let match: RegExpExecArray | null;

    while ((match = mdRegex.exec(text)) !== null) {
      const title = match[1];
      const url = match[2];
      try {
        const domain = new URL(url).hostname;
        if (!seen.has(url)) {
          seen.add(url);
          citations.push({
            url,
            domain,
            title: title || `Source from ${domain}`,
            sourceType: "web" as const,
          });
        }
      } catch {}
    }

    return citations;
  }

  private stripRecommendationJson(text: string): string {
    const marker = "QUERYSONAR_RECOMMENDATIONS_JSON:";
    const markerIndex = text.lastIndexOf(marker);
    if (markerIndex < 0) return text;
    return text.slice(0, markerIndex).trim();
  }
}
