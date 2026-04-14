"use client";

/**
 * SlideContent — Presentation-ready content blocks.
 *
 * All colours use CSS vars (--tf-*) for automatic theme adaptation.
 * Peer dependency: spectacle ^10.0.0
 */

import React from "react";
import { Appear, Text, FlexBox, Box } from "spectacle";
import { initMermaid } from "../../theme/mermaidTheme";

/* ── CSS var shorthands ───────────────────────────────────────────────── */

const v = {
  bgBase: "var(--tf-bg-base, #0b0d12)",
  bgSurface: "var(--tf-bg-surface, #111318)",
  bgElevated: "var(--tf-bg-elevated, #191c23)",
  bgOverlay: "var(--tf-bg-overlay, #1f222a)",
  textPrimary: "var(--tf-text-primary, #e2e6f0)",
  textSecondary: "var(--tf-text-secondary, #bfc5d4)",
  textMuted: "var(--tf-text-muted, #8892a8)",
  primary: "var(--tf-color-primary, #6366f1)",
  primaryLight: "var(--tf-color-primary-light, #818cf8)",
  accent: "var(--tf-color-accent, #f59e0b)",
  accentLight: "var(--tf-color-accent-light, #fcd34d)",
  borderDefault: "var(--tf-border-default, rgba(202,211,230,0.14))",
  borderSubtle: "var(--tf-border-subtle, rgba(202,211,230,0.08))",
  codeBg: "var(--tf-code-bg, #1f222a)",
  codeText: "var(--tf-code-text, #e2e8f0)",
  fontDisplay: "var(--tf-font-display, 'Inter', system-ui, sans-serif)",
  fontBody: "var(--tf-font-body, 'Inter', system-ui, sans-serif)",
  fontMono: "var(--tf-font-mono, 'JetBrains Mono', monospace)",
  radiusMd: "var(--tf-radius-md, 12px)",
  radiusLg: "var(--tf-radius-lg, 16px)",
  colorPrimary: "var(--tf-color-primary, #6366f1)",
  colorAccent: "var(--tf-color-accent, #f59e0b)",
};

/* ── Bullet List ──────────────────────────────────────────────────────── */

export interface BulletItem {
  icon?: string;
  text: string;
  sub?: string;
}

interface BulletListProps {
  items: BulletItem[];
  appear?: boolean;
}

export function BulletList({ items, appear = true }: BulletListProps) {
  const renderItem = (item: BulletItem, i: number) => (
    <FlexBox
      key={i}
      alignItems="flex-start"
      style={{
        marginBottom: "6px",
        padding: "12px 16px",
        borderRadius: "8px",
        background: i % 2 === 0 ? "transparent" : v.bgElevated,
        transition: "background 200ms ease",
      }}
    >
      <Box
        style={{
          marginTop: "8px",
          marginRight: "18px",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${v.colorPrimary}, ${v.colorAccent})`,
          flexShrink: 0,
          boxShadow: `0 0 8px rgba(99,102,241,0.3)`,
        }}
      />
      <Box>
        <Text
          fontSize="21px"
          fontWeight={600}
          color={v.textPrimary}
          fontFamily={v.fontDisplay}
          style={{ margin: 0, lineHeight: 1.45, letterSpacing: "-0.01em" }}
        >
          {item.text}
        </Text>
        {item.sub && (
          <Text
            fontSize="16px"
            color={v.textSecondary}
            fontFamily={v.fontBody}
            style={{ margin: 0, marginTop: "6px", lineHeight: 1.55 }}
          >
            {item.sub}
          </Text>
        )}
      </Box>
    </FlexBox>
  );

  if (!appear) return <Box>{items.map(renderItem)}</Box>;

  return (
    <Box>
      {items.map((item, i) => (
        <Appear key={i} stepIndex={i}>
          {renderItem(item, i)}
        </Appear>
      ))}
    </Box>
  );
}

/* ── Info Card ────────────────────────────────────────────────────────── */

interface InfoCardProps {
  icon?: string;
  label: string;
  value: string;
  color?: string;
}

export function InfoCard({ icon, label, value, color }: InfoCardProps) {
  const c = color ?? v.primaryLight;
  return (
    <Box
      style={{
        background: v.bgElevated,
        border: `1px solid ${v.borderDefault}`,
        borderRadius: v.radiusMd,
        padding: "18px 22px",
        minWidth: "160px",
        flex: "1 1 0",
      }}
    >
      {icon && (
        <Text fontSize="26px" style={{ margin: 0, marginBottom: "6px" }}>
          {icon}
        </Text>
      )}
      <Text
        fontSize="12px"
        fontWeight={600}
        color={v.textMuted}
        fontFamily={v.fontDisplay}
        style={{
          margin: 0,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
        }}
      >
        {label}
      </Text>
      <Text
        fontSize="26px"
        fontWeight={700}
        color={c}
        fontFamily={v.fontDisplay}
        style={{ margin: 0, marginTop: "4px" }}
      >
        {value}
      </Text>
    </Box>
  );
}

/* ── Comparison Table ─────────────────────────────────────────────────── */

interface ComparisonTableProps {
  headers: string[];
  rows: string[][];
  highlightCol?: number;
}

export function ComparisonTable({
  headers,
  rows,
  highlightCol,
}: ComparisonTableProps) {
  return (
    <Box
      style={{
        width: "100%",
        borderRadius: v.radiusMd,
        overflow: "hidden",
        border: `1px solid ${v.borderDefault}`,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: v.fontBody,
          fontSize: "17px",
        }}
      >
        <thead>
          <tr style={{ background: v.bgElevated }}>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: "12px 18px",
                  textAlign: "left",
                  color: v.primaryLight,
                  fontWeight: 700,
                  fontSize: "13px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  borderBottom: `1px solid ${v.borderDefault}`,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                background: ri % 2 === 0 ? v.bgSurface : v.bgElevated,
              }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "10px 18px",
                    color: highlightCol === ci ? v.accent : v.textSecondary,
                    fontWeight: highlightCol === ci ? 600 : 400,
                    borderBottom: `1px solid ${v.borderSubtle}`,
                    fontFamily: ci === 0 ? v.fontBody : v.fontMono,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

/* ── Code Block ───────────────────────────────────────────────────────── */

interface SlideCodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  fontSize?: string;
}

export function SlideCodeBlock({
  code,
  title,
  fontSize = "15px",
}: SlideCodeBlockProps) {
  return (
    <Box
      style={{
        background: v.codeBg,
        borderRadius: v.radiusMd,
        border: `1px solid ${v.borderDefault}`,
        overflow: "hidden",
      }}
    >
      {title && (
        <Box
          style={{
            padding: "8px 18px",
            background: v.bgElevated,
            borderBottom: `1px solid ${v.borderDefault}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* Traffic light dots */}
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--tf-decor-red, #ff5f57)",
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--tf-decor-yellow, #febc2e)",
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--tf-decor-green, #28c840)",
            }}
          />
          <Text
            fontSize="12px"
            color={v.textMuted}
            fontFamily={v.fontMono}
            fontWeight={600}
            style={{ margin: 0, marginLeft: "8px" }}
          >
            {title}
          </Text>
        </Box>
      )}
      <Box style={{ padding: "16px 18px" }}>
        <pre
          style={{
            margin: 0,
            fontFamily: v.fontMono,
            fontSize,
            lineHeight: 1.65,
            color: v.codeText,
            whiteSpace: "pre-wrap",
          }}
        >
          {code}
        </pre>
      </Box>
    </Box>
  );
}

/* ── Gradient Divider ─────────────────────────────────────────────────── */

export function GradientDivider() {
  return (
    <Box
      style={{
        height: "2px",
        margin: "20px 0",
        borderRadius: "1px",
        background: `linear-gradient(90deg, transparent, ${v.primary}, ${v.accent}, transparent)`,
      }}
    />
  );
}

/* ── Stat Row (horizontal KPI cards) ──────────────────────────────────── */

interface StatRowProps {
  stats: Array<{ icon?: string; label: string; value: string; color?: string }>;
}

export function StatRow({ stats }: StatRowProps) {
  return (
    <FlexBox style={{ gap: "14px" }}>
      {stats.map((s, i) => (
        <InfoCard key={i} {...s} />
      ))}
    </FlexBox>
  );
}

/* ── MathBlock — render LaTeX/KaTeX math formulas ─────────────────────── */

interface MathBlockProps {
  /** KaTeX expression (e.g. "N \\times (N-1) \\over 2") */
  tex: string;
  /** Display mode — large, centered (default true). False = inline size. */
  display?: boolean;
  /** Optional colour override */
  color?: string;
}

/**
 * Renders a KaTeX math expression. Requires the KaTeX CSS to be loaded
 * (add KaTeX CDN stylesheet to your index.html).
 *
 * Falls back to raw TeX string if KaTeX auto-render is unavailable.
 */
export function MathBlock({ tex, display = true, color }: MathBlockProps) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (ref.current && typeof window !== "undefined") {
      let katex = (window as unknown as Record<string, unknown>).katex as
        | {
            render: (
              tex: string,
              el: HTMLElement,
              opts: Record<string, unknown>,
            ) => void;
          }
        | undefined;

      const renderKatex = () => {
        if (!katex?.render || !ref.current) return;
        try {
          katex.render(tex, ref.current, {
            displayMode: display,
            throwOnError: false,
            strict: false,
          });
        } catch {
          ref.current.textContent = tex;
        }
      };

      if (katex?.render) {
        renderKatex();
      } else {
        // Wait for KaTeX to load if it's deferred
        let attempt = 0;
        const interval = setInterval(() => {
          attempt++;
          const deferredKatex = (window as unknown as Record<string, unknown>)
            .katex as any;
          if (deferredKatex?.render) {
            clearInterval(interval);
            katex = deferredKatex;
            renderKatex();
          } else if (attempt > 50) {
            clearInterval(interval);
          }
        }, 100);
        cleanup = () => clearInterval(interval);
      }
    }
    return cleanup;
  }, [tex, display]);

  return (
    <span
      ref={ref}
      style={{
        color: color ?? v.textPrimary,
        fontSize: display ? "28px" : "inherit",
        display: display ? "block" : "inline",
        textAlign: display ? "center" : undefined,
        margin: display ? "12px 0" : undefined,
        fontFamily: v.fontMono,
      }}
    >
      {tex}
    </span>
  );
}

/* ── MermaidDiagram — render Mermaid diagrams with theme ──────────────── */

interface MermaidDiagramProps {
  /** Mermaid diagram definition string */
  chart: string;
  /** Optional width constraint */
  maxWidth?: string;
  /** Optional caption below the diagram */
  caption?: string;
  /** Compact layout for dense presentation widgets */
  compact?: boolean;
}

let mermaidCounter = 0;

/**
 * Default Mermaid configuration for better spacing and readability.
 * Applied automatically to charts that don't have their own %%{init:...}%%
 */
const MERMAID_SPACING_CONFIG =
  "%%{init: {'flowchart': {'nodeSpacing': 30, 'rankSpacing': 40, 'padding': 15}, 'sequence': {'actorMargin': 50, 'messageMargin': 35}, 'gantt': {'barHeight': 20, 'barGap': 4}}}%%\n";

/**
 * Renders a Mermaid diagram using the global mermaid instance (loaded via CDN).
 * Automatically applies the dark theme matching --tf-* CSS vars.
 */
export function MermaidDiagram({
  chart,
  maxWidth = "100%",
  caption,
  compact = false,
}: MermaidDiagramProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [id] = React.useState(() => `mermaid-${++mermaidCounter}`);

  // Prepend spacing config if chart doesn't have its own init directive
  const enhancedChart = chart.trimStart().startsWith("%%{")
    ? chart
    : MERMAID_SPACING_CONFIG + chart;

  React.useEffect(() => {
    if (!ref.current) return;

    const mermaid = (window as any).mermaid;
    if (!mermaid?.render) {
      // Wait for mermaid to load
      let attempt = 0;
      const interval = setInterval(async () => {
        attempt++;
        const m = (window as any).mermaid;
        if (m?.render && ref.current) {
          clearInterval(interval);
          initMermaid();
          try {
            const { svg } = await m.render(id, enhancedChart);
            ref.current.innerHTML = svg;
          } catch (e) {
            ref.current.textContent = chart;
          }
        } else if (attempt > 50) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // Mermaid is already loaded
    initMermaid();
    (async () => {
      try {
        const { svg } = await mermaid.render(id, enhancedChart);
        if (ref.current) ref.current.innerHTML = svg;
      } catch {
        if (ref.current) ref.current.textContent = chart;
      }
    })();
    return;
  }, [enhancedChart, id]);

  return (
    <Box style={{ width: "100%", maxWidth, margin: "0 auto" }}>
      <Box
        style={{
          background: v.bgElevated,
          borderRadius: v.radiusLg,
          border: `1px solid ${v.borderDefault}`,
          padding: compact ? "12px" : "24px",
          overflow: "auto",
        }}
      >
        <div
          ref={ref}
          style={{
            display: "flex",
            justifyContent: "center",
            minHeight: compact ? "72px" : "100px",
          }}
        >
          <span style={{ color: v.textMuted, fontSize: "14px" }}>
            Loading diagram…
          </span>
        </div>
      </Box>
      {caption && (
        <Text
          fontSize="13px"
          color={v.textMuted}
          fontFamily={v.fontBody}
          style={{
            margin: 0,
            marginTop: "10px",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {caption}
        </Text>
      )}
    </Box>
  );
}
