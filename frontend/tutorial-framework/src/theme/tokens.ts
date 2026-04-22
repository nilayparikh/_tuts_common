/**
 * LocalM Tutorial Framework – Design Tokens (Material Design 3)
 *
 * All values are consumed by GlobalStyles which maps them to CSS custom properties.
 * Components reference CSS vars (e.g. var(--tf-bg-base)) so themes are
 * swappable at runtime without a full rebuild.
 *
 * Typography uses clamp() for fluid sizing — no fixed px.
 * Follows MD3 type scale: Display, Headline, Title, Body, Label.
 */

import { palette } from "./colors";

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((segment) => `${segment}${segment}`)
          .join("")
      : normalized;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function pickOnColor(hex: string): string {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((segment) => `${segment}${segment}`)
          .join("")
      : normalized;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.55 ? palette.white : palette.text.inverse;
}

// ─── Semantic token map ────────────────────────────────────────────────────

export const tokens = {
  color: {
    // MD3 Surface system
    bgBase: palette.background.base,
    bgSurface: palette.background.surface,
    bgElevated: palette.background.elevated,
    bgOverlay: palette.background.overlay,
    bgHighest: palette.background.highest,

    // Outline
    borderSubtle: palette.border.subtle,
    borderDefault: palette.border.default,
    borderStrong: palette.border.strong,

    // On-surface text
    textPrimary: palette.text.primary,
    textSecondary: palette.text.secondary,
    textMuted: palette.text.muted,
    textInverse: palette.text.inverse,

    // Primary
    primary: palette.primary[500],
    primaryLight: palette.primary[400],
    primaryDark: palette.primary[700],
    primaryBg: palette.primary[950],
    primaryContainer: "rgba(41,50,255,0.12)",

    // Secondary (Teal)
    secondary: palette.secondary[500],
    secondaryLight: palette.secondary[400],
    secondaryContainer: "rgba(0,245,255,0.12)",

    // Accent / Tertiary
    accent: palette.accent[500],
    accentLight: palette.accent[300],
    accentDark: palette.accent[700],
    accentContainer: "rgba(168,56,255,0.10)",

    // Semantic
    success: palette.success[500],
    successBg: palette.success[900],
    successContainer: "rgba(0,255,178,0.10)",
    warning: palette.warning[500],
    warningBg: "#3d2e0a",
    warningContainer: "rgba(255,176,58,0.10)",
    danger: palette.danger[500],
    dangerBg: "#3b0f0f",
    dangerContainer: "rgba(239,68,68,0.08)",

    // Semantic borders (MD3 outline per role — ~35 % opacity)
    primaryBorder: "rgba(41,50,255,0.35)",
    secondaryBorder: "rgba(0,245,255,0.35)",
    accentBorder: "rgba(168,56,255,0.35)",
    successBorder: "rgba(0,255,178,0.35)",
    warningBorder: "rgba(255,176,58,0.35)",
    dangerBorder: "rgba(239,68,68,0.35)",

    // Stronger containers (MD3 Container High — ~18 % opacity)
    primaryContainerHigh: "rgba(41,50,255,0.18)",
    secondaryContainerHigh: "rgba(0,245,255,0.18)",
    accentContainerHigh: "rgba(168,56,255,0.14)",
    successContainerHigh: "rgba(0,255,178,0.15)",
    warningContainerHigh: "rgba(255,176,58,0.14)",
    dangerContainerHigh: "rgba(239,68,68,0.12)",

    // On-color pairs for filled or strongly tinted surfaces
    textOnPrimary: pickOnColor(palette.primary[500]),
    textOnSecondary: pickOnColor(palette.secondary[500]),
    textOnAccent: pickOnColor(palette.accent[500]),
    textOnSuccess: pickOnColor(palette.success[500]),
    textOnWarning: pickOnColor(palette.warning[500]),
    textOnDanger: pickOnColor(palette.danger[500]),
    textOnEmphasis: pickOnColor(palette.semantic.emphasis),
    textOnInfo: pickOnColor(palette.semantic.info),
    textOnRecommendation: pickOnColor(palette.semantic.recommendation),
    textOnEvidence: pickOnColor(palette.semantic.evidence),

    // Shared semantic state families
    stateNeutralBg: withAlpha(palette.semantic.neutral, 0.08),
    stateNeutralBorder: withAlpha(palette.semantic.neutral, 0.22),
    stateNeutralAccent: palette.semantic.neutral,
    stateNeutralText: palette.text.primary,
    stateNeutralIcon: palette.semantic.neutral,

    stateEmphasisBg: withAlpha(palette.semantic.emphasis, 0.14),
    stateEmphasisBorder: withAlpha(palette.semantic.emphasis, 0.35),
    stateEmphasisAccent: palette.semantic.emphasis,
    stateEmphasisText: palette.text.primary,
    stateEmphasisIcon: palette.semantic.emphasis,

    stateInfoBg: withAlpha(palette.semantic.info, 0.12),
    stateInfoBorder: withAlpha(palette.semantic.info, 0.35),
    stateInfoAccent: palette.semantic.info,
    stateInfoText: palette.text.primary,
    stateInfoIcon: palette.semantic.info,

    stateSuccessBg: withAlpha(palette.semantic.trendPositive, 0.12),
    stateSuccessBorder: withAlpha(palette.semantic.trendPositive, 0.35),
    stateSuccessAccent: palette.semantic.trendPositive,
    stateSuccessText: palette.text.primary,
    stateSuccessIcon: palette.semantic.trendPositive,

    stateWarningBg: withAlpha(palette.warning[500], 0.12),
    stateWarningBorder: withAlpha(palette.warning[500], 0.35),
    stateWarningAccent: palette.warning[500],
    stateWarningText: palette.text.primary,
    stateWarningIcon: palette.warning[500],

    stateDangerBg: withAlpha(palette.semantic.trendNegative, 0.1),
    stateDangerBorder: withAlpha(palette.semantic.trendNegative, 0.35),
    stateDangerAccent: palette.semantic.trendNegative,
    stateDangerText: palette.text.primary,
    stateDangerIcon: palette.semantic.trendNegative,

    stateRecommendationBg: withAlpha(palette.semantic.recommendation, 0.12),
    stateRecommendationBorder: withAlpha(
      palette.semantic.recommendation,
      0.35,
    ),
    stateRecommendationAccent: palette.semantic.recommendation,
    stateRecommendationText: palette.text.primary,
    stateRecommendationIcon: palette.semantic.recommendation,

    stateEvidenceBg: withAlpha(palette.semantic.evidence, 0.12),
    stateEvidenceBorder: withAlpha(palette.semantic.evidence, 0.35),
    stateEvidenceAccent: palette.semantic.evidence,
    stateEvidenceText: palette.text.primary,
    stateEvidenceIcon: palette.semantic.evidence,

    stateTrendPositiveBg: withAlpha(palette.semantic.trendPositive, 0.12),
    stateTrendPositiveBorder: withAlpha(
      palette.semantic.trendPositive,
      0.35,
    ),
    stateTrendPositiveAccent: palette.semantic.trendPositive,
    stateTrendPositiveText: palette.text.primary,
    stateTrendPositiveIcon: palette.semantic.trendPositive,

    stateTrendNegativeBg: withAlpha(palette.semantic.trendNegative, 0.1),
    stateTrendNegativeBorder: withAlpha(
      palette.semantic.trendNegative,
      0.35,
    ),
    stateTrendNegativeAccent: palette.semantic.trendNegative,
    stateTrendNegativeText: palette.text.primary,
    stateTrendNegativeIcon: palette.semantic.trendNegative,

    stateTrendNeutralBg: withAlpha(palette.semantic.trendNeutral, 0.08),
    stateTrendNeutralBorder: withAlpha(palette.semantic.trendNeutral, 0.22),
    stateTrendNeutralAccent: palette.semantic.trendNeutral,
    stateTrendNeutralText: palette.text.primary,
    stateTrendNeutralIcon: palette.semantic.trendNeutral,

    // Shared runtime surface aliases
    surfaceStageBg: palette.background.base,
    surfaceStageBorder: palette.border.subtle,
    surfaceStageText: palette.text.primary,
    surfaceCardBg: palette.background.elevated,
    surfaceCardBorder: palette.border.default,
    surfaceCardText: palette.text.primary,
    surfacePanelBg: palette.background.surface,
    surfacePanelBorder: palette.border.default,
    surfacePanelText: palette.text.primary,
    surfaceControlBg: palette.background.overlay,
    surfaceControlBorder: palette.border.default,
    surfaceControlText: palette.text.primary,
    surfaceOverlayBg: palette.background.overlay,
    surfaceOverlayBorder: palette.border.strong,
    surfaceOverlayText: palette.text.primary,
    surfaceShortsBg: palette.background.surface,
    surfaceShortsBorder: palette.border.default,
    surfaceShortsText: palette.text.primary,
    surfaceFeedBg: palette.background.surface,
    surfaceFeedBorder: palette.border.default,
    surfaceFeedText: palette.text.primary,
    surfaceEndScreenBg: palette.background.elevated,
    surfaceEndScreenBorder: palette.border.default,
    surfaceEndScreenText: palette.text.primary,

    // Decorative gradients, glass, and backdrop tokens
    gradientBrand: `linear-gradient(135deg, ${palette.primary[500]} 0%, ${palette.accent[500]} 55%, ${palette.secondary[500]} 100%)`,
    gradientStage: `linear-gradient(135deg, ${palette.background.base} 0%, ${palette.background.surface} 46%, ${palette.background.overlay} 100%)`,
    gradientOverlay: `linear-gradient(180deg, ${withAlpha(palette.background.overlay, 0.96)} 0%, ${withAlpha(palette.background.base, 0.98)} 100%)`,
    glassBg: withAlpha(palette.background.surface, 0.72),
    glassBorder: palette.border.default,
    glassHighlight:
      "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 52%)",
    glassBlur: "20px",
    glowPrimary: `0 0 40px ${withAlpha(palette.primary[500], 0.12)}, 0 0 80px ${withAlpha(palette.primary[500], 0.04)}`,
    bgBackdrop: `radial-gradient(circle at top left, ${withAlpha(palette.primary[500], 0.16)}, transparent 32%), radial-gradient(circle at top right, ${withAlpha(palette.accent[500], 0.12)}, transparent 36%), radial-gradient(circle at bottom center, ${withAlpha(palette.secondary[500], 0.14)}, transparent 42%), linear-gradient(135deg, ${palette.background.base} 0%, ${palette.background.surface} 46%, ${palette.background.overlay} 100%)`,

    // Focus system
    focusRing: palette.semantic.focus,
    focusRingOffset: "0.125rem",
    focusRingShadow: `0 0 0 0.25rem ${withAlpha(palette.primary[500], 0.22)}`,

    // Brand — LocalM (canonical identity colors)
    brandLocalmCyan: palette.localm.cyan,
    brandLocalmBlue: palette.localm.blue,
    brandLocalmPurple: palette.localm.purple,
    brandLocalmGreen: palette.localm.green,
    brandLocalmGold: palette.localm.gold,

    // Brand — third-party service colors
    brandYouTube: "#ff0000",
    brandSpotify: "#1DB954",
    brandApple: "#FC3C44",
    brandLinkedIn: "#0a66c2",

    // Code
    codeBg: palette.background.overlay,
    codeText: "#e2e8f0",
    codeKeyword: palette.primary[400],
    codeString: palette.success[400],
    codeComment: palette.text.muted,
    codeNumber: palette.accent[400],

    // Decorative (traffic-light dots)
    decorRed: "#ff5f57",
    decorYellow: "#febc2e",
    decorGreen: "#28c840",
  },

  typography: {
    // Brand + readability: Outfit for display headings, Inter for body text
    fontDisplay: '"Outfit", "Segoe UI", Roboto, Arial, sans-serif',
    fontBody: '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    fontMono:
      '"JetBrains Mono", "Share Tech Mono", Consolas, "Courier New", monospace',

    // Fluid type scale (clamp: min, preferred, max)
    // MD3 naming: label-sm / body-sm / body-md / body-lg / title-sm / title-md / title-lg / headline-sm / headline-md / headline-lg / display-sm / display-md
    sizeXs: "clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem)", // ~11-12
    sizeSm: "clamp(0.8125rem, 0.775rem + 0.2vw, 0.875rem)", // ~13-14
    sizeMd: "clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)", // ~15-16
    sizeLg: "clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)", // ~17-18
    sizeXl: "clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem)", // ~18-20
    size2xl: "clamp(1.375rem, 1.25rem + 0.6vw, 1.5rem)", // ~22-24
    size3xl: "clamp(1.625rem, 1.4rem + 1.1vw, 1.875rem)", // ~26-30
    size4xl: "clamp(2rem, 1.7rem + 1.5vw, 2.25rem)", // ~32-36
    size5xl: "clamp(2.5rem, 2rem + 2.5vw, 3rem)", // ~40-48
    size6xl: "clamp(3rem, 2.4rem + 3vw, 3.75rem)", // ~48-60

    // Weights (MD3)
    weightNormal: "400",
    weightMedium: "500",
    weightSemibold: "600",
    weightBold: "700",
    weightExtrabold: "800",

    // Line heights
    lineSnug: "1.375",
    lineNormal: "1.5",
    lineRelaxed: "1.625",
    lineLoose: "1.75",

    // Letter spacing
    trackingNormal: "0em",
    trackingWide: "0.025em",
    trackingTight: "-0.015em",
    trackingTighter: "-0.025em",
    trackingWidest: "0.08em",
  },

  spacing: {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
  },

  radius: {
    xs: "0.25rem", // 4 — MD3 Extra Small
    sm: "0.5rem", //  8 — MD3 Small
    md: "0.75rem", // 12 — MD3 Medium
    lg: "1rem", // 16 — MD3 Large
    xl: "0.75rem", // 12 — uniform with md for card surfaces
    full: "9999px", // Full
  },

  shadow: {
    // MD3 elevation levels (dark theme: tonal + shadow)
    level0: "none",
    level1: "0 1px 3px 1px rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.3)",
    level2: "0 2px 6px 2px rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.3)",
    level3: "0 4px 8px 3px rgba(0,0,0,0.3), 0 1px 3px 0 rgba(0,0,0,0.3)",
    level4: "0 6px 10px 4px rgba(0,0,0,0.3), 0 2px 3px 0 rgba(0,0,0,0.3)",
    level5: "0 8px 12px 6px rgba(0,0,0,0.3), 0 4px 4px 0 rgba(0,0,0,0.3)",
    glow: "0 0 24px rgba(99,102,241,0.3)",
    glowAccent: "0 0 24px rgba(245,158,11,0.3)",
    // Aliases for backward compatibility
    sm: "0 1px 3px 1px rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.3)",
    md: "0 2px 6px 2px rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.3)",
    lg: "0 4px 8px 3px rgba(0,0,0,0.3), 0 1px 3px 0 rgba(0,0,0,0.3)",
    xl: "0 8px 12px 6px rgba(0,0,0,0.3), 0 4px 4px 0 rgba(0,0,0,0.3)",
  },

  layout: {
    contentWidth: "90rem", // 1440px in rem (~20% wider)
    narrowWidth: "58rem", // 928px in rem (~20% wider)
    sidebarWidth: "24rem", // 384px in rem
    headerHeight: "4rem", // 64px in rem
    courseMaxWidth: "100rem", // 1600px — max for centered 2-col player
  },

  transition: {
    // MD3 motion: Emphasized, Standard, Standard Decelerate
    fast: "150ms cubic-bezier(0.2, 0, 0, 1)",
    normal: "300ms cubic-bezier(0.2, 0, 0, 1)",
    slow: "500ms cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "500ms cubic-bezier(0.05, 0.7, 0.1, 1)",
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
    lines.push(`  ${typographyVarName(k)}: ${v};`);
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

function typographyVarName(key: string): string {
  if (key.startsWith("font")) {
    return `--tf-${camel2kebab(key)}`;
  }
  if (key.startsWith("size")) {
    return `--tf-text-${camel2kebab(key.slice(4))}`;
  }
  if (key.startsWith("weight")) {
    return `--tf-font-${camel2kebab(key.slice(6))}`;
  }
  if (key.startsWith("line")) {
    return `--tf-leading-${camel2kebab(key.slice(4))}`;
  }
  if (key.startsWith("tracking")) {
    return `--tf-tracking-${camel2kebab(key.slice(8))}`;
  }

  return `--tf-${camel2kebab(key)}`;
}
