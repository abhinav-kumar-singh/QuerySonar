"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import {
  Globe,
  Sparkles,
  ArrowRight,
  Bot,
  Loader2,
  CheckCircle2,
  MapPin,
  Clock,
  Activity,
  RotateCcw,
  Building2,
  Layers,
  Search,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Tag,
  ChevronDown,
  ChevronRight,
  Pencil,
  X,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import type { CategoryItem, PromptItem } from "@/components/dashboard/category-query-flow";
import { PlaceAutocomplete } from "@/components/ui/place-autocomplete";

interface WelcomeV2Props {
  planConfig: {
    label: string;
    maxBrands: number;
    maxQueries: number;
  };
  sessionName: string;
  brandName: string;
  setBrandName: (val: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (val: string) => void;
  targetLocation: string;
  setTargetLocation: (val: string) => void;
  queriesList: string[];
  setQueriesList: React.Dispatch<React.SetStateAction<string[]>>;
  categories: CategoryItem[];
  setCategories: (val: CategoryItem[]) => void;
  prompts: PromptItem[];
  setPrompts: (val: PromptItem[]) => void;
  detectedCompetitors: string[];
  setDetectedCompetitors: (val: string[]) => void;
  brandSummary: string;
  setBrandSummary: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  isScanning: boolean;
  scanProgress: number;
  scanStage: string;
  scanElapsed: number;
  scanError: string;
  handleResetForm: () => void;
  handleRunScan: (e: React.FormEvent) => Promise<void>;
}

type OnboardingStep = "domain" | "extracting" | "verification" | "location" | "category" | "ready";

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

// Helper to parse localized text and highlight AI engine brand names
function parseWordsWithEngineHighlights(text: string): { text: string; className?: string }[] {
  const brandClasses: Record<string, string> = {
    "ChatGPT": "text-emerald-500 dark:text-emerald-400 font-semibold",
    "ChatGPT,": "text-emerald-500 dark:text-emerald-400 font-semibold",
    "Google": "text-blue-500 dark:text-blue-400 font-semibold",
    "Gemini": "text-blue-500 dark:text-blue-400 font-semibold",
    "Gemini,": "text-blue-500 dark:text-blue-400 font-semibold",
    "Perplexity": "text-purple-500 dark:text-purple-400 font-semibold",
    "Perplexity,": "text-purple-500 dark:text-purple-400 font-semibold",
    "Claude": "text-amber-500 dark:text-amber-400 font-semibold",
    "Claude,": "text-amber-500 dark:text-amber-400 font-semibold",
    "DeepSeek": "text-cyan-500 dark:text-cyan-400 font-semibold",
    "DeepSeek,": "text-cyan-500 dark:text-cyan-400 font-semibold",
    "Grok": "text-pink-500 dark:text-pink-400 font-semibold",
    "Grok,": "text-pink-500 dark:text-pink-400 font-semibold",
  };

  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ({
      text: token,
      className: brandClasses[token],
    }));
}

/**
 * Aceternity TypewriterEffectSmooth:
 * Glides smoothly from width 0% to fit-content with zero discrete stepping.
 */
export function TypewriterEffectSmooth({
  words,
  className = "",
  cursorClassName = "",
  duration = 0.9,
  delay = 0.05,
}: {
  words: { text: string; className?: string }[];
  className?: string;
  cursorClassName?: string;
  duration?: number;
  delay?: number;
}) {
  const wordsArray = React.useMemo(
    () =>
      words.map((word) => ({
        ...word,
        chars: Array.from(word.text),
      })),
    [words]
  );

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <motion.div
        className="overflow-hidden pb-1"
        initial={{ width: "0%" }}
        animate={{ width: "fit-content" }}
        transition={{
          duration,
          ease: "easeInOut",
          delay,
        }}
      >
        <div className="whitespace-nowrap flex items-baseline">
          {wordsArray.map((word, wIdx) => (
            <span key={`smooth-word-${wIdx}`} className="inline-block mr-2 last:mr-0">
              {word.chars.map((char, cIdx) => (
                <span
                  key={`smooth-char-${cIdx}`}
                  className={word.className || "text-[var(--syn-heading)]"}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </div>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.7,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={`inline-block rounded-xs w-[3px] sm:w-[4px] h-7 sm:h-9 lg:h-11 bg-emerald-500 shrink-0 ${cursorClassName}`}
      />
    </div>
  );
}

/**
 * Aceternity TypewriterEffect:
 * Fluid character streaming with micro-blur dissolving for 60fps GPU smoothness without layout jumping.
 */
export function AceternityTypewriter({
  words,
  className = "",
  cursorClassName = "",
  staggerDelay = 0.012,
  initialDelay = 0.05,
  showCursor = false,
}: {
  words: { text: string; className?: string }[];
  className?: string;
  cursorClassName?: string;
  staggerDelay?: number;
  initialDelay?: number;
  showCursor?: boolean;
}) {
  const wordsArray = React.useMemo(() => {
    return words.map((word) => ({
      ...word,
      chars: Array.from(word.text),
    }));
  }, [words]);

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(
        "span.typewriter-char",
        {
          opacity: 1,
          filter: "blur(0px)",
        },
        {
          duration: 0.2,
          delay: stagger(staggerDelay, { startDelay: initialDelay }),
          ease: "easeOut",
        }
      );
    }
  }, [isInView, animate, staggerDelay, initialDelay]);

  return (
    <div className={`inline ${className}`}>
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, wIdx) => (
          <span key={`typewriter-word-${wIdx}`} className="inline-block whitespace-nowrap mr-1 last:mr-0">
            {word.chars.map((char, cIdx) => (
              <motion.span
                initial={{ opacity: 0, filter: "blur(4px)" }}
                key={`typewriter-char-${cIdx}`}
                className={`typewriter-char inline-block will-change-transform ${word.className || ""}`}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
      {showCursor && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={`inline-block rounded-xs w-[2px] h-[0.9em] bg-emerald-500/80 ml-1 align-baseline shrink-0 ${cursorClassName}`}
        />
      )}
    </div>
  );
}

export function WelcomeOverviewV2({
  planConfig,
  sessionName,
  brandName,
  setBrandName,
  websiteUrl,
  setWebsiteUrl,
  targetLocation,
  setTargetLocation,
  queriesList,
  setQueriesList,
  categories,
  setCategories,
  prompts,
  setPrompts,
  detectedCompetitors,
  setDetectedCompetitors,
  brandSummary,
  setBrandSummary,
  category,
  setCategory,
  isScanning,
  scanProgress,
  scanStage,
  scanElapsed,
  scanError,
  handleResetForm,
  handleRunScan,
}: WelcomeV2Props) {
  const { t } = useTranslation();

  // Internal step management: "domain" -> "extracting" -> "verification" -> "location" -> "category" -> "ready"
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(() => {
    if (queriesList.some((q) => q.trim()) && brandName.trim()) return "ready";
    if (brandName.trim() && websiteUrl.trim()) return "location";
    return "domain";
  });

  const [inputUrl, setInputUrl] = useState(websiteUrl || "");
  const [urlError, setUrlError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState(0);
  const [customLocation, setCustomLocation] = useState(targetLocation || "");
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [detectedMarket, setDetectedMarket] = useState("India · English");
  const [aliases, setAliases] = useState<string[]>([]);
  const [faviconUrl, setFaviconUrl] = useState<string>("");
  const [isEditingVerification, setIsEditingVerification] = useState(false);
  const [isExpandedSummary, setIsExpandedSummary] = useState(false);
  const [editBrandName, setEditBrandName] = useState(brandName || "");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState(websiteUrl || "");
  const [editMarket, setEditMarket] = useState("India · English");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editingPromptText, setEditingPromptText] = useState("");
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
  const [newPromptText, setNewPromptText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentStep, targetLocation, category]);

  // Normalize user domain input - strips protocol, www, and trailing slashes
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

  // Step 1: Submit domain URL and start autonomous AI extraction
  const handleDomainSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError("");

    const cleaned = cleanDomainString(inputUrl);
    if (!cleaned || cleaned.length < 3) {
      setUrlError("Please enter a valid domain (e.g. acme.com or https://company.io)");
      return;
    }

    const fullUrl = inputUrl.startsWith("http://") || inputUrl.startsWith("https://")
      ? inputUrl.trim()
      : `https://${cleaned}`;

    setWebsiteUrl(fullUrl);

    const derivedBrand = deriveBrandFromDomain(cleaned);
    if (!brandName || brandName === "default" || brandName.toLowerCase() === "www") {
      setBrandName(derivedBrand);
    }

    // Advance to extraction stage
    setCurrentStep("extracting");
    setIsExtracting(true);
    setExtractionStage(1);

    // Staged animated extraction steps
    const timer1 = setTimeout(() => setExtractionStage(2), 1200);
    const timer2 = setTimeout(() => setExtractionStage(3), 2400);

    try {
      const res = await fetch("/api/categories/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: derivedBrand,
          websiteUrl: fullUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const disc = data.data;
        const finalBrand = (disc.brandName && disc.brandName.toLowerCase() !== "www")
          ? disc.brandName
          : derivedBrand;
        setBrandName(finalBrand);
        setEditBrandName(finalBrand);
        setEditWebsiteUrl(fullUrl);

        if (disc.summary) setBrandSummary(disc.summary);
        if (disc.primaryCategory) setCategory(disc.primaryCategory);
        if (Array.isArray(disc.categories) && disc.categories.length > 0) {
          setCategories(disc.categories);
        }
        if (Array.isArray(disc.detectedCompetitors)) setDetectedCompetitors(disc.detectedCompetitors);

        if (disc.detectedMarket) {
          setDetectedMarket(disc.detectedMarket);
          setEditMarket(disc.detectedMarket);
        } else {
          setDetectedMarket("Global · English");
          setEditMarket("Global · English");
        }

        if (Array.isArray(disc.aliases) && disc.aliases.length > 0) {
          setAliases(disc.aliases);
        } else {
          setAliases([finalBrand]);
        }

        if (disc.faviconUrl) {
          setFaviconUrl(disc.faviconUrl);
        } else {
          setFaviconUrl(`https://www.google.com/s2/favicons?domain=${cleaned}&sz=64`);
        }

        if (Array.isArray(disc.suggestedPrompts) && disc.suggestedPrompts.length > 0) {
          setPrompts(disc.suggestedPrompts);
          const topQueries = disc.suggestedPrompts.slice(0, planConfig.maxQueries).map((p: PromptItem) => p.queryText);
          setQueriesList(topQueries);
        } else {
          // Fallback initial query
          setQueriesList([
            `What is the best ${disc.primaryCategory || disc.categories?.[0]?.name || "solution"} for modern teams?`,
            `How does ${finalBrand} compare to top alternatives in ${new Date().getFullYear()}?`,
          ]);
        }
      } else {
        // Fallback default prompts if discovery encounters network glitch
        setQueriesList([
          `What is the best alternative to ${derivedBrand}?`,
          `How does ${derivedBrand} compare in ${new Date().getFullYear()}?`,
        ]);
        setAliases([derivedBrand]);
        setFaviconUrl(`https://www.google.com/s2/favicons?domain=${cleaned}&sz=64`);
      }
    } catch {
      // Graceful fallback
      setQueriesList([
        `What is the best software for ${derivedBrand}?`,
        `Top reviews and alternatives for ${derivedBrand}`,
      ]);
      setAliases([derivedBrand]);
      setFaviconUrl(`https://www.google.com/s2/favicons?domain=${cleaned}&sz=64`);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsExtracting(false);
      setCurrentStep("verification");
    }
  };

  const handleConfirmVerification = () => {
    if (!targetLocation) {
      if (/india/i.test(detectedMarket)) setTargetLocation("India");
      else if (/united states|usa|us\b/i.test(detectedMarket)) setTargetLocation("United States");
      else if (/europe|uk|germany|france/i.test(detectedMarket)) setTargetLocation("Europe");
      else if (/asia/i.test(detectedMarket)) setTargetLocation("Asia Pacific");
      else setTargetLocation("Global");
    }
    setCurrentStep("location");
  };

  const handleSaveAndReanalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBrandName.trim()) return;

    setBrandName(editBrandName.trim());
    if (editWebsiteUrl.trim()) setWebsiteUrl(editWebsiteUrl.trim());
    if (editMarket.trim()) setDetectedMarket(editMarket.trim());
    setIsEditingVerification(false);

    setCurrentStep("extracting");
    setIsExtracting(true);
    setExtractionStage(1);

    const timer1 = setTimeout(() => setExtractionStage(2), 1000);
    const timer2 = setTimeout(() => setExtractionStage(3), 2000);

    try {
      const res = await fetch("/api/categories/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: editBrandName.trim(),
          websiteUrl: editWebsiteUrl.trim() || websiteUrl,
          targetLocation: editMarket.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const disc = data.data;
        if (disc.brandName) setBrandName(disc.brandName);
        if (disc.summary) setBrandSummary(disc.summary);
        if (disc.primaryCategory) setCategory(disc.primaryCategory);
        if (Array.isArray(disc.categories) && disc.categories.length > 0) {
          setCategories(disc.categories);
        }
        if (Array.isArray(disc.detectedCompetitors)) setDetectedCompetitors(disc.detectedCompetitors);
        if (disc.detectedMarket) setDetectedMarket(disc.detectedMarket);
        if (Array.isArray(disc.aliases) && disc.aliases.length > 0) setAliases(disc.aliases);
        if (disc.faviconUrl) setFaviconUrl(disc.faviconUrl);
      }
    } catch (err) {
      console.warn("Re-analysis error:", err);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsExtracting(false);
      setCurrentStep("verification");
    }
  };

  // Step 2: Location selection -> advance to business category selection
  const handleSelectLocation = (loc: string) => {
    setTargetLocation(loc);
    setCurrentStep("category");
  };

  const handleCustomLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLocation.trim()) {
      setTargetLocation(customLocation.trim());
      setCurrentStep("category");
    }
  };

  // Category limits based on user active plan
  const maxCategories = planConfig?.maxQueries || 4;

  // Fallback / available taxonomies for selection
  const availableCategories: CategoryItem[] = React.useMemo(() => {
    if (categories && categories.length > 0) return categories;
    return [
      {
        id: "cat-1",
        name: category || "Enterprise Software & Cloud Platforms",
        description: "B2B platforms, workflow solutions, and business applications",
        isAutoSelected: true,
        confidence: 0.95,
      },
      {
        id: "cat-2",
        name: "AI & Intelligent Automation Tools",
        description: "Generative intelligence, autonomous agents, and smart integrations",
        isAutoSelected: false,
        confidence: 0.88,
      },
      {
        id: "cat-3",
        name: "Digital Infrastructure & Developer Tools",
        description: "Engineering frameworks, analytics, developer APIs, and systems",
        isAutoSelected: false,
        confidence: 0.82,
      },
    ];
  }, [categories, category]);

  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(() => {
    const preSelected = (categories || []).filter((c) => c.isAutoSelected).map((c) => c.name);
    if (preSelected.length > 0) return preSelected.slice(0, maxCategories);
    if (category) return [category];
    return (categories || []).slice(0, Math.min(2, maxCategories)).map((c) => c.name);
  });

  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setSelectedCategoryNames((prev) => {
        if (prev.length > 0) return prev;
        const preSelected = categories.filter((c) => c.isAutoSelected).map((c) => c.name);
        if (preSelected.length > 0) return preSelected.slice(0, maxCategories);
        return categories.slice(0, Math.min(2, maxCategories)).map((c) => c.name);
      });
    }
  }, [categories, maxCategories]);

  // Toggle category multi-selection up to plan limit
  const handleToggleCategory = (catName: string) => {
    if (selectedCategoryNames.includes(catName)) {
      setSelectedCategoryNames((prev) => prev.filter((n) => n !== catName));
    } else {
      if (selectedCategoryNames.length >= maxCategories) return;
      setSelectedCategoryNames((prev) => [...prev, catName]);
    }
  };

  // Confirm selected categories and generate grounded buyer prompts
  const handleConfirmCategories = async () => {
    if (selectedCategoryNames.length === 0) return;
    setIsGeneratingPrompts(true);

    const primaryCat = selectedCategoryNames[0] || "";
    setCategory(primaryCat);
    setCategories(
      availableCategories.map((c) => ({
        ...c,
        isAutoSelected: selectedCategoryNames.includes(c.name),
      }))
    );

    try {
      const res = await fetch("/api/queries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          targetLocation: targetLocation.trim() || undefined,
          selectedCategories: selectedCategoryNames,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const generated: PromptItem[] = data.data.prompts || [];
        if (generated.length > 0) {
          setPrompts(generated);
          const topQueries = generated.slice(0, planConfig.maxQueries).map((p) => p.queryText);
          setQueriesList(topQueries);
        }
      }
    } catch (err) {
      console.warn("Failed to generate category prompts:", err);
    } finally {
      setIsGeneratingPrompts(false);
      setCurrentStep("ready");
    }
  };

  const handleRestart = () => {
    setInputUrl("");
    setCustomLocation("");
    setSelectedCategoryNames([]);
    setDetectedMarket("India · English");
    setAliases([]);
    setFaviconUrl("");
    setIsEditingVerification(false);
    setIsExpandedSummary(false);
    setCurrentStep("domain");
    handleResetForm();
  };

  const handleEditDomain = () => {
    setCurrentStep("domain");
    setIsExtracting(false);
  };

  const handleAddQuery = () => {
    if (queriesList.length < planConfig.maxQueries) {
      setQueriesList((prev) => [...prev, ""]);
    }
  };

  const handleRemoveQuery = (idx: number) => {
    if (queriesList.length > 1) {
      setQueriesList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleQueryChange = (idx: number, val: string) => {
    setQueriesList((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  // Synchronize prompts if prompts array is empty but queriesList exists
  useEffect(() => {
    if (prompts.length === 0 && queriesList.length > 0) {
      const cats = selectedCategoryNames.length > 0 ? selectedCategoryNames : [category || "General"];
      const initialPrompts: PromptItem[] = queriesList.map((q, idx) => ({
        id: `prompt-init-${idx}`,
        categoryTag: cats[idx % cats.length] || "General",
        queryText: q,
        type: "informational",
      }));
      setPrompts(initialPrompts);
    }
  }, [queriesList, prompts.length, selectedCategoryNames, category, setPrompts]);

  const displayCategories = React.useMemo(() => {
    const cats = new Set<string>();
    selectedCategoryNames.forEach((c) => cats.add(c));
    prompts.forEach((p) => {
      if (p.categoryTag) cats.add(p.categoryTag);
    });
    if (cats.size === 0) {
      cats.add(category || "General");
    }
    return Array.from(cats);
  }, [selectedCategoryNames, prompts, category]);

  const toggleCategoryCollapse = (catName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const handleStartEditPrompt = (prompt: PromptItem) => {
    setEditingPromptId(prompt.id);
    setEditingPromptText(prompt.queryText);
  };

  const handleSaveEditPrompt = (promptId: string) => {
    if (!editingPromptText.trim()) return;
    const updatedPrompts = prompts.map((p) =>
      p.id === promptId ? { ...p, queryText: editingPromptText.trim() } : p
    );
    setPrompts(updatedPrompts);
    setQueriesList(updatedPrompts.map((p) => p.queryText).filter(Boolean));
    setEditingPromptId(null);
    setEditingPromptText("");
  };

  const handleCancelEditPrompt = () => {
    setEditingPromptId(null);
    setEditingPromptText("");
  };

  const handleDeletePrompt = (promptId: string) => {
    if (prompts.length <= 1) return;
    const updatedPrompts = prompts.filter((p) => p.id !== promptId);
    setPrompts(updatedPrompts);
    setQueriesList(updatedPrompts.map((p) => p.queryText).filter(Boolean));
    if (editingPromptId === promptId) {
      setEditingPromptId(null);
      setEditingPromptText("");
    }
  };

  const handleAddPromptToCategory = (catName: string) => {
    if (!newPromptText.trim()) return;
    if (prompts.length >= planConfig.maxQueries) return;
    const newPrompt: PromptItem = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      categoryTag: catName,
      queryText: newPromptText.trim(),
      type: "commercial",
    };
    const updatedPrompts = [...prompts, newPrompt];
    setPrompts(updatedPrompts);
    setQueriesList(updatedPrompts.map((p) => p.queryText).filter(Boolean));
    setNewPromptText("");
    setAddingToCategory(null);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full min-h-[580px] py-2 animate-in fade-in duration-500 ${
        currentStep === "location" || currentStep === "category" || currentStep === "ready" ? "pb-32 sm:pb-36" : ""
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. LIVE SCANNING RADAR OVERLAY (IF SCAN IN PROGRESS)
          ───────────────────────────────────────────────────────────── */}
      {isScanning && (
        <div className="w-full max-w-4xl rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[var(--syn-card)] to-[var(--syn-card-inner)] border-2 border-emerald-500/40 shadow-2xl flex flex-col gap-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 dark:text-emerald-400" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Live Multi-Engine AI Pipeline
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                    {Math.round(scanProgress)}% Completed
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--syn-heading)] font-mono mt-0.5">
                  {scanStage || "Probing multi-engine AI endpoints in real-time..."}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="px-3.5 py-1.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)] flex items-center gap-2 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-bold">{scanElapsed.toFixed(1)}s</span>
                <span className="text-[var(--syn-muted)]">{t("dashboard.elapsed") || "elapsed"}</span>
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 space-y-1">
            <div className="w-full bg-black/10 dark:bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-[var(--syn-border)]">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(scanProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Engine pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 relative z-10">
            {[
              { name: "ChatGPT", model: "GPT-4o", status: scanProgress > 30 ? "Analyzing" : "Probing" },
              { name: "Gemini", model: "2.0 Flash", status: scanProgress > 15 ? "Grounding" : "Connecting" },
              { name: "Perplexity", model: "Sonar Pro", status: scanProgress > 45 ? "Citations" : "Probing" },
              { name: "Claude", model: "3.7 Sonnet", status: scanProgress > 65 ? "Reasoning" : "Queued" },
              { name: "DeepSeek", model: "V3 Search", status: scanProgress > 75 ? "Consensus" : "Queued" },
              { name: "Grok", model: "Grok 3", status: scanProgress > 85 ? "Synthesizing" : "Queued" },
            ].map((engine) => (
              <div
                key={engine.name}
                className="p-2.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col gap-1 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--syn-heading)]">{engine.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[var(--syn-muted)]">
                  <span className="font-mono">{engine.model}</span>
                  <span className="text-emerald-500 font-medium">{engine.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. UNIFIED COMMAND STREAM (ON BACKGROUND - NOT IN AN OUTER CARD)
          ───────────────────────────────────────────────────────────── */}
      {!isScanning && (
        <div className="w-full max-w-4xl py-2 sm:py-6 space-y-8 relative">
          {/* Top Meta Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--syn-border)]/60 relative z-10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[var(--syn-subtle)] uppercase font-semibold">
                ✦ {t("dashboard.portfolioEyebrow")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-xs font-mono">
                <span className="text-[var(--syn-muted)]">{t("dashboard.activePlan")}: </span>
                <span className="font-bold text-[var(--syn-heading)]">{planConfig.label}</span>
              </div>
              {currentStep !== "domain" && (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-1.5 rounded-xl text-[var(--syn-muted)] hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                  title="Start Over"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* STAGE 1: HERO TYPEWRITER + DOMAIN INGESTION (ALWAYS VISIBLE AT TOP) */}
          <div className="space-y-6 pt-6 relative z-10">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--syn-heading)] leading-tight flex items-center">
                <TypewriterEffectSmooth
                  words={[
                    { text: "Welcome," },
                    { text: sessionName || "Explorer", className: "text-emerald-500 dark:text-emerald-400" },
                    { text: "👋" },
                  ]}
                  duration={0.9}
                  delay={0.05}
                />
              </h1>
              <div className="text-xs sm:text-sm text-[var(--syn-muted)] leading-relaxed max-w-2xl min-h-[44px]">
                <AceternityTypewriter
                  words={parseWordsWithEngineHighlights(t("dashboard.welcomeDesc"))}
                  staggerDelay={0.012}
                  initialDelay={0.05}
                  showCursor={true}
                />
              </div>
            </div>

            {/* Pre-Input Info Header (Engine Beacon + Trust Badges) */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-2 bg-emerald-400 opacity-75" />
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

            {/* Main Product Domain Ingestion Bar - FOCUSED CARD STYLE */}
            <form onSubmit={handleDomainSubmit} className="space-y-3">
              <div className="relative group p-1.5 rounded-2xl bg-[var(--syn-card)] border-2 border-[var(--syn-border)] focus-within:border-emerald-500 shadow-md shadow-black/5 transition-all">
                <div className="relative flex items-center">
                  <div className="pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[var(--syn-muted)] group-focus-within:text-emerald-500 transition-colors">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  </div>
                  <input
                    type="text"
                    disabled={isExtracting || currentStep !== "domain"}
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      if (urlError) setUrlError("");
                    }}
                    placeholder={t("dashboard.welcomeV2EnterWebsitePlaceholder") || "Enter your domain (e.g. acme.com or https://...)"}
                    className={`w-full pl-3.5 pr-36 sm:pr-44 py-3 sm:py-3.5 bg-transparent text-[var(--syn-heading)] text-sm sm:text-base placeholder:text-[var(--syn-subtle)] focus:outline-none font-mono ${
                      currentStep !== "domain" ? "opacity-90 cursor-default" : ""
                    }`}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {currentStep === "domain" ? (
                      <button
                        type="submit"
                        disabled={!inputUrl.trim() || isExtracting}
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
                          onClick={handleEditDomain}
                          className="px-3 py-1.5 rounded-xl bg-[var(--syn-card-inner)] hover:bg-emerald-500/10 border border-[var(--syn-border)] hover:border-emerald-500/30 text-[var(--syn-muted)] hover:text-emerald-500 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Change domain"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Change</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {urlError && (
                <p className="text-xs text-red-500 font-medium pl-2 mt-2 animate-in fade-in">
                  {urlError}
                </p>
              )}
            </form>
          </div>

          {/* ─────────────────────────────────────────────────────────
              STAGE 2: AUTONOMOUS AI EXTRACTION (ANIMATED RADAR) - DIRECTLY ON BACKGROUND
              ───────────────────────────────────────────────────────── */}
          {currentStep === "extracting" && (
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

              {/* Step indicator chips */}
              <div className="space-y-2.5 pt-2 font-mono text-xs">
                <div className="flex items-center gap-2.5 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t("dashboard.welcomeV2ConnectedTo") || "Connected to"} {cleanDomainString(inputUrl)}</span>
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

          {/* ─────────────────────────────────────────────────────────────
              STAGE 3: VERIFICATION CARD ("Does this look right?")
              ───────────────────────────────────────────────────────────── */}
          {(currentStep === "verification" || currentStep === "location" || currentStep === "category" || currentStep === "ready") && (
            <div className="space-y-4 pt-4 relative z-10 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-[var(--syn-heading)]">
                  {t("dashboard.welcomeV2DoesThisLookRight")}
                </h3>
                {currentStep !== "verification" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>

              {/* Focused Card Style */}
              <div className="w-full rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] p-5 sm:p-6 shadow-md space-y-5">
                {/* Card Top Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-neutral-950 border border-[var(--syn-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {faviconUrl ? (
                        <img
                          src={faviconUrl}
                          alt={brandName}
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
                        {brandName}
                      </h4>
                      <p className="text-xs text-[var(--syn-muted)] font-mono truncate">
                        {websiteUrl || inputUrl}
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

                {/* Inline Editing Form if active */}
                {isEditingVerification ? (
                  <form onSubmit={handleSaveAndReanalyze} className="p-4 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono font-medium text-[var(--syn-muted)] block mb-1">
                          {t("dashboard.welcomeV2DiscoveredBrand")}
                        </label>
                        <input
                          type="text"
                          value={editBrandName}
                          onChange={(e) => setEditBrandName(e.target.value)}
                          placeholder={t("dashboard.welcomeV2EditBrandNamePlaceholder")}
                          className="w-full px-3 py-2 rounded-lg bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs text-[var(--syn-heading)] focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono font-medium text-[var(--syn-muted)] block mb-1">
                          Website URL
                        </label>
                        <input
                          type="text"
                          value={editWebsiteUrl}
                          onChange={(e) => setEditWebsiteUrl(e.target.value)}
                          placeholder={t("dashboard.welcomeV2EditWebsitePlaceholder")}
                          className="w-full px-3 py-2 rounded-lg bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs text-[var(--syn-heading)] focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-mono font-medium text-[var(--syn-muted)] block mb-1">
                        {t("dashboard.welcomeV2MarketLabel")}
                      </label>
                      <input
                        type="text"
                        value={editMarket}
                        onChange={(e) => setEditMarket(e.target.value)}
                        placeholder={t("dashboard.welcomeV2EditMarketPlaceholder")}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs text-[var(--syn-heading)] focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        {t("dashboard.welcomeV2SaveAndReanalyze")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditBrandName(brandName);
                          setEditWebsiteUrl(websiteUrl);
                          setEditMarket(detectedMarket);
                          setIsEditingVerification(false);
                        }}
                        className="px-4 py-2 rounded-lg border border-[var(--syn-border)] text-xs text-[var(--syn-muted)] hover:text-[var(--syn-heading)] cursor-pointer"
                      >
                        {t("dashboard.welcomeV2Cancel")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Row 1: What you do */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 pt-1">
                      <span className="text-xs font-medium text-[var(--syn-muted)] w-24 sm:w-28 shrink-0">
                        {t("dashboard.welcomeV2WhatYouDo")}
                      </span>
                      <div className="flex-1 space-y-1">
                        <h5 className="text-sm font-bold text-[var(--syn-heading)]">
                          {t("dashboard.welcomeV2AboutBrand", { brand: brandName })}
                        </h5>
                        <p className={`text-xs text-[var(--syn-muted)] leading-relaxed ${isExpandedSummary ? "" : "line-clamp-2"}`}>
                          {brandSummary || `${brandName} is a market leader delivering solutions to customers worldwide.`}
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

                    {/* Row 2: Categories */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 pt-2">
                      <span className="text-xs font-medium text-[var(--syn-muted)] w-24 sm:w-28 shrink-0 pt-1">
                        {t("dashboard.welcomeV2CategoriesLabel")}
                      </span>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {availableCategories.slice(0, 10).map((cat, idx) => (
                          <span
                            key={cat.id || idx}
                            className={`px-3 py-1 rounded-lg border text-xs font-semibold ${pillColorClasses[idx % pillColorClasses.length]}`}
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[var(--syn-border)]/60 pt-4 space-y-4">
                      {/* Row 3: Also known as */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6">
                        <span className="text-xs font-medium text-[var(--syn-muted)] w-24 sm:w-28 shrink-0">
                          {t("dashboard.welcomeV2AlsoKnownAs")}
                        </span>
                        <span className="text-xs text-[var(--syn-heading)] flex-1 leading-relaxed">
                          {aliases.length > 0 ? aliases.join(", ") : brandName}
                        </span>
                      </div>

                      {/* Row 4: Market */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6">
                        <span className="text-xs font-medium text-[var(--syn-muted)] w-24 sm:w-28 shrink-0">
                          {t("dashboard.welcomeV2MarketLabel")}
                        </span>
                        <span className="text-xs text-[var(--syn-heading)] flex items-center gap-1.5 flex-1">
                          <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {detectedMarket || "Global · English"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Verification Action Buttons - only shown while in "verification" step */}
              {currentStep === "verification" && (
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
                    onClick={() => setIsEditingVerification(true)}
                    className="px-4 py-2.5 rounded-xl border border-[var(--syn-border)] hover:bg-[var(--syn-card-inner)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] text-xs font-semibold cursor-pointer transition-all"
                  >
                    <span>{t("dashboard.welcomeV2NoEditDetails")}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              CONVERSATIONAL AI AGENT STREAM (DYNAMIC ANALYSIS + LOCATION + CATEGORY + BLUEPRINT)
              ───────────────────────────────────────────────────────────── */}
          {(currentStep === "location" || currentStep === "category" || currentStep === "ready") && (
            <div className="space-y-6 pt-6 relative z-10 animate-in fade-in duration-300">

              {/* ──────────────── MESSAGE 1: AI WEBSITE ANALYSIS & LOCATION INQUIRY ──────────────── */}
              <div className="space-y-4">
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

                {/* AI Typewriter Output - on background */}
                <div className="text-xs sm:text-sm text-[var(--syn-heading)] leading-relaxed space-y-1.5 max-w-3xl">
                  <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    ✦ Analysis for {brandName}:
                  </p>
                  <div className="text-[var(--syn-muted)] leading-relaxed">
                    <AceternityTypewriter
                      words={parseWordsWithEngineHighlights(
                        `I analyzed ${cleanDomainString(inputUrl)} and identified your brand as ${brandName}. ${
                          brandSummary || "Your website delivers specialized digital products and services to buyers worldwide."
                        } To analyze how ChatGPT, Google Gemini, Perplexity, Claude, DeepSeek, and Grok recommend ${brandName} to active buyers, where are your primary customers located?`
                      )}
                      staggerDelay={0.008}
                      initialDelay={0.05}
                      showCursor={currentStep === "location"}
                    />
                  </div>
                </div>

                {/* Location Response in Chat App Style */}
                {currentStep === "location" ? (
                  <div className="flex items-center gap-2 pt-1 text-xs font-mono text-emerald-500 animate-pulse">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t("dashboard.welcomeV2LocationSelectPrompt")}</span>
                  </div>
                ) : (
                  /* Confirmed Location Bubble (User Response) */
                  <div className="flex justify-end pt-1 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[var(--syn-card)] border border-emerald-500/30 text-xs shadow-xs">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[var(--syn-muted)] font-mono">{t("dashboard.welcomeV2DiscoveredMarket") || "Market"}:</span>
                      <strong className="text-[var(--syn-heading)] font-bold">{targetLocation}</strong>
                      <button
                        type="button"
                        onClick={() => setCurrentStep("location")}
                        className="ml-2 text-[11px] text-emerald-500 hover:underline font-mono cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{t("dashboard.welcomeV2BackBtn") || "Change"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ──────────────── MESSAGE 2: CATEGORY SELECTION (Triggered after location) ──────────────── */}
              {(currentStep === "category" || currentStep === "ready") && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

                  {/* AI Typewriter Output for Categories - on background */}
                  <div className="text-xs sm:text-sm text-[var(--syn-heading)] leading-relaxed space-y-1.5 max-w-3xl">
                    <p className="font-mono text-teal-600 dark:text-teal-400 font-bold text-xs">
                      ✦ Taxonomies identified for {brandName}:
                    </p>
                    <div className="text-[var(--syn-muted)] leading-relaxed">
                      <AceternityTypewriter
                        words={parseWordsWithEngineHighlights(
                          `Calibrating search models for ${targetLocation}. Based on your website's products and positioning, I discovered the following business categories for ${brandName}. Select up to ${maxCategories} business verticals to audit:`
                        )}
                        staggerDelay={0.008}
                        initialDelay={0.05}
                        showCursor={currentStep === "category"}
                      />
                    </div>
                  </div>

                  {/* Interactive Category Cards - IN FOCUSED CARD STYLE */}
                  {currentStep === "category" ? (
                    <div className="p-5 sm:p-6 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-md space-y-4 animate-in fade-in duration-300">
                      {/* Header with Title and Plan Limit Counter */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] font-mono uppercase text-[var(--syn-subtle)] font-semibold flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-teal-500" />
                          {t("dashboard.welcomeV2StepCategoryTitle") || "Select your business verticals"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold border transition-colors ${
                              selectedCategoryNames.length >= maxCategories
                                ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                                : "bg-teal-500/15 border-teal-500/30 text-teal-500"
                            }`}
                          >
                            {selectedCategoryNames.length}/{maxCategories} {t("auditDrawer.selectedCount") || "selected"}
                          </span>
                          <span className="text-[10px] text-[var(--syn-muted)] font-mono hidden sm:inline">
                            ({planConfig?.label || "Free Plan"})
                          </span>
                        </div>
                      </div>

                      {/* Limit reached warning notice if at max */}
                      {selectedCategoryNames.length >= maxCategories && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                          <span className="font-bold shrink-0">{t("auditDrawer.limitReached") || "Limit Reached"}:</span>
                          <span>{t("auditDrawer.limitReachedDesc") || "Deselect any active category to choose a different one."}</span>
                        </div>
                      )}

                      {/* Grid of Category Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableCategories.map((cat, cIdx) => {
                          const isSelected = selectedCategoryNames.includes(cat.name);
                          const isMaxReached = selectedCategoryNames.length >= maxCategories;
                          const isDisabled = !isSelected && isMaxReached;

                          return (
                            <div
                              key={cat.id || `cat-${cIdx}`}
                              onClick={() => {
                                if (!isDisabled) handleToggleCategory(cat.name);
                              }}
                              className={`p-4 rounded-xl border text-left transition-all select-none flex flex-col justify-between gap-3 shadow-2xs group ${
                                isSelected
                                  ? "bg-teal-500/10 border-teal-500/60 shadow-md ring-1 ring-teal-500/40 cursor-pointer"
                                  : isDisabled
                                  ? "bg-[var(--syn-card-inner)]/40 border-[var(--syn-border)]/40 opacity-40 cursor-not-allowed"
                                  : "bg-[var(--syn-card-inner)] hover:bg-[var(--syn-card-subtle)] border-[var(--syn-border)] hover:border-teal-500/50 cursor-pointer active:scale-[0.98]"
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`text-xs font-bold transition-colors ${
                                      isSelected
                                        ? "text-teal-500 dark:text-teal-400"
                                        : "text-[var(--syn-heading)] group-hover:text-teal-500"
                                    }`}
                                  >
                                    {cat.name}
                                  </span>
                                  {/* Custom Checkbox Pill */}
                                  <div
                                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                                      isSelected
                                        ? "bg-teal-500 text-neutral-950 font-bold shadow-xs"
                                        : isDisabled
                                        ? "border border-[var(--syn-border)]/40 bg-[var(--syn-card-inner)]/30 opacity-50"
                                        : "border border-[var(--syn-border)] bg-[var(--syn-card)]"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </div>
                                <p className="text-[11px] text-[var(--syn-muted)] line-clamp-2 leading-relaxed">
                                  {cat.description || "Core business vertical for search visibility comparison"}
                                </p>
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--syn-subtle)] pt-1.5 border-t border-[var(--syn-border)]">
                                <span>Match Confidence</span>
                                <span
                                  className={`font-semibold ${
                                    isSelected ? "text-teal-500" : "text-[var(--syn-muted)]"
                                  }`}
                                >
                                  {cat.confidence ? `${Math.round(cat.confidence * 100)}%` : "High"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Confirmed Category Badge in focused card style */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[var(--syn-card)] border border-teal-500/30 text-xs shadow-2xs gap-2">
                      <div className="flex items-center gap-2 font-mono text-teal-600 dark:text-teal-400 font-semibold flex-wrap">
                        <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                        <span>{t("dashboard.welcomeV2CategoriesLabel") || "Categories"} ({selectedCategoryNames.length}):</span>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {selectedCategoryNames.map((catName, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-[var(--syn-heading)] font-bold text-xs"
                            >
                              {catName}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep("category")}
                        className="text-[11px] text-teal-500 hover:underline font-mono cursor-pointer flex items-center gap-1 shrink-0 self-end sm:self-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{t("dashboard.welcomeV2BackBtn") || "Change"}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────── MESSAGE 3: AUDIT BLUEPRINT & 1-CLICK LAUNCH ──────────────── */}
              {currentStep === "ready" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-400">
                  <div className="space-y-1.5 pb-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("dashboard.welcomeV2StepReadyTitle") || "Audit Blueprint Ready"}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--syn-muted)] leading-relaxed max-w-3xl">
                      <AceternityTypewriter
                        words={parseWordsWithEngineHighlights(
                          `Audit blueprint calibrated for ${brandName} across ${selectedCategoryNames.length} categories (${targetLocation}). I have synthesized high-intent buyer queries that users ask AI engines when looking for solutions in your space. Ready to launch your live multi-engine audit!`
                        )}
                        staggerDelay={0.008}
                        initialDelay={0.05}
                        showCursor={false}
                      />
                    </div>
                  </div>

                  {/* Clean, Lightweight Prompt Set List (No heavy boxy card wrapper) */}
                  <div className="w-full space-y-3">
                    {/* Prompt Set Header */}
                    <div className="flex items-center justify-between gap-3 pb-1">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[var(--syn-heading)] tracking-tight">
                          {t("dashboard.welcomeV2PromptSetTitle") || "Your prompt set"}
                        </h3>
                        <p className="text-xs text-[var(--syn-muted)]">
                          {t("dashboard.welcomeV2PromptSetSubtitle") || "Open a category to edit or remove a prompt"}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--syn-card)] border border-[var(--syn-border)] text-[11px] font-mono font-medium text-[var(--syn-heading)] shrink-0">
                        {prompts.length} / {planConfig.maxQueries} queries
                      </span>
                    </div>

                    {/* Category Flat Accordion List (Directly on background, no nested card boxes) */}
                    <div className="border-t border-[var(--syn-border)]">
                      {displayCategories.map((catName, cIdx) => {
                        const isCollapsed = !!collapsedCategories[catName];
                        const categoryPrompts = prompts.filter(
                          (p) => p.categoryTag === catName || (!p.categoryTag && cIdx === 0)
                        );
                        const colorClass = pillColorClasses[cIdx % pillColorClasses.length];

                        return (
                          <div key={catName} className="border-b border-[var(--syn-border)] py-1">
                            {/* Accordion Header */}
                            <button
                              type="button"
                              onClick={() => toggleCategoryCollapse(catName)}
                              className="w-full py-2.5 px-1.5 flex items-center justify-between gap-3 text-left hover:bg-[var(--syn-card-inner)]/40 rounded-lg transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[var(--syn-muted)] group-hover:text-[var(--syn-heading)] transition-colors shrink-0">
                                  {isCollapsed ? (
                                    <ChevronRight className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full border text-xs truncate ${colorClass}`}
                                >
                                  {catName}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-[var(--syn-muted)] shrink-0">
                                {categoryPrompts.length} {categoryPrompts.length === 1 ? "prompt" : "prompts"}
                              </span>
                            </button>

                            {/* Accordion Body with Numbered Points (1, 2, 3...) */}
                            {!isCollapsed && (
                              <div className="pl-6 sm:pl-7 pr-2 pt-1 pb-3 space-y-2">
                                {categoryPrompts.length === 0 ? (
                                  <div className="py-2 text-xs text-[var(--syn-muted)] italic">
                                    {t("dashboard.welcomeV2NoPromptsInCategory") || "No prompts in this category yet."}
                                  </div>
                                ) : (
                                  categoryPrompts.map((prompt, pIdx) => {
                                    const isEditing = editingPromptId === prompt.id;

                                    return (
                                      <div
                                        key={prompt.id}
                                        className="flex items-start gap-3 py-1.5 px-2 -mx-2 rounded-lg text-xs group transition-colors hover:bg-[var(--syn-card-inner)]/30"
                                      >
                                        {/* Number Point */}
                                        <span className="text-xs font-mono font-bold text-[var(--syn-muted)] w-4 pt-0.5 shrink-0 select-none">
                                          {pIdx + 1}.
                                        </span>

                                        {isEditing ? (
                                          <div className="flex-1 flex items-center gap-2">
                                            <input
                                              type="text"
                                              value={editingPromptText}
                                              onChange={(e) => setEditingPromptText(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSaveEditPrompt(prompt.id);
                                                if (e.key === "Escape") handleCancelEditPrompt();
                                              }}
                                              className="flex-1 px-2.5 py-1.5 rounded-md border border-emerald-500 bg-[var(--syn-card-inner)] text-[var(--syn-heading)] text-xs focus:outline-none font-medium"
                                              autoFocus
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleSaveEditPrompt(prompt.id)}
                                              className="p-1.5 rounded-md bg-emerald-500 text-neutral-950 hover:bg-emerald-400 cursor-pointer transition-colors"
                                              title="Save"
                                            >
                                              <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={handleCancelEditPrompt}
                                              className="p-1.5 rounded-md text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-inner)] cursor-pointer transition-colors"
                                              title="Cancel"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            <span className="flex-1 text-[var(--syn-heading)] font-normal text-xs sm:text-[13px] leading-relaxed break-words">
                                              {prompt.queryText}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                                              <button
                                                type="button"
                                                onClick={() => handleStartEditPrompt(prompt)}
                                                className="p-1 rounded-md text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-inner)] transition-colors cursor-pointer"
                                                title="Edit prompt"
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                              </button>
                                              {prompts.length > 1 && (
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeletePrompt(prompt.id)}
                                                  className="p-1 rounded-md text-[var(--syn-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                  title="Remove prompt"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })
                                )}

                                {/* Add Prompt to Category */}
                                {addingToCategory === catName ? (
                                  <div className="flex items-center gap-2 pt-1.5 pl-6">
                                    <input
                                      type="text"
                                      value={newPromptText}
                                      onChange={(e) => setNewPromptText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddPromptToCategory(catName);
                                        if (e.key === "Escape") {
                                          setAddingToCategory(null);
                                          setNewPromptText("");
                                        }
                                      }}
                                      placeholder={t("dashboard.welcomeV2AddPromptPlaceholder") || "Enter search query prompt..."}
                                      className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-500/50 bg-[var(--syn-card-inner)] text-[var(--syn-heading)] text-xs focus:outline-none"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddPromptToCategory(catName)}
                                      disabled={!newPromptText.trim()}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                      {t("dashboard.welcomeV2AddPrompt") || "Add prompt"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAddingToCategory(null);
                                        setNewPromptText("");
                                      }}
                                      className="p-1.5 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  prompts.length < planConfig.maxQueries && (
                                    <div className="pt-1 pl-6">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAddingToCategory(catName);
                                          setNewPromptText("");
                                        }}
                                        className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer transition-colors"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>{t("dashboard.welcomeV2AddPrompt") || "Add prompt"}</span>
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {scanError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                        {scanError}
                      </div>
                    )}
                  </div>
              </div>
            )}

            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. DOCKED CHAT INPUT BAR FOR LOCATION SELECTION
          ───────────────────────────────────────────────────────────── */}
      {currentStep === "location" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-[var(--syn-card)]/95 backdrop-blur-xl border-t border-[var(--syn-border)] shadow-2xl flex justify-center animate-in slide-in-from-bottom-3 duration-300">
          <div className="w-full max-w-4xl flex items-center gap-2.5">
            <div className="flex-1 w-full relative">
              <PlaceAutocomplete
                value={targetLocation || customLocation}
                onChange={(loc) => {
                  setCustomLocation(loc);
                  setTargetLocation(loc);
                }}
                onSubmit={(loc) => {
                  if (loc && loc.trim()) {
                    handleSelectLocation(loc.trim());
                  }
                }}
                dropdownPosition="top"
                placeholder={t("dashboard.welcomeV2LocationCustomPlaceholder") || "Search country, city, or region (e.g. United States, Germany, India)..."}
                label=""
                sublabel=""
                className="w-full"
                inputClassName="w-full py-3 sm:py-3.5 bg-[var(--syn-card-inner)] border border-[var(--syn-border)] focus:border-emerald-500 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-mono shadow-xs text-[var(--syn-heading)]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const chosen = (targetLocation || customLocation || "").trim();
                if (chosen) handleSelectLocation(chosen);
              }}
              disabled={!(targetLocation || customLocation || "").trim()}
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shrink-0"
            >
              <span>{t("dashboard.welcomeV2SendBtn") || "Send"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. DOCKED CHAT ACTION BAR FOR CATEGORY SELECTION / PROMPTS GENERATION
          ───────────────────────────────────────────────────────────── */}
      {currentStep === "category" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-[var(--syn-card)]/95 backdrop-blur-xl border-t border-[var(--syn-border)] shadow-2xl flex justify-center animate-in slide-in-from-bottom-3 duration-300">
          <div className="w-full max-w-4xl flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`text-[11px] font-mono px-3 py-1.5 rounded-xl font-bold border transition-colors shrink-0 ${
                  selectedCategoryNames.length >= maxCategories
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                    : "bg-teal-500/15 border-teal-500/30 text-teal-500"
                }`}
              >
                {selectedCategoryNames.length}/{maxCategories} {t("auditDrawer.selectedCount") || "selected"}
              </span>
              <span className="text-xs text-[var(--syn-muted)] truncate hidden sm:inline font-mono">
                {selectedCategoryNames.length > 0
                  ? selectedCategoryNames.join(", ")
                  : "Select at least 1 category above"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmCategories}
              disabled={selectedCategoryNames.length === 0 || isGeneratingPrompts}
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shrink-0"
            >
              {isGeneratingPrompts ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>{t("auditDrawer.synthesizingPrompts") || "Synthesizing Prompts..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                  <span>
                    {t("auditDrawer.generatePromptsBtn") || "Generate Buyer Prompts"} ({selectedCategoryNames.length})
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. DOCKED CHAT ACTION BAR FOR LAUNCHING LIVE MULTI-ENGINE AUDIT
          ───────────────────────────────────────────────────────────── */}
      {currentStep === "ready" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-[var(--syn-card)]/95 backdrop-blur-xl border-t border-[var(--syn-border)] shadow-2xl flex justify-center animate-in slide-in-from-bottom-3 duration-300">
          <div className="w-full max-w-4xl flex items-center justify-end">
            <button
              type="button"
              onClick={(e) => handleRunScan(e)}
              disabled={isScanning || queriesList.every((q) => !q.trim())}
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{t("dashboard.welcomeV2LaunchAuditBtn") || "Launch Live Multi-Engine Audit"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
