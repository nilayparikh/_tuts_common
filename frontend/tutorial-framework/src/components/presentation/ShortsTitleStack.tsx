"use client";

import React from "react";

export interface ShortsTitleStackProps {
  shortTitle: string;
  slideTitle?: string;
}

export function ShortsTitleStack({
  shortTitle,
  slideTitle,
}: ShortsTitleStackProps): React.ReactElement {
  const eyebrow = shortTitle.trim();
  const mainTitle = (slideTitle?.trim() || shortTitle).trim();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "14px 28px 12px",
        borderBottom: "1px solid rgba(202,211,230,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), radial-gradient(circle at top left, rgba(96,165,250,0.16), transparent 52%)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minWidth: 0,
          color: "rgba(226,230,240,0.72)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: "26px",
            height: "1px",
            background:
              "linear-gradient(90deg, rgba(96,165,250,0.95), rgba(96,165,250,0.2))",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontFamily:
              "var(--tf-font-display, 'Outfit', system-ui, sans-serif)",
            fontSize: "clamp(8px, min(1.1vw, 1vh), 10px)",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
          }}
          title={eyebrow}
        >
          {eyebrow}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--tf-font-display, 'Outfit', system-ui, sans-serif)",
          fontSize: "clamp(18px, min(2.35vw, 2.1vh), 24px)",
          fontWeight: 780,
          lineHeight: 1.1,
          letterSpacing: "-0.028em",
          color: "var(--tf-text-primary, #e2e6f0)",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          maxWidth: "100%",
          minWidth: 0,
          paddingBottom: "1px",
          textWrap: "balance",
        }}
        title={mainTitle}
      >
        {mainTitle}
      </div>
    </div>
  );
}
