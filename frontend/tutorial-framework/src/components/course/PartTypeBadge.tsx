import React from "react";
import type { PartType } from "./CourseSidebar";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PartTypeBadgeProps {
  type: PartType;
  duration?: string;
  /** Visual size */
  size?: "sm" | "md";
}

// ─── Meta map ──────────────────────────────────────────────────────────────

const META: Record<
  PartType,
  {
    icon: string;
    label: string;
    bg: string;
    color: string;
    borderColor: string;
  }
> = {
  video: {
    icon: "▶",
    label: "Video",
    bg: "var(--tf-color-danger-container)",
    color: "var(--tf-color-danger)",
    borderColor: "var(--tf-color-danger-border)",
  },
  reading: {
    icon: "📖",
    label: "Reading",
    bg: "var(--tf-color-primary-container)",
    color: "var(--tf-color-primary-light)",
    borderColor: "var(--tf-color-primary-border)",
  },
  "video-code": {
    icon: "💻",
    label: "Video with Code",
    bg: "var(--tf-color-accent-container)",
    color: "var(--tf-color-accent-light)",
    borderColor: "var(--tf-color-accent-border)",
  },
  quiz: {
    icon: "📝",
    label: "Graded · Quiz",
    bg: "var(--tf-color-success-container)",
    color: "var(--tf-color-success)",
    borderColor: "var(--tf-color-success-border)",
  },
  podcast: {
    icon: "🎙",
    label: "Podcast",
    bg: "var(--tf-color-success-container)",
    color: "var(--tf-brand-spotify)",
    borderColor: "var(--tf-color-success-border)",
  },
  slideshow: {
    icon: "📑",
    label: "Slides",
    bg: "var(--tf-color-primary-container)",
    color: "var(--tf-color-primary-light)",
    borderColor: "var(--tf-color-primary-border)",
  },
  article: {
    icon: "📰",
    label: "Article",
    bg: "var(--tf-color-secondary-container)",
    color: "var(--tf-color-secondary-light)",
    borderColor: "var(--tf-color-secondary-border)",
  },
  lab: {
    icon: "🧪",
    label: "Lab",
    bg: "var(--tf-color-accent-container)",
    color: "var(--tf-color-accent)",
    borderColor: "var(--tf-color-accent-border)",
  },
  code: {
    icon: "🖥️",
    label: "Code",
    bg: "var(--tf-color-secondary-container)",
    color: "var(--tf-color-secondary-light)",
    borderColor: "var(--tf-color-secondary-border)",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

export function PartTypeBadge({
  type,
  duration,
  size = "md",
}: PartTypeBadgeProps): React.ReactElement {
  const m = META[type];
  const isSm = size === "sm";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSm ? "var(--tf-space-1)" : "var(--tf-space-2)",
        padding: isSm
          ? "var(--tf-space-0) var(--tf-space-2)"
          : "var(--tf-space-1) var(--tf-space-3)",
        borderRadius: "var(--tf-radius-full)",
        background: m.bg,
        border: `1px solid ${m.borderColor}`,
        fontFamily: "var(--tf-font-mono)",
        fontSize: isSm ? "var(--tf-text-xs)" : "var(--tf-text-sm)",
        fontWeight: 600,
        color: m.color,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "var(--tf-text-xs)" }}>{m.icon}</span>
      <span>{m.label}</span>
      {duration && (
        <>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ fontWeight: 400, opacity: 0.85 }}>{duration}</span>
        </>
      )}
    </div>
  );
}
