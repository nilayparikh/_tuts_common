import React from "react";
import { PartTypeBadge } from "./PartTypeBadge";
import type { PartType } from "./CourseSidebar";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface LessonHeaderProps {
  /** Part type (video, reading, quiz, etc.) */
  type: PartType;
  /** Duration label (e.g. "4 mins") */
  duration: string;
  /** Lesson title */
  title: string;
  /** Lesson description / subtitle */
  description?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Renders the header block for a single lesson page:
 * type badge, title, and optional description.
 */
export function LessonHeader({
  type,
  duration,
  title,
  description,
}: LessonHeaderProps): React.ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-3)",
        marginBottom: "var(--tf-space-8)",
      }}
    >
      <PartTypeBadge type={type} duration={duration} />

      <h1
        style={{
          margin: 0,
          fontFamily: "var(--tf-font-display)",
          fontWeight: 800,
          fontSize: "var(--tf-text-3xl)",
          color: "var(--tf-text-primary)",
          lineHeight: "var(--tf-leading-snug)",
          letterSpacing: "var(--tf-tracking-tight)",
        }}
      >
        {title}
      </h1>

      {description && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--tf-text-lg)",
            color: "var(--tf-text-secondary)",
            lineHeight: "var(--tf-leading-relaxed)",
            maxWidth: "60ch",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
