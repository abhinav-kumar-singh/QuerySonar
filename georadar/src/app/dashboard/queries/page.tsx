"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuditData } from "@/lib/audit-storage";
import {
  Search,
  ArrowLeft,
  Sparkles,
  Globe2,
  Crosshair,
  MessageSquare,
  CheckCircle2,
  Layers,
  SlidersHorizontal,
  Filter,
  ChevronDown,
  Check,
  HelpCircle,
  Zap,
  X,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import type { MentionAnalysis, ProbeStatus, Engine } from "@/lib/geo-engine/types";
import { SemiCircleGauge, TickProgressBar } from "../components/gauge";
import { useTranslation } from "@/lib/i18n/language-context";
import { FormattedResponseViewer } from "@/components/dashboard/formatted-response-viewer";

function getAnalysisStatus(analysis: MentionAnalysis): ProbeStatus {
  return analysis.status ?? (analysis.rawResponse ? "live" : "unavailable");
}

const ENGINE_CONFIG: Record<
  Engine,
  { label: string; model: string; desc: string; icon: (cls?: string) => React.ReactNode }
> = {
  openai: {
    label: "ChatGPT",
    model: "GPT-4o",
    desc: "Conversational synthesis",
    icon: (cls) => <Globe2 className={cls || "w-4 h-4 text-emerald-400"} />,
  },
  gemini: {
    label: "Gemini",
    model: "Gemini 1.5 Pro",
    desc: "Multimodal reasoning",
    icon: (cls) => <Sparkles className={cls || "w-4 h-4 text-sky-400"} />,
  },
  perplexity: {
    label: "Perplexity",
    model: "Sonar Online",
    desc: "Real-time search grounded",
    icon: (cls) => <Crosshair className={cls || "w-4 h-4 text-teal-400"} />,
  },
  claude: {
    label: "Claude",
    model: "Claude 3.5 Sonnet",
    desc: "Nuanced contextual depth",
    icon: (cls) => <MessageSquare className={cls || "w-4 h-4 text-amber-400"} />,
  },
  deepseek: {
    label: "DeepSeek",
    model: "DeepSeek V3",
    desc: "Advanced open-weights reasoning",
    icon: (cls) => <Layers className={cls || "w-4 h-4 text-indigo-400"} />,
  },
  grok: {
    label: "Grok",
    model: "Grok 2",
    desc: "Real-time conversational model",
    icon: (cls) => <Zap className={cls || "w-4 h-4 text-fuchsia-400"} />,
  },
};

function getEngineIcon(engine: Engine, cls?: string) {
  return ENGINE_CONFIG[engine]?.icon(cls) ?? <Sparkles className={cls || "w-4 h-4 text-emerald-400"} />;
}


function QueriesSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="w-28 h-3 syn-skeleton rounded-md" />
          <div className="w-64 h-8 syn-skeleton rounded-lg" />
          <div className="w-96 h-4 syn-skeleton rounded-md" />
        </div>
        <div className="w-72 h-10 syn-skeleton rounded-2xl" />
      </div>

      {/* Top Bento KPI Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="syn-card flex flex-col justify-between h-[200px]">
            <div className="flex items-center justify-between">
              <div className="w-28 h-4 syn-skeleton rounded-md" />
              <div className="w-16 h-4 syn-skeleton rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="w-48 h-6 syn-skeleton rounded-lg" />
              <div className="w-full h-3 syn-skeleton rounded-md" />
              <div className="w-full h-2 syn-skeleton rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Transcripts List Skeleton */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="w-48 h-6 syn-skeleton rounded-lg" />
          <div className="w-36 h-9 syn-skeleton rounded-2xl" />
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="syn-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--syn-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 syn-skeleton rounded-2xl" />
                <div className="space-y-1.5">
                  <div className="w-32 h-4 syn-skeleton rounded-md" />
                  <div className="w-48 h-3 syn-skeleton rounded-md" />
                </div>
              </div>
              <div className="w-20 h-6 syn-skeleton rounded-full" />
            </div>
            <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-2">
              <div className="w-full h-4 syn-skeleton rounded-md" />
              <div className="w-5/6 h-4 syn-skeleton rounded-md" />
              <div className="w-3/4 h-4 syn-skeleton rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QueriesPage() {
  const { audit, isLoading } = useAuditData();
  const { t } = useTranslation();
  const [activeEngineFilter, setActiveEngineFilter] = useState<string>("all");
  const [activeQueryFilter, setActiveQueryFilter] = useState<string>("all");
  const [isQueryDropdownOpen, setIsQueryDropdownOpen] = useState(false);
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const engineDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQueryDropdownOpen(false);
      }
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(event.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusBadge = (status: ProbeStatus) => {
    switch (status) {
      case "live":
        return <span className="syn-badge syn-badge-emerald">{t("queriesTab.statusLive")}</span>;
      case "mock":
        return <span className="syn-badge syn-badge-amber">{t("queriesTab.statusMock")}</span>;
      case "failed":
        return <span className="syn-badge syn-badge-red">{t("queriesTab.statusFailed")}</span>;
      default:
        return <span className="syn-badge syn-badge-neutral">{t("queriesTab.statusUnavailable")}</span>;
    }
  };

  if (isLoading) {
    return <QueriesSkeleton />;
  }

  const analyses = audit?.mentionAnalyses ?? [];
  const brandName = audit?.brandProfile?.name ?? "Your Brand";
  const competitors = audit?.brandProfile?.competitors ?? [];

  // Extract all distinct queries from analyses
  const uniqueQueries = Array.from(
    new Set(analyses.map((a) => a.query).filter(Boolean))
  );

  // 1. Filter by query first
  const queryFilteredAnalyses = analyses.filter((a) => {
    if (activeQueryFilter === "all") return true;
    return a.query === activeQueryFilter;
  });

  // 2. Filter by engine second
  const filteredAnalyses = queryFilteredAnalyses.filter((a) => {
    if (activeEngineFilter === "all") return true;
    return a.engine === activeEngineFilter;
  });

  // KPI Metrics based on query-filtered analyses
  const mentionedCount = queryFilteredAnalyses.filter((a) => a.brandMentioned).length;
  const mentionRate =
    queryFilteredAnalyses.length > 0
      ? Math.round((mentionedCount / queryFilteredAnalyses.length) * 100)
      : 0;

  const targetQueryDisplay =
    activeQueryFilter === "all"
      ? uniqueQueries.length > 1
        ? `All ${uniqueQueries.length} Audited Prompts`
        : uniqueQueries[0] || "Target Buyer Query"
      : activeQueryFilter;

  const activeEngineConfig = activeEngineFilter !== "all" ? ENGINE_CONFIG[activeEngineFilter as Engine] : null;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-mono tracking-widest text-[var(--syn-subtle)] uppercase mb-1">
            {t("queriesTab.badgeCategory")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--syn-heading)]">
            {t("queriesTab.title")}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--syn-muted)] mt-1 max-w-2xl">
            {t("queriesTab.subtitle")}
          </p>
        </div>

        {/* Sleek, Modern AI Engine Dropdown Selector */}
        <div ref={engineDropdownRef} className="relative shrink-0 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setIsEngineDropdownOpen((prev) => !prev)}
            className={`w-full sm:w-auto flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-[var(--syn-card)] border-2 transition-all cursor-pointer shadow-xs select-none ${
              isEngineDropdownOpen
                ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                : activeEngineFilter !== "all"
                ? "border-emerald-500/50 bg-emerald-500/[0.04]"
                : "border-[var(--syn-border)] hover:border-emerald-500/50 hover:bg-[var(--syn-card-subtle)]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 transition-colors ${
                  activeEngineFilter !== "all"
                    ? "bg-[#86EFAC] text-neutral-950 shadow-xs"
                    : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-emerald-400"
                }`}
              >
                {activeEngineFilter === "all" ? (
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                ) : (
                  getEngineIcon(activeEngineFilter as Engine, "w-4 h-4 text-neutral-950")
                )}
              </div>

              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block leading-none">
                  AI Engine
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-[var(--syn-heading)] capitalize">
                    {activeEngineConfig ? activeEngineConfig.label : t("common.allEngines")}
                  </span>
                  {activeEngineConfig && (
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold">
                      {activeEngineConfig.model}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 shrink-0 ml-1 ${
                isEngineDropdownOpen ? "rotate-180 text-emerald-400" : ""
              }`}
            />
          </button>

          {/* Floating Dropdown Popover */}
          {isEngineDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-[290px] sm:w-[320px] max-h-[420px] overflow-y-auto rounded-2xl bg-[var(--syn-card)] border-2 border-[var(--syn-border)] shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[var(--syn-border)] mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold">
                  Select AI Engine
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                  6 Probed
                </span>
              </div>

              {/* All AI Engines Option */}
              <button
                type="button"
                onClick={() => {
                  setActiveEngineFilter("all");
                  setIsEngineDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer mb-1 ${
                  activeEngineFilter === "all"
                    ? "bg-[#86EFAC]/15 border border-emerald-500/40 text-[var(--syn-heading)] font-bold"
                    : "hover:bg-[var(--syn-card-subtle)] text-[var(--syn-text)]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      activeEngineFilter === "all"
                        ? "bg-[#86EFAC] text-neutral-950 font-mono shadow-xs"
                        : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)]"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block text-[var(--syn-heading)]">
                      {t("common.allEngines")}
                    </span>
                    <span className="text-[11px] text-[var(--syn-muted)] block truncate">
                      View all 6 engine transcripts
                    </span>
                  </div>
                </div>

                {activeEngineFilter === "all" && (
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </button>

              {/* Individual Engine Options */}
              <div className="space-y-1">
                {(Object.keys(ENGINE_CONFIG) as Engine[]).map((key) => {
                  const meta = ENGINE_CONFIG[key];
                  const isSelected = activeEngineFilter === key;
                  const engineAnalyses = analyses.filter((a) => a.engine === key);
                  const engineMentions = engineAnalyses.filter((a) => a.brandMentioned).length;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setActiveEngineFilter(key);
                        setIsEngineDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#86EFAC]/15 border border-emerald-500/40 text-[var(--syn-heading)] font-bold"
                          : "hover:bg-[var(--syn-card-subtle)] text-[var(--syn-text)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? "bg-[#86EFAC] text-neutral-950 shadow-xs"
                              : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)]"
                          }`}
                        >
                          {isSelected
                            ? getEngineIcon(key, "w-4 h-4 text-neutral-950")
                            : getEngineIcon(key)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold block text-[var(--syn-heading)]">
                              {meta.label}
                            </span>
                            <span className="text-[9px] font-mono text-[var(--syn-muted)] bg-[var(--syn-card-inner)] px-1.5 py-0.2 rounded border border-[var(--syn-border)]">
                              {meta.model}
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--syn-muted)] block truncate mt-0.5">
                            {engineAnalyses.length > 0 ? (
                              <span className="text-emerald-500 font-semibold">
                                {engineMentions}/{engineAnalyses.length} mentioned
                              </span>
                            ) : (
                              meta.desc
                            )}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {analyses.length === 0 ? (
        /* Empty State */
        <div className="syn-card text-center py-16 flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[var(--syn-heading)] mb-2">{t("dashboard.noDataYet")}</h3>
          <p className="text-xs text-[var(--syn-muted)] max-w-sm mb-6">
            {t("queriesTab.subtitle")}
          </p>
          <Link href="/dashboard" className="syn-btn-primary">
            <ArrowLeft className="w-4 h-4" /> {t("nav.overview")}
          </Link>
        </div>
      ) : (
        <>
          {/* ── Top Bento KPI Metrics ─────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* KPI 1: Query & Mentions */}
            <div className="syn-card flex flex-col justify-between h-[200px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  {t("queriesTab.promptCardTitle")}
                </span>
                <span className="syn-badge syn-badge-emerald">{t("common.statusLive")}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--syn-heading)] line-clamp-2 mb-2 font-mono" title={targetQueryDisplay}>
                  &ldquo;{targetQueryDisplay}&rdquo;
                </p>
                <div className="flex items-center justify-between text-[11px] text-[var(--syn-muted)] mb-2">
                  <span>
                    <strong className="text-[var(--syn-heading)] block text-xs font-mono">{mentionedCount} / {queryFilteredAnalyses.length}</strong> {t("queriesTab.enginesResponding")}
                  </span>
                  <span className="text-right">
                    <strong className="text-[var(--syn-heading)] block text-xs font-mono">{mentionRate}%</strong> {t("queriesTab.recommendationRate")}
                  </span>
                </div>
                <TickProgressBar percentage={mentionRate} accentColor="#10B981" />
              </div>
            </div>

            {/* KPI 2: Recommendation Position Gauge */}
            <div className="syn-card flex flex-col justify-between h-[200px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {t("landing.scoreLabel")}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center -mt-2">
                <SemiCircleGauge value={mentionRate} size={170} strokeWidth={11} color="#22C55E" />
              </div>
            </div>

            {/* KPI 3: Mention Highlights Key */}
            <div className="syn-card flex flex-col justify-between h-[200px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  {t("queriesTab.badgeCategory")}
                </span>
              </div>
              <div className="space-y-3 my-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-[var(--syn-heading)]">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500" /> {brandName} ({t("dashboard.brandName")})
                  </span>
                  <span className="syn-badge syn-badge-emerald font-semibold">{t("queriesTab.brandMentionedInResponse")}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-[var(--syn-heading)]">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500" /> {t("competitorsTab.title")}
                  </span>
                  <span className="syn-badge syn-badge-amber font-semibold">{t("competitorsTab.badgeCategory")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Verbatim Engine Transcripts ───────────────────────────── */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl font-extrabold text-[var(--syn-heading)]">
                  {t("queriesTab.title")} ({filteredAnalyses.length})
                </h3>
                {(activeEngineFilter !== "all" || activeQueryFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEngineFilter("all");
                      setActiveQueryFilter("all");
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset filters</span>
                  </button>
                )}
              </div>

              {/* Custom Query Filter Dropdown (Right Side of Audited Buyer Prompts row) */}
              {uniqueQueries.length > 0 && (
                <div ref={dropdownRef} className="relative shrink-0 self-end sm:self-auto">
                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsQueryDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[var(--syn-card)] border-2 transition-all cursor-pointer shadow-xs select-none ${
                      isQueryDropdownOpen
                        ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                        : "border-[var(--syn-border)] hover:border-emerald-500/50 hover:bg-[var(--syn-card-subtle)]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--syn-heading)]">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Query:</span>
                    </div>

                    <div className="flex items-center gap-2 max-w-[200px] sm:max-w-[280px]">
                      {activeQueryFilter === "all" ? (
                        <span className="text-xs font-semibold text-[var(--syn-heading)] truncate">
                          All Queries ({uniqueQueries.length})
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[var(--syn-heading)] truncate" title={activeQueryFilter}>
                          Q{uniqueQueries.indexOf(activeQueryFilter) + 1}: {activeQueryFilter}
                        </span>
                      )}
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 shrink-0 ${
                        isQueryDropdownOpen ? "rotate-180 text-emerald-400" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Floating Popover */}
                  {isQueryDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-[300px] sm:w-[420px] max-h-[380px] overflow-y-auto rounded-2xl bg-[var(--syn-card)] border-2 border-[var(--syn-border)] shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-[var(--syn-border)] mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold">
                          Select Audited Prompt
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                          {uniqueQueries.length} {uniqueQueries.length === 1 ? "Query" : "Queries"}
                        </span>
                      </div>

                      {/* "All Queries" Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveQueryFilter("all");
                          setIsQueryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer mb-1 ${
                          activeQueryFilter === "all"
                            ? "bg-[#86EFAC]/15 border border-emerald-500/40 text-[var(--syn-heading)] font-bold"
                            : "hover:bg-[var(--syn-card-subtle)] text-[var(--syn-text)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            activeQueryFilter === "all"
                              ? "bg-[#86EFAC] text-neutral-950 font-mono shadow-xs"
                              : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)]"
                          }`}>
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block text-[var(--syn-heading)]">
                              All Audited Queries
                            </span>
                            <span className="text-[11px] text-[var(--syn-muted)] block truncate">
                              View all {analyses.length} model transcripts together
                            </span>
                          </div>
                        </div>

                        {activeQueryFilter === "all" && (
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                      </button>

                      {/* Individual Query Options */}
                      <div className="space-y-1">
                        {uniqueQueries.map((q, idx) => {
                          const isSelected = activeQueryFilter === q;
                          const qAnalyses = analyses.filter((a) => a.query === q);
                          const qMentions = qAnalyses.filter((a) => a.brandMentioned).length;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setActiveQueryFilter(q);
                                setIsQueryDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#86EFAC]/15 border border-emerald-500/40 text-[var(--syn-heading)] font-bold"
                                  : "hover:bg-[var(--syn-card-subtle)] text-[var(--syn-text)]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                                    isSelected
                                      ? "bg-[#86EFAC] text-neutral-950 shadow-xs"
                                      : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)]"
                                  }`}
                                >
                                  Q{idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <span className="text-xs font-semibold block text-[var(--syn-heading)] truncate" title={q}>
                                    &ldquo;{q}&rdquo;
                                  </span>
                                  <span className="text-[10px] text-[var(--syn-muted)] flex items-center gap-1.5 mt-0.5">
                                    <span>{qAnalyses.length} engines</span>
                                    <span>&bull;</span>
                                    <span className="text-emerald-500 font-semibold">{qMentions} mentions</span>
                                  </span>
                                </div>
                              </div>

                              {isSelected && (
                                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {filteredAnalyses.map((analysis, index) => {
              const probeStatus = getAnalysisStatus(analysis);
              const engineName = analysis.engine === "openai" ? "ChatGPT" : analysis.engine;

              return (
                <div key={`${analysis.engine}-${index}`} className="syn-card p-6 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
                  {/* Top Bar: Engine Logo, Status, Rank, Latency */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--syn-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] flex items-center justify-center">
                        {getEngineIcon(analysis.engine)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-[var(--syn-heading)] capitalize">
                            {engineName}
                          </strong>
                          {analysis.model && (
                            <span className="text-[10px] font-mono text-[var(--syn-muted)] bg-[var(--syn-card-subtle)] px-2 py-0.5 rounded border border-[var(--syn-border)]">
                              {analysis.model}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[var(--syn-muted)] mt-0.5 block">
                          {analysis.query}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {analysis.mentionPosition && analysis.mentionPosition > 0 && (
                        <span className="syn-badge syn-badge-emerald">
                          #{analysis.mentionPosition} {t("dashboard.matrixColPosition")}
                        </span>
                      )}
                      {statusBadge(probeStatus)}
                    </div>
                  </div>

                  {/* Verbatim AI Answer with Formatted & Structured Viewer */}
                  {analysis.rawResponse ? (
                    <FormattedResponseViewer
                      rawText={analysis.rawResponse}
                      brandName={brandName}
                      competitors={competitors}
                      recommendations={analysis.recommendations}
                      citations={analysis.citations}
                    />
                  ) : (
                    <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] shadow-inner">
                      <p className="text-xs text-[var(--syn-subtle)] italic">
                        {t("queriesTab.statusUnavailable")}
                      </p>
                    </div>
                  )}

                  {/* Recommendation / Analysis Footer */}
                  {analysis.statusReason && (
                    <div className="flex items-center gap-2 text-xs text-[var(--syn-muted)] pt-1">
                      <strong className="text-[var(--syn-heading)] font-semibold">GEO Context:</strong>
                      <span>{analysis.statusReason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
