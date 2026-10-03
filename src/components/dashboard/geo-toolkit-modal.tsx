"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  FileCode2,
  Swords,
  CodeXml,
  MessageSquare,
  BookOpen,
  Copy,
  Check,
  Download,
  Loader2,
  X,
  ExternalLink,
  Target,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Globe,
  RefreshCw,
  ChevronDown,
  Lightbulb,
  Layers,
  Terminal,
  HelpCircle,
  Compass,
  Code,
  ShieldCheck,
} from "lucide-react";
import { useAuditData } from "@/lib/audit-storage";
import { useLanguage } from "@/lib/i18n/language-context";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

export type GeoToolType = "llmstxt" | "displacement" | "schema" | "community" | "blueprint";

interface ToolDeploymentGuideProps {
  tool: GeoToolType;
  brandName: string;
  websiteUrl: string;
  category: string;
  targetLocation: string;
  competitorName?: string;
  onClose?: () => void;
}

function ToolDeploymentGuide({
  tool,
  brandName,
  websiteUrl,
  category,
  targetLocation,
  competitorName,
  onClose,
}: ToolDeploymentGuideProps) {
  const { t } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("nextjs");
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const cleanUrl = websiteUrl.replace(/\/$/, "");

  if (tool === "llmstxt") {
    const platforms = [
      {
        id: "nextjs",
        name: "Next.js / React",
        instructions: `Save the file directly in the public/ folder of your Next.js project. Next.js automatically serves public/ files from the domain root.`,
        code: `// Place files in your project root:
my-nextjs-app/
├── public/
│   ├── llms.txt        <-- Standard summary
│   └── llms-full.txt   <-- Comprehensive docs
└── src/`,
      },
      {
        id: "wordpress",
        name: "WordPress",
        instructions: `Upload llms.txt to your server's public_html/ root via SFTP or File Manager. Alternatively, use a Redirection plugin to map /llms.txt to your uploaded media file.`,
        code: `# In your .htaccess or Nginx configuration:
RewriteEngine On
RewriteRule ^llms\\.txt$ /wp-content/uploads/llms.txt [L]`,
      },
      {
        id: "shopify",
        name: "Shopify / Webflow",
        instructions: `1. Upload llms.txt to Settings > Files (Shopify) or Assets (Webflow).\n2. Create a URL Redirect from /llms.txt to the CDN file URL. AI bots follow 301 redirects seamlessly.`,
        code: `Redirect Path: /llms.txt
Target URL:    https://cdn.shopify.com/s/files/.../llms.txt`,
      },
      {
        id: "nginx",
        name: "Nginx / Vercel / Netlify",
        instructions: `Ensure the server responds with Content-Type: text/markdown or text/plain.`,
        code: `# Nginx location block:
location = /llms.txt {
    add_header Content-Type "text/markdown; charset=utf-8";
    alias /var/www/html/llms.txt;
}`,
      },
    ];

    const currentPlat = platforms.find((p) => p.id === selectedPlatform) || platforms[0];

    return (
      <div className="rounded-2xl bg-[var(--syn-card-subtle)] border-2 border-emerald-500/30 p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--syn-border)] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                {t("geoToolkit.actionDeploymentGuide")}
              </span>
              <span className="text-[11px] font-mono text-[var(--syn-muted)]">llmstxt.org Standard</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--syn-heading)]">
              {t("geoToolkit.llmstxtGuideTitle")}
            </h4>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Why it matters */}
        <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-[var(--syn-text)] space-y-1">
          <strong className="text-emerald-400 font-bold block flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t("geoToolkit.whyItMatters")}
          </strong>
          <p className="leading-relaxed text-[var(--syn-muted)]">
            {t("geoToolkit.llmstxtWhyMatters", { url: cleanUrl })}
          </p>
        </div>

        {/* 3-Step Action Plan */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block">
            {t("geoToolkit.threeStepPlaybook")}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  1
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.llmstxtStep1Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.llmstxtStep1Desc")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  2
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.llmstxtStep2Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.llmstxtStep2Desc", { url: cleanUrl })}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  3
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.llmstxtStep3Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.llmstxtStep3Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Platform Deployment Snippets */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold">
              {t("geoToolkit.platformSpecificInstructions")}
            </span>
            <div className="flex items-center gap-1 overflow-x-auto">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedPlatform === p.id
                      ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40"
                      : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)] bg-[var(--syn-card)]"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-2">
            <p className="text-xs text-[var(--syn-text)] font-medium leading-relaxed">{currentPlat.instructions}</p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] font-mono text-[11px] text-[var(--syn-muted)] overflow-x-auto select-text">
                {currentPlat.code}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(currentPlat.code)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-[var(--syn-card)] border border-[var(--syn-border)] hover:border-emerald-500/40 text-[10px] font-semibold text-[var(--syn-heading)] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? t("geoToolkit.copied") : t("geoToolkit.copy")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expected Outcome */}
        <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15 flex items-start gap-2.5 text-xs text-[var(--syn-text)]">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--syn-heading)] font-semibold block">{t("geoToolkit.expectedResult")}</strong>
            <span className="text-[var(--syn-muted)] text-[11px]">
              {t("geoToolkit.llmstxtExpectedOutcome", { brand: brandName })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (tool === "displacement") {
    return (
      <div className="rounded-2xl bg-[var(--syn-card-subtle)] border-2 border-red-500/30 p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--syn-border)] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-mono font-bold border border-red-500/30 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                {t("geoToolkit.actionCounterplayGuide")}
              </span>
              <span className="text-[11px] font-mono text-[var(--syn-muted)]">Adversarial GEO</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--syn-heading)]">
              {t("geoToolkit.displacementGuideTitle")}
            </h4>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Why it matters */}
        <div className="p-3.5 rounded-xl bg-red-500/[0.06] border border-red-500/20 text-xs text-[var(--syn-text)] space-y-1">
          <strong className="text-red-400 font-bold block flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5" />
            {t("geoToolkit.whyItMatters")}
          </strong>
          <p className="leading-relaxed text-[var(--syn-muted)]">
            {t("geoToolkit.displacementWhyMatters", { competitor: competitorName || "competitors" })}
          </p>
        </div>

        {/* 3-Step Action Plan */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block">
            {t("geoToolkit.threeStepPlaybook")}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  1
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.displacementStep1Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.displacementStep1Desc")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  2
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.displacementStep2Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.displacementStep2Desc", { brand: brandName, competitor: competitorName || "Competitor" })}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  3
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.displacementStep3Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.displacementStep3Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Expected Outcome */}
        <div className="p-3 rounded-xl bg-red-500/[0.04] border border-red-500/15 flex items-start gap-2.5 text-xs text-[var(--syn-text)]">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--syn-heading)] font-semibold block">{t("geoToolkit.expectedResult")}</strong>
            <span className="text-[var(--syn-muted)] text-[11px]">
              {t("geoToolkit.displacementExpectedOutcome", { brand: brandName })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (tool === "schema") {
    const platforms = [
      {
        id: "nextjs",
        name: "Next.js (App Router)",
        instructions: `Add the JSON-LD script inside your app/layout.tsx file inside the <head> tag or using Next.js Script component.`,
        code: `// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaObject) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`,
      },
      {
        id: "wordpress",
        name: "WordPress",
        instructions: `Paste the complete <script> block into Appearance > Theme File Editor > header.php inside <head>, or use the 'WPCode / Insert Headers and Footers' plugin.`,
        code: `<!-- Paste inside <head> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [ ... ]
}
</script>`,
      },
      {
        id: "shopify",
        name: "Shopify / Webflow",
        instructions: `Shopify: Online Store > Themes > Edit Code > layout/theme.liquid (paste inside <head>).\nWebflow: Project Settings > Custom Code > Head Code.`,
        code: `<!-- Custom Head Code Injection -->
<script type="application/ld+json">
  { ... }
</script>`,
      },
    ];

    const currentPlat = platforms.find((p) => p.id === selectedPlatform) || platforms[0];

    return (
      <div className="rounded-2xl bg-[var(--syn-card-subtle)] border-2 border-sky-500/30 p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--syn-border)] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 text-[10px] font-mono font-bold border border-sky-500/30 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                {t("geoToolkit.actionIntegrationGuide")}
              </span>
              <span className="text-[11px] font-mono text-[var(--syn-muted)]">Schema.org & Wikidata</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--syn-heading)]">
              {t("geoToolkit.schemaGuideTitle")}
            </h4>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Why it matters */}
        <div className="p-3.5 rounded-xl bg-sky-500/[0.06] border border-sky-500/20 text-xs text-[var(--syn-text)] space-y-1">
          <strong className="text-sky-400 font-bold block flex items-center gap-1.5">
            <CodeXml className="w-3.5 h-3.5" />
            {t("geoToolkit.whyItMatters")}
          </strong>
          <p className="leading-relaxed text-[var(--syn-muted)]">
            {t("geoToolkit.schemaWhyMatters")}
          </p>
        </div>

        {/* 3-Step Action Plan */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block">
            {t("geoToolkit.threeStepPlaybook")}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  1
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.schemaStep1Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.schemaStep1Desc")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  2
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.schemaStep2Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.schemaStep2Desc")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  3
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.schemaStep3Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.schemaStep3Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold">
              {t("geoToolkit.platformIntegrationSnippets")}
            </span>
            <div className="flex items-center gap-1 overflow-x-auto">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedPlatform === p.id
                      ? "bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40"
                      : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)] bg-[var(--syn-card)]"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-2">
            <p className="text-xs text-[var(--syn-text)] font-medium leading-relaxed">{currentPlat.instructions}</p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] font-mono text-[11px] text-[var(--syn-muted)] overflow-x-auto select-text">
                {currentPlat.code}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(currentPlat.code)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-[var(--syn-card)] border border-[var(--syn-border)] hover:border-sky-500/40 text-[10px] font-semibold text-[var(--syn-heading)] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? t("geoToolkit.copied") : t("geoToolkit.copy")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expected Outcome */}
        <div className="p-3 rounded-xl bg-sky-500/[0.04] border border-sky-500/15 flex items-start gap-2.5 text-xs text-[var(--syn-text)]">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--syn-heading)] font-semibold block">{t("geoToolkit.expectedResult")}</strong>
            <span className="text-[var(--syn-muted)] text-[11px]">
              {t("geoToolkit.schemaExpectedOutcome", { brand: brandName })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (tool === "community") {
    return (
      <div className="rounded-2xl bg-[var(--syn-card-subtle)] border-2 border-amber-500/30 p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--syn-border)] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                {t("geoToolkit.actionCommunityGuide")}
              </span>
              <span className="text-[11px] font-mono text-[var(--syn-muted)]">Reddit & Forum Seeding</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--syn-heading)]">
              {t("geoToolkit.communityGuideTitle")}
            </h4>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Why it matters */}
        <div className="p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-xs text-[var(--syn-text)] space-y-1">
          <strong className="text-amber-400 font-bold block flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            {t("geoToolkit.whyItMatters")}
          </strong>
          <p className="leading-relaxed text-[var(--syn-muted)]">
            {t("geoToolkit.communityWhyMatters")}
          </p>
        </div>

        {/* 3-Step Action Plan */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block">
            {t("geoToolkit.threeStepPlaybook")}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  1
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.communityStep1Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.communityStep1Desc")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  2
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.communityStep2Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.communityStep2Desc")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  3
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.communityStep3Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.communityStep3Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Expected Outcome */}
        <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 flex items-start gap-2.5 text-xs text-[var(--syn-text)]">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--syn-heading)] font-semibold block">{t("geoToolkit.expectedResult")}</strong>
            <span className="text-[var(--syn-muted)] text-[11px]">
              {t("geoToolkit.communityExpectedOutcome", { brand: brandName })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (tool === "blueprint") {
    return (
      <div className="rounded-2xl bg-[var(--syn-card-subtle)] border-2 border-purple-500/30 p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--syn-border)] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-mono font-bold border border-purple-500/30 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                {t("geoToolkit.actionPublishingGuide")}
              </span>
              <span className="text-[11px] font-mono text-[var(--syn-muted)]">RAG Content Architecture</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--syn-heading)]">
              {t("geoToolkit.blueprintGuideTitle")}
            </h4>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Why it matters */}
        <div className="p-3.5 rounded-xl bg-purple-500/[0.06] border border-purple-500/20 text-xs text-[var(--syn-text)] space-y-1">
          <strong className="text-purple-400 font-bold block flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {t("geoToolkit.whyItMatters")}
          </strong>
          <p className="leading-relaxed text-[var(--syn-muted)]">
            {t("geoToolkit.blueprintWhyMatters", { category, location: targetLocation })}
          </p>
        </div>

        {/* 3-Step Action Plan */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block">
            {t("geoToolkit.threeStepPlaybook")}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  1
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.blueprintStep1Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.blueprintStep1Desc")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  2
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.blueprintStep2Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.blueprintStep2Desc", { url: cleanUrl, categorySlug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px] flex items-center justify-center">
                  3
                </span>
                <strong className="text-xs text-[var(--syn-heading)] font-semibold">{t("geoToolkit.blueprintStep3Title")}</strong>
              </div>
              <p className="text-[11px] text-[var(--syn-muted)] leading-relaxed">
                {t("geoToolkit.blueprintStep3Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Expected Outcome */}
        <div className="p-3 rounded-xl bg-purple-500/[0.04] border border-purple-500/15 flex items-start gap-2.5 text-xs text-[var(--syn-text)]">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--syn-heading)] font-semibold block">{t("geoToolkit.expectedResult")}</strong>
            <span className="text-[var(--syn-muted)] text-[11px]">
              {t("geoToolkit.blueprintExpectedOutcome", { location: targetLocation })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

interface GeoToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: GeoToolType;
  initialContext?: {
    competitorName?: string;
    threadTitle?: string;
    targetUrl?: string;
    query?: string;
  };
}

export function GeoToolkitModal({
  isOpen,
  onClose,
  initialTool = "llmstxt",
  initialContext = {},
}: GeoToolkitModalProps) {
  useBodyScrollLock(isOpen);
  const { t } = useLanguage();
  const { audit } = useAuditData();
  const [activeTool, setActiveTool] = useState<GeoToolType>(initialTool);
  const [copied, setCopied] = useState(false);
  const [openGuideTool, setOpenGuideTool] = useState<GeoToolType | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Form State
  const brandName = audit?.brandProfile?.name || "Your Brand";
  const websiteUrl = audit?.brandProfile?.websiteUrl || "https://example.com";
  const category = audit?.brandProfile?.category || "Technology";
  const targetLocation = audit?.brandProfile?.targetLocation || "Global";
  const competitors = audit?.brandProfile?.competitors || [];

  // Tool 1: LLMS.txt
  const [llmsTxtType, setLlmsTxtType] = useState<"standard" | "full">("standard");
  const [llmsData, setLlmsData] = useState<{ llmsTxt: string; llmsFullTxt: string; summary: any } | null>(null);
  const [isGeneratingLlms, setIsGeneratingLlms] = useState(false);

  // Tool 2: Displacement
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>(
    initialContext.competitorName || competitors[0] || "Competitor"
  );
  const [isCompetitorDropdownOpen, setIsCompetitorDropdownOpen] = useState(false);
  const competitorDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [displacementData, setDisplacementData] = useState<any | null>(null);
  const [isGeneratingDisplacement, setIsGeneratingDisplacement] = useState(false);

  // Sync selected competitor when audit data or initialContext changes
  useEffect(() => {
    if (initialContext.competitorName) {
      setSelectedCompetitor(initialContext.competitorName);
    } else if (competitors.length > 0 && (!selectedCompetitor || selectedCompetitor === "Competitor")) {
      setSelectedCompetitor(competitors[0]);
    }
  }, [initialContext.competitorName, competitors]);

  // Update portal dropdown position based on trigger button
  const updateDropdownPosition = () => {
    if (competitorDropdownRef.current) {
      const rect = competitorDropdownRef.current.getBoundingClientRect();
      const menuWidth = 280;
      let left = rect.right - menuWidth;
      if (left < 10) left = rect.left;
      setDropdownCoords({
        top: rect.bottom + 6,
        left: Math.max(10, left),
        width: menuWidth,
      });
    }
  };

  useEffect(() => {
    if (isCompetitorDropdownOpen) {
      updateDropdownPosition();
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
      return () => {
        window.removeEventListener("resize", updateDropdownPosition);
        window.removeEventListener("scroll", updateDropdownPosition, true);
      };
    }
  }, [isCompetitorDropdownOpen]);

  // Close competitor dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        competitorDropdownRef.current &&
        !competitorDropdownRef.current.contains(event.target as Node) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target as Node)
      ) {
        setIsCompetitorDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tool 3: Schema
  const [schemaData, setSchemaData] = useState<any | null>(null);
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);

  // Tool 4: Community Script
  const [threadTitle, setThreadTitle] = useState<string>(
    initialContext.threadTitle || `Best ${category} recommendations in ${targetLocation}`
  );
  const [threadUrl, setThreadUrl] = useState<string>(initialContext.targetUrl || "");
  const [communityData, setCommunityData] = useState<any | null>(null);
  const [isGeneratingCommunity, setIsGeneratingCommunity] = useState(false);

  // Tool 5: Content Blueprint
  const [blueprintQuery, setBlueprintQuery] = useState<string>(
    initialContext.query || `What are the top rated options for ${category}?`
  );
  const [blueprintData, setBlueprintData] = useState<any | null>(null);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 1. Generate /llms.txt
  const handleGenerateLlms = async () => {
    setIsGeneratingLlms(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/geo/generate-llmstxt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          websiteUrl,
          category,
          targetLocation,
          competitors,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate llms.txt");
      setLlmsData(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate llms.txt");
    } finally {
      setIsGeneratingLlms(false);
    }
  };

  // 2. Generate Displacement Analysis
  const handleGenerateDisplacement = async () => {
    if (!selectedCompetitor) return;
    setIsGeneratingDisplacement(true);
    setErrorMsg("");

    // Extract unique buyer queries from audit
    const uniqueQueries = Array.from(
      new Set(
        audit?.mentionAnalyses
          ?.map((a) => a.query?.trim())
          .filter(Boolean) as string[] || []
      )
    );
    const queriesPayload = initialContext.query
      ? [initialContext.query, ...uniqueQueries.filter((q) => q !== initialContext.query)].slice(0, 3)
      : uniqueQueries.slice(0, 3);

    const targetCompetitorName =
      selectedCompetitor === "All Competitors"
        ? `All Key Competitors (${competitors.join(", ") || "Market Alternatives"})`
        : selectedCompetitor;

    try {
      const res = await fetch("/api/geo/displacement-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          competitorName: targetCompetitorName,
          category,
          targetLocation,
          queries: queriesPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to run displacement analysis");
      setDisplacementData(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to run displacement analysis");
    } finally {
      setIsGeneratingDisplacement(false);
    }
  };

  // 3. Generate Schema
  const handleGenerateSchema = async () => {
    setIsGeneratingSchema(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/geo/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          websiteUrl,
          category,
          targetLocation,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate schema");
      setSchemaData(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate schema");
    } finally {
      setIsGeneratingSchema(false);
    }
  };

  // 4. Generate Community Script
  const handleGenerateCommunity = async () => {
    if (!threadTitle) return;
    setIsGeneratingCommunity(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/geo/community-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadTitle,
          subredditOrDomain: "Reddit",
          url: threadUrl,
          brandName,
          category,
          competitors,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate community script");
      setCommunityData(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate community script");
    } finally {
      setIsGeneratingCommunity(false);
    }
  };

  // 5. Generate Content Blueprint
  const handleGenerateBlueprint = async () => {
    if (!blueprintQuery) return;
    setIsGeneratingBlueprint(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/geo/generate-content-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: blueprintQuery,
          brandName,
          category,
          targetLocation,
          competitors,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate content blueprint");
      setBlueprintData(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate content blueprint");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/70 backdrop-blur-md overscroll-contain animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl lg:max-w-6xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--syn-card)] border-2 border-[var(--syn-border)] shadow-2xl overflow-hidden overscroll-contain animate-in zoom-in-95 duration-150">
        {/* ── Modal Header ── */}
        <div className="p-4 sm:p-5 border-b border-[var(--syn-border)] flex items-center justify-between gap-4 bg-[var(--syn-card-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#86EFAC] text-neutral-950 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 fill-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[var(--syn-heading)]">
                  {t("geoToolkit.modalTitle")}
                </h3>
                <span className="syn-badge syn-badge-emerald text-[10px] font-mono">Live API</span>
              </div>
              <p className="text-xs text-[var(--syn-muted)]">
                {t("geoToolkit.modalSubtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--syn-card-inner)] hover:bg-[var(--syn-card)] border border-[var(--syn-border)] flex items-center justify-center text-[var(--syn-muted)] hover:text-[var(--syn-heading)] transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-2.5 bg-[var(--syn-card-inner)] border-b border-[var(--syn-border)] shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTool("llmstxt")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTool === "llmstxt"
                ? "bg-[var(--syn-card)] text-[var(--syn-heading)] shadow-xs border border-[var(--syn-border)]"
                : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-subtle)]"
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{t("geoToolkit.tabLlmstxt")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("displacement")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTool === "displacement"
                ? "bg-[var(--syn-card)] text-[var(--syn-heading)] shadow-xs border border-[var(--syn-border)]"
                : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-subtle)]"
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">{t("geoToolkit.tabDisplacement")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("schema")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTool === "schema"
                ? "bg-[var(--syn-card)] text-[var(--syn-heading)] shadow-xs border border-[var(--syn-border)]"
                : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-subtle)]"
            }`}
          >
            <CodeXml className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{t("geoToolkit.tabSchema")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("community")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTool === "community"
                ? "bg-[var(--syn-card)] text-[var(--syn-heading)] shadow-xs border border-[var(--syn-border)]"
                : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-subtle)]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{t("geoToolkit.tabCommunity")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("blueprint")}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTool === "blueprint"
                ? "bg-[var(--syn-card)] text-[var(--syn-heading)] shadow-xs border border-[var(--syn-border)]"
                : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-subtle)]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">{t("geoToolkit.tabBlueprint")}</span>
          </button>
        </div>

        {/* ── Scrollable Body Content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ════ TOOL 1: /LLMS.TXT GENERATOR ════ */}
          {activeTool === "llmstxt" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)]">
                <div>
                  <h4 className="text-sm font-bold text-[var(--syn-heading)] flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-emerald-400" />
                    {t("geoToolkit.llmstxtTitle")}
                  </h4>
                  <p className="text-xs text-[var(--syn-muted)] mt-0.5">
                    {t("geoToolkit.llmstxtDesc", { url: websiteUrl.replace(/\/$/, "") })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenGuideTool(openGuideTool === "llmstxt" ? null : "llmstxt")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      openGuideTool === "llmstxt"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs"
                        : "bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] border-[var(--syn-border)] hover:border-amber-500/30"
                    }`}
                  >
                    <Lightbulb className={`w-3.5 h-3.5 ${openGuideTool === "llmstxt" ? "text-amber-400 fill-amber-400/20" : ""}`} />
                    <span>{openGuideTool === "llmstxt" ? t("geoToolkit.hideGuide") : t("geoToolkit.howToUtilize")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateLlms}
                    disabled={isGeneratingLlms}
                    className="px-4 py-2 rounded-xl bg-[#86EFAC] text-neutral-950 font-bold text-xs flex items-center gap-2 hover:bg-[#86EFAC]/90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingLlms ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t("geoToolkit.synthesizingLlms")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                        <span>{t("geoToolkit.generateLlmsBtn")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Guide Drawer */}
              {openGuideTool === "llmstxt" && (
                <ToolDeploymentGuide
                  tool="llmstxt"
                  brandName={brandName}
                  websiteUrl={websiteUrl}
                  category={category}
                  targetLocation={targetLocation}
                  onClose={() => setOpenGuideTool(null)}
                />
              )}

              {llmsData && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLlmsTxtType("standard")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          llmsTxtType === "standard"
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                            : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)]"
                        }`}
                      >
                        {t("geoToolkit.llmstxtStandardTab")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLlmsTxtType("full")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          llmsTxtType === "full"
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                            : "text-[var(--syn-muted)] hover:text-[var(--syn-heading)]"
                        }`}
                      >
                        {t("geoToolkit.llmstxtFullTab")}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(llmsTxtType === "standard" ? llmsData.llmsTxt : llmsData.llmsFullTxt)}
                        className="p-1.5 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] hover:border-emerald-500/40 text-xs font-semibold text-[var(--syn-heading)] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? t("geoToolkit.copied") : t("geoToolkit.copyMarkdown")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(llmsTxtType === "standard" ? "llms.txt" : "llms-full.txt", llmsTxtType === "standard" ? llmsData.llmsTxt : llmsData.llmsFullTxt)}
                        className="p-1.5 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] hover:border-emerald-500/40 text-xs font-semibold text-[var(--syn-heading)] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t("geoToolkit.download")}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] font-mono text-xs text-[var(--syn-text)] whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto select-text shadow-inner">
                    {llmsTxtType === "standard" ? llmsData.llmsTxt : llmsData.llmsFullTxt}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ TOOL 2: DISPLACEMENT DIAGNOSTIC ════ */}
          {activeTool === "displacement" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-3">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[var(--syn-heading)] flex items-center gap-2">
                      <Swords className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{t("geoToolkit.displacementTitle")}</span>
                    </h4>
                    <p className="text-xs text-[var(--syn-muted)] mt-0.5">
                      {t("geoToolkit.displacementDesc")}
                    </p>
                  </div>

                  <div className="flex flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    {/* Guide Button */}
                    <button
                      type="button"
                      onClick={() => setOpenGuideTool(openGuideTool === "displacement" ? null : "displacement")}
                      className={`px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                        openGuideTool === "displacement"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs"
                          : "bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] border-[var(--syn-border)] hover:border-amber-500/30"
                      }`}
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${openGuideTool === "displacement" ? "text-amber-400 fill-amber-400/20" : ""}`} />
                      <span>{openGuideTool === "displacement" ? t("geoToolkit.hideGuide") : t("geoToolkit.howToUtilize")}</span>
                    </button>

                    {/* Custom Competitor Dropdown */}
                    <div ref={competitorDropdownRef} className="relative shrink-0 flex-1 sm:flex-initial">
                      <button
                        type="button"
                        onClick={() => {
                          updateDropdownPosition();
                          setIsCompetitorDropdownOpen((prev) => !prev);
                        }}
                        className={`w-full sm:w-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-[var(--syn-card)] border-2 transition-all cursor-pointer shadow-xs select-none ${
                          isCompetitorDropdownOpen
                            ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                            : "border-[var(--syn-border)] hover:border-emerald-500/50 hover:bg-[var(--syn-card-subtle)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-xs shrink-0">
                            <Swords className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-[var(--syn-heading)] truncate max-w-[170px] sm:max-w-[210px]">
                            {selectedCompetitor === "All Competitors" ? `vs. ${t("geoToolkit.allCompetitorsOption")}` : `vs. ${selectedCompetitor}`}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-[var(--syn-muted)] transition-transform duration-200 shrink-0 ml-1.5 ${
                            isCompetitorDropdownOpen ? "rotate-180 text-emerald-400" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu Portal */}
                      {isCompetitorDropdownOpen &&
                        dropdownCoords &&
                        typeof document !== "undefined" &&
                        createPortal(
                          <div
                            ref={dropdownMenuRef}
                            style={{
                              position: "fixed",
                              top: `${dropdownCoords.top}px`,
                              left: `${dropdownCoords.left}px`,
                              width: `${dropdownCoords.width}px`,
                              zIndex: 99999,
                            }}
                            className="max-h-[300px] overflow-y-auto rounded-2xl bg-[var(--syn-card)] border-2 border-[var(--syn-border)] shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                          >
                            <div className="px-3 py-1.5 border-b border-[var(--syn-border)] mb-1 flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold">
                                {t("geoToolkit.selectCompetitorLabel")}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                                {t("geoToolkit.optionsCount", { count: competitors.length + 2 })}
                              </span>
                            </div>

                            <div className="space-y-1">
                              {/* Option: All Competitors */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCompetitor("All Competitors");
                                  setIsCompetitorDropdownOpen(false);
                                  setDisplacementData(null);
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                  selectedCompetitor === "All Competitors"
                                    ? "bg-[#86EFAC]/15 border border-emerald-500/40 text-[var(--syn-heading)] font-bold"
                                    : "hover:bg-[var(--syn-card-subtle)] text-[var(--syn-text)] font-medium"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  <span className="truncate font-semibold">{t("geoToolkit.allCompetitorsOption")}</span>
                                </div>
                                {selectedCompetitor === "All Competitors" && (
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                )}
                              </button>

                              {/* Individual Competitors */}
                              {competitors.map((c) => {
                                const isSelected = selectedCompetitor === c;
                                return (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCompetitor(c);
                                      setIsCompetitorDropdownOpen(false);
                                      setDisplacementData(null);
                                    }}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-[#86EFAC]/15 border border-emerald-500/40 text-[var(--syn-heading)] font-bold"
                                        : "hover:bg-[var(--syn-card-subtle)] text-[var(--syn-text)] font-medium"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                      <span className="truncate">{c}</span>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                  </button>
                                );
                              })}

                              {/* General Alternative */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCompetitor("General Alternative");
                                  setIsCompetitorDropdownOpen(false);
                                  setDisplacementData(null);
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                  selectedCompetitor === "General Alternative"
                                    ? "bg-[#86EFAC]/15 border border-emerald-500/40 text-[var(--syn-heading)] font-bold"
                                    : "hover:bg-[var(--syn-card-subtle)] text-[var(--syn-text)] font-medium"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                                  <span className="truncate">{t("geoToolkit.generalAlternativeOption")}</span>
                                </div>
                                {selectedCompetitor === "General Alternative" && (
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                )}
                              </button>
                            </div>
                          </div>,
                          document.body
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={handleGenerateDisplacement}
                      disabled={isGeneratingDisplacement}
                      className="px-4 py-2.5 rounded-2xl bg-[#86EFAC] text-neutral-950 font-bold text-xs flex items-center gap-2 hover:bg-[#86EFAC]/90 transition-all cursor-pointer shrink-0 disabled:opacity-50 shadow-xs whitespace-nowrap"
                    >
                      {isGeneratingDisplacement ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{t("geoToolkit.probing")}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                          <span>{t("geoToolkit.runLiveDiagnosticBtn")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Guide Drawer */}
              {openGuideTool === "displacement" && (
                <ToolDeploymentGuide
                  tool="displacement"
                  brandName={brandName}
                  websiteUrl={websiteUrl}
                  category={category}
                  targetLocation={targetLocation}
                  competitorName={selectedCompetitor}
                  onClose={() => setOpenGuideTool(null)}
                />
              )}

              {displacementData && (
                <div className="space-y-4">
                  {/* Why Competitor Wins & Brand Gaps Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-red-500/[0.05] border border-red-500/20 space-y-2">
                      <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t("geoToolkit.whyAiRecommends", { competitor: displacementData.competitorName })}
                      </h5>
                      <ul className="space-y-1.5 text-xs text-[var(--syn-text)]">
                        {displacementData.whyCompetitorWins.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 space-y-2">
                      <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        {t("geoToolkit.perceivedGaps", { brand: brandName })}
                      </h5>
                      <ul className="space-y-1.5 text-xs text-[var(--syn-text)]">
                        {displacementData.perceivedBrandWeaknesses.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tactical Counterplay */}
                  <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-3">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("geoToolkit.tacticalPlanTitle")}
                    </h5>
                    <div className="space-y-2">
                      {displacementData.tacticalCounterplay.map((step: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <h6 className="text-xs font-bold text-[var(--syn-heading)]">{step.title}</h6>
                            <p className="text-xs text-[var(--syn-muted)] mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ TOOL 3: SCHEMA.ORG STUDIO ════ */}
          {activeTool === "schema" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)]">
                <div>
                  <h4 className="text-sm font-bold text-[var(--syn-heading)] flex items-center gap-2">
                    <CodeXml className="w-4 h-4 text-sky-400" />
                    {t("geoToolkit.schemaTitle")}
                  </h4>
                  <p className="text-xs text-[var(--syn-muted)] mt-0.5">
                    {t("geoToolkit.schemaDesc")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenGuideTool(openGuideTool === "schema" ? null : "schema")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      openGuideTool === "schema"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs"
                        : "bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] border-[var(--syn-border)] hover:border-amber-500/30"
                    }`}
                  >
                    <Lightbulb className={`w-3.5 h-3.5 ${openGuideTool === "schema" ? "text-amber-400 fill-amber-400/20" : ""}`} />
                    <span>{openGuideTool === "schema" ? t("geoToolkit.hideGuide") : t("geoToolkit.howToUtilize")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateSchema}
                    disabled={isGeneratingSchema}
                    className="px-4 py-2 rounded-xl bg-[#86EFAC] text-neutral-950 font-bold text-xs flex items-center gap-2 hover:bg-[#86EFAC]/90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingSchema ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t("geoToolkit.buildingSchema")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                        <span>{t("geoToolkit.generateSchemaBtn")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Guide Drawer */}
              {openGuideTool === "schema" && (
                <ToolDeploymentGuide
                  tool="schema"
                  brandName={brandName}
                  websiteUrl={websiteUrl}
                  category={category}
                  targetLocation={targetLocation}
                  onClose={() => setOpenGuideTool(null)}
                />
              )}

              {schemaData && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {schemaData.schemaTypes?.map((t: string) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-[10px] font-mono font-bold border border-sky-500/20">
                          {t}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(schemaData.jsonLd)}
                      className="p-1.5 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] hover:border-emerald-500/40 text-xs font-semibold text-[var(--syn-heading)] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? t("geoToolkit.copied") : t("geoToolkit.copyJsonLd")}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] font-mono text-xs text-[var(--syn-text)] whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto select-text shadow-inner">
                    {schemaData.jsonLd}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ TOOL 4: COMMUNITY SCRIPT CRAFTER ════ */}
          {activeTool === "community" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--syn-heading)] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    {t("geoToolkit.communityTitle")}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setOpenGuideTool(openGuideTool === "community" ? null : "community")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      openGuideTool === "community"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs"
                        : "bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] border-[var(--syn-border)] hover:border-amber-500/30"
                    }`}
                  >
                    <Lightbulb className={`w-3.5 h-3.5 ${openGuideTool === "community" ? "text-amber-400 fill-amber-400/20" : ""}`} />
                    <span>{openGuideTool === "community" ? t("geoToolkit.hideGuide") : t("geoToolkit.howToUtilize")}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[var(--syn-muted)] font-bold block mb-1">
                      {t("geoToolkit.threadTopicLabel")}
                    </label>
                    <input
                      type="text"
                      value={threadTitle}
                      onChange={(e) => setThreadTitle(e.target.value)}
                      placeholder={t("geoToolkit.threadTopicPlaceholder")}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs text-[var(--syn-heading)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[var(--syn-muted)] font-bold block mb-1">
                      {t("geoToolkit.threadUrlLabel")}
                    </label>
                    <input
                      type="text"
                      value={threadUrl}
                      onChange={(e) => setThreadUrl(e.target.value)}
                      placeholder={t("geoToolkit.threadUrlPlaceholder")}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs text-[var(--syn-heading)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateCommunity}
                    disabled={isGeneratingCommunity || !threadTitle}
                    className="px-4 py-2 rounded-xl bg-[#86EFAC] text-neutral-950 font-bold text-xs flex items-center gap-2 hover:bg-[#86EFAC]/90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingCommunity ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t("geoToolkit.draftingReply")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                        <span>{t("geoToolkit.craftReplyBtn")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Guide Drawer */}
              {openGuideTool === "community" && (
                <ToolDeploymentGuide
                  tool="community"
                  brandName={brandName}
                  websiteUrl={websiteUrl}
                  category={category}
                  targetLocation={targetLocation}
                  onClose={() => setOpenGuideTool(null)}
                />
              )}

              {communityData && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--syn-heading)] font-mono">
                      {t("geoToolkit.suggestedReplyHeading", { tone: communityData.tone })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(communityData.suggestedReply)}
                      className="p-1.5 rounded-lg bg-[var(--syn-card-inner)] border border-[var(--syn-border)] hover:border-emerald-500/40 text-xs font-semibold text-[var(--syn-heading)] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? t("geoToolkit.copied") : t("geoToolkit.copyReply")}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-xs text-[var(--syn-text)] whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto select-text shadow-inner">
                    {communityData.suggestedReply}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ TOOL 5: CONTENT BLUEPRINT ════ */}
          {activeTool === "blueprint" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--syn-heading)] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    {t("geoToolkit.blueprintTitle")}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setOpenGuideTool(openGuideTool === "blueprint" ? null : "blueprint")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      openGuideTool === "blueprint"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs"
                        : "bg-[var(--syn-card)] text-[var(--syn-muted)] hover:text-[var(--syn-heading)] border-[var(--syn-border)] hover:border-amber-500/30"
                    }`}
                  >
                    <Lightbulb className={`w-3.5 h-3.5 ${openGuideTool === "blueprint" ? "text-amber-400 fill-amber-400/20" : ""}`} />
                    <span>{openGuideTool === "blueprint" ? t("geoToolkit.hideGuide") : t("geoToolkit.howToUtilize")}</span>
                  </button>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[var(--syn-muted)] font-bold block mb-1">
                    {t("geoToolkit.targetQueryLabel")}
                  </label>
                  <input
                    type="text"
                    value={blueprintQuery}
                    onChange={(e) => setBlueprintQuery(e.target.value)}
                    placeholder={t("geoToolkit.targetQueryPlaceholder")}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs text-[var(--syn-heading)] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateBlueprint}
                    disabled={isGeneratingBlueprint || !blueprintQuery}
                    className="px-4 py-2 rounded-xl bg-[#86EFAC] text-neutral-950 font-bold text-xs flex items-center gap-2 hover:bg-[#86EFAC]/90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingBlueprint ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t("geoToolkit.synthesizingBlueprint")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                        <span>{t("geoToolkit.generateBlueprintBtn")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Guide Drawer */}
              {openGuideTool === "blueprint" && (
                <ToolDeploymentGuide
                  tool="blueprint"
                  brandName={brandName}
                  websiteUrl={websiteUrl}
                  category={category}
                  targetLocation={targetLocation}
                  onClose={() => setOpenGuideTool(null)}
                />
              )}

              {blueprintData && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] space-y-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                        {t("geoToolkit.recommendedH1")}
                      </span>
                      <h5 className="text-sm font-bold text-[var(--syn-heading)] mt-0.5">
                        {blueprintData.suggestedTitle}
                      </h5>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--syn-muted)] font-bold block mb-1.5">
                        {t("geoToolkit.articleStructure")}
                      </span>
                      <div className="space-y-2">
                        {blueprintData.contentStructure?.map((sec: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs">
                            <strong className="text-[var(--syn-heading)] block">{sec.heading}</strong>
                            <p className="text-[var(--syn-muted)] text-[11px] mt-0.5">{sec.keyPoints?.join(" • ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {blueprintData.recommendedFaqs && (
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1.5">
                          {t("geoToolkit.faqSchemaItems")}
                        </span>
                        <div className="space-y-2">
                          {blueprintData.recommendedFaqs.map((faq: any, idx: number) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-[var(--syn-card)] border border-[var(--syn-border)] text-xs">
                              <strong className="text-[var(--syn-heading)] block font-semibold">{faq.question}</strong>
                              <p className="text-[var(--syn-muted)] text-[11px] mt-0.5">{faq.answerSummary}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
