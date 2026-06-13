import { createContext, useContext, useState, useEffect } from "react";
import { themes, defaultTheme, defaultMode } from "../config/themes";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || defaultTheme;
  });

  const [currentMode, setCurrentMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || defaultMode;
  });

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = themes[currentTheme] || themes[defaultTheme];
    const mode = currentMode || defaultMode;
    const colors = theme[mode] || theme[defaultMode];

    const root = document.documentElement;

    // Background colors
    root.style.setProperty("--bg-primary", colors.bg.primary);
    root.style.setProperty("--bg-secondary", colors.bg.secondary);
    root.style.setProperty("--bg-tertiary", colors.bg.tertiary);
    root.style.setProperty("--bg-accent", colors.bg.accent);

    // Text colors
    root.style.setProperty("--text-primary", colors.text.primary);
    root.style.setProperty("--text-secondary", colors.text.secondary);
    root.style.setProperty("--text-muted", colors.text.muted);
    root.style.setProperty("--text-accent", colors.text.accent);

    // Accent colors
    root.style.setProperty("--accent-primary", colors.accent.primary);
    root.style.setProperty("--accent-secondary", colors.accent.secondary);
    root.style.setProperty("--accent-light", colors.accent.light);
    root.style.setProperty("--accent-dark", colors.accent.dark);

    // Border colors
    root.style.setProperty("--border-primary", colors.border.primary);
    root.style.setProperty("--border-secondary", colors.border.secondary);
    root.style.setProperty("--border-glass", colors.border.glass);

    // Status colors
    root.style.setProperty("--success", colors.success);
    root.style.setProperty("--warning", colors.warning);
    root.style.setProperty("--error", colors.error);

    // Status backgrounds
    root.style.setProperty("--success-bg", `${colors.success}15`);
    root.style.setProperty("--warning-bg", `${colors.warning}15`);
    root.style.setProperty("--error-bg", `${colors.error}15`);

    // Save to localStorage
    localStorage.setItem("theme", currentTheme);
    localStorage.setItem("themeMode", currentMode);
  }, [currentTheme, currentMode]);

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const setMode = (mode) => {
    if (mode === "light" || mode === "dark") {
      setCurrentMode(mode);
    }
  };

  const toggleMode = () => {
    setCurrentMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = {
    currentTheme,
    currentMode,
    setTheme,
    setMode,
    toggleMode,
    themes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
