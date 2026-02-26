import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AccordionItem {
  /** Summary / title shown in the collapsed row */
  title: string;
  /** Body text revealed on expand */
  content: string;
}

export interface AccordionListProps {
  /** Accordion items to render */
  items: AccordionItem[];
  /** Whether to render the first item open by default */
  defaultOpenFirst?: boolean;
}

// ─── Chevron SVG (rotates on open) ─────────────────────────────────────────

const ChevronIcon = (
  <svg
    className="tf-accordion-chevron"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * AccordionList — a list of collapsible <details/summary> items styled with
 * framework design tokens.  Accessible, no JavaScript needed for base
 * behaviour.  Uses the `tf-accordion` class prefix for the CSS injected by
 * GlobalStyles.
 */
export function AccordionList({
  items,
  defaultOpenFirst = false,
}: AccordionListProps): React.ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0",
        borderRadius: "var(--tf-radius-xl)",
        border: "1px solid var(--tf-border-default)",
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;

        return (
          <details
            key={i}
            open={isFirst && defaultOpenFirst ? true : undefined}
            style={{
              borderBottom: isLast
                ? "none"
                : "1px solid var(--tf-border-subtle)",
            }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--tf-space-3)",
                padding: "var(--tf-space-4) var(--tf-space-5)",
                cursor: "pointer",
                fontFamily: "var(--tf-font-display)",
                fontWeight: 600,
                fontSize: "var(--tf-text-md)",
                color: "var(--tf-text-primary)",
                background: "var(--tf-bg-surface)",
                transition: "background var(--tf-transition-fast)",
                listStyle: "none",
                userSelect: "none",
              }}
            >
              {/* Number badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "1.5rem",
                  height: "1.5rem",
                  borderRadius: "var(--tf-radius-full)",
                  background: "var(--tf-bg-elevated)",
                  fontFamily: "var(--tf-font-mono)",
                  fontSize: "var(--tf-text-xs)",
                  fontWeight: 700,
                  color: "var(--tf-text-muted)",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span style={{ flex: 1 }}>{item.title}</span>
              {ChevronIcon}
            </summary>
            <div
              style={{
                padding:
                  "0 var(--tf-space-5) var(--tf-space-5) calc(var(--tf-space-5) + 1.5rem + var(--tf-space-3))",
                fontSize: "var(--tf-text-sm)",
                color: "var(--tf-text-secondary)",
                lineHeight: "var(--tf-leading-relaxed)",
                background: "var(--tf-bg-surface)",
              }}
            >
              {item.content}
            </div>
          </details>
        );
      })}
    </div>
  );
}
