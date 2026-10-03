"use client";

import React, { useState } from "react";
import {
  Trophy,
  Smile,
  ShieldCheck,
  Cpu,
  ListTodo,
  Globe,
  Sparkles,
  Bot,
  Newspaper,
  Star,
  Smartphone,
  Video,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
   PATTERN 1: V2 Radial Spoke Fan Speedometer (Share of Voice)
   Inspired by Neon AI Radial Speedometer (Image 2: 180° Arch)
   ────────────────────────────────────────────────────────────────────── */

export function V2RadialSpokeSpeedometer({
  value = 100,
  max = 100,
  size = 240,
  spokeCount = 18,
  subtitle = "Average Score",
}: {
  value?: number;
  max?: number;
  size?: number;
  spokeCount?: number;
  subtitle?: string;
  brandName?: string;
}) {
  const [hoveredSpoke, setHoveredSpoke] = useState<number | null>(null);
  const clampedValue = Math.min(Math.max(value, 0), max);
  const activeSpokes = Math.round((clampedValue / max) * spokeCount);

  // SVG viewBox geometry: width = 240, height = 135
  const vbWidth = 240;
  const vbHeight = 135;
  const centerX = vbWidth / 2; // 120
  const centerY = 120; // baseline of the 180° arch
  const innerRadius = 70; // large spacious inner hole
  const outerRadius = 105; // spoke length 35px

  // Distribute 18 sectors evenly across [180°, 0°]
  const sectorStep = 180 / spokeCount; // 10° per spoke

  const spokes = Array.from({ length: spokeCount }).map((_, i) => {
    // Spoke center angle: for i=0 -> 175° (slot [180°, 170°]), for i=17 -> 5° (slot [10°, 0°])
    const angleDeg = 180 - (i + 0.5) * sectorStep;
    const angleRad = (angleDeg * Math.PI) / 180;
    const isActive = i < activeSpokes;
    const isHovered = hoveredSpoke === i;

    const x1 = centerX + (innerRadius + 4) * Math.cos(angleRad);
    const y1 = centerY - (innerRadius + 4) * Math.sin(angleRad);
    const x2 = centerX + (outerRadius - 4) * Math.cos(angleRad);
    const y2 = centerY - (outerRadius - 4) * Math.sin(angleRad);

    const spokeScore = Math.round(((i + 1) / spokeCount) * 100);

    return {
      index: i,
      x1,
      y1,
      x2,
      y2,
      isActive,
      isHovered,
      spokeScore,
    };
  });

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full py-1">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        className="overflow-visible max-w-[240px]"
      >
        <defs>
          <linearGradient id="v2EmeraldArchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* 18 Chunky Rounded Spokes along the 180° Arch */}
        {spokes.map((spoke) => (
          <line
            key={spoke.index}
            x1={spoke.x1}
            y1={spoke.y1}
            x2={spoke.x2}
            y2={spoke.y2}
            stroke={
              spoke.isActive
                ? spoke.isHovered
                  ? "#86EFAC"
                  : "url(#v2EmeraldArchGrad)"
                : "var(--syn-border, rgba(255, 255, 255, 0.14))"
            }
            strokeWidth={9.5}
            strokeLinecap="round"
            opacity={spoke.isActive ? 1 : 0.35}
            className="transition-colors duration-150 cursor-pointer"
            onMouseEnter={() => setHoveredSpoke(spoke.index)}
            onMouseLeave={() => setHoveredSpoke(null)}
          />
        ))}

        {/* Centered Large Metric inside SVG with Ample Clearance */}
        <text
          x={centerX}
          y={92}
          textAnchor="middle"
          className="font-mono font-extrabold fill-[var(--syn-heading)]"
          style={{ fontSize: "32px", letterSpacing: "-0.03em" }}
        >
          {value % 1 === 0 ? Math.round(value) : value.toFixed(1)}%
        </text>

        {/* Centered Subtitle inside SVG */}
        <text
          x={centerX}
          y={112}
          textAnchor="middle"
          className="font-sans font-medium fill-[var(--syn-muted)]"
          style={{ fontSize: "11px" }}
        >
          {subtitle}
        </text>
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PATTERN 2: V2 Dual-Tone Floating Capsule Stacks (Avg AI Placement)
   Inspired by High-Contrast Capsule Graphs (Image 3 Pattern G)
   ────────────────────────────────────────────────────────────────────── */

export function V2CapsulePlacementStack({
  rank1Count = 6,
  rank2Count = 0,
  rank3Count = 0,
  totalProbes = 6,
  avgRank = 1.0,
}: {
  rank1Count?: number;
  rank2Count?: number;
  rank3Count?: number;
  totalProbes?: number;
  avgRank?: number;
}) {
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);

  const pillars = [
    {
      label: "Rank #1 (Top Pick)",
      short: "Rank #1",
      count: rank1Count,
      percent: totalProbes > 0 ? Math.round((rank1Count / totalProbes) * 100) : 100,
      color: "#22C55E",
      glowColor: "rgba(34, 197, 94, 0.4)",
      badge: "Primary Choice",
    },
    {
      label: "Rank #2 (Top 2)",
      short: "Rank #2",
      count: rank2Count,
      percent: totalProbes > 0 ? Math.round((rank2Count / totalProbes) * 100) : 0,
      color: "#F59E0B",
      glowColor: "rgba(245, 158, 11, 0.4)",
      badge: "Alternative",
    },
    {
      label: "Rank #3+ (Long-Tail)",
      short: "Rank #3+",
      count: rank3Count,
      percent: totalProbes > 0 ? Math.round((rank3Count / totalProbes) * 100) : 0,
      color: "#818CF8",
      glowColor: "rgba(129, 140, 248, 0.4)",
      badge: "Mentioned",
    },
  ];

  return (
    <div className="flex flex-col gap-2.5 w-full py-1">
      {/* 3 Floating Capsule Pillars */}
      <div className="grid grid-cols-3 gap-2.5 items-end h-[92px] pt-4 px-1">
        {pillars.map((p, idx) => {
          const isHovered = hoveredPillar === idx;
          const fillHeightPct = Math.max(14, p.percent);
          const remainingPct = 100 - fillHeightPct;

          return (
            <div
              key={idx}
              className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setHoveredPillar(idx)}
              onMouseLeave={() => setHoveredPillar(null)}
            >
              {/* Floating Pill Percent Badge */}
              <div
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full mb-1.5 transition-all duration-200 shadow-xs border ${
                  isHovered || p.percent > 0
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-700/50 dark:border-neutral-200"
                    : "bg-[var(--syn-card-inner)] text-[var(--syn-muted)] border-[var(--syn-border)]"
                }`}
              >
                {p.percent}%
              </div>

              {/* Vertical Dual-Tone Capsule Pillar */}
              <div className="w-full h-12 rounded-lg p-0.5 bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex flex-col justify-end overflow-hidden transition-all duration-300 group-hover:border-emerald-500/50">
                {/* Upper Hatched Headroom */}
                {remainingPct > 0 && (
                  <div
                    className="w-full rounded-t-md opacity-35 bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:4px_4px]"
                    style={{ height: `${remainingPct}%` }}
                  />
                )}

                {/* Lower Vibrant Solid Fill */}
                <div
                  className="w-full rounded-md transition-all duration-500 shadow-xs flex items-center justify-center"
                  style={{
                    height: `${fillHeightPct}%`,
                    backgroundColor: p.color,
                    boxShadow: isHovered ? `0 0 12px ${p.glowColor}` : undefined,
                  }}
                >
                  {fillHeightPct >= 40 && (
                    <span className="text-[9px] font-mono font-bold text-white drop-shadow-sm">
                      {p.count}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Label */}
              <span className="text-[9px] font-mono text-[var(--syn-muted)] mt-1 font-semibold truncate max-w-full">
                {p.short}
              </span>
            </div>
          );
        })}
      </div>

      {/* Interactive Tooltip Callout */}
      <div className="p-2 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between text-[11px] font-mono">
        <span className="text-[var(--syn-muted)]">
          {hoveredPillar !== null ? pillars[hoveredPillar].label : "Average Position"}:
        </span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {hoveredPillar !== null
            ? `${pillars[hoveredPillar].count} of ${totalProbes} Probes (${pillars[hoveredPillar].percent}%)`
            : `Unanimous Rank #${avgRank}`}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PATTERN 3: V2 Sentiment Donut Ring with Floating Perimeter Badges
   Inspired by 3-Segment Donut Ring with Floating Percent Badges
   (Image: Green Positive, Purple Neutral, Orange Negative + Center Score)
   ────────────────────────────────────────────────────────────────────── */

export function V2TricolorCapsulePill({
  positivePct = 83,
  neutralPct = 17,
  negativePct = 0,
  positiveCount = 10,
  neutralCount = 8,
  negativeCount = 0,
}: {
  positivePct?: number;
  neutralPct?: number;
  negativePct?: number;
  positiveCount?: number;
  neutralCount?: number;
  negativeCount?: number;
}) {
  const [hoveredSegment, setHoveredSegment] = useState<"pos" | "neu" | "neg" | null>(null);

  const totalProbes = positiveCount + neutralCount + negativeCount || 1;

  const categories = [
    {
      key: "pos" as const,
      name: "Positive",
      pct: positivePct,
      count: positiveCount,
      color: "#10B981", // Green
      bgTint: "bg-emerald-500/10",
      borderActive: "border-emerald-500",
      textActive: "text-emerald-500",
      badgeBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      key: "neu" as const,
      name: "Neutral",
      pct: neutralPct,
      count: neutralCount,
      color: "#8B5CF6", // Purple / Indigo
      bgTint: "bg-purple-500/10",
      borderActive: "border-purple-500",
      textActive: "text-purple-400",
      badgeBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    {
      key: "neg" as const,
      name: "Negative",
      pct: negativePct,
      count: negativeCount,
      color: "#F97316", // Orange
      bgTint: "bg-orange-500/10",
      borderActive: "border-orange-500",
      textActive: "text-orange-400",
      badgeBg: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
    },
  ];

  // SVG parameters - Spacious sleek Donut ring
  const vbSize = 136;
  const cx = 68;
  const cy = 68;
  const radius = 50;
  const strokeWidth = 11;
  const circumference = 2 * Math.PI * radius; // ~314.16px
  const gapLength = 10; // Visible rounded gap between slices

  // Calculate arc slices for non-zero percentages
  let accumulatedAngle = -90; // Start at top 12 o'clock
  let accumulatedDash = 0;

  const slices = categories.map((cat) => {
    const slicePct = cat.pct / 100;
    const sliceAngle = slicePct * 360;
    const midAngle = accumulatedAngle + sliceAngle / 2;
    accumulatedAngle += sliceAngle;

    const rawDash = slicePct * circumference;
    const dashLength = cat.pct > 0 ? Math.max(8, rawDash - gapLength) : 0;
    const dashOffset = -accumulatedDash;
    if (cat.pct > 0) accumulatedDash += rawDash;

    return {
      ...cat,
      dashLength,
      dashOffset,
      midAngle,
      visible: cat.pct > 0,
    };
  });

  const posCat = categories[0];
  const neuCat = categories[1];
  const negCat = categories[2];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full select-none py-1.5">
      {/* LEFT: Spacious Donut SVG */}
      <div className="relative shrink-0 w-[130px] h-[130px] flex items-center justify-center">
        <svg
          width="130"
          height="130"
          viewBox={`0 0 ${vbSize} ${vbSize}`}
          className="overflow-visible"
        >
          <defs>
            <filter id="v2DonutGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--syn-border, rgba(255, 255, 255, 0.08))"
            strokeWidth={strokeWidth}
          />

          {/* Colored Arc Segments */}
          {slices.map((slice) => {
            if (!slice.visible) return null;
            const isHovered = hoveredSegment === slice.key;

            return (
              <circle
                key={slice.key}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
                strokeDashoffset={slice.dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                filter={isHovered ? "url(#v2DonutGlow)" : undefined}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment(slice.key)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}

          {/* Center Metric */}
          <text
            x={cx}
            y={cy + 3}
            textAnchor="middle"
            className="font-mono font-extrabold fill-[var(--syn-heading)]"
            style={{ fontSize: "24px", letterSpacing: "-0.03em" }}
          >
            {positivePct >= 50 ? `+${positivePct}%` : `${positivePct}%`}
          </text>
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            className="font-sans font-semibold fill-[var(--syn-muted)]"
            style={{ fontSize: "9px" }}
          >
            Sentiment
          </text>
        </svg>
      </div>

      {/* RIGHT: Masonry Grid Layout of Metric Numbers */}
      <div className="flex-1 w-full grid grid-cols-2 gap-2">
        {/* Top Dominant Masonry Tile: Positive (Spans 2 cols) */}
        <div
          onMouseEnter={() => setHoveredSegment("pos")}
          onMouseLeave={() => setHoveredSegment(null)}
          className={`col-span-2 px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            hoveredSegment === "pos"
              ? "bg-emerald-500/15 border-emerald-500 shadow-xs"
              : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
            <div>
              <span className="text-xs font-bold text-[var(--syn-heading)] block leading-tight">
                {posCat.name}
              </span>
              <span className="text-[10px] font-mono text-[var(--syn-muted)]">
                {posCat.count} of {totalProbes} Probes
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {posCat.pct}%
          </span>
        </div>

        {/* Bottom Left Masonry Tile: Neutral */}
        <div
          onMouseEnter={() => setHoveredSegment("neu")}
          onMouseLeave={() => setHoveredSegment(null)}
          className={`px-2.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            hoveredSegment === "neu"
              ? "bg-purple-500/15 border-purple-500 shadow-xs"
              : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:border-purple-500/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-[var(--syn-heading)] block leading-tight">
                {neuCat.name}
              </span>
              <span className="text-[9.5px] font-mono text-[var(--syn-muted)]">
                {neuCat.count} probes
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-purple-500/15 text-purple-400 border border-purple-500/20">
            {neuCat.pct}%
          </span>
        </div>

        {/* Bottom Right Masonry Tile: Negative */}
        <div
          onMouseEnter={() => setHoveredSegment("neg")}
          onMouseLeave={() => setHoveredSegment(null)}
          className={`px-2.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            hoveredSegment === "neg"
              ? "bg-orange-500/15 border-orange-500 shadow-xs"
              : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:border-orange-500/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${negCat.count > 0 ? "bg-orange-500" : "bg-neutral-400"}`} />
            <div>
              <span className="text-[11px] font-bold text-[var(--syn-heading)] block leading-tight">
                {negCat.name}
              </span>
              <span className="text-[9.5px] font-mono text-[var(--syn-muted)]">
                {negCat.count} probes
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-neutral-500/10 text-neutral-400 border border-neutral-500/15">
            {negCat.pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PATTERN 4: V2 Dual Concentric Cyber-Gauge & Crawler Matrix (GEO Technical Index)
   Concentric dual radial rings (Indexability 73% + Crawlers 6/6) + 6-Bot Matrix
   ────────────────────────────────────────────────────────────────────── */

export function V2SegmentedDonutRing({
  score = 73,
  allowedBots = [
    "ChatGPT (GPTBot)",
    "Claude (ClaudeBot)",
    "Perplexity (PerplexityBot)",
    "Google Gemini (Google-Extended)",
    "Amazon AI (Amazonbot)",
    "ByteDance AI (Bytespider)",
  ],
  llmsTxt = true,
  schemas = 5,
}: {
  score?: number;
  allowedBots?: string[];
  llmsTxt?: boolean;
  schemas?: number;
  size?: number;
}) {
  const [hoveredRing, setHoveredRing] = useState<"outer" | "inner" | null>(null);
  const [hoveredBotIdx, setHoveredBotIdx] = useState<number | null>(null);

  const totalBots = 6;
  const activeBotCount = Math.min(allowedBots.length, totalBots);
  const crawlerPct = Math.round((activeBotCount / totalBots) * 100);

  const botList = [
    { name: "GPTBot", full: "OpenAI SearchGPT & ChatGPT Crawler", active: allowedBots.some((b) => b.toLowerCase().includes("gpt")) },
    { name: "ClaudeBot", full: "Anthropic Claude AI Crawler", active: allowedBots.some((b) => b.toLowerCase().includes("claude")) },
    { name: "Perplexity", full: "Perplexity Sonar Live Indexer", active: allowedBots.some((b) => b.toLowerCase().includes("perplexity")) },
    { name: "Google-Ext", full: "Google Gemini Extended AI Agent", active: allowedBots.some((b) => b.toLowerCase().includes("google")) },
    { name: "Amazonbot", full: "Amazon Bedrock & Rufus AI Crawler", active: allowedBots.some((b) => b.toLowerCase().includes("amazon")) },
    { name: "Bytespider", full: "ByteDance AI Search Crawler", active: allowedBots.some((b) => b.toLowerCase().includes("byte")) },
  ];

  // SVG Concentric Geometry (140 x 140)
  const vbSize = 140;
  const cx = 70;
  const cy = 70;

  // Outer Ring: Indexability Score (73/100)
  const rOuter = 54;
  const outerCircumference = 2 * Math.PI * rOuter;
  const outerDash = (score / 100) * outerCircumference;

  // Inner Ring: AI Crawlers Allowed (6/6 = 100%)
  const rInner = 40;
  const innerCircumference = 2 * Math.PI * rInner;
  const innerDash = (crawlerPct / 100) * innerCircumference;

  const activeBot = hoveredBotIdx !== null ? botList[hoveredBotIdx] : null;

  return (
    <div className="flex flex-col gap-3.5 w-full select-none py-1.5">
      {/* Top Main Section: Dual Concentric Gauge (Left) + 6-Bot Grounding Grid (Right) */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        {/* LEFT: Dual Concentric Radial Gauge (Expanded Size) */}
        <div className="relative shrink-0 w-[140px] h-[140px] flex items-center justify-center">
          <svg
            width="140"
            height="140"
            viewBox={`0 0 ${vbSize} ${vbSize}`}
            className="overflow-visible"
          >
            <defs>
              <filter id="geoGlowOuter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="geoGlowInner" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Track (Indexability 100) */}
            <circle
              cx={cx}
              cy={cy}
              r={rOuter}
              fill="none"
              stroke="var(--syn-border, rgba(255, 255, 255, 0.08))"
              strokeWidth="8"
            />
            {/* Outer Ring Progress (Emerald) */}
            <circle
              cx={cx}
              cy={cy}
              r={rOuter}
              fill="none"
              stroke="#10B981"
              strokeWidth={hoveredRing === "outer" ? 10 : 8}
              strokeDasharray={`${outerDash} ${outerCircumference - outerDash}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-300 cursor-pointer"
              filter={hoveredRing === "outer" ? "url(#geoGlowOuter)" : undefined}
              onMouseEnter={() => setHoveredRing("outer")}
              onMouseLeave={() => setHoveredRing(null)}
            />

            {/* Inner Track (Crawlers 6/6) */}
            <circle
              cx={cx}
              cy={cy}
              r={rInner}
              fill="none"
              stroke="var(--syn-border, rgba(255, 255, 255, 0.08))"
              strokeWidth="6.5"
            />
            {/* Inner Ring Progress (Cyan / Teal) */}
            <circle
              cx={cx}
              cy={cy}
              r={rInner}
              fill="none"
              stroke="#06B6D4"
              strokeWidth={hoveredRing === "inner" ? 8.5 : 6.5}
              strokeDasharray={`${innerDash} ${innerCircumference - innerDash}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-300 cursor-pointer"
              filter={hoveredRing === "inner" ? "url(#geoGlowInner)" : undefined}
              onMouseEnter={() => setHoveredRing("inner")}
              onMouseLeave={() => setHoveredRing(null)}
            />

            {/* Center Score & Label */}
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              className="font-mono font-extrabold fill-[var(--syn-heading)]"
              style={{ fontSize: "26px", letterSpacing: "-0.03em" }}
            >
              {hoveredRing === "inner" ? `${activeBotCount}/${totalBots}` : score}
            </text>
            <text
              x={cx}
              y={cy + 18}
              textAnchor="middle"
              className="font-mono font-bold fill-[var(--syn-muted)]"
              style={{ fontSize: "9.5px" }}
            >
              {hoveredRing === "inner" ? "Crawlers" : "/ 100 GEO"}
            </text>
          </svg>
        </div>

        {/* RIGHT: 6-Bot Access Matrix (Roomier 3 cols x 2 rows) */}
        <div className="flex-1 w-full grid grid-cols-3 gap-2">
          {botList.map((bot, i) => {
            const isHovered = hoveredBotIdx === i;
            return (
              <div
                key={bot.name}
                onMouseEnter={() => setHoveredBotIdx(i)}
                onMouseLeave={() => setHoveredBotIdx(null)}
                className={`px-2.5 py-2 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-1 cursor-pointer ${
                  isHovered
                    ? "bg-emerald-500/20 border-emerald-500 shadow-sm scale-[1.03]"
                    : bot.active
                    ? "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:border-emerald-500/40"
                    : "bg-red-500/10 border-red-500/30 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-[var(--syn-heading)] truncate">
                    {bot.name}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      bot.active ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                </div>
                <span className="text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {bot.active ? "Allowed ✓" : "Blocked ✗"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Badges Row (Robots.txt, /llms.txt, Schemas) */}
      <div className="grid grid-cols-3 gap-2 pt-0.5">
        <span className="px-2.5 py-1.5 rounded-xl text-[10.5px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">Robots.txt: Allowed</span>
        </span>

        <span
          className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-mono font-semibold border flex items-center justify-center gap-1.5 ${
            llmsTxt
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${llmsTxt ? "bg-emerald-500" : "bg-amber-500"}`} />
          <span className="truncate">{llmsTxt ? "/llms.txt: Active" : "/llms.txt: Pending"}</span>
        </span>

        <span className="px-2.5 py-1.5 rounded-xl text-[10.5px] font-mono font-semibold bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)] flex items-center justify-center gap-1">
          <span className="truncate">Schemas: {schemas} Detected</span>
        </span>
      </div>

      {/* Fixed Telemetry Status Bar (Zero layout shifts) */}
      <div className="w-full h-8 px-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between text-[11px] font-mono shrink-0 overflow-hidden">
        {activeBot ? (
          <>
            <span className="font-bold text-[var(--syn-heading)] flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{activeBot.name}:</span>
              <span className="text-[var(--syn-muted)] font-normal">{activeBot.full}</span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
              Status: {activeBot.active ? "Full Access" : "Restricted"}
            </span>
          </>
        ) : (
          <>
            <span className="text-[var(--syn-muted)] flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
              <span>6 of 6 AI Search Crawlers Allowed</span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
              Indexability: {score}/100
            </span>
          </>
        )}
      </div>
    </div>
  );
}


/* ──────────────────────────────────────────────────────────────────────
   PATTERN 5: V2 Nightingale Rose Petal Coxcomb Chart (AI Engine Coverage)
   Inspired by Nightingale Rose Petal Radial Chart (Image Reference)
   ────────────────────────────────────────────────────────────────────── */

export function V2EngineQueryHeatmapGrid({
  probes = [],
}: {
  probes?: Array<{
    engine: string;
    query: string;
    brandMentioned: boolean;
    mentionPosition?: number | null;
    sentiment?: string;
    model?: string;
  }>;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 8 Symmetrical AI Engine Sectors matching the 8-petal reference image
  const defaultEngines = [
    { key: "openai", name: "ChatGPT", model: "GPT-4o", defaultScore: 100, defaultProbes: 3 },
    { key: "gemini", name: "Gemini", model: "2.0 Flash", defaultScore: 100, defaultProbes: 3 },
    { key: "perplexity", name: "Perplexity", model: "Sonar Pro", defaultScore: 92, defaultProbes: 3 },
    { key: "claude", name: "Claude", model: "3.7 Sonnet", defaultScore: 85, defaultProbes: 3 },
    { key: "deepseek", name: "DeepSeek", model: "V3 Search", defaultScore: 75, defaultProbes: 2 },
    { key: "grok", name: "Grok", model: "Grok 3", defaultScore: 88, defaultProbes: 3 },
    { key: "searchgpt", name: "SearchGPT", model: "Realtime", defaultScore: 95, defaultProbes: 3 },
    { key: "copilot", name: "Copilot", model: "Bing AI", defaultScore: 80, defaultProbes: 2 },
  ];

  // Calculate live coverage scores from real probes if present
  const sectors = defaultEngines.map((eng, idx) => {
    const matchingProbes = probes.filter((p) =>
      p.engine.toLowerCase().includes(eng.key.toLowerCase()) ||
      eng.name.toLowerCase().includes(p.engine.toLowerCase())
    );

    let score = eng.defaultScore;
    let total = eng.defaultProbes;
    let positive = eng.defaultProbes;

    if (matchingProbes.length > 0) {
      total = matchingProbes.length;
      positive = matchingProbes.filter((p) => p.brandMentioned).length;
      score = Math.round((positive / total) * 100);
    }

    return {
      ...eng,
      idx,
      score,
      totalProbes: total,
      positiveProbes: positive,
    };
  });

  // SVG Radial Geometry (320 x 320 viewBox, 8 sectors = 45 deg each)
  const vbSize = 320;
  const cx = 160;
  const cy = 160;
  const rHub = 28; // Center star hub cutout
  const rMax = 148; // Maximum outer shell radius
  const numSectors = 8;
  const sectorAngle = 360 / numSectors; // 45°
  const gapDeg = 2.2; // Clean petal separation

  // Helper to generate a curved petal wedge path
  function getPetalPath(
    rInner: number,
    rOuter: number,
    startDeg: number,
    endDeg: number
  ) {
    const a1 = (startDeg + gapDeg) * (Math.PI / 180);
    const a2 = (endDeg - gapDeg) * (Math.PI / 180);

    const x1 = cx + rInner * Math.cos(a1);
    const y1 = cy + rInner * Math.sin(a1);
    const x2 = cx + rOuter * Math.cos(a1);
    const y2 = cy + rOuter * Math.sin(a1);
    const x3 = cx + rOuter * Math.cos(a2);
    const y3 = cy + rOuter * Math.sin(a2);
    const x4 = cx + rInner * Math.cos(a2);
    const y4 = cy + rInner * Math.sin(a2);

    return `M ${x1} ${y1} L ${x2} ${y2} A ${rOuter} ${rOuter} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rInner} ${rInner} 0 0 0 ${x1} ${y1} Z`;
  }

  const activeSector = hoveredIndex !== null ? sectors[hoveredIndex] : null;

  return (
    <div className="flex flex-col items-center justify-between w-full select-none">
      {/* SVG Nightingale Rose Chart Container (Fixed Aspect Ratio with Zero Layout Shift) */}
      <div className="relative w-full max-w-[310px] aspect-square flex items-center justify-center my-1">
        <svg
          viewBox={`0 0 ${vbSize} ${vbSize}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <filter id="petalGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render 8 Petal Sectors */}
          {sectors.map((s) => {
            // Sector angles starting from top (-90°)
            const startAngle = -90 + s.idx * sectorAngle;
            const endAngle = startAngle + sectorAngle;
            const midAngle = startAngle + sectorAngle / 2;
            const midRad = (midAngle * Math.PI) / 180;

            // Value petal radius proportional to coverage score (min 38% fill for label breathing room)
            const normalizedScore = Math.max(25, s.score);
            const rVal = rHub + (rMax - rHub) * (normalizedScore / 100);

            const isHovered = hoveredIndex === s.idx;

            // Paths
            const shellPath = getPetalPath(rHub, rMax, startAngle, endAngle);
            const valuePath = getPetalPath(rHub, rVal, startAngle, endAngle);

            // Label coordinate calculations
            const textDist = rHub + (rMax - rHub) * 0.58;
            const tx = cx + textDist * Math.cos(midRad);
            const ty = cy + textDist * Math.sin(midRad);

            // Text contrast: if value petal covers text area -> dark text on light petal; else light text on dark shell
            const isTextOnLightPetal = rVal >= textDist + 6;

            return (
              <g
                key={s.key}
                onMouseEnter={() => setHoveredIndex(s.idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* 1. Outer Dark Backdrop Petal Shell */}
                <path
                  d={shellPath}
                  className={`transition-colors duration-200 ${
                    isHovered
                      ? "fill-neutral-700/80 dark:fill-neutral-800/90 stroke-emerald-400/60"
                      : "fill-neutral-300/40 dark:fill-[#2B2D31] stroke-black/5 dark:stroke-white/10"
                  }`}
                  strokeWidth={isHovered ? 1.5 : 1}
                  strokeLinejoin="round"
                />

                {/* 2. Inner Light Filled Value Petal (Proportional Radius) */}
                <path
                  d={valuePath}
                  className={`transition-all duration-200 ${
                    isHovered
                      ? "fill-white dark:fill-[#F0F3F6] stroke-emerald-500"
                      : "fill-neutral-800 dark:fill-[#E1E4EA] stroke-transparent"
                  }`}
                  strokeWidth={isHovered ? 1.5 : 0}
                  strokeLinejoin="round"
                  filter={isHovered ? "url(#petalGlow)" : undefined}
                />

                {/* 3. Value Metric Text (Top Line) */}
                <text
                  x={tx}
                  y={ty - 3}
                  textAnchor="middle"
                  className={`font-mono font-extrabold select-none pointer-events-none transition-colors duration-150 ${
                    isTextOnLightPetal
                      ? "fill-neutral-100 dark:fill-neutral-900"
                      : "fill-neutral-800 dark:fill-neutral-200"
                  }`}
                  style={{ fontSize: "13.5px", letterSpacing: "-0.02em" }}
                >
                  {s.score}%
                </text>

                {/* 4. Engine Name Text (Bottom Line) */}
                <text
                  x={tx}
                  y={ty + 10}
                  textAnchor="middle"
                  className={`font-sans font-semibold select-none pointer-events-none transition-colors duration-150 ${
                    isTextOnLightPetal
                      ? "fill-neutral-300 dark:fill-neutral-700 font-bold"
                      : "fill-neutral-600 dark:fill-neutral-400"
                  }`}
                  style={{ fontSize: "9.5px" }}
                >
                  {s.name}
                </text>
              </g>
            );
          })}

          {/* Central Star / Circular Hub Cutout */}
          <circle
            cx={cx}
            cy={cy}
            r={rHub - 2}
            className="fill-[var(--syn-card)] stroke-[var(--syn-border)] transition-colors"
            strokeWidth="1.5"
          />

          {/* Center Hub Indicator */}
          <circle
            cx={cx}
            cy={cy}
            r={8}
            className={
              activeSector
                ? "fill-emerald-500 transition-colors animate-pulse"
                : "fill-emerald-500/30 dark:fill-emerald-400/40"
            }
          />
          <circle
            cx={cx}
            cy={cy}
            r={3.5}
            className="fill-white dark:fill-neutral-950"
          />
        </svg>
      </div>

      {/* Rock-Solid Single-Line Status Bar (Fixed height prevents ANY UI flickering or shaking) */}
      <div className="w-full h-8 mt-2 px-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between text-[11px] font-mono shrink-0 overflow-hidden">
        {activeSector ? (
          <>
            <span className="font-bold text-[var(--syn-heading)] flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{activeSector.name}</span>
              <span className="text-[var(--syn-muted)] font-normal">({activeSector.model})</span>
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
              {activeSector.score}% Coverage · {activeSector.positiveProbes}/{activeSector.totalProbes} Probes
            </span>
          </>
        ) : (
          <>
            <span className="text-[var(--syn-muted)] flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span>8 AI Engines Monitored</span>
            </span>
            <span className="font-semibold text-[var(--syn-heading)] shrink-0 ml-2">
              Hover petal for telemetry
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PATTERN 6: V2 Action Pipeline & Impact Hub (Optimization Playbook)
   Zero-flicker fixed geometry with resolution ring, priority breakdown & action slats
   ────────────────────────────────────────────────────────────────────── */

export function V2OptimizationPlaybookCapsules({
  actions = [],
}: {
  actions?: Array<{
    id?: string;
    priority?: string;
    actionType?: string;
    title: string;
    description?: string;
    isCompleted?: boolean;
    estimatedImpact?: string;
  }>;
}) {
  const [hoveredActionIdx, setHoveredActionIdx] = useState<number | null>(null);

  const fallbackActions = [
    {
      id: "1",
      priority: "high",
      actionType: "publish_llms",
      title: "Deploy /llms.txt AI File",
      description: "Allow AI search engines to parse authoritative documentation directly.",
      isCompleted: false,
      impact: "+18% AI Discoverability",
    },
    {
      id: "2",
      priority: "high",
      actionType: "media",
      title: "Amplify Tech News Citations",
      description: "Target coverage on ComputerWorld, Tech.co and industry press.",
      isCompleted: false,
      impact: "+24% Citation Authority",
    },
    {
      id: "3",
      priority: "medium",
      actionType: "schema",
      title: "Implement FAQ & Product Schema",
      description: "Structured JSON-LD schema for ChatGPT and Google Gemini grounding.",
      isCompleted: false,
      impact: "+12% Snippet Inclusion",
    },
    {
      id: "4",
      priority: "medium",
      actionType: "reviews",
      title: "Consolidate G2 & Capterra Reviews",
      description: "Boost consensus score across multi-engine comparison queries.",
      isCompleted: true,
      impact: "✓ Completed",
    },
  ];

  const actionList = actions.length > 0 ? actions.slice(0, 4) : fallbackActions;

  const totalActions = actions.length || fallbackActions.length;
  const completedCount = actions.filter((a) => a.isCompleted).length || 1;
  const highPriorityCount = actions.filter((a) => a.priority === "high").length || 2;
  const resolutionRate = Math.round((completedCount / totalActions) * 100) || 75;

  // Mini Radial SVG parameters - Spacious resolution ring
  const ringSize = 84;
  const cx = 42;
  const cy = 42;
  const r = 33;
  const circumference = 2 * Math.PI * r;
  const strokeDash = (resolutionRate / 100) * circumference;

  const activeAction = hoveredActionIdx !== null ? actionList[hoveredActionIdx] : null;

  return (
    <div className="flex flex-col gap-3 w-full select-none py-1.5">
      {/* Top Row: Mini Resolution Gauge + Priority Pills */}
      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)]">
        {/* Left: Resolution Ring */}
        <div className="relative shrink-0 w-[84px] h-[84px] flex items-center justify-center">
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} className="overflow-visible">
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="var(--syn-border, rgba(255,255,255,0.08))"
              strokeWidth="7"
            />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#10B981"
              strokeWidth="7"
              strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-mono font-extrabold text-[17px] tracking-tight text-[var(--syn-heading)] leading-none">
              {resolutionRate}%
            </span>
            <span className="text-[8.5px] font-mono text-[var(--syn-muted)] mt-0.5">Resolved</span>
          </div>
        </div>

        {/* Right: Priority Metrics Breakdown */}
        <div className="flex-1 grid grid-cols-2 gap-2.5">
          {/* High Priority Stat */}
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Critical
              </span>
              <span className="font-mono font-extrabold text-base text-red-500">{highPriorityCount}</span>
            </div>
            <span className="text-[9px] font-mono text-[var(--syn-muted)]">High Priority Tasks</span>
          </div>

          {/* Action Success Stat */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
              <span className="font-mono font-extrabold text-base text-emerald-500">
                {totalActions - completedCount}
              </span>
            </div>
            <span className="text-[9px] font-mono text-[var(--syn-muted)]">Tasks in Queue</span>
          </div>
        </div>
      </div>

      {/* Action Pipeline Slats List (Top 3 High Impact Tasks) */}
      <div className="space-y-2">
        {actionList.slice(0, 3).map((act, i) => {
          const isHovered = hoveredActionIdx === i;
          const isHigh = act.priority === "high";
          const isDone = act.isCompleted;

          return (
            <div
              key={act.id || i}
              onMouseEnter={() => setHoveredActionIdx(i)}
              onMouseLeave={() => setHoveredActionIdx(null)}
              className={`h-[46px] px-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                isHovered
                  ? "bg-emerald-500/15 border-emerald-500 shadow-xs"
                  : isDone
                  ? "bg-[var(--syn-card-inner)] border-[var(--syn-border)] opacity-70"
                  : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:border-emerald-500/40"
              }`}
            >
              {/* Left Label & Title */}
              <div className="flex items-center gap-2.5 truncate pr-2">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isDone ? "bg-emerald-500" : isHigh ? "bg-red-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-xs font-bold text-[var(--syn-heading)] truncate">
                  {act.title}
                </span>
              </div>

              {/* Right Impact Pill */}
              <span
                className={`shrink-0 px-2.5 py-1 rounded-lg font-mono text-[10px] font-extrabold border ${
                  isDone
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : isHigh
                    ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                }`}
              >
                {isDone ? "✓ Done" : isHigh ? "High Impact" : "Medium"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Rock-Solid Single-Line Status Bar (Fixed height prevents any UI shaking) */}
      <div className="w-full h-8 px-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between text-[11px] font-mono shrink-0 overflow-hidden">
        {activeAction ? (
          <>
            <span className="font-bold text-[var(--syn-heading)] flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{activeAction.title}</span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
              {activeAction.isCompleted ? "Status: Completed" : "Ready to execute"}
            </span>
          </>
        ) : (
          <>
            <span className="text-[var(--syn-muted)] flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span>{totalActions} GEO Optimization Actions Active</span>
            </span>
            <span className="font-semibold text-[var(--syn-heading)] shrink-0 ml-2">
              Hover task for details
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PATTERN 7: V2 Side-by-Side Glowing Equalizer Ladders (Consensus Matrix)
   Inspired by Image 2 Pattern F ("AI-derived Comparison")
   ────────────────────────────────────────────────────────────────────── */

export function V2EqualizerLadderMatrix({
  engines = [
    { name: "Google Gemini", score: 100, model: "gemini-2.0-flash", color: "#3B82F6" },
    { name: "ChatGPT", score: 100, model: "gpt-4o-mini", color: "#10B981" },
    { name: "Perplexity", score: 100, model: "sonar", color: "#8B5CF6" },
    { name: "Claude", score: 100, model: "claude-3-5-sonnet", color: "#F59E0B" },
    { name: "DeepSeek", score: 100, model: "deepseek-chat", color: "#06B6D4" },
    { name: "Grok", score: 100, model: "grok-2", color: "#EC4899" },
  ],
}: {
  engines?: Array<{
    name: string;
    score: number;
    model: string;
    color?: string;
  }>;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2 select-none w-full">
      {engines.map((eng, idx) => {
        const isHovered = hoveredIdx === idx;
        const ticksCount = 14;
        const activeTicks = Math.round((eng.score / 100) * ticksCount);

        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${
              isHovered
                ? "bg-emerald-500/10 border-emerald-500 shadow-sm"
                : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:border-emerald-500/40"
            }`}
          >
            {/* Engine Identity & Model Tag */}
            <div className="flex items-center gap-2.5 min-w-0 sm:min-w-[190px]">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: eng.color || "#10B981" }}
              />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 min-w-0">
                <span className="text-xs font-bold text-[var(--syn-heading)] whitespace-nowrap">
                  {eng.name}
                </span>
                <span className="text-[10px] font-mono text-[var(--syn-muted)] truncate">
                  {eng.model}
                </span>
              </div>
            </div>

            {/* Horizontal Equalizer Ticks Ladder */}
            <div className="hidden sm:flex items-center gap-1 h-6 bg-black/10 dark:bg-white/5 rounded-lg px-2.5 py-0.5 border border-[var(--syn-border)] flex-1 max-w-[200px]">
              {Array.from({ length: ticksCount }).map((_, tIdx) => {
                const isActive = tIdx < activeTicks;
                return (
                  <div
                    key={tIdx}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      isActive
                        ? "h-full bg-gradient-to-t from-emerald-600 to-teal-400 shadow-xs"
                        : "h-1.5 bg-neutral-300 dark:bg-neutral-800 opacity-40"
                    }`}
                  />
                );
              })}
            </div>

            {/* Score & Rank Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                {eng.score}%
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Rank #1
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PATTERN 8: V2 Segmented Donut Ring with Floating Channel Badges (Citation Ecosystem)
   Inspired by Image 3 Pattern I ("Donut Ring with Floating Badges")
   ────────────────────────────────────────────────────────────────────── */

export function V2CitationEcosystemRing({
  pressCount = 6,
  reviewsCount = 5,
  appStoresCount = 5,
  videoCount = 9,
  highImpactCount = 22,
  totalSources = 42,
  size = 135,
}: {
  pressCount?: number;
  reviewsCount?: number;
  appStoresCount?: number;
  videoCount?: number;
  highImpactCount?: number;
  totalSources?: number;
  size?: number;
}) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categories = [
    { key: "press", name: "Press & News", count: pressCount, color: "#3B82F6", icon: Newspaper },
    { key: "reviews", name: "Review Hubs", count: reviewsCount, color: "#F59E0B", icon: Star },
    { key: "appstore", name: "App Stores", count: appStoresCount, color: "#8B5CF6", icon: Smartphone },
    { key: "video", name: "Video Media", count: videoCount, color: "#EC4899", icon: Video },
  ];

  const totalCitations = totalSources || (pressCount + reviewsCount + appStoresCount + videoCount);
  const highAuthPct = totalCitations > 0 ? Math.round((highImpactCount / totalCitations) * 100) : 52;

  const strokeWidth = 11;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const segments = categories.map((cat) => {
    const proportion = totalCitations > 0 ? cat.count / totalCitations : 0.25;
    const segmentLength = Math.max(8, circumference * proportion - 3);
    const dashArray = `${segmentLength} ${circumference - segmentLength}`;
    const dashOffset = -currentOffset;
    currentOffset += circumference * proportion;

    return {
      ...cat,
      dashArray,
      dashOffset,
      proportion,
    };
  });

  const activeCat = hoveredCategory ? categories.find((c) => c.key === hoveredCategory) : null;

  return (
    <div className="flex flex-col gap-3 w-full select-none py-1.5">
      {/* 1. High Authority Grounding Progress Bar & Metric */}
      <div className="space-y-2 p-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)]">
        <div className="flex justify-between items-baseline text-xs">
          <span className="text-xs font-bold text-[var(--syn-muted)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            High Authority Grounding
          </span>
          <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
            {highImpactCount} of {totalCitations} URLs ({highAuthPct}%)
          </span>
        </div>
        <div className="h-2.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden flex border border-[var(--syn-border)]">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700 shadow-xs"
            style={{ width: `${highAuthPct}%` }}
          />
        </div>
      </div>

      {/* 2. Donut Ring + Channel Breakdown Badges */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        {/* Multi-Color Segmented Ring */}
        <div className="relative flex items-center justify-center shrink-0 w-[135px] h-[135px]">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {segments.map((seg) => {
              const isHovered = hoveredCategory === seg.key;

              return (
                <circle
                  key={seg.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                  opacity={isHovered ? 1 : 0.9}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(seg.key)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Total Count */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold font-mono text-[var(--syn-heading)] leading-none">
              {totalCitations}
            </span>
            <span className="text-[9px] font-mono text-[var(--syn-muted)] mt-0.5">Sources</span>
          </div>
        </div>

        {/* Channel Badges Grid */}
        <div className="flex-1 grid grid-cols-2 gap-2 w-full">
          {categories.map((cat) => {
            const isHovered = hoveredCategory === cat.key;

            return (
              <div
                key={cat.key}
                onMouseEnter={() => setHoveredCategory(cat.key)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all duration-150 cursor-pointer ${
                  isHovered
                    ? "bg-[var(--syn-card)] border-emerald-500 shadow-xs scale-[1.02]"
                    : "bg-[var(--syn-card-inner)] border-[var(--syn-border)] hover:border-emerald-500/40"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[11px] font-bold text-[var(--syn-heading)] truncate">
                    {cat.name}
                  </span>
                </div>
                <span className="text-xs font-mono font-extrabold text-[var(--syn-heading)] shrink-0">
                  {cat.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Rock-Solid Status Bar */}
      <div className="w-full h-8 px-3 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between text-[11px] font-mono shrink-0 overflow-hidden">
        {activeCat ? (
          <>
            <span className="font-bold text-[var(--syn-heading)] flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCat.color }} />
              <span>{activeCat.name}</span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
              {activeCat.count} of {totalCitations} Grounded Citations
            </span>
          </>
        ) : (
          <>
            <span className="text-[var(--syn-muted)] flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span>{highImpactCount} High-Authority Domains Grounded</span>
            </span>
            <span className="font-semibold text-[var(--syn-heading)] shrink-0 ml-2">
              Hover channel for counts
            </span>
          </>
        )}
      </div>
    </div>
  );
}

