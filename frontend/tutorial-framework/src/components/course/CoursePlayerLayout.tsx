"use client";
import React, { useState } from "react";
import {
  TutorialHeader,
  type TutorialHeaderProps,
} from "../layout/TutorialHeader";
import {
  TutorialFooter,
  type TutorialFooterProps,
} from "../layout/TutorialFooter";
import { CourseSidebar, type CourseSidebarProps } from "./CourseSidebar";

export interface CoursePlayerLayoutProps {
  /** Props forwarded to TutorialHeader */
  header: TutorialHeaderProps;
  /** Props forwarded to TutorialFooter */
  footer: TutorialFooterProps;
  /** Props for the course sidebar */
  sidebar: CourseSidebarProps;
  /** Main lesson content */
  children: React.ReactNode;
  /** Width of sidebar in px (default 384) */
  sidebarWidth?: number;
  /** Whether to show footer (default true) */
  showFooter?: boolean;
  /** Whether sidebar starts collapsed (default false) */
  defaultCollapsed?: boolean;
}

// ─── Internal: collapsed mini-nav strip ─────────────────────────────────────

function CollapsedMiniNav({
  parts,
  basePath,
  currentSlug,
  onExpand,
}: {
  parts: CourseSidebarProps["parts"];
  basePath: string;
  currentSlug: string;
  onExpand: () => void;
}): React.ReactElement {
  return (
    <nav
      aria-label="Quick lesson navigation"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 48,
        paddingTop: "var(--tf-space-3)",
        paddingBottom: "var(--tf-space-3)",
        gap: "var(--tf-space-1)",
        height: "100%",
      }}
    >
      {/* Expand button */}
      <button
        type="button"
        onClick={onExpand}
        aria-label="Expand sidebar"
        title="Expand sidebar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "var(--tf-radius-full)",
          border: "1px solid var(--tf-border-default)",
          background: "var(--tf-bg-elevated)",
          color: "var(--tf-text-muted)",
          cursor: "pointer",
          flexShrink: 0,
          marginBottom: "var(--tf-space-2)",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--tf-bg-surface)";
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--tf-text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--tf-bg-elevated)";
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--tf-text-muted)";
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Divider */}
      <div
        style={{
          width: 20,
          height: 1,
          background: "var(--tf-border-subtle)",
          flexShrink: 0,
          marginBottom: "var(--tf-space-2)",
        }}
      />

      {/* Numbered lesson circles */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--tf-space-1)",
          overflowY: "auto",
          flex: 1,
          paddingBottom: "var(--tf-space-2)",
        }}
      >
        {parts.map((part, i) => {
          const isCurrent = part.slug === currentSlug;
          return (
            <a
              key={part.slug}
              href={`${basePath}/${part.slug}/`}
              title={`${i + 1}. ${part.title}`}
              aria-label={`Lesson ${i + 1}: ${part.title}`}
              aria-current={isCurrent ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "var(--tf-radius-full)",
                fontSize: "var(--tf-text-xs)",
                fontWeight: 700,
                fontFamily: "var(--tf-font-mono)",
                textDecoration: "none",
                flexShrink: 0,
                transition: "all 0.15s",
                background: isCurrent
                  ? "var(--tf-color-primary-container)"
                  : "transparent",
                color: isCurrent
                  ? "var(--tf-color-primary-light)"
                  : "var(--tf-text-muted)",
                border: isCurrent
                  ? "2px solid var(--tf-color-primary)"
                  : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "var(--tf-bg-elevated)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--tf-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--tf-text-muted)";
                }
              }}
            >
              {i + 1}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Course Player Layout — 2-column (collapsible sidebar + main).
 *
 * Architecture:
 *   flex-col wrapper (100vh)
 *   ├── TutorialHeader   — full viewport width, sticky
 *   ├── .tf-course-player-body  — flex row
 *   │   ├── aside (sticky sidebar, collapsible, own scroll)
 *   │   │   └── toggle button (absolute, edge-anchored)
 *   │   └── main  (flex:1, scrolls with page)
 *   └── TutorialFooter   — full viewport width
 */
export function CoursePlayerLayout({
  header,
  footer,
  sidebar,
  children,
  sidebarWidth = 384,
  showFooter = true,
  defaultCollapsed = false,
}: CoursePlayerLayoutProps): React.ReactElement {
  const COLLAPSED_WIDTH = 48;
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const currentWidth = collapsed ? COLLAPSED_WIDTH : sidebarWidth;

  return (
    <div
      className="tf-course-player-wrap"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--tf-bg-base)",
        color: "var(--tf-text-primary)",
        fontFamily: "var(--tf-font-body)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <TutorialHeader {...header} />

      {/* ── Body ────────────────────────────────────────────────── */}
      <div
        className="tf-course-player-body"
        style={{
          flex: 1,
          display: "flex",
          width: "100%",
          maxWidth: "var(--tf-course-max-width)",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* ── Sidebar (collapsible → mini numbered nav) ─────────── */}
        <aside
          className="tf-course-player-sidebar"
          style={{
            width: currentWidth,
            flexShrink: 0,
            position: "sticky",
            top: "var(--tf-header-height)",
            height: "calc(100vh - var(--tf-header-height))",
            overflowY: "auto",
            overflowX: "hidden",
            borderRight: "1px solid var(--tf-border-subtle)",
            background: "var(--tf-glass-bg, var(--tf-bg-surface))",
            backdropFilter: "blur(var(--tf-glass-blur, 0px))",
            WebkitBackdropFilter: "blur(var(--tf-glass-blur, 0px))",
            transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {collapsed ? (
            <CollapsedMiniNav
              parts={sidebar.parts}
              basePath={sidebar.basePath}
              currentSlug={sidebar.currentSlug}
              onExpand={() => setCollapsed(false)}
            />
          ) : (
            <div
              style={{
                width: sidebarWidth,
                transition: "opacity 0.2s ease",
              }}
            >
              <CourseSidebar {...sidebar} />
            </div>
          )}
        </aside>

        {/* ── Collapse toggle (only when sidebar is expanded) ───── */}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            style={{
              position: "sticky",
              top: "calc(var(--tf-header-height) + var(--tf-space-4))",
              alignSelf: "flex-start",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              marginLeft: "-16px",
              borderRadius: "var(--tf-radius-full)",
              border: "1px solid var(--tf-border-default)",
              background: "var(--tf-bg-elevated)",
              color: "var(--tf-text-secondary)",
              cursor: "pointer",
              boxShadow: "var(--tf-shadow-sm)",
              transition: "background 0.15s, color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--tf-bg-surface)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--tf-text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--tf-bg-elevated)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--tf-text-secondary)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* ── Main content ───────────────────────────────────────── */}
        <main
          className="tf-course-player-main"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "var(--tf-space-6) var(--tf-space-8)",
          }}
        >
          {children}
        </main>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      {showFooter && <TutorialFooter {...footer} />}
    </div>
  );
}
