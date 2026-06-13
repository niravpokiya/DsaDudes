import { useTheme } from "../Context/themeContext";

const ThemeSwitcher = () => {
  const { currentMode, toggleMode } = useTheme();
  const isDark = currentMode === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleMode}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light Mode" : "Dark Mode"}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? "☀️" : "🌙"}
      </span>
      <span className="theme-toggle__label">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeSwitcher;
