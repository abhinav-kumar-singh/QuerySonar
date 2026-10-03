"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Database, EyeOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="v2 synetica-shell min-h-screen bg-[var(--syn-bg)] text-[var(--syn-text)] selection:bg-emerald-500 selection:text-neutral-950">
      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header Title Banner */}
        <div className="mb-10 pb-8 border-b border-[var(--syn-border)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="v2-badge-pill text-xs font-mono uppercase tracking-wider !bg-emerald-500/10 !text-emerald-500 dark:!text-emerald-400 !border-emerald-500/20 px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("privacyPage.badge")}
            </span>
            <span className="text-xs font-mono text-[var(--syn-subtle)]">
              {t("privacyPage.effectiveDate")}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] mb-4">
            {t("privacyPage.title")}
          </h1>
          <p className="text-base sm:text-lg text-[var(--syn-muted)] leading-relaxed max-w-3xl">
            {t("privacyPage.subtitle")}
          </p>
        </div>

        {/* 3 Privacy Pillar Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--syn-heading)] mb-1">
              {t("privacyPage.pillar1Title")}
            </h3>
            <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
              {t("privacyPage.pillar1Desc")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--syn-heading)] mb-1">
              {t("privacyPage.pillar2Title")}
            </h3>
            <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
              {t("privacyPage.pillar2Desc")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--syn-heading)] mb-1">
              {t("privacyPage.pillar3Title")}
            </h3>
            <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
              {t("privacyPage.pillar3Desc")}
            </p>
          </div>
        </div>

        {/* Document Sections */}
        <div className="space-y-10 text-sm sm:text-base text-[var(--syn-text)] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">01.</span> {t("privacyPage.sec1Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("privacyPage.sec1P1")}</p>
            <ul className="space-y-2 text-sm text-[var(--syn-muted)] list-disc pl-5">
              <li>
                <strong className="text-[var(--syn-heading)]">{t("privacyPage.sec1Li1Title")}</strong> {t("privacyPage.sec1Li1Desc")}
              </li>
              <li>
                <strong className="text-[var(--syn-heading)]">{t("privacyPage.sec1Li2Title")}</strong> {t("privacyPage.sec1Li2Desc")}
              </li>
              <li>
                <strong className="text-[var(--syn-heading)]">{t("privacyPage.sec1Li3Title")}</strong> {t("privacyPage.sec1Li3Desc")}
              </li>
              <li>
                <strong className="text-[var(--syn-heading)]">{t("privacyPage.sec1Li4Title")}</strong> {t("privacyPage.sec1Li4Desc")}
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">02.</span> {t("privacyPage.sec2Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("privacyPage.sec2P1")}</p>
            <ul className="space-y-1.5 text-sm text-[var(--syn-muted)] list-disc pl-5">
              <li>{t("privacyPage.sec2Li1")}</li>
              <li>{t("privacyPage.sec2Li2")}</li>
              <li>{t("privacyPage.sec2Li3")}</li>
              <li>{t("privacyPage.sec2Li4")}</li>
              <li>{t("privacyPage.sec2Li5")}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">03.</span> {t("privacyPage.sec3Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("privacyPage.sec3P1")}</p>
            <ul className="space-y-2 text-sm text-[var(--syn-muted)] list-disc pl-5">
              <li>
                <strong className="text-[var(--syn-heading)]">{t("privacyPage.sec3Li1Title")}</strong> {t("privacyPage.sec3Li1Desc")}
              </li>
              <li>
                <strong className="text-[var(--syn-heading)]">{t("privacyPage.sec3Li2Title")}</strong> {t("privacyPage.sec3Li2Desc")}
              </li>
              <li>
                <strong className="text-[var(--syn-heading)]">{t("privacyPage.sec3Li3Title")}</strong> {t("privacyPage.sec3Li3Desc")}
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">04.</span> {t("privacyPage.sec4Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("privacyPage.sec4P1")}</p>
            <p className="text-[var(--syn-muted)]">{t("privacyPage.sec4P2")}</p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">05.</span> {t("privacyPage.sec5Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("privacyPage.sec5P1")}</p>
            <ul className="space-y-1.5 text-sm text-[var(--syn-muted)] list-disc pl-5">
              <li>{t("privacyPage.sec5Li1")}</li>
              <li>{t("privacyPage.sec5Li2")}</li>
              <li>{t("privacyPage.sec5Li3")}</li>
              <li>{t("privacyPage.sec5Li4")}</li>
              <li>{t("privacyPage.sec5Li5")}</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">06.</span> {t("privacyPage.sec6Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("privacyPage.sec6P1")}</p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-base">07.</span> {t("privacyPage.sec7Title").replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="text-[var(--syn-muted)]">{t("privacyPage.sec7P1")}</p>
            <div className="p-4 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] font-mono text-xs text-[var(--syn-heading)] w-fit space-y-1">
              <div>{t("privacyPage.contactName")}</div>
              <div className="text-emerald-500">{t("privacyPage.contactEmail")}</div>
              <div className="text-[var(--syn-muted)]">{t("privacyPage.contactAddress")}</div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-[var(--syn-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--syn-muted)]">
          <div>{t("footer.rights")}</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[var(--syn-heading)] hover:underline">
              {t("footer.terms")}
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
