import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type SlideshowProvider =
  | "google-slides"
  | "slideshare"
  | "speakerdeck"
  | "canva"
  | "figma"
  | "generic";

export interface SlideshowEmbedProps {
  /** Slide deck title */
  title: string;
  /** Embed URL (src for the iframe) */
  embedUrl: string;
  /** Provider — used to pick icon + label */
  provider?: SlideshowProvider;
  /** Number of slides */
  slideCount?: number;
  /** External link to view full presentation */
  externalUrl?: string;
  /** Aspect ratio of the embed (default 16/9) */
  aspectRatio?: number;
  /** Optional description */
  description?: string;
}

// ─── Provider meta ─────────────────────────────────────────────────────────

const PROVIDER_META: Record<
  SlideshowProvider,
  { label: string; icon: string; color: string }
> = {
  "google-slides": { label: "Google Slides", icon: "📊", color: "#34A853" },
  slideshare: { label: "SlideShare", icon: "📑", color: "#00A0DC" },
  speakerdeck: { label: "Speaker Deck", icon: "🎤", color: "#009AD0" },
  canva: { label: "Canva", icon: "🎨", color: "#8B3DFF" },
  figma: { label: "Figma Slides", icon: "🔷", color: "#F24E1E" },
  generic: { label: "Slideshow", icon: "📑", color: "var(--tf-text-muted)" },
};

// ─── Component ─────────────────────────────────────────────────────────────

export function SlideshowEmbed({
  title,
  embedUrl,
  provider = "generic",
  slideCount,
  externalUrl,
  aspectRatio = 16 / 9,
  description,
}: SlideshowEmbedProps): React.ReactElement {
  const meta = PROVIDER_META[provider];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-3)",
        borderRadius: "var(--tf-radius-xl)",
        border: "1px solid var(--tf-border-default)",
        overflow: "hidden",
        background: "var(--tf-bg-surface)",
      }}
    >
      {/* Caption bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--tf-space-3)",
          paddingInline: "var(--tf-space-4)",
          paddingTop: "var(--tf-space-3)",
          paddingBottom: "var(--tf-space-3)",
          borderBottom: "1px solid var(--tf-border-subtle)",
        }}
      >
        <span style={{ fontSize: 18 }}>{meta.icon}</span>
        <span
          style={{
            flex: 1,
            fontFamily: "var(--tf-font-display)",
            fontWeight: 600,
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-primary)",
          }}
        >
          {title}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3)",
            fontSize: "var(--tf-text-xs)",
            color: "var(--tf-text-muted)",
          }}
        >
          {slideCount && <span>{slideCount} slides</span>}
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "var(--tf-radius-full)",
              background: "var(--tf-bg-elevated)",
              border: "1px solid var(--tf-border-subtle)",
              color: meta.color,
              fontWeight: 600,
            }}
          >
            {meta.label}
          </span>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--tf-color-primary-light)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Open ↗
            </a>
          )}
        </div>
      </div>

      {/* Iframe embed */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: `${(1 / aspectRatio) * 100}%`,
          overflow: "hidden",
          background: "var(--tf-bg-elevated)",
        }}
      >
        <iframe
          src={embedUrl}
          title={title}
          allowFullScreen
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>

      {/* Description */}
      {description && (
        <p
          style={{
            margin: 0,
            padding: "0 var(--tf-space-4) var(--tf-space-3)",
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-muted)",
            lineHeight: "var(--tf-leading-relaxed)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
