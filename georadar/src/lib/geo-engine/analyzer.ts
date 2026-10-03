import { ProbeResponse, BrandProfile, MentionAnalysis, ShareOfVoice, CitedSourceSummary, ImpactRating, TopCompetitor, Engine, Citation, SourceType } from "./types";

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getBrandAliases(brand: BrandProfile): string[] {
  const aliases = new Set<string>();
  if (brand.name.trim()) aliases.add(brand.name.trim());

  try {
    const url = brand.websiteUrl.startsWith("http")
      ? brand.websiteUrl
      : `https://${brand.websiteUrl}`;
    const host = new URL(url).hostname.replace(/^www\./, "");
    const domainName = host.split(".")[0];
    if (domainName && domainName.length > 2) aliases.add(domainName);
  } catch {}

  return Array.from(aliases);
}

function findFirstAlias(text: string, aliases: string[]): { alias: string; index: number } | null {
  const normalizedText = normalize(text);
  const matches = aliases
    .map(alias => ({ alias, index: normalizedText.indexOf(normalize(alias)) }))
    .filter(match => match.index >= 0);

  matches.sort((a, b) => a.index - b.index);
  return matches[0] ?? null;
}

function recommendationMatchesBrand(recommendation: TopCompetitor, aliases: string[]): boolean {
  const searchable = `${recommendation.name} ${recommendation.bestFor} ${recommendation.reason}`;
  return Boolean(findFirstAlias(searchable, aliases));
}

function shouldExcludeAsBrand(name: string, aliases: string[]): boolean {
  const normalizedName = normalize(name);
  return aliases.some(alias => normalizedName.includes(alias) || alias.includes(normalizedName));
}

function getExistingCompetitorKey(keys: Iterable<string>, normalizedName: string): string | null {
  for (const key of keys) {
    if (key.includes(normalizedName) || normalizedName.includes(key)) return key;
  }
  return null;
}

function isLikelySectionTitle(name: string): boolean {
  const normalizedName = normalize(name);
  const blocked = [
    "choosing", "best", "here", "summary", "recommendation", "key", "top", "overview",
    "verdict", "consensus", "comparison", "perspective", "analysis", "assessment",
    "evaluation", "criteria", "tradeoff", "considerations", "score", "advantage",
    "deployment", "strengths", "differentiator", "conclusion", "breakdown",
    "marketalternative", "alternative", "competitor", "straighttothepoint",
    "useronboardingcurve", "useronboarding", "workflowautomation", "apidataintegration",
    "bottomline", "technicalassessment", "recommendationsummary", "keydifferentiators",
    "leadingplatforma", "establishedsuiteb", "modernalternativec"
  ];
  if (blocked.some(b => normalizedName.includes(b) || b.includes(normalizedName))) return true;

  // Exclude AI Engine/Model names and analytical section headings
  const aiArtifactRegex = /chatgpt|gemini|perplexity|claude|anthropic|deepseek|grok|openai|overview|factors|selecting|gateway|providers|companies|analysis|perspective|comparison|verdict|summary|assessment|recommendation|criteria|differentiator|considerations|trade-off|architecture|evaluation|market\s*alternative|straight\s*to\s*the\s*point|onboarding|curve|workflow|integration|deployment|leading\s*platform|suite\s*[a-c]|alternative\s*[a-c]/i;
  if (aiArtifactRegex.test(name)) return true;

  return false;
}

function isValidCompetitorName(name: string): boolean {
  if (!name || name.length < 2 || name.length > 45) return false;
  if (/[|`_=\^~\[\]{}()<>\/\\]/.test(name)) return false;
  if (name.includes("---") || name.includes("===")) return false;
  const wordCount = name.trim().split(/\s+/).length;
  if (wordCount > 4) return false;
  return !isLikelySectionTitle(name);
}

export function analyzeMention(probeResponse: ProbeResponse, brand: BrandProfile): MentionAnalysis {
  const text = probeResponse.rawResponse.toLowerCase();
  const aliases = getBrandAliases(brand);
  const brandMatch = findFirstAlias(probeResponse.rawResponse, aliases);
  const brandRecommendation = probeResponse.recommendations?.find(recommendation => recommendationMatchesBrand(recommendation, aliases));
  
  const brandMentioned = Boolean(brandMatch || brandRecommendation);
  
  // Extract all competitor names from model recommendations & text
  const recCompetitors = (probeResponse.recommendations || [])
    .map(r => r.name.trim())
    .filter(name => !shouldExcludeAsBrand(name, aliases) && isValidCompetitorName(name));

  const knownCompetitors = (brand.competitors || []).filter(c => text.includes(c.toLowerCase()));
  const competitorsMentioned = Array.from(new Set([...recCompetitors, ...knownCompetitors]));
  
  // Basic mention position logic
  let mentionPosition: number | null = null;
  if (brandMentioned) {
    const allEntities = [brandMatch?.alias ?? brandRecommendation?.name ?? brand.name, ...competitorsMentioned];
    const positions = allEntities
      .map(entity => ({ entity, pos: normalize(probeResponse.rawResponse).indexOf(normalize(entity)) }))
      .filter(e => e.pos !== -1);
    positions.sort((a, b) => a.pos - b.pos);
    const posIndex = positions.findIndex(p => normalize(p.entity) === normalize(brandMatch?.alias ?? brandRecommendation?.name ?? brand.name));
    mentionPosition = posIndex !== -1 ? posIndex + 1 : null;
  }
  
  // Basic sentiment logic
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (brandMentioned) {
    const positiveWords = ["best", "excellent", "great", "recommend", "robust", "leading"];
    const negativeWords = ["bad", "poor", "steep", "expensive", "lacks", "issue"];
    
    // Find context around brand
    const idx = brandMatch?.index ?? 0;
    const context = text.slice(Math.max(0, idx - 100), Math.min(text.length, idx + 100));
    
    const posCount = positiveWords.filter(w => context.includes(w)).length;
    const negCount = negativeWords.filter(w => context.includes(w)).length;
    
    if (posCount > negCount) sentiment = "positive";
    else if (negCount > posCount) sentiment = "negative";
  }

  return {
    engine: probeResponse.engine,
    query: probeResponse.query,
    brandMentioned,
    mentionPosition,
    sentiment,
    competitorsMentioned,
    citations: probeResponse.citations,
    rawResponse: probeResponse.rawResponse,
    status: probeResponse.status,
    statusReason: probeResponse.statusReason,
    model: probeResponse.model,
    recommendations: probeResponse.recommendations
  };
}

export function calculateShareOfVoice(analyses: MentionAnalysis[], brand: BrandProfile): ShareOfVoice {
  const scorableAnalyses = analyses.filter(a => a.status === "live");
  const totalQueriesTracked = new Set(scorableAnalyses.map(a => a.query)).size;
  const queriesMentionedIn = new Set(scorableAnalyses.filter(a => a.brandMentioned).map(a => a.query)).size;
  
  const overallScore = totalQueriesTracked > 0 ? Math.round((queriesMentionedIn / totalQueriesTracked) * 10000) / 100 : 0;
  
  const perEngine: Record<Engine, number> = {
    perplexity: 0,
    gemini: 0,
    openai: 0,
    claude: 0,
    deepseek: 0,
    grok: 0
  };
  
  (Object.keys(perEngine) as Engine[]).forEach(engine => {
    const engineAnalyses = scorableAnalyses.filter(a => a.engine === engine);
    const engTotal = engineAnalyses.length;
    const engMentioned = engineAnalyses.filter(a => a.brandMentioned).length;
    perEngine[engine] = engTotal > 0 ? Math.round((engMentioned / engTotal) * 10000) / 100 : 0;
  });
  
  return {
    brandName: brand.name,
    overallScore,
    perEngine,
    totalQueriesTracked,
    queriesMentionedIn
  };
}

export function aggregateCitations(
  analyses: MentionAnalysis[],
  openCitations: Citation[] = []
): CitedSourceSummary[] {
  const urlMap = new Map<string, {
    url: string;
    domain: string;
    title: string;
    engines: Set<string>;
    excerptText?: string;
    sourceType?: SourceType;
    upvotes?: number;
    commentsCount?: number;
    subreddit?: string;
    rating?: number;
    author?: string;
    publishedDate?: string;
  }>();
  
  // 1. Process AI analysis citations
  for (const analysis of analyses) {
    for (const citation of analysis.citations) {
      if (!citation.url) continue;
      const key = citation.url.toLowerCase().replace(/\/$/, "");
      if (!urlMap.has(key)) {
        urlMap.set(key, {
          url: citation.url,
          domain: citation.domain,
          title: citation.title,
          engines: new Set(),
          excerptText: citation.excerptText,
          sourceType: citation.sourceType || "ai_engine",
          upvotes: citation.upvotes,
          commentsCount: citation.commentsCount,
          subreddit: citation.subreddit,
          rating: citation.rating,
          author: citation.author,
          publishedDate: citation.publishedDate,
        });
      }
      urlMap.get(key)!.engines.add(analysis.engine);
    }
  }

  // 2. Process Open Multi-Channel Citations (Reddit, Google News, Wikipedia, StackOverflow, GitHub, AppStore, YouTube)
  for (const citation of openCitations) {
    if (!citation.url) continue;
    const key = citation.url.toLowerCase().replace(/\/$/, "");
    if (!urlMap.has(key)) {
      let engineTag = "Web Grounding";
      if (citation.sourceType === "reddit") engineTag = "Reddit Community";
      else if (citation.sourceType === "news") engineTag = "Google News / PR";
      else if (citation.sourceType === "wikipedia") engineTag = "Wikipedia Knowledge";
      else if (citation.sourceType === "hackernews") engineTag = "Hacker News";
      else if (citation.sourceType === "stackoverflow") engineTag = "Stack Overflow";
      else if (citation.sourceType === "github") engineTag = "GitHub Repository";
      else if (citation.sourceType === "appstore") engineTag = "Apple App Store";
      else if (citation.sourceType === "youtube") engineTag = "YouTube Video";

      urlMap.set(key, {
        url: citation.url,
        domain: citation.domain,
        title: citation.title,
        engines: new Set([engineTag]),
        excerptText: citation.excerptText,
        sourceType: citation.sourceType,
        upvotes: citation.upvotes,
        commentsCount: citation.commentsCount,
        subreddit: citation.subreddit,
        rating: citation.rating,
        author: citation.author,
        publishedDate: citation.publishedDate,
      });
    } else {
      const existing = urlMap.get(key)!;
      if (citation.sourceType) existing.sourceType = citation.sourceType;
      if (citation.upvotes) existing.upvotes = citation.upvotes;
      if (citation.commentsCount) existing.commentsCount = citation.commentsCount;
      if (citation.subreddit) existing.subreddit = citation.subreddit;
      if (citation.rating) existing.rating = citation.rating;
      if (citation.author) existing.author = citation.author;
      if (citation.publishedDate) existing.publishedDate = citation.publishedDate;
    }
  }
  
  const results: CitedSourceSummary[] = Array.from(urlMap.values()).map(data => {
    const citedByEngines = Array.from(data.engines);
    let impactRating: ImpactRating = "low";
    
    if (
      data.sourceType === "wikipedia" ||
      citedByEngines.length >= 2 ||
      (data.upvotes && data.upvotes >= 25) ||
      (data.commentsCount && data.commentsCount >= 15) ||
      data.sourceType === "news"
    ) {
      impactRating = "high";
    } else if (
      citedByEngines.length === 1 ||
      (data.upvotes && data.upvotes >= 5) ||
      (data.commentsCount && data.commentsCount >= 5) ||
      data.sourceType === "stackoverflow" ||
      data.sourceType === "appstore"
    ) {
      impactRating = "medium";
    }
    
    return {
      url: data.url,
      domain: data.domain,
      title: data.title,
      citedByEngines,
      impactRating,
      excerptText: data.excerptText,
      sourceType: data.sourceType,
      upvotes: data.upvotes,
      commentsCount: data.commentsCount,
      subreddit: data.subreddit,
      rating: data.rating,
      author: data.author,
      publishedDate: data.publishedDate,
    };
  });
  
  return results.sort((a, b) => {
    const scores = { high: 3, medium: 2, low: 1 };
    return scores[b.impactRating] - scores[a.impactRating];
  });
}

export function extractTopCompetitors(analyses: MentionAnalysis[], brand: BrandProfile): TopCompetitor[] {
  const aliases = getBrandAliases(brand).map(normalize);
  const competitors = new Map<string, { name: string; bestFor: string; reason: string; engines: Set<Engine> }>();
  const scorableAnalyses = analyses.filter(a => a.status === "live");

  for (const analysis of scorableAnalyses) {
    for (const recommendation of analysis.recommendations ?? []) {
      const name = recommendation.name.trim();
      const normalizedName = normalize(name);
      if (!normalizedName || shouldExcludeAsBrand(name, aliases) || !isValidCompetitorName(name)) continue;

      const existingKey = getExistingCompetitorKey(competitors.keys(), normalizedName);
      const existing = existingKey ? competitors.get(existingKey) : undefined;
      if (existing) {
        existing.engines.add(analysis.engine);
        if (!existing.bestFor && recommendation.bestFor) existing.bestFor = recommendation.bestFor;
        if (!existing.reason && recommendation.reason) existing.reason = recommendation.reason;
        continue;
      }

      competitors.set(normalizedName, {
        name,
        bestFor: recommendation.bestFor,
        reason: recommendation.reason,
        engines: new Set([analysis.engine])
      });
    }

    const rankedRecommendationRegex = /^\s*\d+[.)]\s+(?:\*\*)?([^*\n:()\-–—]{2,64})(?:\*\*)?(?:\s*[-–—:(][^\n]*)?\s*(?:\n\s*)?(?:\*\*)?Best for:?(?:\*\*)?\s*([^\n]+)/gim;
    for (const match of analysis.rawResponse.matchAll(rankedRecommendationRegex)) {
      const name = match[1].trim();
      const normalizedName = normalize(name);
      if (!normalizedName || shouldExcludeAsBrand(name, aliases) || !isValidCompetitorName(name)) continue;

      const existingKey = getExistingCompetitorKey(competitors.keys(), normalizedName);
      const existing = existingKey ? competitors.get(existingKey) : undefined;
      if (existing) {
        existing.engines.add(analysis.engine);
        if (!existing.bestFor) existing.bestFor = match[2].trim();
      } else {
        competitors.set(normalizedName, {
          name,
          bestFor: match[2].trim(),
          reason: "Ranked as a top recommended option in the AI response.",
          engines: new Set([analysis.engine])
        });
      }
    }

    const sections = analysis.rawResponse
      .split(/\n(?=(?:#{2,4}\s*)?(?:\d+[.)]\s*)?(?:\*\*)?[A-Z][^\n]{1,90}(?:\*\*)?)/)
      .map(section => section.trim())
      .filter(Boolean);

    for (const section of sections) {
      const nameMatch = section.match(/^(?:#{2,4}\s*)?(?:\d+[.)]\s*)?(?:\*\*)?([^*\n(:\-]{2,48})(?:\*\*)?(?:\s*[\(:\-]|$)/);
      if (!nameMatch) continue;

      const name = nameMatch[1].replace(/[#*_`]/g, "").trim();
      const normalizedName = normalize(name);
      if (!normalizedName || shouldExcludeAsBrand(name, aliases) || !isValidCompetitorName(name)) continue;

      const bestForMatch = section.match(/\*\*Best for:\*\*\s*([^\n]+)/i) || section.match(/Best for:\s*([^\n]+)/i);
      const reasonSentence = section
        .replace(/^.*\n?/, "")
        .split(/(?<=[.!?])\s+/)
        .find(sentence => sentence.length > 35 && !/best for:/i.test(sentence));

      const existingKey = getExistingCompetitorKey(competitors.keys(), normalizedName);
      const existing = existingKey ? competitors.get(existingKey) : undefined;
      if (existing) {
        existing.engines.add(analysis.engine);
        if (!existing.bestFor && bestForMatch?.[1]) existing.bestFor = bestForMatch[1].trim();
        if (!existing.reason && reasonSentence) existing.reason = reasonSentence.trim();
        continue;
      }

      competitors.set(normalizedName, {
        name,
        bestFor: bestForMatch?.[1]?.trim() || "Not specified in the response.",
        reason: reasonSentence?.trim() || "Mentioned as a recommended option in the AI response.",
        engines: new Set([analysis.engine])
      });
    }
  }

  return Array.from(competitors.values())
    .map(item => ({
      name: item.name,
      bestFor: item.bestFor,
      reason: item.reason,
      mentionedByEngines: Array.from(item.engines)
    }))
    .slice(0, 6);
}
