import { AppProviderContext } from "@/contexts/AppContext";
import { useContext } from "react";

export const useTheme = () => {
    const context = useContext(AppProviderContext);
  
    if (context === undefined) {
      throw new Error("useTheme must be used within an AppProvider");
    }
  
    return context;
};