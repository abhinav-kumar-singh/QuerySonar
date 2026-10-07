"use client";

import { useSyncExternalStore, useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { AuditResult } from "@/lib/geo-engine/types";
export type { AuditResult } from "@/lib/geo-engine/types";

let currentActiveUserId: string | null = null;

export function getActiveUserId(): string | null {
  return currentActiveUserId;
}

export function setActiveUserId(id: string | null): void {
  if (currentActiveUserId !== id) {
    currentActiveUserId = id;
    cachedSnapshotString = null;
    cachedAuditResult = null;
    cachedBrandsString = null;
    cachedBrandsList = [];
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("georadar_audit_updated"));
      window.dispatchEvent(new Event("georadar_brands_updated"));
    }
  }
}

export function getStorageKey(userId?: string | null): string {
  const uid = userId !== undefined ? userId : currentActiveUserId;
  if (uid && uid !== "anonymous") {
    return `georadar_audit_result_${uid}`;
  }
  return "georadar_anon_audit_result";
}

export function getBrandsListKey(userId?: string | null): string {
  const uid = userId !== undefined ? userId : currentActiveUserId;
  if (uid && uid !== "anonymous") {
    return `georadar_brands_list_${uid}`;
  }
  return "georadar_anon_brands_list";
}

export const PENDING_SCAN_KEY = "georadar_pending_scan";
export const DRAFT_FORM_KEY = "georadar_audit_form_draft";

export interface StoredBrand {
  id: string;
  name: string;
  websiteUrl: string;
  overallScore: number;
  queriesCount: number;
  mentionsCount: number;
  lastScannedAt: string;
  queries: string[];
  competitors: string[];
  auditResult: AuditResult;
}

// Cached memory snapshots to prevent unnecessary re-renders with useSyncExternalStore
let cachedSnapshotString: string | null = null;
let cachedAuditResult: AuditResult | null = null;

let cachedBrandsString: string | null = null;
let cachedBrandsList: StoredBrand[] = [];

// Clean legacy shared un-scoped keys on client load to prevent cross-account pollution
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("georadar_audit_result");
    localStorage.removeItem("georadar_brands_list");
  } catch {}
}

function getSnapshot(): AuditResult | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (raw !== cachedSnapshotString) {
      cachedSnapshotString = raw;
      cachedAuditResult = raw ? JSON.parse(raw) : null;
    }
    return cachedAuditResult;
  } catch (e) {
    console.error("Failed to parse stored audit:", e);
    return null;
  }
}

function getBrandsSnapshot(): StoredBrand[] {
  if (typeof window === "undefined") return [];
  try {
    const brandsKey = getBrandsListKey();
    const raw = localStorage.getItem(brandsKey);
    if (raw !== cachedBrandsString) {
      cachedBrandsString = raw;
      cachedBrandsList = raw ? JSON.parse(raw) : [];
    }
    // Fallback: If no brands list exists yet for this user but active audit exists, initialize brands list with active audit
    if (cachedBrandsList.length === 0 && cachedAuditResult) {
      const initialBrand: StoredBrand = {
        id: cachedAuditResult.brandProfile.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        name: cachedAuditResult.brandProfile.name,
        websiteUrl: cachedAuditResult.brandProfile.websiteUrl || "",
        overallScore: Math.round(cachedAuditResult.shareOfVoice?.overallScore || 0),
        queriesCount: cachedAuditResult.mentionAnalyses?.length || 1,
        mentionsCount: cachedAuditResult.mentionAnalyses?.filter((m) => m.brandMentioned).length || 0,
        lastScannedAt: new Date().toISOString(),
        queries: cachedAuditResult.mentionAnalyses?.map((m) => m.query) || [],
        competitors: cachedAuditResult.brandProfile.competitors || [],
        auditResult: cachedAuditResult,
      };
      cachedBrandsList = [initialBrand];
      try {
        localStorage.setItem(brandsKey, JSON.stringify(cachedBrandsList));
      } catch {}
    }
    return cachedBrandsList;
  } catch (e) {
    console.error("Failed to parse brands list:", e);
    return [];
  }
}

function getServerSnapshot(): AuditResult | null {
  return null;
}

function getServerBrandsSnapshot(): StoredBrand[] {
  return [];
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("georadar_audit_updated", callback);
  window.addEventListener("georadar_brands_updated", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("georadar_audit_updated", callback);
    window.removeEventListener("georadar_brands_updated", callback);
    window.removeEventListener("storage", callback);
  };
}

export function saveStoredAudit(result: AuditResult, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const auditKey = getStorageKey(userId);
    const brandsKey = getBrandsListKey(userId);

    localStorage.setItem(auditKey, JSON.stringify(result));
    
    // Also sync into this user's brands list
    const brandId = result.brandProfile.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const existingRaw = localStorage.getItem(brandsKey);
    let brands: StoredBrand[] = existingRaw ? JSON.parse(existingRaw) : [];

    const newBrandEntry: StoredBrand = {
      id: brandId,
      name: result.brandProfile.name,
      websiteUrl: result.brandProfile.websiteUrl || "",
      overallScore: Math.round(result.shareOfVoice?.overallScore || 0),
      queriesCount: result.mentionAnalyses?.length || 1,
      mentionsCount: result.mentionAnalyses?.filter((m) => m.brandMentioned).length || 0,
      lastScannedAt: new Date().toISOString(),
      queries: result.mentionAnalyses?.map((m) => m.query) || [],
      competitors: result.brandProfile.competitors || [],
      auditResult: result,
    };

    const existingIdx = brands.findIndex((b) => b.id === brandId || b.name.toLowerCase() === result.brandProfile.name.toLowerCase());
    if (existingIdx >= 0) {
      brands[existingIdx] = newBrandEntry;
    } else {
      brands.push(newBrandEntry);
    }

    localStorage.setItem(brandsKey, JSON.stringify(brands));
    cachedBrandsString = null;
    cachedSnapshotString = null;

    window.dispatchEvent(new Event("georadar_audit_updated"));
    window.dispatchEvent(new Event("georadar_brands_updated"));
  } catch (e) {
    console.error("Failed to save audit:", e);
  }
}

export function clearStoredAudit(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const auditKey = getStorageKey(userId);
    const brandsKey = getBrandsListKey(userId);

    localStorage.removeItem(auditKey);
    localStorage.removeItem(brandsKey);
    cachedSnapshotString = null;
    cachedAuditResult = null;
    cachedBrandsString = null;
    cachedBrandsList = [];
    window.dispatchEvent(new Event("georadar_audit_updated"));
    window.dispatchEvent(new Event("georadar_brands_updated"));
  } catch (e) {
    console.error("Failed to clear audit:", e);
  }
}

export function switchActiveBrand(brandId: string, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const brandsKey = getBrandsListKey(userId);
    const auditKey = getStorageKey(userId);

    const raw = localStorage.getItem(brandsKey);
    if (!raw) return;
    const brands: StoredBrand[] = JSON.parse(raw);
    const target = brands.find((b) => b.id === brandId);
    if (target && target.auditResult) {
      localStorage.setItem(auditKey, JSON.stringify(target.auditResult));
      cachedSnapshotString = null;
      window.dispatchEvent(new Event("georadar_audit_updated"));
    }
  } catch (e) {
    console.error("Failed to switch brand:", e);
  }
}

export function deleteStoredBrand(brandId: string, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const brandsKey = getBrandsListKey(userId);
    const auditKey = getStorageKey(userId);

    const raw = localStorage.getItem(brandsKey);
    if (!raw) return;
    let brands: StoredBrand[] = JSON.parse(raw);
    brands = brands.filter((b) => b.id !== brandId);
    localStorage.setItem(brandsKey, JSON.stringify(brands));
    cachedBrandsString = null;

    // If active audit was this brand, switch to first remaining or clear
    if (cachedAuditResult?.brandProfile?.name?.toLowerCase()?.replace(/[^a-z0-9]/g, "-") === brandId) {
      if (brands.length > 0) {
        localStorage.setItem(auditKey, JSON.stringify(brands[0].auditResult));
      } else {
        localStorage.removeItem(auditKey);
      }
      cachedSnapshotString = null;
    }

    window.dispatchEvent(new Event("georadar_audit_updated"));
    window.dispatchEvent(new Event("georadar_brands_updated"));
  } catch (e) {
    console.error("Failed to delete brand:", e);
  }
}

export function useAuditData() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  const userId = session?.user?.id || (session?.user?.email ? `email_${session.user.email.toLowerCase()}` : null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update active user whenever session status/user resolves
  useEffect(() => {
    setActiveUserId(userId);
  }, [userId]);

  // Hydrate from database if local brands are empty for an authenticated user on a new device/browser
  useEffect(() => {
    if (!userId || userId.startsWith("email_") || !mounted) return;

    let isCancelled = false;
    async function hydrateFromServer() {
      try {
        const localKey = getBrandsListKey(userId);
        const existingRaw = typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
        const existingBrands: StoredBrand[] = existingRaw ? JSON.parse(existingRaw) : [];

        // Fetch user's registered workspaces from server
        const res = await fetch("/api/workspaces");
        if (!res.ok) return;
        const data = await res.json();
        if (isCancelled) return;

        if (data.success && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
          const serverWorkspaces = data.workspaces;
          if (existingBrands.length === 0) {
            const hydrated: StoredBrand[] = serverWorkspaces.map((ws: {
              id: string;
              name: string;
              websiteUrl?: string;
              overallScore?: number | null;
              queriesCount?: number;
              queries?: string[];
              competitors?: string[];
              lastAuditDate?: string | null;
              createdAt?: string;
            }) => {
              const brandSlug = ws.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
              return {
                id: brandSlug || ws.id,
                name: ws.name,
                websiteUrl: ws.websiteUrl || "",
                overallScore: Math.round(ws.overallScore || 0),
                queriesCount: ws.queriesCount || (ws.queries?.length || 1),
                mentionsCount: 0,
                lastScannedAt: ws.lastAuditDate || ws.createdAt || new Date().toISOString(),
                queries: ws.queries || [],
                competitors: ws.competitors || [],
                auditResult: {
                  brandProfile: {
                    name: ws.name,
                    websiteUrl: ws.websiteUrl || "",
                    competitors: ws.competitors || [],
                  },
                  shareOfVoice: {
                    brandName: ws.name,
                    overallScore: Math.round(ws.overallScore || 0),
                    perEngine: {
                      openai: Math.round(ws.overallScore || 0),
                      perplexity: Math.round(ws.overallScore || 0),
                      gemini: Math.round(ws.overallScore || 0),
                      claude: 0,
                      deepseek: 0,
                      grok: 0,
                    },
                    totalQueriesTracked: ws.queriesCount || 1,
                    queriesMentionedIn: 0,
                  },
                  topCompetitors: (ws.competitors || []).map((c: string) => ({
                    name: c,
                    bestFor: "Alternative",
                    reason: "Tracked competitor",
                    mentionedByEngines: ["openai", "gemini", "perplexity"],
                  })),
                  remediationActions: [],
                  actions: [],
                  citedSources: [],
                  runDate: ws.lastAuditDate ? new Date(ws.lastAuditDate) : new Date(ws.createdAt || Date.now()),
                  mentionAnalyses: (ws.queries || []).map((q: string) => ({
                    engine: "openai" as const,
                    query: q,
                    brandMentioned: false,
                    mentionPosition: null,
                    sentiment: "neutral" as const,
                    competitorsMentioned: [],
                    citations: [],
                    rawResponse: "",
                    status: "live" as const,
                  })),
                  scannedAt: ws.lastAuditDate || ws.createdAt || new Date().toISOString(),
                } as unknown as AuditResult,
              };
            });

            localStorage.setItem(localKey, JSON.stringify(hydrated));
            const auditKey = getStorageKey(userId);
            if (!localStorage.getItem(auditKey) && hydrated[0]) {
              localStorage.setItem(auditKey, JSON.stringify(hydrated[0].auditResult));
            }

            cachedBrandsString = null;
            cachedSnapshotString = null;
            window.dispatchEvent(new Event("georadar_audit_updated"));
            window.dispatchEvent(new Event("georadar_brands_updated"));
          }
        }
      } catch (err) {
        console.warn("Failed to hydrate workspaces from server:", err);
      }
    }

    hydrateFromServer();
    return () => {
      isCancelled = true;
    };
  }, [userId, mounted]);

  const rawAudit = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const rawBrands = useSyncExternalStore(subscribe, getBrandsSnapshot, getServerBrandsSnapshot);

  const audit = mounted ? rawAudit : null;
  const brands = mounted ? rawBrands : [];

  const save = useCallback((newResult: AuditResult) => {
    saveStoredAudit(newResult, userId);
  }, [userId]);

  const reset = useCallback(() => {
    clearStoredAudit(userId);
  }, [userId]);

  const switchBrand = useCallback((brandId: string) => {
    switchActiveBrand(brandId, userId);
  }, [userId]);

  const deleteBrand = useCallback((brandId: string) => {
    deleteStoredBrand(brandId, userId);
  }, [userId]);

  return {
    audit,
    brands,
    isLoading: !mounted || status === "loading",
    isHydrated: mounted,
    saveAudit: save,
    resetAudit: reset,
    switchBrand,
    deleteBrand,
  };
}

export interface PendingScan {
  brand: string;
  query: string;
  queries?: string[];
  category?: string;
  websiteUrl?: string;
  targetLocation?: string;
  competitors?: string[];
  timestamp: number;
}

export function savePendingScan(scan: Omit<PendingScan, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const data: PendingScan = { ...scan, timestamp: Date.now() };
    localStorage.setItem(PENDING_SCAN_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("georadar_pending_scan_updated"));
  } catch (e) {
    console.error("Failed to save pending scan:", e);
  }
}

export function getPendingScan(): PendingScan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_SCAN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.timestamp || 0) > 3600 * 1000) {
      localStorage.removeItem(PENDING_SCAN_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to get pending scan:", e);
    return null;
  }
}

export function clearPendingScan(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_SCAN_KEY);
    window.dispatchEvent(new Event("georadar_pending_scan_updated"));
  } catch (e) {
    console.error("Failed to clear pending scan:", e);
  }
}

export interface AuditFormDraft {
  brandName: string;
  websiteUrl: string;
  targetLocation?: string;
  queriesList: string[];
  suggestedQueries?: Array<{ queryText: string; type: string; personaLabel: string }>;
  detectedCompetitors?: string[];
  brandSummary?: string;
  category?: string;
  categories?: Array<{ id: string; name: string; isAutoSelected: boolean; confidence?: number }>;
  prompts?: Array<{ id: string; categoryTag: string; queryText: string; type?: string; personaLabel?: string }>;
}

export function saveAuditFormDraft(draft: AuditFormDraft, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const uid = userId !== undefined ? userId : currentActiveUserId;
    const key = uid ? `${DRAFT_FORM_KEY}_${uid}` : `${DRAFT_FORM_KEY}_anon`;
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {}
}

export function getAuditFormDraft(userId?: string | null): AuditFormDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const uid = userId !== undefined ? userId : currentActiveUserId;
    const key = uid ? `${DRAFT_FORM_KEY}_${uid}` : `${DRAFT_FORM_KEY}_anon`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuditFormDraft(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const uid = userId !== undefined ? userId : currentActiveUserId;
    const key = uid ? `${DRAFT_FORM_KEY}_${uid}` : `${DRAFT_FORM_KEY}_anon`;
    localStorage.removeItem(key);
  } catch {}
}
