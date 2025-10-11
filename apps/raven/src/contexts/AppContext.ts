// contexts/AppContext.ts
import type { Theme } from "@/types";
import { createContext } from "react";

type AppProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: AppProviderState = {
  theme: "system",
  setTheme: () => null
};

export const AppProviderContext = createContext<AppProviderState>(initialState);
