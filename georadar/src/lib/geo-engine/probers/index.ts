import { Engine, EngineProber } from "../types";
import { PerplexityProber } from "./perplexity";
import { GeminiProber } from "./gemini";
import { OpenAIProber } from "./openai";
import { ClaudeProber } from "./claude";
import { DeepSeekProber } from "./deepseek";
import { GrokProber } from "./grok";

export { PerplexityProber } from "./perplexity";
export { GeminiProber } from "./gemini";
export { OpenAIProber } from "./openai";
export { ClaudeProber } from "./claude";
export { DeepSeekProber } from "./deepseek";
export { GrokProber } from "./grok";

export function createProber(engine: Engine): EngineProber {
  switch (engine) {
    case "perplexity":
      return new PerplexityProber();
    case "gemini":
      return new GeminiProber();
    case "openai":
      return new OpenAIProber();
    case "claude":
      return new ClaudeProber();
    case "deepseek":
      return new DeepSeekProber();
    case "grok":
      return new GrokProber();
    default:
      return new GeminiProber();
  }
}
