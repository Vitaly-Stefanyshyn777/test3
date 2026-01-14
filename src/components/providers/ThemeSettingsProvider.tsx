"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useThemeSettingsQuery } from "@/components/hooks/useWpQueries";

interface ThemeSettingsContextType {
  themeSettings: any[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

const ThemeSettingsContext = createContext<ThemeSettingsContextType | undefined>(
  undefined
);

export function ThemeSettingsProvider({ children }: { children: ReactNode }) {
  const { data: themeSettings, isLoading, isError } = useThemeSettingsQuery();

  return (
    <ThemeSettingsContext.Provider value={{ themeSettings, isLoading, isError }}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings() {
  const context = useContext(ThemeSettingsContext);
  if (context === undefined) {
    throw new Error("useThemeSettings must be used within a ThemeSettingsProvider");
  }
  return context;
}

