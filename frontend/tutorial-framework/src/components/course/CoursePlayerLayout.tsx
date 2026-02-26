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
  /** Width of sidebar in px (default 260) */
  sidebarWidth?: number;
  /** Whether to show footer (default true) */
  showFooter?: boolean;
}

export function CoursePlayerLayout({
  header,
  footer,
  sidebar,
  children,
  sidebarWidth = 260,
  showFooter = true,
}: CoursePlayerLayoutProps): React.ReactElement {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--tf-bg-base)",
        color: "var(--tf-text-primary)",
        fontFamily: "var(--tf-font-body)",
      }}
    >
      {/* Sticky header */}
      <TutorialHeader {...header} />

      {/* Body: sidebar + main */}
      <div
        className="tf-course-player-body"
        style={{
          flex: 1,
          display: "flex",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Sticky sidebar */}
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
          }}
        >
          <CourseSidebar {...sidebar} />
        </aside>

        {/* Main content — scrolls with the page */}
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

      {showFooter && <TutorialFooter {...footer} />}
    </div>
  );
}
