import { NextRequest, NextResponse } from "next/server";

export interface PlaceSuggestion {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  formatted: string;
  type?: string;
  lat?: number;
  lng?: number;
  flag?: string;
}

// Convert 2-letter ISO country code to emoji flag
function getFlagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const POPULAR_PRESETS: PlaceSuggestion[] = [
  {
    id: "preset-global",
    name: "Global / Worldwide",
    formatted: "Worldwide (All Regions)",
    type: "global",
    flag: "🌍",
  },
  {
    id: "preset-us",
    name: "United States",
    country: "United States",
    countryCode: "US",
    formatted: "United States (US)",
    type: "country",
    flag: "🇺🇸",
  },
  {
    id: "preset-gb",
    name: "United Kingdom",
    country: "United Kingdom",
    countryCode: "GB",
    formatted: "United Kingdom (UK)",
    type: "country",
    flag: "🇬🇧",
  },
  {
    id: "preset-in",
    name: "India",
    country: "India",
    countryCode: "IN",
    formatted: "India (IN)",
    type: "country",
    flag: "🇮🇳",
  },
  {
    id: "preset-de",
    name: "Germany",
    country: "Germany",
    countryCode: "DE",
    formatted: "Germany (DE)",
    type: "country",
    flag: "🇩🇪",
  },
  {
    id: "preset-ca",
    name: "Canada",
    country: "Canada",
    countryCode: "CA",
    formatted: "Canada (CA)",
    type: "country",
    flag: "🇨🇦",
  },
  {
    id: "preset-au",
    name: "Australia",
    country: "Australia",
    countryCode: "AU",
    formatted: "Australia (AU)",
    type: "country",
    flag: "🇦🇺",
  },
  {
    id: "preset-fr",
    name: "France",
    country: "France",
    countryCode: "FR",
    formatted: "France (FR)",
    type: "country",
    flag: "🇫🇷",
  },
  {
    id: "preset-jp",
    name: "Japan",
    country: "Japan",
    countryCode: "JP",
    formatted: "Japan (JP)",
    type: "country",
    flag: "🇯🇵",
  },
  {
    id: "preset-sg",
    name: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    formatted: "Singapore (SG)",
    type: "country",
    flag: "🇸🇬",
  },
  {
    id: "preset-ae",
    name: "United Arab Emirates",
    country: "United Arab Emirates",
    countryCode: "AE",
    formatted: "United Arab Emirates (UAE)",
    type: "country",
    flag: "🇦🇪",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    // If no query or very short, return default global/country presets
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: POPULAR_PRESETS,
      });
    }

    // Call Photon (OpenStreetMap / Komoot) free live places API
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(photonUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "QuerySonar-App/1.0",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Filter presets matching query as graceful fallback
      const matchingPresets = POPULAR_PRESETS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.formatted.toLowerCase().includes(query.toLowerCase())
      );
      return NextResponse.json({
        success: true,
        data: matchingPresets.length > 0 ? matchingPresets : POPULAR_PRESETS.slice(0, 6),
      });
    }

    const json = await response.json();
    const features: any[] = json.features || [];

    const seenNames = new Set<string>();
    const results: PlaceSuggestion[] = [];

    // Always include a direct "Global / Worldwide" match if query matches "global" or "world"
    if ("global".includes(query.toLowerCase()) || "worldwide".includes(query.toLowerCase())) {
      results.push(POPULAR_PRESETS[0]);
    }

    for (const feat of features) {
      const p = feat.properties || {};
      const name = p.name || p.city || p.country;
      if (!name) continue;

      const state = p.state || p.county;
      const country = p.country;
      const countryCode = (p.countrycode || "").toUpperCase();

      // Build clean formatted label: "San Francisco, California, United States" or "Berlin, Germany"
      const parts: string[] = [name];
      if (state && state !== name) parts.push(state);
      if (country && country !== name && country !== state) parts.push(country);
      
      const formatted = parts.join(", ");
      
      if (seenNames.has(formatted.toLowerCase())) continue;
      seenNames.add(formatted.toLowerCase());

      const coords = feat.geometry?.coordinates || [];

      results.push({
        id: `${p.osm_type || "osm"}-${p.osm_id || Math.random().toString(36).substring(2, 9)}`,
        name,
        city: p.city || (p.type === "city" ? name : undefined),
        state,
        country,
        countryCode: countryCode || undefined,
        formatted,
        type: p.type || p.osm_value || "place",
        lat: coords[1],
        lng: coords[0],
        flag: getFlagEmoji(countryCode),
      });

      if (results.length >= 8) break;
    }

    // Fallback if photon returned 0 results
    if (results.length === 0) {
      const matchingPresets = POPULAR_PRESETS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.formatted.toLowerCase().includes(query.toLowerCase())
      );
      return NextResponse.json({
        success: true,
        data: matchingPresets.length > 0 ? matchingPresets : [
          {
            id: "custom-loc",
            name: query,
            formatted: `${query} (Custom Location)`,
            type: "custom",
            flag: "📍",
          }
        ],
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (err: unknown) {
    console.error("Place autocomplete error:", err);
    return NextResponse.json({
      success: true,
      data: POPULAR_PRESETS.slice(0, 6),
    });
  }
}
