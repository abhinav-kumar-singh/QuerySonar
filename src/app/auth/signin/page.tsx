"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  Globe,
  Search,
  Zap,
  Check,
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Smile,
  Bot,
  MessageSquare,
  Newspaper,
  BookOpen,
  Code2,
  ChevronRight,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { AIEngineRow } from "@/components/ui/ai-engine-icons";
import {
  V2RadialSpokeSpeedometer,
  V2TricolorCapsulePill,
  V2EqualizerLadderMatrix,
  V2CitationEcosystemRing,
} from "@/app/dashboard/components/dashboard-v2-charts";

export default function SignInPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Step: "email" | "otp"
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Cooldown countdown timer for resending OTP
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Interactive Mini QuerySonar App State
  const [activeTab, setActiveTab] = useState<
    "overview" | "competitors" | "sources" | "queries" | "actions"
  >("overview");

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
      setAuthError(null);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err: any) {
      console.error("Sign in error:", err);
      setAuthError("Failed to connect with Google. Please try again.");
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setAuthError("Please provide your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to send login code. Please try again.");
        setLoading(false);
        return;
      }

      setStep("otp");
      setAuthSuccess(t("auth.loginCodeSentSuccess") || "6-digit verification code sent to your inbox.");
      setCooldown(30);
    } catch (err: any) {
      console.error("Send OTP error:", err);
      setAuthError("Failed to send login code. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setAuthError(null);
    setAuthSuccess(null);

    const trimmedEmail = email.trim().toLowerCase();
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to resend code.");
      } else {
        setAuthSuccess(t("auth.loginCodeSentSuccess") || "6-digit verification code sent to your inbox.");
        setCooldown(30);
      }
    } catch (err: any) {
      setAuthError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otpCode.trim();

    if (trimmedOtp.length !== 6) {
      setAuthError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: trimmedEmail,
        code: trimmedOtp,
        redirect: false,
      });

      if (res?.error) {
        setAuthError("Invalid or expired login code. Please check the code or request a new one.");
        setLoading(false);
        return;
      }

      setAuthSuccess("Authentication successful! Redirecting to dashboard...");
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Sign in error:", err);
      setAuthError("Failed to verify code. Please try again.");
      setLoading(false);
    }
  };

  const personaQueries = [
    {
      persona: "Discovery",
      query: "What is the best AI search optimization platform for marketing teams?",
      winner: "QuerySonar",
      sov: 94,
      engines: "6/6 Cited",
      engineNote: "ChatGPT and Perplexity cite QuerySonar as the leading GEO platform with real-time multi-engine citation tracking.",
      models: [
        { name: "ChatGPT Search (GPT-4o)", rank: "#1 Pick", citation: "Leading enterprise platform with deterministic multi-engine monitoring." },
        { name: "Perplexity Sonar Pro", rank: "#1 Pick", citation: "Deep citation tracing across Reddit, News, and Knowledge Graphs." },
      ],
    },
    {
      persona: "Comparison",
      query: "QuerySonar vs traditional SEO tools for ChatGPT and Perplexity",
      winner: "QuerySonar",
      sov: 88,
      engines: "6/6 Cited",
      engineNote: "Consensus highlights deterministic multi-engine probing and 8-channel citation verification.",
      models: [
        { name: "ChatGPT Search", rank: "#1 Pick", citation: "Outperforms traditional keyword-based scrapers with LLM grounding analysis." },
        { name: "Claude 3.7 Sonnet", rank: "#1 Pick", citation: "Full visibility into LLM training corpus displacement." },
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
        { name: "Google Gemini 2.0", rank: "#1 Pick", citation: "Step-by-step /llms.txt syntax generator and validation toolkit." },
        { name: "ChatGPT Search", rank: "#1 Pick", citation: "GPTBot and PerplexityBot permission verification in real time." },
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
        { name: "Claude 3.7 Sonnet", rank: "#1 Pick", citation: "Daily automated drift monitoring with webhook integrations." },
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

  const resolutionRate = Math.round((completedActions.length / 4) * 100);

  return (
    <div className="v2 synetica-shell w-full flex-1 flex flex-col justify-center items-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-[var(--syn-bg)] text-[var(--syn-text)]">
      {/* Large Expansive Split Screen Card */}
      <div className="max-w-[1480px] w-full mx-auto">
        <div className="rounded-3xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[780px] lg:min-h-[820px]">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT COLUMN: PASSWORDLESS OTP AUTHENTICATION (Zero Layout Shift)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-between h-full min-h-[660px] border-b lg:border-b-0 lg:border-r border-[var(--syn-border)] bg-[var(--syn-card)]">
            <div className="my-auto py-2 w-full">
              
              {/* Form Title & Context Badge (Locked Height min-h-[110px]) */}
              <div className="mb-6 min-h-[110px] flex flex-col justify-start">
                <span className="v2-badge-pill mb-2.5 text-xs font-mono uppercase tracking-wider !bg-emerald-500/10 !text-emerald-500 dark:!text-emerald-400 !border-emerald-500/20 px-3 py-1 w-fit">
                  {step === "otp" ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Email Verification
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      {t("auth.badgeIntelligence")}
                    </>
                  )}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--syn-heading)] mb-2 min-h-[40px] flex items-center">
                  {step === "otp"
                    ? t("auth.checkInboxTitle")
                    : t("auth.passwordlessTitle")}
                </h1>
                <p className="text-base text-[var(--syn-muted)] leading-relaxed min-h-[48px]">
                  {step === "otp" ? (
                    <>
                      {t("auth.checkInboxDesc")}{" "}
                      <strong className="text-[var(--syn-heading)]">{email}</strong>.
                    </>
                  ) : (
                    t("auth.passwordlessSubtitle")
                  )}
                </p>
              </div>

              {/* Error or Success Alerts */}
              {authError && (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* STEP 1: EMAIL ENTRY */}
              {step === "email" ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--syn-heading)] block">
                      {t("auth.emailLabel")}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[var(--syn-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        placeholder={t("auth.emailPlaceholder")}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[var(--syn-input-border)] bg-[var(--syn-input-bg)] text-[var(--syn-input-text)] text-sm placeholder:text-[var(--syn-subtle)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-neutral-950 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                        <span>{t("auth.sendingLoginCode")}</span>
                      </>
                    ) : (
                      <>
                        <span>{t("auth.continueWithEmail")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="my-6 flex items-center gap-3">
                    <div className="flex-1 h-px bg-[var(--syn-border)]" />
                    <span className="text-xs text-[var(--syn-subtle)] uppercase tracking-wider font-mono">
                      {t("auth.orContinueWith")}
                    </span>
                    <div className="flex-1 h-px bg-[var(--syn-border)]" />
                  </div>

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[var(--syn-card-inner)] hover:bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] text-[var(--syn-heading)] text-sm font-semibold shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
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
                </form>
              ) : (
                /* STEP 2: 6-DIGIT OTP VERIFICATION */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--syn-heading)] block">
                        {t("auth.enterLoginCode")}
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-[var(--syn-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoFocus
                          required
                          value={otpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setOtpCode(val);
                            if (authError) setAuthError(null);
                          }}
                          placeholder={t("auth.otpPlaceholder") || "123456"}
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[var(--syn-input-border)] bg-[var(--syn-input-bg)] text-[var(--syn-input-text)] text-lg font-mono font-bold tracking-[0.35em] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-[var(--syn-subtle)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Resend Code Controls */}
                    <div className="flex items-center justify-end text-xs text-[var(--syn-muted)] pt-1">
                      {cooldown > 0 ? (
                        <span className="text-[var(--syn-subtle)] font-mono">
                          {t("auth.resendCode")} ({cooldown}s)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isResending}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                          {isResending ? t("auth.resendingCode") : t("auth.resendCode")}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-neutral-950 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                        <span>{t("auth.verifyingCode")}</span>
                      </>
                    ) : (
                      <>
                        <span>{t("auth.verifyAndSignInBtn")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Back to email link */}
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setOtpCode("");
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      ← {t("auth.backToEmail") || "Back"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Terms Footer */}
            <div className="mt-6 pt-4 border-t border-[var(--syn-border)] text-center">
              <p className="text-xs text-[var(--syn-subtle)]">
                {t("footer.rights")} · <Link href="/terms" className="hover:underline">{t("footer.terms")}</Link> · <Link href="/privacy" className="hover:underline">{t("footer.privacy")}</Link>
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT COLUMN: FULL QUERYSONAR V2 DASHBOARD INTERACTIVE PREVIEW
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 bg-[var(--syn-card-subtle)] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Interactive App Header with Synetica Navigation Pills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-[var(--syn-border)] flex-wrap gap-2">
                {/* 5 Real QuerySonar Navigation Tabs (Overview, Competitors, Sources, Queries, Actions) */}
                <div className="flex items-center gap-1 bg-[var(--syn-card-inner)] p-1 rounded-full border border-[var(--syn-border)]">
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
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-emerald-500 text-neutral-950 font-bold shadow-xs"
                            : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card)]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-[var(--syn-muted)]">
                    Interactive Live Demo
                  </span>
                </div>
              </div>

              {/* Mini App Content Area - Consistent Zero-Shift Height */}
              <div className="min-h-[520px] flex flex-col justify-between">

                {/* ── 1. OVERVIEW TAB PREVIEW (Full V2 Speedometer + Consensus Ladder + Sentiment) ── */}
                {activeTab === "overview" && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    {/* 4 Bento KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] flex flex-col justify-between shadow-xs">
                        <span className="text-[10px] text-[var(--syn-muted)] font-mono uppercase font-bold">
                          Share of Voice
                        </span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">82%</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+12%</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] flex flex-col justify-between shadow-xs">
                        <span className="text-[10px] text-[var(--syn-muted)] font-mono uppercase font-bold">
                          Consensus Rank
                        </span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-2xl font-extrabold text-[var(--syn-heading)] font-mono">#1</span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-mono">/ 6 Models</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] flex flex-col justify-between shadow-xs">
                        <span className="text-[10px] text-[var(--syn-muted)] font-mono uppercase font-bold">
                          Live Citations
                        </span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">142</span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-mono">8 Channels</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] flex flex-col justify-between shadow-xs">
                        <span className="text-[10px] text-[var(--syn-muted)] font-mono uppercase font-bold">
                          Technical GEO
                        </span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">94</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">/ 100</span>
                        </div>
                      </div>
                    </div>

                    {/* V2 Chart Dual Row: Speedometer + Multi-Engine Equalizer Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Left: V2 Radial Spoke Speedometer */}
                      <div className="sm:col-span-5 p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] flex flex-col justify-between shadow-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-[var(--syn-border)]">
                          <span className="text-xs font-bold text-[var(--syn-heading)] flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Share of Voice</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Top 1 Pick</span>
                        </div>
                        <div className="py-2">
                          <V2RadialSpokeSpeedometer value={82} max={100} size={200} subtitle="Average Visibility" />
                        </div>
                        <div className="text-center text-[10px] font-mono text-[var(--syn-muted)]">
                          Hover spoke to inspect percentile
                        </div>
                      </div>

                      {/* Right: Multi-Engine Consensus Equalizer Ladder */}
                      <div className="sm:col-span-7 p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] flex flex-col justify-between shadow-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-[var(--syn-border)]">
                          <span className="text-xs font-bold text-[var(--syn-heading)] flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Engine Consensus Matrix</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">6/6 Models Active</span>
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
                    <div className="p-3.5 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-2 shadow-xs">
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-[var(--syn-border)]">
                        <span className="font-bold text-[var(--syn-heading)] flex items-center gap-1.5">
                          <Smile className="w-3.5 h-3.5 text-emerald-500" />
                          <span>AI Sentiment Distribution</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">83% Positive Dominance</span>
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
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-3 shadow-xs">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--syn-border)]">
                        <span className="font-bold text-[var(--syn-heading)] flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Head-to-Head Competitive Displacement</span>
                        </span>
                        <span className="text-[10px] font-mono text-indigo-500">4 Brands Monitored</span>
                      </div>

                      {/* Interactive Competitors List */}
                      <div className="space-y-2.5">
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
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-[var(--syn-heading)]"
                                  : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] text-[var(--syn-heading)] hover:border-[var(--syn-border-hover)]"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                                  comp.isBrand ? "bg-[#86EFAC] text-neutral-950" : "bg-[var(--syn-card)] border border-[var(--syn-border)] text-[var(--syn-heading)]"
                                }`}>
                                  {comp.name[0]}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold block text-sm text-[var(--syn-heading)]">{comp.name}</span>
                                    {comp.isBrand && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                        Your Brand
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-[var(--syn-muted)]">
                                    {comp.status} · {comp.channels}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right flex items-center gap-3">
                                <div>
                                  <span className={`font-mono font-bold block text-sm ${comp.isBrand ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--syn-heading)]"}`}>
                                    {comp.sov}% SOV
                                  </span>
                                  <span className="text-[10px] text-[var(--syn-muted)] font-mono">{comp.wins}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[var(--syn-muted)]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detail Breakdown for Selected Competitor */}
                      <div className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[var(--syn-heading)]">
                            Engine Visibility Breakdown: {competitorsList[selectedCompetitorIdx].name}
                          </span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {competitorsList[selectedCompetitorIdx].sentiment} Sentiment
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {Object.entries(competitorsList[selectedCompetitorIdx].engines).map(([engKey, score]) => (
                            <div key={engKey} className="p-2.5 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] text-center">
                              <span className="text-[9px] uppercase font-mono text-[var(--syn-muted)] block">
                                {engKey}
                              </span>
                              <span className="text-sm font-mono font-bold text-[var(--syn-heading)] mt-0.5 block">
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
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    {/* V2 Citation Ecosystem Ring */}
                    <div className="p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-xs">
                      <V2CitationEcosystemRing
                        pressCount={12}
                        reviewsCount={10}
                        appStoresCount={8}
                        videoCount={14}
                        highImpactCount={38}
                        totalSources={44}
                      />
                    </div>

                    {/* 4 Grounding Breakdown Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { title: "Reddit & HackerNews", desc: "48 discussions cited across r/developer & r/marketing", icon: MessageSquare, badge: "Live Harvester", color: "text-orange-500" },
                        { title: "Google News & Press", desc: "32 editorial articles cited in latest LLM updates", icon: Newspaper, badge: "Real-Time PR", color: "text-blue-500" },
                        { title: "Technical GEO & llms.txt", desc: "robots.txt allows GPTBot, ClaudeBot, PerplexityBot", icon: Code2, badge: "200 OK Validated", color: "text-emerald-500" },
                        { title: "G2 Review Hubs", desc: "18 verified software reviews ingested by Perplexity", icon: BookOpen, badge: "Buyer Intent", color: "text-amber-500" },
                      ].map((src, i) => {
                        const Icon = src.icon;
                        return (
                          <div key={i} className="p-3.5 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1.5 shadow-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${src.color}`} />
                                <span className="text-[var(--syn-heading)] font-bold text-xs">{src.title}</span>
                              </div>
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)]">
                                {src.badge}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
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
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--syn-heading)] pb-2 border-b border-[var(--syn-border)]">
                      <span className="flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-emerald-500" />
                        <span>4-Persona AI Buyer Query Probes</span>
                      </span>
                      <span className="text-[10px] font-mono text-[var(--syn-muted)]">Click query to probe models</span>
                    </div>

                    {/* Query Pills Selection */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {personaQueries.map((pq, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPersonaQuery(idx)}
                          className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                            selectedPersonaQuery === idx
                              ? "bg-emerald-500/15 border-emerald-500 text-[var(--syn-heading)] shadow-xs"
                              : "bg-[var(--syn-card)] border-[var(--syn-border)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:border-[var(--syn-border-hover)]"
                          }`}
                        >
                          <span className="text-[9px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                            {pq.persona} Intent
                          </span>
                          <span className="text-xs font-semibold leading-snug line-clamp-1 block text-[var(--syn-heading)]">
                            &ldquo;{pq.query}&rdquo;
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Active Probe Result Preview with Real Model Breakdown */}
                    <div className="p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-3 shadow-xs">
                      <div className="flex items-center justify-between text-xs border-b border-[var(--syn-border)] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--syn-heading)]">Target Brand:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{personaQueries[selectedPersonaQuery].winner}</span>
                        </div>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {personaQueries[selectedPersonaQuery].sov}% SOV ({personaQueries[selectedPersonaQuery].engines})
                        </span>
                      </div>

                      <p className="text-xs text-[var(--syn-text)] leading-relaxed bg-[var(--syn-card-inner)] p-3 rounded-xl font-sans border border-[var(--syn-border)]">
                        {personaQueries[selectedPersonaQuery].engineNote}
                      </p>

                      {/* Multi-Model Specific Grounding Quotes */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-mono uppercase text-[var(--syn-muted)] block font-semibold">
                          Live Engine Grounding Transcripts:
                        </span>
                        {personaQueries[selectedPersonaQuery].models.map((m, mIdx) => (
                          <div key={mIdx} className="p-2.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-start justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                              <span className="font-bold text-[var(--syn-heading)] block">{m.name}:</span>
                              <span className="text-[11px] text-[var(--syn-muted)] leading-tight block">
                                &ldquo;{m.citation}&rdquo;
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold shrink-0 border border-emerald-500/20">
                              {m.rank}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 5. ACTIONS TAB PREVIEW (Matched Height with Interactive Checklist) ── */}
                {activeTab === "actions" && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    {/* Top Resolution Summary Header Card */}
                    <div className="p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] flex items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-center gap-3.5">
                        {/* Circular Resolution Ring */}
                        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                          <svg width="56" height="56" viewBox="0 0 56 56" className="overflow-visible">
                            <circle cx="28" cy="28" r="22" fill="none" stroke="var(--syn-border)" strokeWidth="5" />
                            <circle
                              cx="28"
                              cy="28"
                              r="22"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="5"
                              strokeDasharray={`${(resolutionRate / 100) * 138.2} 138.2`}
                              strokeLinecap="round"
                              transform="rotate(-90 28 28)"
                              className="transition-all duration-300"
                            />
                          </svg>
                          <span className="absolute font-mono font-extrabold text-sm text-[var(--syn-heading)]">
                            {resolutionRate}%
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[var(--syn-heading)] block">GEO Remediation Progress</span>
                          <span className="text-xs text-[var(--syn-muted)] font-mono">{completedActions.length} of 4 Tasks Completed</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                          <span className="text-[9px] font-mono text-red-500 uppercase font-bold block">Critical</span>
                          <span className="text-sm font-mono font-extrabold text-red-500">2 Tasks</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                          <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold block">Resolved</span>
                          <span className="text-sm font-mono font-extrabold text-emerald-500">{completedActions.length} Done</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive 4 Action Battlecards */}
                    <div className="p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--syn-heading)] pb-1.5 border-b border-[var(--syn-border)]">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Click Any Task to Toggle Remediation</span>
                        </span>
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {4 - completedActions.length} Tasks in Queue
                        </span>
                      </div>

                      <div className="space-y-2.5 pt-1">
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
                              className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                                isDone
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-[var(--syn-heading)]"
                                  : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:border-[var(--syn-border-hover)]"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                                  isDone
                                    ? "bg-[#86EFAC] text-neutral-950 border-[#86EFAC] font-bold shadow-xs"
                                    : "border-[var(--syn-border)] bg-[var(--syn-card)]"
                                }`}>
                                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <div>
                                  <span className={`font-semibold block text-xs ${isDone ? "text-[var(--syn-heading)] line-through opacity-80" : "text-[var(--syn-heading)]"}`}>
                                    {act.title}
                                  </span>
                                  <span className="text-[10px] text-[var(--syn-muted)]">{act.cat} · {act.effort}</span>
                                </div>
                              </div>

                              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
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
            <div className="mt-4 p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] flex items-center justify-between text-xs flex-wrap gap-2 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[var(--syn-muted)]">Active Engines:</span>
                <AIEngineRow className="flex items-center gap-2" />
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live V2 Probes Active
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
