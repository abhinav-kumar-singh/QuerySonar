"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuditData } from "@/lib/audit-storage";
import {
  Globe,
  ArrowUpRight,
  Radar,
  Trophy,
  Search,
  ArrowLeft,
  Layers,
  FileQuestion,
  Newspaper,
  BookOpen,
  Code2,
  GitBranch,
  Smartphone,
  Video,
  MessageSquare,
  Bot,
  FileCode,
  ShieldCheck,
  Star,
  SlidersHorizontal,
  Filter,
  X,
  ChevronDown,
  Check,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { SemiCircleGauge, TickProgressBar } from "../components/gauge";
import { useTranslation } from "@/lib/i18n/language-context";

type SourceFilter =
  | "all"
  | "community"
  | "news"
  | "wikipedia"
  | "reviews"
  | "tech"
  | "video";

function SourcesSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="w-28 h-3 syn-skeleton rounded-md" />
          <div className="w-64 h-8 syn-skeleton rounded-lg" />
          <div className="w-96 h-4 syn-skeleton rounded-md" />
        </div>
      </div>

      {/* Top 3 Bento KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="syn-card flex flex-col justify-between h-[180px]">
            <div className="flex items-center justify-between">
              <div className="w-28 h-4 syn-skeleton rounded-md" />
              <div className="w-12 h-4 syn-skeleton rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="w-36 h-8 syn-skeleton rounded-lg" />
              <div className="w-48 h-3 syn-skeleton rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Technical Crawler Audit Card Skeleton */}
      <div className="syn-card p-6 flex flex-col gap-4">
        <div className="w-48 h-5 syn-skeleton rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-2">
              <div className="w-32 h-4 syn-skeleton rounded-md" />
              <div className="w-20 h-5 syn-skeleton rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Citations Table Skeleton */}
      <div className="syn-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-48 h-5 syn-skeleton rounded-md" />
          <div className="w-64 h-8 syn-skeleton rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="w-48 h-4 syn-skeleton rounded-md" />
                <div className="w-80 h-3 syn-skeleton rounded-md" />
              </div>
              <div className="w-24 h-6 syn-skeleton rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SourcesPage() {
  const { audit, isLoading } = useAuditData();
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<SourceFilter>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const channelDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(event.target as Node)) {
        setIsChannelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return <SourcesSkeleton />;
  }

  const sources = audit?.citedSources ?? [];
  const brandName = audit?.brandProfile?.name || "Your Brand";
  const hasScan = Boolean(audit);
  const techGeo = audit?.technicalGeo;

  // Categorization helpers
  const isReddit = (s: { domain: string; sourceType?: string }) =>
    s.sourceType === "reddit" || s.domain.toLowerCase().includes("reddit.com");

  const isNews = (s: { domain: string; sourceType?: string }) =>
    s.sourceType === "news" || /news\.google|techcrunch|forbes|bloomberg|reuters|theverge|wired|venturebeat/i.test(s.domain);

  const isWiki = (s: { domain: string; sourceType?: string }) =>
    s.sourceType === "wikipedia" || s.domain.toLowerCase().includes("wikipedia.org");

  const isTech = (s: { domain: string; sourceType?: string }) =>
    s.sourceType === "stackoverflow" ||
    s.sourceType === "github" ||
    s.sourceType === "hackernews" ||
    /github\.com|stackoverflow\.com|ycombinator\.com/i.test(s.domain);

  const isReview = (s: { domain: string; sourceType?: string }) =>
    s.sourceType === "reviews" ||
    s.sourceType === "appstore" ||
    /apps\.apple|rtings|g2\.com|capterra|trustpilot|soundguys|consumerreports|wirecutter|techradar|trustradius/i.test(s.domain);

  const isVideo = (s: { domain: string; sourceType?: string }) =>
    s.sourceType === "youtube" || s.domain.toLowerCase().includes("youtube.com");

  // Filter sources
  const filteredSources = sources.filter((s) => {
    const matchesSearch =
      s.domain.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (s.excerptText && s.excerptText.toLowerCase().includes(searchFilter.toLowerCase()));
    if (!matchesSearch) return false;

    if (filterType === "community") return isReddit(s) || s.sourceType === "hackernews";
    if (filterType === "news") return isNews(s);
    if (filterType === "wikipedia") return isWiki(s);
    if (filterType === "reviews") return isReview(s);
    if (filterType === "tech") return isTech(s);
    if (filterType === "video") return isVideo(s);
    return true;
  });

  const highImpactCount = sources.filter((s) => s.impactRating === "high").length;
  const standardCount = sources.length - highImpactCount;
  const groundingPercentage = sources.length > 0
    ? Math.min(100, Math.round((sources.length / (sources.length + 2)) * 100))
    : 0;

  // Channel breakdown metrics
  const redditCount = sources.filter((s) => isReddit(s)).length;
  const newsCount = sources.filter((s) => isNews(s)).length;
  const wikiCount = sources.filter((s) => isWiki(s)).length;
  const reviewCount = sources.filter((s) => isReview(s)).length;
  const techCount = sources.filter((s) => isTech(s)).length;
  const videoCount = sources.filter((s) => isVideo(s)).length;

  const channelsConfig: {
    id: SourceFilter;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    {
      id: "all",
      label: t("sourcesTab.allChannels"),
      count: sources.length,
      icon: Globe,
      desc: "All scanned AI grounding domains",
    },
    {
      id: "community",
      label: t("sourcesTab.channelReddit"),
      count: redditCount,
      icon: MessageSquare,
      desc: "Unbiased peer discussions and user threads",
    },
    {
      id: "news",
      label: t("sourcesTab.channelNews"),
      count: newsCount,
      icon: Newspaper,
      desc: "High-authority editorial press and journalism",
    },
    {
      id: "wikipedia",
      label: t("sourcesTab.channelWiki"),
      count: wikiCount,
      icon: BookOpen,
      desc: "Encyclopedic knowledge graphs and entities",
    },
    {
      id: "tech",
      label: t("sourcesTab.channelDev"),
      count: techCount,
      icon: Code2,
      desc: "Developer docs, GitHub, and StackOverflow",
    },
    {
      id: "reviews",
      label: t("sourcesTab.channelApp"),
      count: reviewCount,
      icon: Smartphone,
      desc: "G2, Capterra, RTINGS, and app reviews",
    },
    {
      id: "video",
      label: t("sourcesTab.channelVideo"),
      count: videoCount,
      icon: Video,
      desc: "Video reviews and YouTube transcript grounding",
    },
  ];

  const activeChannelConfig = channelsConfig.find((c) => c.id === filterType) || channelsConfig[0];
  const ActiveIcon = activeChannelConfig.icon;

  const getSourceIcon = (source: { domain: string; sourceType?: string }) => {
    if (isReddit(source)) return <MessageSquare className="w-3.5 h-3.5 text-orange-500" />;
    if (isNews(source)) return <Newspaper className="w-3.5 h-3.5 text-blue-400" />;
    if (isWiki(source)) return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
    if (source.sourceType === "github" || source.domain.includes("github.com"))
      return <GitBranch className="w-3.5 h-3.5 text-neutral-300" />;
    if (source.sourceType === "stackoverflow" || source.domain.includes("stackoverflow.com"))
      return <Code2 className="w-3.5 h-3.5 text-amber-500" />;
    if (source.sourceType === "appstore" || source.domain.includes("apple.com"))
      return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
    if (isVideo(source)) return <Video className="w-3.5 h-3.5 text-red-500" />;
    return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
  };

  const getSourceChannelLabel = (source: { domain: string; sourceType?: string }) => {
    if (isReddit(source)) return t("sourcesTab.channelReddit");
    if (isNews(source)) return t("sourcesTab.channelNews");
    if (isWiki(source)) return t("sourcesTab.channelWiki");
    if (source.sourceType === "github" || source.sourceType === "stackoverflow") return t("sourcesTab.channelDev");
    if (source.sourceType === "appstore" || isReview(source)) return t("sourcesTab.channelApp");
    if (isVideo(source)) return t("sourcesTab.channelVideo");
    return t("sourcesTab.colChannel");
  };

  const getImpactBadge = (impact?: string) => {
    switch (impact) {
      case "high":
        return <span className="syn-badge syn-badge-emerald">{t("sourcesTab.impactHigh")}</span>;
      case "medium":
        return <span className="syn-badge syn-badge-amber">{t("sourcesTab.impactMedium")}</span>;
      default:
        return <span className="syn-badge syn-badge-neutral">{t("sourcesTab.impactLow")}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-mono tracking-widest text-[var(--syn-subtle)] uppercase mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("sourcesTab.badgeCategory")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--syn-heading)]">
            {t("sourcesTab.title")}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--syn-muted)] mt-1 max-w-2xl">
            {t("sourcesTab.subtitle")}
          </p>
        </div>

        {/* Sleek Channel Filter Dropdown */}
        {sources.length > 0 && (
          <div ref={channelDropdownRef} className="relative shrink-0 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setIsChannelDropdownOpen((prev) => !prev)}
              className={`w-full sm:w-auto flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-[var(--syn-card)] border-2 transition-all cursor-pointer shadow-xs select-none ${
                isChannelDropdownOpen
                  ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : filterType !== "all"
                  ? "border-emerald-500/50 bg-emerald-500/[0.04]"
                  : "border-[var(--syn-border)] hover:border-emerald-500/50 hover:bg-[var(--syn-card-subtle)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 transition-colors ${
                    filterType !== "all"
                      ? "bg-[#86EFAC] text-neutral-950 shadow-xs"
                      : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-emerald-400"
                  }`}
                >
                  <ActiveIcon className="w-3.5 h-3.5" />
                </div>

                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block leading-none">
                    {t("sourcesTab.colChannel")}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-[var(--syn-heading)] capitalize">
                      {activeChannelConfig.label}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold">
                      {activeChannelConfig.count}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 shrink-0 ml-1 ${
                  isChannelDropdownOpen ? "rotate-180 text-emerald-400" : ""
                }`}
              />
            </button>

            {/* Floating Popover */}
            {isChannelDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-[290px] sm:w-[320px] max-h-[420px] overflow-y-auto rounded-2xl bg-[var(--syn-card)] border-2 border-[var(--syn-border)] shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[var(--syn-border)] mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold">
                    Filter by Channel
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    {sources.length} Total
                  </span>
                </div>

                <div className="space-y-1">
                  {channelsConfig.map(({ id, label, count, icon: ItemIcon, desc }) => {
                    const isSelected = filterType === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setFilterType(id);
                          setIsChannelDropdownOpen(false);
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
                                : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-emerald-400"
                            }`}
                          >
                            <ItemIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold block text-[var(--syn-heading)]">
                                {label}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)] font-bold">
                                {count}
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--syn-muted)] block truncate mt-0.5">
                              {desc}
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

      {!hasScan ? (
        /* Empty State */
        <div className="syn-card text-center py-16 flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <Globe className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[var(--syn-heading)] mb-2">{t("dashboard.noDataYet")}</h3>
          <p className="text-xs text-[var(--syn-muted)] max-w-sm mb-6">
            {t("dashboard.subtitle")}
          </p>
          <Link href="/dashboard" className="syn-btn-primary">
            <ArrowLeft className="w-4 h-4" /> {t("nav.overview")}
          </Link>
        </div>
      ) : (
        <>
          {/* ── Top Bento KPI Metrics ─────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* KPI 1: Total Citations & Impact */}
            <div className="syn-card flex flex-col justify-between h-[200px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  {t("sourcesTab.totalCitations")}
                </span>
                <span className="syn-badge syn-badge-emerald">{t("common.statusLive")}</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight text-[var(--syn-heading)] mb-2 font-mono">
                  {sources.length} <span className="text-lg font-bold text-[var(--syn-muted)]">URLs</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--syn-muted)] mb-2">
                  <span>
                    <strong className="block text-xs font-bold text-[var(--syn-heading)] font-mono">{highImpactCount}</strong> {t("sourcesTab.highAuthority")}
                  </span>
                  <span className="text-right">
                    <strong className="block text-xs font-bold text-[var(--syn-heading)] font-mono">{standardCount}</strong> {t("sourcesTab.impactLow")}
                  </span>
                </div>
                <TickProgressBar
                  percentage={sources.length > 0 ? (highImpactCount / sources.length) * 100 : 0}
                  accentColor="#10B981"
                />
              </div>
            </div>

            {/* KPI 2: Grounding Consensus Gauge */}
            <div className="syn-card flex flex-col justify-between h-[200px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <Radar className="w-3.5 h-3.5 text-emerald-400" />
                  {t("landing.scoreLabel")}
                </span>
                <span className="text-[10px] text-[var(--syn-muted)] font-mono">{t("landing.engineStripOneQuestion")}</span>
              </div>
              <div className="flex flex-col items-center justify-center -mt-2">
                <SemiCircleGauge value={groundingPercentage} size={170} strokeWidth={11} color="#22C55E" />
              </div>
            </div>

            {/* KPI 3: Channel Matrix */}
            <div className="syn-card flex flex-col justify-between h-[200px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  {t("sourcesTab.colChannel")}
                </span>
              </div>
              <div className="space-y-1.5 my-auto">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-medium text-[var(--syn-heading)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> {t("sourcesTab.channelReddit")}
                  </span>
                  <span className="font-mono font-bold text-[var(--syn-heading)]">{redditCount}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-medium text-[var(--syn-heading)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> {t("sourcesTab.channelNews")}
                  </span>
                  <span className="font-mono font-bold text-[var(--syn-heading)]">{newsCount}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-medium text-[var(--syn-heading)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" /> {t("sourcesTab.channelWiki")}
                  </span>
                  <span className="font-mono font-bold text-[var(--syn-heading)]">{wikiCount}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-medium text-[var(--syn-heading)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("sourcesTab.channelDev")} / {t("sourcesTab.channelApp")}
                  </span>
                  <span className="font-mono font-bold text-[var(--syn-heading)]">{reviewCount + techCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Technical GEO & AI Crawler Readiness Widget ──────────── */}
          {techGeo && (
            <div className="syn-card p-6 border-emerald-500/20 bg-emerald-500/[0.02]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--syn-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--syn-heading)]">{t("sourcesTab.technicalAuditTitle")}</h3>
                      <span className="syn-badge syn-badge-emerald font-mono">
                        {t("sourcesTab.technicalScore")}: {techGeo.overallGeoScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-[var(--syn-muted)] mt-0.5">
                      {t("sourcesTab.technicalAuditDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--syn-muted)]">{t("dashboard.domainUrl")}:</span>
                  <span className="font-mono font-semibold px-2 py-0.5 rounded bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)]">
                    {audit.brandProfile.websiteUrl || "Website"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                {/* Check 1: robots.txt AI Bot Crawlability */}
                <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-1.5 text-[var(--syn-heading)]">
                      <Bot className="w-4 h-4 text-emerald-500" />
                      {t("sourcesTab.robotsStatus")}
                    </span>
                    {techGeo.robotsTxtStatus === "allowed" ? (
                      <span className="syn-badge syn-badge-emerald text-[10px]">{t("sourcesTab.valid")}</span>
                    ) : (
                      <span className="syn-badge syn-badge-amber text-[10px]">{t("sourcesTab.blocked")}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                    {techGeo.robotsTxtStatus === "allowed"
                      ? "All major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) are permitted."
                      : `Blocked: ${techGeo.blockedAiBots.join(", ")}.`}
                  </p>
                </div>

                {/* Check 2: /llms.txt File */}
                <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-1.5 text-[var(--syn-heading)]">
                      <FileCode className="w-4 h-4 text-purple-400" />
                      {t("sourcesTab.llmsStatus")}
                    </span>
                    {techGeo.llmsTxtFound ? (
                      <span className="syn-badge syn-badge-emerald text-[10px]">{t("sourcesTab.valid")}</span>
                    ) : (
                      <span className="syn-badge syn-badge-neutral text-[10px]">{t("sourcesTab.missing")}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                    {techGeo.llmsTxtFound
                      ? "Direct AI context file discovered at root domain."
                      : "No /llms.txt markdown file found. Add one to supply direct structured context to models."}
                  </p>
                </div>

                {/* Check 3: Schema.org Microdata */}
                <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-1.5 text-[var(--syn-heading)]">
                      <Code2 className="w-4 h-4 text-blue-400" />
                      {t("sourcesTab.schemaStatus")}
                    </span>
                    <span className="syn-badge syn-badge-emerald text-[10px]">
                      {techGeo.schemaScore}% Quality
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                    {techGeo.schemaTypesFound.length > 0
                      ? `Detected: ${techGeo.schemaTypesFound.join(", ")}.`
                      : "No JSON-LD microdata found on homepage. Add Organization & Product schema."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Main Bento Grid of Cited Sources ──────────────────────── */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 p-3 rounded-2xl bg-[var(--syn-card)] border-2 border-[var(--syn-border)] shadow-xs">
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-lg font-bold text-[var(--syn-heading)]">
                  {t("sourcesTab.title")}
                </h3>
                <span className="syn-badge syn-badge-emerald font-mono text-xs">
                  {filteredSources.length}
                </span>
                {(filterType !== "all" || searchFilter !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterType("all");
                      setSearchFilter("");
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all cursor-pointer shadow-xs ml-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset filter</span>
                  </button>
                )}
              </div>

              {sources.length > 0 && (
                <div className="flex items-center gap-2 bg-[var(--syn-card-inner)] px-3.5 py-2 rounded-xl border-2 border-[var(--syn-border)] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 text-xs w-full sm:w-80 shadow-xs transition-all">
                  <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    placeholder={t("sourcesTab.searchPlaceholder")}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-full text-[var(--syn-heading)] placeholder:text-[var(--syn-muted)]"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter("")}
                      className="text-[var(--syn-muted)] hover:text-[var(--syn-heading)] cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {sources.length === 0 ? (
              <div className="syn-card text-center py-12 flex flex-col items-center justify-center">
                <FileQuestion className="w-10 h-10 text-[var(--syn-subtle)] mb-3" />
                <h4 className="text-base font-bold text-[var(--syn-heading)] mb-1">{t("sourcesTab.noSourcesFound")}</h4>
                <p className="text-xs text-[var(--syn-muted)] max-w-md">
                  {t("sourcesTab.subtitle")}
                </p>
              </div>
            ) : filteredSources.length === 0 ? (
              <div className="syn-card text-center py-10">
                <p className="text-xs text-[var(--syn-muted)]">{t("sourcesTab.noSourcesFound")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSources.map((source, idx) => (
                  <div
                    key={`${source.url}-${idx}`}
                    className="syn-card flex flex-col justify-between p-5 gap-4 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-center font-bold text-sm">
                          {getSourceIcon(source)}
                        </div>
                        <div>
                          <span className="text-xs font-bold block leading-tight font-mono truncate max-w-[170px] text-[var(--syn-heading)]">
                            {source.domain}
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] flex items-center gap-1">
                            {getSourceChannelLabel(source)}
                          </span>
                        </div>
                      </div>
                      {getImpactBadge(source.impactRating)}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-[var(--syn-heading)] line-clamp-2 leading-snug">
                        {source.title || source.url}
                      </p>
                      {source.excerptText && (
                        <p className="text-[11px] text-[var(--syn-muted)] line-clamp-2 italic">
                          &ldquo;{source.excerptText}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--syn-border)]">
                      <div className="flex items-center gap-2">
                        {source.subreddit && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold">
                            {source.subreddit}
                          </span>
                        )}
                        {typeof source.rating === "number" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500" /> {source.rating.toFixed(1)}
                          </span>
                        )}
                        {typeof source.upvotes === "number" && source.upvotes > 0 && (
                          <span className="text-[10px] font-mono text-[var(--syn-muted)]">
                            ▲ {source.upvotes.toLocaleString()}
                          </span>
                        )}
                        {typeof source.commentsCount === "number" && source.commentsCount > 0 && (
                          <span className="text-[10px] font-mono text-[var(--syn-muted)]">
                            💬 {source.commentsCount.toLocaleString()}
                          </span>
                        )}
                        {source.publishedDate && (
                          <span className="text-[10px] font-mono text-[var(--syn-subtle)]">
                            {source.publishedDate.slice(0, 10)}
                          </span>
                        )}
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--syn-heading)] hover:text-emerald-400 transition-colors shrink-0 ml-2"
                      >
                        {t("sourcesTab.claimCitation")} <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
