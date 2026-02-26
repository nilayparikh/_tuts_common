"use client";
import React, { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PollOption {
  id: string;
  text: string;
}

export interface PollBlockProps {
  /** Poll question */
  question: string;
  /** Answer options */
  options: PollOption[];
  /** If true, show results (simulated) after voting */
  showResults?: boolean;
  /** Simulated vote counts per option ID (for static sites) */
  simulatedVotes?: Record<string, number>;
  /** Allow multiple selections */
  multiSelect?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function PollBlock({
  question,
  options,
  showResults = true,
  simulatedVotes,
  multiSelect = false,
}: PollBlockProps): React.ReactElement {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasVoted, setHasVoted] = useState(false);

  // Build vote data (real votes would come from API; this is static)
  const votes: Record<string, number> = {};
  for (const opt of options) {
    votes[opt.id] =
      simulatedVotes?.[opt.id] ?? Math.floor(Math.random() * 40 + 10);
  }
  // Add user's vote
  if (hasVoted) {
    for (const id of selected) {
      votes[id] = (votes[id] ?? 0) + 1;
    }
  }
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  function toggleOption(id: string) {
    if (hasVoted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (multiSelect) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  }

  function handleVote() {
    if (selected.size === 0) return;
    setHasVoted(true);
  }

  return (
    <div
      style={{
        padding: "var(--tf-space-6)",
        borderRadius: "var(--tf-radius-md)",
        background: "var(--tf-bg-surface)",
        border: "1px solid var(--tf-border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--tf-space-5)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--tf-space-3)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="var(--tf-color-secondary-light)"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
        </svg>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--tf-font-display)",
            fontWeight: 600,
            fontSize: "var(--tf-text-lg)",
            color: "var(--tf-text-primary)",
            lineHeight: "var(--tf-leading-snug)",
          }}
        >
          {question}
        </h3>
      </div>

      {/* Options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--tf-space-2)",
        }}
      >
        {options.map((opt) => {
          const isSelected = selected.has(opt.id);
          const percentage =
            hasVoted && showResults && totalVotes > 0
              ? Math.round((votes[opt.id] / totalVotes) * 100)
              : 0;

          return (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              disabled={hasVoted}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--tf-space-3)",
                padding: "var(--tf-space-3) var(--tf-space-4)",
                borderRadius: "var(--tf-radius-sm)",
                border: `1px solid ${isSelected ? "var(--tf-color-primary)" : "var(--tf-border-default)"}`,
                background: isSelected
                  ? "var(--tf-color-primary-container)"
                  : "var(--tf-bg-elevated)",
                color: isSelected
                  ? "var(--tf-color-primary-light)"
                  : "var(--tf-text-secondary)",
                cursor: hasVoted ? "default" : "pointer",
                textAlign: "left",
                fontFamily: "var(--tf-font-body)",
                fontSize: "var(--tf-text-sm)",
                position: "relative",
                overflow: "hidden",
                transition: "all var(--tf-transition-fast)",
                width: "100%",
              }}
            >
              {/* Results progress bar */}
              {hasVoted && showResults && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${percentage}%`,
                    background: isSelected
                      ? "var(--tf-color-primary-container-high)"
                      : "var(--tf-bg-elevated)",
                    transition: "width var(--tf-transition-slow)",
                  }}
                />
              )}

              {/* Radio / check */}
              <span
                style={{
                  flexShrink: 0,
                  width: "1.125em",
                  height: "1.125em",
                  borderRadius: multiSelect ? "var(--tf-radius-xs)" : "50%",
                  border: `0.125em solid ${isSelected ? "var(--tf-color-primary)" : "var(--tf-border-strong)"}`,
                  background: isSelected
                    ? "var(--tf-color-primary)"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {isSelected && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="var(--tf-text-inverse)"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </span>

              <span style={{ position: "relative", zIndex: 1, flex: 1 }}>
                {opt.text}
              </span>

              {hasVoted && showResults && (
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    fontFamily: "var(--tf-font-mono)",
                    fontSize: "var(--tf-text-xs)",
                    fontWeight: 600,
                    color: isSelected
                      ? "var(--tf-color-primary-light)"
                      : "var(--tf-text-muted)",
                  }}
                >
                  {percentage}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      {!hasVoted && (
        <button
          onClick={handleVote}
          disabled={selected.size === 0}
          style={{
            alignSelf: "flex-start",
            padding: "var(--tf-space-2) var(--tf-space-5)",
            borderRadius: "var(--tf-radius-full)",
            border: "none",
            background:
              selected.size > 0
                ? "var(--tf-color-primary)"
                : "var(--tf-bg-elevated)",
            color:
              selected.size > 0
                ? "var(--tf-text-inverse)"
                : "var(--tf-text-muted)",
            fontFamily: "var(--tf-font-body)",
            fontSize: "var(--tf-text-sm)",
            fontWeight: 600,
            cursor: selected.size > 0 ? "pointer" : "not-allowed",
            transition: "all var(--tf-transition-fast)",
          }}
        >
          Vote
        </button>
      )}

      {hasVoted && showResults && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--tf-text-xs)",
            color: "var(--tf-text-muted)",
          }}
        >
          {totalVotes} total votes
        </p>
      )}
    </div>
  );
}
