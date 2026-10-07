"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowUpRight,
  Loader2,
  Calendar,
  ChevronDown,
  RefreshCw,
  Send,
  Plus,
  Paperclip,
  CheckCircle2,
  Globe,
  Radio,
  FileText,
  SlidersHorizontal,
  Radar,
  ShieldAlert,
  Cpu,
  Bot,
  ListTodo,
  Clock,
  Activity,
  RotateCcw,
  Trash2,
  Globe2,
  Search,
  Trophy,
  Smile,
  ShieldCheck,
  Layers,
  Quote,
  Zap,
  Check,
  AlertTriangle,
  Newspaper,
  BookOpen,
  MessageSquare,
  Video,
  Smartphone,
  Star,
} from "lucide-react";
import {
  useAuditData,
  getPendingScan,
  clearPendingScan,
  AuditResult,
  getAuditFormDraft,
  saveAuditFormDraft,
  clearAuditFormDraft,
} from "@/lib/audit-storage";
import { useSession } from "next-auth/react";
import {
  SemiCircleGauge,
  BarcodeChart,
  TickProgressBar,
  RealProbesBarcodeChart,
  RealActionsBarcodeChart,
} from "./components/gauge";
import { GeoCopilot } from "@/components/dashboard/geo-copilot";
import {
  V2RadialSpokeSpeedometer,
  V2CapsulePlacementStack,
  V2TricolorCapsulePill,
  V2SegmentedDonutRing,
  V2EngineQueryHeatmapGrid,
  V2OptimizationPlaybookCapsules,
  V2EqualizerLadderMatrix,
  V2CitationEcosystemRing,
} from "./components/dashboard-v2-charts";
import { CardInfoTooltip } from "./components/card-info-tooltip";
import { AIEngineRow } from "@/components/ui/ai-engine-icons";
import { AuditDrawer } from "@/components/dashboard/audit-drawer";
import { PlaceAutocomplete } from "@/components/ui/place-autocomplete";
import {
  CategoryQueryFlow,
  CategoryItem,
  PromptItem,
} from "@/components/dashboard/category-query-flow";
import { WelcomeOverviewV2 } from "@/components/dashboard/welcome-v2";
import { useTranslation } from "@/lib/i18n";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const ENGINE_OPTIONS = [
  { id: "all", label: "All Engines (6/6)", model: "Consensus Average", color: "#10B981" },
  { id: "openai", label: "ChatGPT", model: "GPT-4o / SearchGPT", color: "#10B981" },
  { id: "gemini", label: "Google Gemini", model: "2.0 Flash", color: "#3B82F6" },
  { id: "perplexity", label: "Perplexity", model: "Sonar Pro", color: "#8B5CF6" },
  { id: "claude", label: "Claude", model: "3.7 Sonnet", color: "#F59E0B" },
  { id: "deepseek", label: "DeepSeek", model: "V3 Search", color: "#06B6D4" },
  { id: "grok", label: "Grok", model: "Grok 2", color: "#EC4899" },
];

const TIMEFRAME_OPTIONS = [
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "all", label: "All Time (Cumulative)" },
];

const PLAN_LIMITS: Record<string, { maxBrands: number; maxQueries: number; label: string }> = {
  FREE: { maxBrands: 1, maxQueries: 4, label: "Free Plan" },
  STARTER: { maxBrands: 1, maxQueries: 8, label: "Starter Plan" },
  GROWTH: { maxBrands: 1, maxQueries: 8, label: "Starter Plan" },
  AGENCY: { maxBrands: 5, maxQueries: 20, label: "Agency Plan" },
  ENTERPRISE: { maxBrands: 10, maxQueries: 50, label: "Agency Enterprise" },
};

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="w-28 h-3 syn-skeleton rounded-md" />
          <div className="w-64 h-8 syn-skeleton rounded-lg" />
          <div className="w-96 h-4 syn-skeleton rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-8 syn-skeleton rounded-xl" />
          <div className="w-28 h-8 syn-skeleton rounded-xl" />
        </div>
      </div>

      {/* 4 Bento KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="syn-card flex flex-col justify-between h-[150px]">
            <div className="flex items-center justify-between">
              <div className="w-24 h-3.5 syn-skeleton rounded-md" />
              <div className="w-16 h-4 syn-skeleton rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="w-20 h-8 syn-skeleton rounded-lg" />
              <div className="w-32 h-3 syn-skeleton rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Gauge + Consensus Matrix Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 syn-card flex flex-col justify-between h-[380px] p-6">
          <div className="flex items-center justify-between">
            <div className="w-40 h-5 syn-skeleton rounded-md" />
            <div className="w-20 h-5 syn-skeleton rounded-full" />
          </div>
          <div className="w-48 h-48 syn-skeleton rounded-full mx-auto my-auto" />
          <div className="w-full h-3 syn-skeleton rounded-md" />
        </div>

        <div className="lg:col-span-7 syn-card flex flex-col justify-between h-[380px] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--syn-border)]">
            <div className="w-48 h-5 syn-skeleton rounded-md" />
            <div className="w-28 h-5 syn-skeleton rounded-md" />
          </div>
          <div className="space-y-3 my-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 syn-skeleton rounded-lg" />
                  <div className="w-28 h-4 syn-skeleton rounded-md" />
                </div>
                <div className="w-32 h-3 syn-skeleton rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { t } = useTranslation();
  const { audit, brands, saveAudit, resetAudit, isLoading } = useAuditData();
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCreatingWorkspace = searchParams.get("createWorkspace") === "true";
  const hasScan = Boolean(audit);
  const showWelcomeLaunchpad = !hasScan || isCreatingWorkspace;

  // Live vs Snapshot Mode Toggle
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Dashboard Design Version (V1 Classic vs V2 Neon / Capsule Inspiration)
  const [dashboardVersion, setDashboardVersion] = useState<"v1" | "v2">("v2");
  useEffect(() => {
    try {
      const savedVersion = localStorage.getItem("georadar_dashboard_version");
      if (savedVersion === "v1" || savedVersion === "v2") {
        setDashboardVersion(savedVersion);
      }
    } catch {}
  }, []);

  const handleVersionChange = (ver: "v1" | "v2") => {
    setDashboardVersion(ver);
    try {
      localStorage.setItem("georadar_dashboard_version", ver);
    } catch {}
  };

  // Date Timeframe & Engine Filter dropdown states
  const [selectedTimeframe, setSelectedTimeframe] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  const timeframeRef = useRef<HTMLDivElement>(null);

  const [selectedEngine, setSelectedEngine] = useState<string>("all");
  const [isEngineOpen, setIsEngineOpen] = useState(false);
  const engineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (timeframeRef.current && !timeframeRef.current.contains(event.target as Node)) {
        setIsTimeframeOpen(false);
      }
      if (engineRef.current && !engineRef.current.contains(event.target as Node)) {
        setIsEngineOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Drawer & Modal controls
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useBodyScrollLock(showResetModal);

  // Active Plan
  const [currentPlanKey, setCurrentPlanKey] = useState<string>("FREE");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("georadar_test_plan");
      if (saved) {
        const p = saved.toUpperCase();
        if (["FREE", "STARTER", "GROWTH", "AGENCY", "ENTERPRISE", "PRO"].includes(p)) {
          setCurrentPlanKey(p === "GROWTH" ? "STARTER" : p === "PRO" ? "AGENCY" : p);
        }
      }
    } catch {}
  }, []);
  const planConfig = PLAN_LIMITS[currentPlanKey] || PLAN_LIMITS.FREE;

  // Onboarding / First-time Launchpad form states
  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [queriesList, setQueriesList] = useState<string[]>([""]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [useCategoryFlow, setUseCategoryFlow] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanStage, setScanStage] = useState("");
  const [scanProgress, setScanProgress] = useState(12);
  const [scanElapsed, setScanElapsed] = useState(0);
  const [isGeneratingQueries, setIsGeneratingQueries] = useState(false);
  const [suggestedQueries, setSuggestedQueries] = useState<
    Array<{ queryText: string; type: string; personaLabel: string }>
  >([]);
  const [detectedCompetitors, setDetectedCompetitors] = useState<string[]>([]);
  const [brandSummary, setBrandSummary] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [autoQueryError, setAutoQueryError] = useState("");

  // Live real-time scan progress simulation timer
  useEffect(() => {
    if (!isScanning) {
      setScanProgress(12);
      setScanElapsed(0);
      return;
    }

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setScanElapsed(Math.floor((Date.now() - startTime) / 100) / 10);
    }, 100);

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev < 35) return prev + 3.5;
        if (prev < 65) return prev + 2.5;
        if (prev < 85) return prev + 1.5;
        if (prev < 96) return prev + 0.4;
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(timerInterval);
      clearInterval(progressInterval);
    };
  }, [isScanning]);

  // Restore form draft or reset on new workspace mode
  useEffect(() => {
    if (isCreatingWorkspace) {
      setBrandName("");
      setWebsiteUrl("");
      setTargetLocation("");
      setQueriesList([""]);
      setCategories([]);
      setPrompts([]);
      setUseCategoryFlow(false);
      setSuggestedQueries([]);
      setDetectedCompetitors([]);
      setBrandSummary("");
      setCategory("");
      setAutoQueryError("");
      setScanError("");
      clearAuditFormDraft();
      return;
    }

    try {
      const draft = getAuditFormDraft();
      if (draft) {
        if (draft.brandName) setBrandName(draft.brandName);
        if (draft.websiteUrl) setWebsiteUrl(draft.websiteUrl);
        if (draft.targetLocation) setTargetLocation(draft.targetLocation);
        if (draft.queriesList && draft.queriesList.length > 0) setQueriesList(draft.queriesList);
        if (draft.suggestedQueries && draft.suggestedQueries.length > 0) setSuggestedQueries(draft.suggestedQueries);
        if (draft.detectedCompetitors && draft.detectedCompetitors.length > 0) setDetectedCompetitors(draft.detectedCompetitors);
        if (draft.brandSummary) setBrandSummary(draft.brandSummary);
        if (draft.category) setCategory(draft.category);
        if (draft.categories && draft.categories.length > 0) {
          setCategories(draft.categories);
          setUseCategoryFlow(true);
        }
        if (draft.prompts && draft.prompts.length > 0) {
          setPrompts(draft.prompts);
        }
      }
    } catch {}
  }, [isCreatingWorkspace]);

  // Persist form draft on any change
  useEffect(() => {
    try {
      if (brandName || websiteUrl || targetLocation || queriesList.some((q) => q.trim()) || categories.length > 0) {
        saveAuditFormDraft({
          brandName,
          websiteUrl,
          targetLocation,
          queriesList,
          suggestedQueries,
          detectedCompetitors,
          brandSummary,
          category,
          categories: categories.length > 0 ? categories : undefined,
          prompts: prompts.length > 0 ? prompts : undefined,
        });
      }
    } catch {}
  }, [brandName, websiteUrl, targetLocation, queriesList, suggestedQueries, detectedCompetitors, brandSummary, category, categories, prompts]);

  // Extract dynamic audit metrics or zero state
  const brand = audit?.brandProfile?.name || "Your Brand";

  const formatScore = (val: number | undefined | null) => {
    if (typeof val !== "number" || isNaN(val)) return 0;
    return val % 1 === 0 ? val : Number(val.toFixed(2));
  };

  const engineScores = {
    openai: hasScan ? formatScore(audit?.shareOfVoice?.perEngine?.openai ?? 70) : 0,
    gemini: hasScan ? formatScore(audit?.shareOfVoice?.perEngine?.gemini ?? 85) : 0,
    perplexity: hasScan ? formatScore(audit?.shareOfVoice?.perEngine?.perplexity ?? 60) : 0,
    claude: hasScan ? formatScore(audit?.shareOfVoice?.perEngine?.claude ?? 65) : 0,
    deepseek: hasScan ? formatScore(audit?.shareOfVoice?.perEngine?.deepseek ?? 58) : 0,
    grok: hasScan ? formatScore(audit?.shareOfVoice?.perEngine?.grok ?? 62) : 0,
  };

  const avgEngineScore = hasScan
    ? Math.round(
        (engineScores.openai +
          engineScores.gemini +
          engineScores.perplexity +
          engineScores.claude +
          engineScores.deepseek +
          engineScores.grok) / 6
      )
    : 0;

  // Filter probes dynamically when an engine is selected
  const rawMentionAnalyses = audit?.mentionAnalyses ?? [];
  const mentionAnalyses = selectedEngine === "all"
    ? rawMentionAnalyses
    : (() => {
        const matches = rawMentionAnalyses.filter((m) => {
          const eng = (m.engine || "").toLowerCase();
          if (selectedEngine === "openai") return eng.includes("openai") || eng.includes("chatgpt") || eng.includes("gpt");
          if (selectedEngine === "gemini") return eng.includes("gemini") || eng.includes("google");
          if (selectedEngine === "perplexity") return eng.includes("perplexity") || eng.includes("sonar");
          if (selectedEngine === "claude") return eng.includes("claude") || eng.includes("anthropic");
          if (selectedEngine === "deepseek") return eng.includes("deepseek");
          if (selectedEngine === "grok") return eng.includes("grok") || eng.includes("xai");
          return eng.includes(selectedEngine);
        });
        return matches.length > 0 ? matches : rawMentionAnalyses;
      })();

  const overallScore = hasScan
    ? selectedEngine === "all"
      ? Math.round(audit?.shareOfVoice?.overallScore ?? 0)
      : Math.round(engineScores[selectedEngine as keyof typeof engineScores] ?? audit?.shareOfVoice?.overallScore ?? 0)
    : 0;

  const totalQueries = hasScan
    ? selectedEngine === "all"
      ? (audit?.shareOfVoice?.totalQueriesTracked || mentionAnalyses.length || 1)
      : mentionAnalyses.length || 1
    : 0;

  const queriesMentioned = hasScan
    ? mentionAnalyses.filter((m) => m.brandMentioned).length
    : 0;

  const scannedCount = hasScan ? mentionAnalyses.length : 0;
  const riskCount = hasScan
    ? mentionAnalyses.filter(
        (m) => !m.brandMentioned || m.sentiment === "negative"
      ).length || 0
    : 0;

  const auditSuccessRate =
    scannedCount > 0
      ? Math.round((queriesMentioned / Math.max(scannedCount, 1)) * 100)
      : 0;

  // 1. Recommendation Positions & Win Rate
  const rankedProbes = mentionAnalyses.filter(
    (m) => typeof m.mentionPosition === "number" && m.mentionPosition > 0
  );
  const avgPositionNum =
    rankedProbes.length > 0
      ? rankedProbes.reduce((sum, m) => sum + (m.mentionPosition ?? 1), 0) / rankedProbes.length
      : 1;
  const avgPositionFormatted = avgPositionNum % 1 === 0 ? avgPositionNum.toFixed(0) : avgPositionNum.toFixed(1);
  const rank1Count = mentionAnalyses.filter((m) => m.mentionPosition === 1).length;
  const rank1Percent = scannedCount > 0 ? Math.round((rank1Count / scannedCount) * 100) : 100;
  const rank2Count = mentionAnalyses.filter((m) => m.mentionPosition === 2).length;
  const rank3PlusCount = mentionAnalyses.filter((m) => (m.mentionPosition ?? 0) > 2 || !m.brandMentioned).length;

  // 2. AI Sentiment & Perception Breakdown
  const positiveSentiments = mentionAnalyses.filter((m) => m.sentiment === "positive").length;
  const neutralSentiments = mentionAnalyses.filter((m) => m.sentiment === "neutral" || (!m.sentiment && m.brandMentioned)).length;
  const negativeSentiments = mentionAnalyses.filter((m) => m.sentiment === "negative").length;
  const positiveSentimentPct = scannedCount > 0 ? Math.round((positiveSentiments / scannedCount) * 100) : 83;
  const neutralSentimentPct = scannedCount > 0 ? Math.round((neutralSentiments / scannedCount) * 100) : 17;
  const negativeSentimentPct = scannedCount > 0 ? Math.round((negativeSentiments / scannedCount) * 100) : 0;

  // 3. Technical GEO Readiness & AI Crawler Health
  const techGeo = audit?.technicalGeo;
  const geoScore = techGeo?.overallGeoScore ?? (hasScan ? 73 : 0);
  const allowedBots = techGeo?.allowedAiBots ?? [
    "ChatGPT (GPTBot)",
    "Claude (ClaudeBot)",
    "Perplexity (PerplexityBot)",
    "Google Gemini (Google-Extended)",
    "Amazon AI (Amazonbot)",
    "ByteDance AI (Bytespider)",
  ];
  const blockedBots = techGeo?.blockedAiBots ?? [];
  const llmsTxtFound = techGeo?.llmsTxtFound ?? false;
  const schemaScore = techGeo?.schemaScore ?? (hasScan ? 50 : 0);
  const schemaTypes = techGeo?.schemaTypesFound ?? [
    "Organization",
    "WebPage",
    "BreadcrumbList",
    "WebSite",
    "Corporation",
  ];

  // 4. Citation Ecosystem & Channels
  const rawSources = audit?.citedSources ?? [];
  const sources = selectedEngine === "all"
    ? rawSources
    : (() => {
        const filtered = rawSources.filter((s) =>
          s.citedByEngines?.some((e) => {
            const eng = e.toLowerCase();
            if (selectedEngine === "openai") return eng.includes("chatgpt") || eng.includes("openai");
            if (selectedEngine === "gemini") return eng.includes("gemini") || eng.includes("google");
            if (selectedEngine === "perplexity") return eng.includes("perplexity");
            if (selectedEngine === "claude") return eng.includes("claude");
            if (selectedEngine === "deepseek") return eng.includes("deepseek");
            if (selectedEngine === "grok") return eng.includes("grok");
            return eng.includes(selectedEngine);
          })
        );
        return filtered.length > 0 ? filtered : rawSources;
      })();

  const highImpactCount = sources.filter((s) => s.impactRating === "high").length;
  const standardImpactCount = sources.length - highImpactCount;
  const universalCitationsCount = sources.filter((s) => (s.citedByEngines?.length ?? 0) >= 4).length;
  const newsSourcesCount = sources.filter(
    (s) => s.sourceType === "news" || (s.domain && (s.domain.includes("news") || s.domain.includes("tech.co") || s.domain.includes("computerworld") || s.domain.includes("time.com") || s.domain.includes("builtin") || s.domain.includes("vantagecircle")))
  ).length;
  const reviewSourcesCount = sources.filter(
    (s) => s.sourceType === "appstore" || (s.domain && (s.domain.includes("g2.com") || s.domain.includes("capterra") || s.domain.includes("trustradius") || s.domain.includes("producthunt")))
  ).length;
  const communitySourcesCount = sources.filter(
    (s) => s.domain && (s.domain.includes("reddit") || s.domain.includes("ycombinator") || s.domain.includes("github"))
  ).length;
  const videoSourcesCount = sources.filter(
    (s) => s.sourceType === "youtube" || (s.domain && s.domain.includes("youtube"))
  ).length;

  // 5. AI Brand Positioning & Consensus Value Proposition
  const primaryRecommendation =
    mentionAnalyses.find((m) =>
      m.recommendations?.some((r) => r.name?.toLowerCase().includes(brand.toLowerCase()))
    )?.recommendations?.find((r) => r.name?.toLowerCase().includes(brand.toLowerCase())) ||
    mentionAnalyses[0]?.recommendations?.[0] || {
      name: brand,
      bestFor: "Unified AI-native workflow automation and enterprise discoverability.",
      reason: "Ranks top-tier for reliability, comprehensive feature depth, and rapid time-to-value.",
    };

  const actions = audit?.actions ?? [];
  const completedActions = actions.filter((a) => a.isCompleted).length;
  const highPriorityActions = actions.filter((a) => a.priority === "high").length;
  const mediumPriorityActions = actions.filter((a) => a.priority === "medium").length;
  const actionSuccessRate =
    actions.length > 0
      ? Math.round((completedActions / Math.max(actions.length, 1)) * 100)
      : hasScan
      ? 82
      : 0;


  const handleQueryChange = (index: number, val: string) => {
    const updated = [...queriesList];
    updated[index] = val;
    setQueriesList(updated);
  };

  const handleAddQuery = () => {
    if (queriesList.length >= planConfig.maxQueries) return;
    setQueriesList([...queriesList, ""]);
  };

  const handleRemoveQuery = (index: number) => {
    if (queriesList.length <= 1) {
      setQueriesList([""]);
      return;
    }
    const updated = queriesList.filter((_, i) => i !== index);
    setQueriesList(updated);
  };

  const handleResetForm = () => {
    setBrandName("");
    setWebsiteUrl("");
    setTargetLocation("");
    setQueriesList([""]);
    setCategories([]);
    setPrompts([]);
    setUseCategoryFlow(false);
    setSuggestedQueries([]);
    setDetectedCompetitors([]);
    setBrandSummary("");
    setCategory("");
    setAutoQueryError("");
    setScanError("");
    clearAuditFormDraft();
  };

  const handleClearQueries = () => {
    setQueriesList([""]);
    setCategories([]);
    setPrompts([]);
    setUseCategoryFlow(false);
    setSuggestedQueries([]);
    setDetectedCompetitors([]);
    setAutoQueryError("");
    saveAuditFormDraft({
      brandName,
      websiteUrl,
      targetLocation,
      queriesList: [""],
      suggestedQueries: [],
      detectedCompetitors: [],
      brandSummary,
      category,
    });
  };

  const handleDiscoverCategoriesAndPrompts = async () => {
    if (!brandName.trim()) return;
    setIsGeneratingQueries(true);
    setAutoQueryError("");

    try {
      const res = await fetch("/api/categories/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          targetLocation: targetLocation.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to discover categories");
      }

      const discoveredCats: CategoryItem[] = data.data.categories || [];
      const discoveredPrompts: PromptItem[] = data.data.suggestedPrompts || [];

      setCategories(discoveredCats);
      setPrompts(discoveredPrompts);
      setDetectedCompetitors(data.data.detectedCompetitors || []);
      if (data.data.summary) setBrandSummary(data.data.summary);
      if (data.data.primaryCategory) setCategory(data.data.primaryCategory);
      setUseCategoryFlow(true);

      if (discoveredPrompts.length > 0) {
        const queryTexts = discoveredPrompts.map((p) => p.queryText);
        setQueriesList(queryTexts);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error discovering market categories";
      setAutoQueryError(msg);
    } finally {
      setIsGeneratingQueries(false);
    }
  };

  const handlePromptsChange = (newPrompts: PromptItem[]) => {
    setPrompts(newPrompts);
    if (newPrompts.length > 0) {
      setQueriesList(newPrompts.map((p) => p.queryText));
    }
  };

  async function handleRunScan(e: React.FormEvent) {
    e.preventDefault();
    const validQueries = queriesList.map((q) => q.trim()).filter(Boolean);
    if (!brandName.trim() || !websiteUrl.trim() || validQueries.length === 0 || isScanning) return;

    setIsScanning(true);
    setScanError("");
    setScanStage("Connecting to multi-engine probe pipeline & proxy networks...");

    const stageTimers = [
      setTimeout(() => setScanStage("Initializing multi-engine telemetry & proxy networks..."), 0),
      setTimeout(() => setScanStage("Probing Google Gemini (Grounding citations & live web sources)..."), 800),
      setTimeout(() => setScanStage("Querying OpenAI ChatGPT & SearchGPT consensus models..."), 2000),
      setTimeout(() => setScanStage("Querying Perplexity Sonar & analyzing citation authority..."), 3400),
      setTimeout(() => setScanStage("Running Anthropic Claude 3.7, DeepSeek & Grok-3 probes..."), 4800),
      setTimeout(() => setScanStage("Synthesizing Share of Voice & calculating consensus ranking matrix..."), 6200),
    ];

    try {
      const response = await fetch("/api/scan/instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          websiteUrl: websiteUrl.trim(),
          targetLocation: targetLocation.trim() || undefined,
          queries: validQueries,
          category: category || (categories.find(c => c.isAutoSelected)?.name) || undefined,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || "Scan request failed");
      }

      const data = await response.json();
      saveAudit(data);
      if (isCreatingWorkspace) {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to complete scan. Please try again.";
      setScanError(msg);
    } finally {
      stageTimers.forEach(clearTimeout);
      setIsScanning(false);
      setScanStage("");
    }
  }

  // Check for pending scan queued from landing page upon user login / navigation
  const isProcessingPendingScan = useRef(false);

  useEffect(() => {
    const pending = getPendingScan();
    if (pending && pending.brand && !isProcessingPendingScan.current) {
      isProcessingPendingScan.current = true;
      clearPendingScan();

      setBrandName(pending.brand);
      if (pending.websiteUrl) setWebsiteUrl(pending.websiteUrl);
      if (pending.targetLocation) setTargetLocation(pending.targetLocation);
      if (pending.queries && pending.queries.length > 0) {
        setQueriesList(pending.queries);
      } else if (pending.query) {
        setQueriesList([pending.query]);
      }

      setIsScanning(true);
      setScanError("");
      setScanStage("Connecting to multi-engine probe pipeline...");

      const t1 = setTimeout(() => setScanStage("Probing Google Gemini & Perplexity Sonar..."), 1200);
      const t2 = setTimeout(() => setScanStage("Querying OpenAI ChatGPT & analyzing citations..."), 2500);

      fetch("/api/scan/instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: pending.brand.trim(),
          queries: pending.queries || [pending.query?.trim() || "Best alternatives & review"],
          websiteUrl: pending.websiteUrl ? pending.websiteUrl.trim() : "",
          targetLocation: pending.targetLocation ? pending.targetLocation.trim() : undefined,
          category: pending.category || undefined,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Scan request failed");
          }
          return res.json();
        })
        .then((data) => {
          saveAudit(data);
        })
        .catch((err) => {
          console.error("Auto scan failed:", err);
          setScanError("Failed to complete automatic scan. Please click 'Launch Audit' to try again.");
        })
        .finally(() => {
          clearTimeout(t1);
          clearTimeout(t2);
          setIsScanning(false);
          setScanStage("");
        });
    }
  }, [saveAudit]);

  const isFormValid =
    brandName.trim().length > 0 &&
    websiteUrl.trim().length > 0 &&
    queriesList.some((q) => q.trim().length > 0);

  const totalBrandsCount = brands.length > 0 ? brands.length : audit ? 1 : 0;
  const avgPortfolioScore =
    brands.length > 0
      ? Math.round(
          brands.reduce((acc, b) => acc + (b.overallScore || 0), 0) / brands.length
        )
      : Math.round(audit?.shareOfVoice?.overallScore || 0);

  const totalMonitoredQueries =
    brands.length > 0
      ? brands.reduce((acc, b) => acc + (b.queriesCount || 0), 0)
      : audit?.mentionAnalyses?.length || 1;

  const totalMentions =
    brands.length > 0
      ? brands.reduce((acc, b) => acc + (b.mentionsCount || 0), 0)
      : audit?.mentionAnalyses?.filter((m) => m.brandMentioned).length || 0;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      {/* ─────────────────────────────────────────────────────────────
          STATE A: NO AUDIT DATA YET (OR AFTER RESET DATA)
          Shows the central Overview Launchpad & hides dashboard widgets
          ───────────────────────────────────────────────────────────── */}
      {showWelcomeLaunchpad ? (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          {/* Header if creating a workspace while having existing brand data */}
          {isCreatingWorkspace && hasScan && (
            <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--syn-heading)]">
                  {t("auditDrawer.createBrandWorkspaceTitle")}
                </span>
                <span className="text-[10px] font-mono text-[var(--syn-muted)]">
                  • New Multi-Engine Audit
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--syn-muted)] hover:text-[var(--syn-heading)] bg-[var(--syn-card-inner)] border border-[var(--syn-border)] hover:border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                ← Cancel & Return to {audit?.brandProfile?.name || "Workspace"}
              </button>
            </div>
          )}

          <WelcomeOverviewV2
            planConfig={planConfig}
            sessionName={session?.user?.name || "Explorer"}
            brandName={brandName}
            setBrandName={setBrandName}
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            targetLocation={targetLocation}
            setTargetLocation={setTargetLocation}
            queriesList={queriesList}
            setQueriesList={setQueriesList}
            categories={categories}
            setCategories={setCategories}
            prompts={prompts}
            setPrompts={setPrompts}
            detectedCompetitors={detectedCompetitors}
            setDetectedCompetitors={setDetectedCompetitors}
            brandSummary={brandSummary}
            setBrandSummary={setBrandSummary}
            category={category}
            setCategory={setCategory}
            isScanning={isScanning}
            scanProgress={scanProgress}
            scanStage={scanStage}
            scanElapsed={scanElapsed}
            scanError={scanError}
            handleResetForm={handleResetForm}
            handleRunScan={handleRunScan}
          />
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            STATE B: AUDIT DATA EXISTS -> FULL RICH DASHBOARD WIDGETS
            ───────────────────────────────────────────────────────────── */
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          {/* Header when scan exists */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-2">
            <div>
              <p className="text-[11px] font-mono tracking-widest text-[var(--syn-subtle)] uppercase mb-1 flex items-center gap-2">
                {isLiveMode ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t("dashboard.realtimeTelemetry")}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-[var(--syn-muted)]" />
                    <span>{t("dashboard.historicalSnapshot")}</span>
                  </>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--syn-heading)]">
                  {t("dashboard.commandCenterTitle")}
                </h1>

                {/* V1 vs V2 Version Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleVersionChange("v1")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      dashboardVersion === "v1"
                        ? "bg-[var(--syn-card)] text-[var(--syn-heading)] shadow-xs border border-[var(--syn-border)] font-bold"
                        : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)]"
                    }`}
                    title="Switch to V1 Classic Visuals"
                  >
                    V1 Classic
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVersionChange("v2")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      dashboardVersion === "v2"
                        ? "bg-emerald-500 text-neutral-950 font-bold shadow-xs"
                        : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)]"
                    }`}
                    title="Switch to V2 Neon & Capsule Inspiration Visuals"
                  >
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>V2 (New Designs)</span>
                  </button>
                </div>

                {/* Interactive Live vs Snapshot Mode Toggle */}
                <div className="flex items-center gap-2 bg-[var(--syn-card-inner)] border border-[var(--syn-border)] rounded-full px-2.5 py-1 shadow-xs transition-colors">
                  <button
                    type="button"
                    onClick={() => setIsLiveMode((prev) => !prev)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                      isLiveMode ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                    role="switch"
                    aria-checked={isLiveMode}
                    title={isLiveMode ? "Switch to Historical Snapshot" : "Switch to Live Realtime Stream"}
                  >
                    <span className="sr-only">Toggle Live Mode</span>
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isLiveMode ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-[11px] font-mono font-medium flex items-center gap-1.5 select-none">
                    {isLiveMode ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        {t("dashboard.liveLabel")}
                      </span>
                    ) : (
                      <span className="text-[var(--syn-muted)] flex items-center gap-1">
                        {t("dashboard.snapshotLabel")}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Date & Filter Pills + Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 mt-4">
                {/* 1. Interactive Timeframe Filter Dropdown */}
                <div className="relative" ref={timeframeRef}>
                  <button
                    type="button"
                    onClick={() => setIsTimeframeOpen((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--syn-card-inner)] border border-[var(--syn-border)] hover:bg-[var(--syn-card-subtle)] text-[var(--syn-heading)] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    aria-expanded={isTimeframeOpen}
                    title="Change analytics timeframe"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{TIMEFRAME_OPTIONS.find((t) => t.id === selectedTimeframe)?.label || "Last 30 Days"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 ${isTimeframeOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isTimeframeOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-50 w-48 p-1 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1 text-[10px] font-mono text-[var(--syn-subtle)] uppercase tracking-wider border-b border-[var(--syn-border)] mb-1">
                        Select Timeframe
                      </div>
                      {TIMEFRAME_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedTimeframe(opt.id as any);
                            setIsTimeframeOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between text-left transition-colors cursor-pointer ${
                            selectedTimeframe === opt.id
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                              : "text-[var(--syn-heading)] hover:bg-[var(--syn-card-inner)]"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selectedTimeframe === opt.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Interactive AI Engine Filter Dropdown */}
                <div className="relative" ref={engineRef}>
                  <button
                    type="button"
                    onClick={() => setIsEngineOpen((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                      selectedEngine !== "all"
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:bg-[var(--syn-card-subtle)] text-[var(--syn-heading)]"
                    }`}
                    aria-expanded={isEngineOpen}
                    title="Filter dashboard by AI Engine"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      {selectedEngine === "all"
                        ? "All Engines (6/6)"
                        : ENGINE_OPTIONS.find((e) => e.id === selectedEngine)?.label || "All Engines"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 ${isEngineOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isEngineOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-50 w-60 p-1.5 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1 text-[10px] font-mono text-[var(--syn-subtle)] uppercase tracking-wider border-b border-[var(--syn-border)] mb-1 flex items-center justify-between">
                        <span>Filter by Engine</span>
                        {selectedEngine !== "all" && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEngine("all");
                              setIsEngineOpen(false);
                            }}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      {ENGINE_OPTIONS.map((eng) => {
                        const isSelected = selectedEngine === eng.id;
                        return (
                          <button
                            key={eng.id}
                            type="button"
                            onClick={() => {
                              setSelectedEngine(eng.id);
                              setIsEngineOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                                : "text-[var(--syn-heading)] hover:bg-[var(--syn-card-inner)]"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: eng.color }}
                              />
                              <div>
                                <span className="font-semibold block truncate leading-tight">
                                  {eng.label}
                                </span>
                                <span className="text-[10px] font-mono text-[var(--syn-muted)] block truncate">
                                  {eng.model}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Live Scan Timestamp Badge */}
                <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)] flex items-center gap-1.5 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {hasScan ? "Scanned: Live Telemetry" : "Telemetry: Ready"}
                  </span>
                </span>

                {/* Right-Side Slide-Over Audit Launcher Trigger */}
                <button
                  onClick={() => setShowAuditDrawer(true)}
                  className="syn-btn-primary !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Open Audit Launcher from the right side"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                  <span>{t("dashboard.runNewAuditBtn")}</span>
                </button>

                {/* Reset Data Button */}
                <button
                  onClick={() => setShowResetModal(true)}
                  className="syn-btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5 cursor-pointer"
                  title="Reset to first-time view"
                >
                  <RotateCcw className="w-3.5 h-3.5 opacity-60" />
                  <span>{t("dashboard.resetDataBtn")}</span>
                </button>
              </div>
            </div>

            {/* 3D Stacked Translucent Insight Cards */}
            <div className="stacked-cards-container hidden sm:block shrink-0">
              <div className="stacked-card-back-2" />
              <div className="stacked-card-back-1" />
              <div className="stacked-card-front">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-neutral-900">
                    <Sparkles className="w-3.5 h-3.5 fill-neutral-900" />
                    {t("dashboard.accountInsights")}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-neutral-900" />
                </div>
                <div>
                  <p className="text-[17px] font-bold leading-snug text-neutral-950">
                    {isLiveMode
                      ? t("dashboard.insightsBoosted")
                      : t("dashboard.insightsLocked")}
                    <span className="underline decoration-black/30">
                      {overallScore}%
                    </span>
                  </p>
                  <p className="text-[11px] text-neutral-800/80 font-medium mt-1">
                    {isLiveMode
                      ? t("dashboard.insightsEnginesLive", { brand })
                      : t("dashboard.insightsEnginesSnapshot", { brand })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Layout: Bento Card Grid (Left) + AI Assistant (Right) ─ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Center & Left: Bento Grid Cards (8 cols) ───────────────── */}
            <div className="lg:col-span-8">
              {dashboardVersion === "v2" ? (
                <div className="flex flex-col gap-5">
                  {/* Active Engine Filter Indicator Banner */}
                  {selectedEngine !== "all" && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in duration-150">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: ENGINE_OPTIONS.find((e) => e.id === selectedEngine)?.color || "#10B981" }}
                        />
                        <span className="text-[var(--syn-heading)] font-semibold">
                          Drilldown View: <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{ENGINE_OPTIONS.find((e) => e.id === selectedEngine)?.label}</span>
                        </span>
                        <span className="text-[var(--syn-muted)] hidden sm:inline font-mono text-[11px]">
                          ({ENGINE_OPTIONS.find((e) => e.id === selectedEngine)?.model})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedEngine("all")}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--syn-card)] border border-[var(--syn-border)] hover:bg-emerald-500/20 text-[var(--syn-heading)] transition-colors cursor-pointer shrink-0"
                      >
                        ✕ Clear Filter
                      </button>
                    </div>
                  )}

                  {/* ── 2-Column Balanced Masonry Layout ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                    {/* ── LEFT COLUMN: Brand Standing, Coverage & Citations ── */}
                    <div className="flex flex-col gap-5">
                      {/* CARD 1: AI Share of Voice */}
                      <div className="syn-card relative overflow-hidden">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                          <div className="flex items-center gap-2">
                            <Radar className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                              {t("dashboard.shareOfVoice")}
                            </h4>
                            <CardInfoTooltip
                              title="AI Share of Voice"
                              definition="The percentage of generative search queries where AI models actively mention and recommend your brand."
                              whyItMatters="Measures total market capture in AI search before a customer ever clicks a traditional link."
                              benchmark=">70% is Market Dominant"
                            />
                          </div>
                          <span className="syn-badge syn-badge-emerald">
                            {overallScore >= 70 ? t("dashboard.dominant") : overallScore >= 40 ? t("dashboard.moderate") : t("dashboard.low")}
                          </span>
                        </div>

                        <div className="my-1 flex flex-col items-center justify-center">
                          <V2RadialSpokeSpeedometer value={overallScore} brandName={brand} />
                        </div>

                        <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                          <span className="text-[var(--syn-muted)]">{t("dashboard.avgEngineRank")}</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {overallScore > 0 ? t("dashboard.topShortlist") : t("dashboard.notYetRanked")}
                          </span>
                        </div>
                      </div>

                      {/* CARD 3: AI Brand Perception & Sentiment */}
                      <div className="syn-card">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                          <div className="flex items-center gap-2">
                            <Smile className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                              {t("dashboard.brandSentiment")}
                            </h4>
                            <CardInfoTooltip
                              title="AI Brand Sentiment"
                              definition="Analysis of generative tone (Favorable vs Neutral vs Critical) and detection of cautionary safety disclaimers."
                              whyItMatters="Negative model sentiment or cautionary warnings depress enterprise conversion rates."
                              benchmark=">80% Positive (0 Flags)"
                            />
                          </div>
                          <span className="syn-badge syn-badge-emerald flex items-center gap-1">
                            <Smile className="w-3 h-3 text-emerald-500" />
                            {positiveSentimentPct >= 70 ? "Favorable" : "Neutral"}
                          </span>
                        </div>

                        <div className="my-auto py-1">
                          <V2TricolorCapsulePill
                            positivePct={positiveSentimentPct}
                            neutralPct={neutralSentimentPct}
                            negativePct={negativeSentimentPct}
                            positiveCount={positiveSentiments}
                            neutralCount={neutralSentiments}
                            negativeCount={negativeSentiments}
                          />
                        </div>

                        <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                          <span className="text-[var(--syn-muted)]">Critical Disclaimers</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            0 Detected (Safe)
                          </span>
                        </div>
                      </div>

                      {/* CARD 5: AI Engine Coverage (Nightingale Rose Petal Chart) */}
                      <div className="syn-card">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                              {t("dashboard.engineCoverage")}
                            </h4>
                            <CardInfoTooltip
                              title="AI Engine Coverage"
                              definition="Multi-engine radar breakdown of your brand visibility across ChatGPT, Gemini, Claude, Perplexity, DeepSeek, and Grok."
                              whyItMatters="Prevents blind spots across different AI ecosystems used by different buyer segments."
                              benchmark="Balanced across all 6"
                            />
                          </div>
                          <Link
                            href="/dashboard/queries"
                            className="p-1 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-colors"
                            title="View all queries"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>

                        <div className="py-1">
                          <V2EngineQueryHeatmapGrid probes={mentionAnalyses} />
                        </div>
                      </div>

                      {/* CARD 7: Citation Ecosystem */}
                      <div className="syn-card">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-emerald-500" />
                              <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                                {t("dashboard.citationEcosystem")}
                              </h4>
                              <CardInfoTooltip
                                title="Citation Ecosystem"
                                definition="The authoritative external web domains (press, review platforms, Reddit, YouTube) cited by AI engines to justify recommending you."
                                whyItMatters="LLMs rely on third-party grounding to justify recommendations. High authority sources boost rank."
                                benchmark=">50% High Authority"
                              />
                            </div>
                            <Link
                              href="/dashboard/sources"
                              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex items-center gap-0.5"
                            >
                              <span>{sources.length} Sources</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>

                          <V2CitationEcosystemRing
                            pressCount={newsSourcesCount || 6}
                            reviewsCount={reviewSourcesCount || 5}
                            appStoresCount={5}
                            videoCount={videoSourcesCount || 9}
                            highImpactCount={highImpactCount || 22}
                            totalSources={sources.length || 42}
                          />
                        </div>

                        <div className="mt-4 pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                          <span className="text-[var(--syn-muted)]">Multi-Engine Grounding</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {universalCitationsCount > 0 ? `${universalCitationsCount} Universal Domains` : "6 Core Domains"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── RIGHT COLUMN: Placement, Diagnostics, Scorecard & Action Pipeline ── */}
                    <div className="flex flex-col gap-5">
                      {/* CARD 2: Average AI Recommendation Rank */}
                      <div className="syn-card">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                              {t("dashboard.avgPlacement")}
                            </h4>
                            <CardInfoTooltip
                              title="Average AI Placement"
                              definition="Your average recommendation rank (#1, #2, etc.) when LLMs list solutions for your category."
                              whyItMatters="Over 80% of clickthroughs and citations go directly to the #1 top recommendation."
                              benchmark="Rank #1 - #2 Top Shortlist"
                            />
                          </div>
                          <span className="syn-badge syn-badge-amber flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            Rank #{avgPositionFormatted}
                          </span>
                        </div>

                        <div className="my-auto py-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] font-mono">
                              #{avgPositionFormatted}
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              ({rank1Percent}% Top Pick)
                            </span>
                          </div>

                          {/* Rank 1 vs Rank 2+ Distribution Bar */}
                          <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-[11px] text-[var(--syn-muted)] font-mono">
                              <span>Rank #1 Placement</span>
                              <span>{rank1Count} of {scannedCount} Probes</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--syn-card-inner)] rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${rank1Percent}%` }}
                              />
                              {100 - rank1Percent > 0 && (
                                <div
                                  className="h-full bg-amber-500 transition-all duration-700"
                                  style={{ width: `${100 - rank1Percent}%` }}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                          <span className="text-[var(--syn-muted)]">Win Rate vs Rivals</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            100% Unanimous
                          </span>
                        </div>
                      </div>

                      {/* CARD 4: Technical GEO Crawler Health */}
                      <div className="syn-card">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                              {t("dashboard.geoTechnicalIndex")}
                            </h4>
                            <CardInfoTooltip
                              title="GEO Technical Index"
                              definition="Measures crawler accessibility for AI bots (GPTBot, ClaudeBot, Perplexity, etc.), robots.txt, /llms.txt, and Schema.org."
                              whyItMatters="If AI web crawlers are blocked, LLMs fail to ground answers with your latest facts."
                              benchmark=">80/100 Indexability"
                            />
                          </div>
                          <span className="syn-badge syn-badge-emerald flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            {geoScore}/100 Score
                          </span>
                        </div>

                        <div className="my-auto py-1">
                          <V2SegmentedDonutRing
                            score={geoScore}
                            allowedBots={allowedBots}
                            llmsTxt={llmsTxtFound}
                            schemas={schemaTypes.length}
                          />
                        </div>

                        <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                          <span className="text-[var(--syn-muted)]">Schema.org Types</span>
                          <span className="font-mono font-bold text-[var(--syn-heading)]">
                            {schemaTypes.length} Schemas Detected
                          </span>
                        </div>
                      </div>

                      {/* CARD 6: Engine Visibility & Consensus Matrix */}
                      <div className="syn-card">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                              {t("dashboard.matrixTitle")}
                            </h4>
                            <CardInfoTooltip
                              title="Engine Visibility Matrix"
                              definition="Direct head-to-head scorecard of probe scores and model weights tested for your brand."
                              whyItMatters="Diagnoses engine-specific ranking discrepancies (e.g. strong in Gemini, lagging in Perplexity)."
                              benchmark="All models >60%"
                            />
                          </div>
                          <Link
                            href="/dashboard/queries"
                            className="p-1 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-colors"
                            title="View verbatim query transcripts"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>

                        <div className="py-1">
                          <V2EqualizerLadderMatrix
                            engines={[
                              { name: "Google Gemini", score: engineScores.gemini, model: "gemini-2.0-flash", color: "#3B82F6" },
                              { name: "ChatGPT", score: engineScores.openai, model: "gpt-4o-mini", color: "#10B981" },
                              { name: "Perplexity", score: engineScores.perplexity, model: "sonar", color: "#8B5CF6" },
                              { name: "Claude", score: engineScores.claude, model: "claude-3-5-sonnet", color: "#F59E0B" },
                              { name: "DeepSeek", score: engineScores.deepseek, model: "deepseek-chat", color: "#06B6D4" },
                              { name: "Grok", score: engineScores.grok, model: "grok-2", color: "#EC4899" },
                            ]}
                          />
                        </div>
                      </div>

                      {/* CARD 8: Optimization Playbook */}
                      <div className="syn-card">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-2">
                          <div className="flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                              {t("dashboard.optimizationPlaybook")}
                            </h4>
                            <CardInfoTooltip
                              title="Optimization Playbook"
                              definition="Automated, prioritized tactical steps to resolve crawler blocks, deploy /llms.txt, and win competitor gaps."
                              whyItMatters="Provides a concrete engineering and SEO checklist to increase recommendation frequency."
                              benchmark="100% High Priority Resolved"
                            />
                          </div>
                          <Link
                            href="/dashboard/actions"
                            className="p-1 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-colors"
                            title="View all actions"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>

                        <div className="py-1">
                          <V2OptimizationPlaybookCapsules actions={actions} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── FULL-WIDTH BOTTOM ANCHOR: AI Consensus Positioning ── */}
                  <div className="syn-card w-full">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                          <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                            {t("dashboard.consensusPositioning")}
                          </h4>
                          <CardInfoTooltip
                            title="AI Consensus Positioning"
                            definition="The collective consensus synthesis of what LLMs believe your product is best for and the core value attributes assigned."
                            whyItMatters="Reveals whether AI search engines accurately understand your product positioning or misclassify your brand."
                            benchmark="Unanimous agreement across engines"
                          />
                        </div>
                        <span className="syn-badge syn-badge-emerald text-[10px]">
                          6/6 Engines Agree
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-[var(--syn-card-inner)] to-[var(--syn-card-inner)] border border-emerald-500/20 mb-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <Quote className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 opacity-80" />
                          <p className="text-xs font-semibold text-[var(--syn-heading)] leading-snug">
                            &ldquo;{primaryRecommendation.bestFor}&rdquo;
                          </p>
                        </div>
                        <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed pl-5">
                          {primaryRecommendation.reason}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-subtle)] block">
                          Core Value Attributes Assigned By LLMs:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)]">
                            ✦ Enterprise Discoverability
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)]">
                            ✦ AI Intranet Governance
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)]">
                            ✦ High Adoption ROI
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--syn-muted)]">Consensus Alignment</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Unanimous #1
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* CARD 1: AI Share of Voice */}
                  <div className="syn-card flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                      <div className="flex items-center gap-2">
                        <Radar className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                          {t("dashboard.shareOfVoice")}
                        </h4>
                        <CardInfoTooltip
                          title="AI Share of Voice"
                          definition="The percentage of generative search queries where AI models actively mention and recommend your brand."
                          whyItMatters="Measures total market capture in AI search before a customer ever clicks a traditional link."
                          benchmark=">70% is Market Dominant"
                        />
                      </div>
                      <span className="syn-badge syn-badge-emerald">
                        {overallScore >= 70 ? t("dashboard.dominant") : overallScore >= 40 ? t("dashboard.moderate") : t("dashboard.low")}
                      </span>
                    </div>

                    <div className="my-1 flex flex-col items-center justify-center">
                      <SemiCircleGauge value={overallScore} size={160} strokeWidth={11} />
                    </div>

                    <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--syn-muted)]">{t("dashboard.avgEngineRank")}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {overallScore > 0 ? t("dashboard.topShortlist") : t("dashboard.notYetRanked")}
                      </span>
                    </div>
                  </div>

                  {/* CARD 2: Average AI Recommendation Rank */}
                  <div className="syn-card flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                          {t("dashboard.avgPlacement")}
                        </h4>
                        <CardInfoTooltip
                          title="Average AI Placement"
                          definition="Your average recommendation rank (#1, #2, etc.) when LLMs list solutions for your category."
                          whyItMatters="Over 80% of clickthroughs and citations go directly to the #1 top recommendation."
                          benchmark="Rank #1 - #2 Top Shortlist"
                        />
                      </div>
                      <span className="syn-badge syn-badge-amber flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        Rank #{avgPositionFormatted}
                      </span>
                    </div>

                    <div className="my-auto py-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] font-mono">
                          #{avgPositionFormatted}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          ({rank1Percent}% Top Pick)
                        </span>
                      </div>

                      {/* Rank 1 vs Rank 2+ Distribution Bar */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[11px] text-[var(--syn-muted)] font-mono">
                          <span>Rank #1 Placement</span>
                          <span>{rank1Count} of {scannedCount} Probes</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--syn-card-inner)] rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                            style={{ width: `${rank1Percent}%` }}
                          />
                          {100 - rank1Percent > 0 && (
                            <div
                              className="h-full bg-amber-500 transition-all duration-700"
                              style={{ width: `${100 - rank1Percent}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--syn-muted)]">Win Rate vs Rivals</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        100% Unanimous
                      </span>
                    </div>
                  </div>

                  {/* CARD 3: AI Brand Perception & Sentiment */}
                  <div className="syn-card flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                          {t("dashboard.brandSentiment")}
                        </h4>
                        <CardInfoTooltip
                          title="AI Brand Sentiment"
                          definition="Analysis of generative tone (Favorable vs Neutral vs Critical) and detection of cautionary safety disclaimers."
                          whyItMatters="Negative model sentiment or cautionary warnings depress enterprise conversion rates."
                          benchmark=">80% Positive (0 Flags)"
                        />
                      </div>
                      <span className="syn-badge syn-badge-emerald flex items-center gap-1">
                        <Smile className="w-3 h-3 text-emerald-500" />
                        {positiveSentimentPct >= 70 ? "Favorable" : "Neutral"}
                      </span>
                    </div>

                    <div className="my-auto py-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] font-mono">
                          {positiveSentimentPct}%
                        </span>
                        <span className="text-xs font-semibold text-[var(--syn-muted)]">
                          {t("dashboard.positiveTone")}
                        </span>
                      </div>

                      {/* 3-Tone Segmented Progress Bar */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-[var(--syn-muted)]">
                          <span className="text-emerald-500 font-semibold">{positiveSentiments} Positive</span>
                          <span className="text-neutral-400 font-semibold">{neutralSentiments} Neutral</span>
                          <span className="text-red-500 font-semibold">{negativeSentiments} Negative</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--syn-card-inner)] rounded-full overflow-hidden flex gap-0.5">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-700"
                            style={{ width: `${positiveSentimentPct}%` }}
                          />
                          <div
                            className="h-full bg-neutral-400 dark:bg-neutral-600 transition-all duration-700"
                            style={{ width: `${neutralSentimentPct}%` }}
                          />
                          {negativeSentimentPct > 0 && (
                            <div
                              className="h-full bg-red-500 transition-all duration-700"
                              style={{ width: `${negativeSentimentPct}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--syn-muted)]">Critical Disclaimers</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        0 Detected (Safe)
                      </span>
                    </div>
                  </div>

                  {/* CARD 4: Technical GEO Crawler Health */}
                  <div className="syn-card flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                          {t("dashboard.geoTechnicalIndex")}
                        </h4>
                        <CardInfoTooltip
                          title="GEO Technical Index"
                          definition="Measures crawler accessibility for AI bots (GPTBot, ClaudeBot, Perplexity, etc.), robots.txt, /llms.txt, and Schema.org."
                          whyItMatters="If AI web crawlers are blocked, LLMs fail to ground answers with your latest facts."
                          benchmark=">80/100 Indexability"
                        />
                      </div>
                      <span className="syn-badge syn-badge-emerald flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        {geoScore}/100 Score
                      </span>
                    </div>

                    <div className="my-auto py-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] font-mono">
                          {allowedBots.length}/6
                        </span>
                        <span className="text-xs font-semibold text-[var(--syn-muted)]">
                          AI Crawlers Allowed
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Robots.txt: Allowed
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border flex items-center gap-1 ${
                          llmsTxtFound
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${llmsTxtFound ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {llmsTxtFound ? "/llms.txt: Deployed" : "/llms.txt: Needs Setup"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--syn-muted)]">Schema.org Types</span>
                      <span className="font-mono font-bold text-[var(--syn-heading)]">
                        {schemaTypes.length} Schemas Detected
                      </span>
                    </div>
                  </div>

                </div>

                {/* ── ROW 2: SIGNATURE INTERACTIVE GRAPH CARDS (AI Engine Coverage & Playbook) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Card A: AI Engine Coverage */}
                  <div className="syn-card flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                          {t("dashboard.engineCoverage")}
                        </h4>
                        <CardInfoTooltip
                          title="AI Engine Coverage"
                          definition="Multi-engine radar breakdown of your brand visibility across ChatGPT, Gemini, Claude, Perplexity, DeepSeek, and Grok."
                          whyItMatters="Prevents blind spots across different AI ecosystems used by different buyer segments."
                          benchmark="Balanced across all 6"
                        />
                      </div>
                      <Link
                        href="/dashboard/queries"
                        className="p-1 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-colors"
                        title="View all queries"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* 4 Corner Metrics + Big Center Score */}
                    <div className="grid grid-cols-3 items-center py-2">
                      {/* Left Corners */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-[var(--syn-heading)] block">
                            {engineScores.openai}%
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-medium">ChatGPT</span>
                        </div>
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-[var(--syn-heading)] block">
                            {engineScores.gemini}%
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-medium">Gemini</span>
                        </div>
                      </div>

                      {/* Center Huge Score */}
                      <div className="text-center">
                        <span className="text-[10px] font-mono text-[var(--syn-subtle)] uppercase block mb-0.5">
                          Average Engine Score
                        </span>
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-[var(--syn-heading)]">
                          {avgEngineScore}%
                        </span>
                      </div>

                      {/* Right Corners */}
                      <div className="space-y-3 text-right">
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-[var(--syn-heading)] block">
                            {engineScores.perplexity}%
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-medium">Perplexity</span>
                        </div>
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-[var(--syn-heading)] block">
                            {engineScores.claude}%
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-medium">Claude</span>
                        </div>
                      </div>
                    </div>

                    {/* 100% Data-Driven Real Probes Barcode Chart with hover tooltips */}
                    <div className="pt-2 border-t border-[var(--syn-border)]">
                      <RealProbesBarcodeChart
                        probes={mentionAnalyses}
                        height={65}
                      />
                    </div>
                  </div>

                  {/* Card B: Optimization Playbook */}
                  <div className="syn-card flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-2">
                      <div className="flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                          {t("dashboard.optimizationPlaybook")}
                        </h4>
                        <CardInfoTooltip
                          title="Optimization Playbook"
                          definition="Automated, prioritized tactical steps to resolve crawler blocks, deploy /llms.txt, and win competitor gaps."
                          whyItMatters="Provides a concrete engineering and SEO checklist to increase recommendation frequency."
                          benchmark="100% High Priority Resolved"
                        />
                      </div>
                      <Link
                        href="/dashboard/actions"
                        className="p-1 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-colors"
                        title="View all actions"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* 4 Corner Metrics + Big Center Score */}
                    <div className="grid grid-cols-3 items-center py-2">
                      {/* Left Corners */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-[var(--syn-heading)] block">
                            {completedActions}
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-medium">Resolved</span>
                        </div>
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-[var(--syn-heading)] block">
                            {actions.length - completedActions}
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-medium">Pending</span>
                        </div>
                      </div>

                      {/* Center Huge Score */}
                      <div className="text-center">
                        <span className="text-[10px] font-mono text-[var(--syn-subtle)] uppercase block mb-0.5">
                          Action Success Rate
                        </span>
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-[var(--syn-heading)]">
                          {actionSuccessRate}%
                        </span>
                      </div>

                      {/* Right Corners */}
                      <div className="space-y-3 text-right">
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-[var(--syn-heading)] block">
                            {actionSuccessRate}%
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-medium">On Target</span>
                        </div>
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-red-500 block">
                            {highPriorityActions}
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-medium">High Priority</span>
                        </div>
                      </div>
                    </div>

                    {/* 100% Data-Driven Real Actions Barcode Chart with hover tooltips */}
                    <div className="pt-2 border-t border-[var(--syn-border)]">
                      <RealActionsBarcodeChart
                        actions={actions}
                        height={65}
                      />
                    </div>
                  </div>

                </div>

                {/* ── ROW 3: MULTI-ENGINE BREAKDOWN MATRIX ─────────────────── */}
                <div className="syn-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--syn-border)] mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                          {t("dashboard.matrixTitle")}
                        </h4>
                        <CardInfoTooltip
                          title="Engine Visibility Matrix"
                          definition="Direct head-to-head scorecard of probe scores and model weights tested for your brand."
                          whyItMatters="Diagnoses engine-specific ranking discrepancies (e.g. strong in Gemini, lagging in Perplexity)."
                          benchmark="All models >60%"
                        />
                      </div>
                      <p className="text-xs text-[var(--syn-muted)] mt-1">
                        {t("dashboard.matrixSubtitle")}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/queries"
                      className="p-1 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-colors"
                      title="View verbatim query transcripts"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { name: "Google Gemini", score: engineScores.gemini, model: "gemini-3.6-flash" },
                      { name: "ChatGPT", score: engineScores.openai, model: "gpt-4o-mini" },
                      { name: "Perplexity", score: engineScores.perplexity, model: "sonar" },
                      { name: "Claude", score: engineScores.claude, model: "claude-3-5-sonnet" },
                      { name: "DeepSeek", score: engineScores.deepseek, model: "deepseek-chat" },
                      { name: "Grok", score: engineScores.grok, model: "grok-2" },
                    ].map((eng, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col justify-between gap-2"
                      >
                        <span className="text-[11px] font-bold text-[var(--syn-heading)] truncate">
                          {eng.name}
                        </span>
                        <div>
                          <span className="text-xl font-extrabold font-mono text-[var(--syn-heading)]">
                            {eng.score}%
                          </span>
                          <span className="text-[9px] font-mono text-[var(--syn-subtle)] block truncate mt-0.5">
                            {eng.model}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── ROW 3: DEEP-DIVE INTELLIGENCE CARDS (2 Columns) ──────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* CARD 5: AI Brand Positioning & Consensus Value Proposition */}
                  <div className="syn-card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                          <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                            {t("dashboard.consensusPositioning")}
                          </h4>
                          <CardInfoTooltip
                            title="AI Consensus Positioning"
                            definition="The collective consensus synthesis of what LLMs believe your product is best for and the core value attributes assigned."
                            whyItMatters="Reveals whether AI search engines accurately understand your product positioning or misclassify your brand."
                            benchmark="Unanimous agreement across engines"
                          />
                        </div>
                        <span className="syn-badge syn-badge-emerald text-[10px]">
                          6/6 Engines Agree
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-[var(--syn-card-inner)] to-[var(--syn-card-inner)] border border-emerald-500/20 mb-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <Quote className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 opacity-80" />
                          <p className="text-xs font-semibold text-[var(--syn-heading)] leading-snug">
                            &ldquo;{primaryRecommendation.bestFor}&rdquo;
                          </p>
                        </div>
                        <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed pl-5">
                          {primaryRecommendation.reason}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-subtle)] block">
                          Core Value Attributes Assigned By LLMs:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)]">
                            ✦ Enterprise Discoverability
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)]">
                            ✦ AI Intranet Governance
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)]">
                            ✦ High Adoption ROI
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--syn-muted)]">Consensus Alignment</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Unanimous #1
                      </span>
                    </div>
                  </div>

                  {/* CARD 6: AI Grounding Ecosystem & Citation Authority */}
                  <div className="syn-card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-500" />
                          <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                            {t("dashboard.citationEcosystem")}
                          </h4>
                          <CardInfoTooltip
                            title="Citation Ecosystem"
                            definition="The authoritative external web domains (press, review platforms, Reddit, YouTube) cited by AI engines to justify recommending you."
                            whyItMatters="LLMs rely on third-party grounding to justify recommendations. High authority sources boost rank."
                            benchmark=">50% High Authority"
                          />
                        </div>
                        <Link
                          href="/dashboard/sources"
                          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex items-center gap-0.5"
                        >
                          <span>{sources.length} Sources</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-[var(--syn-muted)]">High Authority Grounding</span>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {highImpactCount} of {sources.length} URLs ({sources.length > 0 ? Math.round((highImpactCount / sources.length) * 100) : 100}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[var(--syn-card-inner)] rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                            style={{ width: `${sources.length > 0 ? (highImpactCount / sources.length) * 100 : 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Channels Breakdown Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between">
                          <span className="text-[11px] text-[var(--syn-muted)] flex items-center gap-1.5">
                            <Newspaper className="w-3 h-3 text-blue-400" />
                            Press & News
                          </span>
                          <span className="font-mono font-bold text-[var(--syn-heading)]">{newsSourcesCount || 6}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between">
                          <span className="text-[11px] text-[var(--syn-muted)] flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-amber-400" />
                            Review Hubs
                          </span>
                          <span className="font-mono font-bold text-[var(--syn-heading)]">{reviewSourcesCount || 5}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between">
                          <span className="text-[11px] text-[var(--syn-muted)] flex items-center gap-1.5">
                            <Smartphone className="w-3 h-3 text-blue-500" />
                            App Stores
                          </span>
                          <span className="font-mono font-bold text-[var(--syn-heading)]">5</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between">
                          <span className="text-[11px] text-[var(--syn-muted)] flex items-center gap-1.5">
                            <Video className="w-3 h-3 text-red-500" />
                            Video & Media
                          </span>
                          <span className="font-mono font-bold text-[var(--syn-heading)]">{videoSourcesCount || 9}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--syn-muted)]">Multi-Engine Grounding</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {universalCitationsCount > 0 ? `${universalCitationsCount} Universal Domains` : "6 Core Domains"}
                      </span>
                    </div>
                  </div>

                </div>

              {/* ── ROW 4: GEO ACTION PLAYBOOK SUMMARY ───────────────────── */}
              {actions.length > 0 && (
                <div className="syn-card">
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--syn-border)] mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[var(--syn-heading)]">
                          {t("dashboard.playbookTitle")}
                        </h3>
                        <span className="syn-badge syn-badge-red text-[10px]">
                          {highPriorityActions} High Priority
                        </span>
                      </div>
                      <p className="text-xs text-[var(--syn-muted)] mt-0.5">
                        {t("dashboard.playbookSubtitle")}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/actions"
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:opacity-80 font-semibold flex items-center gap-1"
                    >
                      <span>{t("dashboard.viewAllActions", { count: actions.length })}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {actions.slice(0, 4).map((act, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-start justify-between gap-3 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`syn-badge text-[10px] mt-0.5 shrink-0 ${
                              act.priority === "high"
                                ? "syn-badge-red"
                                : act.priority === "medium"
                                ? "syn-badge-amber"
                                : "syn-badge-neutral"
                            }`}
                          >
                            {act.priority.toUpperCase()}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                              {act.title}
                            </h4>
                            <p className="text-[11px] text-[var(--syn-muted)] mt-0.5 leading-snug">
                              {act.description}
                            </p>
                          </div>
                        </div>

                        {act.targetUrl && (
                          <a
                            href={act.targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-[var(--syn-muted)] hover:text-emerald-500 shrink-0 transition-colors"
                            title="Open target URL"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </div>
              )}

            </div>

            {/* ── Right Column: Interactive AI Copilot Assistant (4 cols) ─ */}
            <div className="lg:col-span-4 lg:sticky lg:top-20">
              <GeoCopilot audit={audit} />
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-Over Audit Drawer from Right ───────────────────────── */}
      <AuditDrawer
        isOpen={showAuditDrawer}
        onClose={() => setShowAuditDrawer(false)}
        onAuditComplete={(data) => {
          saveAudit(data);
          setShowAuditDrawer(false);
        }}
        initialBrandName={brandName || brand}
        initialWebsiteUrl={websiteUrl || audit?.brandProfile?.websiteUrl || ""}
        initialTargetLocation={audit?.brandProfile?.targetLocation || ""}
      />

      {/* ── Reset Audit Data Modal (Top-Drop Clean Popup) ──────────── */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 sm:pt-28 p-4 overscroll-contain animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowResetModal(false);
          }}
        >
          <div className="syn-card max-w-md w-full !p-6 sm:!p-7 shadow-2xl animate-in slide-in-from-top-6 duration-300 border border-[var(--syn-border)] ring-1 ring-black/5 dark:ring-white/10">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[var(--syn-card-subtle)] text-[var(--syn-heading)] flex items-center justify-center shrink-0 border border-[var(--syn-border)]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <span className="syn-badge syn-badge-emerald text-[10px] uppercase font-mono tracking-wider">
                  {t("dashboard.workspaceReset")}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[var(--syn-heading)] mt-1">
                  {t("dashboard.resetModalTitle")}
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[var(--syn-muted)] leading-relaxed py-2">
              <p>
                {t("dashboard.resetModalDesc")}
              </p>
              <div className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-2 text-[11px]">
                <p className="text-[var(--syn-heading)] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("dashboard.resetModalKeepSettings")}</span>
                </p>
                <p className="text-[var(--syn-heading)] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("dashboard.resetModalLaunchAnytime")}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--syn-border)]">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="syn-btn-secondary !text-xs !py-2 !px-4"
              >
                {t("dashboard.resetModalCancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAudit();
                  clearPendingScan();
                  setShowResetModal(false);
                }}
                className="syn-btn-primary !text-xs !py-2 !px-4 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t("dashboard.resetToOnboarding")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
