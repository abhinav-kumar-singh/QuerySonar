"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { SupportedLanguage, LanguageMeta } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "compact" | "grid" | "dropdown";
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant,
  compact,
  className,
}: LanguageSwitcherProps) {
  const effectiveVariant = variant || (compact ? "compact" : "compact");
  const { language, setLanguage, supportedLanguages, currentLanguageMeta, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Grid layout for Settings Page (Legacy/alternative)
  if (effectiveVariant === "grid") {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
        {supportedLanguages.map((lang: LanguageMeta) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer",
                isSelected
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shadow-sm"
                  : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:border-black/20 dark:hover:border-white/20 text-[var(--syn-heading)]"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0 select-none">{lang.flag}</span>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold truncate leading-tight">
                    {lang.nativeName}
                  </span>
                  <span className="text-[10px] text-[var(--syn-muted)] truncate">
                    {lang.name}
                  </span>
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 ml-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Standard Dropdown variant (styled to match ThemeSwitcher in header & settings)
  if (effectiveVariant === "dropdown") {
    return (
      <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t("common.selectLanguage") || "Change language"}
          aria-expanded={isOpen}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isOpen && "ring-2 ring-primary/30 border-primary/40 bg-muted"
          )}
        >
          <span className="text-base select-none">{currentLanguageMeta.flag}</span>
          <span className="font-medium text-foreground hidden sm:inline">
            {currentLanguageMeta.nativeName}
          </span>
          <span className="font-bold text-[11px] uppercase tracking-wider text-foreground sm:hidden">
            {currentLanguageMeta.code}
          </span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 opacity-60 transition-transform duration-200 ml-0.5",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute right-0 mt-2 w-52 rounded-2xl p-1.5 z-50 shadow-2xl border backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-150",
              "bg-card border-border text-foreground"
            )}
          >
            <div className="px-3 py-2 mb-1 border-b border-border flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{t("common.selectLanguage") || "Select Language"}</span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar">
              {supportedLanguages.map((lang: LanguageMeta) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-lg select-none">{lang.flag}</span>
                      <div className="flex flex-col truncate leading-tight">
                        <span className="truncate text-xs font-semibold">{lang.nativeName}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {lang.name}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact dropdown for Header & Navbars
  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        aria-expanded={isOpen}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all text-xs font-semibold cursor-pointer select-none",
          "bg-[var(--syn-card-subtle,rgba(0,0,0,0.03))] hover:bg-[var(--syn-card-inner,rgba(0,0,0,0.06))] border-[var(--syn-border,rgba(0,0,0,0.08))] text-[var(--syn-heading,#111827)]"
        )}
      >
        <span className="text-sm select-none">{currentLanguageMeta.flag}</span>
        <span className="text-[11px] uppercase tracking-wider font-bold">
          {currentLanguageMeta.code}
        </span>
        <ChevronDown
          className={cn(
            "w-3 h-3 opacity-60 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-48 rounded-2xl p-1.5 z-50 shadow-xl border backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150",
            "bg-[var(--syn-card,white)] border-[var(--syn-border,rgba(0,0,0,0.1))] text-[var(--syn-heading,#111827)]"
          )}
        >
          <div className="px-2.5 py-1.5 mb-1 border-b border-[var(--syn-border)] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--syn-muted)]">
            <Globe className="w-3 h-3" />
            <span>{t("common.selectLanguage") || "Select Language"}</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {supportedLanguages.map((lang: LanguageMeta) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer",
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[var(--syn-heading)]"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base select-none">{lang.flag}</span>
                    <div className="flex flex-col truncate leading-tight">
                      <span className="truncate">{lang.nativeName}</span>
                      <span className="text-[10px] text-[var(--syn-muted)] font-normal">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
