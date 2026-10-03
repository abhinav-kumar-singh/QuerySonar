"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Radar,
  Send,
  Link2,
  Mail,
  FileText,
  Clock,
  Award,
  BookOpen,
  Cpu,
  ShieldCheck,
  Calendar,
  Users,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Edit2,
  TrendingUp,
  Globe2,
  Check,
  Plus,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function SignInPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  // Interactive Mini App State (Right Side)
  const [activeTab, setActiveTab] = useState<
    "outreach" | "summary" | "citations" | "reports" | "playbook"
  >("outreach");
  const [selectedOpportunity, setSelectedOpportunity] = useState<"forbes" | "techcrunch" | "wired">("forbes");
  const [emailDraftSent, setEmailDraftSent] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftSubject, setDraftSubject] = useState("Quick question about your list");
  const [draftBody, setDraftBody] = useState(
    "Hi there,\n\nI noticed your excellent article on forbes.com. As a company in the same space, I thought you might find our recent research on AI visibility interesting..."
  );

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Sign in error:", err);
      setLoading(false);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate sign-in / redirect with Google primary
    setTimeout(() => {
      setEmailSentNotice(true);
      setLoading(false);
    }, 600);
  };

  const handleSendDraftEmail = () => {
    setEmailDraftSent(true);
    setTimeout(() => {
      setEmailDraftSent(false);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[var(--syn-bg,#0B0F17)] text-[var(--syn-text,#F8FAFC)] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Bar */}
      <div className="max-w-[1240px] w-full mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--syn-muted,#94A3B8)] hover:text-[var(--syn-heading,#FFFFFF)] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{t("nav.returnToLanding")}</span>
        </Link>

        {/* Central Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-base tracking-tight text-[var(--syn-heading,#FFFFFF)]">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#86EFAC] text-neutral-950 shadow-sm">
            <Sparkles className="h-4 w-4 fill-neutral-950" />
          </div>
          <span>QuerySonar</span>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher compact />
          <LanguageSwitcher compact />
        </div>
      </div>

      {/* Main Dual-Column Split Screen Container */}
      <div className="max-w-[1240px] w-full mx-auto my-6">
        <div className="rounded-3xl bg-[var(--syn-card,#111827)] border border-[var(--syn-border,rgba(255,255,255,0.08))] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT COLUMN: AUTHENTICATION / LOGIN FORM
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--syn-border,rgba(255,255,255,0.08))] bg-[var(--syn-card,#111827)]">
            <div>
              {/* Form Title */}
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--syn-heading,#FFFFFF)] mb-2.5">
                  {t("auth.readyToDominate")}
                </h1>
                <p className="text-xs text-[var(--syn-muted,#94A3B8)] leading-relaxed">
                  {t("auth.signInDesc")}
                </p>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--syn-heading,#FFFFFF)] block">
                    {t("auth.emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--syn-muted,#94A3B8)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.emailPlaceholder")}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--syn-input-border,rgba(255,255,255,0.12))] bg-[var(--syn-input-bg,#0B0F17)] text-[var(--syn-input-text,#F8FAFC)] text-xs placeholder:text-[var(--syn-muted,#64748B)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--syn-heading,#FFFFFF)] block">
                      {t("auth.passwordLabel")}
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Please continue with Google for instant zero-password authentication.")}
                      className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {t("auth.forgotPassword")}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--syn-muted,#94A3B8)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("auth.passwordPlaceholder")}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--syn-input-border,rgba(255,255,255,0.12))] bg-[var(--syn-input-bg,#0B0F17)] text-[var(--syn-input-text,#F8FAFC)] text-xs placeholder:text-[var(--syn-muted,#64748B)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--syn-muted,#94A3B8)] hover:text-[var(--syn-heading,#FFFFFF)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {emailSentNotice && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span>Please use the Google sign-in button below to access your live dashboard directly.</span>
                  </div>
                )}

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {t("auth.signInBtn")}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--syn-border,rgba(255,255,255,0.08))]" />
                <span className="text-[11px] text-[var(--syn-muted,#64748B)] uppercase tracking-wider font-mono">
                  {t("auth.orContinueWith")}
                </span>
                <div className="flex-1 h-px bg-[var(--syn-border,rgba(255,255,255,0.08))]" />
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[var(--syn-card-inner,#1E293B)] hover:bg-[var(--syn-card-subtle,#334155)] border border-[var(--syn-border,rgba(255,255,255,0.1))] text-[var(--syn-heading,#FFFFFF)] text-xs font-semibold shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{t("auth.connectingGoogle")}</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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

              {/* Create Free Account Link */}
              <div className="mt-5 text-center">
                <span className="text-xs text-[var(--syn-muted,#94A3B8)]">
                  {t("auth.noAccount")}{" "}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                  >
                    {t("auth.createFreeAccount")}
                  </button>
                </span>
              </div>
            </div>

            {/* Terms Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--syn-border,rgba(255,255,255,0.08))] text-center">
              <p className="text-[11px] text-[var(--syn-muted,#64748B)]">
                {t("footer.rights")} · <Link href="/terms" className="hover:underline">{t("footer.terms")}</Link> · <Link href="/privacy" className="hover:underline">{t("footer.privacy")}</Link>
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT COLUMN: INTERACTIVE LIVE MINI-APP PREVIEW (RankPrompt Style)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 bg-[var(--syn-bg,#0B0F17)]/95 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Interactive App Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--syn-muted,#94A3B8)]">
                    Interactive Live Sandbox
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  Click tabs to explore
                </span>
              </div>

              {/* Mini App Body Grid */}
              <div className="grid grid-cols-12 gap-3.5 pt-1">
                
                {/* 1. Mini Sidebar Navigation */}
                <div className="col-span-12 sm:col-span-4 flex flex-col gap-1.5 p-2 rounded-2xl bg-black/40 border border-white/5">
                  {/* Brand Profile Pill */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      M
                    </div>
                    <span className="text-xs font-bold text-[var(--syn-heading,#FFFFFF)] truncate">
                      {t("auth.myBrand")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("outreach")}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold transition-all mb-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("auth.newReport")}</span>
                  </button>

                  {/* Navigation Item Tabs */}
                  {[
                    { id: "summary", label: t("auth.tabSummary"), icon: TrendingUp },
                    { id: "citations", label: t("auth.tabCitations"), icon: Link2 },
                    { id: "outreach", label: t("auth.tabOutreach"), icon: Send, active: true },
                    { id: "emailhub", label: t("auth.tabEmailHub"), icon: Mail },
                    { id: "reports", label: t("auth.tabReports"), icon: FileText },
                    { id: "scheduled", label: t("auth.tabScheduled"), icon: Clock },
                    { id: "whitelabel", label: t("auth.tabWhiteLabel"), icon: Award },
                    { id: "articles", label: t("auth.tabArticles"), icon: BookOpen },
                    { id: "integrations", label: t("auth.tabIntegrations"), icon: Cpu },
                    { id: "seoaudits", label: t("auth.tabSeoAudits"), icon: ShieldCheck },
                    { id: "calendar", label: t("auth.tabCalendar"), icon: Calendar },
                    { id: "collaborators", label: t("auth.tabCollaborators"), icon: Users },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isCurrent = activeTab === tab.id || (tab.id === "outreach" && activeTab === "outreach");
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          if (["outreach", "summary", "citations", "reports"].includes(tab.id)) {
                            setActiveTab(tab.id as any);
                          } else {
                            setActiveTab("outreach");
                          }
                        }}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-[11px] font-medium transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-xs"
                            : "text-[var(--syn-muted,#94A3B8)] hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 2. Mini Content Pane (Dynamic) */}
                <div className="col-span-12 sm:col-span-8 flex flex-col gap-3.5">
                  
                  {/* Dynamic Tab 1: Outreach (Matching Image 2 Reference) */}
                  {activeTab === "outreach" && (
                    <>
                      {/* Sub-Header & 3 KPI Stat Boxes */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <Send className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{t("auth.backlinkOutreach")}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
                            <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-400" /> {t("auth.opportunities")}
                            </span>
                            <span className="text-base font-extrabold text-white mt-1">47</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
                            <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] flex items-center gap-1">
                              <Send className="w-3 h-3 text-emerald-400" /> {t("auth.emailsSent")}
                            </span>
                            <span className="text-base font-extrabold text-white mt-1">23</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
                            <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] flex items-center gap-1">
                              <Eye className="w-3 h-3 text-cyan-400" /> {t("auth.openRate")}
                            </span>
                            <span className="text-base font-extrabold text-white mt-1">68%</span>
                          </div>
                        </div>
                      </div>

                      {/* Outreach Opportunities List */}
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[var(--syn-heading,#FFFFFF)]">
                            {t("auth.outreachOpportunities")}
                          </span>
                          <span className="text-[var(--syn-muted,#94A3B8)]">{t("auth.fromCitations")}</span>
                        </div>

                        <div className="space-y-1.5">
                          {/* Item 1: techcrunch */}
                          <div
                            onClick={() => {
                              setSelectedOpportunity("techcrunch");
                              setDraftSubject("Inquiry regarding AI tool citation on TechCrunch");
                              setDraftBody("Hi TechCrunch team,\n\nLoved your recent piece highlighting LLM search. QuerySonar provides deterministic citations data that might benefit your next roundup.");
                            }}
                            className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                              selectedOpportunity === "techcrunch"
                                ? "bg-indigo-950/40 border-indigo-500/50"
                                : "bg-white/5 border-white/5 hover:border-white/15"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                              <div>
                                <span className="font-bold text-white block text-[11px]">techcrunch.com</span>
                                <span className="text-[9px] text-[var(--syn-muted,#94A3B8)]">{t("auth.articleMention")}</span>
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {t("auth.statusSent")}
                            </span>
                          </div>

                          {/* Item 2: forbes */}
                          <div
                            onClick={() => {
                              setSelectedOpportunity("forbes");
                              setDraftSubject("Quick question about your list");
                              setDraftBody("Hi there,\n\nI noticed your excellent article on forbes.com. As a company in the same space, I thought you might find our recent research on AI visibility interesting...");
                            }}
                            className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                              selectedOpportunity === "forbes"
                                ? "bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30"
                                : "bg-white/5 border-white/5 hover:border-white/15"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                              <div>
                                <span className="font-bold text-white block text-[11px]">forbes.com</span>
                                <span className="text-[9px] text-[var(--syn-muted,#94A3B8)]">{t("auth.listicle")}</span>
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {t("auth.statusDraft")}
                            </span>
                          </div>

                          {/* Item 3: wired */}
                          <div
                            onClick={() => {
                              setSelectedOpportunity("wired");
                              setDraftSubject("Feedback & data for Wired AI Search guide");
                              setDraftBody("Hi Wired editorial,\n\nFollowing your deep-dive on generative search agents, QuerySonar tracks over 12k prompts weekly and can supply telemetry charts for future editions.");
                            }}
                            className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                              selectedOpportunity === "wired"
                                ? "bg-indigo-950/40 border-indigo-500/50"
                                : "bg-white/5 border-white/5 hover:border-white/15"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                              <div>
                                <span className="font-bold text-white block text-[11px]">wired.com</span>
                                <span className="text-[9px] text-[var(--syn-muted,#94A3B8)]">{t("auth.newsPiece")}</span>
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {t("auth.statusReady")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI-Generated Email Card */}
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                            <Mail className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{t("auth.aiGeneratedEmail")}</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("auth.readyToSend")}
                          </span>
                        </div>

                        <div className="text-[10px] text-[var(--syn-muted,#94A3B8)] space-y-0.5 border-b border-white/5 pb-1.5">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">To:</span>
                            <span className="font-mono text-indigo-300">
                              tech@{selectedOpportunity}.com
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">Subject:</span>
                            <span>{draftSubject}</span>
                          </div>
                        </div>

                        {/* Editable or Static Message */}
                        {isEditingDraft ? (
                          <textarea
                            value={draftBody}
                            onChange={(e) => setDraftBody(e.target.value)}
                            rows={3}
                            className="w-full p-2 rounded-lg bg-black/60 border border-indigo-500/40 text-[11px] text-white focus:outline-none"
                          />
                        ) : (
                          <p className="text-[11px] text-neutral-300 leading-relaxed font-sans bg-white/5 p-2 rounded-lg line-clamp-3">
                            {draftBody}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSendDraftEmail}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>{emailDraftSent ? "✓ Email Sent!" : t("auth.sendEmailBtn")}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsEditingDraft(!isEditingDraft)}
                            className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>{isEditingDraft ? "Done" : t("auth.editBtn")}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Dynamic Tab 2: Summary / Overview */}
                  {activeTab === "summary" && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>AI Share of Voice Benchmark</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">Consensus #1</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] block">Overall SOV</span>
                          <span className="text-lg font-extrabold text-emerald-400 font-mono">82%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] block">Citations</span>
                          <span className="text-lg font-extrabold text-indigo-400 font-mono">142</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] block">Engines</span>
                          <span className="text-lg font-extrabold text-cyan-400 font-mono">6/6</span>
                        </div>
                      </div>

                      {/* Engine Score Bars */}
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                        {[
                          { name: "ChatGPT Search (GPT-4o)", score: 92, color: "bg-emerald-400" },
                          { name: "Google Gemini (2.0 Flash)", score: 88, color: "bg-blue-400" },
                          { name: "Perplexity Sonar Pro", score: 94, color: "bg-purple-400" },
                          { name: "Claude 3.7 Sonnet", score: 85, color: "bg-amber-400" },
                        ].map((eng, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-white font-medium">{eng.name}</span>
                              <span className="font-mono text-neutral-300">{eng.score}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                              <div className={`h-full rounded-full ${eng.color}`} style={{ width: `${eng.score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Tab 3: Citations */}
                  {activeTab === "citations" && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Multi-Channel Grounding Radar</span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { source: "reddit.com/r/developer", citations: 48, status: "High Impact" },
                          { source: "techcrunch.com/reviews", citations: 32, status: "Authoritative" },
                          { source: "wikipedia.org/wiki/GEO", citations: 24, status: "Knowledge Graph" },
                          { source: "github.com/topics", citations: 38, status: "Developer Core" },
                        ].map((src, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-white block text-[11px]">{src.source}</span>
                              <span className="text-[9px] text-[var(--syn-muted,#94A3B8)]">{src.citations} live citations verified</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              {src.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Bottom Glow / Probing Banner */}
            <div className="mt-4 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-300">
                <Globe2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-[11px]">Concurrent Probing on 6 Frontier LLMs Active</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                99.9% Uptime
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Legal Footer */}
      <div className="max-w-[1240px] w-full mx-auto text-center text-xs text-[var(--syn-muted,#64748B)] py-2">
        {t("footer.rights")}
      </div>
    </div>
  );
}
