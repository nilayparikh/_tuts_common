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
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Fixed-width sidebar */}
        <div
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
        </div>

        {/* Scrollable main content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--tf-space-10) var(--tf-space-8)",
            maxWidth: "var(--tf-content-width)",
          }}
        >
          {children}
        </main>
      </div>

      {showFooter && <TutorialFooter {...footer} />}
    </div>
  );
}
