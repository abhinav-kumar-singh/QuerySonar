# PROJECT CONTEXT & ARCHITECTURE SPECIFICATION

> **Project Name:** GeoRadar (AI Search & Brand Visibility Tracker / GEO Platform)  
> **Repository Root:** `/Users/abhinav.singh/Documents/antigravity/sharp-borg/georadar`  
> **Last Updated:** September 13, 2026  
> **Status:** MVP Operational (Phases 1–5 Complete, Live PostgreSQL & Google OAuth Synced, Build Clean)

---

## 1. Project Overview

### 1.1 Core Mission & Value Proposition
GeoRadar is a specialized **Generative Engine Optimization (GEO)** platform built for modern product teams, founders, and marketing leaders. As buyer behavior shifts from traditional search engines (Google, Bing) to conversational AI engines (ChatGPT, Perplexity, Google Gemini), brands face a massive **"AI Blindspot"**:
- When prospective buyers prompt AI engines with high-intent queries (e.g., *"best CRM for real estate"*, *"fastest transactional email API"*), legacy SEO tools (Ahrefs, Semrush) cannot report what the AI generated, who was recommended, or why.
- GeoRadar continuously probes conversational AI models, extracts semantic brand mentions, calculates competitive **Share of Voice (SOV)**, attributes the exact web sources cited by the AI (Reddit discussions, G2 comparisons, Capterra reviews, news articles), and outputs an automated, prioritized **Action Playbook** to flip AI recommendations in the brand's favor.

### 1.2 Founder & Operating Constraints
- **Solo Builder with a 9–5 Schedule:** The entire application is architected for **zero-maintenance, self-serve, fully automated operations**. No manual data curation or ops support required.
- **Unit Economics:** Built around high-margin recurring subscriptions ($29 Starter, $49 Pro, $99 Agency) with negligible marginal compute (~$1.20 API cost per customer/month at ~94% gross margin).

### 1.3 Technology Stack
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) + TypeScript 5 + React 18
- **Styling & UI:** Tailwind CSS v4 + custom CSS custom properties theming (light/dark mode) + Lucide Icons + Recharts
- **Design Primitives:** Custom Shadcn/UI-inspired components (`Button`, `Card`, `Input`, `Badge`, `Tabs`, `Progress`)
- **Authentication:** [NextAuth.js v5 (Auth.js)](https://authjs.dev/) with Google OAuth provider + `@auth/prisma-adapter` + cryptographically signed JWT cookies
- **Database & ORM:** [Prisma ORM v5](https://www.prisma.io/) + Serverless [Neon PostgreSQL](https://neon.tech/) cloud database
- **Engine Intelligence (GEO Probers):**
  - Perplexity Sonar API (`api.perplexity.ai/chat/completions`)
  - Google Gemini 2.0 Flash (`generativelanguage.googleapis.com`) with Google Search grounding
  - OpenAI GPT-4o-mini with web search preview
  - Intelligent Mock Prober with randomized realistic distributions (automatic fallback when API keys are absent)
- **State Management & Storage:** Reactive browser store (`useSyncExternalStore`) with multi-tab synchronization and local storage persistence

---

## 2. Current Implementation State

### ✅ Completed & Fully Working

#### A. Foundational Design System & Layouts (Phase 1)
- **Global Design System:** Configured in `src/app/globals.css` with dark/light mode CSS variables and smooth scrolling.
- **Component Library:** Located in `src/components/ui/` (`button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `progress.tsx`, `tabs.tsx`).
- **Responsive Layouts:**
  - `src/components/layout/header.tsx`: Sticky public marketing header with smooth anchor navigation (`/#features`, `/#pricing`, `/#faq`), conditional authenticated user avatar + "Sign Out" button, and auto-hidden on `/dashboard/*` routes.
  - `src/components/layout/dashboard-layout.tsx`: Dedicated full-viewport workspace application layout featuring a collapsible sidebar, breadcrumb navigation, integrated user avatar, and logout controls.
  - `src/components/layout/footer.tsx`: Standard footer.

#### B. Database & Authentication Layer (Phase 2)
- **Live Database Connection:** Connected to Neon Serverless PostgreSQL (`ep-bold-butterfly-a5h3187g.us-east-2.aws.neon.tech`).
- **Relational Schema:** Pushed via `prisma db push` into 7 core models:
  - `User`, `Account`, `Session`, `VerificationToken` (NextAuth models)
  - `Brand`, `TrackedQuery`, `AuditRun`, `EngineResponse`, `CitedSource`, `RemediationAction`
- **Google OAuth:** Configured in Google Cloud Console (`GeoRadar Local`) with verified callback URL (`http://localhost:3000/api/auth/callback/google`), `AUTH_SECRET`, and NextAuth v5 handlers.
- **Session Architecture:** Encrypted HTTP-only JWT cookies for <1ms routing checks without database bottlenecks, while permanently saving user accounts to Neon.

#### C. Core GEO Analysis Engine (Phase 3)
- Located in `src/lib/geo-engine/`:
  - `types.ts`: Comprehensive TypeScript definitions (`BrandProfile`, `Engine`, `Sentiment`, `ImpactRating`, `ActionType`, `AuditResult`, etc.).
  - `probers/perplexity.ts`: Real Perplexity Sonar prober with citation extraction.
  - `probers/gemini.ts`: Real Google Gemini prober with Google Search grounding metadata parsing.
  - `probers/openai.ts`: Real OpenAI prober with web search citations.
  - `probers/mock.ts`: High-fidelity offline prober producing realistic recommendations and sources.
  - `probers/index.ts`: Prober factory automatically selecting live or mock probers based on env variables.
  - `analyzer.ts`: Brand recognition, rank detection (#1, #2, #3), sentiment deduction, competitor identification, citation deduplication, and Share of Voice calculations.
  - `playbook.ts`: Rules-based remediation engine that suggests actionable fixes (Reddit counter-responses, G2/Capterra reviews, schema updates).
  - `scanner.ts`: High-level orchestrators `runInstantScan` and `runFullAudit`.

#### D. Landing Page & Lead Magnet (Phase 4)
- **Landing Page (`src/app/page.tsx`):**
  - High-converting hero with in-place **Instant AI Visibility Scan** form (Brand Name, Website, Search Query).
  - Live results view showing circular score, Perplexity/Gemini breakdown, competitor tags, citation preview, and signup lock.
  - Interactive "How It Works" (`id="features"`), 3-tier Pricing cards (`id="pricing"`), and FAQ accordion (`id="faq"`).
- **API Endpoint:** `src/app/api/scan/instant/route.ts` executing live audits in ~3–5s.
- **Handoff:** Results saved automatically to `georadar_audit_result` in local storage for instant transition into the dashboard upon signup.

#### E. Customer Dashboard Experience (Phase 5)
- **State Layer (`src/lib/audit-storage.ts`):** Reactive store utilizing `useSyncExternalStore` for immediate cross-component sync with zero cascading render bugs.
- **Main Dashboard (`src/app/dashboard/page.tsx`):**
  - **New User Onboarding Empty State:** If no scan exists, guides the user to run their first AI audit with clear inputs.
  - **Active State:** Real visibility score, 6-week Recharts trend area chart, engine progress bars (Perplexity, Gemini, OpenAI), and "Run New Scan" modal.
- **Cited Sources Radar (`src/app/dashboard/sources/page.tsx`):** Tabulates real domain authority sources (Reddit, G2, Capterra, TechCrunch) with impact badges and expandable excerpts.
- **Query Inspector (`src/app/dashboard/queries/page.tsx`):** Verbatim transcript viewer with color-coded syntax highlighting (green for user brand, orange for competitors).
- **Action Playbook (`src/app/dashboard/actions/page.tsx`):** Prioritized checklist cards (High, Medium, Quick Wins) with toggleable completion states.
- **Settings (`src/app/dashboard/settings/page.tsx`):** Edit brand profile, add/remove competitor tags, manage tracked query limits.

---

## 3. Pending Tasks & Roadmap

The implementation plan (`task.md`) defines the remaining phases to complete commercial production readiness:

```
[ ] Phase 6: Stripe Payments & Billing
    [ ] Stripe Checkout API route (`/api/checkout`) for Starter ($29/mo) and Pro ($49/mo) plans
    [ ] Stripe Webhook handler (`/api/webhooks/stripe`) updating User.plan and stripeSubscriptionId in Neon DB
    [ ] Stripe Customer Portal redirect (`/api/billing/portal`) for 1-click self-serve cancellations

[ ] Phase 7: Automated Weekly Scanning & Email Reports
    [ ] Vercel Cron endpoint (`/api/cron/weekly-audit`) to trigger automated weekly scans for tracked brands
    [ ] Resend API integration for email delivery
    [ ] React Email template (`src/emails/WeeklyReport.tsx`) with SOV delta, new citations, and competitor changes

[ ] Phase 8: Production Deployment & Real-Time Probing Enhancements
    [ ] Free-tier live Reddit/Web search crawler for instant scans without paid API keys
    [ ] Optional live Google Gemini API key integration (`GEMINI_API_KEY` from Google AI Studio)
    [ ] Production deployment to Vercel + environment variable configuration
```

---

## 4. Key Decisions & Technical Constraints

1. **Next.js Version Pinned to 15.5.x:**
   - Next.js 16.x Turbopack had internal PostCSS bundling issues with Tailwind v4 `@theme inline`.
   - Next.js 15.5.25 was selected and verified for stable production builds (`npm run build` succeeds in ~2.3s with 12 static/dynamic routes).

2. **Node Environment (NVM Node 22):**
   - The user machine default is Node 18, but Next.js 15 requires Node >= 20.9.0.
   - **Constraint:** All shell/build commands must use the NVM prefix:  
     `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22 && <command>`
   - A `.nvmrc` file set to `22` is located in the project root.

3. **Stateless JWT Sessions with DB Storage:**
   - `src/lib/auth.ts` uses `@auth/prisma-adapter` for database writes, but keeps `session: { strategy: "jwt" }`.
   - This eliminates database query waterfalls on client page navigation while ensuring Google OAuth accounts persist in Neon.

4. **Zero-Flicker Dashboard State (`useSyncExternalStore`):**
   - Direct `setState` inside `useEffect` caused React 19 / ESLint cascading render warnings.
   - The storage layer in `src/lib/audit-storage.ts` uses `useSyncExternalStore` to subscribe to browser storage events, ensuring sub-millisecond synchronous reads.

5. **No Redundant Marketing Chrome on App Views:**
   - `src/components/layout/header.tsx` returns `null` for any path starting with `/dashboard`.
   - `src/components/layout/dashboard-layout.tsx` owns the application header bar with user avatar, workspace breadcrumb, and logout button.

---

## 5. File Tree Reference

```
georadar/
├── prisma/
│   └── schema.prisma              # 7 PostgreSQL models + enums
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # Auth route handler
│   │   │   └── scan/instant/route.ts        # Instant scan API
│   │   ├── auth/
│   │   │   └── signin/page.tsx    # Google OAuth sign-in screen
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # Dashboard layout wrapper
│   │   │   ├── page.tsx           # Overview, Scorecard, Trends, Alerts
│   │   │   ├── actions/page.tsx   # Action Playbook checklist
│   │   │   ├── queries/page.tsx   # Verbatim transcript inspector
│   │   │   ├── settings/page.tsx  # Brand profile & queries editor
│   │   │   └── sources/page.tsx   # Cited Sources Radar table
│   │   ├── globals.css            # Tailwind v4 setup & theme variables
│   │   ├── layout.tsx             # Root layout with SessionProvider & Header
│   │   └── page.tsx               # Public landing page with instant scan
│   ├── components/
│   │   ├── layout/
│   │   │   ├── dashboard-layout.tsx  # Dedicated workspace layout
│   │   │   ├── footer.tsx            # Public footer
│   │   │   └── header.tsx            # Public marketing navbar
│   │   ├── providers/
│   │   │   └── session-provider.tsx  # Client SessionProvider wrapper
│   │   └── ui/                    # Shadcn-style primitives
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       └── tabs.tsx
│   └── lib/
│       ├── audit-storage.ts       # Reactive local audit state manager
│       ├── auth.ts                # NextAuth v5 Google configuration
│       ├── db.ts                  # PrismaClient singleton
│       ├── utils.ts               # Class variance / cn helper
│       └── geo-engine/            # Intelligence layer
│           ├── analyzer.ts        # Mention, rank, sentiment analyzer
│           ├── playbook.ts        # Action generator
│           ├── scanner.ts         # Multi-engine scan runner
│           ├── types.ts           # TypeScript interfaces
│           └── probers/
│               ├── gemini.ts      # Google Gemini Flash prober
│               ├── index.ts       # Prober factory
│               ├── mock.ts        # Offline simulation prober
│               ├── openai.ts      # ChatGPT prober
│               └── perplexity.ts  # Perplexity Sonar prober
├── .env                           # Live DB, NextAuth, and app configuration
├── .env.example                   # Deployment template
├── package.json
└── tsconfig.json
```

---

## 6. Session Summary for Codex / ChatGPT / Next Assistant

If you are picking up this project in a new session:

1. **Where we stopped:**
   - The user tested the app locally, verified Google OAuth login, verified that the top marketing banner disappears inside `/dashboard`, confirmed that fake "Acme CRM" dummy data was removed in favor of a clean onboarding audit form, and connected Neon PostgreSQL via `DATABASE_URL`.
   - The dev server was stopped cleanly with port 3000 free.
   - `npm run build` is 100% passing (12/12 static/dynamic pages compiled without warnings or errors).

2. **Next Immediate Work Items:**
   - **Option 1 (Stripe Billing - Phase 6):** Implement `/api/checkout` and `/api/webhooks/stripe` to handle paid subscriptions ($29 Starter / $49 Pro).
   - **Option 2 (Live Search Crawler):** Add live Reddit/DuckDuckGo search query fetching to `mock.ts` so test scans without API keys extract real existing forum threads.
   - **Option 3 (Weekly Cron & Resend Email - Phase 7):** Create the React Email weekly summary template and the cron endpoint for scheduled background audits.

3. **Running the App Locally:**
   ```bash
   cd /Users/abhinav.singh/Documents/antigravity/sharp-borg/georadar
   export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22
   npm run dev
   ```
   Then visit `http://localhost:3000` or `http://localhost:3000/dashboard`.
