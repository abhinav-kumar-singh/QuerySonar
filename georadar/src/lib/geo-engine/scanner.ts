import { Engine, BrandProfile, SearchQuery, AuditResult, ProbeRequest, Citation, ALL_ENGINES } from "./types";
import { createProber } from "./probers";
import { analyzeMention, calculateShareOfVoice, aggregateCitations, extractTopCompetitors } from "./analyzer";
import { generatePlaybook } from "./playbook";
import { harvestOpenCitations, auditTechnicalGeo } from "./harvesters";
import { discoverBrandCategories } from "./generators/query-generator";

export async function runInstantScan(
  brandName: string,
  websiteUrl: string,
  queryOrQueries: string | string[],
  engines: Engine[] = ALL_ENGINES,
  competitors: string[] = [],
  category?: string,
  targetLocation?: string
): Promise<AuditResult> {
  const brand: BrandProfile = {
    name: brandName,
    websiteUrl,
    competitors: competitors && competitors.length > 0 ? competitors : [],
    category,
    targetLocation,
  };
  
  const queryList: string[] = Array.isArray(queryOrQueries)
    ? queryOrQueries.filter(Boolean)
    : [queryOrQueries];

  const queries: SearchQuery[] = (queryList.length > 0 ? queryList : ["Best solutions in 2026"])
    .map((queryText, idx) => ({
      id: `instant-${idx + 1}`,
      queryText: queryText.trim(),
    }));
  
  return runFullAudit(brand, queries, engines);
}

export async function runFullAudit(
  brand: BrandProfile,
  queries: SearchQuery[],
  engines: Engine[] = ALL_ENGINES
): Promise<AuditResult> {
  const analyses = [];
  const allOpenCitations: Citation[] = [];
  
  // 1. Kick off on-page technical GEO audit concurrently with probes
  const technicalGeoPromise = auditTechnicalGeo(brand.websiteUrl);

  // 2. Run multi-query probes and open multi-channel harvesters concurrently
  const queryPromises = queries.map(async (query) => {
    const req: ProbeRequest = {
      query: query.queryText,
      brandProfile: brand
    };
    
    const [queryAnalyses, openCitations] = await Promise.all([
      Promise.all(
        engines.map(async (engineName) => {
          const prober = createProber(engineName);
          const res = await prober.probe(req);
          return analyzeMention(res, brand);
        })
      ),
      harvestOpenCitations(query.queryText),
    ]);
    
    return { queryAnalyses, openCitations };
  });

  const queryResults = await Promise.all(queryPromises);
  for (const r of queryResults) {
    analyses.push(...r.queryAnalyses);
    allOpenCitations.push(...r.openCitations);
  }
  
  const technicalGeo = await technicalGeoPromise;
  const shareOfVoice = calculateShareOfVoice(analyses, brand);
  const citedSources = aggregateCitations(analyses, allOpenCitations);
  const topCompetitors = extractTopCompetitors(analyses, brand);
  const actions = generatePlaybook(analyses, citedSources, brand, technicalGeo);
  
  // Populate brand competitors dynamically from the organic AI model recommendations
  if (brand.competitors.length === 0 && topCompetitors.length > 0) {
    brand.competitors = topCompetitors.map((c) => c.name);
  }

  return {
    brandProfile: brand,
    shareOfVoice,
    mentionAnalyses: analyses,
    topCompetitors,
    citedSources,
    actions,
    technicalGeo,
    runDate: new Date()
  };
}
