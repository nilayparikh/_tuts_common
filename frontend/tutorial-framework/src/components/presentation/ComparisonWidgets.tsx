/**
 * Generic comparison & legend widgets for slide decks.
 *
 * - ColorLegend: Dot + label legend row
 * - ComparisonPipeline: Side-by-side pipeline columns with step animation
 * - PillarGrid: 2×2 card grid with icon, stat, description, Mermaid chart
 *
 * All components use `usePresentationStep()` for reveal animation and
 * `--tf-*` CSS vars for theming.
 */

import React from "react";
import { usePresentationStep } from "./PresentationControlEngine";
import { MermaidDiagram } from "./SlideContent";

/* ── CSS var shorthands ───────────────────────────────────────────────── */

const v = {
  bgBase:
    "var(--tf-gradient-stage, var(--tf-surface-stage-bg, var(--tf-bg-base, #0b0d12)))",
  bgSurface: "var(--tf-surface-panel-bg, var(--tf-bg-surface, #111318))",
  bgElevated: "var(--tf-surface-card-bg, var(--tf-bg-elevated, #191c23))",
  bgOverlay: "var(--tf-surface-overlay-bg, var(--tf-bg-overlay, #1f222a))",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  textInverse: "var(--tf-text-inverse, #0b0d12)",
  primary: "var(--tf-color-primary, #6366f1)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  secondary: "var(--tf-color-secondary, #14b8a6)",
  accent: "var(--tf-color-accent, #f59e0b)",
  success: "var(--tf-color-success, #10b981)",
  danger: "var(--tf-color-danger, #ef4444)",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  borderSubtle: "var(--tf-border-subtle, rgba(202,211,230,0.08))",
  fontDisplay: "'Inter', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  radiusSm: "8px",
  radiusMd: "12px",
  radiusLg: "16px",
};

/* ═══════════════════════════════════════════════════════════════════════
 * ColorLegend
 * ═══════════════════════════════════════════════════════════════════════ */

export interface ColorLegendItem {
  label: string;
  color: string;
}

export interface ColorLegendProps {
  items: ColorLegendItem[];
}

export function ColorLegend({ items }: ColorLegendProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "16px",
        flexWrap: "wrap",
        padding: "4px 0",
      }}
    >
      {items.map(({ label, color }) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", gap: "5px" }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 6px ${color}50`,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: "10px",
              color: v.textMuted,
              fontFamily: v.fontMono,
              letterSpacing: "0.02em",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * ComparisonPipeline
 * ═══════════════════════════════════════════════════════════════════════ */

export interface PipelineNode {
  id: string;
  label: string;
  sub: string;
  detail: string;
  icon: string;
}

export interface PipelineStep {
  id: string;
  nodeIdx: number;
  title: string;
  detail: string;
  color: string;
  column: "left" | "right";
}

export interface PipelineCompareRow {
  label: string;
  left: string;
  right: string;
}

export interface ComparisonPipelineProps {
  leftTitle: string;
  leftSubtitle: string;
  leftNodes: PipelineNode[];
  leftAccent: string;
  rightTitle: string;
  rightSubtitle: string;
  rightNodes: PipelineNode[];
  rightAccent: string;
  steps: PipelineStep[];
  comparison?: PipelineCompareRow[];
  /** Number of steps from end at which comparison row appears (default: 2) */
  compareRevealThreshold?: number;
}

function PipelineColumn({
  title,
  subtitle,
  nodes,
  accentColor,
  activeIdx,
  isActiveColumn,
}: {
  title: string;
  subtitle: string;
  nodes: PipelineNode[];
  accentColor: string;
  activeIdx: number;
  isActiveColumn: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderRadius: v.radiusLg,
        border: `1.5px solid ${isActiveColumn ? accentColor : v.borderDefault}`,
        background: isActiveColumn
          ? `linear-gradient(180deg, ${v.bgSurface}, ${v.bgBase})`
          : v.bgBase,
        overflow: "hidden",
        transition: "border-color 400ms, background 400ms",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          background: v.bgElevated,
          borderBottom: `1px solid ${v.borderDefault}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: accentColor,
            fontFamily: v.fontDisplay,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: v.textMuted,
            fontFamily: v.fontMono,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
          }}
        >
          {subtitle}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: "16px 20px",
          overflow: "hidden",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {nodes.map((node, i) => {
          const active = isActiveColumn && i === activeIdx;
          return (
            <React.Fragment key={node.id}>
              {i > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    opacity: active ? 0.8 : 0.3,
                    transition: "opacity 400ms",
                    padding: "0",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "20px",
                      color: active ? accentColor : v.textMuted,
                    }}
                  >
                    arrow_downward
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  padding: "20px 24px",
                  borderRadius: v.radiusLg,
                  border: `1.5px solid ${active ? accentColor : "transparent"}`,
                  background: active
                    ? `linear-gradient(135deg, ${v.bgElevated}, ${v.bgSurface})`
                    : v.bgElevated,
                  opacity: active ? 1 : 0.3,
                  transition: "all 400ms ease",
                  boxShadow: active ? `0 0 24px -6px ${accentColor}` : "none",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "36px",
                    color: active ? accentColor : v.textMuted,
                    transition: "color 400ms",
                    flexShrink: 0,
                    marginTop: "4px",
                  }}
                >
                  {node.icon}
                </span>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    minWidth: 0,
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: active ? 800 : 700,
                      color: active ? v.textPrimary : v.textSecondary,
                      fontFamily: v.fontDisplay,
                      lineHeight: 1.2,
                      marginBottom: "6px",
                    }}
                  >
                    {node.label}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: active ? v.textSecondary : v.textMuted,
                      fontFamily: v.fontMono,
                      lineHeight: 1.2,
                      marginBottom: "12px",
                    }}
                  >
                    {node.sub}
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      color: active ? v.textSecondary : v.textMuted,
                      fontFamily: v.fontBody,
                      lineHeight: 1.45,
                    }}
                  >
                    {node.detail}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function ComparisonPipeline({
  leftTitle,
  leftSubtitle,
  leftNodes,
  leftAccent,
  rightTitle,
  rightSubtitle,
  rightNodes,
  rightAccent,
  steps,
  comparison,
  compareRevealThreshold = 2,
}: ComparisonPipelineProps) {
  const { stepIndex, stepCount } = usePresentationStep();
  const activeIdx = stepCount > 0 ? Math.min(stepIndex, steps.length - 1) : 0;

  let leftActiveNodeIdx = -1;
  let rightActiveNodeIdx = -1;

  for (let i = 0; i <= activeIdx; i++) {
    const step = steps[i];
    if (step.column === "left") {
      leftActiveNodeIdx = step.nodeIdx;
    } else {
      rightActiveNodeIdx = step.nodeIdx;
    }
  }

  const currentColumn = steps[activeIdx]?.column;
  if (currentColumn === "right") {
    leftActiveNodeIdx = -1;
  }

  const currentStep = steps[activeIdx];
  const showCompare =
    comparison &&
    currentColumn === "right" &&
    activeIdx >= steps.length - compareRevealThreshold;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        gap: "6px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "12px",
          flex: 1,
          minHeight: 0,
        }}
      >
        <PipelineColumn
          title={leftTitle}
          subtitle={leftSubtitle}
          nodes={leftNodes}
          accentColor={leftAccent}
          activeIdx={leftActiveNodeIdx}
          isActiveColumn={currentColumn === "left"}
        />
        <PipelineColumn
          title={rightTitle}
          subtitle={rightSubtitle}
          nodes={rightNodes}
          accentColor={rightAccent}
          activeIdx={rightActiveNodeIdx}
          isActiveColumn={currentColumn === "right"}
        />
      </div>

      {comparison && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${comparison.length}, 1fr)`,
            gap: "8px",
            flexShrink: 0,
            opacity: showCompare ? 1 : 0,
            transition: "opacity 600ms ease",
          }}
        >
          {comparison.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                background: v.bgElevated,
                border: `1px solid ${v.borderSubtle}`,
                borderRadius: v.radiusSm,
                padding: "5px 8px",
                gap: "2px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: v.textMuted,
                  fontFamily: v.fontMono,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: leftAccent,
                    fontFamily: v.fontMono,
                    textDecoration: "line-through",
                    opacity: 0.6,
                  }}
                >
                  {c.left}
                </span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "10px", color: v.textMuted }}
                >
                  arrow_forward
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: rightAccent,
                    fontWeight: 600,
                    fontFamily: v.fontMono,
                  }}
                >
                  {c.right}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 10px",
          borderRadius: v.radiusSm,
          border: `1px solid ${v.borderDefault}`,
          background: v.bgElevated,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: "9px",
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
            fontSize: "12px",
            fontWeight: 600,
            color: v.textPrimary,
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
              fontSize: "10px",
              color: v.textSecondary,
              fontFamily: v.fontMono,
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

/* ═══════════════════════════════════════════════════════════════════════
 * PillarGrid
 * ═══════════════════════════════════════════════════════════════════════ */

export interface PillarData {
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  description: string;
  keyStat: string;
  keyStatLabel: string;
  mermaidChart: string;
}

export interface PillarGridProps {
  pillars: PillarData[];
}

export function PillarGrid({ pillars }: PillarGridProps) {
  const { stepIndex, stepCount } = usePresentationStep();
  const activePillar =
    stepCount > 0 ? Math.min(stepIndex, pillars.length - 1) : 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "10px",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {pillars.map((p, idx) => {
        const isActive = idx === activePillar;
        return (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: v.radiusLg,
              border: `1.5px solid ${isActive ? p.accentColor : v.borderSubtle}`,
              background: isActive
                ? `linear-gradient(135deg, ${v.bgElevated}, ${v.bgSurface})`
                : v.bgBase,
              padding: "10px 12px",
              overflow: "hidden",
              transition: "all 400ms ease",
              boxShadow: isActive ? `0 0 24px -8px ${p.accentColor}` : "none",
              opacity: isActive ? 1 : 0.5,
              position: "relative",
            }}
          >
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  top: "-28px",
                  right: "-28px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: p.accentColor,
                  filter: "blur(50px)",
                  opacity: 0.12,
                  pointerEvents: "none",
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "22px",
                  color: isActive ? p.accentColor : v.textMuted,
                  transition: "color 400ms",
                }}
              >
                {p.icon}
              </span>
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: isActive ? v.textPrimary : v.textSecondary,
                    fontFamily: v.fontDisplay,
                    lineHeight: 1.2,
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    color: isActive ? p.accentColor : v.textMuted,
                    fontFamily: v.fontMono,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {p.subtitle}
                </div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 8px",
                  borderRadius: v.radiusSm,
                  background: isActive ? v.bgOverlay : "transparent",
                  border: `1px solid ${isActive ? p.accentColor : "transparent"}`,
                  transition: "all 400ms",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: isActive ? p.accentColor : v.textMuted,
                    fontFamily: v.fontDisplay,
                  }}
                >
                  {p.keyStat}
                </span>
              </div>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: isActive ? v.textSecondary : v.textMuted,
                fontFamily: v.fontBody,
                lineHeight: 1.4,
                flexShrink: 0,
                zIndex: 1,
                transition: "color 400ms",
              }}
            >
              {p.description}
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                marginTop: "6px",
                borderRadius: v.radiusSm,
                border: `1px solid ${isActive ? v.borderDefault : v.borderSubtle}`,
                background: v.bgBase,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
                opacity: isActive ? 1 : 0.4,
                transition: "opacity 400ms",
              }}
            >
              <MermaidDiagram chart={p.mermaidChart} compact />
            </div>
          </div>
        );
      })}
    </div>
  );
}
