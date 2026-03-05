/**
 * LocalM Tutorial Framework — Color Palette
 *
 * Material Design 3 inspired dark palette with tonal surfaces.
 * Uses MD3 color roles: Primary, Secondary, Tertiary, Error, Surface variants.
 */

export const palette = {
  // ── LocalM Brand (canonical — from _brand/docs/BRAND_GUIDE.md) ──────────
  localm: {
    cyan: "#00F5FF",
    blue: "#2932FF",
    purple: "#A838FF",
    green: "#00FFB2",
    gold: "#FFB03A",
    base: "#0B0B0F",
  },

  // ── Surfaces (MD3 tonal surface system) ─────────────────────────────────
  background: {
    base: "#0B0B0F", // Surface Dim — aligned with brand base
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
    primary: "#FFFFFF", // brand.textPrimary
    secondary: "#94A3B8", // brand.textSecondary
    muted: "#64748B", // subdued supporting text
    inverse: "#0B0B0F", // brand.base
  },

  // ── Primary (brand.blue scale) ───────────────────────────────────────────
  primary: {
    50: "#eceeff",
    100: "#d7daff",
    200: "#b3b9ff",
    300: "#8f97ff",
    400: "#626bff",
    500: "#2932FF", // brand.blue
    600: "#2028d6",
    700: "#1a21ad",
    800: "#131885",
    900: "#0d115c",
    950: "#090b36",
  },

  // ── Secondary (brand.cyan scale) ─────────────────────────────────────────
  secondary: {
    300: "#8dfaff",
    400: "#45f7ff",
    500: "#00F5FF", // brand.cyan
    600: "#00c8d1",
    700: "#00949b",
  },

  // ── Tertiary (brand.purple scale) ────────────────────────────────────────
  accent: {
    50: "#f5e9ff",
    100: "#ecd5ff",
    200: "#d9b0ff",
    300: "#c68bff",
    400: "#b45fff",
    500: "#A838FF", // brand.purple
    600: "#8b2bd1",
    700: "#6d21a6",
    800: "#4f177a",
    900: "#330e4f",
  },

  // ── Success (brand.green scale) ─────────────────────────────────────────
  success: {
    50: "#e6fff7",
    100: "#ccffef",
    200: "#99ffdf",
    300: "#66ffcf",
    400: "#33ffbf",
    500: "#00FFB2", // brand.green
    600: "#00cc8e",
    700: "#00996b",
    800: "#006647",
    900: "#003324",
  },

  // ── Warning (brand.gold alias) ─────────────────────────────────────────
  warning: {
    400: "#ffc56b",
    500: "#FFB03A", // brand.gold
    600: "#d88b1f",
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
