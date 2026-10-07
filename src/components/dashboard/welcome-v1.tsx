"use client";

import React from "react";
import {
  Radar,
  RotateCcw,
  Sparkles,
  Loader2,
  Clock,
  Activity,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { CategoryQueryFlow, CategoryItem, PromptItem } from "@/components/dashboard/category-query-flow";
import { PlaceAutocomplete } from "@/components/ui/place-autocomplete";

interface WelcomeV1Props {
  planConfig: {
    label: string;
    maxBrands: number;
    maxQueries: number;
  };
  sessionName: string;
  totalBrandsCount: number;
  brandName: string;
  setBrandName: (val: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (val: string) => void;
  targetLocation: string;
  setTargetLocation: (val: string) => void;
  queriesList: string[];
  setQueriesList: React.Dispatch<React.SetStateAction<string[]>>;
  categories: CategoryItem[];
  prompts: PromptItem[];
  detectedCompetitors: string[];
  brandSummary: string;
  category: string;
  useCategoryFlow: boolean;
  isGeneratingQueries: boolean;
  autoQueryError: string;
  suggestedQueries: Array<{ queryText: string; type: string; personaLabel: string }>;
  isScanning: boolean;
  scanProgress: number;
  scanStage: string;
  scanElapsed: number;
  scanError: string;
  handleResetForm: () => void;
  handleRunScan: (e: React.FormEvent) => Promise<void>;
  handleDiscoverCategoriesAndPrompts: () => Promise<void>;
  handlePromptsChange: (newPrompts: PromptItem[]) => void;
}

export function WelcomeOverviewV1({
  planConfig,
  sessionName,
  totalBrandsCount,
  brandName,
  setBrandName,
  websiteUrl,
  setWebsiteUrl,
  targetLocation,
  setTargetLocation,
  queriesList,
  setQueriesList,
  categories,
  prompts,
  detectedCompetitors,
  brandSummary,
  useCategoryFlow,
  isGeneratingQueries,
  autoQueryError,
  suggestedQueries,
  isScanning,
  scanProgress,
  scanStage,
  scanElapsed,
  scanError,
  handleResetForm,
  handleRunScan,
  handleDiscoverCategoriesAndPrompts,
  handlePromptsChange,
}: WelcomeV1Props) {
  const { t } = useTranslation();

  const handleAddQuery = () => {
    if (queriesList.length < planConfig.maxQueries) {
      setQueriesList((prev) => [...prev, ""]);
    }
  };

  const handleRemoveQuery = (index: number) => {
    if (queriesList.length > 1) {
      setQueriesList((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleQueryChange = (index: number, value: string) => {
    setQueriesList((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-mono tracking-widest text-[var(--syn-subtle)] uppercase mb-1">
            {t("dashboard.portfolioEyebrow")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--syn-heading)]">
            {t("dashboard.welcomeHeading", { name: sessionName || "Explorer" })}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--syn-muted)] mt-1 max-w-2xl">
            {t("dashboard.welcomeDesc")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs font-mono">
            <span className="text-[var(--syn-muted)]">{t("dashboard.activePlan")}: </span>
            <span className="font-bold text-[var(--syn-heading)]">{planConfig.label}</span>
          </div>
        </div>
      </div>

      {/* 4 Bento KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="syn-card flex flex-col justify-between h-[150px]">
          <div className="flex items-center justify-between text-xs text-[var(--syn-muted)] font-medium">
            <span>{t("dashboard.kpiTrackedBrands")}</span>
            <span className="syn-badge syn-badge-neutral">{planConfig.label}</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--syn-heading)] font-mono">
                {totalBrandsCount}
              </span>
              <span className="text-xs text-[var(--syn-subtle)]">
                {t("dashboard.ofActive", { max: planConfig.maxBrands })}
              </span>
            </div>
            <p className="text-xs text-[var(--syn-subtle)] mt-1">{t("dashboard.portfolioCoverage")}</p>
          </div>
        </div>

        <div className="syn-card flex flex-col justify-between h-[150px]">
          <div className="flex items-center justify-between text-xs text-[var(--syn-muted)] font-medium">
            <span>{t("dashboard.kpiAvgVisibility")}</span>
            <span className="syn-badge syn-badge-emerald">{t("dashboard.consensus")}</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--syn-heading)] font-mono">
                0%
              </span>
              <span className="text-xs text-[var(--syn-subtle)] font-semibold">{t("dashboard.shareOfVoice")}</span>
            </div>
            <p className="text-xs text-[var(--syn-subtle)] mt-1">{t("dashboard.weightedEngines")}</p>
          </div>
        </div>

        <div className="syn-card flex flex-col justify-between h-[150px]">
          <div className="flex items-center justify-between text-xs text-[var(--syn-muted)] font-medium">
            <span>{t("dashboard.kpiAuditedQueries")}</span>
            <span className="syn-badge syn-badge-neutral">{t("dashboard.clusters")}</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--syn-heading)] font-mono">
                0
              </span>
              <span className="text-xs text-[var(--syn-subtle)]">{t("dashboard.queriesMonitored")}</span>
            </div>
            <p className="text-xs text-[var(--syn-subtle)] mt-1">{t("dashboard.buyerProbes")}</p>
          </div>
        </div>

        <div className="syn-card flex flex-col justify-between h-[150px]">
          <div className="flex items-center justify-between text-xs text-[var(--syn-muted)] font-medium">
            <span>{t("dashboard.kpiAiCitations")}</span>
            <span className="syn-badge syn-badge-emerald">{t("dashboard.liveSources")}</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--syn-heading)] font-mono">
                0
              </span>
              <span className="text-xs text-[var(--syn-subtle)] font-semibold">{t("dashboard.groundedCitations")}</span>
            </div>
            <p className="text-xs text-[var(--syn-subtle)] mt-1">{t("dashboard.authorityDomains")}</p>
          </div>
        </div>
      </div>

      {/* Central Launchpad Card */}
      <div className="syn-card flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--syn-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#86EFAC]/20 border border-[#86EFAC]/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--syn-heading)]">
                {t("dashboard.launchBrandAudit")}
              </h2>
              <p className="text-xs text-[var(--syn-muted)]">
                {t("dashboard.probeEnginesDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="syn-badge syn-badge-emerald">{t("dashboard.enginesReady")}</span>
            <button
              type="button"
              onClick={handleResetForm}
              disabled={isScanning || (!brandName && !websiteUrl && queriesList.every((q) => !q.trim()) && suggestedQueries.length === 0)}
              className="syn-btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5 cursor-pointer hover:text-red-500 hover:border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Reset brand name, website URL, and all generated queries"
            >
              <RotateCcw className="w-3.5 h-3.5 opacity-60" />
              <span>{t("dashboard.resetFormBtn")}</span>
            </button>
          </div>
        </div>

        {/* Live AI Thinking & Engine Probe Banner */}
        {isScanning && (
          <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[var(--syn-card)] to-[var(--syn-card-inner)] border-2 border-emerald-500/40 shadow-xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-3 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500 dark:text-emerald-400" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      Live Multi-Engine AI Pipeline
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                      {Math.round(scanProgress)}% Completed
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--syn-heading)] font-mono mt-0.5">
                    {scanStage || "Probing multi-engine AI endpoints..."}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)] flex items-center gap-2 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-bold">{scanElapsed.toFixed(1)}s</span>
                  <span className="text-[var(--syn-muted)]">elapsed</span>
                </span>
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <div className="w-full bg-black/10 dark:bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-[var(--syn-border)]">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.min(scanProgress, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 relative z-10">
              {[
                { name: "ChatGPT", model: "GPT-4o", status: scanProgress > 30 ? "Analyzing" : "Probing" },
                { name: "Gemini", model: "2.0 Flash", status: scanProgress > 15 ? "Grounding" : "Connecting" },
                { name: "Perplexity", model: "Sonar Pro", status: scanProgress > 45 ? "Citations" : "Probing" },
                { name: "Claude", model: "3.7 Sonnet", status: scanProgress > 65 ? "Reasoning" : "Queued" },
                { name: "DeepSeek", model: "V3 Search", status: scanProgress > 75 ? "Consensus" : "Queued" },
                { name: "Grok", model: "Grok 3", status: scanProgress > 85 ? "Synthesizing" : "Queued" },
              ].map((engine) => (
                <div
                  key={engine.name}
                  className="p-2.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col gap-1 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--syn-heading)]">{engine.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--syn-muted)]">
                    <span className="font-mono">{engine.model}</span>
                    <span className="text-emerald-500 font-medium">{engine.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleRunScan} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-[var(--syn-heading)] block mb-1.5">
                {t("dashboard.brandName")} <span className="text-emerald-600 dark:text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder={t("dashboard.brandPlaceholder")}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                disabled={isScanning}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--syn-border)] bg-[var(--syn-card-inner)] text-[var(--syn-heading)] text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-[var(--syn-subtle)]"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-bold text-[var(--syn-heading)] block mb-1.5">
                {t("dashboard.domainUrl")} <span className="text-emerald-600 dark:text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder={t("dashboard.domainPlaceholder")}
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
                disabled={isScanning}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--syn-border)] bg-[var(--syn-card-inner)] text-[var(--syn-heading)] text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-[var(--syn-subtle)]"
              />
            </div>

            <div className="md:col-span-3">
              <PlaceAutocomplete
                value={targetLocation}
                onChange={(loc) => setTargetLocation(loc)}
                disabled={isScanning}
                label="Target Market / Place"
                sublabel=""
                placeholder="Search country, city, or region..."
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="button"
                onClick={handleDiscoverCategoriesAndPrompts}
                disabled={!brandName.trim() || isGeneratingQueries || isScanning}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer h-[42px] active:scale-[0.98]"
              >
                {isGeneratingQueries ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Product & Market Verticals...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                    <span>Discover Categories & Buyer Prompts</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {autoQueryError && (
            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
              {autoQueryError}
            </div>
          )}

          {/* Render 2-Step Category & Prompt Intelligence Flow */}
          {useCategoryFlow && categories.length > 0 ? (
            <div className="space-y-4 pt-1">
              <CategoryQueryFlow
                brandName={brandName}
                websiteUrl={websiteUrl}
                targetLocation={targetLocation}
                categories={categories}
                prompts={prompts}
                brandSummary={brandSummary}
                detectedCompetitors={detectedCompetitors}
                maxCategories={planConfig.maxQueries}
                onPromptsChange={handlePromptsChange}
              />
            </div>
          ) : (
            /* Fallback Manual Queries Section */
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--syn-heading)] flex items-center gap-2">
                  <span>{t("dashboard.buyerQueriesLabel")}</span>
                  <span className="text-[11px] font-normal text-[var(--syn-muted)]">
                    {t("dashboard.maxQueriesNotice", {
                      count: queriesList.filter((q) => q.trim()).length,
                      max: planConfig.maxQueries,
                      plan: planConfig.label,
                    })}
                  </span>
                </label>
                {queriesList.length < planConfig.maxQueries && (
                  <button
                    type="button"
                    onClick={handleAddQuery}
                    disabled={isScanning}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("dashboard.addQuery")}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {queriesList.map((query, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--syn-subtle)] w-6 text-center shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => handleQueryChange(index, e.target.value)}
                      placeholder={`e.g. Best enterprise software for product teams`}
                      disabled={isScanning}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--syn-border)] bg-[var(--syn-card-inner)] text-[var(--syn-heading)] text-xs placeholder:text-[var(--syn-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    />
                    {queriesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuery(index)}
                        disabled={isScanning}
                        className="p-2 text-[var(--syn-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engine Selector & Submit Row */}
          <div className="pt-4 border-t border-[var(--syn-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--syn-muted)] mr-1">{t("dashboard.enginesToProbe")}</span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)]">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                  ChatGPT
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  Gemini
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400">
                  Perplexity
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  Claude
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-600/15 text-blue-500">
                  DeepSeek
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-500/15 text-[var(--syn-heading)]">
                  Grok
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isScanning || !brandName.trim() || !websiteUrl.trim() || queriesList.every((q) => !q.trim())}
              className="syn-btn-primary !text-xs !py-3 !px-6 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 font-bold active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>{t("dashboard.auditingLive")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Launch Live Multi-Engine Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {scanError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            {scanError}
          </div>
        )}
      </div>
    </div>
  );
}
