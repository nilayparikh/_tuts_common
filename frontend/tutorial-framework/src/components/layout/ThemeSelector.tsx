"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTheme, THEMES } from "../../theme/ThemeProvider";

export function ThemeSelector(): React.ReactElement {
  const { themeId, setThemeId, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change theme"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.375rem 0.625rem",
          borderRadius: "var(--tf-radius-md)",
          border: "1px solid var(--tf-border-default)",
          background: "transparent",
          color: "var(--tf-text-secondary)",
          cursor: "pointer",
          fontFamily: "var(--tf-font-display)",
          fontWeight: 500,
          fontSize: "var(--tf-text-xs)",
          transition:
            "color var(--tf-transition-fast), border-color var(--tf-transition-fast), background var(--tf-transition-fast)",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--tf-border-strong)";
          e.currentTarget.style.color = "var(--tf-text-primary)";
          e.currentTarget.style.background = "var(--tf-bg-elevated)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--tf-border-default)";
          e.currentTarget.style.color = "var(--tf-text-secondary)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "16px" }}
        >
          {theme.icon}
        </span>
        <span>{theme.label}</span>
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "14px",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform var(--tf-transition-fast)",
          }}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Available themes"
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            right: 0,
            minWidth: "13rem",
            background: "var(--tf-glass-bg, var(--tf-bg-elevated))",
            backdropFilter: "blur(var(--tf-glass-blur, 12px))",
            WebkitBackdropFilter: "blur(var(--tf-glass-blur, 12px))",
            border: "1px solid var(--tf-glass-border, var(--tf-border-default))",
            borderRadius: "var(--tf-radius-lg)",
            boxShadow: "var(--tf-shadow-level3), var(--tf-glow-primary, none)",
            padding: "0.375rem",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            gap: "0.125rem",
          }}
        >
          {THEMES.map((t) => {
            const isActive = t.id === themeId;
            return (
              <button
                key={t.id}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setThemeId(t.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--tf-radius-md)",
                  border: "none",
                  background: isActive
                    ? "var(--tf-color-primary-container)"
                    : "transparent",
                  color: isActive
                    ? "var(--tf-color-primary-light)"
                    : "var(--tf-text-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--tf-font-display)",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "var(--tf-text-sm)",
                  width: "100%",
                  textAlign: "left",
                  transition:
                    "background var(--tf-transition-fast), color var(--tf-transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--tf-bg-overlay)";
                    e.currentTarget.style.color = "var(--tf-text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--tf-text-secondary)";
                  }
                }}
              >
                {/* Color swatch */}
                <span
                  style={{
                    width: "1rem",
                    height: "1rem",
                    borderRadius: "var(--tf-radius-full)",
                    background: `linear-gradient(135deg, ${t.colors.primary} 0%, ${t.colors.accent} 100%)`,
                    flexShrink: 0,
                    border: isActive
                      ? `2px solid ${t.colors.primaryLight}`
                      : "2px solid transparent",
                  }}
                />
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px", flexShrink: 0 }}
                >
                  {t.icon}
                </span>
                <span style={{ flex: 1 }}>{t.label}</span>
                {isActive && (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
