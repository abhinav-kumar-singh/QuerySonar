import { TechnicalGeoAudit } from "../types";

const TECH_AUDIT_TIMEOUT_MS = 6000;

const AI_BOTS = [
  { id: "GPTBot", name: "ChatGPT (GPTBot)" },
  { id: "ClaudeBot", name: "Claude (ClaudeBot)" },
  { id: "PerplexityBot", name: "Perplexity (PerplexityBot)" },
  { id: "Google-Extended", name: "Google Gemini (Google-Extended)" },
  { id: "Amazonbot", name: "Amazon AI (Amazonbot)" },
  { id: "Bytespider", name: "ByteDance AI (Bytespider)" },
];

/**
 * Audits a brand's domain for Technical GEO readiness:
 * 1. Checks robots.txt for AI bot blocking / allowance
 * 2. Checks for /llms.txt or /.well-known/llms.txt (AI documentation standard)
 * 3. Inspects homepage HTML for Schema.org JSON-LD microdata
 */
export async function auditTechnicalGeo(websiteUrl: string): Promise<TechnicalGeoAudit> {
  const result: TechnicalGeoAudit = {
    llmsTxtFound: false,
    robotsTxtStatus: "not_found",
    blockedAiBots: [],
    allowedAiBots: [],
    schemaTypesFound: [],
    schemaScore: 0,
    overallGeoScore: 50,
    recommendations: [],
  };

  if (!websiteUrl) {
    result.recommendations.push("Provide a valid website URL in Settings to enable technical GEO auditing.");
    return result;
  }

  let domain = websiteUrl.trim();
  if (!domain.startsWith("http://") && !domain.startsWith("https://")) {
    domain = `https://${domain}`;
  }

  let baseUrl = "";
  try {
    const parsed = new URL(domain);
    baseUrl = `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    result.recommendations.push("Invalid website URL format.");
    return result;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TECH_AUDIT_TIMEOUT_MS);

  try {
    // 1. Audit robots.txt
    const robotsUrl = `${baseUrl}/robots.txt`;
    const robotsRes = await fetch(robotsUrl, {
      method: "GET",
      headers: { "User-Agent": "QuerySonar-TechAudit/1.0" },
      signal: controller.signal,
    }).catch(() => null);

    if (robotsRes && robotsRes.ok) {
      const robotsTxt = await robotsRes.text();
      result.robotsTxtStatus = "allowed";

      for (const bot of AI_BOTS) {
        // Check if user-agent is explicitly disallowed
        const botRegex = new RegExp(`User-agent:\\s*${bot.id}[\\s\\S]*?Disallow:\\s*\\/(\\n|$)`, "i");
        if (botRegex.test(robotsTxt)) {
          result.blockedAiBots.push(bot.name);
        } else {
          result.allowedAiBots.push(bot.name);
        }
      }

      if (result.blockedAiBots.length > 0) {
        result.robotsTxtStatus = result.blockedAiBots.length === AI_BOTS.length ? "blocked" : "partially_blocked";
        result.recommendations.push(
          `Unblock AI crawlers in your robots.txt: ${result.blockedAiBots.join(", ")} are currently restricted from citing your site.`
        );
      }
    } else {
      result.robotsTxtStatus = "allowed"; // No robots.txt means all allowed by default
      result.allowedAiBots = AI_BOTS.map((b) => b.name);
    }

    // 2. Audit llms.txt
    const llmsTxtUrl = `${baseUrl}/llms.txt`;
    const llmsRes = await fetch(llmsTxtUrl, {
      method: "GET",
      headers: { "User-Agent": "QuerySonar-TechAudit/1.0" },
      signal: controller.signal,
    }).catch(() => null);

    if (llmsRes && llmsRes.ok) {
      const text = await llmsRes.text();
      if (text && text.length > 20 && !text.toLowerCase().includes("<!doctype html>")) {
        result.llmsTxtFound = true;
        result.llmsTxtUrl = llmsTxtUrl;
      }
    }

    if (!result.llmsTxtFound) {
      result.recommendations.push(
        "Add an `/llms.txt` markdown file to your domain root. This new open standard feeds clean, authoritative context directly to AI models."
      );
    }

    // 3. Audit homepage Schema.org JSON-LD
    const homeRes = await fetch(baseUrl, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (QuerySonar-SchemaAudit/1.0)" },
      signal: controller.signal,
    }).catch(() => null);

    if (homeRes && homeRes.ok) {
      const html = await homeRes.text();
      const schemaRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let sMatch: RegExpExecArray | null;

      while ((sMatch = schemaRegex.exec(html)) !== null) {
        try {
          const parsed = JSON.parse(sMatch[1]);
          const types: string[] = [];
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (item["@type"]) types.push(String(item["@type"]));
            }
          } else if (parsed["@type"]) {
            types.push(String(parsed["@type"]));
          } else if (Array.isArray(parsed["@graph"])) {
            for (const item of parsed["@graph"]) {
              if (item["@type"]) types.push(String(item["@type"]));
            }
          }

          for (const t of types) {
            if (!result.schemaTypesFound.includes(t)) {
              result.schemaTypesFound.push(t);
            }
          }
        } catch {}
      }
    }

    // Calculate Scores
    let schemaScore = 20;
    if (result.schemaTypesFound.includes("Organization")) schemaScore += 30;
    if (result.schemaTypesFound.includes("SoftwareApplication") || result.schemaTypesFound.includes("Product")) schemaScore += 30;
    if (result.schemaTypesFound.includes("FAQPage")) schemaScore += 20;
    result.schemaScore = Math.min(100, schemaScore);

    if (result.schemaTypesFound.length === 0) {
      result.recommendations.push(
        "Inject Schema.org JSON-LD (`Organization` & `Product`) microdata onto your homepage to help LLMs understand your pricing and features."
      );
    }

    let overall = 40;
    if (result.robotsTxtStatus === "allowed") overall += 25;
    else if (result.robotsTxtStatus === "partially_blocked") overall += 10;

    if (result.llmsTxtFound) overall += 20;
    overall += Math.round(result.schemaScore * 0.15);
    result.overallGeoScore = Math.min(100, overall);

    return result;
  } catch (err) {
    console.warn("Technical GEO audit warning (non-fatal):", err instanceof Error ? err.message : err);
    return result;
  } finally {
    clearTimeout(timeout);
  }
}
