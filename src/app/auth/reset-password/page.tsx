"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";

function ResetPasswordContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid or missing reset token. Please request a new password reset link from the sign-in page.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token || !email) {
      setError("Missing reset token. Please request a new password reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password. The link may have expired.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2500);
    } catch (err: any) {
      console.error("Reset password submit error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="v2 synetica-shell min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--syn-bg,#08080A)] text-[var(--syn-text,#D4D4D8)]">
      <div className="max-w-[480px] w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-neutral-950 font-bold" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[var(--syn-heading,#FAFAFA)] font-mono">
              Query<span className="text-emerald-500">Sonar</span>
            </span>
          </Link>
        </div>

        {/* Reset Password Card */}
        <div className="rounded-3xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xl p-8 sm:p-10">
          <div className="mb-6">
            <span className="v2-badge-pill mb-3 text-xs font-mono uppercase tracking-wider !bg-emerald-500/10 !text-emerald-500 dark:!text-emerald-400 !border-emerald-500/20 px-3 py-1 inline-flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Security Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--syn-heading)] mb-2">
              Set new password
            </h1>
            <p className="text-sm text-[var(--syn-muted)] leading-relaxed">
              {email ? (
                <>
                  Creating a new password for <strong className="text-[var(--syn-heading)]">{email}</strong>
                </>
              ) : (
                "Enter your new password below."
              )}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in duration-150">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>Password successfully reset! Redirecting to sign in...</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--syn-heading)] block">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--syn-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-[var(--syn-input-border)] bg-[var(--syn-input-bg)] text-[var(--syn-input-text)] text-sm placeholder:text-[var(--syn-subtle)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--syn-muted)] hover:text-[var(--syn-heading)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--syn-heading)] block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--syn-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Re-enter new password"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--syn-input-border)] bg-[var(--syn-input-bg)] text-[var(--syn-input-text)] text-sm placeholder:text-[var(--syn-subtle)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-neutral-950 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center pt-4 border-t border-[var(--syn-border)]">
            <Link
              href="/auth/signin"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold transition-colors inline-flex items-center gap-1.5"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--syn-bg,#08080A)]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
