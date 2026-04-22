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
  textInverse: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryBg: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;
  accentDark: string;
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
      textInverse: "#0b0d12",
      primary: "#2932FF",
      primaryLight: "#4D55FF",
      primaryDark: "#1A21AD",
      primaryBg: "#e9ebff",
      secondary: "#0f766e",
      secondaryLight: "#14b8a6",
      accent: "#A838FF",
      accentLight: "#C26BFF",
      accentDark: "#7e22ce",
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
      textSecondary: "#A7B4C8", // lifted neutral body text on dark surfaces
      textMuted: "#7B8AA2",
      textInverse: "#0b0d12",
      primary: "#2932FF",
      primaryLight: "#626bff",
      primaryDark: "#1A21AD",
      primaryBg: "#090b36",
      secondary: "#00F5FF",
      secondaryLight: "#67E8F9",
      accent: "#A838FF",
      accentLight: "#C68BFF",
      accentDark: "#7e22ce",
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
      textInverse: "#06101f",
      primary: "#38a1ff",
      primaryLight: "#6db9ff",
      primaryDark: "#1a6fd4",
      primaryBg: "#0c2a52",
      secondary: "#22d3ee",
      secondaryLight: "#67e8f9",
      accent: "#06d6a0",
      accentLight: "#4ae8c4",
      accentDark: "#059669",
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
      textInverse: "#0f172a",
      primary: "#88c0d0",
      primaryLight: "#a3d4e2",
      primaryDark: "#5e8fa5",
      primaryBg: "#1d3340",
      secondary: "#81A1C1",
      secondaryLight: "#AFC6DD",
      accent: "#ebcb8b",
      accentLight: "#f0d9a0",
      accentDark: "#c49a53",
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
      textInverse: "#14090a",
      primary: "#ff7b2e",
      primaryLight: "#ff9f5e",
      primaryDark: "#d45500",
      primaryBg: "#3a1500",
      secondary: "#f59e0b",
      secondaryLight: "#fbbf24",
      accent: "#ff4088",
      accentLight: "#ff70a8",
      accentDark: "#db2777",
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
      textInverse: "#11130f",
      primary: "#a9dc76",
      primaryLight: "#c4ec98",
      primaryDark: "#7fb84e",
      primaryBg: "#283818",
      secondary: "#78dce8",
      secondaryLight: "#a5eef6",
      accent: "#ff6188",
      accentLight: "#ff85a2",
      accentDark: "#db4b73",
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
    const runtimeVars = buildThemeRuntimeVars(theme.colors);

    for (const [key, value] of Object.entries(runtimeVars)) {
      root.style.setProperty(key, value);
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function buildThemeRuntimeVars(
  colors: ThemeColors,
): Record<string, string> {
  const isDarkTheme = isDarkColor(colors.bgBase);
  const textOnPrimary = resolveOnColor(colors.primary);
  const textOnSecondary = resolveOnColor(colors.secondary);
  const textOnAccent = resolveOnColor(colors.accent);
  const textOnSuccess = resolveOnColor(colors.success);
  const textOnWarning = resolveOnColor(colors.warning);
  const textOnDanger = resolveOnColor(colors.danger);

  const runtimeVars: Record<string, string> = {
    "--tf-bg-base": colors.bgBase,
    "--tf-bg-surface": colors.bgSurface,
    "--tf-bg-elevated": colors.bgElevated,
    "--tf-bg-overlay": colors.bgOverlay,
    "--tf-bg-highest": colors.bgHighest,
    "--tf-border-subtle": colors.borderSubtle,
    "--tf-border-default": colors.borderDefault,
    "--tf-border-strong": colors.borderStrong,
    "--tf-text-primary": colors.textPrimary,
    "--tf-text-secondary": colors.textSecondary,
    "--tf-text-muted": colors.textMuted,
    "--tf-text-inverse": colors.textInverse,
    "--tf-color-primary": colors.primary,
    "--tf-color-primary-light": colors.primaryLight,
    "--tf-color-primary-dark": colors.primaryDark,
    "--tf-color-primary-bg": colors.primaryBg,
    "--tf-color-secondary": colors.secondary,
    "--tf-color-secondary-light": colors.secondaryLight,
    "--tf-color-accent": colors.accent,
    "--tf-color-accent-light": colors.accentLight,
    "--tf-color-accent-dark": colors.accentDark,
    "--tf-color-success": colors.success,
    "--tf-color-warning": colors.warning,
    "--tf-color-danger": colors.danger,

    "--tf-color-primary-container": hexToContainer(colors.primary, 0.12),
    "--tf-color-primary-container-high": hexToContainer(colors.primary, 0.18),
    "--tf-color-primary-border": hexToContainer(colors.primary, 0.35),
    "--tf-color-accent-container": hexToContainer(colors.accent, 0.1),
    "--tf-color-accent-container-high": hexToContainer(colors.accent, 0.14),
    "--tf-color-accent-border": hexToContainer(colors.accent, 0.35),
    "--tf-color-secondary-container": hexToContainer(colors.secondary, 0.12),
    "--tf-color-secondary-container-high": hexToContainer(
      colors.secondary,
      0.18,
    ),
    "--tf-color-secondary-border": hexToContainer(colors.secondary, 0.35),
    "--tf-color-success-bg": hexToContainer(
      colors.success,
      isDarkTheme ? 0.2 : 0.14,
    ),
    "--tf-color-success-container": hexToContainer(colors.success, 0.1),
    "--tf-color-success-container-high": hexToContainer(colors.success, 0.15),
    "--tf-color-success-border": hexToContainer(colors.success, 0.35),
    "--tf-color-warning-bg": hexToContainer(
      colors.warning,
      isDarkTheme ? 0.22 : 0.14,
    ),
    "--tf-color-warning-container": hexToContainer(colors.warning, 0.1),
    "--tf-color-warning-container-high": hexToContainer(colors.warning, 0.14),
    "--tf-color-warning-border": hexToContainer(colors.warning, 0.35),
    "--tf-color-danger-bg": hexToContainer(
      colors.danger,
      isDarkTheme ? 0.18 : 0.12,
    ),
    "--tf-color-danger-container": hexToContainer(colors.danger, 0.08),
    "--tf-color-danger-container-high": hexToContainer(colors.danger, 0.12),
    "--tf-color-danger-border": hexToContainer(colors.danger, 0.35),

    "--tf-text-on-primary": textOnPrimary,
    "--tf-text-on-secondary": textOnSecondary,
    "--tf-text-on-accent": textOnAccent,
    "--tf-text-on-success": textOnSuccess,
    "--tf-text-on-warning": textOnWarning,
    "--tf-text-on-danger": textOnDanger,
    "--tf-text-on-emphasis": textOnAccent,
    "--tf-text-on-info": textOnSecondary,
    "--tf-text-on-recommendation": textOnPrimary,
    "--tf-text-on-evidence": textOnSecondary,

    "--tf-state-neutral-bg": hexToContainer(
      colors.textSecondary,
      isDarkTheme ? 0.14 : 0.08,
    ),
    "--tf-state-neutral-border": hexToContainer(
      colors.textSecondary,
      isDarkTheme ? 0.3 : 0.18,
    ),
    "--tf-state-neutral-accent": colors.textSecondary,
    "--tf-state-neutral-text": colors.textPrimary,
    "--tf-state-neutral-icon": colors.textSecondary,

    "--tf-state-emphasis-bg": hexToContainer(
      colors.accent,
      isDarkTheme ? 0.16 : 0.12,
    ),
    "--tf-state-emphasis-border": hexToContainer(colors.accent, 0.35),
    "--tf-state-emphasis-accent": colors.accent,
    "--tf-state-emphasis-text": colors.textPrimary,
    "--tf-state-emphasis-icon": colors.accentLight,

    "--tf-state-info-bg": hexToContainer(
      colors.secondary,
      isDarkTheme ? 0.14 : 0.1,
    ),
    "--tf-state-info-border": hexToContainer(colors.secondary, 0.35),
    "--tf-state-info-accent": colors.secondary,
    "--tf-state-info-text": colors.textPrimary,
    "--tf-state-info-icon": colors.secondaryLight,

    "--tf-state-success-bg": hexToContainer(
      colors.success,
      isDarkTheme ? 0.15 : 0.12,
    ),
    "--tf-state-success-border": hexToContainer(colors.success, 0.35),
    "--tf-state-success-accent": colors.success,
    "--tf-state-success-text": colors.textPrimary,
    "--tf-state-success-icon": colors.success,

    "--tf-state-warning-bg": hexToContainer(
      colors.warning,
      isDarkTheme ? 0.15 : 0.12,
    ),
    "--tf-state-warning-border": hexToContainer(colors.warning, 0.35),
    "--tf-state-warning-accent": colors.warning,
    "--tf-state-warning-text": colors.textPrimary,
    "--tf-state-warning-icon": colors.warning,

    "--tf-state-danger-bg": hexToContainer(
      colors.danger,
      isDarkTheme ? 0.14 : 0.1,
    ),
    "--tf-state-danger-border": hexToContainer(colors.danger, 0.35),
    "--tf-state-danger-accent": colors.danger,
    "--tf-state-danger-text": colors.textPrimary,
    "--tf-state-danger-icon": colors.danger,

    "--tf-state-recommendation-bg": hexToContainer(
      colors.primary,
      isDarkTheme ? 0.14 : 0.1,
    ),
    "--tf-state-recommendation-border": hexToContainer(colors.primary, 0.35),
    "--tf-state-recommendation-accent": colors.primary,
    "--tf-state-recommendation-text": colors.textPrimary,
    "--tf-state-recommendation-icon": colors.primaryLight,

    "--tf-state-evidence-bg": hexToContainer(
      colors.secondary,
      isDarkTheme ? 0.14 : 0.1,
    ),
    "--tf-state-evidence-border": hexToContainer(colors.secondary, 0.35),
    "--tf-state-evidence-accent": colors.secondary,
    "--tf-state-evidence-text": colors.textPrimary,
    "--tf-state-evidence-icon": colors.secondaryLight,

    "--tf-state-trend-positive-bg": hexToContainer(
      colors.success,
      isDarkTheme ? 0.15 : 0.12,
    ),
    "--tf-state-trend-positive-border": hexToContainer(colors.success, 0.35),
    "--tf-state-trend-positive-accent": colors.success,
    "--tf-state-trend-positive-text": colors.textPrimary,
    "--tf-state-trend-positive-icon": colors.success,

    "--tf-state-trend-negative-bg": hexToContainer(
      colors.danger,
      isDarkTheme ? 0.14 : 0.1,
    ),
    "--tf-state-trend-negative-border": hexToContainer(colors.danger, 0.35),
    "--tf-state-trend-negative-accent": colors.danger,
    "--tf-state-trend-negative-text": colors.textPrimary,
    "--tf-state-trend-negative-icon": colors.danger,

    "--tf-state-trend-neutral-bg": hexToContainer(
      colors.textSecondary,
      isDarkTheme ? 0.14 : 0.08,
    ),
    "--tf-state-trend-neutral-border": hexToContainer(
      colors.textSecondary,
      isDarkTheme ? 0.3 : 0.18,
    ),
    "--tf-state-trend-neutral-accent": colors.textSecondary,
    "--tf-state-trend-neutral-text": colors.textPrimary,
    "--tf-state-trend-neutral-icon": colors.textSecondary,

    "--tf-surface-stage-bg": colors.bgBase,
    "--tf-surface-stage-border": colors.borderSubtle,
    "--tf-surface-stage-text": colors.textPrimary,
    "--tf-surface-card-bg": colors.bgElevated,
    "--tf-surface-card-border": colors.borderDefault,
    "--tf-surface-card-text": colors.textPrimary,
    "--tf-surface-panel-bg": colors.bgSurface,
    "--tf-surface-panel-border": colors.borderDefault,
    "--tf-surface-panel-text": colors.textPrimary,
    "--tf-surface-control-bg": colors.bgOverlay,
    "--tf-surface-control-border": colors.borderDefault,
    "--tf-surface-control-text": colors.textPrimary,
    "--tf-surface-overlay-bg": colors.bgOverlay,
    "--tf-surface-overlay-border": colors.borderStrong,
    "--tf-surface-overlay-text": colors.textPrimary,
    "--tf-surface-shorts-bg": colors.bgSurface,
    "--tf-surface-shorts-border": colors.borderDefault,
    "--tf-surface-shorts-text": colors.textPrimary,
    "--tf-surface-feed-bg": colors.bgSurface,
    "--tf-surface-feed-border": colors.borderDefault,
    "--tf-surface-feed-text": colors.textPrimary,
    "--tf-surface-end-screen-bg": colors.bgElevated,
    "--tf-surface-end-screen-border": colors.borderDefault,
    "--tf-surface-end-screen-text": colors.textPrimary,

    "--tf-shadow-glow": `0 0 24px ${hexToContainer(colors.primary, 0.3)}`,
    "--tf-gradient-brand": buildBrandGradient(colors),
    "--tf-gradient-stage": buildBackdrop(colors, isDarkTheme),
    "--tf-gradient-overlay": buildOverlayGradient(colors, isDarkTheme),
    "--tf-bg-backdrop": buildBackdrop(colors, isDarkTheme),
    "--tf-glass-bg": buildGlassBackground(colors, isDarkTheme),
    "--tf-glass-blur": "20px",
    "--tf-glass-border": colors.borderDefault,
    "--tf-glass-highlight": buildGlassHighlight(isDarkTheme),
    "--tf-glow-primary": buildPrimaryGlow(colors, isDarkTheme),
    "--tf-focus-ring": colors.primaryLight,
    "--tf-focus-ring-offset": "0.125rem",
    "--tf-focus-ring-shadow": `0 0 0 0.25rem ${hexToContainer(colors.primary, isDarkTheme ? 0.22 : 0.12)}`,
  };

  return runtimeVars;
}

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

function mixHex(startHex: string, endHex: string, ratio: number): string {
  const start = hexToRgbChannels(startHex);
  const end = hexToRgbChannels(endHex);
  const mix = (from: number, to: number) =>
    Math.round(from + (to - from) * ratio);

  return `rgb(${mix(start.r, end.r)}, ${mix(start.g, end.g)}, ${mix(start.b, end.b)})`;
}

function hexToRgbChannels(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function isDarkColor(hex: string): boolean {
  const { r, g, b } = hexToRgbChannels(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.55;
}

function buildBackdrop(colors: ThemeColors, isDarkTheme: boolean): string {
  const primaryGlow = hexToContainer(colors.primary, isDarkTheme ? 0.16 : 0.12);
  const secondaryGlow = hexToContainer(
    colors.secondary,
    isDarkTheme ? 0.14 : 0.1,
  );
  const accentGlow = hexToContainer(colors.accent, isDarkTheme ? 0.12 : 0.08);
  const gradientMid = mixHex(colors.bgBase, colors.bgSurface, 0.58);
  const gradientEnd = mixHex(colors.bgSurface, colors.bgOverlay, 0.72);

  return `radial-gradient(circle at top left, ${primaryGlow}, transparent 32%), radial-gradient(circle at top right, ${accentGlow}, transparent 36%), radial-gradient(circle at bottom center, ${secondaryGlow}, transparent 42%), linear-gradient(135deg, ${colors.bgBase} 0%, ${gradientMid} 46%, ${gradientEnd} 100%)`;
}

function resolveOnColor(hex: string): string {
  return isDarkColor(hex) ? "#ffffff" : "#0b0d12";
}

function buildBrandGradient(colors: ThemeColors): string {
  return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 55%, ${colors.secondary} 100%)`;
}

function buildOverlayGradient(
  colors: ThemeColors,
  isDarkTheme: boolean,
): string {
  return `linear-gradient(180deg, ${hexToContainer(colors.bgOverlay, isDarkTheme ? 0.96 : 0.92)} 0%, ${hexToContainer(colors.bgBase, isDarkTheme ? 0.98 : 0.9)} 100%)`;
}

function buildGlassBackground(
  colors: ThemeColors,
  isDarkTheme: boolean,
): string {
  const surfaceRgb = hexToRgb(colors.bgSurface);
  return `rgba(${surfaceRgb},${isDarkTheme ? "0.72" : "0.82"})`;
}

function buildGlassHighlight(isDarkTheme: boolean): string {
  return isDarkTheme
    ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 52%)"
    : "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 38%, transparent 70%)";
}

function buildPrimaryGlow(
  colors: ThemeColors,
  isDarkTheme: boolean,
): string {
  return `0 0 40px ${hexToContainer(colors.primary, isDarkTheme ? 0.12 : 0.08)}, 0 0 80px ${hexToContainer(colors.primary, isDarkTheme ? 0.04 : 0.02)}`;
}
