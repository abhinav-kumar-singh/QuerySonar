"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Globe,
  ExternalLink,
  Users2,
} from "lucide-react";
import { useAuditData } from "@/lib/audit-storage";
import { useTranslation } from "@/lib/i18n/language-context";

export function UserProfilePopover() {
  const { data: session, status } = useSession();
  const { audit } = useAuditData();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const popoverRef = useRef<HTMLDivElement>(null);

  const isLoadingUser = status === "loading";
  const brandName = audit?.brandProfile?.name || "Your Brand";
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Brand Lead";
  const userEmail = session?.user?.email || "";
  const userRole = session?.user ? "Brand Lead" : "Manager";
  const userInitial = (userName || userEmail || "U").trim().charAt(0).toUpperCase();

  // Sync active plan from localStorage and events
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

  // Click outside and ESC listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

  const handleSignOut = () => {
    setIsOpen(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative shrink-0" ref={popoverRef}>
      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all cursor-pointer ${
          isOpen
            ? "bg-black/[0.08] dark:bg-white/[0.1] border-black/[0.15] dark:border-white/[0.2] shadow-sm"
            : "bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.07] border-black/[0.06] dark:border-white/[0.08]"
        }`}
      >
        {isLoadingUser ? (
          <>
            <div className="w-7 h-7 rounded-full syn-skeleton shrink-0" />
            <div className="hidden xl:flex flex-col text-left gap-1">
              <div className="w-16 h-3 syn-skeleton rounded" />
              <div className="w-12 h-2.5 syn-skeleton rounded" />
            </div>
          </>
        ) : (
          <>
            {/* Avatar with status indicator */}
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center text-xs font-semibold overflow-hidden border border-black/10 dark:border-white/10 shrink-0 select-none shadow-inner">
                {session?.user?.image && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              {/* Active Status Pulse */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--syn-bg)]" />
            </div>

            {/* User Name & Role (Desktop) */}
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-[var(--syn-heading)] group-hover:text-emerald-500 transition-colors">
                {userName}
              </span>
              <span className="text-[10px] text-[var(--syn-muted)] leading-tight flex items-center gap-1">
                {userRole}
              </span>
            </div>
          </>
        )}

        {/* Subtle Dropdown Chevron */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-500" : ""
          }`}
        />
      </button>

      {/* Profile Popover / Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xl backdrop-blur-xl z-50 p-2 text-left animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 1. User Header & Account Summary */}
          <div className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] mb-1">
            {isLoadingUser ? (
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full syn-skeleton shrink-0" />
                <div className="flex-1 min-w-0 space-y-2 pt-0.5">
                  <div className="w-24 h-4 syn-skeleton rounded" />
                  <div className="w-36 h-3 syn-skeleton rounded" />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center text-sm font-bold overflow-hidden border border-black/10 dark:border-white/10 shadow-sm">
                    {session?.user?.image && !imageError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={userName}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[var(--syn-card)]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-[var(--syn-heading)] truncate">
                      {userName}
                    </h4>
                    <span className="syn-badge syn-badge-emerald text-[10px] py-0.5 px-2 font-mono shrink-0">
                      {userPlan}
                    </span>
                  </div>
                  {userEmail && (
                    <p className="text-xs text-[var(--syn-muted)] truncate mt-0.5">
                      {userEmail}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[var(--syn-muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{brandName}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Quick Navigation Section */}
          <div className="py-1 space-y-0.5 text-xs font-medium">
            <Link
              href="/dashboard/settings"
              prefetch={true}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[var(--syn-text)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors group"
            >
              <Settings className="w-4 h-4 text-emerald-500 group-hover:rotate-45 transition-transform" />
              <div className="flex-1">
                <span className="font-semibold text-[var(--syn-heading)]">Settings & Brand Profile</span>
                <p className="text-[10px] text-[var(--syn-muted)] font-normal">Manage tracked brands, locations & queries</p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings?tab=team"
              prefetch={true}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--syn-text)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              <Users2 className="w-4 h-4 text-sky-400" />
              <div className="flex-1">
                <span>Workspace Team</span>
              </div>
            </Link>

            <Link
              href="/dashboard/settings?tab=billing"
              prefetch={true}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--syn-text)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              <CreditCard className="w-4 h-4 text-purple-400" />
              <div className="flex-1">
                <span>Plans & Billing</span>
              </div>
            </Link>
          </div>

          <div className="my-1 border-t border-[var(--syn-border)]" />

          {/* 3. Public Website Link */}
          <div className="py-0.5 text-xs font-medium">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-neutral-400" />
                <span>Public Website</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </div>

          <div className="my-1 border-t border-[var(--syn-border)]" />

          {/* 4. Logout Action */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left group"
            >
              <LogOut className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
              <div className="flex-1">
                <span>{t("common.signOut") || "Sign Out"}</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfilePopover;
