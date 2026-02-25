"use client";
import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface QAItem {
  question: string;
  answer: string;
}

export interface QABlockProps {
  /** Array of question/answer pairs */
  items: QAItem[];
  /** Section title (default "Q & A") */
  title?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function QABlock({
  items,
  title = "Q & A",
}: QABlockProps): React.ReactElement | null {
  if (!items || items.length === 0) return null;

  return (
    <section>
      {title && (
        <h3
          style={{
            margin: "0 0 var(--tf-space-4)",
            fontFamily: "var(--tf-font-display)",
            fontWeight: 700,
            fontSize: "var(--tf-text-lg)",
            color: "var(--tf-text-primary)",
            letterSpacing: "var(--tf-tracking-tight)",
          }}
        >
          {title}
        </h3>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-4)",
        }}
      >
        {items.map((item, i) => (
          <QACard key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
}

// ─── Individual Q&A Card ───────────────────────────────────────────────────

function QACard({
  question,
  answer,
}: {
  question: string;
  answer: string;
}): React.ReactElement {
  return (
    <div
      style={{
        padding: "var(--tf-space-5)",
        borderRadius: "var(--tf-radius-xl)",
        border: "1px solid var(--tf-border-default)",
        background: "var(--tf-bg-surface)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-3)",
      }}
    >
      {/* Question */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--tf-space-3)",
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            fontWeight: 700,
            fontFamily: "var(--tf-font-mono)",
            color: "var(--tf-color-primary-light)",
            marginTop: 2,
          }}
        >
          Q
        </span>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "var(--tf-text-md)",
            color: "var(--tf-text-primary)",
            lineHeight: "var(--tf-leading-snug)",
          }}
        >
          {question}
        </p>
      </div>

      {/* Answer */}
      <div
        style={{
          paddingLeft: "calc(24px + var(--tf-space-3))",
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--tf-space-3)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-secondary)",
            lineHeight: "var(--tf-leading-relaxed)",
          }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
}
