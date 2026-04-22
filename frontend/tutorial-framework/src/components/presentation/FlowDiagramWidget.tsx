"use client";

/**
 * FlowDiagramWidget — Animated node-and-edge flow diagram.
 *
 * Nodes and edges reveal progressively via `usePresentationStep()`.
 * Each step illuminates one node (and its inbound edges), creating
 * a "building the architecture" animation.
 *
 * Layout: CSS Grid with `1fr` columns/rows that auto-scale to fit
 * the available slide area. Never overflows — the grid stretches to
 * fill the parent, and edges are drawn via a single overlay `<svg>`
 * with `viewBox` matching the grid pixel dimensions.
 *
 * IMPORTANT — overflow safety:
 * - Root uses `flex: 1; minHeight: 0; overflow: hidden`
 * - Diagram area uses `position: relative; flex: 1; minHeight: 0`
 * - Node grid uses `position: absolute; inset: 0` inside the area
 * - SVG edge layer matches grid bounds (absolute, inset: 0)
 * - No `aspectRatio` — the container fills available space only
 */

import { useRef, useLayoutEffect, useState, useCallback } from "react";
import { usePresentationStep } from "./PresentationControlEngine";

/* ── CSS var shorthands ───────────────────────────────────────────────── */

const v = {
  bgBase: "var(--tf-bg-base, #0b0d12)",
  bgSurface: "var(--tf-bg-surface, #111318)",
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  panelBg: "var(--tf-surface-panel-bg, var(--tf-bg-surface, #111318))",
  cardBg: "var(--tf-surface-card-bg, var(--tf-bg-elevated, #191c23))",
  glassHighlight:
    "var(--tf-glass-highlight, linear-gradient(180deg, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 4%, transparent) 0%, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 2%, transparent) 100%))",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  secondary: "var(--tf-color-secondary, #14b8a6)",
  accent: "var(--tf-color-accent, #f59e0b)",
  success: "var(--tf-color-success, #10b981)",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  borderSubtle: "var(--tf-border-subtle, rgba(202,211,230,0.08))",
  shadowLevel2: "var(--tf-shadow-level2, 0 8px 20px rgba(0,0,0,0.18))",
  fontMono: "var(--tf-font-mono, 'JetBrains Mono', monospace)",
  radiusMd: "var(--tf-radius-md, 12px)",
  radiusLg: "var(--tf-radius-lg, 16px)",
  radiusSm: "var(--tf-radius-sm, 8px)",
};

const mixAlpha = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/* ── Public types ─────────────────────────────────────────────────────── */

export interface FlowNode {
  id: string;
  icon: string;
  label: string;
  sub?: string;
  col: number;
  row: number;
  color?: string;
  colSpan?: number;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowStep {
  id: string;
  nodeId: string;
  title: string;
  transcript: string;
  detail?: string;
}

interface FlowDiagramWidgetProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  steps: FlowStep[];
  columns?: number;
  rows?: number;
  density?: "default" | "compact";
}

/* ── Component ────────────────────────────────────────────────────────── */

export function FlowDiagramWidget({
  nodes,
  edges,
  steps,
  columns,
  rows,
  density = "default",
}: FlowDiagramWidgetProps) {
  const { stepIndex, stepCount } = usePresentationStep();
  const activeIdx =
    stepCount > 0 ? Math.min(stepIndex, Math.max(steps.length - 1, 0)) : 0;
  const isCompact = density === "compact";

  const maxCol =
    columns ?? Math.max(...nodes.map((n) => n.col + (n.colSpan ?? 1)));
  const maxRow = rows ?? Math.max(...nodes.map((n) => n.row + 1));

  // Revealed / active state
  const revealedNodes = new Set<string>();
  const activeNodeId = steps[activeIdx]?.nodeId;
  for (let i = 0; i <= activeIdx; i++) revealedNodes.add(steps[i].nodeId);

  const revealedEdges = new Set<string>();
  for (const edge of edges) {
    if (revealedNodes.has(edge.to) && revealedNodes.has(edge.from)) {
      revealedEdges.add(`${edge.from}->${edge.to}`);
    }
  }

  const defaultColors = [v.primaryLight, v.secondary, v.accent, v.success];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Measure grid cells for SVG edge drawing
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellRects, setCellRects] = useState<Map<string, DOMRect>>(new Map());
  const [gridRect, setGridRect] = useState<DOMRect | null>(null);

  const measureCells = useCallback(() => {
    const g = gridRef.current;
    if (!g) return;
    setGridRect(g.getBoundingClientRect());
    const rects = new Map<string, DOMRect>();
    for (const node of nodes) {
      const el = g.querySelector(`[data-node-id="${node.id}"]`);
      if (el) rects.set(node.id, el.getBoundingClientRect());
    }
    setCellRects(rects);
  }, [nodes]);

  useLayoutEffect(() => {
    measureCells();
    const ro = new ResizeObserver(measureCells);
    if (gridRef.current) ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [measureCells]);

  const iconSize = isCompact ? 20 : 24;
  const gap = isCompact ? 12 : 16;

  // Edge centre calculation relative to grid
  const edgePts = (nodeId: string) => {
    const r = cellRects.get(nodeId);
    if (!r || !gridRect) return { x: 0, y: 0 };
    return {
      x: r.left - gridRect.left + r.width / 2,
      y: r.top - gridRect.top + r.height / 2,
    };
  };

  return (
    <div
      data-testid="flow-diagram-widget"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isCompact ? "8px" : "12px",
        padding: isCompact ? "10px" : "14px",
        borderRadius: v.radiusLg,
        border: `1px solid ${v.borderDefault}`,
        background: `${v.glassHighlight}, linear-gradient(180deg, ${v.panelBg}, ${v.bgBase})`,
        minHeight: 0,
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* ── Diagram area (grid + SVG edges) ────────────────────── */}
      <div
        ref={gridRef}
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${maxCol}, 1fr)`,
          gridTemplateRows: `repeat(${maxRow}, 1fr)`,
          gap: `${gap}px`,
          overflow: "hidden",
        }}
      >
        {/* SVG edge layer */}
        {gridRect && cellRects.size > 0 && (
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            {edges.map((edge) => {
              const src = nodeMap.get(edge.from);
              const tgt = nodeMap.get(edge.to);
              if (!src || !tgt) return null;
              const a = edgePts(edge.from);
              const b = edgePts(edge.to);
              const key = `${edge.from}->${edge.to}`;
              const isRevealed = revealedEdges.has(key);
              const isActive =
                isRevealed &&
                (edge.to === activeNodeId || edge.from === activeNodeId);
              const color =
                tgt.color ??
                defaultColors[nodes.indexOf(tgt) % defaultColors.length];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 1) return null;

              const ux = dx / dist;
              const uy = dy / dist;
              const tipOff = 12;
              const bx = b.x - ux * tipOff;
              const by = b.y - uy * tipOff;
              const angle = Math.atan2(by - a.y, bx - a.x);
              const hl = 8;
              const ha = Math.PI / 6;

              return (
                <g key={key}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={bx}
                    y2={by}
                    stroke={isRevealed ? color : v.borderSubtle}
                    strokeWidth={isActive ? 2 : 1.2}
                    strokeDasharray={isRevealed ? "none" : "4 3"}
                    opacity={isRevealed ? 0.85 : 0.2}
                    style={{ transition: "all 300ms ease" }}
                  />
                  {isRevealed && (
                    <polygon
                      points={`${bx},${by} ${bx - hl * Math.cos(angle - ha)},${by - hl * Math.sin(angle - ha)} ${bx - hl * Math.cos(angle + ha)},${by - hl * Math.sin(angle + ha)}`}
                      fill={color}
                      opacity={0.85}
                      style={{ transition: "opacity 300ms ease" }}
                    />
                  )}
                  {edge.label && isRevealed && (
                    <text
                      x={(a.x + bx) / 2}
                      y={(a.y + by) / 2 - 6}
                      textAnchor="middle"
                      fill={v.textMuted}
                      fontSize={isCompact ? 8 : 9}
                      fontFamily="'JetBrains Mono', monospace"
                      opacity={0.8}
                      style={{ transition: "opacity 300ms ease" }}
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Node cards on the CSS Grid */}
        {nodes.map((node, nodeIdx) => {
          const isRevealed = revealedNodes.has(node.id);
          const isActive = node.id === activeNodeId;
          const color =
            node.color ?? defaultColors[nodeIdx % defaultColors.length];

          return (
            <div
              key={node.id}
              data-node-id={node.id}
              style={{
                gridColumn: `${node.col + 1} / span ${node.colSpan ?? 1}`,
                gridRow: `${node.row + 1}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: isCompact ? "3px" : "5px",
                padding: isCompact ? "6px 4px" : "8px 6px",
                borderRadius: v.radiusMd,
                border: `1.5px solid ${isActive ? color : isRevealed ? mixAlpha(color, 50) : v.borderSubtle}`,
                background: isActive
                  ? `linear-gradient(180deg, ${mixAlpha(color, 12)}, ${v.cardBg})`
                  : v.cardBg,
                boxShadow: isActive
                  ? `${v.shadowLevel2}, 0 0 16px ${mixAlpha(color, 25)}`
                  : "none",
                opacity: isRevealed ? 1 : 0.25,
                transform: isRevealed ? "scale(1)" : "scale(0.94)",
                transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: isActive ? 2 : 1,
                minWidth: 0,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: `${iconSize}px`,
                  color: isRevealed ? color : v.textMuted,
                  transition: "color 300ms ease",
                  flexShrink: 0,
                }}
              >
                {node.icon}
              </span>
              <span
                style={{
                  fontSize: isCompact ? "10px" : "12px",
                  fontWeight: 700,
                  color: isRevealed ? v.textPrimary : v.textMuted,
                  fontFamily: v.fontMono,
                  textAlign: "center",
                  lineHeight: 1.2,
                  transition: "color 300ms ease",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {node.label}
              </span>
              {node.sub && (
                <span
                  style={{
                    fontSize: isCompact ? "8px" : "9px",
                    color: v.textMuted,
                    fontFamily: v.fontMono,
                    textAlign: "center",
                    lineHeight: 1.2,
                    opacity: isRevealed ? 1 : 0,
                    transition: "opacity 300ms ease",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}
                >
                  {node.sub}
                </span>
              )}
            </div>
          );
        })}
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
          background: `${v.glassHighlight}, linear-gradient(180deg, ${v.cardBg}, ${v.panelBg})`,
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
            color:
              nodeMap.get(steps[activeIdx]?.nodeId ?? "")?.color ??
              v.primaryLight,
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
          {steps[activeIdx]?.title ?? ""}
        </div>
        {steps[activeIdx]?.detail && (
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
            {steps[activeIdx].detail}
          </div>
        )}
      </div>
    </div>
  );
}
