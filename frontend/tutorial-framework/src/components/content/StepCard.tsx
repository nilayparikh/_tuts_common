import React from "react";

export interface StepCardProps {
  /** Step number (1-based) */
  step: number;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Optional code snippet (plain text) */
  code?: string;
  /** Optional language for the code label */
  codeLanguage?: string;
  /** Optional note / tip text */
  note?: string;
  /** Mark step as completed */
  completed?: boolean;
}

export function StepCard({
  step,
  title,
  description,
  code,
  codeLanguage,
  note,
  completed = false,
}: StepCardProps): React.ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3rem 1fr",
        gap: "var(--tf-space-5)",
        padding: "var(--tf-space-6)",
        borderRadius: "var(--tf-radius-lg)",
        border: `1px solid ${completed ? "var(--tf-color-success-border)" : "var(--tf-border-default)"}`,

        background: completed
          ? "var(--tf-color-success-container)"
          : "var(--tf-bg-surface)",
        transition: "border-color var(--tf-transition-normal)",
      }}
      className="tf-step-card"
    >
      {/* Step circle */}
      <div
        style={{
          width: "3rem",
          height: "3rem",
          borderRadius: "var(--tf-radius-full)",
          border: `2px solid ${completed ? "var(--tf-color-success)" : "var(--tf-color-primary)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--tf-font-mono)",
          fontWeight: 700,
          fontSize: "var(--tf-text-md)",
          color: completed
            ? "var(--tf-color-success)"
            : "var(--tf-color-primary-light)",
          background: completed
            ? "var(--tf-color-success-container)"
            : "var(--tf-color-primary-bg)",
          flexShrink: 0,
        }}
      >
        {completed ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          step
        )}
      </div>

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-3)",
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "var(--tf-font-display)",
              fontWeight: 700,
              fontSize: "var(--tf-text-lg)",
              color: "var(--tf-text-primary)",
              marginBottom: "var(--tf-space-2)",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: "var(--tf-text-sm)",
              color: "var(--tf-text-secondary)",
              lineHeight: "var(--tf-leading-relaxed)",
            }}
          >
            {description}
          </p>
        </div>

        {code && (
          <div
            style={{
              borderRadius: "var(--tf-radius-lg)",
              background: "var(--tf-code-bg)",
              border: "1px solid var(--tf-border-subtle)",
              overflow: "hidden",
            }}
          >
            {codeLanguage && (
              <div
                style={{
                  padding: "0.35em var(--tf-space-4)",
                  borderBottom: "1px solid var(--tf-border-subtle)",
                  fontFamily: "var(--tf-font-mono)",
                  fontSize: "var(--tf-text-xs)",
                  color: "var(--tf-text-muted)",
                  letterSpacing: "var(--tf-tracking-wide)",
                }}
              >
                {codeLanguage}
              </div>
            )}
            <pre
              style={{
                margin: 0,
                padding: "var(--tf-space-4)",
                fontFamily: "var(--tf-font-mono)",
                fontSize: "var(--tf-text-sm)",
                color: "var(--tf-code-text)",
                overflowX: "auto",
                lineHeight: "var(--tf-leading-relaxed)",
              }}
            >
              <code>{code}</code>
            </pre>
          </div>
        )}

        {note && (
          <div
            style={{
              padding: "var(--tf-space-3) var(--tf-space-4)",
              borderRadius: "var(--tf-radius-md)",
              background: "var(--tf-color-accent-container)",
              border: "1px solid var(--tf-color-accent-border)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-color-accent-light)",
              display: "flex",
              gap: "var(--tf-space-2)",
              alignItems: "flex-start",
            }}
          >
            <span>💡</span>
            <span>{note}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── StepList helper ─────────────────────────────────────────────────────

export interface StepListProps {
  children: React.ReactNode;
}

export function StepList({ children }: StepListProps): React.ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-4)",
      }}
    >
      {children}
    </div>
  );
}
