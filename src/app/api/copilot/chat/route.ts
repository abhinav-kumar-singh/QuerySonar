export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { callOpenRouterChatCompletion, getCleanOpenRouterKey } from "@/lib/geo-engine/openrouter-client";
import { callRequestyChatCompletion, getCleanRequestyKey, REQUESTY_MODEL_MAP } from "@/lib/geo-engine/requesty-client";

interface ChatMessage {
  sender: "user" | "copilot";
  text: string;
  meta?: string;
  breakdown?: Array<{ label: string; value: string }>;
}

interface AuditContext {
  brandProfile?: {
    name?: string;
    websiteUrl?: string;
    category?: string;
    competitors?: string[];
  };
  shareOfVoice?: {
    overallScore?: number;
    perEngine?: Record<string, number>;
    averageRank?: number;
    rank1Share?: number;
    totalQueriesTracked?: number;
    queriesMentionedIn?: number;
  };
  mentionAnalyses?: Array<{
    engine: string;
    query: string;
    brandMentioned: boolean;
    mentionPosition?: number;
    sentiment?: string;
    recommendationRate?: number;
    statusReason?: string;
  }>;
  technicalGeo?: {
    overallGeoScore?: number;
    robotsTxtStatus?: string;
    llmsTxtStatus?: string;
    schemaStatus?: string;
    allowedBots?: string[];
    blockedBots?: string[];
    allowedAiBots?: string[];
    blockedAiBots?: string[];
  };
  citedSources?: Array<{
    domain: string;
    sourceType?: string;
    impactRating?: string;
    title?: string;
  }>;
  actions?: Array<{
    id: string;
    title: string;
    priority: string;
    actionType: string;
    isCompleted?: boolean;
    description?: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, auditContext, history } = body as {
      message: string;
      auditContext?: AuditContext | null;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const userQuery = message.trim();
    const brand = auditContext?.brandProfile?.name || "your brand";
    const category = auditContext?.brandProfile?.category || "Software & Technology";
    const competitors = auditContext?.brandProfile?.competitors || [];
    const sov = auditContext?.shareOfVoice?.overallScore ?? 0;
    const perEngine = auditContext?.shareOfVoice?.perEngine || {};
    const techGeo = auditContext?.technicalGeo;
    const blockedBots = techGeo?.blockedAiBots || techGeo?.blockedBots || [];
    const allowedBots = techGeo?.allowedAiBots || techGeo?.allowedBots || [];
    const sources = auditContext?.citedSources || [];
    const actions = auditContext?.actions || [];
    const analyses = auditContext?.mentionAnalyses || [];

    // Format comprehensive audit context
    const auditContextString = auditContext
      ? `
=== LIVE GEO BRAND AUDIT CONTEXT ===
- Target Brand: "${brand}"
- Website: "${auditContext.brandProfile?.websiteUrl || "Not specified"}"
- Industry Category: "${category}"
- Key Competitors: ${competitors.length > 0 ? competitors.join(", ") : "None detected yet"}

=== VISIBILITY & SHARE OF VOICE (SOV) ===
- Overall Share of Voice: ${sov}%
- Per Engine Visibility:
  * ChatGPT (OpenAI): ${perEngine.openai ?? perEngine.chatgpt ?? "N/A"}%
  * Gemini (Google): ${perEngine.gemini ?? "N/A"}%
  * Perplexity: ${perEngine.perplexity ?? "N/A"}%
  * Claude (Anthropic): ${perEngine.claude ?? "N/A"}%
  * DeepSeek: ${perEngine.deepseek ?? "N/A"}%
  * Grok (xAI): ${perEngine.grok ?? "N/A"}%

=== TECHNICAL GEO & CRAWLER ACCESSIBILITY ===
- Overall Technical Index: ${techGeo?.overallGeoScore ?? "N/A"}/100
- robots.txt: ${techGeo?.robotsTxtStatus || "Not audited"}
- llms.txt: ${techGeo?.llmsTxtStatus || "Missing"}
- Schema Markup: ${techGeo?.schemaStatus || "Not detected"}
- Allowed AI Crawlers (${allowedBots.length}): ${allowedBots.join(", ") || "None"}
- BLOCKED AI Crawlers (${blockedBots.length}): ${blockedBots.join(", ") || "None blocked"}

=== GROUNDING & CITATIONS (${sources.length} Total) ===
- Top Grounded Domains: ${sources.slice(0, 10).map((s) => s.domain).join(", ") || "No external citations recorded"}
- High Authority Sources: ${sources.filter((s) => s.impactRating === "high").length}

=== ACTIVE PLAYBOOK TASKS (${actions.length} Total) ===
${actions.slice(0, 5).map((a) => `- [${a.priority.toUpperCase()}] ${a.title}: ${a.description || ""}`).join("\n")}
`
      : `No audit report has been launched yet. Guide the user on how launching an audit will analyze their brand across 6 AI search engines (ChatGPT, Gemini, Perplexity, Claude, DeepSeek, Grok).`;

    const systemPrompt = `You are QuerySonar AI Copilot, a world-class Generative Engine Optimization (GEO) & AI Search Visibility Strategist.
You advise founders, technical SEOs, and marketing leaders on how to rank #1 across all modern AI answer engines (ChatGPT, Gemini, Perplexity, Claude, DeepSeek, Grok).

Your recommendations must be:
1. Highly specific and directly reference the live audit data provided (brand name, competitors, engine scores, blocked bots, citations, and actions).
2. Actionable and tactical (provide exact robots.txt snippets, schema JSON-LD, Reddit/G2 strategies, comparison table frameworks, or citation playbooks when relevant).
3. Professional, concise, and structured with clean markdown (bullet points, bold text, code blocks where appropriate).
4. Strictly avoid generic fluff or vague generalities.

${auditContextString}`;

    // Format previous chat history
    const conversationPrompt = history && history.length > 0
      ? `Previous conversation:\n${history.slice(-4).map((m) => `${m.sender === "user" ? "User" : "Copilot"}: ${m.text}`).join("\n")}\n\nCurrent User Question: ${userQuery}`
      : userQuery;

    // 1. Try Live Requesty AI Gateway (utilizing 200 free requests/day router via REQUESTY_API_KEY)
    if (getCleanRequestyKey()) {
      const candidateModels = [
        REQUESTY_MODEL_MAP.openai || "openai/gpt-4o-mini",
        REQUESTY_MODEL_MAP.gemini || "google/gemini-2.0-flash",
        REQUESTY_MODEL_MAP.deepseek || "deepseek/deepseek-chat",
      ];

      for (const modelId of candidateModels) {
        try {
          const aiResponse = await callRequestyChatCompletion({
            model: modelId,
            systemPrompt,
            userPrompt: conversationPrompt,
            maxTokens: 1000,
            temperature: 0.3,
            timeoutMs: 6000,
          });

          if (aiResponse && aiResponse.content) {
            return NextResponse.json({
              success: true,
              reply: aiResponse.content,
              model: `requesty:${aiResponse.model}`,
            });
          }
        } catch {
          // Try next model
        }
      }
    }

    // 2. Try Live OpenRouter API across candidate models
    const openRouterKey = getCleanOpenRouterKey();
    if (openRouterKey) {
      const candidateModels = [
        "google/gemini-3.6-flash",
        "deepseek/deepseek-v4-flash",
        "openai/gpt-4o-mini",
        "meta-llama/llama-3.3-70b-instruct",
        "inclusionai/ling-3.0-flash-sante:free",
      ];

      for (const modelId of candidateModels) {
        try {
          const aiResponse = await callOpenRouterChatCompletion({
            model: modelId,
            systemPrompt,
            userPrompt: conversationPrompt,
            maxTokens: 1000,
            temperature: 0.3,
            timeoutMs: 6000,
          });

          if (aiResponse && aiResponse.content) {
            return NextResponse.json({
              success: true,
              reply: aiResponse.content,
              model: aiResponse.model,
            });
          }
        } catch {
          // Try next model
        }
      }
    }

    // 2. Intelligent Multi-Turn Semantic GEO Conversational Engine
    const fallbackResponse = generateSmartCopilotResponse({
      query: userQuery,
      brand,
      category,
      competitors,
      sov,
      perEngine,
      techGeo,
      blockedBots,
      allowedBots,
      sources,
      actions,
      analyses,
      hasScan: Boolean(auditContext),
    });

    return NextResponse.json({
      success: true,
      reply: fallbackResponse.reply,
      breakdown: fallbackResponse.breakdown,
      suggestedActions: fallbackResponse.suggestedActions,
      model: "georadar-expert-engine",
    });
  } catch (error) {
    console.error("Copilot chat route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error processing Copilot request" },
      { status: 500 }
    );
  }
}

interface SmartEngineParams {
  query: string;
  brand: string;
  category: string;
  competitors: string[];
  sov: number;
  perEngine: Record<string, number>;
  techGeo?: AuditContext["technicalGeo"];
  blockedBots: string[];
  allowedBots: string[];
  sources: Array<{ domain: string; sourceType?: string; impactRating?: string }>;
  actions: Array<{ id: string; title: string; priority: string; description?: string; isCompleted?: boolean }>;
  analyses: Array<{ engine: string; query: string; brandMentioned: boolean; mentionPosition?: number }>;
  hasScan: boolean;
}

function generateSmartCopilotResponse(p: SmartEngineParams): {
  reply: string;
  breakdown?: Array<{ label: string; value: string }>;
  suggestedActions?: string[];
} {
  const q = p.query.toLowerCase().trim();

  // 1. Unscanned State
  if (!p.hasScan) {
    return {
      reply: `👋 Hello! I'm your **QuerySonar AI Copilot**.

To get started, enter your brand name and launch your first audit on the left. Once scanned, I'll provide live AI search visibility analysis, competitor displacement playbooks, and crawler diagnostics across **ChatGPT, Gemini, Perplexity, Claude, DeepSeek, and Grok**.`,
      suggestedActions: ["Launch Brand Audit", "Explain GEO Methodology"],
    };
  }

  // 2. Greetings & Salutations (hi, hello, hey, good morning, etc.)
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo|sup|howdy)\b/i.test(q) || q === "hi" || q === "hello") {
    const topEngineEntry = Object.entries(p.perEngine).sort((a, b) => b[1] - a[1])[0];
    const topEngineName = topEngineEntry ? (topEngineEntry[0] === "openai" ? "ChatGPT" : topEngineEntry[0].toUpperCase()) : "Gemini";

    return {
      reply: `👋 Hello! I'm your **QuerySonar AI Copilot** for **${p.brand}**.

Your current Generative Engine Optimization (GEO) status:
* **Category**: ${p.category}
* **Share of Voice**: **${p.sov}%** (Highest on **${topEngineName}**)
* **Competitors Tracked**: ${p.competitors.length > 0 ? p.competitors.slice(0, 3).join(", ") : "None detected"}
* **Top Recommendation**: ${p.actions[0]?.title || "Publish structured comparison content"}

What area would you like to explore or optimize today?`,
      breakdown: [
        { label: "Tracked Brand", value: p.brand },
        { label: "Overall SOV", value: `${p.sov}%` },
        { label: "Active Citations", value: `${p.sources.length} sources` },
        { label: "Playbook Tasks", value: `${p.actions.length} items` },
      ],
      suggestedActions: [
        p.competitors[0] ? `How to outrank ${p.competitors[0]}?` : "Competitor Displacement",
        "Explain My Dashboard",
        "Fix Blocked AI Crawlers",
      ],
    };
  }

  // 3. Weaknesses, Risks, Problems, Failures
  if (q.includes("weakness") || q.includes("risk") || q.includes("threat") || q.includes("problem") || q.includes("worst") || q.includes("bad") || q.includes("failing") || q.includes("drop") || q.includes("low")) {
    const lowestEngine = Object.entries(p.perEngine).sort((a, b) => a[1] - b[1])[0];
    const lowEngineName = lowestEngine ? (lowestEngine[0] === "openai" ? "ChatGPT" : lowestEngine[0].toUpperCase()) : "Grok";
    const lowEngineScore = lowestEngine ? lowestEngine[1] : p.sov;

    return {
      reply: `### Vulnerability & Risk Assessment for **${p.brand}**

Based on your live multi-engine audit, here are the primary vulnerabilities in your AI search posture:

1. **Lowest AI Visibility Engine (${lowEngineName} at ${lowEngineScore}%)**:
   * ${lowEngineName} has the lowest citation affinity for **${p.brand}** compared to other models.
   * **Fix**: Provide clear, factual specification tables and ensure fresh content coverage in publications indexed by ${lowEngineName}.

2. **Technical Crawler Accessibility**:
   * ${p.blockedBots.length > 0 ? `⚠️ **${p.blockedBots.join(", ")}** is currently restricted on your domain, preventing live RAG indexing.` : `✅ Crawlers are permitted, but ensure your \`/llms.txt\` file is deployed for clean LLM context ingestion.`}

3. **Community Proof Gap**:
   * AI answer engines (especially Perplexity and Gemini) heavily weight organic discussions on Reddit and industry forums. If competitors dominate user sentiment, they will be recommended first.`,
      breakdown: [
        { label: "Lowest Engine", value: `${lowEngineName} (${lowEngineScore}%)` },
        { label: "Blocked Bots", value: `${p.blockedBots.length} restricted` },
        { label: "High-Priority Fixes", value: `${p.actions.filter(a => a.priority === 'high').length} pending` },
      ],
      suggestedActions: ["Fix Blocked AI Crawlers", "Reddit Citation Blueprint", `Inspect ${lowEngineName} Score`],
    };
  }

  // 4. Strengths, Top Scores, Wins
  if (q.includes("strength") || q.includes("best") || q.includes("win") || q.includes("highest") || q.includes("good") || q.includes("strong")) {
    const highestEngine = Object.entries(p.perEngine).sort((a, b) => b[1] - a[1])[0];
    const highEngineName = highestEngine ? (highestEngine[0] === "openai" ? "ChatGPT" : highestEngine[0].toUpperCase()) : "Gemini";

    return {
      reply: `### Key Strengths & AI Wins for **${p.brand}**

1. **Strong Overall Share of Voice (${p.sov}%)**:
   * **${p.brand}** is consistently surfaced as a recommended solution across generative answer engines.

2. **Top Performing Engine (${highEngineName} at ${highestEngine ? highestEngine[1] : 100}%)**:
   * ${highEngineName} exhibits strong entity grounding for **${p.brand}** in the **${p.category}** vertical.

3. **Grounding Footprint**:
   * **${p.sources.length} domains** actively provide contextual backing for your product capabilities.`,
      breakdown: [
        { label: "Top Engine", value: highEngineName },
        { label: "Overall SOV", value: `${p.sov}%` },
        { label: "High Authority Sources", value: `${p.sources.filter(s => s.impactRating === 'high').length} domains` },
      ],
      suggestedActions: ["How to outrank competitors?", "Reddit Citation Strategy"],
    };
  }

  // 5. Action Plan, Roadmap, What should I do next?
  if (q.includes("what should") || q.includes("next step") || q.includes("roadmap") || q.includes("plan") || q.includes("priority") || q.includes("todo") || q.includes("action") || q.includes("how to improve")) {
    const highActions = p.actions.filter(a => a.priority === "high");
    const topAction1 = highActions[0] || p.actions[0];
    const topAction2 = highActions[1] || p.actions[1];
    const topAction3 = p.actions[2];

    return {
      reply: `### Immediate GEO Action Roadmap for **${p.brand}**

Here is your prioritized 3-step tactical roadmap to maximize generative search recommendations:

1. **🔥 High Priority: ${topAction1?.title || "Publish Head-to-Head Comparison Pages"}**
   * ${topAction1?.description || "Deploy structured HTML comparison tables against top market alternatives to win direct replacement queries."}

2. **⚡ Technical GEO: ${topAction2?.title || "Deploy /llms.txt Knowledge File"}**
   * ${topAction2?.description || "Provide an authoritative LLM documentation markdown file at your domain root to guide accurate AI summarization."}

3. **🌐 Community Grounding: ${topAction3?.title || "Seed Authoritative Reddit & Forum Discussions"}**
   * ${topAction3?.description || "Build authentic third-party consensus in active buyer communities where AI engines ground their recommendations."}`,
      breakdown: [
        { label: "Total Action Items", value: `${p.actions.length} tasks` },
        { label: "High Priority", value: `${highActions.length} items` },
        { label: "Completed", value: `${p.actions.filter(a => a.isCompleted).length} tasks` },
      ],
      suggestedActions: ["Copy robots.txt Config", "Generate Schema JSON-LD", "Reddit Strategy"],
    };
  }

  // 6. Competitor Analysis & Displacement
  if (q.includes("competitor") || q.includes("outrank") || q.includes("versus") || q.includes("vs") || p.competitors.some(c => q.includes(c.toLowerCase()))) {
    const targetComp = p.competitors.find(c => q.includes(c.toLowerCase())) || p.competitors[0] || "primary competitors";

    return {
      reply: `### Competitor Displacement Strategy: **${p.brand} vs. ${targetComp}**

In the **${p.category}** category, AI search engines evaluate **${p.brand}** directly against **${targetComp}**.

#### 3 Tactics to Win the #1 AI Recommendation:
1. **Direct \`/vs/${targetComp.toLowerCase().replace(/\s+/g, "-")}\` Comparison Page**:
   * Build a transparent, structured HTML comparison table with explicit categories (Pricing, Features, API, Reliability).
   * Generative engines (ChatGPT, Gemini, Claude) extract table cell data with near 100% precision.
2. **Third-Party Review Differentiation**:
   * Highlight unique advantages over **${targetComp}** on G2, Capterra, and Trustpilot reviews.
3. **Reddit & Listicles Seeding**:
   * Ensure your brand is listed alongside **${targetComp}** in top authority buyer listicles.`,
      breakdown: [
        { label: "Category", value: p.category },
        { label: "Target Competitor", value: targetComp },
        { label: "Your Overall SOV", value: `${p.sov}%` },
      ],
      suggestedActions: ["Generate Comparison Table Schema", "Audit Cited Domains"],
    };
  }

  // 7. Technical GEO / Crawlers / robots.txt / llms.txt / Schema
  if (q.includes("robot") || q.includes("crawler") || q.includes("bot") || q.includes("schema") || q.includes("technical") || q.includes("llms.txt")) {
    const isBlocked = p.blockedBots.length > 0;
    return {
      reply: `### Technical GEO & AI Crawler Readiness for **${p.brand}**

* **GEO Technical Index**: **${p.techGeo?.overallGeoScore ?? 85}/100**
* **Status**: ${isBlocked ? `⚠️ **${p.blockedBots.join(", ")}** blocked on your domain.` : `✅ All major AI search bots allowed.`}

#### Recommended \`robots.txt\` Configuration:
\`\`\`txt
# Allow Generative Search Crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# Knowledge Graph & Sitemap
Sitemap: https://${p.brand.toLowerCase().replace(/\s+/g, "")}.com/sitemap.xml
\`\`\`

#### Recommended \`/llms.txt\` Structure:
\`\`\`markdown
# ${p.brand}
> ${p.category} Provider

## Core Solutions
- Primary feature set and enterprise workflows
- Integration ecosystem and documentation

## Official Links
- Pricing: /pricing
- Documentation: /docs
\`\`\``,
      breakdown: [
        { label: "GEO Technical Score", value: `${p.techGeo?.overallGeoScore ?? 85}/100` },
        { label: "Allowed Crawlers", value: `${p.allowedBots.length}/6 active` },
        { label: "Blocked Crawlers", value: `${p.blockedBots.length} restricted` },
      ],
      suggestedActions: ["Copy robots.txt Config", "Generate Schema JSON-LD"],
    };
  }

  // 8. Citations & Reddit / PR Strategy
  if (q.includes("reddit") || q.includes("citation") || q.includes("source") || q.includes("pr") || q.includes("grounding") || q.includes("backlink") || q.includes("g2")) {
    return {
      reply: `### Grounding & Citation Strategy for **${p.brand}**

Generative engines like **Perplexity**, **Gemini**, and **ChatGPT** rely on third-party domain consensus. Your scan identified **${p.sources.length} cited URLs**.

#### Tactical Citation Blueprint:
1. **Reddit & Community Proof**:
   * Participate in relevant subreddits with authentic, technical answers solving buyer dilemmas.
   * AI search engines weight organic Reddit discussions heavily for subjective buyer queries (e.g., *"What is the best alternative to...?"*).
2. **Authority Tech & News Publications**:
   * Secure mentions in editorial listicles and tier-1 tech outlets (TechCrunch, Wired, Forbes).
3. **Structured Review Sites**:
   * Maintain active profiles on G2, Capterra, and Trustpilot. AI models extract structured rating snippets during real-time retrieval.`,
      breakdown: [
        { label: "Total Cited Sources", value: `${p.sources.length} URLs` },
        { label: "High Authority", value: `${p.sources.filter(s => s.impactRating === 'high').length} domains` },
        { label: "Top Domain", value: p.sources[0]?.domain || "Direct search" },
      ],
      suggestedActions: ["Find High-Value Reddit Threads", "Audit G2 Profile"],
    };
  }

  // 9. Specific Engine Inquiries (ChatGPT, Gemini, Perplexity, Claude, DeepSeek, Grok)
  const matchedEngine = ["openai", "gemini", "perplexity", "claude", "deepseek", "grok"].find(e => q.includes(e) || (e === "openai" && (q.includes("chatgpt") || q.includes("gpt"))));
  if (matchedEngine) {
    const engineDisplayName = matchedEngine === "openai" ? "ChatGPT" : matchedEngine.charAt(0).toUpperCase() + matchedEngine.slice(1);
    const score = p.perEngine[matchedEngine] ?? p.sov;
    const engineAnalyses = p.analyses.filter(a => a.engine === matchedEngine);
    const mentioned = engineAnalyses.filter(a => a.brandMentioned).length;

    return {
      reply: `### **${engineDisplayName}** Visibility Analysis for **${p.brand}**

* **Engine SOV Score**: **${score}%**
* **Prompt Recommendations**: **${mentioned}/${engineAnalyses.length || 1} queries recommended ${p.brand}**

#### How ${engineDisplayName} Evaluates ${p.brand}:
${matchedEngine === "perplexity" ? `* **Perplexity** relies on live web search grounding. It favors recency, clear header structures, and authoritative domain citations.` : ""}
${matchedEngine === "openai" ? `* **ChatGPT** synthesizes broad pre-trained entity knowledge combined with search grounding (via Bing/GPTBot). It looks for established brand consensus and consistent nomenclature.` : ""}
${matchedEngine === "gemini" ? `* **Gemini** leverages Google's Knowledge Graph and live web index. Ensuring proper JSON-LD structured data and fast-loading canonical pages maximizes placement.` : ""}
${matchedEngine === "claude" ? `* **Claude** prioritizes nuanced architectural depth, technical accuracy, and unbiased objective comparisons.` : ""}
${matchedEngine === "deepseek" ? `* **DeepSeek** excels at dense technical specs, open-source code references, and developer-first documentation.` : ""}
${matchedEngine === "grok" ? `* **Grok** integrates real-time X (Twitter) discussions and live social sentiment into its recommendation index.` : ""}

#### Recommended Optimization for ${engineDisplayName}:
Ensure your brand's unique value proposition is clearly defined in plain text across high-authority third-party review platforms and official docs.`,
      breakdown: [
        { label: "Engine", value: engineDisplayName },
        { label: "Visibility Score", value: `${score}%` },
        { label: "Mention Rate", value: `${mentioned}/${engineAnalyses.length || 1}` },
      ],
      suggestedActions: [`Inspect ${engineDisplayName} Transcripts`, "View Competitor Rankings"],
    };
  }

  // 10. Share of Voice & Score Definitions
  if (q.includes("sov") || q.includes("share of voice") || q.includes("how is score calculated") || q.includes("what does score mean") || q.includes("percentage")) {
    return {
      reply: `### How Share of Voice (SOV) is Calculated for **${p.brand}**

Your overall **Share of Voice (${p.sov}%)** measures the percentage of high-intent buyer queries where AI models explicitly recommend **${p.brand}**.

#### Scoring Breakdown:
* **Position Weighting**: A #1 top-pick rank earns full visibility weight (100%), while #2 and #3 placements earn 75% and 50% respectively.
* **Per-Engine Distribution**:
${Object.entries(p.perEngine).map(([eng, val]) => `  * **${eng === "openai" ? "ChatGPT" : eng.toUpperCase()}**: ${val}%`).join("\n")}
* **Consensus Index**: Evaluates how many engines independently agree on recommending your brand.`,
      breakdown: [
        { label: "Overall SOV", value: `${p.sov}%` },
        { label: "Tracked Engines", value: "6 Models" },
      ],
      suggestedActions: ["Explain My Dashboard", "Competitor Displacement"],
    };
  }

  // 11. General Conversational Fallback (Context-Aware)
  return {
    reply: `### Analysis for **${p.brand}**: "${p.query}"

Regarding your question about **${p.brand}** in the **${p.category}** vertical:

* **Current Generative Positioning**: **${p.brand}** holds a **${p.sov}% Share of Voice** across ChatGPT, Gemini, Perplexity, Claude, DeepSeek, and Grok.
* **Competitor Context**: Your main alternatives are **${p.competitors.slice(0, 3).join(", ") || "market competitors"}**.
* **Key Strategic Takeaway**: ${p.actions[0]?.description || "Strengthen third-party citations and deploy structured comparison tables."}

Would you like me to generate specific code snippets (robots.txt / schema), deep-dive into a specific AI engine, or create a competitor displacement plan?`,
    breakdown: [
      { label: "Brand", value: p.brand },
      { label: "Overall SOV", value: `${p.sov}%` },
      { label: "Tracked Competitors", value: `${p.competitors.length}` },
    ],
    suggestedActions: ["Explain My Dashboard", "Reddit Citation Strategy", "Fix Blocked AI Crawlers"],
  };
}
