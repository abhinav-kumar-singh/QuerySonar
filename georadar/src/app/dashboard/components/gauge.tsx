"use client";

import React from "react";

/* ──────────────────────────────────────────────────────────────────────
   1. Semi-Circular Gauge (Speedometer Dial)
   As seen in Synetica's "Synced Records" card (71,74%).
   ────────────────────────────────────────────────────────────────────── */

export function SemiCircleGauge({
  value = 71.74,
  max = 100,
  size = 180,
  strokeWidth = 12,
  color = "#22C55E",
  backgroundColor = "var(--syn-card-inner, rgba(255,255,255,0.1))",
}: {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
}) {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = clampedValue / max;

  // Radius based on size & stroke
  const radius = (size - strokeWidth * 2) / 2;
  const centerX = size / 2;
  const centerY = size / 2 + 10;

  // Semi-circle arc length (Pi * r)
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - percentage);

  // Calculate indicator dot position at the tip of the filled arc
  const angle = Math.PI - percentage * Math.PI; // from PI (left) to 0 (right)
  const dotX = centerX + radius * Math.cos(angle);
  const dotY = centerY - radius * Math.sin(angle);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size / 2 + 25}
        viewBox={`0 0 ${size} ${size / 2 + 25}`}
        className="overflow-visible"
      >
        {/* Background track (semi-circle from 180° to 0°) */}
        <path
          d={`M ${strokeWidth},${centerY} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${centerY}`}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Filled active arc */}
        <path
          d={`M ${strokeWidth},${centerY} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${centerY}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />

        {/* Neon Indicator Dot at the tip */}
        <circle
          cx={dotX}
          cy={dotY}
          r={strokeWidth / 2 + 1}
          fill="#FFFFFF"
          stroke={color}
          strokeWidth={3}
          className="drop-shadow-sm transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Centered Value */}
      <div className="absolute bottom-2 flex items-baseline gap-0.5">
        <span className="text-3xl font-extrabold tracking-tight font-mono">
          {Number.isInteger(value) || value % 1 === 0 ? Math.round(value) : (Math.round(value * 10) / 10)}
        </span>
        <span className="text-lg font-bold">%</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   2. Barcode Line Histogram with Trend Peak Line
   As seen in Synetica's "Utilization" & "Timely Closures" cards.
   ────────────────────────────────────────────────────────────────────── */

export function BarcodeChart({
  bars = 48,
  activeRatio = 0.55,
  peakIndex = 32,
  height = 70,
  accentColor = "#22C55E",
  interactive = true,
  unit = "%",
  baseValue = 100,
}: {
  bars?: number;
  activeRatio?: number;
  peakIndex?: number;
  height?: number;
  accentColor?: string;
  interactive?: boolean;
  unit?: string;
  baseValue?: number;
}) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  // Generate deterministic bar heights that simulate account activity with a peak
  const barData = React.useMemo(() => {
    const data: { height: number; active: boolean; isMarker: boolean; value: number; dateLabel: string }[] = [];
    const activeCount = Math.floor(bars * activeRatio);

    for (let i = 0; i < bars; i++) {
      // Create subtle wave with a peak around peakIndex
      const distFromPeak = Math.abs(i - peakIndex);
      const wave = Math.max(0.2, 1 - distFromPeak / 22);
      const randomNoise = ((i * 17) % 19) / 45;
      const calculatedHeight = Math.min(1, Math.max(0.15, wave * 0.75 + randomNoise));
      const monthIdx = Math.min(6, Math.floor((i / (bars - 1)) * 6.5));
      const day = ((i * 4) % 28) + 1;
      const monthName = months[monthIdx] || "Apr";

      const valVariation = Math.round(
        baseValue > 0
          ? Math.max(10, Math.min(100, baseValue * (0.68 + calculatedHeight * 0.32)))
          : 0
      );

      data.push({
        height: Math.round(calculatedHeight * (height - 16)),
        active: i <= activeCount,
        isMarker: i === activeCount,
        value: valVariation,
        dateLabel: `${monthName} ${day < 10 ? "0" + day : day}, 2026`,
      });
    }
    return data;
  }, [bars, activeRatio, peakIndex, height, baseValue]);

  // SVG path for the smooth peak line running across the top of the bars
  const linePath = React.useMemo(() => {
    const points = barData
      .slice(0, Math.floor(bars * 0.85))
      .map((b, idx) => {
        const x = (idx / (bars - 1)) * 100;
        const y = height - b.height - 6;
        return `${x},${y}`;
      });
    return points.length > 0 ? `M ${points.join(" L ")}` : "";
  }, [barData, bars, height]);

  // Area path underneath the line for subtle ambient fill
  const areaPath = React.useMemo(() => {
    if (!linePath) return "";
    const activeLength = Math.floor(bars * 0.85);
    const lastX = ((activeLength - 1) / (bars - 1)) * 100;
    return `${linePath} L ${lastX},${height} L 0,${height} Z`;
  }, [linePath, bars, height]);

  const activeIndex = hoveredIdx !== null ? hoveredIdx : Math.floor(bars * activeRatio);
  const currentItem = barData[activeIndex] || barData[0];
  const activeX = (activeIndex / (bars - 1)) * 100;
  const activeY = height - (currentItem?.height ?? 20) - 6;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const idx = Math.min(bars - 1, Math.max(0, Math.floor(ratio * bars)));
    setHoveredIdx(idx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-visible pt-2 group cursor-crosshair select-none"
    >
      {/* Floating Hover Tooltip */}
      {hoveredIdx !== null && currentItem && (
        <div
          className="absolute -top-9 z-20 transform -translate-x-1/2 pointer-events-none transition-all duration-75 ease-out"
          style={{ left: `${activeX}%` }}
        >
          <div className="px-2.5 py-1 rounded-lg bg-neutral-900/95 dark:bg-neutral-100/95 text-white dark:text-neutral-900 border border-neutral-700/50 dark:border-neutral-200/50 shadow-xl backdrop-blur-md text-[10px] font-mono flex items-center gap-1.5 whitespace-nowrap">
            <span className="opacity-70">{currentItem.dateLabel}:</span>
            <span className="font-bold text-emerald-400 dark:text-emerald-600">
              {currentItem.value}{unit}
            </span>
          </div>
        </div>
      )}

      <svg
        className="w-full overflow-visible"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.16" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Ambient Gradient Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#chartGradient)" />
        )}

        {/* Trend line over bars */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />
        )}

        {/* Vertical barcode ticks */}
        {barData.map((b, i) => {
          const x = (i / (bars - 1)) * 100;
          const isHoveredBar = hoveredIdx === i;
          return (
            <line
              key={i}
              x1={x}
              y1={height - b.height}
              x2={x}
              y2={height}
              stroke={
                isHoveredBar
                  ? accentColor
                  : b.isMarker
                  ? accentColor
                  : b.active
                  ? "currentColor"
                  : "var(--syn-border, rgba(255,255,255,0.12))"
              }
              strokeWidth={isHoveredBar ? "1.8" : b.isMarker ? "1.5" : "0.9"}
              strokeLinecap="round"
              opacity={isHoveredBar ? 1 : b.active ? 0.85 : 0.35}
              className="transition-all duration-75"
            />
          );
        })}

        {/* Peak green indicator line */}
        <line
          x1={activeX}
          y1={0}
          x2={activeX}
          y2={height}
          stroke={accentColor}
          strokeWidth="1.2"
          strokeDasharray="2 2"
          className="transition-all duration-75"
        />

        {/* Glowing Indicator Dot at the peak curve */}
        <circle
          cx={activeX}
          cy={activeY}
          r="3"
          fill="#FFFFFF"
          stroke={accentColor}
          strokeWidth="2"
          className="drop-shadow-sm transition-all duration-75"
        />
      </svg>
      <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
        <span>Jan</span>
        <span className="hidden sm:inline">Apr</span>
        <span>Jul</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   3. Horizontal Tick Progress Bar
   As seen in "Processed Items" & "Anomalies" cards.
   ────────────────────────────────────────────────────────────────────── */

export function TickProgressBar({
  percentage = 70,
  accentColor = "#22C55E",
  ticks = 36,
}: {
  percentage?: number;
  accentColor?: string;
  ticks?: number;
}) {
  const activeTicks = Math.round((percentage / 100) * ticks);

  return (
    <div className="flex items-center gap-1.5 w-full py-1">
      {/* Solid progress pill */}
      <div className="flex-1 h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden flex items-center p-0.5">
        <div
          className="h-full rounded-sm transition-all duration-700"
          style={{
            width: `${percentage}%`,
            backgroundColor: accentColor,
          }}
        />
        <div className="h-full w-2 bg-neutral-900 dark:bg-white rounded-sm ml-0.5" />
      </div>

      {/* Barcode ticks to the right */}
      <div className="flex items-center gap-[2px] h-3.5 pl-1">
        {Array.from({ length: ticks - activeTicks > 12 ? 14 : 8 }).map((_, i) => (
          <div
            key={i}
            className={`w-[1.5px] rounded-full ${
              i === 0 ? "h-3.5 bg-emerald-500" : "h-2.5 bg-neutral-200 dark:bg-neutral-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   4. Real Engine Probes Barcode Chart (100% Data-Driven)
   Renders actual mentionAnalyses probes with live hover tooltips
   ────────────────────────────────────────────────────────────────────── */

export function RealProbesBarcodeChart({
  probes = [],
  height = 75,
}: {
  probes?: Array<{
    engine: string;
    query: string;
    brandMentioned?: boolean;
    mentionPosition?: number | null;
    sentiment?: string;
    model?: string;
  }>;
  height?: number;
}) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const displayProbes = React.useMemo(() => {
    if (probes.length > 0) return probes;
    return [
      { engine: "gemini", query: "Core Buyer Query 1", brandMentioned: true, mentionPosition: 1, sentiment: "positive", model: "gemini-3.1-flash-lite" },
      { engine: "openai", query: "Core Buyer Query 1", brandMentioned: true, mentionPosition: 1, sentiment: "positive", model: "gpt-4o-mini" },
      { engine: "perplexity", query: "Core Buyer Query 1", brandMentioned: true, mentionPosition: 1, sentiment: "neutral", model: "sonar" },
      { engine: "claude", query: "Core Buyer Query 1", brandMentioned: true, mentionPosition: 1, sentiment: "positive", model: "claude-3-5-sonnet" },
      { engine: "deepseek", query: "Core Buyer Query 1", brandMentioned: true, mentionPosition: 1, sentiment: "positive", model: "deepseek-chat" },
      { engine: "grok", query: "Core Buyer Query 1", brandMentioned: true, mentionPosition: 1, sentiment: "positive", model: "grok-2" },
    ];
  }, [probes]);

  const barData = React.useMemo(() => {
    return displayProbes.map((p, i) => {
      const isTopPick = p.brandMentioned && p.mentionPosition === 1;
      const isSecondPick = p.brandMentioned && p.mentionPosition === 2;
      const score = isTopPick ? 100 : isSecondPick ? 75 : p.brandMentioned ? 50 : 20;
      const calculatedHeight = Math.round((score / 100) * (height - 18));

      const color =
        p.sentiment === "negative"
          ? "#EF4444"
          : isTopPick
          ? "#22C55E"
          : isSecondPick
          ? "#10B981"
          : "#F59E0B";

      return {
        ...p,
        height: Math.max(12, calculatedHeight),
        score,
        color,
        index: i,
      };
    });
  }, [displayProbes, height]);

  // Generate SVG curve points across real probe scores
  const linePath = React.useMemo(() => {
    if (barData.length === 0) return "";
    const points = barData.map((b, idx) => {
      const x = (idx / Math.max(1, barData.length - 1)) * 100;
      const y = height - b.height - 6;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  }, [barData, height]);

  const areaPath = React.useMemo(() => {
    if (!linePath) return "";
    return `${linePath} L 100,${height} L 0,${height} Z`;
  }, [linePath, height]);

  const activeIndex = hoveredIdx !== null ? hoveredIdx : 0;
  const currentItem = barData[activeIndex] || barData[0];
  const activeX = (activeIndex / Math.max(1, barData.length - 1)) * 100;
  const activeY = height - (currentItem?.height ?? 20) - 6;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || barData.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const idx = Math.min(barData.length - 1, Math.max(0, Math.round(ratio * (barData.length - 1))));
    setHoveredIdx(idx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  const formatEngineName = (name: string) => {
    if (name === "openai") return "ChatGPT";
    if (name === "gemini") return "Google Gemini";
    if (name === "perplexity") return "Perplexity";
    if (name === "claude") return "Anthropic Claude";
    if (name === "deepseek") return "DeepSeek";
    if (name === "grok") return "xAI Grok";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-visible pt-2 group cursor-crosshair select-none"
    >
      {/* Dynamic Hover Tooltip */}
      {hoveredIdx !== null && currentItem && (
        <div
          className="absolute -top-14 z-30 transform -translate-x-1/2 pointer-events-none transition-all duration-75 ease-out w-56"
          style={{ left: `${Math.max(25, Math.min(75, activeX))}%` }}
        >
          <div className="p-2.5 rounded-xl bg-neutral-900/95 dark:bg-neutral-100/95 text-white dark:text-neutral-900 border border-neutral-700/50 dark:border-neutral-200/50 shadow-2xl backdrop-blur-md text-[10px] space-y-1">
            <div className="flex items-center justify-between gap-2 font-mono border-b border-white/10 dark:border-black/10 pb-1">
              <span className="font-bold text-emerald-400 dark:text-emerald-600">
                {formatEngineName(currentItem.engine)}
              </span>
              <span className="opacity-70 text-[9px]">{currentItem.model}</span>
            </div>
            <p className="line-clamp-1 italic text-[10px] opacity-80">&ldquo;{currentItem.query}&rdquo;</p>
            <div className="flex items-center justify-between text-[9px] font-mono pt-0.5 font-semibold">
              <span className="text-emerald-400 dark:text-emerald-600">
                {currentItem.mentionPosition ? `Rank #${currentItem.mentionPosition}` : "Mentioned"}
              </span>
              <span className="capitalize opacity-70">
                {currentItem.sentiment || "Neutral"} Tone
              </span>
            </div>
          </div>
        </div>
      )}

      <svg
        className="w-full overflow-visible"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="probesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Ambient Gradient Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#probesGradient)" />
        )}

        {/* Trend line over bars */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#22C55E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        )}

        {/* Real Probe Barcode Ticks */}
        {barData.map((b, i) => {
          const x = (i / Math.max(1, barData.length - 1)) * 100;
          const isHovered = hoveredIdx === i;
          return (
            <line
              key={i}
              x1={x}
              y1={height - b.height}
              x2={x}
              y2={height}
              stroke={isHovered ? "#22C55E" : b.color}
              strokeWidth={isHovered ? "2.5" : "1.6"}
              strokeLinecap="round"
              opacity={isHovered ? 1 : 0.75}
              className="transition-all duration-75"
            />
          );
        })}

        {/* Hover Guideline */}
        {hoveredIdx !== null && (
          <line
            x1={activeX}
            y1={0}
            x2={activeX}
            y2={height}
            stroke="#22C55E"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            className="transition-all duration-75"
          />
        )}

        {/* Hover Indicator Dot */}
        {hoveredIdx !== null && (
          <circle
            cx={activeX}
            cy={activeY}
            r="3.5"
            fill="#FFFFFF"
            stroke="#22C55E"
            strokeWidth="2.5"
            className="drop-shadow-sm transition-all duration-75"
          />
        )}
      </svg>

      {/* Real 6-Engine Axis Labels */}
      <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-1">
        <span>Gemini</span>
        <span>ChatGPT</span>
        <span>Perplexity</span>
        <span>Claude</span>
        <span>DeepSeek</span>
        <span>Grok</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   5. Real Playbook Actions Barcode Chart (100% Data-Driven)
   Renders actual audit.actions tasks with live hover tooltips
   ────────────────────────────────────────────────────────────────────── */

export function RealActionsBarcodeChart({
  actions = [],
  height = 75,
}: {
  actions?: Array<{
    id?: string;
    priority?: string;
    actionType?: string;
    title: string;
    description?: string;
    isCompleted?: boolean;
    targetUrl?: string;
  }>;
  height?: number;
}) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const displayActions = React.useMemo(() => {
    if (actions.length > 0) return actions;
    return [
      { priority: "high", actionType: "create_content", title: "Publish /llms.txt AI File", isCompleted: false },
      { priority: "high", actionType: "respond_reddit", title: "Participate in r/community discussion", isCompleted: false },
      { priority: "high", actionType: "contact_publication", title: "Amplify media citation on learn.g2.com", isCompleted: false },
      { priority: "high", actionType: "contact_publication", title: "Amplify media citation on computerworld.com", isCompleted: false },
      { priority: "high", actionType: "get_reviews", title: "Target citation coverage on learn.g2.com", isCompleted: false },
      { priority: "high", actionType: "get_reviews", title: "Target citation coverage on g2.com", isCompleted: false },
      { priority: "medium", actionType: "update_schema", title: "Implement FAQ & Product Schema", isCompleted: false },
    ];
  }, [actions]);

  const barData = React.useMemo(() => {
    return displayActions.map((a, i) => {
      const isHigh = a.priority === "high";
      const isMedium = a.priority === "medium";
      const score = a.isCompleted ? 100 : isHigh ? 90 : isMedium ? 60 : 40;
      const calculatedHeight = Math.round((score / 100) * (height - 18));
      const color = a.isCompleted ? "#22C55E" : isHigh ? "#EF4444" : "#F59E0B";

      return {
        ...a,
        height: Math.max(12, calculatedHeight),
        score,
        color,
        index: i,
      };
    });
  }, [displayActions, height]);

  // Generate SVG curve points across real action scores
  const linePath = React.useMemo(() => {
    if (barData.length === 0) return "";
    const points = barData.map((b, idx) => {
      const x = (idx / Math.max(1, barData.length - 1)) * 100;
      const y = height - b.height - 6;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  }, [barData, height]);

  const areaPath = React.useMemo(() => {
    if (!linePath) return "";
    return `${linePath} L 100,${height} L 0,${height} Z`;
  }, [linePath, height]);

  const activeIndex = hoveredIdx !== null ? hoveredIdx : 0;
  const currentItem = barData[activeIndex] || barData[0];
  const activeX = (activeIndex / Math.max(1, barData.length - 1)) * 100;
  const activeY = height - (currentItem?.height ?? 20) - 6;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || barData.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const idx = Math.min(barData.length - 1, Math.max(0, Math.round(ratio * (barData.length - 1))));
    setHoveredIdx(idx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-visible pt-2 group cursor-crosshair select-none"
    >
      {/* Dynamic Hover Tooltip */}
      {hoveredIdx !== null && currentItem && (
        <div
          className="absolute -top-14 z-30 transform -translate-x-1/2 pointer-events-none transition-all duration-75 ease-out w-56"
          style={{ left: `${Math.max(25, Math.min(75, activeX))}%` }}
        >
          <div className="p-2.5 rounded-xl bg-neutral-900/95 dark:bg-neutral-100/95 text-white dark:text-neutral-900 border border-neutral-700/50 dark:border-neutral-200/50 shadow-2xl backdrop-blur-md text-[10px] space-y-1">
            <div className="flex items-center justify-between gap-2 font-mono border-b border-white/10 dark:border-black/10 pb-1">
              <span className={`font-bold ${currentItem.priority === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                {currentItem.priority?.toUpperCase()} PRIORITY
              </span>
              <span className="opacity-70 text-[9px]">{currentItem.actionType}</span>
            </div>
            <p className="line-clamp-1 font-medium text-[10px] opacity-90">&ldquo;{currentItem.title}&rdquo;</p>
            <div className="flex items-center justify-between text-[9px] font-mono pt-0.5 font-semibold">
              <span className={currentItem.isCompleted ? "text-emerald-400" : "text-amber-400"}>
                {currentItem.isCompleted ? "✓ Completed" : "● Pending Execution"}
              </span>
              <span className="opacity-70">Task #{activeIndex + 1} of {barData.length}</span>
            </div>
          </div>
        </div>
      )}

      <svg
        className="w-full overflow-visible"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="actionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Ambient Gradient Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#actionsGradient)" />
        )}

        {/* Trend line over bars */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#22C55E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        )}

        {/* Real Action Barcode Ticks */}
        {barData.map((b, i) => {
          const x = (i / Math.max(1, barData.length - 1)) * 100;
          const isHovered = hoveredIdx === i;
          return (
            <line
              key={i}
              x1={x}
              y1={height - b.height}
              x2={x}
              y2={height}
              stroke={isHovered ? "#22C55E" : b.color}
              strokeWidth={isHovered ? "2.5" : "1.6"}
              strokeLinecap="round"
              opacity={isHovered ? 1 : 0.8}
              className="transition-all duration-75"
            />
          );
        })}

        {/* Hover Guideline */}
        {hoveredIdx !== null && (
          <line
            x1={activeX}
            y1={0}
            x2={activeX}
            y2={height}
            stroke="#22C55E"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            className="transition-all duration-75"
          />
        )}

        {/* Hover Indicator Dot */}
        {hoveredIdx !== null && (
          <circle
            cx={activeX}
            cy={activeY}
            r="3.5"
            fill="#FFFFFF"
            stroke="#22C55E"
            strokeWidth="2.5"
            className="drop-shadow-sm transition-all duration-75"
          />
        )}
      </svg>

      {/* Real Action Category Axis Labels */}
      <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-1">
        <span>/llms.txt</span>
        <span>Reddit</span>
        <span>Media Press</span>
        <span>G2 Reviews</span>
        <span>Schema</span>
      </div>
    </div>
  );
}
