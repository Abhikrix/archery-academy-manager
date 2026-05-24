import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ compact = false, className = "" }) {
  const { isLight, theme, toggleTheme } = useTheme();
  const Icon = isLight ? Sun : Moon;
  const label = isLight ? "Light mode" : "Dark mode";

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? "theme-toggle-compact" : ""} ${className}`.trim()}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      aria-pressed={isLight}
      title={`Current theme: ${label}`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{label}</span>
          <span className="block truncate text-xs opacity-70">
            {theme === "light" ? "White and gold" : "Black and gold"}
          </span>
        </span>
      )}
    </button>
  );
}
