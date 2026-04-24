"use client";

import React from "react";

const v = {
  bgSurface: "var(--tf-bg-surface, #111318)",
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  bgOverlay: "var(--tf-bg-overlay, #1f222a)",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  primary: "var(--tf-color-primary, #6366f1)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  secondary: "var(--tf-color-secondary, #14b8a6)",
  secondaryLight: "var(--tf-color-secondary-light, #2dd4bf)",
  accent: "var(--tf-color-accent, #A838FF)",
  accentLight: "var(--tf-color-accent-light, #C68BFF)",
  warning: "var(--tf-color-warning, #f59e0b)",
  borderSubtle: "var(--tf-border-subtle, rgba(202,211,230,0.08))",
  fontDisplay:
    "var(--tf-font-display, 'Outfit', 'Segoe UI', Roboto, Arial, sans-serif)",
  fontBody:
    "var(--tf-font-body, 'Inter', 'Segoe UI', Roboto, Arial, sans-serif)",
  fontMono:
    "var(--tf-font-mono, 'JetBrains Mono', 'Share Tech Mono', Consolas, monospace)",
  radiusLg: "var(--tf-radius-lg, 16px)",
};

type MechanismSnapshotTone =
  | "primary"
  | "secondary"
  | "accent"
  | "warning"
  | "neutral";

const TONES: Record<MechanismSnapshotTone, { border: string; label: string }> =
  {
    primary: { border: v.primary, label: v.primaryLight },
    secondary: { border: v.secondary, label: v.secondaryLight },
    accent: { border: v.accent, label: v.accentLight },
    warning: { border: v.warning, label: v.warning },
    neutral: {
      border: "var(--tf-state-neutral-border, rgba(148,163,184,0.32))",
      label: v.textSecondary,
    },
  };

function scalePx(value: string): string {
  return `calc(${value} * var(--pe-slide-enlarge, 1))`;
}

interface SnapshotDetailLineProps {
  label: string;
  value: string;
  tone: MechanismSnapshotTone;
}

function SnapshotDetailLine({ label, value, tone }: SnapshotDetailLineProps) {
  const colors = TONES[tone];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${scalePx("96px")} minmax(0, 1fr)`,
        gap: scalePx("10px"),
        alignItems: "start",
      }}
    >
      <span
        style={{
          fontSize: scalePx("11px"),
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: colors.label,
          fontFamily: v.fontMono,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: scalePx("13px"),
          lineHeight: 1.45,
          color: v.textSecondary,
          fontFamily: v.fontBody,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export interface MechanismSnapshotCardProps {
  title: string;
  mutates: string;
  fixedSurface: string;
  courseRole: string;
  icon: string;
  tone?: MechanismSnapshotTone;
}

export function MechanismSnapshotCard({
  title,
  mutates,
  fixedSurface,
  courseRole,
  icon,
  tone = "primary",
}: MechanismSnapshotCardProps) {
  const colors = TONES[tone];

  return (
    <div
      style={{
        background: `linear-gradient(180deg, color-mix(in srgb, ${colors.border} 8%, ${v.bgElevated}) 0%, ${v.bgSurface} 100%)`,
        border: `1px solid ${colors.border}`,
        borderRadius: v.radiusLg,
        padding: scalePx("16px"),
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: scalePx("12px"),
        minHeight: 0,
        boxShadow: `inset 0 1px 0 ${v.borderSubtle}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: scalePx("12px"),
        }}
      >
        <div
          style={{
            width: scalePx("38px"),
            height: scalePx("38px"),
            borderRadius: scalePx("12px"),
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: `color-mix(in srgb, ${colors.border} 16%, ${v.bgOverlay})`,
            border: `1px solid ${colors.border}`,
            color: colors.label,
            flexShrink: 0,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: scalePx("19px"), lineHeight: 1 }}
          >
            {icon}
          </span>
        </div>
        <span
          style={{
            fontSize: scalePx("20px"),
            lineHeight: 1.2,
            color: v.textPrimary,
            fontFamily: v.fontDisplay,
            fontWeight: 700,
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ display: "grid", gap: scalePx("10px") }}>
        <SnapshotDetailLine label="Mutates" value={mutates} tone={tone} />
        <SnapshotDetailLine label="Fixed" value={fixedSurface} tone={tone} />
        <SnapshotDetailLine label="Role" value={courseRole} tone={tone} />
      </div>
    </div>
  );
}
