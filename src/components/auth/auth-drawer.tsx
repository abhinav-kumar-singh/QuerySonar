"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { X, Sparkles, Bot, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { getPendingScan } from "@/lib/audit-storage";
import { useTranslation } from "@/lib/i18n/language-context";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hasPendingScan, setHasPendingScan] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasPendingScan(Boolean(getPendingScan()));
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Sign in error:", err);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop overlay with fade-in */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        aria-hidden="true"
      />

      {/* Slide-over Drawer panel */}
      <div
        className="relative z-10 w-full max-w-md h-full bg-[var(--syn-card,#FFFFFF)] border-l border-[var(--syn-border,rgba(0,0,0,0.08))] shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-right duration-300 ease-out overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Drawer Body Content */}
        <div className="pt-4">
          <div className="py-2 flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                {hasPendingScan ? t("auth.badgeUnlock") : t("auth.badgeIntelligence")}
              </div>
              <h2
                id="drawer-title"
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--syn-heading,#111827)]"
              >
                {hasPendingScan ? t("auth.titleUnlock") : t("auth.titleSignIn")}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--syn-muted,#6B7280)] mt-2 leading-relaxed">
                {hasPendingScan
                  ? t("auth.descUnlock")
                  : t("auth.descSignIn")}
              </p>
            </div>

            {/* Feature Highlight Pills */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--syn-bg,#F4F5F8)]/70 border border-[var(--syn-border,rgba(0,0,0,0.05))]">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--syn-heading,#111827)] block">
                    {t("auth.feat1Title")}
                  </span>
                  <span className="text-[11px] text-[var(--syn-muted,#6B7280)] leading-tight block mt-0.5">
                    {t("auth.feat1Desc")}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--syn-bg,#F4F5F8)]/70 border border-[var(--syn-border,rgba(0,0,0,0.05))]">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--syn-heading,#111827)] block">
                    {t("auth.feat2Title")}
                  </span>
                  <span className="text-[11px] text-[var(--syn-muted,#6B7280)] leading-tight block mt-0.5">
                    {t("auth.feat2Desc")}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--syn-bg,#F4F5F8)]/70 border border-[var(--syn-border,rgba(0,0,0,0.05))]">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--syn-heading,#111827)] block">
                    {t("auth.feat3Title")}
                  </span>
                  <span className="text-[11px] text-[var(--syn-muted,#6B7280)] leading-tight block mt-0.5">
                    {t("auth.feat3Desc")}
                  </span>
                </div>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-[var(--syn-card,#FFFFFF)] hover:bg-[var(--syn-bg,#F4F5F8)] border-2 border-[var(--syn-border,rgba(0,0,0,0.12))] text-[var(--syn-heading,#111827)] text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-[var(--syn-border,rgba(0,0,0,0.06))] text-center">
          <p className="text-[11px] text-[var(--syn-muted,#6B7280)] leading-relaxed">
            {t("auth.termsPrefix")}{" "}
            <a href="/terms" className="underline hover:text-[var(--syn-heading,#111827)] font-medium">
              {t("auth.termsOfService")}
            </a>{" "}
            {t("auth.andText")}{" "}
            <a href="/privacy" className="underline hover:text-[var(--syn-heading,#111827)] font-medium">
              {t("auth.privacyPolicy")}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
