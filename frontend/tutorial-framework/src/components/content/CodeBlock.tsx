"use client";
import React, { useState } from "react";

export interface CodeBlockProps {
  /** Source code to display */
  code: string;
  /** Language identifier for the label */
  language?: string;
  /** Optional filename shown in the header */
  filename?: string;
  /** Show copy button (default: true) */
  showCopy?: boolean;
  /** Show line numbers (default: false) */
  showLineNumbers?: boolean;
  /** Highlight specific line numbers (1-based) */
  highlightLines?: number[];
}

export function CodeBlock({
  code,
  language,
  filename,
  showCopy = true,
  showLineNumbers = false,
  highlightLines = [],
}: CodeBlockProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = code.split("\n");

  return (
    <div
      style={{
        borderRadius: "var(--tf-radius-xl)",
        border: "1px solid var(--tf-border-default)",
        background: "var(--tf-code-bg)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header bar */}
      {(filename || language || showCopy) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--tf-space-2) var(--tf-space-4)",
            borderBottom: "1px solid var(--tf-border-subtle)",
            background: "var(--tf-bg-overlay)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--tf-space-3)",
            }}
          >
            {/* Traffic lights decoration */}
            <div style={{ display: "flex", gap: "var(--tf-space-1)" }}>
              {[
                "var(--tf-decor-red)",
                "var(--tf-decor-yellow)",
                "var(--tf-decor-green)",
              ].map((c) => (
                <div
                  key={c}
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    borderRadius: "var(--tf-radius-full)",
                    background: c,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
            {filename && (
              <span
                style={{
                  fontFamily: "var(--tf-font-mono)",
                  fontSize: "var(--tf-text-xs)",
                  color: "var(--tf-text-secondary)",
                }}
              >
                {filename}
              </span>
            )}
            {language && !filename && (
              <span
                style={{
                  fontFamily: "var(--tf-font-mono)",
                  fontSize: "var(--tf-text-xs)",
                  color: "var(--tf-text-muted)",
                  letterSpacing: "var(--tf-tracking-wide)",
                }}
              >
                {language}
              </span>
            )}
          </div>

          {showCopy && (
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--tf-space-1)",
                padding: "var(--tf-space-1) var(--tf-space-2)",
                borderRadius: "var(--tf-radius-md)",
                background: copied
                  ? "var(--tf-color-success-container-high)"
                  : "transparent",
                border: `1px solid ${copied ? "var(--tf-color-success-border)" : "var(--tf-border-subtle)"}`,
                color: copied
                  ? "var(--tf-color-success)"
                  : "var(--tf-text-muted)",
                fontFamily: "var(--tf-font-mono)",
                fontSize: "var(--tf-text-xs)",
                cursor: "pointer",
                transition: "all var(--tf-transition-fast)",
              }}
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Code body */}
      <div style={{ overflowX: "auto" }}>
        <pre
          style={{
            margin: 0,
            padding: "var(--tf-space-5)",
            fontFamily: "var(--tf-font-mono)",
            fontSize: "var(--tf-text-sm)",
            lineHeight: "var(--tf-leading-relaxed)",
            color: "var(--tf-code-text)",
          }}
        >
          {showLineNumbers ? (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tbody>
                {lines.map((line, i) => {
                  const lineNum = i + 1;
                  const isHighlighted = highlightLines.includes(lineNum);
                  return (
                    <tr
                      key={i}
                      style={{
                        background: isHighlighted
                          ? "var(--tf-color-primary-container)"
                          : "transparent",
                      }}
                    >
                      <td
                        style={{
                          userSelect: "none",
                          paddingRight: "var(--tf-space-5)",
                          color: "var(--tf-text-muted)",
                          textAlign: "right",
                          fontSize: "var(--tf-text-xs)",
                          verticalAlign: "top",
                          minWidth: "2.5rem",
                          borderRight: "1px solid var(--tf-border-subtle)",
                          paddingLeft: "var(--tf-space-4)",
                        }}
                      >
                        {lineNum}
                      </td>
                      <td
                        style={{
                          paddingLeft: "var(--tf-space-5)",
                          whiteSpace: "pre",
                        }}
                      >
                        {line}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
