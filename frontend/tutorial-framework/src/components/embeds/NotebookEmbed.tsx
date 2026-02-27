"use client";
import React, { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NotebookEmbedProps {
  /**
   * GitHub raw URL to the .ipynb file.
   * e.g. "https://github.com/nilayparikh/a2a-agent2agent-protocol-tutorial/blob/main/tests/book.ipynb"
   */
  notebookUrl: string;
  /** Optional Google Colab URL for "Open in Colab" fallback */
  colabUrl?: string;
  /** Title for accessibility */
  title: string;
  /** Height of the embed (CSS value). Default: "700px" */
  height?: string;
  /** Caption below the embed */
  caption?: string;
  /** Theme mode for the notebook. Default: 'auto' (detects from framework tokens) */
  theme?: "auto" | "dark" | "light";
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Convert a GitHub blob URL to an nbviewer.org URL for iframe embedding.
 * Input:  https://github.com/owner/repo/blob/branch/path/to/file.ipynb
 * Output: https://nbviewer.org/github/owner/repo/blob/branch/path/to/file.ipynb
 */
function toNbviewerUrl(githubUrl: string): string {
  try {
    const url = new URL(githubUrl);
    // Strip "github.com" and prepend "nbviewer.org/github"
    const path = url.pathname; // e.g. /owner/repo/blob/main/tests/book.ipynb
    return `https://nbviewer.org/github${path}`;
  } catch {
    return githubUrl;
  }
}

/**
 * Convert a GitHub blob URL to the "Open in Colab" URL.
 * Input:  https://github.com/owner/repo/blob/branch/path.ipynb
 * Output: https://colab.research.google.com/github/owner/repo/blob/branch/path.ipynb
 */
function toColabFromGithub(githubUrl: string): string {
  try {
    const url = new URL(githubUrl);
    const path = url.pathname;
    return `https://colab.research.google.com/github${path}`;
  } catch {
    return githubUrl;
  }
}

// ─── Component ─────────────────────────────────────────────────────────────

export function NotebookEmbed({
  notebookUrl,
  colabUrl,
  title,
  height = "700px",
  caption,
  theme = "auto",
}: NotebookEmbedProps): React.ReactElement {
  const [iframeError, setIframeError] = useState(false);
  const [isDark, setIsDark] = useState(
    theme === "auto" ? true : theme === "dark",
  );

  useEffect(() => {
    if (theme !== "auto") {
      setIsDark(theme === "dark");
      return;
    }
    // Detect from framework’s --tf-bg-base CSS variable
    const detectTheme = () => {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue("--tf-bg-base")
        .trim();
      if (bg) {
        const hex = bg.replace("#", "").substring(0, 2);
        const val = parseInt(hex, 16);
        if (!isNaN(val)) return val < 128;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };
    setIsDark(detectTheme());
    // Listen for system preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setIsDark(detectTheme());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const nbviewerSrc = toNbviewerUrl(notebookUrl);
  const colabHref = colabUrl || toColabFromGithub(notebookUrl);

  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          borderRadius: "var(--tf-radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--tf-border-default)",
          boxShadow: "var(--tf-shadow-md)",
          background: "var(--tf-bg-secondary)",
        }}
      >
        {/* ── Header bar ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-2)",
            padding: "var(--tf-space-2) var(--tf-space-4)",
            background: "var(--tf-bg-elevated)",
            borderBottom: "1px solid var(--tf-border-subtle)",
            flexWrap: "wrap",
          }}
        >
          {/* Notebook icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--tf-text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span
            style={{
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {title}
          </span>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: "var(--tf-space-3)",
              marginLeft: "auto",
              flexShrink: 0,
            }}
          >
            <a
              href={notebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--tf-font-mono)",
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-text-secondary)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--tf-space-1)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="var(--tf-text-muted)"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href={colabHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--tf-font-mono)",
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-color-warning)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--tf-space-1)",
                fontWeight: 600,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M4.54 9.46L12 2l7.46 7.46L12 16.92z" fill="#F9AB00" />
                <path
                  d="M2 12l2.54-2.54 2.46 2.46L4.54 14.38z"
                  fill="#E8710A"
                />
              </svg>
              Open in Colab
            </a>
          </div>
        </div>

        {/* ── Notebook iframe or fallback ────────────────────────── */}
        {!iframeError ? (
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius:
                "0 0 calc(var(--tf-radius-xl) - 1px) calc(var(--tf-radius-xl) - 1px)",
            }}
          >
            <iframe
              src={nbviewerSrc}
              title={title}
              style={{
                width: "100%",
                height,
                border: "none",
                display: "block",
                background: isDark ? "#181a20" : "#fff",
                filter: isDark ? "invert(0.9) hue-rotate(180deg)" : "none",
                transition: "filter 0.3s ease",
              }}
              sandbox="allow-scripts allow-same-origin allow-popups"
              loading="lazy"
              onError={() => setIframeError(true)}
            />
            {/* Gradient overlay to mask nbviewer footer metadata */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "6rem",
                background: isDark
                  ? "linear-gradient(to bottom, transparent, #181a20)"
                  : "linear-gradient(to bottom, transparent, #fff)",
                pointerEvents: "none",
              }}
            />
          </div>
        ) : (
          <FallbackView
            notebookUrl={notebookUrl}
            colabUrl={colabHref}
            height={height}
          />
        )}
      </div>

      {caption && (
        <figcaption
          style={{
            marginTop: "var(--tf-space-3)",
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-muted)",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── Fallback view when iframe fails ───────────────────────────────────────

function FallbackView({
  notebookUrl,
  colabUrl,
  height,
}: {
  notebookUrl: string;
  colabUrl: string;
  height: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--tf-space-4)",
        height,
        padding: "var(--tf-space-8)",
        textAlign: "center",
        background: "var(--tf-bg-secondary)",
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--tf-text-muted)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
      <p
        style={{
          fontSize: "var(--tf-text-md)",
          fontWeight: 600,
          color: "var(--tf-text-primary)",
          margin: 0,
        }}
      >
        Notebook Preview Unavailable
      </p>
      <p
        style={{
          fontSize: "var(--tf-text-sm)",
          color: "var(--tf-text-secondary)",
          margin: 0,
          maxWidth: 400,
        }}
      >
        The embedded notebook preview could not be loaded. You can view the
        notebook directly on GitHub or open it in Google Colab.
      </p>
      <div
        style={{
          display: "flex",
          gap: "var(--tf-space-3)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <a
          href={notebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--tf-space-2)",
            padding: "var(--tf-space-2) var(--tf-space-4)",
            borderRadius: "var(--tf-radius-lg)",
            background: "var(--tf-bg-elevated)",
            border: "1px solid var(--tf-border-default)",
            color: "var(--tf-text-primary)",
            fontSize: "var(--tf-text-sm)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          View on GitHub
        </a>
        <a
          href={colabUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--tf-space-2)",
            padding: "var(--tf-space-2) var(--tf-space-4)",
            borderRadius: "var(--tf-radius-lg)",
            background: "var(--tf-color-warning-container)",
            border: "1px solid var(--tf-color-warning-border)",
            color: "var(--tf-color-warning)",
            fontSize: "var(--tf-text-sm)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Open in Colab ↗
        </a>
      </div>
    </div>
  );
}
