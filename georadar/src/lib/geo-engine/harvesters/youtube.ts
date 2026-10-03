import { Citation } from "../types";

const YT_TIMEOUT_MS = 5000;

/**
 * Harvests YouTube video review citations.
 * Gemini and Perplexity cite YouTube transcripts and review videos extensively.
 */
export async function harvestYouTubeCitations(query: string): Promise<Citation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), YT_TIMEOUT_MS);

  try {
    const encodedQuery = encodeURIComponent(query.trim() + " review");
    // Use YouTube search suggestions & public video feed
    const url = `https://www.youtube.com/results?search_query=${encodedQuery}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();
    const citations: Citation[] = [];

    // Extract video IDs and titles from initial JSON embedded in page
    const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const titleRegex = /"title":\{"runs":\[\{"text":"([^"]+)"\}\]/g;

    const videoIds: string[] = [];
    const titles: string[] = [];

    let vMatch: RegExpExecArray | null;
    while ((vMatch = videoIdRegex.exec(html)) !== null && videoIds.length < 3) {
      if (!videoIds.includes(vMatch[1])) {
        videoIds.push(vMatch[1]);
      }
    }

    let tMatch: RegExpExecArray | null;
    while ((tMatch = titleRegex.exec(html)) !== null && titles.length < 3) {
      titles.push(tMatch[1]);
    }

    for (let i = 0; i < videoIds.length; i++) {
      const vid = videoIds[i];
      const title = titles[i] || `${query} Video Review`;

      citations.push({
        url: `https://www.youtube.com/watch?v=${vid}`,
        domain: "youtube.com",
        title: `${title} - YouTube Review`,
        excerptText: `Video review on YouTube cited by multi-modal AI models during comparison queries.`,
        sourceType: "youtube",
      });
    }

    return citations;
  } catch (err) {
    console.warn("YouTube harvester warning (non-fatal):", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
