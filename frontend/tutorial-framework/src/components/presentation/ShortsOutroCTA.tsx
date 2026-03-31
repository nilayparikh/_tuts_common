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
          __html: `
@keyframes scta-bell {
  0%,70%,100% { transform: rotate(0deg); }
  74% { transform: rotate(18deg); }
  78% { transform: rotate(-16deg); }
  82% { transform: rotate(12deg); }
  86% { transform: rotate(-8deg); }
  90% { transform: rotate(4deg); }
}
@keyframes scta-btn-glow {
  0%,100% { box-shadow: 0 0 14px rgba(239,68,68,0.30), 0 0 36px rgba(239,68,68,0.06), inset 0 1px 0 rgba(255,255,255,0.12); }
  50% { box-shadow: 0 0 24px rgba(239,68,68,0.50), 0 0 52px rgba(239,68,68,0.10), inset 0 1px 0 rgba(255,255,255,0.18); }
}
@keyframes scta-orb-float {
  0%,100% { transform: translate(0,0) scale(1); opacity: 0.45; }
  33% { transform: translate(6px,-8px) scale(1.08); opacity: 0.6; }
  66% { transform: translate(-5px,6px) scale(0.95); opacity: 0.4; }
}
@keyframes scta-card-border {
  0%,100% { border-color: rgba(129,140,248,0.18); }
  50% { border-color: rgba(129,140,248,0.40); }
}
@keyframes scta-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes scta-heading-in {
  0% { opacity:0; transform: translateY(6px); }
  100% { opacity:1; transform: translateY(0); }
}
`,
        }}
      />
      {/* No internal padding — SlideFrame + shorts CSS provides it */}
      <div
        style={{
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
        }}
      >
        {/* ── Floating gradient orbs (decorative BG — small, subtle) ── */}
        {(
          [
            {
              top: "5%",
              left: "8%",
              size: "clamp(50px,12vw,110px)",
              color: "rgba(99,102,241,0.12)",
              delay: "0s",
            },
            {
              top: "55%",
              right: "6%",
              size: "clamp(40px,10vw,80px)",
              color: "rgba(168,56,255,0.10)",
              delay: "1.5s",
            },
            {
              bottom: "10%",
              left: "18%",
              size: "clamp(30px,8vw,60px)",
              color: "rgba(245,158,11,0.06)",
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
              color: "var(--tf-text-muted, #8892a8)",
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
              background:
                "linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #f472b6 70%, #fb923c 100%)",
              backgroundSize: "200% 200%",
              animation: "scta-shimmer 4s linear infinite",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 16px rgba(129,140,248,0.25))",
            }}
          >
            WATCHING
          </div>
        </div>

        {/* ── Video title (muted, compact) ── */}
        <p
          style={{
            fontSize: "clamp(9px, 1.1vh, 12px)",
            color: "var(--tf-text-muted, #8892a8)",
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
            background: "linear-gradient(135deg, #dc2626, #ef4444, #f87171)",
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
                color: "#fef3c7",
                animation: "scta-bell 5s ease-in-out infinite",
                transformOrigin: "50% 5%",
                flexShrink: 0,
                filter: "drop-shadow(0 0 3px rgba(251,191,36,0.45))",
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
              color: "#fff",
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
                "linear-gradient(135deg, rgba(25,28,35,0.95), rgba(30,33,42,0.95))",
              border: "1px solid rgba(129,140,248,0.18)",
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
                  "linear-gradient(135deg, var(--tf-color-primary, #6366f1), #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 12px rgba(99,102,241,0.25)",
              }}
            >
              <svg
                width="clamp(10px, 1.3vh, 14px)"
                height="clamp(10px, 1.3vh, 14px)"
                viewBox="0 0 24 24"
                fill="#fff"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "clamp(7px, 0.85vh, 10px)",
                  fontWeight: 700,
                  color: "var(--tf-color-accent, #f59e0b)",
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
                "linear-gradient(90deg, transparent, var(--tf-color-primary-light, #818cf8))",
            }}
          />
          <span
            style={{
              fontSize: "clamp(8px, 1.05vh, 12px)",
              fontFamily:
                "var(--tf-font-mono, 'JetBrains Mono', 'Consolas', monospace)",
              fontWeight: 600,
              background:
                "linear-gradient(90deg, var(--tf-color-primary-light, #818cf8), #c084fc)",
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
                "linear-gradient(90deg, var(--tf-color-primary-light, #818cf8), transparent)",
            }}
          />
        </div>
      </div>
    </>
  );
}
