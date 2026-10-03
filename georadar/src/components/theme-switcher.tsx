"use client";

import { MonitorCog, MoonStar, Sun } from "lucide-react";
import { useTheme, type ThemeName } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const options: { value: ThemeName; label: string; icon: typeof MoonStar }[] = [
  { value: "live", label: "Dark", icon: MoonStar },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: MonitorCog },
];

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className={cn("inline-flex items-center rounded-xl border border-border bg-muted/50 p-1", compact && "rounded-lg")} aria-label="Color theme">
      {options.map(({ value, label, icon: Icon }) => (
        <button key={value} type="button" onClick={() => setTheme(value)} aria-pressed={theme === value} title={`${label} theme`}
          className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", theme === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground", compact && "w-8 justify-center px-0")}>
          <Icon className="h-3.5 w-3.5" /> {!compact && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}
