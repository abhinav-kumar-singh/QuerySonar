"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Sparkles, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { SemiCircleGauge } from "@/app/dashboard/components/gauge";
import { HeroRadarOrb, HeroRadarBeacons } from "./hero-radar-art";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    },
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    () => false
  );
}

/* ──────────────────────────────────────────────────────────────────────
   1. RevealOnScroll — Intersection Observer wrapper
   ────────────────────────────────────────────────────────────────────── */

export function RevealOnScroll({
  children,
  className = "",
  index = 0,
  threshold = 0.15,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  index?: number;
  threshold?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, prefersReduced]);

  const isRevealed = inView || prefersReduced;

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal ${isRevealed ? "in-view" : ""} ${className}`}
      style={{ "--i": index } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   2. CountUp — Animated number counter
   ────────────────────────────────────────────────────────────────────── */

export function CountUp({
  end,
  duration = 1500,
  prefix = "",
  suffix = "",
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          observer.unobserve(el);
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * end);
            setCount(current);
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, prefersReduced]);

  const display = prefersReduced
    ? end.toLocaleString()
    : count.toLocaleString();

  return (
    <span ref={ref} className="countup-value font-mono">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   3. GlassCard / SynCard wrapper
   ────────────────────────────────────────────────────────────────────── */

export function GlassCard({
  children,
  className = "",
  span = 1,
}: {
  children: ReactNode;
  className?: string;
  span?: 1 | 2;
}) {
  return (
    <div
      className={`syn-card ${span === 2 ? "syn-card-wide" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   4. BentoGrid container
   ────────────────────────────────────────────────────────────────────── */

export function BentoGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`bento-grid ${className}`}>{children}</div>;
}

import { useTranslation } from "@/lib/i18n/language-context";

export function HeroDashboard() {
  const { t } = useTranslation();

  return (
    <div
      className="hero-dashboard-scene relative"
      aria-label="Illustrative visibility report, not live data"
    >
      {/* 3D Holographic AI Radar Orb Centerpiece breaking out behind the card */}
      <HeroRadarOrb />

      {/* Floating Interactive Citation Beacons breaking out into space */}
      <HeroRadarBeacons />

      {/* Main dashboard card */}
      <div className="hero-dashboard syn-card !p-6 shadow-2xl relative z-10 backdrop-blur-md">
        <div className="dash-top flex items-center justify-between pb-3 border-b border-[var(--syn-border)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#86EFAC] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-neutral-950 fill-neutral-950" />
            </div>
            <span className="text-xs font-bold tracking-tight text-[var(--syn-heading)] font-mono uppercase">
              QuerySonar Intelligence
            </span>
          </div>
          <span className="dash-label text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] px-2.5 py-1 rounded-full">
            LIVE SAMPLE AUDIT
          </span>
        </div>

        <div className="dash-body py-4">
          <p className="text-[10px] font-mono tracking-wider uppercase text-[var(--syn-subtle)] mb-1">
            {t("landing.radarOrbLabel")}
          </p>
          <p className="text-sm font-semibold text-[var(--syn-heading)] mb-4">
            &ldquo;{t("landing.sampleQuestion")}&rdquo;
          </p>

          <div className="flex items-center justify-between py-2 border-b border-[var(--syn-border-subtle)] mb-4">
            <div>
              <span className="text-xs text-[var(--syn-muted)] block">{t("landing.scoreLabel")}</span>
              <strong className="text-2xl font-extrabold text-[var(--syn-heading)] font-mono">
                72,4<small className="text-sm font-bold">%</small>
              </strong>
            </div>
            <div className="-my-2">
              <SemiCircleGauge value={72.4} size={150} strokeWidth={10} color="#22C55E" />
            </div>
          </div>

          {[
            ["Gemini (Google)", 88],
            ["ChatGPT (OpenAI)", 72],
            ["Claude (Anthropic)", 68],
            ["DeepSeek (V3)", 64],
            ["Perplexity AI", 56],
            ["Grok (xAI)", 52],
          ].map(([engine, score]) => (
            <div className="flex items-center justify-between gap-3 text-xs mb-1.5" key={engine as string}>
              <span className="font-semibold text-[var(--syn-heading)] w-36 truncate text-[11px]">{engine}</span>
              <div className="flex-1 h-1.5 bg-[var(--syn-card-subtle)] border border-[var(--syn-border-subtle)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="font-mono font-bold text-[var(--syn-heading)] w-10 text-right text-[11px]">{score}%</span>
            </div>
          ))}
        </div>

        <div className="dash-action pt-3 border-t border-[var(--syn-border)] flex items-center justify-between text-xs text-[var(--syn-muted)]">
          <span className="flex items-center gap-1.5 text-[var(--syn-heading)] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {t("landing.verifiedConsensus")}
          </span>
          <ArrowUpRight className="w-4 h-4 text-[var(--syn-subtle)]" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   6. NoiseOverlay
   ────────────────────────────────────────────────────────────────────── */

export function NoiseOverlay() {
  return null; // Noise disabled in Synetica clean light theme for pristine sharpness
}
