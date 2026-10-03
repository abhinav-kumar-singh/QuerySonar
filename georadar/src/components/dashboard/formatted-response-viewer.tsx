"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Code2,
  CheckCircle2,
  Target,
  AlertCircle,
  Award,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  FileText,
  Sliders,
  Globe,
  Quote,
  LayoutGrid,
} from "lucide-react";

interface FormattedResponseViewerProps {
  rawText: string;
  brandName?: string;
  competitors?: string[];
  recommendations?: Array<{
    name: string;
    bestFor?: string;
    reason?: string;
    rank?: number | string;
    score?: string;
  }>;
  citations?: Array<{
    url: string;
    domain: string;
    title?: string;
  }>;
  className?: string;
}

interface RankedItem {
  rank?: number | string;
  title: string;
  score?: string;
  strengths?: string[];
  bestFor?: string;
  considerations?: string;
  overview?: string[];
  citations?: string[];
}

interface ExtractedCitation {
  id: string;
  label: string;
  url?: string;
  domain: string;
}

interface ParsedResponse {
  introParagraphs: string[];
  rankedItems: RankedItem[];
  consensus?: {
    title: string;
    content: string[];
  };
  citations: ExtractedCitation[];
  otherSections: { title: string; content: string[] }[];
  isStructured: boolean;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 30);
  }
}

// Check if a line is a ranked product/service recommendation header
function parseRankedHeader(line: string): { rank: string; title: string; bestForInline?: string; score?: string } | null {
  const trimmed = line.trim();
  const clean = trimmed.replace(/^#{1,4}\s*/, "").trim();

  // Match: "**1. Title**", "1. **Title**", "1. Title", "### 1. Title", "#1 Title", "**#1 Title**"
  const match = clean.match(
    /^(?:\*{0,2}(?:(\d+)\.|\#(\d+))\*{0,2}\s*)(?:\*{0,2}(.*?)\*{0,2})(?:\s*(?:—|-|–)\s*(?:Best for:\s*([^—\-–]+))?)?(?:\s*(?:—|-|–)\s*(?:Score:\s*([\d\.\/]+))?)?(?:\s*\((?:Rank\s*)?\#?(\d+)\))?$/i
  );
  if (!match) return null;

  const rank = match[1] || match[2] || match[6] || "1";
  let title = match[3]?.trim() || "";
  // Clean trailing asterisks, hyphens, and rank tags
  title = title.replace(/^\*\*/, "").replace(/\*\*$/, "").replace(/\s*\(Rank\s*#?\d+\)/i, "").trim();
  if (!title) return null;

  // Filter out table or section summary headers
  const lower = title.toLowerCase();
  if (
    lower.startsWith("top recommendation") ||
    lower.startsWith("top 5") ||
    lower.startsWith("top 10") ||
    lower.startsWith("key ") ||
    lower.startsWith("strength") ||
    lower.startsWith("feature") ||
    lower.startsWith("factor")
  ) {
    return null;
  }

  return {
    rank,
    title,
    bestForInline: match[4]?.trim(),
    score: match[5]?.trim(),
  };
}

export function FormattedResponseViewer({
  rawText,
  brandName,
  competitors = [],
  recommendations = [],
  citations = [],
  className = "",
}: FormattedResponseViewerProps) {
  const [viewMode, setViewMode] = useState<"slides" | "formatted" | "raw">("formatted");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Structured parser for any AI engine output
  const parsedData = useMemo<ParsedResponse>(() => {
    if (!rawText) {
      if (recommendations.length > 0) {
        return {
          introParagraphs: [],
          rankedItems: recommendations.map((r, i) => ({
            rank: r.rank || `${i + 1}`,
            title: r.name,
            bestFor: r.bestFor,
            overview: r.reason ? [r.reason] : [],
            score: r.score,
            strengths: [],
            citations: [],
          })),
          citations: citations.map((c, i) => ({
            id: `${i + 1}`,
            label: c.title || c.domain,
            url: c.url,
            domain: c.domain,
          })),
          otherSections: [],
          isStructured: true,
        };
      }

      return {
        introParagraphs: [],
        rankedItems: [],
        citations: [],
        otherSections: [],
        isStructured: false,
      };
    }

    const citationsMap = new Map<string, ExtractedCitation>();

    // 1. Seed citations from prop if available
    citations.forEach((c, idx) => {
      if (c.url && !citationsMap.has(c.url)) {
        citationsMap.set(c.url, {
          id: `${idx + 1}`,
          label: c.title || c.domain,
          url: c.url,
          domain: c.domain,
        });
      }
    });

    // 2. Extract all markdown links: [label](url) or [1] [domain](url) or [1] (url)
    const mdLinkRegex = /\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/gi;
    let match: RegExpExecArray | null;
    let citationCounter = citationsMap.size + 1;

    while ((match = mdLinkRegex.exec(rawText)) !== null) {
      const labelText = match[1]?.trim();
      const urlText = match[2]?.trim();
      if (urlText) {
        const domain = extractDomain(urlText);
        const idMatch = labelText.match(/^(\d+)$/);
        const id = idMatch ? idMatch[1] : `${citationCounter++}`;
        const label = labelText && !idMatch ? labelText : domain;
        if (!citationsMap.has(urlText)) {
          citationsMap.set(urlText, { id, label, url: urlText, domain });
        }
      }
    }

    // 3. Extract raw URLs if not already captured
    const rawUrlRegex = /(https?:\/\/[^\s\)\],"]+)/gi;
    while ((match = rawUrlRegex.exec(rawText)) !== null) {
      const url = match[1].replace(/[.,;:]$/, "");
      if (url && !citationsMap.has(url)) {
        const domain = extractDomain(url);
        citationsMap.set(url, {
          id: `${citationCounter++}`,
          label: domain,
          url,
          domain,
        });
      }
    }

    const lines = rawText.split("\n");
    const introParagraphs: string[] = [];
    const rankedItems: RankedItem[] = [];
    const otherSections: { title: string; content: string[] }[] = [];
    let consensus: { title: string; content: string[] } | undefined;

    let currentItem: RankedItem | null = null;
    let currentSection: { title: string; content: string[] } | null = null;
    let inConsensus = false;

    // Disallowed entity titles that are sub-attributes, never separate recommendations
    const metaAttributeNames = new Set([
      "reason",
      "reasons",
      "why",
      "why it wins",
      "evidence",
      "citation",
      "citations",
      "source",
      "sources",
      "url",
      "best for",
      "ideal for",
      "price",
      "pricing",
      "cost",
      "note",
      "notes",
      "caveat",
      "caveats",
      "considerations",
      "trade-offs",
      "drawbacks",
      "limitations",
      "overview",
      "details",
      "strengths",
      "key strengths",
    ]);

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Skip citation-only lines at the very top or bottom (they are extracted into the citations bar)
      if (/^\[\d+\]\s*(\[[^\]]*\]\(https?:\/\/[^\)]+\)|https?:\/\/[^\s]+)$/i.test(trimmed)) {
        continue;
      }

      // Check for Consensus / Key Takeaway / Verdict headers
      if (
        /^(?:#{1,4}\s*|\*{0,2})(Consensus|Market Takeaway|Verdict|Summary|Key Consensus|Key Takeaways|Executive Summary)/i.test(
          trimmed
        )
      ) {
        if (currentItem) {
          rankedItems.push(currentItem);
          currentItem = null;
        }
        if (currentSection) {
          otherSections.push(currentSection);
          currentSection = null;
        }
        inConsensus = true;
        const title = trimmed.replace(/^#{1,4}\s*/, "").replace(/\*\*/g, "").replace(/:$/, "").trim();
        consensus = { title, content: [] };
        continue;
      }

      if (inConsensus && consensus) {
        if (/^#{1,4}\s+/.test(trimmed)) {
          inConsensus = false;
        } else {
          consensus.content.push(trimmed);
          continue;
        }
      }

      // Pattern C: Markdown Table row: "| 1 | **Nykaa** | Best For... | Reason |"
      const tableRowMatch = trimmed.match(
        /^\|\s*(\d+)\s*\|\s*\*\*([^\*]+)\*\*\s*\|\s*([^\|]+)\s*\|\s*([^\|]*)\|?/i
      );
      if (tableRowMatch) {
        const rank = tableRowMatch[1];
        const title = tableRowMatch[2].trim();
        const bestFor = tableRowMatch[3].trim();
        const reason = tableRowMatch[4]?.trim();

        rankedItems.push({
          rank,
          title,
          bestFor: bestFor !== "-" ? bestFor : undefined,
          overview: reason && reason !== "-" ? [reason] : [],
          strengths: [],
          citations: [],
        });
        continue;
      }

      // Check for Ranked Header (### **1. Title**, 1. **Title**, etc.)
      const parsedHeader = parseRankedHeader(trimmed);
      if (parsedHeader) {
        if (currentItem) {
          rankedItems.push(currentItem);
        }
        if (currentSection) {
          otherSections.push(currentSection);
          currentSection = null;
        }

        currentItem = {
          rank: parsedHeader.rank,
          title: parsedHeader.title,
          bestFor: parsedHeader.bestForInline,
          score: parsedHeader.score,
          strengths: [],
          overview: [],
          citations: [],
        };
        continue;
      }

      // Inside an active ranked item -> Attribute Check
      if (currentItem) {
        // Best For / Ideal For
        if (
          /^[\*\-]?\s*\*{0,2}(?:Best For|Ideal For|Best fit|Real-world fit|Application Fit|Best for)\*{0,2}:?\s*(.*)$/i.test(
            trimmed
          )
        ) {
          const m = trimmed.match(
            /^[\*\-]?\s*\*{0,2}(?:Best For|Ideal For|Best fit|Real-world fit|Application Fit|Best for)\*{0,2}:?\s*(.*)$/i
          );
          if (m && m[1]) currentItem.bestFor = m[1].replace(/\*\*/g, "").trim();
          continue;
        }

        // Reason / Why / Evidence / Overview
        if (
          /^[\*\-]?\s*\*{0,2}(?:Reason|Why|Why it wins|Verdict|Summary|Overview|Details|Evidence|Core Advantage)\*{0,2}:?\s*(.*)$/i.test(
            trimmed
          )
        ) {
          const m = trimmed.match(
            /^[\*\-]?\s*\*{0,2}(?:Reason|Why|Why it wins|Verdict|Summary|Overview|Details|Evidence|Core Advantage)\*{0,2}:?\s*(.*)$/i
          );
          if (m && m[1]) {
            const reasonText = m[1].trim();
            if (reasonText) {
              if (!currentItem.overview) currentItem.overview = [];
              currentItem.overview.push(reasonText);
            }
          }
          continue;
        }

        // Citation / Source / Evidence Links inside this item
        if (
          /^[\*\-]?\s*\*{0,2}(?:Citation|Citations|Source|Sources|Evidence URL|Verification Sources|URL)\*{0,2}:?\s*(.*)$/i.test(
            trimmed
          )
        ) {
          const m = trimmed.match(
            /^[\*\-]?\s*\*{0,2}(?:Citation|Citations|Source|Sources|Evidence URL|Verification Sources|URL)\*{0,2}:?\s*(.*)$/i
          );
          if (m && m[1]) {
            const citText = m[1].trim();
            if (citText) {
              if (!currentItem.citations) currentItem.citations = [];
              currentItem.citations.push(citText);
            }
          }
          continue;
        }

        // Key Strengths
        if (
          /^[\*\-]?\s*\*{0,2}(?:Key Strengths|Technical Strengths|Strengths|Core Advantage)\*{0,2}:?\s*(.*)$/i.test(
            trimmed
          )
        ) {
          const m = trimmed.match(
            /^[\*\-]?\s*\*{0,2}(?:Key Strengths|Technical Strengths|Strengths|Core Advantage)\*{0,2}:?\s*(.*)$/i
          );
          if (m && m[1]) {
            currentItem.strengths = m[1]
              .split(/;|, and | \u2022 /)
              .map((s) => s.trim())
              .filter(Boolean);
          }
          continue;
        }

        // Price / Cost / Score
        if (/^[\*\-]?\s*\*{0,2}(?:Score|Price|Pricing|Cost|MSRP)\*{0,2}:?\s*(.*)$/i.test(trimmed)) {
          const m = trimmed.match(/^[\*\-]?\s*\*{0,2}(?:Score|Price|Pricing|Cost|MSRP)\*{0,2}:?\s*(.*)$/i);
          if (m && m[1]) {
            const val = m[1].replace(/\*\*/g, "").trim();
            if (!currentItem.score) currentItem.score = val;
            else if (!currentItem.overview?.includes(val)) {
              if (!currentItem.overview) currentItem.overview = [];
              currentItem.overview.push(`Price: ${val}`);
            }
          }
          continue;
        }

        // Considerations / Trade-offs / Limitations / Caveat / Note
        if (
          /^[\*\-]?\s*\*{0,2}(?:Considerations|Trade-offs|Trade-off Analysis|The catch|Drawbacks|Limitations|Caveat|Note)\*{0,2}:?\s*(.*)$/i.test(
            trimmed
          )
        ) {
          const m = trimmed.match(
            /^[\*\-]?\s*\*{0,2}(?:Considerations|Trade-offs|Trade-off Analysis|The catch|Drawbacks|Limitations|Caveat|Note)\*{0,2}:?\s*(.*)$/i
          );
          if (m && m[1]) currentItem.considerations = m[1].replace(/\*\*/g, "").trim();
          continue;
        }

        // Generic Sub-bullet under current item
        if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
          const bulletText = trimmed.replace(/^[\*\-]\s*/, "").trim();
          if (bulletText) {
            if (!currentItem.strengths) currentItem.strengths = [];
            currentItem.strengths.push(bulletText);
          }
          continue;
        }

        // Regular paragraph in current item
        if (!currentItem.overview) currentItem.overview = [];
        currentItem.overview.push(trimmed);
        continue;
      }

      // Check if bullet item introduces an entity (e.g. "* **Nykaa** is ranked as the leading...")
      const bulletItemMatch = trimmed.match(
        /^[\*\-]\s+\*\*([^\*]+)\*\*(?:\s+(?:is|ranks|delivers|provides|offers|features|represents|takes|takes the lead|winner|top)\s+([^\.]+)\.?)?(.*)$/i
      );

      if (bulletItemMatch && !currentItem) {
        const rawEntity = bulletItemMatch[1].trim();
        const cleanEntity = rawEntity.replace(/:$/, "").trim();
        const lowerEntity = cleanEntity.toLowerCase();

        // Ensure this is not a meta-attribute like "Reason", "Citation", "Note", etc.
        if (!metaAttributeNames.has(lowerEntity)) {
          const rest = (bulletItemMatch[2] ? bulletItemMatch[2] + ". " : "") + (bulletItemMatch[3] || "");
          if (cleanEntity.length > 1 && cleanEntity.length < 60) {
            rankedItems.push({
              rank: `${rankedItems.length + 1}`,
              title: cleanEntity,
              overview: rest ? [rest.trim()] : [],
              strengths: [],
              citations: [],
            });
            continue;
          }
        }
      }

      // Generic section header (e.g. "## Key Market Context")
      if (/^#{1,4}\s+/.test(trimmed)) {
        if (currentSection) otherSections.push(currentSection);
        const title = trimmed.replace(/^#{1,4}\s*/, "").replace(/\*\*/g, "");
        currentSection = { title, content: [] };
        continue;
      }

      if (currentSection) {
        currentSection.content.push(trimmed);
        continue;
      }

      // Otherwise, introductory paragraph
      introParagraphs.push(trimmed);
    }

    if (currentItem) rankedItems.push(currentItem);
    if (currentSection) otherSections.push(currentSection);

    // Fallback: If no items parsed from rawText but structured recommendations were provided
    if (rankedItems.length === 0 && recommendations.length > 0) {
      recommendations.forEach((r, i) => {
        rankedItems.push({
          rank: r.rank || `${i + 1}`,
          title: r.name,
          bestFor: r.bestFor,
          overview: r.reason ? [r.reason] : [],
          score: r.score,
          strengths: [],
          citations: [],
        });
      });
    }

    const isStructured = rankedItems.length > 0 || !!consensus || citationsMap.size > 0;

    return {
      introParagraphs,
      rankedItems,
      consensus,
      citations: Array.from(citationsMap.values()),
      otherSections,
      isStructured,
    };
  }, [rawText, recommendations, citations]);

  // Comprehensive Rich Text Renderer with safe word-wrapping, clickable Markdown links, and Brand Badges
  const renderRichText = (text: string) => {
    if (!text) return null;

    const terms = [
      brandName ? { value: brandName, type: "brand" as const } : null,
      ...competitors.filter(Boolean).map((c) => ({ value: c, type: "competitor" as const })),
    ].filter(Boolean) as { value: string; type: "brand" | "competitor" }[];

    // Parse Markdown Links: [label](url)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    const segments: Array<{ type: "text" | "link"; content: string; url?: string }> = [];
    let lastIndex = 0;
    let linkMatch: RegExpExecArray | null;

    while ((linkMatch = linkRegex.exec(text)) !== null) {
      if (linkMatch.index > lastIndex) {
        segments.push({ type: "text", content: text.slice(lastIndex, linkMatch.index) });
      }
      segments.push({
        type: "link",
        content: linkMatch[1],
        url: linkMatch[2],
      });
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      segments.push({ type: "text", content: text.slice(lastIndex) });
    }

    return (
      <span className="break-words [overflow-wrap:anywhere] leading-relaxed">
        {segments.map((seg, segIdx) => {
          if (seg.type === "link" && seg.url) {
            const domain = extractDomain(seg.url);
            return (
              <a
                key={segIdx}
                href={seg.url}
                target="_blank"
                rel="noopener noreferrer"
                title={seg.url}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-xs border border-emerald-500/20 transition-all cursor-pointer underline decoration-emerald-500/40 hover:decoration-emerald-400 mx-0.5 break-all"
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[240px]">
                  {seg.content || domain}
                </span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
              </a>
            );
          }

          // Parse inline bolding, brand keywords, and citation pills
          return <React.Fragment key={segIdx}>{renderInlineSegments(seg.content, terms)}</React.Fragment>;
        })}
      </span>
    );
  };

  const renderInlineSegments = (text: string, terms: { value: string; type: "brand" | "competitor" }[]) => {
    // Match: **bold**, raw URLs https://..., and brand/competitor keywords
    const termPattern = terms.map((t) => escapeRegExp(t.value)).join("|");
    const rawUrlPattern = "https?:\\/\\/[^\\s\\)\\]]+";
    const patternParts = ["\\*\\*.*?\\*\\*", rawUrlPattern];
    if (termPattern) patternParts.push(termPattern);

    const masterRegex = new RegExp(`(${patternParts.join("|")})`, "gi");
    const parts = text.split(masterRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // 1. Bold text
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        const inner = part.slice(2, -2);
        return (
          <strong key={idx} className="font-bold text-[var(--syn-heading)]">
            {renderInlineSegments(inner, terms)}
          </strong>
        );
      }

      // 2. Raw URL
      if (/^https?:\/\//i.test(part)) {
        const cleanUrl = part.replace(/[.,;:]$/, "");
        const domain = extractDomain(cleanUrl);
        return (
          <a
            key={idx}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={cleanUrl}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-xs border border-emerald-500/20 transition-all cursor-pointer underline decoration-emerald-500/40 hover:decoration-emerald-400 mx-0.5 break-all max-w-full"
          >
            <Globe className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[200px]">{domain}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
          </a>
        );
      }

      // 3. Matched Brand or Competitor keyword
      const matchedTerm = terms.find((t) => t.value.toLowerCase() === part.toLowerCase());
      if (matchedTerm) {
        return (
          <span
            key={idx}
            className={
              matchedTerm.type === "brand"
                ? "inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 text-[11px] sm:text-xs mx-0.5 shadow-xs"
                : "inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 text-[11px] sm:text-xs mx-0.5 shadow-xs"
            }
          >
            {part}
          </span>
        );
      }

      // 4. Bracketed citations [1], [2]
      if (/^\[\d+\]$/.test(part.trim())) {
        return (
          <span
            key={idx}
            className="inline-flex items-center px-1 py-0.2 rounded font-mono text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 mx-0.5 align-super"
          >
            {part.trim()}
          </span>
        );
      }

      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const totalSlides = Math.max(1, parsedData.rankedItems.length);
  const activeSlide = parsedData.rankedItems[currentSlideIndex] || parsedData.rankedItems[0];

  return (
    <div className={`flex flex-col gap-3.5 max-w-full min-w-0 overflow-hidden ${className}`}>
      {/* ── Top Header Controls: Mode Toggle (Slides, Readable, Raw) & Copy ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 pb-1 border-b border-[var(--syn-border)]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            AI Verbatim Analysis
          </span>
          {parsedData.rankedItems.length > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
              {parsedData.rankedItems.length} Recommendations
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Segmented View Mode Toggle: Slides | Readable | Raw */}
          <div className="flex items-center p-0.5 rounded-xl bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] text-[11px]">
            {/* Slides View Button */}
            {parsedData.rankedItems.length > 0 && (
              <button
                type="button"
                onClick={() => setViewMode("slides")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === "slides"
                    ? "bg-[#86EFAC] text-neutral-950 font-bold shadow-xs"
                    : "text-[var(--syn-muted)] hover:text-[var(--syn-text)]"
                }`}
                title="Interactive Slide Deck View"
              >
                <Sliders className="w-3 h-3" />
                <span>Slides</span>
              </button>
            )}

            {/* Readable Document Grid Button */}
            <button
              type="button"
              onClick={() => setViewMode("formatted")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === "formatted"
                  ? "bg-[var(--syn-card)] text-[var(--syn-heading)] font-bold shadow-xs border border-[var(--syn-border)]"
                  : "text-[var(--syn-muted)] hover:text-[var(--syn-text)]"
              }`}
              title="Full Structured Readable View"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Readable</span>
            </button>

            {/* Raw Text Button */}
            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === "raw"
                  ? "bg-[var(--syn-card)] text-[var(--syn-heading)] font-bold shadow-xs border border-[var(--syn-border)]"
                  : "text-[var(--syn-muted)] hover:text-[var(--syn-text)]"
              }`}
              title="Raw Monospaced Output"
            >
              <Code2 className="w-3 h-3" />
              <span>Raw Text</span>
            </button>
          </div>

          {/* Copy Response Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-xl bg-[var(--syn-card-subtle)] hover:bg-[var(--syn-card)] border border-[var(--syn-border)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-all cursor-pointer"
            title="Copy entire response text"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── MODE 1: INTERACTIVE SLIDES CAROUSEL VIEW ── */}
      {viewMode === "slides" && activeSlide && (
        <div className="flex flex-col gap-3 min-w-0 max-w-full overflow-hidden">
          {/* Main Slide Card */}
          <div className="relative p-5 sm:p-6 rounded-3xl bg-[var(--syn-card-inner)] border-2 border-emerald-500/30 shadow-lg flex flex-col justify-between gap-4 transition-all min-w-0 max-w-full overflow-hidden">
            <div>
              {/* Slide Top Meta: Rank Badge, Title, Score, Target Brand Tag */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--syn-border)] min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-2xl bg-[#86EFAC] text-neutral-950 flex items-center justify-center font-mono font-extrabold text-sm shrink-0 shadow-md">
                    #{activeSlide.rank || currentSlideIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-extrabold text-[var(--syn-heading)] truncate">
                      {renderRichText(activeSlide.title)}
                    </h4>
                    {brandName && activeSlide.title.toLowerCase().includes(brandName.toLowerCase()) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">
                        <Award className="w-3 h-3" /> Target Brand Audited
                      </span>
                    )}
                  </div>
                </div>

                {activeSlide.score && (
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {activeSlide.score}
                  </span>
                )}
              </div>

              {/* Best For Callout Banner */}
              {activeSlide.bestFor && (
                <div className="mt-3.5 p-3 rounded-2xl bg-sky-500/[0.08] border border-sky-500/30 flex items-start gap-2.5 text-xs sm:text-[13px] min-w-0">
                  <Target className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                    <strong className="text-sky-500 font-bold mr-1.5 uppercase tracking-wide text-[11px] font-mono block sm:inline">
                      Best For:
                    </strong>
                    <span className="text-[var(--syn-heading)] font-medium">
                      {renderRichText(activeSlide.bestFor)}
                    </span>
                  </div>
                </div>
              )}

              {/* Overview text / summary */}
              {activeSlide.overview && activeSlide.overview.length > 0 && (
                <div className="mt-3 text-xs sm:text-[13px] leading-relaxed text-[var(--syn-text)] space-y-2 break-words [overflow-wrap:anywhere]">
                  {activeSlide.overview.map((para, pIdx) => (
                    <p key={pIdx}>{renderRichText(para)}</p>
                  ))}
                </div>
              )}

              {/* Key Strengths Checklist */}
              {activeSlide.strengths && activeSlide.strengths.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block">
                    Key Market Strengths
                  </span>
                  <div className="space-y-1.5">
                    {activeSlide.strengths.map((str, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-2 text-xs sm:text-[13px] text-[var(--syn-text)] leading-relaxed break-words [overflow-wrap:anywhere]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{renderRichText(str)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Considerations / Trade-offs */}
              {activeSlide.considerations && (
                <div className="mt-3.5 p-3 rounded-2xl bg-amber-500/[0.08] border border-amber-500/30 flex items-start gap-2.5 text-xs min-w-0">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                    <strong className="text-amber-500 font-bold mr-1 uppercase tracking-wide text-[10px] font-mono block sm:inline">
                      Considerations:
                    </strong>
                    <span className="text-[var(--syn-text)]">
                      {renderRichText(activeSlide.considerations)}
                    </span>
                  </div>
                </div>
              )}

              {/* Citations & Sources inside Slide */}
              {activeSlide.citations && activeSlide.citations.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-[var(--syn-border)] flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold mr-1 shrink-0 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    Citations:
                  </span>
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    {activeSlide.citations.map((citeStr, cIdx) => (
                      <span key={cIdx} className="inline-flex items-center">
                        {renderRichText(citeStr)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Slide Navigation Footer */}
            <div className="pt-3 border-t border-[var(--syn-border)] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] hover:border-emerald-500/40 text-xs font-semibold text-[var(--syn-heading)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {/* Slide Dots Indicator */}
              <div className="flex items-center gap-1.5 overflow-x-auto px-2 py-1 max-w-[200px] sm:max-w-none">
                {parsedData.rankedItems.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(dotIdx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      dotIdx === currentSlideIndex
                        ? "w-6 bg-emerald-500"
                        : "w-2 bg-[var(--syn-border)] hover:bg-[var(--syn-muted)]"
                    }`}
                    title={`Go to recommendation #${dotIdx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
                disabled={currentSlideIndex >= totalSlides - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] hover:border-emerald-500/40 text-xs font-semibold text-[var(--syn-heading)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 2: READABLE STRUCTURED VIEW (Grid + Cards + Citations) ── */}
      {viewMode === "formatted" && (
        <div className="flex flex-col gap-3.5 min-w-0 max-w-full overflow-hidden">
          {/* Introductory Paragraphs */}
          {parsedData.introParagraphs.length > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-xs sm:text-[13px] leading-relaxed text-[var(--syn-text)] space-y-2 min-w-0 max-w-full overflow-hidden break-words [overflow-wrap:anywhere]">
              {parsedData.introParagraphs.map((para, idx) => (
                <p key={idx}>{renderRichText(para)}</p>
              ))}
            </div>
          )}

          {/* Ranked Product & Brand Grid */}
          {parsedData.rankedItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0 max-w-full">
              {parsedData.rankedItems.map((item, idx) => {
                const isBrandMatch =
                  brandName && item.title.toLowerCase().includes(brandName.toLowerCase());

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 min-w-0 max-w-full overflow-hidden ${
                      isBrandMatch
                        ? "bg-emerald-500/[0.04] border-emerald-500/40 shadow-xs"
                        : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:border-[var(--syn-border-hover)]"
                    }`}
                  >
                    <div className="min-w-0 max-w-full">
                      {/* Card Header: Rank, Title, Score */}
                      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[var(--syn-border)] min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs ${
                              idx === 0
                                ? "bg-[#86EFAC] text-neutral-950"
                                : "bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] text-[var(--syn-heading)]"
                            }`}
                          >
                            #{item.rank || idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[var(--syn-heading)] truncate">
                              {item.title}
                            </h4>
                            {isBrandMatch && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                <Award className="w-3 h-3" /> Target Brand
                              </span>
                            )}
                          </div>
                        </div>

                        {item.score && (
                          <span className="shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--syn-card-subtle)] text-[var(--syn-heading)] border border-[var(--syn-border)] flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            {item.score}
                          </span>
                        )}
                      </div>

                      {/* Best For Tag */}
                      {item.bestFor && (
                        <div className="mt-2.5 flex items-start gap-2 p-2 rounded-xl bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] text-xs min-w-0">
                          <Target className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                            <strong className="text-[var(--syn-heading)] font-semibold mr-1">
                              Best For:
                            </strong>
                            <span className="text-[var(--syn-text)]">
                              {renderRichText(item.bestFor)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Overview / Reason text */}
                      {item.overview && item.overview.length > 0 && (
                        <div className="text-xs text-[var(--syn-text)] leading-relaxed mt-2.5 space-y-1 break-words [overflow-wrap:anywhere]">
                          {item.overview.map((p, pIdx) => (
                            <p key={pIdx}>{renderRichText(p)}</p>
                          ))}
                        </div>
                      )}

                      {/* Key Strengths */}
                      {item.strengths && item.strengths.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block">
                            Key Strengths
                          </span>
                          <div className="space-y-1">
                            {item.strengths.map((str, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-start gap-2 text-xs text-[var(--syn-text)] leading-relaxed break-words [overflow-wrap:anywhere]"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{renderRichText(str)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Considerations / Trade-offs */}
                      {item.considerations && (
                        <div className="mt-2.5 flex items-start gap-2 p-2 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-xs min-w-0">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                            <strong className="text-amber-500 font-semibold mr-1">
                              Considerations:
                            </strong>
                            <span className="text-[var(--syn-text)]">
                              {renderRichText(item.considerations)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* In-Card Citations & Source Links */}
                      {item.citations && item.citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-[var(--syn-border)] flex flex-wrap items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold mr-1 shrink-0 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-emerald-400" />
                            Citations:
                          </span>
                          <div className="flex flex-wrap gap-1.5 min-w-0">
                            {item.citations.map((citeStr, cIdx) => (
                              <span key={cIdx} className="inline-flex items-center">
                                {renderRichText(citeStr)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Other Generic Sections */}
          {parsedData.otherSections.length > 0 && (
            <div className="space-y-3 min-w-0 max-w-full">
              {parsedData.otherSections.map((sec, sIdx) => (
                <div
                  key={sIdx}
                  className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-2 min-w-0 max-w-full overflow-hidden"
                >
                  <h5 className="text-xs font-bold text-[var(--syn-heading)] uppercase tracking-wider font-mono">
                    {sec.title}
                  </h5>
                  {sec.content.map((c, cIdx) => (
                    <p key={cIdx} className="text-xs text-[var(--syn-text)] leading-relaxed break-words [overflow-wrap:anywhere]">
                      {renderRichText(c)}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Fallback if unstructured */}
          {!parsedData.isStructured && parsedData.introParagraphs.length === 0 && (
            <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-xs sm:text-[13px] leading-relaxed text-[var(--syn-text)] whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
              {renderRichText(rawText)}
            </div>
          )}
        </div>
      )}

      {/* ── Consensus Callout Card (Visible in both Slides & Formatted modes) ── */}
      {viewMode !== "raw" && parsedData.consensus && (
        <div className="p-4 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/30 space-y-2 min-w-0 max-w-full overflow-hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h5 className="text-xs font-bold text-[var(--syn-heading)] uppercase tracking-wider font-mono">
              {parsedData.consensus.title || "Engine Consensus & Market Takeaway"}
            </h5>
          </div>
          <div className="text-xs sm:text-[13px] text-[var(--syn-text)] leading-relaxed space-y-1.5 break-words [overflow-wrap:anywhere]">
            {parsedData.consensus.content.map((p, idx) => (
              <p key={idx}>{renderRichText(p)}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── Grounding Sources & Citations Bar (Interactive clickable pill links) ── */}
      {viewMode !== "raw" && parsedData.citations.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] space-y-2 min-w-0 max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Grounded Sources & Citations ({parsedData.citations.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-w-0 max-w-full">
            {parsedData.citations.map((cite, cIdx) => (
              <a
                key={cIdx}
                href={cite.url || "#"}
                target={cite.url ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={cite.url || cite.label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--syn-card)] hover:bg-[var(--syn-card-inner)] border border-[var(--syn-border)] hover:border-emerald-500/40 text-xs text-[var(--syn-text)] transition-all group shadow-xs max-w-full cursor-pointer"
              >
                <span className="font-mono font-bold text-emerald-500 text-[11px]">
                  [{cite.id || cIdx + 1}]
                </span>
                <span className="truncate max-w-[160px] sm:max-w-[220px] text-[11px] font-medium text-[var(--syn-heading)]">
                  {cite.label || cite.domain}
                </span>
                {cite.url && (
                  <ExternalLink className="w-3 h-3 text-[var(--syn-muted)] group-hover:text-emerald-400 transition-colors shrink-0" />
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── MODE 3: RAW TEXT VIEW ── */}
      {viewMode === "raw" && (
        <div className="p-4 rounded-2xl bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] font-mono text-xs text-[var(--syn-text)] leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere] select-text shadow-inner max-h-[500px] overflow-y-auto max-w-full">
          {rawText}
        </div>
      )}
    </div>
  );
}
