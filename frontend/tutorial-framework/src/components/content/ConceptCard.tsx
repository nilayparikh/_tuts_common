import React from "react";

export type ConceptCardVariant =
  | "default"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export interface ConceptCardProps {
  /** Short title */
  title: string;
  /** Description / body text */
  description: string;
  /** Optional icon (emoji, SVG, or image URL) */
  icon?: string;
  /** Visual variant */
  variant?: ConceptCardVariant;
  /** Optional href to make the card clickable */
  href?: string;
  /** Optional tag / category label */
  tag?: string;
}

const variantMap: Record<
  ConceptCardVariant,
  { border: string; bg: string; iconBg: string; tagColor: string }
> = {
  default: {
    border: "var(--tf-border-default)",
    bg: "var(--tf-bg-surface)",
    iconBg: "var(--tf-bg-elevated)",
    tagColor: "var(--tf-text-muted)",
  },
  primary: {
    border: "var(--tf-color-primary-border)",
    bg: "var(--tf-color-primary-container)",
    iconBg: "var(--tf-color-primary-bg)",
    tagColor: "var(--tf-color-primary-light)",
  },
  accent: {
    border: "var(--tf-color-accent-border)",
    bg: "var(--tf-color-accent-container)",
    iconBg: "var(--tf-color-accent-container-high)",
    tagColor: "var(--tf-color-accent-light)",
  },
  success: {
    border: "var(--tf-color-success-border)",
    bg: "var(--tf-color-success-container)",
    iconBg: "var(--tf-color-success-container-high)",
    tagColor: "var(--tf-color-success)",
  },
  warning: {
    border: "var(--tf-color-warning-border)",
    bg: "var(--tf-color-warning-container)",
    iconBg: "var(--tf-color-warning-container-high)",
    tagColor: "var(--tf-color-warning)",
  },
  danger: {
    border: "var(--tf-color-danger-border)",
    bg: "var(--tf-color-danger-container)",
    iconBg: "var(--tf-color-danger-container-high)",
    tagColor: "var(--tf-color-danger)",
  },
};

export function ConceptCard({
  title,
  description,
  icon,
  variant = "default",
  href,
  tag,
}: ConceptCardProps): React.ReactElement {
  const v = variantMap[variant];

  const card: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--tf-space-3)",
    padding: "var(--tf-space-6)",
    borderRadius: "var(--tf-radius-xl)",
    border: `1px solid ${v.border}`,
    background: v.bg,
    backdropFilter: "blur(6px)",
    transition:
      "transform var(--tf-transition-fast), box-shadow var(--tf-transition-fast)",
    cursor: href ? "pointer" : "default",
    textDecoration: "none",
    color: "inherit",
  };

  const isEmoji = icon && !/^https?:\/\//.test(icon);

  const content = (
    <>
      {icon && (
        <div
          style={{
            width: "2.75rem",
            height: "2.75rem",
            borderRadius: "var(--tf-radius-lg)",
            background: v.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isEmoji ? "var(--tf-text-xl)" : undefined,
          }}
        >
          {isEmoji ? icon : <img src={icon} alt="" width={24} height={24} />}
        </div>
      )}
      <div>
        {tag && (
          <span
            style={{
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              fontWeight: 600,
              color: v.tagColor,
              letterSpacing: "var(--tf-tracking-wide)",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "var(--tf-space-1)",
            }}
          >
            {tag}
          </span>
        )}
        <h3
          style={{
            fontFamily: "var(--tf-font-display)",
            fontWeight: 700,
            fontSize: "var(--tf-text-lg)",
            color: "var(--tf-text-primary)",
            marginBottom: "var(--tf-space-2)",
            lineHeight: "var(--tf-leading-snug)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-secondary)",
            lineHeight: "var(--tf-leading-relaxed)",
          }}
        >
          {description}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} style={card}>
        {content}
      </a>
    );
  }

  return <div style={card}>{content}</div>;
}

// ─── ConceptGrid helper ───────────────────────────────────────────────────

export interface ConceptGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function ConceptGrid({
  children,
  columns = 3,
}: ConceptGridProps): React.ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "var(--tf-space-5)",
      }}
      className="tf-concept-grid"
    >
      {children}
    </div>
  );
}
