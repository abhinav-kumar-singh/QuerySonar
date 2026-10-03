"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuditData } from "@/lib/audit-storage";
import {
  Trophy,
  Lock,
  ArrowUpRight,
  Sparkles,
  Search,
  TrendingUp,
  AlertTriangle,
  Layers,
  Zap,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { SemiCircleGauge } from "../components/gauge";
import { useTranslation } from "@/lib/i18n/language-context";

function CompetitorsSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      {/* KPI Skeletons (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
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

      {/* Consensus Ranking Matrix Skeleton */}
      <div className="syn-card flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--syn-border)]">
          <div className="space-y-1.5">
            <div className="w-64 h-5 syn-skeleton rounded-md" />
            <div className="w-96 h-3 syn-skeleton rounded-md" />
          </div>
          <div className="w-32 h-4 syn-skeleton rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col justify-between gap-4 h-[190px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 syn-skeleton rounded-xl" />
                  <div className="flex gap-1.5">
                    <div className="w-10 h-4 syn-skeleton rounded-full" />
                    <div className="w-10 h-4 syn-skeleton rounded-full" />
                  </div>
                </div>
                <div className="w-40 h-5 syn-skeleton rounded-md" />
                <div className="w-full h-3 syn-skeleton rounded-md" />
              </div>
              <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between">
                <div className="w-24 h-3 syn-skeleton rounded-md" />
                <div className="w-28 h-6 syn-skeleton rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompetitorsPage() {
  const { audit } = useAuditData();
  const { t } = useTranslation();
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // Initialize and sync current plan from localStorage and API
  useEffect(() => {
    try {
      const saved = localStorage.getItem("georadar_test_plan");
      if (saved) {
        const p = saved.toUpperCase();
        if (p === "STARTER") setUserPlan("GROWTH");
        else if (p === "PRO" || p === "AGENCY") setUserPlan("ENTERPRISE");
        else if (["FREE", "GROWTH", "ENTERPRISE"].includes(p)) setUserPlan(p);
      }
    } catch {}

    function handlePlanEvent(e: Event) {
      const customEvent = e as CustomEvent<{ plan?: string }>;
      const newPlan = (customEvent.detail?.plan || "FREE").toUpperCase();
      let resolved = newPlan;
      if (newPlan === "STARTER") resolved = "GROWTH";
      else if (newPlan === "PRO" || newPlan === "AGENCY") resolved = "ENTERPRISE";
      setUserPlan(resolved);
      setIsLoadingPlan(false);
    }

    window.addEventListener("georadar_plan_updated", handlePlanEvent);

    fetch("/api/user/plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.plan) {
          const p = data.plan.toUpperCase();
          if (p === "STARTER") setUserPlan("GROWTH");
          else if (p === "PRO" || p === "AGENCY") setUserPlan("ENTERPRISE");
          else setUserPlan(p);
        }
      })
      .finally(() => setIsLoadingPlan(false));

    return () => {
      window.removeEventListener("georadar_plan_updated", handlePlanEvent);
    };
  }, []);

  const isPaidPlan = ["GROWTH", "STARTER", "ENTERPRISE", "PRO", "AGENCY"].includes(userPlan);
  const brandName = audit?.brandProfile?.name || "Your Brand";
  const topCompetitors = audit?.topCompetitors ?? [];
  const mentionAnalyses = audit?.mentionAnalyses ?? [];

  // Metrics calculation
  const totalCompetitors = topCompetitors.length;
  const brandMentionCount = mentionAnalyses.filter((m) => m.brandMentioned).length;
  const totalAnalyses = mentionAnalyses.length;
  const brandWinRate = totalAnalyses > 0 ? Math.round((brandMentionCount / totalAnalyses) * 100) : 0;
  const dominantCompetitor = topCompetitors[0]?.name || "N/A";
  const displacementRate = totalCompetitors > 0 && brandWinRate < 100 ? 100 - brandWinRate : 0;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-300">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-mono tracking-widest text-[var(--syn-muted)] uppercase mb-1 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            {t("competitorsTab.badgeCategory")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--syn-heading)]">
            {t("competitorsTab.title")}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--syn-muted)] mt-1 max-w-2xl">
            {t("competitorsTab.subtitle")}
          </p>
        </div>

        {/* Current Tier Badge */}
        <div className="flex items-center gap-2">
          {isLoadingPlan ? (
            <div className="w-28 h-7 syn-skeleton rounded-full" />
          ) : isPaidPlan ? (
            <span className="syn-badge syn-badge-emerald py-1 px-3 text-xs">
              <Sparkles className="w-3.5 h-3.5 fill-emerald-400" />
              {userPlan} Active
            </span>
          ) : (
            <Link
              href="/dashboard/settings?tab=billing"
              className="syn-badge syn-badge-amber py-1 px-3 text-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              {t("common.free")} (Locked)
            </Link>
          )}
        </div>
      </div>

      {/* ── State 1: Shimmer Skeleton during Plan Verification ─────── */}
      {isLoadingPlan ? (
        <CompetitorsSkeleton />
      ) : !isPaidPlan ? (
        /* ════════════════════════════════════════════════════════════════
           STATE 2: FREE TIER UPGRADE PAYWALL GATE CARD
           ════════════════════════════════════════════════════════════════ */
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Main Upgrade Hero Card */}
          <div className="syn-card !p-8 sm:!p-12 relative overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-[var(--syn-card)] to-[var(--syn-card-subtle)] text-center flex flex-col items-center shadow-xl">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5 shadow-sm">
              <Lock className="w-7 h-7" />
            </div>

            <span className="syn-badge syn-badge-amber mb-3 text-xs font-mono uppercase tracking-wider">
              {t("competitorsTab.proBadge")}
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--syn-heading)] max-w-xl leading-tight">
              {t("competitorsTab.upgradeTitle")}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--syn-muted)] mt-3 max-w-2xl leading-relaxed">
              {t("competitorsTab.upgradeSubtitle")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl my-8 text-left">
              <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-[var(--syn-heading)] block">
                  {t("competitorsTab.feature1Title")}
                </strong>
                <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                  {t("competitorsTab.feature1Desc")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-[var(--syn-heading)] block">
                  {t("competitorsTab.feature2Title")}
                </strong>
                <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                  {t("competitorsTab.feature2Desc")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-[var(--syn-heading)] block">
                  {t("competitorsTab.feature3Title")}
                </strong>
                <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                  {t("competitorsTab.feature3Desc")}
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/settings?tab=billing"
              className="syn-btn-primary !px-8 !py-3 !text-sm !font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-neutral-950 text-neutral-950" />
              {t("competitorsTab.upgradeBtn")}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Frosted / Blurred Teaser Preview */}
          <div className="relative rounded-3xl overflow-hidden border border-[var(--syn-border)] opacity-60 pointer-events-none select-none">
            <div className="p-6 bg-[var(--syn-card)] filter blur-[3px]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "Market Leader Alpha", rank: 1, bestFor: "Enterprise scalability" },
                  { name: "Competitor Beta", rank: 2, bestFor: "Affordable SMB teams" },
                  { name: "Cloud Suite Gamma", rank: 3, bestFor: "Advanced AI automation" },
                ].map((c) => (
                  <div key={c.name} className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)]">
                    <strong className="text-sm font-bold block text-[var(--syn-heading)]">{c.name}</strong>
                    <span className="text-xs text-[var(--syn-muted)]">Rank #{c.rank} in AI consensus</span>
                    <span className="syn-badge syn-badge-neutral mt-2 text-xs">{c.bestFor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════════
           STATE 3: PAID PLAN FULL COMPETITOR INTELLIGENCE DASHBOARD
           ════════════════════════════════════════════════════════════════ */
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          {/* Top Bento KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* KPI 1: Dominant Competitor */}
            <div className="syn-card flex flex-col justify-between h-[180px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  {t("competitorsTab.topDisplacer")}
                </span>
                <span className="syn-badge syn-badge-amber text-[10px]">Rank #1</span>
              </div>
              <div>
                <strong className="text-xl sm:text-2xl font-extrabold text-[var(--syn-heading)] block truncate">
                  {dominantCompetitor}
                </strong>
                <span className="text-[11px] text-[var(--syn-muted)] mt-1 block">
                  {t("competitorsTab.consensusSubtitle")}
                </span>
              </div>
            </div>

            {/* KPI 2: Total Rivals Tracked */}
            <div className="syn-card flex flex-col justify-between h-[180px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  {t("competitorsTab.totalCompetitorsTracked")}
                </span>
                <span className="syn-badge syn-badge-emerald text-[10px]">{t("common.statusLive")}</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-[var(--syn-heading)]">
                  {totalCompetitors}
                </div>
                <span className="text-[11px] text-[var(--syn-muted)] mt-1 block">
                  {t("common.allEngines")}
                </span>
              </div>
            </div>

            {/* KPI 3: Displacement Index */}
            <div className="syn-card flex flex-col justify-between h-[180px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  {t("competitorsTab.displacementRate")}
                </span>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-mono text-[var(--syn-heading)]">
                  {displacementRate}%
                </div>
                <span className="text-[11px] text-[var(--syn-muted)] mt-1 block">
                  {t("competitorsTab.consensusSubtitle")}
                </span>
              </div>
            </div>

            {/* KPI 4: Brand Win Rate */}
            <div className="syn-card flex flex-col justify-between h-[180px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {t("competitorsTab.brandWinRate")}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center -mt-2">
                <SemiCircleGauge value={brandWinRate} size={150} strokeWidth={10} color="#22C55E" />
              </div>
            </div>
          </div>

          {/* ── Competitor Ranking Cards ─────────────────────────────── */}
          <div className="syn-card flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--syn-border)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--syn-heading)] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  {t("competitorsTab.consensusTitle")}
                </h3>
                <p className="text-xs text-[var(--syn-muted)] mt-0.5">
                  {t("competitorsTab.consensusSubtitle")}
                </p>
              </div>
              <span className="text-xs font-mono text-[var(--syn-muted)]">
                {topCompetitors.length} {t("competitorsTab.totalCompetitorsTracked")}
              </span>
            </div>

            {topCompetitors.length === 0 ? (
              <div className="text-center py-12 text-[var(--syn-muted)] text-xs">
                <Search className="w-8 h-8 mx-auto mb-2 text-[var(--syn-subtle)]" />
                {t("competitorsTab.noCompetitorsDesc")}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {topCompetitors.map((comp, idx) => (
                  <div
                    key={comp.name + idx}
                    className="p-5 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] hover:border-[var(--syn-border-hover)] transition-all flex flex-col justify-between gap-4 relative group shadow-sm"
                  >
                    <div>
                      {/* Top Bar: Rank and Engine Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold font-mono text-xs flex items-center justify-center">
                          #{comp.rank ?? idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {(comp.mentionedByEngines ?? ["gemini", "openai", "perplexity"]).map((eng) => (
                            <span
                              key={eng}
                              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] text-[var(--syn-muted)] uppercase"
                            >
                              {eng === "openai" ? "GPT" : eng}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Name & Positioning */}
                      <h4 className="text-base font-bold text-[var(--syn-heading)] group-hover:text-emerald-400 transition-colors">
                        {comp.name}
                      </h4>
                      <p className="text-xs text-[var(--syn-muted)] mt-1 leading-relaxed">
                        {comp.reason || "Shortlisted by AI search models based on authoritative category presence."}
                      </p>
                    </div>

                    {/* Footer: AI Positioning Tag */}
                    <div className="pt-3 border-t border-[var(--syn-border)] flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] text-[var(--syn-subtle)] font-mono uppercase tracking-wider">
                        <span>{t("competitorsTab.badgeCategory")}</span>
                      </div>
                      <div
                        className="inline-flex items-start gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] text-xs text-[var(--syn-heading)] font-medium leading-relaxed"
                        title={comp.bestFor || "Category Leader"}
                      >
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">🎯</span>
                        <span className="break-words">{comp.bestFor || "Category Leader"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Head-to-Head Comparison Matrix ────────────────────────── */}
          <div className="syn-card overflow-hidden">
            <div className="pb-4 border-b border-[var(--syn-border)] mb-4">
              <h3 className="text-lg font-bold text-[var(--syn-heading)]">
                {t("competitorsTab.headToHeadTitle")} ({brandName})
              </h3>
              <p className="text-xs text-[var(--syn-muted)] mt-0.5">
                {t("competitorsTab.headToHeadSubtitle")}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--syn-border)] text-[var(--syn-muted)] font-mono uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">{t("competitorsTab.colCompetitor")}</th>
                    <th className="pb-3 font-semibold">{t("dashboard.matrixColPosition")}</th>
                    <th className="pb-3 font-semibold">{t("competitorsTab.feature2Title")}</th>
                    <th className="pb-3 font-semibold">{t("competitorsTab.colEngines")}</th>
                    <th className="pb-3 font-semibold text-right">{t("dashboard.matrixColStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--syn-border)] text-[var(--syn-text)]">
                  {/* Your Brand Row */}
                  <tr className="bg-emerald-500/[0.04]">
                    <td className="py-3.5 font-bold text-[var(--syn-heading)] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {brandName} ({t("dashboard.brandName")})
                    </td>
                    <td className="py-3.5 font-mono font-bold text-emerald-400">
                      {brandMentionCount > 0 ? t("dashboard.mentioned") : t("dashboard.notMentioned")}
                    </td>
                    <td className="py-3.5 text-[var(--syn-muted)]">
                      {t("landing.scoreLabel")}
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-[var(--syn-muted)]">
                      {brandMentionCount} / {totalAnalyses} {t("common.allEngines")}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="syn-badge syn-badge-emerald text-[10px]">
                        Target
                      </span>
                    </td>
                  </tr>

                  {/* Competitor Rows */}
                  {topCompetitors.map((comp, idx) => (
                    <tr key={comp.name + idx} className="hover:bg-[var(--syn-card-subtle)] transition-colors">
                      <td className="py-3.5 font-semibold text-[var(--syn-heading)]">
                        {comp.name}
                      </td>
                      <td className="py-3.5 font-mono text-[var(--syn-muted)]">
                        #{comp.rank ?? idx + 1}
                      </td>
                      <td className="py-3.5 text-[var(--syn-muted)]">
                        {comp.bestFor || "Category contender"}
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-[var(--syn-muted)] uppercase">
                        {(comp.mentionedByEngines ?? ["gemini", "openai"]).join(", ")}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="syn-badge syn-badge-amber text-[10px]">
                          {t("competitorsTab.colCompetitor")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
