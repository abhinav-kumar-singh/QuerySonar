"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  Globe,
  Search,
  Zap,
  Check,
  Plus,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  TrendingUp,
  Shield,
  Bot,
  Layers,
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  Newspaper,
  BookOpen,
  Code2,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AIEngineRow } from "@/components/ui/ai-engine-icons";

export default function SignInPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  // Interactive Mini QuerySonar App State
  const [activeTab, setActiveTab] = useState<
    "overview" | "competitors" | "sources" | "queries" | "actions"
  >("overview");

  // Interactive Query tab selection
  const [selectedPersonaQuery, setSelectedPersonaQuery] = useState<number>(0);

  // Interactive Actions checklist state
  const [completedActions, setCompletedActions] = useState<string[]>([
    "llmstxt",
    "robots",
  ]);

  const toggleAction = (id: string) => {
    setCompletedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

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
    setTimeout(() => {
      setEmailSentNotice(true);
      setLoading(false);
    }, 500);
  };

  const personaQueries = [
    {
      persona: "Discovery",
      query: "What is the best AI search optimization platform for marketing teams?",
      winner: "QuerySonar",
      sov: 94,
      engines: "6/6 Cited",
      engineNote: "ChatGPT and Perplexity cite QuerySonar as the leading GEO platform.",
    },
    {
      persona: "Comparison",
      query: "QuerySonar vs traditional SEO tools for ChatGPT and Perplexity",
      winner: "QuerySonar",
      sov: 88,
      engines: "6/6 Cited",
      engineNote: "Consensus highlights deterministic multi-engine probing and citation tracing.",
    },
    {
      persona: "Feature",
      query: "How to trace live Reddit and Google News citations in LLM responses",
      winner: "QuerySonar",
      sov: 91,
      engines: "5/6 Cited",
      engineNote: "Google Gemini and Claude cite QuerySonar's 8-channel grounding radar.",
    },
    {
      persona: "Enterprise",
      query: "Enterprise generative search monitoring with multi-workspace support",
      winner: "QuerySonar",
      sov: 86,
      engines: "6/6 Cited",
      engineNote: "DeepSeek and Grok confirm real-time drift alerts & automated weekly digests.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--syn-bg,#0B0F17)] text-[var(--syn-text,#F8FAFC)] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Bar */}
      <div className="max-w-[1280px] w-full mx-auto flex items-center justify-between py-2">
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
      <div className="max-w-[1280px] w-full mx-auto my-6">
        <div className="rounded-3xl bg-[var(--syn-card,#111827)] border border-[var(--syn-border,rgba(255,255,255,0.08))] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT COLUMN: AUTHENTICATION / LOGIN FORM
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--syn-border,rgba(255,255,255,0.08))] bg-[var(--syn-card,#111827)]">
            <div>
              {/* Form Title */}
              <div className="mb-8">
                <span className="v2-badge-pill mb-3 text-[10px] font-mono uppercase tracking-wider !bg-emerald-500/10 !text-emerald-400 !border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  {t("auth.badgeIntelligence")}
                </span>
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--syn-input-border,rgba(255,255,255,0.12))] bg-[var(--syn-input-bg,#0B0F17)] text-[var(--syn-input-text,#F8FAFC)] text-xs placeholder:text-[var(--syn-muted,#64748B)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                      onClick={() => alert("Please continue with Google for seamless one-click authentication.")}
                      className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
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
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--syn-input-border,rgba(255,255,255,0.12))] bg-[var(--syn-input-bg,#0B0F17)] text-[var(--syn-input-text,#F8FAFC)] text-xs placeholder:text-[var(--syn-muted,#64748B)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Please use the Google sign-in button below to access your live dashboard directly.</span>
                  </div>
                )}

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs text-neutral-950 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50"
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
                    className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
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
              RIGHT COLUMN: AUTHENTIC QUERYSONAR INTERACTIVE APP PREVIEW
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 bg-[var(--syn-bg,#0B0F17)]/95 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Interactive App Header with Synetica Navigation Pills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--syn-muted,#94A3B8)]">
                    QuerySonar Live App Preview
                  </span>
                </div>
                
                {/* 5 Real QuerySonar Navigation Tabs (Overview, Competitors, Sources, Queries, Actions) */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10">
                  {[
                    { id: "overview", label: t("nav.dashboard") || "Overview", icon: LayoutDashboard },
                    { id: "competitors", label: t("nav.competitors") || "Competitors", icon: Users },
                    { id: "sources", label: t("nav.sources") || "Sources", icon: Globe },
                    { id: "queries", label: t("nav.queries") || "Queries", icon: Search },
                    { id: "actions", label: t("nav.actions") || "Actions", icon: Zap },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isCurrent = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-[#86EFAC] text-neutral-950 font-bold shadow-xs"
                            : "text-[var(--syn-muted,#94A3B8)] hover:text-white"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mini App Content Area based on Selected Tab */}
              <div className="pt-2">

                {/* ── 1. OVERVIEW TAB PREVIEW ──────────────────────────────── */}
                {activeTab === "overview" && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    {/* 4 Bento KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                        <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] font-mono uppercase font-bold">
                          Share of Voice
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-extrabold text-emerald-400 font-mono">82%</span>
                          <span className="text-[10px] text-emerald-400 font-bold">+12%</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                        <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] font-mono uppercase font-bold">
                          Consensus Rank
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-extrabold text-white font-mono">#1</span>
                          <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] font-mono">/ 6 Models</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                        <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] font-mono uppercase font-bold">
                          Live Citations
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-extrabold text-indigo-400 font-mono">142</span>
                          <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] font-mono">8 Channels</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                        <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] font-mono uppercase font-bold">
                          AI Engines
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-extrabold text-cyan-400 font-mono">6/6</span>
                          <span className="text-[10px] text-emerald-400 font-bold">Live</span>
                        </div>
                      </div>
                    </div>

                    {/* Multi-Engine Score Breakdown Box */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Multi-Engine Score Breakdown</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">91% Consensus Average</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {[
                          { name: "ChatGPT Search (GPT-4o)", score: 92, badge: "Cited #1", color: "bg-emerald-400" },
                          { name: "Google Gemini (2.0 Flash)", score: 88, badge: "Cited #1", color: "bg-blue-400" },
                          { name: "Perplexity Sonar Pro", score: 94, badge: "Grounding Top 1", color: "bg-purple-400" },
                          { name: "Claude 3.7 Sonnet", score: 85, badge: "Key Recommendation", color: "bg-amber-400" },
                        ].map((eng, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-white font-medium truncate">{eng.name}</span>
                              <span className="font-mono text-emerald-400 font-bold">{eng.score}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                              <div className={`h-full rounded-full ${eng.color}`} style={{ width: `${eng.score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2. COMPETITORS TAB PREVIEW ───────────────────────────── */}
                {activeTab === "competitors" && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Head-to-Head Competitive Displacement</span>
                        </span>
                        <span className="text-[10px] font-mono text-indigo-300">4 Brands Monitored</span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { name: "Your Brand (QuerySonar)", score: 82, wins: "18/20 Queries", status: "Market Leader", isBrand: true },
                          { name: "Legacy Competitor Alpha", score: 64, wins: "11/20 Queries", status: "Displaced in Perplexity", isBrand: false },
                          { name: "Alternative Tool Beta", score: 52, wins: "7/20 Queries", status: "Citation Gap Detected", isBrand: false },
                        ].map((comp, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                              comp.isBrand
                                ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                                : "bg-white/5 border-white/5 text-neutral-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                comp.isBrand ? "bg-[#86EFAC] text-neutral-950" : "bg-white/10 text-neutral-300"
                              }`}>
                                {comp.name[0]}
                              </div>
                              <div>
                                <span className="font-bold block text-[11px] text-white">{comp.name}</span>
                                <span className="text-[10px] text-[var(--syn-muted,#94A3B8)]">{comp.status}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`font-mono font-bold block ${comp.isBrand ? "text-emerald-400" : "text-white"}`}>
                                {comp.score}% SOV
                              </span>
                              <span className="text-[9px] text-[var(--syn-muted,#94A3B8)] font-mono">{comp.wins}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 3. SOURCES TAB PREVIEW ───────────────────────────────── */}
                {activeTab === "sources" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>8-Channel Multi-Grounding Radar</span>
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300">142 Citations Verified</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { title: "Reddit & HackerNews", desc: "48 discussions cited across r/developer & r/marketing", icon: MessageSquare, badge: "Live Harvester", color: "text-orange-400" },
                        { title: "Google News & Digital PR", desc: "32 editorial articles cited in latest LLM updates", icon: Newspaper, badge: "Real-Time PR", color: "text-blue-400" },
                        { title: "Wikipedia & Knowledge Graph", desc: "Entity recognition & verified factual anchoring", icon: BookOpen, badge: "High Authority", color: "text-purple-400" },
                        { title: "Technical GEO & llms.txt", desc: "robots.txt allows GPTBot, ClaudeBot, PerplexityBot", icon: Code2, badge: "200 OK Validated", color: "text-emerald-400" },
                      ].map((src, i) => {
                        const Icon = src.icon;
                        return (
                          <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Icon className={`w-3.5 h-3.5 ${src.color}`} />
                                <span className="text-white font-bold text-[11px]">{src.title}</span>
                              </div>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                                {src.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-[var(--syn-muted,#94A3B8)] leading-relaxed">
                              {src.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── 4. QUERIES TAB PREVIEW ───────────────────────────────── */}
                {activeTab === "queries" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-emerald-400" />
                        <span>4-Persona AI Buyer Queries</span>
                      </span>
                      <span className="text-[10px] font-mono text-[var(--syn-muted,#94A3B8)]">Click query to probe</span>
                    </div>

                    {/* Query Pills Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      {personaQueries.map((pq, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPersonaQuery(idx)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            selectedPersonaQuery === idx
                              ? "bg-emerald-500/15 border-emerald-500/40 text-white shadow-xs"
                              : "bg-black/40 border-white/5 text-[var(--syn-muted,#94A3B8)] hover:text-white"
                          }`}
                        >
                          <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 block mb-0.5">
                            {pq.persona} Intent
                          </span>
                          <span className="text-[11px] font-medium leading-snug line-clamp-1 block text-white">
                            &ldquo;{pq.query}&rdquo;
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Active Probe Result Preview */}
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] border-b border-white/5 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Target Brand:</span>
                          <span className="text-emerald-400 font-bold">{personaQueries[selectedPersonaQuery].winner}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                          {personaQueries[selectedPersonaQuery].sov}% SOV ({personaQueries[selectedPersonaQuery].engines})
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed bg-white/5 p-2 rounded-lg font-sans">
                        {personaQueries[selectedPersonaQuery].engineNote}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── 5. ACTIONS TAB PREVIEW ───────────────────────────────── */}
                {activeTab === "actions" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tactical GEO Remediation Plan</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {completedActions.length}/4 Completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { id: "llmstxt", title: "Deploy standard /llms.txt at root domain", impact: "High Impact", effort: "5 mins", cat: "Technical GEO" },
                        { id: "robots", title: "Verify GPTBot & ClaudeBot in robots.txt", impact: "High Impact", effort: "2 mins", cat: "AI Crawlers" },
                        { id: "gemini", title: "Publish Comparison Battlecard for Gemini Answers", impact: "High Impact", effort: "15 mins", cat: "Displacement" },
                        { id: "reddit", title: "Seed authoritative verified FAQ on Reddit", impact: "Medium Impact", effort: "10 mins", cat: "Community" },
                      ].map((act) => {
                        const isDone = completedActions.includes(act.id);
                        return (
                          <div
                            key={act.id}
                            onClick={() => toggleAction(act.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                              isDone
                                ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                                : "bg-black/40 border-white/5 text-[var(--syn-muted,#94A3B8)] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                                isDone
                                  ? "bg-[#86EFAC] text-neutral-950 border-[#86EFAC] font-bold shadow-xs"
                                  : "border-white/20 bg-black/30"
                              }`}>
                                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div>
                                <span className={`font-semibold block text-[11px] ${isDone ? "text-white line-through opacity-80" : "text-white"}`}>
                                  {act.title}
                                </span>
                                <span className="text-[9px] text-[var(--syn-muted,#94A3B8)]">{act.cat} · {act.effort}</span>
                              </div>
                            </div>

                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 shrink-0">
                              {act.impact}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Glow / Multi-Engine Live Probing Bar */}
            <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-[var(--syn-muted,#94A3B8)]">Active Engines:</span>
                <AIEngineRow className="flex items-center gap-2" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Probes Active
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Legal Footer */}
      <div className="max-w-[1280px] w-full mx-auto text-center text-xs text-[var(--syn-muted,#64748B)] py-2">
        {t("footer.rights")}
      </div>
    </div>
  );
}
