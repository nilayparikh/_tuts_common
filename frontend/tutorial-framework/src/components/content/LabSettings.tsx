import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface LabRequirement {
  /** Name of the tool / dependency */
  name: string;
  /** Required version or constraint (e.g. "3.11+", "^2.0") */
  version?: string;
  /** One-liner description of why it's needed */
  description?: string;
  /** URL to install or learn more */
  link?: string;
  /** Whether it's required or optional (default: required) */
  optional?: boolean;
}

export interface LabSettingsProps {
  /** Section title (default: "Lab Requirements") */
  title?: string;
  /** Short intro / description */
  description?: string;
  /** List of requirements */
  requirements: LabRequirement[];
  /** Estimated setup time (e.g. "~5 min") */
  setupTime?: string;
  /** Difficulty level */
  difficulty?: "beginner" | "intermediate" | "advanced";
}

// ─── Difficulty badges ─────────────────────────────────────────────────────

const DIFFICULTY_MAP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  beginner: {
    label: "Beginner",
    color: "var(--tf-color-success)",
    bg: "var(--tf-color-success-container)",
  },
  intermediate: {
    label: "Intermediate",
    color: "var(--tf-color-warning)",
    bg: "var(--tf-color-warning-container)",
  },
  advanced: {
    label: "Advanced",
    color: "var(--tf-color-danger)",
    bg: "var(--tf-color-danger-container)",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * LabSettings — a structured requirements block for labs / exercises.
 * Lists tools, versions, links, and estimates setup time.
 */
export function LabSettings({
  title = "Lab Requirements",
  description,
  requirements,
  setupTime,
  difficulty,
}: LabSettingsProps): React.ReactElement {
  return (
    <section
      style={{
        borderRadius: "var(--tf-radius-md)",
        border: "1px solid var(--tf-border-default)",
        background: "var(--tf-bg-surface)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--tf-space-3)",
          padding: "var(--tf-space-4) var(--tf-space-5)",
          borderBottom: "1px solid var(--tf-border-subtle)",
          background: "var(--tf-bg-elevated)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3)",
          }}
        >
          {/* Beaker icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="var(--tf-color-accent-light)"
          >
            <path d="M7 2v2h1v7.15L3.62 18.42A2 2 0 0 0 5.23 22h13.54a2 2 0 0 0 1.61-3.58L16 11.15V4h1V2H7zm4 2h2v8l4.38 7H6.62L11 12V4z" />
          </svg>
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--tf-font-display)",
              fontWeight: 700,
              fontSize: "var(--tf-text-md)",
              color: "var(--tf-text-primary)",
            }}
          >
            {title}
          </h3>
        </div>

        <div style={{ display: "flex", gap: "var(--tf-space-2)" }}>
          {difficulty && (
            <span
              style={{
                padding: "0.125rem var(--tf-space-2)",
                borderRadius: "var(--tf-radius-full)",
                background: DIFFICULTY_MAP[difficulty].bg,
                color: DIFFICULTY_MAP[difficulty].color,
                fontFamily: "var(--tf-font-mono)",
                fontSize: "var(--tf-text-xs)",
                fontWeight: 600,
              }}
            >
              {DIFFICULTY_MAP[difficulty].label}
            </span>
          )}
          {setupTime && (
            <span
              style={{
                padding: "0.125rem var(--tf-space-2)",
                borderRadius: "var(--tf-radius-full)",
                background: "var(--tf-bg-overlay)",
                color: "var(--tf-text-muted)",
                fontFamily: "var(--tf-font-mono)",
                fontSize: "var(--tf-text-xs)",
                fontWeight: 500,
              }}
            >
              {setupTime}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            padding: "var(--tf-space-4) var(--tf-space-5) 0",
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-secondary)",
            lineHeight: "var(--tf-leading-relaxed)",
          }}
        >
          {description}
        </div>
      )}

      {/* Requirements list */}
      <div style={{ padding: "var(--tf-space-4) var(--tf-space-5)" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--tf-space-2)",
          }}
        >
          {requirements.map((req) => (
            <div
              key={req.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--tf-space-3)",
                padding: "var(--tf-space-2) var(--tf-space-3)",
                borderRadius: "var(--tf-radius-sm)",
                border: "1px solid var(--tf-border-subtle)",
                background: "var(--tf-bg-elevated)",
              }}
            >
              {/* Status dot */}
              <span
                style={{
                  flexShrink: 0,
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "var(--tf-radius-full)",
                  background: req.optional
                    ? "var(--tf-text-muted)"
                    : "var(--tf-color-success)",
                }}
              />

              {/* Name + version */}
              <span
                style={{
                  fontFamily: "var(--tf-font-mono)",
                  fontSize: "var(--tf-text-sm)",
                  fontWeight: 600,
                  color: "var(--tf-text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {req.name}
                {req.version && (
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--tf-text-muted)",
                      marginLeft: "var(--tf-space-1)",
                    }}
                  >
                    {req.version}
                  </span>
                )}
              </span>

              {/* Description */}
              {req.description && (
                <span
                  style={{
                    flex: 1,
                    fontSize: "var(--tf-text-xs)",
                    color: "var(--tf-text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {req.description}
                </span>
              )}

              {/* Optional badge */}
              {req.optional && (
                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: "var(--tf-font-mono)",
                    fontSize: "var(--tf-text-xs)",
                    color: "var(--tf-text-muted)",
                    fontStyle: "italic",
                  }}
                >
                  optional
                </span>
              )}

              {/* Link */}
              {req.link && (
                <a
                  href={req.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flexShrink: 0,
                    color: "var(--tf-color-primary-light)",
                    fontSize: "var(--tf-text-xs)",
                    fontWeight: 500,
                  }}
                >
                  Install →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
