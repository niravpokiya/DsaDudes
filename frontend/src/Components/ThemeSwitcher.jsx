import { useState } from "react";
import { useTheme } from "../Context/themeContext";
import { themes } from "../config/themes";

const ThemeSwitcher = () => {
  const { currentTheme, currentMode, setTheme, setMode, toggleMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeColors = {
    ocean: "#0ea5e9",
    forest: "#10b981",
    midnight: "#8b5cf6",
    slate: "#06b6d4",
    amber: "#f59e0b",
    rose: "#f43f5e",
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "0.5rem",
          borderRadius: "var(--radius)",
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-primary)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "var(--bg-accent)";
          e.target.style.borderColor = "var(--text-accent)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "var(--bg-tertiary)";
          e.target.style.borderColor = "var(--border-primary)";
        }}
      >
        {/* Color Dot */}
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: themeColors[currentTheme],
            border: "2px solid var(--border-primary)",
          }}
        />
        {/* Mode Icon */}
        <span style={{ fontSize: "1.2rem" }}>
          {currentMode === "dark" ? "🌙" : "☀️"}
        </span>
      </button>

      {/* Theme Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-lg)",
            padding: "1rem",
            minWidth: "280px",
            boxShadow: "var(--shadow-lg)",
            zIndex: 1000,
          }}
        >
          {/* Mode Toggle */}
          <div
            style={{
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--border-primary)",
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              Mode
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setMode("dark")}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "var(--radius)",
                  background:
                    currentMode === "dark"
                      ? "var(--accent-primary)"
                      : "var(--bg-tertiary)",
                  color:
                    currentMode === "dark"
                      ? "white"
                      : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "var(--font-weight-medium)",
                  transition: "all var(--transition-fast)",
                }}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setMode("light")}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "var(--radius)",
                  background:
                    currentMode === "light"
                      ? "var(--accent-primary)"
                      : "var(--bg-tertiary)",
                  color:
                    currentMode === "light"
                      ? "white"
                      : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "var(--font-weight-medium)",
                  transition: "all var(--transition-fast)",
                }}
              >
                ☀️ Light
              </button>
            </div>
          </div>

          {/* Theme Palette */}
          <div>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              Color Theme
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.5rem",
              }}
            >
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius)",
                    background:
                      currentTheme === key
                        ? "var(--accent-primary)"
                        : "var(--bg-tertiary)",
                    border: "2px solid",
                    borderColor:
                      currentTheme === key
                        ? "var(--accent-primary)"
                        : themeColors[key],
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    if (currentTheme !== key) {
                      e.target.style.background = "var(--bg-accent)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentTheme !== key) {
                      e.target.style.background = "var(--bg-tertiary)";
                    }
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: themeColors[key],
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color:
                        currentTheme === key
                          ? "white"
                          : "var(--text-primary)",
                      }}
                  >
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
