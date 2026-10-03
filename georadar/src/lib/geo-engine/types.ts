export type Engine = "perplexity" | "gemini" | "openai" | "claude" | "deepseek" | "grok";
export const ALL_ENGINES: Engine[] = ["perplexity", "gemini", "openai", "claude", "deepseek", "grok"];
export type Sentiment = "positive" | "neutral" | "negative";
export type ImpactRating = "high" | "medium" | "low";
export type ActionType = "respond_reddit" | "claim_review_site" | "update_schema" | "contact_publication" | "create_content" | "get_reviews";
export type ProbeStatus = "live" | "mock" | "unavailable" | "failed";

export interface BrandProfile {
  name: string;
  websiteUrl: string;
  competitors: string[];
  category?: string;
  targetLocation?: string;
  targetCountry?: string;
}

export interface SearchQuery {
  id: string;
  queryText: string;
}

export type SourceType =
  | "reddit"
  | "hackernews"
  | "web"
  | "ai_engine"
  | "news"
  | "wikipedia"
  | "stackoverflow"
  | "github"
  | "youtube"
  | "reviews"
  | "appstore";

export interface Citation {
  url: string;
  domain: string;
  title: string;
  excerptText?: string;
  sourceType?: SourceType;
  upvotes?: number;
  commentsCount?: number;
  subreddit?: string;
  rating?: number;
  author?: string;
  publishedDate?: string;
}

export interface ProbeRequest {
  query: string;
  brandProfile: BrandProfile;
}

export interface ProbeResponse {
  engine: Engine;
  query: string;
  rawResponse: string;
  citations: Citation[];
  timestamp: Date;
  status: ProbeStatus;
  statusReason?: string;
  model?: string;
  recommendations?: TopCompetitor[];
}

export interface MentionAnalysis {
  engine: Engine;
  query: string;
  brandMentioned: boolean;
  mentionPosition: number | null; // 1st, 2nd, 3rd recommended
  sentiment: Sentiment;
  competitorsMentioned: string[];
  citations: Citation[];
  rawResponse: string;
  status: ProbeStatus;
  statusReason?: string;
  model?: string;
  recommendations?: TopCompetitor[];
}

export interface ShareOfVoice {
  brandName: string;
  overallScore: number; // 0-100
  perEngine: Record<Engine, number>;
  totalQueriesTracked: number;
  queriesMentionedIn: number;
}

export interface TopCompetitor {
  name: string;
  bestFor: string;
  reason: string;
  mentionedByEngines: Engine[];
  rank?: number;
  isTargetBrand?: boolean;
}

export interface CitedSourceSummary {
  url: string;
  domain: string;
  title: string;
  citedByEngines: (Engine | string)[];
  impactRating: ImpactRating;
  excerptText?: string;
  sourceType?: SourceType;
  upvotes?: number;
  commentsCount?: number;
  subreddit?: string;
  rating?: number;
  author?: string;
  publishedDate?: string;
}

export interface RemediationAction {
  id: string;
  priority: ImpactRating;
  actionType: ActionType;
  title: string;
  description: string;
  targetUrl?: string;
  isCompleted: boolean;
}

export interface TechnicalGeoAudit {
  llmsTxtFound: boolean;
  llmsTxtUrl?: string;
  robotsTxtStatus: "allowed" | "partially_blocked" | "blocked" | "not_found";
  blockedAiBots: string[];
  allowedAiBots: string[];
  schemaTypesFound: string[];
  schemaScore: number; // 0-100
  overallGeoScore: number; // 0-100
  recommendations: string[];
  appRating?: { rating: number; reviewCount: number; storeUrl: string; appName: string };
  wikipediaFound?: boolean;
  wikipediaUrl?: string;
  githubRepo?: { stars: number; forks: number; url: string; repoName: string };
}

export interface AuditResult {
  brandProfile: BrandProfile;
  shareOfVoice: ShareOfVoice;
  mentionAnalyses: MentionAnalysis[];
  topCompetitors?: TopCompetitor[];
  citedSources: CitedSourceSummary[];
  actions: RemediationAction[];
  technicalGeo?: TechnicalGeoAudit;
  runDate: Date;
}

export interface EngineProber {
  engine: Engine;
  probe(request: ProbeRequest): Promise<ProbeResponse>;
}
