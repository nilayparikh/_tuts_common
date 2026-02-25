/**
 * LocalM Tutorial Framework – Design Tokens
 *
 * All values are consumed by GlobalStyles which maps them to CSS custom properties.
 * Components reference CSS vars (e.g. var(--tf-color-bg-base)) so themes are
 * swappable at runtime without a full rebuild.
 */

import { palette } from "./colors";

// ─── Semantic token map ────────────────────────────────────────────────────

export const tokens = {
  color: {
    // backgrounds
    bgBase: palette.background.base,
    bgSurface: palette.background.surface,
    bgElevated: palette.background.elevated,
    bgOverlay: palette.background.overlay,

    // borders
    borderSubtle: palette.border.subtle,
    borderDefault: palette.border.default,
    borderStrong: palette.border.strong,

    // text
    textPrimary: palette.text.primary,
    textSecondary: palette.text.secondary,
    textMuted: palette.text.muted,
    textInverse: palette.text.inverse,

    // brand
    primary: palette.primary[500],
    primaryLight: palette.primary[400],
    primaryDark: palette.primary[700],
    primaryBg: palette.primary[950],

    // accent
    accent: palette.accent[500],
    accentLight: palette.accent[300],
    accentDark: palette.accent[700],

    // semantic
    success: palette.success[500],
    successBg: palette.success[900],
    warning: palette.warning[500],
    warningBg: "#3d2e0a",
    danger: palette.danger[500],
    dangerBg: "#3b0f0f",

    // code
    codeBg: palette.background.overlay,
    codeText: "#e2e8f0",
    codeKeyword: palette.primary[400],
    codeString: palette.success[400],
    codeComment: palette.text.muted,
    codeNumber: palette.accent[400],
  },

  typography: {
    // Font stacks – loaded via Next.js font optimisation in consumer app
    fontDisplay: '"Geist", "Inter", system-ui, sans-serif',
    fontBody: '"Geist", "Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',

    // Scale (rem)
    sizeXs: "0.75rem", //  12px
    sizeSm: "0.875rem", //  14px
    sizeMd: "1rem", //  16px
    sizeLg: "1.125rem", //  18px
    sizeXl: "1.25rem", //  20px
    size2xl: "1.5rem", //  24px
    size3xl: "1.875rem", //  30px
    size4xl: "2.25rem", //  36px
    size5xl: "3rem", //  48px
    size6xl: "3.75rem", //  60px

    // Weights
    weightNormal: "400",
    weightMedium: "500",
    weightSemibold: "600",
    weightBold: "700",
    weightExtrabold: "800",

    // Line heights
    lineSnug: "1.375",
    lineNormal: "1.5",
    lineRelaxed: "1.625",

    // Letter spacing
    trackingNormal: "0em",
    trackingWide: "0.025em",
    trackingTight: "-0.015em",
  },

  spacing: {
    "0": "0",
    "1": "0.25rem", //  4px
    "2": "0.5rem", //  8px
    "3": "0.75rem", // 12px
    "4": "1rem", // 16px
    "5": "1.25rem", // 20px
    "6": "1.5rem", // 24px
    "8": "2rem", // 32px
    "10": "2.5rem", // 40px
    "12": "3rem", // 48px
    "16": "4rem", // 64px
    "20": "5rem", // 80px
    "24": "6rem", // 96px
  },

  radius: {
    sm: "0.375rem", //  6px
    md: "0.5rem", //  8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },

  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.5)",
    md: "0 4px 6px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)",
    lg: "0 10px 15px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3)",
    xl: "0 20px 25px rgba(0,0,0,0.5), 0 8px 10px rgba(0,0,0,0.2)",
    glow: "0 0 24px rgba(99,102,241,0.35)",
    glowAccent: "0 0 24px rgba(245,158,11,0.35)",
  },

  layout: {
    contentWidth: "1200px",
    narrowWidth: "760px",
    sidebarWidth: "280px",
    headerHeight: "64px",
  },

  transition: {
    fast: "150ms ease",
    normal: "250ms ease",
    slow: "400ms ease",
  },
} as const;

export type Tokens = typeof tokens;

// ─── CSS variable name map ─────────────────────────────────────────────────
// Prefix: --tf- (tutorial-framework)

export function tokensToCSS(t: typeof tokens): string {
  const lines: string[] = [":root {"];

  // colors
  for (const [k, v] of Object.entries(t.color)) {
    lines.push(`  --tf-${camel2kebab(k)}: ${v};`);
  }
  // typography
  for (const [k, v] of Object.entries(t.typography)) {
    lines.push(`  --tf-${camel2kebab(k)}: ${v};`);
  }
  // spacing
  for (const [k, v] of Object.entries(t.spacing)) {
    lines.push(`  --tf-space-${k}: ${v};`);
  }
  // radius
  for (const [k, v] of Object.entries(t.radius)) {
    lines.push(`  --tf-radius-${k}: ${v};`);
  }
  // shadow
  for (const [k, v] of Object.entries(t.shadow)) {
    lines.push(`  --tf-shadow-${k}: ${v};`);
  }
  // layout
  for (const [k, v] of Object.entries(t.layout)) {
    lines.push(`  --tf-${camel2kebab(k)}: ${v};`);
  }
  // transition
  for (const [k, v] of Object.entries(t.transition)) {
    lines.push(`  --tf-transition-${k}: ${v};`);
  }

  lines.push("}");
  return lines.join("\n");
}

function camel2kebab(s: string): string {
  return s.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}
