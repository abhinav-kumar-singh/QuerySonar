"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Globe,
} from "lucide-react";
import { SemiCircleGauge } from "@/app/dashboard/components/gauge";
import { useTranslation } from "@/lib/i18n/language-context";

interface FanCardData {
  id: string;
  tag: string;
  title: string;
  copy: string;
  content: React.ReactNode;
}

export function FanCarousel() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibilityTab, setVisibilityTab] = useState(0);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set(["act-1"]));
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const previewTabs = [
    t("landing.fanTabVisibility"),
    t("landing.fanTabSources"),
    t("landing.fanTabActions"),
  ];

  const previewRows = [
    [
      ["Your brand", "Recommended · #2", "72%"],
      ["Alternative A", "Recommended · #1", "91%"],
      ["Alternative B", "Recommended · #3", "54%"],
    ],
    [
      ["Reddit (r/headphones)", "Community megathread", "Cited"],
      ["RTINGS.com Reviews", "Lab benchmark test", "Cited"],
      ["Brand Official Site", "Product specifications", "Cited"],
    ],
    [
      ["Seed comparison on Reddit", "Citation gap", "High"],
      ["Submit acoustic data to RTINGS", "Review coverage", "High"],
      ["Clarify warranty schema on site", "SEO remediation", "Next"],
    ],
  ];

  const cards: FanCardData[] = [
    {
      id: "card-0",
      tag: t("landing.fanCard0Tag"),
      title: t("landing.fanCard0Title"),
      copy: t("landing.fanCard0Copy"),
      content: (
        <div className="space-y-4">
          {/* Internal sub-tabs */}
          <div className="flex gap-2">
            {previewTabs.map((tab, idx) => (
              <button
                key={tab}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibilityTab(idx);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  visibilityTab === idx
                    ? "bg-[var(--syn-btn-pri-bg)] text-[var(--syn-btn-pri-text)] shadow-sm"
                    : "bg-[var(--syn-card-subtle)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] border border-[var(--syn-border)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-2 border-t border-[var(--syn-border-subtle)] pt-3">
            {previewRows[visibilityTab].map(([name, detail, val], i) => (
              <div
                key={name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--syn-card-subtle)] border border-[var(--syn-border-subtle)] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[var(--syn-subtle)] font-bold">
                    0{i + 1}
                  </span>
                  <div>
                    <strong className="text-[var(--syn-heading)] block font-semibold leading-tight">
                      {name}
                    </strong>
                    <span className="text-[10px] text-[var(--syn-subtle)]">{detail}</span>
                  </div>
                </div>
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    i === 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "text-[var(--syn-muted)] bg-[var(--syn-card-inner)]"
                  }`}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "card-1",
      tag: t("landing.fanCard1Tag"),
      title: t("landing.fanCard1Title"),
      copy: t("landing.fanCard1Copy"),
      content: (
        <div className="space-y-2.5">
          {[
            {
              domain: "reddit.com/r/headphones",
              type: "Community Thread",
              badge: "High Impact",
              desc: "14 community posts cited in ChatGPT audio recommendations",
            },
            {
              domain: "rtings.com/reviews",
              type: "Lab Benchmarks",
              badge: "Lab Grounded",
              desc: "Gemini references acoustic measurements and battery lab tests",
            },
            {
              domain: "soundguys.com",
              type: "Product Comparison",
              badge: "Cited",
              desc: "Perplexity synthesizes budget wireless comparison tables",
            },
          ].map((src) => (
            <div
              key={src.domain}
              className="p-3 rounded-2xl bg-[var(--syn-card-subtle)] border border-[var(--syn-border-subtle)] flex flex-col gap-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--syn-heading)] font-mono flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  {src.domain}
                </span>
                <span className="syn-badge syn-badge-emerald text-[10px]">
                  {src.badge}
                </span>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-snug">{src.desc}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "card-2",
      tag: t("landing.fanCard2Tag"),
      title: t("landing.fanCard2Title"),
      copy: t("landing.fanCard2Copy"),
      content: (
        <div className="space-y-2.5">
          {[
            {
              id: "act-1",
              title: "Seed specs in r/headphones buyer threads",
              priority: "High",
              tag: "Community",
            },
            {
              id: "act-2",
              title: "Submit acoustic data to RTINGS queue",
              priority: "High",
              tag: "Review",
            },
            {
              id: "act-3",
              title: "Publish product comparison schema table",
              priority: "Medium",
              tag: "SEO",
            },
            {
              id: "act-4",
              title: "Pitch SoundGuys budget round-up editor",
              priority: "Low",
              tag: "PR",
            },
          ].map((act) => {
            const isDone = completedActions.has(act.id);
            return (
              <div
                key={act.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAction(act.id);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  isDone
                    ? "bg-[var(--syn-card-subtle)]/50 border-[var(--syn-border-subtle)] opacity-50"
                    : "bg-[var(--syn-card-subtle)] border-[var(--syn-border-subtle)] hover:border-[var(--syn-border-hover)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[var(--syn-subtle)] shrink-0" />
                  )}
                  <span
                    className={`font-semibold text-[var(--syn-heading)] ${
                      isDone ? "line-through text-[var(--syn-subtle)]" : ""
                    }`}
                  >
                    {act.title}
                  </span>
                </div>
                <span className="syn-badge syn-badge-neutral text-[10px]">
                  {act.priority}
                </span>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      id: "card-3",
      tag: t("landing.fanCard3Tag"),
      title: t("landing.fanCard3Title"),
      copy: t("landing.fanCard3Copy"),
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--syn-card-subtle)] border border-[var(--syn-border-subtle)]">
            <div>
              <span className="text-xs text-[var(--syn-muted)] block">Overall Consensus</span>
              <strong className="text-2xl font-extrabold font-mono text-[var(--syn-heading)]">
                72,4<small className="text-xs font-bold">%</small>
              </strong>
            </div>
            <div className="-my-2">
              <SemiCircleGauge value={72.4} size={135} strokeWidth={9} color="#22C55E" />
            </div>
          </div>

          <div className="space-y-2">
            {[
              ["Gemini (Google)", 88],
              ["ChatGPT (OpenAI)", 72],
              ["Perplexity AI", 56],
            ].map(([engine, score]) => (
              <div
                key={engine as string}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="font-semibold text-[var(--syn-heading)] w-32 truncate">
                  {engine}
                </span>
                <div className="flex-1 h-2 bg-[var(--syn-card-inner)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-[var(--syn-heading)] w-9 text-right">
                  {score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "card-4",
      tag: t("landing.fanCard4Tag"),
      title: t("landing.fanCard4Title"),
      copy: t("landing.fanCard4Copy"),
      content: (
        <div className="space-y-3">
          {[
            { name: "Competitor Leader", rank: 1, sov: 91, bestFor: "Enterprise Tier", status: "Leader" },
            { name: "Your Brand", rank: 2, sov: 78, bestFor: "Growth & Speed", status: "Target" },
            { name: "Competitor B", rank: 3, sov: 54, bestFor: "Mid-Market", status: "Competitor" },
            { name: "Competitor C", rank: 4, sov: 38, bestFor: "Budget Tier", status: "Competitor" },
          ].map((comp) => (
            <div
              key={comp.name}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                comp.status === "Target"
                  ? "bg-emerald-500/10 border-emerald-500/30 shadow-sm"
                  : "bg-[var(--syn-card-subtle)] border-[var(--syn-border-subtle)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--syn-border-hover)] flex items-center justify-center font-bold text-[10px] text-[var(--syn-heading)] font-mono">
                  #{comp.rank}
                </span>
                <div>
                  <strong className="text-[var(--syn-heading)] block font-semibold leading-tight">
                    {comp.name}
                  </strong>
                  <span className="text-[10px] text-[var(--syn-subtle)]">{comp.bestFor}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[var(--syn-heading)]">{comp.sov}%</span>
                {comp.status === "Target" ? (
                  <span className="syn-badge syn-badge-emerald text-[9px]">You</span>
                ) : (
                  <span className="syn-badge syn-badge-neutral text-[9px]">{comp.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const prevCard = () => {
    setActiveIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const nextCard = () => {
    setActiveIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* ── Fan Carousel Top Pill Navigation ─────────────────────────── */}
      <div className="flex items-center justify-between w-full max-w-4xl flex-wrap gap-4 px-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeIndex === idx
                  ? "bg-[var(--syn-btn-pri-bg)] text-[var(--syn-btn-pri-text)] shadow-sm"
                  : "bg-[var(--syn-card)] text-[var(--syn-muted)] hover:bg-[var(--syn-card-subtle)] hover:text-[var(--syn-heading)] border border-[var(--syn-border)]"
              }`}
            >
              0{idx + 1} {card.tag.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Previous / Next Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevCard}
            aria-label="Previous card"
            className="w-9 h-9 rounded-full bg-[var(--syn-card)] hover:bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] flex items-center justify-center text-[var(--syn-heading)] shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextCard}
            aria-label="Next card"
            className="w-9 h-9 rounded-full bg-[var(--syn-card)] hover:bg-[var(--syn-card-subtle)] border border-[var(--syn-border)] flex items-center justify-center text-[var(--syn-heading)] shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── The 3D Fan Carousel Stage ────────────────────────────────── */}
      <div
        className="relative w-full max-w-5xl h-[560px] flex items-center justify-center overflow-visible select-none px-4"
        style={{ perspective: "1200px" }}
      >
        {cards.map((card, idx) => {
          let offset = idx - activeIndex;
          const half = Math.floor(cards.length / 2);
          if (offset > half) offset -= cards.length;
          if (offset < -half) offset += cards.length;

          const isActive = offset === 0;

          // Responsive fan spacing: tighter on mobile devices
          const spread = isMobile ? 32 : 180;
          const translateX = offset * spread;
          const translateY = isMobile ? Math.abs(offset) * 8 : Math.abs(offset) * 14;
          const rotateZ = isMobile ? offset * 2.5 : offset * 4.5;
          const scale = isActive ? 1.04 : 1 - Math.abs(offset) * 0.05;
          const zIndex = 30 - Math.abs(offset) * 5;
          const opacity = isActive ? 1 : isMobile ? (Math.abs(offset) === 1 ? 0.45 : 0) : 1 - Math.abs(offset) * 0.18;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (!isActive) setActiveIndex(idx);
              }}
              style={{
                transform: `translateX(${translateX}px) translateY(${isActive ? translateY - 18 : translateY}px) rotateZ(${rotateZ}deg) scale(${scale})`,
                zIndex,
                opacity,
              }}
              className={`absolute w-[440px] max-w-[90vw] rounded-[28px] bg-[var(--syn-card)] border p-7 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive
                  ? "border-[#22C55E] shadow-[0_24px_48px_-12px_rgba(34,197,94,0.22),0_10px_24px_-4px_rgba(0,0,0,0.3)] cursor-default ring-1 ring-[#22C55E]"
                  : "border-[var(--syn-border)] shadow-[var(--syn-card-shadow)] hover:border-[var(--syn-border-hover)] cursor-pointer"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border-subtle)] mb-4">
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-500 uppercase">
                  {card.tag}
                </span>
                <span className="text-[10px] font-mono font-semibold text-[var(--syn-subtle)]">
                  CARD 0{idx + 1}
                </span>
              </div>

              {/* Title & Copy */}
              <h3 className="text-xl font-extrabold tracking-tight text-[var(--syn-heading)] mb-2 leading-tight">
                {card.title}
              </h3>
              <p className="text-xs text-[var(--syn-muted)] leading-relaxed mb-5">
                {card.copy}
              </p>

              {/* Card Specific Rich Content */}
              <div className="min-h-[220px]">
                {card.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Pagination Indicators ─────────────────────────────── */}
      <div className="flex items-center gap-2">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setActiveIndex(idx)}
            aria-label={`Jump to ${card.tag}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeIndex === idx
                ? "w-8 bg-emerald-500 shadow-sm"
                : "w-2 bg-[var(--syn-border-hover)] hover:bg-[var(--syn-muted)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
