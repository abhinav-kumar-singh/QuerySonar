import { EngineProber, ProbeRequest, ProbeResponse, Citation, TopCompetitor } from "../types";
import { probeViaGeminiSynthesis, generateLiveWebGroundedFallback } from "./gemini-fallback";
import { callOpenRouterChatCompletion } from "../openrouter-client";
import { callRequestyChatCompletion, REQUESTY_MODEL_MAP, getCleanRequestyKey } from "../requesty-client";

export class OpenAIProber implements EngineProber {
  engine = "openai" as const;

  async probe(request: ProbeRequest): Promise<ProbeResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const systemPrompt = [
      "You are powering a brand visibility audit for QuerySonar.",
      "Answer the buyer query thoroughly and objectively as an AI recommendation engine.",
      `Target brand being audited: ${request.brandProfile.name}.`,
      request.brandProfile.websiteUrl ? `Target brand website: ${request.brandProfile.websiteUrl}.` : "",
      request.brandProfile.targetLocation ? `Target market/location focus: ${request.brandProfile.targetLocation}. Evaluate recommendations for searchers in this market.` : "",
      "Include citations or URLs where relevant evidence can be verified.",
      "Start with a concise ranked list of the top recommended products or companies.",
      "For every recommended product or company, include: Best for: <short positioning>.",
      "At the very end, append one machine-readable line exactly in this format:",
      "QUERYSONAR_RECOMMENDATIONS_JSON: [{\"rank\":1,\"name\":\"Product or company\",\"bestFor\":\"short positioning\",\"reason\":\"short evidence-based reason\"}]"
    ].filter(Boolean).join("\n");

    // 1. Direct OpenAI API if key is present
    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: request.query }
            ]
          })
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const rawResponseWithJson = data.choices?.[0]?.message?.content || "";
          const recommendations = this.extractRecommendations(rawResponseWithJson);
          const rawResponse = this.stripRecommendationJson(rawResponseWithJson);
          const citations = this.extractCitationsFromText(rawResponse);

          return {
            engine: this.engine,
            query: request.query,
            rawResponse,
            citations,
            timestamp: new Date(),
            status: "live",
            statusReason: "Live OpenAI response.",
            model,
            recommendations
          };
        }
      } catch (err) {
        console.warn("Direct OpenAI API failed, trying gateways:", err);
      }
    }

    // 2. OpenRouter Gateway (Real ChatGPT model via OPENROUTER_API_KEY)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      const candidateModels = ["openai/gpt-4o-mini", "openai/gpt-4o"];
      for (const m of candidateModels) {
        try {
          const res = await callOpenRouterChatCompletion({
            model: m,
            systemPrompt,
            userPrompt: request.query,
            timeoutMs: 6000
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
              statusReason: `Live ChatGPT response via OpenRouter (${res.model}).`,
              model: res.model,
              recommendations
            };
          }
        } catch (err) {
          console.warn(`OpenRouter call for ${m} failed:`, err);
        }
      }
    }

    // 3. Requesty AI Gateway (Fallback via REQUESTY_API_KEY)
    if (getCleanRequestyKey()) {
      try {
        const res = await callRequestyChatCompletion({
          model: REQUESTY_MODEL_MAP.openai,
          systemPrompt,
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
            statusReason: `Live ChatGPT response via Requesty AI (${res.model}).`,
            model: res.model,
            recommendations
          };
        }
      } catch (err) {
        console.warn("Requesty AI call failed:", err);
      }
    }

    // 4. Fast Gemini Multi-Engine Synthesis (< 1.5s)
    const synthesisRes = await probeViaGeminiSynthesis(this.engine, request);
    if (synthesisRes) return synthesisRes;

    // 4. Live web-grounded fallback
    return generateLiveWebGroundedFallback(this.engine, request);
  }

  private extractCitationsFromText(text: string): Citation[] {
    const citations: Citation[] = [];
    const seen = new Set<string>();

    const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
    let match: RegExpExecArray | null;

    while ((match = mdRegex.exec(text)) !== null) {
      const linkTitle = match[1].trim();
      const url = match[2].trim();
      const normalized = url.toLowerCase().replace(/\/$/, "");

      if (!seen.has(normalized)) {
        seen.add(normalized);
        let domain = "web";
        try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch {}

        citations.push({
          url,
          domain,
          title: linkTitle && !/^\d+$/.test(linkTitle) ? linkTitle : `Source from ${domain}`,
          sourceType: "web"
        });
      }
    }

    const urlRegex = /(https?:\/\/[^\s\)\],<]+)/g;
    while ((match = urlRegex.exec(text)) !== null && citations.length < 8) {
      const url = match[1].trim();
      const normalized = url.toLowerCase().replace(/\/$/, "");

      if (!seen.has(normalized)) {
        seen.add(normalized);
        let domain = "web";
        try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch {}

        citations.push({
          url,
          domain,
          title: `Source from ${domain}`,
          sourceType: "web"
        });
      }
    }

    return citations;
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

  private stripRecommendationJson(text: string): string {
    const marker = "QUERYSONAR_RECOMMENDATIONS_JSON:";
    const markerIndex = text.lastIndexOf(marker);
    if (markerIndex < 0) return text;
    return text.slice(0, markerIndex).trim();
  }
}
