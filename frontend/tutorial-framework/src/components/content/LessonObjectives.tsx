import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface LessonObjectivesProps {
  /** List of learning objective strings */
  objectives: string[];
  /** Optional section heading — defaults to "Learning Objectives" */
  title?: string;
}

// ─── Target icon (SVG — no external deps) ─────────────────────────────────

const TargetIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// ─── Checkmark icon ────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * LessonObjectives — displays a lesson's learning goals as a clean card.
 *
 * Each objective is shown with a checkmark bullet inside a tinted circle.
 * Works for all lesson types (reading, video, code, article).
 *
 * @example
 * <LessonObjectives
 *   objectives={["Understand the A2A protocol", "Build an AgentExecutor"]}
 * />
 */
export function LessonObjectives({
  objectives,
  title = "Learning Objectives",
}: LessonObjectivesProps): React.ReactElement | null {
  if (!objectives || objectives.length === 0) return null;

  return (
    <section
      aria-label="Learning objectives"
      style={{
        borderRadius: "var(--tf-radius-lg)",
        border: "1px solid var(--tf-border-subtle)",
        background: "var(--tf-bg-surface)",
        overflow: "hidden",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--tf-space-2)",
          padding: "var(--tf-space-4) var(--tf-space-5)",
          borderBottom: "1px solid var(--tf-border-subtle)",
          background: "var(--tf-bg-surface-raised)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            color: "var(--tf-color-primary-light)",
          }}
        >
          <TargetIcon />
        </span>
        <span
          style={{
            fontFamily: "var(--tf-font-display)",
            fontWeight: 700,
            fontSize: "var(--tf-text-sm)",
            letterSpacing: "var(--tf-tracking-wide)",
            textTransform: "uppercase",
            color: "var(--tf-color-primary-light)",
          }}
        >
          {title}
        </span>
        <span
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "1.25rem",
            minWidth: "1.25rem",
            borderRadius: "var(--tf-radius-full)",
            background: "rgba(99,102,241,0.18)",
            fontSize: "0.65rem",
            fontWeight: 700,
            fontFamily: "var(--tf-font-mono)",
            color: "var(--tf-color-primary-light)",
            padding: "0 0.3rem",
          }}
        >
          {objectives.length}
        </span>
      </div>

      {/* Objective rows */}
      <ul
        role="list"
        style={{
          margin: 0,
          padding: "var(--tf-space-2) 0",
          listStyle: "none",
        }}
      >
        {objectives.map((obj, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--tf-space-3)",
              padding: "var(--tf-space-3) var(--tf-space-5)",
              borderBottom:
                i < objectives.length - 1
                  ? "1px solid var(--tf-border-subtle)"
                  : "none",
            }}
          >
            {/* Check badge */}
            <span
              style={{
                flexShrink: 0,
                marginTop: "0.1rem",
                width: "1.375rem",
                height: "1.375rem",
                borderRadius: "var(--tf-radius-full)",
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(129,140,248,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--tf-color-primary-light)",
              }}
            >
              <CheckIcon />
            </span>

            {/* Objective text */}
            <span
              style={{
                fontSize: "var(--tf-text-sm)",
                lineHeight: "var(--tf-leading-relaxed)",
                color: "var(--tf-text-primary)",
                fontWeight: 450,
              }}
            >
              {obj}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
