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
  /** Optional lesson number (e.g. 5 of 16) */
  lessonNumber?: number;
  /** Optional total lesson count */
  totalLessons?: number;
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
        alignItems: "flex-start",
        gap: "var(--tf-space-4)",
        marginBottom: "var(--tf-space-6)",
      }}
    >
      <PartTypeBadge type={type} duration={duration} />

      <h1
        style={{
          margin: 0,
          fontFamily: "var(--tf-font-display)",
          fontWeight: 800,
          fontSize: "clamp(1.5rem, 4vw, var(--tf-text-3xl))",
          color: "var(--tf-text-primary)",
          lineHeight: "var(--tf-leading-snug)",
          letterSpacing: "var(--tf-tracking-tight)",
          maxWidth: "40ch",
        }}
      >
        {title}
      </h1>

      {description && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--tf-text-md)",
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
