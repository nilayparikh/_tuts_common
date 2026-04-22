"use client";

import React from "react";

import { usePresentationStep } from "./PresentationControlEngine";

const v = {
  bgBase: "var(--tf-bg-base, #0b0d12)",
  bgSurface: "var(--tf-bg-surface, #111318)",
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  bgOverlay: "var(--tf-bg-overlay, #1f222a)",
  panelBg: "var(--tf-surface-panel-bg, var(--tf-bg-surface, #111318))",
  cardBg: "var(--tf-surface-card-bg, var(--tf-bg-elevated, #191c23))",
  controlBg: "var(--tf-surface-control-bg, var(--tf-bg-overlay, #1f222a))",
  glassHighlight:
    "var(--tf-glass-highlight, linear-gradient(180deg, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 4%, transparent) 0%, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 2%, transparent) 100%))",
  glassHighlightSoft:
    "linear-gradient(180deg, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 1.5%, transparent) 0%, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 0.5%, transparent) 100%)",
  stageGlow:
    "var(--tf-state-recommendation-bg, color-mix(in srgb, var(--tf-color-primary-light, #818cf8) 14%, transparent))",
  neutralBg:
    "var(--tf-state-neutral-bg, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 8%, transparent))",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  secondary: "var(--tf-color-secondary, #14b8a6)",
  accent: "var(--tf-color-accent, #f59e0b)",
  success: "var(--tf-color-success, #10b981)",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  borderSubtle: "var(--tf-border-subtle, rgba(202,211,230,0.08))",
  shadowLevel2: "var(--tf-shadow-level2, 0 8px 20px rgba(0,0,0,0.18))",
  shadowLevel3: "var(--tf-shadow-level3, 0 16px 34px rgba(0,0,0,0.28))",
  insetHighlight:
    "inset 0 1px 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 3%, transparent)",
  guideLine:
    "color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 3%, transparent)",
  fontMono: "var(--tf-font-mono, 'JetBrains Mono', monospace)",
  radiusMd: "var(--tf-radius-md, 12px)",
  radiusLg: "var(--tf-radius-lg, 16px)",
  radiusSm: "var(--tf-radius-sm, 8px)",
};

const mixWithTransparent = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

export interface StepActor {
  id: string;
  label: string;
  color?: string;
}

export interface StepSequenceItem {
  id: string;
  title: string;
  transcript: string;
  from: string;
  to: string;
  label: string;
  detail?: string;
}

interface StepSequenceWidgetProps {
  actors: StepActor[];
  steps: StepSequenceItem[];
  density?: "default" | "compact";
}

export function StepSequenceWidget({
  actors,
  steps,
  density = "default",
}: StepSequenceWidgetProps) {
  const { stepIndex, stepCount } = usePresentationStep();
  const actorLookup = new Map(actors.map((actor, index) => [actor.id, index]));
  const defaultColors = [v.primaryLight, v.secondary, v.accent, v.success];
  const activeIndex =
    stepCount > 0 ? Math.min(stepIndex, Math.max(steps.length - 1, 0)) : 0;
  const lanePercents = actors.map(
    (_, index) => ((index + 0.5) / actors.length) * 100,
  );
  const isCompact = density === "compact";
  const shellPadding = isCompact ? "14px" : "18px";
  const shellGap = isCompact ? "10px" : "12px";
  const topColumnWidth = isCompact ? "172px" : "220px";
  const rowMinHeight = isCompact ? "82px" : "102px";
  const headerPadding = isCompact ? "10px 12px" : "12px 14px";
  const stepCardPadding = isCompact ? "10px 12px" : "14px 16px";
  const eventSize = isCompact ? "10px" : "11px";
  const titleSize = isCompact ? "14px" : "16px";
  const detailSize = isCompact ? "12px" : "13px";
  const laneDotSize = isCompact ? "8px" : "10px";
  const labelTop = isCompact ? "8px" : "10px";
  const labelPadding = isCompact ? "4px 9px" : "5px 10px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: shellGap,
        padding: shellPadding,
        borderRadius: v.radiusLg,
        border: `1px solid ${v.borderDefault}`,
        background: `radial-gradient(circle at top, ${v.stageGlow}, transparent 34%), linear-gradient(180deg, ${v.panelBg}, ${v.bgBase})`,
        backgroundImage: `radial-gradient(circle at top, ${v.stageGlow}, transparent 34%), linear-gradient(180deg, ${v.panelBg}, ${v.bgBase}), repeating-linear-gradient(180deg, ${v.guideLine} 0 1px, transparent 1px 34px)`,
        minHeight: 0,
        flex: 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${topColumnWidth} minmax(0, 1fr)`,
          gap: isCompact ? "10px" : "14px",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            padding: headerPadding,
            borderRadius: v.radiusMd,
            border: `1px solid ${v.borderDefault}`,
            background: `${v.glassHighlight}, linear-gradient(180deg, ${v.cardBg}, ${v.panelBg})`,
            boxShadow: v.insetHighlight,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: v.primaryLight,
              fontFamily: v.fontMono,
            }}
          >
            {isCompact ? "[trace]" : "[workflow trace]"}
          </div>
          <div
            style={{
              marginTop: isCompact ? "6px" : "8px",
              color: v.textSecondary,
              fontSize: isCompact ? "12px" : "13px",
              lineHeight: 1.5,
            }}
          >
            {isCompact
              ? "Prompt, discovery, and output stay on fixed lanes."
              : "Prompt, discovery, decision, and output are rendered on fixed lanes."}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${actors.length}, minmax(0, 1fr))`,
            gap: isCompact ? "8px" : "12px",
            alignItems: "stretch",
          }}
        >
          {actors.map((actor, index) => {
            const actorColor =
              actor.color ?? defaultColors[index % defaultColors.length];

            return (
              <div
                key={actor.id}
                style={{
                  padding: isCompact ? "8px 10px" : "10px 12px",
                  borderRadius: v.radiusSm,
                  background: `${v.glassHighlight}, linear-gradient(180deg, ${v.cardBg}, ${v.panelBg})`,
                  border: `1px solid ${v.borderDefault}`,
                  textAlign: "center",
                  boxShadow: v.insetHighlight,
                }}
              >
                <div
                  style={{
                    fontSize: isCompact ? "10px" : "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: actorColor,
                    fontFamily: v.fontMono,
                  }}
                >
                  [{actor.label}]
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {steps.map((step, index) => {
        const fromIndex = actorLookup.get(step.from) ?? 0;
        const toIndex = actorLookup.get(step.to) ?? fromIndex;
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        const isRevealed = index <= activeIndex;
        const isRightward = fromIndex <= toIndex;
        const accentColor =
          actors[Math.max(fromIndex, toIndex)]?.color ??
          defaultColors[Math.max(fromIndex, toIndex) % defaultColors.length];
        const fromPercent = lanePercents[fromIndex] ?? 0;
        const toPercent = lanePercents[toIndex] ?? fromPercent;
        const connectorStart = Math.min(fromPercent, toPercent);
        const connectorWidth = Math.abs(toPercent - fromPercent);

        return (
          <div key={step.id}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `${topColumnWidth} minmax(0, 1fr)`,
                gap: isCompact ? "10px" : "14px",
                alignItems: "stretch",
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed ? "translateY(0)" : "translateY(8px)",
                transition: "all 400ms ease",
              }}
            >
              <div
                style={{
                  padding: stepCardPadding,
                  borderRadius: v.radiusMd,
                  background: isActive
                    ? `${v.glassHighlight}, linear-gradient(180deg, ${v.controlBg}, ${v.bgBase})`
                    : `${v.glassHighlightSoft}, linear-gradient(180deg, ${v.cardBg}, ${v.bgBase})`,
                  border: `1px solid ${isActive ? accentColor : v.borderSubtle}`,
                  boxShadow: isActive
                    ? `0 0 0 1px ${mixWithTransparent(accentColor, 20)}, ${v.shadowLevel3}`
                    : v.shadowLevel2,
                }}
              >
                <div
                  style={{
                    fontSize: eventSize,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: accentColor,
                    fontFamily: v.fontMono,
                  }}
                >
                  [{String(index + 1).padStart(2, "0")}] event
                </div>
                <div
                  style={{
                    marginTop: isCompact ? "4px" : "6px",
                    fontSize: titleSize,
                    fontWeight: 700,
                    color: v.textPrimary,
                    lineHeight: 1.35,
                  }}
                >
                  {step.title}
                </div>
                {step.detail ? (
                  <div
                    style={{
                      marginTop: isCompact ? "6px" : "8px",
                      fontSize: detailSize,
                      color: v.textSecondary,
                      lineHeight: 1.5,
                      fontFamily: v.fontMono,
                    }}
                  >
                    $ {step.detail}
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  position: "relative",
                  minHeight: rowMinHeight,
                  borderRadius: v.radiusMd,
                  border: `1px solid ${
                    isActive
                      ? mixWithTransparent(accentColor, 26)
                      : v.borderSubtle
                  }`,
                  background: `${v.glassHighlightSoft}, linear-gradient(180deg, ${v.panelBg}, ${v.controlBg})`,
                  overflow: "hidden",
                }}
              >
                {lanePercents.map((lanePercent, laneIndex) => {
                  const laneColor =
                    actors[laneIndex]?.color ??
                    defaultColors[laneIndex % defaultColors.length];
                  const isFromLane = laneIndex === fromIndex;
                  const isToLane = laneIndex === toIndex;
                  const isHighlightedLane = isFromLane || isToLane;
                  const laneWidth = isActive
                    ? isHighlightedLane
                      ? "2px"
                      : "1px"
                    : isComplete && isHighlightedLane
                      ? "2px"
                      : "1px";
                  const laneBackground = isActive
                    ? isHighlightedLane
                      ? mixWithTransparent(laneColor, 64)
                      : v.neutralBg
                    : isComplete && isHighlightedLane
                      ? mixWithTransparent(laneColor, 42)
                      : isHighlightedLane
                        ? mixWithTransparent(laneColor, 24)
                        : v.neutralBg;

                  return (
                    <React.Fragment key={`${step.id}-lane-${laneIndex}`}>
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: `${lanePercent}%`,
                          width: laneWidth,
                          background: laneBackground,
                          transform: "translateX(-50%)",
                          zIndex: 3,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: `${lanePercent}%`,
                          width:
                            isActive && isToLane
                              ? laneDotSize + 2
                              : laneDotSize,
                          height:
                            isActive && isToLane
                              ? laneDotSize + 2
                              : laneDotSize,
                          borderRadius: "999px",
                          background: isHighlightedLane
                            ? laneColor
                            : v.bgElevated,
                          border: `1px solid ${
                            isHighlightedLane ? laneColor : v.borderDefault
                          }`,
                          transform: "translate(-50%, -50%)",
                          zIndex: 4,
                          boxShadow: "none",
                        }}
                      />
                    </React.Fragment>
                  );
                })}

                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${connectorStart}%`,
                    width: `${connectorWidth}%`,
                    height: "2px",
                    background: isActive
                      ? accentColor
                      : isComplete
                        ? mixWithTransparent(accentColor, 72)
                        : mixWithTransparent(accentColor, 40),
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    transformOrigin: isRightward
                      ? "left center"
                      : "right center",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(50% - 5px)",
                    left: isRightward
                      ? `calc(${toPercent}% - 8px)`
                      : `${toPercent}%`,
                    width: 0,
                    height: 0,
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderLeft: isRightward
                      ? `8px solid ${accentColor}`
                      : undefined,
                    borderRight: isRightward
                      ? undefined
                      : `8px solid ${accentColor}`,
                    zIndex: 4,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: labelTop,
                    left: "50%",
                    transform: "translateX(-50%)",
                    maxWidth: "calc(100% - 20px)",
                    padding: labelPadding,
                    borderRadius: "999px",
                    border: `1px solid ${
                      isActive
                        ? mixWithTransparent(accentColor, 56)
                        : v.borderSubtle
                    }`,
                    background: isActive ? v.bgOverlay : v.bgSurface,
                    color: v.textPrimary,
                    fontSize: isCompact ? "10px" : "11px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    fontFamily: v.fontMono,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    zIndex: 5,
                  }}
                >
                  {step.label}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
