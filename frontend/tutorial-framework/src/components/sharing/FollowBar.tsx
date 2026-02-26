"use client";
import React from "react";

export interface FollowBarProps {
  /** X / Twitter follow URL (profile URL) */
  twitterUrl?: string;
  /** X / Twitter handle to display, e.g. "@nilayparikh" */
  twitterHandle?: string;
  /** LinkedIn newsletter subscribe URL */
  linkedinNewsletterUrl?: string;
  /** Compact mode hides labels, shows icons only */
  compact?: boolean;
}

const s: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: "var(--tf-space-3)",
    flexWrap: "wrap" as const,
  },
  twitterBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.4rem 0.85rem",
    borderRadius: "9999px",
    background: "#000",
    color: "#fff",
    fontSize: "var(--tf-text-xs)",
    fontFamily: "var(--tf-font-display)",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    border: "none",
    lineHeight: 1.3,
    transition: "opacity var(--tf-transition-fast)",
  },
  linkedinBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.4rem 0.85rem",
    borderRadius: "9999px",
    background: "#0A66C2",
    color: "#fff",
    fontSize: "var(--tf-text-xs)",
    fontFamily: "var(--tf-font-display)",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    border: "none",
    lineHeight: 1.3,
    transition: "opacity var(--tf-transition-fast)",
  },
};

/**
 * FollowBar — compact row of social follow/subscribe buttons.
 *
 * Renders native-styled "Follow @handle" (X) and "Subscribe on LinkedIn"
 * buttons without loading external widget scripts.
 */
export function FollowBar({
  twitterUrl,
  twitterHandle,
  linkedinNewsletterUrl,
  compact = false,
}: FollowBarProps): React.ReactElement | null {
  if (!twitterUrl && !linkedinNewsletterUrl) return null;

  return (
    <div style={s.bar} data-testid="follow-bar">
      {twitterUrl && (
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={s.twitterBtn}
          aria-label={`Follow ${twitterHandle ?? ""} on X`}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {!compact && (
            <span>Follow{twitterHandle ? ` ${twitterHandle}` : ""}</span>
          )}
        </a>
      )}
      {linkedinNewsletterUrl && (
        <a
          href={linkedinNewsletterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={s.linkedinBtn}
          aria-label="Subscribe on LinkedIn"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          {!compact && <span>Subscribe on LinkedIn</span>}
        </a>
      )}
    </div>
  );
}
