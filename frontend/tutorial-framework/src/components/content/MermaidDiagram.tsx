"use client";
import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface MermaidDiagramProps {
  /** Mermaid chart definition (e.g. "graph TD; A-->B") */
  chart: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Caption below the diagram */
  caption?: string;
  /** Theme — uses mermaid dark theme by default */
  theme?: "dark" | "default" | "forest" | "neutral";
}

// ─── Spacing config ────────────────────────────────────────────────────────

/**
 * Default Mermaid configuration for better spacing and readability.
 * Applied automatically to charts that don't have their own %%{init:...}%%
 */
const MERMAID_SPACING_CONFIG =
  "%%{init: {'flowchart': {'nodeSpacing': 30, 'rankSpacing': 40, 'padding': 15}, 'sequence': {'actorMargin': 50, 'messageMargin': 35}, 'gantt': {'barHeight': 20, 'barGap': 4}}}%%\n";

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Renders a Mermaid.js diagram using client-side rendering.
 * Loads mermaid from CDN on first use (lazy, no bundled dep).
 * Includes a "Full size" button that opens the diagram in a modal dialog.
 */
export function MermaidDiagram({
  chart,
  alt,
  caption,
  theme = "dark",
}: MermaidDiagramProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [svg, setSvg] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState(false);
  // useId gives a stable id that matches between SSR and client
  const reactId = React.useId();
  const idRef = React.useRef(`mermaid-${reactId.replace(/:/g, "")}`);

  // Prepend spacing config if chart doesn't have its own init directive
  const enhancedChart = chart.trimStart().startsWith("%%{")
    ? chart
    : MERMAID_SPACING_CONFIG + chart;

  React.useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        // Dynamic import from CDN (no bundled mermaid)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mermaidModule: any = await Function(
          'return import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs")',
        )();
        const mermaid = mermaidModule.default;
        mermaid.initialize({
          startOnLoad: false,
          theme,
          darkMode: theme === "dark",
          fontFamily: "var(--tf-font-body)",
          securityLevel: "loose",
          themeVariables:
            theme === "dark"
              ? {
                  primaryColor: "#6366f1",
                  primaryTextColor: "#e2e6f0",
                  primaryBorderColor: "#818cf8",
                  lineColor: "#8892a8",
                  secondaryColor: "#14b8a6",
                  tertiaryColor: "#1f222a",
                  mainBkg: "#191c23",
                  nodeBorder: "#818cf8",
                  clusterBkg: "#111318",
                  clusterBorder: "rgba(202,211,230,0.14)",
                  titleColor: "#e2e6f0",
                  edgeLabelBackground: "#191c23",
                }
              : {},
        });

        const { svg: rendered } = await mermaid.render(
          idRef.current,
          enhancedChart,
        );

        if (!cancelled) {
          setSvg(rendered);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to render diagram",
          );
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [enhancedChart, theme]);

  // Close dialog on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (error) {
    return (
      <div
        style={{
          padding: "var(--tf-space-4)",
          borderRadius: "var(--tf-radius-md)",
          background: "var(--tf-color-danger-container)",
          border: "1px solid var(--tf-color-danger)",
          color: "var(--tf-color-danger)",
          fontSize: "var(--tf-text-sm)",
        }}
      >
        <strong>Diagram Error:</strong> {error}
      </div>
    );
  }

  return (
    <>
      <figure
        style={{
          margin: "0",
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-3)",
        }}
      >
        <div
          ref={containerRef}
          role="img"
          aria-label={alt ?? "Mermaid diagram"}
          style={{
            position: "relative",
            padding: "var(--tf-space-6)",
            borderRadius: "var(--tf-radius-md)",
            background: "var(--tf-bg-elevated)",
            border: "1px solid var(--tf-border-subtle)",
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "8rem",
          }}
        >
          {svg ? (
            <>
              <div
                dangerouslySetInnerHTML={{ __html: svg }}
                style={{
                  minWidth: "fit-content",
                  display: "flex",
                  justifyContent: "center",
                }}
              />
              <button
                onClick={() => setIsOpen(true)}
                title="Open full size"
                aria-label="Open diagram in full size"
                style={{
                  position: "absolute",
                  top: "var(--tf-space-2)",
                  right: "var(--tf-space-2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.25rem 0.5rem",
                  background: "var(--tf-bg-surface)",
                  border: "1px solid var(--tf-border-subtle)",
                  borderRadius: "var(--tf-radius-sm)",
                  color: "var(--tf-text-muted)",
                  fontSize: "var(--tf-text-xs)",
                  cursor: "pointer",
                  opacity: 0.75,
                  transition: "opacity 0.15s",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.75";
                }}
              >
                ⤢ Full size
              </button>
            </>
          ) : (
            <span
              style={{
                color: "var(--tf-text-muted)",
                fontSize: "var(--tf-text-sm)",
              }}
            >
              Loading diagram…
            </span>
          )}
        </div>
        {caption && (
          <figcaption
            style={{
              textAlign: "center",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
              fontStyle: "italic",
            }}
          >
            {caption}
          </figcaption>
        )}
      </figure>

      {/* ── Full-size dialog ─────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt ?? "Diagram full view"}
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--tf-space-6)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "85vw",
              minHeight: "80vh",
              maxHeight: "92vh",
              overflow: "auto",
              background: "var(--tf-bg-elevated)",
              borderRadius: "var(--tf-radius-lg)",
              border: "1px solid var(--tf-border-subtle)",
              padding: "3rem 2rem 2rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              aria-label="Close full size view"
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                background: "var(--tf-bg-surface)",
                border: "1px solid var(--tf-border-subtle)",
                borderRadius: "var(--tf-radius-sm)",
                color: "var(--tf-text-muted)",
                fontSize: "var(--tf-text-sm)",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {/* SVG */}
            <div
              dangerouslySetInnerHTML={{ __html: svg }}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                minWidth: "fit-content",
              }}
            />

            {/* Caption */}
            {caption && (
              <p
                style={{
                  textAlign: "center",
                  marginTop: "var(--tf-space-4)",
                  marginBottom: 0,
                  fontSize: "var(--tf-text-sm)",
                  color: "var(--tf-text-muted)",
                  fontStyle: "italic",
                }}
              >
                {caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
