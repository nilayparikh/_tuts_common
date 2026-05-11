"use client";
import React, { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TranscriptEntry {
  /** Timestamp in seconds (e.g. 65 = 1:05) */
  time: number;
  /** Speaker name (optional — omit for single-speaker) */
  speaker?: string;
  /** Transcript text */
  text: string;
}

export interface VideoTranscriptProps {
  /** Ordered transcript entries */
  entries: TranscriptEntry[];
  /** Section title (default: "Transcript") */
  title?: string;
  /** Start collapsed (default: true) */
  defaultCollapsed?: boolean;
  /** Optional callback when user clicks a timestamp */
  onTimestampClick?: (timeSeconds: number) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * VideoTranscript — a collapsible, searchable transcript block.
 *
 * Displays timestamped speaker entries with a filter input.
 * Timestamps are clickable when `onTimestampClick` is provided.
 */
export function VideoTranscript({
  entries,
  title = "Transcript",
  defaultCollapsed = true,
  onTimestampClick,
}: VideoTranscriptProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const [filter, setFilter] = useState("");

  const lowerFilter = filter.toLowerCase();
  const filtered =
    filter.length > 0
      ? entries.filter(
          (entry) =>
            entry.text.toLowerCase().includes(lowerFilter) ||
            (entry.speaker &&
              entry.speaker.toLowerCase().includes(lowerFilter)),
        )
      : entries;

  return (
    <details
      open={isOpen}
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
      style={{
        borderRadius: "var(--tf-radius-md)",
        border: "1px solid var(--tf-border-subtle)",
        background: "var(--tf-bg-surface)",
        overflow: "hidden",
      }}
    >
      <summary
        aria-expanded={isOpen}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "var(--tf-space-4) var(--tf-space-5)",
          background: "var(--tf-bg-elevated)",
          border: "none",
          borderBottom: isOpen ? "1px solid var(--tf-border-subtle)" : "none",
          listStyle: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: "pointer",
          color: "var(--tf-text-primary)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tf-space-3)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              color: "var(--tf-color-secondary-light)",
              flexShrink: 0,
            }}
          >
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-6-4h8v2h-8v-2z" />
          </svg>
          <span
            style={{
              fontFamily: "var(--tf-font-display)",
              fontWeight: 600,
              fontSize: "var(--tf-text-sm)",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: "var(--tf-font-mono)",
              fontSize: "var(--tf-text-xs)",
              color: "var(--tf-text-muted)",
            }}
          >
            {entries.length} entries
          </span>
        </span>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            color: "var(--tf-text-muted)",
            transition: "transform var(--tf-transition-fast)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </summary>

      <div>
        <div
          style={{
            padding: "var(--tf-space-3) var(--tf-space-5)",
            borderBottom: "1px solid var(--tf-border-subtle)",
          }}
        >
          <input
            type="text"
            placeholder="Search transcript…"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            style={{
              width: "100%",
              padding: "var(--tf-space-2) var(--tf-space-3)",
              borderRadius: "var(--tf-radius-sm)",
              border: "1px solid var(--tf-border-default)",
              background: "var(--tf-bg-elevated)",
              color: "var(--tf-text-primary)",
              fontFamily: "var(--tf-font-body)",
              fontSize: "var(--tf-text-sm)",
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            maxHeight: "24rem",
            overflowY: "auto",
            padding: "var(--tf-space-3) var(--tf-space-5)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--tf-space-3)",
          }}
        >
          {filtered.length === 0 ? (
            <p
              style={{
                fontSize: "var(--tf-text-sm)",
                color: "var(--tf-text-muted)",
                textAlign: "center",
                padding: "var(--tf-space-4) 0",
              }}
            >
              No matches found.
            </p>
          ) : (
            filtered.map((entry, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "var(--tf-space-3)",
                  alignItems: "flex-start",
                }}
              >
                <button
                  onClick={() => onTimestampClick?.(entry.time)}
                  disabled={!onTimestampClick}
                  style={{
                    flexShrink: 0,
                    fontFamily: "var(--tf-font-mono)",
                    fontSize: "var(--tf-text-xs)",
                    fontWeight: 600,
                    color: onTimestampClick
                      ? "var(--tf-color-primary-light)"
                      : "var(--tf-text-muted)",
                    background: "var(--tf-bg-overlay)",
                    border: "none",
                    padding: "0.125rem var(--tf-space-2)",
                    borderRadius: "var(--tf-radius-xs)",
                    cursor: onTimestampClick ? "pointer" : "default",
                    minWidth: "3rem",
                    textAlign: "center",
                  }}
                  aria-label={`Jump to ${formatTime(entry.time)}`}
                >
                  {formatTime(entry.time)}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {entry.speaker && (
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "var(--tf-text-xs)",
                        color: "var(--tf-color-secondary-light)",
                        marginRight: "var(--tf-space-2)",
                      }}
                    >
                      {entry.speaker}:
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "var(--tf-text-sm)",
                      color: "var(--tf-text-secondary)",
                      lineHeight: "var(--tf-leading-relaxed)",
                    }}
                  >
                    {entry.text}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </details>
  );
}
