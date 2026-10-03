import React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 animate-in fade-in duration-150">
      {/* Launchpad / Top Hero Skeleton */}
      <div className="syn-card p-6 sm:p-7 flex flex-col gap-5 border border-[var(--syn-border)] rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="w-32 h-4 syn-skeleton rounded-md" />
            <div className="w-64 sm:w-80 h-7 syn-skeleton rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-28 h-9 syn-skeleton rounded-xl" />
            <div className="w-28 h-9 syn-skeleton rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-4 h-11 syn-skeleton rounded-xl" />
          <div className="md:col-span-4 h-11 syn-skeleton rounded-xl" />
          <div className="md:col-span-4 h-11 syn-skeleton rounded-xl" />
        </div>
      </div>

      {/* 4 Main KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="syn-card flex flex-col justify-between h-[160px] p-5">
            <div className="flex items-center justify-between">
              <div className="w-28 h-4 syn-skeleton rounded-md" />
              <div className="w-7 h-7 syn-skeleton rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="w-32 h-8 syn-skeleton rounded-lg" />
              <div className="w-44 h-3 syn-skeleton rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 3-Column Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Consensus Ranking Matrix (Col 8) */}
        <div className="lg:col-span-8 syn-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--syn-border)]">
            <div className="space-y-1.5">
              <div className="w-48 h-5 syn-skeleton rounded-md" />
              <div className="w-72 h-3.5 syn-skeleton rounded-md" />
            </div>
            <div className="w-24 h-6 syn-skeleton rounded-lg" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[var(--syn-card-inner)] border border-[var(--syn-border)] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 syn-skeleton rounded-full" />
                  <div className="space-y-1.5">
                    <div className="w-36 h-4 syn-skeleton rounded-md" />
                    <div className="w-48 h-3 syn-skeleton rounded-md" />
                  </div>
                </div>
                <div className="w-20 h-6 syn-skeleton rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Engine Breakdown & Radar (Col 4) */}
        <div className="lg:col-span-4 syn-card p-6 flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <div className="w-40 h-5 syn-skeleton rounded-md" />
            <div className="w-56 h-3.5 syn-skeleton rounded-md" />
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="w-44 h-44 rounded-full syn-skeleton" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--syn-border)]">
            <div className="h-8 syn-skeleton rounded-lg" />
            <div className="h-8 syn-skeleton rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
