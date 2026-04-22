"use client";

import React from "react";

const v = {
  bgBase: "var(--tf-bg-base, #0b0d12)",
  bgSurface: "var(--tf-bg-surface, #111318)",
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  bgOverlay: "var(--tf-bg-overlay, #1f222a)",
  panelBg: "var(--tf-surface-panel-bg, var(--tf-bg-surface, #111318))",
  cardBg: "var(--tf-surface-card-bg, var(--tf-bg-elevated, #191c23))",
  controlBg: "var(--tf-surface-control-bg, var(--tf-bg-overlay, #1f222a))",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  primary: "var(--tf-color-primary, #6366f1)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  secondary: "var(--tf-color-secondary, #14b8a6)",
  secondaryLight: "var(--tf-color-secondary-light, #2dd4bf)",
  accent: "var(--tf-color-accent, #A838FF)",
  accentLight: "var(--tf-color-accent-light, #C68BFF)",
  success: "var(--tf-color-success, #10b981)",
  warning: "var(--tf-color-warning, #f59e0b)",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  borderSubtle: "var(--tf-border-subtle, rgba(202,211,230,0.08))",
  fontDisplay:
    "var(--tf-font-display, 'Outfit', 'Segoe UI', Roboto, Arial, sans-serif)",
  fontBody:
    "var(--tf-font-body, 'Inter', 'Segoe UI', Roboto, Arial, sans-serif)",
  fontMono:
    "var(--tf-font-mono, 'JetBrains Mono', 'Share Tech Mono', Consolas, monospace)",
  radiusMd: "var(--tf-radius-md, 12px)",
  radiusLg: "var(--tf-radius-lg, 16px)",
  radiusXl: "var(--tf-radius-xl, 24px)",
};

type HandsOnLabTone = "primary" | "secondary" | "success" | "warning";

const TONES: Record<HandsOnLabTone, { border: string; label: string }> = {
  primary: { border: v.primary, label: v.primaryLight },
  secondary: { border: v.secondary, label: v.secondaryLight },
  success: { border: v.success, label: v.success },
  warning: { border: v.warning, label: v.warning },
};

export interface HandsOnLabFocusArea {
  label: string;
  value: string;
  icon: string;
  tone?: HandsOnLabTone;
}

interface HandsOnLabBridgeProps {
  eyebrow?: string;
  title?: string;
  summary: string;
  prompt?: string;
  commandLabel?: string;
  command?: string;
  focusAreas: HandsOnLabFocusArea[];
  note?: string;
}

export function HandsOnLabBridge({
  eyebrow = "Live Demo Transition",
  title = "Hands-On Lab",
  summary,
  prompt = "Switch to VS Code and walk the repo before the next build step.",
  commandLabel = "Open Here",
  command,
  focusAreas,
  note,
}: HandsOnLabBridgeProps) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr) auto",
        gap: "16px",
        padding: "20px",
        borderRadius: v.radiusLg,
        border: `1px solid ${v.borderDefault}`,
        background: `linear-gradient(180deg, ${v.panelBg}, ${v.bgBase})`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "12px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            background: v.bgOverlay,
            border: `1px solid ${v.borderSubtle}`,
            color: v.primaryLight,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: v.fontMono,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: "16px",
            lineHeight: 1.55,
            color: v.textSecondary,
            fontFamily: v.fontBody,
          }}
        >
          {summary}
        </div>
      </div>

      <div
        style={{
          minHeight: 0,
          display: "grid",
          placeItems: "center",
          padding: "10px",
          borderRadius: v.radiusXl,
          border: `1px solid ${v.borderSubtle}`,
          background:
            "radial-gradient(circle at 50% 20%, color-mix(in srgb, var(--tf-color-primary-light, #818cf8) 22%, transparent) 0%, transparent 42%), radial-gradient(circle at 80% 80%, color-mix(in srgb, var(--tf-color-accent-light, #C68BFF) 18%, transparent) 0%, transparent 36%), linear-gradient(180deg, color-mix(in srgb, var(--tf-bg-surface, #111318) 92%, var(--tf-color-primary, #6366f1) 8%) 0%, color-mix(in srgb, var(--tf-bg-elevated, #191c23) 88%, var(--tf-color-accent, #A838FF) 12%) 100%)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "repeating-linear-gradient(90deg, transparent 0, transparent 68px, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 4%, transparent) 68px, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 4%, transparent) 69px), repeating-linear-gradient(180deg, transparent 0, transparent 68px, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 4%, transparent) 68px, color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 4%, transparent) 69px)",
            opacity: 0.55,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: "min(860px, 100%)",
            minHeight: "260px",
            display: "grid",
            gridTemplateRows: "auto auto auto",
            alignContent: "center",
            justifyItems: "center",
            gap: "16px",
            padding: "32px 36px",
            borderRadius: v.radiusXl,
            border: `1px solid color-mix(in srgb, ${v.primaryLight} 28%, transparent)`,
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--tf-bg-elevated, #191c23) 82%, var(--tf-color-primary, #6366f1) 18%) 0%, color-mix(in srgb, var(--tf-bg-overlay, #1f222a) 84%, var(--tf-color-accent, #A838FF) 16%) 100%)",
            boxShadow:
              "inset 0 1px 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 8%, transparent), 0 24px 40px rgba(0,0,0,0.34)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: v.primaryLight,
              fontFamily: v.fontMono,
            }}
          >
            Transition Out Of Slides
          </div>
          <div
            style={{
              fontSize: "46px",
              lineHeight: 1,
              fontWeight: 800,
              color: v.textPrimary,
              fontFamily: v.fontDisplay,
              textAlign: "center",
            }}
          >
            {title}
          </div>
          <div
            style={{
              maxWidth: "720px",
              fontSize: "20px",
              lineHeight: 1.45,
              color: v.textSecondary,
              fontFamily: v.fontBody,
              textAlign: "center",
            }}
          >
            {prompt}
          </div>
          {command ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "999px",
                background: v.controlBg,
                border: `1px solid color-mix(in srgb, ${v.primaryLight} 32%, transparent)`,
                color: v.textPrimary,
                fontFamily: v.fontMono,
                boxShadow:
                  "inset 0 1px 0 color-mix(in srgb, var(--tf-text-primary, #e2e6f0) 6%, transparent)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: v.primaryLight,
                  fontWeight: 700,
                }}
              >
                {commandLabel}
              </span>
              <span style={{ fontSize: "15px" }}>{command}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(Math.max(focusAreas.length, 1), 4)}, minmax(0, 1fr))`,
          gap: "12px",
        }}
      >
        {focusAreas.map((area) => {
          const tone = TONES[area.tone ?? "primary"];
          return (
            <div
              key={`${area.label}-${area.value}`}
              style={{
                minHeight: 0,
                display: "grid",
                gridTemplateRows: "auto auto 1fr",
                gap: "10px",
                padding: "14px 16px",
                borderRadius: v.radiusMd,
                border: `1px solid ${tone.border}`,
                background: `linear-gradient(180deg, color-mix(in srgb, ${tone.border} 9%, ${v.cardBg}) 0%, ${v.bgSurface} 100%)`,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `color-mix(in srgb, ${tone.border} 14%, ${v.bgOverlay})`,
                  border: `1px solid ${tone.border}`,
                  color: tone.label,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px", lineHeight: 1 }}
                >
                  {area.icon}
                </span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: v.fontMono,
                  color: tone.label,
                  fontWeight: 700,
                }}
              >
                {area.label}
              </div>
              <div
                style={{
                  fontSize: "15px",
                  lineHeight: 1.5,
                  color: v.textSecondary,
                  fontFamily: v.fontBody,
                }}
              >
                {area.value}
              </div>
            </div>
          );
        })}
      </div>

      {note ? (
        <div
          style={{
            fontSize: "13px",
            lineHeight: 1.55,
            color: v.textMuted,
            fontFamily: v.fontBody,
            textAlign: "center",
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
}
