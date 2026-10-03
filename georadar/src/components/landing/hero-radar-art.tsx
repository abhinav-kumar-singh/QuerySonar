"use client";

import React from "react";
import {
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Compass,
  Zap,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   1. HeroRadarAtmosphere — Full-bleed Precision Radar Grid & Sweep
   ═══════════════════════════════════════════════════════════════════════ */

export function HeroRadarAtmosphere() {
  return (
    <div
      className="hero-radar-atmosphere pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── Soft Ambient Glow Orbs ────────────────────────────────────── */}
      <div className="absolute top-[8%] right-[8%] w-[720px] h-[720px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.14)_0%,rgba(134,239,172,0.06)_45%,transparent_70%)] blur-2xl" />
      <div className="absolute top-[35%] left-[5%] w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.07)_0%,transparent_65%)] blur-3xl" />

      {/* ── Precision Telemetry Watermark Corner Stamps ─────────────────── */}
      <div className="v2-wrap h-full relative">
        <div className="absolute top-6 left-8 flex items-center gap-3 font-mono text-[10px] tracking-widest text-[var(--syn-subtle)] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>RADAR.SYS // GLOBAL AI SEARCH SURVEILLANCE</span>
          <span className="text-[var(--syn-border-hover)]">|</span>
          <span className="text-emerald-500 font-bold">LOCK 3/3 ENGINES</span>
        </div>

        <div className="absolute top-6 right-8 hidden lg:flex items-center gap-4 font-mono text-[10px] tracking-widest text-[var(--syn-subtle)] uppercase">
          <span>FREQ: 1420.405 MHz</span>
          <span className="text-[var(--syn-border-hover)]">|</span>
          <span>LAT 37°46&apos;N LON 122°25&apos;W</span>
          <span className="text-[var(--syn-border-hover)]">|</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-semibold border border-emerald-500/20">
            LIVE TELEMETRY
          </span>
        </div>

        <div className="absolute bottom-8 left-8 hidden md:flex items-center gap-3 font-mono text-[10px] tracking-widest text-[var(--syn-subtle)] uppercase">
          <span>SWEEP: 0.12 Hz</span>
          <span className="text-[var(--syn-border-hover)]">·</span>
          <span>CITATIONS PARSED: 48,920+</span>
          <span className="text-[var(--syn-border-hover)]">·</span>
          <span>SAMPLING INTERVAL: &lt;30s</span>
        </div>

        <div className="absolute bottom-8 right-8 hidden md:flex items-center gap-3 font-mono text-[10px] tracking-widest text-[var(--syn-subtle)] uppercase">
          <span>CONSENSUS PROTOCOL: ACTIVE</span>
          <span className="text-[var(--syn-border-hover)]">·</span>
          <span>SIGNAL GAIN: +14.2 dB</span>
        </div>
      </div>

      {/* ── Polar Radar Concentric SVG Grid ───────────────────────────── */}
      {/* Positioned centered behind the right console */}
      <div className="absolute top-1/2 right-[10%] -translate-y-1/2 translate-x-[20%] w-[1200px] h-[1200px] opacity-75">
        <svg
          viewBox="0 0 1200 1200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Boundary Ring */}
          <circle
            cx="600"
            cy="600"
            r="590"
            stroke="var(--syn-radar-ring, rgba(0,0,0,0.04))"
            strokeWidth="1"
          />

          {/* Compass Degree Tick Ring */}
          <circle
            cx="600"
            cy="600"
            r="520"
            stroke="var(--syn-radar-ring-tick, rgba(0,0,0,0.06))"
            strokeWidth="1.2"
            strokeDasharray="3 9"
          />

          {/* Range Distance Rings */}
          <circle
            cx="600"
            cy="600"
            r="420"
            stroke="var(--syn-radar-ring, rgba(0,0,0,0.05))"
            strokeWidth="1"
          />
          <circle
            cx="600"
            cy="600"
            r="310"
            stroke="rgba(34,197,94,0.18)"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
          <circle
            cx="600"
            cy="600"
            r="210"
            stroke="var(--syn-radar-ring, rgba(0,0,0,0.06))"
            strokeWidth="1"
          />
          <circle
            cx="600"
            cy="600"
            r="110"
            stroke="rgba(34,197,94,0.25)"
            strokeWidth="1.5"
          />

          {/* Polar Spokes / Angle Rays */}
          <line
            x1="600"
            y1="10"
            x2="600"
            y2="1190"
            stroke="var(--syn-radar-ring, rgba(0,0,0,0.04))"
            strokeWidth="1"
          />
          <line
            x1="10"
            y1="600"
            x2="1190"
            y2="600"
            stroke="var(--syn-radar-ring, rgba(0,0,0,0.04))"
            strokeWidth="1"
          />
          <line
            x1="183"
            y1="183"
            x2="1017"
            y2="1017"
            stroke="var(--syn-radar-ring, rgba(0,0,0,0.03))"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <line
            x1="183"
            y1="1017"
            x2="1017"
            y2="183"
            stroke="var(--syn-radar-ring, rgba(0,0,0,0.03))"
            strokeWidth="1"
            strokeDasharray="4 8"
          />

          {/* Cardinal Labels */}
          <text
            x="600"
            y="65"
            textAnchor="middle"
            fill="var(--syn-muted)"
            opacity="0.6"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            000° // NORTH
          </text>
          <text
            x="1140"
            y="604"
            textAnchor="end"
            fill="var(--syn-muted)"
            opacity="0.6"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            090° // EAST
          </text>
          <text
            x="600"
            y="1155"
            textAnchor="middle"
            fill="var(--syn-muted)"
            opacity="0.6"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            180° // SOUTH
          </text>
          <text
            x="60"
            y="604"
            textAnchor="start"
            fill="var(--syn-muted)"
            opacity="0.6"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            270° // WEST
          </text>

          {/* Degree Markers */}
          <text
            x="960"
            y="260"
            fill="rgba(34,197,94,0.5)"
            fontSize="9"
            fontFamily="monospace"
          >
            045° RAD
          </text>
          <text
            x="240"
            y="260"
            fill="rgba(34,197,94,0.5)"
            fontSize="9"
            fontFamily="monospace"
          >
            315° RAD
          </text>

          {/* Radar Blip Targets on Grid */}
          <g>
            <circle cx="780" cy="420" r="4" fill="#22C55E" />
            <circle
              cx="780"
              cy="420"
              r="12"
              stroke="#22C55E"
              strokeWidth="1"
              opacity="0.4"
              className="animate-ping"
            />
          </g>

          <g>
            <circle cx="390" cy="680" r="3.5" fill="#4ADE80" />
            <circle
              cx="390"
              cy="680"
              r="10"
              stroke="#4ADE80"
              strokeWidth="1"
              opacity="0.35"
              className="animate-ping"
            />
          </g>

          <g>
            <circle cx="850" cy="740" r="4" fill="#10B981" />
          </g>
        </svg>

        {/* ── Rotating Radar Sweep Cone ──────────────────────────────── */}
        <div className="radar-sweep-cone absolute inset-0 rounded-full" />
      </div>

      {/* ── Precision Matrix Grid Dots in Background ─────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(var(--syn-radar-grid-dot, rgba(0, 0, 0, 0.9)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: "var(--syn-radar-grid-opacity, 0.035)",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   2. HeroRadarOrb — The 3D Breakout Centerpiece
   ═══════════════════════════════════════════════════════════════════════ */

export function HeroRadarOrb() {
  return (
    <div
      className="hero-radar-orb-container pointer-events-none absolute -top-12 -right-6 sm:-top-16 sm:-right-12 md:-top-20 md:-right-16 w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] md:w-[560px] md:h-[560px] select-none"
      style={{ perspective: "1000px" }}
      aria-hidden="true"
    >
      {/* ── Outer Dimensional Aura Glow ───────────────────────────────── */}
      <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle_at_center,rgba(134,239,172,0.3)_0%,rgba(34,197,94,0.15)_40%,transparent_72%)] blur-xl" />

      {/* ── 3D Orbital Ring 1 (Tilted Primary) ───────────────────────── */}
      <div
        className="orbital-ring-1 absolute inset-4 rounded-full border border-emerald-400/40"
        style={{
          transform: "rotateX(68deg) rotateY(-18deg) rotateZ(24deg)",
          boxShadow: "0 0 35px rgba(34, 197, 94, 0.25), inset 0 0 25px rgba(134, 239, 172, 0.15)",
        }}
      >
        {/* Orbital Satellite Node: Gemini */}
        <div className="satellite-node sat-gemini absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--syn-beacon-bg)] border border-emerald-400/80 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[9px] font-bold text-[var(--syn-heading)] tracking-wider">
            GEMINI-NODE
          </span>
        </div>
      </div>

      {/* ── 3D Orbital Ring 2 (Tilted Secondary / Counter) ───────────── */}
      <div
        className="orbital-ring-2 absolute inset-12 rounded-full border border-emerald-500/30 border-dashed"
        style={{
          transform: "rotateX(-58deg) rotateY(22deg) rotateZ(-36deg)",
        }}
      >
        {/* Orbital Satellite Node: ChatGPT */}
        <div className="satellite-node sat-chatgpt absolute -bottom-2 right-1/4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--syn-beacon-bg)] border border-emerald-300/80 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-mono text-[9px] font-bold text-[var(--syn-heading)] tracking-wider">
            GPT-4o
          </span>
        </div>
      </div>

      {/* ── 3D Orbital Ring 3 (Equatorial Sweep) ─────────────────────── */}
      <div
        className="orbital-ring-3 absolute inset-20 rounded-full border border-emerald-400/20"
        style={{
          transform: "rotateX(78deg) rotateZ(0deg)",
        }}
      >
        {/* Orbital Satellite Node: Perplexity */}
        <div className="satellite-node sat-perp absolute top-1/2 -right-2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--syn-beacon-bg)] border border-emerald-300/80 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-[9px] font-bold text-[var(--syn-heading)] tracking-wider">
            PERP-AI
          </span>
        </div>
      </div>

      {/* ── Central Celestial Radar Sphere ───────────────────────────── */}
      <div className="absolute inset-24 sm:inset-28 rounded-full bg-gradient-to-br from-emerald-500/10 via-[var(--syn-card)] to-emerald-500/20 border border-emerald-400/30 shadow-[0_16px_40px_-8px_rgba(34,197,94,0.3),inset_0_2px_12px_rgba(255,255,255,0.2)] overflow-hidden">
        {/* Sphere Lat/Long Wireframe Lines */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full opacity-35"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Latitude Ellipses */}
          <ellipse cx="100" cy="100" rx="98" ry="40" stroke="#059669" strokeWidth="1.2" />
          <ellipse cx="100" cy="100" rx="98" ry="75" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
          <ellipse cx="100" cy="100" rx="98" ry="18" stroke="#059669" strokeWidth="1" />
          {/* Longitude Ellipses */}
          <ellipse cx="100" cy="100" rx="40" ry="98" stroke="#059669" strokeWidth="1.2" />
          <ellipse cx="100" cy="100" rx="75" ry="98" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="100" y1="2" x2="100" y2="198" stroke="#059669" strokeWidth="1.5" />
          <line x1="2" y1="100" x2="198" y2="100" stroke="#059669" strokeWidth="1.5" />
        </svg>

        {/* Sphere Glowing Core */}
        <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle_at_35%_35%,#86EFAC_0%,#22C55E_50%,rgba(5,150,105,0.4)_85%,transparent_100%)] opacity-85 blur-[2px]" />

        {/* Animated Sonar Pulse Ring from Core */}
        <div className="absolute inset-0 rounded-full border-2 border-white/80 animate-ping opacity-30" />
      </div>

      {/* ── Holographic Breakout Crest — "Getting Outside" ───────────── */}
      {/* Top crest breaking out high above the console */}
      <div className="absolute top-2 right-12 md:right-16 flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--syn-beacon-bg)] border border-emerald-400/80 shadow-[0_8px_20px_rgba(34,197,94,0.18)]">
        <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin" style={{ animationDuration: "16s" }} />
        <span className="font-mono text-[10px] font-extrabold tracking-wider text-[var(--syn-heading)] uppercase">
          AI GEO RADAR // ACTIVE
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3. HeroRadarBeacons — Floating Citation Nodes "Getting Outside"
   ═══════════════════════════════════════════════════════════════════════ */

export function HeroRadarBeacons() {
  return (
    <div className="hero-beacons-layer pointer-events-none absolute inset-0 z-20">
      {/* ── Beacon 1: Gemini Citation (Top Right, Breaking Outside) ─ */}
      <div className="hero-beacon beacon-tr pointer-events-auto absolute -top-8 right-0 md:-top-12 md:-right-8 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[var(--syn-beacon-bg)] backdrop-blur-md border border-emerald-400/70 shadow-[0_12px_28px_-6px_rgba(34,197,94,0.22),0_4px_12px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 hover:scale-105 cursor-pointer group">
        <div className="w-6 h-6 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <strong className="text-xs font-bold text-[var(--syn-heading)] leading-tight">
              Gemini cited Brand #1
            </strong>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold">
              94% SOV
            </span>
          </div>
          <span className="text-[10px] text-[var(--syn-muted)] block leading-tight">
            Prompt: &ldquo;best cloud optimization tool&rdquo;
          </span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
      </div>

      {/* ── Beacon 2: Reddit Thread Citation (Far Right, Breaking Outside) */}
      <div className="hero-beacon beacon-mr pointer-events-auto absolute top-[44%] -right-4 sm:-right-8 md:-right-20 hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[var(--syn-beacon-bg)] backdrop-blur-md border border-[var(--syn-beacon-border)] shadow-[0_12px_28px_-6px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 hover:scale-105 cursor-pointer group">
        <div className="w-6 h-6 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-500 font-bold text-xs">
          <MessageSquare className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
        </div>
        <div className="text-left">
          <strong className="text-xs font-bold text-[var(--syn-heading)] block leading-tight">
            r/headphones thread
          </strong>
          <span className="text-[10px] text-[var(--syn-muted)] leading-tight">
            14 community citations indexed
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[9px] font-mono font-semibold border border-orange-500/20">
          Source
        </span>
      </div>

      {/* ── Beacon 3: RTINGS Lab Benchmark (Bottom Right, Breaking Outside) */}
      <div className="hero-beacon beacon-br pointer-events-auto absolute -bottom-6 right-4 md:-bottom-10 md:right-4 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[var(--syn-beacon-bg)] backdrop-blur-md border border-[var(--syn-beacon-border)] shadow-[0_12px_28px_-6px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 hover:scale-105 cursor-pointer group">
        <div className="w-6 h-6 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500 font-bold text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <strong className="text-xs font-bold text-[var(--syn-heading)] leading-tight">
              RTINGS Acoustic Bench
            </strong>
            <span className="px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[9px] font-mono font-bold">
              Lab Grounded
            </span>
          </div>
          <span className="text-[10px] text-[var(--syn-muted)] block leading-tight">
            Frequency response curve cited
          </span>
        </div>
      </div>

      {/* ── Beacon 4: Action Playbook Ready (Top-Left of console) ─────── */}
      <div className="hero-beacon beacon-tl pointer-events-auto absolute top-6 -left-4 sm:top-8 sm:-left-12 md:-left-16 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--syn-beacon-bg)] backdrop-blur-md border border-[var(--syn-beacon-border)] shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-0.5 cursor-pointer">
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span className="text-xs font-semibold text-[var(--syn-heading)]">
          Action playbook ready
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </div>
  );
}
