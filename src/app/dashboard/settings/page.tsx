"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuditData, clearPendingScan, setActiveUserId, StoredBrand } from "@/lib/audit-storage";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Trash2,
  Plus,
  Check,
  Building2,
  Users2,
  Search,
  Zap,
  Loader2,
  AlertTriangle,
  Radio,
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  ArrowRight,
  TrendingUp,
  Lock,
  Globe,
  Layers,
  Eye,
} from "lucide-react";
import type { AuditResult } from "@/lib/geo-engine/types";
import { useSession, signOut } from "next-auth/react";
import {
  AIEngineRow,
  OpenAISpiralIcon,
  GeminiDiamondIcon,
  PerplexityIcon,
  ClaudeSunburstIcon,
  GrokSlashIcon,
} from "@/components/ui/ai-engine-icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PlaceAutocomplete } from "@/components/ui/place-autocomplete";
import { WorkspaceTeamTab } from "@/components/dashboard/settings/workspace-team-tab";
import { useTranslation } from "@/lib/i18n/language-context";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useWorkspaceRole } from "@/lib/workspace-role-context";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

type BrandSettingsResponse = {
  brand: {
    id: string;
    name: string;
    websiteUrl: string;
    targetLocation?: string;
    competitors: string[];
  } | null;
  queries: Array<{
    id: string;
    queryText: string;
  }>;
  plan?: string;
  maxQueries?: number;
};

type TierFeature = {
  text: string;
  included: boolean;
  highlight?: boolean;
};

function SettingsFormContent({
  audit,
  saveAudit,
  resetAudit,
  brands,
  deleteBrand,
}: {
  audit: AuditResult | null;
  saveAudit: (res: AuditResult) => void;
  resetAudit: () => void;
  brands: StoredBrand[];
  deleteBrand: (id: string) => void;
}) {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { role: userRole, permissions, isOwner, isAdmin, isEditor, isViewer } = useWorkspaceRole();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "billing" ? "billing" : tabParam === "team" ? "team" : "brand";

  const TIERS: Array<{
    id: string;
    name: string;
    price: string;
    billingCycle: string;
    description: string;
    badge: string | null;
    features: TierFeature[];
  }> = [
    {
      id: "FREE",
      name: t("settings.freeTierName"),
      price: "$0",
      billingCycle: t("settings.foreverFree"),
      description: t("settings.freeTierDesc"),
      badge: null,
      features: [
        { text: t("settings.tierFeatFree1"), included: true },
        { text: t("settings.tierFeatFree2"), included: true },
        { text: t("settings.tierFeatFree3"), included: true },
        { text: t("settings.tierFeatFree4"), included: true },
        { text: t("settings.tierFeatFree5"), included: false },
        { text: t("settings.tierFeatFree6"), included: false },
        { text: t("settings.tierFeatFree7"), included: false },
      ],
    },
    {
      id: "GROWTH",
      name: t("settings.starterTierName"),
      price: "$19",
      billingCycle: t("settings.perMonth"),
      description: t("settings.starterTierDesc"),
      badge: t("settings.mostPopular"),
      features: [
        { text: t("settings.tierFeatGrowth1"), included: true },
        { text: t("settings.tierFeatGrowth2"), included: true },
        { text: t("settings.tierFeatGrowth3"), included: true },
        { text: t("settings.tierFeatGrowth4"), included: true },
        { text: t("settings.tierFeatGrowth5"), included: true, highlight: true },
        { text: t("settings.tierFeatGrowth6"), included: true },
        { text: t("settings.tierFeatGrowth7"), included: true },
      ],
    },
    {
      id: "ENTERPRISE",
      name: t("settings.agencyTierName"),
      price: "$49",
      billingCycle: t("settings.perMonth"),
      description: t("settings.agencyTierDesc"),
      badge: t("settings.agencyScale"),
      features: [
        { text: t("settings.tierFeatAgency1"), included: true },
        { text: t("settings.tierFeatAgency2"), included: true },
        { text: t("settings.tierFeatAgency3"), included: true, highlight: true },
        { text: t("settings.tierFeatAgency4"), included: true },
        { text: t("settings.tierFeatAgency5"), included: true },
        { text: t("settings.tierFeatAgency6"), included: true },
        { text: t("settings.tierFeatAgency7"), included: true },
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState<"brand" | "team" | "billing">(initialTab);
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const [maxQueries, setMaxQueries] = useState<number>(3);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [planSuccessMsg, setPlanSuccessMsg] = useState("");

  const auditCompetitors = (
    audit?.brandProfile?.competitors && audit.brandProfile.competitors.length > 0
      ? audit.brandProfile.competitors
      : audit?.topCompetitors && audit.topCompetitors.length > 0
      ? audit.topCompetitors.map((c) => c.name)
      : []
  );

  const [brandName, setBrandName] = useState(audit?.brandProfile?.name || "");
  const [websiteUrl, setWebsiteUrl] = useState(audit?.brandProfile?.websiteUrl || "");
  const [targetLocation, setTargetLocation] = useState(audit?.brandProfile?.targetLocation || "");
  const [competitors, setCompetitors] = useState<string[]>(auditCompetitors);
  const [queries, setQueries] = useState<string[]>(() => {
    if (audit?.mentionAnalyses) {
      return Array.from(new Set(audit.mentionAnalyses.map((m) => m.query)));
    }
    return [];
  });

  const [newCompetitor, setNewCompetitor] = useState("");
  const [newQuery, setNewQuery] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingQueries, setIsSavingQueries] = useState(false);
  const [isSuggestingQueries, setIsSuggestingQueries] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [savedBrandName, setSavedBrandName] = useState(audit?.brandProfile?.name || "");
  const [savedWebsiteUrl, setSavedWebsiteUrl] = useState(audit?.brandProfile?.websiteUrl || "");
  const [savedTargetLocation, setSavedTargetLocation] = useState(audit?.brandProfile?.targetLocation || "");
  const isAuthenticated = status === "authenticated";

  // Account deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [confirmDeleteInput, setConfirmDeleteInput] = useState("");

  // Workspace deletion modal state
  const [showWorkspaceDeleteModal, setShowWorkspaceDeleteModal] = useState(false);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);

  const handleConfirmDeleteWorkspace = async () => {
    setIsDeletingWorkspace(true);
    const activeId = audit?.brandProfile?.name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "";
    try {
      await fetch(`/api/workspaces?id=${activeId}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to delete workspace on server:", err);
    }
    deleteBrand(activeId);
    setIsDeletingWorkspace(false);
    setShowWorkspaceDeleteModal(false);
  };

  useBodyScrollLock(showDeleteModal);

  // Sync state when active workspace audit changes
  useEffect(() => {
    if (audit?.brandProfile?.name) {
      setBrandName(audit.brandProfile.name);
      setSavedBrandName(audit.brandProfile.name);
      if (audit.brandProfile.websiteUrl) {
        setWebsiteUrl(audit.brandProfile.websiteUrl);
        setSavedWebsiteUrl(audit.brandProfile.websiteUrl);
      }
      if (audit.brandProfile.targetLocation) {
        setTargetLocation(audit.brandProfile.targetLocation);
        setSavedTargetLocation(audit.brandProfile.targetLocation);
      }
      const comps = audit.brandProfile.competitors?.length
        ? audit.brandProfile.competitors
        : audit.topCompetitors?.length
        ? audit.topCompetitors.map((c) => c.name)
        : [];
      if (comps.length > 0) {
        setCompetitors((prev) => (prev.length > 0 ? prev : comps));
      }
      if (audit.mentionAnalyses && audit.mentionAnalyses.length > 0) {
        const unique = Array.from(new Set(audit.mentionAnalyses.map((m) => m.query)));
        setQueries((prev) => (prev.length > 0 ? prev : unique));
      }
    }
  }, [audit]);

  // Sync tab with URL if changed
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "billing") {
      setActiveTab("billing");
    } else if (tabParam === "team") {
      setActiveTab("team");
    } else if (tabParam === "brand") {
      setActiveTab("brand");
    }
  }, [searchParams]);

  // Always listen for plan switcher updates
  useEffect(() => {
    try {
      const saved = localStorage.getItem("georadar_test_plan");
      if (saved) {
        const p = saved.toUpperCase();
        let resolved = p;
        if (p === "STARTER") resolved = "GROWTH";
        else if (p === "PRO" || p === "AGENCY") resolved = "ENTERPRISE";
        setUserPlan(resolved);
        if (resolved === "GROWTH") {
          setMaxQueries(30);
        } else if (resolved === "ENTERPRISE") {
          setMaxQueries(100);
        } else {
          setMaxQueries(3);
        }
      }
    } catch {}

    function handlePlanChange(e: Event) {
      const customEvent = e as CustomEvent<{ plan?: string }>;
      const newPlan = (customEvent.detail?.plan || "FREE").toUpperCase();
      let resolved = newPlan;
      if (newPlan === "STARTER") resolved = "GROWTH";
      else if (newPlan === "PRO" || newPlan === "AGENCY") resolved = "ENTERPRISE";

      setUserPlan(resolved);
      if (resolved === "GROWTH") {
        setMaxQueries(30);
      } else if (resolved === "ENTERPRISE") {
        setMaxQueries(100);
      } else {
        setMaxQueries(3);
      }
    }

    window.addEventListener("georadar_plan_updated", handlePlanChange);
    return () => {
      window.removeEventListener("georadar_plan_updated", handlePlanChange);
    };
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!isAuthenticated) return;

    let isMounted = true;

    async function loadSettings() {
      setIsLoadingSettings(true);
      setSettingsError("");

      try {
        const activeBrandName = audit?.brandProfile?.name || brandName;
        const url = activeBrandName
          ? `/api/brand-settings?brandName=${encodeURIComponent(activeBrandName)}`
          : "/api/brand-settings";
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load settings");

        const data = (await response.json()) as BrandSettingsResponse;
        if (!isMounted) return;

        if (data.plan) {
          const p = data.plan.toUpperCase();
          let resolved = p;
          if (p === "STARTER") resolved = "GROWTH";
          else if (p === "PRO" || p === "AGENCY") resolved = "ENTERPRISE";
          setUserPlan(resolved);
        }
        if (typeof data.maxQueries === "number") {
          setMaxQueries(data.maxQueries);
        }

        if (data.brand) {
          setBrandName(data.brand.name);
          setWebsiteUrl(data.brand.websiteUrl);
          setSavedBrandName(data.brand.name);
          setSavedWebsiteUrl(data.brand.websiteUrl);
          if (data.brand.targetLocation) {
            setTargetLocation(data.brand.targetLocation);
            setSavedTargetLocation(data.brand.targetLocation);
          }

          // Never overwrite valid audit competitors with an empty array from fresh DB record
          if (data.brand.competitors && data.brand.competitors.length > 0) {
            setCompetitors(data.brand.competitors);
          } else if (auditCompetitors.length > 0) {
            setCompetitors(auditCompetitors);
            // Sync competitors back to database
            persistSettings(
              auditCompetitors,
              data.queries.length > 0 ? data.queries.map((q) => q.queryText) : queries
            ).catch(() => {});
          }
        } else if (auditCompetitors.length > 0) {
          setCompetitors(auditCompetitors);
        }

        if (data.queries && data.queries.length > 0) {
          setQueries(data.queries.map((query) => query.queryText));
        }
      } catch {
        if (isMounted) {
          setSettingsError("Could not load saved settings from the database.");
        }
      } finally {
        if (isMounted) setIsLoadingSettings(false);
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, status]);

  const handleSwitchPlan = async (planId: string) => {
    setIsUpdatingPlan(true);
    setPlanSuccessMsg("");

    try {
      setUserPlan(planId);
      if (planId === "GROWTH") setMaxQueries(30);
      else if (planId === "ENTERPRISE") setMaxQueries(100);
      else setMaxQueries(3);

      try {
        localStorage.setItem("georadar_test_plan", planId);
      } catch {}

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("georadar_plan_updated", { detail: { plan: planId } })
        );
      }

      const res = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      if (res.ok) {
        const data = await res.json();
        const p = (data.plan || planId).toUpperCase();
        setUserPlan(p);
      }

      setPlanSuccessMsg(`Successfully switched to ${planId} plan!`);
      setTimeout(() => setPlanSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Failed to switch plan:", err);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  async function handleDeleteAccount() {
    setIsDeletingAccount(true);
    setDeleteError("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete account");
      }

      resetAudit();
      clearPendingScan();
      setActiveUserId(null);
      await signOut({ callbackUrl: "/" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete account. Please try again.";
      setDeleteError(msg);
      setIsDeletingAccount(false);
    }
  }

  const addCompetitor = () => {
    const trimmed = newCompetitor.trim();
    if (trimmed && !competitors.includes(trimmed)) {
      setCompetitors([...competitors, trimmed]);
      setNewCompetitor("");
    }
  };

  const removeCompetitor = (comp: string) => {
    setCompetitors(competitors.filter((c) => c !== comp));
  };

  const isIdentityChanged = isAuthenticated && Boolean(
    savedBrandName &&
    (brandName.trim() !== savedBrandName || websiteUrl.trim() !== savedWebsiteUrl)
  );

  const persistSettings = async (nextCompetitors: string[], nextQueries: string[], resetOnIdentityChange = false) => {
    if (!isAuthenticated) return;

    if (!brandName.trim()) {
      throw new Error("Brand name is required before saving tracked queries.");
    }

    const response = await fetch("/api/brand-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName,
        websiteUrl,
        competitors: nextCompetitors,
        queries: nextQueries,
        resetOnIdentityChange,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save settings");
    }

    const data = (await response.json()) as BrandSettingsResponse;
    if (data.brand) {
      setBrandName(data.brand.name);
      setWebsiteUrl(data.brand.websiteUrl);
      setSavedBrandName(data.brand.name);
      setSavedWebsiteUrl(data.brand.websiteUrl);
      setCompetitors(data.brand.competitors ?? []);
    }
    setQueries(data.queries.map((query) => query.queryText));
  };

  const handleSaveBrandProfile = async (resetOnIdentityChange = false) => {
    setIsSavingSettings(true);
    setSettingsError("");
    setSavedSuccess(false);

    try {
      if (isAuthenticated) {
        await persistSettings(competitors, queries, resetOnIdentityChange);
      }

      if (audit) {
        if (resetOnIdentityChange) {
          resetAudit();
        } else {
          saveAudit({
            ...audit,
            brandProfile: {
              ...audit.brandProfile,
              name: brandName,
              websiteUrl,
              targetLocation: targetLocation.trim() || undefined,
              competitors,
            },
          });
        }
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Failed to save brand settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const addQuery = async () => {
    const trimmed = newQuery.trim();
    if (!trimmed || queries.includes(trimmed)) return;

    if (queries.length >= maxQueries) {
      const planLabel = userPlan === "GROWTH" ? "Growth" : userPlan === "ENTERPRISE" ? "Enterprise" : "Free";
      setSettingsError(
        `Query limit reached (${queries.length}/${maxQueries}). ${planLabel} tier allows up to ${maxQueries} tracked queries. Upgrade your plan in the Billing tab to track more.`
      );
      return;
    }

    const nextQueries = [...queries, trimmed];
    setQueries(nextQueries);
    setNewQuery("");

    if (isAuthenticated) {
      setIsSavingQueries(true);
      setSettingsError("");
      try {
        await persistSettings(competitors, nextQueries);
      } catch (error) {
        setQueries(queries);
        setSettingsError(error instanceof Error ? error.message : "Failed to save query");
      } finally {
        setIsSavingQueries(false);
      }
    }
  };

  const removeQuery = async (queryToRemove: string) => {
    const nextQueries = queries.filter((q) => q !== queryToRemove);
    setQueries(nextQueries);

    if (isAuthenticated) {
      setIsSavingQueries(true);
      setSettingsError("");
      try {
        await persistSettings(competitors, nextQueries);
      } catch (error) {
        setQueries(queries);
        setSettingsError(error instanceof Error ? error.message : "Failed to remove query");
      } finally {
        setIsSavingQueries(false);
      }
    }
  };

  const autoSuggestQueries = async () => {
    if (!brandName.trim()) {
      setSettingsError("Please enter a Brand Name above before generating queries.");
      return;
    }
    setIsSuggestingQueries(true);
    setSettingsError("");
    try {
      const res = await fetch("/api/queries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          websiteUrl: websiteUrl.trim(),
        }),
      });
      const result = await res.json();
      if (result.success && result.data?.suggestedQueries) {
        const newItems: string[] = [];
        for (const sq of result.data.suggestedQueries) {
          if (!queries.includes(sq.queryText) && queries.length + newItems.length < maxQueries) {
            newItems.push(sq.queryText);
          }
        }
        if (newItems.length > 0) {
          const nextQueries = [...queries, ...newItems];
          setQueries(nextQueries);
          if (isAuthenticated) {
            await persistSettings(competitors, nextQueries);
          }
        }
        if (result.data.detectedCompetitors && competitors.length === 0) {
          const newComps = result.data.detectedCompetitors.slice(0, 5);
          setCompetitors(newComps);
          if (isAuthenticated) {
            await persistSettings(newComps, queries);
          }
        }
      }
    } catch {
      setSettingsError("Failed to auto-suggest queries with Gemini. Please try again.");
    } finally {
      setIsSuggestingQueries(false);
    }
  };

  const isPaidPlan = ["GROWTH", "ENTERPRISE"].includes(userPlan);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-300">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-mono tracking-widest text-[var(--syn-muted)] uppercase mb-1">
            {t("settings.mgmtEyebrow")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--syn-heading)]">
            {t("settings.title")}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--syn-muted)] mt-1 max-w-2xl">
            {t("settings.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {savedSuccess && (
            <span className="syn-badge syn-badge-emerald animate-pulse">
              <Check className="w-3 h-3" /> {t("settings.changesSaved")}
            </span>
          )}
          {isLoadingSettings && (
            <span className="syn-badge syn-badge-neutral">
              <Loader2 className="w-3 h-3 animate-spin" /> {t("settings.syncingDb")}
            </span>
          )}
          <LanguageSwitcher variant="dropdown" />
          <ThemeSwitcher />
        </div>
      </div>

      {/* ── Tab Switcher: Brand Settings vs. Workspace Team vs. Billing & Plans ─────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("brand")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "brand"
              ? "bg-[var(--syn-card)] text-[var(--syn-heading)] shadow-sm border border-[var(--syn-border)]"
              : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          {t("settings.brandTab")}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "team"
              ? "bg-[var(--syn-card)] text-[var(--syn-heading)] shadow-sm border border-[var(--syn-border)]"
              : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)]"
          }`}
        >
          <Users2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Workspace Team</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "billing"
              ? "bg-[var(--syn-card)] text-[var(--syn-heading)] shadow-sm border border-[var(--syn-border)]"
              : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)]"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          {t("settings.billingTab")}
          {isPaidPlan ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 font-normal">
              {t("common.free")}
            </span>
          )}
        </button>
      </div>

      {settingsError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {settingsError}
        </div>
      )}

      {planSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {planSuccessMsg}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
         TAB 1: BRAND CONFIGURATION & WORKSPACE
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "brand" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: Brand Profile (7 cols) */}
          <div className="lg:col-span-7 syn-card flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--syn-border)] mb-4">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-[var(--syn-heading)]">{t("settings.brandIdentity")}</h3>
              </div>

              {!permissions.canEditBrandProfile && (
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-600 dark:text-sky-400 flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 shrink-0 text-sky-400" />
                  <span>{t("settings.readOnlyNotice") || "Read-Only Mode: Settings can only be edited by GEO Analysts and Brand Leads."}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--syn-text)] block mb-1.5">
                    {t("settings.brandName")}
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    disabled={!permissions.canEditBrandProfile}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder={t("settings.brandPlaceholder")}
                    className="syn-input disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--syn-text)] block mb-1.5">
                    {t("settings.websiteUrl")}
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    disabled={!permissions.canEditBrandProfile}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder={t("settings.websitePlaceholder")}
                    className="syn-input disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Target Location Autocomplete */}
                <div>
                  <PlaceAutocomplete
                    value={targetLocation}
                    disabled={!permissions.canEditBrandProfile}
                    onChange={(loc) => setTargetLocation(loc)}
                    label="Target Market / Geographic Location"
                    sublabel="Geo-target your brand's AI search audit for visibility in this specific location"
                    placeholder="Search country, city, or region (e.g. United States, Berlin, Tokyo)..."
                  />
                </div>

                {isIdentityChanged && permissions.canEditBrandProfile && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                      <AlertTriangle className="w-4 h-4" />
                      {t("settings.identityChangeTitle")}
                    </div>
                    <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                      {t("settings.identityChangeDesc", { from: savedBrandName, to: brandName })}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSaveBrandProfile(true)}
                      disabled={isSavingSettings}
                      className="syn-btn-primary text-xs !bg-amber-600 hover:!bg-amber-700 mt-1 cursor-pointer"
                    >
                      {t("settings.confirmResetHistory")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--syn-border)] flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveBrandProfile(false)}
                disabled={!permissions.canEditBrandProfile || isSavingSettings || !brandName.trim()}
                className="syn-btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {t("settings.savingProfile")}
                  </>
                ) : (
                  t("settings.saveProfile")
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Competitor Shortlist (5 cols) */}
          <div className="lg:col-span-5 syn-card flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--syn-border)] mb-4">
                <Users2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-[var(--syn-heading)]">
                  {t("settings.competitorsTitle", { count: competitors.length })}
                </h3>
              </div>

              <p className="text-xs text-[var(--syn-muted)] mb-4">
                {t("settings.competitorsDesc")}
              </p>

              <div className="flex flex-wrap gap-2 mb-4 max-h-[140px] overflow-y-auto">
                {competitors.map((comp) => (
                  <span key={comp} className="syn-badge syn-badge-neutral text-xs py-1.5 px-3">
                    {comp}
                    {permissions.canEditBrandProfile && (
                      <button
                        type="button"
                        onClick={() => removeCompetitor(comp)}
                        className="text-[var(--syn-muted)] hover:text-red-500 ml-1 cursor-pointer"
                        aria-label={`Remove ${comp}`}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {permissions.canEditBrandProfile && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("settings.competitorPlaceholder")}
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCompetitor();
                      }
                    }}
                    className="syn-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCompetitor}
                    className="syn-btn-secondary shrink-0 text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t("settings.addCompetitor")}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--syn-border)] flex justify-between items-center text-xs text-[var(--syn-muted)]">
              <span>{t("settings.benchmarkLimit")}</span>
            </div>
          </div>

          {/* Card 3: Tracked Queries (12 cols) */}
          <div className="lg:col-span-12 syn-card flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-[var(--syn-heading)]">
                    {t("settings.trackedQueriesTitle", { count: queries.length, max: maxQueries })}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {permissions.canManageQueries && (
                    <button
                      type="button"
                      onClick={autoSuggestQueries}
                      disabled={isSuggestingQueries || queries.length >= maxQueries}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      {isSuggestingQueries ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>{t("settings.suggesting")}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>{t("settings.autoSuggest")}</span>
                        </>
                      )}
                    </button>
                  )}
                  <span className="syn-badge syn-badge-emerald text-xs">
                    {userPlan === "GROWTH"
                      ? `Growth (${maxQueries})`
                      : userPlan === "ENTERPRISE"
                      ? `Enterprise (${maxQueries})`
                      : `Free (${maxQueries})`}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 max-h-[280px] overflow-y-auto">
                {queries.length === 0 ? (
                  <p className="text-xs text-[var(--syn-muted)] italic py-4">{t("settings.noQueries")}</p>
                ) : (
                  queries.map((q) => (
                    <div
                      key={q}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-xs"
                    >
                      <span className="font-mono text-[var(--syn-text)] font-medium line-clamp-1">
                        &ldquo;{q}&rdquo;
                      </span>
                      {permissions.canManageQueries && (
                        <button
                          type="button"
                          onClick={() => removeQuery(q)}
                          disabled={isSavingQueries}
                          className="text-[var(--syn-muted)] hover:text-red-500 transition-colors shrink-0 ml-2 cursor-pointer"
                          aria-label="Remove query"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {permissions.canManageQueries && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      queries.length >= maxQueries
                        ? t("settings.queryLimitReached", { max: maxQueries, tier: userPlan })
                        : t("settings.queryPlaceholder")
                    }
                    value={newQuery}
                    disabled={queries.length >= maxQueries}
                    onChange={(e) => setNewQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addQuery();
                      }
                    }}
                    className="syn-input text-xs disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={addQuery}
                    disabled={isSavingQueries || !newQuery.trim() || queries.length >= maxQueries}
                    className="syn-btn-secondary shrink-0 text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t("settings.addQueryBtn")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Engine Monitoring & Automation (12 cols) */}
          <div className="lg:col-span-12 syn-card flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-[var(--syn-heading)]">{t("settings.enginesMonitored")}</h3>
                </div>
                <span className="syn-badge syn-badge-emerald text-xs font-mono">
                  {t("settings.all6Engines")}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-2">
                {[
                  { name: "ChatGPT (OpenAI)", model: "GPT-4o Search", icon: <OpenAISpiralIcon size={18} className="text-emerald-400" /> },
                  { name: "Gemini (Google)", model: "Search Grounding", icon: <GeminiDiamondIcon size={18} /> },
                  { name: "Perplexity AI", model: "Sonar Online", icon: <PerplexityIcon size={18} /> },
                  { name: "Claude (Anthropic)", model: "3.5 Sonnet", icon: <ClaudeSunburstIcon size={18} /> },
                  { name: "DeepSeek", model: "V3 Search", icon: <Layers className="w-4 h-4 text-cyan-400" /> },
                  { name: "Grok (xAI)", model: "Grok 2 Real-Time", icon: <GrokSlashIcon size={18} className="text-pink-400" /> },
                ].map((eng) => (
                  <div
                    key={eng.name}
                    className="p-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col justify-between gap-3 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="p-1.5 rounded-lg bg-[var(--syn-bg)] border border-[var(--syn-border)] shrink-0">
                        {eng.icon}
                      </div>
                      <span className="syn-badge syn-badge-emerald text-[9px] px-1.5 py-0.5">
                        <Radio className="w-2 h-2 animate-pulse shrink-0" /> {t("settings.activeProbe")}
                      </span>
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-[var(--syn-heading)] block truncate">{eng.name}</strong>
                      <span className="text-[10px] text-[var(--syn-muted)] block truncate font-mono">{eng.model}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--syn-border)] flex items-center justify-between text-xs text-[var(--syn-muted)]">
              <span>{t("settings.automatedWeeklyDigest")}</span>
              <span className="font-semibold text-[var(--syn-heading)] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t("settings.enabled")}
              </span>
            </div>
          </div>

          {/* Card 6: Workspace Deletion (Danger Zone - Owner Only) */}
          {permissions.canDeleteWorkspace && brands.length > 1 && (
            <div className="lg:col-span-12 syn-card border-amber-500/25 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trash2 className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-amber-500">
                    Delete &ldquo;{brandName || audit?.brandProfile?.name}&rdquo; Workspace
                  </h3>
                </div>
                <p className="text-xs text-[var(--syn-muted)] max-w-xl leading-relaxed">
                  Permanently removes this brand workspace, tracked queries, and audit history. Your user account and other brand workspaces remain intact.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowWorkspaceDeleteModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Brand Workspace</span>
              </button>
            </div>
          )}

          {/* Card 7: Danger Zone (Account Deletion - Owner Only) */}
          {permissions.canDeleteWorkspace && (
            <div className="lg:col-span-12 syn-card border-red-500/25 bg-red-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h3 className="text-base font-bold text-red-500">{t("settings.dangerZoneTitle")}</h3>
                </div>
                <p className="text-xs text-[var(--syn-muted)] max-w-xl leading-relaxed">
                  {t("settings.dangerZoneDesc")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteInput("");
                  setDeleteError("");
                  setShowDeleteModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {t("settings.deleteAccountBtn")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
         TAB 2: WORKSPACE TEAM & COLLABORATION
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "team" && (
        <WorkspaceTeamTab
          brandName={brandName || audit?.brandProfile?.name || "Acme Corp"}
          websiteUrl={websiteUrl || audit?.brandProfile?.websiteUrl || ""}
          userPlan={userPlan}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
         TAB 3: BILLING & SUBSCRIPTION MANAGEMENT
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "billing" && (
        <div className="space-y-8">
          {!permissions.canManageBilling && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400" />
              <div>
                <span className="font-bold block">{t("settings.billingRestrictedTitle") || "Plan Management Restricted"}</span>
                <span className="text-[11px] text-[var(--syn-muted)]">{t("settings.billingRestrictedDesc") || "Upgrading subscription plans and billing is restricted to Brand Leads (Admins & Owners)."}</span>
              </div>
            </div>
          )}

          {/* Active Plan Overview Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Active Subscription Banner */}
            <div className="lg:col-span-2 syn-card !p-6 sm:!p-8 flex flex-col justify-between gap-6 border-emerald-500/30 bg-gradient-to-br from-[var(--syn-card)] to-[var(--syn-card-subtle)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="syn-badge syn-badge-emerald text-xs font-mono uppercase">
                    {t("settings.activeSubscriptionBadge")}
                  </span>
                  <span className="text-xs text-[var(--syn-muted)]">
                    {t("settings.autoRenewsMonthly")}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 mb-2">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--syn-heading)]">
                    {userPlan === "GROWTH" ? t("settings.starterTierName") : userPlan === "ENTERPRISE" ? t("settings.agencyTierName") : t("settings.freeTierName")}
                  </h2>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {userPlan === "GROWTH" ? "$19/month" : userPlan === "ENTERPRISE" ? "$49/month" : "$0/month"}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--syn-muted)] max-w-xl leading-relaxed">
                  {userPlan === "FREE"
                    ? t("settings.freePlanDesc")
                    : t("settings.paidPlanDesc")}
                </p>
              </div>

              {/* Resource Meter */}
              <div className="pt-4 border-t border-[var(--syn-border)] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--syn-heading)] flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-400" /> {t("settings.queriesUsageLabel")}
                  </span>
                  <span className="font-mono text-[var(--syn-muted)]">
                    {t("settings.queriesUsageCount", { count: queries.length, max: maxQueries, pct: Math.round((queries.length / maxQueries) * 100) })}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[var(--syn-card-inner)] border border-[var(--syn-border)] overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, (queries.length / maxQueries) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Quick Feature Gating Status */}
            <div className="syn-card flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-[var(--syn-border)] mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-[var(--syn-heading)]">{t("settings.featuresIncludedTitle")}</h3>
                </div>

                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-center justify-between">
                    <span className="text-[var(--syn-muted)]">{t("settings.featCompetitorBenchmark")}</span>
                    {isPaidPlan ? (
                      <span className="syn-badge syn-badge-emerald text-[10px]">{t("settings.unlocked")}</span>
                    ) : (
                      <span className="syn-badge syn-badge-amber text-[10px]">{t("settings.locked")}</span>
                    )}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-[var(--syn-muted)]">{t("settings.featMultiEngineProbing")}</span>
                    <span className="syn-badge syn-badge-emerald text-[10px]">{t("settings.enginesCount")}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-[var(--syn-muted)]">{t("settings.featWeeklyDigests")}</span>
                    {isPaidPlan ? (
                      <span className="syn-badge syn-badge-emerald text-[10px]">{t("settings.active")}</span>
                    ) : (
                      <span className="syn-badge syn-badge-neutral text-[10px]">{t("settings.manual")}</span>
                    )}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-[var(--syn-muted)]">{t("settings.featMaxQueryLimit")}</span>
                    <span className="font-mono font-bold text-[var(--syn-heading)]">{t("settings.queriesCount", { count: maxQueries })}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-[var(--syn-border)] text-[11px] text-[var(--syn-muted)]">
                {t("settings.noLockIn")}
              </div>
            </div>
          </div>

          {/* 3 Tier Upgrade Comparison Cards */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-[var(--syn-heading)]">
                {t("settings.plansTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--syn-muted)] mt-1">
                {t("settings.plansSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {TIERS.map((tier) => {
                const isActive = userPlan === tier.id;
                const isPopular = Boolean(tier.badge);

                return (
                  <div
                    key={tier.id}
                    className={`syn-card !p-6 sm:!p-7 flex flex-col justify-between gap-6 relative transition-all ${
                      isActive
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg"
                        : isPopular
                        ? "border-emerald-500/40"
                        : "border-[var(--syn-border)]"
                    }`}
                  >
                    {tier.badge && (
                      <span className="absolute -top-3 right-6 syn-badge syn-badge-emerald text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {tier.badge}
                      </span>
                    )}

                    <div>
                      {/* Plan Title & Pricing */}
                      <div className="flex items-baseline justify-between gap-2 mb-2">
                        <h4 className="text-lg font-bold text-[var(--syn-heading)]">{tier.name}</h4>
                        {isActive && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                            {t("settings.currentBadge")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--syn-heading)]">
                          {tier.price}
                        </span>
                        <span className="text-xs text-[var(--syn-muted)] font-medium">
                          /{tier.billingCycle}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--syn-muted)] leading-relaxed mb-4">
                        {tier.description}
                      </p>

                      {/* AI Engines Monitored Icons Row */}
                      <div className="py-2.5 border-y border-[var(--syn-border)] my-4 flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-[var(--syn-muted)] font-bold">
                          {t("settings.all6Engines")}
                        </span>
                        <AIEngineRow className="flex items-center gap-1.5" />
                      </div>

                      {/* Features List */}
                      <ul className="space-y-3 pt-2 text-xs">
                        {tier.features.map((feat, i) => (
                          <li
                            key={i}
                            className={`flex items-start gap-2.5 ${
                              feat.included
                                ? feat.highlight
                                  ? "text-emerald-400 font-semibold"
                                  : "text-[var(--syn-text)]"
                                : "text-[var(--syn-muted)] opacity-50 line-through"
                            }`}
                          >
                            {feat.included ? (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-[var(--syn-muted)] shrink-0 mt-0.5" />
                            )}
                            <span className="leading-tight">{feat.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-[var(--syn-border)]">
                      {isActive ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)] text-xs font-bold cursor-default flex items-center justify-center gap-2"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> {t("settings.activePlanBtn")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSwitchPlan(tier.id)}
                          disabled={!permissions.canManageBilling || isUpdatingPlan}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            !permissions.canManageBilling ? "cursor-not-allowed" : "cursor-pointer"
                          } ${
                            tier.id === "GROWTH" || tier.id === "ENTERPRISE"
                              ? "syn-btn-primary"
                              : "syn-btn-secondary"
                          }`}
                        >
                          {isUpdatingPlan ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("settings.updatingPlan")}
                            </>
                          ) : !permissions.canManageBilling ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>{t("settings.brandLeadRequired") || "Brand Lead Only"}</span>
                            </>
                          ) : (
                            <>
                              {tier.id === "FREE" ? t("settings.downgradeToFree") : t("settings.upgradeToPlan", { name: tier.name })}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingAccount) setShowDeleteModal(false);
          }}
        >
          <div className="syn-card max-w-lg w-full !p-6 sm:!p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-red-500/20">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">
                  {t("settings.deleteModalBadge")}
                </span>
                <h3 className="text-xl font-extrabold mt-1 text-[var(--syn-heading)]">
                  {t("settings.deleteModalTitle")}
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs opacity-80 leading-relaxed py-2">
              <p>
                {t("settings.deleteModalDesc")}
              </p>
              <ul className="list-disc list-inside space-y-1 bg-red-500/[0.06] border border-red-500/20 p-3.5 rounded-xl font-medium">
                <li>{t("settings.deleteModalBullet1")}</li>
                <li>{t("settings.deleteModalBullet2")}</li>
                <li>{t("settings.deleteModalBullet3")}</li>
                <li>{t("settings.deleteModalBullet4")}</li>
              </ul>
              <p className="text-[11px] opacity-70">
                {t("settings.deleteModalConfirmPrompt")}
              </p>
            </div>

            <div className="mt-2">
              <input
                type="text"
                placeholder={t("settings.deleteModalPlaceholder")}
                value={confirmDeleteInput}
                onChange={(e) => setConfirmDeleteInput(e.target.value)}
                disabled={isDeletingAccount}
                className="syn-input text-xs font-mono !py-2.5 focus:!border-red-500"
              />
            </div>

            {deleteError && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--syn-border)]">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingAccount}
                className="syn-btn-secondary cursor-pointer"
              >
                {t("settings.deleteModalCancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || confirmDeleteInput.trim() !== "DELETE"}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("settings.deleteModalDeleting")}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> {t("settings.deleteModalConfirmBtn")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Workspace Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={showWorkspaceDeleteModal}
        onClose={() => !isDeletingWorkspace && setShowWorkspaceDeleteModal(false)}
        onConfirm={handleConfirmDeleteWorkspace}
        title={t("settings.deleteWorkspace") || "Delete Workspace"}
        description={`Are you sure you want to delete "${brandName || audit?.brandProfile?.name}" workspace? Permanently removes this brand workspace, tracked queries, and audit history.`}
        confirmText={t("common.delete") || "Delete Workspace"}
        cancelText={t("common.cancel") || "Cancel"}
        variant="danger"
        isLoading={isDeletingWorkspace}
      >
        <div className="p-3.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold border border-amber-500/20 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[var(--syn-heading)] truncate">
                {brandName || audit?.brandProfile?.name || "Workspace"}
              </p>
              <p className="text-[11px] text-[var(--syn-muted)] truncate">
                {websiteUrl || audit?.brandProfile?.websiteUrl || ""}
              </p>
            </div>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}

export default function SettingsPage() {
  const { audit, saveAudit, resetAudit, brands, deleteBrand } = useAuditData();

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--syn-muted)]">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          Loading settings...
        </div>
      }
    >
      <SettingsFormContent
        key={audit?.brandProfile?.name || "brand_settings"}
        audit={audit}
        saveAudit={saveAudit}
        resetAudit={resetAudit}
        brands={brands}
        deleteBrand={deleteBrand}
      />
    </Suspense>
  );
}
