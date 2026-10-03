import { Citation } from "../types";

const HN_TIMEOUT_MS = 6000;

export async function harvestHackerNewsCitations(query: string): Promise<Citation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HN_TIMEOUT_MS);

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://hn.algolia.com/api/v1/search?query=${encodedQuery}&tags=story&hitsPerPage=5`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`HackerNews Algolia API returned HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const hits = data?.hits || [];

    const citations: Citation[] = hits
      .map((hit: {
        title?: string;
        url?: string;
        objectID?: string;
        points?: number;
        num_comments?: number;
        author?: string;
      }) => {
        if (!hit.title || !hit.objectID) return null;

        const hnDiscussionUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;
        const targetUrl = hit.url || hnDiscussionUrl;
        let domain = "news.ycombinator.com";
        try {
          if (hit.url) {
            domain = new URL(hit.url).hostname.replace(/^www\./, "");
          }
        } catch {}

        const points = typeof hit.points === "number" ? hit.points : 0;
        const commentsCount = typeof hit.num_comments === "number" ? hit.num_comments : 0;

        return {
          url: targetUrl,
          domain,
          title: hit.title.trim(),
          excerptText: `Hacker News submission with ${points} points and ${commentsCount} comments.`,
          sourceType: "hackernews" as const,
          upvotes: points,
          commentsCount,
        };
      })
      .filter((c: Citation | null): c is Citation => Boolean(c && c.url));

    return citations;
  } catch (err) {
    console.warn("HackerNews harvester warning (non-fatal):", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
