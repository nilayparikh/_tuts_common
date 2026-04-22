import React from "react";
import { tokens, tokensToCSS } from "./tokens";

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
  const tokenCss = tokensToCSS(tokens);

  return `
/* ─── LocalM Tutorial Framework: CSS Variables (Material Design 3) ──── */
${tokenCss}

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
* {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--tf-color-primary-light) 68%, var(--tf-color-secondary) 32%) transparent;
}

::-webkit-scrollbar {
  width: 0.3125rem;
  height: 0.3125rem;
}
::-webkit-scrollbar-track  {
  background: color-mix(in srgb, var(--tf-bg-overlay) 42%, transparent);
  border-radius: var(--tf-radius-full);
}
::-webkit-scrollbar-thumb  {
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--tf-color-primary-light) 76%, white 24%),
    color-mix(in srgb, var(--tf-color-secondary) 72%, var(--tf-color-primary) 28%));
  border-radius: var(--tf-radius-full);
  border: 1px solid color-mix(in srgb, var(--tf-bg-overlay) 36%, transparent);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.08),
    0 0 10px color-mix(in srgb, var(--tf-color-primary) 24%, transparent);
}
::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--tf-color-primary-light) 84%, white 16%),
    color-mix(in srgb, var(--tf-color-secondary-light) 78%, var(--tf-color-primary) 22%));
}
::-webkit-scrollbar-corner { background: transparent; }

/* ─── Selection ──────────────────────────────────────────────────────────── */
::selection {
  background: var(--tf-color-primary-container);
  color: var(--tf-color-primary-light);
}

/* ─── Focus ring (MD3) ───────────────────────────────────────────────────── */
:focus-visible {
  outline: 0.125rem solid var(--tf-focus-ring, var(--tf-color-primary));
  outline-offset: var(--tf-focus-ring-offset, 0.125rem);
  border-radius: var(--tf-radius-sm);
  box-shadow: var(--tf-focus-ring-shadow, none);
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

  /* Lesson list: compact on tablets */
  .tf-lesson-list__item {
    gap: var(--tf-space-3) !important;
    padding: var(--tf-space-3) var(--tf-space-4) !important;
  }
}

@media (max-width: 640px) {
  .tf-hero-actions { flex-direction: column; align-items: stretch; }
  .tf-nav-buttons { flex-direction: column; }

  .tf-course-player-sidebar {
    max-height: 10rem !important;
  }

  /* Lesson list: hide step number & icon on small phones */
  .tf-lesson-list__number { display: none !important; }
  .tf-lesson-list__icon { display: none !important; }
  .tf-lesson-list__item {
    gap: var(--tf-space-2) !important;
    padding: var(--tf-space-3) var(--tf-space-4) !important;
  }
}

/* ─── AccordionList ──────────────────────────────────────────────────────── */
details summary::-webkit-details-marker { display: none; }
details summary::marker { display: none; content: ""; }
details summary:hover { color: var(--tf-color-primary-light); }
.tf-accordion-chevron {
  transition: transform var(--tf-transition-fast);
  flex-shrink: 0;
}
details[open] > summary .tf-accordion-chevron {
  transform: rotate(180deg);
}
`;
}
