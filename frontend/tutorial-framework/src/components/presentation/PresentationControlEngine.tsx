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
  useLayoutEffect,
  useCallback,
  useRef,
  useMemo,
  useId,
} from "react";
import { ShortsTitleStack } from "./ShortsTitleStack";
import { TeleprompterOverlay } from "./TeleprompterOverlay";
import {
  DEFAULT_TRANSCRIPT_LANGUAGE,
  formatStepTranscriptEditValue,
  looksLikeStepTranscriptEditValue,
  parseStoredTranscriptEditRecord,
  parseStepTranscriptEditValue,
  resolveTranscriptContent,
  resolveSlideNarration,
  resolveStepsForLanguage,
  resolveTranscriptEditForLanguage,
  summarizeStepTranscript,
  type TranscriptEditRecord,
  type TranscriptLanguageCode,
  type TranscriptLanguageMap,
  writeTranscriptEditForLanguage,
} from "./transcript-utils";

export interface PresentationSlide {
  id: string;
  title: string;
  presenterTitle?: string;
  duration?: number;
  narration?: string;
  narrationByLanguage?: TranscriptLanguageMap;
  steps?: PresentationStep[];
  content: React.ReactNode;
  /** When true, suppresses the ShortsTitleStack header bar for this slide in ShortsLayout/FeedLayout. */
  hideTitleStack?: boolean;
}

export interface PresentationStep {
  id: string;
  title: string;
  transcript: string;
  transcriptByLanguage?: TranscriptLanguageMap;
}

export type DeckType = "course" | "mono" | "short" | "short-single";

const BLANK_TOOLKIT_DECK_ID = "default-blank";

/** Returns true for any short-family deck type ("short" or "short-single"). */
export function isShortDeck(dt?: DeckType): boolean {
  return dt === "short" || dt === "short-single";
}

/**
 * Returns true for decks that can open the dedicated 9:16 portrait capture window.
 *
 * Most decks use `deckType` to drive this. The blank toolkit is a built-in
 * capture utility, so it stays a `mono` deck for navigation but still exposes
 * the portrait surface.
 */
export function supportsShortsCapture(deck: {
  id: string;
  deckType?: DeckType;
}): boolean {
  return isShortDeck(deck.deckType) || deck.id === BLANK_TOOLKIT_DECK_ID;
}

/** Returns true for deck types that support the 4:5 feed view (shorts + mono). */
export function isFeedCapable(dt?: DeckType): boolean {
  return dt === "short" || dt === "short-single" || dt === "mono";
}

export interface PresentationDeck {
  id: string;
  number: string;
  title: string;
  deckType?: DeckType;
  /** One-line learning objective shown in 16:9 PIP title area */
  objective?: string;
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
  twitterLabel?: string;
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

function getPresenterSlideTitle(
  slide: PresentationSlide | undefined,
): string | undefined {
  return slide?.presenterTitle ?? slide?.title;
}

function getCaptureFooterHandle(branding?: PresentationBranding): string {
  const handle = branding?.twitterHandle?.trim();
  return handle || "@localm_tuts";
}

function getCaptureFooterLabel(
  deck: PresentationDeck,
  surface: "shorts" | "feed",
): string {
  if (deck.id === BLANK_TOOLKIT_DECK_ID && surface === "feed") {
    return "Subscribe for more slide tools";
  }

  return "Subscribe";
}

function getBlankSlideTitleState(slideIndex: number): {
  title: string;
  subtitle: string;
} {
  try {
    return {
      title: localStorage.getItem(`blank-slide:${slideIndex}:title`) ?? "",
      subtitle:
        localStorage.getItem(`blank-slide:${slideIndex}:subtitle`) ?? "",
    };
  } catch {
    return { title: "", subtitle: "" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  CSS                                                                   */
/* ═══════════════════════════════════════════════════════════════════════ */

export const PRESENTATION_ENGINE_CSS = `
  /* ── Reset ─────────────────────────── */
  .pe-root,
  .pc-root {
    --pe-slide-stage-ratio: 1.4;
    --pe-standard-stage-height: calc(100vh - 134px);
    --pe-shell-bg: var(--tf-bg-backdrop, var(--tf-gradient-stage, linear-gradient(135deg, var(--tf-bg-base, #0b0d12) 0%, var(--tf-bg-surface, #111318) 46%, var(--tf-bg-overlay, #1f222a) 100%)));
    --pe-shell-panel-bg: var(--tf-glass-highlight, none), var(--tf-glass-bg, linear-gradient(180deg, var(--tf-surface-panel-bg, #111318) 0%, var(--tf-surface-control-bg, #1f222a) 100%));
    --pe-shell-panel-border: var(--tf-glass-border, var(--tf-surface-panel-border, rgba(202,211,230,0.14)));
    --pe-shell-panel-shadow: var(--tf-shadow-level3, 0 10px 28px rgba(0,0,0,0.32)), var(--tf-glow-primary, none);
    --pe-panel-inset-highlight: inset 0 1px 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 5%, transparent);
    --pe-shell-muted: var(--tf-text-secondary, #bfc5d4);
    --pe-shell-note: var(--tf-text-muted, #8892a8);
    --pe-prompt-overlay-bg: var(--tf-gradient-overlay, rgba(6, 8, 14, 0.64));
    --pe-prompt-card-bg: linear-gradient(180deg, var(--tf-surface-control-bg, #1b1f2c) 0%, var(--tf-surface-panel-bg, #0e1019) 100%);
    --pe-prompt-card-accent: linear-gradient(135deg, var(--tf-state-info-bg, rgba(0,245,255,0.14)) 0%, var(--tf-state-emphasis-bg, rgba(168,56,255,0.16)) 100%);
    --pe-prompt-card-border: var(--tf-state-info-border, rgba(0,245,255,0.28));
    --pe-prompt-card-shadow: var(--pe-panel-inset-highlight), var(--tf-shadow-level4, 0 22px 56px rgba(0,0,0,0.34)), var(--tf-glow-primary, none);
    --pe-prompt-btn-border: var(--tf-state-info-border, rgba(0,245,255,0.38));
    --pe-prompt-btn-bg: linear-gradient(135deg, var(--tf-state-info-bg, rgba(0,245,255,0.22)) 0%, var(--tf-state-emphasis-bg, rgba(168,56,255,0.22)) 100%);
    --pe-prompt-btn-text: var(--tf-text-primary, #ffffff);
    --pe-header-nav-current-shadow: var(--pe-panel-inset-highlight), var(--tf-shadow-level2, 0 8px 18px rgba(0,0,0,0.22));
    --pe-pip-header-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-surface-control-bg, #1b1f2c), color-mix(in srgb, var(--tf-surface-stage-bg, #0b0d12) 72%, var(--tf-surface-panel-bg, #111318) 28%));
    --pe-pip-panel-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 84%, var(--tf-surface-stage-bg, #0b0d12) 16%), color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 88%, var(--tf-surface-stage-bg, #0b0d12) 12%));
    --pe-pip-panel-border: var(--tf-surface-panel-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 10%, transparent));
    --pe-pip-chip-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 78%, var(--tf-surface-stage-bg, #0b0d12) 22%), color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 82%, var(--tf-surface-stage-bg, #0b0d12) 18%));
    --pe-pip-chip-border: var(--tf-surface-panel-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 14%, transparent));
    --pe-pip-chip-shadow: var(--pe-panel-inset-highlight), var(--tf-shadow-level1, 0 4px 12px rgba(0,0,0,0.16));
    --pe-pip-objective-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 82%, var(--tf-color-secondary, #14b8a6) 18%), color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 84%, var(--tf-color-primary, #6366f1) 16%));
    --pe-pip-objective-border: var(--tf-state-success-border, color-mix(in srgb, var(--tf-color-secondary, #14b8a6) 26%, transparent));
    --pe-pip-objective-pill-bg: var(--tf-state-success-bg, color-mix(in srgb, var(--tf-color-secondary, #14b8a6) 14%, transparent));
    --pe-pip-inset-bg: radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--tf-color-primary-light, #818cf8) 22%, transparent) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, color-mix(in srgb, var(--tf-color-accent, #f59e0b) 16%, transparent) 0%, transparent 60%), linear-gradient(135deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 68%, var(--tf-color-primary, #6366f1) 32%) 0%, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 62%, var(--tf-color-secondary, #14b8a6) 38%) 50%, color-mix(in srgb, var(--tf-surface-stage-bg, #0b0d12) 72%, var(--tf-color-accent, #f59e0b) 28%) 100%);
    --pe-pip-footer-bg: var(--pe-footer-accent), var(--pe-footer-bg);
    --pe-drawer-scrim: color-mix(in srgb, var(--tf-surface-stage-bg, var(--tf-bg-base, #0b0d12)) 64%, transparent);
    --pe-footer-bg: linear-gradient(180deg, var(--tf-surface-control-bg, #1b1f2c) 0%, var(--tf-surface-stage-bg, #0b0d12) 100%);
    --pe-footer-accent: radial-gradient(ellipse 70% 100% at 50% 100%, var(--tf-state-recommendation-bg, rgba(99,102,241,0.14)), transparent 70%);
    --pe-footer-border: var(--tf-surface-panel-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 16%, transparent));
    --pc-panel-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 90%, var(--tf-surface-stage-bg, #0b0d12) 10%) 0%, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 82%, var(--tf-surface-stage-bg, #0b0d12) 18%) 100%);
    --pc-panel-border: var(--tf-glass-border, var(--tf-surface-panel-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 16%, transparent)));
    --pc-panel-shadow: var(--pe-panel-inset-highlight), var(--tf-shadow-level3, 0 10px 28px rgba(0,0,0,0.32)), var(--tf-glow-primary, none);
    --pc-section-bg: linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 92%, var(--tf-surface-stage-bg, #0b0d12) 8%) 0%, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 88%, var(--tf-surface-stage-bg, #0b0d12) 12%) 100%);
    --pc-sidebar-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-bg-base, #0b0d12) 0%, var(--tf-bg-surface, #111318) 100%);
    --pc-sidebar-border: color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 18%, transparent);
    --pc-sidebar-section-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-bg-elevated, #191c23) 0%, var(--tf-bg-overlay, #1f222a) 100%);
    --pc-sidebar-section-border: var(--tf-glass-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 36%, transparent));
    --pc-sidebar-section-shadow: var(--pe-panel-inset-highlight), 0 20px 36px rgba(0,0,0,0.26);
    --pc-sidebar-control-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-bg-overlay, #1f222a) 0%, var(--tf-bg-elevated, #191c23) 100%);
    --pc-sidebar-control-border: var(--tf-glass-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 40%, transparent));
    --pc-sidebar-control-shadow: var(--pe-panel-inset-highlight), 0 12px 24px rgba(0,0,0,0.24);
    --pc-dialog-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 94%, var(--tf-surface-stage-bg, #0b0d12) 6%) 0%, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 86%, var(--tf-surface-stage-bg, #0b0d12) 14%) 100%);
    --pc-dialog-border: var(--tf-glass-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 18%, transparent));
    --pc-dialog-shadow: var(--pe-panel-inset-highlight), var(--tf-shadow-level4, 0 22px 56px rgba(0,0,0,0.34)), var(--tf-glow-primary, none);
    --pc-dialog-section-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 88%, var(--tf-surface-stage-bg, #0b0d12) 12%) 0%, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 82%, var(--tf-surface-stage-bg, #0b0d12) 18%) 100%);
    --pc-dialog-section-border: var(--tf-glass-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 15%, transparent));
    --pc-dialog-section-shadow: var(--pe-panel-inset-highlight), var(--tf-shadow-level2, 0 8px 18px rgba(0,0,0,0.22));
    --pc-transcript-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 94%, var(--tf-surface-stage-bg, #0b0d12) 6%) 0%, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 86%, var(--tf-surface-stage-bg, #0b0d12) 14%) 100%);
    --pc-transcript-shell-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-bg-surface, #111318) 0%, var(--tf-bg-elevated, #191c23) 100%);
    --pc-transcript-shell-border: color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 22%, transparent);
    --pc-transcript-header-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-bg-overlay, #1f222a) 0%, var(--tf-bg-elevated, #191c23) 100%);
    --pc-placeholder-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-overlay-bg, #1f222a) 92%, var(--tf-surface-stage-bg, #0b0d12) 8%) 0%, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 84%, var(--tf-surface-stage-bg, #0b0d12) 16%) 100%);
    --pc-placeholder-border: var(--tf-surface-overlay-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 14%, transparent));
    --pc-action-surface-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 90%, var(--tf-surface-stage-bg, #0b0d12) 10%) 0%, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 84%, var(--tf-surface-stage-bg, #0b0d12) 16%) 100%);
    --pc-action-surface-border: var(--tf-glass-border, var(--tf-surface-card-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 18%, transparent)));
    --pc-action-surface-shadow: var(--pe-panel-inset-highlight), var(--tf-shadow-level1, 0 4px 12px rgba(0,0,0,0.16));
    --pc-action-surface-hover-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 72%, var(--tf-state-recommendation-bg, rgba(99,102,241,0.14)) 28%) 0%, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 78%, var(--tf-state-info-bg, rgba(0,245,255,0.12)) 22%) 100%);
    --pc-action-surface-hover-border: var(--tf-state-recommendation-border, color-mix(in srgb, var(--tf-color-primary-light, #818cf8) 40%, transparent));
    --pc-action-surface-hover-text: var(--tf-text-primary, #ffffff);
    --pc-rail-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-bg-overlay, #1f222a) 0%, var(--tf-bg-elevated, #191c23) 100%);
    --pc-rail-chip-bg: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-bg-elevated, #191c23) 0%, var(--tf-bg-overlay, #1f222a) 100%);
    --pc-rail-chip-border: var(--tf-glass-border, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 44%, transparent));
    --pc-rail-chip-shadow: var(--pe-panel-inset-highlight), 0 14px 28px rgba(0,0,0,0.24);
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: var(--pe-shell-bg);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--tf-text-primary, #e2e6f0);
  }

  /* ── Header ────────────────────────── */
  .pe-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    padding: 0 24px;
    height: 36px;
    min-height: 36px;
    background: var(--pe-shell-panel-bg);
    border-bottom: 1px solid var(--pe-shell-panel-border);
    gap: 14px;
    flex-shrink: 0;
    z-index: 20;
    backdrop-filter: blur(18px) saturate(150%);
    box-shadow: var(--pe-shell-panel-shadow);
  }
  .pe-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    justify-self: start;
  }
  .pe-header-center {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    justify-self: center;
  }
  .pe-fullscreen-prompt {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: var(--pe-prompt-overlay-bg);
    backdrop-filter: blur(8px);
    z-index: 60;
  }
  .pe-fullscreen-prompt-card {
    width: min(420px, calc(100vw - 40px));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 22px 24px;
    border-radius: 18px;
    border: 1px solid var(--pe-prompt-card-border);
    background: var(--tf-glass-highlight, none), var(--pe-prompt-card-bg), var(--pe-prompt-card-accent);
    box-shadow: var(--pe-prompt-card-shadow);
    text-align: center;
  }
  .pe-fullscreen-prompt-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pe-fullscreen-prompt-copy {
    font-size: 14px;
    line-height: 1.5;
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pe-fullscreen-prompt-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 210px;
    height: 42px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid var(--pe-prompt-btn-border);
    background: var(--pe-prompt-btn-bg);
    color: var(--pe-prompt-btn-text);
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .pe-fullscreen-prompt-btn:hover {
    filter: brightness(1.08);
  }
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
  .pe-header-slide-title {
    font-size: clamp(22px, 3vw, 36px);
    font-weight: 800;
    color: var(--tf-text-primary, #e2e6f0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    letter-spacing: -0.02em;
    line-height: 1.15;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pe-header-nav {
    width: 100%;
    display: grid;
    grid-template-columns: 34px minmax(180px, 220px) minmax(280px, 340px) minmax(180px, 220px) 34px;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 5px 6px;
    border: 1px solid var(--pe-shell-panel-border);
    border-radius: 14px;
    background: var(--pe-shell-panel-bg);
    backdrop-filter: blur(18px) saturate(145%);
    box-shadow: var(--pe-panel-inset-highlight);
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
    background: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-surface-control-bg, #1b1f2c), var(--tf-surface-panel-bg, #0e1019)), linear-gradient(135deg, var(--tf-state-info-bg, rgba(0,245,255,0.10)), var(--tf-state-emphasis-bg, rgba(168,56,255,0.12)));
    border-radius: 11px;
    border: 1px solid var(--tf-surface-panel-border, rgba(202,211,230,0.14));
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: var(--pe-header-nav-current-shadow);
  }
  .pe-title-capsule {
    display: inline-flex;
    align-items: center;
    padding: 1px 8px;
    border-radius: 9999px;
    background: linear-gradient(135deg, var(--tf-state-info-accent, var(--tf-color-secondary, #14b8a6)), var(--tf-color-secondary-light, #2dd4bf));
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
    background: var(--tf-bg-base, #0b0d12);
    padding: 8px;
  }
  .pe-slide-box {
    position: relative;
    width: calc(var(--pe-standard-stage-height) * var(--pe-slide-stage-ratio));
    height: var(--pe-standard-stage-height);
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 7 / 5;
    overflow: hidden;
    border-radius: 0;
    background: var(--tf-bg-base, #0b0d12);
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    zoom: 1.05;
  }
  .pe-slide-stage {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    --pe-slide-enlarge: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .pe-slide-stage .lm-slide-title {
    display: none;
  }
  /* Force block content to fill its layout cell */
  .lo-block > * {
    flex: 1 1 0;
    min-height: 0;
    overflow: hidden;
  }
  .pe-viewport-guide-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
  }

  .pe-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 34px;
    border-radius: 10px;
    background: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-surface-control-bg, #1f222a), var(--tf-surface-panel-bg, #111318));
    border: 1px solid var(--tf-surface-panel-border, rgba(202,211,230,0.14));
    color: var(--pe-shell-muted);
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
    background: var(--pe-drawer-scrim);
    backdrop-filter: blur(2px);
  }

  .pe-drawer-panel {
    position: relative;
    width: 280px;
    min-width: 280px;
    background: var(--tf-glass-highlight, none), linear-gradient(180deg, var(--tf-surface-panel-bg, #111318) 0%, var(--tf-surface-control-bg, #1f222a) 100%);
    border-right: 1px solid var(--tf-surface-panel-border, rgba(202,211,230,0.14));
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 36px 28px;
    min-height: 160px;
    background: var(--pe-footer-accent), var(--pe-footer-bg);
    border-top: 1px solid var(--pe-footer-border);
    flex-shrink: 0;
    z-index: 20;
    gap: 10px;
  }
  .pe-footer-row1 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .pe-footer-row1 svg {
    width: clamp(24px, 2.8vw, 36px);
    height: clamp(24px, 2.8vw, 36px);
    flex-shrink: 0;
  }
  .pe-footer-subscribe-label {
    font-size: clamp(22px, 2.6vw, 34px);
    font-weight: 800;
    color: var(--tf-text-primary, #e2e6f0);
    letter-spacing: -0.02em;
  }
  .pe-footer-brand-wrap {
    display: inline-flex;
    align-items: center;
  }
  .pe-footer-row3 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 4px;
  }
  .pe-footer-row3-text {
    font-size: clamp(16px, 1.8vw, 24px);
    font-weight: 500;
    color: var(--tf-text-muted, #8892a8);
  }
  .pe-footer-x-icon {
    display: inline-flex;
    align-items: center;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-footer-x-icon svg {
    width: 22px;
    height: 22px;
  }
  .pe-footer-handle {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(15px, 1.6vw, 20px);
    font-weight: 700;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-footer-x-capsule {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 16px;
    border-radius: 999px;
    border: 1px solid var(--tf-state-neutral-border, rgba(167,180,200,0.30));
    background: var(--tf-state-neutral-bg, rgba(167,180,200,0.14));
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 6%, transparent);
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(15px, 1.6vw, 22px);
    font-weight: 700;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-footer-x-capsule-icon {
    display: none;
  }
  .pe-footer-qr-row {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 32px;
    margin-top: 8px;
  }
  .pe-footer-qr-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .pe-footer-qr-item img {
    width: clamp(88px, 10vw, 130px);
    height: clamp(88px, 10vw, 130px);
    border-radius: 8px;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
  }
  .pe-footer-qr-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(9px, 1vw, 12px);
    max-width: clamp(88px, 10vw, 130px);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    color: var(--tf-text-muted, #8892a8);
    letter-spacing: 0.02em;
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
    0%, 100% {
      filter: drop-shadow(0 0 2px color-mix(in srgb, var(--tf-state-recommendation-accent, #6366f1) 0%, transparent));
    }
    50% {
      filter:
        drop-shadow(0 0 8px color-mix(in srgb, var(--tf-state-recommendation-accent, #6366f1) 45%, transparent))
        drop-shadow(0 0 20px color-mix(in srgb, var(--tf-state-recommendation-icon, #818cf8) 20%, transparent));
    }
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

  .pe-fullscreen-prompt {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(6, 8, 14, 0.64);
    backdrop-filter: blur(8px);
    z-index: 60;
  }
  .pe-fullscreen-prompt-card {
    width: min(420px, calc(100vw - 40px));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 22px 24px;
    border-radius: 18px;
    border: 1px solid var(--pe-prompt-card-border);
    background: var(--tf-glass-highlight, none), var(--pe-prompt-card-bg), var(--pe-prompt-card-accent);
    box-shadow: var(--pe-prompt-card-shadow);
    text-align: center;
  }
  .pe-fullscreen-prompt-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pe-fullscreen-prompt-copy {
    font-size: 14px;
    line-height: 1.5;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-fullscreen-prompt-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 210px;
    height: 42px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid var(--pe-prompt-btn-border);
    background: var(--pe-prompt-btn-bg);
    color: var(--pe-prompt-btn-text);
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .pe-fullscreen-prompt-btn:hover {
    filter: brightness(1.08);
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
    position: relative;
    isolation: isolate;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(circle at 12% 12%, color-mix(in srgb, var(--tf-color-primary-light, #818cf8) 18%, transparent) 0%, transparent 28%),
      radial-gradient(circle at 86% 16%, color-mix(in srgb, var(--tf-color-secondary, #14b8a6) 14%, transparent) 0%, transparent 24%),
      radial-gradient(circle at 78% 84%, color-mix(in srgb, var(--tf-color-accent, #f59e0b) 14%, transparent) 0%, transparent 26%),
      linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-stage-bg, #0b0d12) 88%, #05070d 12%) 0%, color-mix(in srgb, var(--tf-surface-stage-bg, #0b0d12) 72%, var(--tf-surface-panel-bg, #111318) 28%) 100%);
    color: var(--tf-text-primary, #e2e6f0);
    font-family: 'Inter', system-ui, sans-serif;
  }
  .pc-root::before,
  .pc-root::after {
    content: "";
    position: absolute;
    inset: auto;
    pointer-events: none;
    z-index: -1;
    filter: blur(44px);
    opacity: 0.5;
  }
  .pc-root::before {
    width: 26vw;
    height: 26vw;
    top: -8vw;
    left: -6vw;
    background: color-mix(in srgb, var(--tf-color-primary-light, #818cf8) 26%, transparent);
  }
  .pc-root::after {
    width: 24vw;
    height: 24vw;
    right: -6vw;
    bottom: -8vw;
    background: color-mix(in srgb, var(--tf-color-secondary, #14b8a6) 18%, transparent);
  }
  .pc-body {
    position: relative;
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 368px 1fr;
    gap: 20px;
    padding: 20px;
  }
  .pc-body::before {
    content: "";
    position: absolute;
    top: 24px;
    bottom: 24px;
    left: calc(368px + 10px);
    width: 1px;
    background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 18%, transparent) 18%, color-mix(in srgb, var(--tf-color-primary-light, #818cf8) 28%, transparent) 50%, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 18%, transparent) 82%, transparent 100%);
    opacity: 0.75;
  }
  .pc-sidebar {
    border: 1px solid var(--pc-sidebar-border);
    border-radius: 30px;
    background: var(--pc-sidebar-bg);
    box-shadow: var(--pc-panel-shadow);
    backdrop-filter: blur(24px) saturate(155%);
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 16px 16px 16px;
    gap: 16px;
    overflow: hidden;
    position: relative;
  }
  .pc-sidebar::before,
  .pc-transcript::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: linear-gradient(180deg, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 8%, transparent) 0%, transparent 18%, transparent 82%, color-mix(in srgb, var(--tf-color-primary-light, #818cf8) 10%, transparent) 100%);
    opacity: 0.7;
  }
  .pc-camera-preview {
    padding: 14px;
    border: 1px solid var(--pc-sidebar-section-border);
    border-radius: 22px;
    background: var(--pc-sidebar-section-bg);
    box-shadow: var(--pc-sidebar-section-shadow);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
  }
  .pc-camera-video {
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 10px;
    background: var(--tf-bg-base, #0b0d12);
    object-fit: contain;
  }
  .pc-camera-placeholder {
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 10px;
    background: var(--pc-placeholder-bg);
    border: 1px dashed var(--pc-placeholder-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--tf-text-muted, #8892a8);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .pc-camera-placeholder svg {
    width: 24px;
    height: 24px;
    opacity: 0.4;
  }
  .pc-controls {
    padding: 16px;
    border: 1px solid var(--pc-sidebar-section-border);
    border-radius: 22px;
    background: var(--pc-sidebar-section-bg);
    box-shadow: var(--pc-sidebar-section-shadow);
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .pc-lessons {
    padding: 16px;
    border: 1px solid var(--pc-sidebar-section-border);
    border-radius: 22px;
    background: var(--pc-sidebar-section-bg);
    box-shadow: var(--pc-sidebar-section-shadow);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .pc-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-secondary, #bfc5d4);
    padding: 0 2px;
  }
  .pc-sidebar-control-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid var(--pc-sidebar-control-border);
    background: var(--pc-sidebar-control-bg);
    box-shadow: var(--pc-sidebar-control-shadow);
  }
  .pc-sidebar-control-group .pc-section-label {
    padding: 0;
  }
  .pc-menu-select {
    position: relative;
    width: 100%;
  }
  .pc-menu-trigger {
    width: 100%;
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 16px;
    border: 1px solid var(--pc-sidebar-control-border);
    background: linear-gradient(180deg, color-mix(in srgb, var(--tf-bg-overlay, #1f222a) 78%, transparent) 0%, color-mix(in srgb, var(--tf-bg-elevated, #191c23) 88%, transparent) 100%);
    box-shadow: var(--pc-sidebar-control-shadow);
    color: var(--tf-text-primary, #e2e6f0);
    cursor: pointer;
    text-align: left;
    transition: transform 150ms ease, border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
    backdrop-filter: blur(18px) saturate(150%);
  }
  .pc-menu-trigger:hover,
  .pc-menu-trigger:focus-visible,
  .pc-menu-select.open .pc-menu-trigger {
    border-color: var(--pc-action-surface-hover-border);
    background: var(--pc-action-surface-hover-bg);
    box-shadow: var(--pc-action-surface-shadow);
    transform: translateY(-1px);
    outline: none;
  }
  .pc-menu-trigger:disabled {
    opacity: 0.45;
    cursor: default;
    transform: none;
  }
  .pc-menu-trigger-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pc-menu-trigger-value {
    min-width: 0;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--tf-text-primary, #e2e6f0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pc-menu-trigger-meta {
    font-size: 10px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-menu-trigger-icon,
  .pc-menu-option-check {
    font-family: 'Material Symbols Outlined';
    font-size: 18px;
    line-height: 1;
    font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
  }
  .pc-menu-trigger-icon {
    color: var(--tf-text-muted, #8892a8);
    transition: transform 150ms ease, color 150ms ease;
  }
  .pc-menu-select.open .pc-menu-trigger-icon {
    color: var(--tf-text-primary, #e2e6f0);
    transform: rotate(180deg);
  }
  .pc-menu-panel {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    right: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    max-height: 280px;
    overflow-y: auto;
    border-radius: 20px;
    border: 1px solid var(--pc-panel-border, rgba(255, 255, 255, 0.12));
    background-color: #14171f;
    background-image: linear-gradient(180deg, color-mix(in srgb, var(--tf-bg-elevated, #191c23) 96%, transparent) 0%, color-mix(in srgb, var(--tf-bg-overlay, #1f222a) 96%, transparent) 100%);
    box-shadow: var(--pc-dialog-shadow, 0 24px 48px rgba(0, 0, 0, 0.45));
    backdrop-filter: blur(26px) saturate(165%);
  }
  .pc-menu-panel::-webkit-scrollbar {
    width: 6px;
  }
  .pc-menu-panel::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 16%, transparent);
    border-radius: 999px;
  }
  .pc-menu-option {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 11px 12px;
    border: 1px solid transparent;
    border-radius: 14px;
    background: transparent;
    color: var(--tf-text-secondary, #bfc5d4);
    cursor: pointer;
    text-align: left;
    transition: border-color 140ms ease, background 140ms ease, color 140ms ease, transform 140ms ease;
  }
  .pc-menu-option:hover,
  .pc-menu-option:focus-visible,
  .pc-menu-option.active {
    border-color: var(--pc-action-surface-hover-border);
    background: var(--pc-action-surface-hover-bg);
    color: var(--tf-text-primary, #e2e6f0);
    outline: none;
    transform: translateX(1px);
  }
  .pc-menu-option-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pc-menu-option-label {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.25;
  }
  .pc-menu-option-meta {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-menu-option-check {
    color: var(--tf-color-secondary, #14b8a6);
  }
  .pc-menu-select-compact .pc-menu-trigger {
    min-height: 36px;
    padding: 8px 12px;
    border-radius: 14px;
  }
  .pc-menu-select-compact .pc-menu-trigger-value {
    font-size: 12px;
  }
  .pc-menu-select-transcript {
    min-width: 148px;
  }
  .pc-menu-select-transcript .pc-menu-panel {
    left: auto;
    min-width: 176px;
  }
  .pc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    border-radius: 14px;
    border: 1px solid var(--pc-action-surface-border);
    background: var(--pc-action-surface-bg);
    color: var(--tf-text-primary, #e2e6f0);
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    transition: transform 150ms ease, border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
    padding: 0 15px;
    box-shadow: var(--pc-action-surface-shadow);
    backdrop-filter: blur(18px) saturate(150%);
  }
  .pc-btn:hover:not(:disabled) {
    color: var(--pc-action-surface-hover-text);
    border-color: var(--pc-action-surface-hover-border);
    background: var(--pc-action-surface-hover-bg);
    transform: translateY(-1px);
  }
  .pc-btn-header {
    height: 34px;
    background: var(--pc-sidebar-control-bg);
    border-color: var(--pc-sidebar-control-border);
    box-shadow: var(--pc-sidebar-control-shadow);
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .pc-btn-header.pc-btn-icon {
    width: 34px;
    min-width: 34px;
    padding: 0;
  }
  .pc-btn-header.pc-btn-ratio {
    gap: 8px;
    padding: 0 12px;
  }
  .pc-btn-header.pc-btn-ratio .pc-btn-label {
    line-height: 1;
  }
  .pc-btn-header.active {
    background: var(--pc-action-surface-hover-bg);
    color: var(--tf-text-primary);
    border-color: var(--pc-action-surface-hover-border);
    box-shadow: var(--pc-action-surface-shadow);
  }
  .pc-field-input {
    width: 100%;
    height: 40px;
    border-radius: 14px;
    border: 1px solid var(--pc-sidebar-control-border);
    background: var(--pc-sidebar-control-bg);
    color: var(--tf-text-primary, #e2e6f0);
    font-size: 14px;
    padding: 0 12px;
    outline: none;
    transition: all 150ms;
    box-shadow: var(--pc-sidebar-control-shadow);
    backdrop-filter: blur(18px) saturate(150%);
  }
  .pc-field-input:hover,
  .pc-field-input:focus-visible {
    border-color: var(--pc-action-surface-hover-border);
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
    padding: 14px;
    border: 1px solid var(--pc-sidebar-section-border);
    border-radius: 22px;
    background: var(--pc-sidebar-section-bg);
    box-shadow: var(--pc-sidebar-section-shadow);
    overflow-y: auto;
  }
  .pc-jump::-webkit-scrollbar { width: 4px; }
  .pc-jump::-webkit-scrollbar-thumb {
    background: var(--tf-border-default, rgba(202,211,230,0.14));
    border-radius: 999px;
  }
  .pc-jump-item {
    width: 100%;
    text-align: left;
    margin-bottom: 8px;
    border-radius: 16px;
    border: 1px solid var(--pc-action-surface-border);
    background: var(--pc-sidebar-control-bg);
    color: var(--tf-text-secondary, #bfc5d4);
    padding: 12px 14px;
    cursor: grab;
    display: flex;
    align-items: baseline;
    gap: 12px;
    box-shadow: var(--pc-sidebar-control-shadow);
    backdrop-filter: blur(18px) saturate(150%);
    transition: transform 140ms ease, border-color 140ms ease, background 140ms ease, box-shadow 140ms ease;
  }
  .pc-jump-item.dragging {
    opacity: 0.55;
    cursor: grabbing;
  }
  .pc-jump-item.drop-target {
    border-color: var(--pc-action-surface-hover-border);
    box-shadow: var(--pc-action-surface-shadow);
  }
  .pc-jump-item:hover {
    background: var(--pc-action-surface-hover-bg);
    transform: translateX(2px);
  }
  .pc-jump-item.active {
    background: var(--pc-action-surface-hover-bg);
    border-color: var(--pc-action-surface-hover-border);
    color: var(--tf-text-primary, #e2e6f0);
    box-shadow: var(--pc-action-surface-shadow);
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
  .pc-jump-handle {
    font-family: 'Material Symbols Outlined';
    font-size: 16px;
    color: var(--tf-text-muted, #8892a8);
    line-height: 1;
    user-select: none;
  }
  .pc-transcript {
    position: relative;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 52px;
    overflow: hidden;
    background: var(--pc-transcript-shell-bg);
    border: 1px solid var(--pc-transcript-shell-border);
    border-radius: 34px;
    box-shadow: var(--pc-panel-shadow), inset 1px 0 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 4%, transparent);
    backdrop-filter: blur(24px) saturate(160%);
  }
  .pc-transcript-main {
    position: relative;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    margin: 14px 0 14px 14px;
    padding: 20px;
    border-radius: 28px;
    border: 1px solid color-mix(in srgb, var(--pc-transcript-shell-border) 82%, transparent);
    background: var(--pc-transcript-bg);
    box-shadow: var(--pc-action-surface-shadow);
    overflow: hidden;
  }
  .pc-transcript-rail {
    width: 52px;
    min-width: 52px;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 0;
    margin: 14px 14px 14px 0;
    gap: 12px;
    border: 1px solid var(--pc-transcript-shell-border);
    border-radius: 26px;
    background: var(--pc-rail-bg);
    box-shadow: inset 1px 0 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 6%, transparent);
    backdrop-filter: blur(24px) saturate(155%);
  }
  .pc-transcript-rail::-webkit-scrollbar { width: 0; }

  /* ── Dock button (icon-only, tooltip on hover) ── */
  .pc-dock-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 16px;
    border: 1px solid var(--pc-rail-chip-border);
    background: var(--pc-rail-chip-bg);
    box-shadow: var(--pc-rail-chip-shadow);
    color: var(--tf-text-secondary, #bfc5d4);
    cursor: pointer;
    transition: transform 120ms ease, border-color 120ms ease, background 120ms ease, box-shadow 120ms ease, color 120ms ease;
    flex-shrink: 0;
  }
  .pc-dock-btn svg,
  .pc-dock-btn img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  .pc-dock-btn:hover:not(:disabled) {
    color: var(--tf-text-primary, #e2e6f0);
    background: var(--pc-action-surface-hover-bg);
    border-color: var(--pc-action-surface-hover-border);
    transform: translateY(-1px);
  }
  .pc-dock-btn.active {
    color: var(--tf-text-primary, #e2e6f0);
    background: var(--pc-action-surface-hover-bg);
    border-color: var(--pc-action-surface-hover-border);
    box-shadow: var(--pc-action-surface-shadow);
  }
  .pc-dock-btn:disabled {
    opacity: 0.28;
    cursor: default;
  }

  /* ── Dock tooltip (above icon) ── */
  .pc-dock-btn[data-tip]::after {
    content: attr(data-tip);
    position: absolute;
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    white-space: nowrap;
    color: var(--tf-text-primary, #e2e6f0);
    background: var(--pc-panel-bg);
    border: 1px solid var(--pc-panel-border);
    box-shadow: var(--pc-action-surface-shadow);
    pointer-events: none;
    opacity: 0;
    transition: opacity 100ms ease;
    z-index: 50;
  }
  .pc-dock-btn[data-tip]:hover::after {
    opacity: 1;
  }
  .pc-dock-btn[data-tip]:disabled:hover::after {
    opacity: 0;
  }

  /* ── Dock divider (thin line between groups) ── */
  .pc-dock-divider {
    width: 24px;
    height: 1px;
    background: var(--pc-rail-chip-border);
    flex-shrink: 0;
    margin: 3px 0;
  }

  /* ── Dock connection dot ── */
  .pc-dock-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    margin: 4px 0 2px;
    transition: background 0.3s, box-shadow 0.3s;
  }

  /* ── Dock step counter ── */
  .pc-dock-counter {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    color: var(--tf-text-muted, #8892a8);
    letter-spacing: 0.04em;
    line-height: 1;
    text-align: center;
  }

  /* ── Dock spacer ── */
  .pc-dock-spacer {
    flex: 1;
    min-height: 0;
  }

  /* ── Dock brand ── */
  .pc-dock-brand {
    width: 22px;
    height: 22px;
    object-fit: contain;
    border-radius: 6px;
    opacity: 0.35;
    transition: opacity 0.2s;
    margin: 4px 0;
    flex-shrink: 0;
  }
  .pc-dock-brand:hover {
    opacity: 0.7;
  }

  /* ── Settings dialog (centered modal) ── */
  .pc-settings-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: var(--tf-gradient-overlay, rgba(6, 8, 14, 0.64));
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pc-fade-in 120ms ease;
  }
  .pc-settings-dialog {
    position: relative;
    width: min(460px, calc(100vw - 48px));
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid var(--pc-dialog-border);
    background: var(--pc-dialog-bg);
    box-shadow: var(--pc-dialog-shadow);
    color: var(--tf-text-primary, #e2e6f0);
    animation: pc-scale-in 150ms ease;
    backdrop-filter: blur(22px) saturate(150%);
  }
  .pc-settings-dialog::-webkit-scrollbar { width: 4px; }
  .pc-settings-dialog::-webkit-scrollbar-thumb {
    background: var(--tf-border-default, rgba(202,211,230,0.14));
    border-radius: 999px;
  }
  .pc-settings-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid var(--pc-action-surface-border);
    background: var(--pc-action-surface-bg);
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 1;
    transition: all 120ms;
  }
  .pc-settings-close:hover {
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--tf-state-danger-border, rgba(239,68,68,0.35));
    background: var(--tf-state-danger-bg, rgba(239,68,68,0.14));
  }
  @keyframes pc-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pc-scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
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
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid var(--pc-action-surface-hover-border);
    background: var(--pc-action-surface-bg);
    box-shadow: var(--pc-action-surface-shadow);
    animation: pc-active-transcript-enter 220ms ease;
    backdrop-filter: blur(18px) saturate(150%);
    position: relative;
    overflow: hidden;
  }
  .pc-transcript-current::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 4px;
    background: color-mix(in srgb, var(--tf-color-primary, #6366f1) 88%, white 12%);
  }
  .pc-transcript-current.first-step::before {
    background: color-mix(in srgb, var(--tf-color-success, #22c55e) 88%, white 12%);
  }
  .pc-transcript-current.last-step::before {
    background: color-mix(in srgb, var(--tf-color-danger, #ef4444) 88%, white 12%);
  }
  .pc-transcript-current-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }
  .pc-transcript-current-title-right {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .pc-transcript-current-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pc-transcript-current-step {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-transcript-height-controls {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .pc-transcript-height-btn {
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    background: color-mix(in srgb, var(--tf-bg-overlay, #1f222a) 76%, transparent);
    color: var(--tf-text-primary, #e2e6f0);
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
    cursor: pointer;
  }
  .pc-transcript-height-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .pc-transcript-current-window {
    min-height: calc(1.75em * var(--pc-transcript-window-lines, 6));
    max-height: calc(1.75em * var(--pc-transcript-window-lines, 6));
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
    padding-right: 8px;
    color: var(--tf-text-secondary, #bfc5d4);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: calc(15px * var(--pc-transcript-font-scale, 1.1));
    line-height: 1.75;
  }
  .pc-transcript-current-window::-webkit-scrollbar { width: 3px; }
  .pc-transcript-current-window::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 18%, transparent);
    border-radius: 999px;
  }
  .pc-transcript-current-text {
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
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--pc-action-surface-bg);
    opacity: 0.68;
    transition: all 180ms ease;
    cursor: pointer;
    backdrop-filter: blur(18px) saturate(150%);
  }
  .pc-transcript-step:hover {
    opacity: 0.92;
    border-color: var(--tf-border-default, rgba(202,211,230,0.14));
  }
  .pc-transcript-step.active {
    opacity: 1;
    border-color: var(--pc-action-surface-hover-border);
    box-shadow: var(--pc-action-surface-shadow);
    background: var(--pc-action-surface-hover-bg);
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
  .pc-transcript-edit-btn {
    height: 28px;
    padding: 0 10px;
    border-radius: 10px;
    border: 1px solid var(--pc-rail-chip-border);
    background: var(--pc-rail-chip-bg);
    box-shadow: var(--pc-rail-chip-shadow);
    color: var(--tf-text-secondary, #bfc5d4);
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    transition: all 150ms;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .pc-transcript-edit-btn:hover {
    background: var(--tf-bg-overlay, #1f222a);
    border-color: var(--tf-color-primary-light, #818cf8);
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pc-transcript-edit-btn.active {
    background: rgba(99,102,241,0.15);
    border-color: var(--tf-color-primary-light, #818cf8);
    color: var(--tf-color-primary-light, #818cf8);
  }
  .pc-transcript-edit-btn .pc-edit-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--tf-color-accent, #f59e0b);
    flex-shrink: 0;
  }
  .pc-transcript-edit-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    pointer-events: none;
  }
  .pc-transcript-textarea {
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 14px 16px;
    border: none;
    border-top: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--tf-bg-base, #0b0d12);
    color: var(--tf-text-secondary, #bfc5d4);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: calc(14px * var(--pc-transcript-font-scale, 1.1));
    line-height: 1.6;
    resize: none;
    outline: none;
    box-sizing: border-box;
    white-space: pre-wrap;
  }
  .pc-transcript-textarea::placeholder {
    color: var(--tf-text-muted, #8892a8);
    font-style: italic;
  }
  .pc-transcript-original {
    padding: 10px 16px;
    border-top: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--pc-action-surface-bg);
  }
  .pc-transcript-original-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
    margin-bottom: 4px;
  }
  .pc-transcript-original-text {
    font-size: 11px;
    color: var(--tf-text-muted, #8892a8);
    line-height: 1.5;
    white-space: pre-wrap;
    max-height: 80px;
    overflow-y: auto;
    opacity: 0.7;
  }
  .pc-transcript-revert-btn {
    margin-top: 6px;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: transparent;
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    font-size: 10px;
    font-weight: 600;
  }
  .pc-transcript-revert-btn:hover {
    border-color: var(--tf-color-danger, #ef4444);
    color: var(--tf-color-danger, #ef4444);
  }
  .pc-transcript-split-section {
    padding: 14px 16px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .pc-transcript-split-section + .pc-transcript-split-section {
    border-top: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--tf-surface-card-bg, #191c23);
  }
  .pc-transcript-split-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .pc-transcript-split-label.edited {
    color: var(--tf-color-accent, #f59e0b);
  }
  .pc-transcript-split-label.original {
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-transcript-split-text {
    font-size: calc(12px * var(--pc-transcript-font-scale, 1.1));
    line-height: 1.6;
    white-space: pre-wrap;
  }
  .pc-transcript-split-text.edited {
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pc-transcript-split-text.original {
    color: var(--tf-text-muted, #8892a8);
    opacity: 0.7;
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

  @media (max-width: 1480px) {
    .pc-body {
      grid-template-columns: 320px 1fr;
    }
    .pc-body::before {
      left: calc(320px + 10px);
    }
  }

  @media (max-width: 1120px) {
    .pc-body {
      grid-template-columns: 260px 1fr;
    }
    .pc-body::before {
      left: calc(260px + 10px);
    }
  }

  @media (max-width: 820px) {
    .pc-body {
      grid-template-columns: 200px 1fr;
    }
    .pc-body::before {
      left: calc(200px + 10px);
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
  }
  .pe-root.pe-pip-mode .pe-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--pe-pip-column-width);
    height: 100%;
  }
  .pe-root.pe-pip-mode .pe-viewport {
    padding: 0;
  }
  .pe-root.pe-pip-mode .pe-viewport-guide-svg {
    display: none;
  }

  .pe-pip-column {
    position: relative;
    width: var(--pe-pip-column-width);
    height: 100%;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--pe-pip-panel-border);
    background: var(--pe-pip-panel-bg);
    overflow: hidden;
  }

  /* Flatten so children are direct flex items of the column */
  .pe-pip-upper {
    display: contents;
  }

  .pe-pip-header {
    display: flex;
    align-items: center;
    padding: 0 10px;
    height: 22px;
    gap: 6px;
    border-bottom: 1px solid rgba(202,211,230,0.08);
    background: var(--pe-pip-header-bg);
    backdrop-filter: blur(18px) saturate(150%);
    flex-shrink: 0;
  }

  .pe-pip-meta {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 14px 16px 10px;
    gap: 6px;
    border-bottom: 1px solid rgba(202,211,230,0.06);
    background: var(--pe-pip-panel-bg);
    overflow: hidden;
    flex: 0 0 auto;
    min-height: clamp(70px, 9vh, 130px);
  }

  .pe-pip-meta-topline {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .pe-pip-meta-course {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--tf-color-primary-light, #818cf8);
    font-weight: 700;
    line-height: 1.3;
    flex: 1 1 auto;
  }

  .pe-pip-meta-lesson {
    font-size: clamp(1.1rem, 2.5vh, 1.5rem);
    font-weight: 700;
    color: var(--tf-text-primary, #e2e6f0);
    line-height: 1.14;
    letter-spacing: -0.02em;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pe-pip-meta-slide-title {
    font-size: clamp(1.3rem, 3vh, 1.8rem);
    font-weight: 700;
    color: var(--tf-text-primary, #e2e6f0);
    line-height: 1.18;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pe-pip-meta-slide {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid var(--pe-pip-chip-border);
    background: var(--pe-pip-chip-bg);
    box-shadow: var(--pe-pip-chip-shadow);
    font-size: 12px;
    color: var(--tf-text-secondary, #bfc5d4);
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    flex: 0 0 auto;
  }

  .pe-pip-meta-objective {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid var(--pe-pip-objective-border);
    background: var(--pe-pip-objective-bg);
    box-shadow: var(--pe-pip-chip-shadow);
  }

  .pe-pip-meta-objective-label {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    padding: 4px 8px;
    border-radius: 999px;
    background: var(--pe-pip-objective-pill-bg);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--tf-color-secondary, #14b8a6);
  }

  .pe-pip-meta-objective-body {
    font-size: clamp(0.75rem, 1.58vh, 0.92rem);
    color: var(--tf-text-secondary, #bfc5d4);
    font-weight: 400;
    line-height: 1.48;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.94;
  }

  .pe-pip-inset {
    color: var(--tf-text-primary, #e2e6f0);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    overflow: hidden;
    background: var(--pe-pip-inset-bg);
  }
  .pe-pip-frame {
    position: relative;
    width: calc(100% - 48px);
    margin: 24px;
    aspect-ratio: 1 / 1.2;
  }
  .pe-pip-guide-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
  }

  .pe-pip-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: clamp(0.6rem, 1.5vh, 1.2rem);
    padding: clamp(1.4rem, 3.5vh, 2.8rem) 16px clamp(1rem, 2vh, 1.6rem);
    flex: 1 1 0;
    min-height: 180px;
    overflow: hidden;
    background: var(--pe-pip-footer-bg);
    border-top: 1px solid var(--pe-footer-border);
  }
  .pe-pip-footer-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    flex-wrap: wrap;
    width: 100%;
    text-align: center;
  }
  .pe-pip-footer-row.subscribe {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    flex-wrap: wrap;
    text-align: center;
  }
  .pe-pip-subscribe-icon {
    display: inline-flex;
    align-items: center;
    color: var(--tf-color-danger, #ef4444);
    transform-origin: 50% 10%;
    animation: pe-shorts-bell-ring 4.8s ease-in-out infinite;
    flex-shrink: 0;
  }
  .pe-pip-subscribe-icon svg {
    width: clamp(1.1rem, 2.6vh, 1.65rem);
    height: clamp(1.1rem, 2.6vh, 1.65rem);
  }
  .pe-pip-subscribe-text {
    font-size: clamp(1rem, 2.4vh, 1.5rem);
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .pe-pip-subscribe-brand {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    zoom: 1;
  }
  .pe-pip-footer-x-icon {
    display: inline-flex;
    align-items: center;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-pip-footer-x-icon svg {
    width: clamp(1rem, 2.2vh, 1.4rem);
    height: clamp(1rem, 2.2vh, 1.4rem);
  }
  .pe-pip-footer-handle {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(1rem, 2.2vh, 1.4rem);
    font-weight: 700;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-pip-footer-x-text {
    font-size: clamp(0.65rem, 1.3vh, 0.85rem);
    font-weight: 500;
    color: var(--tf-text-muted, #8892a8);
    text-align: center;
    line-height: 1.3;
  }
  .pe-pip-footer-row3-text {
    font-size: clamp(0.88rem, 2vh, 1.2rem);
    font-weight: 500;
    color: var(--tf-text-muted, #8892a8);
  }
  .pe-pip-footer-x-capsule {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 14px;
    border-radius: 999px;
    border: 1px solid var(--tf-state-neutral-border, rgba(167,180,200,0.30));
    background: var(--tf-state-neutral-bg, rgba(167,180,200,0.14));
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 6%, transparent);
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(0.88rem, 2vh, 1.2rem);
    font-weight: 700;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-pip-footer-x-capsule-icon {
    display: none;
  }
  .pe-pip-footer-qr-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-evenly;
    gap: clamp(0.8rem, 2vh, 1.5rem);
    margin-top: auto;
    width: 100%;
  }
  .pe-pip-footer-qr-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }
  .pe-pip-footer-qr-item img {
    width: clamp(80px, 12vh, 130px);
    height: clamp(80px, 12vh, 130px);
    border-radius: 6px;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
  }
  .pe-pip-footer-qr-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(0.45rem, 0.9vh, 0.65rem);
    max-width: clamp(80px, 12vh, 130px);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    color: var(--tf-text-muted, #8892a8);
    letter-spacing: 0.02em;
  }
  .pe-pip-promo {
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
  .pe-pip-promo-site {
    color: var(--tf-color-primary-light, #818cf8);
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-weight: 700;
    letter-spacing: 0.01em;
  }
  .pe-pip-footer-row.socials {
    gap: 0.5em;
  }
  .pe-pip-footer-row.copy {
    gap: 0;
  }
  .pe-pip-footer .pe-footer-social-link {
    gap: 0.3em;
    font-size: clamp(0.6875rem, 1.4vh, 0.9375rem);
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-pip-footer .pe-footer-social-link svg {
    width: clamp(0.875rem, 1.8vh, 1.25rem);
    height: clamp(0.875rem, 1.8vh, 1.25rem);
  }
  .pe-pip-footer .pe-footer-social-text {
    line-height: 1;
  }
  .pe-pip-footer .pe-footer-copy {
    font-size: clamp(0.625rem, 1.2vh, 0.8125rem);
    color: var(--tf-text-muted, #64748b);
  }
  .pe-pip-footer .pe-footer-instructor {
    font-size: clamp(0.6875rem, 1.4vh, 0.9375rem);
    color: var(--tf-text-primary, #ffffff);
    font-weight: 500;
  }
  .pe-pip-footer .brand-lockup {
    transform: scale(1);
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
  /* Headless + PIP: hide the header controls; keep the column layout. */
  .pe-root.pe-headless.pe-pip-mode .pe-pip-header {
    display: none;
  }

  /* ── Shorts Mode (9:16) ────────────── */
  .pe-shorts-root {
    --pe-slide-stage-ratio: 1.4;
    width: 100vw;
    height: 100vh;
    background: var(--tf-surface-stage-bg, #0b0d12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--tf-text-primary, #e2e6f0);
    overflow: hidden;
    position: relative;
  }

  .pe-shorts-frame {
    --pe-shorts-frame-width: min(calc(100vh * 2048 / 3640), 100vw);
    --pe-shorts-stage-height: calc(var(--pe-shorts-frame-width) / var(--pe-slide-stage-ratio));
    height: 100vh;
    aspect-ratio: 2048 / 3640;
    max-width: 100vw;
    display: grid;
    grid-template-rows: var(--pe-shorts-stage-height) minmax(0, 1fr) auto;
    background:
      radial-gradient(circle at top, color-mix(in srgb, var(--tf-state-info-accent, #14b8a6) 10%, transparent), transparent 34%),
      radial-gradient(circle at bottom, color-mix(in srgb, var(--tf-state-recommendation-accent, #6366f1) 10%, transparent), transparent 36%),
      var(--pe-shell-bg);
    overflow: hidden;
    position: relative;
  }

  .pe-shorts-frame:has(.blank-shorts-title-shell) {
    grid-template-rows: auto minmax(0, 1fr) auto;
  }

  /* Content area at the top — renders actual slide content (flex: 1fr) */
  .pe-shorts-header {
    min-height: 0;
    height: var(--pe-shorts-stage-height);
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background:
      radial-gradient(circle at 30% 40%, color-mix(in srgb, var(--tf-state-info-accent, #14b8a6) 8%, transparent), transparent 52%),
      radial-gradient(circle at 70% 60%, color-mix(in srgb, var(--tf-state-emphasis-accent, #a855f7) 7%, transparent), transparent 52%),
      linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-stage-bg, #0b0d12) 80%, transparent), var(--tf-surface-panel-bg, #111318));
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
  }

  .pe-shorts-frame:has(.blank-shorts-title-shell) .pe-shorts-header {
    height: auto;
  }

  /* Scale slide content to fit the available content area */
  .pe-shorts-slide-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .pe-shorts-frame:has(.blank-shorts-title-shell) .pe-shorts-slide-content {
    height: auto;
  }

  .pe-shorts-slide-content > * {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .pe-shorts-frame:has(.blank-shorts-title-shell) .pe-shorts-slide-content > .blank-shorts-title-shell {
    flex: 0 0 auto;
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
    width: 100%;
    height: 100%;
    min-height: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 60% at 30% 30%, color-mix(in srgb, var(--tf-state-recommendation-accent, #6366f1) 22%, transparent), transparent),
      radial-gradient(ellipse 70% 50% at 70% 70%, color-mix(in srgb, var(--tf-state-emphasis-accent, #a855f7) 18%, transparent), transparent),
      radial-gradient(ellipse 60% 40% at 50% 50%, color-mix(in srgb, var(--tf-state-info-accent, #14b8a6) 10%, transparent), transparent),
      linear-gradient(160deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 88%, var(--tf-surface-stage-bg, #0b0d12) 12%) 0%, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 86%, var(--tf-surface-stage-bg, #0b0d12) 14%) 40%, color-mix(in srgb, var(--tf-surface-stage-bg, #0b0d12) 92%, var(--tf-surface-panel-bg, #111318) 8%) 100%);
    border-top: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
  }

  .pe-shorts-guide-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
  }

  .pe-shorts-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.6em;
    padding: clamp(0.5rem, 1.2vh, 0.85rem) 1.5vw;
    min-height: fit-content;
    flex-shrink: 0;
    white-space: nowrap;
    border-top: 1px solid var(--pe-footer-border);
    background: var(--pe-pip-footer-bg);
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
  }
  .pe-shorts-footer-dot {
    font-size: clamp(0.625rem, 1.2vh, 0.8125rem);
    color: var(--tf-text-muted, #8892a8);
  }
  .pe-shorts-footer-x-icon {
    display: inline-flex;
    align-items: center;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-shorts-footer-x-icon svg {
    width: clamp(0.68rem, 1.3vh, 0.9rem);
    height: clamp(0.68rem, 1.3vh, 0.9rem);
  }
  .pe-shorts-footer-x-capsule {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.18rem 0.42rem;
    border-radius: 999px;
    border: 1px solid var(--tf-state-neutral-border, rgba(167,180,200,0.30));
    background: var(--tf-state-neutral-bg, rgba(167,180,200,0.14));
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 6%, transparent);
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(0.62rem, 1.2vh, 0.8rem);
    font-weight: 700;
    color: var(--tf-text-secondary, #bfc5d4);
    white-space: nowrap;
  }

  /* Deck-type filter & badge styles in control panel */
  .pc-deck-type-row {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
    padding: 4px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 10%, transparent);
    background: color-mix(in srgb, var(--tf-surface-stage-bg, #0b0d12) 62%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 6%, transparent);
  }
  .pc-deck-type-btn {
    flex: 1;
    padding: 0.45em 0;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    border-radius: 999px;
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
    border-color: var(--pc-action-surface-hover-border);
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pc-deck-type-btn.active {
    background: var(--pc-action-surface-hover-bg);
    border-color: var(--pc-action-surface-hover-border);
    color: var(--tf-text-primary, #e2e6f0);
    box-shadow: var(--pc-action-surface-shadow);
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
    border-color: var(--pc-action-surface-hover-border);
  }
  .pe-shorts-btn.active {
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--pc-action-surface-hover-border);
    background: var(--pc-action-surface-hover-bg);
  }

  /* ── Feed Mode (4:5) — full-page aspect with PIP inset ── */
  .pe-feed-root {
    --pe-slide-stage-ratio: 1.4;
    width: 100vw;
    height: 100vh;
    background: var(--tf-surface-stage-bg, #0b0d12);
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
    --pe-feed-frame-width: min(calc(100vh * 4 / 5), 100vw);
    height: 100vh;
    aspect-ratio: 4 / 5;
    max-width: 100vw;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    background:
      radial-gradient(circle at top, color-mix(in srgb, var(--tf-state-info-accent, #14b8a6) 10%, transparent), transparent 34%),
      radial-gradient(circle at bottom, color-mix(in srgb, var(--tf-state-recommendation-accent, #6366f1) 10%, transparent), transparent 36%),
      var(--pe-shell-bg);
    overflow: hidden;
    position: relative;
  }

  /* Title + description area — replaces slide content in 4:5 */
  .pe-feed-title-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(3vh, 5vh, 7vh) clamp(1.5vw, 3vw, 5vw) clamp(2vh, 3.5vh, 5vh);
    min-height: clamp(80px, 14vh, 180px);
    overflow: hidden;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background:
      radial-gradient(circle at 30% 40%, color-mix(in srgb, var(--tf-state-info-accent, #14b8a6) 8%, transparent), transparent 52%),
      radial-gradient(circle at 70% 60%, color-mix(in srgb, var(--tf-state-emphasis-accent, #a855f7) 7%, transparent), transparent 52%),
      linear-gradient(180deg, color-mix(in srgb, var(--tf-surface-stage-bg, #0b0d12) 80%, transparent), var(--tf-surface-panel-bg, #111318));
  }
  .pe-feed-title-inner {
    display: flex;
    flex-direction: column;
    gap: clamp(0.4rem, 0.8vh, 0.8rem);
  }
  .pe-feed-deck-title {
    font-size: clamp(1.25rem, 3.2vh, 2.25rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pe-feed-slide-title {
    font-size: clamp(0.875rem, 2vh, 1.375rem);
    font-weight: 600;
    color: var(--tf-color-primary-light, #818cf8);
    letter-spacing: 0.01em;
  }
  .pe-feed-description {
    font-size: clamp(0.8125rem, 1.6vh, 1.125rem);
    color: var(--tf-text-secondary, #bfc5d4);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Video / PIP capture area — middle row of the 4:5 grid */
  .pe-feed-video {
    width: 100%;
    height: 100%;
    min-height: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 60% at 30% 30%, color-mix(in srgb, var(--tf-state-recommendation-accent, #6366f1) 22%, transparent), transparent),
      radial-gradient(ellipse 70% 50% at 70% 70%, color-mix(in srgb, var(--tf-state-emphasis-accent, #a855f7) 18%, transparent), transparent),
      radial-gradient(ellipse 60% 40% at 50% 50%, color-mix(in srgb, var(--tf-state-info-accent, #14b8a6) 10%, transparent), transparent),
      linear-gradient(160deg, color-mix(in srgb, var(--tf-surface-control-bg, #1f222a) 88%, var(--tf-surface-stage-bg, #0b0d12) 12%) 0%, color-mix(in srgb, var(--tf-surface-panel-bg, #111318) 86%, var(--tf-surface-stage-bg, #0b0d12) 14%) 40%, color-mix(in srgb, var(--tf-surface-stage-bg, #0b0d12) 92%, var(--tf-surface-panel-bg, #111318) 8%) 100%);
    border-top: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
  }

  /* SVG guide overlay — inside PIP area only */
  .pe-feed-guide-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
  }

  /* Footer bar at the bottom of the 4:5 frame */
  .pe-feed-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.6em;
    padding: clamp(0.8rem, 2vh, 1.4rem) 2.2vw;
    min-height: fit-content;
    flex-shrink: 0;
    white-space: nowrap;
    border-top: 1px solid var(--pe-footer-border);
    background: var(--pe-pip-footer-bg);
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
    width: clamp(1rem, 2.4vh, 1.4rem);
    height: clamp(1rem, 2.4vh, 1.4rem);
  }
  .pe-feed-subscribe-text {
    font-size: clamp(1rem, 2.4vh, 1.4rem);
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .pe-feed-footer-dot {
    font-size: clamp(0.7rem, 1.4vh, 0.95rem);
    color: var(--tf-text-muted, #8892a8);
  }
  .pe-feed-footer-x-icon {
    display: inline-flex;
    align-items: center;
    color: var(--tf-text-secondary, #bfc5d4);
  }
  .pe-feed-footer-x-icon svg {
    width: clamp(0.7rem, 1.4vh, 0.95rem);
    height: clamp(0.7rem, 1.4vh, 0.95rem);
  }
  .pe-feed-footer-x-capsule {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.22rem 0.48rem;
    border-radius: 999px;
    border: 1px solid var(--tf-state-neutral-border, rgba(167,180,200,0.30));
    background: var(--tf-state-neutral-bg, rgba(167,180,200,0.14));
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 6%, transparent);
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(0.72rem, 1.45vh, 0.96rem);
    font-weight: 700;
    color: var(--tf-text-secondary, #bfc5d4);
    white-space: nowrap;
  }

  /* ═══════════════════════════════════════════════════════════════════════ */
  /*  FLAT CONTROL PANEL OVERRIDES (Dashdark-X-style)                       */
  /*  Three columns separated by background tint only — no nested boxes,    */
  /*  no curved borders, fluid middle pane.                                 */
  /* ═══════════════════════════════════════════════════════════════════════ */
  .pc-root {
    background: #0b0d12;
  }
  .pc-root::before,
  .pc-root::after {
    display: none;
  }
  .pc-body {
    grid-template-columns: 320px minmax(0, 1fr) auto;
    gap: 0;
    padding: 0;
  }
  .pc-body::before {
    display: none;
  }

  /* ── Sidebar (left): darker shade, flat, full bleed ── */
  .pc-sidebar {
    border: none;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0;
    background: #0d1016;
    box-shadow: none;
    backdrop-filter: none;
    padding: 20px 18px;
    gap: 22px;
  }
  .pc-sidebar::before,
  .pc-transcript::before {
    display: none;
  }

  /* ── Strip nested boxes inside sidebar ── */
  .pc-camera-preview,
  .pc-controls,
  .pc-lessons,
  .pc-sidebar-control-group {
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    overflow: visible;
  }
  .pc-camera-preview { gap: 8px; }
  .pc-controls { gap: 10px; }
  .pc-lessons { gap: 6px; }
  .pc-sidebar-control-group { gap: 8px; }
  .pc-section-label {
    color: rgba(255, 255, 255, 0.42);
    letter-spacing: 0.10em;
    font-size: 10px;
    padding: 0;
  }

  /* ── Form controls inside sidebar: low-radius, flat ── */
  .pc-menu-trigger {
    min-height: 40px;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #14181f;
    box-shadow: none;
    backdrop-filter: none;
  }
  .pc-menu-trigger:hover,
  .pc-menu-trigger:focus-visible,
  .pc-menu-select.open .pc-menu-trigger {
    background: #181d26;
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: none;
    transform: none;
  }
  .pc-menu-panel {
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.10);
    background-color: #14181f;
    background-image: none;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
    backdrop-filter: none;
  }
  .pc-menu-option {
    border-radius: 4px;
  }
  .pc-menu-option:hover,
  .pc-menu-option:focus-visible,
  .pc-menu-option.active {
    background: #1d2330;
    border-color: rgba(255, 255, 255, 0.10);
    transform: none;
  }
  .pc-field-input {
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #14181f;
    box-shadow: none;
    backdrop-filter: none;
  }
  .pc-field-input:hover,
  .pc-field-input:focus-visible {
    background: #181d26;
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: none;
  }
  .pc-btn {
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #14181f;
    box-shadow: none;
  }
  .pc-btn:hover:not(:disabled) {
    background: #181d26;
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: none;
    transform: none;
  }
  .pc-deck-type-row {
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #14181f;
    padding: 3px;
    box-shadow: none;
  }
  .pc-deck-type-btn {
    border-radius: 3px;
  }

  /* ── Lesson list rows: flat, separator-only ── */
  .pc-jump-item {
    border-radius: 0;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    background: transparent;
    box-shadow: none;
    margin-bottom: 0;
    padding: 10px 6px;
  }
  .pc-jump-item:hover {
    background: rgba(255, 255, 255, 0.03);
    transform: none;
  }
  .pc-jump-item.active {
    background: rgba(255, 255, 255, 0.05);
    border-color: transparent;
  }

  /* ── Transcript (middle): default shade, full bleed, fluid ── */
  .pc-transcript {
    grid-template-columns: minmax(0, 1fr) 56px;
    border: none;
    border-radius: 0;
    background: #0f1218;
    box-shadow: none;
    backdrop-filter: none;
  }
  .pc-transcript-main {
    margin: 0;
    padding: 22px 28px;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  /* ── Right rail: slightly different shade, flat ── */
  .pc-transcript-rail {
    width: 56px;
    min-width: 56px;
    margin: 0;
    padding: 14px 0;
    border: none;
    border-left: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0;
    background: #0d1016;
    box-shadow: none;
    backdrop-filter: none;
    gap: 6px;
  }
  .pc-dock-btn {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    border: 1px solid transparent;
    background: transparent;
    box-shadow: none;
  }
  .pc-dock-btn:hover:not(:disabled) {
    background: #181d26;
    border-color: rgba(255, 255, 255, 0.10);
    transform: none;
  }
  .pc-dock-btn.active {
    background: #1d2330;
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: none;
  }
  .pc-dock-btn[data-tip]::after {
    border-radius: 4px;
    background: #14181f;
    border-color: rgba(255, 255, 255, 0.10);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
  }
  .pc-dock-divider {
    background: rgba(255, 255, 255, 0.06);
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
        d="M5 2H2v3M9 2h3v3M12 9v3H9M5 12H2V9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 2l3 3M12 2 9 5M12 12 9 9M2 12l3-3"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  explore: (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="m8.95 5.05-1.42 3.17-3.18 1.42 1.42-3.17 3.18-1.42Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  guides: (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M4 1.5H1.5V4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M10 1.5h2.5V4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12.5 10v2.5H10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M4 12.5H1.5V10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  crossbars: (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5v3M7 9.5v3M1.5 7h3M9.5 7h3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="7" r="1.3" stroke="currentColor" strokeWidth="1.1" />
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
  signal: (
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
      <path d="M2 10a8.913 8.913 0 0 1 3-6.737" />
      <path d="M5.636 7.636a5 5 0 0 1 0 7.072" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M18.364 7.636a5 5 0 0 1 0 7.072" />
      <path d="M22 10a8.913 8.913 0 0 0-3-6.737" />
    </svg>
  ),
  teleprompter: (
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
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="13" y2="15" />
    </svg>
  ),
  reset: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 7a4.5 4.5 0 1 1 1.4 3.2" />
      <polyline points="2.5 4.5 2.5 7 5 7" />
    </svg>
  ),
  edit: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 2.5a1.7 1.7 0 0 1 2.4 2.4L5.1 12.2 2 13l.8-3.1L10 2.5z" />
    </svg>
  ),
  textUp: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12L5 3l3 9" />
      <path d="M3.2 9.5h3.6" />
      <path d="M11 10V4M9 6l2-2 2 2" />
    </svg>
  ),
  textDown: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12L5 3l3 9" />
      <path d="M3.2 9.5h3.6" />
      <path d="M11 4v6M9 8l2 2 2-2" />
    </svg>
  ),
  back: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 2.5L4.5 7 9 11.5" />
    </svg>
  ),
  settings: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  transcriptLesson: (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: "0.04em",
      }}
    >
      L↓
    </span>
  ),
  transcriptCourse: (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: "0.04em",
      }}
    >
      C↓
    </span>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Typing Promotion — animated footer URL with rotating phrases          */
/* ═══════════════════════════════════════════════════════════════════════ */

export function TypingPromotion({
  url,
  phrases,
}: {
  url: string;
  phrases: string[];
}) {
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
      action: "reorder-slides";
      slideIds: string[];
    }
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
      action: "set-enlarge";
      slideId: string;
      enlarge: number;
    }
  | {
      type: "command";
      deckId: string;
      action: "switch-deck";
      targetDeckId: string;
    }
  | {
      type: "command";
      deckId: string;
      action: "toggle-fullscreen";
      targetSurface?: PresentationSurface;
    }
  | {
      type: "command";
      deckId: string;
      action: "toggle-guides";
      targetSurface?: PresentationSurface;
    }
  | {
      type: "command";
      deckId: string;
      action: "toggle-crossbars";
      targetSurface?: PresentationSurface;
    }
  | { type: "request-state"; deckId: string }
  | {
      type: "command";
      deckId: string;
      action: "set-layout";
      slideId: string;
      layout: SlideLayoutOverride | null;
    }
  | {
      type: "command";
      deckId: string;
      action: "set-adjust-mode";
      adjustMode: boolean;
    };

type LocalNavigationCommand =
  | { type: "command"; deckId: string; action: "prev" | "next" }
  | { type: "command"; deckId: string; action: "goto"; index: number }
  | { type: "command"; deckId: string; action: "step-goto"; index: number };

type PresentationSurface = "presentation" | "shorts" | "feed";

type ControlState = {
  type: "state";
  deckId: string;
  deckTitle: string;
  slideIndex: number;
  slideCount: number;
  elapsed: number;
  duration?: number;
  zoom: number;
  enlarge: number;
  slideTitle?: string;
  narration?: string;
  steps?: PresentationStep[];
  stepIndex: number;
  stepCount: number;
  surface: PresentationSurface;
  fullscreenActive: boolean;
  fullscreenPromptVisible: boolean;
  showGuides: boolean;
  showCrossbars: boolean;
};

const DEFAULT_CONTROL_CHANNEL = "tf-slides-control";
const DEFAULT_CONTROL_WINDOW_NAME = "tf-slide-control-window";
const TRANSCRIPT_LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "gu", label: "Gujarati" },
] as const;
const DEFAULT_SLIDE_ZOOM = 1.15;
const ENLARGE_MIN = 0.5;
const ENLARGE_MAX = 5;
const ENLARGE_STEP = 0.05;
const DEFAULT_ENLARGE = 1;
const ACTIVE_TRANSCRIPT_LINE_STOPS = [4, 5, 6, 7, 8, 9];
const DEFAULT_ACTIVE_TRANSCRIPT_LINE_COUNT = 6;
const TRANSCRIPT_FONT_SCALE_STOPS = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7];
const DEFAULT_TRANSCRIPT_FONT_SCALE_INDEX = 1;
const TELEPROMPTER_FOCUS_LINE_STOPS = [
  0.16, 0.19, 0.22, 0.25, 0.28, 0.32, 0.35,
];
const DEFAULT_TELEPROMPTER_FOCUS_LINE_INDEX = 2;

function getControlStorageKey(channelId: string, kind: "command" | "state") {
  return `${channelId}:${kind}`;
}

function getZoomStorageKey(channelId: string, deckId: string) {
  return `${channelId}:${deckId}:zoom`;
}

function getSlideOrderStorageKey(channelId: string, deckId: string) {
  return `${channelId}:${deckId}:slide-order`;
}

function getTranscriptLanguageStorageKey(channelId: string) {
  return `${channelId}:transcript-language`;
}

function getActiveTranscriptLinesStorageKey(channelId: string, deckId: string) {
  return `${channelId}:${deckId}:active-transcript-lines`;
}

function readStoredTranscriptLanguage(
  storageKey: string,
): TranscriptLanguageCode {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored && stored.trim()
      ? (stored as TranscriptLanguageCode)
      : DEFAULT_TRANSCRIPT_LANGUAGE;
  } catch {
    return DEFAULT_TRANSCRIPT_LANGUAGE;
  }
}

function hasTranscriptEdits(edits: TranscriptEditRecord): boolean {
  return Object.values(edits).some((value) => {
    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    return Object.values(value ?? {}).some(
      (entry) => typeof entry === "string" && entry.trim().length > 0,
    );
  });
}

function normalizeSlideOrderIds(
  slides: readonly { id: string }[],
  orderedSlideIds?: readonly string[] | null,
): string[] {
  const fallbackIds = slides.map((slide) => slide.id);
  if (!orderedSlideIds?.length) return fallbackIds;

  const knownIds = new Set(fallbackIds);
  const normalized: string[] = [];

  for (const slideId of orderedSlideIds) {
    if (!knownIds.has(slideId) || normalized.includes(slideId)) continue;
    normalized.push(slideId);
  }

  for (const slideId of fallbackIds) {
    if (!normalized.includes(slideId)) {
      normalized.push(slideId);
    }
  }

  return normalized;
}

function readStoredSlideOrder(
  storageKey: string,
  slides: readonly { id: string }[],
): string[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return normalizeSlideOrderIds(slides);
    return normalizeSlideOrderIds(slides, JSON.parse(raw) as string[]);
  } catch {
    return normalizeSlideOrderIds(slides);
  }
}

function writeStoredSlideOrder(
  storageKey: string,
  slideIds: readonly string[],
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(slideIds));
  } catch {
    // Ignore storage access issues.
  }
}

function buildOrderedSlides<T extends { id: string }>(
  slides: readonly T[],
  orderedSlideIds: readonly string[],
): T[] {
  const slideMap = new Map(slides.map((slide) => [slide.id, slide]));

  return normalizeSlideOrderIds(slides, orderedSlideIds)
    .map((slideId) => slideMap.get(slideId))
    .filter((slide): slide is T => Boolean(slide));
}

function findSlideIndexById(
  slides: readonly { id: string }[],
  slideId: string,
): number {
  return slides.findIndex((slide) => slide.id === slideId);
}

function moveSlideId(
  orderedSlideIds: readonly string[],
  draggedSlideId: string,
  targetSlideId: string,
): string[] {
  if (draggedSlideId === targetSlideId) {
    return [...orderedSlideIds];
  }

  const nextOrderIds = [...orderedSlideIds];
  const fromIndex = nextOrderIds.indexOf(draggedSlideId);
  const targetIndex = nextOrderIds.indexOf(targetSlideId);

  if (fromIndex === -1 || targetIndex === -1) {
    return nextOrderIds;
  }

  const [movedSlideId] = nextOrderIds.splice(fromIndex, 1);
  nextOrderIds.splice(targetIndex, 0, movedSlideId);
  return nextOrderIds;
}

function useOrderedSlides<T extends { id: string }>(
  channelId: string,
  deckId: string,
  slides: readonly T[],
) {
  const slideOrderStorageKey = getSlideOrderStorageKey(channelId, deckId);
  const [slideOrderIds, setSlideOrderIds] = useState<string[]>(() =>
    readStoredSlideOrder(slideOrderStorageKey, slides),
  );
  const orderedSlides = useMemo(
    () => buildOrderedSlides(slides, slideOrderIds),
    [slides, slideOrderIds],
  );

  useLayoutEffect(() => {
    setSlideOrderIds(readStoredSlideOrder(slideOrderStorageKey, slides));
  }, [slideOrderStorageKey, slides]);

  const applySlideOrder = useCallback(
    (nextSlideIds: readonly string[]) => {
      const normalizedOrderIds = normalizeSlideOrderIds(slides, nextSlideIds);
      setSlideOrderIds(normalizedOrderIds);
      writeStoredSlideOrder(slideOrderStorageKey, normalizedOrderIds);
      return normalizedOrderIds;
    },
    [slideOrderStorageKey, slides],
  );

  return {
    slideOrderIds,
    orderedSlides,
    applySlideOrder,
  };
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

function getEnlargeSessionKey(
  channelId: string,
  deckId: string,
  slideId: string,
) {
  return `tf-enlarge:${channelId}:${deckId}:${slideId}`;
}

function getEnlargePersistKey(
  channelId: string,
  deckId: string,
  slideId: string,
) {
  return `tf-enlarge-persist:${channelId}:${deckId}:${slideId}`;
}

function readSlideEnlarge(
  channelId: string,
  deckId: string,
  slideId: string,
): number {
  const sessionKey = getEnlargeSessionKey(channelId, deckId, slideId);
  const persistKey = getEnlargePersistKey(channelId, deckId, slideId);
  try {
    const sessionVal = sessionStorage.getItem(sessionKey);
    if (sessionVal != null) {
      const v = Number(sessionVal);
      if (!Number.isNaN(v) && v > 0) return v;
    }
    const localVal = localStorage.getItem(persistKey);
    if (localVal != null) {
      const v = Number(localVal);
      if (!Number.isNaN(v) && v > 0) return v;
    }
  } catch {
    // Ignore storage access issues.
  }
  return DEFAULT_ENLARGE;
}

function writeSlideEnlarge(
  channelId: string,
  deckId: string,
  slideId: string,
  value: number,
): void {
  try {
    sessionStorage.setItem(
      getEnlargeSessionKey(channelId, deckId, slideId),
      String(value),
    );
    localStorage.setItem(
      getEnlargePersistKey(channelId, deckId, slideId),
      String(value),
    );
  } catch {
    // Ignore storage access issues.
  }
}

function persistAllEnlargeValues(
  channelId: string,
  deckId: string,
  slides: { id: string }[],
): void {
  for (const slide of slides) {
    const sessionKey = getEnlargeSessionKey(channelId, deckId, slide.id);
    const persistKey = getEnlargePersistKey(channelId, deckId, slide.id);
    try {
      const val = sessionStorage.getItem(sessionKey);
      if (val != null) {
        localStorage.setItem(persistKey, val);
      }
    } catch {
      // Ignore storage access issues.
    }
  }
}

function hydrateControlStateEnlarge(
  channelId: string,
  deckId: string,
  slides: { id: string }[],
  state: ControlState,
): ControlState {
  const slideId = slides[state.slideIndex]?.id ?? "";
  const persistedEnlarge = readSlideEnlarge(channelId, deckId, slideId);

  return {
    ...state,
    enlarge: persistedEnlarge,
  };
}

/* ── Layout Override Types & Helpers ───────────────────────────────────── */

/**
 * A user-defined grid layout override for a single slide.
 * Each cell holds an *array* of block indices so multiple blocks
 * can stack inside a single grid cell.
 */
export interface SlideLayoutOverride {
  /** Preset mode that produced this layout. */
  mode: "simple" | "advanced";
  /** Grid rows. Empty rows (all cells empty) are skipped at render time. */
  rows: SlideLayoutRow[];
  /**
   * Optional per-row height percentages set via the on-slide drag handle.
   * Length matches the number of POPULATED rows at the time of saving.
   * Values are raw percentages that sum to ~100 (e.g. [30, 50, 20]).
   * When absent, rows use their default flex behaviour.
   */
  rowHeights?: number[];
}

export interface SlideLayoutRow {
  /** Human label shown in the editor (e.g. "Top", "Middle", "Bottom"). */
  label: string;
  /** Number of columns in this row (1 or 2). */
  columns: number;
  /** Each entry is an array of 0-based block indices. Length === columns. */
  cells: number[][];
}

/** Simple layout: one row, one column. */
function buildSimpleLayout(): SlideLayoutOverride {
  return {
    mode: "simple",
    rows: [{ label: "Content", columns: 1, cells: [[]] }],
  };
}

/** Advanced layout: 3 rows — top (1 col), middle (2 col), bottom (1 col). */
function buildAdvancedLayout(): SlideLayoutOverride {
  return {
    mode: "advanced",
    rows: [
      { label: "Top", columns: 1, cells: [[]] },
      { label: "Middle", columns: 2, cells: [[], []] },
      { label: "Bottom", columns: 1, cells: [[]] },
    ],
  };
}

function getLayoutStorageKey(
  channelId: string,
  deckId: string,
  slideId: string,
): string {
  return `tf-layout:${channelId}:${deckId}:${slideId}`;
}

function readSlideLayout(
  channelId: string,
  deckId: string,
  slideId: string,
): SlideLayoutOverride | null {
  try {
    const raw = localStorage.getItem(
      getLayoutStorageKey(channelId, deckId, slideId),
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.rows)) {
      // Migrate v1 format: cells was (number|null)[] → now number[][]
      for (const row of parsed.rows as SlideLayoutRow[]) {
        row.cells = row.cells.map((c: number | null | number[]) =>
          Array.isArray(c) ? c : c != null ? [c] : [],
        );
      }
      return parsed as SlideLayoutOverride;
    }
  } catch {
    // Ignore.
  }
  return null;
}

function writeSlideLayout(
  channelId: string,
  deckId: string,
  slideId: string,
  layout: SlideLayoutOverride | null,
): void {
  const key = getLayoutStorageKey(channelId, deckId, slideId);
  try {
    if (layout) {
      localStorage.setItem(key, JSON.stringify(layout));
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore.
  }
}

/**
 * Returns true if a React element is a trivial spacer / empty wrapper
 * that should NOT be surfaced as a layout block.
 * Detects: plain `<div>` / `<span>` with no children or only whitespace,
 * elements whose sole purpose is spacing (height/margin-only style).
 */
function isTrivialElement(el: React.ReactElement): boolean {
  // Only inspect plain HTML tags — components are always meaningful
  if (typeof el.type !== "string") return false;
  const tag = el.type as string;
  if (tag !== "div" && tag !== "span") return false;

  const props = el.props as Record<string, unknown>;
  const childCount = React.Children.count(props.children as React.ReactNode);

  // No children at all → spacer div
  if (childCount === 0) return true;

  // Check if children are only whitespace strings
  let onlyWhitespace = true;
  React.Children.forEach(props.children as React.ReactNode, (c) => {
    if (typeof c === "string") {
      if (c.trim().length > 0) onlyWhitespace = false;
    } else if (c != null && c !== false && c !== true) {
      onlyWhitespace = false;
    }
  });
  return onlyWhitespace;
}

/**
 * Extracts top-level React children from a slide's content tree.
 * ContentSlide wraps in SurfaceSlide > Slide; we unwrap the outermost
 * component's props.children, then filter out:
 *  - Spectacle internals (Heading used as the title)
 *  - Trivial spacer divs / spans
 *  - null / boolean / empty nodes
 */
function extractContentBlocks(content: React.ReactNode): React.ReactNode[] {
  const blocks: React.ReactNode[] = [];

  const processChildren = (children: React.ReactNode) => {
    React.Children.forEach(children, (inner) => {
      if (inner == null || inner === false || inner === true) return;
      if (typeof inner === "string" && inner.trim() === "") return;
      if (!React.isValidElement(inner)) return;

      // Skip Spectacle Heading used as the slide title (ContentSlide adds one)
      const typeName =
        typeof inner.type !== "string"
          ? ((inner.type as { displayName?: string }).displayName ??
            (inner.type as { name?: string }).name ??
            "")
          : "";
      if (typeName === "Heading") return;

      // Skip trivial spacer elements
      if (isTrivialElement(inner)) return;

      blocks.push(inner);
    });
  };

  React.Children.forEach(content, (child) => {
    if (!React.isValidElement(child)) return;
    const childProps = child.props as Record<string, unknown>;
    if (childProps.children) {
      processChildren(childProps.children as React.ReactNode);
    } else if (!isTrivialElement(child)) {
      blocks.push(child);
    }
  });
  return blocks;
}

/**
 * Generates human-readable labels for content blocks by inspecting
 * React element type display names and props.
 */
export function getBlockLabels(content: React.ReactNode): string[] {
  const blocks = extractContentBlocks(content);
  let compIdx = 0;
  return blocks.map((block) => {
    compIdx++;
    if (!React.isValidElement(block)) return `Block ${compIdx}`;
    const typeName =
      typeof block.type === "string"
        ? block.type
        : ((block.type as { displayName?: string; name?: string })
            .displayName ??
          (block.type as { name?: string }).name ??
          "Component");
    const props = block.props as Record<string, unknown>;
    const label =
      (props.label as string) ??
      (props.title as string) ??
      (props.name as string) ??
      "";
    return label ? `${typeName}: ${label}` : `${typeName} #${compIdx}`;
  });
}

/** Check whether a row has any assigned blocks. */
function isRowPopulated(row: SlideLayoutRow, blockCount: number): boolean {
  return row.cells.some((cell) =>
    cell.some((idx) => idx >= 0 && idx < blockCount),
  );
}

/** Consistent padding matching Spectacle's <Slide padding="48px 64px">. */
const LO_PADDING = "48px 64px";
/** Uniform gap between ALL layout elements: rows, columns, stacked blocks. */
const LO_GAP = 12;

/**
 * Renders content with a layout override applied.
 *
 * Padding: uses LO_PADDING (same as SurfaceSlide / DarkSlide) so the
 * layout-overridden slide has identical insets to a normal slide.
 *
 * Flex model (advanced):
 *  - Wrapper is a flex column that fills the slide (100 % × 100 %).
 *  - If `rowHeights` are present, each row gets a fixed percentage height.
 *    Otherwise the last row absorbs remaining space; others size to content.
 *  - Within a multi-column row, CSS grid + `align-items: stretch` ensures
 *    both columns share the tallest column's height.
 *  - Gap is uniform (LO_GAP) for rows, columns, and stacked blocks.
 *  - No background is set — the underlying Spectacle Slide provides its own.
 *
 * Empty rows and empty cells are completely omitted from the DOM.
 */
function applyLayoutOverride(
  content: React.ReactNode,
  layout: SlideLayoutOverride,
  adjustMode?: boolean,
  onRowResize?: (heights: number[]) => void,
): React.ReactNode {
  const blocks = extractContentBlocks(content);
  if (blocks.length === 0) return content;

  // Collect all assigned indices across all rows
  const allAssigned = layout.rows.flatMap((r) =>
    r.cells.flatMap((cell) =>
      cell.filter((idx) => idx >= 0 && idx < blocks.length),
    ),
  );
  if (allAssigned.length === 0) return content;

  /** Render a list of block indices stacked vertically inside one cell. */
  const renderCell = (
    indices: number[],
    keyPrefix: string,
  ): React.ReactElement =>
    React.createElement(
      "div",
      {
        key: keyPrefix,
        style: {
          display: "flex",
          flexDirection: "column" as const,
          gap: `${LO_GAP}px`,
          minHeight: 0,
          minWidth: 0,
          flex: "1 1 0",
          overflow: "hidden",
        },
      },
      ...indices.map((idx, bi) =>
        React.createElement(
          "div",
          {
            key: `${keyPrefix}-b${bi}`,
            className: "lo-block",
            style: {
              minWidth: 0,
              minHeight: 0,
              flex: "1 1 0",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column" as const,
            },
          },
          blocks[idx],
        ),
      ),
    );

  /** Shared wrapper style (no background — slide provides its own). */
  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: `${LO_GAP}px`,
    width: "100%",
    height: "100%",
    padding: LO_PADDING,
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
  };

  // ── Simple mode ──────────────────────────────────────────────────────
  if (layout.mode === "simple") {
    const hasHeights =
      layout.rowHeights && layout.rowHeights.length === allAssigned.length;
    const children = allAssigned.map((idx, i) =>
      React.createElement(
        "div",
        {
          key: `sb-${i}`,
          style: {
            minWidth: 0,
            minHeight: 0,
            flex: hasHeights ? `0 0 ${layout.rowHeights![i]}%` : "1 1 0",
            overflow: "hidden",
          },
        },
        blocks[idx],
      ),
    );

    return React.createElement(
      "div",
      { className: "lo-wrapper", style: wrapperStyle },
      ...children,
      adjustMode
        ? React.createElement(LayoutResizeHandles, {
            direction: "column",
            count: allAssigned.length,
            gap: LO_GAP,
            padding: LO_PADDING,
            initialHeights: layout.rowHeights,
            onCommit: onRowResize,
          })
        : null,
    );
  }

  // ── Advanced mode ────────────────────────────────────────────────────
  const populatedRows = layout.rows.filter((row) =>
    isRowPopulated(row, blocks.length),
  );
  if (populatedRows.length === 0) return content;

  const hasHeights =
    layout.rowHeights && layout.rowHeights.length === populatedRows.length;

  const rowElements = populatedRows.map((row, ri) => {
    const hasMultipleCols = row.columns > 1;
    const isLastRow = ri === populatedRows.length - 1;

    // Build only the cells that actually have content
    const cellElements: React.ReactElement[] = [];
    for (let ci = 0; ci < row.cells.length; ci++) {
      const valid = row.cells[ci].filter(
        (idx) => idx >= 0 && idx < blocks.length,
      );
      if (valid.length === 0 && hasMultipleCols) {
        cellElements.push(
          React.createElement("div", { key: `lc-${ri}-${ci}` }),
        );
      } else if (valid.length > 0) {
        cellElements.push(renderCell(valid, `lc-${ri}-${ci}`));
      }
    }

    // Row flex: use stored height %, or last-row-absorbs model
    const rowFlex = hasHeights
      ? `0 0 ${layout.rowHeights![ri]}%`
      : isLastRow
        ? "1 1 0"
        : "0 0 auto";

    return React.createElement(
      "div",
      {
        key: `lr-${ri}`,
        style: {
          display: hasMultipleCols ? "grid" : "flex",
          ...(hasMultipleCols
            ? {
                gridTemplateColumns: Array.from(
                  { length: row.columns },
                  () => "1fr",
                ).join(" "),
                gap: `${LO_GAP}px`,
                alignItems: "stretch",
              }
            : {
                flexDirection: "column" as const,
                gap: `${LO_GAP}px`,
              }),
          flex: rowFlex,
          minHeight: 0,
          overflow: "hidden",
        },
      },
      ...cellElements,
    );
  });

  return React.createElement(
    "div",
    { className: "lo-wrapper", style: wrapperStyle },
    ...rowElements,
    adjustMode
      ? React.createElement(LayoutResizeHandles, {
          direction: "column",
          count: populatedRows.length,
          gap: LO_GAP,
          padding: LO_PADDING,
          initialHeights: layout.rowHeights,
          onCommit: onRowResize,
        })
      : null,
  );
}

/* ── On-slide drag resize handles ─────────────────────────────────────── */

/**
 * Overlay that renders draggable handles between layout rows (or blocks in
 * simple mode).  Dragging a handle redistributes the percentage heights of
 * the two neighbouring items.  On pointer-up the final percentages are
 * passed to `onCommit`.
 */
function LayoutResizeHandles({
  direction: _direction,
  count,
  gap,
  padding,
  initialHeights,
  onCommit,
}: {
  direction: "column";
  count: number;
  gap: number;
  padding: string;
  initialHeights?: number[];
  onCommit?: (heights: number[]) => void;
}) {
  // Parse padding "48px 64px" → top/bottom and left/right
  const [padY, padX] = React.useMemo(() => {
    const parts = padding.split(/\s+/).map(parseFloat);
    return parts.length >= 2 ? [parts[0], parts[1]] : [parts[0], parts[0]];
  }, [padding]);

  // Manage heights as percentages that sum to 100
  const [heights, setHeights] = React.useState<number[]>(() => {
    if (initialHeights && initialHeights.length === count) {
      return [...initialHeights];
    }
    return Array.from({ length: count }, () => 100 / count);
  });

  // Ref to track the wrapper bounding rect during drag
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const draggingRef = React.useRef<{
    handleIndex: number;
    startY: number;
    startHeights: number[];
  } | null>(null);

  const handlePointerDown = React.useCallback(
    (handleIndex: number, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      draggingRef.current = {
        handleIndex,
        startY: e.clientY,
        startHeights: [...heights],
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [heights],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      const drag = draggingRef.current;
      if (!drag) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const totalGaps = (count - 1) * gap;
      const available = wrapper.clientHeight - padY * 2 - totalGaps;
      if (available <= 0) return;

      const deltaY = e.clientY - drag.startY;
      const deltaPct = (deltaY / available) * 100;

      const idx = drag.handleIndex;
      const minPct = 5; // minimum 5% per row
      let newAbove = drag.startHeights[idx] + deltaPct;
      let newBelow = drag.startHeights[idx + 1] - deltaPct;

      // Clamp
      if (newAbove < minPct) {
        newBelow += newAbove - minPct;
        newAbove = minPct;
      }
      if (newBelow < minPct) {
        newAbove += newBelow - minPct;
        newBelow = minPct;
      }

      const next = [...drag.startHeights];
      next[idx] = Math.round(newAbove * 100) / 100;
      next[idx + 1] = Math.round(newBelow * 100) / 100;
      setHeights(next);
    },
    [count, gap, padY],
  );

  const handlePointerUp = React.useCallback(() => {
    draggingRef.current = null;
    onCommit?.(heights);
  }, [heights, onCommit]);

  if (count < 2) return null;

  // Compute cumulative top offsets for each handle
  const handleElements: React.ReactElement[] = [];
  let cumPct = 0;
  for (let i = 0; i < count - 1; i++) {
    cumPct += heights[i];
    // Position at cumulative % within the content area (inside padding)
    // Handle sits on the gap between rows
    const topPct = cumPct;
    handleElements.push(
      React.createElement("div", {
        key: `rh-${i}`,
        "data-resize-handle": i,
        style: {
          position: "absolute",
          left: padX,
          right: padX,
          top: `calc(${padY}px + (100% - ${padY * 2}px - ${(count - 1) * gap}px) * ${topPct / 100} + ${i * gap + gap / 2}px)`,
          height: gap + 8,
          marginTop: -(gap + 8) / 2,
          cursor: "row-resize",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "auto",
        },
        onPointerDown: (ev: React.PointerEvent) => handlePointerDown(i, ev),
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        children: React.createElement("div", {
          style: {
            width: 48,
            height: 4,
            borderRadius: 2,
            background: "rgba(99, 102, 241, 0.7)",
            boxShadow: "0 0 8px rgba(99, 102, 241, 0.4)",
            transition: "background 0.15s",
          },
        }),
      }),
    );
  }

  return React.createElement("div", {
    ref: wrapperRef,
    style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 5,
    },
    children: handleElements,
  });
}

/* ── Layout Editor Dialog ─────────────────────────────────────────────── */

interface LayoutEditorProps {
  slideId: string;
  blockCount: number;
  blockLabels: string[];
  initial: SlideLayoutOverride | null;
  onSave: (layout: SlideLayoutOverride | null) => void;
  onClose: () => void;
  /** Whether the on-slide drag adjust mode is active. */
  adjustMode?: boolean;
  /** Toggle the on-slide drag adjust mode on/off. */
  onToggleAdjust?: () => void;
}

export function LayoutEditorDialog({
  slideId,
  blockCount,
  blockLabels,
  initial,
  onSave,
  onClose,
  adjustMode,
  onToggleAdjust,
}: LayoutEditorProps) {
  const [mode, setMode] = useState<"simple" | "advanced">(
    initial?.mode ?? "simple",
  );
  const [simpleRows, setSimpleRows] = useState<SlideLayoutRow[]>(
    initial?.mode === "simple" ? initial.rows : buildSimpleLayout().rows,
  );
  const [advancedRows, setAdvancedRows] = useState<SlideLayoutRow[]>(
    initial?.mode === "advanced" ? initial.rows : buildAdvancedLayout().rows,
  );

  const activeRows = mode === "simple" ? simpleRows : advancedRows;
  const setActiveRows = mode === "simple" ? setSimpleRows : setAdvancedRows;

  // All blocks currently assigned to any cell
  const usedBlocks = new Set(
    activeRows.flatMap((r) => r.cells.flatMap((cell) => cell)),
  );

  const toggleBlock = (ri: number, ci: number, blockIdx: number) => {
    setActiveRows((prev) =>
      prev.map((r, i) => {
        if (i !== ri) return r;
        const newCells = r.cells.map((cell, j) => {
          if (j !== ci) {
            // Remove from other cells in same row if it was there
            return cell.filter((b) => b !== blockIdx);
          }
          // Toggle in target cell
          return cell.includes(blockIdx)
            ? cell.filter((b) => b !== blockIdx)
            : [...cell, blockIdx];
        });
        return { ...r, cells: newCells };
      }),
    );
    // Also remove from other rows
    setActiveRows((prev) =>
      prev.map((r, i) => {
        if (i === ri) return r;
        return {
          ...r,
          cells: r.cells.map((cell) => cell.filter((b) => b !== blockIdx)),
        };
      }),
    );
  };

  /* ── Styles ── */
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--tf-gradient-overlay, rgba(6, 8, 14, 0.64))",
    backdropFilter: "blur(12px)",
    padding: 24,
  };
  const panelStyle: React.CSSProperties = {
    background: "var(--pc-dialog-bg)",
    border: "1px solid var(--pc-dialog-border)",
    borderRadius: 16,
    padding: 32,
    width: 620,
    maxWidth: "100%",
    maxHeight: "calc(100vh - 48px)",
    overflow: "auto",
    color: "var(--tf-text-primary, #e2e6f0)",
    fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
    fontSize: 14,
    boxShadow: "var(--pc-dialog-shadow)",
    backdropFilter: "blur(22px) saturate(150%)",
  };
  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid var(--tf-border-subtle, rgba(202,211,230,0.08))",
  };
  const btnBase: React.CSSProperties = {
    background: "var(--pc-action-surface-bg)",
    border: "1px solid var(--pc-action-surface-border)",
    borderRadius: 8,
    color: "var(--tf-text-primary, #e2e6f0)",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
    transition: "all 0.15s",
    lineHeight: "1.4",
  };
  const modeCardStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "16px 20px",
    borderRadius: 12,
    border: active
      ? "2px solid var(--pc-action-surface-hover-border)"
      : "1px solid var(--pc-dialog-section-border)",
    background: active
      ? "var(--pc-action-surface-hover-bg)"
      : "var(--pc-dialog-section-bg)",
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "center" as const,
    boxShadow: active
      ? "var(--pc-action-surface-shadow)"
      : "var(--pc-dialog-section-shadow)",
  });
  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "var(--tf-text-muted, #8892a8)",
    marginBottom: 12,
  };
  const rowCardStyle: React.CSSProperties = {
    background: "var(--pc-dialog-section-bg)",
    border: "1px solid var(--pc-dialog-section-border)",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 12,
    boxShadow: "var(--pc-dialog-section-shadow)",
  };
  const rowHeaderStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--tf-text-secondary, #bfc5d4)",
    marginBottom: 12,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  };
  const chipBaseStyle = (
    selected: boolean,
    disabled: boolean,
  ): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    lineHeight: "1.4",
    border: selected
      ? "1px solid var(--pc-action-surface-hover-border)"
      : disabled
        ? "1px solid var(--tf-border-subtle, rgba(202,211,230,0.08))"
        : "1px solid var(--pc-action-surface-border)",
    background: selected
      ? "var(--pc-action-surface-hover-bg)"
      : disabled
        ? "var(--pc-panel-bg)"
        : "var(--pc-action-surface-bg)",
    color: selected
      ? "var(--tf-text-primary, #e2e6f0)"
      : disabled
        ? "var(--tf-text-muted, #8892a8)"
        : "var(--tf-text-secondary, #bfc5d4)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    transition: "all 0.12s",
    whiteSpace: "nowrap" as const,
  });
  const footerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1px solid var(--tf-border-subtle, rgba(202,211,230,0.08))",
    gap: 12,
  };

  const renderCellEditor = (
    ri: number,
    ci: number,
    cell: number[],
    colLabel?: string,
  ) => {
    return (
      <div key={ci} style={{ minWidth: 0 }}>
        {colLabel && (
          <div
            style={{
              fontSize: 11,
              color: "var(--tf-text-muted, #8892a8)",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            {colLabel}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {Array.from({ length: blockCount }, (_, idx) => {
            const isInThisCell = cell.includes(idx);
            const isUsedElsewhere = usedBlocks.has(idx) && !isInThisCell;
            return (
              <div
                key={idx}
                style={chipBaseStyle(isInThisCell, isUsedElsewhere)}
                onClick={() => {
                  if (!isUsedElsewhere) toggleBlock(ri, ci, idx);
                }}
                role="checkbox"
                aria-checked={isInThisCell}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (
                    (e.key === "Enter" || e.key === " ") &&
                    !isUsedElsewhere
                  ) {
                    e.preventDefault();
                    toggleBlock(ri, ci, idx);
                  }
                }}
                title={
                  isUsedElsewhere
                    ? "Already assigned to another cell"
                    : blockLabels[idx]
                }
              >
                {isInThisCell && (
                  <span
                    style={{
                      color: "var(--tf-state-success-icon, #10b981)",
                      fontSize: 14,
                    }}
                  >
                    ✓
                  </span>
                )}
                {blockLabels[idx] ?? `Block ${idx + 1}`}
              </div>
            );
          })}
        </div>
        {cell.length > 0 && (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "var(--tf-text-muted, #8892a8)",
            }}
          >
            {cell.length} block{cell.length !== 1 ? "s" : ""} — stacked
            vertically
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Edit layout for slide ${slideId}`}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: "var(--tf-text-primary, #e2e6f0)",
                lineHeight: "1.3",
              }}
            >
              Slide Layout
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "var(--tf-text-muted, #8892a8)",
              }}
            >
              {slideId}
            </p>
          </div>
          <button
            style={{
              ...btnBase,
              padding: "6px 10px",
              fontSize: 16,
              lineHeight: "1",
            }}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Mode selector */}
        <div style={sectionLabelStyle}>Layout Mode</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          <div
            style={modeCardStyle(mode === "simple")}
            onClick={() => setMode("simple")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setMode("simple")}
          >
            <div
              style={{
                fontSize: 22,
                marginBottom: 6,
                filter:
                  mode === "simple" ? "none" : "grayscale(1) opacity(0.5)",
              }}
            >
              ▬
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Simple</div>
            <div
              style={{
                fontSize: 12,
                color: "var(--tf-text-muted, #8892a8)",
                marginTop: 2,
              }}
            >
              Single column, stacked
            </div>
          </div>
          <div
            style={modeCardStyle(mode === "advanced")}
            onClick={() => setMode("advanced")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setMode("advanced")}
          >
            <div
              style={{
                fontSize: 22,
                marginBottom: 6,
                filter:
                  mode === "advanced" ? "none" : "grayscale(1) opacity(0.5)",
              }}
            >
              ▦
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Advanced</div>
            <div
              style={{
                fontSize: 12,
                color: "var(--tf-text-muted, #8892a8)",
                marginTop: 2,
              }}
            >
              Top · Middle (2-col) · Bottom
            </div>
          </div>
        </div>

        {/* Block assignment */}
        <div style={sectionLabelStyle}>
          Assign Blocks ({blockCount} available)
        </div>

        {activeRows.map((row, ri) => {
          const rowLabel = mode === "simple" ? "Content" : row.label;
          return (
            <div key={`${mode}-${ri}`} style={rowCardStyle}>
              <div style={rowHeaderStyle}>
                {rowLabel}
                {row.columns > 1 && (
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--tf-text-muted, #8892a8)",
                    }}
                  >
                    {" "}
                    — {row.columns} columns
                  </span>
                )}
              </div>
              {row.columns === 1 ? (
                renderCellEditor(ri, 0, row.cells[0])
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  {row.cells.map((cell, ci) =>
                    renderCellEditor(ri, ci, cell, ci === 0 ? "Left" : "Right"),
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div style={footerStyle}>
          <button
            style={{
              ...btnBase,
              color: "var(--tf-state-danger-icon, #ef4444)",
              borderColor:
                "var(--tf-state-danger-border, rgba(239,68,68,0.35))",
              background: "var(--tf-state-danger-bg, rgba(239,68,68,0.14))",
            }}
            onClick={() => {
              onSave(null);
              onClose();
            }}
          >
            Reset Default
          </button>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {onToggleAdjust && initial && (
              <button
                style={{
                  ...btnBase,
                  background: adjustMode
                    ? "var(--tf-state-warning-bg, rgba(245,158,11,0.16))"
                    : "transparent",
                  borderColor: adjustMode
                    ? "var(--tf-state-warning-border, rgba(245,158,11,0.35))"
                    : "var(--pc-action-surface-border)",
                  color: adjustMode
                    ? "var(--tf-state-warning-icon, #f59e0b)"
                    : "var(--tf-text-secondary, #bfc5d4)",
                  fontWeight: adjustMode ? 600 : 400,
                }}
                onClick={onToggleAdjust}
                title="Drag row dividers on the slide to adjust heights"
              >
                {adjustMode ? "✦ Adjusting…" : "↕ Adjust on Slide"}
              </button>
            )}
            <button style={btnBase} onClick={onClose}>
              Cancel
            </button>
            <button
              style={{
                ...btnBase,
                background: "var(--pc-action-surface-hover-bg)",
                borderColor: "var(--pc-action-surface-hover-border)",
                color: "var(--pc-action-surface-hover-text)",
                fontWeight: 600,
              }}
              onClick={() => {
                onSave({ mode, rows: activeRows });
                onClose();
              }}
            >
              Save Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function shouldHandleSurfaceCommand(
  command: ControlCommand,
  surface: PresentationSurface,
): boolean {
  return (
    !("targetSurface" in command) ||
    command.targetSurface == null ||
    command.targetSurface === surface
  );
}

function requestFullscreenForRoot(root: HTMLDivElement | null): Promise<void> {
  if (root?.requestFullscreen) {
    return root.requestFullscreen();
  }
  if (document.documentElement.requestFullscreen) {
    return document.documentElement.requestFullscreen();
  }
  return Promise.reject(new Error("Fullscreen API unavailable"));
}

function useFullscreenFallbackArm(
  armed: boolean,
  rootRef: React.RefObject<HTMLDivElement | null>,
  setArmed: React.Dispatch<React.SetStateAction<boolean>>,
) {
  useEffect(() => {
    if (!armed) return;

    const activate = () => {
      requestFullscreenForRoot(rootRef.current)
        .then(() => setArmed(false))
        .catch(() => {});
    };

    const onPointerDown = () => {
      activate();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setArmed(false);
        return;
      }
      activate();
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [armed, rootRef, setArmed]);
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
  controlChannelId = DEFAULT_CONTROL_CHANNEL,
  controlWindowName = DEFAULT_CONTROL_WINDOW_NAME,
  hashPrefix,
  headless = false,
}: PresentationLayoutProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlChannelRef = useRef<BroadcastChannel | null>(null);
  const shortsPopupRef = useRef<Window | null>(null);
  const feedPopupRef = useRef<Window | null>(null);
  const zoomStorageKey = getZoomStorageKey(controlChannelId, deck.id);
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(controlChannelId, "command");
  const { orderedSlides, applySlideOrder } = useOrderedSlides(
    controlChannelId,
    deck.id,
    deck.slides,
  );

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
  const [enlargeMap, setEnlargeMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const s of deck.slides) {
      map[s.id] = readSlideEnlarge(controlChannelId, deck.id, s.id);
    }
    return map;
  });
  const [layoutMap, setLayoutMap] = useState<
    Record<string, SlideLayoutOverride | null>
  >(() => {
    const map: Record<string, SlideLayoutOverride | null> = {};
    for (const s of deck.slides) {
      map[s.id] = readSlideLayout(controlChannelId, deck.id, s.id);
    }
    return map;
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pipMode, setPipMode] = useState(!!headless);
  const [showGuides, setShowGuides] = useState(false);
  const [showCrossbars, setShowCrossbars] = useState(false);
  const [layoutAdjustMode, setLayoutAdjustMode] = useState(false);
  const [fullscreenPromptVisible, setFullscreenPromptVisible] = useState(false);
  useFullscreenFallbackArm(
    fullscreenPromptVisible,
    rootRef,
    setFullscreenPromptVisible,
  );
  const slideCount = orderedSlides.length;
  const elapsed = useSlideTimer(slideIndex);

  /* ── Derived slide data ── */
  const currentSlide = orderedSlides[slideIndex];
  const currentSlideEnlarge =
    enlargeMap[currentSlide?.id ?? ""] ?? DEFAULT_ENLARGE;
  const currentSlideLayout = layoutMap[currentSlide?.id ?? ""] ?? null;

  useLayoutEffect(() => {
    setSlideZoom(readStoredSlideZoom(zoomStorageKey));
    setEnlargeMap(() => {
      const map: Record<string, number> = {};
      for (const s of deck.slides) {
        map[s.id] = readSlideEnlarge(controlChannelId, deck.id, s.id);
      }
      return map;
    });
    setLayoutMap(() => {
      const map: Record<string, SlideLayoutOverride | null> = {};
      for (const s of deck.slides) {
        map[s.id] = readSlideLayout(controlChannelId, deck.id, s.id);
      }
      return map;
    });
  }, [controlChannelId, deck.id, deck.slides, zoomStorageKey]);

  /** Commit drag-resized row heights to the current slide's layout. */
  const handleRowResize = useCallback(
    (heights: number[]) => {
      if (!currentSlide || !currentSlideLayout) return;
      const updated: SlideLayoutOverride = {
        ...currentSlideLayout,
        rowHeights: heights,
      };
      setLayoutMap((prev) => ({ ...prev, [currentSlide.id]: updated }));
      writeSlideLayout(controlChannelId, deck.id, currentSlide.id, updated);
      // Broadcast so the control panel stays in sync
      controlChannelRef.current?.postMessage({
        action: "set-layout",
        slideId: currentSlide.id,
        layout: updated,
      });
    },
    [currentSlide, currentSlideLayout, controlChannelId, deck.id],
  );

  const currentSteps = currentSlide?.steps ?? [];
  const currentStepCount = currentSteps.length;
  const activeStepIndex =
    currentStepCount > 0 ? Math.min(stepIndex, currentStepCount - 1) : 0;
  const activeStep = currentSteps[activeStepIndex] ?? null;

  /* ── Navigation ── */
  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, slideCount - 1));
      setSlideIndex(clamped);
      setStepIndex(0);
      setLayoutAdjustMode(false); // exit adjust mode on navigate
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
    const slide = orderedSlides[slideIndex];
    const message: ControlState = {
      type: "state",
      deckId: deck.id,
      deckTitle: deck.title,
      slideIndex,
      slideCount,
      elapsed,
      duration: slide?.duration,
      zoom: slideZoom,
      enlarge: currentSlideEnlarge,
      slideTitle: getPresenterSlideTitle(slide),
      narration: slide?.narration,
      steps: slide?.steps,
      stepIndex: slide?.steps?.length ? activeStepIndex : 0,
      stepCount: slide?.steps?.length ?? 0,
      surface: "presentation",
      fullscreenActive: Boolean(document.fullscreenElement),
      fullscreenPromptVisible,
      showGuides,
      showCrossbars,
    };
    channel.postMessage(message);
    localStorage.setItem(stateStorageKey, JSON.stringify(message));
  }, [
    deck.id,
    deck.title,
    slideIndex,
    slideCount,
    elapsed,
    slideZoom,
    currentSlideEnlarge,
    activeStepIndex,
    stateStorageKey,
    fullscreenPromptVisible,
    showGuides,
    showCrossbars,
    orderedSlides,
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
  const orderedSlidesRef = useRef(orderedSlides);
  const slideIndexRef = useRef(slideIndex);
  const applySlideOrderRef = useRef(applySlideOrder);
  goPrevRef.current = goPrev;
  goNextRef.current = goNext;
  goToRef.current = goTo;
  stepBackRef.current = stepBack;
  stepForwardRef.current = stepForward;
  resetStepRef.current = resetStep;
  postControlStateRef.current = postControlState;
  currentStepCountRef.current = currentStepCount;
  orderedSlidesRef.current = orderedSlides;
  slideIndexRef.current = slideIndex;
  applySlideOrderRef.current = applySlideOrder;
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
      const sig = `${msg.type}:${(msg as ControlCommand & { action?: string }).action ?? ""}:${(msg as ControlCommand & { index?: number }).index ?? ""}:${(msg as ControlCommand & { targetDeckId?: string }).targetDeckId ?? ""}:${(msg as ControlCommand & { targetSurface?: PresentationSurface }).targetSurface ?? ""}:${(msg as ControlCommand & { zoom?: number }).zoom ?? ""}:${(msg as ControlCommand & { slideIds?: string[] }).slideIds?.join(",") ?? ""}`;
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
      else if (msg.action === "reorder-slides") {
        const currentSlideId =
          orderedSlidesRef.current[slideIndexRef.current]?.id ?? "";
        const nextOrderIds = applySlideOrderRef.current(msg.slideIds);
        const nextOrderedSlides = buildOrderedSlides(deck.slides, nextOrderIds);
        const nextIndex = currentSlideId
          ? findSlideIndexById(nextOrderedSlides, currentSlideId)
          : -1;

        if (nextIndex >= 0 && nextIndex !== slideIndexRef.current) {
          setSlideIndex(nextIndex);
          window.location.hash = hashPrefix
            ? `${hashPrefix}/${deck.id}/${nextIndex}`
            : `#/${deck.id}/${nextIndex}`;
        }
      } else if (msg.action === "step-prev") stepBackRef.current();
      else if (msg.action === "step-next") stepForwardRef.current();
      else if (msg.action === "step-reset") resetStepRef.current();
      else if (msg.action === "step-goto") {
        if (typeof msg.index !== "number") return;
        setStepIndex(
          Math.max(0, Math.min(msg.index, currentStepCountRef.current - 1)),
        );
      } else if (msg.action === "set-zoom") {
        const nextZoom = Math.max(0.85, Math.min(msg.zoom, 2.5));
        setSlideZoom(nextZoom);
      } else if (msg.action === "set-enlarge") {
        const slideId = msg.slideId;
        const raw = Number(msg.enlarge);
        const value =
          !Number.isNaN(raw) && raw >= ENLARGE_MIN && raw <= ENLARGE_MAX
            ? Math.round(raw * 100) / 100
            : DEFAULT_ENLARGE;
        setEnlargeMap((prev) => ({ ...prev, [slideId]: value }));
        writeSlideEnlarge(controlChannelId, deck.id, slideId, value);
      } else if (msg.action === "set-layout") {
        const slideId = msg.slideId;
        const layout = msg.layout;
        setLayoutMap((prev) => ({ ...prev, [slideId]: layout }));
        writeSlideLayout(controlChannelId, deck.id, slideId, layout);
      } else if (msg.action === "set-adjust-mode") {
        setLayoutAdjustMode(!!msg.adjustMode);
      } else if (
        msg.action === "toggle-fullscreen" &&
        shouldHandleSurfaceCommand(msg, "presentation")
      ) {
        window.focus();
        if (document.fullscreenElement) {
          setFullscreenPromptVisible(false);
          document.exitFullscreen().catch(() => {});
        } else {
          requestFullscreenForRoot(rootRef.current)
            .then(() => setFullscreenPromptVisible(false))
            .catch(() => setFullscreenPromptVisible(true));
        }
      } else if (
        msg.action === "toggle-guides" &&
        shouldHandleSurfaceCommand(msg, "presentation")
      ) {
        setShowGuides((v) => !v);
      } else if (
        msg.action === "toggle-crossbars" &&
        shouldHandleSurfaceCommand(msg, "presentation")
      ) {
        setShowCrossbars((v) => !v);
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

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        setFullscreenPromptVisible(false);
      }
      postControlState();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [postControlState]);

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
    // Close feed window if open — only one slide window at a time
    if (feedPopupRef.current && !feedPopupRef.current.closed) {
      feedPopupRef.current.close();
      feedPopupRef.current = null;
    }
    const shortsUrl = `${window.location.pathname}?shorts=1${window.location.hash}`;
    if (shortsPopupRef.current && !shortsPopupRef.current.closed) {
      shortsPopupRef.current.focus();
      return;
    }
    const popup = window.open(
      shortsUrl,
      `${controlWindowName}-shorts`,
      "popup=yes,width=560,height=1000,resizable=yes,scrollbars=yes",
    );
    if (popup) {
      shortsPopupRef.current = popup;
      popup.focus();
    }
  }, [controlWindowName]);

  const openFeedWindow = useCallback(() => {
    // Close shorts window if open — only one slide window at a time
    if (shortsPopupRef.current && !shortsPopupRef.current.closed) {
      shortsPopupRef.current.close();
      shortsPopupRef.current = null;
    }
    const feedUrl = `${window.location.pathname}?shorts=45${window.location.hash}`;
    if (feedPopupRef.current && !feedPopupRef.current.closed) {
      feedPopupRef.current.focus();
      return;
    }
    const popup = window.open(
      feedUrl,
      `${controlWindowName}-feed`,
      "popup=yes,width=900,height=1125,resizable=yes,scrollbars=yes",
    );
    if (popup) {
      feedPopupRef.current = popup;
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
      <style dangerouslySetInnerHTML={{ __html: PRESENTATION_ENGINE_CSS }} />
      <div
        className={`pe-root${headless ? " pe-headless" : ""}${pipMode ? " pe-pip-mode" : ""}`}
        ref={rootRef}
        aria-label={courseTitle}
        data-fullscreen-pending={fullscreenPromptVisible ? "true" : undefined}
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
          </div>

          <div className="pe-header-center">
            <span
              className="pe-header-slide-title"
              title={getPresenterSlideTitle(currentSlide)}
            >
              {renderSlideTitle(getPresenterSlideTitle(currentSlide))}
            </span>
          </div>

          <div className="pe-header-right">
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
            {supportsShortsCapture(deck) && (
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
              </>
            )}
            {isFeedCapable(deck.deckType) && (
              <button
                className="pe-shorts-btn ratio"
                onClick={openFeedWindow}
                title="Open feed (4:5) view"
                aria-label="Open 4 by 5 feed view"
              >
                {Icons.shorts}
                <span className="pe-shorts-btn-label">4:5</span>
              </button>
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
                <div
                  className="pe-slide-stage"
                  style={
                    {
                      "--pe-slide-enlarge": String(currentSlideEnlarge),
                    } as React.CSSProperties
                  }
                >
                  <PresentationStepContext.Provider
                    key={`${deck.id}:${currentSlide?.id ?? slideIndex}`}
                    value={stepContextValue}
                  >
                    {currentSlideLayout && currentSlide
                      ? applyLayoutOverride(
                          currentSlide.content,
                          currentSlideLayout,
                          layoutAdjustMode,
                          handleRowResize,
                        )
                      : currentSlide?.content}
                  </PresentationStepContext.Provider>
                </div>
                <svg
                  className="pe-viewport-guide-svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {showGuides && (
                    <>
                      <polyline
                        points="2,5 2,2 5,2"
                        fill="none"
                        stroke="rgba(226,230,240,0.85)"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                      <polyline
                        points="95,2 98,2 98,5"
                        fill="none"
                        stroke="rgba(226,230,240,0.85)"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                      <polyline
                        points="98,95 98,98 95,98"
                        fill="none"
                        stroke="rgba(226,230,240,0.85)"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                      <polyline
                        points="5,98 2,98 2,95"
                        fill="none"
                        stroke="rgba(226,230,240,0.85)"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                    </>
                  )}
                  {showCrossbars && (
                    <>
                      <line
                        x1="50"
                        y1="0"
                        x2="50"
                        y2="3"
                        stroke="rgba(226,230,240,0.6)"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                      <line
                        x1="50"
                        y1="97"
                        x2="50"
                        y2="100"
                        stroke="rgba(226,230,240,0.6)"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                      <line
                        x1="0"
                        y1="50"
                        x2="3"
                        y2="50"
                        stroke="rgba(226,230,240,0.6)"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                      <line
                        x1="97"
                        y1="50"
                        x2="100"
                        y2="50"
                        stroke="rgba(226,230,240,0.6)"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    </>
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* ── 16:9 Column (visible in 16:9 mode) ── */}
          {pipMode && (
            <div className="pe-pip-column">
              <div className="pe-pip-upper">
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

                <div className="pe-pip-meta">
                  {slideIndex > 0 && slideIndex < slideCount - 1 && (
                    <span className="pe-pip-meta-slide-title">
                      {renderSlideTitle(getPresenterSlideTitle(currentSlide))}
                    </span>
                  )}
                </div>

                {/* PIP cover area (middle) — portrait 916×1297 frame */}
                <div className="pe-pip-inset" aria-label="PIP cover area">
                  <div className="pe-pip-frame">
                    {/* SVG L-corner guides — sized to the portrait cover frame */}
                    <svg
                      className="pe-pip-guide-svg"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      {showGuides && (
                        <>
                          <polyline
                            points="3,8 3,3 8,3"
                            fill="none"
                            stroke="rgba(226,230,240,0.85)"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                          />
                          <polyline
                            points="92,3 97,3 97,8"
                            fill="none"
                            stroke="rgba(226,230,240,0.85)"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                          />
                          <polyline
                            points="97,92 97,97 92,97"
                            fill="none"
                            stroke="rgba(226,230,240,0.85)"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                          />
                          <polyline
                            points="8,97 3,97 3,92"
                            fill="none"
                            stroke="rgba(226,230,240,0.85)"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                          />
                        </>
                      )}
                      {showCrossbars && (
                        <>
                          <line
                            x1="50"
                            y1="0"
                            x2="50"
                            y2="5"
                            stroke="rgba(226,230,240,0.6)"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                          <line
                            x1="50"
                            y1="95"
                            x2="50"
                            y2="100"
                            stroke="rgba(226,230,240,0.6)"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                          <line
                            x1="0"
                            y1="50"
                            x2="5"
                            y2="50"
                            stroke="rgba(226,230,240,0.6)"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                          <line
                            x1="95"
                            y1="50"
                            x2="100"
                            y2="50"
                            stroke="rgba(226,230,240,0.6)"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                        </>
                      )}
                    </svg>
                  </div>
                </div>
              </div>

              <div className="pe-pip-footer">
                <div className="pe-pip-footer-row subscribe">
                  <span className="pe-pip-subscribe-icon">{Icons.bell}</span>
                  <span className="pe-pip-subscribe-text">
                    Want more? Subscribe and press the bell
                  </span>
                </div>
                <div className="pe-pip-footer-row" style={{ gap: "0.4em" }}>
                  <span className="pe-pip-footer-row3-text">
                    Catch me live for Q&amp;As on
                  </span>
                  <span className="pe-pip-footer-x-icon">{Icons.twitter}</span>
                  <span className="pe-pip-footer-row3-text">Spaces</span>
                  <span className="pe-pip-footer-x-capsule">@localm_tuts</span>
                </div>
                <div className="pe-pip-footer-qr-row">
                  <div className="pe-pip-footer-qr-item">
                    <img
                      src="/brand/qr-nilayparikh-links.png"
                      alt="nilayparikh.com/links"
                    />
                    <span className="pe-pip-footer-qr-label">
                      nilayparikh.com/links
                    </span>
                  </div>
                  <div className="pe-pip-footer-qr-item">
                    <img
                      src="/brand/qr-tuts-localm.png"
                      alt="tuts.localm.dev"
                    />
                    <span className="pe-pip-footer-qr-label">
                      tuts.localm.dev
                    </span>
                  </div>
                  <div className="pe-pip-footer-qr-item">
                    <img
                      src="/brand/qr-blogs-nilayparikh.png"
                      alt="blog.nilayparikh.com"
                    />
                    <span className="pe-pip-footer-qr-label">
                      blog.nilayparikh.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="pe-footer">
          <div className="pe-footer-row1">
            <span
              style={{
                color: "var(--tf-color-danger, #ef4444)",
                display: "inline-flex",
                alignItems: "center",
                transformOrigin: "50% 10%",
                animation: "pe-shorts-bell-ring 4.8s ease-in-out infinite",
              }}
            >
              {Icons.bell}
            </span>
            <span className="pe-footer-subscribe-label">
              Want more? Subscribe and press the bell
            </span>
          </div>
          <div className="pe-footer-row3">
            <span className="pe-footer-row3-text">
              Catch me live for Q&amp;As on
            </span>
            <span className="pe-footer-x-icon">{Icons.twitter}</span>
            <span className="pe-footer-row3-text">Spaces</span>
            <span className="pe-footer-x-capsule">@localm_tuts</span>
          </div>
          <div className="pe-footer-qr-row">
            <div className="pe-footer-qr-item">
              <img
                src="/brand/qr-nilayparikh-links.png"
                alt="nilayparikh.com/links"
              />
              <span className="pe-footer-qr-label">nilayparikh.com/links</span>
            </div>
            <div className="pe-footer-qr-item">
              <img src="/brand/qr-tuts-localm.png" alt="tuts.localm.dev" />
              <span className="pe-footer-qr-label">tuts.localm.dev</span>
            </div>
            <div className="pe-footer-qr-item">
              <img
                src="/brand/qr-blogs-nilayparikh.png"
                alt="blog.nilayparikh.com"
              />
              <span className="pe-footer-qr-label">blog.nilayparikh.com</span>
            </div>
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

export function ShortsLayout({
  courseTitle,
  deck,
  branding,
  controlChannelId = DEFAULT_CONTROL_CHANNEL,
  commandChannelId = controlChannelId,
  hashPrefix,
}: ShortsLayoutProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stateChannelRef = useRef<BroadcastChannel | null>(null);
  const commandChannelRef = useRef<BroadcastChannel | null>(null);
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(commandChannelId, "command");
  const { orderedSlides, applySlideOrder } = useOrderedSlides(
    controlChannelId,
    deck.id,
    deck.slides,
  );

  /* ── Parse initial slide from hash ── */
  const getIndexFromHash = useCallback((): number => {
    const hash = window.location.hash;
    const m = hash.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }, []);

  const [slideIndex, setSlideIndex] = useState(getIndexFromHash);
  const [stepIndex, setStepIndex] = useState(0);
  const [showGuides, setShowGuides] = useState(false);
  const [showCrossbars, setShowCrossbars] = useState(false);
  const [fullscreenPromptVisible, setFullscreenPromptVisible] = useState(false);
  useFullscreenFallbackArm(
    fullscreenPromptVisible,
    rootRef,
    setFullscreenPromptVisible,
  );
  const slideCount = orderedSlides.length;
  const elapsed = useSlideTimer(slideIndex);
  const captureFooterHandle = getCaptureFooterHandle(branding);
  const captureFooterLabel = getCaptureFooterLabel(deck, "shorts");

  const currentSlide = orderedSlides[slideIndex];
  const currentSteps = currentSlide?.steps ?? [];
  const currentStepCount = currentSteps.length;
  const activeStepIndex =
    currentStepCount > 0 ? Math.min(stepIndex, currentStepCount - 1) : 0;
  const activeStep = currentSteps[activeStepIndex] ?? null;
  const shortTitle = sanitizePresentationTitle(deck.title);
  const slideTitle = sanitizePresentationTitle(currentSlide?.title);
  const showTitleStack = slideIndex > 0 && !currentSlide?.hideTitleStack;

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
    const slide = orderedSlides[slideIndex];
    const message: ControlState = {
      type: "state",
      deckId: deck.id,
      deckTitle: deck.title,
      slideIndex,
      slideCount,
      elapsed,
      duration: slide?.duration,
      zoom: 1,
      enlarge: DEFAULT_ENLARGE,
      slideTitle: getPresenterSlideTitle(slide),
      narration: slide?.narration,
      steps: slide?.steps,
      stepIndex: slide?.steps?.length ? activeStepIndex : 0,
      stepCount: slide?.steps?.length ?? 0,
      surface: "shorts",
      fullscreenActive: Boolean(document.fullscreenElement),
      fullscreenPromptVisible,
      showGuides,
      showCrossbars,
    };
    channel.postMessage(message);
    localStorage.setItem(stateStorageKey, JSON.stringify(message));
  }, [
    deck.id,
    deck.title,
    slideIndex,
    slideCount,
    elapsed,
    activeStepIndex,
    stateStorageKey,
    fullscreenPromptVisible,
    showGuides,
    showCrossbars,
    orderedSlides,
  ]);

  /* ── Stable refs for BroadcastChannel handler (avoids effect teardown on step change) ── */
  const sGoPrevRef = useRef(goPrev);
  const sGoNextRef = useRef(goNext);
  const sGoToRef = useRef(goTo);
  const sStepBackRef = useRef(stepBack);
  const sStepForwardRef = useRef(stepForward);
  const sResetStepRef = useRef(resetStep);
  const sPostControlStateRef = useRef(postControlState);
  const sCurrentStepCountRef = useRef(currentStepCount);
  const sOrderedSlidesRef = useRef(orderedSlides);
  const sSlideIndexRef = useRef(slideIndex);
  const sApplySlideOrderRef = useRef(applySlideOrder);
  sGoPrevRef.current = goPrev;
  sGoNextRef.current = goNext;
  sGoToRef.current = goTo;
  sStepBackRef.current = stepBack;
  sStepForwardRef.current = stepForward;
  sResetStepRef.current = resetStep;
  sPostControlStateRef.current = postControlState;
  sCurrentStepCountRef.current = currentStepCount;
  sOrderedSlidesRef.current = orderedSlides;
  sSlideIndexRef.current = slideIndex;
  sApplySlideOrderRef.current = applySlideOrder;
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
      const sig = `${msg.type}:${(msg as ControlCommand & { action?: string }).action ?? ""}:${(msg as ControlCommand & { index?: number }).index ?? ""}:${(msg as ControlCommand & { targetDeckId?: string }).targetDeckId ?? ""}:${(msg as ControlCommand & { targetSurface?: PresentationSurface }).targetSurface ?? ""}:${(msg as ControlCommand & { zoom?: number }).zoom ?? ""}:${(msg as ControlCommand & { slideIds?: string[] }).slideIds?.join(",") ?? ""}`;
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
      else if (msg.action === "reorder-slides") {
        const currentSlideId =
          sOrderedSlidesRef.current[sSlideIndexRef.current]?.id ?? "";
        const nextOrderIds = sApplySlideOrderRef.current(msg.slideIds);
        const nextOrderedSlides = buildOrderedSlides(deck.slides, nextOrderIds);
        const nextIndex = currentSlideId
          ? findSlideIndexById(nextOrderedSlides, currentSlideId)
          : -1;

        if (nextIndex >= 0 && nextIndex !== sSlideIndexRef.current) {
          setSlideIndex(nextIndex);
          window.location.hash = hashPrefix
            ? `${hashPrefix}/${deck.id}/${nextIndex}`
            : `#/${deck.id}/${nextIndex}`;
        }
      } else if (msg.action === "step-prev") sStepBackRef.current();
      else if (msg.action === "step-next") sStepForwardRef.current();
      else if (msg.action === "step-reset") sResetStepRef.current();
      else if (msg.action === "step-goto") {
        if (typeof msg.index !== "number") return;
        setStepIndex(
          Math.max(0, Math.min(msg.index, sCurrentStepCountRef.current - 1)),
        );
      } else if (
        msg.action === "toggle-fullscreen" &&
        shouldHandleSurfaceCommand(msg, "shorts")
      ) {
        window.focus();
        if (document.fullscreenElement) {
          setFullscreenPromptVisible(false);
          document.exitFullscreen().catch(() => {});
        } else {
          requestFullscreenForRoot(rootRef.current)
            .then(() => setFullscreenPromptVisible(false))
            .catch(() => setFullscreenPromptVisible(true));
        }
      } else if (
        msg.action === "toggle-guides" &&
        shouldHandleSurfaceCommand(msg, "shorts")
      ) {
        setShowGuides((v) => !v);
      } else if (
        msg.action === "toggle-crossbars" &&
        shouldHandleSurfaceCommand(msg, "shorts")
      ) {
        setShowCrossbars((v) => !v);
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

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        setFullscreenPromptVisible(false);
      }
      postControlState();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [postControlState]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRESENTATION_ENGINE_CSS }} />
      <div
        className="pe-shorts-root"
        ref={rootRef}
        aria-label={courseTitle}
        data-fullscreen-pending={fullscreenPromptVisible ? "true" : undefined}
      >
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
            <svg
              className="pe-shorts-guide-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {showGuides && (
                <>
                  <polyline
                    points="3,8 3,3 8,3"
                    fill="none"
                    stroke="rgba(226,230,240,0.85)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points="92,3 97,3 97,8"
                    fill="none"
                    stroke="rgba(226,230,240,0.85)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points="97,92 97,97 92,97"
                    fill="none"
                    stroke="rgba(226,230,240,0.85)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points="8,97 3,97 3,92"
                    fill="none"
                    stroke="rgba(226,230,240,0.85)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}
              {showCrossbars && (
                <>
                  <line
                    x1="50"
                    y1="0"
                    x2="50"
                    y2="5"
                    stroke="rgba(226,230,240,0.6)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="50"
                    y1="95"
                    x2="50"
                    y2="100"
                    stroke="rgba(226,230,240,0.6)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="0"
                    y1="50"
                    x2="5"
                    y2="50"
                    stroke="rgba(226,230,240,0.6)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="95"
                    y1="50"
                    x2="100"
                    y2="50"
                    stroke="rgba(226,230,240,0.6)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}
            </svg>
          </div>

          {/* ── Footer ── */}
          <div className="pe-shorts-footer">
            <span className="pe-shorts-subscribe-icon">{Icons.bell}</span>
            <span className="pe-shorts-subscribe-text">
              {captureFooterLabel}
            </span>
            <span className="pe-shorts-footer-dot">·</span>
            <span className="pe-shorts-footer-x-icon">{Icons.twitter}</span>
            <span className="pe-shorts-footer-x-capsule">
              {captureFooterHandle}
            </span>
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
  const rootRef = useRef<HTMLDivElement>(null);
  const stateChannelRef = useRef<BroadcastChannel | null>(null);
  const commandChannelRef = useRef<BroadcastChannel | null>(null);
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(commandChannelId, "command");
  const { orderedSlides, applySlideOrder } = useOrderedSlides(
    controlChannelId,
    deck.id,
    deck.slides,
  );

  const getIndexFromHash = useCallback((): number => {
    const hash = window.location.hash;
    const m = hash.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }, []);

  const [slideIndex, setSlideIndex] = useState(getIndexFromHash);
  const [stepIndex, setStepIndex] = useState(0);
  const [showGuides, setShowGuides] = useState(false);
  const [showCrossbars, setShowCrossbars] = useState(false);
  const [fullscreenPromptVisible, setFullscreenPromptVisible] = useState(false);
  useFullscreenFallbackArm(
    fullscreenPromptVisible,
    rootRef,
    setFullscreenPromptVisible,
  );
  const slideCount = orderedSlides.length;
  const elapsed = useSlideTimer(slideIndex);

  const currentSlide = orderedSlides[slideIndex];
  const currentSteps = currentSlide?.steps ?? [];
  const currentStepCount = currentSteps.length;
  const activeStepIndex =
    currentStepCount > 0 ? Math.min(stepIndex, currentStepCount - 1) : 0;
  const shortTitle = sanitizePresentationTitle(deck.title);
  const slideTitle = sanitizePresentationTitle(currentSlide?.title);
  const blankSlideState =
    deck.id === "default-blank"
      ? getBlankSlideTitleState(slideIndex)
      : { title: "", subtitle: "" };
  const captureFooterHandle = getCaptureFooterHandle(branding);
  const captureFooterLabel = getCaptureFooterLabel(deck, "feed");
  const feedPrimaryTitle = blankSlideState.title.trim() || shortTitle;
  const feedSecondaryTitle = blankSlideState.title.trim()
    ? blankSlideState.subtitle.trim()
    : slideTitle;

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
    const slide = orderedSlides[slideIndex];
    const message: ControlState = {
      type: "state",
      deckId: deck.id,
      deckTitle: deck.title,
      slideIndex,
      slideCount,
      elapsed,
      duration: slide?.duration,
      zoom: 1,
      enlarge: DEFAULT_ENLARGE,
      slideTitle: slide?.title,
      narration: slide?.narration,
      steps: slide?.steps,
      stepIndex: slide?.steps?.length ? activeStepIndex : 0,
      stepCount: slide?.steps?.length ?? 0,
      surface: "feed",
      fullscreenActive: Boolean(document.fullscreenElement),
      fullscreenPromptVisible,
      showGuides,
      showCrossbars,
    };
    channel.postMessage(message);
    localStorage.setItem(stateStorageKey, JSON.stringify(message));
  }, [
    deck.id,
    deck.title,
    slideIndex,
    slideCount,
    elapsed,
    activeStepIndex,
    stateStorageKey,
    fullscreenPromptVisible,
    showGuides,
    showCrossbars,
    orderedSlides,
  ]);

  /* ── Stable refs ── */
  const fGoPrevRef = useRef(goPrev);
  const fGoNextRef = useRef(goNext);
  const fGoToRef = useRef(goTo);
  const fStepBackRef = useRef(stepBack);
  const fStepForwardRef = useRef(stepForward);
  const fResetStepRef = useRef(resetStep);
  const fPostControlStateRef = useRef(postControlState);
  const fCurrentStepCountRef = useRef(currentStepCount);
  const fOrderedSlidesRef = useRef(orderedSlides);
  const fSlideIndexRef = useRef(slideIndex);
  const fApplySlideOrderRef = useRef(applySlideOrder);
  fGoPrevRef.current = goPrev;
  fGoNextRef.current = goNext;
  fGoToRef.current = goTo;
  fStepBackRef.current = stepBack;
  fStepForwardRef.current = stepForward;
  fResetStepRef.current = resetStep;
  fPostControlStateRef.current = postControlState;
  fCurrentStepCountRef.current = currentStepCount;
  fOrderedSlidesRef.current = orderedSlides;
  fSlideIndexRef.current = slideIndex;
  fApplySlideOrderRef.current = applySlideOrder;
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
      const sig = `${msg.type}:${(msg as ControlCommand & { action?: string }).action ?? ""}:${(msg as ControlCommand & { index?: number }).index ?? ""}:${(msg as ControlCommand & { targetDeckId?: string }).targetDeckId ?? ""}:${(msg as ControlCommand & { targetSurface?: PresentationSurface }).targetSurface ?? ""}:${(msg as ControlCommand & { zoom?: number }).zoom ?? ""}:${(msg as ControlCommand & { slideIds?: string[] }).slideIds?.join(",") ?? ""}`;
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
      else if (msg.action === "reorder-slides") {
        const currentSlideId =
          fOrderedSlidesRef.current[fSlideIndexRef.current]?.id ?? "";
        const nextOrderIds = fApplySlideOrderRef.current(msg.slideIds);
        const nextOrderedSlides = buildOrderedSlides(deck.slides, nextOrderIds);
        const nextIndex = currentSlideId
          ? findSlideIndexById(nextOrderedSlides, currentSlideId)
          : -1;

        if (nextIndex >= 0 && nextIndex !== fSlideIndexRef.current) {
          setSlideIndex(nextIndex);
          window.location.hash = hashPrefix
            ? `${hashPrefix}/${deck.id}/${nextIndex}`
            : `#/${deck.id}/${nextIndex}`;
        }
      } else if (msg.action === "step-prev") fStepBackRef.current();
      else if (msg.action === "step-next") fStepForwardRef.current();
      else if (msg.action === "step-reset") fResetStepRef.current();
      else if (msg.action === "step-goto") {
        if (typeof msg.index !== "number") return;
        setStepIndex(
          Math.max(0, Math.min(msg.index, fCurrentStepCountRef.current - 1)),
        );
      } else if (
        msg.action === "toggle-fullscreen" &&
        shouldHandleSurfaceCommand(msg, "feed")
      ) {
        window.focus();
        if (document.fullscreenElement) {
          setFullscreenPromptVisible(false);
          document.exitFullscreen().catch(() => {});
        } else {
          requestFullscreenForRoot(rootRef.current)
            .then(() => setFullscreenPromptVisible(false))
            .catch(() => setFullscreenPromptVisible(true));
        }
      } else if (
        msg.action === "toggle-guides" &&
        shouldHandleSurfaceCommand(msg, "feed")
      ) {
        setShowGuides((v) => !v);
      } else if (
        msg.action === "toggle-crossbars" &&
        shouldHandleSurfaceCommand(msg, "feed")
      ) {
        setShowCrossbars((v) => !v);
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

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        setFullscreenPromptVisible(false);
      }
      postControlState();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [postControlState]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRESENTATION_ENGINE_CSS }} />
      <div
        className="pe-feed-root"
        ref={rootRef}
        aria-label={courseTitle}
        data-fullscreen-pending={fullscreenPromptVisible ? "true" : undefined}
      >
        <div className="pe-feed-frame">
          {/* ── Title + description area (replaces slide content) ── */}
          <div className="pe-feed-title-area">
            <div className="pe-feed-title-inner">
              <span className="pe-feed-deck-title">{feedPrimaryTitle}</span>
              {feedSecondaryTitle && (
                <span className="pe-feed-slide-title">
                  {feedSecondaryTitle}
                </span>
              )}
            </div>
          </div>

          {/* ── Video / PIP capture area ── */}
          <div className="pe-feed-video" aria-label="Video capture area">
            <svg
              className="pe-feed-guide-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {showGuides && (
                <>
                  <polyline
                    points="3,8 3,3 8,3"
                    fill="none"
                    stroke="rgba(226,230,240,0.85)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points="92,3 97,3 97,8"
                    fill="none"
                    stroke="rgba(226,230,240,0.85)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points="97,92 97,97 92,97"
                    fill="none"
                    stroke="rgba(226,230,240,0.85)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points="8,97 3,97 3,92"
                    fill="none"
                    stroke="rgba(226,230,240,0.85)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}
              {showCrossbars && (
                <>
                  <line
                    x1="50"
                    y1="0"
                    x2="50"
                    y2="5"
                    stroke="rgba(226,230,240,0.6)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="50"
                    y1="95"
                    x2="50"
                    y2="100"
                    stroke="rgba(226,230,240,0.6)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="0"
                    y1="50"
                    x2="5"
                    y2="50"
                    stroke="rgba(226,230,240,0.6)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="95"
                    y1="50"
                    x2="100"
                    y2="50"
                    stroke="rgba(226,230,240,0.6)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}
            </svg>
          </div>

          {/* ── Footer ── */}
          <div className="pe-feed-footer">
            <span className="pe-feed-subscribe-icon">{Icons.bell}</span>
            <span className="pe-feed-subscribe-text">{captureFooterLabel}</span>
            <span className="pe-feed-footer-dot">·</span>
            <span className="pe-feed-footer-x-icon">{Icons.twitter}</span>
            <span className="pe-feed-footer-x-capsule">
              {captureFooterHandle}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

interface PresentationControlPanelProps {
  deck: PresentationDeck;
  decks: PresentationDeck[];
  onExplore?: () => void;
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
  /** Optional React node rendered in the pc-header bar after the spacer, before the home button */
  headerBarSlot?: React.ReactNode;
  /** Hide the slide count / timer / zoom meta row in the header. */
  showHeaderMeta?: boolean;
  /** Optional transcript text to display instead of slide narration. */
  transcriptText?: string;
  /** Disable transcript editing controls while still showing transcript content. */
  allowTranscriptEditing?: boolean;
  /** External transcript text for the teleprompter (e.g. from IndexedDB for blank slides). */
  teleprompterText?: string;
  onDownloadLessonTranscript?: (language: TranscriptLanguageCode) => void;
  onDownloadCourseTranscript?: (
    language: TranscriptLanguageCode,
  ) => void | Promise<void>;
  onUploadLessonTranscript?: (
    language: TranscriptLanguageCode,
    text: string,
  ) => void | Promise<void>;
  onUploadCourseTranscript?: (
    language: TranscriptLanguageCode,
    text: string,
  ) => void | Promise<void>;
}

type ControlPanelMenuOption = {
  value: string;
  label: string;
  meta?: string;
  disabled?: boolean;
};

export function ControlPanelMenuSelect({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
  placeholder,
  variant = "sidebar",
  disabled = false,
}: {
  value: string;
  options: readonly ControlPanelMenuOption[];
  onChange: (value: string) => void;
  "aria-label": string;
  placeholder?: string;
  variant?: "sidebar" | "transcript" | "compact";
  disabled?: boolean;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const selectedOption =
    options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`pc-menu-select pc-menu-select-${variant}${open ? " open" : ""}`}
    >
      <button
        type="button"
        className="pc-menu-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
      >
        <span className="pc-menu-trigger-copy">
          <span className="pc-menu-trigger-value">
            {selectedOption?.label ?? placeholder ?? "Select"}
          </span>
          {selectedOption?.meta ? (
            <span className="pc-menu-trigger-meta">{selectedOption.meta}</span>
          ) : null}
        </span>
        <span className="pc-menu-trigger-icon" aria-hidden="true">
          expand_more
        </span>
      </button>
      {open ? (
        <div id={listboxId} role="listbox" className="pc-menu-panel">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className={`pc-menu-option${active ? " active" : ""}`}
                disabled={option.disabled}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="pc-menu-option-copy">
                  <span className="pc-menu-option-label">{option.label}</span>
                  {option.meta ? (
                    <span className="pc-menu-option-meta">{option.meta}</span>
                  ) : null}
                </span>
                <span className="pc-menu-option-check" aria-hidden="true">
                  {active ? "check" : ""}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function PresentationControlPanel({
  deck,
  decks,
  onExplore,
  onSelectDeck,
  onOpenPresenter,
  onOpenShorts,
  onOpenFeed,
  branding,
  controlChannelId = DEFAULT_CONTROL_CHANNEL,
  headerSlot,
  headerBarSlot,
  transcriptText,
  allowTranscriptEditing = true,
  teleprompterText,
  onDownloadLessonTranscript,
  onDownloadCourseTranscript,
  onUploadLessonTranscript,
  onUploadCourseTranscript,
}: PresentationControlPanelProps) {
  const brandLogoSrc =
    branding?.logoSrc ?? "/brand/og-image-template-1200x630.png";
  const brandIconUrl = branding?.brandIconUrl;
  const brandLabel = branding?.brandLabel ?? "Tutorial";
  const channelRef = useRef<BroadcastChannel | null>(null);
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(controlChannelId, "command");
  const zoomStorageKey = getZoomStorageKey(controlChannelId, deck.id);
  const activeTranscriptLinesStorageKey = getActiveTranscriptLinesStorageKey(
    controlChannelId,
    deck.id,
  );
  const { orderedSlides, slideOrderIds, applySlideOrder } = useOrderedSlides(
    controlChannelId,
    deck.id,
    deck.slides,
  );
  const transcriptScaleStorageKey = `${controlChannelId}:transcript-scale`;
  const transcriptLanguageStorageKey =
    getTranscriptLanguageStorageKey(controlChannelId);
  const teleprompterFocusLineStorageKey = `${controlChannelId}:teleprompter-focus-line`;
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);
  const [dropTargetSlideId, setDropTargetSlideId] = useState<string | null>(
    null,
  );
  const [selectedTranscriptLanguage, setSelectedTranscriptLanguage] =
    useState<TranscriptLanguageCode>(() =>
      readStoredTranscriptLanguage(transcriptLanguageStorageKey),
    );
  const buildDefaultControlState = (
    surface: PresentationSurface,
  ): ControlState => ({
    type: "state",
    deckId: deck.id,
    deckTitle: deck.title,
    slideIndex: 0,
    slideCount: orderedSlides.length,
    elapsed: 0,
    duration: orderedSlides[0]?.duration,
    zoom: readStoredSlideZoom(zoomStorageKey),
    enlarge: readSlideEnlarge(
      controlChannelId,
      deck.id,
      orderedSlides[0]?.id ?? "",
    ),
    slideTitle: getPresenterSlideTitle(orderedSlides[0]),
    narration: orderedSlides[0]?.narration,
    steps: orderedSlides[0]?.steps,
    stepIndex: 0,
    stepCount: orderedSlides[0]?.steps?.length ?? 0,
    surface,
    fullscreenActive: false,
    fullscreenPromptVisible: false,
    showGuides: false,
    showCrossbars: false,
  });
  const [activeSurface, setActiveSurface] = useState<PresentationSurface>(
    isShortDeck(deck.deckType) ? "shorts" : "presentation",
  );
  const activeSurfaceRef = useRef<PresentationSurface>(
    isShortDeck(deck.deckType) ? "shorts" : "presentation",
  );
  const [connectedSurfaces, setConnectedSurfaces] = useState<
    Record<PresentationSurface, boolean>
  >({
    presentation: false,
    shorts: false,
    feed: false,
  });
  const [surfaceStates, setSurfaceStates] = useState<
    Record<PresentationSurface, ControlState>
  >({
    presentation: buildDefaultControlState("presentation"),
    shorts: buildDefaultControlState("shorts"),
    feed: buildDefaultControlState("feed"),
  });
  const [deckTypeFilter, setDeckTypeFilter] = useState<DeckType | "all">("all");
  const availableDeckTypes = useMemo(() => {
    const types = new Set(
      decks.map((d) => {
        const dt = d.deckType ?? "course";
        return dt === "short-single" ? "short" : dt;
      }),
    );
    return Array.from(types) as DeckType[];
  }, [decks]);
  const showFilter = availableDeckTypes.length > 1;
  const filteredDecks =
    deckTypeFilter === "all"
      ? decks
      : deckTypeFilter === "short"
        ? decks.filter((d) => isShortDeck(d.deckType))
        : decks.filter((d) => (d.deckType ?? "course") === deckTypeFilter);
  const currentDeckInFilter = filteredDecks.some((d) => d.id === deck.id);
  const filteredDeckTypeLabel =
    deckTypeFilter === "all"
      ? "lesson"
      : deckTypeFilter === "short" || deckTypeFilter === "short-single"
        ? "short deck"
        : deckTypeFilter === "mono"
          ? "mono deck"
          : "course deck";
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
  const [activeTranscriptLineCount, setActiveTranscriptLineCount] =
    useState<number>(() => {
      try {
        const cachedItem = localStorage.getItem(
          activeTranscriptLinesStorageKey,
        );
        if (cachedItem != null) {
          const cachedValue = Number(cachedItem);
          if (ACTIVE_TRANSCRIPT_LINE_STOPS.includes(cachedValue)) {
            return cachedValue;
          }
        }
      } catch {
        // Ignore localStorage access issues.
      }
      return DEFAULT_ACTIVE_TRANSCRIPT_LINE_COUNT;
    });
  useEffect(() => {
    try {
      localStorage.setItem(
        activeTranscriptLinesStorageKey,
        String(activeTranscriptLineCount),
      );
    } catch {
      // Ignore localStorage access issues.
    }
  }, [activeTranscriptLineCount, activeTranscriptLinesStorageKey]);
  useEffect(() => {
    try {
      localStorage.setItem(
        transcriptLanguageStorageKey,
        selectedTranscriptLanguage,
      );
    } catch {
      // Ignore localStorage access issues.
    }
  }, [selectedTranscriptLanguage, transcriptLanguageStorageKey]);
  const [teleprompterFocusLineIndex, setTeleprompterFocusLineIndex] =
    useState<number>(() => {
      try {
        const cachedItem = localStorage.getItem(
          teleprompterFocusLineStorageKey,
        );
        if (cachedItem != null) {
          const cachedValue = Number(cachedItem);
          if (
            Number.isInteger(cachedValue) &&
            cachedValue >= 0 &&
            cachedValue < TELEPROMPTER_FOCUS_LINE_STOPS.length
          ) {
            return cachedValue;
          }
        }
      } catch {
        // Ignore localStorage access issues.
      }
      return DEFAULT_TELEPROMPTER_FOCUS_LINE_INDEX;
    });
  useEffect(() => {
    try {
      localStorage.setItem(
        teleprompterFocusLineStorageKey,
        String(teleprompterFocusLineIndex),
      );
    } catch {
      // Ignore localStorage access issues.
    }
  }, [teleprompterFocusLineIndex, teleprompterFocusLineStorageKey]);

  const [enlargeSaved, setEnlargeSaved] = useState(false);

  /* ── Camera preview state ──────────────────────────────────────────── */
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Enumerate video devices on mount
  useEffect(() => {
    let cancelled = false;
    async function enumerate() {
      try {
        // Need a temporary stream to prompt permission so labels are populated
        const tempStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        tempStream.getTracks().forEach((t) => t.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setCameraDevices(videoDevices);

        // Auto-select OBS Virtual Camera if present
        const obsDevice = videoDevices.find(
          (d) =>
            d.label.includes("OBS Virtual Camera") ||
            d.label.includes("OBS-Camera"),
        );
        setSelectedCameraId((prev) => {
          if (prev) return prev;
          return obsDevice?.deviceId ?? videoDevices[0]?.deviceId ?? "";
        });
      } catch {
        // Camera permission denied or not available — leave list empty.
      }
    }
    enumerate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Start / swap camera stream when selection changes
  useEffect(() => {
    if (!selectedCameraId) return;
    let cancelled = false;
    async function startCamera() {
      // Stop any existing stream
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCameraId } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        cameraStreamRef.current = stream;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      } catch {
        // Camera start failed — ignore.
      }
    }
    startCamera();
    return () => {
      cancelled = true;
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [selectedCameraId]);

  /* ── Editable transcript state ─────────────────────────────────────── */
  const [transcriptEditMode, setTranscriptEditMode] = useState(false);
  const activeTranscriptWindowRef = useRef<HTMLDivElement | null>(null);
  const transcriptEditKey = `${controlChannelId}:${deck.id}:transcript-edits`;

  /** Read a persisted transcript edit from localStorage, or return null. */
  const getEditedTranscript = useCallback(
    (
      slideIdx: number,
      language: TranscriptLanguageCode = selectedTranscriptLanguage,
    ): string | null => {
      try {
        const slide = orderedSlides[slideIdx];
        const stored = localStorage.getItem(transcriptEditKey);
        if (stored) {
          const edits = parseStoredTranscriptEditRecord(JSON.parse(stored));
          const editStorageId = slide?.id ?? String(slideIdx);
          const stableTranscript = resolveTranscriptEditForLanguage(
            edits[editStorageId],
            language,
          );
          if (stableTranscript != null && stableTranscript !== "") {
            return stableTranscript;
          }

          const legacyTranscript = resolveTranscriptEditForLanguage(
            edits[String(slideIdx)],
            language,
          );
          if (legacyTranscript == null || legacyTranscript === "") {
            return null;
          }

          if (
            slide?.steps?.length ||
            !looksLikeStepTranscriptEditValue(legacyTranscript)
          ) {
            return legacyTranscript;
          }
        }
      } catch {
        /* ignore */
      }
      return null;
    },
    [orderedSlides, selectedTranscriptLanguage, transcriptEditKey],
  );

  /** Persist a transcript edit to localStorage. Empty string = delete. */
  const setEditedTranscript = useCallback(
    (
      slideIdx: number,
      text: string,
      language: TranscriptLanguageCode = selectedTranscriptLanguage,
    ) => {
      try {
        const stored = localStorage.getItem(transcriptEditKey);
        const edits = stored
          ? parseStoredTranscriptEditRecord(JSON.parse(stored))
          : {};
        const slide = orderedSlides[slideIdx];
        const editStorageId = slide?.id ?? String(slideIdx);
        const legacyStorageId = String(slideIdx);
        const originalText = slide?.steps?.length
          ? formatStepTranscriptEditValue(slide.steps, language)
          : resolveSlideNarration(slide, language);
        if (text.trim() === "" || text === originalText) {
          const nextValue = writeTranscriptEditForLanguage(
            edits[editStorageId],
            language,
            "",
          );
          if (nextValue === undefined) {
            delete edits[editStorageId];
          } else {
            edits[editStorageId] = nextValue;
          }
          delete edits[legacyStorageId];
        } else {
          edits[editStorageId] = writeTranscriptEditForLanguage(
            edits[editStorageId],
            language,
            text,
          );
          if (legacyStorageId !== editStorageId) {
            delete edits[legacyStorageId];
          }
        }
        localStorage.setItem(transcriptEditKey, JSON.stringify(edits));
      } catch {
        /* ignore */
      }
    },
    [orderedSlides, selectedTranscriptLanguage, transcriptEditKey],
  );

  /** Check whether any edits exist for the current deck. */
  const hasAnyTranscriptEdits = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(transcriptEditKey);
      if (stored) {
        const edits = parseStoredTranscriptEditRecord(JSON.parse(stored));
        return hasTranscriptEdits(edits);
      }
    } catch {
      /* ignore */
    }
    return false;
  }, [transcriptEditKey]);

  const currentSlideIdx =
    surfaceStates[activeSurfaceRef.current]?.slideIndex ?? 0;
  const [editDraft, setEditDraft] = useState("");
  const editDraftSlideRef = useRef(-1);

  // Sync draft when slide changes or edit mode toggles
  useEffect(() => {
    if (transcriptEditMode) {
      const edited = getEditedTranscript(
        currentSlideIdx,
        selectedTranscriptLanguage,
      );
      const slide = orderedSlides[currentSlideIdx];
      const original = slide?.steps?.length
        ? formatStepTranscriptEditValue(slide.steps, selectedTranscriptLanguage)
        : resolveSlideNarration(slide, selectedTranscriptLanguage);
      setEditDraft(edited ?? original);
      editDraftSlideRef.current = currentSlideIdx;
    }
  }, [
    transcriptEditMode,
    currentSlideIdx,
    getEditedTranscript,
    orderedSlides,
    selectedTranscriptLanguage,
  ]);

  // Auto-save draft on change (debounced via the onBlur / onChange)
  const handleTranscriptDraftChange = useCallback(
    (text: string) => {
      setEditDraft(text);
      setEditedTranscript(currentSlideIdx, text, selectedTranscriptLanguage);
    },
    [currentSlideIdx, selectedTranscriptLanguage, setEditedTranscript],
  );

  const revertTranscriptEdit = useCallback(() => {
    setEditedTranscript(currentSlideIdx, "", selectedTranscriptLanguage);
    const slide = orderedSlides[currentSlideIdx];
    setEditDraft(
      slide?.steps?.length
        ? formatStepTranscriptEditValue(slide.steps, selectedTranscriptLanguage)
        : resolveSlideNarration(slide, selectedTranscriptLanguage),
    );
  }, [
    currentSlideIdx,
    orderedSlides,
    selectedTranscriptLanguage,
    setEditedTranscript,
  ]);

  useEffect(() => {
    if (!allowTranscriptEditing && transcriptEditMode) {
      setTranscriptEditMode(false);
    }
  }, [allowTranscriptEditing, transcriptEditMode]);

  useEffect(() => {
    const channel = new BroadcastChannel(controlChannelId);
    channelRef.current = channel;

    const onMessage = (ev: MessageEvent<ControlState>) => {
      const msg = ev.data;
      if (!msg || msg.type !== "state" || msg.deckId !== deck.id) return;
      setConnectedSurfaces((prev) => ({ ...prev, [msg.surface]: true }));
      setSurfaceStates((prev) => ({
        ...prev,
        [msg.surface]: hydrateControlStateEnlarge(
          controlChannelId,
          deck.id,
          orderedSlides,
          msg,
        ),
      }));
    };

    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== stateStorageKey || !ev.newValue) return;
      try {
        const msg = JSON.parse(ev.newValue) as ControlState;
        if (!msg || msg.type !== "state" || msg.deckId !== deck.id) return;
        setConnectedSurfaces((prev) => ({ ...prev, [msg.surface]: true }));
        setSurfaceStates((prev) => ({
          ...prev,
          [msg.surface]: hydrateControlStateEnlarge(
            controlChannelId,
            deck.id,
            orderedSlides,
            msg,
          ),
        }));
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
          setConnectedSurfaces((prev) => ({ ...prev, [msg.surface]: true }));
          setSurfaceStates((prev) => ({
            ...prev,
            [msg.surface]: hydrateControlStateEnlarge(
              controlChannelId,
              deck.id,
              orderedSlides,
              msg,
            ),
          }));
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
  }, [controlChannelId, deck.id, orderedSlides, stateStorageKey]);

  const send = useCallback(
    (cmd: ControlCommand) => {
      channelRef.current?.postMessage(cmd);
      localStorage.setItem(commandStorageKey, JSON.stringify(cmd));
    },
    [commandStorageKey],
  );

  const applyLocalNavigation = useCallback(
    (cmd: LocalNavigationCommand) => {
      const surface = activeSurfaceRef.current;

      setSurfaceStates((current) => {
        const previousState = current[surface];
        const previousSlideIndex = Math.max(
          0,
          Math.min(
            previousState.slideIndex,
            Math.max(orderedSlides.length - 1, 0),
          ),
        );
        const previousSlide = orderedSlides[previousSlideIndex];
        const previousStepCount = previousSlide?.steps?.length ?? 0;
        const previousStepIndex =
          previousStepCount > 0
            ? Math.min(previousState.stepIndex, previousStepCount - 1)
            : 0;

        let nextSlideIndex = previousSlideIndex;
        let nextStepIndex = previousStepIndex;

        if (cmd.action === "goto") {
          nextSlideIndex = Math.max(
            0,
            Math.min(cmd.index, Math.max(orderedSlides.length - 1, 0)),
          );
          nextStepIndex = 0;
        } else if (cmd.action === "step-goto") {
          if (previousStepCount > 0) {
            nextStepIndex = Math.max(
              0,
              Math.min(cmd.index, previousStepCount - 1),
            );
          }
        } else if (cmd.action === "prev") {
          if (previousStepCount > 0 && previousStepIndex > 0) {
            nextStepIndex = previousStepIndex - 1;
          } else {
            nextSlideIndex = Math.max(0, previousSlideIndex - 1);
            nextStepIndex = 0;
          }
        } else if (
          previousStepCount > 0 &&
          previousStepIndex < previousStepCount - 1
        ) {
          nextStepIndex = previousStepIndex + 1;
        } else {
          nextSlideIndex = Math.min(
            orderedSlides.length - 1,
            previousSlideIndex + 1,
          );
          nextStepIndex = 0;
        }

        const nextSlide = orderedSlides[nextSlideIndex];
        const nextStepCount = nextSlide?.steps?.length ?? 0;

        return {
          ...current,
          [surface]: {
            ...previousState,
            deckId: deck.id,
            deckTitle: deck.title,
            slideIndex: nextSlideIndex,
            slideCount: orderedSlides.length,
            elapsed: 0,
            duration: nextSlide?.duration,
            slideTitle: getPresenterSlideTitle(nextSlide),
            narration: nextSlide?.narration,
            steps: nextSlide?.steps,
            stepIndex:
              nextStepCount > 0
                ? Math.max(0, Math.min(nextStepIndex, nextStepCount - 1))
                : 0,
            stepCount: nextStepCount,
            surface,
          },
        };
      });
    },
    [deck.id, deck.title, orderedSlides],
  );

  const dispatchNavigation = useCallback(
    (cmd: LocalNavigationCommand) => {
      applyLocalNavigation(cmd);

      if (connectedSurfaces[activeSurfaceRef.current]) {
        send(cmd);
      }
    },
    [applyLocalNavigation, connectedSurfaces, send],
  );

  const requestState = useCallback(() => {
    channelRef.current?.postMessage({ type: "request-state", deckId: deck.id });
  }, [deck.id]);

  const commitSlideOrder = useCallback(
    (nextSlideIds: string[]) => {
      const nextOrderIds = applySlideOrder(nextSlideIds);
      send({
        type: "command",
        deckId: deck.id,
        action: "reorder-slides",
        slideIds: nextOrderIds,
      });
      requestState();
      return nextOrderIds;
    },
    [applySlideOrder, deck.id, requestState, send],
  );

  const clearJumpDragState = useCallback(() => {
    setDraggedSlideId(null);
    setDropTargetSlideId(null);
  }, []);

  const handleJumpDragStart = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, slideId: string) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", slideId);
      setDraggedSlideId(slideId);
      setDropTargetSlideId(slideId);
    },
    [],
  );

  const handleJumpDragOver = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, slideId: string) => {
      if (!draggedSlideId || draggedSlideId === slideId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDropTargetSlideId(slideId);
    },
    [draggedSlideId],
  );

  const handleJumpDrop = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, targetSlideId: string) => {
      event.preventDefault();
      const draggedId =
        event.dataTransfer.getData("text/plain") || draggedSlideId;

      if (!draggedId || draggedId === targetSlideId) {
        clearJumpDragState();
        return;
      }

      const nextOrderIds = moveSlideId(slideOrderIds, draggedId, targetSlideId);
      commitSlideOrder(nextOrderIds);
      clearJumpDragState();
    },
    [clearJumpDragState, commitSlideOrder, draggedSlideId, slideOrderIds],
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

  const selectSurface = useCallback((surface: PresentationSurface) => {
    activeSurfaceRef.current = surface;
    setActiveSurface(surface);
  }, []);

  useEffect(() => {
    const preferredOrder: PresentationSurface[] = isShortDeck(deck.deckType)
      ? ["shorts", "feed", "presentation"]
      : ["presentation", "shorts", "feed"];

    if (connectedSurfaces[activeSurface]) return;

    const nextSurface = preferredOrder.find(
      (surface) => connectedSurfaces[surface],
    );
    if (nextSurface && nextSurface !== activeSurface) {
      selectSurface(nextSurface);
    }
  }, [activeSurface, connectedSurfaces, deck.deckType, selectSurface]);

  useEffect(() => {
    requestState();
    const timeoutId = window.setTimeout(() => {
      requestState();
    }, 150);
    return () => window.clearTimeout(timeoutId);
  }, [activeSurface, requestState]);

  const activeState = hydrateControlStateEnlarge(
    controlChannelId,
    deck.id,
    orderedSlides,
    surfaceStates[activeSurface],
  );
  const currentSlideHasSteps = activeState.stepCount > 0;
  const currentSlide = orderedSlides[activeState.slideIndex];
  const currentSlideNarration = resolveSlideNarration(
    currentSlide,
    selectedTranscriptLanguage,
  );
  const currentSlideSteps = resolveStepsForLanguage(
    currentSlide?.steps,
    selectedTranscriptLanguage,
  );
  const activeTranscriptLanguageLabel =
    TRANSCRIPT_LANGUAGE_OPTIONS.find(
      (option) => option.value === selectedTranscriptLanguage,
    )?.label ?? selectedTranscriptLanguage.toUpperCase();
  const connected = Object.values(connectedSurfaces).some(Boolean);
  const atStart =
    activeState.slideIndex <= 0 &&
    (activeState.stepCount === 0 || activeState.stepIndex <= 0);
  const atEnd =
    activeState.slideIndex >= activeState.slideCount - 1 &&
    (activeState.stepCount === 0 ||
      activeState.stepIndex >= activeState.stepCount - 1);

  const scrollActiveTranscriptWindow = useCallback(
    (direction: "up" | "down") => {
      if (transcriptEditMode || activeState.stepCount <= 0) {
        return false;
      }

      const transcriptWindow = activeTranscriptWindowRef.current;
      if (!transcriptWindow) {
        return false;
      }

      const scrollAmount = Math.max(transcriptWindow.clientHeight - 32, 48);
      transcriptWindow.scrollBy({
        top: direction === "down" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
      return true;
    },
    [activeState.stepCount, transcriptEditMode],
  );

  /* ── Keyboard: ArrowLeft / ArrowRight → prev / next slide ──────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const didScroll = scrollActiveTranscriptWindow(
          e.key === "ArrowDown" ? "down" : "up",
        );
        if (didScroll) {
          e.preventDefault();
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        dispatchNavigation({
          type: "command",
          deckId: deck.id,
          action: "prev",
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        dispatchNavigation({
          type: "command",
          deckId: deck.id,
          action: "next",
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck.id, dispatchNavigation, scrollActiveTranscriptWindow]);

  const transcriptFontScale =
    TRANSCRIPT_FONT_SCALE_STOPS[transcriptScaleIndex] ??
    TRANSCRIPT_FONT_SCALE_STOPS[DEFAULT_TRANSCRIPT_FONT_SCALE_INDEX];
  const teleprompterFocusLinePosition =
    TELEPROMPTER_FOCUS_LINE_STOPS[teleprompterFocusLineIndex] ??
    TELEPROMPTER_FOCUS_LINE_STOPS[DEFAULT_TELEPROMPTER_FOCUS_LINE_INDEX];
  const guidesOn = activeState.showGuides;
  const crossbarsOn = activeState.showCrossbars;
  const [teleprompterOn, setTeleprompterOn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lessonTranscriptUploadInputRef = useRef<HTMLInputElement | null>(null);
  const courseTranscriptUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [transcriptUploadBusy, setTranscriptUploadBusy] = useState<
    "lesson" | "course" | null
  >(null);
  const fullscreenOn =
    activeState.fullscreenActive || activeState.fullscreenPromptVisible;

  const readTranscriptUploadText = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
            return;
          }

          reject(new Error("Could not read transcript file."));
        };
        reader.onerror = () =>
          reject(new Error("Could not read transcript file."));
        reader.readAsText(file);
      });
    },
    [],
  );

  const handleTranscriptUploadSelection = useCallback(
    async (
      action: "lesson" | "course",
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) {
        return;
      }

      try {
        setTranscriptUploadBusy(action);
        const text = await readTranscriptUploadText(file);
        if (action === "lesson") {
          if (onUploadLessonTranscript) {
            void onUploadLessonTranscript(selectedTranscriptLanguage, text);
          }
          return;
        }

        if (onUploadCourseTranscript) {
          void onUploadCourseTranscript(selectedTranscriptLanguage, text);
        }
      } finally {
        setTranscriptUploadBusy(null);
      }
    },
    [
      onUploadCourseTranscript,
      onUploadLessonTranscript,
      readTranscriptUploadText,
      selectedTranscriptLanguage,
    ],
  );
  const cameraMenuOptions = cameraDevices.map((device) => ({
    value: device.deviceId,
    label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
  }));
  const lessonMenuOptions = filteredDecks.map((lessonDeck) => ({
    value: lessonDeck.id,
    label: `${lessonDeck.number}. ${sanitizePresentationTitle(lessonDeck.title)}`,
    meta: isShortDeck(lessonDeck.deckType)
      ? "Short"
      : lessonDeck.deckType === "mono"
        ? "Mono"
        : "Course",
  }));
  const zoomMenuOptions: ControlPanelMenuOption[] = [
    "1.00",
    "1.05",
    "1.08",
    "1.10",
    "1.12",
    "1.15",
    "1.20",
    "1.25",
    "1.30",
    "1.40",
    "1.50",
    "1.60",
    "1.75",
    "2.00",
    "2.25",
    "2.50",
  ].map((zoomValue) => ({
    value: zoomValue,
    label: `${zoomValue}x`,
    meta: zoomValue === activeState.zoom.toFixed(2) ? "Live" : undefined,
  }));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRESENTATION_ENGINE_CSS }} />
      <div className="pc-root">
        <div className="pc-body">
          <aside className="pc-sidebar">
            <div className="pc-camera-preview">
              {cameraDevices.length > 0 ? (
                <>
                  <video
                    ref={cameraVideoRef}
                    className="pc-camera-video"
                    autoPlay
                    muted
                    playsInline
                  />
                  <ControlPanelMenuSelect
                    value={selectedCameraId}
                    options={cameraMenuOptions}
                    onChange={setSelectedCameraId}
                    aria-label="Select camera"
                    placeholder="Select camera"
                    variant="compact"
                  />
                </>
              ) : (
                <div className="pc-camera-placeholder">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="15" height="14" rx="2" />
                    <path d="M17 9l5-3v12l-5-3" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                  Camera off
                </div>
              )}
            </div>
            <div className="pc-lessons">
              {headerSlot}
              {showFilter && (
                <div className="pc-sidebar-control-group">
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
                        {dt === "short" || dt === "short-single"
                          ? "📱 Short"
                          : dt === "mono"
                            ? "▶ Mono"
                            : "📚 Course"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="pc-sidebar-control-group">
                <span className="pc-section-label">Jump Lesson</span>
                <ControlPanelMenuSelect
                  value={currentDeckInFilter ? deck.id : ""}
                  options={lessonMenuOptions}
                  onChange={handleSelectDeck}
                  aria-label="Jump to lesson"
                  placeholder={`Select a ${filteredDeckTypeLabel}`}
                />
              </div>

              <div className="pc-sidebar-control-group">
                <span className="pc-section-label">Slide Zoom</span>
                <ControlPanelMenuSelect
                  value={activeState.zoom.toFixed(2)}
                  options={zoomMenuOptions}
                  onChange={(zoomValue) => {
                    const nextZoom = parseFloat(zoomValue);
                    setSurfaceStates((current) => ({
                      ...current,
                      [activeSurface]: {
                        ...current[activeSurface],
                        zoom: nextZoom,
                      },
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
                />
              </div>

              <div className="pc-sidebar-control-group">
                <span className="pc-section-label">Transcript Language</span>
                <ControlPanelMenuSelect
                  value={selectedTranscriptLanguage}
                  options={TRANSCRIPT_LANGUAGE_OPTIONS}
                  onChange={(value) =>
                    setSelectedTranscriptLanguage(
                      value as TranscriptLanguageCode,
                    )
                  }
                  aria-label="Select transcript language"
                />
              </div>

              <div className="pc-sidebar-control-group">
                <span className="pc-section-label">Slide Enlarge</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="number"
                    className="pc-field-input"
                    style={{ flex: 1 }}
                    value={activeState.enlarge}
                    min={ENLARGE_MIN}
                    max={ENLARGE_MAX}
                    step={ENLARGE_STEP}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);
                      if (Number.isNaN(raw)) return;
                      const nextEnlarge =
                        Math.round(
                          Math.max(ENLARGE_MIN, Math.min(ENLARGE_MAX, raw)) *
                            100,
                        ) / 100;
                      const slideId =
                        orderedSlides[activeState.slideIndex]?.id ?? "";
                      setSurfaceStates((current) => ({
                        ...current,
                        [activeSurface]: {
                          ...current[activeSurface],
                          enlarge: nextEnlarge,
                        },
                      }));
                      writeSlideEnlarge(
                        controlChannelId,
                        deck.id,
                        slideId,
                        nextEnlarge,
                      );
                      send({
                        type: "command",
                        deckId: deck.id,
                        action: "set-enlarge",
                        slideId,
                        enlarge: nextEnlarge,
                      });
                    }}
                    aria-label="Slide enlarge"
                  />
                  <button
                    className="pc-btn"
                    style={{
                      fontSize: 11,
                      padding: "4px 8px",
                      minWidth: 0,
                      whiteSpace: "nowrap",
                      ...(enlargeSaved
                        ? {
                            background: "var(--tf-state-success-bg)",
                            borderColor: "var(--tf-color-success)",
                            color: "var(--tf-color-success)",
                          }
                        : {}),
                      transition: "all 0.2s",
                    }}
                    onClick={() => {
                      persistAllEnlargeValues(
                        controlChannelId,
                        deck.id,
                        deck.slides,
                      );
                      setEnlargeSaved(true);
                      setTimeout(() => setEnlargeSaved(false), 1500);
                    }}
                    title="Persist all slide enlarge values to local storage"
                    aria-label="Persist enlarge"
                  >
                    {enlargeSaved ? "Saved ✓" : "Save"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pc-controls">
              <button
                className="pc-btn"
                onClick={() =>
                  dispatchNavigation({
                    type: "command",
                    deckId: deck.id,
                    action: "prev",
                  })
                }
                disabled={atStart}
              >
                Previous
              </button>
              <button
                className="pc-btn"
                onClick={() =>
                  dispatchNavigation({
                    type: "command",
                    deckId: deck.id,
                    action: "next",
                  })
                }
                disabled={atEnd}
              >
                Next
              </button>
            </div>

            <div className="pc-jump">
              {orderedSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  className={`pc-jump-item ${idx === activeState.slideIndex ? "active" : ""}${draggedSlideId === slide.id ? " dragging" : ""}${dropTargetSlideId === slide.id && draggedSlideId !== slide.id ? " drop-target" : ""}`}
                  draggable
                  onDragStart={(event) => handleJumpDragStart(event, slide.id)}
                  onDragOver={(event) => handleJumpDragOver(event, slide.id)}
                  onDrop={(event) => handleJumpDrop(event, slide.id)}
                  onDragEnd={clearJumpDragState}
                  onClick={() => {
                    dispatchNavigation({
                      type: "command",
                      deckId: deck.id,
                      action: "goto",
                      index: idx,
                    });
                  }}
                  title={slide.title}
                >
                  <span className="pc-jump-index">{idx + 1}</span>
                  <span className="pc-jump-handle" aria-hidden="true">
                    drag_indicator
                  </span>
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
            <div className="pc-transcript-main">
              {transcriptEditMode ? (
                <>
                  <textarea
                    className="pc-transcript-textarea"
                    value={editDraft}
                    onChange={(e) =>
                      handleTranscriptDraftChange(e.target.value)
                    }
                    placeholder={
                      currentSlideHasSteps
                        ? "# Step 1\nShort summary for the first step.\n\n# Step 2\nShort summary for the next step…"
                        : "Type your updated transcript here…"
                    }
                    spellCheck
                  />
                  {currentSlideNarration &&
                    getEditedTranscript(
                      activeState.slideIndex,
                      selectedTranscriptLanguage,
                    ) != null && (
                      <div className="pc-transcript-original">
                        <div className="pc-transcript-original-label">
                          Original
                        </div>
                        <div className="pc-transcript-original-text">
                          {currentSlideNarration}
                        </div>
                        <button
                          type="button"
                          className="pc-transcript-revert-btn"
                          onClick={revertTranscriptEdit}
                        >
                          Revert to original
                        </button>
                      </div>
                    )}
                </>
              ) : (
                <div className="pc-transcript-body">
                  {(() => {
                    const editedText = getEditedTranscript(
                      activeState.slideIndex,
                      selectedTranscriptLanguage,
                    );
                    const editedSteps =
                      activeState.stepCount > 0 && currentSlideSteps.length
                        ? parseStepTranscriptEditValue(
                            editedText ?? "",
                            currentSlideSteps,
                            selectedTranscriptLanguage,
                          )
                        : currentSlideSteps;
                    if (activeState.stepCount > 0 && editedSteps.length) {
                      const activeEditedStep =
                        editedSteps[
                          Math.min(
                            activeState.stepIndex,
                            Math.max(editedSteps.length - 1, 0),
                          )
                        ] ?? null;
                      const activeStepNumber = Math.min(
                        activeState.stepIndex + 1,
                        activeState.stepCount,
                      );
                      const activeTranscriptCardClassName =
                        `pc-transcript-current ${activeStepNumber <= 1 ? "first-step" : ""} ${activeStepNumber >= activeState.stepCount ? "last-step" : ""}`.trim();
                      const activeTranscriptLineIndex =
                        ACTIVE_TRANSCRIPT_LINE_STOPS.indexOf(
                          activeTranscriptLineCount,
                        );

                      return (
                        <>
                          <div
                            className={activeTranscriptCardClassName}
                            key={
                              activeEditedStep?.id ??
                              `step-${activeState.stepIndex}`
                            }
                            style={
                              {
                                "--pc-transcript-window-lines": String(
                                  activeTranscriptLineCount,
                                ),
                              } as React.CSSProperties
                            }
                          >
                            <div className="pc-transcript-current-title">
                              <span className="pc-transcript-current-label">
                                Active Transcript
                              </span>
                              <span className="pc-transcript-current-title-right">
                                <span className="pc-transcript-current-step">
                                  Step {activeStepNumber} /{" "}
                                  {activeState.stepCount}
                                </span>
                                <span className="pc-transcript-height-controls">
                                  <button
                                    type="button"
                                    className="pc-transcript-height-btn"
                                    onClick={() =>
                                      setActiveTranscriptLineCount(
                                        ACTIVE_TRANSCRIPT_LINE_STOPS[
                                          Math.max(
                                            activeTranscriptLineIndex - 1,
                                            0,
                                          )
                                        ] ??
                                          DEFAULT_ACTIVE_TRANSCRIPT_LINE_COUNT,
                                      )
                                    }
                                    disabled={activeTranscriptLineIndex <= 0}
                                    aria-label="Decrease active transcript height"
                                  >
                                    -
                                  </button>
                                  <button
                                    type="button"
                                    className="pc-transcript-height-btn"
                                    onClick={() =>
                                      setActiveTranscriptLineCount(
                                        ACTIVE_TRANSCRIPT_LINE_STOPS[
                                          Math.min(
                                            activeTranscriptLineIndex + 1,
                                            ACTIVE_TRANSCRIPT_LINE_STOPS.length -
                                              1,
                                          )
                                        ] ??
                                          DEFAULT_ACTIVE_TRANSCRIPT_LINE_COUNT,
                                      )
                                    }
                                    disabled={
                                      activeTranscriptLineIndex >=
                                      ACTIVE_TRANSCRIPT_LINE_STOPS.length - 1
                                    }
                                    aria-label="Increase active transcript height"
                                  >
                                    +
                                  </button>
                                </span>
                              </span>
                            </div>
                            <div
                              ref={activeTranscriptWindowRef}
                              className="pc-transcript-current-window"
                            >
                              <div className="pc-transcript-current-text">
                                {activeEditedStep?.transcript}
                              </div>
                            </div>
                          </div>

                          <div className="pc-transcript-steps-header">
                            <span className="pc-transcript-steps-label">
                              All Steps
                            </span>
                            <span className="pc-transcript-steps-hint">
                              Click any step to jump
                            </span>
                          </div>

                          <div className="pc-transcript-steps">
                            {editedSteps.map((step, index) => (
                              <button
                                key={step.id}
                                type="button"
                                className={`pc-transcript-step ${index === activeState.stepIndex ? "active" : ""} ${index < activeState.stepIndex ? "complete" : ""}`}
                                onClick={() =>
                                  dispatchNavigation({
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
                                  {summarizeStepTranscript(step.transcript)}
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      );
                    }
                    const transcriptContent = resolveTranscriptContent({
                      narration: currentSlideNarration,
                      transcriptText,
                      editedText,
                    });
                    if (
                      !transcriptContent.usesExternalTranscript &&
                      editedText != null &&
                      currentSlideNarration
                    ) {
                      return (
                        <>
                          <div className="pc-transcript-split-section">
                            <div className="pc-transcript-split-label edited">
                              Edited
                            </div>
                            <div className="pc-transcript-split-text edited">
                              {editedText}
                            </div>
                          </div>
                          <div className="pc-transcript-split-section">
                            <div className="pc-transcript-split-label original">
                              Original
                            </div>
                            <div className="pc-transcript-split-text original">
                              {currentSlideNarration}
                            </div>
                            <button
                              type="button"
                              className="pc-transcript-revert-btn"
                              onClick={revertTranscriptEdit}
                              style={{ marginTop: "8px" }}
                            >
                              Revert to original
                            </button>
                          </div>
                        </>
                      );
                    }
                    if (transcriptContent.displayText) {
                      return (
                        <div className="pc-transcript-text">
                          {transcriptContent.displayText}
                        </div>
                      );
                    }
                    return (
                      <div className="pc-transcript-empty">
                        No transcript for this slide.
                      </div>
                    );
                  })()}
                </div>
              )}
              {teleprompterOn && activeState.stepCount === 0 && (
                <TeleprompterOverlay
                  text={
                    teleprompterText !== undefined
                      ? teleprompterText
                      : resolveTranscriptContent({
                          narration: currentSlideNarration,
                          transcriptText,
                          editedText: getEditedTranscript(
                            activeState.slideIndex,
                            selectedTranscriptLanguage,
                          ),
                        }).displayText
                  }
                  visible={teleprompterOn}
                  onClose={() => setTeleprompterOn(false)}
                  baseFontSize={14 * transcriptFontScale}
                  focusLinePosition={teleprompterFocusLinePosition}
                />
              )}
            </div>

            <aside className="pc-transcript-rail">
              {/* ── Connection ── */}
              <div
                className="pc-dock-dot"
                style={{
                  background: connected
                    ? "var(--tf-color-success)"
                    : "var(--tf-text-muted)",
                  boxShadow: connected
                    ? "0 0 8px var(--tf-color-success)"
                    : "none",
                }}
                title={
                  connected
                    ? `Connected · ${activeSurface}`
                    : "No slide window connected"
                }
                aria-label={connected ? "Connected" : "Disconnected"}
              />

              <div className="pc-dock-divider" aria-hidden="true" />

              {/* ── Navigation ── */}
              {onExplore ? (
                <button
                  className="pc-dock-btn"
                  onClick={onExplore}
                  data-tip="Back"
                  aria-label="Back to explore"
                >
                  {Icons.back}
                </button>
              ) : null}
              <button
                className="pc-dock-btn"
                onClick={() => setSettingsOpen(true)}
                data-tip="Settings"
                aria-label="Open settings"
              >
                {Icons.settings}
              </button>

              <div className="pc-dock-divider" aria-hidden="true" />

              {/* ── Windows ── */}
              {onOpenPresenter ? (
                <button
                  className={`pc-dock-btn${activeSurface === "presentation" ? " active" : ""}`}
                  onClick={() => {
                    selectSurface("presentation");
                    onOpenPresenter();
                  }}
                  data-tip="16:9"
                  aria-label="Open 16:9 slide window"
                >
                  {Icons.pip}
                </button>
              ) : null}
              {onOpenShorts && supportsShortsCapture(deck) ? (
                <button
                  className={`pc-dock-btn${activeSurface === "shorts" ? " active" : ""}`}
                  onClick={() => {
                    selectSurface("shorts");
                    onOpenShorts();
                  }}
                  data-tip="9:16"
                  aria-label="Open 9:16 slide window"
                >
                  {Icons.shorts}
                </button>
              ) : null}
              {onOpenFeed && isFeedCapable(deck.deckType) ? (
                <button
                  className={`pc-dock-btn${activeSurface === "feed" ? " active" : ""}`}
                  onClick={() => {
                    selectSurface("feed");
                    onOpenFeed();
                  }}
                  data-tip="4:5"
                  aria-label="Open 4:5 slide window"
                >
                  {Icons.shorts}
                </button>
              ) : null}

              <div className="pc-dock-divider" aria-hidden="true" />

              {/* ── View ── */}
              <button
                className={`pc-dock-btn${fullscreenOn ? " active" : ""}`}
                onClick={() =>
                  send({
                    type: "command",
                    deckId: deck.id,
                    action: "toggle-fullscreen",
                    targetSurface: activeSurfaceRef.current,
                  })
                }
                disabled={!connected}
                data-tip="Fullscreen"
                aria-label="Toggle fullscreen"
              >
                {Icons.fullscreen}
              </button>
              <button
                className={`pc-dock-btn${guidesOn ? " active" : ""}`}
                onClick={() =>
                  send({
                    type: "command",
                    deckId: deck.id,
                    action: "toggle-guides",
                    targetSurface: activeSurfaceRef.current,
                  })
                }
                disabled={!connected}
                data-tip="Guides"
                aria-label="Toggle guides"
              >
                {Icons.guides}
              </button>
              <button
                className={`pc-dock-btn${crossbarsOn ? " active" : ""}`}
                onClick={() =>
                  send({
                    type: "command",
                    deckId: deck.id,
                    action: "toggle-crossbars",
                    targetSurface: activeSurfaceRef.current,
                  })
                }
                disabled={!connected}
                data-tip="Crossbars"
                aria-label="Toggle crossbars"
              >
                {Icons.crossbars}
              </button>
              <button
                className={`pc-dock-btn${teleprompterOn ? " active" : ""}`}
                onClick={() => setTeleprompterOn((v) => !v)}
                data-tip="Teleprompter"
                aria-label="Toggle teleprompter"
              >
                {Icons.teleprompter}
              </button>
              <button
                className="pc-dock-btn"
                onClick={() =>
                  setTeleprompterFocusLineIndex(
                    Math.max(0, teleprompterFocusLineIndex - 1),
                  )
                }
                disabled={teleprompterFocusLineIndex <= 0}
                data-tip="Raise prompt line"
                aria-label="Raise teleprompter line"
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                  }}
                >
                  T↑
                </span>
              </button>
              <button
                className="pc-dock-btn"
                onClick={() =>
                  setTeleprompterFocusLineIndex(
                    Math.min(
                      TELEPROMPTER_FOCUS_LINE_STOPS.length - 1,
                      teleprompterFocusLineIndex + 1,
                    ),
                  )
                }
                disabled={
                  teleprompterFocusLineIndex >=
                  TELEPROMPTER_FOCUS_LINE_STOPS.length - 1
                }
                data-tip="Lower prompt line"
                aria-label="Lower teleprompter line"
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                  }}
                >
                  T↓
                </span>
              </button>

              {/* ── Steps ── */}
              {activeState.stepCount > 0 ? (
                <>
                  <div className="pc-dock-divider" aria-hidden="true" />
                  <button
                    className="pc-dock-btn"
                    onClick={() =>
                      send({
                        type: "command",
                        deckId: deck.id,
                        action: "step-goto",
                        index: Math.max(0, activeState.stepIndex - 1),
                      })
                    }
                    disabled={!connected || activeState.stepIndex <= 0}
                    data-tip="Step back"
                    aria-label="Step back"
                  >
                    {Icons.chevLeft}
                  </button>
                  <span className="pc-dock-counter">
                    {Math.min(activeState.stepIndex + 1, activeState.stepCount)}
                    /{activeState.stepCount}
                  </span>
                  <button
                    className="pc-dock-btn"
                    data-testid="presentation-step-next"
                    onClick={() =>
                      send({
                        type: "command",
                        deckId: deck.id,
                        action: "step-goto",
                        index: Math.min(
                          activeState.stepCount - 1,
                          activeState.stepIndex + 1,
                        ),
                      })
                    }
                    disabled={
                      !connected ||
                      activeState.stepIndex >= activeState.stepCount - 1
                    }
                    data-tip="Next step"
                    aria-label="Next step"
                  >
                    {Icons.chevRight}
                  </button>
                  <button
                    className="pc-dock-btn"
                    onClick={() =>
                      send({
                        type: "command",
                        deckId: deck.id,
                        action: "step-reset",
                      })
                    }
                    disabled={!connected || activeState.stepIndex <= 0}
                    data-tip="Reset"
                    aria-label="Reset steps"
                  >
                    {Icons.reset}
                  </button>
                </>
              ) : null}

              <div className="pc-dock-divider" aria-hidden="true" />

              {/* ── Transcript ── */}
              {onDownloadLessonTranscript ? (
                <button
                  className="pc-dock-btn"
                  onClick={() =>
                    onDownloadLessonTranscript(selectedTranscriptLanguage)
                  }
                  data-tip={`Download lesson transcript · ${activeTranscriptLanguageLabel}`}
                  aria-label="Download lesson transcript"
                >
                  {Icons.transcriptLesson}
                </button>
              ) : null}
              {onDownloadCourseTranscript ? (
                <button
                  className="pc-dock-btn"
                  onClick={() => {
                    void onDownloadCourseTranscript(selectedTranscriptLanguage);
                  }}
                  data-tip={`Download course transcript · ${activeTranscriptLanguageLabel}`}
                  aria-label="Download course transcript"
                >
                  {Icons.transcriptCourse}
                </button>
              ) : null}
              {onUploadLessonTranscript ? (
                <>
                  <input
                    ref={lessonTranscriptUploadInputRef}
                    type="file"
                    accept=".txt,.md,text/plain"
                    style={{ display: "none" }}
                    onChange={(event) => {
                      void handleTranscriptUploadSelection("lesson", event);
                    }}
                  />
                  <button
                    className="pc-dock-btn"
                    onClick={() =>
                      lessonTranscriptUploadInputRef.current?.click()
                    }
                    disabled={transcriptUploadBusy !== null}
                    data-tip={`Upload lesson transcript · ${activeTranscriptLanguageLabel}`}
                    aria-label="Upload lesson transcript"
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: "0.04em",
                      }}
                    >
                      L↑
                    </span>
                  </button>
                </>
              ) : null}
              {onUploadCourseTranscript ? (
                <>
                  <input
                    ref={courseTranscriptUploadInputRef}
                    type="file"
                    accept=".txt,.md,text/plain"
                    style={{ display: "none" }}
                    onChange={(event) => {
                      void handleTranscriptUploadSelection("course", event);
                    }}
                  />
                  <button
                    className="pc-dock-btn"
                    onClick={() =>
                      courseTranscriptUploadInputRef.current?.click()
                    }
                    disabled={transcriptUploadBusy !== null}
                    data-tip={`Upload course transcript · ${activeTranscriptLanguageLabel}`}
                    aria-label="Upload course transcript"
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: "0.04em",
                      }}
                    >
                      C↑
                    </span>
                  </button>
                </>
              ) : null}
              {allowTranscriptEditing ? (
                <button
                  className={`pc-dock-btn${transcriptEditMode ? " active" : ""}`}
                  onClick={() => setTranscriptEditMode((m) => !m)}
                  data-tip={transcriptEditMode ? "Done editing" : "Edit"}
                  aria-label="Edit transcript"
                >
                  {hasAnyTranscriptEdits() && !transcriptEditMode && (
                    <span className="pc-edit-dot" />
                  )}
                  {Icons.edit}
                </button>
              ) : null}
              <button
                className="pc-dock-btn"
                onClick={() =>
                  setTranscriptScaleIndex(Math.max(0, transcriptScaleIndex - 1))
                }
                disabled={transcriptScaleIndex <= 0}
                data-tip="Smaller text"
                aria-label="Decrease transcript size"
              >
                {Icons.textDown}
              </button>
              <button
                className="pc-dock-btn"
                onClick={() =>
                  setTranscriptScaleIndex(
                    Math.min(
                      TRANSCRIPT_FONT_SCALE_STOPS.length - 1,
                      transcriptScaleIndex + 1,
                    ),
                  )
                }
                disabled={
                  transcriptScaleIndex >= TRANSCRIPT_FONT_SCALE_STOPS.length - 1
                }
                data-tip="Larger text"
                aria-label="Increase transcript size"
              >
                {Icons.textUp}
              </button>

              {/* ── Brand ── */}
              <div className="pc-dock-spacer" />
              <img
                className="pc-dock-brand"
                src={brandIconUrl || brandLogoSrc}
                alt={brandLabel}
                title={brandLabel}
              />
            </aside>

            {/* ── Settings dialog ── */}
            {settingsOpen && (
              <div
                className="pc-settings-backdrop"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSettingsOpen(false);
                }}
              >
                <div className="pc-settings-dialog">
                  <button
                    className="pc-settings-close"
                    onClick={() => setSettingsOpen(false)}
                    aria-label="Close settings"
                  >
                    ×
                  </button>
                  {headerBarSlot}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
