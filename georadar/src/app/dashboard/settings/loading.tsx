import React from "react";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="space-y-2 pt-2">
        <div className="w-28 h-4 syn-skeleton rounded-md" />
        <div className="w-64 sm:w-80 h-8 syn-skeleton rounded-lg" />
        <div className="w-80 sm:w-96 h-4 syn-skeleton rounded-md" />
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--syn-border)]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-24 h-9 syn-skeleton rounded-xl shrink-0" />
        ))}
      </div>

      {/* Settings Panel Skeleton Card */}
      <div className="syn-card p-6 sm:p-8 flex flex-col gap-6 max-w-4xl">
        <div className="space-y-2 pb-4 border-b border-[var(--syn-border)]">
          <div className="w-48 h-6 syn-skeleton rounded-md" />
          <div className="w-72 h-4 syn-skeleton rounded-md" />
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="w-32 h-4 syn-skeleton rounded-md" />
            <div className="w-full h-11 syn-skeleton rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="w-40 h-4 syn-skeleton rounded-md" />
            <div className="w-full h-11 syn-skeleton rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="w-28 h-4 syn-skeleton rounded-md" />
            <div className="w-full h-24 syn-skeleton rounded-xl" />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--syn-border)] flex justify-end">
          <div className="w-32 h-10 syn-skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}
