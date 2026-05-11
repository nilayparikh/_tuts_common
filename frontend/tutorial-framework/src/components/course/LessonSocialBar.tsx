"use client";

import React, { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface LessonSocialBarProps {
  /** X / Twitter profile URL */
  twitterUrl?: string;
  /** X / Twitter display handle, e.g. "@nilayparikh" */
  twitterHandle?: string;
  /** LinkedIn newsletter subscribe URL */
  linkedinNewsletterUrl?: string;
  /** YouTube channel URL for a Subscribe button */
  youtubeSubscribeUrl?: string;
  /** Page title for share text */
  shareTitle: string;
  /** Short description for share body */
  shareDescription?: string;
  /** Hashtags for Twitter (without #) */
  shareHashtags?: string[];
  /** Show instructor name+avatar as a capsule at the left of the bar */
  instructorName?: string;
  /** Src for instructor avatar image */
  instructorImageSrc?: string;
  /** Absolute page URL for server-rendered share links */
  pageUrl?: string;
  /** Hide the follow buttons — useful for bottom-of-page share-only usage */
  hideFollow?: boolean;
}

// ─── Styles ────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: "var(--tf-space-2)",
    flexWrap: "wrap",
    padding: 0,
  },
  followBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.25rem 0.65rem",
    borderRadius: "9999px",
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
  shareBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2rem",
    height: "2rem",
    borderRadius: "9999px",
    background: "var(--tf-bg-overlay)",
    border: "1px solid var(--tf-border-strong)",
    color: "var(--tf-text-secondary)",
    cursor: "pointer",
    textDecoration: "none",
    transition:
      "color var(--tf-transition-fast), border-color var(--tf-transition-fast), background var(--tf-transition-fast)",
    padding: 0,
    fontSize: 0,
  },
  divider: {
    display: "inline-block",
    width: "1px",
    height: "1rem",
    background: "var(--tf-border-strong)",
    flexShrink: 0,
    margin: "0 var(--tf-space-1)",
  },
  instructorCapsule: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.2rem 0.65rem 0.2rem 0.25rem",
    borderRadius: "9999px",
    background: "var(--tf-bg-elevated)",
    border: "1px solid var(--tf-border-default)",
    fontSize: "var(--tf-text-xs)",
    fontFamily: "var(--tf-font-display)",
    fontWeight: 600,
    color: "var(--tf-text-secondary)",
    lineHeight: 1.3,
    flexShrink: 0,
  } as React.CSSProperties,
  instructorAvatar: {
    width: "1.25rem",
    height: "1.25rem",
    borderRadius: "9999px",
    objectFit: "cover",
    flexShrink: 0,
  } as React.CSSProperties,
};

// ─── SVG Icons (inline, no external libs) ──────────────────────────────────

const XIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YouTubeIcon = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
  </svg>
);

const EmailIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LinkIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CheckIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Vertical divider helper ────────────────────────────────────────────────

function Divider() {
  return <span style={s.divider} aria-hidden="true" />;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * LessonSocialBar — a single compact row that combines:
 * instructor capsule | follow buttons | share icon buttons
 *
 * Fully self-contained — no site-specific props or hard-coded data.
 * Belongs in _common so it can be reused across all tuts sites.
 */
export function LessonSocialBar({
  twitterUrl,
  twitterHandle,
  linkedinNewsletterUrl,
  youtubeSubscribeUrl,
  shareTitle,
  shareDescription,
  shareHashtags = [],
  instructorName,
  instructorImageSrc,
  pageUrl: initialPageUrl,
  hideFollow = false,
}: LessonSocialBarProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState(initialPageUrl ?? "");

  React.useEffect(() => {
    setPageUrl(window.location.href);
  }, [initialPageUrl]);

  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedDesc = encodeURIComponent(shareDescription ?? shareTitle);

  const handleCopy = async () => {
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

  const hasFollowItems =
    !hideFollow &&
    (!!twitterUrl || !!linkedinNewsletterUrl || !!youtubeSubscribeUrl);

  return (
    <div style={s.bar} data-testid="lesson-social-bar">
      {/* Instructor capsule */}
      {instructorName && (
        <>
          <div style={s.instructorCapsule}>
            {instructorImageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={instructorImageSrc}
                alt={instructorName}
                width={20}
                height={20}
                style={s.instructorAvatar}
              />
            )}
            <span>{instructorName}</span>
          </div>
          <Divider />
        </>
      )}

      {/* Follow buttons */}
      {!hideFollow && twitterUrl && (
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...s.followBtn, background: "#000", color: "#fff" }}
          aria-label={`Follow ${twitterHandle ?? ""} on X`}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {XIcon}
          <span>Follow</span>
        </a>
      )}
      {!hideFollow && linkedinNewsletterUrl && (
        <a
          href={linkedinNewsletterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...s.followBtn, background: "#0A66C2", color: "#fff" }}
          aria-label="Subscribe on LinkedIn"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {LinkedInIcon}
          <span>Subscribe</span>
        </a>
      )}
      {!hideFollow && youtubeSubscribeUrl && (
        <a
          href={youtubeSubscribeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...s.followBtn, background: "#FF0000", color: "#fff" }}
          aria-label="Subscribe on YouTube"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {YouTubeIcon}
          <span>Subscribe</span>
        </a>
      )}

      {/* Divider between follow section and share icons */}
      {hasFollowItems && <Divider />}

      {/* Share icon buttons */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${shareHashtags.length ? `&hashtags=${shareHashtags.join(",")}` : ""}`}
        target="_blank"
        rel="noopener noreferrer"
        style={s.shareBtn}
        aria-label="Share on X"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--tf-text-primary)";
          e.currentTarget.style.borderColor = "var(--tf-border-strong)";
          e.currentTarget.style.background = "var(--tf-bg-highest)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--tf-text-secondary)";
          e.currentTarget.style.borderColor = "var(--tf-border-strong)";
          e.currentTarget.style.background = "var(--tf-bg-overlay)";
        }}
      >
        {XIcon}
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={s.shareBtn}
        aria-label="Share on LinkedIn"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--tf-text-primary)";
          e.currentTarget.style.borderColor = "var(--tf-border-strong)";
          e.currentTarget.style.background = "var(--tf-bg-highest)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--tf-text-secondary)";
          e.currentTarget.style.borderColor = "var(--tf-border-strong)";
          e.currentTarget.style.background = "var(--tf-bg-overlay)";
        }}
      >
        {LinkedInIcon}
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`}
        style={s.shareBtn}
        aria-label="Share via Email"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--tf-text-primary)";
          e.currentTarget.style.borderColor = "var(--tf-border-strong)";
          e.currentTarget.style.background = "var(--tf-bg-highest)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--tf-text-secondary)";
          e.currentTarget.style.borderColor = "var(--tf-border-strong)";
          e.currentTarget.style.background = "var(--tf-bg-overlay)";
        }}
      >
        {EmailIcon}
      </a>
      <button
        onClick={handleCopy}
        style={{
          ...s.shareBtn,
          ...(copied
            ? {
                color: "var(--tf-color-success)",
                borderColor: "var(--tf-color-success-border)",
                background: "var(--tf-color-success-container)",
              }
            : {}),
        }}
        aria-label={copied ? "Copied!" : "Copy link"}
        onMouseEnter={(e) => {
          if (!copied) {
            e.currentTarget.style.color = "var(--tf-text-primary)";
            e.currentTarget.style.borderColor = "var(--tf-border-strong)";
            e.currentTarget.style.background = "var(--tf-bg-highest)";
          }
        }}
        onMouseLeave={(e) => {
          if (!copied) {
            e.currentTarget.style.color = "var(--tf-text-secondary)";
            e.currentTarget.style.borderColor = "var(--tf-border-strong)";
            e.currentTarget.style.background = "var(--tf-bg-overlay)";
          }
        }}
      >
        {copied ? CheckIcon : LinkIcon}
      </button>
    </div>
  );
}
