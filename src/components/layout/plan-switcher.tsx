"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, Check, Sparkles, Zap, ShieldCheck, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";

export function PlanSwitcher() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const planOptions = [
    {
      id: "FREE",
      label: t("planSwitcher.freePlan"),
      price: "$0/mo",
      limit: `1 ${t("settings.brandIdentity")} • 4 ${t("nav.queries")}`,
      icon: Sparkles,
      badgeColor: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    },
    {
      id: "STARTER",
      label: t("planSwitcher.starterPlan"),
      price: "$19/mo",
      limit: `1 ${t("settings.brandIdentity")} • 50 ${t("nav.queries")}`,
      icon: Zap,
      badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    },
    {
      id: "AGENCY",
      label: t("planSwitcher.agencyPlan"),
      price: "$49/mo",
      limit: `5 ${t("settings.brandIdentity")} • 200 ${t("nav.queries")}`,
      icon: ShieldCheck,
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
  ];

  // Initialize from localStorage immediately
  useEffect(() => {
    try {
      const saved = localStorage.getItem("georadar_test_plan");
      if (saved) {
        const p = saved.toUpperCase();
        if (p === "STARTER") setCurrentPlan("GROWTH");
        else if (p === "PRO" || p === "AGENCY") setCurrentPlan("ENTERPRISE");
        else if (["FREE", "GROWTH", "ENTERPRISE"].includes(p)) setCurrentPlan(p);
      }
    } catch {}
  }, []);

  // Fetch current plan from API (syncs DB if authenticated)
  useEffect(() => {
    let isMounted = true;
    fetch("/api/user/plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.plan) {
          const p = data.plan.toUpperCase();
          let resolved = p;
          if (p === "STARTER") resolved = "GROWTH";
          else if (p === "PRO" || p === "AGENCY") resolved = "ENTERPRISE";

          setCurrentPlan(resolved);
          try {
            localStorage.setItem("georadar_test_plan", resolved);
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [session, status]);

  // Close on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectPlan = async (planId: string) => {
    // 1. Optimistically update local state immediately
    setCurrentPlan(planId);
    setIsOpen(false);

    try {
      localStorage.setItem("georadar_test_plan", planId);
    } catch {}

    // 2. Dispatch custom event so Settings & Scanner update in real-time
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("georadar_plan_updated", { detail: { plan: planId } })
      );
    }

    // 3. Persist to API / Database
    setIsUpdating(true);
    try {
      const res = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      if (res.ok) {
        const data = await res.json();
        const p = data.plan || planId;
        setCurrentPlan(p);
        try {
          localStorage.setItem("georadar_test_plan", p);
        } catch {}
      }
    } catch (err) {
      console.error("Failed to update plan:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const activeOption = planOptions.find((p) => p.id === currentPlan) || planOptions[0];
  const IconComponent = activeOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={t("planSwitcher.testPlanNotice")}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/15 text-[11px] font-semibold transition-all cursor-pointer select-none"
      >
        <span className="text-[10px] opacity-75 font-mono">🧪</span>
        <IconComponent className="w-3 h-3 text-amber-500 shrink-0" />
        <span className="hidden sm:inline-block">
          {activeOption.label}
        </span>
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
        ) : (
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[var(--syn-border)] bg-[var(--syn-card)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            background: "var(--syn-card)",
            borderColor: "var(--syn-border)",
            color: "var(--syn-text)",
          }}
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-[var(--syn-border)] bg-[var(--syn-card-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                {t("common.theme")} / {t("common.pro")}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                {currentPlan}
              </span>
            </div>
            <p className="text-[10px] text-[var(--syn-muted)] mt-0.5">
              {t("planSwitcher.testPlanNotice")}
            </p>
          </div>

          {/* Options */}
          <div className="p-1.5 space-y-1">
            {planOptions.map((opt) => {
              const isSelected = opt.id === currentPlan;
              const OptIcon = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleSelectPlan(opt.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--syn-card-inner)] text-[var(--syn-heading)] font-semibold"
                      : "hover:bg-[var(--syn-card-subtle)] text-[var(--syn-text)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${opt.badgeColor}`}>
                      <OptIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs">{opt.label}</span>
                      <span className="text-[10px] text-[var(--syn-muted)]">
                        {opt.price} • {opt.limit}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
