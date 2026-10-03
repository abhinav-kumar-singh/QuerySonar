"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "danger",
  isLoading = false,
  children,
}: ConfirmationModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const isDanger = variant === "danger";

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        className="relative w-full max-w-md rounded-2xl bg-[var(--syn-card)] border border-[var(--syn-border)] shadow-2xl p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--syn-muted)] hover:text-[var(--syn-heading)] hover:bg-[var(--syn-card-inner)] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isDanger
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}
          >
            {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1 pr-6">
            <h4
              id="confirmation-modal-title"
              className="text-base font-bold text-[var(--syn-heading)] leading-snug"
            >
              {title}
            </h4>
            <p className="text-xs text-[var(--syn-muted)] leading-relaxed mt-1">
              {description}
            </p>
          </div>
        </div>

        {/* Custom Body / Details Chip */}
        {children && <div>{children}</div>}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--syn-border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="syn-btn-secondary text-xs px-4 py-2 cursor-pointer disabled:opacity-50"
          >
            {cancelText || t("common.cancel") || "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText || (isDanger ? t("common.delete") || "Delete" : "Confirm")}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
