"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// ─── Theme definitions ─────────────────────────────────────────────────────

export interface ThemeColors {
  bgBase: string;
  bgSurface: string;
  bgElevated: string;
  bgOverlay: string;
  bgHighest: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryBg: string;
  accent: string;
  accentLight: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeDef {
  id: string;
  label: string;
  icon: string; // Material Symbol name
  colors: ThemeColors;
}

// ── Themes — dark + one light, all with readable neutral body text ─────────
//
//  textPrimary   → headings / strong text  (high contrast)
//  textSecondary → body paragraphs         (≥ 4.5:1 — NEUTRAL gray, never hued)
//  textMuted     → labels / captions       (≥ 3:1 — may carry slight tint)
//  primary       → the theme accent colour (links, highlights, buttons)

export const THEMES: ThemeDef[] = [
  // ── Light ─────────────────────────────────────────────────────────────
  {
    id: "light",
    label: "Light",
    icon: "light_mode",
    colors: {
      bgBase: "#f5f6fa",
      bgSurface: "#ffffff",
      bgElevated: "#eff1f6",
      bgOverlay: "#e6eaf2",
      bgHighest: "#dde2ec",
      borderSubtle: "rgba(20,30,70,0.07)",
      borderDefault: "rgba(20,30,70,0.12)",
      borderStrong: "rgba(20,30,70,0.22)",
      textPrimary: "#111827",
      textSecondary: "#374151", // neutral dark-gray — readable on white
      textMuted: "#6b7280",
      primary: "#2932FF",
      primaryLight: "#4D55FF",
      primaryDark: "#1A21AD",
      primaryBg: "#e9ebff",
      accent: "#A838FF",
      accentLight: "#C26BFF",
      success: "#00CC8E",
      warning: "#FFB03A",
      danger: "#dc2626",
    },
  },
  // ── Midnight (default) ────────────────────────────────────────────────
  {
    id: "midnight",
    label: "Midnight",
    icon: "dark_mode",
    colors: {
      bgBase: "#0B0B0F",
      bgSurface: "#0e1019",
      bgElevated: "#151822",
      bgOverlay: "#1b1f2c",
      bgHighest: "#242838",
      borderSubtle: "rgba(155,165,210,0.08)",
      borderDefault: "rgba(155,165,210,0.15)",
      borderStrong: "rgba(155,165,210,0.28)",
      textPrimary: "#FFFFFF",
      textSecondary: "#94A3B8", // brand.secondary text
      textMuted: "#64748B",
      primary: "#2932FF",
      primaryLight: "#626bff",
      primaryDark: "#1A21AD",
      primaryBg: "#090b36",
      accent: "#A838FF",
      accentLight: "#C68BFF",
      success: "#00FFB2",
      warning: "#FFB03A",
      danger: "#f87171",
    },
  },
  // ── Ocean ─────────────────────────────────────────────────────────────
  {
    id: "ocean",
    label: "Ocean",
    icon: "water",
    colors: {
      bgBase: "#060e1f",
      bgSurface: "#0b1629",
      bgElevated: "#112038",
      bgOverlay: "#172a45",
      bgHighest: "#1e3452",
      borderSubtle: "rgba(96,180,255,0.08)",
      borderDefault: "rgba(96,180,255,0.16)",
      borderStrong: "rgba(96,180,255,0.30)",
      textPrimary: "#e4f0ff",
      textSecondary: "#9eafc0", // desaturated blue-gray — no longer bright blue
      textMuted: "#607585",
      primary: "#38a1ff",
      primaryLight: "#6db9ff",
      primaryDark: "#1a6fd4",
      primaryBg: "#0c2a52",
      accent: "#06d6a0",
      accentLight: "#4ae8c4",
      success: "#06d6a0",
      warning: "#ffbe0b",
      danger: "#ff6b6b",
    },
  },
  // ── Frost (Nord-inspired) ─────────────────────────────────────────────
  {
    id: "frost",
    label: "Frost",
    icon: "ac_unit",
    colors: {
      bgBase: "#1c2028",
      bgSurface: "#242a36",
      bgElevated: "#2e3544",
      bgOverlay: "#384050",
      bgHighest: "#434c5e",
      borderSubtle: "rgba(200,210,235,0.08)",
      borderDefault: "rgba(200,210,235,0.16)",
      borderStrong: "rgba(200,210,235,0.28)",
      textPrimary: "#eceff4",
      textSecondary: "#b0b8cc", // neutral cool-gray
      textMuted: "#6e7a94",
      primary: "#88c0d0",
      primaryLight: "#a3d4e2",
      primaryDark: "#5e8fa5",
      primaryBg: "#1d3340",
      accent: "#ebcb8b",
      accentLight: "#f0d9a0",
      success: "#a3be8c",
      warning: "#ebcb8b",
      danger: "#bf616a",
    },
  },
  // ── Ember ─────────────────────────────────────────────────────────────
  {
    id: "ember",
    label: "Ember",
    icon: "local_fire_department",
    colors: {
      bgBase: "#100708",
      bgSurface: "#190c0e",
      bgElevated: "#241416",
      bgOverlay: "#2f1c1f",
      bgHighest: "#3b2528",
      borderSubtle: "rgba(255,140,60,0.10)",
      borderDefault: "rgba(255,140,60,0.18)",
      borderStrong: "rgba(255,140,60,0.32)",
      textPrimary: "#f5ede8",
      textSecondary: "#b0a098", // warm neutral gray — not orange
      textMuted: "#806858",
      primary: "#ff7b2e",
      primaryLight: "#ff9f5e",
      primaryDark: "#d45500",
      primaryBg: "#3a1500",
      accent: "#ff4088",
      accentLight: "#ff70a8",
      success: "#4ade80",
      warning: "#fbbf24",
      danger: "#ff4444",
    },
  },
  // ── Monokai Pro ───────────────────────────────────────────────────────
  {
    id: "monokai",
    label: "Monokai",
    icon: "terminal",
    colors: {
      bgBase: "#191a17",
      bgSurface: "#222320",
      bgElevated: "#2c2d28",
      bgOverlay: "#363732",
      bgHighest: "#41423c",
      borderSubtle: "rgba(248,248,242,0.07)",
      borderDefault: "rgba(248,248,242,0.14)",
      borderStrong: "rgba(248,248,242,0.26)",
      textPrimary: "#fcfcf0",
      textSecondary: "#c8c8bc", // near-neutral warm gray
      textMuted: "#888878",
      primary: "#a9dc76",
      primaryLight: "#c4ec98",
      primaryDark: "#7fb84e",
      primaryBg: "#283818",
      accent: "#ff6188",
      accentLight: "#ff85a2",
      success: "#a9dc76",
      warning: "#ffd866",
      danger: "#ff6188",
    },
  },
];

// ─── Context ───────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: ThemeDef;
  themeId: string;
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside <ThemeProvider>");
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "tf-theme-id";
const DEFAULT_THEME = "midnight";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [themeId, setThemeIdRaw] = useState(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Read stored theme on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.find((t) => t.id === stored)) {
        setThemeIdRaw(stored);
      }
    } catch {
      // SSR or localStorage blocked
    }
    setMounted(true);
  }, []);

  const setThemeId = useCallback((id: string) => {
    setThemeIdRaw(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // noop
    }
  }, []);

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  // Apply CSS variable overrides to :root
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const c = theme.colors;
    root.style.setProperty("--tf-bg-base", c.bgBase);
    root.style.setProperty("--tf-bg-surface", c.bgSurface);
    root.style.setProperty("--tf-bg-elevated", c.bgElevated);
    root.style.setProperty("--tf-bg-overlay", c.bgOverlay);
    root.style.setProperty("--tf-bg-highest", c.bgHighest);
    root.style.setProperty("--tf-border-subtle", c.borderSubtle);
    root.style.setProperty("--tf-border-default", c.borderDefault);
    root.style.setProperty("--tf-border-strong", c.borderStrong);
    root.style.setProperty("--tf-text-primary", c.textPrimary);
    root.style.setProperty("--tf-text-secondary", c.textSecondary);
    root.style.setProperty("--tf-text-muted", c.textMuted);
    root.style.setProperty("--tf-color-primary", c.primary);
    root.style.setProperty("--tf-color-primary-light", c.primaryLight);
    root.style.setProperty("--tf-color-primary-dark", c.primaryDark);
    root.style.setProperty("--tf-color-primary-bg", c.primaryBg);
    root.style.setProperty("--tf-color-accent", c.accent);
    root.style.setProperty("--tf-color-accent-light", c.accentLight);
    root.style.setProperty("--tf-color-success", c.success);
    root.style.setProperty("--tf-color-warning", c.warning);
    root.style.setProperty("--tf-color-danger", c.danger);

    // Derived containers (semi-transparent)
    root.style.setProperty(
      "--tf-color-primary-container",
      hexToContainer(c.primary, 0.12),
    );
    root.style.setProperty(
      "--tf-color-primary-container-high",
      hexToContainer(c.primary, 0.18),
    );
    root.style.setProperty(
      "--tf-color-primary-border",
      hexToContainer(c.primary, 0.35),
    );
    root.style.setProperty(
      "--tf-color-accent-container",
      hexToContainer(c.accent, 0.1),
    );
    root.style.setProperty(
      "--tf-color-success-container",
      hexToContainer(c.success, 0.1),
    );
    root.style.setProperty(
      "--tf-color-success-border",
      hexToContainer(c.success, 0.35),
    );
    root.style.setProperty(
      "--tf-color-warning-container",
      hexToContainer(c.warning, 0.1),
    );
    root.style.setProperty(
      "--tf-color-warning-border",
      hexToContainer(c.warning, 0.35),
    );
    root.style.setProperty(
      "--tf-color-danger-container",
      hexToContainer(c.danger, 0.08),
    );
    root.style.setProperty(
      "--tf-color-danger-border",
      hexToContainer(c.danger, 0.35),
    );
    root.style.setProperty(
      "--tf-shadow-glow",
      `0 0 24px ${hexToContainer(c.primary, 0.3)}`,
    );

    // ── Glass / frosted surface variables ──────────────────────────────
    // Semi-transparent surface for glass panels (sidebar, header, overlays)
    const surfaceRgb = hexToRgb(c.bgSurface);
    root.style.setProperty("--tf-glass-bg", `rgba(${surfaceRgb},0.72)`);
    root.style.setProperty("--tf-glass-blur", "20px");
    root.style.setProperty("--tf-glass-border", "rgba(255,255,255,0.06)");
    root.style.setProperty(
      "--tf-glass-highlight",
      "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)",
    );
    root.style.setProperty(
      "--tf-glow-primary",
      `0 0 40px ${hexToContainer(c.primary, 0.12)}, 0 0 80px ${hexToContainer(c.primary, 0.04)}`,
    );
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function hexToContainer(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
