"use client";

/**
 * Presentation Engine — Custom slide system with 70/30 layout + slide drawer.
 *
 * Features:
 *   • Hash-based routing: #/01/3 → lesson 01, slide 3
 *   • 70% left: 16:9 slide viewport + nav ribbon + timer
 *   • 30% right: Transcript panel (from CONTENT.md narration)
 *   • Collapsible slide drawer for quick navigation
 *   • Footer: Course name | optional instructor/social branding
 *   • Keyboard navigation: ← → Space Escape Home
 *   • Per-slide timer with desired duration
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { BrandLockup } from "../layout/BrandLockup";
import { ShortsTitleStack } from "./ShortsTitleStack";

export interface PresentationSlide {
  id: string;
  title: string;
  duration?: number;
  narration?: string;
  steps?: PresentationStep[];
  content: React.ReactNode;
}

export interface PresentationStep {
  id: string;
  title: string;
  transcript: string;
}

export type DeckType = "course" | "mono" | "short";

export interface PresentationDeck {
  id: string;
  number: string;
  title: string;
  deckType?: DeckType;
  slides: PresentationSlide[];
}

export interface PresentationBranding {
  logoSrc?: string;
  brandIconUrl?: string;
  brandLabel?: string;
  instructorName?: string;
  githubUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  youtubeHandle?: string;
  copyright?: string;
  /** URL to promote in footer with typing animation, e.g. "tuts.localm.dev/a2a" */
  siteUrl?: string;
  /** Rotating phrases typed after the URL, e.g. ["examples","interactive mode","course outline"] */
  siteUrlPhrases?: string[];
}

interface PresentationStepContextValue {
  stepIndex: number;
  stepCount: number;
  activeStep: PresentationStep | null;
  steps: PresentationStep[];
}

const PresentationStepContext =
  React.createContext<PresentationStepContextValue>({
    stepIndex: 0,
    stepCount: 0,
    activeStep: null,
    steps: [],
  });

export function usePresentationStep(): PresentationStepContextValue {
  return React.useContext(PresentationStepContext);
}

/* ── Title capsule helper ─────────────────────────────────────────────── */

const TITLE_PREFIX_RE = /^\[([^\]]+)\]\s*/;

/** Parse `[Prefix] Rest` → capsule badge + title text, or plain title. */
function renderSlideTitle(title: string | undefined): React.ReactNode {
  if (!title) return "";
  const m = title.match(TITLE_PREFIX_RE);
  if (!m) return title;
  return title.slice(m[0].length);
}

function sanitizePresentationTitle(title: string | undefined): string {
  if (!title) return "";
  const m = title.match(TITLE_PREFIX_RE);
  return m ? title.slice(m[0].length) : title;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  CSS                                                                   */
/* ═══════════════════════════════════════════════════════════════════════ */

const ENGINE_CSS = `
  /* ── Reset ─────────────────────────── */
  .pe-root {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(0,245,255,0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(168,56,255,0.14), transparent 32%),
      linear-gradient(180deg, #090b12 0%, var(--tf-bg-base, #0b0d12) 38%, #080a10 100%);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--tf-text-primary, #e2e6f0);
  }

  /* ── Header ────────────────────────── */
  .pe-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    padding: 0 24px;
    height: 64px;
    min-height: 64px;
    background: linear-gradient(180deg, rgba(15,18,28,0.82), rgba(11,13,18,0.62));
    border-bottom: 1px solid rgba(202,211,230,0.10);
    gap: 14px;
    flex-shrink: 0;
    z-index: 20;
    backdrop-filter: blur(18px) saturate(150%);
    box-shadow: 0 10px 28px rgba(0,0,0,0.32);
  }
  .pe-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    justify-self: start;
  }
  .pe-header-center {
    width: clamp(620px, 56vw, 880px);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    justify-self: center;
  }
  .pe-header:not(:has(.pe-header-center)) {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .pe-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-self: end;
  }
  .pe-header-home {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: 15px;
    font-weight: 600;
    transition: color 150ms;
    cursor: pointer;
    background: none;
    border: none;
    padding: 8px 12px;
    border-radius: 10px;
  }
  .pe-header-home:hover {
    color: var(--tf-color-primary-light, #818cf8);
    background: var(--tf-bg-elevated, #191c23);
  }
  .pe-header-sep {
    color: var(--tf-text-muted, #8892a8);
    font-size: 14px;
  }
  .pe-header-lesson {
    font-size: 14px;
    font-weight: 600;
    color: var(--tf-text-secondary, #bfc5d4);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 340px;
  }
  .pe-header-slide {
    font-size: 13px;
    color: var(--tf-text-muted, #8892a8);
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .pe-header-nav {
    width: 100%;
    display: grid;
    grid-template-columns: 34px minmax(180px, 220px) minmax(280px, 340px) minmax(180px, 220px) 34px;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 5px 6px;
    border: 1px solid rgba(202,211,230,0.10);
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(20,24,36,0.78), rgba(12,15,24,0.64));
    backdrop-filter: blur(18px) saturate(145%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .pe-header-nav-prev,
  .pe-header-nav-next {
    font-size: 13px;
    color: var(--tf-text-muted, #8892a8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: none;
    width: 100%;
    padding: 4px 10px;
    opacity: 0.65;
    transition: opacity 150ms, color 150ms;
    cursor: default;
  }
  .pe-header-nav-prev {
    text-align: right;
  }
  .pe-header-nav-next {
    text-align: left;
  }
  .pe-header-nav-prev.empty,
  .pe-header-nav-next.empty {
    opacity: 0;
    pointer-events: none;
  }
  .pe-header-nav-prev:hover,
  .pe-header-nav-next:hover {
    opacity: 1;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-header-nav-current {
    font-size: 15px;
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: none;
    padding: 6px 14px;
    background:
      linear-gradient(180deg, rgba(24,28,42,0.92), rgba(14,18,28,0.84)),
      linear-gradient(135deg, rgba(0,245,255,0.10), rgba(168,56,255,0.12));
    border-radius: 11px;
    border: 1px solid rgba(202,211,230,0.14);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.05),
      0 8px 18px rgba(0,0,0,0.22);
  }
  .pe-title-capsule {
    display: inline-flex;
    align-items: center;
    padding: 1px 8px;
    border-radius: 9999px;
    background: linear-gradient(135deg, var(--tf-color-secondary, #14b8a6), #2dd4bf);
    font-size: 10px;
    font-weight: 700;
    color: var(--tf-text-inverse, #0b0d12);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
    line-height: 1.6;
  }
  .pe-header-nav-prev .pe-title-capsule,
  .pe-header-nav-next .pe-title-capsule {
    font-size: 9px;
    padding: 0px 6px;
  }
  .pe-drawer-item-title .pe-title-capsule {
    font-size: 9px;
    padding: 1px 6px;
    vertical-align: middle;
  }

  /* ── Body ─────────────────────────── */
  .pe-body {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }

  /* Main stage — contains drawer + viewport */
  .pe-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    position: relative;
  }

  /* Slide viewport — 16:9 */
  .pe-viewport {
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background: #000;
    padding: 8px;
  }
  .pe-slide-box {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 8px;
    background: var(--tf-bg-base, #0b0d12);
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    zoom: 1.05;
  }

  .pe-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 34px;
    border-radius: 10px;
    background: linear-gradient(180deg, rgba(27,31,45,0.88), rgba(18,21,32,0.82));
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-secondary, #bfc5d4);
    cursor: pointer;
    transition: all 150ms;
    padding: 0;
    font-size: 13px;
    backdrop-filter: blur(16px) saturate(135%);
  }
  .pe-nav-btn:hover:not(:disabled) {
    color: var(--tf-color-primary-light, #818cf8);
    border-color: var(--tf-color-primary-light, #818cf8);
  }
  .pe-nav-btn:disabled {
    opacity: 0.25;
    cursor: default;
  }

  /* ── Slide Drawer ──────────────────── */
  .pe-drawer-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    background: transparent;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-secondary, #bfc5d4);
    cursor: pointer;
    padding: 0;
    transition: all 150ms;
  }
  .pe-drawer-toggle:hover {
    color: var(--tf-color-primary-light, #818cf8);
    border-color: var(--tf-color-primary-light, #818cf8);
    background: var(--tf-bg-elevated, #191c23);
  }
  .pe-drawer-toggle.active {
    color: var(--tf-color-primary-light, #818cf8);
    border-color: var(--tf-color-primary, #6366f1);
    background: var(--tf-bg-elevated, #191c23);
  }

  .pe-drawer-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: flex;
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms ease;
  }
  .pe-drawer-overlay.open {
    pointer-events: auto;
    opacity: 1;
  }

  .pe-drawer-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(2px);
  }

  .pe-drawer-panel {
    position: relative;
    width: 280px;
    min-width: 280px;
    background: var(--tf-bg-surface, #111318);
    border-right: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateX(-100%);
    transition: transform 280ms cubic-bezier(0.4,0,0.2,1);
    z-index: 2;
    box-shadow: 4px 0 24px rgba(0,0,0,0.3);
  }
  .pe-drawer-overlay.open .pe-drawer-panel {
    transform: translateX(0);
  }

  .pe-drawer-header {
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    flex-shrink: 0;
  }
  .pe-drawer-header-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--tf-text-muted, #8892a8);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .pe-drawer-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: transparent;
    border: none;
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    padding: 0;
    transition: all 150ms;
  }
  .pe-drawer-close:hover {
    color: var(--tf-text-primary, #e2e6f0);
    background: var(--tf-bg-elevated, #191c23);
  }

  .pe-drawer-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  .pe-drawer-list::-webkit-scrollbar { width: 3px; }
  .pe-drawer-list::-webkit-scrollbar-thumb {
    background: rgba(202,211,230,0.15);
    border-radius: 2px;
  }

  .pe-drawer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 150ms;
    border: 1px solid transparent;
    margin-bottom: 2px;
  }
  .pe-drawer-item:hover {
    background: var(--tf-bg-elevated, #191c23);
  }
  .pe-drawer-item.active {
    background: var(--tf-bg-elevated, #191c23);
    border-color: var(--tf-color-primary, #6366f1);
  }
  .pe-drawer-item-num {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--tf-bg-overlay, #1f222a);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: var(--tf-text-muted, #8892a8);
    flex-shrink: 0;
  }
  .pe-drawer-item.active .pe-drawer-item-num {
    background: linear-gradient(135deg, var(--tf-color-primary, #6366f1), var(--tf-color-primary-light, #818cf8));
    color: var(--tf-text-inverse, #0b0d12);
  }
  .pe-drawer-item-info {
    flex: 1;
    min-width: 0;
  }
  .pe-drawer-item-title {
    font-size: 13px;
    color: var(--tf-text-secondary, #bfc5d4);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }
  .pe-drawer-item.active .pe-drawer-item-title {
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 600;
  }
  .pe-drawer-item-duration {
    font-size: 11px;
    color: var(--tf-text-muted, #8892a8);
    font-family: 'JetBrains Mono', monospace;
    margin-top: 2px;
  }

  /* ── Right 30% — Transcript ────────── */
  .pe-right {
    flex: 0 0 30%;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    background: var(--tf-bg-surface, #111318);
  }
  .pe-transcript-header {
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 700;
    color: var(--tf-text-muted, #8892a8);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    flex-shrink: 0;
  }
  .pe-transcript-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
  .pe-transcript-body::-webkit-scrollbar { width: 3px; }
  .pe-transcript-body::-webkit-scrollbar-thumb {
    background: rgba(202,211,230,0.15);
    border-radius: 2px;
  }
  .pe-transcript-text {
    font-size: 14px;
    line-height: 1.75;
    color: var(--tf-text-secondary, #bfc5d4);
    white-space: pre-wrap;
  }
  .pe-transcript-empty {
    font-size: 13px;
    color: var(--tf-text-muted, #8892a8);
    font-style: italic;
    padding: 20px 0;
  }

  /* ── Footer ────────────────────────── */
  .pe-footer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    align-items: center;
    padding: 0 24px;
    height: 52px;
    min-height: 52px;
    background: var(--tf-bg-surface, #111318);
    border-top: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    flex-shrink: 0;
    z-index: 20;
    gap: 12px;
  }
  .pe-footer-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    justify-content: flex-start;
  }
  .pe-footer-center {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    min-width: 0;
    flex-wrap: nowrap;
  }
  .pe-footer-logo {
    height: 24px;
    width: auto;
    object-fit: contain;
    display: block;
    opacity: 0.92;
  }
  .pe-footer-brand {
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 600;
    font-size: 13px;
  }
  .pe-footer-right {
    display: flex;
    align-items: center;
    gap: 14px;
    justify-content: flex-end;
    white-space: nowrap;
    min-width: 0;
  }
  .pe-footer-instructor {
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }
  .pe-footer-copy {
    font-size: 14px;
    color: var(--tf-text-muted, #8892a8);
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .pe-footer-social-link {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--tf-text-muted, #8892a8);
    text-decoration: none;
    font-size: 14px;
    transition: color 150ms;
    white-space: nowrap;
  }
  .pe-footer-social-link:hover {
    color: var(--tf-color-primary-light, #818cf8);
  }
  .pe-footer-social-link svg {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
  .pe-footer-divider {
    width: 1px;
    height: 16px;
    background: var(--tf-border-default, rgba(202,211,230,0.14));
    flex-shrink: 0;
    opacity: 0.9;
  }

  /* ── Footer logo glow animation ────── */
  @keyframes pe-logo-glow {
    0%, 100% { filter: drop-shadow(0 0 2px rgba(99,102,241,0.0)); }
    50% { filter: drop-shadow(0 0 8px rgba(99,102,241,0.45)) drop-shadow(0 0 20px rgba(129,140,248,0.2)); }
  }
  .pe-footer-left :is(.brand-lockup, img) {
    animation: pe-logo-glow 4s ease-in-out infinite;
  }

  /* ── Footer URL Promotion ───────────── */
  .pe-footer-url-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
  }
  .pe-footer-url {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 13px;
    white-space: nowrap;
    color: var(--tf-text-muted, #8892a8);
    overflow: hidden;
  }
  .pe-footer-url-static {
    color: var(--tf-color-primary-light, #818cf8);
    font-weight: 600;
    letter-spacing: 0.01em;
    flex-shrink: 0;
  }
  .pe-footer-url-prompt {
    color: var(--tf-color-accent, #f59e0b);
    font-weight: 700;
    opacity: 0.9;
    flex-shrink: 0;
  }
  .pe-footer-url-typed {
    color: var(--tf-text-secondary, #bfc5d4);
    font-weight: 400;
    min-width: 0;
    overflow: hidden;
    display: inline;
  }
  .pe-footer-url-cursor {
    display: inline-block;
    width: 7px;
    height: 15px;
    background: var(--tf-color-primary-light, #818cf8);
    margin-left: 1px;
    vertical-align: middle;
    animation: pe-blink 1s step-end infinite;
    flex-shrink: 0;
  }
  @keyframes pe-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* ── Fullscreen button ─────────────── */
  .pe-fs-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: transparent;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    padding: 0;
    transition: all 150ms;
  }
  .pe-fs-btn:hover {
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--tf-color-primary, #6366f1);
  }

  .pe-control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 10px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    transition: all 150ms;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .pe-control-btn:hover {
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--tf-color-primary, #6366f1);
    background: var(--tf-bg-elevated, #191c23);
  }
  .pe-control-btn.pe-control-btn-icon {
    width: 28px;
    min-width: 28px;
    padding: 0;
  }

  /* ── Progress bar ──────────────────── */
  .pe-progress {
    height: 2px;
    background: var(--tf-bg-elevated, #191c23);
    flex-shrink: 0;
  }
  .pe-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--tf-color-primary, #6366f1), var(--tf-color-accent, #f59e0b));
    transition: width 300ms ease;
    border-radius: 0 1px 1px 0;
  }

  /* ── Separate control window ───────── */
  .pc-root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(circle at top left, rgba(0,245,255,0.12), transparent 24%),
      radial-gradient(circle at top right, rgba(168,56,255,0.16), transparent 30%),
      linear-gradient(180deg, #090b12 0%, var(--tf-bg-base, #0b0d12) 40%, #080a10 100%);
    color: var(--tf-text-primary, #e2e6f0);
    font-family: 'Inter', system-ui, sans-serif;
  }
  .pc-header {
    height: 60px;
    min-height: 60px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid rgba(202,211,230,0.10);
    background: linear-gradient(180deg, rgba(15,18,28,0.86), rgba(12,15,24,0.68));
    backdrop-filter: blur(20px) saturate(150%);
    box-shadow: 0 10px 28px rgba(0,0,0,0.30);
  }
  .pc-header-separator {
    width: 1px;
    height: 22px;
    background: var(--tf-border-default, rgba(202,211,230,0.14));
    opacity: 0.95;
    flex-shrink: 0;
  }
  .pc-pill {
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(0,245,255,0.20);
    background: linear-gradient(135deg, rgba(0,245,255,0.18), rgba(168,56,255,0.16));
    color: #f8fbff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .pc-title-wrap {
    min-width: 0;
    max-width: min(38vw, 620px);
    display: flex;
    align-items: center;
  }
  .pc-title {
    font-size: 15px;
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 700;
    font-family: 'Inter', system-ui, sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pc-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-meta-item {
    white-space: nowrap;
  }
  .pc-meta-divider {
    width: 1px;
    height: 14px;
    background: var(--tf-border-default, rgba(202,211,230,0.14));
    opacity: 0.85;
    flex-shrink: 0;
  }
  .pc-header-spacer {
    flex: 1;
    min-width: 12px;
  }
  .pc-header-logo {
    width: 108px;
    height: 24px;
    object-fit: contain;
    display: block;
    margin-left: 8px;
  }
  .pc-body {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 368px 1fr;
  }
  .pc-sidebar {
    border-right: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: linear-gradient(180deg, rgba(16,19,29,0.84), rgba(11,13,20,0.72));
    backdrop-filter: blur(18px) saturate(145%);
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .pc-controls {
    padding: 14px;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .pc-lessons {
    padding: 14px;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .pc-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
    padding: 0 2px;
  }
  .pc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(202,211,230,0.16);
    background:
      linear-gradient(180deg, rgba(28,33,48,0.90), rgba(17,20,31,0.84)),
      linear-gradient(135deg, rgba(0,245,255,0.08), rgba(168,56,255,0.10));
    color: var(--tf-text-primary, #e2e6f0);
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    transition: all 150ms;
    padding: 0 14px;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.05),
      0 12px 28px rgba(0,0,0,0.18);
    backdrop-filter: blur(16px) saturate(135%);
  }
  .pc-btn:hover:not(:disabled) {
    color: #ffffff;
    border-color: rgba(0,245,255,0.34);
    background:
      linear-gradient(135deg, rgba(0,245,255,0.18), rgba(168,56,255,0.16)),
      linear-gradient(180deg, rgba(30,35,52,0.96), rgba(17,20,31,0.90));
    transform: translateY(-1px);
  }
  .pc-btn-header {
    height: 34px;
    background: linear-gradient(135deg, rgba(41,50,255,0.16), rgba(168,56,255,0.14));
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .pc-lesson-select {
    width: 100%;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(202,211,230,0.16);
    background:
      linear-gradient(180deg, rgba(26,31,46,0.88), rgba(18,21,32,0.84)),
      linear-gradient(135deg, rgba(0,245,255,0.08), rgba(168,56,255,0.10));
    color: var(--tf-text-primary, #e2e6f0);
    font-size: 14px;
    padding: 0 12px;
    outline: none;
    cursor: pointer;
    transition: all 150ms;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
    backdrop-filter: blur(16px) saturate(135%);
  }
  .pc-lesson-select:hover,
  .pc-lesson-select:focus-visible {
    border-color: var(--tf-color-primary-light, #818cf8);
  }
  .pc-lesson-select option {
    background: var(--tf-bg-surface, #111318);
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pc-slider-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
  }
  .pc-slider-row.compact {
    grid-template-columns: auto minmax(108px, 152px) auto;
    gap: 8px;
  }
  .pc-slider-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
    white-space: nowrap;
  }
  .pc-slider {
    width: 100%;
    margin: 0;
    accent-color: var(--tf-color-primary, #6366f1);
    cursor: pointer;
  }
  .pc-slider-value {
    min-width: 48px;
    text-align: right;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pc-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .pc-jump {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px;
  }
  .pc-jump::-webkit-scrollbar { width: 4px; }
  .pc-jump::-webkit-scrollbar-thumb { background: rgba(202,211,230,0.18); }
  .pc-jump-item {
    width: 100%;
    text-align: left;
    margin-bottom: 6px;
    border-radius: 12px;
    border: 1px solid rgba(202,211,230,0.02);
    background: linear-gradient(180deg, rgba(18,21,31,0.52), rgba(18,21,31,0.36));
    color: var(--tf-text-secondary, #bfc5d4);
    padding: 10px 12px;
    cursor: pointer;
    display: flex;
    align-items: baseline;
    gap: 12px;
    backdrop-filter: blur(10px) saturate(130%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
  }
  .pc-jump-item:hover {
    background:
      linear-gradient(180deg, rgba(27,31,45,0.88), rgba(18,21,31,0.74)),
      linear-gradient(135deg, rgba(0,245,255,0.08), rgba(168,56,255,0.08));
  }
  .pc-jump-item.active {
    background:
      linear-gradient(180deg, rgba(24,29,43,0.96), rgba(16,19,29,0.88)),
      linear-gradient(135deg, rgba(0,245,255,0.18), rgba(168,56,255,0.16));
    border-color: rgba(0,245,255,0.32);
    color: var(--tf-text-primary, #e2e6f0);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.05),
      0 0 0 1px rgba(168,56,255,0.14);
  }
  .pc-jump-index {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    min-width: 24px;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-jump-title {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pc-transcript {
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--tf-bg-base, #0b0d12);
  }
  .pc-step-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: linear-gradient(180deg, var(--tf-bg-surface, #111318), var(--tf-bg-base, #0b0d12));
  }
  .pc-step-counter {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-color-primary-light, #818cf8);
    white-space: nowrap;
  }
  .pc-step-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pc-step-btn {
    height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    background: var(--tf-bg-elevated, #191c23);
    color: var(--tf-text-primary, #e2e6f0);
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: all 150ms;
  }
  .pc-step-btn:hover:not(:disabled) {
    border-color: var(--tf-color-primary-light, #818cf8);
    color: var(--tf-color-primary-light, #818cf8);
  }
  .pc-step-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .pc-transcript-header {
    height: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 16px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--tf-bg-surface, #111318);
  }
  .pc-transcript-header-title {
    min-width: 0;
    white-space: nowrap;
  }
  .pc-transcript-header-tools {
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .pc-transcript-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px;
    line-height: 1.7;
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: calc(14px * var(--pc-transcript-font-scale, 1.1));
  }
  .pc-transcript-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .pc-transcript-current {
    margin-bottom: 16px;
    padding: 16px 18px;
    border-radius: 14px;
    border: 1px solid rgba(99,102,241,0.45);
    background:
      linear-gradient(180deg, rgba(19,23,36,0.96), rgba(12,15,24,0.92)),
      linear-gradient(135deg, rgba(99,102,241,0.12), rgba(0,245,255,0.08));
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.05),
      0 0 0 1px rgba(99,102,241,0.12),
      0 16px 30px rgba(0,0,0,0.18);
    animation: pc-active-transcript-enter 220ms ease;
  }
  .pc-transcript-current-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .pc-transcript-current-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-color-primary-light, #818cf8);
  }
  .pc-transcript-current-step {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-transcript-current-heading {
    font-size: 20px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--tf-text-primary, #e2e6f0);
    margin-bottom: 10px;
  }
  .pc-transcript-current-text {
    color: var(--tf-text-secondary, #bfc5d4);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: calc(15px * var(--pc-transcript-font-scale, 1.1));
    line-height: 1.75;
    white-space: pre-wrap;
  }
  .pc-transcript-steps-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .pc-transcript-steps-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-transcript-steps-hint {
    font-size: 11px;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-transcript-step {
    width: 100%;
    text-align: left;
    appearance: none;
    -webkit-appearance: none;
    font: inherit;
    color: var(--tf-text-secondary, #bfc5d4);
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--tf-bg-surface, #111318);
    opacity: 0.68;
    transition: all 180ms ease;
    cursor: pointer;
  }
  .pc-transcript-step:hover {
    opacity: 0.92;
    border-color: var(--tf-border-default, rgba(202,211,230,0.14));
  }
  .pc-transcript-step.active {
    opacity: 1;
    border-color: var(--tf-color-primary, #6366f1);
    box-shadow: 0 0 0 1px rgba(99,102,241,0.22);
    background:
      linear-gradient(180deg, rgba(24,28,42,0.92), rgba(14,18,28,0.86)),
      linear-gradient(135deg, rgba(99,102,241,0.10), rgba(0,245,255,0.06));
  }
  .pc-transcript-step.complete {
    opacity: 0.82;
  }
  .pc-transcript-step-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .pc-transcript-step-index {
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pc-transcript-step-label {
    color: var(--tf-text-muted, #8892a8);
    font-family: 'Inter', system-ui, sans-serif;
  }
  .pc-transcript-step-text {
    color: var(--tf-text-secondary, #bfc5d4);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: calc(12px * var(--pc-transcript-font-scale, 1.1));
    line-height: 1.55;
  }
  .pc-transcript-step-text,
  .pc-transcript-text {
    white-space: pre-wrap;
  }
  .pc-transcript-empty {
    color: var(--tf-text-muted, #8892a8);
    font-style: italic;
  }
  @keyframes pc-active-transcript-enter {
    0% {
      opacity: 0;
      transform: translateY(8px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ── 16:9 Mode ─────────────────────── */
  .pe-root.pe-pip-mode > .pe-header,
  .pe-root.pe-pip-mode > .pe-footer,
  .pe-root.pe-pip-mode > .pe-progress {
    display: none;
  }
  .pe-root.pe-pip-mode {
    --pe-pip-column-width: calc((100vh * 9 / 16) - 40px);
    --pe-pip-header-height: 44px;
    --pe-pip-info-height: 100px;
    --pe-pip-footer-height: 300px;
  }
  .pe-root.pe-pip-mode .pe-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--pe-pip-column-width);
  }

  .pe-pip-column {
    position: relative;
    width: var(--pe-pip-column-width);
    height: 100vh;
    display: grid;
    grid-template-rows: var(--pe-pip-header-height) var(--pe-pip-info-height) 1fr var(--pe-pip-footer-height);
    border-left: 1px solid rgba(202,211,230,0.10);
    background: var(--tf-bg-surface, #111318);
    overflow: hidden;
  }

  .pe-pip-header {
    display: flex;
    align-items: center;
    padding: 0 10px;
    height: var(--pe-pip-header-height);
    gap: 6px;
    border-bottom: 1px solid rgba(202,211,230,0.08);
    background: linear-gradient(180deg, rgba(15,18,28,0.82), rgba(11,13,18,0.62));
    backdrop-filter: blur(18px) saturate(150%);
    flex-shrink: 0;
  }

  .pe-pip-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 14px 22px;
    gap: 6px;
    height: var(--pe-pip-info-height);
    border-bottom: 1px solid rgba(202,211,230,0.06);
    background: linear-gradient(180deg, rgba(11,13,18,0.62), var(--tf-bg-surface, #111318));
    overflow: hidden;
  }
  .pe-pip-info-course {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--tf-color-primary-light, #818cf8);
    font-weight: 600;
  }
  .pe-pip-info-lesson {
    font-size: 20px;
    font-weight: 700;
    color: var(--tf-text-primary, #e2e6f0);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pe-pip-info-slide {
    font-size: 13px;
    color: var(--tf-text-muted, #8892a8);
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
  }

  .pe-pip-inset {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.10) 0%, transparent 60%),
      radial-gradient(ellipse at 70% 80%, rgba(168,56,255,0.08) 0%, transparent 60%),
      linear-gradient(135deg, #262a3d 0%, #2e3350 50%, #232740 100%);
    border-top: 1px solid rgba(99,102,241,0.12);
  }
  .pe-pip-guide {
    position: absolute;
    z-index: 10;
    background: rgba(0,245,255,0.75);
    pointer-events: none;
  }
  .pe-pip-guide.top,
  .pe-pip-guide.bottom {
    left: 50%;
    width: 1px;
    height: 12px;
    transform: translateX(-50%);
  }
  .pe-pip-guide.top {
    top: 0;
  }
  .pe-pip-guide.bottom {
    bottom: 0;
  }
  .pe-pip-guide.left,
  .pe-pip-guide.right {
    top: 50%;
    width: 12px;
    height: 1px;
    transform: translateY(-50%);
  }
  .pe-pip-guide.left {
    left: 0;
  }
  .pe-pip-guide.right {
    right: 0;
  }

  .pe-pip-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 28px 22px;
    height: var(--pe-pip-footer-height);
    overflow: hidden;
    border-top: 1px solid rgba(202,211,230,0.08);
    background:
      linear-gradient(180deg, var(--tf-bg-surface, #111318), var(--tf-bg-base, #0b0b0f));
  }
  .pe-pip-footer-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    width: 100%;
    text-align: center;
  }
  .pe-pip-footer-row.brand {
    margin-bottom: 2px;
  }
  .pe-pip-footer-row.instructor {
    margin-bottom: 0;
  }
  .pe-pip-footer-row.socials {
    gap: 16px;
  }
  .pe-pip-footer-row.copy {
    gap: 0;
  }
  .pe-pip-footer .pe-footer-social-link {
    gap: 10px;
    font-size: 17px;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-pip-footer .pe-footer-social-link svg {
    width: 28px;
    height: 28px;
  }
  .pe-pip-footer .pe-footer-social-text {
    line-height: 1;
  }
  .pe-pip-footer .pe-footer-logo {
    height: 48px;
  }
  .pe-pip-footer .pe-footer-copy {
    font-size: 14px;
    color: var(--tf-text-muted, #64748b);
  }
  .pe-pip-footer .pe-footer-instructor {
    font-size: 18px;
    color: var(--tf-text-primary, #ffffff);
    font-weight: 500;
  }
  .pe-pip-footer .brand-lockup {
    transform: scale(1.4);
    transform-origin: center;
  }

  /* PIP toggle button (shared style) */
  .pe-pip-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: transparent;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    padding: 0;
    transition: all 150ms;
  }
  .pe-pip-btn:hover {
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--tf-color-primary, #6366f1);
  }
  .pe-pip-btn.active {
    color: var(--tf-color-primary-light, #818cf8);
    border-color: var(--tf-color-primary, #6366f1);
    background: var(--tf-bg-elevated, #191c23);
  }

  /* ── Headless Mode ─────────────────── */
  /* When headless, strip ALL chrome — the slide fills the viewport.
     Controlled entirely via BroadcastChannel from the control panel.
     When combined with pe-pip-mode, the PIP grid layout takes precedence. */
  .pe-root.pe-headless > .pe-header,
  .pe-root.pe-headless > .pe-footer,
  .pe-root.pe-headless > .pe-progress {
    display: none;
  }
  .pe-root.pe-headless {
    /* slide viewport takes the full window */
    grid-template-rows: 1fr;
  }
  /* Headless-only (NOT combined with pip-mode): slide fills all space */
  .pe-root.pe-headless:not(.pe-pip-mode) .pe-body {
    display: block;
    height: 100vh;
  }
  .pe-root.pe-headless:not(.pe-pip-mode) .pe-left {
    width: 100%;
    height: 100%;
  }
  .pe-root.pe-headless:not(.pe-pip-mode) .pe-viewport {
    height: 100%;
  }
  /* Headless + PIP: hide the PIP header row entirely (all controls come from
     the control panel). Collapse its grid row so info/video/footer shift up. */
  .pe-root.pe-headless.pe-pip-mode .pe-pip-column {
    grid-template-rows: 0px var(--pe-pip-info-height) 1fr var(--pe-pip-footer-height);
  }
  .pe-root.pe-headless.pe-pip-mode .pe-pip-header {
    display: none;
  }

  /* ── Shorts Mode (9:16) ────────────── */
  .pe-shorts-root {
    width: 100vw;
    height: 100vh;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--tf-text-primary, #e2e6f0);
    overflow: hidden;
    position: relative;
  }

  .pe-shorts-frame {
    height: 100vh;
    aspect-ratio: 2048 / 3640;
    max-width: 100vw;
    display: grid;
    grid-template-rows: 1fr auto auto;
    background:
      radial-gradient(circle at top, rgba(0,245,255,0.10), transparent 32%),
      radial-gradient(circle at bottom, rgba(168,56,255,0.08), transparent 34%),
      linear-gradient(180deg, #090b12, var(--tf-bg-surface, #111318) 20%, var(--tf-bg-surface, #111318) 80%, #0b0b0f);
    overflow: hidden;
    position: relative;
  }

  /* Content area at the top — renders actual slide content (flex: 1fr) */
  .pe-shorts-header {
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0;
    border-bottom: 1px solid rgba(202,211,230,0.06);
    background:
      radial-gradient(circle at 30% 40%, rgba(0,245,255,0.08), transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(168,56,255,0.06), transparent 50%),
      linear-gradient(180deg, rgba(11,13,18,0.80), var(--tf-bg-surface, #111318));
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
  }
  /* Scale slide content to fit the available content area */
  .pe-shorts-slide-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .pe-shorts-slide-content > * {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .pe-shorts-slide-content .lm-slide-frame {
    padding: 1.4vh 3.5vw 1.4vh;
    font-size: clamp(0.5rem, 1.45vh, 0.8125rem);
  }
  .pe-shorts-slide-content.with-title-stack .lm-slide-frame {
    padding-top: 0.8vh;
  }
  .pe-shorts-slide-content .lm-slide-hero-title {
    font-size: clamp(0.875rem, 2.6vh, 1.625rem);
    margin-bottom: 0.4vh;
  }
  .pe-shorts-slide-content .lm-slide-title {
    font-size: clamp(0.75rem, 2.15vh, 1.25rem);
    margin-bottom: 0.4vh;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .pe-shorts-slide-content.with-title-stack .lm-slide-title {
    display: none;
  }
  .pe-shorts-slide-content .lm-slide-body {
    gap: 0.5vh;
  }
  /* Compact bullet sub-text within shorts */
  .pe-shorts-slide-content .bullet-sub {
    font-size: 0.85em;
    line-height: 1.25;
  }
  /* Compact stat cards within shorts */
  .pe-shorts-slide-content .sr-card {
    padding: 0.5vh 0.8vw;
  }
  .pe-shorts-slide-content .sr-value {
    font-size: clamp(0.625rem, 1.6vh, 0.9375rem);
  }
  .pe-shorts-slide-content .sr-label {
    font-size: clamp(0.375rem, 0.9vh, 0.5625rem);
  }
  /* Compact comparison tables within shorts */
  .pe-shorts-slide-content table {
    font-size: 0.85em;
  }
  .pe-shorts-slide-content th,
  .pe-shorts-slide-content td {
    padding: 0.4vh 0.8vw;
  }
  /* InfoBox within shorts */
  .pe-shorts-slide-content .info-box {
    padding: 0.7vh 1vw;
    font-size: 0.8em;
  }
  /* Mermaid diagrams within shorts */
  .pe-shorts-slide-content .mermaid-widget {
    max-height: 100%;
    overflow: hidden;
  }

  .pe-shorts-video {
    aspect-ratio: 1 / 1;
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 60% at 30% 30%, rgba(129,140,248,0.22), transparent),
      radial-gradient(ellipse 70% 50% at 70% 70%, rgba(192,132,252,0.18), transparent),
      radial-gradient(ellipse 60% 40% at 50% 50%, rgba(56,189,248,0.10), transparent),
      linear-gradient(160deg, #262a3d 0%, #2e3350 40%, #232740 100%);
    border-top: 1px solid rgba(148,163,184,0.12);
  }

  .pe-shorts-guide {
    position: absolute;
    z-index: 10;
    background: rgba(0,245,255,0.5);
    pointer-events: none;
  }
  .pe-shorts-guide.top,
  .pe-shorts-guide.bottom {
    left: 50%;
    width: 1px;
    height: 1.2vh;
    transform: translateX(-50%);
  }
  .pe-shorts-guide.top { top: 0; }
  .pe-shorts-guide.bottom { bottom: 0; }
  .pe-shorts-guide.left,
  .pe-shorts-guide.right {
    top: 50%;
    width: 1.2vh;
    height: 1px;
    transform: translateY(-50%);
  }
  .pe-shorts-guide.left { left: 0; }
  .pe-shorts-guide.right { right: 0; }

  .pe-shorts-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(0.25rem, 0.6vh, 0.5rem);
    padding: clamp(0.5rem, 1.2vh, 1rem) 2.2vw;
    border-top: 1px solid rgba(202,211,230,0.08);
    background: linear-gradient(180deg, var(--tf-bg-surface, #111318), var(--tf-bg-base, #0b0b0f));
  }
  .pe-shorts-footer-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    flex-wrap: wrap;
    width: 100%;
    text-align: center;
  }
  .pe-shorts-footer .pe-footer-copy {
    font-size: clamp(0.625rem, 1.2vh, 0.8125rem);
    color: var(--tf-text-muted, #64748b);
  }

  /* Inline subscribe row: bell + "Subscribe to" + [brand] + "for ..." */
  .pe-shorts-footer-row.subscribe {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    flex-wrap: nowrap;
    white-space: nowrap;
  }
  .pe-shorts-subscribe-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--tf-color-danger, #ef4444);
    transform-origin: 50% 10%;
    animation: pe-shorts-bell-ring 4.8s ease-in-out infinite;
  }
  .pe-shorts-subscribe-icon svg {
    width: clamp(0.875rem, 1.8vh, 1.25rem);
    height: clamp(0.875rem, 1.8vh, 1.25rem);
  }
  @keyframes pe-shorts-bell-ring {
    0%, 72%, 100% { transform: rotate(0deg) scale(1); }
    76% { transform: rotate(16deg) scale(1.04); }
    80% { transform: rotate(-14deg) scale(1.06); }
    84% { transform: rotate(12deg) scale(1.04); }
    88% { transform: rotate(-8deg) scale(1.02); }
    92% { transform: rotate(0deg) scale(1); }
  }
  .pe-shorts-subscribe-text {
    font-size: clamp(0.6875rem, 1.4vh, 0.9375rem);
    color: var(--tf-text-secondary, #bfc5d4);
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .pe-shorts-subscribe-brand {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    zoom: 0.72;
  }
  .pe-shorts-promo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    width: 100%;
    min-width: 0;
    font-size: clamp(0.625rem, 1.2vh, 0.8125rem);
    color: var(--tf-text-muted, #8892a8);
    white-space: nowrap;
  }
  .pe-shorts-promo-label {
    color: var(--tf-text-secondary, #bfc5d4);
    font-weight: 500;
  }
  .pe-shorts-promo-site {
    color: var(--tf-color-primary-light, #818cf8);
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  /* Deck-type filter & badge styles in control panel */
  .pc-deck-type-row {
    display: flex;
    gap: 4px;
    margin-bottom: 6px;
  }
  .pc-deck-type-btn {
    flex: 1;
    padding: 0.2em 0;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    border-radius: 0.375em;
    background: transparent;
    color: var(--tf-text-muted, #8892a8);
    font-size: 0.6875rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    transition: all 150ms ease;
  }
  .pc-deck-type-btn:hover {
    border-color: var(--tf-color-primary, #6366f1);
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pc-deck-type-btn.active {
    background: var(--tf-color-primary, #6366f1);
    border-color: var(--tf-color-primary, #6366f1);
    color: #fff;
  }

  /* Shorts toggle button */
  .pe-shorts-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75em;
    height: 1.75em;
    border-radius: 0.375em;
    background: transparent;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    padding: 0;
    transition: all 150ms;
  }
  .pe-shorts-btn.ratio {
    width: auto;
    min-width: 2.75em;
    gap: 0.3em;
    padding: 0 0.5em;
  }
  .pe-shorts-btn-label {
    font-size: 0.625rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.02em;
  }
  .pe-shorts-btn:hover {
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--tf-color-primary, #6366f1);
  }
  .pe-shorts-btn.active {
    color: var(--tf-color-primary-light, #818cf8);
    border-color: var(--tf-color-primary, #6366f1);
    background: var(--tf-bg-elevated, #191c23);
  }

  /* ── Feed Mode (4:5) — full-page aspect with PIP inset ── */
  .pe-feed-root {
    width: 100vw;
    height: 100vh;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--tf-text-primary, #e2e6f0);
    overflow: hidden;
    position: relative;
  }

  /* 4:5 aspect frame — the whole page viewport */
  .pe-feed-frame {
    height: 100vh;
    aspect-ratio: 4 / 5;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(circle at top, rgba(0,245,255,0.10), transparent 32%),
      radial-gradient(circle at bottom, rgba(168,56,255,0.08), transparent 34%),
      linear-gradient(180deg, #090b12, var(--tf-bg-surface, #111318) 20%, var(--tf-bg-surface, #111318) 80%, #0b0b0f);
    overflow: hidden;
    position: relative;
  }

  /* Slide content area — fills most of the frame */
  .pe-feed-slide-area {
    flex: 1;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .pe-feed-slide-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .pe-feed-slide-content > * {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .pe-feed-slide-content .lm-slide-frame {
    padding: 1.6vh 3.2vw 1.6vh;
    font-size: clamp(0.625rem, 1.8vh, 0.9375rem);
  }
  .pe-feed-slide-content.with-title-stack .lm-slide-frame {
    padding-top: 1vh;
  }
  .pe-feed-slide-content .lm-slide-hero-title {
    font-size: clamp(1.0625rem, 3vh, 1.875rem);
    margin-bottom: 0.8vh;
  }
  .pe-feed-slide-content .lm-slide-title {
    font-size: clamp(0.875rem, 2.4vh, 1.5rem);
    margin-bottom: 0.8vh;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .pe-feed-slide-content.with-title-stack .lm-slide-title {
    display: none;
  }
  .pe-feed-slide-content .lm-slide-body {
    gap: 0.6vh;
  }
  .pe-feed-slide-content .bullet-sub {
    font-size: 0.88em;
    line-height: 1.28;
  }
  .pe-feed-slide-content .sr-card {
    padding: 0.6vh 1vw;
  }
  .pe-feed-slide-content .sr-value {
    font-size: clamp(0.6875rem, 1.75vh, 1rem);
  }
  .pe-feed-slide-content .sr-label {
    font-size: clamp(0.4375rem, 1vh, 0.625rem);
  }
  .pe-feed-slide-content table {
    font-size: 0.88em;
  }
  .pe-feed-slide-content th,
  .pe-feed-slide-content td {
    padding: 0.5vh 1vw;
  }
  .pe-feed-slide-content .info-box {
    padding: 0.8vh 1.2vw;
    font-size: 0.82em;
  }
  .pe-feed-slide-content .mermaid-widget {
    max-height: 100%;
    overflow: hidden;
  }

  /* PIP inset — overlaid on bottom-right of the slide area */
  .pe-feed-pip {
    position: absolute;
    bottom: 1.5vh;
    right: 1.5vw;
    width: min(38%, 35vh);
    aspect-ratio: 16 / 9;
    border-radius: 0.6em;
    overflow: hidden;
    z-index: 10;
    box-shadow: 0 0.4vh 2vh rgba(0,0,0,0.5), 0 0 0 1px rgba(148,163,184,0.15);
    background:
      radial-gradient(ellipse 80% 60% at 30% 30%, rgba(129,140,248,0.22), transparent),
      radial-gradient(ellipse 70% 50% at 70% 70%, rgba(192,132,252,0.18), transparent),
      radial-gradient(ellipse 60% 40% at 50% 50%, rgba(56,189,248,0.10), transparent),
      linear-gradient(160deg, #262a3d 0%, #2e3350 40%, #232740 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Cross-hair guides inside feed PIP */
  .pe-feed-pip .pe-shorts-guide.top,
  .pe-feed-pip .pe-shorts-guide.bottom {
    left: 50%;
    width: 1px;
    height: 0.8vh;
    transform: translateX(-50%);
  }
  .pe-feed-pip .pe-shorts-guide.top { top: 0; }
  .pe-feed-pip .pe-shorts-guide.bottom { bottom: 0; }
  .pe-feed-pip .pe-shorts-guide.left,
  .pe-feed-pip .pe-shorts-guide.right {
    top: 50%;
    width: 0.8vh;
    height: 1px;
    transform: translateY(-50%);
  }
  .pe-feed-pip .pe-shorts-guide.left { left: 0; }
  .pe-feed-pip .pe-shorts-guide.right { right: 0; }

  /* Footer bar at the bottom of the 4:5 frame */
  .pe-feed-footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    padding: 0.4vh 1.6vw;
    border-top: 1px solid rgba(202,211,230,0.08);
    background: linear-gradient(180deg, rgba(17,19,24,0.92), rgba(11,11,15,0.96));
    min-height: 0;
    flex-wrap: wrap;
  }
  .pe-feed-footer-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    flex-wrap: nowrap;
  }
  .pe-feed-footer .pe-footer-copy {
    font-size: clamp(0.5rem, 0.9vh, 0.6875rem);
    color: var(--tf-text-muted, #64748b);
  }
  .pe-feed-footer-row.subscribe {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3em;
  }
  .pe-feed-subscribe-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--tf-color-danger, #ef4444);
    transform-origin: 50% 10%;
    animation: pe-shorts-bell-ring 4.8s ease-in-out infinite;
  }
  .pe-feed-subscribe-icon svg {
    width: clamp(0.75rem, 1.4vh, 1rem);
    height: clamp(0.75rem, 1.4vh, 1rem);
  }
  .pe-feed-subscribe-text {
    font-size: clamp(0.5625rem, 1.1vh, 0.75rem);
    color: var(--tf-text-secondary, #bfc5d4);
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .pe-feed-subscribe-brand {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    zoom: 0.62;
  }
  .pe-feed-promo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25em;
    min-width: 0;
    font-size: clamp(0.5rem, 1vh, 0.6875rem);
    color: var(--tf-text-muted, #8892a8);
  }
  .pe-feed-promo-label {
    color: var(--tf-text-secondary, #bfc5d4);
    font-weight: 500;
  }
  .pe-feed-promo-site {
    color: var(--tf-color-primary-light, #818cf8);
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-weight: 700;
    letter-spacing: 0.01em;
  }
  .pe-feed-footer-row.socials {
    display: flex;
    align-items: center;
    gap: 1em;
  }
  .pe-feed-footer .pe-footer-social-link {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    font-size: clamp(0.5625rem, 1.1vh, 0.75rem);
    color: var(--tf-text-secondary, #bfc5d4);
    text-decoration: none;
    white-space: nowrap;
  }
  .pe-feed-footer .pe-footer-social-link svg {
    width: clamp(0.75rem, 1.4vh, 1rem);
    height: clamp(0.75rem, 1.4vh, 1rem);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Timer hook                                                            */
/* ═══════════════════════════════════════════════════════════════════════ */

function useSlideTimer(slideIndex: number) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    setElapsed(0);
    startRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [slideIndex]);

  return elapsed;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  SVG Icons                                                             */
/* ═══════════════════════════════════════════════════════════════════════ */

const Icons = {
  home: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  chevLeft: (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M8.5 3L4.5 7l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chevRight: (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M5.5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  fullscreen: (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  panel: (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <rect
        x="1.5"
        y="1.5"
        width="11"
        height="11"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M5 1.5v11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  menu: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  github: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  youtube: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  pip: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <rect
        x="12"
        y="10"
        width="9"
        height="7"
        rx="1"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  ),
  shorts: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="10" y1="6" x2="14" y2="6" />
    </svg>
  ),
  bell: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Typing Promotion — animated footer URL with rotating phrases          */
/* ═══════════════════════════════════════════════════════════════════════ */

function TypingPromotion({ url, phrases }: { url: string; phrases: string[] }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;
    const current = phrases[phraseIdx % phrases.length];

    if (paused) {
      const t = setTimeout(() => {
        setPaused(false);
        setDeleting(true);
      }, 2200);
      return () => clearTimeout(t);
    }

    if (deleting) {
      if (charIdx <= 0) {
        setDeleting(false);
        setPhraseIdx((p) => (p + 1) % phrases.length);
        return;
      }
      const t = setTimeout(() => setCharIdx((c) => c - 1), 30);
      return () => clearTimeout(t);
    }

    // typing
    if (charIdx < current.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 55);
      return () => clearTimeout(t);
    }

    // finished typing — pause
    setPaused(true);
    return undefined;
  }, [charIdx, deleting, paused, phraseIdx, phrases]);

  const displayed =
    phrases.length > 0
      ? (phrases[phraseIdx % phrases.length] ?? "").slice(0, charIdx)
      : "";

  return (
    <span className="pe-footer-url">
      <span className="pe-footer-url-prompt">{">_"}</span>
      <span className="pe-footer-url-static">{url}</span>
      {phrases.length > 0 && (
        <>
          <span className="pe-footer-url-typed">{displayed}</span>
          <span className="pe-footer-url-cursor" />
        </>
      )}
    </span>
  );
}

type ControlCommand =
  | { type: "command"; deckId: string; action: "prev" | "next" }
  | { type: "command"; deckId: string; action: "goto"; index: number }
  | {
      type: "command";
      deckId: string;
      action: "step-prev" | "step-next" | "step-reset" | "step-goto";
      index?: number;
    }
  | { type: "command"; deckId: string; action: "set-zoom"; zoom: number }
  | {
      type: "command";
      deckId: string;
      action: "switch-deck";
      targetDeckId: string;
    }
  | { type: "command"; deckId: string; action: "toggle-fullscreen" }
  | { type: "request-state"; deckId: string };

type ControlState = {
  type: "state";
  deckId: string;
  deckTitle: string;
  slideIndex: number;
  slideCount: number;
  elapsed: number;
  duration?: number;
  zoom: number;
  slideTitle?: string;
  narration?: string;
  steps?: PresentationStep[];
  stepIndex: number;
  stepCount: number;
};

const DEFAULT_CONTROL_CHANNEL = "tf-slides-control";
const DEFAULT_CONTROL_WINDOW_NAME = "tf-slide-control-window";
const DEFAULT_SLIDE_ZOOM = 1.15;
const TRANSCRIPT_FONT_SCALE_STOPS = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7];
const DEFAULT_TRANSCRIPT_FONT_SCALE_INDEX = 1;

function getControlStorageKey(channelId: string, kind: "command" | "state") {
  return `${channelId}:${kind}`;
}

function getZoomStorageKey(channelId: string, deckId: string) {
  return `${channelId}:${deckId}:zoom`;
}

function readStoredSlideZoom(storageKey: string): number {
  try {
    const cachedValue = localStorage.getItem(storageKey);
    if (cachedValue != null) {
      const parsedValue = Number(cachedValue);
      if (!Number.isNaN(parsedValue)) {
        return Math.max(0.85, Math.min(parsedValue, 1.4));
      }
    }
  } catch {
    // Ignore localStorage access issues.
  }
  return DEFAULT_SLIDE_ZOOM;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  PresentationLayout                                                    */
/* ═══════════════════════════════════════════════════════════════════════ */

interface PresentationLayoutProps {
  courseTitle: string;
  deck: PresentationDeck;
  onHome: () => void;
  branding?: PresentationBranding;
  controlChannelId?: string;
  controlWindowName?: string;
  /** Hide the centre prev/current/next slide navigation in the header bar */
  hideHeaderNav?: boolean;
  /** Hash prefix for navigation (e.g. "#/my-show"). goTo writes `{hashPrefix}/{deckId}/{slide}`. */
  hashPrefix?: string;
  /** Headless mode — hides all chrome (header, footer, progress bar). Slides fill the window and are controlled entirely via BroadcastChannel from the control panel. */
  headless?: boolean;
}

export function PresentationLayout({
  courseTitle,
  deck,
  onHome,
  branding,
  controlChannelId = DEFAULT_CONTROL_CHANNEL,
  controlWindowName = DEFAULT_CONTROL_WINDOW_NAME,
  hideHeaderNav = false,
  hashPrefix,
  headless = false,
}: PresentationLayoutProps) {
  const brandLogoSrc =
    branding?.logoSrc ?? "/brand/og-image-template-1200x630.png";
  const brandIconUrl = branding?.brandIconUrl;
  const brandLabel = branding?.brandLabel ?? "Tutorial";
  const showBrandLabel =
    branding?.brandLabel != null && !brandLogoSrc.includes("og-image-template");
  const instructorName = branding?.instructorName;
  const linkedinUrl = branding?.linkedinUrl;
  const twitterUrl = branding?.twitterUrl;
  const twitterHandle = branding?.twitterHandle;
  const linkedinHandle = branding?.linkedinHandle;
  const copyrightText =
    branding?.copyright ?? `\u00A9 ${new Date().getFullYear()} ${brandLabel}`;
  const youtubeUrl = branding?.youtubeUrl;
  const youtubeHandle = branding?.youtubeHandle;
  const siteUrl = branding?.siteUrl;
  const siteUrlPhrases = branding?.siteUrlPhrases ?? [];
  const rootRef = useRef<HTMLDivElement>(null);
  const controlChannelRef = useRef<BroadcastChannel | null>(null);
  const zoomStorageKey = getZoomStorageKey(controlChannelId, deck.id);
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(controlChannelId, "command");
  const youtubeLabel = youtubeHandle
    ? `yt/${youtubeHandle.replace(/^@/, "")}`
    : "YouTube";
  const twitterLabel = twitterHandle
    ? `x/${twitterHandle.replace(/^@/, "")}`
    : "X";
  const linkedinLabel = linkedinHandle
    ? linkedinHandle.startsWith("in/")
      ? linkedinHandle
      : `in/${linkedinHandle.replace(/^@/, "")}`
    : "LinkedIn";

  /* ── Parse initial slide from hash ── */
  const getIndexFromHash = useCallback((): number => {
    const hash = window.location.hash; // e.g. #/01/3 or #/a2a/why-a2a/3
    const m = hash.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }, []);

  const [slideIndex, setSlideIndex] = useState(getIndexFromHash);
  const [stepIndex, setStepIndex] = useState(0);
  const [slideZoom, setSlideZoom] = useState<number>(() =>
    readStoredSlideZoom(zoomStorageKey),
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pipMode, setPipMode] = useState(!!headless);
  const slideCount = deck.slides.length;
  const elapsed = useSlideTimer(slideIndex);

  /* ── Derived slide data ── */
  const currentSlide = deck.slides[slideIndex];
  const currentSteps = currentSlide?.steps ?? [];
  const currentStepCount = currentSteps.length;
  const activeStepIndex =
    currentStepCount > 0 ? Math.min(stepIndex, currentStepCount - 1) : 0;
  const activeStep = currentSteps[activeStepIndex] ?? null;
  const prevSlide = slideIndex > 0 ? deck.slides[slideIndex - 1] : null;
  const nextSlide =
    slideIndex < slideCount - 1 ? deck.slides[slideIndex + 1] : null;

  /* ── Navigation ── */
  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, slideCount - 1));
      setSlideIndex(clamped);
      setStepIndex(0);
      window.location.hash = hashPrefix
        ? `${hashPrefix}/${deck.id}/${clamped}`
        : `#/${deck.id}/${clamped}`;
    },
    [slideCount, deck.id, hashPrefix],
  );

  const goPrev = useCallback(() => {
    if (currentStepCount > 0 && activeStepIndex > 0) {
      setStepIndex((value) => Math.max(0, value - 1));
      return;
    }
    goTo(slideIndex - 1);
  }, [activeStepIndex, currentStepCount, goTo, slideIndex]);

  const goNext = useCallback(() => {
    if (currentStepCount > 0 && activeStepIndex < currentStepCount - 1) {
      setStepIndex((value) => Math.min(currentStepCount - 1, value + 1));
      return;
    }
    goTo(slideIndex + 1);
  }, [activeStepIndex, currentStepCount, goTo, slideIndex]);

  const stepBack = useCallback(() => {
    if (currentStepCount <= 0) return;
    setStepIndex((value) => Math.max(0, value - 1));
  }, [currentStepCount]);

  const stepForward = useCallback(() => {
    if (currentStepCount <= 0) return;
    setStepIndex((value) => Math.min(currentStepCount - 1, value + 1));
  }, [currentStepCount]);

  const resetStep = useCallback(() => {
    setStepIndex(0);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(zoomStorageKey, String(slideZoom));
    } catch {
      // Ignore localStorage access issues.
    }
  }, [slideZoom, zoomStorageKey]);

  const postControlState = useCallback(() => {
    const channel = controlChannelRef.current;
    if (!channel) return;
    const slide = deck.slides[slideIndex];
    const message: ControlState = {
      type: "state",
      deckId: deck.id,
      deckTitle: deck.title,
      slideIndex,
      slideCount,
      elapsed,
      duration: slide?.duration,
      zoom: slideZoom,
      slideTitle: slide?.title,
      narration: slide?.narration,
      steps: slide?.steps,
      stepIndex: slide?.steps?.length ? activeStepIndex : 0,
      stepCount: slide?.steps?.length ?? 0,
    };
    channel.postMessage(message);
    localStorage.setItem(stateStorageKey, JSON.stringify(message));
  }, [
    deck,
    slideIndex,
    slideCount,
    elapsed,
    slideZoom,
    activeStepIndex,
    stateStorageKey,
  ]);

  /* ── Stable refs for BroadcastChannel handler (avoids effect teardown on step change) ── */
  const goPrevRef = useRef(goPrev);
  const goNextRef = useRef(goNext);
  const goToRef = useRef(goTo);
  const stepBackRef = useRef(stepBack);
  const stepForwardRef = useRef(stepForward);
  const resetStepRef = useRef(resetStep);
  const postControlStateRef = useRef(postControlState);
  const currentStepCountRef = useRef(currentStepCount);
  goPrevRef.current = goPrev;
  goNextRef.current = goNext;
  goToRef.current = goTo;
  stepBackRef.current = stepBack;
  stepForwardRef.current = stepForward;
  resetStepRef.current = resetStep;
  postControlStateRef.current = postControlState;
  currentStepCountRef.current = currentStepCount;
  const lastCmdRef = useRef({ sig: "", ts: 0 });

  /* ── Keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isNavigationKey =
        e.key === "ArrowLeft" ||
        e.key === "PageUp" ||
        e.key === "ArrowRight" ||
        e.key === " " ||
        e.key === "PageDown" ||
        e.key === "Home" ||
        e.key === "End";

      // Prevent a held remote/clicker button from advancing into the next
      // slide's first step immediately after navigation.
      if (e.repeat && isNavigationKey) {
        e.preventDefault();
        return;
      }

      if (e.key === "Escape" && drawerOpen) {
        e.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (
        e.key === "ArrowRight" ||
        e.key === " " ||
        e.key === "PageDown"
      ) {
        e.preventDefault();
        goNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(slideCount - 1);
      } else if ((e.key === "p" || e.key === "P") && !headless) {
        e.preventDefault();
        setPipMode((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, goTo, slideCount, drawerOpen]);

  /* ── Hash sync ── */
  useEffect(() => {
    const onHash = () => {
      setSlideIndex(getIndexFromHash());
      setStepIndex(0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [getIndexFromHash]);

  /* ── Control-window sync ── */
  useEffect(() => {
    const channel = new BroadcastChannel(controlChannelId);
    controlChannelRef.current = channel;

    const handleCommand = (msg: ControlCommand) => {
      if (!msg) return;
      /* Dedup: both BroadcastChannel and localStorage fire for cross-window commands */
      const now = Date.now();
      const sig = `${msg.type}:${(msg as ControlCommand & { action?: string }).action ?? ""}:${(msg as ControlCommand & { index?: number }).index ?? ""}:${(msg as ControlCommand & { targetDeckId?: string }).targetDeckId ?? ""}`;
      if (sig === lastCmdRef.current.sig && now - lastCmdRef.current.ts < 80)
        return;
      lastCmdRef.current = { sig, ts: now };

      if (msg.type === "request-state") {
        if (msg.deckId !== deck.id) return;
        postControlStateRef.current();
        return;
      }
      if (msg.type !== "command") return;
      if (msg.action === "switch-deck") {
        if (msg.deckId !== deck.id || !msg.targetDeckId) return;
        window.location.hash = hashPrefix
          ? `${hashPrefix}/${msg.targetDeckId}/0`
          : `#/${msg.targetDeckId}/0`;
        return;
      }
      if (msg.deckId !== deck.id) return;
      if (msg.action === "prev") goPrevRef.current();
      else if (msg.action === "next") goNextRef.current();
      else if (msg.action === "goto") goToRef.current(msg.index);
      else if (msg.action === "step-prev") stepBackRef.current();
      else if (msg.action === "step-next") stepForwardRef.current();
      else if (msg.action === "step-reset") resetStepRef.current();
      else if (msg.action === "step-goto") {
        if (typeof msg.index !== "number") return;
        setStepIndex(
          Math.max(0, Math.min(msg.index, currentStepCountRef.current - 1)),
        );
      } else if (msg.action === "set-zoom") {
        const nextZoom = Math.max(0.85, Math.min(msg.zoom, 1.4));
        setSlideZoom(nextZoom);
      } else if (msg.action === "toggle-fullscreen") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    const onMessage = (ev: MessageEvent<ControlCommand>) => {
      handleCommand(ev.data);
    };

    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== commandStorageKey || !ev.newValue) return;
      try {
        handleCommand(JSON.parse(ev.newValue) as ControlCommand);
      } catch {
        // Ignore malformed sync payloads.
      }
    };

    channel.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      channel.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
      channel.close();
      controlChannelRef.current = null;
    };
  }, [controlChannelId, deck.id, commandStorageKey, hashPrefix]);

  useEffect(() => {
    postControlState();
  }, [postControlState]);

  useEffect(() => {
    setStepIndex(0);
  }, [deck.id, slideIndex]);

  /* ── Fullscreen ── */
  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  const openControlWindow = useCallback(() => {
    const controlUrl = `${window.location.pathname}?control=1${window.location.hash}`;
    const popup = window.open(
      controlUrl,
      controlWindowName,
      "popup=yes,width=1380,height=1035,resizable=yes,scrollbars=yes",
    );
    if (popup) {
      popup.focus();
      setTimeout(() => postControlState(), 120);
    }
  }, [postControlState, controlWindowName]);

  const openShortsWindow = useCallback(() => {
    const shortsUrl = `${window.location.pathname}?shorts=1${window.location.hash}`;
    const popup = window.open(
      shortsUrl,
      `${controlWindowName}-shorts`,
      "popup=yes,width=560,height=1000,resizable=yes,scrollbars=yes",
    );
    if (popup) {
      popup.focus();
    }
  }, [controlWindowName]);

  const openFeedWindow = useCallback(() => {
    const feedUrl = `${window.location.pathname}?shorts=45${window.location.hash}`;
    const popup = window.open(
      feedUrl,
      `${controlWindowName}-feed`,
      "popup=yes,width=900,height=1125,resizable=yes,scrollbars=yes",
    );
    if (popup) {
      popup.focus();
    }
  }, [controlWindowName]);

  /* ── Drawer navigation ── */
  const handleDrawerNav = useCallback(
    (idx: number) => {
      goTo(idx);
      setDrawerOpen(false);
    },
    [goTo],
  );

  const progressPct =
    slideCount > 1 ? (slideIndex / (slideCount - 1)) * 100 : 0;
  const stepContextValue: PresentationStepContextValue = {
    stepIndex: activeStepIndex,
    stepCount: currentStepCount,
    activeStep,
    steps: currentSteps,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ENGINE_CSS }} />
      <div
        className={`pe-root${headless ? " pe-headless" : ""}${pipMode ? " pe-pip-mode" : ""}`}
        ref={rootRef}
        aria-label={courseTitle}
      >
        {/* ── Header ── */}
        <div className="pe-header">
          <div className="pe-header-left">
            <button
              className={`pe-drawer-toggle ${drawerOpen ? "active" : ""}`}
              onClick={() => setDrawerOpen(!drawerOpen)}
              title="Slide navigator (Esc to close)"
            >
              {Icons.menu}
            </button>
            <button className="pe-header-home" onClick={onHome} title="Home">
              {Icons.home}
              <span>Home</span>
            </button>
            <span className="pe-header-sep">›</span>
            <span className="pe-header-lesson">
              {deck.number}. {sanitizePresentationTitle(deck.title)}
            </span>
          </div>

          {!hideHeaderNav && (
            <div className="pe-header-center">
              <div className="pe-header-nav">
                <button
                  className="pe-nav-btn"
                  onClick={goPrev}
                  disabled={
                    slideIndex <= 0 &&
                    (currentStepCount === 0 || activeStepIndex <= 0)
                  }
                  aria-label="Previous"
                >
                  {Icons.chevLeft}
                </button>
                <span
                  className={`pe-header-nav-prev ${prevSlide ? "" : "empty"}`}
                  title={prevSlide?.title}
                >
                  {renderSlideTitle(prevSlide?.title)}
                </span>
                <span
                  className="pe-header-nav-current"
                  title={currentSlide?.title}
                >
                  {renderSlideTitle(currentSlide?.title)}
                </span>
                <span
                  className={`pe-header-nav-next ${nextSlide ? "" : "empty"}`}
                  title={nextSlide?.title}
                >
                  {renderSlideTitle(nextSlide?.title)}
                </span>
                <button
                  className="pe-nav-btn"
                  onClick={goNext}
                  disabled={
                    slideIndex >= slideCount - 1 &&
                    (currentStepCount === 0 ||
                      activeStepIndex >= currentStepCount - 1)
                  }
                  aria-label="Next"
                >
                  {Icons.chevRight}
                </button>
              </div>
            </div>
          )}

          <div className="pe-header-right">
            <span className="pe-header-slide">
              Slide {slideIndex + 1} / {slideCount}
            </span>
            <button
              className="pe-control-btn"
              onClick={openControlWindow}
              title="Open control panel in a new window"
            >
              {Icons.panel}
              <span style={{ marginLeft: 6 }}>Control</span>
            </button>
            <button
              className={`pe-pip-btn${pipMode ? " active" : ""}`}
              onClick={() => setPipMode((v) => !v)}
              title="Toggle 16:9 mode (P)"
            >
              {Icons.pip}
            </button>
            {deck.deckType === "short" && (
              <>
                <button
                  className="pe-shorts-btn ratio"
                  onClick={openShortsWindow}
                  title="Open Shorts (9:16) view"
                  aria-label="Open 9 by 16 shorts view"
                >
                  {Icons.shorts}
                  <span className="pe-shorts-btn-label">9:16</span>
                </button>
                <button
                  className="pe-shorts-btn ratio"
                  onClick={openFeedWindow}
                  title="Open Shorts feed (4:5) view"
                  aria-label="Open 4 by 5 shorts feed view"
                >
                  {Icons.shorts}
                  <span className="pe-shorts-btn-label">4:5</span>
                </button>
              </>
            )}
            <button className="pe-fs-btn" onClick={toggleFs} title="Fullscreen">
              {Icons.fullscreen}
            </button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="pe-progress">
          <div
            className="pe-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* ── Body (70/30) ── */}
        <div className="pe-body">
          {/* Left 70% */}
          <div className="pe-left">
            {/* ── Slide Drawer (overlay) ── */}
            <div className={`pe-drawer-overlay ${drawerOpen ? "open" : ""}`}>
              <div className="pe-drawer-panel">
                <div className="pe-drawer-header">
                  <span className="pe-drawer-header-label">Slides</span>
                  <button
                    className="pe-drawer-close"
                    onClick={() => setDrawerOpen(false)}
                    title="Close drawer"
                  >
                    {Icons.close}
                  </button>
                </div>
                <div className="pe-drawer-list">
                  {deck.slides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={`pe-drawer-item ${idx === slideIndex ? "active" : ""}`}
                      onClick={() => handleDrawerNav(idx)}
                    >
                      <span className="pe-drawer-item-num">{idx + 1}</span>
                      <div className="pe-drawer-item-info">
                        <div className="pe-drawer-item-title">
                          {renderSlideTitle(slide.title)}
                        </div>
                        {slide.duration != null && (
                          <div className="pe-drawer-item-duration">
                            {formatTime(slide.duration)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="pe-drawer-backdrop"
                onClick={() => setDrawerOpen(false)}
              />
            </div>

            {/* Slide viewport */}
            <div className="pe-viewport">
              <div className="pe-slide-box" style={{ zoom: slideZoom }}>
                <PresentationStepContext.Provider
                  key={`${deck.id}:${currentSlide?.id ?? slideIndex}`}
                  value={stepContextValue}
                >
                  {currentSlide?.content}
                </PresentationStepContext.Provider>
              </div>
            </div>
          </div>

          {/* ── 16:9 Column (visible in 16:9 mode) ── */}
          {pipMode && (
            <div className="pe-pip-column">
              {/* Compact header — keep control access visible in 16:9 mode */}
              <div className="pe-pip-header">
                <button
                  className={`pe-drawer-toggle ${drawerOpen ? "active" : ""}`}
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  title="Slide navigator"
                >
                  {Icons.menu}
                </button>
                <div style={{ flex: 1 }} />
                <button
                  className="pe-control-btn pe-control-btn-icon"
                  onClick={openControlWindow}
                  title="Open control panel in a new window"
                  aria-label="Control"
                >
                  {Icons.panel}
                </button>
                <button
                  className="pe-nav-btn"
                  onClick={goPrev}
                  disabled={
                    slideIndex <= 0 &&
                    (currentStepCount === 0 || activeStepIndex <= 0)
                  }
                  aria-label="Previous"
                >
                  {Icons.chevLeft}
                </button>
                <button
                  className="pe-nav-btn"
                  onClick={goNext}
                  disabled={
                    slideIndex >= slideCount - 1 &&
                    (currentStepCount === 0 ||
                      activeStepIndex >= currentStepCount - 1)
                  }
                  aria-label="Next"
                >
                  {Icons.chevRight}
                </button>
                <button
                  className="pe-pip-btn active"
                  onClick={() => setPipMode(false)}
                  title="Exit 16:9 mode (P)"
                >
                  {Icons.pip}
                </button>
                <button
                  className="pe-fs-btn"
                  onClick={toggleFs}
                  title="Fullscreen"
                >
                  {Icons.fullscreen}
                </button>
              </div>

              {/* Course / lesson info section */}
              <div className="pe-pip-info">
                <span className="pe-pip-info-course">{courseTitle}</span>
                <span className="pe-pip-info-lesson">
                  {deck.number}. {sanitizePresentationTitle(deck.title)}
                </span>
                <span className="pe-pip-info-slide">
                  Slide {slideIndex + 1} of {slideCount}
                </span>
              </div>

              {/* 16:9 video area (middle) */}
              <div className="pe-pip-inset" aria-label="16:9 video area">
                <span className="pe-pip-guide top" aria-hidden="true" />
                <span className="pe-pip-guide right" aria-hidden="true" />
                <span className="pe-pip-guide bottom" aria-hidden="true" />
                <span className="pe-pip-guide left" aria-hidden="true" />
              </div>

              <div className="pe-pip-footer">
                <div className="pe-pip-footer-row brand">
                  {brandIconUrl ? (
                    <BrandLockup
                      iconUrl={brandIconUrl}
                      size="lg"
                      label={brandLabel}
                    />
                  ) : (
                    <img
                      className="pe-footer-logo"
                      src={brandLogoSrc}
                      alt={brandLabel}
                    />
                  )}
                </div>
                {instructorName ? (
                  <div className="pe-pip-footer-row instructor">
                    <span className="pe-footer-instructor">
                      {instructorName}
                    </span>
                  </div>
                ) : null}
                <div className="pe-pip-footer-row socials">
                  {youtubeUrl ? (
                    <a
                      className="pe-footer-social-link"
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                    >
                      {Icons.youtube}
                      <span className="pe-footer-social-text">
                        {youtubeLabel}
                      </span>
                    </a>
                  ) : null}
                  {twitterUrl ? (
                    <a
                      className="pe-footer-social-link"
                      href={twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="X"
                    >
                      {Icons.twitter}
                      <span className="pe-footer-social-text">
                        {twitterLabel}
                      </span>
                    </a>
                  ) : null}
                  {linkedinUrl ? (
                    <a
                      className="pe-footer-social-link"
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                    >
                      {Icons.linkedin}
                      <span className="pe-footer-social-text">
                        {linkedinLabel}
                      </span>
                    </a>
                  ) : null}
                </div>
                <div className="pe-pip-footer-row copy">
                  <span className="pe-footer-copy">{copyrightText}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="pe-footer">
          <div className="pe-footer-left">
            {brandIconUrl ? (
              <BrandLockup
                iconUrl={brandIconUrl}
                size="md"
                label={brandLabel}
              />
            ) : (
              <>
                <img
                  className="pe-footer-logo"
                  src={brandLogoSrc}
                  alt={brandLabel}
                />
                {showBrandLabel ? (
                  <span className="pe-footer-brand">{brandLabel}</span>
                ) : null}
              </>
            )}
          </div>
          <div className="pe-footer-center">
            {youtubeUrl ? (
              <a
                className="pe-footer-social-link"
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                {Icons.youtube}
                {youtubeHandle ? <span>{youtubeHandle}</span> : null}
              </a>
            ) : null}
            {twitterUrl ? (
              <a
                className="pe-footer-social-link"
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                {Icons.twitter}
                {twitterHandle ? <span>{twitterHandle}</span> : null}
              </a>
            ) : null}
            {linkedinUrl ? (
              <a
                className="pe-footer-social-link"
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                {Icons.linkedin}
                {linkedinHandle ? <span>{linkedinHandle}</span> : null}
              </a>
            ) : null}
          </div>
          <div className="pe-footer-url-wrap">
            {siteUrl ? (
              <TypingPromotion url={siteUrl} phrases={siteUrlPhrases} />
            ) : null}
          </div>
          <div className="pe-footer-right">
            <span className="pe-footer-copy">{copyrightText}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  ShortsLayout — 9:16 portrait recording view (2048 × 3640)             */
/* ═══════════════════════════════════════════════════════════════════════ */

interface ShortsLayoutProps {
  courseTitle: string;
  deck: PresentationDeck;
  branding?: PresentationBranding;
  controlChannelId?: string;
  commandChannelId?: string;
  /** Hash prefix for navigation (e.g. "#/my-show"). goTo writes `{hashPrefix}/{deckId}/{slide}`. */
  hashPrefix?: string;
}

/** Truncate narration to ~300 chars at a sentence boundary for 3-4 line descriptions. */
function shortsDescription(narration?: string): string {
  if (!narration) return "";
  const clean = narration.replace(/\s+/g, " ").trim();
  if (clean.length <= 300) return clean;
  const cut = clean.slice(0, 300);
  const dot = cut.lastIndexOf(".");
  const comma = cut.lastIndexOf(",");
  const boundary = Math.max(dot, comma);
  if (boundary > 120) return cut.slice(0, boundary + 1).trim();
  return cut.trim() + "…";
}

export function ShortsLayout({
  courseTitle,
  deck,
  branding,
  controlChannelId = DEFAULT_CONTROL_CHANNEL,
  commandChannelId = controlChannelId,
  hashPrefix,
}: ShortsLayoutProps) {
  const brandIconUrl = branding?.brandIconUrl;
  const brandLabel = branding?.brandLabel ?? "Tutorial";
  const siteUrl = branding?.siteUrl ?? "tuts.localm.dev";
  const copyrightText =
    branding?.copyright ?? `\u00A9 ${new Date().getFullYear()} ${brandLabel}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const stateChannelRef = useRef<BroadcastChannel | null>(null);
  const commandChannelRef = useRef<BroadcastChannel | null>(null);
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(commandChannelId, "command");

  /* ── Parse initial slide from hash ── */
  const getIndexFromHash = useCallback((): number => {
    const hash = window.location.hash;
    const m = hash.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }, []);

  const [slideIndex, setSlideIndex] = useState(getIndexFromHash);
  const [stepIndex, setStepIndex] = useState(0);
  const slideCount = deck.slides.length;
  const elapsed = useSlideTimer(slideIndex);

  const currentSlide = deck.slides[slideIndex];
  const currentSteps = currentSlide?.steps ?? [];
  const currentStepCount = currentSteps.length;
  const activeStepIndex =
    currentStepCount > 0 ? Math.min(stepIndex, currentStepCount - 1) : 0;
  const activeStep = currentSteps[activeStepIndex] ?? null;
  const shortTitle = sanitizePresentationTitle(deck.title);
  const slideTitle = sanitizePresentationTitle(currentSlide?.title);
  const showTitleStack = slideIndex > 0;

  const stepContextValue: PresentationStepContextValue = {
    stepIndex: activeStepIndex,
    stepCount: currentStepCount,
    activeStep,
    steps: currentSteps,
  };

  /* ── Navigation ── */
  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, slideCount - 1));
      setSlideIndex(clamped);
      setStepIndex(0);
      window.location.hash = hashPrefix
        ? `${hashPrefix}/${deck.id}/${clamped}`
        : `#/${deck.id}/${clamped}`;
    },
    [slideCount, deck.id, hashPrefix],
  );

  const goPrev = useCallback(() => {
    if (currentStepCount > 0 && activeStepIndex > 0) {
      setStepIndex((v) => Math.max(0, v - 1));
      return;
    }
    goTo(slideIndex - 1);
  }, [activeStepIndex, currentStepCount, goTo, slideIndex]);

  const goNext = useCallback(() => {
    if (currentStepCount > 0 && activeStepIndex < currentStepCount - 1) {
      setStepIndex((v) => Math.min(currentStepCount - 1, v + 1));
      return;
    }
    goTo(slideIndex + 1);
  }, [activeStepIndex, currentStepCount, goTo, slideIndex]);

  const stepBack = useCallback(() => {
    if (currentStepCount <= 0) return;
    setStepIndex((v) => Math.max(0, v - 1));
  }, [currentStepCount]);

  const stepForward = useCallback(() => {
    if (currentStepCount <= 0) return;
    setStepIndex((v) => Math.min(currentStepCount - 1, v + 1));
  }, [currentStepCount]);

  const resetStep = useCallback(() => {
    setStepIndex(0);
  }, []);

  /* ── Broadcast state ── */
  const postControlState = useCallback(() => {
    const channel = stateChannelRef.current;
    if (!channel) return;
    const slide = deck.slides[slideIndex];
    const message: ControlState = {
      type: "state",
      deckId: deck.id,
      deckTitle: deck.title,
      slideIndex,
      slideCount,
      elapsed,
      duration: slide?.duration,
      zoom: 1,
      slideTitle: slide?.title,
      narration: slide?.narration,
      steps: slide?.steps,
      stepIndex: slide?.steps?.length ? activeStepIndex : 0,
      stepCount: slide?.steps?.length ?? 0,
    };
    channel.postMessage(message);
    localStorage.setItem(stateStorageKey, JSON.stringify(message));
  }, [deck, slideIndex, slideCount, elapsed, activeStepIndex, stateStorageKey]);

  /* ── Stable refs for BroadcastChannel handler (avoids effect teardown on step change) ── */
  const sGoPrevRef = useRef(goPrev);
  const sGoNextRef = useRef(goNext);
  const sGoToRef = useRef(goTo);
  const sStepBackRef = useRef(stepBack);
  const sStepForwardRef = useRef(stepForward);
  const sResetStepRef = useRef(resetStep);
  const sPostControlStateRef = useRef(postControlState);
  const sCurrentStepCountRef = useRef(currentStepCount);
  sGoPrevRef.current = goPrev;
  sGoNextRef.current = goNext;
  sGoToRef.current = goTo;
  sStepBackRef.current = stepBack;
  sStepForwardRef.current = stepForward;
  sResetStepRef.current = resetStep;
  sPostControlStateRef.current = postControlState;
  sCurrentStepCountRef.current = currentStepCount;
  const sLastCmdRef = useRef({ sig: "", ts: 0 });

  useEffect(() => {
    const channel = new BroadcastChannel(controlChannelId);
    stateChannelRef.current = channel;

    return () => {
      channel.close();
      stateChannelRef.current = null;
    };
  }, [controlChannelId]);

  /* ── Keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) {
        const nav =
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === " " ||
          e.key === "PageUp" ||
          e.key === "PageDown";
        if (nav) {
          e.preventDefault();
          return;
        }
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (
        e.key === "ArrowRight" ||
        e.key === " " ||
        e.key === "PageDown"
      ) {
        e.preventDefault();
        goNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(slideCount - 1);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, goTo, slideCount]);

  /* ── Hash sync ── */
  useEffect(() => {
    const onHash = () => {
      setSlideIndex(getIndexFromHash());
      setStepIndex(0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [getIndexFromHash]);

  /* ── Control-window sync (receive commands) ── */
  useEffect(() => {
    const channel = new BroadcastChannel(commandChannelId);
    commandChannelRef.current = channel;

    const handleCommand = (msg: ControlCommand) => {
      if (!msg) return;
      /* Dedup: both BroadcastChannel and localStorage fire for cross-window commands */
      const now = Date.now();
      const sig = `${msg.type}:${(msg as ControlCommand & { action?: string }).action ?? ""}:${(msg as ControlCommand & { index?: number }).index ?? ""}:${(msg as ControlCommand & { targetDeckId?: string }).targetDeckId ?? ""}`;
      if (sig === sLastCmdRef.current.sig && now - sLastCmdRef.current.ts < 80)
        return;
      sLastCmdRef.current = { sig, ts: now };

      if (msg.type === "request-state") {
        if (msg.deckId !== deck.id) return;
        sPostControlStateRef.current();
        return;
      }
      if (msg.type !== "command") return;
      if (msg.action === "switch-deck") {
        if (msg.deckId !== deck.id || !msg.targetDeckId) return;
        window.location.hash = hashPrefix
          ? `${hashPrefix}/${msg.targetDeckId}/0`
          : `#/${msg.targetDeckId}/0`;
        return;
      }
      if (msg.deckId !== deck.id) return;
      if (msg.action === "prev") sGoPrevRef.current();
      else if (msg.action === "next") sGoNextRef.current();
      else if (msg.action === "goto") sGoToRef.current(msg.index);
      else if (msg.action === "step-prev") sStepBackRef.current();
      else if (msg.action === "step-next") sStepForwardRef.current();
      else if (msg.action === "step-reset") sResetStepRef.current();
      else if (msg.action === "step-goto") {
        if (typeof msg.index !== "number") return;
        setStepIndex(
          Math.max(0, Math.min(msg.index, sCurrentStepCountRef.current - 1)),
        );
      } else if (msg.action === "toggle-fullscreen") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    const onMessage = (ev: MessageEvent<ControlCommand>) => {
      handleCommand(ev.data);
    };
    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== commandStorageKey || !ev.newValue) return;
      try {
        handleCommand(JSON.parse(ev.newValue) as ControlCommand);
      } catch {
        /* ignore */
      }
    };

    channel.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      channel.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
      channel.close();
      commandChannelRef.current = null;
    };
  }, [commandStorageKey, commandChannelId, deck.id, hashPrefix]);

  useEffect(() => {
    postControlState();
  }, [postControlState]);

  useEffect(() => {
    setStepIndex(0);
  }, [deck.id, slideIndex]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ENGINE_CSS }} />
      <div className="pe-shorts-root" ref={rootRef} aria-label={courseTitle}>
        <div className="pe-shorts-frame">
          {/* ── Slide content area ── */}
          <div className="pe-shorts-header">
            {showTitleStack ? (
              <ShortsTitleStack
                shortTitle={shortTitle}
                slideTitle={slideTitle}
              />
            ) : null}
            <div
              className={`pe-shorts-slide-content${showTitleStack ? " with-title-stack" : ""}`}
            >
              <PresentationStepContext.Provider
                key={`${deck.id}:${currentSlide?.id ?? slideIndex}`}
                value={stepContextValue}
              >
                {currentSlide?.content}
              </PresentationStepContext.Provider>
            </div>
          </div>

          {/* ── Video capture area (plain 1:1 host) ── */}
          <div className="pe-shorts-video" aria-label="Video capture area">
            <span className="pe-shorts-guide top" aria-hidden="true" />
            <span className="pe-shorts-guide right" aria-hidden="true" />
            <span className="pe-shorts-guide bottom" aria-hidden="true" />
            <span className="pe-shorts-guide left" aria-hidden="true" />
          </div>

          {/* ── Footer ── */}
          <div className="pe-shorts-footer">
            <div className="pe-shorts-footer-row subscribe">
              <span className="pe-shorts-subscribe-icon">{Icons.bell}</span>
              <span className="pe-shorts-subscribe-text">Subscribe to</span>
              <span className="pe-shorts-subscribe-brand">
                {brandIconUrl ? (
                  <BrandLockup
                    iconUrl={brandIconUrl}
                    size="sm"
                    label={brandLabel}
                  />
                ) : (
                  <strong>{brandLabel}</strong>
                )}
              </span>
              <span className="pe-shorts-subscribe-text">
                for more videos, interview tips & tutorials
              </span>
            </div>
            <div className="pe-shorts-footer-row">
              <span className="pe-shorts-promo">
                <span className="pe-shorts-promo-label">
                  Explore free interactive tutorials at
                </span>
                <span className="pe-shorts-promo-site">{siteUrl}</span>
              </span>
            </div>
            <div className="pe-shorts-footer-row copy">
              <span className="pe-footer-copy">{copyrightText}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  ShortsFeedLayout — 4:5 portrait feed view (slides + video PiP)       */
/* ═══════════════════════════════════════════════════════════════════════ */

interface ShortsFeedLayoutProps {
  courseTitle: string;
  deck: PresentationDeck;
  branding?: PresentationBranding;
  controlChannelId?: string;
  commandChannelId?: string;
  hashPrefix?: string;
}

export function ShortsFeedLayout({
  courseTitle,
  deck,
  branding,
  controlChannelId = DEFAULT_CONTROL_CHANNEL,
  commandChannelId = controlChannelId,
  hashPrefix,
}: ShortsFeedLayoutProps) {
  const brandIconUrl = branding?.brandIconUrl;
  const brandLabel = branding?.brandLabel ?? "Tutorial";
  const siteUrl = branding?.siteUrl ?? "tuts.localm.dev";
  const copyrightText =
    branding?.copyright ?? `\u00A9 ${new Date().getFullYear()} ${brandLabel}`;
  const youtubeUrl = branding?.youtubeUrl;
  const youtubeHandle = branding?.youtubeHandle;
  const twitterUrl = branding?.twitterUrl;
  const twitterHandle = branding?.twitterHandle;
  const linkedinUrl = branding?.linkedinUrl;
  const linkedinHandle = branding?.linkedinHandle;
  const youtubeLabel = youtubeHandle
    ? `yt/${youtubeHandle.replace(/^@/, "")}`
    : "YouTube";
  const twitterLabel = twitterHandle
    ? `x/${twitterHandle.replace(/^@/, "")}`
    : "X";
  const linkedinLabel = linkedinHandle
    ? linkedinHandle.startsWith("in/")
      ? linkedinHandle
      : `in/${linkedinHandle.replace(/^@/, "")}`
    : "LinkedIn";

  const rootRef = useRef<HTMLDivElement>(null);
  const stateChannelRef = useRef<BroadcastChannel | null>(null);
  const commandChannelRef = useRef<BroadcastChannel | null>(null);
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(commandChannelId, "command");

  const getIndexFromHash = useCallback((): number => {
    const hash = window.location.hash;
    const m = hash.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }, []);

  const [slideIndex, setSlideIndex] = useState(getIndexFromHash);
  const [stepIndex, setStepIndex] = useState(0);
  const slideCount = deck.slides.length;
  const elapsed = useSlideTimer(slideIndex);

  const currentSlide = deck.slides[slideIndex];
  const currentSteps = currentSlide?.steps ?? [];
  const currentStepCount = currentSteps.length;
  const activeStepIndex =
    currentStepCount > 0 ? Math.min(stepIndex, currentStepCount - 1) : 0;
  const activeStep = currentSteps[activeStepIndex] ?? null;
  const shortTitle = sanitizePresentationTitle(deck.title);
  const slideTitle = sanitizePresentationTitle(currentSlide?.title);
  const showTitleStack = slideIndex > 0;

  const stepContextValue: PresentationStepContextValue = {
    stepIndex: activeStepIndex,
    stepCount: currentStepCount,
    activeStep,
    steps: currentSteps,
  };

  /* ── Navigation ── */
  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, slideCount - 1));
      setSlideIndex(clamped);
      setStepIndex(0);
      window.location.hash = hashPrefix
        ? `${hashPrefix}/${deck.id}/${clamped}`
        : `#/${deck.id}/${clamped}`;
    },
    [slideCount, deck.id, hashPrefix],
  );

  const goPrev = useCallback(() => {
    if (currentStepCount > 0 && activeStepIndex > 0) {
      setStepIndex((v) => Math.max(0, v - 1));
      return;
    }
    goTo(slideIndex - 1);
  }, [activeStepIndex, currentStepCount, goTo, slideIndex]);

  const goNext = useCallback(() => {
    if (currentStepCount > 0 && activeStepIndex < currentStepCount - 1) {
      setStepIndex((v) => Math.min(currentStepCount - 1, v + 1));
      return;
    }
    goTo(slideIndex + 1);
  }, [activeStepIndex, currentStepCount, goTo, slideIndex]);

  const stepBack = useCallback(() => {
    if (currentStepCount <= 0) return;
    setStepIndex((v) => Math.max(0, v - 1));
  }, [currentStepCount]);

  const stepForward = useCallback(() => {
    if (currentStepCount <= 0) return;
    setStepIndex((v) => Math.min(currentStepCount - 1, v + 1));
  }, [currentStepCount]);

  const resetStep = useCallback(() => {
    setStepIndex(0);
  }, []);

  /* ── Broadcast state ── */
  const postControlState = useCallback(() => {
    const channel = stateChannelRef.current;
    if (!channel) return;
    const slide = deck.slides[slideIndex];
    const message: ControlState = {
      type: "state",
      deckId: deck.id,
      deckTitle: deck.title,
      slideIndex,
      slideCount,
      elapsed,
      duration: slide?.duration,
      zoom: 1,
      slideTitle: slide?.title,
      narration: slide?.narration,
      steps: slide?.steps,
      stepIndex: slide?.steps?.length ? activeStepIndex : 0,
      stepCount: slide?.steps?.length ?? 0,
    };
    channel.postMessage(message);
    localStorage.setItem(stateStorageKey, JSON.stringify(message));
  }, [deck, slideIndex, slideCount, elapsed, activeStepIndex, stateStorageKey]);

  /* ── Stable refs ── */
  const fGoPrevRef = useRef(goPrev);
  const fGoNextRef = useRef(goNext);
  const fGoToRef = useRef(goTo);
  const fStepBackRef = useRef(stepBack);
  const fStepForwardRef = useRef(stepForward);
  const fResetStepRef = useRef(resetStep);
  const fPostControlStateRef = useRef(postControlState);
  const fCurrentStepCountRef = useRef(currentStepCount);
  fGoPrevRef.current = goPrev;
  fGoNextRef.current = goNext;
  fGoToRef.current = goTo;
  fStepBackRef.current = stepBack;
  fStepForwardRef.current = stepForward;
  fResetStepRef.current = resetStep;
  fPostControlStateRef.current = postControlState;
  fCurrentStepCountRef.current = currentStepCount;
  const fLastCmdRef = useRef({ sig: "", ts: 0 });

  useEffect(() => {
    const channel = new BroadcastChannel(controlChannelId);
    stateChannelRef.current = channel;
    return () => {
      channel.close();
      stateChannelRef.current = null;
    };
  }, [controlChannelId]);

  /* ── Keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) {
        const nav =
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === " " ||
          e.key === "PageUp" ||
          e.key === "PageDown";
        if (nav) {
          e.preventDefault();
          return;
        }
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (
        e.key === "ArrowRight" ||
        e.key === " " ||
        e.key === "PageDown"
      ) {
        e.preventDefault();
        goNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(slideCount - 1);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, goTo, slideCount]);

  /* ── Hash sync ── */
  useEffect(() => {
    const onHash = () => {
      setSlideIndex(getIndexFromHash());
      setStepIndex(0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [getIndexFromHash]);

  /* ── Control-window sync ── */
  useEffect(() => {
    const channel = new BroadcastChannel(commandChannelId);
    commandChannelRef.current = channel;

    const handleCommand = (msg: ControlCommand) => {
      if (!msg) return;
      const now = Date.now();
      const sig = `${msg.type}:${(msg as ControlCommand & { action?: string }).action ?? ""}:${(msg as ControlCommand & { index?: number }).index ?? ""}:${(msg as ControlCommand & { targetDeckId?: string }).targetDeckId ?? ""}`;
      if (sig === fLastCmdRef.current.sig && now - fLastCmdRef.current.ts < 80)
        return;
      fLastCmdRef.current = { sig, ts: now };

      if (msg.type === "request-state") {
        if (msg.deckId !== deck.id) return;
        fPostControlStateRef.current();
        return;
      }
      if (msg.type !== "command") return;
      if (msg.action === "switch-deck") {
        if (msg.deckId !== deck.id || !msg.targetDeckId) return;
        window.location.hash = hashPrefix
          ? `${hashPrefix}/${msg.targetDeckId}/0`
          : `#/${msg.targetDeckId}/0`;
        return;
      }
      if (msg.deckId !== deck.id) return;
      if (msg.action === "prev") fGoPrevRef.current();
      else if (msg.action === "next") fGoNextRef.current();
      else if (msg.action === "goto") fGoToRef.current(msg.index);
      else if (msg.action === "step-prev") fStepBackRef.current();
      else if (msg.action === "step-next") fStepForwardRef.current();
      else if (msg.action === "step-reset") fResetStepRef.current();
      else if (msg.action === "step-goto") {
        if (typeof msg.index !== "number") return;
        setStepIndex(
          Math.max(0, Math.min(msg.index, fCurrentStepCountRef.current - 1)),
        );
      } else if (msg.action === "toggle-fullscreen") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    const onMessage = (ev: MessageEvent<ControlCommand>) => {
      handleCommand(ev.data);
    };
    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== commandStorageKey || !ev.newValue) return;
      try {
        handleCommand(JSON.parse(ev.newValue) as ControlCommand);
      } catch {
        /* ignore */
      }
    };

    channel.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      channel.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
      channel.close();
      commandChannelRef.current = null;
    };
  }, [commandStorageKey, commandChannelId, deck.id, hashPrefix]);

  useEffect(() => {
    postControlState();
  }, [postControlState]);

  useEffect(() => {
    setStepIndex(0);
  }, [deck.id, slideIndex]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ENGINE_CSS }} />
      <div className="pe-feed-root" ref={rootRef} aria-label={courseTitle}>
        <div className="pe-feed-frame">
          {/* ── Slide content area (fills the frame) ── */}
          <div className="pe-feed-slide-area">
            {showTitleStack ? (
              <ShortsTitleStack
                shortTitle={shortTitle}
                slideTitle={slideTitle}
              />
            ) : null}
            <div
              className={`pe-feed-slide-content${showTitleStack ? " with-title-stack" : ""}`}
            >
              <PresentationStepContext.Provider
                key={`${deck.id}:${currentSlide?.id ?? slideIndex}`}
                value={stepContextValue}
              >
                {currentSlide?.content}
              </PresentationStepContext.Provider>
            </div>

            {/* PIP inset — overlaid on the slide area */}
            <div className="pe-feed-pip" aria-label="Video capture area">
              <span className="pe-shorts-guide top" aria-hidden="true" />
              <span className="pe-shorts-guide right" aria-hidden="true" />
              <span className="pe-shorts-guide bottom" aria-hidden="true" />
              <span className="pe-shorts-guide left" aria-hidden="true" />
            </div>
          </div>

          {/* ── Footer bar (bottom of 4:5 frame) ── */}
          <div className="pe-feed-footer">
            <div className="pe-feed-footer-row subscribe">
              <span className="pe-feed-subscribe-icon">{Icons.bell}</span>
              <span className="pe-feed-subscribe-text">Subscribe to</span>
              <span className="pe-feed-subscribe-brand">
                {brandIconUrl ? (
                  <BrandLockup
                    iconUrl={brandIconUrl}
                    size="sm"
                    label={brandLabel}
                  />
                ) : (
                  <strong>{brandLabel}</strong>
                )}
              </span>
              <span className="pe-feed-subscribe-text">
                for more videos & tutorials
              </span>
            </div>
            <div className="pe-feed-footer-row socials">
              {youtubeUrl ? (
                <a
                  className="pe-footer-social-link"
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  {Icons.youtube}
                  <span className="pe-footer-social-text">{youtubeLabel}</span>
                </a>
              ) : null}
              {twitterUrl ? (
                <a
                  className="pe-footer-social-link"
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                >
                  {Icons.twitter}
                  <span className="pe-footer-social-text">{twitterLabel}</span>
                </a>
              ) : null}
              {linkedinUrl ? (
                <a
                  className="pe-footer-social-link"
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  {Icons.linkedin}
                  <span className="pe-footer-social-text">{linkedinLabel}</span>
                </a>
              ) : null}
            </div>
            <div className="pe-feed-footer-row">
              <span className="pe-feed-promo">
                <span className="pe-feed-promo-label">
                  Free interactive tutorials at
                </span>
                <span className="pe-feed-promo-site">{siteUrl}</span>
              </span>
            </div>
            <div className="pe-feed-footer-row">
              <span className="pe-footer-copy">{copyrightText}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface PresentationControlPanelProps {
  deck: PresentationDeck;
  decks: PresentationDeck[];
  onSelectDeck?: (deckId: string) => void;
  onOpenPresenter?: () => void;
  /** Open the 9:16 shorts view for the current deck */
  onOpenShorts?: () => void;
  /** Open the 4:5 feed view for the current deck */
  onOpenFeed?: () => void;
  branding?: PresentationBranding;
  controlChannelId?: string;
  /** Optional React node rendered above the "Jump Lesson" section in the sidebar */
  headerSlot?: React.ReactNode;
}

export function PresentationControlPanel({
  deck,
  decks,
  onSelectDeck,
  onOpenPresenter,
  onOpenShorts,
  onOpenFeed,
  branding,
  controlChannelId = DEFAULT_CONTROL_CHANNEL,
  headerSlot,
}: PresentationControlPanelProps) {
  const brandLogoSrc =
    branding?.logoSrc ?? "/brand/og-image-template-1200x630.png";
  const brandIconUrl = branding?.brandIconUrl;
  const brandLabel = branding?.brandLabel ?? "Tutorial";
  const channelRef = useRef<BroadcastChannel | null>(null);
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(controlChannelId, "command");
  const zoomStorageKey = getZoomStorageKey(controlChannelId, deck.id);
  const transcriptScaleStorageKey = `${controlChannelId}:transcript-scale`;
  /** True once a presenter/shorts/feed window has responded with state. */
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<ControlState>({
    type: "state",
    deckId: deck.id,
    deckTitle: deck.title,
    slideIndex: 0,
    slideCount: deck.slides.length,
    elapsed: 0,
    duration: deck.slides[0]?.duration,
    zoom: readStoredSlideZoom(zoomStorageKey),
    slideTitle: deck.slides[0]?.title,
    narration: deck.slides[0]?.narration,
    steps: deck.slides[0]?.steps,
    stepIndex: 0,
    stepCount: deck.slides[0]?.steps?.length ?? 0,
  });
  const [deckTypeFilter, setDeckTypeFilter] = useState<DeckType | "all">("all");
  const availableDeckTypes = useMemo(() => {
    const types = new Set(decks.map((d) => d.deckType ?? "course"));
    return Array.from(types) as DeckType[];
  }, [decks]);
  const showFilter = availableDeckTypes.length > 1;
  const filteredDecks =
    deckTypeFilter === "all"
      ? decks
      : decks.filter((d) => (d.deckType ?? "course") === deckTypeFilter);
  const [transcriptScaleIndex, setTranscriptScaleIndex] = useState<number>(
    () => {
      try {
        const cachedItem = localStorage.getItem(transcriptScaleStorageKey);
        if (cachedItem != null) {
          const cachedValue = Number(cachedItem);
          if (
            Number.isInteger(cachedValue) &&
            cachedValue >= 0 &&
            cachedValue < TRANSCRIPT_FONT_SCALE_STOPS.length
          ) {
            return cachedValue;
          }
        }
      } catch {
        // Ignore localStorage access issues.
      }
      return DEFAULT_TRANSCRIPT_FONT_SCALE_INDEX;
    },
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        transcriptScaleStorageKey,
        String(transcriptScaleIndex),
      );
    } catch {
      // Ignore localStorage access issues.
    }
  }, [transcriptScaleIndex, transcriptScaleStorageKey]);

  useEffect(() => {
    const channel = new BroadcastChannel(controlChannelId);
    channelRef.current = channel;

    const onMessage = (ev: MessageEvent<ControlState>) => {
      const msg = ev.data;
      if (!msg || msg.type !== "state" || msg.deckId !== deck.id) return;
      setConnected(true);
      setState(msg);
    };

    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== stateStorageKey || !ev.newValue) return;
      try {
        const msg = JSON.parse(ev.newValue) as ControlState;
        if (!msg || msg.type !== "state" || msg.deckId !== deck.id) return;
        setConnected(true);
        setState(msg);
      } catch {
        // Ignore malformed sync payloads.
      }
    };

    channel.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    channel.postMessage({ type: "request-state", deckId: deck.id });

    /* Periodically ping for state until a presenter window connects.
       This covers the case where the control panel sends request-state
       before the presenter popup has finished initialising. */
    const pingInterval = setInterval(() => {
      channel.postMessage({ type: "request-state", deckId: deck.id });
    }, 1500);

    const cachedState = localStorage.getItem(stateStorageKey);
    if (cachedState) {
      try {
        const msg = JSON.parse(cachedState) as ControlState;
        if (msg?.type === "state" && msg.deckId === deck.id) {
          setState(msg);
        }
      } catch {
        // Ignore malformed sync payloads.
      }
    }

    return () => {
      clearInterval(pingInterval);
      channel.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
      channel.close();
      channelRef.current = null;
    };
  }, [controlChannelId, deck.id, stateStorageKey]);

  const send = useCallback(
    (cmd: ControlCommand) => {
      channelRef.current?.postMessage(cmd);
      localStorage.setItem(commandStorageKey, JSON.stringify(cmd));
    },
    [commandStorageKey],
  );

  const handleSelectDeck = useCallback(
    (nextDeckId: string) => {
      if (!nextDeckId || nextDeckId === deck.id) return;
      send({
        type: "command",
        deckId: deck.id,
        action: "switch-deck",
        targetDeckId: nextDeckId,
      });
      onSelectDeck?.(nextDeckId);
    },
    [deck.id, onSelectDeck, send],
  );

  const atStart =
    state.slideIndex <= 0 && (state.stepCount === 0 || state.stepIndex <= 0);
  const atEnd =
    state.slideIndex >= state.slideCount - 1 &&
    (state.stepCount === 0 || state.stepIndex >= state.stepCount - 1);
  const timerOver =
    state.duration != null ? state.elapsed > state.duration : false;
  const transcriptFontScale =
    TRANSCRIPT_FONT_SCALE_STOPS[transcriptScaleIndex] ??
    TRANSCRIPT_FONT_SCALE_STOPS[DEFAULT_TRANSCRIPT_FONT_SCALE_INDEX];
  const transcriptFontScaleLabel = `${Math.round(transcriptFontScale * 100)}%`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ENGINE_CSS }} />
      <div className="pc-root">
        <div className="pc-header">
          <span className="pc-pill">Control</span>
          <div className="pc-title-wrap">
            <span className="pc-title">
              {deck.number}. {sanitizePresentationTitle(deck.title)}
            </span>
          </div>
          <span className="pc-header-separator" aria-hidden="true" />
          <div className="pc-meta">
            <span className="pc-meta-item">
              {state.slideIndex + 1}/{state.slideCount}
            </span>
            <span className="pc-meta-divider" aria-hidden="true" />
            <span
              className="pc-meta-item"
              style={{
                color: timerOver
                  ? "var(--tf-color-danger, #ef4444)"
                  : "var(--tf-text-muted, #8892a8)",
              }}
            >
              {formatTime(state.elapsed)}
              {state.duration != null ? ` / ${formatTime(state.duration)}` : ""}
            </span>
            <span className="pc-meta-divider" aria-hidden="true" />
            <span className="pc-meta-item">Zoom {state.zoom.toFixed(2)}x</span>
          </div>
          <div className="pc-header-spacer" />
          <span className="pc-header-separator" aria-hidden="true" />
          {brandIconUrl ? (
            <BrandLockup iconUrl={brandIconUrl} size="sm" label={brandLabel} />
          ) : (
            <img
              className="pc-header-logo"
              src={brandLogoSrc}
              alt={brandLabel}
            />
          )}
          {onOpenPresenter && (
            <>
              <span className="pc-header-separator" aria-hidden="true" />
              <button
                className="pc-btn pc-btn-header"
                onClick={onOpenPresenter}
              >
                ▶ 16:9
              </button>
            </>
          )}
          {onOpenShorts && deck.deckType === "short" && (
            <button className="pc-btn pc-btn-header" onClick={onOpenShorts}>
              📱 9:16
            </button>
          )}
          {onOpenFeed && deck.deckType === "short" && (
            <button className="pc-btn pc-btn-header" onClick={onOpenFeed}>
              📱 4:5
            </button>
          )}
          <span className="pc-header-separator" aria-hidden="true" />
          <button
            className="pc-btn pc-btn-header"
            onClick={() =>
              send({
                type: "command",
                deckId: deck.id,
                action: "toggle-fullscreen",
              })
            }
            disabled={!connected}
            title={
              connected
                ? "Toggle fullscreen on slide window"
                : "No slide window connected"
            }
          >
            ⛶ Fullscreen
          </button>
          <span
            className="pc-connection-dot"
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              marginLeft: 8,
              background: connected ? "#22c55e" : "#6b7280",
              boxShadow: connected ? "0 0 6px #22c55e88" : "none",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
            title={
              connected ? "Slide window connected" : "No slide window connected"
            }
            aria-label={connected ? "Connected" : "Disconnected"}
          />
        </div>

        <div className="pc-body">
          <aside className="pc-sidebar">
            <div className="pc-lessons">
              {headerSlot}
              {showFilter && (
                <>
                  <span className="pc-section-label">Deck Type</span>
                  <div className="pc-deck-type-row">
                    <button
                      className={`pc-deck-type-btn${deckTypeFilter === "all" ? " active" : ""}`}
                      onClick={() => setDeckTypeFilter("all")}
                    >
                      All
                    </button>
                    {availableDeckTypes.map((dt) => (
                      <button
                        key={dt}
                        className={`pc-deck-type-btn${deckTypeFilter === dt ? " active" : ""}`}
                        onClick={() => setDeckTypeFilter(dt)}
                      >
                        {dt === "short"
                          ? "📱 Short"
                          : dt === "mono"
                            ? "▶ Mono"
                            : "📚 Course"}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <span className="pc-section-label">Jump Lesson</span>
              <select
                className="pc-lesson-select"
                value={deck.id}
                onChange={(e) => handleSelectDeck(e.target.value)}
                aria-label="Jump to lesson"
              >
                {filteredDecks.map((lessonDeck) => {
                  const typeMarker =
                    lessonDeck.deckType === "short"
                      ? "📱 "
                      : lessonDeck.deckType === "mono"
                        ? "▶ "
                        : "";
                  return (
                    <option key={lessonDeck.id} value={lessonDeck.id}>
                      {lessonDeck.number}. {typeMarker}
                      {sanitizePresentationTitle(lessonDeck.title)}
                    </option>
                  );
                })}
              </select>

              <span className="pc-section-label" style={{ marginTop: 8 }}>
                Slide Zoom
              </span>
              <select
                className="pc-lesson-select"
                value={state.zoom.toFixed(2)}
                onChange={(e) => {
                  const nextZoom = parseFloat(e.target.value);
                  setState((current) => ({
                    ...current,
                    zoom: nextZoom,
                  }));
                  try {
                    localStorage.setItem(zoomStorageKey, String(nextZoom));
                  } catch {
                    // Ignore localStorage access issues.
                  }
                  send({
                    type: "command",
                    deckId: deck.id,
                    action: "set-zoom",
                    zoom: nextZoom,
                  });
                }}
                aria-label="Slide zoom"
              >
                <option value="1.00">1.00x</option>
                <option value="1.05">1.05x</option>
                <option value="1.08">1.08x</option>
                <option value="1.10">1.10x</option>
                <option value="1.12">1.12x</option>
                <option value="1.15">1.15x</option>
                <option value="1.20">1.20x</option>
                <option value="1.25">1.25x</option>
                <option value="1.30">1.30x</option>
              </select>
            </div>

            <div className="pc-controls">
              <button
                className="pc-btn"
                onClick={() =>
                  send({ type: "command", deckId: deck.id, action: "prev" })
                }
                disabled={!connected || atStart}
                title={!connected ? "No slide window connected" : undefined}
              >
                Previous
              </button>
              <button
                className="pc-btn"
                onClick={() =>
                  send({ type: "command", deckId: deck.id, action: "next" })
                }
                disabled={!connected || atEnd}
                title={!connected ? "No slide window connected" : undefined}
              >
                Next
              </button>
            </div>

            <div className="pc-jump">
              {deck.slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  className={`pc-jump-item ${idx === state.slideIndex ? "active" : ""}${!connected ? " disabled" : ""}`}
                  onClick={() => {
                    if (!connected) return;
                    send({
                      type: "command",
                      deckId: deck.id,
                      action: "goto",
                      index: idx,
                    });
                  }}
                  disabled={!connected}
                  title={!connected ? "No slide window connected" : slide.title}
                >
                  <span className="pc-jump-index">{idx + 1}</span>
                  <span className="pc-jump-title">
                    {renderSlideTitle(slide.title)}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section
            className="pc-transcript"
            style={
              {
                "--pc-transcript-font-scale": String(transcriptFontScale),
              } as React.CSSProperties
            }
          >
            {state.stepCount > 0 ? (
              <div className="pc-step-controls">
                <span className="pc-step-counter">
                  Step {Math.min(state.stepIndex + 1, state.stepCount)} /{" "}
                  {state.stepCount}
                </span>
                <div className="pc-step-actions">
                  <button
                    className="pc-step-btn"
                    onClick={() =>
                      send({
                        type: "command",
                        deckId: deck.id,
                        action: "step-goto",
                        index: Math.max(0, state.stepIndex - 1),
                      })
                    }
                    disabled={!connected || state.stepIndex <= 0}
                  >
                    Back
                  </button>
                  <button
                    className="pc-step-btn"
                    data-testid="presentation-step-next"
                    onClick={() =>
                      send({
                        type: "command",
                        deckId: deck.id,
                        action: "step-goto",
                        index: Math.min(
                          state.stepCount - 1,
                          state.stepIndex + 1,
                        ),
                      })
                    }
                    disabled={
                      !connected || state.stepIndex >= state.stepCount - 1
                    }
                  >
                    Step
                  </button>
                  <button
                    className="pc-step-btn"
                    onClick={() =>
                      send({
                        type: "command",
                        deckId: deck.id,
                        action: "step-reset",
                      })
                    }
                    disabled={!connected || state.stepIndex <= 0}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : null}
            <div className="pc-transcript-header">
              <span className="pc-transcript-header-title">
                {state.stepCount > 0 ? "Step Transcript" : "Transcript"}
              </span>
              <div className="pc-transcript-header-tools">
                <div className="pc-slider-row compact">
                  <label
                    className="pc-slider-label"
                    htmlFor="pc-transcript-size-slider"
                  >
                    Size
                  </label>
                  <input
                    id="pc-transcript-size-slider"
                    className="pc-slider"
                    type="range"
                    min="0"
                    max={String(TRANSCRIPT_FONT_SCALE_STOPS.length - 1)}
                    step="1"
                    value={String(transcriptScaleIndex)}
                    onChange={(e) =>
                      setTranscriptScaleIndex(
                        Number.parseInt(e.target.value, 10),
                      )
                    }
                    aria-label="Transcript size"
                  />
                  <span className="pc-slider-value">
                    {transcriptFontScaleLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="pc-transcript-body">
              {state.stepCount > 0 && state.steps?.length ? (
                <>
                  <div
                    className="pc-transcript-current"
                    key={
                      state.steps[state.stepIndex]?.id ??
                      `step-${state.stepIndex}`
                    }
                  >
                    <div className="pc-transcript-current-title">
                      <span className="pc-transcript-current-label">
                        Active Transcript
                      </span>
                      <span className="pc-transcript-current-step">
                        Step {Math.min(state.stepIndex + 1, state.stepCount)} /{" "}
                        {state.stepCount}
                      </span>
                    </div>
                    <div className="pc-transcript-current-heading">
                      {state.steps[state.stepIndex]?.title}
                    </div>
                    <div className="pc-transcript-current-text">
                      {state.steps[state.stepIndex]?.transcript}
                    </div>
                  </div>

                  <div className="pc-transcript-steps-header">
                    <span className="pc-transcript-steps-label">All Steps</span>
                    <span className="pc-transcript-steps-hint">
                      Click any step to jump
                    </span>
                  </div>

                  <div className="pc-transcript-steps">
                    {state.steps.map((step, index) => (
                      <button
                        key={step.id}
                        type="button"
                        className={`pc-transcript-step ${index === state.stepIndex ? "active" : ""} ${index < state.stepIndex ? "complete" : ""}`}
                        onClick={() =>
                          send({
                            type: "command",
                            deckId: deck.id,
                            action: "step-goto",
                            index,
                          })
                        }
                      >
                        <div className="pc-transcript-step-title">
                          <span className="pc-transcript-step-index">
                            Step {index + 1}
                          </span>
                          <span className="pc-transcript-step-label">
                            {step.title}
                          </span>
                        </div>
                        <div className="pc-transcript-step-text">
                          {step.transcript}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : state.narration ? (
                <div className="pc-transcript-text">{state.narration}</div>
              ) : (
                <div className="pc-transcript-empty">
                  No transcript for this slide.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
