import { Citation } from "../types";

const REDDIT_TIMEOUT_MS = 6000;

export async function harvestRedditCitations(query: string): Promise<Citation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_TIMEOUT_MS);

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://www.reddit.com/search.json?q=${encodedQuery}&sort=relevance&limit=8`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (QuerySonar-Audit/1.0)",
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`Reddit public search returned HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const children = data?.data?.children || [];

    const citations: Citation[] = children
      .map((child: { data?: Record<string, unknown> }) => {
        const d = child?.data;
        if (!d || !d.title) return null;

        const permalink = typeof d.permalink === "string" ? d.permalink : "";
        const fullUrl = permalink.startsWith("http")
          ? permalink
          : `https://www.reddit.com${permalink}`;

        const upvotes = typeof d.score === "number" ? d.score : (typeof d.ups === "number" ? d.ups : 0);
        const commentsCount = typeof d.num_comments === "number" ? d.num_comments : 0;
        const subreddit = typeof d.subreddit_name_prefixed === "string"
          ? d.subreddit_name_prefixed
          : typeof d.subreddit === "string" ? `r/${d.subreddit}` : "r/all";
        const selftext = typeof d.selftext === "string" ? d.selftext.slice(0, 200).trim() : "";

        return {
          url: fullUrl,
          domain: "reddit.com",
          title: String(d.title).trim(),
          excerptText: selftext || `Discussion in ${subreddit} with ${commentsCount} comments and ${upvotes} upvotes.`,
          sourceType: "reddit" as const,
          upvotes,
          commentsCount,
          subreddit,
        };
      })
      .filter((c: Citation | null): c is Citation => Boolean(c && c.url));

    return citations;
  } catch (err) {
    console.warn("Reddit harvester warning (non-fatal):", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
