"use client";

import React from "react";

export interface ShortsOutroCTAProps {
  /** Title of the video/short being wrapped up */
  title: string;
  /** Teaser title for the next part (optional) */
  nextPartTitle?: string;
  /** Label above the next-part teaser (default: "Coming Soon") */
  nextPartLabel?: string;
  /** Primary CTA text (default: "Subscribe & Hit the Bell") */
  ctaText?: string;
  /** Site URL shown in the footer (default: "tuts.localm.dev") */
  siteUrl?: string;
  /** Whether to show the animated bell icon (default: true) */
  showBell?: boolean;
}

export const SHORTS_OUTRO_STYLE_CSS = `
.scta-root {
  --scta-danger-accent: var(--tf-state-danger-accent, var(--tf-color-danger, #f87171));
  --scta-danger-border: var(--tf-state-danger-border, rgba(239,68,68,0.35));
  --scta-danger-bg: var(--tf-state-danger-bg, rgba(239,68,68,0.14));
  --scta-danger-text: var(--tf-text-on-danger, #ffffff);
  --scta-end-screen-bg: var(--tf-surface-end-screen-bg, #191c23);
  --scta-end-screen-border: var(--tf-surface-end-screen-border, rgba(202,211,230,0.14));
  --scta-glow: var(--tf-glow-primary, 0 0 24px rgba(99,102,241,0.16));
}
@keyframes scta-bell {
  0%,70%,100% { transform: rotate(0deg); }
  74% { transform: rotate(18deg); }
  78% { transform: rotate(-16deg); }
  82% { transform: rotate(12deg); }
  86% { transform: rotate(-8deg); }
  90% { transform: rotate(4deg); }
}
@keyframes scta-btn-glow {
  0%,100% { box-shadow: 0 0 14px color-mix(in srgb, var(--scta-danger-accent) 32%, transparent), var(--scta-glow), inset 0 1px 0 rgba(255,255,255,0.12); }
  50% { box-shadow: 0 0 22px color-mix(in srgb, var(--scta-danger-border) 80%, transparent), var(--scta-glow), inset 0 1px 0 rgba(255,255,255,0.18); }
}
@keyframes scta-orb-float {
  0%,100% { transform: translate(0,0) scale(1); opacity: 0.45; }
  33% { transform: translate(6px,-8px) scale(1.08); opacity: 0.6; }
  66% { transform: translate(-5px,6px) scale(0.95); opacity: 0.4; }
}
@keyframes scta-card-border {
  0%,100% { border-color: var(--scta-end-screen-border); }
  50% { border-color: var(--tf-state-recommendation-border, rgba(129,140,248,0.40)); }
}
@keyframes scta-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes scta-heading-in {
  0% { opacity:0; transform: translateY(6px); }
  100% { opacity:1; transform: translateY(0); }
}
`;

/**
 * ShortsOutroCTA — A polished, high-energy outro CTA for short-form video
 * decks. Render inside a `SlideFrame`. Features:
 *
 * - Split headline: small "THANKS FOR" + large gradient "WATCHING"
 * - Floating gradient orbs background
 * - YouTube-style subscribe button with animated bell
 * - Next-part teaser card with play icon + animated border glow
 * - Branded site URL footer with animated separator
 *
 * **Layout note**: This component uses NO internal padding — it relies on the
 * parent `SlideFrame` + shorts CSS override (`12px 16px 14px`) to provide
 * spacing. All sizes use `vh`-based clamp to fit the ~43 vh content area
 * available in 9:16 shorts mode.
 *
 * Usage:
 * ```tsx
 * <SlideFrame center>
 *   <ShortsOutroCTA
 *     title="TurboQuant: 6× Less Memory, Zero Loss"
 *     nextPartTitle="KV Cache Pressure in Multi-Agent Systems"
 *   />
 * </SlideFrame>
 * ```
 */
export function ShortsOutroCTA({
  title,
  nextPartTitle,
  nextPartLabel = "Coming Soon",
  ctaText = "Subscribe & Hit the Bell",
  siteUrl = "tuts.localm.dev",
  showBell = true,
}: ShortsOutroCTAProps): React.ReactElement {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: SHORTS_OUTRO_STYLE_CSS,
        }}
      />
      {/* No internal padding — SlideFrame + shorts CSS provides it */}
      <div
        className="scta-root"
        style={{
          "--scta-heading-gradient":
            "var(--tf-gradient-brand, linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #f472b6 70%, #fb923c 100%))",
          "--scta-muted-text": "var(--tf-text-secondary, #A7B4C8)",
          "--scta-note-text": "var(--tf-text-muted, #7B8AA2)",
          "--scta-orb-primary":
            "var(--tf-state-recommendation-bg, rgba(99,102,241,0.12))",
          "--scta-orb-emphasis":
            "var(--tf-state-emphasis-bg, rgba(168,56,255,0.10))",
          "--scta-orb-warning":
            "var(--tf-state-warning-bg, rgba(245,158,11,0.06))",
          "--scta-end-screen-bg":
            "var(--tf-surface-end-screen-bg, #191c23)",
          "--scta-end-screen-border":
            "var(--tf-surface-end-screen-border, rgba(202,211,230,0.14))",
          "--scta-control-bg": "var(--tf-surface-control-bg, #1f222a)",
          "--scta-danger-accent":
            "var(--tf-state-danger-accent, var(--tf-color-danger, #f87171))",
          "--scta-danger-border":
            "var(--tf-state-danger-border, rgba(239,68,68,0.35))",
          "--scta-danger-bg":
            "var(--tf-state-danger-bg, rgba(239,68,68,0.14))",
          "--scta-danger-text": "var(--tf-text-on-danger, #ffffff)",
          "--scta-warning-accent":
            "var(--tf-state-warning-accent, var(--tf-color-warning, #FFB03A))",
          "--scta-recommendation-accent":
            "var(--tf-state-recommendation-accent, var(--tf-color-primary-light, #626bff))",
          "--scta-emphasis-accent":
            "var(--tf-state-emphasis-accent, var(--tf-color-accent-light, #C68BFF))",
          "--scta-glow": "var(--tf-glow-primary, 0 0 24px rgba(99,102,241,0.16))",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(6px, 1.4vh, 16px)",
          boxSizing: "border-box",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "var(--tf-font-display, 'Inter', system-ui, sans-serif)",
        } as React.CSSProperties}
      >
        {/* ── Floating gradient orbs (decorative BG — small, subtle) ── */}
        {(
          [
            {
              top: "5%",
              left: "8%",
              size: "clamp(50px,12vw,110px)",
              color: "var(--scta-orb-primary)",
              delay: "0s",
            },
            {
              top: "55%",
              right: "6%",
              size: "clamp(40px,10vw,80px)",
              color: "var(--scta-orb-emphasis)",
              delay: "1.5s",
            },
            {
              bottom: "10%",
              left: "18%",
              size: "clamp(30px,8vw,60px)",
              color: "var(--scta-orb-warning)",
              delay: "3s",
            },
          ] as Array<{
            top?: string;
            left?: string;
            right?: string;
            bottom?: string;
            size: string;
            color: string;
            delay: string;
          }>
        ).map((orb, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: orb.top,
              left: orb.left,
              right: orb.right,
              bottom: orb.bottom,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              animation: `scta-orb-float 8s ease-in-out ${orb.delay} infinite`,
              pointerEvents: "none" as const,
              zIndex: 0,
            }}
          />
        ))}

        {/* ── Heading block ── */}
        <div
          style={{
            zIndex: 1,
            animation: "scta-heading-in 0.6s ease-out both",
          }}
        >
          <div
            style={{
              fontSize: "clamp(9px, 1.1vh, 13px)",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase" as const,
              color: "var(--scta-muted-text)",
              marginBottom: "clamp(1px, 0.2vh, 3px)",
            }}
          >
            Thanks for
          </div>
          <div
            style={{
              fontSize: "clamp(24px, 4.2vh, 44px)",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              background: "var(--scta-heading-gradient)",
              backgroundSize: "200% 200%",
              animation: "scta-shimmer 4s linear infinite",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter:
                "drop-shadow(0 0 16px color-mix(in srgb, var(--scta-recommendation-accent) 25%, transparent))",
            }}
          >
            WATCHING
          </div>
        </div>

        {/* ── Video title (muted, compact) ── */}
        <p
          style={{
            fontSize: "clamp(9px, 1.1vh, 12px)",
            color: "var(--scta-muted-text)",
            margin: 0,
            maxWidth: "90%",
            lineHeight: 1.3,
            fontWeight: 500,
            zIndex: 1,
            opacity: 0.8,
          }}
        >
          {title}
        </p>

        {/* ── CTA Button — YouTube-red pill ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(5px, 0.8vw, 8px)",
            padding: "clamp(7px, 1.1vh, 12px) clamp(16px, 3vw, 26px)",
            borderRadius: "9999px",
            background:
              "linear-gradient(135deg, var(--scta-danger-accent), color-mix(in srgb, var(--scta-danger-accent) 84%, white 16%), color-mix(in srgb, var(--scta-danger-accent) 70%, white 30%))",
            animation: "scta-btn-glow 3s ease-in-out infinite",
            cursor: "default",
            position: "relative",
            zIndex: 1,
          }}
        >
          {showBell && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                color: "var(--scta-warning-accent)",
                animation: "scta-bell 5s ease-in-out infinite",
                transformOrigin: "50% 5%",
                flexShrink: 0,
                filter:
                  "drop-shadow(0 0 3px color-mix(in srgb, var(--scta-warning-accent) 48%, transparent))",
              }}
            >
              <svg
                width="clamp(13px, 1.8vh, 20px)"
                height="clamp(13px, 1.8vh, 20px)"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </span>
          )}
          <span
            style={{
              fontSize: "clamp(10px, 1.35vh, 15px)",
              fontWeight: 800,
              color: "var(--scta-danger-text)",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap" as const,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            {ctaText}
          </span>
        </div>

        {/* ── Next Part teaser card ── */}
        {nextPartTitle && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(6px, 1vw, 10px)",
              padding: "clamp(7px, 1vh, 12px) clamp(10px, 2vw, 16px)",
              borderRadius: "clamp(8px, 1vh, 12px)",
              background:
                "linear-gradient(135deg, var(--scta-end-screen-bg), var(--scta-control-bg))",
              border: "1px solid var(--scta-end-screen-border)",
              animation: "scta-card-border 3s ease-in-out infinite",
              maxWidth: "92%",
              width: "100%",
              textAlign: "left" as const,
              zIndex: 1,
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Play icon circle */}
            <div
              style={{
                width: "clamp(26px, 3.4vh, 38px)",
                height: "clamp(26px, 3.4vh, 38px)",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--scta-recommendation-accent), var(--scta-emphasis-accent))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "var(--scta-glow)",
                color: "var(--tf-text-on-primary, #ffffff)",
              }}
            >
              <svg
                width="clamp(10px, 1.3vh, 14px)"
                height="clamp(10px, 1.3vh, 14px)"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "clamp(7px, 0.85vh, 10px)",
                  fontWeight: 700,
                  color: "var(--scta-warning-accent)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  marginBottom: "clamp(1px, 0.2vh, 3px)",
                }}
              >
                {nextPartLabel}
              </div>
              <div
                style={{
                  fontSize: "clamp(9px, 1.2vh, 14px)",
                  fontWeight: 700,
                  color: "var(--tf-text-primary, #e2e6f0)",
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                }}
              >
                {nextPartTitle}
              </div>
            </div>
          </div>
        )}

        {/* ── Site URL footer ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(5px, 0.8vw, 8px)",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "clamp(16px, 3vw, 30px)",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, var(--scta-recommendation-accent))",
            }}
          />
          <span
            style={{
              fontSize: "clamp(8px, 1.05vh, 12px)",
              fontFamily:
                "var(--tf-font-mono, 'JetBrains Mono', 'Consolas', monospace)",
              fontWeight: 600,
              background:
                "linear-gradient(90deg, var(--scta-recommendation-accent), var(--scta-emphasis-accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.04em",
            }}
          >
            {siteUrl}
          </span>
          <div
            style={{
              width: "clamp(16px, 3vw, 30px)",
              height: "1px",
              background:
                "linear-gradient(90deg, var(--scta-recommendation-accent), transparent)",
            }}
          />
        </div>
      </div>
    </>
  );
}
