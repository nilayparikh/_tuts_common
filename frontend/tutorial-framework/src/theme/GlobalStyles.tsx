import React from "react";
import { tokens } from "./tokens";

/**
 * Inject CSS variables and Material Design 3 base resets.
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
/* ─── LocalM Tutorial Framework: CSS Variables (Material Design 3) ──── */
:root {
  /* Surfaces */
  --tf-bg-base:       ${c.bgBase};
  --tf-bg-surface:    ${c.bgSurface};
  --tf-bg-elevated:   ${c.bgElevated};
  --tf-bg-overlay:    ${c.bgOverlay};
  --tf-bg-highest:    ${c.bgHighest};

  /* Outline */
  --tf-border-subtle:  ${c.borderSubtle};
  --tf-border-default: ${c.borderDefault};
  --tf-border-strong:  ${c.borderStrong};

  /* On-Surface Text */
  --tf-text-primary:   ${c.textPrimary};
  --tf-text-secondary: ${c.textSecondary};
  --tf-text-muted:     ${c.textMuted};
  --tf-text-inverse:   ${c.textInverse};

  /* Primary */
  --tf-color-primary:             ${c.primary};
  --tf-color-primary-light:       ${c.primaryLight};
  --tf-color-primary-dark:        ${c.primaryDark};
  --tf-color-primary-bg:          ${c.primaryBg};
  --tf-color-primary-container:   ${c.primaryContainer};

  /* Secondary */
  --tf-color-secondary:           ${c.secondary};
  --tf-color-secondary-light:     ${c.secondaryLight};
  --tf-color-secondary-container: ${c.secondaryContainer};

  /* Accent / Tertiary */
  --tf-color-accent:        ${c.accent};
  --tf-color-accent-light:  ${c.accentLight};
  --tf-color-accent-dark:   ${c.accentDark};
  --tf-color-accent-container: ${c.accentContainer};

  /* Semantic */
  --tf-color-success:           ${c.success};
  --tf-color-success-bg:        ${c.successBg};
  --tf-color-success-container: ${c.successContainer};
  --tf-color-warning:           ${c.warning};
  --tf-color-warning-bg:        ${c.warningBg};
  --tf-color-warning-container: ${c.warningContainer};
  --tf-color-danger:            ${c.danger};
  --tf-color-danger-bg:         ${c.dangerBg};
  --tf-color-danger-container:  ${c.dangerContainer};

  /* Semantic borders */
  --tf-color-primary-border:   ${c.primaryBorder};
  --tf-color-secondary-border: ${c.secondaryBorder};
  --tf-color-accent-border:    ${c.accentBorder};
  --tf-color-success-border:   ${c.successBorder};
  --tf-color-warning-border:   ${c.warningBorder};
  --tf-color-danger-border:    ${c.dangerBorder};

  /* Container High (stronger tint) */
  --tf-color-primary-container-high:   ${c.primaryContainerHigh};
  --tf-color-secondary-container-high: ${c.secondaryContainerHigh};
  --tf-color-accent-container-high:    ${c.accentContainerHigh};
  --tf-color-success-container-high:   ${c.successContainerHigh};
  --tf-color-warning-container-high:   ${c.warningContainerHigh};
  --tf-color-danger-container-high:    ${c.dangerContainerHigh};

  /* Brand */
  --tf-brand-youtube:  ${c.brandYouTube};
  --tf-brand-spotify:  ${c.brandSpotify};
  --tf-brand-apple:    ${c.brandApple};
  --tf-brand-linkedin: ${c.brandLinkedIn};

  /* Decorative */
  --tf-decor-red:    ${c.decorRed};
  --tf-decor-yellow: ${c.decorYellow};
  --tf-decor-green:  ${c.decorGreen};

  /* Code */
  --tf-code-bg:       ${c.codeBg};
  --tf-code-text:     ${c.codeText};
  --tf-code-keyword:  ${c.codeKeyword};
  --tf-code-string:   ${c.codeString};
  --tf-code-comment:  ${c.codeComment};
  --tf-code-number:   ${c.codeNumber};

  /* Typography (Fluid) */
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
  --tf-leading-loose:   ${ty.lineLoose};

  --tf-tracking-normal:  ${ty.trackingNormal};
  --tf-tracking-wide:    ${ty.trackingWide};
  --tf-tracking-tight:   ${ty.trackingTight};
  --tf-tracking-tighter: ${ty.trackingTighter};  --tf-tracking-widest:   ${ty.trackingWidest};
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

  /* Radius (MD3) */
  --tf-radius-xs:   ${r.xs};
  --tf-radius-sm:   ${r.sm};
  --tf-radius-md:   ${r.md};
  --tf-radius-lg:   ${r.lg};
  --tf-radius-xl:   ${r.xl};
  --tf-radius-full: ${r.full};

  /* Shadows (MD3 Elevation) */
  --tf-shadow-level0: ${sh.level0};
  --tf-shadow-level1: ${sh.level1};
  --tf-shadow-level2: ${sh.level2};
  --tf-shadow-level3: ${sh.level3};
  --tf-shadow-level4: ${sh.level4};
  --tf-shadow-level5: ${sh.level5};
  --tf-shadow-sm: ${sh.sm};
  --tf-shadow-md: ${sh.md};
  --tf-shadow-lg: ${sh.lg};
  --tf-shadow-xl: ${sh.xl};
  --tf-shadow-glow: ${sh.glow};
  --tf-shadow-glow-accent: ${sh.glowAccent};

  /* Layout */
  --tf-content-width:    ${la.contentWidth};
  --tf-narrow-width:     ${la.narrowWidth};
  --tf-sidebar-width:    ${la.sidebarWidth};
  --tf-header-height:    ${la.headerHeight};
  --tf-course-max-width: ${la.courseMaxWidth};

  /* Transitions (MD3 Motion) */
  --tf-transition-fast:       ${tr.fast};
  --tf-transition-normal:     ${tr.normal};
  --tf-transition-slow:       ${tr.slow};
  --tf-transition-emphasized: ${tr.emphasized};
}

/* ─── Base Reset (MD3 Dark) ──────────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: clamp(93.75%, 90% + 0.4vw, 106.25%);
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
  text-rendering: optimizeLegibility;
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
  font-feature-settings: "liga" 1, "calt" 1;
}

/* MD3 shape system */
a {
  color: var(--tf-color-primary-light);
  text-decoration: none;
  transition: color var(--tf-transition-fast);
}

a:hover {
  color: var(--tf-color-primary);
  text-decoration: underline;
  text-decoration-thickness: 0.0625em;
  text-underline-offset: 0.2em;
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
  background: var(--tf-bg-overlay);
  color: var(--tf-code-text);
  padding: 0.125em 0.4em;
  border-radius: var(--tf-radius-xs);
  font-size: 0.875em;
  border: 1px solid var(--tf-border-subtle);
  font-weight: 500;
}

/* ─── Scrollbar (slim, MD3-themed) ───────────────────────────────────────── */
::-webkit-scrollbar {
  width: 0.375rem;
  height: 0.375rem;
}
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  {
  background: var(--tf-border-default);
  border-radius: var(--tf-radius-full);
}
::-webkit-scrollbar-thumb:hover { background: var(--tf-border-strong); }

/* ─── Selection ──────────────────────────────────────────────────────────── */
::selection {
  background: var(--tf-color-primary-container);
  color: var(--tf-color-primary-light);
}

/* ─── Focus ring (MD3) ───────────────────────────────────────────────────── */
:focus-visible {
  outline: 0.125rem solid var(--tf-color-primary);
  outline-offset: 0.125rem;
  border-radius: var(--tf-radius-sm);
}

/* ─── Smooth heading anchors ─────────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--tf-font-display);
  scroll-margin-top: calc(var(--tf-header-height) + 1rem);
}

/* ─── Prose defaults ─────────────────────────────────────────────────────── */
p { line-height: var(--tf-leading-relaxed); }
strong { font-weight: var(--tf-font-semibold); color: var(--tf-text-primary); }

/* ─── Course player gutter bands ─────────────────────────────────────────── */
/* On wide screens the centered body leaves gutters; subtly tint them. */
.tf-course-player-wrap {
  background: var(--tf-bg-base);
}

/* ─── Glass surface defaults ────────────────────────────────────────────── */
/* ThemeProvider overrides these per-theme via :root inline styles */
:root {
  --tf-glass-bg: var(--tf-bg-surface);
  --tf-glass-blur: 0px;
  --tf-glass-border: rgba(255,255,255,0.04);
  --tf-glass-highlight: none;
  --tf-glow-primary: none;
}

/* ─── Responsive: framework-level breakpoints ────────────────────────────── */
@media (max-width: 768px) {
  .tf-concept-grid { grid-template-columns: 1fr !important; }
  .tf-hero-inner { grid-template-columns: 1fr !important; }
  .tf-sidebar-layout { grid-template-columns: 1fr !important; }
  .tf-step-card { grid-template-columns: 2.5rem 1fr !important; }

  /* Course player: stack sidebar above content on small screens */
  .tf-course-player-body {
    flex-direction: column !important;
  }
  .tf-course-player-sidebar {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    max-height: 14rem !important;
    border-bottom: 1px solid var(--tf-border-subtle);
    border-right: none !important;
  }
  .tf-course-player-main {
    padding: var(--tf-space-6) var(--tf-space-4) !important;
  }
}

@media (max-width: 640px) {
  .tf-hero-actions { flex-direction: column; align-items: stretch; }
  .tf-nav-buttons { flex-direction: column; }

  .tf-course-player-sidebar {
    max-height: 10rem !important;
  }
}
`;
}
