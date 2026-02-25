"use client";
import React, { useState } from "react";

export interface LinkedInEmbedProps {
  /**
   * LinkedIn post URL or Activity URN.
   * Accepts:
   *   - Full post URL:  https://www.linkedin.com/posts/username_SLUG-activity-ID-xxxx/
   *   - Embed URL:      https://www.linkedin.com/embed/feed/update/urn:li:activity:ID/
   *   - Raw URN:        urn:li:activity:ID  or just the numeric ID
   */
  postUrl: string;
  /** Caption below the embed */
  caption?: string;
  /** Height of the embed in pixels (default: 570) */
  height?: number;
}

function buildEmbedUrl(input: string): string {
  // Already an embed URL
  if (input.includes("/embed/feed/update/")) return input;

  // Extract activity ID from various formats
  const urnMatch = input.match(/activity[\-:](\d{19})/i);
  if (urnMatch) {
    return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${urnMatch[1]}/`;
  }

  // Raw URN
  if (input.startsWith("urn:li:")) {
    return `https://www.linkedin.com/embed/feed/update/${encodeURIComponent(input)}/`;
  }

  // Fallback – treat as-is
  return input;
}

export function LinkedInEmbed({
  postUrl,
  caption,
  height = 570,
}: LinkedInEmbedProps): React.ReactElement {
  const [show, setShow] = useState(false);
  const embedUrl = buildEmbedUrl(postUrl);

  return (
    <figure style={{ margin: "0 0 var(--tf-space-6)" }}>
      {/* LinkedIn header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--tf-space-2)",
          paddingBottom: "var(--tf-space-3)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        <span
          style={{
            fontFamily: "var(--tf-font-mono)",
            fontSize: "var(--tf-text-xs)",
            color: "var(--tf-text-muted)",
          }}
        >
          LinkedIn Post
        </span>
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: "auto",
            fontSize: "var(--tf-text-xs)",
            color: "var(--tf-color-primary-light)",
          }}
        >
          View on LinkedIn →
        </a>
      </div>

      <div
        style={{
          borderRadius: "var(--tf-radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--tf-border-default)",
          boxShadow: "var(--tf-shadow-md)",
          height,
          background: "#f8f9fa",
          position: "relative",
        }}
      >
        {!show ? (
          <button
            onClick={() => setShow(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
              background: "var(--tf-bg-elevated)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--tf-space-3)",
            }}
            aria-label="Load LinkedIn post"
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#0a66c2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
              </svg>
            </div>
            <span
              style={{
                color: "var(--tf-text-secondary)",
                fontSize: "var(--tf-text-sm)",
              }}
            >
              Click to load LinkedIn post
            </span>
            <span
              style={{
                color: "var(--tf-text-muted)",
                fontSize: "var(--tf-text-xs)",
              }}
            >
              Content loaded from linkedin.com
            </span>
          </button>
        ) : (
          <iframe
            src={embedUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="LinkedIn Post"
            allowFullScreen
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups"
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
