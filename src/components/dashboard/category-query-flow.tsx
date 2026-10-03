"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Tag,
  Check,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";

export interface CategoryItem {
  id: string;
  name: string;
  isAutoSelected: boolean;
  confidence?: number;
}

export interface PromptItem {
  id: string;
  categoryTag: string;
  queryText: string;
  type?: string;
  personaLabel?: string;
}

interface CategoryQueryFlowProps {
  brandName: string;
  websiteUrl?: string;
  targetLocation?: string;
  categories: CategoryItem[];
  prompts: PromptItem[];
  brandSummary?: string;
  detectedCompetitors?: string[];
  maxCategories?: number;
  initialStep?: "categories" | "prompts";
  onExpansionChange?: (expanded: boolean) => void;
  onPromptsChange: (prompts: PromptItem[]) => void;
  onLaunchAudit?: () => void;
  isScanning?: boolean;
}

export function CategoryQueryFlow({
  brandName,
  websiteUrl,
  targetLocation,
  categories: initialCategories,
  prompts: initialPrompts,
  brandSummary,
  detectedCompetitors = [],
  maxCategories = 5,
  initialStep,
  onExpansionChange,
  onPromptsChange,
  onLaunchAudit,
  isScanning = false,
}: CategoryQueryFlowProps) {
  const { t } = useTranslation();

  // Step state: "categories" (Select Tags) | "prompts" (Expanded 70% Prompts View)
  const [step, setStep] = useState<"categories" | "prompts">(
    initialStep || (initialPrompts.length > 0 ? "prompts" : "categories")
  );

  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(() => {
    const selected = initialCategories.filter((c) => c.isAutoSelected).map((c) => c.name);
    return selected.length > 0
      ? selected.slice(0, maxCategories)
      : initialCategories.slice(0, Math.min(4, maxCategories)).map((c) => c.name);
  });

  const [prompts, setPrompts] = useState<PromptItem[]>(initialPrompts);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // Keep parent drawer informed of expansion requirement
  React.useEffect(() => {
    if (step === "prompts" || isGeneratingPrompts) {
      onExpansionChange?.(true);
    } else {
      onExpansionChange?.(false);
    }
  }, [step, isGeneratingPrompts, onExpansionChange]);

  // Inline editing state
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Adding custom prompt state
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [customText, setCustomText] = useState("");

  const handleToggleCategory = (catName: string) => {
    if (selectedCategoryNames.includes(catName)) {
      setSelectedCategoryNames(selectedCategoryNames.filter((n) => n !== catName));
    } else {
      if (selectedCategoryNames.length >= maxCategories) return;
      setSelectedCategoryNames([...selectedCategoryNames, catName]);
    }
  };

  const handleGeneratePromptsFromCategories = async () => {
    if (selectedCategoryNames.length === 0) return;
    // Trigger smooth 70% width expansion immediately as generation starts
    onExpansionChange?.(true);
    setIsGeneratingPrompts(true);
    setGenerationError("");

    try {
      const res = await fetch("/api/queries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          websiteUrl,
          targetLocation: targetLocation?.trim() || undefined,
          selectedCategories: selectedCategoryNames,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate category prompts");
      }

      const generated: PromptItem[] = data.data.prompts || [];
      setPrompts(generated);
      onPromptsChange(generated);
      setStep("prompts");
    } catch (err: unknown) {
      setGenerationError(err instanceof Error ? err.message : "Failed to generate prompts");
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const handleStartEditPrompt = (prompt: PromptItem) => {
    setEditingPromptId(prompt.id);
    setEditText(prompt.queryText);
  };

  const handleSaveEditPrompt = (id: string) => {
    if (!editText.trim()) return;
    const updated = prompts.map((p) => (p.id === id ? { ...p, queryText: editText.trim() } : p));
    setPrompts(updated);
    onPromptsChange(updated);
    setEditingPromptId(null);
    setEditText("");
  };

  const handleDeletePrompt = (id: string) => {
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    onPromptsChange(updated);
  };

  const handleAddCustomPrompt = () => {
    if (!customText.trim()) return;
    const newPrompt: PromptItem = {
      id: `custom-${Date.now()}`,
      categoryTag: customTag.trim() || selectedCategoryNames[0] || "Custom Category",
      queryText: customText.trim(),
      type: "discovery",
      personaLabel: customTag.trim() || "Custom Query",
    };
    const updated = [...prompts, newPrompt];
    setPrompts(updated);
    onPromptsChange(updated);
    setIsAddingCustom(false);
    setCustomTag("");
    setCustomText("");
  };

  // Color palette for category badges
  const getBadgeStyle = (idx: number) => {
    const styles = [
      "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400",
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
      "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
      "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
      "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
    ];
    return styles[idx % styles.length];
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Brand & Market Context Card */}
      {brandSummary && (
        <div className="p-3.5 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs leading-relaxed flex items-start gap-3 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--syn-muted)] block mb-0.5">
              {t("auditDrawer.marketTaxonomy")}
            </span>
            <p className="text-[var(--syn-heading)] text-xs leading-relaxed">{brandSummary}</p>
          </div>
        </div>
      )}

      {/* ── STEP 1: BUSINESS CATEGORIES MULTI-SELECT (Matching Image 1) ── */}
      {step === "categories" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)]">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs sm:text-sm font-bold text-[var(--syn-heading)]">
                {t("auditDrawer.selectCategories")} (up to {maxCategories})
              </h4>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                selectedCategoryNames.length >= maxCategories
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {selectedCategoryNames.length}/{maxCategories} {t("auditDrawer.selectedCount")}
            </span>
          </div>

          {/* Limit Reached Warning */}
          {selectedCategoryNames.length >= maxCategories && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs animate-in fade-in duration-200">
              <span className="font-bold shrink-0">{t("auditDrawer.limitReached")} ({maxCategories}/{maxCategories}):</span>
              <span className="text-[var(--syn-muted)] text-[11px] truncate">
                {t("auditDrawer.limitReachedDesc")}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const isSelected = selectedCategoryNames.includes(cat.name);
              const isMaxReached = selectedCategoryNames.length >= maxCategories;
              const isDisabled = !isSelected && isMaxReached;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    if (!isDisabled) {
                      handleToggleCategory(cat.name);
                    }
                  }}
                  aria-disabled={isDisabled}
                  title={
                    isDisabled
                      ? `Maximum ${maxCategories} categories reached. Deselect one to choose this.`
                      : isSelected
                      ? "Click to deselect"
                      : "Click to select"
                  }
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-150 select-none ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/50 text-[var(--syn-heading)] shadow-xs scale-[1.005] cursor-pointer"
                      : isDisabled
                      ? "bg-[var(--syn-card)]/40 border-[var(--syn-border)]/40 opacity-40 cursor-not-allowed text-[var(--syn-muted)]"
                      : "bg-[var(--syn-card)] border-[var(--syn-border)] text-[var(--syn-muted)] hover:border-[var(--syn-border-hover)] hover:text-[var(--syn-heading)] cursor-pointer"
                  }`}
                >
                  {/* Custom Styled Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "bg-[#86EFAC] text-neutral-950 font-bold shadow-xs"
                        : isDisabled
                        ? "border border-[var(--syn-border)]/40 bg-[var(--syn-card-inner)]/30 opacity-50"
                        : "border border-[var(--syn-border)] bg-[var(--syn-card-inner)]"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <span
                    className={`text-xs font-semibold leading-snug truncate ${
                      isSelected
                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                        : isDisabled
                        ? "text-[var(--syn-muted)]/70"
                        : "text-[var(--syn-heading)]"
                    }`}
                  >
                    {cat.name}
                  </span>

                  {isDisabled && (
                    <span className="ml-auto text-[9px] font-mono font-medium uppercase tracking-wider text-[var(--syn-muted)]/70 bg-[var(--syn-card-inner)] px-1.5 py-0.5 rounded border border-[var(--syn-border)]/40 shrink-0">
                      {t("auditDrawer.limitReached")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {generationError && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              {generationError}
            </div>
          )}

          {/* Generate Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleGeneratePromptsFromCategories}
              disabled={selectedCategoryNames.length === 0 || isGeneratingPrompts}
              className="px-5 py-2.5 rounded-xl bg-[#86EFAC] hover:bg-[#86EFAC]/90 text-neutral-950 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              {isGeneratingPrompts ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>{t("auditDrawer.synthesizingPrompts")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-neutral-950" />
                  <span>{t("auditDrawer.generatePromptsBtn")} ({selectedCategoryNames.length})</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: CATEGORY-GROUNDED PROMPT CARDS (Spacious 70% Width View) ── */}
      {step === "prompts" && (
        <div className="space-y-3.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[var(--syn-heading)]">
                {t("auditDrawer.categoryGroundedPrompts")} ({prompts.length})
              </span>
              <span className="text-[10px] font-mono text-[var(--syn-muted)]">
                {t("auditDrawer.unbrandedIntent")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("categories");
                onExpansionChange?.(false);
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("auditDrawer.editCategories")}</span>
            </button>
          </div>

          {/* List of Prompt Cards in 70% Spacious Width */}
          <div className="space-y-2.5">
            {prompts.map((p, idx) => {
              const isEditing = editingPromptId === p.id;
              return (
                <div
                  key={p.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-xs"
                >
                  {/* Category Badge Pill on Left */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 shrink-0 ${getBadgeStyle(
                        idx
                      )}`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>{p.categoryTag}</span>
                    </span>
                  </div>

                  {/* Query Text Body / Inline Editor (Unsquished, Ample Width) */}
                  <div className="flex-1 min-w-0 w-full px-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-500 bg-[var(--syn-card)] text-xs text-[var(--syn-heading)] outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEditPrompt(p.id);
                            if (e.key === "Escape") setEditingPromptId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditPrompt(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-neutral-950 text-xs font-bold hover:bg-emerald-400 cursor-pointer"
                        >
                          {t("common.save")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPromptId(null)}
                          className="px-3 py-1.5 rounded-lg border border-[var(--syn-border)] text-xs text-[var(--syn-muted)] hover:text-[var(--syn-heading)] cursor-pointer"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-[var(--syn-heading)] leading-relaxed font-medium">
                        {p.queryText}
                      </p>
                    )}
                  </div>

                  {/* Right Actions (Edit & Delete) */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleStartEditPrompt(p)}
                        className="p-1.5 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card)] transition-colors cursor-pointer"
                        title="Edit prompt text"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePrompt(p.id)}
                        className="p-1.5 rounded-lg text-[var(--syn-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete prompt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Custom Prompt Inline Option */}
          {isAddingCustom ? (
            <div className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-emerald-500/40 space-y-2.5 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-[var(--syn-heading)] block">
                {t("auditDrawer.addCustomPrompt")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder={t("auditDrawer.categoryTagPlaceholder")}
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--syn-border)] bg-[var(--syn-card)] text-xs text-[var(--syn-heading)] outline-none"
                />
                <input
                  type="text"
                  placeholder={t("auditDrawer.enterSearchQuestion")}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-[var(--syn-border)] bg-[var(--syn-card)] text-xs text-[var(--syn-heading)] outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-3 py-1 rounded-lg border border-[var(--syn-border)] text-xs text-[var(--syn-muted)] hover:text-[var(--syn-heading)] cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomPrompt}
                  disabled={!customText.trim()}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-neutral-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-40 cursor-pointer"
                >
                  {t("auditDrawer.addPromptBtn")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("auditDrawer.addCustomPrompt")}</span>
            </button>
          )}

          {/* Detected Competitors Footer */}
          {detectedCompetitors.length > 0 && (
            <div className="pt-2.5 border-t border-[var(--syn-border)] flex items-center gap-1.5 flex-wrap text-[11px] text-[var(--syn-muted)]">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {t("auditDrawer.detectedCategoryCompetitors")}
              </span>
              {detectedCompetitors.map((comp, cIdx) => (
                <span
                  key={cIdx}
                  className="px-2 py-0.5 rounded-md bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)] font-medium text-[10px]"
                >
                  {comp}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
