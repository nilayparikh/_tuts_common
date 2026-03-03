"use client";
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CodePreviewSegment {
  /** Code string to display */
  code: string;
  /** Language for syntax label */
  language?: string;
  /** Filename shown in header */
  filename?: string;
  /** Explanation paragraph shown after the code */
  explanation: string;
  /** Optional highlight line numbers (1-based) */
  highlightLines?: number[];
}

export interface CodePreviewProps {
  /** Section title */
  title?: string;
  /** Short intro before the segments */
  description?: string;
  /** Ordered code + explanation segments */
  segments: CodePreviewSegment[];
}

// ─── Inline mini code block (no external CodeBlock dependency) ────────────

function MiniCodeBlock({
  code,
  language,
  filename,
}: {
  code: string;
  language?: string;
  filename?: string;
}): React.ReactElement {
  return (
    <div
      style={{
        borderRadius: "var(--tf-radius-md)",
        border: "1px solid var(--tf-border-default)",
        background: "var(--tf-code-bg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      {(filename || language) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3)",
            padding: "var(--tf-space-2) var(--tf-space-4)",
            borderBottom: "1px solid var(--tf-border-subtle)",
            background: "var(--tf-bg-overlay)",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: "var(--tf-space-1)" }}>
            {[
              "var(--tf-decor-red)",
              "var(--tf-decor-yellow)",
              "var(--tf-decor-green)",
            ].map((c) => (
              <div
                key={c}
                style={{
                  width: "0.625rem",
                  height: "0.625rem",
                  borderRadius: "var(--tf-radius-full)",
                  background: c,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
            }}
          >
            {filename ?? language}
          </span>
        </div>
      )}

      {/* Code */}
      <SyntaxHighlighter
        language={language ?? "text"}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: "var(--tf-space-4)",
          background: "transparent",
          fontFamily: "var(--tf-font-mono)",
          fontSize: "var(--tf-text-sm)",
          lineHeight: "var(--tf-leading-relaxed)",
          overflowX: "auto",
        }}
        codeTagProps={{
          style: {
            fontFamily: "var(--tf-font-mono)",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * CodePreview — paired code + explanation segments.
 *
 * Each segment shows a code block followed by a paragraph of explanation,
 * connected by a subtle timeline. Use for walkthroughs, code reviews,
 * or annotated examples.
 */
export function CodePreview({
  title,
  description,
  segments,
}: CodePreviewProps): React.ReactElement {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-4)",
      }}
    >
      {/* Header */}
      {title && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="var(--tf-color-primary-light)"
          >
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
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
      )}

      {description && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-secondary)",
            lineHeight: "var(--tf-leading-relaxed)",
          }}
        >
          {description}
        </p>
      )}

      {/* Segments */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-6)",
        }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1.5rem 1fr",
              gap: "var(--tf-space-3)",
            }}
          >
            {/* Timeline column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: "0.25rem",
              }}
            >
              {/* Step number */}
              <span
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  borderRadius: "var(--tf-radius-full)",
                  border: "1px solid var(--tf-color-primary-border)",
                  background: "var(--tf-color-primary-container)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--tf-font-mono)",
                  fontSize: "var(--tf-text-xs)",
                  fontWeight: 700,
                  color: "var(--tf-color-primary-light)",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              {/* Connector */}
              {i < segments.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    width: "0.0625rem",
                    background: "var(--tf-border-default)",
                    marginTop: "var(--tf-space-2)",
                  }}
                />
              )}
            </div>

            {/* Content column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--tf-space-3)",
              }}
            >
              <MiniCodeBlock
                code={seg.code}
                language={seg.language}
                filename={seg.filename}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--tf-text-sm)",
                  color: "var(--tf-text-secondary)",
                  lineHeight: "var(--tf-leading-relaxed)",
                  paddingBottom:
                    i < segments.length - 1 ? "var(--tf-space-2)" : 0,
                }}
              >
                {seg.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
