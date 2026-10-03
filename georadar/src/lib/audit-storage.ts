"use client";

import { useSyncExternalStore, useCallback, useState, useEffect } from "react";
import type { AuditResult } from "@/lib/geo-engine/types";
export type { AuditResult } from "@/lib/geo-engine/types";

const STORAGE_KEY = "georadar_audit_result";
const BRANDS_LIST_KEY = "georadar_brands_list";
const PENDING_SCAN_KEY = "georadar_pending_scan";

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

function getSnapshot(): AuditResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    const raw = localStorage.getItem(BRANDS_LIST_KEY);
    if (raw !== cachedBrandsString) {
      cachedBrandsString = raw;
      cachedBrandsList = raw ? JSON.parse(raw) : [];
    }
    // Fallback: If no brands list exists yet but active audit exists, initialize brands list with active audit
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
        localStorage.setItem(BRANDS_LIST_KEY, JSON.stringify(cachedBrandsList));
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

export function saveStoredAudit(result: AuditResult): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    
    // Also sync into brands list
    const brandId = result.brandProfile.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const existingRaw = localStorage.getItem(BRANDS_LIST_KEY);
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

    localStorage.setItem(BRANDS_LIST_KEY, JSON.stringify(brands));
    cachedBrandsString = null;
    cachedSnapshotString = null;

    window.dispatchEvent(new Event("georadar_audit_updated"));
    window.dispatchEvent(new Event("georadar_brands_updated"));
  } catch (e) {
    console.error("Failed to save audit:", e);
  }
}

export function clearStoredAudit(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BRANDS_LIST_KEY);
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

export function switchActiveBrand(brandId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(BRANDS_LIST_KEY);
    if (!raw) return;
    const brands: StoredBrand[] = JSON.parse(raw);
    const target = brands.find((b) => b.id === brandId);
    if (target && target.auditResult) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(target.auditResult));
      cachedSnapshotString = null;
      window.dispatchEvent(new Event("georadar_audit_updated"));
    }
  } catch (e) {
    console.error("Failed to switch brand:", e);
  }
}

export function deleteStoredBrand(brandId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(BRANDS_LIST_KEY);
    if (!raw) return;
    let brands: StoredBrand[] = JSON.parse(raw);
    brands = brands.filter((b) => b.id !== brandId);
    localStorage.setItem(BRANDS_LIST_KEY, JSON.stringify(brands));
    cachedBrandsString = null;

    // If active audit was this brand, switch to first remaining or clear
    if (cachedAuditResult?.brandProfile?.name?.toLowerCase()?.replace(/[^a-z0-9]/g, "-") === brandId) {
      if (brands.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(brands[0].auditResult));
      } else {
        localStorage.removeItem(STORAGE_KEY);
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const rawAudit = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const rawBrands = useSyncExternalStore(subscribe, getBrandsSnapshot, getServerBrandsSnapshot);

  const audit = mounted ? rawAudit : null;
  const brands = mounted ? rawBrands : [];

  const save = useCallback((newResult: AuditResult) => {
    saveStoredAudit(newResult);
  }, []);

  const reset = useCallback(() => {
    clearStoredAudit();
  }, []);

  const switchBrand = useCallback((brandId: string) => {
    switchActiveBrand(brandId);
  }, []);

  const deleteBrand = useCallback((brandId: string) => {
    deleteStoredBrand(brandId);
  }, []);

  return {
    audit,
    brands,
    isLoading: !mounted,
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

export const DRAFT_FORM_KEY = "georadar_audit_form_draft";

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

export function saveAuditFormDraft(draft: AuditFormDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_FORM_KEY, JSON.stringify(draft));
  } catch {}
}

export function getAuditFormDraft(): AuditFormDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_FORM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuditFormDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_FORM_KEY);
  } catch {}
}

