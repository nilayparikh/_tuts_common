"use client";
import React from "react";

// ─── Part type definitions ─────────────────────────────────────────────────

export type PartType =
  | "video"
  | "reading"
  | "video-code"
  | "quiz"
  | "podcast"
  | "slideshow"
  | "article"
  | "lab";

export interface CoursePart {
  slug: string;
  title: string;
  type: PartType;
  /** e.g. "4 mins", "1 hour" */
  duration: string;
  /** Mark as completed (progress tracking) */
  isCompleted?: boolean;
}

export interface CourseSidebarProps {
  /** Full course title (shown at top of sidebar) */
  courseTitle: string;
  /** Ordered list of course parts */
  parts: CoursePart[];
  /** Slug of the currently displayed part */
  currentSlug: string;
  /** Base path for part links, e.g. "/tutorials/a2a-agent-protocol" */
  basePath: string;
  /** Optional total duration string */
  totalDuration?: string;
}

// ─── Icon + label per part type ────────────────────────────────────────────

const TYPE_META: Record<PartType, { icon: string; label: string }> = {
  video: { icon: "▶", label: "Video" },
  reading: { icon: "📖", label: "Reading" },
  "video-code": { icon: "💻", label: "Video with Code Example" },
  quiz: { icon: "📝", label: "Quiz" },
  podcast: { icon: "🎙", label: "Podcast" },
  slideshow: { icon: "📑", label: "Slides" },
  article: { icon: "📰", label: "Article" },
  lab: { icon: "🧪", label: "Lab" },
};

// ─── Component ─────────────────────────────────────────────────────────────

export function CourseSidebar({
  courseTitle,
  parts,
  currentSlug,
  basePath,
  totalDuration,
}: CourseSidebarProps): React.ReactElement {
  const completedCount = parts.filter((p) => p.isCompleted).length;

  return (
    <nav
      aria-label="Course navigation"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--tf-bg-surface)",
        borderRight: "1px solid var(--tf-border-subtle)",
        overflow: "hidden",
      }}
    >
      {/* Course title block */}
      <div
        style={{
          padding: "var(--tf-space-5) var(--tf-space-4) var(--tf-space-4)",
          borderBottom: "1px solid var(--tf-border-subtle)",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: "var(--tf-font-display)",
            fontWeight: 700,
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-primary)",
            lineHeight: "var(--tf-leading-snug)",
            margin: 0,
          }}
        >
          {courseTitle}
        </p>

        {/* Progress bar */}
        <div
          style={{
            marginTop: "var(--tf-space-3)",
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-2)",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 4,
              borderRadius: 9999,
              background: "var(--tf-bg-elevated)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(completedCount / parts.length) * 100}%`,
                background:
                  "linear-gradient(90deg, var(--tf-color-primary) 0%, var(--tf-color-accent) 100%)",
                borderRadius: 9999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
              flexShrink: 0,
            }}
          >
            {completedCount}/{parts.length}
          </span>
        </div>

        {totalDuration && (
          <p
            style={{
              margin: "var(--tf-space-2) 0 0",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
            }}
          >
            {totalDuration} total
          </p>
        )}
      </div>

      {/* Parts list */}
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: "var(--tf-space-2) 0",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {parts.map((part, i) => {
          const isCurrent = part.slug === currentSlug;
          const meta = TYPE_META[part.type];
          const href = `${basePath}/${part.slug}/`;

          return (
            <li key={part.slug}>
              <a
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--tf-space-3)",
                  padding: "var(--tf-space-3) var(--tf-space-4)",
                  textDecoration: "none",
                  color: isCurrent
                    ? "var(--tf-text-primary)"
                    : "var(--tf-text-secondary)",
                  background: isCurrent
                    ? "rgba(239,68,68,0.12)"
                    : "transparent",
                  borderLeft: isCurrent
                    ? "3px solid var(--tf-color-danger)"
                    : "3px solid transparent",
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "var(--tf-bg-elevated)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--tf-text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--tf-text-secondary)";
                  }
                }}
              >
                {/* Step number / completed check */}
                <span
                  style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: part.isCompleted
                      ? "2px solid var(--tf-color-success)"
                      : "2px solid var(--tf-border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    fontFamily: "var(--tf-font-mono)",
                    color: part.isCompleted
                      ? "var(--tf-color-success)"
                      : "var(--tf-text-muted)",
                    background: part.isCompleted
                      ? "rgba(16,185,129,0.08)"
                      : "transparent",
                    marginTop: 2,
                  }}
                >
                  {part.isCompleted ? "✓" : i + 1}
                </span>

                {/* Text block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--tf-text-sm)",
                      fontWeight: isCurrent ? 600 : 400,
                      lineHeight: "var(--tf-leading-snug)",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {part.title}
                  </p>
                  <p
                    style={{
                      margin: "var(--tf-space-1) 0 0",
                      fontSize: "var(--tf-text-xs)",
                      color: "var(--tf-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--tf-space-1)",
                    }}
                  >
                    <span style={{ fontSize: "0.7rem" }}>{meta.icon}</span>
                    <span>{meta.label}</span>
                    <span>·</span>
                    <span>{part.duration}</span>
                  </p>
                </div>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
