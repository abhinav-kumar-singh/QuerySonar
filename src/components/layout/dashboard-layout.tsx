"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Globe,
  Search,
  Zap,
} from "lucide-react";
import { useAuditData } from "@/lib/audit-storage";
import { NotificationPopover } from "@/components/layout/notification-popover";
import { HeaderSearch } from "@/components/layout/header-search";
import { PlanSwitcher } from "@/components/layout/plan-switcher";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { UserProfilePopover } from "@/components/layout/user-profile-popover";
import { WorkspaceRoleProvider } from "@/lib/workspace-role-context";
import { useTranslation } from "@/lib/i18n/language-context";
import "@/app/dashboard/synetica-dashboard.css";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceRoleProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </WorkspaceRoleProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { audit } = useAuditData();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: t("nav.dashboard") || "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: t("nav.competitors") || "Competitors", href: "/dashboard/competitors", icon: Users },
    { name: t("nav.sources") || "Sources", href: "/dashboard/sources", icon: Globe },
    { name: t("nav.queries") || "Queries", href: "/dashboard/queries", icon: Search },
    { name: t("nav.actions") || "Actions", href: "/dashboard/actions", icon: Zap },
  ];

  const brandName = audit?.brandProfile?.name || "Your Brand";

  return (
    <div className="synetica-shell min-h-screen flex flex-col">
      {/* ── Top Synetica Navigation Bar ──────────────────────────────── */}
      <header className="syn-header sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 transition-all relative">
        {/* Left: Brand Logo & Workspace Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/" className="flex items-center gap-2 group" title={t("nav.returnToLanding")}>
            <div className="w-9 h-7 rounded-full bg-[#86EFAC] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              {/* 4-pointed star icon */}
              <Sparkles className="w-4 h-4 text-neutral-950 fill-neutral-950" />
            </div>
            <span className="text-[16px] font-bold tracking-tight hidden lg:inline-block">
              QuerySonar
            </span>
          </Link>

          {/* Separator Slash */}
          <span className="text-[var(--syn-border)] font-light hidden sm:inline select-none">/</span>

          {/* Workspace Switcher */}
          <WorkspaceSwitcher />
        </div>

        {/* Center: Synetica Pill Navigation Tabs */}
        <nav
          aria-label="Main dashboard navigation"
          className="hidden md:flex items-center gap-1 bg-black/[0.02] dark:bg-white/[0.04] p-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md absolute left-1/2 -translate-x-1/2"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`syn-nav-pill ${isActive ? "active" : ""}`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-60"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Notifications, Plan Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Test Plan Switcher */}
          <PlanSwitcher />

          {/* Interactive Global Search Bar */}
          <HeaderSearch />

          {/* Interactive Notification Popover */}
          <NotificationPopover />

          {/* User Profile Popover Modal / Menu */}
          <UserProfilePopover />

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden w-8 h-8 rounded-full bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden syn-card !rounded-none border-x-0 border-t-0 px-6 py-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[var(--syn-muted)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs opacity-70">
            <span>{t("common.tracking")}: {brandName}</span>
            <Link href="/" className="text-emerald-500 font-medium">
              {t("nav.publicSite")}
            </Link>
          </div>
        </div>
      )}

      {/* Main Workspace Container */}
      <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
