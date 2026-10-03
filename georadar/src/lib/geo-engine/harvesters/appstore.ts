import { Citation } from "../types";

const APPSTORE_TIMEOUT_MS = 5000;

/**
 * Harvests Apple App Store ratings & public app metadata via Apple iTunes Search API.
 * 100% Free, zero-auth, high consumer trust signal.
 */
export async function harvestAppStoreCitations(query: string): Promise<Citation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), APPSTORE_TIMEOUT_MS);

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://itunes.apple.com/search?term=${encodedQuery}&entity=software&limit=2`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const results = data?.results || [];

    const citations: Citation[] = results
      .map((app: {
        trackName?: string;
        trackViewUrl?: string;
        averageUserRating?: number;
        userRatingCount?: number;
        sellerName?: string;
        primaryGenreName?: string;
        version?: string;
      }) => {
        if (!app.trackName || !app.trackViewUrl) return null;

        const rating = typeof app.averageUserRating === "number" ? app.averageUserRating.toFixed(1) : "N/A";
        const count = typeof app.userRatingCount === "number" ? app.userRatingCount.toLocaleString() : "0";
        const seller = app.sellerName ? ` by ${app.sellerName}` : "";
        const genre = app.primaryGenreName ? ` in ${app.primaryGenreName}` : "";

        return {
          url: app.trackViewUrl,
          domain: "apps.apple.com",
          title: `${app.trackName} on the App Store`,
          excerptText: `Official iOS app rating: ★ ${rating}/5 (${count} reviews)${seller}${genre}.`,
          sourceType: "appstore" as const,
          rating: typeof app.averageUserRating === "number" ? app.averageUserRating : undefined,
          commentsCount: typeof app.userRatingCount === "number" ? app.userRatingCount : undefined,
        };
      })
      .filter((c: Citation | null): c is Citation => Boolean(c && c.url));

    return citations;
  } catch (err) {
    console.warn("AppStore harvester warning (non-fatal):", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
