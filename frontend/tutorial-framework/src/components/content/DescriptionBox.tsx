import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DescriptionBoxProps {
  /** Main title / heading */
  title?: string;
  /** Subtitle or meta line */
  subtitle?: string;
  /** Tags / chips displayed inline */
  tags?: string[];
  /** Body content (rich React children) */
  children: React.ReactNode;
  /** Timestamp or meta text shown in corner */
  meta?: string;
  /** Optional Material icon override (SVG node) */
  icon?: React.ReactNode;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * DescriptionBox — a rich "below the video" description panel.
 * Follows MD3 Surface Container styling with tonal elevation.
 */
export function DescriptionBox({
  title,
  subtitle,
  tags,
  children,
  meta,
  icon,
}: DescriptionBoxProps): React.ReactElement {
  return (
    <section
      style={{
        padding: "var(--tf-space-6)",
        borderRadius: "var(--tf-radius-lg)",
        background: "var(--tf-bg-surface)",
        border: "1px solid var(--tf-border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-4)",
      }}
    >
      {/* Header row */}
      {(title || subtitle || meta) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--tf-space-3)",
          }}
        >
          {icon && (
            <span
              style={{
                color: "var(--tf-color-primary-light)",
                flexShrink: 0,
                marginTop: "0.15em",
              }}
            >
              {icon}
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontFamily: "var(--tf-font-display)",
                  fontWeight: 700,
                  fontSize: "var(--tf-text-xl)",
                  color: "var(--tf-text-primary)",
                  lineHeight: "var(--tf-leading-snug)",
                  letterSpacing: "var(--tf-tracking-tight)",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: title ? "var(--tf-space-1) 0 0" : 0,
                  fontSize: "var(--tf-text-sm)",
                  color: "var(--tf-text-muted)",
                  lineHeight: "var(--tf-leading-normal)",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {meta && (
            <span
              style={{
                flexShrink: 0,
                fontFamily: "var(--tf-font-mono)",
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-text-muted)",
                padding: "var(--tf-space-1) var(--tf-space-3)",
                borderRadius: "var(--tf-radius-full)",
                background: "var(--tf-bg-elevated)",
              }}
            >
              {meta}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--tf-space-2)",
          }}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.1875em 0.625em",
                borderRadius: "var(--tf-radius-full)",
                background: "var(--tf-color-primary-container)",
                color: "var(--tf-color-primary-light)",
                fontSize: "var(--tf-text-xs)",
                fontWeight: 500,
                letterSpacing: "var(--tf-tracking-wide)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      {(title || subtitle || (tags && tags.length > 0)) && (
        <div
          style={{
            height: "1px",
            background: "var(--tf-border-subtle)",
          }}
        />
      )}

      {/* Body */}
      <div
        style={{
          fontSize: "var(--tf-text-sm)",
          color: "var(--tf-text-secondary)",
          lineHeight: "var(--tf-leading-relaxed)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
