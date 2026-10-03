import { MentionAnalysis, CitedSourceSummary, BrandProfile, RemediationAction, TechnicalGeoAudit } from "./types";

export function generatePlaybook(
  analyses: MentionAnalysis[],
  citedSources: CitedSourceSummary[],
  brand: BrandProfile,
  technicalGeo?: TechnicalGeoAudit
): RemediationAction[] {
  const actions: RemediationAction[] = [];
  const scorableAnalyses = analyses.filter(a => a.status === "live");

  // Rule 0: Technical GEO Auditing Rules
  if (technicalGeo) {
    // 0a. robots.txt blocking AI crawlers
    if (technicalGeo.robotsTxtStatus === "blocked" || technicalGeo.robotsTxtStatus === "partially_blocked") {
      actions.push({
        id: `robots-${Math.random().toString(36).substring(2, 9)}`,
        priority: "high",
        actionType: "update_schema",
        title: `Unblock AI Crawlers in robots.txt (${technicalGeo.blockedAiBots.slice(0, 3).join(", ")})`,
        description: `Your robots.txt is currently preventing ${technicalGeo.blockedAiBots.join(", ")} from reading your site. Remove Disallow directives to allow AI models to crawl and cite your product directly.`,
        targetUrl: `${brand.websiteUrl}/robots.txt`,
        isCompleted: false,
      });
    }

    // 0b. Missing /llms.txt
    if (!technicalGeo.llmsTxtFound) {
      actions.push({
        id: `llms-txt-${Math.random().toString(36).substring(2, 9)}`,
        priority: "high",
        actionType: "create_content",
        title: "Publish /llms.txt AI Documentation File",
        description: "Deploy an `/llms.txt` markdown file to your root domain. This new open standard feeds clean, authoritative context directly to AI models without hallucination.",
        targetUrl: brand.websiteUrl,
        isCompleted: false,
      });
    }

    // 0c. Missing JSON-LD Schema
    if (technicalGeo.schemaTypesFound.length === 0) {
      actions.push({
        id: `schema-${Math.random().toString(36).substring(2, 9)}`,
        priority: "high",
        actionType: "update_schema",
        title: "Implement Organization & Product JSON-LD Schema",
        description: "No Schema.org structured data was found on your homepage. Inject JSON-LD microdata (`Organization`, `Product`, `FAQPage`) to help LLMs parse your pricing, specs, and features accurately.",
        targetUrl: brand.websiteUrl,
        isCompleted: false,
      });
    }
  }

  // Rule 1: Live Reddit Discussions discovered
  const redditSources = citedSources.filter(s => s.domain.includes("reddit.com") || s.sourceType === "reddit");
  for (const source of redditSources.slice(0, 3)) {
    const threadName = source.title.length > 55 ? `${source.title.slice(0, 52)}...` : source.title;
    const sub = source.subreddit || "r/community";
    const engagement = source.upvotes || source.commentsCount
      ? ` (${source.upvotes || 0} upvotes, ${source.commentsCount || 0} comments)`
      : "";

    actions.push({
      id: `reddit-${Math.random().toString(36).substring(2, 9)}`,
      priority: source.impactRating === "high" ? "high" : "medium",
      actionType: "respond_reddit",
      title: `Participate in ${sub}: "${threadName}"`,
      description: `Active buyer discussion found in ${sub}${engagement}. Engage authentically with helpful comparisons and product guidance to build generative consensus.`,
      targetUrl: source.url,
      isCompleted: false,
    });
  }

  // Rule 2: Google News PR & Editorial Articles discovered
  const newsSources = citedSources.filter(s => s.sourceType === "news");
  for (const source of newsSources.slice(0, 2)) {
    actions.push({
      id: `news-${Math.random().toString(36).substring(2, 9)}`,
      priority: "high",
      actionType: "contact_publication",
      title: `Amplify media citation on ${source.domain}`,
      description: `Recent editorial press coverage detected: "${source.title}". Ensure your brand value proposition is accurately represented in industry news cited by AI engines.`,
      targetUrl: source.url,
      isCompleted: false,
    });
  }

  // Rule 3: Hacker News & Stack Overflow Discussions discovered
  const techSources = citedSources.filter(s => s.sourceType === "hackernews" || s.sourceType === "stackoverflow");
  for (const source of techSources.slice(0, 2)) {
    const platform = source.sourceType === "stackoverflow" ? "Stack Overflow" : "Hacker News";
    const threadName = source.title.length > 55 ? `${source.title.slice(0, 52)}...` : source.title;
    actions.push({
      id: `tech-${Math.random().toString(36).substring(2, 9)}`,
      priority: "medium",
      actionType: "respond_reddit",
      title: `Answer technical discussion on ${platform}: "${threadName}"`,
      description: `Developer mindshare on ${platform}. Provide clear technical details and code integration guidance to influence LLM code generation and tech recommendations.`,
      targetUrl: source.url,
      isCompleted: false,
    });
  }

  // Rule 4: Third-party Review & Editorial sites discovered
  const reviewSources = citedSources.filter(
    s => s.sourceType === "reviews" ||
      (/rtings|g2\.com|capterra|trustpilot|soundguys|consumerreports|wirecutter|techradar/i.test(s.domain))
  );
  for (const source of reviewSources.slice(0, 2)) {
    actions.push({
      id: `review-${Math.random().toString(36).substring(2, 9)}`,
      priority: "high",
      actionType: "get_reviews",
      title: `Target citation coverage on ${source.domain}`,
      description: `AI search engines crawl ${source.domain} when evaluating recommendations for this category. Pitch editorial coverage or claim brand profile listings.`,
      targetUrl: source.url,
      isCompleted: false,
    });
  }

  // Rule 5: Brand invisible in generative queries
  if (scorableAnalyses.length > 0) {
    const queries = new Set(scorableAnalyses.map(a => a.query));
    for (const query of queries) {
      const queryAnalyses = scorableAnalyses.filter(a => a.query === query);
      const mentionedAnywhere = queryAnalyses.some(a => a.brandMentioned);
      
      if (!mentionedAnywhere) {
        actions.push({
          id: `content-${Math.random().toString(36).substring(2, 9)}`,
          priority: "high",
          actionType: "create_content",
          title: `Create authoritative buying guide for "${query}"`,
          description: `${brand.name} has 0% generative share of voice for the query "${query}". Publish a structured comparison guide with clear specs and FAQs.`,
          targetUrl: brand.websiteUrl,
          isCompleted: false,
        });
      }
    }
  }

  // Fallback Rule: Structured Data if not already added
  if (!actions.some(a => a.id.startsWith("schema-"))) {
    actions.push({
      id: `schema-${Math.random().toString(36).substring(2, 9)}`,
      priority: "medium",
      actionType: "update_schema",
      title: "Implement FAQ, Product & Organization Schema Markup",
      description: "Ensure your landing pages use Schema.org JSON-LD structured data so AI web crawlers accurately extract your core features, pricing, and specs without hallucination.",
      targetUrl: brand.websiteUrl,
      isCompleted: false,
    });
  }

  // Sort by priority
  const priorityScores = { high: 3, medium: 2, low: 1 };
  return actions.sort((a, b) => priorityScores[b.priority] - priorityScores[a.priority]);
}
