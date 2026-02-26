"use client";
import React, { useState } from "react";

export interface YouTubeEmbedProps {
  /** YouTube video ID or full URL */
  videoId: string;
  /** Video title for accessibility */
  title: string;
  /** Aspect ratio (default: '16/9') */
  aspectRatio?: "16/9" | "4/3" | "1/1";
  /** Show thumbnail before loading (default: true — improves performance) */
  lazyLoad?: boolean;
  /** Caption shown below the embed */
  caption?: string;
  /** Start time in seconds */
  startAt?: number;
  /** Show share buttons below the video (default: false) */
  showShare?: boolean;
  /** Hashtags for sharing (without #) */
  shareHashtags?: string[];
}

function extractVideoId(input: string): string {
  // Already just an ID
  if (/^[\w-]{11}$/.test(input)) return input;
  // youtu.be/ID or youtube.com/watch?v=ID
  const m = input.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/);
  return m ? m[1] : input;
}

const ratioMap = { "16/9": "56.25%", "4/3": "75%", "1/1": "100%" };

export function YouTubeEmbed({
  videoId,
  title,
  aspectRatio = "16/9",
  lazyLoad = true,
  caption,
  startAt,
  showShare = false,
  shareHashtags = [],
}: YouTubeEmbedProps): React.ReactElement {
  const id = extractVideoId(videoId);
  const [loaded, setLoaded] = useState(!lazyLoad);
  const [copied, setCopied] = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${id}`;

  const src =
    `https://www.youtube-nocookie.com/embed/${id}` +
    `?autoplay=${loaded ? 1 : 0}&rel=0&modestbranding=1` +
    (startAt ? `&start=${startAt}` : "");

  const handleCopyVideoLink = async () => {
    try {
      await navigator.clipboard.writeText(youtubeUrl);
    } catch {
      const el = document.createElement("input");
      el.value = youtubeUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <figure style={{ margin: "0 0 var(--tf-space-6)" }}>
      <div
        style={{
          position: "relative",
          paddingBottom: ratioMap[aspectRatio],
          height: 0,
          borderRadius: "var(--tf-radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--tf-border-default)",
          background: "var(--tf-bg-base)",
          boxShadow: "var(--tf-shadow-lg)",
        }}
      >
        {!loaded && (
          <button
            onClick={() => setLoaded(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label={`Play video: ${title}`}
          >
            <img
              src={thumbUrl}
              alt={`Thumbnail for ${title}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              loading="lazy"
            />
            {/* Play button overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.3)",
                transition: "background var(--tf-transition-fast)",
              }}
            >
              <div
                style={{
                  width: "4.5rem",
                  height: "4.5rem",
                  borderRadius: "var(--tf-radius-full)",
                  background: "var(--tf-brand-youtube)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            </div>
          </button>
        )}

        {loaded && (
          <iframe
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
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

      {showShare && (
        <VideoShareBar
          videoUrl={youtubeUrl}
          title={title}
          hashtags={shareHashtags}
          copied={copied}
          onCopy={handleCopyVideoLink}
        />
      )}
    </figure>
  );
}

// ─── Video Share Bar ──────────────────────────────────────────────────────

function VideoShareBar({
  videoUrl,
  title,
  hashtags,
  copied,
  onCopy,
}: {
  videoUrl: string;
  title: string;
  hashtags: string[];
  copied: boolean;
  onCopy: () => void;
}): React.ReactElement {
  const encodedUrl = encodeURIComponent(videoUrl);
  const encodedTitle = encodeURIComponent(title);
  const hashStr = hashtags.length ? `&hashtags=${hashtags.join(",")}` : "";

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--tf-space-1)",
    padding: "0.25rem 0.5rem",
    borderRadius: "var(--tf-radius-md)",
    background: "transparent",
    border: "1px solid var(--tf-border-subtle)",
    color: "var(--tf-text-muted)",
    fontFamily: "var(--tf-font-display)",
    fontSize: "var(--tf-text-xs)",
    fontWeight: 500,
    textDecoration: "none",
    cursor: "pointer",
    transition: "all var(--tf-transition-fast)",
  };

  return (
    <div
      style={{
        marginTop: "var(--tf-space-3)",
        display: "flex",
        alignItems: "center",
        gap: "var(--tf-space-2)",
        flexWrap: "wrap" as const,
      }}
    >
      <span
        style={{
          fontFamily: "var(--tf-font-mono)",
          fontSize: "10px",
          fontWeight: 600,
          color: "var(--tf-text-muted)",
          letterSpacing: "var(--tf-tracking-wide)",
          textTransform: "uppercase",
        }}
      >
        Share
      </span>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${hashStr}`}
        target="_blank"
        rel="noopener noreferrer"
        style={btnStyle}
        aria-label="Share video on X"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={btnStyle}
        aria-label="Share video on LinkedIn"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        LinkedIn
      </a>

      <button
        onClick={onCopy}
        style={{
          ...btnStyle,
          background: copied ? "var(--tf-color-success-container)" : "transparent",
          borderColor: copied ? "var(--tf-color-success-border)" : "var(--tf-border-subtle)",
          color: copied ? "var(--tf-color-success)" : "var(--tf-text-muted)",
        }}
        aria-label="Copy video link"
      >
        {copied ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
