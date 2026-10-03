"use client";

import * as React from "react";

export type ThemeName = "live" | "light" | "system";
const STORAGE_KEY = "georadar_theme";

type ThemeContextValue = { theme: ThemeName; setTheme: (theme: ThemeName) => void };
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "light" ? "light" : theme === "live" ? "dark" : "normal";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const subscribe = React.useCallback((callback: () => void) => {
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY) callback(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("georadar_theme_updated", callback);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("georadar_theme_updated", callback); };
  }, []);
  const getSnapshot = React.useCallback((): ThemeName => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "system" || stored === "live" ? stored : "live";
  }, []);
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, (): ThemeName => "live");

  React.useEffect(() => { applyTheme(theme); }, [theme]);

  const setTheme = React.useCallback((nextTheme: ThemeName) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event("georadar_theme_updated"));
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
