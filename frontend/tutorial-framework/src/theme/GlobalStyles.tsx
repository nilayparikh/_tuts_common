import React from "react";
import { tokens } from "./tokens";

/**
 * Inject CSS variables and base resets.
 * Include <TutorialGlobalStyles /> once at the root of your app
 * (e.g. inside _app.tsx or layout.tsx).
 */
export function TutorialGlobalStyles(): React.ReactElement {
  const css = buildCSS();
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function buildCSS(): string {
  const c = tokens.color;
  const ty = tokens.typography;
  const r = tokens.radius;
  const sh = tokens.shadow;
  const la = tokens.layout;
  const tr = tokens.transition;

  return `
/* ─── LocalM Tutorial Framework: CSS Variables ─────────────────────────── */
:root {
  /* Backgrounds */
  --tf-bg-base:       ${c.bgBase};
  --tf-bg-surface:    ${c.bgSurface};
  --tf-bg-elevated:   ${c.bgElevated};
  --tf-bg-overlay:    ${c.bgOverlay};

  /* Borders */
  --tf-border-subtle:  ${c.borderSubtle};
  --tf-border-default: ${c.borderDefault};
  --tf-border-strong:  ${c.borderStrong};

  /* Text */
  --tf-text-primary:   ${c.textPrimary};
  --tf-text-secondary: ${c.textSecondary};
  --tf-text-muted:     ${c.textMuted};
  --tf-text-inverse:   ${c.textInverse};

  /* Brand */
  --tf-color-primary:       ${c.primary};
  --tf-color-primary-light: ${c.primaryLight};
  --tf-color-primary-dark:  ${c.primaryDark};
  --tf-color-primary-bg:    ${c.primaryBg};
  --tf-color-accent:        ${c.accent};
  --tf-color-accent-light:  ${c.accentLight};
  --tf-color-accent-dark:   ${c.accentDark};

  /* Semantic */
  --tf-color-success:     ${c.success};
  --tf-color-success-bg:  ${c.successBg};
  --tf-color-warning:     ${c.warning};
  --tf-color-warning-bg:  ${c.warningBg};
  --tf-color-danger:      ${c.danger};
  --tf-color-danger-bg:   ${c.dangerBg};

  /* Code */
  --tf-code-bg:       ${c.codeBg};
  --tf-code-text:     ${c.codeText};
  --tf-code-keyword:  ${c.codeKeyword};
  --tf-code-string:   ${c.codeString};
  --tf-code-comment:  ${c.codeComment};
  --tf-code-number:   ${c.codeNumber};

  /* Typography */
  --tf-font-display: ${ty.fontDisplay};
  --tf-font-body:    ${ty.fontBody};
  --tf-font-mono:    ${ty.fontMono};

  --tf-text-xs:   ${ty.sizeXs};
  --tf-text-sm:   ${ty.sizeSm};
  --tf-text-md:   ${ty.sizeMd};
  --tf-text-lg:   ${ty.sizeLg};
  --tf-text-xl:   ${ty.sizeXl};
  --tf-text-2xl:  ${ty.size2xl};
  --tf-text-3xl:  ${ty.size3xl};
  --tf-text-4xl:  ${ty.size4xl};
  --tf-text-5xl:  ${ty.size5xl};
  --tf-text-6xl:  ${ty.size6xl};

  --tf-font-normal:    ${ty.weightNormal};
  --tf-font-medium:    ${ty.weightMedium};
  --tf-font-semibold:  ${ty.weightSemibold};
  --tf-font-bold:      ${ty.weightBold};
  --tf-font-extrabold: ${ty.weightExtrabold};

  --tf-leading-snug:    ${ty.lineSnug};
  --tf-leading-normal:  ${ty.lineNormal};
  --tf-leading-relaxed: ${ty.lineRelaxed};

  --tf-tracking-normal: ${ty.trackingNormal};
  --tf-tracking-wide:   ${ty.trackingWide};
  --tf-tracking-tight:  ${ty.trackingTight};

  /* Spacing */
  --tf-space-0:  0;
  --tf-space-1:  0.25rem;
  --tf-space-2:  0.5rem;
  --tf-space-3:  0.75rem;
  --tf-space-4:  1rem;
  --tf-space-5:  1.25rem;
  --tf-space-6:  1.5rem;
  --tf-space-8:  2rem;
  --tf-space-10: 2.5rem;
  --tf-space-12: 3rem;
  --tf-space-16: 4rem;
  --tf-space-20: 5rem;
  --tf-space-24: 6rem;

  /* Radius */
  --tf-radius-sm:   ${r.sm};
  --tf-radius-md:   ${r.md};
  --tf-radius-lg:   ${r.lg};
  --tf-radius-xl:   ${r.xl};
  --tf-radius-2xl:  ${r["2xl"]};
  --tf-radius-full: ${r.full};

  /* Shadows */
  --tf-shadow-sm: ${sh.sm};
  --tf-shadow-md: ${sh.md};
  --tf-shadow-lg: ${sh.lg};
  --tf-shadow-xl: ${sh.xl};
  --tf-shadow-glow: ${sh.glow};
  --tf-shadow-glow-accent: ${sh.glowAccent};

  /* Layout */
  --tf-content-width:  ${la.contentWidth};
  --tf-narrow-width:   ${la.narrowWidth};
  --tf-sidebar-width:  ${la.sidebarWidth};
  --tf-header-height:  ${la.headerHeight};

  /* Transitions */
  --tf-transition-fast:   ${tr.fast};
  --tf-transition-normal: ${tr.normal};
  --tf-transition-slow:   ${tr.slow};
}

/* ─── Base Reset ─────────────────────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  background-color: var(--tf-bg-base);
  color: var(--tf-text-primary);
  font-family: var(--tf-font-body);
  font-size: var(--tf-text-md);
  line-height: var(--tf-leading-normal);
  letter-spacing: var(--tf-tracking-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--tf-color-primary-light);
  text-decoration: none;
  transition: color var(--tf-transition-fast);
}

a:hover {
  color: var(--tf-color-primary);
  text-decoration: underline;
}

img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

code, kbd, samp, pre {
  font-family: var(--tf-font-mono);
}

code:not(pre code) {
  background: var(--tf-code-bg);
  color: var(--tf-code-text);
  padding: 0.125em 0.375em;
  border-radius: var(--tf-radius-sm);
  font-size: 0.875em;
  border: 1px solid var(--tf-border-subtle);
}

/* ─── Scrollbar ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track  { background: var(--tf-bg-base); }
::-webkit-scrollbar-thumb  {
  background: var(--tf-border-default);
  border-radius: var(--tf-radius-full);
}
::-webkit-scrollbar-thumb:hover { background: var(--tf-border-strong); }

/* ─── Selection ──────────────────────────────────────────────────────────── */
::selection {
  background: var(--tf-color-primary-bg);
  color: var(--tf-color-primary-light);
}

/* ─── Focus ring ─────────────────────────────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--tf-color-primary);
  outline-offset: 2px;
  border-radius: var(--tf-radius-sm);
}
`;
}
