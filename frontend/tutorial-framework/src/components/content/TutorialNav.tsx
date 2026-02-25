import React from "react";

export interface TutorialNavProps {
  prev?: { label: string; href: string; description?: string };
  next?: { label: string; href: string; description?: string };
}

export function TutorialNav({
  prev,
  next,
}: TutorialNavProps): React.ReactElement {
  const btnBase: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--tf-space-1)",
    padding: "var(--tf-space-4) var(--tf-space-5)",
    borderRadius: "var(--tf-radius-xl)",
    border: "1px solid var(--tf-border-default)",
    background: "var(--tf-bg-surface)",
    textDecoration: "none",
    transition:
      "border-color var(--tf-transition-fast), background var(--tf-transition-fast)",
    flex: 1,
    maxWidth: 340,
  };

  return (
    <nav
      aria-label="Tutorial navigation"
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "var(--tf-space-4)",
        marginTop: "var(--tf-space-16)",
        paddingTop: "var(--tf-space-8)",
        borderTop: "1px solid var(--tf-border-subtle)",
      }}
    >
      {prev ? (
        <a href={prev.href} style={btnBase}>
          <span
            style={{
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "var(--tf-space-1)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.25 8a.75.75 0 0 0-.75-.75H5.31l2.22-2.22a.75.75 0 0 0-1.06-1.06l-3 3a.75.75 0 0 0 0 1.061l3 3a.75.75 0 1 0 1.06-1.06L5.31 8.75h6.19A.75.75 0 0 0 12.25 8Z" />
            </svg>
            Previous
          </span>
          <span
            style={{
              fontFamily: "var(--tf-font-display)",
              fontWeight: 600,
              fontSize: "var(--tf-text-sm)",
              color: "var(--tf-text-primary)",
            }}
          >
            {prev.label}
          </span>
          {prev.description && (
            <span
              style={{
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-text-secondary)",
              }}
            >
              {prev.description}
            </span>
          )}
        </a>
      ) : (
        <div />
      )}

      {next ? (
        <a href={next.href} style={{ ...btnBase, alignItems: "flex-end" }}>
          <span
            style={{
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "var(--tf-space-1)",
            }}
          >
            Next
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.75 8a.75.75 0 0 1 .75-.75h6.19L8.47 5.03a.75.75 0 0 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.061l-3 3a.75.75 0 1 1-1.06-1.06l2.22-2.22H4.5A.75.75 0 0 1 3.75 8Z" />
            </svg>
          </span>
          <span
            style={{
              fontFamily: "var(--tf-font-display)",
              fontWeight: 600,
              fontSize: "var(--tf-text-sm)",
              color: "var(--tf-text-primary)",
              textAlign: "right",
            }}
          >
            {next.label}
          </span>
          {next.description && (
            <span
              style={{
                fontSize: "var(--tf-text-xs)",
                color: "var(--tf-text-secondary)",
                textAlign: "right",
              }}
            >
              {next.description}
            </span>
          )}
        </a>
      ) : (
        <div />
      )}
    </nav>
  );
}
