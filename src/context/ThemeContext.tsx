import type { ThemeColors, ThemeMode } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

export const THEME_STORAGE_KEY = "@todo_theme_mode";

export const lightColors: ThemeColors = {
  bg: "#eef0f7",
  surface: "#ffffff",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  primary: "#6366f1",
  success: "#10b981",
  danger: "#dc2626",
  statusBarStyle: "dark",
};

export const darkColors: ThemeColors = {
  bg: "#0b1120",
  surface: "#1e293b",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  border: "#334155",
  primary: "#818cf8",
  success: "#34d399",
  danger: "#f87171",
  statusBarStyle: "light",
};

interface ThemeContextType {
  mode: ThemeMode;
  isDarkMode: boolean;
  colors: ThemeColors;
  loaded: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : "light",
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!cancelled && (saved === "light" || saved === "dark")) {
          setMode(saved);
        }
      } catch (err) {
        console.error("Не вдалося зчитати тему:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch((err) =>
      console.error("Не вдалося зберегти тему:", err),
    );
  }, [mode]);

  const value = useMemo<ThemeContextType>(
    () => ({
      mode,
      isDarkMode: mode === "dark",
      colors: mode === "dark" ? darkColors : lightColors,
      loaded,
      toggleTheme,
    }),
    [mode, loaded, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme має використовуватись всередині <ThemeProvider>");
  }
  return ctx;
}
