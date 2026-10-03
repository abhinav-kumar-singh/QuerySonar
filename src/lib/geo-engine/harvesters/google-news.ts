import { Citation } from "../types";

const NEWS_TIMEOUT_MS = 6000;

/**
 * Harvests live press & editorial citations from Google News RSS search feed.
 * 100% Free, zero-auth, live media citations.
 */
export async function harvestGoogleNewsCitations(query: string): Promise<Citation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NEWS_TIMEOUT_MS);

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/rss+xml, application/xml, text/xml",
        "User-Agent": "Mozilla/5.0 (QuerySonar-NewsHarvester/1.0)",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return [];
    }

    const xmlText = await res.text();
    const citations: Citation[] = [];

    // Parse RSS items using fast regex without external XML parser dependency
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xmlText)) !== null && citations.length < 6) {
      const itemContent = match[1];

      const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(itemContent);
      const linkMatch = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i.exec(itemContent);
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemContent);
      const sourceMatch = /<source[^>]*url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/i.exec(itemContent);

      if (!titleMatch || !linkMatch) continue;

      let rawTitle = titleMatch[1].trim();
      const rawLink = linkMatch[1].trim();
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
      const sourceName = sourceMatch ? sourceMatch[2].trim() : "";
      const sourceUrl = sourceMatch ? sourceMatch[1].trim() : "";

      let domain = "news.google.com";
      if (sourceUrl) {
        try {
          domain = new URL(sourceUrl).hostname.replace(/^www\./, "");
        } catch {}
      } else if (sourceName) {
        domain = sourceName.toLowerCase().replace(/\s+/g, "") + ".com";
      }

      // Clean title suffix like " - The Verge"
      if (rawTitle.includes(" - ")) {
        const parts = rawTitle.split(" - ");
        if (parts.length > 1) {
          rawTitle = parts.slice(0, -1).join(" - ");
        }
      }

      citations.push({
        url: rawLink,
        domain,
        title: rawTitle || `News coverage on ${domain}`,
        excerptText: `Editorial press report from ${sourceName || domain}${pubDate ? ` (${pubDate.slice(0, 16)})` : ""}.`,
        sourceType: "news",
        publishedDate: pubDate,
        author: sourceName,
      });
    }

    return citations;
  } catch (err) {
    console.warn("Google News harvester warning (non-fatal):", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
