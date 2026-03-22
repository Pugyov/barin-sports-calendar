"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: "class";
  disableTransitionOnChange?: boolean;
  storageKey?: string;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light" as const;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolvedTheme: "light" | "dark", disableTransitionOnChange: boolean) {
  const root = document.documentElement;

  let cleanup = () => {};
  if (disableTransitionOnChange) {
    const style = document.createElement("style");
    style.appendChild(document.createTextNode("* { transition: none !important; }"));
    document.head.appendChild(style);
    cleanup = () => {
      window.getComputedStyle(document.body);
      requestAnimationFrame(() => {
        style.remove();
      });
    };
  }

  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
  cleanup();
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  enableSystem = true,
  attribute = "class",
  disableTransitionOnChange = false,
  storageKey = "theme"
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    if (attribute !== "class") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;
    const nextTheme = storedTheme ?? defaultTheme;

    setThemeState(nextTheme);
    setSystemTheme(media.matches ? "dark" : "light");

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [attribute, defaultTheme, storageKey]);

  const resolvedTheme = theme === "system" && enableSystem ? systemTheme : theme === "dark" ? "dark" : "light";

  React.useEffect(() => {
    if (attribute !== "class") return;
    applyTheme(resolvedTheme, disableTransitionOnChange);
  }, [attribute, disableTransitionOnChange, resolvedTheme]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      window.localStorage.setItem(storageKey, nextTheme);
    },
    [storageKey]
  );

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme
    }),
    [resolvedTheme, setTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
