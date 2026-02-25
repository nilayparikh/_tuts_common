import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ParagraphProps {
  /** Children text / inline elements */
  children: React.ReactNode;
  /** Lead paragraph — slightly larger text */
  lead?: boolean;
  /** Muted / secondary text */
  muted?: boolean;
  /** Center alignment */
  center?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Paragraph — a styled text block following MD3 body-large / body-medium.
 * Replaces raw <p> tags with consistent spacing and fluid sizing.
 */
export function Paragraph({
  children,
  lead = false,
  muted = false,
  center = false,
}: ParagraphProps): React.ReactElement {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: "var(--tf-font-body)",
        fontSize: lead ? "var(--tf-text-lg)" : "var(--tf-text-md)",
        fontWeight: lead ? 400 : 400,
        color: muted ? "var(--tf-text-muted)" : "var(--tf-text-secondary)",
        lineHeight: lead
          ? "var(--tf-leading-loose)"
          : "var(--tf-leading-relaxed)",
        letterSpacing: lead
          ? "var(--tf-tracking-tight)"
          : "var(--tf-tracking-normal)",
        textAlign: center ? "center" : undefined,
        maxWidth: "68ch",
      }}
    >
      {children}
    </p>
  );
}
