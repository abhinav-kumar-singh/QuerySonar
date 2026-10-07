export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  searchPlaces,
  PlaceSuggestion,
  POPULAR_PRESETS,
  getFlagEmoji,
} from "@/lib/geo-data/places";

export type { PlaceSuggestion };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    // If no query or very short, return default global/country presets
    if (!query) {
      return NextResponse.json({
        success: true,
        data: POPULAR_PRESETS,
      });
    }

    // 1. Get instant, rock-solid results from our comprehensive global places database
    const localMatches = searchPlaces(query);

    // 2. Best-effort enrichment via Photon / OpenStreetMap if internet connection allows (with short timeout)
    const externalMatches: PlaceSuggestion[] = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`,
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "QuerySonar-App/1.0",
          },
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const features: any[] = json.features || [];

        for (const feat of features) {
          const p = feat.properties || {};
          const name = p.name || p.city || p.country;
          if (!name) continue;

          const state = p.state || p.county;
          const country = p.country;
          const countryCode = (p.countrycode || "").toUpperCase();

          const parts: string[] = [name];
          if (state && state !== name) parts.push(state);
          if (country && country !== name && country !== state) parts.push(country);

          const formatted = parts.join(", ");
          const coords = feat.geometry?.coordinates || [];

          externalMatches.push({
            id: `osm-${p.osm_id || Math.random().toString(36).substring(2, 9)}`,
            name,
            city: p.city || (p.type === "city" ? name : undefined),
            state,
            country,
            countryCode: countryCode || undefined,
            formatted,
            type: p.type || p.osm_value || "place",
            lat: coords[1],
            lng: coords[0],
            flag: countryCode ? getFlagEmoji(countryCode) : "📍",
          });
        }
      }
    } catch {
      // Gracefully continue with local matches when external service is offline or rate-limited
    }

    // Merge and prioritize local matches first (ensuring country matches like China, Germany, etc. are on top)
    const seenFormatted = new Set<string>();
    const combined: PlaceSuggestion[] = [];

    for (const item of [...localMatches, ...externalMatches]) {
      const key = item.formatted.toLowerCase();
      if (!seenFormatted.has(key)) {
        seenFormatted.add(key);
        combined.push(item);
      }
      if (combined.length >= 10) break;
    }

    return NextResponse.json({
      success: true,
      data: combined.length > 0 ? combined : localMatches,
    });
  } catch (err: unknown) {
    console.error("Place autocomplete error:", err);
    return NextResponse.json({
      success: true,
      data: POPULAR_PRESETS,
    });
  }
}
