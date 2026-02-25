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
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.3)",
    titleColor: "var(--tf-color-primary-light)",
  },
  tip: {
    icon: "💡",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    titleColor: "var(--tf-color-accent-light)",
  },
  warning: {
    icon: "⚠️",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.35)",
    titleColor: "var(--tf-color-warning)",
  },
  danger: {
    icon: "🚨",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
    titleColor: "var(--tf-color-danger)",
  },
  success: {
    icon: "✅",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.3)",
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
        borderLeft: `3px solid ${v.border.replace("rgba", "rgb").replace(/,\s*[\d.]+\)/, ")")}`,
        border: `1px solid ${v.border}`,
        borderLeftWidth: 3,
        display: "flex",
        gap: "var(--tf-space-3)",
        fontSize: "var(--tf-text-sm)",
        lineHeight: "var(--tf-leading-relaxed)",
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
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
