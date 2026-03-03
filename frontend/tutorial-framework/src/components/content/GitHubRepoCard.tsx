"use client";

import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface GitHubRepoCardProps {
  /** Full GitHub repository URL (https://github.com/owner/repo or a tree/file path) */
  url: string;
  /**
   * Human-readable repo or folder label.
   * Falls back to the URL path after github.com/.
   */
  title?: string;
  /** One or two sentence description of what the repo / folder contains */
  description?: string;
}

// ─── GitHub Mark SVG (official path, mono) ────────────────────────────────

const GitHubIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

// ─── External link icon ────────────────────────────────────────────────────

const ExternalLinkIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Extract a readable path label from a GitHub URL */
function repoPathFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\//, "");
    return path || url;
  } catch {
    return url;
  }
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * GitHubRepoCard — a compact card linking to a GitHub repository or folder.
 *
 * Replaces the generic "External Resource" InfoBox and "Source Code" SuccessBox
 * with a properly branded card that shows the GitHub mark, a repo/folder label,
 * an optional description, and a visible URL.
 *
 * @example
 * <GitHubRepoCard
 *   url="https://github.com/nilayparikh/tuts-agentic-ai-examples/tree/main/a2a/lessons/05"
 *   description="Complete source code for this lesson."
 * />
 */
export function GitHubRepoCard({
  url,
  title,
  description,
}: GitHubRepoCardProps): React.ReactElement {
  const displayTitle = title ?? repoPathFromUrl(url);
  const displayUrl = url.replace(/^https?:\/\//, "");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--tf-space-4)",
        padding: "var(--tf-space-4) var(--tf-space-5)",
        borderRadius: "var(--tf-radius-lg)",
        border: "1px solid var(--tf-border-subtle)",
        background: "var(--tf-bg-surface)",
        textDecoration: "none",
        color: "inherit",
        transition:
          "border-color var(--tf-transition-fast), background var(--tf-transition-fast)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "rgba(129,140,248,0.55)";
        (e.currentTarget as HTMLAnchorElement).style.background =
          "var(--tf-bg-surface-raised)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "var(--tf-border-subtle)";
        (e.currentTarget as HTMLAnchorElement).style.background =
          "var(--tf-bg-surface)";
      }}
    >
      {/* GitHub icon */}
      <span
        style={{
          flexShrink: 0,
          marginTop: "0.125rem",
          color: "var(--tf-text-secondary)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <GitHubIcon />
      </span>

      {/* Text block */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-1)",
        }}
      >
        {/* Label row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-2)",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--tf-font-display)",
              fontWeight: 700,
              fontSize: "var(--tf-text-sm)",
              color: "var(--tf-text-primary)",
            }}
          >
            {displayTitle}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "var(--tf-tracking-wide)",
              textTransform: "uppercase",
              color: "var(--tf-color-primary-light)",
              fontFamily: "var(--tf-font-mono)",
            }}
          >
            GitHub <ExternalLinkIcon />
          </span>
        </div>

        {/* Description */}
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

        {/* Visible URL */}
        <span
          style={{
            fontSize: "0.7rem",
            fontFamily: "var(--tf-font-mono)",
            color: "var(--tf-color-primary-light)",
            opacity: 0.75,
            marginTop: "var(--tf-space-1)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
        >
          {displayUrl}
        </span>
      </div>
    </a>
  );
}
