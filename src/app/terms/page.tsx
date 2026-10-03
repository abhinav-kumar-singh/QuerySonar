"use client";

import React from "react";
import Link from "next/link";
import { Shield, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";

export default function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="v2 synetica-shell min-h-screen bg-[var(--syn-bg)] text-[var(--syn-text)] selection:bg-emerald-500 selection:text-neutral-950">
      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header Title Banner */}
        <div className="mb-10 pb-8 border-b border-[var(--syn-border)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="v2-badge-pill text-xs font-mono uppercase tracking-wider !bg-emerald-500/10 !text-emerald-500 dark:!text-emerald-400 !border-emerald-500/20 px-3 py-1">
              <Shield className="w-3.5 h-3.5" />
              {t("termsPage.badge")}
            </span>
            <span className="text-xs font-mono text-[var(--syn-subtle)]">
              {t("termsPage.effectiveDate")}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] mb-4">
            {t("termsPage.title")}
          </h1>
          <p className="text-base sm:text-lg text-[var(--syn-muted)] leading-relaxed max-w-3xl">
            {t("termsPage.subtitle")}
          </p>
        </div>

        {/* Legal Notice Box */}
        <div className="mb-10 p-5 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] shadow-xs flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[var(--syn-muted)] leading-relaxed">
            <strong className="text-[var(--syn-heading)] block mb-1">
              {t("termsPage.noticeTitle")}
            </strong>
            {t("termsPage.noticeDesc")}
          </div>
        </div>

        {/* Document Sections */}
        <div className="space-y-10 text-sm sm:text-base text-[var(--syn-text)] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">01.</span> {t("termsPage.sec1Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec1P1")}</p>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec1P2")}</p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">02.</span> {t("termsPage.sec2Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec2P1")}</p>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec2P2")}</p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)]">
            <h2 className="text-xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">03.</span> {t("termsPage.sec3Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)] text-sm sm:text-base">{t("termsPage.sec3P1")}</p>
            <ul className="space-y-2 text-sm text-[var(--syn-muted)] list-disc pl-5">
              <li>{t("termsPage.sec3Li1")}</li>
              <li>{t("termsPage.sec3Li2")}</li>
              <li>{t("termsPage.sec3Li3")}</li>
            </ul>
            <p className="text-[var(--syn-muted)] text-sm">{t("termsPage.sec3P2")}</p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">04.</span> {t("termsPage.sec4Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)] uppercase text-xs sm:text-sm font-mono tracking-wide bg-[var(--syn-card-inner)] p-4 rounded-xl border border-[var(--syn-border)]">
              {t("termsPage.sec4P1")}
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">05.</span> {t("termsPage.sec5Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)] uppercase text-xs sm:text-sm font-mono tracking-wide bg-[var(--syn-card-inner)] p-4 rounded-xl border border-[var(--syn-border)]">
              {t("termsPage.sec5P1")}
            </p>
            <p className="text-[var(--syn-muted)] text-sm">{t("termsPage.sec5P2")}</p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">06.</span> {t("termsPage.sec6Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec6P1")}</p>
            <ul className="space-y-1.5 text-sm text-[var(--syn-muted)] list-disc pl-5">
              <li>{t("termsPage.sec6Li1")}</li>
              <li>{t("termsPage.sec6Li2")}</li>
              <li>{t("termsPage.sec6Li3")}</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">07.</span> {t("termsPage.sec7Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec7P1")}</p>
            <ul className="space-y-1.5 text-sm text-[var(--syn-muted)] list-disc pl-5">
              <li>{t("termsPage.sec7Li1")}</li>
              <li>{t("termsPage.sec7Li2")}</li>
              <li>{t("termsPage.sec7Li3")}</li>
              <li>{t("termsPage.sec7Li4")}</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">08.</span> {t("termsPage.sec8Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec8P1")}</p>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec8P2")}</p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">09.</span> {t("termsPage.sec9Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec9P1")}</p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">10.</span> {t("termsPage.sec10Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec10P1")}</p>
            <p className="text-[var(--syn-muted)]">{t("termsPage.sec10P2")}</p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-[var(--syn-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--syn-muted)]">
          <div>{t("footer.rights")}</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--syn-heading)] hover:underline">
              {t("footer.privacy")}
            </Link>
            <span>·</span>
            <Link href="/" className="hover:text-[var(--syn-heading)] hover:underline">
              {t("nav.returnToLanding")}
            </Link>
            <span>·</span>
            <Link href="/auth/signin" className="hover:text-[var(--syn-heading)] hover:underline">
              {t("common.signIn")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
