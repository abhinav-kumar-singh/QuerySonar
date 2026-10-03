import React from "react";

export default function QueriesLoading() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="w-28 h-4 syn-skeleton rounded-md" />
          <div className="w-56 sm:w-80 h-8 syn-skeleton rounded-lg" />
          <div className="w-80 sm:w-96 h-4 syn-skeleton rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 h-9 syn-skeleton rounded-xl" />
          <div className="w-32 h-9 syn-skeleton rounded-xl" />
        </div>
      </div>

      {/* KPI Cards (3 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="syn-card p-5 flex flex-col justify-between h-[130px]">
            <div className="flex items-center justify-between">
              <div className="w-28 h-4 syn-skeleton rounded-md" />
              <div className="w-6 h-6 syn-skeleton rounded-md" />
            </div>
            <div className="w-32 h-7 syn-skeleton rounded-lg" />
          </div>
        ))}
      </div>

      {/* Engine Filter Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-24 h-9 syn-skeleton rounded-full shrink-0" />
          ))}
        </div>
        <div className="w-full sm:w-72 h-9 syn-skeleton rounded-full" />
      </div>

      {/* Query Cards Skeleton List */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="syn-card p-5 flex flex-col gap-4 border border-[var(--syn-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 syn-skeleton rounded-full shrink-0" />
                <div className="w-72 sm:w-96 h-5 syn-skeleton rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-6 syn-skeleton rounded-full" />
                <div className="w-24 h-6 syn-skeleton rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--syn-border)]">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-12 syn-skeleton rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
