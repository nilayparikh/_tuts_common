/**
 * LocalM Tutorial Framework - Color Palette
 *
 * DevSpace theme: deep-space dark + electric indigo + amber accents
 * Evokes professional developer learning environments (GitHub Docs, MDN, VS Code)
 */

export const palette = {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  background: {
    base: "#09090b", // near-black canvas
    surface: "#0f1117", // card / panel backgrounds
    elevated: "#161b24", // modals, dropdowns, tooltips
    overlay: "#1c2333", // code blocks, sidebars
  },

  // ── Borders ─────────────────────────────────────────────────────────────────
  border: {
    subtle: "#1e2d4d", // hairline separators
    default: "#253354", // standard borders
    strong: "#344870", // focus rings, active borders
  },

  // ── Text ────────────────────────────────────────────────────────────────────
  text: {
    primary: "#e2e8f0", // main body copy
    secondary: "#94a3b8", // labels, captions
    muted: "#64748b", // placeholders, disabled
    inverse: "#09090b", // text on bright backgrounds
  },

  // ── Brand – Primary (Indigo) ─────────────────────────────────────────────
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1", // ← main primary
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
    950: "#1e1b4b",
  },

  // ── Accent (Amber) – attention / highlights ─────────────────────────────
  accent: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // ← main accent
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // ── Success (Emerald) – completed steps / code output ───────────────────
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981", // ← main success
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },

  // ── Warning (Amber alias) ──────────────────────────────────────────────
  warning: {
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
  },

  // ── Danger ──────────────────────────────────────────────────────────────
  danger: {
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
  },

  // ── Deep Ocean (callout backgrounds) ────────────────────────────────────
  ocean: {
    950: "#030712",
    900: "#080f1f",
    800: "#0c1730",
  },

  // ── Pure ────────────────────────────────────────────────────────────────
  white: "#ffffff",
  black: "#000000",
} as const;

export type Palette = typeof palette;
