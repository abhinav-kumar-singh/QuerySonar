import { Citation } from "../types";

const WIKI_TIMEOUT_MS = 5000;

/**
 * Harvests Wikipedia & Knowledge Graph citations via official public Wikipedia API.
 * High authority score for LLM grounding (OpenAI, Gemini, Perplexity all prioritize Wikipedia).
 */
export async function harvestWikipediaCitations(query: string): Promise<Citation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WIKI_TIMEOUT_MS);

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    // Use Wikipedia OpenSearch API
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodedQuery}&limit=3&namespace=0&format=json`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "QuerySonar-WikiHarvester/1.0",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    // Format: [searchTerm, [titles], [descriptions], [urls]]
    if (!Array.isArray(data) || data.length < 4) {
      return [];
    }

    const titles: string[] = data[1] || [];
    const descriptions: string[] = data[2] || [];
    const urls: string[] = data[3] || [];

    const citations: Citation[] = [];

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      const pageUrl = urls[i];
      const desc = descriptions[i] || "";

      if (!title || !pageUrl) continue;

      // Filter out disambiguation pages
      if (desc.toLowerCase().includes("may refer to:")) continue;

      citations.push({
        url: pageUrl,
        domain: "en.wikipedia.org",
        title: `${title} - Wikipedia`,
        excerptText: desc || `Official Wikipedia entity article for ${title}. Highly authoritative LLM training resource.`,
        sourceType: "wikipedia",
      });
    }

    return citations;
  } catch (err) {
    console.warn("Wikipedia harvester warning (non-fatal):", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
