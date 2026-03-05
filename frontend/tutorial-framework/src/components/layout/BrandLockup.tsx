import React from "react";

/**
 * BrandLockup — Reusable LocalM™ TUTS brand mark component.
 *
 * Renders: [icon] localm™ TUTS
 *
 * Sizes:
 *   "sm"  — footer / compact contexts
 *   "md"  — header / default
 *   "lg"  — hero / splash
 */

export type BrandLockupSize = "sm" | "md" | "lg";

export interface BrandLockupProps {
  /** Icon image URL (e.g. gradient icon mark PNG) */
  iconUrl?: string;
  /** Preset size */
  size?: BrandLockupSize;
  /** Accessible label (defaults to "LocalM™ Tuts") */
  label?: string;
}

/* ─── Size presets ──────────────────────────────────────────────────────── */

interface SizePreset {
  icon: number;
  primary: string;
  secondary: string;
  tm: string;
  gap: string;
  wordmarkGap: string;
}

const SIZES: Record<BrandLockupSize, SizePreset> = {
  sm: {
    icon: 26,
    primary: "0.98rem",
    secondary: "0.94rem",
    tm: "0.55em",
    gap: "0.4rem",
    wordmarkGap: "0.3rem",
  },
  md: {
    icon: 35,
    primary: "1.35rem",
    secondary: "1.28rem",
    tm: "0.55em",
    gap: "0.5rem",
    wordmarkGap: "0.45rem",
  },
  lg: {
    icon: 48,
    primary: "2rem",
    secondary: "1.9rem",
    tm: "0.55em",
    gap: "0.65rem",
    wordmarkGap: "0.55rem",
  },
};

/* ─── Component ─────────────────────────────────────────────────────────── */

export function BrandLockup({
  iconUrl,
  size = "md",
  label = "LocalM\u2122 Tuts",
}: BrandLockupProps): React.ReactElement {
  const p = SIZES[size];

  const root: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: p.gap,
    textDecoration: "none",
    flexShrink: 0,
  };

  const wordmark: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "baseline",
    gap: p.wordmarkGap,
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  const primaryStyle: React.CSSProperties = {
    fontFamily: "'Share Tech Mono', var(--tf-font-mono)",
    fontWeight: 700,
    fontSize: p.primary,
    color: "var(--tf-text-primary)",
    letterSpacing: "0.01em",
    textTransform: "lowercase",
  };

  const tmStyle: React.CSSProperties = {
    fontFamily: "'Outfit', var(--tf-font-display)",
    fontWeight: 600,
    fontSize: p.tm,
    color: "var(--tf-color-primary-light)",
    verticalAlign: "super",
    marginLeft: "0.02em",
    lineHeight: 1,
  };

  const secondaryStyle: React.CSSProperties = {
    fontFamily: "'Outfit', var(--tf-font-display)",
    fontWeight: 300,
    fontSize: p.secondary,
    color: "var(--tf-text-secondary)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  return (
    <span style={root} aria-label={label}>
      {iconUrl && (
        <img
          src={iconUrl}
          alt=""
          aria-hidden="true"
          style={{
            width: p.icon,
            height: p.icon,
            borderRadius: 0,
            objectFit: "contain",
          }}
        />
      )}
      <span style={wordmark}>
        <span style={primaryStyle}>
          localm<span style={tmStyle}>{"\u2122"}</span>
        </span>
        <span style={secondaryStyle}>TUTS</span>
      </span>
    </span>
  );
}
