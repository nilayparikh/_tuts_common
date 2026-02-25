import React from "react";

export interface SectionDividerProps {
  /** Optional label shown centered on the divider */
  label?: string;
  /** Visual variant */
  variant?: "default" | "gradient" | "dots";
}

export function SectionDivider({
  label,
  variant = "default",
}: SectionDividerProps): React.ReactElement {
  if (variant === "gradient") {
    return (
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, var(--tf-color-primary) 30%, var(--tf-color-accent) 70%, transparent 100%)",
          margin: "var(--tf-space-12) 0",
          opacity: 0.4,
        }}
        aria-hidden="true"
      />
    );
  }

  if (variant === "dots") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--tf-space-3)",
          margin: "var(--tf-space-12) 0",
        }}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === 1 ? 6 : 4,
              height: i === 1 ? 6 : 4,
              borderRadius: "50%",
              background:
                i === 1
                  ? "var(--tf-color-primary)"
                  : "var(--tf-border-default)",
            }}
          />
        ))}
      </div>
    );
  }

  if (label) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--tf-space-4)",
          margin: "var(--tf-space-12) 0",
        }}
        role="separator"
        aria-label={label}
      >
        <div
          style={{ flex: 1, height: 1, background: "var(--tf-border-subtle)" }}
        />
        <span
          style={{
            fontFamily: "var(--tf-font-mono)",
            fontSize: "var(--tf-text-xs)",
            color: "var(--tf-text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {label}
        </span>
        <div
          style={{ flex: 1, height: 1, background: "var(--tf-border-subtle)" }}
        />
      </div>
    );
  }

  return (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid var(--tf-border-subtle)",
        margin: "var(--tf-space-12) 0",
      }}
    />
  );
}

// ─── Section heading helper ────────────────────────────────────────────────

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: SectionHeadingProps): React.ReactElement {
  return (
    <div
      style={{
        marginBottom: "var(--tf-space-10)",
        textAlign: align,
      }}
    >
      {eyebrow && (
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--tf-font-mono)",
            fontSize: "var(--tf-text-xs)",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--tf-color-primary-light)",
            marginBottom: "var(--tf-space-3)",
          }}
        >
          {eyebrow}
        </span>
      )}
      <h2
        style={{
          fontFamily: "var(--tf-font-display)",
          fontWeight: 800,
          fontSize: "clamp(1.5rem, 3vw, var(--tf-text-4xl))",
          lineHeight: 1.15,
          letterSpacing: "var(--tf-tracking-tight)",
          color: "var(--tf-text-primary)",
          marginBottom: subtitle ? "var(--tf-space-4)" : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: "var(--tf-text-lg)",
            color: "var(--tf-text-secondary)",
            lineHeight: "var(--tf-leading-relaxed)",
            maxWidth: align === "center" ? 640 : undefined,
            margin: align === "center" ? "0 auto" : undefined,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
