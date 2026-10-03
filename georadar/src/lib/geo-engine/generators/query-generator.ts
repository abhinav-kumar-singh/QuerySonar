import { callOpenRouterChatCompletion } from "../openrouter-client";
import { callRequestyChatCompletion, getCleanRequestyKey, REQUESTY_MODEL_MAP } from "../requesty-client";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export type QueryPersonaType = "discovery" | "comparison" | "alternative" | "feature" | "workflow" | "enterprise";

export interface SuggestedQuery {
  queryText: string;
  type: QueryPersonaType;
  personaLabel: string;
  categoryTag?: string;
}

export interface BusinessCategoryItem {
  id: string;
  name: string;
  isAutoSelected: boolean;
  confidence?: number;
}

export interface CategoryDiscoveryResult {
  brandName: string;
  websiteUrl?: string;
  summary: string;
  categories: BusinessCategoryItem[];
  detectedCompetitors: string[];
}

export interface CategoryGroundedQuery {
  id: string;
  categoryTag: string;
  queryText: string;
  type: QueryPersonaType;
  personaLabel: string;
}

export interface GeneratedBrandIntel {
  brandName: string;
  websiteUrl?: string;
  category: string;
  summary: string;
  categories?: BusinessCategoryItem[];
  detectedCompetitors: string[];
  suggestedQueries: SuggestedQuery[];
}

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const GENERATION_TIMEOUT_MS = 10_000;

/* ───────────────────────────────────────────────────────────────────────────
   1. DISCOVER BRAND CATEGORIES (Image 1 Taxonomy Step)
   ─────────────────────────────────────────────────────────────────────────── */
export async function discoverBrandCategories(
  brandName: string,
  websiteUrl?: string,
  categoryHint?: string,
  targetLocation?: string
): Promise<CategoryDiscoveryResult> {
  const cleanBrand = brandName.trim();
  const cleanUrl = websiteUrl ? websiteUrl.trim() : "";
  const apiKey = (process.env.GEMINI_API_KEY || "").replace(/^["'\s]+|["'\s]+$/g, "");

  // 1. Try Requesty AI Gateway first (Free 200 requests/day tier)
  if (getCleanRequestyKey()) {
    try {
      const res = await callRequestyForCategoryDiscovery(cleanBrand, cleanUrl, categoryHint, targetLocation);
      if (res && res.categories.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn("Requesty category discovery failed, trying Gemini/OpenRouter fallback:", err);
    }
  }

  // 2. Try Gemini (if valid API key starting with AIza)
  if (apiKey && apiKey.startsWith("AIza")) {
    try {
      const res = await callGeminiForCategoryDiscovery(cleanBrand, cleanUrl, categoryHint, apiKey, targetLocation);
      if (res && res.categories.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn("Gemini category discovery failed, trying OpenRouter fallback:", err);
    }
  }

  // 3. Try OpenRouter
  const openRouterKey = (process.env.OPENROUTER_API_KEY || "").replace(/^["'\s]+|["'\s]+$/g, "");
  if (openRouterKey) {
    try {
      const res = await callOpenRouterForCategoryDiscovery(cleanBrand, cleanUrl, categoryHint, targetLocation);
      if (res && res.categories.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn("OpenRouter category discovery failed, using dynamic semantic synthesis:", err);
    }
  }

  // 4. Dynamic Multi-Industry Semantic Synthesis
  return generateDynamicCategoryDiscovery(cleanBrand, cleanUrl, categoryHint);
}

/* ───────────────────────────────────────────────────────────────────────────
   2. GENERATE CATEGORY-GROUNDED BUYER PROMPTS (Image 2 Prompt Step)
   ─────────────────────────────────────────────────────────────────────────── */
export async function generateCategoryBuyerPrompts(
  brandName: string,
  websiteUrl?: string,
  selectedCategories: string[] = [],
  targetLocation?: string
): Promise<CategoryGroundedQuery[]> {
  const cleanBrand = brandName.trim();
  const cleanUrl = websiteUrl ? websiteUrl.trim() : "";
  const apiKey = (process.env.GEMINI_API_KEY || "").replace(/^["'\s]+|["'\s]+$/g, "");

  if (selectedCategories.length === 0) {
    const discovery = await discoverBrandCategories(cleanBrand, cleanUrl, undefined, targetLocation);
    selectedCategories = discovery.categories
      .filter((c) => c.isAutoSelected)
      .map((c) => c.name)
      .slice(0, 4);
    if (selectedCategories.length === 0) {
      selectedCategories = discovery.categories.slice(0, 4).map((c) => c.name);
    }
  }

  // 1. Try Requesty AI Gateway first (Free 200 requests/day tier)
  if (getCleanRequestyKey()) {
    try {
      const prompts = await callRequestyForCategoryPrompts(cleanBrand, cleanUrl, selectedCategories, targetLocation);
      if (prompts && prompts.length > 0) {
        return prompts;
      }
    } catch (err) {
      console.warn("Requesty prompt generation failed, trying Gemini/OpenRouter fallback:", err);
    }
  }

  // 2. Try Gemini
  if (apiKey && apiKey.startsWith("AIza")) {
    try {
      const prompts = await callGeminiForCategoryPrompts(cleanBrand, cleanUrl, selectedCategories, apiKey, targetLocation);
      if (prompts && prompts.length > 0) {
        return prompts;
      }
    } catch (err) {
      console.warn("Gemini prompt generation failed, trying OpenRouter fallback:", err);
    }
  }

  // 3. Try OpenRouter
  const openRouterKey = (process.env.OPENROUTER_API_KEY || "").replace(/^["'\s]+|["'\s]+$/g, "");
  if (openRouterKey) {
    try {
      const prompts = await callOpenRouterForCategoryPrompts(cleanBrand, cleanUrl, selectedCategories, targetLocation);
      if (prompts && prompts.length > 0) {
        return prompts;
      }
    } catch (err) {
      console.warn("OpenRouter prompt generation failed, using dynamic prompt synthesis:", err);
    }
  }

  // 4. Dynamic Category Prompt Synthesis
  return generateDynamicCategoryPrompts(cleanBrand, selectedCategories, targetLocation);
}

/* ───────────────────────────────────────────────────────────────────────────
   3. LEGACY WRAPPER (Backwards Compatibility)
   ─────────────────────────────────────────────────────────────────────────── */
export async function generateBrandQueries(
  brandName: string,
  websiteUrl?: string,
  categoryHint?: string,
  targetLocation?: string
): Promise<GeneratedBrandIntel> {
  const cleanBrand = brandName.trim();
  const cleanUrl = websiteUrl ? websiteUrl.trim() : "";

  const categoryData = await discoverBrandCategories(cleanBrand, cleanUrl, categoryHint, targetLocation);
  const selectedCats = categoryData.categories
    .filter((c) => c.isAutoSelected)
    .map((c) => c.name);
  
  const prompts = await generateCategoryBuyerPrompts(
    cleanBrand,
    cleanUrl,
    selectedCats.length > 0 ? selectedCats : categoryData.categories.slice(0, 4).map(c => c.name),
    targetLocation
  );

  return {
    brandName: cleanBrand,
    websiteUrl: cleanUrl,
    category: categoryData.categories[0]?.name || "General Business & Technology",
    summary: categoryData.summary,
    categories: categoryData.categories,
    detectedCompetitors: categoryData.detectedCompetitors,
    suggestedQueries: prompts.map((p) => ({
      queryText: p.queryText,
      type: p.type,
      personaLabel: p.categoryTag || p.personaLabel,
      categoryTag: p.categoryTag,
    })),
  };
}

/* ───────────────────────────────────────────────────────────────────────────
   GEMINI API IMPLEMENTATIONS
   ─────────────────────────────────────────────────────────────────────────── */
async function callGeminiForCategoryDiscovery(
  brandName: string,
  websiteUrl: string,
  categoryHint: string | undefined,
  apiKey: string,
  targetLocation?: string
): Promise<CategoryDiscoveryResult | null> {
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const systemInstruction = `You are an expert market taxonomist and GEO strategist.
Analyze the target brand, domain, and website URL to identify the exact market vertical, industry, and full product/service offerings.
Generate 10 to 14 rich, granular, distinct, and industry-standard Business Categories that comprehensively describe what this business provides across its full catalog and capabilities (e.g. core categories, specialized product lines, customer segments, use cases, delivery models).
Auto-select the top 4-6 most relevant categories (isAutoSelected: true), and set the remaining categories to isAutoSelected: false so the user has a wide selection to choose from.
Also provide a 1-2 sentence brand summary and 4-6 real market competitors in that exact industry.${
    targetLocation
      ? `\nTarget Market / Location Focus: "${targetLocation}". Tailor business categories and market competitors for the ${targetLocation} market.`
      : ""
  }

Respond STRICTLY with valid JSON conforming to:
{
  "summary": "1-2 sentence accurate summary of what the brand actually does",
  "detectedCompetitors": ["Competitor 1", "Competitor 2", "Competitor 3", "Competitor 4"],
  "categories": [
    { "id": "cat-1", "name": "Primary Category Name", "isAutoSelected": true },
    { "id": "cat-2", "name": "Secondary Category Name", "isAutoSelected": true },
    { "id": "cat-3", "name": "Third Category Name", "isAutoSelected": true },
    { "id": "cat-4", "name": "Fourth Category Name", "isAutoSelected": true },
    { "id": "cat-5", "name": "Fifth Category Name", "isAutoSelected": false },
    { "id": "cat-6", "name": "Sixth Category Name", "isAutoSelected": false },
    { "id": "cat-7", "name": "Seventh Category Name", "isAutoSelected": false },
    { "id": "cat-8", "name": "Eighth Category Name", "isAutoSelected": false },
    { "id": "cat-9", "name": "Ninth Category Name", "isAutoSelected": false },
    { "id": "cat-10", "name": "Tenth Category Name", "isAutoSelected": false },
    { "id": "cat-11", "name": "Eleventh Category Name", "isAutoSelected": false },
    { "id": "cat-12", "name": "Twelfth Category Name", "isAutoSelected": false }
  ]
}`;

  const userPrompt = `Brand Name: "${brandName}"
Website URL: "${websiteUrl || "N/A"}"
${targetLocation ? `Target Location / Market: "${targetLocation}"` : ""}
${categoryHint ? `User Category Hint: "${categoryHint}"` : ""}

Generate the 10-14 business categories taxonomy and brand intel JSON now.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    return parseCategoryDiscoveryJson(rawText, brandName, websiteUrl);
  } finally {
    clearTimeout(timeout);
  }
}

async function callGeminiForCategoryPrompts(
  brandName: string,
  websiteUrl: string,
  selectedCategories: string[],
  apiKey: string,
  targetLocation?: string
): Promise<CategoryGroundedQuery[] | null> {
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const systemInstruction = `You are an expert search engine prober designing high-intent buyer queries for Generative Engine Optimization (GEO).
For each business category provided, generate a realistic, unbranded, high-intent buyer question that real buyers ask AI search engines (like Perplexity, ChatGPT, Claude, Gemini) when evaluating solutions in this category.

CRITICAL RULES:
1. Do NOT mention the brand name "${brandName}" inside the query questions. These must be unbranded buyer search questions.
2. The questions must be natural, comprehensive, and match real user intent for that category.
3. Provide exactly one high-quality query per category provided.${
    targetLocation
      ? `\n4. GEOGRAPHIC TARGETING: The target market is "${targetLocation}". Ground and tailor the buyer questions for searchers and organizations in "${targetLocation}" (e.g. including "in ${targetLocation}" or market-specific context where appropriate).`
      : `\n4. GLOBAL TARGETING: Do not hardcode or assume any specific country. Keep queries clean and universally applicable.`
  }

Respond STRICTLY with valid JSON conforming to:
{
  "prompts": [
    {
      "id": "prompt-1",
      "categoryTag": "Category Name",
      "queryText": "Realistic unbranded buyer question...",
      "type": "discovery",
      "personaLabel": "Category Search"
    }
  ]
}`;

  const userPrompt = `Target Brand: "${brandName}"
Website: "${websiteUrl || "N/A"}"
${targetLocation ? `Target Market / Location: "${targetLocation}"\n` : ""}Selected Categories:
${selectedCategories.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Generate high-intent buyer prompts JSON now.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    return parseCategoryPromptsJson(rawText);
  } finally {
    clearTimeout(timeout);
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   OPENROUTER IMPLEMENTATIONS
   ─────────────────────────────────────────────────────────────────────────── */
async function callOpenRouterForCategoryDiscovery(
  brandName: string,
  websiteUrl: string,
  categoryHint?: string,
  targetLocation?: string
): Promise<CategoryDiscoveryResult | null> {
  const systemPrompt = `You are an expert market taxonomist and GEO strategist.
Analyze the target brand, domain, and website URL to identify the exact market vertical, industry, and full product/service offerings.
Generate 10 to 14 rich, granular, distinct, and industry-standard Business Categories that comprehensively describe what this business provides across its full catalog and capabilities (e.g. core categories, specialized product lines, customer segments, use cases, delivery models).
${targetLocation ? `Target market / location focus: "${targetLocation}". Ground categories and competitors for this geography.` : ""}
Auto-select the top 4-6 most relevant categories (isAutoSelected: true), and set the remaining categories to isAutoSelected: false so the user can choose from up to 8 selections.
Also provide a 1-2 sentence accurate brand summary, and 4-6 real market competitors in that vertical.

Respond STRICTLY with valid JSON conforming to:
{
  "summary": "1-2 sentence accurate summary of what the brand actually does",
  "detectedCompetitors": ["Competitor 1", "Competitor 2", "Competitor 3", "Competitor 4"],
  "categories": [
    { "id": "cat-1", "name": "Primary Category Name", "isAutoSelected": true },
    { "id": "cat-2", "name": "Secondary Category Name", "isAutoSelected": true },
    { "id": "cat-3", "name": "Third Category Name", "isAutoSelected": true },
    { "id": "cat-4", "name": "Fourth Category Name", "isAutoSelected": true },
    { "id": "cat-5", "name": "Fifth Category Name", "isAutoSelected": false },
    { "id": "cat-6", "name": "Sixth Category Name", "isAutoSelected": false },
    { "id": "cat-7", "name": "Seventh Category Name", "isAutoSelected": false },
    { "id": "cat-8", "name": "Eighth Category Name", "isAutoSelected": false },
    { "id": "cat-9", "name": "Ninth Category Name", "isAutoSelected": false },
    { "id": "cat-10", "name": "Tenth Category Name", "isAutoSelected": false },
    { "id": "cat-11", "name": "Eleventh Category Name", "isAutoSelected": false },
    { "id": "cat-12", "name": "Twelfth Category Name", "isAutoSelected": false }
  ]
}`;

  const userPrompt = `Brand: "${brandName}", URL: "${websiteUrl || "N/A"}" ${targetLocation ? `Location: "${targetLocation}"` : ""} ${categoryHint ? `Hint: ${categoryHint}` : ""}`;

  const candidateModels = [
    "openai/gpt-4o-mini",
    "deepseek/deepseek-chat",
    "google/gemini-2.0-flash-001",
    "anthropic/claude-3.5-haiku"
  ];

  for (const m of candidateModels) {
    try {
      const res = await callOpenRouterChatCompletion({
        model: m,
        systemPrompt,
        userPrompt,
        timeoutMs: 10000,
      });

      if (res && res.content) {
        const parsed = parseCategoryDiscoveryJson(res.content, brandName, websiteUrl);
        if (parsed && parsed.categories.length > 0) {
          console.log(`[QuerySonar] Discovered categories for "${brandName}" via OpenRouter (${m}):`, parsed.categories.map(c => c.name));
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[QuerySonar] OpenRouter model ${m} failed for discovery:`, err);
    }
  }

  return null;
}

async function callOpenRouterForCategoryPrompts(
  brandName: string,
  websiteUrl: string,
  selectedCategories: string[],
  targetLocation?: string
): Promise<CategoryGroundedQuery[] | null> {
  const systemPrompt = `Generate unbranded high-intent buyer questions for each category. Do NOT mention "${brandName}". ${
    targetLocation
      ? `The target market is "${targetLocation}". Ground/tailor the buyer queries for searchers in ${targetLocation}.`
      : "Keep the queries clean and globally applicable without assuming any specific country."
  } Format as JSON:
{
  "prompts": [
    {
      "id": "p-1",
      "categoryTag": "Category Name",
      "queryText": "Question text...",
      "type": "discovery",
      "personaLabel": "Category Search"
    }
  ]
}`;

  const userPrompt = `Brand: ${brandName}\n${targetLocation ? `Target Location: ${targetLocation}\n` : ""}Categories:\n${selectedCategories.join("\n")}`;

  const candidateModels = ["openai/gpt-4o-mini", "deepseek/deepseek-chat", "google/gemini-2.0-flash-001"];

  for (const m of candidateModels) {
    try {
      const res = await callOpenRouterChatCompletion({
        model: m,
        systemPrompt,
        userPrompt,
        timeoutMs: 10000,
      });

      if (res && res.content) {
        const parsed = parseCategoryPromptsJson(res.content);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch {}
  }

  return null;
}

/* ───────────────────────────────────────────────────────────────────────────
   REQUESTY AI IMPLEMENTATIONS (200 Free Requests/Day Gateway)
   ─────────────────────────────────────────────────────────────────────────── */
async function callRequestyForCategoryDiscovery(
  brandName: string,
  websiteUrl: string,
  categoryHint?: string,
  targetLocation?: string
): Promise<CategoryDiscoveryResult | null> {
  const systemPrompt = `You are an expert market taxonomist and GEO strategist.
Analyze the target brand, domain, and website URL to identify the exact market vertical, industry, and full product/service offerings.
Generate 10 to 14 rich, granular, distinct, and industry-standard Business Categories that comprehensively describe what this business provides across its full catalog and capabilities (e.g. core categories, specialized product lines, customer segments, use cases, delivery models).
${targetLocation ? `Target market / location focus: "${targetLocation}". Ground categories and competitors for this geography.` : ""}
Auto-select the top 4-6 most relevant categories (isAutoSelected: true), and set the remaining categories to isAutoSelected: false so the user can choose from up to 8 selections.
Also provide a 1-2 sentence accurate brand summary, and 4-6 real market competitors in that vertical.

Respond STRICTLY with valid JSON conforming to:
{
  "summary": "1-2 sentence accurate summary of what the brand actually does",
  "detectedCompetitors": ["Competitor 1", "Competitor 2", "Competitor 3", "Competitor 4"],
  "categories": [
    { "id": "cat-1", "name": "Primary Category Name", "isAutoSelected": true },
    { "id": "cat-2", "name": "Secondary Category Name", "isAutoSelected": true },
    { "id": "cat-3", "name": "Third Category Name", "isAutoSelected": true },
    { "id": "cat-4", "name": "Fourth Category Name", "isAutoSelected": true },
    { "id": "cat-5", "name": "Fifth Category Name", "isAutoSelected": false },
    { "id": "cat-6", "name": "Sixth Category Name", "isAutoSelected": false },
    { "id": "cat-7", "name": "Seventh Category Name", "isAutoSelected": false },
    { "id": "cat-8", "name": "Eighth Category Name", "isAutoSelected": false },
    { "id": "cat-9", "name": "Ninth Category Name", "isAutoSelected": false },
    { "id": "cat-10", "name": "Tenth Category Name", "isAutoSelected": false },
    { "id": "cat-11", "name": "Eleventh Category Name", "isAutoSelected": false },
    { "id": "cat-12", "name": "Twelfth Category Name", "isAutoSelected": false }
  ]
}`;

  const userPrompt = `Brand: "${brandName}", URL: "${websiteUrl || "N/A"}" ${targetLocation ? `Location: "${targetLocation}"` : ""} ${categoryHint ? `Hint: ${categoryHint}` : ""}`;

  const candidateModels = [
    "mistral/leanstral-1-5",
    "google/gemma-4-31b-it",
    "nvidia/nemotron-3-nano-30b-a3b"
  ];

  for (const m of candidateModels) {
    try {
      const res = await callRequestyChatCompletion({
        model: m,
        systemPrompt,
        userPrompt,
        maxTokens: 2000,
        timeoutMs: 25000,
      });

      if (res && res.content) {
        const parsed = parseCategoryDiscoveryJson(res.content, brandName, websiteUrl);
        if (parsed && parsed.categories.length > 0) {
          console.log(`[QuerySonar] Discovered categories for "${brandName}" via Requesty (${m}):`, parsed.categories.map(c => c.name));
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[QuerySonar] Requesty model ${m} failed for discovery:`, err);
    }
  }

  return null;
}

async function callRequestyForCategoryPrompts(
  brandName: string,
  websiteUrl: string,
  selectedCategories: string[],
  targetLocation?: string
): Promise<CategoryGroundedQuery[] | null> {
  const systemPrompt = `Generate unbranded high-intent buyer questions for each category. Do NOT mention "${brandName}". ${
    targetLocation
      ? `The target market is "${targetLocation}". Ground/tailor the buyer queries for searchers in ${targetLocation}.`
      : "Keep the queries clean and globally applicable without assuming any specific country."
  } Format as JSON:
{
  "prompts": [
    {
      "id": "p-1",
      "categoryTag": "Category Name",
      "queryText": "Question text...",
      "type": "discovery",
      "personaLabel": "Category Search"
    }
  ]
}`;

  const userPrompt = `Brand: ${brandName}\n${targetLocation ? `Target Location: ${targetLocation}\n` : ""}Categories:\n${selectedCategories.join("\n")}`;

  const candidateModels = [
    "mistral/leanstral-1-5",
    "google/gemma-4-31b-it",
    "nvidia/nemotron-3-nano-30b-a3b"
  ];

  for (const m of candidateModels) {
    try {
      const res = await callRequestyChatCompletion({
        model: m,
        systemPrompt,
        userPrompt,
        timeoutMs: 25000,
      });

      if (res && res.content) {
        const parsed = parseCategoryPromptsJson(res.content);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch {}
  }

  return null;
}

/* ───────────────────────────────────────────────────────────────────────────
   JSON PARSERS
   ─────────────────────────────────────────────────────────────────────────── */
function parseCategoryDiscoveryJson(
  rawText: string,
  brandName: string,
  websiteUrl?: string
): CategoryDiscoveryResult | null {
  try {
    const cleanJson = rawText
      .replace(/```(?:json)?/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const rawCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
    const categories: BusinessCategoryItem[] = rawCategories
      .map((c: any, idx: number) => {
        if (typeof c === "string" && c.trim()) {
          return {
            id: `cat-${idx + 1}`,
            name: c.trim(),
            isAutoSelected: idx < 4,
            confidence: 0.95,
          };
        }
        if (c && typeof c === "object" && typeof (c as Record<string, unknown>).name === "string" && (c as Record<string, unknown>).name) {
          const item = c as Record<string, unknown>;
          return {
            id: (item.id as string) || `cat-${idx + 1}`,
            name: (item.name as string).trim(),
            isAutoSelected: Boolean(item.isAutoSelected),
            confidence: typeof item.confidence === "number" ? item.confidence : 0.9,
          };
        }
        return null;
      })
      .filter((c: any): c is BusinessCategoryItem => c !== null);

    if (categories.length === 0) {
      return null;
    }

    const selectedCount = categories.filter((c) => c.isAutoSelected).length;
    if (selectedCount === 0) {
      categories.slice(0, 4).forEach((c) => (c.isAutoSelected = true));
    }

    return {
      brandName,
      websiteUrl,
      summary: parsed.summary || `${brandName} product ecosystem and market solutions.`,
      detectedCompetitors: Array.isArray(parsed.detectedCompetitors)
        ? (parsed.detectedCompetitors as unknown[]).filter((x): x is string => typeof x === "string" && Boolean(x.trim()))
        : [],
      categories,
    };
  } catch {
    return null;
  }
}

function parseCategoryPromptsJson(rawText: string): CategoryGroundedQuery[] | null {
  try {
    const cleanJson = rawText
      .replace(/```(?:json)?/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed || !Array.isArray(parsed.prompts) || parsed.prompts.length === 0) {
      return null;
    }

    return (parsed.prompts as Array<Record<string, unknown>>)
      .filter((p) => p && typeof p.queryText === "string" && (p.queryText as string).trim())
      .map((p, idx) => ({
        id: (p.id as string) || `prompt-${idx + 1}`,
        categoryTag: (p.categoryTag as string) || "General",
        queryText: (p.queryText as string).trim(),
        type: ["discovery", "comparison", "alternative", "feature", "workflow", "enterprise"].includes(p.type as string)
          ? (p.type as QueryPersonaType)
          : "discovery",
        personaLabel: (p.personaLabel as string) || (p.categoryTag as string) || "Buyer Search",
      }));
  } catch {
    return null;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   DYNAMIC MULTI-INDUSTRY SEMANTIC SYNTHESIS
   ─────────────────────────────────────────────────────────────────────────── */

function extractDomainKeywords(url?: string): string[] {
  if (!url) return [];
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const host = parsed.hostname.replace(/^www\./, "");
    const parts = host.split(".")[0].split(/[-_]/);
    return parts.filter(Boolean);
  } catch {
    return [];
  }
}

function formatBrandTitle(name: string): string {
  return name
    .split(/[\s-_]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function generateDynamicCategoryDiscovery(
  brandName: string,
  websiteUrl?: string,
  categoryHint?: string
): CategoryDiscoveryResult {
  const brandTitle = formatBrandTitle(brandName);
  const domainTokens = extractDomainKeywords(websiteUrl);
  const combined = `${brandName.toLowerCase()} ${domainTokens.join(" ")} ${(websiteUrl || "").toLowerCase()} ${(categoryHint || "").toLowerCase()}`;

  // 1. SMARTPHONES, MOBILE DEVICES & TELECOM HARDWARE
  if (/lava|mobile|phone|smartphone|handset|android|xiaomi|redmi|oppo|vivo|realme|motorola|oneplus|nokia|samsung|pixel|cellular|5g phone/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} is a mobile device and consumer electronics brand specializing in smartphones, feature phones, and connected mobility hardware.`,
      detectedCompetitors: ["Xiaomi", "Realme", "Samsung", "Motorola", "POCO"],
      categories: [
        { id: "cat-1", name: "Smartphones & Mobile Devices", isAutoSelected: true },
        { id: "cat-2", name: "Budget & Mid-Range Android Phones", isAutoSelected: true },
        { id: "cat-3", name: "5G Smartphones & Feature Phones", isAutoSelected: true },
        { id: "cat-4", name: "Mobile Accessories & Wearables", isAutoSelected: true },
        { id: "cat-5", name: "Consumer Electronics & Gadgets", isAutoSelected: false },
        { id: "cat-6", name: "Handset Manufacturing & Hardware", isAutoSelected: false },
        { id: "cat-7", name: "Affordable Tech & Battery-Centric Phones", isAutoSelected: false },
        { id: "cat-8", name: "Mobile Ecosystem & Connected Devices", isAutoSelected: false },
      ],
    };
  }

  // 2. CONSUMER ELECTRONICS, AUDIO, COMPUTING & GADGETS
  if (/electronic|audio|headphone|earbud|speaker|soundbar|laptop|tablet|camera|display|monitor|gadget|smart home|appliance|boat|sony|bose|logitech|asus|acer|lenovo/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} provides consumer electronics, smart audio gear, and personal computing hardware.`,
      detectedCompetitors: ["Sony", "boAt", "Logitech", "JBL", "Noise"],
      categories: [
        { id: "cat-1", name: "Consumer Electronics & Gadgets", isAutoSelected: true },
        { id: "cat-2", name: "Wireless Audio & Earbuds", isAutoSelected: true },
        { id: "cat-3", name: "Smart Wearables & Tech Accessories", isAutoSelected: true },
        { id: "cat-4", name: "Personal Computing & Peripherals", isAutoSelected: true },
        { id: "cat-5", name: "Smart Home Devices", isAutoSelected: false },
        { id: "cat-6", name: "Audio & Entertainment Systems", isAutoSelected: false },
      ],
    };
  }

  // 3. CRM, SALES EXECUTION & MARKETING AUTOMATION
  if (/leadsquared|salesforce|hubspot|crm|lead|pipeline|pipedrive|freshsales|sales execution|outreach|apollo|zoho/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} is a sales execution, CRM, and marketing automation platform built for high-growth teams.`,
      detectedCompetitors: ["Salesforce", "HubSpot", "Zoho CRM", "Freshsales", "Pipedrive"],
      categories: [
        { id: "cat-1", name: "CRM Software", isAutoSelected: true },
        { id: "cat-2", name: "Lead Management Software", isAutoSelected: true },
        { id: "cat-3", name: "Marketing Automation Platforms", isAutoSelected: true },
        { id: "cat-4", name: "Sales Execution Platforms", isAutoSelected: true },
        { id: "cat-5", name: "Field Sales & Mobile CRM", isAutoSelected: false },
        { id: "cat-6", name: "Enterprise Workflow Automation", isAutoSelected: false },
        { id: "cat-7", name: "Customer Journey Tracking", isAutoSelected: false },
      ],
    };
  }

  // 4. EMPLOYEE EXPERIENCE, INTRANET & INTERNAL COMMUNICATIONS
  if (/simpplr|intranet|workplace|employee|internal comm|staffbase|unily|guru|workvivo/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} is an AI-powered employee experience and modern intranet platform connecting distributed workforces.`,
      detectedCompetitors: ["Unily", "Staffbase", "Guru", "Workvivo"],
      categories: [
        { id: "cat-1", name: "Employee Experience Platforms", isAutoSelected: true },
        { id: "cat-2", name: "Intranet Software", isAutoSelected: true },
        { id: "cat-3", name: "Internal Communications Software", isAutoSelected: true },
        { id: "cat-4", name: "Enterprise Search Software", isAutoSelected: true },
        { id: "cat-5", name: "Digital Workplace Platforms", isAutoSelected: false },
        { id: "cat-6", name: "Employee Engagement Software", isAutoSelected: false },
      ],
    };
  }

  // 5. CUSTOMER SUPPORT & HELPDESK
  if (/zendesk|intercom|freshdesk|helpdesk|customer support|ticketing|customer service|front|gorgias/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} provides customer support, omnichannel ticketing, and service automation solutions.`,
      detectedCompetitors: ["Zendesk", "Intercom", "Freshdesk", "Salesforce Service Cloud"],
      categories: [
        { id: "cat-1", name: "Customer Service Software", isAutoSelected: true },
        { id: "cat-2", name: "Help Desk & Ticketing Platforms", isAutoSelected: true },
        { id: "cat-3", name: "Omnichannel Messaging Platforms", isAutoSelected: true },
        { id: "cat-4", name: "Customer Success Platforms", isAutoSelected: true },
        { id: "cat-5", name: "AI Agent & Support Automation", isAutoSelected: false },
      ],
    };
  }

  // 6. FINTECH, BANKING & PAYMENTS
  if (/fintech|bank|payment|stripe|plaid|revolut|razorpay|credit|loan|invest|wealth|crypto|insurance|wallet|trading|finance/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} provides financial technology, payment processing, and digital banking infrastructure.`,
      detectedCompetitors: ["Stripe", "PayPal", "Plaid", "Razorpay", "Adyen"],
      categories: [
        { id: "cat-1", name: "Payment Processing & Gateways", isAutoSelected: true },
        { id: "cat-2", name: "Digital Banking & Financial Services", isAutoSelected: true },
        { id: "cat-3", name: "Billing & Subscription Management", isAutoSelected: true },
        { id: "cat-4", name: "Fraud Prevention & Financial Security", isAutoSelected: true },
        { id: "cat-5", name: "Embedded Finance & BaaS", isAutoSelected: false },
      ],
    };
  }

  // 7. FOOD, RESTAURANTS, QSR & ON-DEMAND DELIVERY (e.g. Swiggy, Zomato, Burger Singh, McDonald's, DoorDash)
  if (/food|burger|pizza|restaurant|dining|swiggy|zomato|eats|doordash|instacart|zepto|blinkit|kitchen|cafe|bakery|snack|beverage|delivery|qsr|fastfood/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} is a leading brand in food service, quick dining, and on-demand delivery solutions.`,
      detectedCompetitors: ["Zomato", "McDonald's", "Burger King", "Domino's", "Zepto"],
      categories: [
        { id: "cat-1", name: "Online Food Delivery & Ordering", isAutoSelected: true },
        { id: "cat-2", name: "Quick Service Restaurants (QSR)", isAutoSelected: true },
        { id: "cat-3", name: "Fast Food & Cloud Kitchens", isAutoSelected: true },
        { id: "cat-4", name: "Instant Grocery & Hyperlocal Delivery", isAutoSelected: true },
        { id: "cat-5", name: "Restaurant Dining & Deals", isAutoSelected: false },
        { id: "cat-6", name: "Customer Loyalty & Express Delivery", isAutoSelected: false },
      ],
    };
  }

  // 8. E-COMMERCE & RETAIL
  if (/ecommerce|retail|cloth|fashion|store|shop|shoe|sneaker|wear|apparel|beauty|cosmetic|shopify|bigcommerce/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} offers consumer retail products and direct-to-consumer digital commerce solutions.`,
      detectedCompetitors: ["Shopify", "Amazon", "Nike", "Zara"],
      categories: [
        { id: "cat-1", name: "Direct-to-Consumer (D2C) Brand", isAutoSelected: true },
        { id: "cat-2", name: "Online Retail & Shopping", isAutoSelected: true },
        { id: "cat-3", name: "Consumer Goods & Lifestyle Products", isAutoSelected: true },
        { id: "cat-4", name: "E-Commerce Experience & Loyalty", isAutoSelected: true },
        { id: "cat-5", name: "Sustainable & Premium Manufacturing", isAutoSelected: false },
      ],
    };
  }

  // 8. HEALTHCARE & WELLNESS
  if (/health|medical|clinic|doctor|pharma|wellness|care|hospital|diagnostic|fitness|therapy/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} provides healthcare, medical services, and health-tech solutions.`,
      detectedCompetitors: ["Teladoc", "Epic Systems", "Cerner", "One Medical"],
      categories: [
        { id: "cat-1", name: "Healthcare & Medical Services", isAutoSelected: true },
        { id: "cat-2", name: "Digital Health & Telemedicine", isAutoSelected: true },
        { id: "cat-3", name: "Patient Care & Clinical Management", isAutoSelected: true },
        { id: "cat-4", name: "Health & Wellness Solutions", isAutoSelected: true },
        { id: "cat-5", name: "Medical Devices & Diagnostics", isAutoSelected: false },
      ],
    };
  }

  // 9. EDUCATION & EDTECH
  if (/edu|school|academy|course|learn|teach|university|student|tutor|edtech|coursera|udemy|duolingo/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} offers educational programs, learning technology, and online training platforms.`,
      detectedCompetitors: ["Coursera", "Udemy", "Duolingo", "Khan Academy"],
      categories: [
        { id: "cat-1", name: "Online Learning & EdTech", isAutoSelected: true },
        { id: "cat-2", name: "Course & Skills Certification", isAutoSelected: true },
        { id: "cat-3", name: "Educational Content & Training", isAutoSelected: true },
        { id: "cat-4", name: "Interactive Learning Platforms", isAutoSelected: true },
        { id: "cat-5", name: "Higher Education & Career Prep", isAutoSelected: false },
      ],
    };
  }

  // 10. AUTOMOTIVE & MOBILITY
  if (/auto|car|vehicle|motor|ev|electric vehicle|drive|transport|tesla|rivian|ford|bmw|mobility/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} operates in the automotive, electric vehicle, and mobility solutions space.`,
      detectedCompetitors: ["Tesla", "Rivian", "BMW", "Ford", "Hyundai"],
      categories: [
        { id: "cat-1", name: "Automotive & Electric Vehicles", isAutoSelected: true },
        { id: "cat-2", name: "Connected Cars & Smart Mobility", isAutoSelected: true },
        { id: "cat-3", name: "Vehicle Performance & Technology", isAutoSelected: true },
        { id: "cat-4", name: "Automotive Accessories & Services", isAutoSelected: true },
        { id: "cat-5", name: "Sustainable Transport Solutions", isAutoSelected: false },
      ],
    };
  }

  // 11. DEVELOPER TOOLS, CLOUD & INFRASTRUCTURE
  if (/dev|code|infra|cloud|api|database|supabase|github|gitlab|vercel|render|aws|docker|kubernetes/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} provides developer tools, cloud infrastructure, and software engineering platforms.`,
      detectedCompetitors: ["Supabase", "Firebase", "GitHub", "AWS", "Vercel"],
      categories: [
        { id: "cat-1", name: "Developer Tools & Platforms", isAutoSelected: true },
        { id: "cat-2", name: "Cloud Infrastructure & Hosting", isAutoSelected: true },
        { id: "cat-3", name: "API & Backend Services", isAutoSelected: true },
        { id: "cat-4", name: "DevOps & Deployment Automation", isAutoSelected: true },
        { id: "cat-5", name: "Database & Data Infrastructure", isAutoSelected: false },
      ],
    };
  }

  // 12. PROJECT & TEAM COLLABORATION
  if (/jira|asana|monday|clickup|notion|trello|linear|project mgmt|task mgmt|sprint/i.test(combined)) {
    return {
      brandName,
      websiteUrl,
      summary: `${brandTitle} provides project management and team collaboration software.`,
      detectedCompetitors: ["Jira", "Asana", "Monday.com", "ClickUp", "Linear"],
      categories: [
        { id: "cat-1", name: "Project Management Software", isAutoSelected: true },
        { id: "cat-2", name: "Task & Sprint Management", isAutoSelected: true },
        { id: "cat-3", name: "Agile Workflow & Issue Tracking", isAutoSelected: true },
        { id: "cat-4", name: "Collaborative Workspaces", isAutoSelected: true },
        { id: "cat-5", name: "Team Productivity Tools", isAutoSelected: false },
      ],
    };
  }

  // 13. DYNAMIC SYNTHESIS FOR ANY OTHER BRAND (Extract tokens, NO forced SaaS/Salesforce)
  const primaryCategory = categoryHint || (domainTokens.length > 0 ? `${formatBrandTitle(domainTokens[0])} Solutions` : `${brandTitle} Products & Services`);

  return {
    brandName,
    websiteUrl,
    summary: `${brandTitle} provides market-leading solutions, products, and services for customers.`,
    detectedCompetitors: [],
    categories: [
      { id: "cat-1", name: primaryCategory, isAutoSelected: true },
      { id: "cat-2", name: `${brandTitle} Solutions & Platforms`, isAutoSelected: true },
      { id: "cat-3", name: "Top Industry Alternatives & Options", isAutoSelected: true },
      { id: "cat-4", name: "Product Quality & User Ratings", isAutoSelected: true },
      { id: "cat-5", name: "Reliability, Pricing & Value", isAutoSelected: false },
      { id: "cat-6", name: "Next-Gen Features & Capabilities", isAutoSelected: false },
    ],
  };
}

export function generateDynamicCategoryPrompts(
  brandName: string,
  selectedCategories: string[],
  targetLocation?: string
): CategoryGroundedQuery[] {
  const locSuffix = targetLocation ? ` in ${targetLocation}` : "";
  const locClause = targetLocation ? ` for organizations in ${targetLocation}` : "";

  const promptTemplates: Record<string, string> = {
    // Mobile & Hardware
    "Smartphones & Mobile Devices":
      `What are the best smartphone brands${locSuffix} in 2026 for build quality, battery life, and overall performance?`,
    "Budget & Mid-Range Android Phones":
      `What are the top recommended budget and mid-range Android smartphones${locSuffix} in 2026?`,
    "5G Smartphones & Feature Phones":
      `Which affordable 5G smartphones offer the best value, camera quality, and long-lasting battery life${locSuffix}?`,
    "Mobile Accessories & Wearables":
      `What are the best mobile phone accessories and smart wearable devices${locSuffix} for everyday productivity?`,
    "Consumer Electronics & Gadgets":
      `What are the top consumer electronics and gadget brands${locSuffix} with the highest buyer satisfaction?`,
    "Handset Manufacturing & Hardware":
      `Compare top mobile handset manufacturers${locSuffix} for durability, processor speed, and competitive pricing.`,
    "Affordable Tech & Battery-Centric Phones":
      `Which mobile phones offer the largest battery capacity and fastest charging under budget constraints${locSuffix}?`,
    "Wireless Audio & Earbuds":
      `What are the top rated true wireless earbuds (TWS)${locSuffix} for sound quality and active noise cancellation?`,
    "Personal Computing & Peripherals":
      `Compare the best laptops and computing peripherals${locSuffix} for productivity and everyday use.`,

    // CRM & Sales
    "CRM Software":
      `What are the top rated CRM software for high-velocity sales teams${locSuffix} in 2026?`,
    "Lead Management Software":
      `What are the best lead management and tracking platforms with automated distribution and scoring${locSuffix}?`,
    "Marketing Automation Platforms":
      `Which marketing automation platforms provide the best enterprise email, landing page, and journey builder features${locSuffix}?`,
    "Sales Execution Platforms":
      `Compare top sales execution and CRM platforms that maximize rep productivity and pipeline visibility${locSuffix}.`,
    "Field Sales & Mobile CRM":
      `What are the best mobile CRM and field sales tracking solutions for distributed reps${locSuffix}?`,
    "Enterprise Workflow Automation":
      `What are the most recommended enterprise workflow automation platforms for mid-market and enterprise organizations${locSuffix}?`,
    "Customer Journey Tracking":
      `Which platforms offer the best end-to-end customer journey tracking and conversion attribution${locSuffix}?`,

    // Intranet & Workplace
    "Employee Experience Platforms":
      `Can you recommend an employee experience platform for a large, distributed organization${locClause} that combines engagement, communications, knowledge, and workflows?`,
    "Intranet Software":
      `What are the most recommended intranet software platforms${locSuffix} for personalized employee communications and trusted knowledge sharing?`,
    "Internal Communications Software":
      `I need internal communications software${locClause} that supports multichannel messaging, employee engagement, and change management—what would you recommend?`,
    "Enterprise Search Software":
      `Compare enterprise search software for large organizations${locClause} that need AI-powered answers and governed, trusted workplace knowledge.`,
    "Digital Workplace Platforms":
      `What are the top digital workplace platforms that unify employee apps, announcements, and intranet resources${locSuffix}?`,
    "Employee Engagement Software":
      `Which employee engagement software solutions offer the highest adoption rates and automated sentiment analytics${locSuffix}?`,

    // Customer Service
    "Customer Service Software":
      `What are the best enterprise customer service and omnichannel ticketing platforms${locSuffix} in 2026?`,
    "Help Desk & Ticketing Platforms":
      `What are the top help desk platforms for fast resolution and AI agent automation${locSuffix}?`,
    "Omnichannel Messaging Platforms":
      `Which customer support platforms offer the best unified inbox for WhatsApp, chat, and email${locSuffix}?`,
    "Customer Success Platforms":
      `Which customer success platforms offer the best health scoring and churn reduction telemetry${locSuffix}?`,

    // Fintech
    "Payment Processing & Gateways":
      `What are the best payment processing gateways${locSuffix} with high authorization rates and low fees?`,
    "Digital Banking & Financial Services":
      `Compare the top digital banking platforms and fintech solutions for modern business operations${locSuffix}.`,
    "Billing & Subscription Management":
      `What are the top subscription billing and recurring invoice platforms${locSuffix} in 2026?`,

    // E-Commerce
    "Direct-to-Consumer (D2C) Brand":
      `What are the top rated direct-to-consumer brands${locSuffix} with the best product quality and customer loyalty?`,
    "Online Retail & Shopping":
      `What are the most reliable online shopping and digital commerce brands${locSuffix} in 2026?`,
    "Consumer Goods & Lifestyle Products":
      `Which consumer lifestyle brands offer the highest product durability and buyer ratings${locSuffix}?`,

    // Healthcare
    "Healthcare & Medical Services":
      `What are the leading healthcare and medical service providers${locSuffix} known for patient care excellence?`,
    "Digital Health & Telemedicine":
      `Which digital health and telemedicine platforms provide the fastest doctor consultations and best care${locSuffix}?`,

    // Education
    "Online Learning & EdTech":
      `What are the best online learning and course certification platforms${locSuffix} in 2026?`,
    "Course & Skills Certification":
      `Compare the top educational platforms for career advancement and professional skill certifications${locSuffix}.`,

    // Automotive
    "Automotive & Electric Vehicles":
      `What are the top rated electric vehicles and automotive brands for range, safety, and reliability${locSuffix} in 2026?`,
    "Connected Cars & Smart Mobility":
      `Compare the best smart automotive and connected vehicle technologies available today${locSuffix}.`,

    // Developer Tools
    "Developer Tools & Platforms":
      `What are the best developer productivity tools and platforms${locSuffix} in 2026 for high-velocity engineering?`,
    "Cloud Infrastructure & Hosting":
      `Compare the most reliable cloud hosting and serverless infrastructure providers${locSuffix} in 2026.`,
    "API & Backend Services":
      `What is the best modern backend-as-a-service platform with built-in auth, database, and edge functions${locSuffix}?`,
  };

  return selectedCategories.map((cat, idx) => {
    let queryText = promptTemplates[cat];
    if (!queryText) {
      const cleanCat = cat.replace(/[^\w\s&–-]/g, "").trim();
      queryText = `What are the top rated and most recommended options for ${cleanCat.toLowerCase()}${locSuffix} in 2026?`;
    }

    return {
      id: `prompt-${idx + 1}`,
      categoryTag: cat,
      queryText,
      type: "discovery",
      personaLabel: cat,
    };
  });
}
