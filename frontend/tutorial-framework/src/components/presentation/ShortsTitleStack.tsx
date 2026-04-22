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
        borderBottom:
          "1px solid var(--tf-border-subtle, rgba(202,211,230,0.08))",
        background:
          "linear-gradient(180deg, var(--tf-surface-card-bg, var(--tf-bg-elevated, #191c23)), var(--tf-surface-panel-bg, var(--tf-bg-surface, #111318)))",
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
          color: "var(--tf-text-secondary, #bfc5d4)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: "26px",
            height: "1px",
            background:
              "linear-gradient(90deg, var(--tf-state-warning-accent, var(--tf-color-warning, #f59e0b)), transparent)",
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
