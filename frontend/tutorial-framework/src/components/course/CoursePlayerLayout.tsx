import React from "react";
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
}

/**
 * Course Player Layout — 2-column (sidebar + main), centered with gutters.
 *
 * Architecture:
 *   flex-col wrapper (100vh)
 *   ├── TutorialHeader   — full viewport width, sticky
 *   ├── .tf-course-player-body  — flex row, centered via max-width + margin auto
 *   │   ├── aside (sticky sidebar, fixed width, own scroll)
 *   │   └── main  (flex:1, scrolls with page)
 *   └── TutorialFooter   — full viewport width
 *
 * The body has flex:1 so that the footer is always pushed to the bottom when
 * content is shorter than the viewport.
 */
export function CoursePlayerLayout({
  header,
  footer,
  sidebar,
  children,
  sidebarWidth = 384,
  showFooter = true,
}: CoursePlayerLayoutProps): React.ReactElement {
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
      {/* ── Header — full viewport width, sticky ────────────────────── */}
      <TutorialHeader {...header} />

      {/* ── Body — centered 2-col with max-width ────────────────────── */}
      <div
        className="tf-course-player-body"
        style={{
          flex: 1,
          display: "flex",
          width: "100%",
          maxWidth: "var(--tf-course-max-width)",
          margin: "0 auto",
        }}
      >
        {/* Sidebar — sticky to viewport, scrolls independently */}
        <aside
          className="tf-course-player-sidebar"
          style={{
            width: sidebarWidth,
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
          }}
        >
          <CourseSidebar {...sidebar} />
        </aside>

        {/* Main content — fills remaining width */}
        <main
          className="tf-course-player-main"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "var(--tf-space-10) var(--tf-space-8)",
          }}
        >
          {children}
        </main>
      </div>

      {/* ── Footer — full viewport width ────────────────────────────── */}
      {showFooter && <TutorialFooter {...footer} />}
    </div>
  );
}
