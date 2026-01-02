import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeMode } from "@/types";
import { useSettings } from "@/hooks/useSettings";

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  income: string;
  expense: string;
  transfer: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: "#f5f5f5",
  surface: "#ffffff",
  card: "#ffffff",
  text: "#1a1a1a",
  textSecondary: "#666666",
  border: "#e0e0e0",
  primary: "#4caf50",
  income: "#4caf50",
  expense: "#f44336",
  transfer: "#2196f3",
};

const darkColors: ThemeColors = {
  background: "#121212",
  surface: "#1e1e1e",
  card: "#2d2d2d",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
  border: "#3d3d3d",
  primary: "#66bb6a",
  income: "#66bb6a",
  expense: "#ef5350",
  transfer: "#42a5f5",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { settings, setTheme: saveTheme } = useSettings();
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(settings.theme);

  useEffect(() => {
    setCurrentTheme(settings.theme);
  }, [settings.theme]);

  const isDark =
    currentTheme === "dark" ||
    (currentTheme === "system" && systemColorScheme === "dark");

  const colors = isDark ? darkColors : lightColors;

  const setTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    saveTheme(theme);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setCurrentTheme(newTheme);
    saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{ theme: currentTheme, isDark, colors, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
