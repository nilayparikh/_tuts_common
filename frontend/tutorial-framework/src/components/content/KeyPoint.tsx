import React from "react";

export type KeyPointVariant = "info" | "tip" | "warning" | "danger" | "success";

export interface KeyPointProps {
  title?: string;
  children: React.ReactNode;
  variant?: KeyPointVariant;
}

const varMap: Record<
  KeyPointVariant,
  { icon: string; bg: string; border: string; titleColor: string }
> = {
  info: {
    icon: "ℹ️",
    bg: "var(--tf-color-primary-container)",
    border: "var(--tf-color-primary-border)",
    titleColor: "var(--tf-color-primary-light)",
  },
  tip: {
    icon: "💡",
    bg: "var(--tf-color-accent-container)",
    border: "var(--tf-color-accent-border)",
    titleColor: "var(--tf-color-accent-light)",
  },
  warning: {
    icon: "⚠️",
    bg: "var(--tf-color-warning-container)",
    border: "var(--tf-color-warning-border)",
    titleColor: "var(--tf-color-warning)",
  },
  danger: {
    icon: "🚨",
    bg: "var(--tf-color-danger-container)",
    border: "var(--tf-color-danger-border)",
    titleColor: "var(--tf-color-danger)",
  },
  success: {
    icon: "✅",
    bg: "var(--tf-color-success-container)",
    border: "var(--tf-color-success-border)",
    titleColor: "var(--tf-color-success)",
  },
};

export function KeyPoint({
  title,
  children,
  variant = "info",
}: KeyPointProps): React.ReactElement {
  const v = varMap[variant];

  return (
    <aside
      style={{
        padding: "var(--tf-space-4) var(--tf-space-5)",
        borderRadius: "var(--tf-radius-lg)",
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderLeft: `3px solid ${v.border}`,
        display: "flex",
        gap: "var(--tf-space-3)",
        fontSize: "var(--tf-text-sm)",
        lineHeight: "var(--tf-leading-relaxed)",
      }}
    >
      <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.0625rem" }}>
        {v.icon}
      </span>
      <div style={{ flex: 1 }}>
        {title && (
          <strong
            style={{
              display: "block",
              fontWeight: 700,
              color: v.titleColor,
              marginBottom: "var(--tf-space-1)",
              fontFamily: "var(--tf-font-display)",
            }}
          >
            {title}
          </strong>
        )}
        <div style={{ color: "var(--tf-text-secondary)" }}>{children}</div>
      </div>
    </aside>
  );
}
