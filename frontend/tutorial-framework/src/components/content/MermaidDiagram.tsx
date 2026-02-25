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

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Renders a Mermaid.js diagram using client-side rendering.
 * Loads mermaid from CDN on first use (lazy, no bundled dep).
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
  const idRef = React.useRef(
    `mermaid-${Math.random().toString(36).slice(2, 9)}`,
  );

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

        const { svg: rendered } = await mermaid.render(idRef.current, chart);

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
  }, [chart, theme]);

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
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      >
        {!svg && (
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
  );
}
