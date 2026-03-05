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

import React, { useState, useEffect, useCallback, useRef } from "react";

export interface PresentationSlide {
  id: string;
  title: string;
  duration?: number;
  narration?: string;
  content: React.ReactNode;
}

export interface PresentationDeck {
  id: string;
  number: string;
  title: string;
  slides: PresentationSlide[];
}

export interface PresentationBranding {
  logoSrc?: string;
  brandLabel?: string;
  instructorName?: string;
  githubUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  copyright?: string;
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
    background: var(--tf-bg-base, #0b0d12);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--tf-text-primary, #e2e6f0);
  }

  /* ── Header ────────────────────────── */
  .pe-header {
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 42px;
    min-height: 42px;
    background: var(--tf-bg-surface, #111318);
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    gap: 12px;
    flex-shrink: 0;
    z-index: 20;
  }
  .pe-header-home {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: 13px;
    font-weight: 600;
    transition: color 150ms;
    cursor: pointer;
    background: none;
    border: none;
    padding: 4px 8px;
    border-radius: 6px;
  }
  .pe-header-home:hover {
    color: var(--tf-color-primary-light, #818cf8);
    background: var(--tf-bg-elevated, #191c23);
  }
  .pe-header-sep {
    color: var(--tf-text-muted, #8892a8);
    font-size: 12px;
  }
  .pe-header-lesson {
    font-size: 13px;
    font-weight: 600;
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pe-header-slide {
    font-size: 12px;
    color: var(--tf-text-muted, #8892a8);
    margin-left: auto;
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
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
  }

  /* Nav ribbon below slide */
  .pe-nav-ribbon {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    height: 40px;
    min-height: 40px;
    background: var(--tf-bg-surface, #111318);
    border-top: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    gap: 8px;
    flex-shrink: 0;
  }
  .pe-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 26px;
    border-radius: 6px;
    background: var(--tf-bg-elevated, #191c23);
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-secondary, #bfc5d4);
    cursor: pointer;
    transition: all 150ms;
    padding: 0;
    font-size: 12px;
  }
  .pe-nav-btn:hover:not(:disabled) {
    color: var(--tf-color-primary-light, #818cf8);
    border-color: var(--tf-color-primary-light, #818cf8);
  }
  .pe-nav-btn:disabled {
    opacity: 0.25;
    cursor: default;
  }
  .pe-nav-info {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    font-size: 12px;
    overflow: hidden;
  }
  .pe-nav-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  .pe-nav-prev { color: var(--tf-text-muted, #8892a8); }
  .pe-nav-current {
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 600;
    font-size: 13px;
  }
  .pe-nav-next { color: var(--tf-text-muted, #8892a8); }
  .pe-nav-counter {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--tf-text-muted, #8892a8);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  /* ── Slide Drawer ──────────────────── */
  .pe-drawer-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
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
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0 20px;
    height: 44px;
    min-height: 44px;
    background: var(--tf-bg-surface, #111318);
    border-top: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    flex-shrink: 0;
    z-index: 20;
    gap: 16px;
  }
  .pe-footer-left {
    font-size: 11px;
    color: var(--tf-text-muted, #8892a8);
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .pe-footer-center {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }
  .pe-footer-logo {
    height: 18px;
    width: auto;
    object-fit: contain;
    display: block;
    opacity: 0.85;
  }
  .pe-footer-brand {
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 600;
    font-size: 12px;
  }
  .pe-footer-right {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: flex-end;
    white-space: nowrap;
  }
  .pe-footer-instructor {
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }
  .pe-footer-social-link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--tf-text-muted, #8892a8);
    text-decoration: none;
    font-size: 11px;
    transition: color 150ms;
    white-space: nowrap;
  }
  .pe-footer-social-link:hover {
    color: var(--tf-color-primary-light, #818cf8);
  }
  .pe-footer-social-link svg {
    flex-shrink: 0;
  }

  /* ── Fullscreen button ─────────────── */
  .pe-fs-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
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
    height: 24px;
    padding: 0 8px;
    border-radius: 6px;
    background: transparent;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    transition: all 150ms;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .pe-control-btn:hover {
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--tf-color-primary, #6366f1);
    background: var(--tf-bg-elevated, #191c23);
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
    background: var(--tf-bg-base, #0b0d12);
    color: var(--tf-text-primary, #e2e6f0);
    font-family: 'Inter', system-ui, sans-serif;
  }
  .pc-header {
    height: 52px;
    min-height: 52px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--tf-bg-surface, #111318);
  }
  .pc-pill {
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .pc-title {
    font-size: 13px;
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pc-meta {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-header-logo {
    width: 92px;
    height: 20px;
    object-fit: contain;
    display: block;
    margin-left: 8px;
  }
  .pc-body {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 320px 1fr;
  }
  .pc-sidebar {
    border-right: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--tf-bg-surface, #111318);
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .pc-controls {
    padding: 10px;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .pc-lessons {
    padding: 10px;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .pc-section-label {
    font-size: 10px;
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
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    background: var(--tf-bg-elevated, #191c23);
    color: var(--tf-text-primary, #e2e6f0);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 150ms;
    padding: 0 10px;
  }
  .pc-btn:hover:not(:disabled) {
    color: var(--tf-color-primary-light, #818cf8);
    border-color: var(--tf-color-primary-light, #818cf8);
    background: var(--tf-bg-overlay, #1f222a);
  }
  .pc-btn-header {
    height: 30px;
    background: transparent;
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .pc-lesson-select {
    width: 100%;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    background: var(--tf-bg-elevated, #191c23);
    color: var(--tf-text-primary, #e2e6f0);
    font-size: 12px;
    padding: 0 10px;
    outline: none;
    cursor: pointer;
    transition: all 150ms;
  }
  .pc-lesson-select:hover,
  .pc-lesson-select:focus-visible {
    border-color: var(--tf-color-primary-light, #818cf8);
  }
  .pc-lesson-select option {
    background: var(--tf-bg-surface, #111318);
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pc-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .pc-jump {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px;
  }
  .pc-jump::-webkit-scrollbar { width: 4px; }
  .pc-jump::-webkit-scrollbar-thumb { background: rgba(202,211,230,0.18); }
  .pc-jump-item {
    width: 100%;
    text-align: left;
    margin-bottom: 4px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--tf-text-secondary, #bfc5d4);
    padding: 8px 10px;
    cursor: pointer;
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .pc-jump-item:hover {
    background: var(--tf-bg-elevated, #191c23);
  }
  .pc-jump-item.active {
    background: var(--tf-bg-elevated, #191c23);
    border-color: var(--tf-color-primary, #6366f1);
    color: var(--tf-text-primary, #e2e6f0);
  }
  .pc-jump-index {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    min-width: 20px;
    color: var(--tf-text-muted, #8892a8);
  }
  .pc-jump-title {
    font-size: 12px;
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
  .pc-transcript-header {
    height: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-text-muted, #8892a8);
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--tf-bg-surface, #111318);
  }
  .pc-transcript-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px;
    white-space: pre-wrap;
    line-height: 1.7;
    color: var(--tf-text-secondary, #bfc5d4);
    font-size: 14px;
  }
  .pc-transcript-empty {
    color: var(--tf-text-muted, #8892a8);
    font-style: italic;
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
};

type ControlCommand =
  | { type: "command"; deckId: string; action: "prev" | "next" }
  | { type: "command"; deckId: string; action: "goto"; index: number }
  | {
      type: "command";
      deckId: string;
      action: "switch-deck";
      targetDeckId: string;
    }
  | { type: "request-state"; deckId: string };

type ControlState = {
  type: "state";
  deckId: string;
  deckTitle: string;
  slideIndex: number;
  slideCount: number;
  elapsed: number;
  duration?: number;
  slideTitle?: string;
  narration?: string;
};

const DEFAULT_CONTROL_CHANNEL = "tf-slides-control";
const DEFAULT_CONTROL_WINDOW_NAME = "tf-slide-control-window";

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
}

export function PresentationLayout({
  courseTitle,
  deck,
  onHome,
  branding,
  controlChannelId = DEFAULT_CONTROL_CHANNEL,
  controlWindowName = DEFAULT_CONTROL_WINDOW_NAME,
}: PresentationLayoutProps) {
  const brandLogoSrc =
    branding?.logoSrc ?? "/brand/og-image-template-1200x630.png";
  const brandLabel = branding?.brandLabel ?? "Tutorial";
  const showBrandLabel =
    branding?.brandLabel != null && !brandLogoSrc.includes("og-image-template");
  const instructorName = branding?.instructorName;
  const githubUrl = branding?.githubUrl;
  const youtubeUrl = branding?.youtubeUrl;
  const linkedinUrl = branding?.linkedinUrl;
  const twitterUrl = branding?.twitterUrl;
  const twitterHandle = branding?.twitterHandle;
  const linkedinHandle = branding?.linkedinHandle;
  const copyrightText =
    branding?.copyright ?? `\u00A9 ${new Date().getFullYear()} ${brandLabel}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const controlChannelRef = useRef<BroadcastChannel | null>(null);

  /* ── Parse initial slide from hash ── */
  const getIndexFromHash = useCallback((): number => {
    const hash = window.location.hash; // e.g. #/01/3
    const m = hash.match(/#\/[^/]+\/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }, []);

  const [slideIndex, setSlideIndex] = useState(getIndexFromHash);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideCount = deck.slides.length;
  const elapsed = useSlideTimer(slideIndex);

  /* ── Derived slide data ── */
  const currentSlide = deck.slides[slideIndex];
  const prevSlide = slideIndex > 0 ? deck.slides[slideIndex - 1] : null;
  const nextSlide =
    slideIndex < slideCount - 1 ? deck.slides[slideIndex + 1] : null;

  /* ── Navigation ── */
  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, slideCount - 1));
      setSlideIndex(clamped);
      window.location.hash = `#/${deck.id}/${clamped}`;
    },
    [slideCount, deck.id],
  );

  const goPrev = useCallback(() => goTo(slideIndex - 1), [goTo, slideIndex]);
  const goNext = useCallback(() => goTo(slideIndex + 1), [goTo, slideIndex]);

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
      slideTitle: slide?.title,
      narration: slide?.narration,
    };
    channel.postMessage(message);
  }, [deck, slideIndex, slideCount, elapsed]);

  /* ── Keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, goTo, slideCount, drawerOpen]);

  /* ── Hash sync ── */
  useEffect(() => {
    const onHash = () => setSlideIndex(getIndexFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [getIndexFromHash]);

  /* ── Control-window sync ── */
  useEffect(() => {
    const channel = new BroadcastChannel(controlChannelId);
    controlChannelRef.current = channel;

    const onMessage = (ev: MessageEvent<ControlCommand>) => {
      const msg = ev.data;
      if (!msg) return;
      if (msg.type === "request-state") {
        if (msg.deckId !== deck.id) return;
        postControlState();
        return;
      }
      if (msg.type === "command") {
        if (msg.action === "switch-deck") {
          if (msg.deckId !== deck.id || !msg.targetDeckId) return;
          window.location.hash = `#/${msg.targetDeckId}/0`;
          return;
        }
        if (msg.deckId !== deck.id) return;
        if (msg.action === "prev") goPrev();
        else if (msg.action === "next") goNext();
        else if (msg.action === "goto") goTo(msg.index);
      }
    };

    channel.addEventListener("message", onMessage);
    return () => {
      channel.removeEventListener("message", onMessage);
      channel.close();
      controlChannelRef.current = null;
    };
  }, [deck.id, goPrev, goNext, goTo, postControlState, controlChannelId]);

  useEffect(() => {
    postControlState();
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
      "popup=yes,width=1200,height=900,resizable=yes,scrollbars=yes",
    );
    if (popup) {
      popup.focus();
      setTimeout(() => postControlState(), 120);
    }
  }, [postControlState, controlWindowName]);

  /* ── Drawer navigation ── */
  const handleDrawerNav = useCallback(
    (idx: number) => {
      goTo(idx);
      setDrawerOpen(false);
    },
    [goTo],
  );

  const duration = currentSlide?.duration;
  const progressPct =
    slideCount > 1 ? (slideIndex / (slideCount - 1)) * 100 : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ENGINE_CSS }} />
      <div className="pe-root" ref={rootRef}>
        {/* ── Header ── */}
        <div className="pe-header">
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
            {deck.number}. {deck.title}
          </span>
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
          <button className="pe-fs-btn" onClick={toggleFs} title="Fullscreen">
            {Icons.fullscreen}
          </button>
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
                          {slide.title}
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
              <div className="pe-slide-box">{currentSlide?.content}</div>
            </div>

            {/* Nav ribbon */}
            <div className="pe-nav-ribbon">
              <button
                className="pe-nav-btn"
                onClick={goPrev}
                disabled={slideIndex <= 0}
                aria-label="Previous"
              >
                {Icons.chevLeft}
              </button>

              <div className="pe-nav-info">
                <span className="pe-nav-label pe-nav-prev">
                  {prevSlide ? `« ${prevSlide.title}` : ""}
                </span>
                <span className="pe-nav-label pe-nav-current">
                  {currentSlide?.title ?? ""}
                </span>
                <span className="pe-nav-label pe-nav-next">
                  {nextSlide ? `${nextSlide.title} »` : ""}
                </span>
              </div>

              <span className="pe-nav-counter">
                {slideIndex + 1}/{slideCount}
              </span>

              <button
                className="pe-nav-btn"
                onClick={goNext}
                disabled={slideIndex >= slideCount - 1}
                aria-label="Next"
              >
                {Icons.chevRight}
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="pe-footer">
          <span className="pe-footer-left">{copyrightText}</span>
          <div className="pe-footer-center">
            <img
              className="pe-footer-logo"
              src={brandLogoSrc}
              alt={brandLabel}
            />
            {showBrandLabel ? (
              <span className="pe-footer-brand">{brandLabel}</span>
            ) : null}
          </div>
          <div className="pe-footer-right">
            {instructorName ? (
              <span className="pe-footer-instructor">
                Instructor: {instructorName}
              </span>
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
  branding?: PresentationBranding;
  controlChannelId?: string;
}

export function PresentationControlPanel({
  deck,
  decks,
  onSelectDeck,
  onOpenPresenter,
  branding,
  controlChannelId = DEFAULT_CONTROL_CHANNEL,
}: PresentationControlPanelProps) {
  const brandLogoSrc =
    branding?.logoSrc ?? "/brand/og-image-template-1200x630.png";
  const brandLabel = branding?.brandLabel ?? "Tutorial";
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [state, setState] = useState<ControlState>({
    type: "state",
    deckId: deck.id,
    deckTitle: deck.title,
    slideIndex: 0,
    slideCount: deck.slides.length,
    elapsed: 0,
    duration: deck.slides[0]?.duration,
    slideTitle: deck.slides[0]?.title,
    narration: deck.slides[0]?.narration,
  });

  useEffect(() => {
    const channel = new BroadcastChannel(controlChannelId);
    channelRef.current = channel;

    const onMessage = (ev: MessageEvent<ControlState>) => {
      const msg = ev.data;
      if (!msg || msg.type !== "state" || msg.deckId !== deck.id) return;
      setState(msg);
    };

    channel.addEventListener("message", onMessage);
    channel.postMessage({ type: "request-state", deckId: deck.id });

    return () => {
      channel.removeEventListener("message", onMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [deck.id, controlChannelId]);

  const send = useCallback((cmd: ControlCommand) => {
    channelRef.current?.postMessage(cmd);
  }, []);

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

  const atStart = state.slideIndex <= 0;
  const atEnd = state.slideIndex >= state.slideCount - 1;
  const timerOver =
    state.duration != null ? state.elapsed > state.duration : false;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ENGINE_CSS }} />
      <div className="pc-root">
        <div className="pc-header">
          <span className="pc-pill">Control</span>
          <span className="pc-title">
            {deck.number}. {deck.title}
          </span>
          <div className="pc-meta">
            <span>
              {state.slideIndex + 1}/{state.slideCount}
            </span>
            <span
              style={{
                color: timerOver
                  ? "var(--tf-color-danger, #ef4444)"
                  : "var(--tf-text-muted, #8892a8)",
              }}
            >
              {formatTime(state.elapsed)}
              {state.duration != null ? ` / ${formatTime(state.duration)}` : ""}
            </span>
          </div>
          <img className="pc-header-logo" src={brandLogoSrc} alt={brandLabel} />
          {onOpenPresenter && (
            <button className="pc-btn pc-btn-header" onClick={onOpenPresenter}>
              Open Presenter
            </button>
          )}
        </div>

        <div className="pc-body">
          <aside className="pc-sidebar">
            <div className="pc-lessons">
              <span className="pc-section-label">Jump Lesson</span>
              <select
                className="pc-lesson-select"
                value={deck.id}
                onChange={(e) => handleSelectDeck(e.target.value)}
                aria-label="Jump to lesson"
              >
                {decks.map((lessonDeck) => (
                  <option key={lessonDeck.id} value={lessonDeck.id}>
                    {lessonDeck.number}. {lessonDeck.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="pc-controls">
              <button
                className="pc-btn"
                onClick={() =>
                  send({ type: "command", deckId: deck.id, action: "prev" })
                }
                disabled={atStart}
              >
                Previous
              </button>
              <button
                className="pc-btn"
                onClick={() =>
                  send({ type: "command", deckId: deck.id, action: "next" })
                }
                disabled={atEnd}
              >
                Next
              </button>
            </div>

            <div className="pc-jump">
              {deck.slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  className={`pc-jump-item ${idx === state.slideIndex ? "active" : ""}`}
                  onClick={() =>
                    send({
                      type: "command",
                      deckId: deck.id,
                      action: "goto",
                      index: idx,
                    })
                  }
                  title={slide.title}
                >
                  <span className="pc-jump-index">{idx + 1}</span>
                  <span className="pc-jump-title">{slide.title}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="pc-transcript">
            <div className="pc-transcript-header">Transcript</div>
            <div className="pc-transcript-body">
              {state.narration ? (
                state.narration
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
