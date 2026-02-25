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
}: YouTubeEmbedProps): React.ReactElement {
  const id = extractVideoId(videoId);
  const [loaded, setLoaded] = useState(!lazyLoad);
  const thumbUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  const src =
    `https://www.youtube-nocookie.com/embed/${id}` +
    `?autoplay=${loaded ? 1 : 0}&rel=0&modestbranding=1` +
    (startAt ? `&start=${startAt}` : "");

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
          background: "#000",
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
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "rgba(255,0,0,0.9)",
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
    </figure>
  );
}
