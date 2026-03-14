"use client";

import { useTheme as useNextTheme } from "next-themes";

type Theme = "light" | "dark" | "system";

interface UseThemeReturn {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  resolvedTheme: string | undefined;
}

export function useTheme(): UseThemeReturn {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  return {
    theme: theme as Theme | undefined,
    setTheme,
    resolvedTheme,
  };
}
