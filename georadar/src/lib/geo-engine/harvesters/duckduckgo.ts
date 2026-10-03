import { Citation } from "../types";

const DDG_TIMEOUT_MS = 6000;

type DuckDuckGoTopic = {
  FirstURL?: string;
  Text?: string;
  Topics?: DuckDuckGoTopic[];
};

export async function harvestDuckDuckGoCitations(query: string): Promise<Citation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DDG_TIMEOUT_MS);

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=0`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "QuerySonar-OpenSource-Auditor/1.0",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const citations: Citation[] = [];

    // Check AbstractURL
    if (data?.AbstractURL && data?.AbstractText) {
      let domain = "wikipedia.org";
      try { domain = new URL(data.AbstractURL).hostname.replace(/^www\./, ""); } catch {}
      citations.push({
        url: data.AbstractURL,
        domain,
        title: data.Heading || data.AbstractSource || `Reference on ${domain}`,
        excerptText: String(data.AbstractText).slice(0, 200),
        sourceType: "web",
      });
    }

    // Check RelatedTopics
    const relatedTopics: DuckDuckGoTopic[] = data?.RelatedTopics || [];
    for (const topic of relatedTopics) {
      if (citations.length >= 6) break;
      if (topic.FirstURL && topic.Text) {
        let domain = "duckduckgo.com";
        try { domain = new URL(topic.FirstURL).hostname.replace(/^www\./, ""); } catch {}
        citations.push({
          url: topic.FirstURL,
          domain,
          title: topic.Text.split(" - ")[0] || topic.Text.slice(0, 60),
          excerptText: topic.Text.slice(0, 180),
          sourceType: "web",
        });
      } else if (Array.isArray(topic.Topics)) {
        for (const sub of topic.Topics) {
          if (citations.length >= 6) break;
          if (sub.FirstURL && sub.Text) {
            let domain = "duckduckgo.com";
            try { domain = new URL(sub.FirstURL).hostname.replace(/^www\./, ""); } catch {}
            citations.push({
              url: sub.FirstURL,
              domain,
              title: sub.Text.split(" - ")[0] || sub.Text.slice(0, 60),
              excerptText: sub.Text.slice(0, 180),
              sourceType: "web",
            });
          }
        }
      }
    }

    return citations;
  } catch (err) {
    console.warn("DuckDuckGo harvester warning (non-fatal):", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
