"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Info, Sparkles, Target, X } from "lucide-react";

export interface CardInfoTooltipProps {
  title: string;
  definition: string;
  whyItMatters: string;
  benchmark?: string;
  align?: "left" | "right" | "center";
}

export function CardInfoTooltip({
  title,
  definition,
  whyItMatters,
  benchmark,
  align = "left",
}: CardInfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update floating coordinates relative to viewport (Fixed positioning prevents jitter and scroll thrashing)
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(340, window.innerWidth - 32);
    const popoverHeightEstimate = 320;

    // Check if bottom has enough room in the viewport
    let top = rect.bottom + 8;
    if (rect.bottom + popoverHeightEstimate > window.innerHeight && rect.top > popoverHeightEstimate) {
      // Flip to top if insufficient space below
      top = rect.top - popoverHeightEstimate - 8;
    }

    // Horizontal alignment
    let left = rect.left;
    if (align === "right") {
      left = rect.right - popoverWidth;
    } else if (align === "center") {
      left = rect.left + rect.width / 2 - popoverWidth / 2;
    }

    // Viewport bounding clamp
    const minLeft = 16;
    const maxLeft = window.innerWidth - popoverWidth - 16;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    setCoords({ top: Math.round(top), left: Math.round(left) });
  }, [align]);

  const handleOpen = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    updateCoords();
    setIsOpen(true);
  }, [updateCoords]);

  const handleCloseDelayed = useCallback(() => {
    if (isPinned) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 350);
  }, [isPinned]);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isOpen && isPinned) {
      setIsOpen(false);
      setIsPinned(false);
    } else {
      updateCoords();
      setIsOpen(true);
      setIsPinned(true);
    }
  };

  const handleExplicitClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsPinned(false);
  };

  // Close on outside click, scroll, resize or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsPinned(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsPinned(false);
      }
    }

    function handleScroll() {
      if (!isPinned) {
        setIsOpen(false);
      } else {
        updateCoords();
      }
    }

    function handleResize() {
      if (isOpen) {
        updateCoords();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleResize, { passive: true });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, isPinned, updateCoords]);

  return (
    <div className="relative inline-flex items-center">
      {/* Standard Info Icon Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggleClick}
        onMouseEnter={handleOpen}
        onMouseLeave={handleCloseDelayed}
        aria-label={`Information for ${title}`}
        aria-expanded={isOpen}
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
          isOpen
            ? "text-emerald-600 dark:text-emerald-400 scale-110"
            : "text-[var(--syn-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-105"
        }`}
        title="Click to lock open & read explanation"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Floating Popover Portal: Synetica Design System Theming */}
      {mounted &&
        isOpen &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            onMouseEnter={handleOpen}
            onMouseLeave={handleCloseDelayed}
            className="z-[9999] w-[calc(100vw-32px)] sm:w-84 max-h-[85vh] overflow-y-auto p-4 rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-xl text-left pointer-events-auto ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-150 text-[var(--syn-text)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#86EFAC]/20 border border-[#86EFAC]/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[var(--syn-heading)] leading-tight">
                    {title}
                  </h4>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--syn-subtle)] block">
                    GEO Metric Guide
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExplicitClose}
                className="p-1 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-inner)] transition-colors cursor-pointer"
                title="Close explanation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body Content with Native Synetica Design Tokens */}
            <div className="space-y-2.5 text-xs">
              {/* Definition Box */}
              <div className="p-2.5 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)]">
                <span className="text-[9px] font-mono uppercase font-bold text-[var(--syn-subtle)] block mb-1">
                  What this measures:
                </span>
                <p className="text-[var(--syn-heading)] text-[11px] leading-relaxed">
                  {definition}
                </p>
              </div>

              {/* Why It Matters Box */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25">
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  <Target className="w-3 h-3" />
                  <span>Why it matters:</span>
                </div>
                <p className="text-[var(--syn-heading)] text-[11px] leading-relaxed">
                  {whyItMatters}
                </p>
              </div>

              {/* Benchmark Footer */}
              {benchmark && (
                <div className="pt-2 border-t border-[var(--syn-border)] flex items-center justify-between text-[11px]">
                  <span className="text-[var(--syn-muted)] font-medium">Target Benchmark:</span>
                  <span className="syn-badge syn-badge-emerald font-mono text-[10px] font-bold">
                    {benchmark}
                  </span>
                </div>
              )}
            </div>

            {/* Dismiss Hint */}
            <div className="mt-3 pt-2 border-t border-[var(--syn-border)] flex items-center justify-between text-[9px] font-mono text-[var(--syn-subtle)]">
              <span>{isPinned ? "Pinned open" : "Hover or click to lock"}</span>
              <span>Esc to close</span>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
