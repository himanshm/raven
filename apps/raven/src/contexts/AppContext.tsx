import type { Theme } from "@/types";
import {
  createContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

type AppProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type AppProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: AppProviderState = {
  theme: "system",
  setTheme: () => null
};

export const AppProviderContext = createContext<AppProviderState>(initialState);

export function AppProvider({
  children,
  defaultTheme = "system",
  storageKey = "app-theme",
  ...props
}: AppProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    if (theme === "system") {
      const systemTheme = media.matches ? "dark" : "light";
      root.setAttribute("data-theme", systemTheme);
      return;
    }
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    }
  };

  return (
    <AppProviderContext.Provider value={value} {...props}>
      {children}
    </AppProviderContext.Provider>
  );
}

