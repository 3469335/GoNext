import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@gonext_theme";
const PRIMARY_COLOR_KEY = "@gonext_primary_color";

export type ThemeMode = "light" | "dark";

/** 10 цветов для выбора основного цвета темы */
export const PRIMARY_COLOR_OPTIONS: string[] = [
  "#6750A4", // фиолетовый
  "#1E88E5", // синий
  "#00897B", // бирюзовый
  "#43A047", // зелёный
  "#7CB342", // салатовый
  "#F9A825", // жёлтый
  "#E65100", // оранжевый
  "#D84315", // красно-оранжевый
  "#C62828", // красный
  "#AD1457", // розовый
];

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
  primaryColor: string | null;
  setPrimaryColor: (hex: string | null) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [primaryColor, setPrimaryColorState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(PRIMARY_COLOR_KEY),
    ]).then(([savedTheme, savedPrimary]) => {
      if (savedTheme === "light" || savedTheme === "dark") setThemeState(savedTheme);
      if (savedPrimary && /^#[0-9A-Fa-f]{6}$/.test(savedPrimary)) setPrimaryColorState(savedPrimary);
      setLoaded(true);
    });
  }, []);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeState(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const setPrimaryColor = useCallback(async (hex: string | null) => {
    setPrimaryColorState(hex);
    await AsyncStorage.setItem(PRIMARY_COLOR_KEY, hex ?? "");
  }, []);

  const value: ThemeContextValue = loaded
    ? { theme, setTheme, primaryColor, setPrimaryColor }
    : { theme: "light", setTheme, primaryColor: null, setPrimaryColor };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
}
