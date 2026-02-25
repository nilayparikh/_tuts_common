"use client";
import React, { useState } from "react";

export interface ShareButtonsProps {
  /** Page URL to share (defaults to current page) */
  url?: string;
  /** Page title for share text */
  title: string;
  /** Optional short description / summary */
  description?: string;
  /** Hashtags for Twitter (without #) */
  hashtags?: string[];
  /** Show copy link button (default: true) */
  showCopyLink?: boolean;
  /** Platforms to show */
  platforms?: Array<"twitter" | "linkedin" | "github" | "email">;
  /** Label above the buttons (default: 'Share') */
  label?: string;
}

const DEFAULT_PLATFORMS: Array<"twitter" | "linkedin" | "github" | "email"> = [
  "twitter",
  "linkedin",
  "email",
];

export function ShareButtons({
  url,
  title,
  description,
  hashtags = [],
  showCopyLink = true,
  platforms = DEFAULT_PLATFORMS,
  label = "Share",
}: ShareButtonsProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const pageUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description ?? title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      const el = document.createElement("input");
      el.value = pageUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareLinks: Record<string, string> = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${hashtags.length ? `&hashtags=${hashtags.join(",")}` : ""}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    github: pageUrl,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
  };

  const platformDefs: Record<
    string,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    twitter: {
      label: "Share on X",
      color: "#000",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    linkedin: {
      label: "Share on LinkedIn",
      color: "#0a66c2",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    github: {
      label: "View on GitHub",
      color: "#6e40c9",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    email: {
      label: "Share via Email",
      color: "#64748b",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
  };

  return (
    <div
      style={{
        padding: "var(--tf-space-5) var(--tf-space-6)",
        borderRadius: "var(--tf-radius-xl)",
        border: "1px solid var(--tf-border-subtle)",
        background: "var(--tf-bg-surface)",
        display: "flex",
        alignItems: "center",
        gap: "var(--tf-space-4)",
        flexWrap: "wrap" as const,
      }}
    >
      <span
        style={{
          fontFamily: "var(--tf-font-mono)",
          fontSize: "var(--tf-text-xs)",
          fontWeight: 600,
          color: "var(--tf-text-muted)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>

      <div
        style={{
          display: "flex",
          gap: "var(--tf-space-2)",
          flexWrap: "wrap" as const,
        }}
      >
        {platforms.map((platform) => {
          const def = platformDefs[platform];
          const href = shareLinks[platform];
          return (
            <a
              key={platform}
              href={href}
              target={platform !== "email" ? "_blank" : undefined}
              rel={platform !== "email" ? "noopener noreferrer" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--tf-space-2)",
                padding: "0.45em 0.9em",
                borderRadius: "var(--tf-radius-lg)",
                background: "var(--tf-bg-elevated)",
                border: "1px solid var(--tf-border-default)",
                color: "var(--tf-text-secondary)",
                fontFamily: "var(--tf-font-display)",
                fontSize: "var(--tf-text-xs)",
                fontWeight: 500,
                textDecoration: "none",
                transition:
                  "border-color var(--tf-transition-fast), color var(--tf-transition-fast)",
              }}
              aria-label={def.label}
            >
              {def.icon}
              <span>
                {platform === "twitter"
                  ? "X"
                  : platform === "github"
                    ? "GitHub"
                    : platform === "email"
                      ? "Email"
                      : "LinkedIn"}
              </span>
            </a>
          );
        })}

        {showCopyLink && (
          <button
            onClick={handleCopyLink}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--tf-space-2)",
              padding: "0.45em 0.9em",
              borderRadius: "var(--tf-radius-lg)",
              background: copied
                ? "rgba(16,185,129,0.1)"
                : "var(--tf-bg-elevated)",
              border: `1px solid ${copied ? "rgba(16,185,129,0.4)" : "var(--tf-border-default)"}`,
              color: copied
                ? "var(--tf-color-success)"
                : "var(--tf-text-secondary)",
              fontFamily: "var(--tf-font-display)",
              fontSize: "var(--tf-text-xs)",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all var(--tf-transition-fast)",
            }}
            aria-label="Copy page link"
          >
            {copied ? (
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
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
            {copied ? "Copied!" : "Copy link"}
          </button>
        )}
      </div>
    </div>
  );
}
