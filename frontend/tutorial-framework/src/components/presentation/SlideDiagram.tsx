"use client";

/**
 * SlideDiagram — Visual components for architecture / flow diagrams.
 *
 * Uses CSS vars (--tf-*) for theme compatibility.
 * Peer dependency: spectacle ^10.0.0
 */

import React from "react";
import { Text, FlexBox, Box } from "spectacle";

/* ── CSS var shorthands ───────────────────────────────────────────────── */

const v = {
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  radiusMd: "var(--tf-radius-md, 12px)",
  radiusLg: "var(--tf-radius-lg, 16px)",
  fontDisplay: "var(--tf-font-display, 'Inter', system-ui, sans-serif)",
  fontMono: "var(--tf-font-mono, 'JetBrains Mono', monospace)",
};

/* ── Diagram Box (container for inline SVG / visuals) ─────────────────── */

interface DiagramBoxProps {
  children: React.ReactNode;
  maxWidth?: string;
}

export function DiagramBox({ children, maxWidth = "100%" }: DiagramBoxProps) {
  return (
    <Box
      style={{
        background: v.bgElevated,
        borderRadius: v.radiusLg,
        border: `1px solid ${v.borderDefault}`,
        padding: "28px 32px",
        maxWidth,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {children}
    </Box>
  );
}

/* ── Flow Node ────────────────────────────────────────────────────────── */

interface FlowNodeProps {
  icon?: string;
  label: string;
  sub?: string;
  color?: string;
  width?: string;
}

export function FlowNode({
  icon,
  label,
  sub,
  color,
  width = "150px",
}: FlowNodeProps) {
  const c = color ?? v.primaryLight;
  return (
    <Box
      style={{
        background: v.bgElevated,
        border: `1.5px solid ${c}`,
        borderRadius: v.radiusMd,
        padding: "12px 16px",
        textAlign: "center",
        minWidth: width,
      }}
    >
      {icon && (
        <Text fontSize="22px" style={{ margin: 0, marginBottom: "4px" }}>
          {icon}
        </Text>
      )}
      <Text
        fontSize="15px"
        fontWeight={600}
        color={c}
        fontFamily={v.fontDisplay}
        style={{ margin: 0 }}
      >
        {label}
      </Text>
      {sub && (
        <Text
          fontSize="11px"
          color={v.textMuted}
          fontFamily={v.fontMono}
          style={{ margin: 0, marginTop: "2px" }}
        >
          {sub}
        </Text>
      )}
    </Box>
  );
}

/* ── Arrow ────────────────────────────────────────────────────────────── */

interface ArrowProps {
  direction?: "right" | "down";
  label?: string;
  color?: string;
}

export function Arrow({ direction = "right", label, color }: ArrowProps) {
  const c = color ?? v.primaryLight;
  const isDown = direction === "down";
  return (
    <FlexBox
      flexDirection={isDown ? "column" : "row"}
      alignItems="center"
      style={{ margin: isDown ? "6px 0" : "0 6px" }}
    >
      <Box
        style={{
          width: isDown ? "2px" : "36px",
          height: isDown ? "20px" : "2px",
          background: c,
        }}
      />
      <Text
        fontSize="16px"
        color={c}
        style={{ margin: isDown ? "2px 0" : "0 3px" }}
      >
        {isDown ? "▼" : "▶"}
      </Text>
      {label && (
        <Text
          fontSize="12px"
          color={v.textMuted}
          fontFamily={v.fontMono}
          style={{ margin: 0 }}
        >
          {label}
        </Text>
      )}
    </FlexBox>
  );
}

/* ── Two Column Layout ────────────────────────────────────────────────── */

interface TwoColumnProps {
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: string;
}

export function TwoColumn({ left, right, ratio = "1fr 1fr" }: TwoColumnProps) {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: ratio,
        gap: "28px",
        alignItems: "start",
      }}
    >
      <Box>{left}</Box>
      <Box>{right}</Box>
    </Box>
  );
}

/* ── Timeline ─────────────────────────────────────────────────────────── */

interface TimelineProps {
  steps: Array<{ label: string; date?: string; active?: boolean }>;
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <FlexBox alignItems="center" justifyContent="center" style={{ gap: "0" }}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <Box style={{ textAlign: "center" }}>
            <Box
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: step.active ? v.primaryLight : v.textMuted,
                margin: "0 auto 6px",
                boxShadow: step.active ? `0 0 12px ${v.primaryLight}` : "none",
              }}
            />
            <Text
              fontSize="13px"
              fontWeight={step.active ? 700 : 400}
              color={step.active ? v.textPrimary : v.textMuted}
              fontFamily={v.fontDisplay}
              style={{ margin: 0 }}
            >
              {step.label}
            </Text>
            {step.date && (
              <Text fontSize="11px" color={v.textMuted} style={{ margin: 0 }}>
                {step.date}
              </Text>
            )}
          </Box>
          {i < steps.length - 1 && (
            <Box
              style={{
                width: "50px",
                height: "2px",
                background: `linear-gradient(90deg, ${
                  step.active ? v.primaryLight : v.textMuted
                }, ${steps[i + 1]?.active ? v.primaryLight : v.textMuted})`,
                alignSelf: "flex-start",
                marginTop: "6px",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </FlexBox>
  );
}
