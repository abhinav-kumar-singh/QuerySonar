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
  Trophy,
  Smile,
  ShieldCheck,
  Star,
  Smartphone,
  Video,
  AlertTriangle,
  Info,
  Radio,
  FileText,
  Clock,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AIEngineRow } from "@/components/ui/ai-engine-icons";
import {
  V2RadialSpokeSpeedometer,
  V2CapsulePlacementStack,
  V2TricolorCapsulePill,
  V2SegmentedDonutRing,
  V2EngineQueryHeatmapGrid,
  V2OptimizationPlaybookCapsules,
  V2EqualizerLadderMatrix,
  V2CitationEcosystemRing,
} from "@/app/dashboard/components/dashboard-v2-charts";

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

  // Selected sub-engine filter in preview
  const [selectedEngineFilter, setSelectedEngineFilter] = useState<string>("all");

  // Interactive Query tab selection
  const [selectedPersonaQuery, setSelectedPersonaQuery] = useState<number>(0);

  // Interactive Competitor selection
  const [selectedCompetitorIdx, setSelectedCompetitorIdx] = useState<number>(0);

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
      engineNote: "ChatGPT and Perplexity cite QuerySonar as the leading GEO platform with real-time citation telemetry.",
      models: [
        { name: "ChatGPT Search", rank: "#1 Pick", citation: "Leading enterprise platform with deterministic multi-engine monitoring." },
        { name: "Perplexity Sonar", rank: "#1 Pick", citation: "Deep citation tracing across Reddit, News, and Knowledge Graphs." },
        { name: "Google Gemini", rank: "#1 Pick", citation: "Automated remediation battlecards & llms.txt validation." },
      ],
    },
    {
      persona: "Comparison",
      query: "QuerySonar vs traditional SEO tools for ChatGPT and Perplexity",
      winner: "QuerySonar",
      sov: 88,
      engines: "6/6 Cited",
      engineNote: "Consensus highlights deterministic multi-engine probing and multi-channel citation verification.",
      models: [
        { name: "ChatGPT Search", rank: "#1 Pick", citation: "Outperforms traditional keyword-based scrapers with LLM grounding analysis." },
        { name: "Perplexity Sonar", rank: "#2 Pick", citation: "Direct prompt-injection-safe evaluation of brand sentiment." },
        { name: "Claude Sonnet", rank: "#1 Pick", citation: "Full visibility into LLM training corpus displacement." },
      ],
    },
    {
      persona: "Technical GEO",
      query: "How to configure /llms.txt and robots.txt for AI search crawlers",
      winner: "QuerySonar",
      sov: 91,
      engines: "5/6 Cited",
      engineNote: "Google Gemini and Claude cite QuerySonar's automated AI crawler indexability validator.",
      models: [
        { name: "Google Gemini", rank: "#1 Pick", citation: "Step-by-step /llms.txt syntax generator and validation toolkit." },
        { name: "ChatGPT Search", rank: "#1 Pick", citation: "GPTBot and PerplexityBot permission verification in real time." },
        { name: "DeepSeek", rank: "#2 Pick", citation: "Schema.org structured data grounding indexer." },
      ],
    },
    {
      persona: "Enterprise",
      query: "Enterprise generative search monitoring with multi-workspace support",
      winner: "QuerySonar",
      sov: 86,
      engines: "6/6 Cited",
      engineNote: "DeepSeek and Grok confirm real-time drift alerts & automated weekly competitive digests.",
      models: [
        { name: "Perplexity Sonar", rank: "#1 Pick", citation: "Multi-seat agency workspaces with role-based access control." },
        { name: "Claude Sonnet", rank: "#1 Pick", citation: "Daily automated drift monitoring with webhook integrations." },
        { name: "Google Gemini", rank: "#1 Pick", citation: "Automated executive reporting and PDF export pipeline." },
      ],
    },
  ];

  const competitorsList = [
    {
      name: "Your Brand (QuerySonar)",
      sov: 82,
      wins: "19/20 Queries",
      sentiment: "94% Positive",
      status: "Market Dominant",
      isBrand: true,
      channels: "8/8 Active",
      engines: { chatgpt: 94, gemini: 88, perplexity: 92, claude: 85 },
    },
    {
      name: "Legacy Search Platform Alpha",
      sov: 64,
      wins: "11/20 Queries",
      sentiment: "78% Positive",
      status: "Displaced in Perplexity",
      isBrand: false,
      channels: "5/8 Active",
      engines: { chatgpt: 68, gemini: 62, perplexity: 58, claude: 70 },
    },
    {
      name: "SaaS Challenger Beta",
      sov: 52,
      wins: "7/20 Queries",
      sentiment: "65% Neutral",
      status: "Citation Gap Detected",
      isBrand: false,
      channels: "4/8 Active",
      engines: { chatgpt: 50, gemini: 55, perplexity: 48, claude: 56 },
    },
    {
      name: "Niche Tool Gamma",
      sov: 38,
      wins: "3/20 Queries",
      sentiment: "58% Neutral",
      status: "Missing /llms.txt",
      isBrand: false,
      channels: "2/8 Active",
      engines: { chatgpt: 40, gemini: 35, perplexity: 32, claude: 45 },
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--syn-bg,#0B0F17)] text-[var(--syn-text,#F8FAFC)] flex flex-col justify-between p-3 sm:p-6 lg:p-8">
      {/* Top Header Bar */}
      <div className="max-w-[1360px] w-full mx-auto flex items-center justify-between py-2">
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
      <div className="max-w-[1360px] w-full mx-auto my-4 flex-1 flex flex-col justify-center">
        <div className="rounded-3xl bg-[var(--syn-card,#111827)] border border-[var(--syn-border,rgba(255,255,255,0.08))] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT COLUMN: AUTHENTICATION / LOGIN FORM
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--syn-border,rgba(255,255,255,0.08))] bg-[var(--syn-card,#111827)]">
            <div>
              {/* Form Title */}
              <div className="mb-6">
                <span className="v2-badge-pill mb-3 text-[10px] font-mono uppercase tracking-wider !bg-emerald-500/10 !text-emerald-400 !border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  {t("auth.badgeIntelligence")}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--syn-heading,#FFFFFF)] mb-2">
                  {t("auth.readyToDominate")}
                </h1>
                <p className="text-xs text-[var(--syn-muted,#94A3B8)] leading-relaxed">
                  {t("auth.signInDesc")}
                </p>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-3.5">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--syn-input-border,rgba(255,255,255,0.12))] bg-[var(--syn-input-bg,#0B0F17)] text-[var(--syn-input-text,#F8FAFC)] text-xs placeholder:text-[var(--syn-muted,#64748B)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--syn-input-border,rgba(255,255,255,0.12))] bg-[var(--syn-input-bg,#0B0F17)] text-[var(--syn-input-text,#F8FAFC)] text-xs placeholder:text-[var(--syn-muted,#64748B)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-neutral-950 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {t("auth.signInBtn")}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
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
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--syn-card-inner,#1E293B)] hover:bg-[var(--syn-card-subtle,#334155)] border border-[var(--syn-border,rgba(255,255,255,0.1))] text-[var(--syn-heading,#FFFFFF)] text-xs font-semibold shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
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
              <div className="mt-4 text-center">
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
            <div className="mt-6 pt-4 border-t border-[var(--syn-border,rgba(255,255,255,0.08))] text-center">
              <p className="text-[11px] text-[var(--syn-muted,#64748B)]">
                {t("footer.rights")} · <Link href="/terms" className="hover:underline">{t("footer.terms")}</Link> · <Link href="/privacy" className="hover:underline">{t("footer.privacy")}</Link>
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT COLUMN: FULL QUERYSONAR V2 DASHBOARD INTERACTIVE PREVIEW
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 bg-[var(--syn-bg,#0B0F17)]/95 p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Interactive App Header with Synetica Navigation Pills */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--syn-muted,#94A3B8)]">
                    QuerySonar V2 Live Platform
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
              <div className="max-h-[520px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">

                {/* ── 1. OVERVIEW TAB PREVIEW (Full V2 Speedometer + Consensus Ladder + Sentiment) ── */}
                {activeTab === "overview" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {/* 4 Bento KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          Technical GEO
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-extrabold text-cyan-400 font-mono">94</span>
                          <span className="text-[10px] text-emerald-400 font-bold">/ 100</span>
                        </div>
                      </div>
                    </div>

                    {/* V2 Chart Dual Row: Speedometer + Multi-Engine Equalizer Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Left: V2 Radial Spoke Speedometer */}
                      <div className="sm:col-span-5 p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-1 border-b border-white/5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Share of Voice</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">Top 1 Pick</span>
                        </div>
                        <div className="py-1">
                          <V2RadialSpokeSpeedometer value={82} max={100} size={180} subtitle="Average Visibility" />
                        </div>
                        <div className="text-center text-[10px] font-mono text-[var(--syn-muted,#94A3B8)]">
                          Hover spoke to inspect percentile
                        </div>
                      </div>

                      {/* Right: Multi-Engine Consensus Equalizer Ladder */}
                      <div className="sm:col-span-7 p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Engine Consensus Matrix</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">6/6 Models Active</span>
                        </div>
                        <div className="py-1">
                          <V2EqualizerLadderMatrix
                            engines={[
                              { name: "ChatGPT (GPT-4o)", score: 94, model: "SearchGPT", color: "#10B981" },
                              { name: "Google Gemini", score: 88, model: "2.0 Flash", color: "#3B82F6" },
                              { name: "Perplexity Sonar", score: 92, model: "Sonar Pro", color: "#8B5CF6" },
                              { name: "Claude 3.7 Sonnet", score: 85, model: "Sonnet Thinking", color: "#F59E0B" },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    {/* V2 Sentiment Breakdown Donut Bar */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Smile className="w-3.5 h-3.5 text-emerald-400" />
                          <span>AI Sentiment Distribution</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">83% Positive Dominance</span>
                      </div>
                      <V2TricolorCapsulePill
                        positivePct={83}
                        neutralPct={17}
                        negativePct={0}
                        positiveCount={15}
                        neutralCount={3}
                        negativeCount={0}
                      />
                    </div>
                  </div>
                )}

                {/* ── 2. COMPETITORS TAB PREVIEW (Displacement Analysis & Head-to-Head) ── */}
                {activeTab === "competitors" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/5">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Head-to-Head Competitive Displacement</span>
                        </span>
                        <span className="text-[10px] font-mono text-indigo-300">4 Brands Monitored</span>
                      </div>

                      {/* Interactive Competitors List */}
                      <div className="space-y-2">
                        {competitorsList.map((comp, idx) => {
                          const isSelected = selectedCompetitorIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedCompetitorIdx(idx)}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-emerald-500/15 border-emerald-500 shadow-xs scale-[1.01]"
                                  : comp.isBrand
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-white"
                                  : "bg-white/5 border-white/5 text-neutral-300 hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  comp.isBrand ? "bg-[#86EFAC] text-neutral-950" : "bg-white/10 text-neutral-300"
                                }`}>
                                  {comp.name[0]}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold block text-xs text-white">{comp.name}</span>
                                    {comp.isBrand && (
                                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                                        Your Brand
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[var(--syn-muted,#94A3B8)]">
                                    {comp.status} · {comp.channels}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right flex items-center gap-3">
                                <div>
                                  <span className={`font-mono font-bold block text-xs ${comp.isBrand ? "text-emerald-400" : "text-white"}`}>
                                    {comp.sov}% SOV
                                  </span>
                                  <span className="text-[9px] text-[var(--syn-muted,#94A3B8)] font-mono">{comp.wins}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[var(--syn-muted,#94A3B8)]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detail Breakdown for Selected Competitor */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white">
                            Engine Visibility Breakdown: {competitorsList[selectedCompetitorIdx].name}
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {competitorsList[selectedCompetitorIdx].sentiment} Sentiment
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {Object.entries(competitorsList[selectedCompetitorIdx].engines).map(([engKey, score]) => (
                            <div key={engKey} className="p-2 rounded-lg bg-black/40 border border-white/5 text-center">
                              <span className="text-[9px] uppercase font-mono text-[var(--syn-muted,#94A3B8)] block">
                                {engKey}
                              </span>
                              <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                                {score}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 3. SOURCES TAB PREVIEW (Ecosystem Ring + 8 Channel Grid) ── */}
                {activeTab === "sources" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {/* V2 Citation Ecosystem Ring */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                      <V2CitationEcosystemRing
                        pressCount={12}
                        reviewsCount={10}
                        appStoresCount={8}
                        videoCount={14}
                        highImpactCount={38}
                        totalSources={44}
                      />
                    </div>

                    {/* 8-Channel Grounding Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { title: "Reddit & HackerNews", desc: "48 discussions cited across r/developer & r/marketing", icon: MessageSquare, badge: "Live Harvester", color: "text-orange-400" },
                        { title: "Google News & Press", desc: "32 editorial articles cited in latest LLM updates", icon: Newspaper, badge: "Real-Time PR", color: "text-blue-400" },
                        { title: "Wikipedia & Knowledge Graph", desc: "Entity recognition & verified factual anchoring", icon: BookOpen, badge: "High Authority", color: "text-purple-400" },
                        { title: "Technical GEO & llms.txt", desc: "robots.txt allows GPTBot, ClaudeBot, PerplexityBot", icon: Code2, badge: "200 OK Validated", color: "text-emerald-400" },
                        { title: "G2 & Capterra Review Hubs", desc: "18 verified software reviews ingested by Perplexity Pro", icon: Star, badge: "Buyer Intent", color: "text-amber-400" },
                        { title: "YouTube & Video Transcripts", desc: "14 tutorial transcripts parsed by Gemini & SearchGPT", icon: Video, badge: "Multimodal", color: "text-rose-400" },
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

                {/* ── 4. QUERIES TAB PREVIEW (4-Persona AI Intent Queries & LLM Transcripts) ── */}
                {activeTab === "queries" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-white pb-1 border-b border-white/5">
                      <span className="flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-emerald-400" />
                        <span>4-Persona AI Buyer Query Probes</span>
                      </span>
                      <span className="text-[10px] font-mono text-[var(--syn-muted,#94A3B8)]">Click query to probe models</span>
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

                    {/* Active Probe Result Preview with Real Model Breakdown */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs border-b border-white/5 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Target Brand:</span>
                          <span className="text-emerald-400 font-bold">{personaQueries[selectedPersonaQuery].winner}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                          {personaQueries[selectedPersonaQuery].sov}% SOV ({personaQueries[selectedPersonaQuery].engines})
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-300 leading-relaxed bg-white/5 p-2.5 rounded-xl font-sans">
                        {personaQueries[selectedPersonaQuery].engineNote}
                      </p>

                      {/* Multi-Model Specific Grounding Quotes */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono uppercase text-[var(--syn-muted,#94A3B8)] block font-semibold">
                          Live Engine Grounding Transcripts:
                        </span>
                        {personaQueries[selectedPersonaQuery].models.map((m, mIdx) => (
                          <div key={mIdx} className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-start justify-between gap-2 text-[11px]">
                            <div className="space-y-0.5">
                              <span className="font-bold text-white block">{m.name}:</span>
                              <span className="text-[10px] text-[var(--syn-muted,#94A3B8)] leading-tight block">
                                &ldquo;{m.citation}&rdquo;
                              </span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold shrink-0">
                              {m.rank}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 5. ACTIONS TAB PREVIEW (Interactive Remediation Battlecards & Playbook) ── */}
                {activeTab === "actions" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {/* V2 Optimization Playbook Component */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                      <V2OptimizationPlaybookCapsules
                        actions={[
                          { id: "1", priority: "high", title: "Deploy standard /llms.txt at root domain", isCompleted: completedActions.includes("llmstxt"), estimatedImpact: "+18% Visibility" },
                          { id: "2", priority: "high", title: "Verify GPTBot & ClaudeBot in robots.txt", isCompleted: completedActions.includes("robots"), estimatedImpact: "+24% Indexability" },
                          { id: "3", priority: "high", title: "Publish Comparison Battlecard for Gemini Answers", isCompleted: completedActions.includes("gemini"), estimatedImpact: "+15% Citations" },
                          { id: "4", priority: "medium", title: "Seed authoritative verified FAQ on Reddit", isCompleted: completedActions.includes("reddit"), estimatedImpact: "+12% Community SOV" },
                        ]}
                      />
                    </div>

                    {/* Interactive Checklist with Clickable Remediation Tasks */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white pb-1 border-b border-white/5">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Tactical GEO Remediation Checklist</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {completedActions.length}/4 Tasks Completed
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {[
                          { id: "llmstxt", title: "Deploy standard /llms.txt at root domain", impact: "+18% AI SOV", effort: "5 mins", cat: "Technical GEO" },
                          { id: "robots", title: "Verify GPTBot & ClaudeBot in robots.txt", impact: "+24% Crawlers", effort: "2 mins", cat: "AI Indexing" },
                          { id: "gemini", title: "Publish Comparison Battlecard for Gemini", impact: "+15% Consensus", effort: "15 mins", cat: "Displacement" },
                          { id: "reddit", title: "Seed authoritative verified FAQ on Reddit", impact: "+12% Citations", effort: "10 mins", cat: "Community Grounding" },
                        ].map((act) => {
                          const isDone = completedActions.includes(act.id);
                          return (
                            <div
                              key={act.id}
                              onClick={() => toggleAction(act.id)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                                isDone
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                                  : "bg-white/5 border-white/5 text-[var(--syn-muted,#94A3B8)] hover:text-white hover:border-white/20"
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

                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400 shrink-0">
                                {act.impact}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Glow / Multi-Engine Live Probing Bar */}
            <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-[var(--syn-muted,#94A3B8)]">Active Engines:</span>
                <AIEngineRow className="flex items-center gap-2" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live V2 Probes Active
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Legal Footer */}
      <div className="max-w-[1360px] w-full mx-auto text-center text-xs text-[var(--syn-muted,#64748B)] py-2">
        {t("footer.rights")}
      </div>
    </div>
  );
}

