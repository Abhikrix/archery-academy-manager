import * as React from "react";

const STORAGE_KEY = "arcos-theme";
const DEFAULT_THEME = "dark";
const THEMES = new Set(["dark", "light"]);

function normalizeTheme(theme) {
  return THEMES.has(theme) ? theme : DEFAULT_THEME;
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  try {
    return normalizeTheme(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  const normalizedTheme = normalizeTheme(theme);
  const root = document.documentElement;
  root.dataset.theme = normalizedTheme;
  root.style.colorScheme = normalizedTheme;

  const themeColor = normalizedTheme === "light" ? "#f7f8fb" : "#090909";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
}

const ThemeContext = React.createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(getInitialTheme);

  React.useEffect(() => {
    const normalizedTheme = normalizeTheme(theme);
    applyTheme(normalizedTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, normalizedTheme);
    } catch {
      // Storage can be unavailable in restricted browser modes; the in-session toggle still works.
    }
  }, [theme]);

  const value = React.useMemo(
    () => ({
      isLight: theme === "light",
      setTheme: (nextTheme) => setTheme(normalizeTheme(nextTheme)),
      theme,
      toggleTheme: () => setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
