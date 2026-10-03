import React from "react";

export function OpenAIIcon({
  className = "w-5 h-5",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 12.3c.7-1.3.8-2.8.2-4.1-.7-1.5-2.1-2.5-3.8-2.7-.4-1.2-1.3-2.3-2.5-2.9-1.6-.8-3.4-.7-4.8.2-1-.8-2.3-1.2-3.6-1-1.7.2-3.1 1.4-3.7 3-.9.6-1.5 1.5-1.8 2.6-.5 1.6-.1 3.4 1 4.6-.3 1-.3 2.1 0 3.1.5 1.6 1.8 2.8 3.5 3.2.4 1.1 1.2 2.1 2.3 2.7 1.6.9 3.5.9 5-.1 1 .8 2.2 1.2 3.5 1 1.7-.2 3.2-1.4 3.8-3 .9-.6 1.5-1.5 1.8-2.6.5-1.6.1-3.4-1-4.6v.6z" />
      <path d="M12 7.8v4.4l3.8 2.2" />
      <path d="M8.2 14.4l3.8-2.2V7.8" />
      <path d="M15.8 9.6l-3.8 2.2v4.4" />
    </svg>
  );
}

export function OpenAISpiralIcon({
  className = "w-5 h-5",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.9454a4.4707 4.4707 0 0 1-.5346-3.0037l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1401-2.4664zM2.3423 8.6909a4.485 4.485 0 0 1 2.3655-1.9728V12.44a.7665.7665 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3423 8.6909zM18.7455 11.23l-5.8334-3.3733 2.02-1.1636a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4114-.6814zm2.9101-2.8293l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L10.112 8.9022V6.5698a.0663.0663 0 0 1 .0332-.0615L14.985 3.722a4.5087 4.5087 0 0 1 6.6706 4.6787zM8.3075 12.8465l-2.02-1.1636a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v6.706z" />
    </svg>
  );
}

export function PerplexityIcon({
  className = "w-5 h-5",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#22b8cf"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20" />
      <path d="M6 6l6 6-6 6" />
      <path d="M18 6l-6 6 6 6" />
      <path d="M3 12h18" />
    </svg>
  );
}

export function GoogleGIcon({
  className = "w-5 h-5",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}
      viewBox="0 0 24 24"
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.41 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function GeminiDiamondIcon({
  className = "w-5 h-5",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 1.5C12 7.29899 7.29899 12 1.5 12C7.29899 12 12 16.701 12 22.5C12 16.701 16.701 12 22.5 12C16.701 12 12 7.29899 12 1.5Z"
        fill="url(#gemini-vibrant-grad)"
      />
      <defs>
        <radialGradient
          id="gemini-vibrant-grad"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(12 12) rotate(45) scale(15)"
        >
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="30%" stopColor="#60a5fa" />
          <stop offset="60%" stopColor="#ef4444" />
          <stop offset="85%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#22c55e" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ClaudeSunburstIcon({
  className = "w-5 h-5",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="#D97757"
    >
      <path d="M12 2.5a1.2 1.2 0 0 1 1.2 1.2v3.6a1.2 1.2 0 1 1-2.4 0V3.7A1.2 1.2 0 0 1 12 2.5zm0 14.2a1.2 1.2 0 0 1 1.2 1.2v3.6a1.2 1.2 0 1 1-2.4 0v-3.6a1.2 1.2 0 0 1 1.2-1.2zM2.5 12a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 1 1 0 2.4H3.7A1.2 1.2 0 0 1 2.5 12zm14.2 0a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 1 1 0 2.4h-3.6a1.2 1.2 0 0 1-1.2-1.2zM5.3 5.3a1.2 1.2 0 0 1 1.7 0l2.5 2.5a1.2 1.2 0 0 1-1.7 1.7L5.3 7a1.2 1.2 0 0 1 0-1.7zm11.2 11.2a1.2 1.2 0 0 1 1.7 0l2.5 2.5a1.2 1.2 0 0 1-1.7 1.7l-2.5-2.5a1.2 1.2 0 0 1 0-1.7zm-11.2 1.7a1.2 1.2 0 0 1 1.7 0l2.5-2.5a1.2 1.2 0 1 1 1.7 1.7L8.7 19.9a1.2 1.2 0 0 1-1.7 0 1.2 1.2 0 0 1 0-1.7zm11.2-11.2a1.2 1.2 0 0 1 1.7 0l2.5-2.5a1.2 1.2 0 0 1 1.7 1.7L19.9 8.7a1.2 1.2 0 0 1-1.7 0 1.2 1.2 0 0 1 0-1.7z" />
    </svg>
  );
}

export function GrokSlashIcon({
  className = "w-5 h-5",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 2.21.72 4.25 1.94 5.9L17.9 3.94A9.957 9.957 0 0 0 12 2zm8.06 4.1L6.1 20.06A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10 0-2.21-.72-4.25-1.94-5.9z"
      />
    </svg>
  );
}

export function AIEngineRow({
  className = "flex items-center gap-3.5",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}
    >
      {/* 1. OpenAI / ChatGPT Spiral */}
      <div
        className="text-[var(--syn-heading,#f4f4f5)] hover:scale-115 transition-transform cursor-pointer"
        style={{ width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}
        title="ChatGPT (OpenAI)"
      >
        <OpenAISpiralIcon size={size} />
      </div>

      {/* 2. Perplexity Asterisk */}
      <div
        className="hover:scale-115 transition-transform cursor-pointer"
        style={{ width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}
        title="Perplexity AI"
      >
        <PerplexityIcon size={size} />
      </div>

      {/* 3. Google G Logo */}
      <div
        className="hover:scale-115 transition-transform cursor-pointer"
        style={{ width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}
        title="Google AI Search / SGE"
      >
        <GoogleGIcon size={size} />
      </div>

      {/* 4. Gemini Gradient Star */}
      <div
        className="hover:scale-115 transition-transform cursor-pointer"
        style={{ width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}
        title="Google Gemini"
      >
        <GeminiDiamondIcon size={size} />
      </div>

      {/* 5. Anthropic Claude Sunburst */}
      <div
        className="hover:scale-115 transition-transform cursor-pointer"
        style={{ width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}
        title="Claude (Anthropic)"
      >
        <ClaudeSunburstIcon size={size} />
      </div>

      {/* 6. Grok Slashed Circle */}
      <div
        className="text-[var(--syn-heading,#f4f4f5)] hover:scale-115 transition-transform cursor-pointer"
        style={{ width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}
        title="Grok (xAI)"
      >
        <GrokSlashIcon size={size} />
      </div>
    </div>
  );
}
