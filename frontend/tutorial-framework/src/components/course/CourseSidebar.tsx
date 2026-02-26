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

// ─── Material Symbol icon per part type ────────────────────────────────────

const TYPE_META: Record<PartType, { icon: string; label: string }> = {
  video: { icon: "play_circle", label: "Video" },
  reading: { icon: "menu_book", label: "Reading" },
  "video-code": { icon: "code", label: "Video with Code" },
  quiz: { icon: "quiz", label: "Quiz" },
  podcast: { icon: "podcasts", label: "Podcast" },
  slideshow: { icon: "slideshow", label: "Slides" },
  article: { icon: "article", label: "Article" },
  lab: { icon: "science", label: "Lab" },
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
          padding: "var(--tf-space-6) var(--tf-space-5) var(--tf-space-5)",
          borderBottom: "1px solid var(--tf-border-subtle)",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: "var(--tf-font-display)",
            fontWeight: 700,
            fontSize: "var(--tf-text-md)",
            color: "var(--tf-text-primary)",
            lineHeight: "var(--tf-leading-snug)",
            margin: 0,
          }}
        >
          {courseTitle}
        </p>

        {/* Duration + count */}
        <div
          style={{
            marginTop: "var(--tf-space-2)",
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3)",
            fontSize: "var(--tf-text-xs)",
            color: "var(--tf-text-muted)",
          }}
        >
          {totalDuration && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                schedule
              </span>
              {totalDuration}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: "var(--tf-space-3)",
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3)",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "0.25rem",
              borderRadius: "var(--tf-radius-full)",
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
                borderRadius: "var(--tf-radius-full)",
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
                  padding:
                    "var(--tf-space-3) var(--tf-space-5) var(--tf-space-3) var(--tf-space-4)",
                  textDecoration: "none",
                  color: isCurrent
                    ? "var(--tf-text-primary)"
                    : "var(--tf-text-secondary)",
                  background: isCurrent
                    ? "var(--tf-color-primary-container)"
                    : "transparent",
                  borderLeft: isCurrent
                    ? "3px solid var(--tf-color-primary)"
                    : "3px solid transparent",
                  transition:
                    "background var(--tf-transition-fast), color var(--tf-transition-fast)",
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
                {/* Step number badge */}
                <span
                  style={{
                    flexShrink: 0,
                    width: "1.5rem",
                    height: "1.5rem",
                    borderRadius: "var(--tf-radius-full)",
                    border: part.isCompleted
                      ? "2px solid var(--tf-color-success)"
                      : isCurrent
                        ? "2px solid var(--tf-color-primary)"
                        : "2px solid var(--tf-border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--tf-text-xs)",
                    fontWeight: 700,
                    fontFamily: "var(--tf-font-mono)",
                    color: part.isCompleted
                      ? "var(--tf-color-success)"
                      : isCurrent
                        ? "var(--tf-color-primary-light)"
                        : "var(--tf-text-muted)",
                    background: part.isCompleted
                      ? "var(--tf-color-success-container)"
                      : isCurrent
                        ? "var(--tf-color-primary-container)"
                        : "transparent",
                    marginTop: "0.0625rem",
                  }}
                >
                  {part.isCompleted ? (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                    >
                      check
                    </span>
                  ) : (
                    i + 1
                  )}
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
                      gap: "0.375rem",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "14px",
                        color: isCurrent
                          ? "var(--tf-color-primary-light)"
                          : "var(--tf-text-muted)",
                      }}
                    >
                      {meta.icon}
                    </span>
                    <span>{meta.label}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ fontFamily: "var(--tf-font-mono)" }}>
                      {part.duration}
                    </span>
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
