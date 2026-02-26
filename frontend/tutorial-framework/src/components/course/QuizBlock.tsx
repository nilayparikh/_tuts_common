"use client";
import React, { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  /** id of the correct option */
  correctOptionId: string;
  /** Explanation shown after answering */
  explanation?: string;
}

export interface QuizBlockProps {
  /** Quiz title */
  title?: string;
  /** Optional instruction / preamble */
  instructions?: string;
  questions: QuizQuestion[];
  /** Called when user submits; receives score 0-1 */
  onComplete?: (score: number) => void;
}

// ─── Question sub-component ────────────────────────────────────────────────

function QuizQuestionItem({
  question,
  index,
  disabled,
  selectedId,
  onSelect,
}: {
  question: QuizQuestion;
  index: number;
  disabled: boolean;
  selectedId: string | null;
  onSelect: (optionId: string) => void;
}): React.ReactElement {
  const isCorrect = disabled && selectedId === question.correctOptionId;
  const isWrong =
    disabled && selectedId && selectedId !== question.correctOptionId;

  return (
    <div
      style={{
        padding: "var(--tf-space-5)",
        border: `1px solid ${
          disabled
            ? isCorrect
              ? "var(--tf-color-success-border)"
              : isWrong
                ? "var(--tf-color-danger-border)"
                : "var(--tf-border-default)"
            : "var(--tf-border-default)"
        }`,
        borderRadius: "var(--tf-radius-xl)",
        background: disabled
          ? isCorrect
            ? "var(--tf-color-success-container)"
            : isWrong
              ? "var(--tf-color-danger-container)"
              : "var(--tf-bg-surface)"
          : "var(--tf-bg-surface)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-4)",
      }}
    >
      {/* Question text */}
      <p
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: "var(--tf-text-md)",
          color: "var(--tf-text-primary)",
          lineHeight: "var(--tf-leading-snug)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--tf-font-mono)",
            color: "var(--tf-text-muted)",
            marginRight: "var(--tf-space-2)",
          }}
        >
          Q{index + 1}.
        </span>
        {question.question}
      </p>

      {/* Options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-2)",
        }}
      >
        {question.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isCorrectOpt = opt.id === question.correctOptionId;

          let optBg = "var(--tf-bg-elevated)";
          let optBorder = "var(--tf-border-subtle)";
          let optColor = "var(--tf-text-secondary)";

          if (disabled) {
            if (isCorrectOpt) {
              optBg = "var(--tf-color-success-container)";
              optBorder = "var(--tf-color-success-border)";
              optColor = "var(--tf-color-success)";
            } else if (isSelected && !isCorrectOpt) {
              optBg = "var(--tf-color-danger-container)";
              optBorder = "var(--tf-color-danger-border)";
              optColor = "var(--tf-color-danger)";
            }
          } else if (isSelected) {
            optBg = "var(--tf-color-primary-container)";
            optBorder = "var(--tf-color-primary-border)";
            optColor = "var(--tf-color-primary-light)";
          }

          return (
            <button
              key={opt.id}
              onClick={() => !disabled && onSelect(opt.id)}
              disabled={disabled}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--tf-space-3)",
                padding: "var(--tf-space-3) var(--tf-space-4)",
                borderRadius: "var(--tf-radius-lg)",
                border: `1px solid ${optBorder}`,
                background: optBg,
                color: optColor,
                cursor: disabled ? "default" : "pointer",
                textAlign: "left",
                fontFamily: "var(--tf-font-body)",
                fontSize: "var(--tf-text-sm)",
                transition: "all var(--tf-transition-fast)",
                width: "100%",
              }}
            >
              {/* Radio indicator */}
              <span
                style={{
                  flexShrink: 0,
                  width: "1rem",
                  height: "1rem",
                  borderRadius: "var(--tf-radius-full)",
                  border: `2px solid ${optBorder}`,
                  background:
                    isSelected || (disabled && isCorrectOpt)
                      ? optBorder
                      : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {disabled && isCorrectOpt && (
                  <span
                    style={{
                      fontSize: "var(--tf-text-xs)",
                      color: "var(--tf-text-inverse)",
                    }}
                  >
                    ✓
                  </span>
                )}
                {disabled && isSelected && !isCorrectOpt && (
                  <span
                    style={{
                      fontSize: "var(--tf-text-xs)",
                      color: "var(--tf-text-inverse)",
                    }}
                  >
                    ✗
                  </span>
                )}
              </span>
              <span style={{ fontWeight: isSelected ? 600 : 400 }}>
                {opt.text}
              </span>
              {disabled && isCorrectOpt && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "var(--tf-text-xs)",
                    fontWeight: 600,
                    color: "var(--tf-color-success)",
                  }}
                >
                  Correct
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {disabled && question.explanation && (
        <div
          style={{
            padding: "var(--tf-space-3) var(--tf-space-4)",
            borderRadius: "var(--tf-radius-md)",
            background: "var(--tf-bg-elevated)",
            borderLeft: "3px solid var(--tf-color-primary)",
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-secondary)",
            lineHeight: "var(--tf-leading-relaxed)",
          }}
        >
          <strong
            style={{
              color: "var(--tf-color-primary-light)",
              display: "block",
              marginBottom: "var(--tf-space-1)",
            }}
          >
            💡 Explanation
          </strong>
          {question.explanation}
        </div>
      )}
    </div>
  );
}

// ─── Main QuizBlock ────────────────────────────────────────────────────────

export function QuizBlock({
  title = "Knowledge Check",
  instructions,
  questions,
  onComplete,
}: QuizBlockProps): React.ReactElement {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => selections[q.id]);
  const score =
    questions.filter((q) => selections[q.id] === q.correctOptionId).length /
    questions.length;

  function handleSelect(questionId: string, optionId: string) {
    setSelections((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function handleSubmit() {
    setSubmitted(true);
    onComplete?.(score);
  }

  function handleRetry() {
    setSelections({});
    setSubmitted(false);
  }

  const passThreshold = 0.8;
  const passed = score >= passThreshold;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-6)",
        padding: "var(--tf-space-8)",
        borderRadius: "var(--tf-radius-xl)",
        border: "1px solid var(--tf-border-subtle)",
        background: "var(--tf-bg-surface)",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3)",
            marginBottom: "var(--tf-space-2)",
          }}
        >
          <span style={{ fontSize: "var(--tf-text-2xl)" }}>📝</span>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--tf-font-display)",
              fontWeight: 700,
              fontSize: "var(--tf-text-xl)",
              color: "var(--tf-text-primary)",
            }}
          >
            {title}
          </h2>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
              background: "var(--tf-bg-elevated)",
              padding: "var(--tf-space-0) var(--tf-space-2)",
              borderRadius: "var(--tf-radius-full)",
              border: "1px solid var(--tf-border-subtle)",
            }}
          >
            {questions.length} question{questions.length !== 1 ? "s" : ""} ·
            Graded
          </span>
        </div>

        {instructions && (
          <p
            style={{
              margin: 0,
              fontSize: "var(--tf-text-sm)",
              color: "var(--tf-text-secondary)",
              lineHeight: "var(--tf-leading-relaxed)",
            }}
          >
            {instructions}
          </p>
        )}
      </div>

      {/* Questions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-4)",
        }}
      >
        {questions.map((q, i) => (
          <QuizQuestionItem
            key={q.id}
            question={q}
            index={i}
            disabled={submitted}
            selectedId={selections[q.id] ?? null}
            onSelect={(optId) => handleSelect(q.id, optId)}
          />
        ))}
      </div>

      {/* Result banner (post-submit) */}
      {submitted && (
        <div
          style={{
            padding: "var(--tf-space-5) var(--tf-space-6)",
            borderRadius: "var(--tf-radius-xl)",
            background: passed
              ? "var(--tf-color-success-container)"
              : "var(--tf-color-danger-container)",
            border: `1px solid ${passed ? "var(--tf-color-success-border)" : "var(--tf-color-danger-border)"}`,
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-4)",
          }}
        >
          <span style={{ fontSize: "var(--tf-text-3xl)" }}>
            {passed ? "🏆" : "🔄"}
          </span>
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: "var(--tf-text-lg)",
                color: passed
                  ? "var(--tf-color-success)"
                  : "var(--tf-color-danger)",
              }}
            >
              {passed ? "Nice work!" : "Keep practicing!"}
            </p>
            <p
              style={{
                margin: "var(--tf-space-1) 0 0",
                fontSize: "var(--tf-text-sm)",
                color: "var(--tf-text-secondary)",
              }}
            >
              You scored <strong>{Math.round(score * 100)}%</strong> (
              {
                questions.filter((q) => selections[q.id] === q.correctOptionId)
                  .length
              }
              /{questions.length} correct).{" "}
              {!passed && "Review the explanations above and try again."}
            </p>
          </div>
        </div>
      )}

      {/* Submit / retry button */}
      <div style={{ display: "flex", gap: "var(--tf-space-3)" }}>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            style={{
              padding: "var(--tf-space-3) var(--tf-space-6)",
              borderRadius: "var(--tf-radius-lg)",
              background: allAnswered
                ? "var(--tf-color-primary)"
                : "var(--tf-bg-elevated)",
              color: allAnswered
                ? "var(--tf-text-inverse)"
                : "var(--tf-text-muted)",
              border: "none",
              fontFamily: "var(--tf-font-body)",
              fontWeight: 600,
              fontSize: "var(--tf-text-sm)",
              cursor: allAnswered ? "pointer" : "not-allowed",
              transition: "background var(--tf-transition-fast)",
            }}
          >
            Submit answers
          </button>
        ) : (
          <button
            onClick={handleRetry}
            style={{
              padding: "var(--tf-space-3) var(--tf-space-6)",
              borderRadius: "var(--tf-radius-lg)",
              background: "var(--tf-bg-elevated)",
              color: "var(--tf-text-secondary)",
              border: "1px solid var(--tf-border-default)",
              fontFamily: "var(--tf-font-body)",
              fontWeight: 600,
              fontSize: "var(--tf-text-sm)",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        )}
      </div>
    </section>
  );
}
