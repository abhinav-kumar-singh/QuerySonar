"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Radar,
  X,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  FileText,
  MapPin,
} from "lucide-react";
import { AIEngineRow } from "@/components/ui/ai-engine-icons";
import { useAuditData, AuditResult } from "@/lib/audit-storage";
import { useTranslation } from "@/lib/i18n/language-context";
import { PlaceAutocomplete } from "@/components/ui/place-autocomplete";
import {
  CategoryQueryFlow,
  CategoryItem,
  PromptItem,
} from "./category-query-flow";

const PLAN_LIMITS: Record<string, { maxBrands: number; maxQueries: number; label: string }> = {
  FREE: { maxBrands: 1, maxQueries: 4, label: "Free Plan" },
  STARTER: { maxBrands: 1, maxQueries: 8, label: "Starter Plan" },
  GROWTH: { maxBrands: 1, maxQueries: 8, label: "Starter Plan" },
  AGENCY: { maxBrands: 5, maxQueries: 20, label: "Agency Plan" },
  ENTERPRISE: { maxBrands: 10, maxQueries: 50, label: "Agency Enterprise" },
};

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditComplete?: (data: AuditResult) => void;
  initialBrandName?: string;
  initialWebsiteUrl?: string;
  initialTargetLocation?: string;
  isCreatingNewBrand?: boolean;
}

export function AuditDrawer({
  isOpen,
  onClose,
  onAuditComplete,
  initialBrandName = "",
  initialWebsiteUrl = "",
  initialTargetLocation = "",
  isCreatingNewBrand = false,
}: AuditDrawerProps) {
  const { audit, saveAudit } = useAuditData();
  const { t } = useTranslation();
  const [currentPlanKey, setCurrentPlanKey] = useState<string>("FREE");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load active plan from localStorage
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

  const [brandName, setBrandName] = useState(initialBrandName || (!isCreatingNewBrand ? audit?.brandProfile?.name || "" : ""));
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsiteUrl || (!isCreatingNewBrand ? audit?.brandProfile?.websiteUrl || "" : ""));
  const [targetLocation, setTargetLocation] = useState(initialTargetLocation || (!isCreatingNewBrand ? audit?.brandProfile?.targetLocation || "" : ""));
  const [queriesList, setQueriesList] = useState<string[]>([""]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanStage, setScanStage] = useState("");
  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false);
  const [autoQueryError, setAutoQueryError] = useState("");
  const [detectedCompetitors, setDetectedCompetitors] = useState<string[]>([]);
  const [brandSummary, setBrandSummary] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [useCategoryFlow, setUseCategoryFlow] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  // Sync initial brand profile if opened
  useEffect(() => {
    if (isOpen) {
      setIsDrawerExpanded(false);
      if (isCreatingNewBrand) {
        setBrandName(initialBrandName || "");
        setWebsiteUrl(initialWebsiteUrl || "");
        setTargetLocation(initialTargetLocation || "");
        setQueriesList([""]);
        setCategories([]);
        setPrompts([]);
        setUseCategoryFlow(false);
      } else if (audit?.brandProfile?.name) {
        setBrandName(audit.brandProfile.name);
        setWebsiteUrl(audit.brandProfile.websiteUrl || "");
        if (audit.brandProfile.targetLocation) {
          setTargetLocation(audit.brandProfile.targetLocation);
        }
        if (audit.mentionAnalyses && audit.mentionAnalyses.length > 0) {
          const uniqueQueries = Array.from(new Set(audit.mentionAnalyses.map((m) => m.query)));
          setQueriesList(uniqueQueries);
        }
      }
    }
  }, [isOpen, isCreatingNewBrand, audit, initialBrandName, initialWebsiteUrl, initialTargetLocation]);

  // Close on Escape key (disabled when creating new brand workspace to prevent accidental loss)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isCreatingNewBrand) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCreatingNewBrand, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  const handleDiscoverCategoriesAndPrompts = async () => {
    if (!brandName.trim()) return;
    setIsGeneratingCategories(true);
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
      setIsDrawerExpanded(false);

      if (discoveredPrompts.length > 0) {
        const queryTexts = discoveredPrompts.map((p) => p.queryText);
        setQueriesList(queryTexts);
      }
    } catch (err: unknown) {
      setAutoQueryError(err instanceof Error ? err.message : "Failed to discover categories");
    } finally {
      setIsGeneratingCategories(false);
    }
  };

  const handlePromptsChange = (newPrompts: PromptItem[]) => {
    setPrompts(newPrompts);
    if (newPrompts.length > 0) {
      setQueriesList(newPrompts.map((p) => p.queryText));
    }
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    const validQueries = queriesList.filter((q) => q.trim().length > 0);
    if (validQueries.length === 0) {
      setScanError("Please enter at least one search query to audit.");
      return;
    }

    setIsScanning(true);
    setScanError("");
    setScanStage(t("auditDrawer.auditStep1"));

    try {
      const t1 = setTimeout(() => setScanStage(t("auditDrawer.auditStep2")), 1200);
      const t2 = setTimeout(() => setScanStage(t("auditDrawer.auditStep3")), 3500);
      const t3 = setTimeout(() => setScanStage(t("auditDrawer.auditStep4")), 6500);

      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          targetLocation: targetLocation.trim() || undefined,
          queries: validQueries,
          category: category || (categories.find(c => c.isAutoSelected)?.name) || undefined,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Audit failed to execute.");
      }

      setScanStage(t("auditDrawer.auditStep5"));
      const resultData = await res.json();
      const auditResult: AuditResult = resultData.data;

      // Register / update workspace in database with detected/audit competitors
      try {
        const compsToSave = auditResult.brandProfile?.competitors?.length
          ? auditResult.brandProfile.competitors
          : auditResult.topCompetitors?.length
          ? auditResult.topCompetitors.map((c) => c.name)
          : detectedCompetitors.length > 0
          ? detectedCompetitors
          : [];

        await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: brandName.trim(),
            websiteUrl: websiteUrl.trim() || undefined,
            targetLocation: targetLocation.trim() || undefined,
            competitors: compsToSave,
          }),
        });
      } catch (err) {
        console.warn("Failed to register workspace record:", err);
      }

      saveAudit(auditResult);
      if (onAuditComplete) {
        onAuditComplete(auditResult);
      }
      onClose();
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : "Unknown scanning error occurred.");
    } finally {
      setIsScanning(false);
      setScanStage("");
    }
  };

  const isFormValid = brandName.trim() && queriesList.some((q) => q.trim().length > 0);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      aria-labelledby="audit-drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop - outside click disabled specifically for "Create Brand Workspace" modal popup */}
      <div
        className={`absolute inset-0 ${isCreatingNewBrand ? "cursor-default" : "cursor-pointer"}`}
        onClick={isCreatingNewBrand ? undefined : onClose}
      />

      {/* Drawer Container */}
      <div
        className={`relative z-10 w-full bg-[var(--syn-card)] border-l border-[var(--syn-border)] h-full flex flex-col shadow-2xl overflow-y-auto overscroll-contain transition-all duration-700 ease-in-out will-change-[width,max-width] animate-in slide-in-from-right ${
          isDrawerExpanded
            ? "md:w-[70vw] md:max-w-[70vw]"
            : "md:w-[32vw] md:max-w-xl min-w-[380px]"
        }`}
        style={{
          background: "var(--syn-card)",
          borderColor: "var(--syn-border)",
          color: "var(--syn-text)",
        }}
      >
        <div className="p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--syn-border)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#86EFAC]/20 border border-[#86EFAC]/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Radar className="h-5 w-5" />
              </div>
              <div>
                <h2 id="audit-drawer-title" className="font-extrabold text-base tracking-tight text-[var(--syn-heading)] block leading-none">
                  {isCreatingNewBrand ? t("auditDrawer.createBrandWorkspaceTitle") : t("auditDrawer.drawerTitle")}
                </h2>
                <span className="text-[10px] font-mono text-[var(--syn-muted)] uppercase tracking-wider">
                  {isCreatingNewBrand ? t("auditDrawer.newBrandAuditSubtitle") : t("landing.badge")}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-colors flex items-center justify-center cursor-pointer"
              aria-label={t("common.close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scanning Progress in Drawer (Top-Level) */}
          {isScanning && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--syn-card)] to-[var(--syn-card-inner)] border-2 border-emerald-500/40 text-xs flex flex-col gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {scanStage || t("auditDrawer.runningAuditBtn")}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  Live
                </span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full w-4/5 rounded-full animate-pulse" />
              </div>
              <p className="text-[11px] text-[var(--syn-muted)]">
                Simulating buyer interactions across 6 live AI engines.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRunAudit} className="flex flex-col gap-4">
            <div className={`space-y-3.5 transition-all duration-500 ${isDrawerExpanded ? "md:grid md:grid-cols-3 md:gap-3.5 md:space-y-0" : ""}`}>
              <div>
                <div className="flex items-center justify-between mb-1.5 h-[18px]">
                  <label className="text-xs font-bold text-[var(--syn-heading)] block">
                    {t("auditDrawer.brandLabel")} <span className="text-emerald-600 dark:text-emerald-400">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder={t("auditDrawer.brandPlaceholder")}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  disabled={isScanning}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--syn-border)] bg-[var(--syn-card-inner)] text-[var(--syn-heading)] text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-[var(--syn-subtle)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 h-[18px]">
                  <label className="text-xs font-bold text-[var(--syn-heading)] block">
                    {t("auditDrawer.websiteLabel")}
                  </label>
                </div>
                <input
                  type="text"
                  placeholder={t("auditDrawer.websitePlaceholder")}
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={isScanning}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--syn-border)] bg-[var(--syn-card-inner)] text-[var(--syn-heading)] text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-[var(--syn-subtle)]"
                />
              </div>

              {/* Target Location Autocomplete */}
              <div>
                <div className="flex items-center justify-between mb-1.5 h-[18px]">
                  <label className="text-xs font-bold text-[var(--syn-heading)] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{t("auditDrawer.targetLocationLabel")}</span>
                  </label>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    {t("auditDrawer.geoTargetedBadge")}
                  </span>
                </div>
                <PlaceAutocomplete
                  value={targetLocation}
                  onChange={(loc) => setTargetLocation(loc)}
                  disabled={isScanning}
                  label=""
                  sublabel=""
                  placeholder={t("auditDrawer.targetLocationPlaceholder")}
                />
              </div>
            </div>

            {/* Market Taxonomy & Category Discovery Button */}
            <div>
              <button
                type="button"
                onClick={handleDiscoverCategoriesAndPrompts}
                disabled={!brandName.trim() || isGeneratingCategories || isScanning}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer h-[42px] active:scale-[0.98]"
              >
                {isGeneratingCategories ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t("auditDrawer.analyzingProductVerticals")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                    <span>{t("auditDrawer.discoverCategoriesBtn")}</span>
                  </>
                )}
              </button>
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
                  initialStep={prompts.length > 0 && !isCreatingNewBrand ? "prompts" : "categories"}
                  onExpansionChange={setIsDrawerExpanded}
                  onPromptsChange={handlePromptsChange}
                />
              </div>
            ) : (
              /* Fallback Manual Queries List */
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--syn-heading)]">
                    {t("auditDrawer.queriesLabel")} ({queriesList.filter((q) => q.trim()).length}/{planConfig.maxQueries})
                  </label>
                  {queriesList.length < planConfig.maxQueries && (
                    <button
                      type="button"
                      onClick={handleAddQuery}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t("auditDrawer.addQuery")}</span>
                    </button>
                  )}
                </div>

                {queriesList.map((qVal, qIdx) => (
                  <div key={qIdx} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[10px] font-mono text-[var(--syn-muted)] flex items-center justify-center shrink-0">
                      {qIdx + 1}
                    </div>
                    <input
                      type="text"
                      placeholder={t("auditDrawer.queryPlaceholder")}
                      value={qVal}
                      onChange={(e) => handleQueryChange(qIdx, e.target.value)}
                      required={qIdx === 0}
                      disabled={isScanning}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-[var(--syn-border)] bg-[var(--syn-card-inner)] text-xs text-[var(--syn-heading)] focus:border-emerald-500 outline-none"
                    />
                    {queriesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuery(qIdx)}
                        className="p-1.5 text-[var(--syn-muted)] hover:text-red-500 cursor-pointer"
                        title={t("auditDrawer.removeQuery")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {scanError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                {scanError}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[var(--syn-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--syn-muted)]">{t("common.allEngines")}</span>
                <AIEngineRow size={16} />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--syn-muted)] hover:text-[var(--syn-heading)] cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isScanning}
                  className="px-6 py-2.5 rounded-xl bg-[#86EFAC] hover:bg-[#86EFAC]/90 text-neutral-950 text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t("common.loading")}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>{t("auditDrawer.startAuditBtn")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
