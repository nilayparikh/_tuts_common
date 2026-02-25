"use client";
import React, { useEffect, useRef } from "react";

export interface GitHubGistEmbedProps {
  /** Gist ID (the hash at the end of the URL) */
  gistId: string;
  /** Optional specific file within the gist */
  file?: string;
  /** Caption below the gist */
  caption?: string;
}

export function GitHubGistEmbed({
  gistId,
  file,
  caption,
}: GitHubGistEmbedProps): React.ReactElement {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileParam = file ? `?file=${encodeURIComponent(file)}` : "";
  const gistUrl = `https://gist.github.com/${gistId}.js${fileParam}`;

  // Render gist using an iframe srcdoc to avoid inline script issues with CSP
  const iframeContent = `
<!DOCTYPE html>
<html>
<head>
<base target="_parent">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: monospace; background: transparent; }
  .gist .gist-file { border-radius: 8px !important; border: none !important; }
  .gist .gist-data { border-bottom: none !important; }
</style>
</head>
<body>
<script src="${gistUrl}"></script>
</body>
</html>`.trim();

  // Auto-resize iframe to content
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      try {
        const body = iframe.contentDocument?.body;
        if (body) {
          iframe.style.height = `${body.scrollHeight + 24}px`;
        }
      } catch {
        iframe.style.height = "400px";
      }
    };
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, []);

  return (
    <figure style={{ margin: "0 0 var(--tf-space-6)" }}>
      <div
        style={{
          borderRadius: "var(--tf-radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--tf-border-default)",
          boxShadow: "var(--tf-shadow-md)",
        }}
      >
        {/* Gist header decoration */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-2)",
            padding: "var(--tf-space-3) var(--tf-space-4)",
            background: "var(--tf-bg-elevated)",
            borderBottom: "1px solid var(--tf-border-subtle)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="var(--tf-text-muted)"
          >
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          <span
            style={{
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
            }}
          >
            GitHub Gist
          </span>
          <a
            href={`https://gist.github.com/${gistId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: "auto",
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-color-primary-light)",
            }}
          >
            View on GitHub →
          </a>
        </div>

        <iframe
          ref={iframeRef}
          srcDoc={iframeContent}
          style={{
            width: "100%",
            height: 400,
            border: "none",
            display: "block",
            background: "var(--tf-code-bg)",
          }}
          title={`GitHub Gist ${gistId}`}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
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
