"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Sparkles,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Check,
  ArrowRight,
} from "lucide-react";
import { useNotifications, type AppNotification } from "@/lib/notifications";
import { useAuditData } from "@/lib/audit-storage";

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { audit } = useAuditData();

  const brandName = audit?.brandProfile.name || "Your Brand";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (item: AppNotification) => {
    markAsRead(item.id);
    setIsOpen(false);
  };

  const renderIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "visibility":
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
      case "source":
        return <FileText className="w-3.5 h-3.5 text-sky-500" />;
      case "action":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case "query":
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case "system":
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] border border-black/[0.05] dark:border-white/[0.08] flex items-center justify-center transition-colors relative cursor-pointer"
      >
        <Bell className="w-4 h-4 text-[var(--syn-heading)] opacity-80 hover:opacity-100" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[var(--syn-header-bg)] animate-pulse" />
        )}
      </button>

      {/* Synetica Styled Popover Card */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2.5 w-80 sm:w-[380px] rounded-2xl border border-[var(--syn-border)] bg-[var(--syn-card)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            background: "var(--syn-card)",
            borderColor: "var(--syn-border)",
            color: "var(--syn-text)",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--syn-border)] flex items-center justify-between bg-[var(--syn-card)]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-tight text-[var(--syn-heading)]">
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--syn-badge-emerald-bg)] text-[var(--syn-badge-emerald-text)] border border-[var(--syn-badge-emerald-border)]">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--syn-card-inner)] text-[var(--syn-muted)]">
                  All caught up
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex items-center gap-1 cursor-pointer transition-opacity"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification Items List */}
          <div className="max-h-[340px] overflow-y-auto p-1.5 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--syn-muted)]">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-2.5 rounded-xl flex items-start gap-3 transition-all ${
                    !n.isRead
                      ? "bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] hover:bg-[var(--syn-card-inner)]"
                      : "hover:bg-[var(--syn-card-subtle)] border border-transparent"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-center shrink-0 mt-0.5">
                    {renderIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold truncate text-[var(--syn-heading)]">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[var(--syn-subtle)] shrink-0 font-mono">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed line-clamp-2">
                      {n.description}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 px-4 border-t border-[var(--syn-border)] bg-[var(--syn-card-subtle)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--syn-subtle)] font-medium">
              Tracking: <strong className="text-[var(--syn-heading)] font-semibold">{brandName}</strong>
            </span>
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Alert settings
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
