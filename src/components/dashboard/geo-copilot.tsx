"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  ArrowRight,
  ShieldAlert,
  Layers,
  Zap,
} from "lucide-react";
import type { AuditResult } from "@/lib/geo-engine/types";
import { useTranslation } from "@/lib/i18n/language-context";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  meta?: string;
  breakdown?: Array<{ label: string; value: string }>;
  suggestedActions?: string[];
  timestamp?: string;
}

interface GeoCopilotProps {
  audit: AuditResult | null;
  className?: string;
}

export function GeoCopilot({ audit, className = "" }: GeoCopilotProps) {
  const { t } = useTranslation();
  const brandName = audit?.brandProfile?.name || "Your Brand";
  const competitors = audit?.brandProfile?.competitors || [];
  const hasScan = Boolean(audit);

  const initialGreeting: ChatMessage = {
    id: "init-1",
    sender: "copilot",
    text: hasScan
      ? `Hello! I'm your **QuerySonar AI Copilot**. I have analyzed the live audit data for **${brandName}**. Ask me anything about your rankings across ChatGPT, Gemini, Perplexity, Claude, DeepSeek, and Grok, or how to displace your competitors.`
      : `Welcome! I'm your **QuerySonar AI Copilot**. Launch your brand audit on the left to start analyzing how AI answer engines evaluate and recommend your brand.`,
    breakdown: hasScan && audit?.shareOfVoice?.perEngine
      ? Object.entries(audit.shareOfVoice.perEngine).map(([eng, score]) => ({
          label: eng === "openai" ? "ChatGPT" : eng.charAt(0).toUpperCase() + eng.slice(1),
          value: `${score}% SOV`,
        }))
      : undefined,
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  // Dynamic quick-prompt chips based on live audit data
  const promptChips = React.useMemo(() => {
    const chips: string[] = ["Explain My Dashboard"];

    if (competitors.length > 0) {
      chips.push(`How to outrank ${competitors[0]}?`);
    } else {
      chips.push("Competitor Displacement Strategy");
    }

    const blockedBots = audit?.technicalGeo?.blockedAiBots || [];
    if (blockedBots.length > 0) {
      chips.push("Fix Blocked AI Crawlers");
    } else {
      chips.push("Robots.txt & Schema Check");
    }

    chips.push("Reddit & Citation Blueprint");
    return chips;
  }, [audit, competitors]);

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      // fallback
    }
  };

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          auditContext: audit,
          history: chatMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();

      if (data.success && data.reply) {
        const copilotMsg: ChatMessage = {
          id: `copilot-${Date.now()}`,
          sender: "copilot",
          text: data.reply,
          breakdown: data.breakdown,
          suggestedActions: data.suggestedActions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setChatMessages((prev) => [...prev, copilotMsg]);
      } else {
        throw new Error(data.error || "Failed to generate Copilot response");
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "copilot",
        text: `I encountered a temporary issue connecting to the reasoning pipeline. Here is a baseline recommendation for **${brandName}**: Ensure your core value propositions are published with structured HTML tables and verified across third-party review platforms (G2, Capterra, Reddit).`,
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleResetChat = () => {
    setChatMessages([initialGreeting]);
  };

  // Helper to render markdown-like structures inside chat bubbles
  const renderMessageContent = (text: string, msgId: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLang = "";

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Code block start/end
      if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = trimmed.replace("```", "").trim();
          codeContent = [];
        } else {
          inCodeBlock = false;
          const codeString = codeContent.join("\n");
          const blockId = `${msgId}-code-${idx}`;
          elements.push(
            <div
              key={blockId}
              className="my-2.5 rounded-xl bg-neutral-950 border border-[var(--syn-border)] overflow-hidden shadow-inner text-left"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] font-mono text-neutral-400">
                <span>{codeLang || "code"}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeString, blockId)}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCodeId === blockId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                {codeString}
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Headings
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4 key={idx} className="font-bold text-xs text-[var(--syn-heading)] mt-2 mb-1">
            {renderInlineBold(trimmed.replace(/^###\s+/, ""))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith("#### ")) {
        elements.push(
          <h5 key={idx} className="font-semibold text-[11px] text-[var(--syn-heading)] mt-1.5 mb-0.5 font-mono uppercase tracking-wider">
            {renderInlineBold(trimmed.replace(/^####\s+/, ""))}
          </h5>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        elements.push(
          <div key={idx} className="flex items-start gap-1.5 my-0.5 text-xs">
            <span className="text-emerald-500 font-bold mt-0.5">&bull;</span>
            <span className="flex-1">{renderInlineBold(trimmed.replace(/^[\*\-]\s+/, ""))}</span>
          </div>
        );
        return;
      }

      // Numbered lists
      if (/^\d+\.\s+/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (match) {
          elements.push(
            <div key={idx} className="flex items-start gap-1.5 my-1 text-xs">
              <span className="font-mono font-bold text-emerald-500 text-[11px] shrink-0">
                {match[1]}.
              </span>
              <span className="flex-1">{renderInlineBold(match[2])}</span>
            </div>
          );
          return;
        }
      }

      // Regular paragraph
      if (trimmed) {
        elements.push(
          <p key={idx} className="my-1 text-xs leading-relaxed">
            {renderInlineBold(trimmed)}
          </p>
        );
      }
    });

    return elements;
  };

  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {parts.map((part, idx) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
            return (
              <strong key={idx} className="font-bold text-[var(--syn-heading)]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        })}
      </>
    );
  };

  return (
    <div className={`syn-card flex flex-col h-[480px] lg:h-[calc(100vh-21rem)] lg:min-h-[420px] lg:max-h-[calc(100vh-8rem)] justify-between relative overflow-hidden ${className}`}>
      {/* ── Copilot Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[var(--syn-border)] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#86EFAC]/20 border border-[#86EFAC]/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-[var(--syn-heading)]">
                GEO Optimization Copilot
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-[var(--syn-muted)] block">
              {hasScan ? `Active Context: ${brandName}` : "AI Copilot Online"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-subtle)] border border-transparent hover:border-[var(--syn-border)] transition-all cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="syn-badge syn-badge-emerald text-[10px]">Active</span>
        </div>
      </div>

      {/* ── Message Thread ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-3 pr-1 text-xs">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed shadow-xs ${
                msg.sender === "user"
                  ? "bg-[#86EFAC] text-neutral-950 font-medium rounded-tr-xs"
                  : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-heading)] rounded-tl-xs"
              }`}
            >
              {msg.sender === "user" ? (
                <p className="text-xs font-medium">{msg.text}</p>
              ) : (
                renderMessageContent(msg.text, msg.id)
              )}

              {/* Key-Value Breakdown Table */}
              {msg.breakdown && msg.breakdown.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[var(--syn-border)] space-y-1 text-[11px] font-mono">
                  {msg.breakdown.map((item, bIdx) => (
                    <div key={bIdx} className="flex items-center justify-between gap-2">
                      <span className="text-[var(--syn-muted)]">{item.label}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actionable Suggestions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[var(--syn-border)] flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      type="button"
                      onClick={() => sendMessage(act)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--syn-card-subtle)] hover:bg-[var(--syn-card)] border border-[var(--syn-border)] text-[10px] font-semibold text-[var(--syn-heading)] transition-all cursor-pointer"
                    >
                      <span>{act}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-emerald-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Real-time Typing / Analyzing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 animate-in fade-in duration-150">
            <div className="p-3 rounded-2xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-muted)] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span className="text-xs font-mono">Analyzing scan context...</span>
              <div className="flex items-center gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Prompt Chips ─────────────────────────────────── */}
      <div className="py-2 border-t border-[var(--syn-border)] flex items-center gap-1.5 overflow-x-auto text-[10px] text-[var(--syn-muted)] shrink-0 no-scrollbar">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => sendMessage(chip)}
            className={`px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 disabled:opacity-50 ${
              idx === 0
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-[var(--syn-card-inner)] border border-[var(--syn-border)] text-[var(--syn-text)] hover:text-[var(--syn-heading)] hover:border-emerald-500/40"
            }`}
          >
            {idx === 0 && <Sparkles className="w-3 h-3" />}
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* ── Input Bar ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="pt-2 flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder={hasScan ? `Ask Copilot about ${brandName}...` : "Ask Copilot anything..."}
          value={inputMessage}
          disabled={isLoading}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-xl border border-[var(--syn-border)] bg-[var(--syn-card-inner)] text-xs text-[var(--syn-heading)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-[var(--syn-muted)] transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2 rounded-xl bg-[#86EFAC] text-neutral-950 hover:bg-[#86EFAC]/90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
