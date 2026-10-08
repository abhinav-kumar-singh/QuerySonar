"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Eye,
  Globe2,
  Crosshair,
  Newspaper,
  BookOpen,
  Code2,
  Smartphone,
  Video,
  MessageSquare,
  Layers,
  Bot,
  Tag,
  FileText,
  Globe,
  Building2,
  ShieldCheck,
  RotateCcw,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { savePendingScan, saveAuditFormDraft } from "@/lib/audit-storage";
import type { CategoryItem } from "@/components/dashboard/category-query-flow";
import {
  RevealOnScroll,
  CountUp,
  HeroDashboard,
} from "@/components/landing/components";
import { HeroRadarAtmosphere } from "@/components/landing/hero-radar-art";
import { FanCarousel } from "@/components/landing/fan-carousel";
import { AIEngineRow } from "@/components/ui/ai-engine-icons";
import { useTranslation } from "@/lib/i18n/language-context";
import { PlaceAutocomplete } from "@/components/ui/place-autocomplete";
import { TypewriterEffectSmooth } from "@/components/dashboard/welcome-v2";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const { t } = useTranslation();
  const router = useRouter();

  const handleAuthAction = () => {
    if (session?.user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin");
    }
  };

  // Helpers to normalize domain & brand
  const cleanDomainString = (raw: string): string => {
    let clean = raw.trim();
    if (!clean) return "";
    clean = clean.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
    return clean;
  };

  const deriveBrandFromDomain = (domain: string): string => {
    const cleaned = cleanDomainString(domain);
    const host = cleaned.split("/")[0] || cleaned;
    const parts = host.split(".");
    if (parts.length > 0 && parts[0]) {
      const name = parts[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return "Brand";
  };

  type ScanStep = "domain" | "extracting" | "verification" | "location" | "category";

  const pillColorClasses = [
    "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold",
    "border-teal-500/40 bg-teal-500/15 text-teal-800 dark:text-teal-300 font-semibold",
    "border-purple-500/40 bg-purple-500/15 text-purple-800 dark:text-purple-300 font-semibold",
    "border-blue-500/40 bg-blue-500/15 text-blue-800 dark:text-blue-300 font-semibold",
    "border-cyan-500/40 bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-semibold",
    "border-violet-500/40 bg-violet-500/15 text-violet-800 dark:text-violet-300 font-semibold",
    "border-indigo-500/40 bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 font-semibold",
    "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold",
  ];

  // Message-Type Scan State
  const [scanStep, setScanStep] = useState<ScanStep>("domain");
  const [domainInput, setDomainInput] = useState("");
  const [domainInputError, setDomainInputError] = useState("");
  const [brand, setBrand] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState(1);
  const [isEditingVerification, setIsEditingVerification] = useState(false);
  const [isExpandedSummary, setIsExpandedSummary] = useState(false);
  const [editBrandName, setEditBrandName] = useState("");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState("");
  const [editMarket, setEditMarket] = useState("Global · English");
  const [detectedMarket, setDetectedMarket] = useState("Global · English");
  const [aliases, setAliases] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>([]);
  const [brandSummary, setBrandSummary] = useState<string>("");
  const [detectedCompetitors, setDetectedCompetitors] = useState<string[]>([]);

  const cleanDomain = cleanDomainString(websiteUrl || domainInput);
  const faviconUrl = cleanDomain && cleanDomain.includes(".")
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain)}&sz=64`
    : "";

  const maxCategories = 3; // Free Tier Limit
  const scanSectionRef = useRef<HTMLElement>(null);

  // Submit Domain & Trigger Autonomous AI Extraction
  const handleDomainSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDomainInputError("");

    const cleaned = cleanDomainString(domainInput);
    if (!cleaned || cleaned.length < 3) {
      setDomainInputError(t("landing.discoveryError") || "Please enter a valid website domain");
      return;
    }

    const fullUrl = domainInput.startsWith("http://") || domainInput.startsWith("https://")
      ? domainInput.trim()
      : `https://${cleaned}`;

    setWebsiteUrl(fullUrl);
    const derived = deriveBrandFromDomain(cleaned);
    setBrand(derived);
    setEditBrandName(derived);
    setEditWebsiteUrl(fullUrl);

    setScanStep("extracting");
    setIsExtracting(true);
    setExtractionStage(1);

    const timer1 = setTimeout(() => setExtractionStage(2), 1100);
    const timer2 = setTimeout(() => setExtractionStage(3), 2200);

    try {
      const res = await fetch("/api/categories/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: derived,
          websiteUrl: fullUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const disc = data.data;
        const finalBrand =
          disc.brandName && disc.brandName.toLowerCase() !== "www"
            ? disc.brandName
            : derived;
        setBrand(finalBrand);
        setEditBrandName(finalBrand);
        if (disc.summary) setBrandSummary(disc.summary);
        if (Array.isArray(disc.categories) && disc.categories.length > 0) {
          setCategories(disc.categories);
          const autoSelected = disc.categories
            .filter((c: CategoryItem) => c.isAutoSelected)
            .map((c: CategoryItem) => c.name);
          const initial =
            autoSelected.length > 0
              ? autoSelected.slice(0, maxCategories)
              : disc.categories.slice(0, maxCategories).map((c: CategoryItem) => c.name);
          setSelectedCategoryNames(initial);
        }
        if (Array.isArray(disc.detectedCompetitors)) {
          setDetectedCompetitors(disc.detectedCompetitors);
        }
        if (disc.detectedMarket) {
          setDetectedMarket(disc.detectedMarket);
          setEditMarket(disc.detectedMarket);
        }
        if (Array.isArray(disc.aliases) && disc.aliases.length > 0) {
          setAliases(disc.aliases);
        } else {
          setAliases([finalBrand]);
        }
      } else {
        setAliases([derived]);
      }
    } catch {
      setAliases([derived]);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsExtracting(false);
      setScanStep("verification");
    }
  };

  const handleConfirmVerification = () => {
    if (!targetLocation) {
      if (/india/i.test(detectedMarket)) setTargetLocation("India");
      else if (/united states|usa|us\b/i.test(detectedMarket)) setTargetLocation("United States");
      else if (/europe|uk|germany|france/i.test(detectedMarket)) setTargetLocation("Europe");
      else setTargetLocation("Global");
    }
    setScanStep("location");
  };

  const handleSelectLocation = (loc: string) => {
    setTargetLocation(loc);
    setScanStep("category");
  };

  const handleResetScan = () => {
    setScanStep("domain");
    setDomainInput("");
    setBrand("");
    setWebsiteUrl("");
    setTargetLocation("");
    setCategories([]);
    setSelectedCategoryNames([]);
    setBrandSummary("");
    setDetectedCompetitors([]);
    setIsEditingVerification(false);
  };

  const handleToggleCategory = (catName: string) => {
    if (selectedCategoryNames.includes(catName)) {
      setSelectedCategoryNames(selectedCategoryNames.filter((n) => n !== catName));
    } else {
      if (selectedCategoryNames.length >= maxCategories) return;
      setSelectedCategoryNames([...selectedCategoryNames, catName]);
    }
  };

  const handleGenerateQueriesAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveBrand = brand.trim() || deriveBrandFromDomain(domainInput);
    if (!effectiveBrand || selectedCategoryNames.length === 0) return;

    const chosenCategories = categories.filter((c) => selectedCategoryNames.includes(c.name));
    const primaryCat = selectedCategoryNames[0] || effectiveBrand;

    // Persist draft form state for instant hydration post-login
    saveAuditFormDraft({
      brandName: effectiveBrand,
      websiteUrl: websiteUrl.trim(),
      targetLocation: targetLocation.trim() || undefined,
      queriesList: [],
      categories: chosenCategories,
      brandSummary,
      detectedCompetitors,
      category: primaryCat,
    });

    // Save pending scan intent
    savePendingScan({
      brand: effectiveBrand,
      websiteUrl: websiteUrl.trim(),
      targetLocation: targetLocation.trim() || undefined,
      query: `Best ${primaryCat} solutions & alternatives`,
      queries: selectedCategoryNames.map((c) => `Best ${c} tools & alternatives`),
      category: primaryCat,
      competitors: detectedCompetitors,
    });

    if (session?.user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin?callbackUrl=/dashboard");
    }
  };

  const faqs = [
    [t("landing.faq1Q"), t("landing.faq1A")],
    [t("landing.faq2Q"), t("landing.faq2A")],
    [t("landing.faq3Q"), t("landing.faq3A")],
    [t("landing.faq4Q"), t("landing.faq4A")],
  ];

  const plans = [
    {
      name: t("landing.freePlanName"),
      price: "$0",
      period: t("landing.freePlanPeriod"),
      annualNote: t("landing.freePlanNote"),
      desc: t("landing.freePlanDesc"),
      creditsInfo: t("landing.freePlanCredits"),
      features: [
        t("landing.freeFeat1"),
        t("landing.freeFeat2"),
        t("landing.freeFeat3"),
        t("landing.freeFeat4"),
        t("landing.freeFeat5"),
        t("landing.freeFeat6"),
      ],
      cta: t("landing.freePlanCta"),
      featured: false,
      href: "#scan",
    },
    {
      name: t("landing.starterPlanName"),
      price: "$19",
      period: t("landing.starterPlanPeriod"),
      annualNote: t("landing.starterPlanNote"),
      desc: t("landing.starterPlanDesc"),
      creditsInfo: t("landing.starterPlanCredits"),
      features: [
        t("landing.starterFeat1"),
        t("landing.starterFeat2"),
        t("landing.starterFeat3"),
        t("landing.starterFeat4"),
        t("landing.starterFeat5"),
        t("landing.starterFeat6"),
        t("landing.starterFeat7"),
        t("landing.starterFeat8"),
        t("landing.starterFeat9"),
      ],
      cta: t("landing.starterPlanCta"),
      featured: true,
      href: "/auth/signin",
    },
    {
      name: t("landing.growthPlanName"),
      price: "$49",
      period: t("landing.growthPlanPeriod"),
      annualNote: t("landing.growthPlanNote"),
      desc: t("landing.growthPlanDesc"),
      creditsInfo: t("landing.growthPlanCredits"),
      features: [
        t("landing.growthFeat1"),
        t("landing.growthFeat2"),
        t("landing.growthFeat3"),
        t("landing.growthFeat4"),
        t("landing.growthFeat5"),
        t("landing.growthFeat6"),
        t("landing.growthFeat7"),
        t("landing.growthFeat8"),
        t("landing.growthFeat9"),
      ],
      cta: t("landing.growthPlanCta"),
      featured: false,
      href: "/auth/signin",
    },
  ];

  return (
    <div className="v2">
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION (Split: Value Prop + Synetica Interactive UI)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        {/* Full-bleed Radar Atmosphere Backdrop */}
        <HeroRadarAtmosphere />

        <section className="v2-hero v2-wrap relative z-10">
          <div className="v2-hero-copy">
            <RevealOnScroll index={0}>
              <div className="telemetry-bar">
                <span className="v2-badge-pill">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t("landing.badge")}
                </span>
                <span className="v2-badge-pill">{t("common.allEngines")}</span>
                <span className="v2-badge-pill ml-auto font-mono text-[11px] text-emerald-500 border-emerald-500/20 bg-emerald-500/10">
                  LIVE TELEMETRY
                </span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll index={1}>
              <h1>
                {t("landing.heroTitle1")}
                <br />
                <span className="text-emerald-500 underline decoration-emerald-400/40">
                  {t("landing.heroTitle2")}
                </span>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll index={2}>
              <p className="hero-sub">
                {t("landing.heroSubtitle")}
              </p>
            </RevealOnScroll>

            <RevealOnScroll index={3}>
              <div className="hero-actions">
                <a
                  className="v2-hero-cta group cursor-pointer"
                  href="#scan"
                  onClick={(e) => {
                    e.preventDefault();
                    const scanElem = document.getElementById("scan");
                    if (scanElem) {
                      scanElem.scrollIntoView({ behavior: "smooth", block: "start" });
                      setTimeout(() => {
                        document.getElementById("brand-input")?.focus();
                      }, 500);
                    }
                  }}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>{t("landing.runScanBtn")}</span>
                  <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a
                  className="v2-btn v2-btn-secondary cursor-pointer"
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t("landing.seeHowItWorks")} <ArrowDown size={16} />
                </a>
              </div>
              <p className="hero-trust">
                <Check size={16} /> {t("landing.freeFirstScan")}
                <span className="mx-1">·</span>
                {t("landing.noCreditCard")}
                <span className="mx-1">·</span>
                {t("landing.resultsFast")}
              </p>
            </RevealOnScroll>
          </div>

          <RevealOnScroll index={2} className="hero-dash-reveal">
            <HeroDashboard />
          </RevealOnScroll>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ENGINE STRIP ("One question. A wider perspective.")
          ═══════════════════════════════════════════════════════════════ */}
      <section className="v2-engine-strip">
        <div className="v2-wrap engine-strip-inner">
          <span className="engine-strip-caption">
            {t("landing.engineStripOneQuestion")}
            <br />
            <strong>{t("landing.engineStripPerspectives")}</strong>
          </span>
          <div className="engine-strip-providers flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="engine-item">
              <Globe2 />
              <span>ChatGPT</span>
            </div>
            <div className="engine-item">
              <Sparkles />
              <span>Gemini</span>
            </div>
            <div className="engine-item">
              <Crosshair />
              <span>Perplexity</span>
            </div>
            <div className="engine-item">
              <MessageSquare />
              <span>Claude</span>
            </div>
            <div className="engine-item">
              <Layers />
              <span>DeepSeek</span>
            </div>
            <div className="engine-item">
              <Zap />
              <span>Grok</span>
            </div>
          </div>
          <small className="engine-strip-disclaimer">
            {t("landing.engineStripConsensus")}
          </small>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. METRICS STRIP (Synetica Card Strip)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="v2-metrics">
        <div className="v2-wrap">
          <div className="metrics-inner">
            <RevealOnScroll className="metric-item" index={0}>
              <CountUp end={12000} suffix="+" />
              <span className="metric-label whitespace-pre-line">
                {t("landing.metricAnswers")}
              </span>
            </RevealOnScroll>
            <RevealOnScroll className="metric-item" index={1}>
              <CountUp end={6} />
              <span className="metric-label whitespace-pre-line">
                {t("landing.metricEngines")}
              </span>
            </RevealOnScroll>
            <RevealOnScroll className="metric-item" index={2}>
              <CountUp end={30} prefix="< " suffix="s" />
              <span className="metric-label whitespace-pre-line">
                {t("landing.metricScanTime")}
              </span>
            </RevealOnScroll>
            <RevealOnScroll className="metric-item" index={3}>
              <CountUp end={0} prefix="" suffix="" />
              <span className="metric-label whitespace-pre-line">
                {t("landing.metricSetup")}
              </span>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. FAN CAROUSEL: THREE AUDIT DIMENSIONS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="v2-fan-section v2-wrap">
        <div className="v2-section-head text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3">
            {t("landing.fanEyebrow")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-tight mb-4">
            {t("landing.fanTitle")}
          </h2>
          <p className="subhead text-base text-[var(--syn-muted)] leading-relaxed">
            {t("landing.fanSubtitle")}
          </p>
        </div>
        <FanCarousel />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. BENTO GRID FEATURES
          ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="v2-features v2-wrap py-20">
        <div className="v2-section-head text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3">
            {t("landing.bentoEyebrow")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-tight mb-4">
            {t("landing.bentoTitle1")}
            <br />
            <span className="text-emerald-500 font-extrabold">{t("landing.bentoTitle2")}</span>
          </h2>
          <p className="subhead text-base text-[var(--syn-muted)] leading-relaxed">
            {t("landing.bentoSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Multi-Engine Concurrent Probing (Spans 2 columns) */}
          <RevealOnScroll className="syn-card col-span-1 md:col-span-2 lg:col-span-2 p-8 flex flex-col justify-between" index={0}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="v2-badge-pill">
                  <Sparkles size={13} className="text-emerald-500" />
                  {t("landing.bentoCard1Badge")}
                </span>
                <span className="font-mono text-xs text-[var(--syn-muted)]">{t("landing.bentoCard1Sub")}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] mb-3">
                {t("landing.bentoCard1Title")}
              </h3>
              <p className="text-sm text-[var(--syn-muted)] leading-relaxed max-w-2xl">
                {t("landing.bentoCard1Desc")}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-[var(--syn-heading)] truncate">ChatGPT-4o</span>
                <span className="ml-auto font-mono text-[10px] font-bold text-emerald-500">{t("common.statusLive")}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs font-semibold text-[var(--syn-heading)] truncate">Gemini 2.5 Pro</span>
                <span className="ml-auto font-mono text-[10px] font-bold text-blue-500">{t("common.statusLive")}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
                <span className="text-xs font-semibold text-[var(--syn-heading)] truncate">Perplexity Sonar</span>
                <span className="ml-auto font-mono text-[10px] font-bold text-violet-500">{t("common.statusLive")}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-[var(--syn-heading)] truncate">Claude 3.5 Sonnet</span>
                <span className="ml-auto font-mono text-[10px] font-bold text-amber-500">{t("common.statusLive")}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                <span className="text-xs font-semibold text-[var(--syn-heading)] truncate">DeepSeek V3 / R1</span>
                <span className="ml-auto font-mono text-[10px] font-bold text-cyan-500">{t("common.statusLive")}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="text-xs font-semibold text-[var(--syn-heading)] truncate">xAI Grok-2</span>
                <span className="ml-auto font-mono text-[10px] font-bold text-purple-500">{t("common.statusLive")}</span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 2: Citation Graph (Spans 1 column) */}
          <RevealOnScroll className="syn-card p-8 flex flex-col justify-between" index={1}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="v2-badge-pill">
                  <Eye size={13} className="text-blue-500" />
                  {t("landing.bentoCard2Badge")}
                </span>
                <span className="font-mono text-xs text-[var(--syn-muted)]">{t("landing.bentoCard2Sub")}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] mb-3">
                {t("landing.bentoCard2Title")}
              </h3>
              <p className="text-sm text-[var(--syn-muted)] leading-relaxed">
                {t("landing.bentoCard2Desc")}
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <div className="p-2.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] text-xs flex items-center justify-between">
                <span className="truncate max-w-[170px] text-[var(--syn-heading)] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Reddit r/SaaS Discussion
                </span>
                <span className="text-[10px] text-emerald-500 font-mono font-bold">▲ 142 upvotes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] text-xs flex items-center justify-between">
                <span className="truncate max-w-[170px] text-[var(--syn-heading)] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> TechCrunch PR Feature
                </span>
                <span className="text-[10px] text-blue-400 font-mono font-bold">Google News</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] text-xs flex items-center justify-between">
                <span className="truncate max-w-[170px] text-[var(--syn-heading)] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Wikipedia Entity
                </span>
                <span className="text-[10px] text-purple-400 font-mono font-bold">High Authority</span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 3: Action Cards (Spans 1 column) */}
          <RevealOnScroll className="syn-card p-8 flex flex-col justify-between" index={2}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="v2-badge-pill">
                  <Zap size={13} className="text-amber-500" />
                  {t("landing.bentoCard3Badge")}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] mb-3">
                {t("landing.bentoCard3Title")}
              </h3>
              <p className="text-sm text-[var(--syn-muted)] leading-relaxed">
                {t("landing.bentoCard3Desc")}
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)]">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--syn-heading)]">
                <span>{t("landing.bentoCard3Action")}</span>
                <span className="text-amber-500 text-[10px] uppercase font-mono font-bold">{t("landing.bentoCard3Impact")}</span>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] mt-1.5">
                {t("landing.bentoCard3ActionDesc")}
              </p>
            </div>
          </RevealOnScroll>

          {/* Card 4: Historical Drift (Spans 2 columns) */}
          <RevealOnScroll className="syn-card col-span-1 md:col-span-2 lg:col-span-2 p-8 flex flex-col justify-between" index={3}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="v2-badge-pill">
                  <Shield size={13} className="text-emerald-500" />
                  {t("landing.bentoCard4Badge")}
                </span>
                <span className="font-mono text-xs text-[var(--syn-muted)]">{t("landing.bentoCard4Sub")}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--syn-heading)] mb-3">
                {t("landing.bentoCard4Title")}
              </h3>
              <p className="text-sm text-[var(--syn-muted)] leading-relaxed max-w-2xl">
                {t("landing.bentoCard4Desc")}
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border-subtle)] flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--syn-heading)] font-semibold">{t("landing.bentoCard4Protocol")}</span>
              <span className="text-emerald-500 font-bold">{t("landing.bentoCard4Threshold")}</span>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. MULTI-CHANNEL GROUNDING NETWORK & TECHNICAL AUDIT
          ═══════════════════════════════════════════════════════════════ */}
      <section className="v2-grounding-section v2-wrap py-20 border-t border-[var(--syn-border)]">
        <div className="v2-section-head text-center max-w-3xl mx-auto mb-14">
          <span className="eyebrow inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            GROUNDING INTELLIGENCE NETWORK
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-tight mb-4">
            {t("landing.sourcesTitle")}
          </h2>
          <p className="subhead text-base text-[var(--syn-muted)] leading-relaxed">
            {t("landing.sourcesSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Channel 1: Reddit & HackerNews */}
          <div className="syn-card p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="syn-badge syn-badge-emerald text-[10px]">Live Harvester</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--syn-heading)] mb-1">{t("landing.channelReddit")}</h4>
              <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
                {t("landing.channelRedditDesc")}
              </p>
            </div>
          </div>

          {/* Channel 2: Google News & Digital PR */}
          <div className="syn-card p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Newspaper className="w-4 h-4" />
              </div>
              <span className="syn-badge syn-badge-emerald text-[10px]">Real-Time PR</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--syn-heading)] mb-1">{t("landing.channelNews")}</h4>
              <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
                {t("landing.channelNewsDesc")}
              </p>
            </div>
          </div>

          {/* Channel 3: Wikipedia & Knowledge Graph */}
          <div className="syn-card p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="syn-badge syn-badge-emerald text-[10px]">High Authority</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--syn-heading)] mb-1">{t("landing.channelWiki")}</h4>
              <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
                {t("landing.channelWikiDesc")}
              </p>
            </div>
          </div>

          {/* Channel 4: Stack Overflow & GitHub */}
          <div className="syn-card p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="syn-badge syn-badge-emerald text-[10px]">Developer Mindshare</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--syn-heading)] mb-1">{t("landing.channelDev")}</h4>
              <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
                {t("landing.channelDevDesc")}
              </p>
            </div>
          </div>

          {/* Channel 5: Apple App Store & Reviews */}
          <div className="syn-card p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="syn-badge syn-badge-emerald text-[10px]">Public Ratings</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--syn-heading)] mb-1">{t("landing.channelApp")}</h4>
              <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
                {t("landing.channelAppDesc")}
              </p>
            </div>
          </div>

          {/* Channel 6: YouTube Video Grounding */}
          <div className="syn-card p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                <Video className="w-4 h-4" />
              </div>
              <span className="syn-badge syn-badge-emerald text-[10px]">Multi-Modal AI</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--syn-heading)] mb-1">{t("landing.channelVideo")}</h4>
              <p className="text-xs text-[var(--syn-muted)] leading-relaxed">
                {t("landing.channelVideoDesc")}
              </p>
            </div>
          </div>

          {/* Channel 7 & 8 (Spans 2 columns): Technical AI Crawler & llms.txt */}
          <div className="syn-card col-span-1 sm:col-span-2 p-5 flex flex-col justify-between border-emerald-500/30 bg-emerald-500/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--syn-heading)]">{t("landing.channelTech")}</h4>
                  <span className="text-[10px] text-emerald-500 font-mono font-bold">Instant On-Page Check</span>
                </div>
              </div>
              <span className="syn-badge syn-badge-emerald text-[10px]">robots.txt + llms.txt</span>
            </div>
            <p className="text-xs text-[var(--syn-muted)] leading-relaxed mb-3">
              {t("landing.channelTechDesc")}
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2 py-1 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]">{t("landing.groundingPill1")}</span>
              <span className="px-2 py-1 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]">{t("landing.groundingPill2")}</span>
              <span className="px-2 py-1 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]">{t("landing.groundingPill3")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. THREE-STEP PROCESS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="v2-how py-20">
        <div className="v2-wrap">
          <div className="v2-section-head text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3">
              {t("landing.howItWorksEyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-tight mb-4">
              {t("landing.howItWorksTitle")}
            </h2>
            <p className="subhead text-base text-[var(--syn-muted)] leading-relaxed">
              {t("landing.featuresSectionSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RevealOnScroll className="syn-card p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform" index={0}>
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-500 mb-4">01</div>
                <h3 className="text-xl font-bold text-[var(--syn-heading)] mb-2">{t("landing.step1Title")}</h3>
                <p className="text-sm text-[var(--syn-muted)] leading-relaxed">
                  {t("landing.step1Desc")}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll className="syn-card p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform" index={1}>
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-500 mb-4">02</div>
                <h3 className="text-xl font-bold text-[var(--syn-heading)] mb-2">{t("landing.step2Title")}</h3>
                <p className="text-sm text-[var(--syn-muted)] leading-relaxed">
                  {t("landing.step2Desc")}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll className="syn-card p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform" index={2}>
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-500 mb-4">03</div>
                <h3 className="text-xl font-bold text-[var(--syn-heading)] mb-2">{t("landing.step3Title")}</h3>
                <p className="text-sm text-[var(--syn-muted)] leading-relaxed">
                  {t("landing.step3Desc")}
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. INSTANT LIVE AUDIT SCANNER (Interactive Product Feature)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="scan" ref={scanSectionRef} className="v2-scan v2-wrap py-24 relative">
        {/* Subtle radial ambient backdrop glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="v2-section-head text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("landing.scanSectionEyebrow")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-tight mb-4 flex items-center justify-center">
            <TypewriterEffectSmooth
              words={t("landing.scanSectionTitle")
                .split(" ")
                .map((word, idx, arr) => ({
                  text: word,
                  className: idx >= arr.length - 2 ? "text-emerald-500 dark:text-emerald-400" : "text-[var(--syn-heading)]",
                }))}
              duration={1.1}
              delay={0.1}
              cursorClassName="h-8 sm:h-10 lg:h-12 bg-emerald-500"
            />
          </h2>
          <p className="subhead text-base text-[var(--syn-muted)] leading-relaxed">
            {t("landing.scanSectionSubtitle")}
          </p>
        </div>

        {/* ── UNIFIED COMMAND & MESSAGE STREAM (ON BACKGROUND) ── */}
        <div className="max-w-4xl mx-auto space-y-6 relative">
          {/* Pre-Input Info Header */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{t("common.allEngines")}</span>
              <span className="opacity-40">•</span>
              <span className="font-normal text-[var(--syn-muted)]">
                {t("dashboard.welcomeV2LiveSynthesis")}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--syn-muted)]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{t("dashboard.welcomeV2EstimateTime")}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{t("dashboard.welcomeV2PublicOnly")}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold shadow-2xs">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>{t("dashboard.welcomeV2Free")}</span>
              </span>
            </div>
          </div>

          {/* STAGE 1: Domain Ingestion Command Bar */}
          <form onSubmit={handleDomainSubmit} className="space-y-3">
            <div className="relative group p-1.5 rounded-2xl bg-[var(--syn-card)] border-2 border-[var(--syn-border)] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-md shadow-black/5 transition-all">
              <div className="relative flex items-center">
                <div className="pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[var(--syn-muted)] group-focus-within:text-emerald-500 transition-colors">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                </div>
                <input
                  type="text"
                  disabled={isExtracting || scanStep !== "domain"}
                  value={domainInput}
                  onChange={(e) => {
                    setDomainInput(e.target.value);
                    if (domainInputError) setDomainInputError("");
                  }}
                  placeholder={t("dashboard.welcomeV2EnterWebsitePlaceholder") || "Enter your domain (e.g. acme.com or https://...)"}
                  style={{ outline: "none", boxShadow: "none" }}
                  className={`w-full pl-3.5 pr-36 sm:pr-44 py-3 sm:py-3.5 bg-transparent text-[var(--syn-heading)] text-sm sm:text-base placeholder:text-[var(--syn-subtle)] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0 border-none font-mono ${
                    scanStep !== "domain" ? "opacity-90 cursor-default" : ""
                  }`}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {scanStep === "domain" ? (
                    <button
                      type="submit"
                      disabled={!domainInput.trim() || isExtracting}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t("dashboard.welcomeV2AnalyzingBtn") || "Analyzing..."}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("dashboard.welcomeV2AnalyzeBtn") || "Analyze Website"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 pr-1">
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Live Verified
                      </span>
                      <button
                        type="button"
                        onClick={handleResetScan}
                        className="px-3 py-1.5 rounded-xl bg-[var(--syn-card-inner)] hover:bg-emerald-500/10 border border-[var(--syn-border)] hover:border-emerald-500/30 text-[var(--syn-muted)] hover:text-emerald-500 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Change domain"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t("landing.changeDomainBtn")}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {domainInputError && (
              <p className="text-xs text-red-500 font-medium pl-2 mt-2 animate-in fade-in">
                {domainInputError}
              </p>
            )}
          </form>

          {/* STAGE 2: Autonomous AI Extraction Stream */}
          {scanStep === "extracting" && (
            <div className="py-2 space-y-4 relative z-10 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--syn-heading)]">
                    {t("dashboard.welcomeV2StepExtractingTitle") || "Reading Public Site & Metadata"}
                  </h3>
                  <p className="text-xs text-[var(--syn-muted)]">
                    {t("dashboard.welcomeV2AnalyzingDomain") || "Inspecting site & extracting brand verticals..."}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 font-mono text-xs">
                <div className="flex items-center gap-2.5 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t("dashboard.welcomeV2ConnectedTo") || "Connected to"} {cleanDomainString(domainInput)}</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-all ${extractionStage >= 2 ? "text-emerald-500" : "text-[var(--syn-muted)]"}`}>
                  {extractionStage >= 2 ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-emerald-500/70" />
                  )}
                  <span>{t("dashboard.welcomeV2ExtractingPersonas") || "Extracting value proposition & customer personas..."}</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-all ${extractionStage >= 3 ? "text-emerald-500" : "text-[var(--syn-muted)]"}`}>
                  {extractionStage >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-dashed border-[var(--syn-border)] shrink-0" />
                  )}
                  <span>{t("dashboard.welcomeV2SynthesizingQueries") || "Synthesizing high-converting buyer search queries across 6 AI models..."}</span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: Verification Card ("Does this look right?") */}
          {(scanStep === "verification" || scanStep === "location" || scanStep === "category") && (
            <div className="space-y-4 pt-2 relative z-10 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-[var(--syn-heading)]">
                  {t("dashboard.welcomeV2DoesThisLookRight")}
                </h3>
                {scanStep !== "verification" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>

              <div className="w-full rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] p-5 sm:p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-neutral-950 border border-[var(--syn-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {faviconUrl ? (
                        <img
                          src={faviconUrl}
                          alt={brand}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-emerald-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-[var(--syn-heading)] leading-snug truncate">
                        {brand}
                      </h4>
                      <p className="text-xs text-[var(--syn-muted)] font-mono truncate">
                        {websiteUrl || domainInput}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingVerification(!isEditingVerification)}
                    className="px-3.5 py-1.5 rounded-full border border-[var(--syn-border)] hover:border-emerald-500/50 bg-[var(--syn-card-inner)] hover:bg-[var(--syn-card-subtle)] text-xs font-semibold text-[var(--syn-heading)] transition-all cursor-pointer"
                  >
                    {t("dashboard.welcomeV2Edit")}
                  </button>
                </div>

                {/* Details Rows */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 pt-1">
                  <span className="text-xs font-medium text-[var(--syn-muted)] w-24 sm:w-28 shrink-0">
                    {t("dashboard.welcomeV2WhatYouDo")}
                  </span>
                  <div className="flex-1 space-y-1">
                    <h5 className="text-sm font-bold text-[var(--syn-heading)]">
                      {t("dashboard.welcomeV2AboutBrand", { brand })}
                    </h5>
                    <p className={`text-xs text-[var(--syn-muted)] leading-relaxed ${isExpandedSummary ? "" : "line-clamp-2"}`}>
                      {brandSummary || `${brand} is a market leader delivering solutions to customers worldwide.`}
                    </p>
                    {brandSummary && brandSummary.length > 100 && (
                      <button
                        type="button"
                        onClick={() => setIsExpandedSummary(!isExpandedSummary)}
                        className="text-xs font-semibold text-emerald-500 hover:underline pt-0.5 cursor-pointer block"
                      >
                        {isExpandedSummary ? t("dashboard.welcomeV2ShowLess") : t("dashboard.welcomeV2ShowMore")}
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 pt-2">
                  <span className="text-xs font-medium text-[var(--syn-muted)] w-24 sm:w-28 shrink-0 pt-1">
                    {t("dashboard.welcomeV2CategoriesLabel")}
                  </span>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {categories.slice(0, 8).map((cat, idx) => (
                      <span
                        key={cat.id || idx}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold ${pillColorClasses[idx % pillColorClasses.length]}`}
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detected Competitors */}
                {detectedCompetitors.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 pt-2 border-t border-[var(--syn-border)]/60">
                    <span className="text-xs font-medium text-[var(--syn-muted)] w-24 sm:w-28 shrink-0">
                      {t("landing.detectedCompetitorsLabel")}
                    </span>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {detectedCompetitors.map((comp, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2.5 py-1 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-xs text-[var(--syn-heading)] font-medium"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {scanStep === "verification" && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmVerification}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t("dashboard.welcomeV2YesLooksRight")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetScan}
                    className="px-4 py-2.5 rounded-xl border border-[var(--syn-border)] hover:bg-[var(--syn-card-inner)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] text-xs font-semibold cursor-pointer transition-all"
                  >
                    <span>{t("dashboard.welcomeV2NoEditDetails")}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STAGE 4 & 5: Conversational AI Agent Stream */}
          {(scanStep === "location" || scanStep === "category") && (
            <div className="space-y-6 pt-4 relative z-10 animate-in fade-in duration-300">
              {/* MESSAGE 1: AI WEBSITE ANALYSIS & LOCATION INQUIRY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--syn-heading)] flex items-center gap-1.5">
                        <span>AI Market Intelligence Agent</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <span className="text-[10px] text-[var(--syn-subtle)] font-mono">
                        Website Diagnostics & Market Calibration
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    Step 1 of 2
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-[var(--syn-heading)] leading-relaxed space-y-1.5 max-w-3xl">
                  <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    ✦ Analysis for {brand}:
                  </p>
                  <p className="text-[var(--syn-muted)] leading-relaxed">
                    I analyzed {cleanDomainString(websiteUrl || domainInput)} and identified your brand as {brand}. {brandSummary || "Your website delivers specialized digital products and services to buyers worldwide."} To analyze how ChatGPT, Google Gemini, Perplexity, Claude, DeepSeek, and Grok recommend {brand} to active buyers, where are your primary customers located?
                  </p>
                </div>

                {/* Location Selector or Confirmed Bubble */}
                {scanStep === "location" ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: t("dashboard.welcomeV2LocationGlobal") || "Global / Worldwide", val: "Global" },
                        { label: t("dashboard.welcomeV2LocationUS") || "United States & Canada", val: "United States" },
                        { label: t("dashboard.welcomeV2LocationEU") || "Europe & UK", val: "Europe" },
                        { label: t("dashboard.welcomeV2LocationIndia") || "India & South Asia", val: "India" },
                        { label: t("dashboard.welcomeV2LocationAPAC") || "Asia Pacific", val: "Asia Pacific" },
                      ].map((loc) => (
                        <button
                          key={loc.val}
                          type="button"
                          onClick={() => handleSelectLocation(loc.val)}
                          className="px-4 py-2 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] hover:border-emerald-500 hover:text-emerald-500 text-xs font-semibold text-[var(--syn-heading)] transition-all cursor-pointer shadow-2xs"
                        >
                          {loc.label}
                        </button>
                      ))}
                    </div>

                    <div className="w-full pt-1">
                      <PlaceAutocomplete
                        value={targetLocation}
                        onChange={(loc) => {
                          if (loc) handleSelectLocation(loc);
                        }}
                        className="w-full"
                        label=""
                        sublabel=""
                        placeholder={t("landing.targetMarketPlaceholder")}
                        inputClassName="w-full py-2.5 rounded-xl border-[var(--syn-border)] bg-[var(--syn-card)] text-xs shadow-2xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-1 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[var(--syn-card)] border border-emerald-500/30 text-xs shadow-xs">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[var(--syn-muted)] font-mono">Market:</span>
                      <strong className="text-[var(--syn-heading)] font-bold">{targetLocation}</strong>
                      <button
                        type="button"
                        onClick={() => setScanStep("location")}
                        className="ml-2 text-[11px] text-emerald-500 hover:underline font-mono cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MESSAGE 2: CATEGORY SELECTION */}
              {scanStep === "category" && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between pb-1 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--syn-heading)] flex items-center gap-1.5">
                          <span>Business Vertical Classifier</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-[var(--syn-subtle)] font-mono">
                          Semantic Product Taxonomy
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold border border-teal-500/20">
                      Step 2 of 2
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-[var(--syn-heading)] leading-relaxed space-y-1.5 max-w-3xl">
                    <p className="font-mono text-teal-600 dark:text-teal-400 font-bold text-xs">
                      ✦ Taxonomies identified for {brand}:
                    </p>
                    <p className="text-[var(--syn-muted)] leading-relaxed">
                      Calibrating search models for {targetLocation}. Based on your website's products and positioning, I discovered the following business categories for {brand}. Select up to {maxCategories} business verticals to audit:
                    </p>
                  </div>

                  {/* Interactive Category Cards */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-md space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--syn-border)]">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-teal-500" />
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--syn-heading)]">
                          {t("landing.selectCategoriesHeader")}
                        </h4>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                          selectedCategoryNames.length >= maxCategories
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                            : "bg-teal-500/15 border-teal-500/30 text-teal-500"
                        }`}
                      >
                        {selectedCategoryNames.length}/{maxCategories} {t("landing.selectedCount")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map((cat, cIdx) => {
                        const isSelected = selectedCategoryNames.includes(cat.name);
                        const isMaxReached = selectedCategoryNames.length >= maxCategories;
                        const isDisabled = !isSelected && isMaxReached;

                        return (
                          <div
                            key={cat.id || cIdx}
                            onClick={() => {
                              if (!isDisabled) handleToggleCategory(cat.name);
                            }}
                            className={`p-4 rounded-xl border text-left transition-all select-none flex flex-col justify-between gap-3 shadow-2xs ${
                              isSelected
                                ? "bg-teal-500/10 border-teal-500/60 shadow-md ring-1 ring-teal-500/40 cursor-pointer"
                                : isDisabled
                                ? "bg-[var(--syn-card-inner)]/40 border-[var(--syn-border)]/40 opacity-40 cursor-not-allowed"
                                : "bg-[var(--syn-card-inner)] hover:bg-[var(--syn-card-subtle)] border-[var(--syn-border)] hover:border-teal-500/50 cursor-pointer active:scale-[0.98]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[var(--syn-heading)]">
                                {cat.name}
                              </span>
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                                  isSelected ? "bg-teal-500 text-white" : "border border-[var(--syn-border)]"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Launch Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[var(--syn-card-inner)] to-emerald-500/5 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                      <div className="flex items-center gap-3 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[var(--syn-heading)]">
                            {t("landing.runFreeScanButton")}
                          </h4>
                          <p className="text-xs text-[var(--syn-muted)]">
                            {t("landing.signInPromptTip")}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateQueriesAndProceed}
                        disabled={selectedCategoryNames.length === 0}
                        className="v2-btn v2-btn-primary w-full sm:w-auto px-6 py-3.5 text-sm font-bold justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-500/20"
                      >
                        <span>{t("landing.generateQueriesBtn")}</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          8. SOCIAL PROOF / TRUST BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="v2-trust v2-wrap py-16">
        <div className="syn-card trust-banner">
          <div className="trust-content">
            <span className="v2-badge-pill mb-3">{t("landing.quoteBadge")}</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-snug my-4">
              {t("landing.quoteText")}
            </h2>
            <div className="trust-footer mt-6 flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-[var(--syn-border)]">
              <div>
                <span className="font-semibold text-sm text-[var(--syn-heading)] block">
                  {t("landing.quoteAuthor")}
                </span>
                <span className="text-xs text-[var(--syn-muted)]">
                  {t("landing.quoteRole")}
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-[var(--syn-muted)] font-mono">
                <span>{t("landing.quoteMetric1")}</span>
                <span>·</span>
                <span>{t("landing.quoteMetric2")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          9. TRANSPARENT PRICING
          ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="v2-pricing v2-wrap py-20">
        <div className="v2-section-head text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3">
            {t("landing.pricingTiersEyebrow")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-tight mb-4">
            {t("landing.pricingTiersTitle")}
          </h2>
          <p className="subhead text-base text-[var(--syn-muted)] leading-relaxed">
            {t("landing.pricingTiersSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <RevealOnScroll
              key={i}
              className={`syn-card p-8 flex flex-col justify-between relative transition-transform hover:-translate-y-1 ${
                plan.featured ? "border-[#22C55E] ring-1 ring-[#22C55E] shadow-[0_16px_40px_-8px_rgba(34,197,94,0.22)]" : ""
              }`}
              index={i}
            >
              <div>
                {plan.featured && (
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-neutral-950 font-mono text-[10px] font-extrabold tracking-wider uppercase mb-4">
                    {t("landing.mostPopular")}
                  </span>
                )}
                <h3 className="text-2xl font-bold text-[var(--syn-heading)]">{plan.name}</h3>
                <p className="text-xs text-[var(--syn-muted)] mt-1.5 min-h-[36px] leading-relaxed">{plan.desc}</p>
                
                <div className="mt-5 mb-1 flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[var(--syn-heading)] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-[var(--syn-muted)] font-mono">
                    /{plan.period}
                  </span>
                </div>

                {plan.annualNote && (
                  <p className="text-[11px] text-emerald-500 font-mono font-medium mb-3">
                    {plan.annualNote}
                  </p>
                )}

                {/* AI Engines Monitored Frameless Icons Row */}
                <div className="my-3.5 pt-1">
                  <AIEngineRow className="flex items-center gap-3.5" />
                </div>

                {plan.creditsInfo && (
                  <p className="text-xs text-[var(--syn-muted)] font-medium mb-5 leading-relaxed">
                    {plan.creditsInfo}
                  </p>
                )}

                <ul className="space-y-3 my-6">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-xs text-[var(--syn-text)]">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.href.startsWith("#") ? (
                <a
                  href={plan.href}
                  className={`v2-btn w-full justify-center cursor-pointer ${
                    plan.featured ? "v2-btn-primary" : "v2-btn-secondary"
                  }`}
                >
                  {plan.cta}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleAuthAction}
                  className={`v2-btn w-full justify-center cursor-pointer ${
                    plan.featured ? "v2-btn-primary" : "v2-btn-secondary"
                  }`}
                >
                  {plan.cta}
                </button>
              )}
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          10. FAQ ACCORDION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="v2-faq v2-wrap py-20">
        <div className="v2-section-head text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3">
            {t("landing.faqEyebrow")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-tight mb-4">
            {t("landing.faqSectionTitle")}
          </h2>
          <p className="subhead text-base text-[var(--syn-muted)] leading-relaxed">
            {t("landing.faqSectionSubtitle")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map(([q, a], idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`syn-card p-5 sm:p-6 transition-all ${isOpen ? "border-[#22C55E] ring-1 ring-[#22C55E]" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-[var(--syn-heading)] gap-4 cursor-pointer"
                >
                  <span>{q}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 shrink-0 text-[var(--syn-muted)] ${
                      isOpen ? "rotate-180 text-emerald-500" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pt-4 text-sm text-[var(--syn-muted)] leading-relaxed border-t border-[var(--syn-border-subtle)] mt-3">
                    {a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          11. FINAL CALL TO ACTION & BRAND FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="v2-footer v2-wrap mt-20">
        <RevealOnScroll className="v2-cta-banner text-center py-20 px-8 rounded-3xl relative overflow-hidden" index={0}>
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="v2-badge-pill mb-4 !bg-white/10 !text-emerald-400 !border-emerald-500/20">
              {t("landing.ctaBadge")}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 !text-white">
              {t("landing.ctaTitle")}
            </h2>
            <p className="!text-neutral-300 text-sm sm:text-base mb-8 max-w-lg mx-auto">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a className="v2-btn !bg-emerald-500 !text-neutral-950 font-bold hover:!bg-emerald-400 cursor-pointer" href="#scan">
                {t("landing.ctaBtn")} <ArrowUpRight size={18} />
              </a>
              <button
                type="button"
                onClick={handleAuthAction}
                className="v2-btn !bg-white/10 !text-white hover:!bg-white/20 border-white/20 cursor-pointer"
              >
                {t("landing.ctaBtnSecondary")} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </RevealOnScroll>

        <div className="v2-footer-bar flex flex-col md:flex-row items-center justify-between gap-6 pt-8 pb-12 border-t border-[var(--syn-border)]">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Link href="/" className="flex items-center gap-2 text-[var(--syn-heading)] font-bold">
              <div className="w-6 h-6 rounded-full bg-[#86EFAC] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-neutral-950 fill-neutral-950" />
              </div>
              QuerySonar
            </Link>
            <span className="hidden sm:inline text-[var(--syn-subtle)]">·</span>
            <span className="text-xs text-[var(--syn-muted)]">
              {t("landing.footerTagline")}
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[var(--syn-muted)] flex-wrap justify-center">
            <Link href="/privacy" className="hover:text-[var(--syn-heading)] transition-colors">
              {t("footer.privacy") || "Privacy"}
            </Link>
            <Link href="/terms" className="hover:text-[var(--syn-heading)] transition-colors">
              {t("footer.terms") || "Terms"}
            </Link>
            <Link href="/auth/signin" className="hover:text-[var(--syn-heading)] transition-colors">
              {t("common.signIn")}
            </Link>
            <span className="text-[var(--syn-subtle)] hidden sm:inline">|</span>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1 font-semibold text-[var(--syn-heading)] hover:text-emerald-500 transition-colors cursor-pointer"
            >
              {t("landing.backToTop")} <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="text-center pb-8 text-[11px] text-[var(--syn-subtle)]">
          {t("footer.rights")}
        </div>
      </footer>
    </div>
  );
}
