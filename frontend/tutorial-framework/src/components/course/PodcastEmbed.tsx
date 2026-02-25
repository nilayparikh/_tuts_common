"use client";
import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type PodcastProvider = "spotify" | "apple" | "generic";

export interface PodcastEmbedProps {
  /** Episode title */
  title: string;
  /** Optional description / show notes */
  description?: string;
  /** Spotify episode URL (e.g. https://open.spotify.com/episode/…) */
  spotifyUrl?: string;
  /** Apple Podcasts episode URL */
  appleUrl?: string;
  /** Direct MP3 / audio file URL for a native <audio> player */
  audioUrl?: string;
  /** Duration string e.g. "42 mins" */
  duration?: string;
  /** Episode number */
  episodeNumber?: number | string;
  /** Podcast show name */
  showName?: string;
  /** Cover art URL */
  coverUrl?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function spotifyEmbedSrc(url: string): string {
  // Convert eg. https://open.spotify.com/episode/XYZID to embed URL
  return url.replace(
    "open.spotify.com/episode/",
    "open.spotify.com/embed/episode/",
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export function PodcastEmbed({
  title,
  description,
  spotifyUrl,
  appleUrl,
  audioUrl,
  duration,
  episodeNumber,
  showName,
  coverUrl,
}: PodcastEmbedProps): React.ReactElement {
  return (
    <div
      style={{
        borderRadius: "var(--tf-radius-xl)",
        border: "1px solid var(--tf-border-default)",
        background: "var(--tf-bg-surface)",
        overflow: "hidden",
      }}
    >
      {/* Header card */}
      <div
        style={{
          display: "flex",
          gap: "var(--tf-space-4)",
          padding: "var(--tf-space-5)",
          borderBottom:
            spotifyUrl || audioUrl
              ? "1px solid var(--tf-border-subtle)"
              : undefined,
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={showName ?? title}
            width={72}
            height={72}
            style={{
              borderRadius: "var(--tf-radius-lg)",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "var(--tf-radius-lg)",
              background: "linear-gradient(135deg, #1DB954 0%, #191414 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            🎙
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {(episodeNumber || showName) && (
            <p
              style={{
                margin: "0 0 var(--tf-space-1)",
                fontFamily: "var(--tf-font-mono)",
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "var(--tf-tracking-wide)",
              }}
            >
              {episodeNumber ? `Ep. ${episodeNumber}` : ""}
              {episodeNumber && showName ? " · " : ""}
              {showName ?? ""}
            </p>
          )}

          <h3
            style={{
              margin: 0,
              fontFamily: "var(--tf-font-display)",
              fontWeight: 700,
              fontSize: "var(--tf-text-md)",
              color: "var(--tf-text-primary)",
              lineHeight: "var(--tf-leading-snug)",
            }}
          >
            {title}
          </h3>

          {description && (
            <p
              style={{
                margin: "var(--tf-space-2) 0 0",
                fontSize: "var(--tf-text-sm)",
                color: "var(--tf-text-secondary)",
                lineHeight: "var(--tf-leading-relaxed)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </p>
          )}

          {duration && (
            <p
              style={{
                margin: "var(--tf-space-2) 0 0",
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-text-muted)",
              }}
            >
              🕐 {duration}
            </p>
          )}
        </div>
      </div>

      {/* Spotify embedded player */}
      {spotifyUrl && (
        <iframe
          src={spotifyEmbedSrc(spotifyUrl)}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ border: "none", display: "block" }}
          title={`Spotify: ${title}`}
        />
      )}

      {/* Native audio player (fallback) */}
      {!spotifyUrl && audioUrl && (
        <div style={{ padding: "var(--tf-space-4) var(--tf-space-5)" }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            controls
            style={{
              width: "100%",
              height: 48,
              accentColor: "var(--tf-color-primary)",
            }}
          >
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Listen on links */}
      {(spotifyUrl || appleUrl) && (
        <div
          style={{
            display: "flex",
            gap: "var(--tf-space-3)",
            padding: "var(--tf-space-3) var(--tf-space-5)",
            borderTop: "1px solid var(--tf-border-subtle)",
          }}
        >
          <span
            style={{
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
            }}
          >
            Listen on:
          </span>
          {spotifyUrl && (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "var(--tf-text-xs)",
                fontWeight: 600,
                color: "#1DB954",
                textDecoration: "none",
              }}
            >
              Spotify
            </a>
          )}
          {appleUrl && (
            <a
              href={appleUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "var(--tf-text-xs)",
                fontWeight: 600,
                color: "#FC3C44",
                textDecoration: "none",
              }}
            >
              Apple Podcasts
            </a>
          )}
        </div>
      )}
    </div>
  );
}
