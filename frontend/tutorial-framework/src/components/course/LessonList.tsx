import React from "react";
import { PartTypeBadge } from "./PartTypeBadge";
import type { CoursePart, PartType } from "./CourseSidebar";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface LessonListProps {
  /** Ordered list of course parts */
  parts: CoursePart[];
  /** Base path for part links (e.g. "" for root or "/tutorials/a2a") */
  basePath?: string;
}

// ─── Type icons ────────────────────────────────────────────────────────────

const TYPE_ICON: Record<PartType, string> = {
  video: "▶",
  reading: "📖",
  "video-code": "💻",
  quiz: "📝",
  podcast: "🎙",
  slideshow: "📑",
  article: "📰",
  lab: "🧪",
};

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Renders a clickable ordered list of lessons for a course overview page.
 * Each row shows step number, type icon, title, description, badge, and arrow.
 */
export function LessonList({
  parts,
  basePath = "",
}: LessonListProps): React.ReactElement {
  return (
    <div
      className="tf-lesson-list"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-2)",
      }}
    >
      {parts.map((part, i) => {
        const href = `${basePath}/${part.slug}/`;
        const icon = TYPE_ICON[part.type] ?? "\u25b6";

        return (
          <a
            key={part.slug}
            href={href}
            className="tf-lesson-list__item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--tf-space-4)",
              padding: "var(--tf-space-4) var(--tf-space-5)",
              borderRadius: "var(--tf-radius-xl)",
              border: "1px solid var(--tf-border-subtle)",
              background: "var(--tf-bg-surface)",
              textDecoration: "none",
              color: "inherit",
              transition:
                "border-color var(--tf-transition-fast), background var(--tf-transition-fast)",
            }}
          >
            {/* Step number */}
            <span
              className="tf-lesson-list__number"
              style={{
                flexShrink: 0,
                width: "2rem",
                height: "2rem",
                borderRadius: "var(--tf-radius-full)",
                border: "1px solid var(--tf-border-default)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--tf-font-mono)",
                fontSize: "var(--tf-text-xs)",
                fontWeight: 700,
                color: "var(--tf-text-muted)",
              }}
            >
              {i + 1}
            </span>

            {/* Type icon */}
            <span
              className="tf-lesson-list__icon"
              style={{
                flexShrink: 0,
                fontSize: "1.25rem",
                lineHeight: 1,
              }}
            >
              {icon}
            </span>

            {/* Title + badge + description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "var(--tf-text-sm)",
                  color: "var(--tf-text-primary)",
                }}
              >
                {part.title}
              </p>
              <div style={{ marginTop: "var(--tf-space-1)" }}>
                <PartTypeBadge
                  type={part.type}
                  duration={part.duration}
                  size="sm"
                />
              </div>
              {"description" in part &&
                (part as CoursePart & { description?: string }).description && (
                  <p
                    style={{
                      margin: "var(--tf-space-0) 0 0",
                      fontSize: "var(--tf-text-xs)",
                      color: "var(--tf-text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {
                      (part as CoursePart & { description?: string })
                        .description
                    }
                  </p>
                )}
            </div>

            {/* Arrow */}
            <span
              style={{
                flexShrink: 0,
                color: "var(--tf-text-muted)",
                fontSize: "var(--tf-text-sm)",
              }}
            >
              →
            </span>
          </a>
        );
      })}
    </div>
  );
}
