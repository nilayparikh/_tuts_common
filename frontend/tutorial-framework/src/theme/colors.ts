/**
 * LocalM Tutorial Framework — Color Palette
 *
 * Material Design 3 inspired dark palette with tonal surfaces.
 * Uses MD3 color roles: Primary, Secondary, Tertiary, Error, Surface variants.
 */

export const palette = {
  // ── Surfaces (MD3 tonal surface system) ─────────────────────────────────
  background: {
    base: "#0b0d12", // Surface Dim
    surface: "#111318", // Surface
    elevated: "#191c23", // Surface Container
    overlay: "#1f222a", // Surface Container High
    highest: "#262932", // Surface Container Highest
  },

  // ── Outline (MD3 outline roles) ─────────────────────────────────────────
  border: {
    subtle: "rgba(202,211,230,0.08)", // Outline Variant (dimmed)
    default: "rgba(202,211,230,0.14)", // Outline
    strong: "rgba(202,211,230,0.24)", // Focus / active outlines
  },

  // ── Text (MD3 on-surface roles) ─────────────────────────────────────────
  text: {
    primary: "#e2e6f0", // On Surface
    secondary: "#bfc5d4", // On Surface Variant
    muted: "#8892a8", // Outline (used for disabled/placeholder)
    inverse: "#0b0d12", // Inverse On Surface
  },

  // ── Primary (Indigo — MD3 Primary) ──────────────────────────────────────
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1", // Primary
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
    950: "#1e1b4b",
  },

  // ── Secondary (Teal — MD3 Secondary) ────────────────────────────────────
  secondary: {
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
  },

  // ── Tertiary (Amber — MD3 Tertiary / Accent) ───────────────────────────
  accent: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // Accent
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // ── Success (Emerald) ──────────────────────────────────────────────────
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },

  // ── Warning (Amber alias) ─────────────────────────────────────────────
  warning: {
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
  },

  // ── Error / Danger (MD3 Error) ─────────────────────────────────────────
  danger: {
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
  },

  // ── Deep Ocean (callout backgrounds) ───────────────────────────────────
  ocean: {
    950: "#030712",
    900: "#080f1f",
    800: "#0c1730",
  },

  // ── Pure ───────────────────────────────────────────────────────────────
  white: "#ffffff",
  black: "#000000",
} as const;

export type Palette = typeof palette;
