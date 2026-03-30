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
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        padding: "10px 14px 10px",
        borderBottom: "1px solid rgba(202,211,230,0.06)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), radial-gradient(circle at top left, rgba(129,140,248,0.12), transparent 48%)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {slideTitle ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            alignSelf: "flex-start",
            maxWidth: "100%",
            minWidth: 0,
            padding: "3px 8px",
            borderRadius: "999px",
            border: "1px solid rgba(129,140,248,0.16)",
            background: "rgba(129,140,248,0.08)",
            fontFamily:
              "var(--tf-font-display, 'Outfit', system-ui, sans-serif)",
            fontSize: "clamp(8px, min(1.2vw, 1vh), 10px)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--tf-color-primary-light, #818cf8)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={slideTitle}
        >
          {slideTitle}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: "var(--tf-font-display, 'Outfit', system-ui, sans-serif)",
          fontSize: "clamp(17px, min(2.5vw, 2.2vh), 26px)",
          fontWeight: 800,
          lineHeight: 1.06,
          letterSpacing: "-0.035em",
          color: "var(--tf-text-primary, #e2e6f0)",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          maxWidth: "100%",
          minWidth: 0,
          paddingBottom: "2px",
          textWrap: "balance",
        }}
        title={shortTitle}
      >
        {shortTitle}
      </div>
    </div>
  );
}
