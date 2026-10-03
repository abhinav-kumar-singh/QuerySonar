"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar, Menu, X, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { useTranslation } from "@/lib/i18n/language-context";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [desktopImgError, setDesktopImgError] = React.useState(false);
  const [mobileImgError, setMobileImgError] = React.useState(false);
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const { t } = useTranslation();

  const userInitial = (session?.user?.name || session?.user?.email || "U").trim().charAt(0).toUpperCase();

  // Do not show public marketing banner/nav on dashboard routes
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-colors relative",
        "bg-[var(--syn-bg,#F4F5F8)]/90 border-[var(--syn-border,rgba(0,0,0,0.06))] text-[var(--syn-heading,#111827)]",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 md:pr-36">
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-all bg-neutral-900 text-[#22C55E] shadow-sm ring-1 ring-white/10">
              <Radar className="h-5 w-5" />
            </div>
            <span className="font-bold text-[var(--syn-heading)]">QuerySonar</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/#features"
              className="text-[var(--syn-muted)] hover:text-[var(--syn-heading)] font-medium transition-colors"
            >
              {t("nav.features")}
            </Link>
            <Link
              href="/#pricing"
              className="text-[var(--syn-muted)] hover:text-[var(--syn-heading)] font-medium transition-colors"
            >
              {t("nav.pricing")}
            </Link>
            <Link
              href="/#faq"
              className="text-[var(--syn-muted)] hover:text-[var(--syn-heading)] font-medium transition-colors"
            >
              {t("nav.faq")}
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                className="text-[var(--syn-heading)] font-semibold transition-colors hover:text-[var(--syn-muted)]"
              >
                {t("nav.dashboard")}
              </Link>
            )}
          </nav>
        </div>

        {/* Right side: Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 py-1 px-2.5 rounded-full border border-[var(--syn-border)] bg-[var(--syn-card-subtle)]">
                {session.user.image && !desktopImgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-6 w-6 rounded-full object-cover"
                    onError={() => setDesktopImgError(true)}
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center text-xs font-semibold select-none">
                    {userInitial}
                  </div>
                )}
                <span className="text-xs font-medium max-w-[140px] truncate text-[var(--syn-heading)]">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <Link
                href="/dashboard"
                className="font-semibold text-xs px-4 py-2 rounded-full transition-all shadow-sm flex items-center justify-center bg-[var(--syn-btn-pri-bg)] hover:opacity-90 text-[var(--syn-btn-pri-text)]"
              >
                {t("common.dashboard")}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="gap-1.5 text-xs h-9 cursor-pointer border-[var(--syn-border)] text-[var(--syn-heading)] hover:bg-[var(--syn-card-subtle)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("common.signOut")}
              </Button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={openAuthModal}
                className="text-sm font-semibold text-[var(--syn-muted)] hover:text-[var(--syn-heading)] px-3 py-2 transition-colors cursor-pointer"
              >
                {t("common.signIn")}
              </button>
              <button
                type="button"
                onClick={openAuthModal}
                className="rounded-full bg-[var(--syn-btn-pri-bg)] hover:opacity-90 text-[var(--syn-btn-pri-text)] font-semibold text-sm px-5 py-2.5 transition-all shadow-sm active:scale-95 flex items-center justify-center cursor-pointer"
              >
                {t("common.getStarted")}
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Extreme Right Corner: Theme Switcher & Language Selector */}
      <div className="hidden md:flex items-center gap-2 absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2">
        <ThemeSwitcher compact />
        <LanguageSwitcher compact />
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-b px-4 pt-2 pb-6 md:hidden shadow-lg animate-in slide-in-from-top-2 duration-200 bg-[var(--syn-bg)] border-[var(--syn-border)]">
          <nav className="flex flex-col space-y-3 pt-2">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-base font-medium transition-colors text-[var(--syn-muted)] hover:bg-[var(--syn-card-subtle)] hover:text-[var(--syn-heading)]"
            >
              {t("nav.features")}
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-base font-medium transition-colors text-[var(--syn-muted)] hover:bg-[var(--syn-card-subtle)] hover:text-[var(--syn-heading)]"
            >
              {t("nav.pricing")}
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-base font-medium transition-colors text-[var(--syn-muted)] hover:bg-[var(--syn-card-subtle)] hover:text-[var(--syn-heading)]"
            >
              {t("nav.faq")}
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-base font-semibold transition-colors text-[var(--syn-heading)] hover:bg-[var(--syn-card-subtle)]"
              >
                {t("nav.dashboard")}
              </Link>
            )}
            <div className="pt-4 border-t border-[var(--syn-border)] flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-xs font-semibold text-[var(--syn-muted)]">{t("common.language")}</span>
                <LanguageSwitcher compact />
              </div>
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-xs font-semibold text-[var(--syn-muted)]">{t("common.theme")}</span>
                <ThemeSwitcher />
              </div>
              {session?.user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    {session.user.image && !mobileImgError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={() => setMobileImgError(true)}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center text-sm font-semibold select-none">
                        {userInitial}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--syn-heading)]">{session.user.name || "User"}</span>
                      <span className="text-xs text-[var(--syn-muted)]">{session.user.email}</span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-full font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity bg-[var(--syn-btn-pri-bg)] text-[var(--syn-btn-pri-text)]"
                  >
                    {t("common.dashboard")}
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 border-[var(--syn-border)] text-[var(--syn-heading)] hover:bg-[var(--syn-card-subtle)]"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("common.signOut")}
                  </Button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full text-center py-2.5 text-sm font-semibold text-[var(--syn-muted)] hover:bg-[var(--syn-card-subtle)] rounded-xl transition-colors cursor-pointer"
                  >
                    {t("common.signIn")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full text-center py-2.5 rounded-full bg-[var(--syn-btn-pri-bg)] text-[var(--syn-btn-pri-text)] font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {t("common.getStarted")}
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
