"use client";

/**
 * ProcessStagesWidget — Animated horizontal / vertical pipeline.
 *
 * Stages activate one at a time via `usePresentationStep()`.
 * Each stage is a card with a Material Symbols icon, title, and
 * description. A progress bar connects stages and fills as the
 * presenter advances.
 *
 * Unlike StepSequenceWidget (lane-based sequence trace) and
 * FlowDiagramWidget (freeform graph), this renders a **linear
 * pipeline** with stage-by-stage progressive activation.
 */

import React from "react";
import { usePresentationStep } from "./PresentationControlEngine";

/* ── CSS var shorthands ───────────────────────────────────────────────── */

const v = {
  bgBase: "var(--tf-bg-base, #0b0d12)",
  bgSurface: "var(--tf-bg-surface, #111318)",
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  bgOverlay: "var(--tf-bg-overlay, #1f222a)",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  secondary: "var(--tf-color-secondary, #14b8a6)",
  accent: "var(--tf-color-accent, #f59e0b)",
  success: "var(--tf-color-success, #10b981)",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  borderSubtle: "var(--tf-border-subtle, rgba(202,211,230,0.08))",
  fontMono: "var(--tf-font-mono, 'JetBrains Mono', monospace)",
  radiusMd: "var(--tf-radius-md, 12px)",
  radiusLg: "var(--tf-radius-lg, 16px)",
  radiusSm: "var(--tf-radius-sm, 8px)",
};

const mixAlpha = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/* ── Public types ─────────────────────────────────────────────────────── */

/** A single stage in the pipeline. */
export interface ProcessStage {
  id: string;
  /** Material Symbols icon name (e.g. "edit_note", "fact_check") */
  icon: string;
  label: string;
  /** Shown when the stage is active */
  description: string;
  /** PresentationStep fields for the control engine */
  title: string;
  transcript: string;
  /** Accent color override */
  color?: string;
  /** Optional output label shown on the connector leaving this stage */
  outputLabel?: string;
}

interface ProcessStagesWidgetProps {
  stages: ProcessStage[];
  /** "horizontal" (default) or "vertical" */
  direction?: "horizontal" | "vertical";
  density?: "default" | "compact";
}

/* ── Component ────────────────────────────────────────────────────────── */

export function ProcessStagesWidget({
  stages,
  direction = "horizontal",
  density = "default",
}: ProcessStagesWidgetProps) {
  const { stepIndex, stepCount } = usePresentationStep();
  const activeIdx =
    stepCount > 0 ? Math.min(stepIndex, Math.max(stages.length - 1, 0)) : 0;
  const isCompact = density === "compact";
  const isHorizontal = direction === "horizontal";

  const defaultColors = [v.primaryLight, v.secondary, v.accent, v.success];
  const iconSize = isCompact ? 28 : 34;
  const cardPad = isCompact ? "12px 14px" : "16px 18px";
  const connectorThick = isCompact ? 3 : 4;
  const connectorLen = isCompact ? 32 : 44;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isCompact ? "12px" : "16px",
        padding: isCompact ? "14px" : "18px",
        borderRadius: v.radiusLg,
        border: `1px solid ${v.borderDefault}`,
        background: `linear-gradient(180deg, ${v.bgSurface}, ${v.bgBase})`,
        minHeight: 0,
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* ── Pipeline row / column ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          padding: isCompact ? "8px 0" : "12px 0",
        }}
      >
        {stages.map((stage, idx) => {
          const isActive = idx === activeIdx;
          const isComplete = idx < activeIdx;
          const isRevealed = idx <= activeIdx;
          const color =
            stage.color ?? defaultColors[idx % defaultColors.length];
          const isLast = idx === stages.length - 1;

          return (
            <React.Fragment key={stage.id}>
              {/* Stage card */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: isCompact ? "6px" : "8px",
                  padding: cardPad,
                  borderRadius: v.radiusMd,
                  border: `1.5px solid ${isActive ? color : isRevealed ? mixAlpha(color, 50) : v.borderSubtle}`,
                  background: isActive
                    ? `linear-gradient(180deg, ${mixAlpha(color, 14)}, ${v.bgElevated})`
                    : v.bgElevated,
                  boxShadow: isActive
                    ? `0 0 24px ${mixAlpha(color, 25)}, 0 4px 16px rgba(0,0,0,0.3)`
                    : "0 2px 8px rgba(0,0,0,0.15)",
                  opacity: isRevealed ? 1 : 0.3,
                  transform: isRevealed ? "scale(1)" : "scale(0.9)",
                  transition: "all 350ms cubic-bezier(0.4, 0, 0.2, 1)",
                  flex: isHorizontal ? "1 1 0" : undefined,
                  minWidth: 0,
                  maxWidth: isHorizontal
                    ? isCompact
                      ? "180px"
                      : "200px"
                    : undefined,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Completion check badge */}
                {isComplete && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: v.success,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 8px ${mixAlpha(v.success, 40)}`,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "12px", color: "#0b0d12" }}
                    >
                      check
                    </span>
                  </div>
                )}

                {/* Icon circle */}
                <div
                  style={{
                    width: `${iconSize + 16}px`,
                    height: `${iconSize + 16}px`,
                    borderRadius: "50%",
                    background: isActive
                      ? mixAlpha(color, 20)
                      : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${isActive ? color : mixAlpha(color, 30)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 350ms ease",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: `${iconSize}px`,
                      color: isRevealed ? color : v.textMuted,
                      transition: "color 350ms ease",
                    }}
                  >
                    {stage.icon}
                  </span>
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: isCompact ? "11px" : "13px",
                    fontWeight: 700,
                    color: isRevealed ? v.textPrimary : v.textMuted,
                    fontFamily: v.fontMono,
                    textAlign: "center",
                    lineHeight: 1.2,
                    transition: "color 350ms ease",
                  }}
                >
                  {stage.label}
                </span>

                {/* Description (only when active) */}
                {isActive && stage.description && (
                  <span
                    style={{
                      fontSize: isCompact ? "10px" : "11px",
                      color: v.textSecondary,
                      textAlign: "center",
                      lineHeight: 1.4,
                      maxWidth: isCompact ? "120px" : "150px",
                    }}
                  >
                    {stage.description}
                  </span>
                )}
              </div>

              {/* Connector between stages */}
              {!isLast && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: isHorizontal ? "row" : "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    flexShrink: 1,
                    ...(isHorizontal
                      ? {
                          width: `${connectorLen}px`,
                          minWidth: "20px",
                          height: `${connectorThick}px`,
                        }
                      : {
                          height: `${connectorLen}px`,
                          minHeight: "20px",
                          width: `${connectorThick}px`,
                        }),
                  }}
                >
                  {/* Track background */}
                  <div
                    style={{
                      position: "absolute",
                      ...(isHorizontal
                        ? {
                            left: 0,
                            right: 0,
                            top: "50%",
                            height: `${connectorThick}px`,
                            transform: "translateY(-50%)",
                          }
                        : {
                            top: 0,
                            bottom: 0,
                            left: "50%",
                            width: `${connectorThick}px`,
                            transform: "translateX(-50%)",
                          }),
                      background: v.borderDefault,
                      borderRadius: "999px",
                    }}
                  />
                  {/* Fill progress */}
                  <div
                    style={{
                      position: "absolute",
                      ...(isHorizontal
                        ? {
                            left: 0,
                            top: "50%",
                            height: `${connectorThick}px`,
                            transform: "translateY(-50%)",
                            width: isComplete ? "100%" : "0%",
                          }
                        : {
                            top: 0,
                            left: "50%",
                            width: `${connectorThick}px`,
                            transform: "translateX(-50%)",
                            height: isComplete ? "100%" : "0%",
                          }),
                      background:
                        stages[idx].color ??
                        defaultColors[idx % defaultColors.length],
                      borderRadius: "999px",
                      transition: "all 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                  {/* Arrow head */}
                  <div
                    style={{
                      position: "absolute",
                      ...(isHorizontal
                        ? {
                            right: "-4px",
                            top: "50%",
                            transform: "translateY(-50%)",
                          }
                        : {
                            bottom: "-4px",
                            left: "50%",
                            transform: "translateX(-50%)",
                          }),
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "14px",
                        color: isComplete
                          ? (stages[idx].color ??
                            defaultColors[idx % defaultColors.length])
                          : v.textMuted,
                        transition: "color 350ms ease",
                      }}
                    >
                      {isHorizontal ? "chevron_right" : "expand_more"}
                    </span>
                  </div>
                  {/* Output label */}
                  {stage.outputLabel && (
                    <div
                      style={{
                        position: "absolute",
                        ...(isHorizontal
                          ? {
                              top: "-16px",
                              left: "50%",
                              transform: "translateX(-50%)",
                            }
                          : {
                              left: "16px",
                              top: "50%",
                              transform: "translateY(-50%)",
                            }),
                        fontSize: isCompact ? "8px" : "9px",
                        fontFamily: v.fontMono,
                        color: isComplete ? v.textSecondary : v.textMuted,
                        whiteSpace: "nowrap",
                        transition: "color 350ms ease",
                      }}
                    >
                      {stage.outputLabel}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Active stage detail bar ────────────────────────────────── */}
      <div
        style={{
          padding: isCompact ? "10px 12px" : "12px 16px",
          borderRadius: v.radiusSm,
          border: `1px solid ${v.borderDefault}`,
          background: `linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`,
          display: "flex",
          alignItems: "center",
          gap: isCompact ? "10px" : "14px",
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
              stages[activeIdx]?.color ??
              defaultColors[activeIdx % defaultColors.length],
            fontFamily: v.fontMono,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          stage {String(activeIdx + 1).padStart(2, "0")}/
          {String(stages.length).padStart(2, "0")}
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
          {stages[activeIdx]?.title ?? ""}
        </div>
        {stages[activeIdx]?.description && (
          <div
            style={{
              fontSize: isCompact ? "10px" : "11px",
              color: v.textSecondary,
              fontFamily: v.fontMono,
              lineHeight: 1.4,
              marginLeft: "auto",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            {stages[activeIdx].description}
          </div>
        )}
      </div>
    </div>
  );
}
