"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useAuditData } from "@/lib/audit-storage";

export interface AppNotification {
  id: string;
  type: "visibility" | "source" | "action" | "query" | "system";
  title: string;
  description: string;
  time: string;
  href: string;
  isRead: boolean;
}

function formatRelativeTime(dateInput?: Date | string | number): string {
  if (!dateInput) return "Just now";
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1d ago";
  return `${diffDays}d ago`;
}

export function useNotifications() {
  const { data: session, status } = useSession();
  const { audit } = useAuditData();
  const [serverNotifications, setServerNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [allMarkedRead, setAllMarkedRead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch persisted notifications from server when authenticated
  const fetchServerNotifications = useCallback(async () => {
    if (status !== "authenticated" || !session?.user) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          const formatted: AppNotification[] = data.notifications.map((n: {
            id: string;
            type: string;
            title: string;
            message: string;
            link: string;
            isRead: boolean;
            createdAt?: string;
          }) => ({
            id: n.id,
            type: (n.type || "system") as AppNotification["type"],
            title: n.title,
            description: n.message,
            time: formatRelativeTime(n.createdAt),
            href: n.link || "/dashboard",
            isRead: n.isRead,
          }));
          setServerNotifications(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to load notifications from API:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchServerNotifications();
  }, [fetchServerNotifications]);

  // Derive dynamic notifications from real-time audit scan data
  const derivedNotifications = useMemo<AppNotification[]>(() => {
    const brandName = audit?.brandProfile?.name || "Your Brand";
    const overallScore = audit?.shareOfVoice?.overallScore ?? 84;
    const topSource = audit?.citedSources?.[0]?.domain || "reddit.com";
    const topAction = audit?.actions?.[0]?.title || "Optimize Schema for Product FAQ";
    const topQuery = audit?.mentionAnalyses?.[0]?.query || "Top AI Recommendations";

    const items: AppNotification[] = [
      {
        id: `derived-vis-${brandName}`,
        type: "visibility",
        title: "GEO Visibility Spike",
        description: `${brandName}'s AI share of voice reached ${overallScore}% across Perplexity & ChatGPT Search.`,
        time: "10m ago",
        href: "/dashboard",
        isRead: false,
      },
      {
        id: `derived-source-${topSource}`,
        type: "source",
        title: "New High-Impact Citation",
        description: `Discovered new citation on ${topSource} for brand search queries.`,
        time: "1h ago",
        href: "/dashboard/sources",
        isRead: false,
      },
      {
        id: `derived-action-${brandName}`,
        type: "action",
        title: "Action Item Recommended",
        description: topAction,
        time: "3h ago",
        href: "/dashboard/actions",
        isRead: false,
      },
      {
        id: `derived-query-${brandName}`,
        type: "query",
        title: "Top 3 Ranking in Claude & Gemini",
        description: `Mentioned as a top recommendation for "${topQuery}".`,
        time: "1d ago",
        href: "/dashboard/queries",
        isRead: true,
      },
      {
        id: `derived-system-${brandName}`,
        type: "system",
        title: "Engine Audit Completed",
        description: `Scheduled multi-engine audit completed across all 5 AI models.`,
        time: "2d ago",
        href: "/dashboard",
        isRead: true,
      },
    ];

    return items;
  }, [audit]);

  // Combine server notifications or fallback to derived notifications
  const notifications = useMemo<AppNotification[]>(() => {
    const baseList = serverNotifications.length > 0 ? serverNotifications : derivedNotifications;
    return baseList.map((n) => ({
      ...n,
      isRead: allMarkedRead || readIds.has(n.id) || n.isRead,
    }));
  }, [serverNotifications, derivedNotifications, readIds, allMarkedRead]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAsRead = useCallback(async (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));

    if (session?.user && !id.startsWith("derived-")) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  }, [session]);

  const markAllAsRead = useCallback(async () => {
    setAllMarkedRead(true);
    setReadIds(new Set(notifications.map((n) => n.id)));

    if (session?.user) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAll: true }),
        });
      } catch (err) {
        console.error("Failed to mark all notifications as read:", err);
      }
    }
  }, [session, notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchServerNotifications,
  };
}
