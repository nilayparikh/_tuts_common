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
import { BrandLockup } from "../layout/BrandLockup";

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

export interface PresentationDeck {
  id: string;
  number: string;
  title: string;
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    padding: 0 20px;
    height: 56px;
    min-height: 56px;
    background: var(--tf-bg-surface, #111318);
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    gap: 12px;
    flex-shrink: 0;
    z-index: 20;
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
    font-size: 14px;
    font-weight: 600;
    transition: color 150ms;
    cursor: pointer;
    background: none;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
  }
  .pe-header-home:hover {
    color: var(--tf-color-primary-light, #818cf8);
    background: var(--tf-bg-elevated, #191c23);
  }
  .pe-header-sep {
    color: var(--tf-text-muted, #8892a8);
    font-size: 13px;
  }
  .pe-header-lesson {
    font-size: 13px;
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
    padding: 3px 4px;
    border: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    border-radius: 10px;
    background: var(--tf-bg-surface, #111318);
  }
  .pe-header-nav-prev,
  .pe-header-nav-next {
    font-size: 12px;
    color: var(--tf-text-muted, #8892a8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: none;
    width: 100%;
    padding: 2px 8px;
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
    font-size: 13px;
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: none;
    padding: 3px 12px;
    background: var(--tf-bg-elevated, #191c23);
    border-radius: 7px;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    text-align: center;
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
    width: 34px;
    height: 30px;
    border-radius: 8px;
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
  .pc-header-separator {
    width: 1px;
    height: 22px;
    background: var(--tf-border-default, rgba(202,211,230,0.14));
    opacity: 0.95;
    flex-shrink: 0;
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
  .pc-title-wrap {
    min-width: 0;
    max-width: min(36vw, 500px);
    display: flex;
    align-items: center;
  }
  .pc-title {
    font-size: 13px;
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 600;
    font-family: 'Inter', system-ui, sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pc-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
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
  .pc-slider-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
  }
  .pc-slider-row.compact {
    grid-template-columns: auto minmax(96px, 140px) auto;
    gap: 8px;
  }
  .pc-slider-label {
    font-size: 10px;
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
    min-width: 42px;
    text-align: right;
    font-size: 11px;
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
  .pc-step-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: linear-gradient(180deg, var(--tf-bg-surface, #111318), var(--tf-bg-base, #0b0d12));
  }
  .pc-step-counter {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tf-color-primary-light, #818cf8);
    white-space: nowrap;
  }
  .pc-step-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pc-step-btn {
    height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    background: var(--tf-bg-elevated, #191c23);
    color: var(--tf-text-primary, #e2e6f0);
    cursor: pointer;
    font-size: 11px;
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
    height: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 14px;
    font-size: 11px;
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
  .pc-transcript-step {
    width: 100%;
    text-align: left;
    appearance: none;
    -webkit-appearance: none;
    font: inherit;
    color: var(--tf-text-secondary, #bfc5d4);
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    background: var(--tf-bg-surface, #111318);
    opacity: 0.55;
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
    font-size: calc(14px * var(--pc-transcript-font-scale, 1.1));
    line-height: 1.7;
  }
  .pc-transcript-step-text,
  .pc-transcript-text {
    white-space: pre-wrap;
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
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(controlChannelId, "command");

  /* ── Parse initial slide from hash ── */
  const getIndexFromHash = useCallback((): number => {
    const hash = window.location.hash; // e.g. #/01/3
    const m = hash.match(/#\/[^/]+\/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }, []);

  const [slideIndex, setSlideIndex] = useState(getIndexFromHash);
  const [stepIndex, setStepIndex] = useState(0);
  const [slideZoom, setSlideZoom] = useState<number>(DEFAULT_SLIDE_ZOOM);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
      window.location.hash = `#/${deck.id}/${clamped}`;
    },
    [slideCount, deck.id],
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

    const handleCommand = (msg: ControlCommand) => {
      if (!msg) return;
      if (msg.type === "request-state") {
        if (msg.deckId !== deck.id) return;
        postControlState();
        return;
      }
      if (msg.type !== "command") return;
      if (msg.action === "switch-deck") {
        if (msg.deckId !== deck.id || !msg.targetDeckId) return;
        window.location.hash = `#/${msg.targetDeckId}/0`;
        return;
      }
      if (msg.deckId !== deck.id) return;
      if (msg.action === "prev") goPrev();
      else if (msg.action === "next") goNext();
      else if (msg.action === "goto") goTo(msg.index);
      else if (msg.action === "step-prev") stepBack();
      else if (msg.action === "step-next") stepForward();
      else if (msg.action === "step-reset") resetStep();
      else if (msg.action === "step-goto") {
        if (typeof msg.index !== "number") return;
        setStepIndex(Math.max(0, Math.min(msg.index, currentStepCount - 1)));
      } else if (msg.action === "set-zoom") {
        const nextZoom = Math.max(0.85, Math.min(msg.zoom, 1.4));
        setSlideZoom(nextZoom);
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
  }, [
    commandStorageKey,
    controlChannelId,
    currentStepCount,
    deck.id,
    goPrev,
    goNext,
    goTo,
    postControlState,
    resetStep,
    stepBack,
    stepForward,
  ]);

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
      <div className="pe-root" ref={rootRef} aria-label={courseTitle}>
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
              {deck.number}. {deck.title}
            </span>
          </div>

          <div className="pe-header-center">
            <div className="pe-header-nav">
              <button
                className="pe-nav-btn"
                onClick={goPrev}
                disabled={slideIndex <= 0}
                aria-label="Previous"
              >
                {Icons.chevLeft}
              </button>
              <span
                className={`pe-header-nav-prev ${prevSlide ? "" : "empty"}`}
                title={prevSlide?.title}
              >
                {prevSlide?.title ?? ""}
              </span>
              <span
                className="pe-header-nav-current"
                title={currentSlide?.title}
              >
                {currentSlide?.title ?? ""}
              </span>
              <span
                className={`pe-header-nav-next ${nextSlide ? "" : "empty"}`}
                title={nextSlide?.title}
              >
                {nextSlide?.title ?? ""}
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
              <div className="pe-slide-box" style={{ zoom: slideZoom }}>
                <PresentationStepContext.Provider value={stepContextValue}>
                  {currentSlide?.content}
                </PresentationStepContext.Provider>
              </div>
            </div>
          </div>
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
            {instructorName ? (
              <span className="pe-footer-instructor">{instructorName}</span>
            ) : null}
            {instructorName && (youtubeUrl || twitterUrl || linkedinUrl) ? (
              <span className="pe-footer-divider" aria-hidden="true" />
            ) : null}
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
  const brandIconUrl = branding?.brandIconUrl;
  const brandLabel = branding?.brandLabel ?? "Tutorial";
  const channelRef = useRef<BroadcastChannel | null>(null);
  const stateStorageKey = getControlStorageKey(controlChannelId, "state");
  const commandStorageKey = getControlStorageKey(controlChannelId, "command");
  const transcriptScaleStorageKey = `${controlChannelId}:transcript-scale`;
  const [state, setState] = useState<ControlState>({
    type: "state",
    deckId: deck.id,
    deckTitle: deck.title,
    slideIndex: 0,
    slideCount: deck.slides.length,
    elapsed: 0,
    duration: deck.slides[0]?.duration,
    zoom: DEFAULT_SLIDE_ZOOM,
    slideTitle: deck.slides[0]?.title,
    narration: deck.slides[0]?.narration,
    steps: deck.slides[0]?.steps,
    stepIndex: 0,
    stepCount: deck.slides[0]?.steps?.length ?? 0,
  });
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
      setState(msg);
    };

    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== stateStorageKey || !ev.newValue) return;
      try {
        const msg = JSON.parse(ev.newValue) as ControlState;
        if (!msg || msg.type !== "state" || msg.deckId !== deck.id) return;
        setState(msg);
      } catch {
        // Ignore malformed sync payloads.
      }
    };

    channel.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    channel.postMessage({ type: "request-state", deckId: deck.id });

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

  const atStart = state.slideIndex <= 0;
  const atEnd = state.slideIndex >= state.slideCount - 1;
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
              {deck.number}. {deck.title}
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
                Open Presenter
              </button>
            </>
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

              <span className="pc-section-label" style={{ marginTop: 8 }}>
                Slide Zoom
              </span>
              <select
                className="pc-lesson-select"
                value={state.zoom.toFixed(2)}
                onChange={(e) =>
                  send({
                    type: "command",
                    deckId: deck.id,
                    action: "set-zoom",
                    zoom: parseFloat(e.target.value),
                  })
                }
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
                    disabled={state.stepIndex <= 0}
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
                    disabled={state.stepIndex >= state.stepCount - 1}
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
                    disabled={state.stepIndex <= 0}
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
                      setTranscriptScaleIndex(Number.parseInt(e.target.value, 10))
                    }
                    aria-label="Transcript size"
                  />
                  <span className="pc-slider-value">{transcriptFontScaleLabel}</span>
                </div>
              </div>
            </div>
            <div className="pc-transcript-body">
              {state.stepCount > 0 && state.steps?.length ? (
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
