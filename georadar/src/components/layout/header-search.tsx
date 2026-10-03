"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Sparkles,
  Zap,
  Globe,
  LayoutDashboard,
  Layers,
  Settings,
} from "lucide-react";
import { useAuditData } from "@/lib/audit-storage";
import { useTranslation } from "@/lib/i18n/language-context";

interface SearchResultItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ReactNode;
}

export function HeaderSearch() {
  const router = useRouter();
  const { audit } = useAuditData();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Build searchable index from current audit data and static navigation
  const allItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [
      {
        id: "page-dashboard",
        category: t("headerSearch.categoryPages"),
        title: t("nav.dashboard"),
        subtitle: t("dashboard.subtitle"),
        href: "/dashboard",
        icon: <LayoutDashboard className="w-3.5 h-3.5 text-cyan-500" />,
      },
      {
        id: "page-competitors",
        category: t("headerSearch.categoryPages"),
        title: t("nav.competitors"),
        subtitle: t("competitorsTab.subtitle"),
        href: "/dashboard/competitors",
        icon: <Layers className="w-3.5 h-3.5 text-emerald-500" />,
      },
      {
        id: "page-sources",
        category: t("headerSearch.categoryPages"),
        title: t("nav.sources"),
        subtitle: t("sourcesTab.subtitle"),
        href: "/dashboard/sources",
        icon: <Globe className="w-3.5 h-3.5 text-sky-500" />,
      },
      {
        id: "page-queries",
        category: t("headerSearch.categoryPages"),
        title: t("nav.queries"),
        subtitle: t("queriesTab.subtitle"),
        href: "/dashboard/queries",
        icon: <Sparkles className="w-3.5 h-3.5 text-purple-500" />,
      },
      {
        id: "page-actions",
        category: t("headerSearch.categoryPages"),
        title: t("nav.actions"),
        subtitle: t("actionsTab.subtitle"),
        href: "/dashboard/actions",
        icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
      },
      {
        id: "page-settings",
        category: t("headerSearch.categoryPages"),
        title: t("nav.settings"),
        subtitle: t("settings.subtitle"),
        href: "/dashboard/settings",
        icon: <Settings className="w-3.5 h-3.5 text-[var(--syn-muted)]" />,
      },
    ];

    // Add queries from audit
    const uniqueQueries = audit?.mentionAnalyses
      ? Array.from(new Set(audit.mentionAnalyses.map((m) => m.query)))
      : [];

    if (uniqueQueries.length > 0) {
      uniqueQueries.forEach((qText, idx) => {
        items.push({
          id: `query-${idx}`,
          category: t("headerSearch.categoryQueries"),
          title: qText,
          subtitle: `${t("dashboard.buyerQueriesTracked")} (${audit?.brandProfile.name || "Brand"})`,
          href: `/dashboard/queries`,
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-500" />,
        });
      });
    }

    // Add cited sources from audit
    if (audit?.citedSources && audit.citedSources.length > 0) {
      audit.citedSources.slice(0, 5).forEach((src, idx) => {
        items.push({
          id: `source-${src.domain}-${idx}`,
          category: t("headerSearch.categorySources"),
          title: src.domain,
          subtitle: src.title || `${t("sourcesTab.colAuthority")}: ${src.impactRating}`,
          href: "/dashboard/sources",
          icon: <Globe className="w-3.5 h-3.5 text-sky-500" />,
        });
      });
    }

    // Add action recommendations from audit
    if (audit?.actions && audit.actions.length > 0) {
      audit.actions.slice(0, 5).forEach((act) => {
        items.push({
          id: `action-${act.id}`,
          category: t("headerSearch.categoryActions"),
          title: act.title,
          subtitle: act.description,
          href: "/dashboard/actions",
          icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
        });
      });
    }

    return items;
  }, [audit, t]);

  // Filter items based on user search query
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allItems.slice(0, 6);
    }
    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [allItems, query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(item.href);
  };

  return (
    <div className="relative hidden xl:block" ref={containerRef}>
      {/* Search Input Box */}
      <div
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs w-60 focus-within:w-72 transition-all ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-[var(--syn-card)]"
            : "border-[var(--syn-border)] bg-[var(--syn-card-subtle)] hover:border-[var(--syn-subtle)]"
        }`}
        style={{
          color: "var(--syn-text)",
        }}
      >
        <Search className="w-3.5 h-3.5 text-[var(--syn-muted)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder={t("headerSearch.placeholder")}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-xs placeholder:text-[var(--syn-subtle)] text-[var(--syn-heading)] w-full"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-[var(--syn-muted)] hover:text-[var(--syn-heading)] cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-medium text-[var(--syn-subtle)] bg-[var(--syn-card-inner)] rounded border border-[var(--syn-border)]">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2.5 w-80 sm:w-[420px] rounded-2xl border border-[var(--syn-border)] bg-[var(--syn-card)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            background: "var(--syn-card)",
            borderColor: "var(--syn-border)",
            color: "var(--syn-text)",
          }}
        >
          <div className="p-2">
            <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-[var(--syn-subtle)]">
              {query.trim() ? t("common.search") : t("headerSearch.placeholder")}
            </div>

            {filteredResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[var(--syn-muted)]">
                {t("headerSearch.noResults")} &quot;{query}&quot;. {t("headerSearch.tryDifferent")}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {filteredResults.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      selectedIndex === idx
                        ? "bg-[var(--syn-card-inner)] text-[var(--syn-heading)]"
                        : "hover:bg-[var(--syn-card-subtle)] text-[var(--syn-text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[var(--syn-heading)] truncate">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-[10px] text-[var(--syn-muted)] truncate">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)] shrink-0">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer keyboard shortcuts */}
          <div className="px-3.5 py-2 border-t border-[var(--syn-border)] bg-[var(--syn-card-subtle)] flex items-center justify-between text-[10px] text-[var(--syn-subtle)]">
            <div className="flex items-center gap-2">
              <span>{t("headerSearch.navigationHint")}</span>
            </div>
            <span>QuerySonar</span>
          </div>
        </div>
      )}
    </div>
  );
}
