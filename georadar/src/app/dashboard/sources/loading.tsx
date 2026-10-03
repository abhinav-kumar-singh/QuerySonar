import React from "react";

export default function SourcesLoading() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="w-28 h-4 syn-skeleton rounded-md" />
          <div className="w-64 sm:w-80 h-8 syn-skeleton rounded-lg" />
          <div className="w-80 sm:w-96 h-4 syn-skeleton rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 h-9 syn-skeleton rounded-xl" />
        </div>
      </div>

      {/* KPI Cards (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="syn-card flex flex-col justify-between h-[150px] p-5">
            <div className="flex items-center justify-between">
              <div className="w-28 h-4 syn-skeleton rounded-md" />
              <div className="w-7 h-7 syn-skeleton rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="w-32 h-8 syn-skeleton rounded-lg" />
              <div className="w-40 h-3 syn-skeleton rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Sources Table Skeleton */}
      <div className="syn-card p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--syn-border)]">
          <div className="space-y-1.5">
            <div className="w-56 h-5 syn-skeleton rounded-md" />
            <div className="w-80 h-3.5 syn-skeleton rounded-md" />
          </div>
          <div className="w-48 h-9 syn-skeleton rounded-full" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 syn-skeleton rounded-lg" />
                <div className="space-y-1.5">
                  <div className="w-48 sm:w-64 h-4 syn-skeleton rounded-md" />
                  <div className="w-36 h-3 syn-skeleton rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-6 syn-skeleton rounded-full" />
                <div className="w-20 h-6 syn-skeleton rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
