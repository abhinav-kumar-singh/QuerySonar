import { Citation } from "../types";

const SO_TIMEOUT_MS = 6000;

/**
 * Harvests developer questions and recommendations from Stack Overflow public API.
 * Free, zero-auth, high weight for technical & SaaS tools.
 */
export async function harvestStackOverflowCitations(query: string): Promise<Citation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SO_TIMEOUT_MS);

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodedQuery}&site=stackoverflow&pagesize=4&filter=default`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "QuerySonar-DevHarvester/1.0",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const items = data?.items || [];

    const citations: Citation[] = items
      .map((item: {
        title?: string;
        link?: string;
        score?: number;
        answer_count?: number;
        is_answered?: boolean;
        tags?: string[];
      }) => {
        if (!item.title || !item.link) return null;

        const score = typeof item.score === "number" ? item.score : 0;
        const answerCount = typeof item.answer_count === "number" ? item.answer_count : 0;
        const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3).join(", ") : "";

        return {
          url: item.link,
          domain: "stackoverflow.com",
          title: item.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&"),
          excerptText: `Stack Overflow technical question with ${score} votes, ${answerCount} answers${tags ? ` [Tags: ${tags}]` : ""}.`,
          sourceType: "stackoverflow" as const,
          upvotes: score,
          commentsCount: answerCount,
        };
      })
      .filter((c: Citation | null): c is Citation => Boolean(c && c.url));

    return citations;
  } catch (err) {
    console.warn("Stack Overflow harvester warning (non-fatal):", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
