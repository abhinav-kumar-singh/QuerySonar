"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Globe,
  Radio,
  Lock,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface InvitationData {
  id: string;
  email: string;
  role: string;
  brandName: string;
  brandId: string;
  websiteUrl?: string;
  inviterName: string;
  inviterEmail: string;
  inviterAvatar?: string;
  invitedAt: string;
}

export default function InviteAcceptancePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { t } = useTranslation();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/invite?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "This invitation link is invalid or has expired.");
        } else {
          setInvitation(data.invitation);
        }
      } catch (err) {
        console.error("Failed to load invitation:", err);
        setError("Failed to load invitation details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!token) return;
    setAccepting(true);
    setError(null);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to accept invitation.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard?brand=${encodeURIComponent(data.brandName || invitation?.brandName || "")}`);
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation.");
      setAccepting(false);
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "editor":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "viewer":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    }
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return t("settings.roleAdmin") || "Brand Lead (Admin)";
      case "editor":
        return t("settings.roleEditor") || "GEO Analyst (Editor)";
      case "viewer":
        return t("settings.roleViewer") || "Viewer (Read Only)";
      default:
        return role || "Collaborator";
    }
  };

  const getRoleDescription = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Full control over audits, queries, and team members in this workspace.";
      case "editor":
        return "Ability to run multi-engine audits and track buyer prompts.";
      case "viewer":
        return "Read-only access to radar scores, citations, and export reports.";
      default:
        return "Access to collaborate on brand intelligence.";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--syn-bg,#0b0f17)] text-[var(--syn-heading,#ffffff)] flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--syn-border,rgba(255,255,255,0.08))] backdrop-blur-xl bg-[var(--syn-bg)]/80 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[var(--syn-heading)]">
            QuerySonar
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="dropdown" />
          <ThemeSwitcher compact />
        </div>
      </header>

      {/* ── Main Invite Card Container ──────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-lg">
          {loading ? (
            <div className="syn-card p-10 flex flex-col items-center justify-center text-center gap-4 rounded-3xl border border-[var(--syn-border)]">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-xs text-[var(--syn-muted)] font-medium">
                {t("common.loading") || "Verifying invitation link..."}
              </p>
            </div>
          ) : error || !invitation ? (
            <div className="syn-card p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-5 rounded-3xl border border-red-500/20 bg-red-500/5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-[var(--syn-heading)]">
                  {t("settings.inviteExpiredTitle") || "Invitation Expired or Invalid"}
                </h2>
                <p className="text-xs text-[var(--syn-muted)] max-w-sm leading-relaxed">
                  {error || "This invitation link is invalid, expired, or has already been accepted."}
                </p>
              </div>

              <Link
                href="/dashboard"
                className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--syn-card-inner)] hover:bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs font-semibold text-[var(--syn-heading)] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{t("settings.returnToDashboardBtn") || "Go to Dashboard"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : success ? (
            <div className="syn-card p-10 flex flex-col items-center justify-center text-center gap-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold text-[var(--syn-heading)]">
                  Welcome to {invitation.brandName}!
                </h2>
                <p className="text-xs text-[var(--syn-muted)]">
                  You have successfully joined the workspace. Redirecting to your dashboard...
                </p>
              </div>
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mt-2" />
            </div>
          ) : (
            <div className="syn-card p-7 sm:p-9 flex flex-col gap-6 rounded-3xl border border-[var(--syn-border)] shadow-2xl backdrop-blur-2xl">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-[var(--syn-border)] pb-4">
                <div className="flex items-center gap-2">
                  <span className="syn-badge syn-badge-emerald text-[10px] uppercase font-mono tracking-widest py-0.5 px-2.5">
                    ✦ {t("settings.invitePageBadge") || "Workspace Invitation"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[var(--syn-muted)]">
                  {new Date(invitation.invitedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Title & Brand Intro */}
              <div className="space-y-2 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-tight">
                  Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{invitation.brandName}</span>
                </h1>
                <p className="text-xs sm:text-sm text-[var(--syn-muted)] leading-relaxed">
                  <strong className="text-[var(--syn-heading)]">{invitation.inviterName}</strong> has invited you to collaborate on AI search visibility and competitor surveillance.
                </p>
              </div>

              {/* Workspace & Role Overview Card */}
              <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-emerald-400 flex items-center justify-center border border-black/10 dark:border-white/10 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--syn-heading)] block truncate">
                        {invitation.brandName}
                      </span>
                      {invitation.websiteUrl && (
                        <span className="text-[10px] text-[var(--syn-muted)] truncate block">
                          {invitation.websiteUrl}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeStyle(invitation.role)} shrink-0`}>
                    {getRoleDisplayName(invitation.role)}
                  </span>
                </div>

                <div className="pt-3 border-t border-[var(--syn-border)] text-xs text-[var(--syn-muted)] leading-relaxed">
                  <p className="text-[11px] font-semibold text-[var(--syn-heading)] mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Role Permissions:</span>
                  </p>
                  <p className="text-[11px]">
                    {getRoleDescription(invitation.role)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {authStatus === "loading" ? (
                <div className="py-4 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                </div>
              ) : session?.user ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold leading-tight">
                        Logged in as {session.user.name || session.user.email}
                      </p>
                      <p className="text-[10px] text-emerald-500/80 truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAcceptInvite}
                    disabled={accepting}
                    className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t("settings.acceptingInviteBtn") || "Joining Workspace..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{t("settings.acceptInviteBtn") || "Accept Invitation & Join Workspace"}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-center space-y-1">
                    <p className="text-xs font-bold text-[var(--syn-heading)]">
                      {t("settings.signInToAcceptTitle") || "Sign in to Accept Invitation"}
                    </p>
                    <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                      {t("settings.signInToAcceptDesc") || "Sign in with Google or your account to link access to this workspace."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: `/invite/${token}` })}
                    className="w-full py-3 px-5 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{t("settings.signInWithGoogleBtn") || "Continue with Google"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="w-full py-6 text-center text-xs text-[var(--syn-muted)] border-t border-[var(--syn-border)]">
        &copy; {new Date().getFullYear()} QuerySonar. AI Search Visibility & Generative Engine Optimization.
      </footer>
    </div>
  );
}
