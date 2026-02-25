import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type CalloutVariant =
  | "info"
  | "note"
  | "tip"
  | "success"
  | "warning"
  | "danger";

export interface CalloutBoxProps {
  /** Callout variant — controls icon, color, and container tint */
  variant?: CalloutVariant;
  /** Optional title (rendered as label-large) */
  title?: string;
  /** Body content */
  children: React.ReactNode;
  /** Add an accent icon override (emoji or single char) */
  icon?: string;
  /** Make the callout collapsible */
  collapsible?: boolean;
}

// ─── Material Symbols (inline SVGs for zero-dependency icons) ──────────────

const VARIANT_CONFIG: Record<
  CalloutVariant,
  {
    icon: React.ReactNode;
    label: string;
    containerBg: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  info: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      </svg>
    ),
    label: "Info",
    containerBg: "var(--tf-color-primary-container)",
    borderColor: "var(--tf-color-primary)",
    iconColor: "var(--tf-color-primary-light)",
    titleColor: "var(--tf-color-primary-light)",
  },
  note: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
      </svg>
    ),
    label: "Note",
    containerBg: "var(--tf-color-secondary-container)",
    borderColor: "var(--tf-color-secondary)",
    iconColor: "var(--tf-color-secondary-light)",
    titleColor: "var(--tf-color-secondary-light)",
  },
  tip: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
      </svg>
    ),
    label: "Tip",
    containerBg: "var(--tf-color-accent-container)",
    borderColor: "var(--tf-color-accent)",
    iconColor: "var(--tf-color-accent-light)",
    titleColor: "var(--tf-color-accent-light)",
  },
  success: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    label: "Success",
    containerBg: "var(--tf-color-success-container)",
    borderColor: "var(--tf-color-success)",
    iconColor: "var(--tf-color-success)",
    titleColor: "var(--tf-color-success)",
  },
  warning: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    label: "Warning",
    containerBg: "var(--tf-color-warning-container)",
    borderColor: "var(--tf-color-warning)",
    iconColor: "var(--tf-color-warning)",
    titleColor: "var(--tf-color-warning)",
  },
  danger: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
    label: "Danger",
    containerBg: "var(--tf-color-danger-container)",
    borderColor: "var(--tf-color-danger)",
    iconColor: "var(--tf-color-danger)",
    titleColor: "var(--tf-color-danger)",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

export function CalloutBox({
  variant = "info",
  title,
  children,
  icon,
}: CalloutBoxProps): React.ReactElement {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <aside
      role="note"
      style={{
        display: "flex",
        gap: "var(--tf-space-4)",
        padding: "var(--tf-space-5) var(--tf-space-5)",
        borderRadius: "var(--tf-radius-md)",
        background: cfg.containerBg,
        borderLeft: `0.1875rem solid ${cfg.borderColor}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Icon */}
      <span
        style={{
          flexShrink: 0,
          color: cfg.iconColor,
          marginTop: "0.125em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25em",
        }}
      >
        {icon ?? cfg.icon}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <p
            style={{
              margin: "0 0 var(--tf-space-2)",
              fontFamily: "var(--tf-font-display)",
              fontWeight: 600,
              fontSize: "var(--tf-text-sm)",
              color: cfg.titleColor,
              lineHeight: "var(--tf-leading-snug)",
              letterSpacing: "var(--tf-tracking-wide)",
              textTransform: "uppercase",
            }}
          >
            {title}
          </p>
        )}
        <div
          style={{
            fontSize: "var(--tf-text-sm)",
            color: "var(--tf-text-secondary)",
            lineHeight: "var(--tf-leading-relaxed)",
          }}
        >
          {children}
        </div>
      </div>
    </aside>
  );
}

// ─── Convenience aliases ───────────────────────────────────────────────────

export function InfoBox(
  props: Omit<CalloutBoxProps, "variant">,
): React.ReactElement {
  return <CalloutBox {...props} variant="info" />;
}

export function NoteBox(
  props: Omit<CalloutBoxProps, "variant">,
): React.ReactElement {
  return <CalloutBox {...props} variant="note" />;
}

export function TipBox(
  props: Omit<CalloutBoxProps, "variant">,
): React.ReactElement {
  return <CalloutBox {...props} variant="tip" />;
}

export function SuccessBox(
  props: Omit<CalloutBoxProps, "variant">,
): React.ReactElement {
  return <CalloutBox {...props} variant="success" />;
}

export function WarningBox(
  props: Omit<CalloutBoxProps, "variant">,
): React.ReactElement {
  return <CalloutBox {...props} variant="warning" />;
}

export function DangerBox(
  props: Omit<CalloutBoxProps, "variant">,
): React.ReactElement {
  return <CalloutBox {...props} variant="danger" />;
}
