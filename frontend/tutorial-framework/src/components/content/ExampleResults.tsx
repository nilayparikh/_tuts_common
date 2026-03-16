"use client";
import React, { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type AssessmentRating = "pass" | "partial" | "fail";

export interface AssessmentDimension {
  name: string;
  abbr: string;
  rating: AssessmentRating;
  summary: string;
  metrics?: Array<{ label: string; value: string }>;
  evidence?: string;
}

export interface ExampleAssessment {
  model: string;
  duration: string;
  date: string;
  verdict: AssessmentRating;
  promptUnderTest?: string;
  dimensions: AssessmentDimension[];
}

export interface RunToolCall {
  tool: string;
  target: string;
  outcome: string;
  success: boolean;
}

export interface RunContextStage {
  name: string;
  timeRange?: string;
  contextLoaded: string;
  purpose: string;
}

export interface RunDecision {
  decision: string;
  basis: string;
  constraintType?: string;
  validated: boolean;
}

export interface ExampleRun {
  sessionId?: string;
  model: string;
  duration: string;
  trajectoryChart?: string;
  stages?: RunContextStage[];
  toolCalls?: RunToolCall[];
  decisions?: RunDecision[];
  metadata?: Array<{ label: string; value: string }>;
}

export interface ExampleResultsProps {
  /** Assessment data */
  assessment?: ExampleAssessment;
  /** Run analysis data */
  run?: ExampleRun;
  /** Default active tab */
  defaultTab?: "assessment" | "run";
}

// ─── Rating helpers ────────────────────────────────────────────────────────

const RATING_CONFIG: Record<
  AssessmentRating,
  { label: string; icon: string; color: string; bg: string }
> = {
  pass: {
    label: "PASS",
    icon: "✅",
    color: "var(--tf-color-success, #10b981)",
    bg: "var(--tf-color-success-container, rgba(16,185,129,0.1))",
  },
  partial: {
    label: "PARTIAL",
    icon: "⚠️",
    color: "var(--tf-color-warning, #f59e0b)",
    bg: "var(--tf-color-warning-container, rgba(245,158,11,0.1))",
  },
  fail: {
    label: "FAIL",
    icon: "❌",
    color: "var(--tf-color-error, #ef4444)",
    bg: "var(--tf-color-error-container, rgba(239,68,68,0.1))",
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────

function RatingBadge({ rating }: { rating: AssessmentRating }) {
  const cfg = RATING_CONFIG[rating];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.125rem 0.5rem",
        borderRadius: "var(--tf-radius-full, 9999px)",
        background: cfg.bg,
        color: cfg.color,
        fontSize: "var(--tf-text-xs, 0.75rem)",
        fontWeight: 700,
        fontFamily: "var(--tf-font-mono, monospace)",
        letterSpacing: "var(--tf-tracking-wide, 0.06em)",
        lineHeight: 1.5,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function MetaChip({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.25rem 0.625rem",
        borderRadius: "var(--tf-radius-sm, 0.375rem)",
        background: "var(--tf-bg-elevated, rgba(255,255,255,0.04))",
        border: "1px solid var(--tf-border-subtle, rgba(255,255,255,0.06))",
        fontSize: "var(--tf-text-xs, 0.75rem)",
        color: "var(--tf-text-secondary, #94a3b8)",
        fontFamily: "var(--tf-font-mono, monospace)",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true" style={{ fontSize: "0.875rem" }}>
        {icon}
      </span>
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "var(--tf-text-primary, #e2e8f0)" }}>
        {value}
      </span>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen || undefined}
      style={{
        borderRadius: "var(--tf-radius-md, 0.5rem)",
        border: "1px solid var(--tf-border-subtle, rgba(255,255,255,0.06))",
        background: "var(--tf-bg-elevated, rgba(255,255,255,0.02))",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--tf-space-3, 0.75rem)",
          padding: "var(--tf-space-3, 0.75rem) var(--tf-space-4, 1rem)",
          cursor: "pointer",
          fontFamily: "var(--tf-font-display, system-ui)",
          fontWeight: 600,
          fontSize: "var(--tf-text-sm, 0.875rem)",
          color: "var(--tf-text-primary, #e2e8f0)",
          listStyle: "none",
          userSelect: "none",
        }}
      >
        <span aria-hidden="true">{icon}</span>
        {title}
        <svg
          className="tf-accordion-chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ marginLeft: "auto", opacity: 0.5 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div
        style={{
          padding: "0 var(--tf-space-4, 1rem) var(--tf-space-4, 1rem)",
        }}
      >
        {children}
      </div>
    </details>
  );
}

// ─── Assessment Tab ────────────────────────────────────────────────────────

function AssessmentTab({ data }: { data: ExampleAssessment }) {
  const verdictCfg = RATING_CONFIG[data.verdict];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-4, 1rem)",
      }}
    >
      {/* ── Verdict banner ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--tf-space-4, 1rem) var(--tf-space-5, 1.25rem)",
          borderRadius: "var(--tf-radius-md, 0.5rem)",
          background: verdictCfg.bg,
          border: `1px solid ${verdictCfg.color}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3, 0.75rem)",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>{verdictCfg.icon}</span>
          <div>
            <div
              style={{
                fontFamily: "var(--tf-font-display, system-ui)",
                fontWeight: 700,
                fontSize: "var(--tf-text-lg, 1.125rem)",
                color: verdictCfg.color,
              }}
            >
              Verdict: {verdictCfg.label}
            </div>
            <div
              style={{
                fontSize: "var(--tf-text-xs, 0.75rem)",
                color: "var(--tf-text-secondary, #94a3b8)",
                marginTop: "0.125rem",
              }}
            >
              {data.dimensions.filter((d) => d.rating === "pass").length} of{" "}
              {data.dimensions.length} dimensions passed
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "var(--tf-space-2, 0.5rem)",
            flexWrap: "wrap",
          }}
        >
          <MetaChip icon="🤖" label="Model" value={data.model} />
          <MetaChip icon="⏱" label="" value={data.duration} />
          <MetaChip icon="📅" label="" value={data.date} />
        </div>
      </div>

      {/* ── Scorecard grid ─────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
          gap: "var(--tf-space-3, 0.75rem)",
        }}
      >
        {data.dimensions.map((dim) => (
          <DimensionCard key={dim.abbr} dim={dim} />
        ))}
      </div>

      {/* ── Prompt under test ──────────────────────────────────── */}
      {data.promptUnderTest && (
        <CollapsibleSection title="Prompt Under Test" icon="📝">
          <pre
            style={{
              margin: 0,
              padding: "var(--tf-space-4, 1rem)",
              background: "var(--tf-code-bg, #0d1117)",
              borderRadius: "var(--tf-radius-sm, 0.375rem)",
              fontSize: "var(--tf-text-xs, 0.75rem)",
              fontFamily: "var(--tf-font-mono, monospace)",
              color: "var(--tf-text-secondary, #94a3b8)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: "var(--tf-leading-relaxed, 1.625)",
              overflowX: "auto",
              maxHeight: "20rem",
            }}
          >
            {data.promptUnderTest}
          </pre>
        </CollapsibleSection>
      )}

      {/* ── Detailed dimension breakdowns ──────────────────────── */}
      {data.dimensions.some((d) => d.metrics || d.evidence) && (
        <CollapsibleSection title="Detailed Dimension Breakdowns" icon="🔍">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--tf-space-4, 1rem)",
            }}
          >
            {data.dimensions
              .filter((d) => d.metrics || d.evidence)
              .map((dim) => (
                <DimensionDetail key={dim.abbr} dim={dim} />
              ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

function DimensionCard({ dim }: { dim: AssessmentDimension }) {
  const cfg = RATING_CONFIG[dim.rating];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-2, 0.5rem)",
        padding: "var(--tf-space-4, 1rem)",
        borderRadius: "var(--tf-radius-md, 0.5rem)",
        background: "var(--tf-bg-elevated, rgba(255,255,255,0.02))",
        border: "1px solid var(--tf-border-subtle, rgba(255,255,255,0.06))",
        borderLeft: `3px solid ${cfg.color}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--tf-space-2, 0.5rem)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--tf-font-mono, monospace)",
            fontWeight: 700,
            fontSize: "var(--tf-text-xs, 0.75rem)",
            color: "var(--tf-text-tertiary, #64748b)",
            letterSpacing: "var(--tf-tracking-wide, 0.06em)",
          }}
        >
          {dim.abbr}
        </span>
        <RatingBadge rating={dim.rating} />
      </div>
      <div
        style={{
          fontFamily: "var(--tf-font-display, system-ui)",
          fontWeight: 600,
          fontSize: "var(--tf-text-sm, 0.875rem)",
          color: "var(--tf-text-primary, #e2e8f0)",
        }}
      >
        {dim.name}
      </div>
      <div
        style={{
          fontSize: "var(--tf-text-xs, 0.75rem)",
          color: "var(--tf-text-secondary, #94a3b8)",
          lineHeight: "var(--tf-leading-relaxed, 1.625)",
        }}
      >
        {dim.summary}
      </div>
    </div>
  );
}

function DimensionDetail({ dim }: { dim: AssessmentDimension }) {
  return (
    <div
      style={{
        padding: "var(--tf-space-3, 0.75rem) var(--tf-space-4, 1rem)",
        borderRadius: "var(--tf-radius-sm, 0.375rem)",
        background: "var(--tf-bg-surface, rgba(255,255,255,0.01))",
        border: "1px solid var(--tf-border-subtle, rgba(255,255,255,0.06))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--tf-space-2, 0.5rem)",
          marginBottom: "var(--tf-space-3, 0.75rem)",
        }}
      >
        <RatingBadge rating={dim.rating} />
        <span
          style={{
            fontFamily: "var(--tf-font-display, system-ui)",
            fontWeight: 600,
            fontSize: "var(--tf-text-sm, 0.875rem)",
            color: "var(--tf-text-primary, #e2e8f0)",
          }}
        >
          {dim.abbr} — {dim.name}
        </span>
      </div>

      {dim.metrics && dim.metrics.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "max-content 1fr",
            gap: "0.25rem 1rem",
            fontSize: "var(--tf-text-xs, 0.75rem)",
            fontFamily: "var(--tf-font-mono, monospace)",
            marginBottom: dim.evidence
              ? "var(--tf-space-3, 0.75rem)"
              : undefined,
          }}
        >
          {dim.metrics.map((m, i) => (
            <React.Fragment key={i}>
              <span style={{ color: "var(--tf-text-tertiary, #64748b)" }}>
                {m.label}
              </span>
              <span style={{ color: "var(--tf-text-secondary, #94a3b8)" }}>
                {m.value}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {dim.evidence && (
        <pre
          style={{
            margin: 0,
            padding: "var(--tf-space-3, 0.75rem)",
            background: "var(--tf-code-bg, #0d1117)",
            borderRadius: "var(--tf-radius-sm, 0.375rem)",
            fontSize: "0.6875rem",
            fontFamily: "var(--tf-font-mono, monospace)",
            color: "var(--tf-text-tertiary, #64748b)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.5,
            maxHeight: "10rem",
            overflowY: "auto",
          }}
        >
          {dim.evidence}
        </pre>
      )}
    </div>
  );
}

// ─── Run Analysis Tab ──────────────────────────────────────────────────────

function RunTab({ data }: { data: ExampleRun }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-4, 1rem)",
      }}
    >
      {/* ── Session header ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--tf-space-2, 0.5rem)",
          flexWrap: "wrap",
        }}
      >
        <MetaChip icon="🤖" label="Model" value={data.model} />
        <MetaChip icon="⏱" label="" value={data.duration} />
        {data.sessionId && (
          <MetaChip
            icon="🔗"
            label=""
            value={data.sessionId.slice(0, 8) + "…"}
          />
        )}
        {data.metadata?.map((m, i) => (
          <MetaChip key={i} icon="📊" label={m.label} value={m.value} />
        ))}
      </div>

      {/* ── Context stages ─────────────────────────────────────── */}
      {data.stages && data.stages.length > 0 && (
        <CollapsibleSection
          title="Context at Each Stage"
          icon="🧭"
          defaultOpen
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--tf-space-2, 0.5rem)",
            }}
          >
            {data.stages.map((stage, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2rem 1fr",
                  gap: "var(--tf-space-3, 0.75rem)",
                  alignItems: "start",
                }}
              >
                {/* Timeline dot + line */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      width: "0.625rem",
                      height: "0.625rem",
                      borderRadius: "50%",
                      background: "var(--tf-color-primary, #818cf8)",
                      flexShrink: 0,
                    }}
                  />
                  {i < data.stages!.length - 1 && (
                    <div
                      style={{
                        width: "2px",
                        flex: 1,
                        minHeight: "1.5rem",
                        background:
                          "var(--tf-border-subtle, rgba(255,255,255,0.06))",
                      }}
                    />
                  )}
                </div>
                {/* Content */}
                <div style={{ paddingBottom: "var(--tf-space-2, 0.5rem)" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "var(--tf-space-2, 0.5rem)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "var(--tf-text-sm, 0.875rem)",
                        color: "var(--tf-text-primary, #e2e8f0)",
                      }}
                    >
                      {stage.name}
                    </span>
                    {stage.timeRange && (
                      <span
                        style={{
                          fontSize: "var(--tf-text-xs, 0.75rem)",
                          fontFamily: "var(--tf-font-mono, monospace)",
                          color: "var(--tf-text-tertiary, #64748b)",
                        }}
                      >
                        {stage.timeRange}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--tf-text-xs, 0.75rem)",
                      color: "var(--tf-text-secondary, #94a3b8)",
                      lineHeight: "var(--tf-leading-relaxed, 1.625)",
                      marginTop: "0.125rem",
                    }}
                  >
                    {stage.purpose}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--tf-text-xs, 0.75rem)",
                      fontFamily: "var(--tf-font-mono, monospace)",
                      color: "var(--tf-text-tertiary, #64748b)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {stage.contextLoaded}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Tool call timeline ─────────────────────────────────── */}
      {data.toolCalls && data.toolCalls.length > 0 && (
        <CollapsibleSection title="Tool Call Timeline" icon="🔧">
          <ToolCallTimeline calls={data.toolCalls} />
        </CollapsibleSection>
      )}

      {/* ── Decisions ──────────────────────────────────────────── */}
      {data.decisions && data.decisions.length > 0 && (
        <CollapsibleSection title="Assumptions & Decisions" icon="🎯">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--tf-space-2, 0.5rem)",
            }}
          >
            {data.decisions.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5rem 1fr",
                  gap: "var(--tf-space-2, 0.5rem)",
                  padding: "var(--tf-space-2, 0.5rem) var(--tf-space-3, 0.75rem)",
                  borderRadius: "var(--tf-radius-sm, 0.375rem)",
                  background: d.validated
                    ? "var(--tf-color-success-container, rgba(16,185,129,0.06))"
                    : "var(--tf-color-warning-container, rgba(245,158,11,0.06))",
                  border: `1px solid ${d.validated ? "var(--tf-color-success-container, rgba(16,185,129,0.12))" : "var(--tf-color-warning-container, rgba(245,158,11,0.12))"}`,
                  fontSize: "var(--tf-text-xs, 0.75rem)",
                }}
              >
                <span style={{ textAlign: "center" }}>
                  {d.validated ? "✅" : "⚠️"}
                </span>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--tf-text-primary, #e2e8f0)",
                      marginBottom: "0.125rem",
                    }}
                  >
                    {d.decision}
                  </div>
                  <div style={{ color: "var(--tf-text-secondary, #94a3b8)" }}>
                    {d.basis}
                    {d.constraintType && (
                      <span
                        style={{
                          marginLeft: "0.5rem",
                          fontFamily: "var(--tf-font-mono, monospace)",
                          opacity: 0.6,
                        }}
                      >
                        [{d.constraintType}]
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

function ToolCallTimeline({ calls }: { calls: RunToolCall[] }) {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW_COUNT = 12;
  const visible = showAll ? calls : calls.slice(0, PREVIEW_COUNT);
  const hasMore = calls.length > PREVIEW_COUNT;

  const toolColors: Record<string, string> = {
    view: "var(--tf-color-primary-light, #818cf8)",
    rg: "var(--tf-color-secondary-light, #2dd4bf)",
    glob: "var(--tf-color-secondary, #14b8a6)",
    apply_patch: "var(--tf-color-accent, #f59e0b)",
    skill: "var(--tf-color-info, #38bdf8)",
    store_memory: "var(--tf-text-tertiary, #64748b)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "5.5rem 1fr 1.5rem",
          gap: "var(--tf-space-2, 0.5rem)",
          padding: "var(--tf-space-2, 0.5rem) var(--tf-space-3, 0.75rem)",
          borderBottom:
            "1px solid var(--tf-border-subtle, rgba(255,255,255,0.06))",
          fontSize: "0.6875rem",
          fontFamily: "var(--tf-font-mono, monospace)",
          fontWeight: 700,
          color: "var(--tf-text-tertiary, #64748b)",
          letterSpacing: "var(--tf-tracking-wide, 0.06em)",
          textTransform: "uppercase" as const,
        }}
      >
        <span>Tool</span>
        <span>Target / Outcome</span>
        <span />
      </div>

      {visible.map((call, i) => {
        const toolColor =
          toolColors[call.tool] ?? "var(--tf-text-secondary, #94a3b8)";
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "5.5rem 1fr 1.5rem",
              gap: "var(--tf-space-2, 0.5rem)",
              padding:
                "var(--tf-space-1, 0.25rem) var(--tf-space-3, 0.75rem)",
              borderBottom:
                "1px solid var(--tf-border-subtle, rgba(255,255,255,0.03))",
              fontSize: "var(--tf-text-xs, 0.75rem)",
              fontFamily: "var(--tf-font-mono, monospace)",
              transition: "background var(--tf-transition-fast, 0.15s)",
            }}
          >
            <span style={{ color: toolColor, fontWeight: 600 }}>
              {call.tool}
            </span>
            <div>
              <span style={{ color: "var(--tf-text-secondary, #94a3b8)" }}>
                {call.target}
              </span>
              {call.outcome && (
                <span
                  style={{
                    color: "var(--tf-text-tertiary, #64748b)",
                    marginLeft: "0.5rem",
                  }}
                >
                  — {call.outcome}
                </span>
              )}
            </div>
            <span style={{ textAlign: "center" }}>
              {call.success ? "✅" : "❌"}
            </span>
          </div>
        );
      })}

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            margin: "var(--tf-space-2, 0.5rem) 0",
            padding: "var(--tf-space-2, 0.5rem) var(--tf-space-4, 1rem)",
            borderRadius: "var(--tf-radius-sm, 0.375rem)",
            border:
              "1px solid var(--tf-border-default, rgba(255,255,255,0.1))",
            background: "transparent",
            color: "var(--tf-color-primary-light, #818cf8)",
            fontSize: "var(--tf-text-xs, 0.75rem)",
            fontFamily: "var(--tf-font-mono, monospace)",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Show all {calls.length} tool calls
        </button>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function ExampleResults({
  assessment,
  run,
  defaultTab = "assessment",
}: ExampleResultsProps): React.ReactElement | null {
  const hasBoth = !!assessment && !!run;
  const [activeTab, setActiveTab] = useState<"assessment" | "run">(
    assessment ? defaultTab : "run",
  );

  if (!assessment && !run) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        borderRadius: "var(--tf-radius-lg, 0.75rem)",
        border: "1px solid var(--tf-border-default, rgba(255,255,255,0.1))",
        background: "var(--tf-bg-surface, #111318)",
        overflow: "hidden",
      }}
    >
      {/* ── Header + Tabs ──────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--tf-space-4, 1rem) var(--tf-space-5, 1.25rem)",
          borderBottom:
            "1px solid var(--tf-border-subtle, rgba(255,255,255,0.06))",
          background: "var(--tf-bg-elevated, rgba(255,255,255,0.02))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3, 0.75rem)",
          }}
        >
          <span style={{ fontSize: "1.25rem" }}>🧪</span>
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--tf-font-display, system-ui)",
              fontWeight: 700,
              fontSize: "var(--tf-text-base, 1rem)",
              color: "var(--tf-text-primary, #e2e8f0)",
            }}
          >
            Example Results
          </h3>
        </div>

        {/* Tabs */}
        {hasBoth && (
          <div
            style={{
              display: "flex",
              gap: "0.125rem",
              padding: "0.125rem",
              borderRadius: "var(--tf-radius-sm, 0.375rem)",
              background:
                "var(--tf-bg-overlay, rgba(255,255,255,0.04))",
            }}
          >
            {(["assessment", "run"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "0.375rem 0.75rem",
                    borderRadius: "var(--tf-radius-xs, 0.25rem)",
                    border: "none",
                    background: isActive
                      ? "var(--tf-color-primary-container, rgba(129,140,248,0.12))"
                      : "transparent",
                    color: isActive
                      ? "var(--tf-color-primary-light, #818cf8)"
                      : "var(--tf-text-tertiary, #64748b)",
                    fontSize: "var(--tf-text-xs, 0.75rem)",
                    fontFamily: "var(--tf-font-display, system-ui)",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all var(--tf-transition-fast, 0.15s)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab === "assessment" ? "📋 Assessment" : "🔬 Run Analysis"}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div
        style={{
          padding: "var(--tf-space-5, 1.25rem)",
        }}
      >
        {activeTab === "assessment" && assessment && (
          <AssessmentTab data={assessment} />
        )}
        {activeTab === "run" && run && <RunTab data={run} />}
      </div>
    </div>
  );
}
