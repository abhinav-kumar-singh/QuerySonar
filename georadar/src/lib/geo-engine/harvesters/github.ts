import { Citation } from "../types";

const GITHUB_TIMEOUT_MS = 5000;

/**
 * Harvests open-source repositories and ecosystem footprint via GitHub Search API.
 * Free, zero-auth (60 requests/hour unauthenticated).
 */
export async function harvestGitHubCitations(query: string): Promise<Citation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GITHUB_TIMEOUT_MS);

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://api.github.com/search/repositories?q=${encodedQuery}&sort=stars&order=desc&per_page=3`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "QuerySonar-TechHarvester/1.0",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const items = data?.items || [];

    const citations: Citation[] = items
      .map((repo: {
        full_name?: string;
        html_url?: string;
        description?: string;
        stargazers_count?: number;
        forks_count?: number;
        language?: string;
      }) => {
        if (!repo.full_name || !repo.html_url) return null;

        const stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0;
        const forks = typeof repo.forks_count === "number" ? repo.forks_count : 0;
        const lang = repo.language ? ` (${repo.language})` : "";

        return {
          url: repo.html_url,
          domain: "github.com",
          title: `${repo.full_name}${lang} on GitHub`,
          excerptText: repo.description
            ? `${repo.description.slice(0, 160)} — ★ ${stars.toLocaleString()} stars, ${forks} forks.`
            : `GitHub repository with ★ ${stars.toLocaleString()} stars and ${forks} forks.`,
          sourceType: "github" as const,
          upvotes: stars,
        };
      })
      .filter((c: Citation | null): c is Citation => Boolean(c && c.url));

    return citations;
  } catch (err) {
    console.warn("GitHub harvester warning (non-fatal):", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
