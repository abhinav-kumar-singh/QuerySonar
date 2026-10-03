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
  ShieldCheck,
  Sparkles,
  Eye,
  Crown,
  Check,
  RotateCcw,
} from "lucide-react";
import { useAuditData } from "@/lib/audit-storage";
import { useTranslation } from "@/lib/i18n/language-context";
import { useWorkspaceRole } from "@/lib/workspace-role-context";
import { WorkspaceRole, ROLE_CONFIGS } from "@/lib/permissions";

export function UserProfilePopover() {
  const { data: session, status } = useSession();
  const { audit } = useAuditData();
  const { t } = useTranslation();
  const {
    role,
    isSimulating,
    actualRole,
    permissions,
    roleConfig,
    setSimulatedRole,
  } = useWorkspaceRole();

  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const popoverRef = useRef<HTMLDivElement>(null);

  const isLoadingUser = status === "loading";
  const brandName = audit?.brandProfile?.name || "Your Brand";
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Team Member";
  const userEmail = session?.user?.email || "";
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

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case "crown":
        return <Crown className="w-3 h-3 text-amber-500" />;
      case "shield":
        return <ShieldCheck className="w-3 h-3 text-purple-400" />;
      case "sparkles":
        return <Sparkles className="w-3 h-3 text-emerald-400" />;
      case "eye":
      default:
        return <Eye className="w-3 h-3 text-sky-400" />;
    }
  };

  const getRoleLabel = (r: WorkspaceRole) => {
    switch (r) {
      case "owner":
        return t("settings.roleOwner") || "Workspace Owner";
      case "admin":
        return t("settings.roleAdmin") || "Brand Lead (Admin)";
      case "editor":
        return t("settings.roleEditor") || "GEO Analyst (Editor)";
      case "viewer":
        return t("settings.roleViewer") || "Viewer (Read Only)";
    }
  };

  const roleOptions: Array<{ id: WorkspaceRole; label: string; desc: string; icon: typeof ShieldCheck; color: string }> = [
    {
      id: "admin",
      label: t("settings.roleAdmin") || "Brand Lead (Admin)",
      desc: "Full workspace & team access",
      icon: ShieldCheck,
      color: "text-purple-400",
    },
    {
      id: "editor",
      label: t("settings.roleEditor") || "GEO Analyst (Editor)",
      desc: "Run audits & optimize queries",
      icon: Sparkles,
      color: "text-emerald-400",
    },
    {
      id: "viewer",
      label: t("settings.roleViewer") || "Viewer (Read Only)",
      desc: "Explore dashboards & radar charts",
      icon: Eye,
      color: "text-sky-400",
    },
  ];

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
                {getRoleIcon(roleConfig.iconName)}
                <span>{getRoleLabel(role)}</span>
                {isSimulating && (
                  <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-500 font-mono">
                    TEST
                  </span>
                )}
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
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-84 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xl backdrop-blur-xl z-50 p-2 text-left animate-in fade-in slide-in-from-top-2 duration-150">
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
                  {/* Current Active Role Badge */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${roleConfig.badgeBg} ${roleConfig.badgeBorder} ${roleConfig.badgeText}`}
                    >
                      {getRoleIcon(roleConfig.iconName)}
                      <span>{getRoleLabel(role)}</span>
                    </span>
                    <span className="text-[10px] text-[var(--syn-muted)] truncate">
                      • {brandName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Interactive Role Preview Switcher */}
          <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--syn-border)] my-1.5">
            <div className="flex items-center justify-between px-1.5 py-1 mb-1">
              <span className="text-[11px] font-bold text-[var(--syn-heading)] uppercase tracking-wider">
                Preview Role View
              </span>
              {isSimulating && (
                <button
                  type="button"
                  onClick={() => setSimulatedRole(null)}
                  className="text-[10px] text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reset to your real workspace role"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {roleOptions.map((opt) => {
                const isSelected = role === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSimulatedRole(opt.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/40 text-[var(--syn-heading)] shadow-sm ring-1 ring-emerald-500/20"
                        : "bg-[var(--syn-card)] border-[var(--syn-border)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[var(--syn-muted)]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 mb-1 ${opt.color}`} />
                    <span className="text-[10px] font-bold truncate max-w-full">
                      {opt.id === "admin" ? "Brand Lead" : opt.id === "editor" ? "GEO Analyst" : "Viewer"}
                    </span>
                    {isSelected && (
                      <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Quick Navigation Section */}
          <div className="py-1 space-y-0.5 text-xs font-medium">
            <Link
              href="/dashboard/settings"
              prefetch={true}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--syn-text)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors group"
            >
              <Settings className="w-4 h-4 text-emerald-500 group-hover:rotate-45 transition-transform" />
              <div className="flex-1">
                <span className="font-semibold text-[var(--syn-heading)]">Settings & Brand Profile</span>
                <p className="text-[10px] text-[var(--syn-muted)] font-normal">
                  {permissions.canEditBrandProfile ? "Manage brand & configurations" : "View brand settings (Read Only)"}
                </p>
              </div>
            </Link>

            {permissions.canManageTeam && (
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
            )}

            {permissions.canManageBilling && (
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
            )}
          </div>

          <div className="my-1 border-t border-[var(--syn-border)]" />

          {/* 4. Public Website Link */}
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

          {/* 5. Logout Action */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left group"
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
