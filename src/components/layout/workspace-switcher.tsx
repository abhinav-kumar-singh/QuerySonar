"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Sparkles,
  ExternalLink,
  Settings,
  Trash2,
  Globe,
  MapPin,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { useAuditData, StoredBrand } from "@/lib/audit-storage";
import { useTranslation } from "@/lib/i18n/language-context";
import { AuditDrawer } from "@/components/dashboard/audit-drawer";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

export function WorkspaceSwitcher() {
  const { audit, brands, switchBrand, deleteBrand, saveAudit } = useAuditData();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(isUpgradeModalOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeBrandName = audit?.brandProfile?.name || "My Brand";
  const activeBrandInitial = (activeBrandName || "B").trim().charAt(0).toUpperCase();
  const activeBrandScore = audit?.shareOfVoice?.overallScore
    ? Math.round(audit.shareOfVoice.overallScore)
    : null;

  // Plan Limit calculation
  const maxWorkspaces = ["ENTERPRISE", "AGENCY", "PRO"].includes(userPlan)
    ? 5
    : ["GROWTH", "STARTER"].includes(userPlan)
    ? 2
    : 1;

  const isAtLimit = brands.length >= maxWorkspaces;

  // Sync plan from localStorage and events
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
    }

    window.addEventListener("georadar_plan_updated", handlePlanEvent);
    return () => window.removeEventListener("georadar_plan_updated", handlePlanEvent);
  }, []);

  // Click outside & ESC listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsCreateDrawerOpen(false);
        setIsUpgradeModalOpen(false);
      }
    }

    if (isOpen || isCreateDrawerOpen || isUpgradeModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isCreateDrawerOpen, isUpgradeModalOpen]);

  const handleSelectWorkspace = (brandId: string) => {
    switchBrand(brandId);
    setIsOpen(false);
  };

  const handleDeleteWorkspace = async (e: React.MouseEvent, brand: StoredBrand) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${brand.name}" brand workspace and all its audit data?`)) {
      return;
    }
    try {
      await fetch(`/api/workspaces?id=${brand.id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to delete workspace on server:", err);
    }
    deleteBrand(brand.id);
  };

  const handleOpenCreateModal = () => {
    setIsOpen(false);
    if (isAtLimit) {
      setIsUpgradeModalOpen(true);
    } else {
      setIsCreateDrawerOpen(true);
    }
  };

  return (
    <>
      <div className="relative shrink-0" ref={popoverRef}>
        {/* Workspace Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
            isOpen
              ? "bg-black/[0.08] dark:bg-white/[0.1] border-black/[0.15] dark:border-white/[0.2] shadow-sm"
              : "bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.07] border-black/[0.06] dark:border-white/[0.08]"
          }`}
        >
          {/* Brand Initial Badge */}
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-extrabold shrink-0 shadow-xs">
            {activeBrandInitial}
          </div>

          {/* Brand Name */}
          <span className="text-xs font-bold tracking-tight text-[var(--syn-heading)] max-w-[120px] sm:max-w-[160px] truncate group-hover:text-emerald-500 transition-colors">
            {activeBrandName}
          </span>

          {/* Overall Score Badge (if present) */}
          {activeBrandScore !== null && (
            <span className="hidden sm:inline-flex text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {activeBrandScore}%
            </span>
          )}

          {/* Chevron */}
          <ChevronDown
            className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-emerald-500" : ""
            }`}
          />
        </button>

        {/* Workspace Dropdown Popover */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xl backdrop-blur-xl z-50 p-2 text-left animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header: Workspaces Title & Limit Badge */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--syn-border)] mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--syn-muted)]">
                Brand Workspaces
              </span>
              <span className="text-[10px] font-semibold text-[var(--syn-muted)] bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-[var(--syn-border)]">
                {brands.length} / {maxWorkspaces} {userPlan}
              </span>
            </div>

            {/* List of Workspaces / Brands */}
            <div className="py-1 max-h-60 overflow-y-auto space-y-1">
              {brands.map((b) => {
                const isActive = b.name.toLowerCase() === activeBrandName.toLowerCase();
                const initial = (b.name || "B").trim().charAt(0).toUpperCase();

                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectWorkspace(b.id)}
                    className={`group/brand w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-[var(--syn-heading)]"
                        : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[var(--syn-text)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-black/[0.05] dark:bg-white/[0.08] text-[var(--syn-heading)]"
                        }`}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">{b.name}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--syn-muted)] truncate">
                          {b.websiteUrl || "No website domain configured"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {b.overallScore > 0 && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[var(--syn-muted)]">
                          {b.overallScore}%
                        </span>
                      )}
                      {isActive && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}

                      {brands.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteWorkspace(e, b)}
                          title={`Delete "${b.name}" workspace`}
                          className="p-1 rounded-md text-[var(--syn-muted)] hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/brand:opacity-100 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-1 border-t border-[var(--syn-border)]" />

            {/* Actions: Add Workspace or Manage */}
            <div className="space-y-0.5 pt-1">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer text-left"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Brand Workspace</span>
              </button>

              <Link
                href="/dashboard/settings?tab=brand"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Workspace Settings</span>
                </div>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Full Multi-Step Brand Workspace Creation & AI Audit Drawer */}
      <AuditDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        isCreatingNewBrand={true}
        onAuditComplete={() => {
          setIsCreateDrawerOpen(false);
        }}
      />

      {/* Plan Limit Upgrade Modal */}
      {mounted && isUpgradeModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overscroll-contain animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsUpgradeModalOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--syn-heading)]">
                  Workspace Limit Reached
                </h3>
                <p className="text-xs text-[var(--syn-muted)]">
                  {brands.length} of {maxWorkspaces} Brand Workspaces used
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--syn-muted)] leading-relaxed mb-5">
              Your current <span className="font-bold text-[var(--syn-heading)]">{userPlan}</span> plan allows up to {maxWorkspaces} brand workspace. Upgrade your plan to Growth or Enterprise to manage multiple brands simultaneously.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--syn-border)]">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Close
              </button>

              <Link
                href="/dashboard/settings?tab=billing"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade Plan</span>
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default WorkspaceSwitcher;
