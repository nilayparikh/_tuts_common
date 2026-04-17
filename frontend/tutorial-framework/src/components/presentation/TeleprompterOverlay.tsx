"use client";

/**
 * TeleprompterOverlay — Persistent panel that sits on top of the
 * transcript area in the control panel.
 *
 * Shows narration text with ~3 visible lines, a highlighted focus line,
 * and smooth mouse-wheel / keyboard scrolling (1 full turn = 1 line).
 * Font is 30% larger than the normal transcript size.
 *
 * This is an app-level capability — once toggled on it stays on across
 * slide navigation. The parent simply updates the `text` prop.
 */

import React, { useRef, useEffect, useCallback, useState } from "react";

/* ── Configuration ─────────────────────────────────────────────────── */

/** How many full text lines are visible at once. */
const VISIBLE_LINES = 3;
/** Accumulated wheel deltaY required to advance one line. */
const WHEEL_THRESHOLD = 30;
/** How many lines each arrow-key press advances. */
const ARROW_STEP = 3;
/** Smooth-scroll lerp factor per animation frame (0–1). */
const SCROLL_LERP = 0.12;
/** Horizontal padding inside the canvas (px). */
const PAD_X = 24;
/** Vertical padding above the first line (px). */
const PAD_TOP = 14;
/** Extra spacing inserted for paragraph breaks (multiplier of lineHeight). */
const PARAGRAPH_GAP_MULTIPLIER = 0.6;
/** Opacity for lines outside the focus band. */
const DIM_OPACITY = 0.3;
/** Background colour (translucent dark). */
const BG = "rgba(6, 8, 14, 0.92)";

/* ── Types ─────────────────────────────────────────────────────────── */

interface LayoutLine {
  text: string;
  /** Y offset relative to top of virtual document (px). */
  y: number;
  /** Whether this line is the first in its paragraph. */
  paragraphStart: boolean;
}

export interface TeleprompterOverlayProps {
  /** Raw narration text (may contain \n\n paragraph breaks). */
  text: string;
  /** Whether the overlay is visible. */
  visible: boolean;
  /** Callback when the user closes the overlay (Escape). */
  onClose: () => void;
  /**
   * Base transcript font size in px (before the 1.3× prompter boost).
   * Defaults to ~15.4 (14 × 1.1) when omitted.
   */
  baseFontSize?: number;
}

/* ── Component ─────────────────────────────────────────────────────── */

export function TeleprompterOverlay({
  text,
  visible,
  onClose,
  baseFontSize,
}: TeleprompterOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  /* Layout cache — rebuilt when text or canvas size changes. */
  const layoutRef = useRef<{
    lines: LayoutLine[];
    lineHeight: number;
    totalHeight: number;
    font: string;
    maxLineIndex: number;
  }>({ lines: [], lineHeight: 0, totalHeight: 0, font: "", maxLineIndex: 0 });

  /* Scroll position state. */
  const scrollRef = useRef({
    targetLine: 0,
    currentY: 0,
    wheelAccum: 0,
  });

  /* Remember previous text so we can detect real content changes. */
  const prevTextRef = useRef(text);

  /* Canvas sizing — observe container. */
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!visible) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setCanvasSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible]);

  /* ── Build text layout ─────────────────────────────────────────── */

  const buildLayout = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    ctx.scale(dpr, dpr);

    /* Font: base transcript size × 1.3 (30 % boost). */
    const base = baseFontSize ?? 14 * 1.1;
    const fontSize = Math.max(14, Math.round(base * 1.3));
    const lineHeight = Math.round(fontSize * 1.7);
    const font = `${fontSize}px 'Inter', system-ui, sans-serif`;
    ctx.font = font;

    const maxTextWidth = canvasSize.w - PAD_X * 2;

    /* Split into paragraphs then word-wrap each. */
    const paragraphs = text.split(/\n\s*\n/);
    const lines: LayoutLine[] = [];
    let y = PAD_TOP;

    for (let pi = 0; pi < paragraphs.length; pi++) {
      const para = paragraphs[pi].trim();
      if (!para) continue;
      if (pi > 0) y += lineHeight * PARAGRAPH_GAP_MULTIPLIER;

      const words = para.split(/\s+/);
      let currentLine = "";
      let isFirst = true;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxTextWidth && currentLine) {
          lines.push({ text: currentLine, y, paragraphStart: isFirst });
          y += lineHeight;
          currentLine = word;
          isFirst = false;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push({ text: currentLine, y, paragraphStart: isFirst });
        y += lineHeight;
      }
    }

    const oldMaxLineIndex = layoutRef.current.maxLineIndex;
    layoutRef.current = {
      lines,
      lineHeight,
      totalHeight: y,
      font,
      maxLineIndex: Math.max(0, lines.length - 1),
    };

    /* Only reset scroll when the actual text content changed. */
    if (prevTextRef.current !== text) {
      scrollRef.current = { targetLine: 0, currentY: 0, wheelAccum: 0 };
      prevTextRef.current = text;
    } else if (oldMaxLineIndex !== layoutRef.current.maxLineIndex) {
      /* Clamp if line count changed (resize). */
      scrollRef.current.targetLine = Math.min(
        scrollRef.current.targetLine,
        layoutRef.current.maxLineIndex,
      );
    }
  }, [text, canvasSize, baseFontSize]);

  /* ── Paint loop ────────────────────────────────────────────────── */

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { lines, lineHeight, font, maxLineIndex } = layoutRef.current;
    if (lines.length === 0) return;

    const scroll = scrollRef.current;
    const targetY = lines[Math.min(scroll.targetLine, maxLineIndex)]?.y ?? 0;
    scroll.currentY += (targetY - scroll.currentY) * SCROLL_LERP;

    const focusCentreCanvas = Math.max(lineHeight * 2, canvasSize.h * 0.35);
    const offsetY = focusCentreCanvas - scroll.currentY;

    ctx.save();
    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

    /* Background */
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

    /* Focus band highlight — covers 3 lines */
    const bandTop = focusCentreCanvas - lineHeight * 1.5;
    const bandBot = focusCentreCanvas + lineHeight * 1.5;
    ctx.fillStyle = "rgba(99, 102, 241, 0.10)";
    ctx.fillRect(0, bandTop, canvasSize.w, bandBot - bandTop);
    ctx.fillStyle = "rgba(99, 102, 241, 0.55)";
    ctx.fillRect(6, bandTop, 3, bandBot - bandTop);

    ctx.font = font;
    ctx.textBaseline = "middle";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const drawY = line.y + offsetY;
      if (drawY < -lineHeight || drawY > canvasSize.h + lineHeight) continue;

      const dist = Math.abs(drawY - focusCentreCanvas) / (canvasSize.h * 0.5);
      const alpha =
        dist < 0.25 ? 1 : Math.max(DIM_OPACITY, 1 - (dist - 0.25) * 1.8);

      ctx.fillStyle = `rgba(226, 230, 240, ${alpha.toFixed(2)})`;
      ctx.fillText(line.text, PAD_X, drawY);
    }

    /* Top/bottom fade gradients. */
    const fadeH = canvasSize.h * 0.15;
    const topGrad = ctx.createLinearGradient(0, 0, 0, fadeH);
    topGrad.addColorStop(0, BG);
    topGrad.addColorStop(1, "rgba(6, 8, 14, 0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvasSize.w, fadeH);

    const botGrad = ctx.createLinearGradient(
      0,
      canvasSize.h - fadeH,
      0,
      canvasSize.h,
    );
    botGrad.addColorStop(0, "rgba(6, 8, 14, 0)");
    botGrad.addColorStop(1, BG);
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, canvasSize.h - fadeH, canvasSize.w, fadeH);

    /* Hint */
    ctx.font = `10px 'Inter', system-ui, sans-serif`;
    ctx.fillStyle = "rgba(226, 230, 240, 0.30)";
    ctx.textBaseline = "bottom";
    const hint = "Scroll ↕  ·  ↑↓ 3 lines  ·  ←→ prev/next  ·  Esc close";
    ctx.fillText(
      hint,
      (canvasSize.w - ctx.measureText(hint).width) / 2,
      canvasSize.h - 6,
    );

    ctx.restore();

    if (Math.abs(targetY - scroll.currentY) > 0.3) {
      rafRef.current = requestAnimationFrame(paint);
    }
  }, [canvasSize]);

  /* Build layout + kick paint whenever text, size, or visibility changes. */
  useEffect(() => {
    if (!visible) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    buildLayout();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, buildLayout, paint]);

  /* ── Wheel handler ─────────────────────────────────────────────── */

  useEffect(() => {
    if (!visible) return;
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const scroll = scrollRef.current;
      const maxLine = layoutRef.current.maxLineIndex;
      scroll.wheelAccum += e.deltaY;

      if (Math.abs(scroll.wheelAccum) >= WHEEL_THRESHOLD) {
        const dir = scroll.wheelAccum > 0 ? 1 : -1;
        scroll.targetLine = Math.max(
          0,
          Math.min(maxLine, scroll.targetLine + dir),
        );
        scroll.wheelAccum = 0;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(paint);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [visible, paint]);

  /* ── Keyboard: Escape closes, Up/Down scroll ───────────────────── */

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      const scroll = scrollRef.current;
      const maxLine = layoutRef.current.maxLineIndex;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scroll.targetLine = Math.min(maxLine, scroll.targetLine + ARROW_STEP);
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(paint);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scroll.targetLine = Math.max(0, scroll.targetLine - ARROW_STEP);
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(paint);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [visible, onClose, paint]);

  if (!visible || !text) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 30,
        cursor: "ns-resize",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close teleprompter"
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 32,
          width: 32,
          height: 32,
          borderRadius: 8,
          border: "1px solid rgba(202,211,230,0.16)",
          background: "rgba(23,28,42,0.85)",
          color: "rgba(226,230,240,0.7)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          lineHeight: 1,
          backdropFilter: "blur(8px)",
          transition: "all 120ms",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(239,68,68,0.5)";
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(239,68,68,0.18)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "rgba(226,230,240,0.7)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(202,211,230,0.16)";
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(23,28,42,0.85)";
        }}
      >
        ×
      </button>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
