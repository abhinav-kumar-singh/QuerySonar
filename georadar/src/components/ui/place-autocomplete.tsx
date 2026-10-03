"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { MapPin, Search, X, Loader2, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlaceSuggestion } from "@/app/api/geo/places/route";

export type { PlaceSuggestion };

interface PlaceAutocompleteProps {
  value?: string;
  onChange: (value: string, details?: PlaceSuggestion) => void;
  placeholder?: string;
  label?: string;
  sublabel?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  dropdownPosition?: "bottom" | "top" | "auto";
}

export function PlaceAutocomplete({
  value = "",
  onChange,
  placeholder = "Search country, city, or region (e.g. United States, Berlin, Tokyo)...",
  label = "Target Market / Geographic Location",
  sublabel = "Optimizes AI engine probes and citations for searchers in this location",
  required = false,
  disabled = false,
  className,
  inputClassName,
  dropdownPosition = "auto",
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<"bottom" | "top">("bottom");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Dynamic positioning: determine whether to open on top or bottom
  useEffect(() => {
    if (!isOpen || !inputRef.current) return;

    if (dropdownPosition === "top") {
      setOpenDirection("top");
      return;
    }
    if (dropdownPosition === "bottom") {
      setOpenDirection("bottom");
      return;
    }

    const checkPosition = () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Only flip upward if screen space below is severely constrained (< 180px) and there is ample room above
      if (spaceBelow < 180 && spaceAbove > 240) {
        setOpenDirection("top");
      } else {
        setOpenDirection("bottom");
      }
    };

    checkPosition();
    window.addEventListener("resize", checkPosition);
    window.addEventListener("scroll", checkPosition, true);
    return () => {
      window.removeEventListener("resize", checkPosition);
      window.removeEventListener("scroll", checkPosition, true);
    };
  }, [isOpen, dropdownPosition]);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch place suggestions from /api/geo/places with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/geo/places?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSuggestions(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch places:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (item: PlaceSuggestion) => {
    const formattedVal = item.formatted || item.name;
    setQuery(formattedVal);
    onChange(formattedVal, item);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else if (query.trim()) {
        // Allow custom value if entered
        onChange(query.trim(), {
          id: "custom",
          name: query.trim(),
          formatted: query.trim(),
          type: "custom",
          flag: "📍",
        });
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative space-y-1.5", className)} ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[var(--syn-heading)] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>{label}</span>
            {required && <span className="text-emerald-500">*</span>}
          </label>
          {query && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              Geo Targeted
            </span>
          )}
        </div>
      )}

      {sublabel && (
        <p className="text-[11px] text-[var(--syn-muted)] leading-tight">
          {sublabel}
        </p>
      )}

      {/* Input container */}
      <div className="relative flex items-center">
        <div className="absolute left-3 text-[var(--syn-muted)] pointer-events-none flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          ) : query ? (
            <MapPin className="w-4 h-4 text-emerald-500" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          className={cn(
            "w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm transition-all outline-none",
            "bg-[var(--syn-card-inner)] border-[var(--syn-border)] text-[var(--syn-heading)]",
            "focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
            "placeholder:text-[var(--syn-subtle)] disabled:opacity-50 disabled:cursor-not-allowed",
            inputClassName
          )}
        />

        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Clear location"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            "absolute z-50 left-0 right-0 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in fade-in-0 duration-150 overflow-hidden",
            openDirection === "top"
              ? "bottom-full mb-2 slide-in-from-bottom-2"
              : "top-full mt-2 slide-in-from-top-2",
            "bg-[var(--syn-card)] border-[var(--syn-border)] text-[var(--syn-heading)]"
          )}
        >
          <div className="p-2 border-b border-[var(--syn-border)] flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--syn-muted)] bg-[var(--syn-card-inner)]/50">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              <span>{query.trim().length > 1 ? "OpenStreetMap Places" : "Popular Target Markets"}</span>
            </span>
            <span className="text-[9px] font-mono lowercase opacity-70">
              powered by openstreetmap
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {isLoading && suggestions.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-[var(--syn-muted)]">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Finding real-world places...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-4 text-center text-xs text-[var(--syn-muted)]">
                No matching places found. Press enter to use &ldquo;{query}&rdquo;.
              </div>
            ) : (
              suggestions.map((item, index) => {
                const isSelected = selectedIndex === index;
                const isCurrent = (value || "").toLowerCase() === (item.formatted || "").toLowerCase();

                return (
                  <button
                    key={item.id || index}
                    type="button"
                    role="option"
                    aria-selected={isSelected || isCurrent}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer text-xs",
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[var(--syn-heading)]",
                      isCurrent && "border border-emerald-500/30 bg-emerald-500/5 font-bold"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base select-none shrink-0">
                        {item.flag || "📍"}
                      </span>
                      <div className="flex flex-col truncate leading-tight">
                        <span className="font-semibold truncate text-[var(--syn-heading)]">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[var(--syn-muted)] truncate mt-0.5">
                          {item.formatted}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {item.type && (
                        <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--syn-muted)]">
                          {item.type}
                        </span>
                      )}
                      {isCurrent && (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaceAutocomplete;
