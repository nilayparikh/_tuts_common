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
  { icon: string; label: string; bg: string; color: string }
> = {
  video: {
    icon: "▶",
    label: "Video",
    bg: "rgba(239,68,68,0.1)",
    color: "#f87171",
  },
  reading: {
    icon: "📖",
    label: "Reading",
    bg: "rgba(99,102,241,0.1)",
    color: "var(--tf-color-primary-light)",
  },
  "video-code": {
    icon: "💻",
    label: "Video with Code",
    bg: "rgba(245,158,11,0.1)",
    color: "var(--tf-color-accent-light)",
  },
  quiz: {
    icon: "📝",
    label: "Graded · Quiz",
    bg: "rgba(16,185,129,0.1)",
    color: "var(--tf-color-success)",
  },
  podcast: {
    icon: "🎙",
    label: "Podcast",
    bg: "rgba(29,185,84,0.1)",
    color: "#1DB954",
  },
  slideshow: {
    icon: "📑",
    label: "Slides",
    bg: "rgba(139,61,255,0.1)",
    color: "#a78bfa",
  },
  article: {
    icon: "📰",
    label: "Article",
    bg: "rgba(14,165,233,0.1)",
    color: "#38bdf8",
  },
  lab: {
    icon: "🧪",
    label: "Lab",
    bg: "rgba(245,158,11,0.1)",
    color: "var(--tf-color-accent)",
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
        gap: isSm ? "0.25rem" : "0.375rem",
        padding: isSm ? "2px 8px" : "4px 12px",
        borderRadius: 9999,
        background: m.bg,
        border: `1px solid ${m.color}44`,
        fontFamily: "var(--tf-font-mono)",
        fontSize: isSm ? "var(--tf-text-xs)" : "var(--tf-text-sm)",
        fontWeight: 600,
        color: m.color,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: isSm ? "0.65rem" : "0.75rem" }}>{m.icon}</span>
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
