import React from "react";
import type { CoursePart, PartType } from "./CourseSidebar";
import { getPartTypePresentation } from "./partTypePresentation";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PartTypeBadgeProps {
  part?: CoursePart;
  type: PartType;
  duration?: string;
  /** Visual size */
  size?: "sm" | "md";
}

// ─── Component ─────────────────────────────────────────────────────────────

export function PartTypeBadge({
  part,
  type,
  duration,
  size = "md",
}: PartTypeBadgeProps): React.ReactElement {
  const m = getPartTypePresentation(
    part ?? {
      slug: type,
      title: "",
      type,
      duration: duration ?? "",
    },
  );
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
      <span style={{ fontSize: "var(--tf-text-xs)" }}>{m.badgeIcon}</span>
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
