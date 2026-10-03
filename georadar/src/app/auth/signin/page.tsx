"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Radar, Bot, ShieldCheck, Zap, Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function SignInPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Sign in error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--syn-bg,#0F172A)] text-[var(--syn-text,#F8FAFC)] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted,#94A3B8)] hover:text-[var(--syn-heading,#FFFFFF)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("nav.returnToLanding")}</span>
        </Link>
        <LanguageSwitcher compact />
      </div>

      {/* Main Sign In Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="rounded-3xl bg-[var(--syn-card,#1E293B)] border border-[var(--syn-border,rgba(255,255,255,0.08))] p-6 sm:p-10 shadow-2xl">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-emerald-400 shadow-sm ring-1 ring-white/10">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[var(--syn-heading,#FFFFFF)] block leading-none">
                QuerySonar
              </span>
              <span className="text-[10px] font-mono text-[var(--syn-muted,#94A3B8)] uppercase tracking-wider">
                {t("auth.telemetrySubtitle")}
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--syn-heading,#FFFFFF)] mb-2">
              {t("auth.signInTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--syn-muted,#94A3B8)] leading-relaxed">
              {t("auth.signInDesc")}
            </p>
          </div>

          {/* Feature Highlight Pills */}
          <div className="flex flex-col gap-2.5 mb-8">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--syn-heading,#FFFFFF)] block">
                  {t("auth.feat1Title")}
                </span>
                <span className="text-[11px] text-[var(--syn-muted,#94A3B8)] leading-tight block mt-0.5">
                  {t("auth.feat1Desc")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--syn-heading,#FFFFFF)] block">
                  {t("auth.feat2Title")}
                </span>
                <span className="text-[11px] text-[var(--syn-muted,#94A3B8)] leading-tight block mt-0.5">
                  {t("auth.feat2Desc")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--syn-heading,#FFFFFF)] block">
                  {t("auth.feat3Title")}
                </span>
                <span className="text-[11px] text-[var(--syn-muted,#94A3B8)] leading-tight block mt-0.5">
                  {t("auth.feat3Desc")}
                </span>
              </div>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 text-sm font-bold shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span>{t("auth.connectingGoogle")}</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>{t("auth.continueWithGoogle")}</span>
              </>
            )}
          </button>

          {/* Terms info */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-[11px] text-[var(--syn-muted,#94A3B8)] leading-relaxed">
              {t("auth.termsPrefix")}{" "}
              <a href="/terms" className="underline hover:text-[var(--syn-heading,#FFFFFF)] font-medium">
                {t("auth.termsOfService")}
              </a>{" "}
              {t("auth.andText")}{" "}
              <a href="/privacy" className="underline hover:text-[var(--syn-heading,#FFFFFF)] font-medium">
                {t("auth.privacyPolicy")}
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-[var(--syn-muted,#94A3B8)]">
        {t("footer.rights")}
      </div>
    </div>
  );
}
