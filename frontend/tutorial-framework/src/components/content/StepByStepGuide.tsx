"use client";
import React, { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface StepGuideStep {
  /** Step title */
  title: string;
  /** Step description / body */
  description: string;
  /** Optional code snippet */
  code?: string;
  /** Code language label */
  codeLanguage?: string;
  /** Optional note text */
  note?: string;
  /** Optional image URL */
  imageUrl?: string;
}

export interface StepByStepGuideProps {
  /** Guide title */
  title: string;
  /** Steps */
  steps: StepGuideStep[];
  /** Allow completing steps (interactive) */
  interactive?: boolean;
}

// ─── Material Icons (inline SVGs) ──────────────────────────────────────────

function CheckCircleIcon(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function CircleOutlineIcon({ number }: { number: number }): React.ReactElement {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26">
      {/* Filled background for better contrast */}
      <circle
        cx="13"
        cy="13"
        r="13"
        style={{ fill: "var(--tf-color-primary-container-high)" }}
      />
      <circle
        cx="13"
        cy="13"
        r="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="13"
        y="13"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="var(--tf-font-mono)"
      >
        {number}
      </text>
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export function StepByStepGuide({
  title,
  steps,
  interactive = true,
}: StepByStepGuideProps): React.ReactElement {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  function toggleStep(index: number) {
    if (!interactive) return;
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const completedCount = completed.size;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-4)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--tf-space-4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              color: "var(--tf-color-primary-light)",
              flexShrink: 0,
            }}
          >
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM7 17h7v-2H7v2zm10-4H7v-2h10v2z" />
          </svg>
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--tf-font-display)",
              fontWeight: 700,
              fontSize: "var(--tf-text-lg)",
              color: "var(--tf-text-primary)",
              letterSpacing: "var(--tf-tracking-tight)",
            }}
          >
            {title}
          </h3>
        </div>

        {interactive && (
          <span
            style={{
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
              padding: "var(--tf-space-1) var(--tf-space-3)",
              borderRadius: "var(--tf-radius-full)",
              background: "var(--tf-bg-elevated)",
            }}
          >
            {completedCount}/{totalSteps}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {interactive && (
        <div
          style={{
            height: "0.1875rem",
            borderRadius: "var(--tf-radius-full)",
            background: "var(--tf-bg-elevated)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              borderRadius: "var(--tf-radius-full)",
              background:
                progress === 100
                  ? "var(--tf-color-success)"
                  : "linear-gradient(90deg, var(--tf-color-primary), var(--tf-color-secondary-light))",
              transition: "width 0.4s cubic-bezier(0.2, 0, 0, 1)",
            }}
          />
        </div>
      )}

      {/* Steps */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0",
          position: "relative",
        }}
      >
        {steps.map((step, i) => {
          const isCompleted = completed.has(i);
          const isLast = i === steps.length - 1;

          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "2.5rem 1fr",
                gap: "var(--tf-space-4)",
                paddingBottom: isLast ? 0 : "var(--tf-space-6)",
              }}
            >
              {/* Timeline column */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Step circle */}
                <button
                  onClick={() => toggleStep(i)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: interactive ? "pointer" : "default",
                    color: isCompleted
                      ? "var(--tf-color-success)"
                      : "var(--tf-color-primary-light)",
                    transition: "color var(--tf-transition-fast)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-label={
                    isCompleted
                      ? `Step ${i + 1} completed — click to undo`
                      : `Mark step ${i + 1} as complete`
                  }
                >
                  {isCompleted ? (
                    <CheckCircleIcon />
                  ) : (
                    <CircleOutlineIcon number={i + 1} />
                  )}
                </button>

                {/* Connector line */}
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      width: "0.0625rem",
                      background: isCompleted
                        ? "var(--tf-color-success)"
                        : "var(--tf-border-default)",
                      marginTop: "var(--tf-space-2)",
                      transition: "background var(--tf-transition-fast)",
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--tf-space-3)",
                  paddingTop: "0.0625rem",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontFamily: "var(--tf-font-display)",
                    fontWeight: 600,
                    fontSize: "var(--tf-text-md)",
                    color: isCompleted
                      ? "var(--tf-text-muted)"
                      : "var(--tf-text-primary)",
                    textDecoration: isCompleted ? "line-through" : "none",
                    lineHeight: "var(--tf-leading-snug)",
                    transition: "color var(--tf-transition-fast)",
                  }}
                >
                  {step.title}
                </h4>

                {step.description && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--tf-text-sm)",
                      color: "var(--tf-text-secondary)",
                      lineHeight: "var(--tf-leading-relaxed)",
                    }}
                  >
                    {step.description}
                  </p>
                )}

                {/* Code */}
                {step.code && (
                  <div
                    style={{
                      borderRadius: "var(--tf-radius-sm)",
                      background: "var(--tf-code-bg)",
                      border: "1px solid var(--tf-border-subtle)",
                      overflow: "hidden",
                    }}
                  >
                    {step.codeLanguage && (
                      <div
                        style={{
                          padding: "var(--tf-space-2) var(--tf-space-4)",
                          borderBottom: "1px solid var(--tf-border-subtle)",
                          fontFamily: "var(--tf-font-mono)",
                          fontSize: "var(--tf-text-xs)",
                          color: "var(--tf-text-muted)",
                          letterSpacing: "var(--tf-tracking-wide)",
                        }}
                      >
                        {step.codeLanguage}
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
                      <code>{step.code}</code>
                    </pre>
                  </div>
                )}

                {/* Note */}
                {step.note && (
                  <div
                    style={{
                      padding: "var(--tf-space-3) var(--tf-space-4)",
                      borderRadius: "var(--tf-radius-sm)",
                      background: "var(--tf-color-accent-container)",
                      borderLeft: "0.1875rem solid var(--tf-color-accent)",
                      fontSize: "var(--tf-text-xs)",
                      color: "var(--tf-color-accent-light)",
                      display: "flex",
                      gap: "var(--tf-space-2)",
                      alignItems: "flex-start",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ flexShrink: 0, marginTop: "0.125em" }}
                    >
                      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                    </svg>
                    <span>{step.note}</span>
                  </div>
                )}

                {/* Image */}
                {step.imageUrl && (
                  <img
                    src={step.imageUrl}
                    alt={`Step ${i + 1}: ${step.title}`}
                    style={{
                      width: "100%",
                      borderRadius: "var(--tf-radius-sm)",
                      border: "1px solid var(--tf-border-subtle)",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
