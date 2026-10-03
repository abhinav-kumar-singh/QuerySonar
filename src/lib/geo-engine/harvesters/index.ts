import { Citation } from "../types";
import { harvestRedditCitations } from "./reddit";
import { harvestHackerNewsCitations } from "./hackernews";
import { harvestDuckDuckGoCitations } from "./duckduckgo";
import { harvestGoogleNewsCitations } from "./google-news";
import { harvestWikipediaCitations } from "./wikipedia";
import { harvestStackOverflowCitations } from "./stackoverflow";
import { harvestGitHubCitations } from "./github";
import { harvestAppStoreCitations } from "./appstore";
import { harvestYouTubeCitations } from "./youtube";
import { auditTechnicalGeo } from "./technical-geo";

export {
  harvestRedditCitations,
  harvestHackerNewsCitations,
  harvestDuckDuckGoCitations,
  harvestGoogleNewsCitations,
  harvestWikipediaCitations,
  harvestStackOverflowCitations,
  harvestGitHubCitations,
  harvestAppStoreCitations,
  harvestYouTubeCitations,
  auditTechnicalGeo,
};

/**
 * Executes a fast, parallel multi-channel grounding search across:
 * - Reddit & HackerNews (Community)
 * - Google News (PR & Editorial Media)
 * - Wikipedia & Wikidata (Knowledge Graph Authority)
 * - Stack Overflow (Developer Mindshare)
 * - GitHub (Open Source Ecosystem)
 * - Apple App Store (Public Ratings)
 * - YouTube (Video Reviews)
 * - DuckDuckGo (General Grounding)
 */
export async function harvestOpenCitations(query: string): Promise<Citation[]> {
  const results = await Promise.allSettled([
    harvestRedditCitations(query),
    harvestGoogleNewsCitations(query),
    harvestWikipediaCitations(query),
    harvestHackerNewsCitations(query),
    harvestStackOverflowCitations(query),
    harvestGitHubCitations(query),
    harvestAppStoreCitations(query),
    harvestYouTubeCitations(query),
    harvestDuckDuckGoCitations(query),
  ]);

  const allCitations: Citation[] = [];
  const seenUrls = new Set<string>();

  for (const res of results) {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      for (const citation of res.value) {
        if (!citation.url) continue;
        const normalizedUrl = citation.url.toLowerCase().replace(/\/$/, "");
        if (!seenUrls.has(normalizedUrl)) {
          seenUrls.add(normalizedUrl);
          allCitations.push(citation);
        }
      }
    }
  }

  return allCitations;
}
