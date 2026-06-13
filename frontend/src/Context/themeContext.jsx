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
    return savedTheme && themes[savedTheme] ? savedTheme : defaultTheme;
  });

  const [currentMode, setCurrentMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode === "dark" || savedMode === "light" ? savedMode : defaultMode;
  });

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = themes[currentTheme] || themes[defaultTheme];
    const mode = currentMode || defaultMode;
    const colors = theme[mode] || theme[defaultMode];

    const root = document.documentElement;
    root.dataset.theme = mode;
    root.style.colorScheme = mode;

    // Background colors
    root.style.setProperty("--bg-primary", colors.bg.primary);
    root.style.setProperty("--bg-secondary", colors.bg.secondary);
    root.style.setProperty("--bg-tertiary", colors.bg.tertiary);
    root.style.setProperty("--bg-accent", colors.bg.accent);

    root.style.setProperty("--surface", colors.surface.default);
    root.style.setProperty("--surface-card", colors.surface.card);
    root.style.setProperty("--surface-soft", colors.surface.soft);
    root.style.setProperty("--surface-elevated", colors.surface.elevated);
    root.style.setProperty("--surface-code", colors.surface.code);
    root.style.setProperty("--surface-inverse", colors.surface.inverse);
    root.style.setProperty("--surface-indigo", colors.surface.indigo);
    root.style.setProperty("--surface-blue", colors.surface.blue);
    root.style.setProperty("--surface-green", colors.surface.green);
    root.style.setProperty("--surface-amber", colors.surface.amber);
    root.style.setProperty("--surface-rose", colors.surface.rose);
    root.style.setProperty("--surface-violet", colors.surface.violet);
    root.style.setProperty("--surface-table-header", colors.surface.tableHeader);
    root.style.setProperty("--surface-editor", colors.surface.editor);
    root.style.setProperty("--surface-editor-header", colors.surface.editorHeader);
    root.style.setProperty("--surface-editor-muted", colors.surface.editorMuted);

    // Text colors
    root.style.setProperty("--text-primary", colors.text.primary);
    root.style.setProperty("--text-secondary", colors.text.secondary);
    root.style.setProperty("--text-body", colors.text.body);
    root.style.setProperty("--text-muted", colors.text.muted);
    root.style.setProperty("--text-accent", colors.text.accent);
    root.style.setProperty("--text-inverse", colors.text.inverse);
    root.style.setProperty("--text-code", colors.text.code);

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
    root.style.setProperty("--info", colors.info);

    // Status backgrounds
    root.style.setProperty("--success-bg", mode === "dark" ? "rgba(34, 197, 94, 0.16)" : "#DCFCE7");
    root.style.setProperty("--warning-bg", mode === "dark" ? "rgba(245, 158, 11, 0.16)" : "#FEF3C7");
    root.style.setProperty("--error-bg", mode === "dark" ? "rgba(239, 68, 68, 0.16)" : "#FEE2E2");
    root.style.setProperty("--info-bg", mode === "dark" ? "rgba(129, 140, 248, 0.16)" : "#DBEAFE");
    root.style.setProperty("--easy", colors.success);
    root.style.setProperty("--easy-bg", mode === "dark" ? "rgba(34, 197, 94, 0.16)" : "#DCFCE7");
    root.style.setProperty("--medium", colors.warning);
    root.style.setProperty("--medium-bg", mode === "dark" ? "rgba(245, 158, 11, 0.16)" : "#FEF3C7");
    root.style.setProperty("--hard", colors.error);
    root.style.setProperty("--hard-bg", mode === "dark" ? "rgba(239, 68, 68, 0.16)" : "#FEE2E2");
    root.style.setProperty("--scrollbar-track", colors.scrollbar.track);
    root.style.setProperty("--scrollbar-thumb", colors.scrollbar.thumb);
    root.style.setProperty("--scrollbar-hover", colors.scrollbar.hover);
    root.style.setProperty("--shadow-sm", colors.shadow.sm);
    root.style.setProperty("--shadow-md", colors.shadow.md);
    root.style.setProperty("--shadow-lg", colors.shadow.lg);

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
