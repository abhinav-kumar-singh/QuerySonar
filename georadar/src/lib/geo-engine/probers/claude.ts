import { EngineProber, ProbeRequest, ProbeResponse, Citation, TopCompetitor } from "../types";
import { probeViaGeminiSynthesis, generateLiveWebGroundedFallback } from "./gemini-fallback";
import { callOpenRouterChatCompletion } from "../openrouter-client";
import { callRequestyChatCompletion, REQUESTY_MODEL_MAP, getCleanRequestyKey } from "../requesty-client";

export class ClaudeProber implements EngineProber {
  engine = "claude" as const;

  async probe(request: ProbeRequest): Promise<ProbeResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

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

    // 1. Direct Anthropic API if key is present
    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: "user", content: request.query }]
          })
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const rawResponseWithJson = data.content?.[0]?.text || "";
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
            statusReason: "Live Anthropic Claude response.",
            model,
            recommendations
          };
        }
      } catch (err) {
        console.warn("Direct Anthropic API failed, trying gateways:", err);
      }
    }

    // 2. OpenRouter Gateway (Real Claude model via OPENROUTER_API_KEY)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      const candidateModels = [
        "anthropic/claude-3.5-haiku",
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-haiku-4.5",
        "anthropic/claude-sonnet-4.5"
      ];
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
              statusReason: `Live Claude response via OpenRouter (${res.model}).`,
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
          model: REQUESTY_MODEL_MAP.claude,
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
            statusReason: `Live Claude response via Requesty AI (${res.model}).`,
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
