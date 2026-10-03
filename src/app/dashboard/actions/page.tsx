"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuditData } from "@/lib/audit-storage";
import {
  CheckCircle2,
  Circle,
  ArrowUpRight,
  ArrowLeft,
  Target,
  Zap,
  ListTodo,
  Filter,
  ChevronDown,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { SemiCircleGauge, TickProgressBar } from "../components/gauge";
import { useTranslation } from "@/lib/i18n/language-context";
import { GeoToolkitModal, GeoToolType } from "@/components/dashboard/geo-toolkit-modal";

function ActionsSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="w-28 h-3 syn-skeleton rounded-md" />
          <div className="w-64 h-8 syn-skeleton rounded-lg" />
          <div className="w-96 h-4 syn-skeleton rounded-md" />
        </div>
        <div className="w-64 h-10 syn-skeleton rounded-2xl" />
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

      {/* Action Items List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="syn-card p-6 flex items-start gap-4">
            <div className="w-6 h-6 syn-skeleton rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-48 h-5 syn-skeleton rounded-md" />
                <div className="w-20 h-5 syn-skeleton rounded-full" />
              </div>
              <div className="w-full h-3 syn-skeleton rounded-md" />
              <div className="w-4/5 h-3 syn-skeleton rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ActionsPage() {
  const { audit, isLoading } = useAuditData();
  const { t } = useTranslation();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  // Live GEO Studio Modal State
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [toolkitTool, setToolkitTool] = useState<GeoToolType>("llmstxt");
  const [toolkitContext, setToolkitContext] = useState<{
    competitorName?: string;
    threadTitle?: string;
    targetUrl?: string;
    query?: string;
  }>({});

  const openToolkitForAction = (action: any) => {
    let tool: GeoToolType = "llmstxt";
    const ctx: { competitorName?: string; threadTitle?: string; targetUrl?: string; query?: string } = {
      targetUrl: action.targetUrl,
    };

    if (action.actionType === "update_schema") {
      tool = "schema";
    } else if (action.actionType === "respond_reddit" || action.actionType === "contact_publication") {
      tool = "community";
      ctx.threadTitle = action.title;
    } else if (action.actionType === "create_content") {
      tool = "blueprint";
      ctx.query = action.title;
    } else if (
      action.title.toLowerCase().includes("competitor") ||
      action.title.toLowerCase().includes("vs") ||
      action.title.toLowerCase().includes("alternative")
    ) {
      tool = "displacement";
    }

    setToolkitTool(tool);
    setToolkitContext(ctx);
    setIsToolkitOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setIsPriorityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAction = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return <ActionsSkeleton />;
  }

  const rawActions = audit?.actions ?? [];
  const actions = rawActions.map((a) => ({
    ...a,
    isCompleted: a.isCompleted || completedIds.has(a.id),
  }));

  const filteredActions = actions.filter((a) => {
    if (priorityFilter === "all") return true;
    return a.priority === priorityFilter;
  });

  const totalActions = actions.length;
  const completedCount = actions.filter((a) => a.isCompleted).length;
  const completionPercentage = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;
  const highPriorityCount = actions.filter((a) => a.priority === "high" && !a.isCompleted).length;

  const priorityCounts = {
    all: actions.length,
    high: actions.filter((a) => a.priority === "high").length,
    medium: actions.filter((a) => a.priority === "medium").length,
    low: actions.filter((a) => a.priority === "low").length,
  };

  const priorityConfigs: {
    id: "all" | "high" | "medium" | "low";
    label: string;
    count: number;
    dotColor: string;
    desc: string;
  }[] = [
    {
      id: "all",
      label: t("actionsTab.filterAll"),
      count: priorityCounts.all,
      dotColor: "bg-emerald-500",
      desc: "All recommended optimization tasks",
    },
    {
      id: "high",
      label: t("actionsTab.filterHigh"),
      count: priorityCounts.high,
      dotColor: "bg-red-500",
      desc: "Immediate GEO ranking impact items",
    },
    {
      id: "medium",
      label: t("actionsTab.filterMedium"),
      count: priorityCounts.medium,
      dotColor: "bg-amber-500",
      desc: "Foundational citations and domain authority",
    },
    {
      id: "low",
      label: t("actionsTab.filterLow"),
      count: priorityCounts.low,
      dotColor: "bg-blue-500",
      desc: "Long-term monitoring and brand hygiene",
    },
  ];

  const activePriorityConfig = priorityConfigs.find((p) => p.id === priorityFilter) || priorityConfigs[0];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="syn-badge syn-badge-red">{t("actionsTab.filterHigh")}</span>;
      case "medium":
        return <span className="syn-badge syn-badge-amber">{t("actionsTab.filterMedium")}</span>;
      default:
        return <span className="syn-badge syn-badge-neutral">{t("actionsTab.filterLow")}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-mono tracking-widest text-[var(--syn-subtle)] uppercase mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("actionsTab.badgeCategory")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--syn-heading)]">
            {t("actionsTab.title")}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--syn-muted)] mt-1 max-w-2xl">
            {t("actionsTab.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Live Studio Button */}
          <button
            type="button"
            onClick={() => {
              setToolkitTool("llmstxt");
              setToolkitContext({});
              setIsToolkitOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#86EFAC] text-neutral-950 font-extrabold text-xs shadow-md hover:bg-[#86EFAC]/90 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-neutral-950" />
            <span>{t("actionsTab.openStudioBtn")}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-neutral-950/10 text-[10px] font-mono uppercase font-bold">{t("actionsTab.liveBadge")}</span>
          </button>

          {/* Sleek Priority Filter Dropdown */}
          {actions.length > 0 && (
            <div ref={priorityDropdownRef} className="relative shrink-0 flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={() => setIsPriorityDropdownOpen((prev) => !prev)}
                className={`w-full sm:w-auto flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-[var(--syn-card)] border-2 transition-all cursor-pointer shadow-xs select-none ${
                  isPriorityDropdownOpen
                    ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : priorityFilter !== "all"
                    ? "border-emerald-500/50 bg-emerald-500/[0.04]"
                    : "border-[var(--syn-border)] hover:border-emerald-500/50 hover:bg-[var(--syn-card-subtle)]"
                }`}
              >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 transition-colors ${
                    priorityFilter !== "all"
                      ? "bg-[#86EFAC] text-neutral-950 shadow-xs"
                      : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-emerald-400"
                  }`}
                >
                  {priorityFilter === "all" ? (
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  ) : (
                    <span className={`w-2.5 h-2.5 rounded-full ${activePriorityConfig.dotColor}`} />
                  )}
                </div>

                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block leading-none">
                    Priority Filter
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-[var(--syn-heading)] capitalize">
                      {activePriorityConfig.label}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold">
                      {activePriorityConfig.count}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 shrink-0 ml-1 ${
                  isPriorityDropdownOpen ? "rotate-180 text-emerald-400" : ""
                }`}
              />
            </button>

            {/* Floating Popover */}
            {isPriorityDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-[280px] sm:w-[300px] max-h-[420px] overflow-y-auto rounded-2xl bg-[var(--syn-card)] border-2 border-[var(--syn-border)] shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[var(--syn-border)] mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold">
                    Filter by Priority
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    {actions.length} Tasks
                  </span>
                </div>

                <div className="space-y-1">
                  {priorityConfigs.map(({ id, label, count, dotColor, desc }) => {
                    const isSelected = priorityFilter === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setPriorityFilter(id);
                          setIsPriorityDropdownOpen(false);
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
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
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
      </div>

      {actions.length === 0 ? (
        /* Empty State */
        <div className="syn-card text-center py-16 flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ListTodo className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[var(--syn-heading)] mb-2">{t("actionsTab.noActionsTitle")}</h3>
          <p className="text-xs text-[var(--syn-muted)] max-w-sm mb-6">
            {t("actionsTab.noActionsDesc")}
          </p>
          <Link href="/dashboard" className="syn-btn-primary">
            <ArrowLeft className="w-4 h-4" /> {t("nav.overview")}
          </Link>
        </div>
      ) : (
        <>
          {/* ── Top Bento KPI Metrics ─────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* KPI 1: Total Tasks Progress */}
            <div className="syn-card flex flex-col justify-between h-[200px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
                  {t("actionsTab.totalTasks")}
                </span>
                <span className="syn-badge syn-badge-emerald">{t("common.statusLive")}</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight text-[var(--syn-heading)] mb-2 font-mono">
                  {completedCount} <span className="text-lg font-bold text-[var(--syn-muted)]">/ {totalActions} {t("actionsTab.actionStatusDone")}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--syn-muted)] mb-2">
                  <span>
                    <strong className="text-[var(--syn-heading)] block text-xs font-mono">{highPriorityCount}</strong> {t("actionsTab.highPriorityPending")}
                  </span>
                  <span className="text-right">
                    <strong className="text-[var(--syn-heading)] block text-xs font-mono">{completionPercentage}%</strong> {t("actionsTab.impactProjected")}
                  </span>
                </div>
                <TickProgressBar percentage={completionPercentage} accentColor="#10B981" />
              </div>
            </div>

            {/* KPI 2: Completion Gauge */}
            <div className="syn-card flex flex-col justify-between h-[200px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  {t("actionsTab.impactProjected")}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center -mt-2">
                <SemiCircleGauge value={completionPercentage} size={170} strokeWidth={11} color="#22C55E" />
              </div>
            </div>

            {/* KPI 3: Priority Breakdown */}
            <div className="syn-card flex flex-col justify-between h-[200px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {t("actionsTab.badgeCategory")}
                </span>
              </div>
              <div className="space-y-3 my-auto">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--syn-heading)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> {t("actionsTab.categoryCommunity")}
                  </span>
                  <span className="syn-badge syn-badge-red">{t("actionsTab.filterHigh")}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--syn-heading)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> {t("actionsTab.categoryPR")}
                  </span>
                  <span className="syn-badge syn-badge-amber">{t("actionsTab.filterMedium")}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--syn-heading)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("actionsTab.categoryTechnical")}
                  </span>
                  <span className="syn-badge syn-badge-emerald">SEO</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Action Cards Grid ────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-[var(--syn-heading)]">
                  {t("actionsTab.title")}
                </h3>
                <span className="syn-badge syn-badge-emerald font-mono text-xs">
                  {filteredActions.length}
                </span>
                {priorityFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setPriorityFilter("all")}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all cursor-pointer shadow-xs ml-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t("actionsTab.resetFilter")}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredActions.map((action) => (
                <div
                  key={action.id}
                  className={`syn-card p-5 transition-all ${
                    action.isCompleted ? "opacity-60 bg-[var(--syn-card-subtle)]" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Circular Interactive Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleAction(action.id)}
                      className="mt-0.5 shrink-0 text-[var(--syn-subtle)] hover:text-emerald-500 transition-colors cursor-pointer"
                      aria-label={action.isCompleted ? t("actionsTab.markPending") : t("actionsTab.markComplete")}
                    >
                      {action.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-6 h-6 text-[var(--syn-subtle)] hover:text-[var(--syn-muted)]" />
                      )}
                    </button>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            action.isCompleted ? "line-through text-[var(--syn-muted)]" : "text-[var(--syn-heading)]"
                          }`}
                        >
                          {action.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="syn-badge syn-badge-neutral capitalize">
                            {action.actionType.replace("_", " ")}
                          </span>
                          {getPriorityBadge(action.priority)}
                        </div>
                      </div>

                      <p className="text-xs text-[var(--syn-muted)] leading-relaxed max-w-3xl">
                        {action.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openToolkitForAction(action)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#86EFAC]/15 hover:bg-[#86EFAC]/25 text-emerald-500 border border-emerald-500/30 transition-all cursor-pointer shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-emerald-500" />
                          <span>{t("actionsTab.generateWithAi")}</span>
                        </button>

                        {action.targetUrl && (
                          <a
                            href={action.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--syn-heading)] hover:text-emerald-400 transition-colors"
                          >
                            {t("sourcesTab.claimCitation")} <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Live GEO Optimization Studio Modal ────────────────────── */}
      <GeoToolkitModal
        isOpen={isToolkitOpen}
        onClose={() => setIsToolkitOpen(false)}
        initialTool={toolkitTool}
        initialContext={toolkitContext}
        key={`${toolkitTool}-${JSON.stringify(toolkitContext)}`}
      />
    </div>
  );
}
