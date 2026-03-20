/**
 * Centralized Mermaid theme configuration.
 *
 * Derives all Mermaid `themeVariables` from the framework palette so diagram
 * colors stay in sync with `--tf-*` CSS tokens and the Brand Guide.
 * Any component that renders Mermaid (AnimatedMermaidWidget, MermaidDiagram,
 * etc.) should call `initMermaid()` once before its first render — the
 * function is idempotent.
 */

import { palette } from "./colors";

/* ── Theme variables (maps 1-to-1 with Mermaid's dark theme API) ────── */

export const mermaidThemeVariables = {
  darkMode: true,
  background: palette.background.base,

  // Primary role — brand cyan for high-contrast nodes on dark surfaces
  primaryColor: palette.background.overlay,
  primaryTextColor: palette.text.primary,
  primaryBorderColor: palette.secondary[500],

  // Secondary role — brand purple accent
  secondaryColor: palette.accent[900],
  secondaryTextColor: palette.text.primary,
  secondaryBorderColor: palette.accent[400],

  // Tertiary role — muted surface for supporting elements
  tertiaryColor: palette.background.elevated,
  tertiaryTextColor: palette.text.secondary,
  tertiaryBorderColor: palette.border.default,

  // Edges — brand cyan for high visibility on dark backgrounds
  lineColor: palette.secondary[500],
  textColor: palette.text.primary,

  // Nodes
  mainBkg: palette.background.overlay,
  nodeBorder: palette.secondary[500],
  nodeTextColor: palette.text.primary,

  // Clusters
  clusterBkg: palette.background.surface,
  clusterBorder: palette.border.strong,

  // Labels & titles
  titleColor: palette.text.primary,
  edgeLabelBackground: palette.background.elevated,

  // Actor/Sequence diagrams
  actorTextColor: palette.text.primary,
  actorBkg: palette.background.overlay,
  actorBorder: palette.secondary[500],
  signalColor: palette.secondary[500],
  signalTextColor: palette.text.primary,

  // Notes
  noteBkgColor: palette.background.elevated,
  noteTextColor: palette.text.secondary,
  noteBorderColor: palette.border.default,

  // Typography
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "14px",
} as const;

/* ── Initializer (idempotent) ─────────────────────────────────────────── */

let initialized = false;

/**
 * Call before the first Mermaid render in a page.  Safe to call multiple
 * times — subsequent calls are no-ops.
 */
export function initMermaid(): void {
  if (initialized) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mermaid = (window as any).mermaid;
  if (!mermaid?.initialize) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: mermaidThemeVariables,
  });
  initialized = true;
}
