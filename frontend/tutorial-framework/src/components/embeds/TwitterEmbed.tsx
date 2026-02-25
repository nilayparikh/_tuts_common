"use client";
import React, { useEffect, useRef } from "react";

export interface TwitterEmbedProps {
  /** Tweet URL (https://twitter.com/user/status/ID or https://x.com/user/status/ID) */
  tweetUrl: string;
  /** Theme override */
  theme?: "dark" | "light";
  /** Caption below the embed */
  caption?: string;
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
        createTweet: (
          id: string,
          el: HTMLElement,
          options?: Record<string, unknown>,
        ) => Promise<HTMLElement>;
      };
    };
  }
}

function extractTweetId(url: string): string | null {
  const m = url.match(/status\/(\d+)/);
  return m ? m[1] : null;
}

export function TwitterEmbed({
  tweetUrl,
  theme = "dark",
  caption,
}: TwitterEmbedProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const tweetId = extractTweetId(tweetUrl);

  useEffect(() => {
    if (!tweetId || !containerRef.current) return;

    const renderTweet = () => {
      if (window.twttr?.widgets && containerRef.current) {
        containerRef.current.innerHTML = "";
        window.twttr.widgets.createTweet(tweetId, containerRef.current, {
          theme,
          dnt: true,
          align: "center",
        });
      }
    };

    if (window.twttr) {
      renderTweet();
    } else {
      // Lazy-load the Twitter widget script
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = renderTweet;
      document.body.appendChild(script);
    }
  }, [tweetId, theme]);

  if (!tweetId) {
    return (
      <div
        style={{
          padding: "var(--tf-space-6)",
          border: "1px solid var(--tf-border-default)",
          borderRadius: "var(--tf-radius-xl)",
          color: "var(--tf-color-danger)",
          fontSize: "var(--tf-text-sm)",
        }}
      >
        Invalid tweet URL: {tweetUrl}
      </div>
    );
  }

  return (
    <figure style={{ margin: "0 0 var(--tf-space-6)" }}>
      {/* X/Twitter branding bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--tf-space-2)",
          paddingBottom: "var(--tf-space-3)",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="var(--tf-text-muted)"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span
          style={{
            fontFamily: "var(--tf-font-mono)",
            fontSize: "var(--tf-text-xs)",
            color: "var(--tf-text-muted)",
          }}
        >
          Post on X
        </span>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: "auto",
            fontSize: "var(--tf-text-xs)",
            color: "var(--tf-color-primary-light)",
          }}
        >
          View on X →
        </a>
      </div>

      <div
        style={{
          borderRadius: "var(--tf-radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--tf-border-default)",
        }}
      >
        <div
          ref={containerRef}
          style={{
            minHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "var(--tf-text-muted)",
              fontSize: "var(--tf-text-sm)",
            }}
          >
            Loading post…
          </span>
        </div>
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
