"use client";

/**
 * AnimatedMermaidWidget — Mermaid flowchart with step-by-step node reveal.
 *
 * Renders the complete Mermaid chart once using `window.mermaid` (CDN),
 * then reveals nodes and edges progressively by manipulating SVG element
 * opacity. CSS transitions provide smooth animation between steps.
 *
 * Layout uses Mermaid's own graph engine — no custom arrow drawing,
 * no coordinate calculation, no ResizeObserver.
 *
 * IMPORTANT — overflow safety:
 * - Root uses `flex: 1; minHeight: 0; overflow: hidden`
 * - SVG is sized to fill container with `preserveAspectRatio`
 */

import { useRef, useEffect, useState, useMemo } from "react";
import { usePresentationStep } from "./PresentationControlEngine";
import { initMermaid } from "../../theme/mermaidTheme";

/* ── CSS var shorthands ───────────────────────────────────────────────── */

const v = {
  bgBase: "var(--tf-bg-base, #0b0d12)",
  bgSurface: "var(--tf-bg-surface, #111318)",
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  fontMono: "var(--tf-font-mono, 'JetBrains Mono', monospace)",
  radiusMd: "var(--tf-radius-md, 12px)",
  radiusLg: "var(--tf-radius-lg, 16px)",
  radiusSm: "var(--tf-radius-sm, 8px)",
};

/* ── Public types ─────────────────────────────────────────────────────── */

export interface AnimatedMermaidStep {
  id: string;
  /** Mermaid node ID to reveal at this step */
  nodeId: string;
  title: string;
  transcript: string;
  detail?: string;
  /** CSS colour for step indicator accent */
  color?: string;
}

export interface AnimatedMermaidEdge {
  from: string;
  to: string;
}

interface AnimatedMermaidWidgetProps {
  /** Mermaid flowchart definition (e.g. `graph LR\n  A --> B`) */
  chart: string;
  /** Steps referencing node IDs for progressive reveal */
  steps: AnimatedMermaidStep[];
  /**
   * Edges listed in the same order they appear in the chart definition.
   * Used to map rendered SVG edge paths to source/target nodes for
   * reveal logic.
   */
  edges: AnimatedMermaidEdge[];
  density?: "default" | "compact";
}

/* ── Component ────────────────────────────────────────────────────────── */

let widgetCounter = 0;

export function AnimatedMermaidWidget({
  chart,
  steps,
  edges,
  density = "default",
}: AnimatedMermaidWidgetProps) {
  const { stepIndex, stepCount } = usePresentationStep();
  const activeIdx =
    stepCount > 0 ? Math.min(stepIndex, Math.max(steps.length - 1, 0)) : 0;
  const isCompact = density === "compact";

  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [renderId] = useState(() => `amw-${++widgetCounter}`);

  /* Collect unique nodeIds from steps (in step order) */
  const allNodeIds = useMemo(() => {
    const seen = new Set<string>();
    return steps.reduce<string[]>((acc, s) => {
      if (!seen.has(s.nodeId)) {
        seen.add(s.nodeId);
        acc.push(s.nodeId);
      }
      return acc;
    }, []);
  }, [steps]);

  /* ── Render Mermaid chart (once) ───────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;

    const doRender = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mermaid = (window as any).mermaid;
      if (!mermaid?.render || !containerRef.current) return false;
      initMermaid();
      try {
        const { svg } = await mermaid.render(renderId, chart);
        if (!containerRef.current) return true;
        containerRef.current.innerHTML = svg;

        // Size SVG to fit within container (both axes)
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.style.maxWidth = "100%";
          svgEl.style.maxHeight = "100%";
          svgEl.style.width = "auto";
          svgEl.style.height = "auto";
          svgEl.removeAttribute("width");
          svgEl.removeAttribute("height");
          svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }

        // Add CSS transitions to animatable SVG elements
        containerRef.current.querySelectorAll(".node").forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.opacity = "0";
          htmlEl.style.transition = "opacity 400ms ease, filter 400ms ease";
        });
        containerRef.current
          .querySelectorAll(".flowchart-link, .edge-pattern-solid, .edgeLabel")
          .forEach((el) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.opacity = "0";
            htmlEl.style.transition = "opacity 400ms ease";
          });

        setRendered(true);
        return true;
      } catch {
        if (containerRef.current)
          containerRef.current.textContent = "Diagram render error";
        return true;
      }
    };

    doRender().then((ok) => {
      if (ok) return;
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if ((await doRender()) || attempts > 50) clearInterval(interval);
      }, 100);
    });
  }, [chart, renderId]);

  /* ── Animate nodes + edges on step changes ─────────────────────── */
  useEffect(() => {
    if (!rendered || !containerRef.current) return;

    const revealedNodes = new Set<string>();
    const activeNodeId = steps[activeIdx]?.nodeId;
    for (let i = 0; i <= activeIdx; i++) revealedNodes.add(steps[i].nodeId);

    // Animate node <g class="node"> elements
    for (const nodeId of allNodeIds) {
      // Mermaid v11 flowchart node IDs: flowchart-{nodeId}-{N}
      const el = containerRef.current.querySelector(
        `[id^="flowchart-${nodeId}-"]`,
      ) as HTMLElement | null;
      if (!el) continue;
      const revealed = revealedNodes.has(nodeId);
      const active = nodeId === activeNodeId;
      el.style.opacity = revealed ? "1" : "0";
      el.style.filter = active
        ? `drop-shadow(0 0 6px ${steps[activeIdx]?.color ?? "#818cf8"})`
        : "none";
    }

    // Animate edge paths + labels — hide ALL first, then reveal matched ones
    const linkPaths = containerRef.current.querySelectorAll(
      ".flowchart-link, .edge-pattern-solid",
    );
    const edgeLabels = containerRef.current.querySelectorAll(".edgeLabel");

    // Start with all hidden
    linkPaths.forEach((el) => ((el as HTMLElement).style.opacity = "0"));
    edgeLabels.forEach((el) => ((el as HTMLElement).style.opacity = "0"));

    // Reveal edges whose both endpoints are revealed (index-based: chart declaration order)
    edges.forEach(({ from, to }, i) => {
      const show = revealedNodes.has(from) && revealedNodes.has(to);
      if (!show) return;
      if (linkPaths[i]) (linkPaths[i] as HTMLElement).style.opacity = "0.85";
      if (edgeLabels[i]) (edgeLabels[i] as HTMLElement).style.opacity = "0.85";
    });
  }, [rendered, activeIdx, steps, edges, allNodeIds]);

  const currentStep = steps[activeIdx];

  return (
    <div
      data-testid="animated-mermaid-widget"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isCompact ? "8px" : "12px",
        padding: isCompact ? "10px" : "14px",
        borderRadius: v.radiusLg,
        border: `1px solid ${v.borderDefault}`,
        background: `linear-gradient(180deg, ${v.bgSurface}, ${v.bgBase})`,
        minHeight: 0,
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* ── Diagram container ────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          background: v.bgElevated,
          borderRadius: v.radiusMd,
          padding: isCompact ? "12px" : "18px",
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={{ color: v.textMuted, fontSize: "13px" }}>
            Loading diagram...
          </span>
        </div>
      </div>

      {/* ── Step indicator bar ───────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isCompact ? "8px" : "12px",
          padding: isCompact ? "8px 10px" : "10px 14px",
          borderRadius: v.radiusSm,
          border: `1px solid ${v.borderDefault}`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: isCompact ? "9px" : "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: currentStep?.color ?? v.primaryLight,
            fontFamily: v.fontMono,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          [{String(activeIdx + 1).padStart(2, "0")}/
          {String(steps.length).padStart(2, "0")}]
        </div>
        <div
          style={{
            fontSize: isCompact ? "12px" : "13px",
            fontWeight: 600,
            color: v.textPrimary,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
          }}
        >
          {currentStep?.title ?? ""}
        </div>
        {currentStep?.detail && (
          <div
            style={{
              fontSize: isCompact ? "10px" : "11px",
              color: v.textSecondary,
              fontFamily: v.fontMono,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            {currentStep.detail}
          </div>
        )}
      </div>
    </div>
  );
}
