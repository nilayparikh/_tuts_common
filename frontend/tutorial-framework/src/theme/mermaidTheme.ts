/**
 * Centralized Mermaid theme configuration.
 *
 * Mermaid does not resolve CSS variables inside `themeVariables`, so shared
 * diagram components must read the active runtime CSS values first and then
 * pass concrete colours into `mermaid.initialize(...)`.
 */

import { palette } from "./colors";

type MermaidThemeRoot = HTMLElement | CSSStyleDeclaration | null | undefined;

function resolveStyleSource(root?: MermaidThemeRoot): CSSStyleDeclaration | null {
  if (!root) {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return null;
    }
    return getComputedStyle(document.documentElement);
  }

  if ("getPropertyValue" in root) {
    return root as CSSStyleDeclaration;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return getComputedStyle(root);
}

function readRuntimeThemeVar(
  source: CSSStyleDeclaration | null,
  variableName: string,
  fallback: string,
): string {
  const value = source?.getPropertyValue(variableName)?.trim();
  return value || fallback;
}

const MERMAID_SEMANTIC_TOKENS = {
  nodeBg: "__TF_MERMAID_NODE_BG__",
  success: "__TF_MERMAID_SUCCESS__",
  danger: "__TF_MERMAID_DANGER__",
  warning: "__TF_MERMAID_WARNING__",
  recommendation: "__TF_MERMAID_RECOMMENDATION__",
  neutral: "__TF_MERMAID_NEUTRAL__",
  info: "__TF_MERMAID_INFO__",
  text: "__TF_MERMAID_TEXT__",
} as const;

type MermaidSemanticToken =
  (typeof MERMAID_SEMANTIC_TOKENS)[keyof typeof MERMAID_SEMANTIC_TOKENS];

const MERMAID_LEGACY_COLOR_TOKEN_MAP: Record<string, MermaidSemanticToken> = {
  "#191c23": MERMAID_SEMANTIC_TOKENS.nodeBg,
  "#1e3a5f": MERMAID_SEMANTIC_TOKENS.nodeBg,
  "#2d1b4e": MERMAID_SEMANTIC_TOKENS.nodeBg,
  "#1a3a2a": MERMAID_SEMANTIC_TOKENS.nodeBg,
  "#3a2a1a": MERMAID_SEMANTIC_TOKENS.nodeBg,
  "#4a1a1a": MERMAID_SEMANTIC_TOKENS.nodeBg,
  "#1a2a3a": MERMAID_SEMANTIC_TOKENS.nodeBg,
  "#2a1a3a": MERMAID_SEMANTIC_TOKENS.nodeBg,
  "#22c55e": MERMAID_SEMANTIC_TOKENS.success,
  "#34d399": MERMAID_SEMANTIC_TOKENS.success,
  "#ef4444": MERMAID_SEMANTIC_TOKENS.danger,
  "#f87171": MERMAID_SEMANTIC_TOKENS.danger,
  "#f59e0b": MERMAID_SEMANTIC_TOKENS.warning,
  "#fbbf24": MERMAID_SEMANTIC_TOKENS.warning,
  "#818cf8": MERMAID_SEMANTIC_TOKENS.recommendation,
  "#6366f1": MERMAID_SEMANTIC_TOKENS.recommendation,
  "#8b5cf6": MERMAID_SEMANTIC_TOKENS.recommendation,
  "#a855f7": MERMAID_SEMANTIC_TOKENS.recommendation,
  "#a78bfa": MERMAID_SEMANTIC_TOKENS.recommendation,
  "#c084fc": MERMAID_SEMANTIC_TOKENS.recommendation,
  "#d8b4fe": MERMAID_SEMANTIC_TOKENS.recommendation,
  "#f0abfc": MERMAID_SEMANTIC_TOKENS.recommendation,
  "#64748b": MERMAID_SEMANTIC_TOKENS.neutral,
  "#06b6d4": MERMAID_SEMANTIC_TOKENS.info,
  "#38bdf8": MERMAID_SEMANTIC_TOKENS.info,
  "#60a5fa": MERMAID_SEMANTIC_TOKENS.info,
  "#e2e8f0": MERMAID_SEMANTIC_TOKENS.text,
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMermaidSemanticColorMap(
  root?: MermaidThemeRoot,
): Record<MermaidSemanticToken, string> {
  const styles = resolveStyleSource(root);

  return {
    [MERMAID_SEMANTIC_TOKENS.nodeBg]: readRuntimeThemeVar(
      styles,
      "--tf-surface-card-bg",
      palette.background.elevated,
    ),
    [MERMAID_SEMANTIC_TOKENS.success]: readRuntimeThemeVar(
      styles,
      "--tf-state-success-accent",
      palette.success[500],
    ),
    [MERMAID_SEMANTIC_TOKENS.danger]: readRuntimeThemeVar(
      styles,
      "--tf-state-danger-accent",
      palette.danger[500],
    ),
    [MERMAID_SEMANTIC_TOKENS.warning]: readRuntimeThemeVar(
      styles,
      "--tf-state-warning-accent",
      palette.warning[500],
    ),
    [MERMAID_SEMANTIC_TOKENS.recommendation]: readRuntimeThemeVar(
      styles,
      "--tf-state-recommendation-icon",
      palette.primary[300],
    ),
    [MERMAID_SEMANTIC_TOKENS.neutral]: readRuntimeThemeVar(
      styles,
      "--tf-state-neutral-accent",
      palette.text.muted,
    ),
    [MERMAID_SEMANTIC_TOKENS.info]: readRuntimeThemeVar(
      styles,
      "--tf-state-info-accent",
      palette.secondary[500],
    ),
    [MERMAID_SEMANTIC_TOKENS.text]: readRuntimeThemeVar(
      styles,
      "--tf-text-primary",
      palette.text.primary,
    ),
  };
}

/**
 * Applies semantic Mermaid placeholders and legacy raw color aliases to
 * runtime-resolved values so deck diagrams follow the active theme contract.
 */
export function applyMermaidSemanticColors(
  chart: string,
  root?: MermaidThemeRoot,
): string {
  if (!chart) return chart;

  const semanticColors = buildMermaidSemanticColorMap(root);
  let themedChart = chart;

  for (const [token, color] of Object.entries(semanticColors)) {
    themedChart = themedChart.split(token).join(color);
  }

  for (const [legacyColor, token] of Object.entries(
    MERMAID_LEGACY_COLOR_TOKEN_MAP,
  )) {
    themedChart = themedChart.replace(
      new RegExp(escapeRegex(legacyColor), "gi"),
      semanticColors[token],
    );
  }

  return themedChart;
}

export function buildMermaidThemeVariables(root?: MermaidThemeRoot) {
  const styles = resolveStyleSource(root);

  return {
    darkMode: true,
    background: readRuntimeThemeVar(
      styles,
      "--tf-surface-stage-bg",
      palette.background.base,
    ),

    // Primary role — high-visibility runtime info/recommendation nodes.
    primaryColor: readRuntimeThemeVar(
      styles,
      "--tf-surface-control-bg",
      palette.background.overlay,
    ),
    primaryTextColor: readRuntimeThemeVar(
      styles,
      "--tf-text-primary",
      palette.text.primary,
    ),
    primaryBorderColor: readRuntimeThemeVar(
      styles,
      "--tf-state-info-accent",
      palette.secondary[500],
    ),

    // Secondary role — emphasis surfaces for contrasted subflows.
    secondaryColor: readRuntimeThemeVar(
      styles,
      "--tf-state-emphasis-bg",
      palette.accent[900],
    ),
    secondaryTextColor: readRuntimeThemeVar(
      styles,
      "--tf-text-primary",
      palette.text.primary,
    ),
    secondaryBorderColor: readRuntimeThemeVar(
      styles,
      "--tf-state-emphasis-border",
      palette.accent[400],
    ),

    // Tertiary role — quieter supporting surfaces.
    tertiaryColor: readRuntimeThemeVar(
      styles,
      "--tf-surface-card-bg",
      palette.background.elevated,
    ),
    tertiaryTextColor: readRuntimeThemeVar(
      styles,
      "--tf-text-secondary",
      palette.text.secondary,
    ),
    tertiaryBorderColor: readRuntimeThemeVar(
      styles,
      "--tf-surface-panel-border",
      palette.border.default,
    ),

    lineColor: readRuntimeThemeVar(
      styles,
      "--tf-state-info-accent",
      palette.secondary[500],
    ),
    textColor: readRuntimeThemeVar(
      styles,
      "--tf-text-primary",
      palette.text.primary,
    ),

    mainBkg: readRuntimeThemeVar(
      styles,
      "--tf-surface-control-bg",
      palette.background.overlay,
    ),
    nodeBorder: readRuntimeThemeVar(
      styles,
      "--tf-state-info-accent",
      palette.secondary[500],
    ),
    nodeTextColor: readRuntimeThemeVar(
      styles,
      "--tf-text-primary",
      palette.text.primary,
    ),

    clusterBkg: readRuntimeThemeVar(
      styles,
      "--tf-surface-panel-bg",
      palette.background.surface,
    ),
    clusterBorder: readRuntimeThemeVar(
      styles,
      "--tf-surface-panel-border",
      palette.border.strong,
    ),

    titleColor: readRuntimeThemeVar(
      styles,
      "--tf-text-primary",
      palette.text.primary,
    ),
    edgeLabelBackground: readRuntimeThemeVar(
      styles,
      "--tf-surface-card-bg",
      palette.background.elevated,
    ),

    actorTextColor: readRuntimeThemeVar(
      styles,
      "--tf-text-primary",
      palette.text.primary,
    ),
    actorBkg: readRuntimeThemeVar(
      styles,
      "--tf-surface-control-bg",
      palette.background.overlay,
    ),
    actorBorder: readRuntimeThemeVar(
      styles,
      "--tf-state-info-accent",
      palette.secondary[500],
    ),
    signalColor: readRuntimeThemeVar(
      styles,
      "--tf-state-info-accent",
      palette.secondary[500],
    ),
    signalTextColor: readRuntimeThemeVar(
      styles,
      "--tf-text-primary",
      palette.text.primary,
    ),

    noteBkgColor: readRuntimeThemeVar(
      styles,
      "--tf-surface-card-bg",
      palette.background.elevated,
    ),
    noteTextColor: readRuntimeThemeVar(
      styles,
      "--tf-text-secondary",
      palette.text.secondary,
    ),
    noteBorderColor: readRuntimeThemeVar(
      styles,
      "--tf-surface-panel-border",
      palette.border.default,
    ),

    fontFamily: readRuntimeThemeVar(
      styles,
      "--tf-font-body",
      "Inter, system-ui, sans-serif",
    ),
    fontSize: readRuntimeThemeVar(styles, "--tf-text-md", "14px"),
  } as const;
}

export let mermaidThemeVariables = buildMermaidThemeVariables();

let initializedSignature = "";

/**
 * Call before Mermaid renders. Re-initializes when the active runtime theme
 * changes so diagrams stay aligned with the current CSS-variable contract.
 */
export function initMermaid(root?: MermaidThemeRoot): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mermaid = (window as any).mermaid;
  if (!mermaid?.initialize) return;

  const nextThemeVariables = buildMermaidThemeVariables(root);
  const signature = JSON.stringify(nextThemeVariables);
  if (initializedSignature === signature) return;

  mermaidThemeVariables = nextThemeVariables;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: nextThemeVariables,
  });
  initializedSignature = signature;
}
