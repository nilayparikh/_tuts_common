import React from "react";
import { TutorialHeader, type TutorialHeaderProps } from "./TutorialHeader";
import { TutorialFooter, type TutorialFooterProps } from "./TutorialFooter";

export interface TutorialLayoutProps {
  /** Props forwarded to TutorialHeader */
  header: TutorialHeaderProps;
  /** Props forwarded to TutorialFooter */
  footer: TutorialFooterProps;
  /** Page content */
  children: React.ReactNode;
  /** Optionally constrain content width (default: full) */
  maxWidth?: "content" | "narrow" | "full";
  /** Extra style on the main element */
  mainStyle?: React.CSSProperties;
}

const widthMap = {
  content: "var(--tf-content-width)",
  narrow: "var(--tf-narrow-width)",
  full: "100%",
};

export function TutorialLayout({
  header,
  footer,
  children,
  maxWidth = "content",
  mainStyle,
}: TutorialLayoutProps): React.ReactElement {
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
      <TutorialHeader {...header} />

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: widthMap[maxWidth],
          margin: maxWidth !== "full" ? "0 auto" : undefined,
          padding: maxWidth !== "full" ? "0 var(--tf-space-6)" : undefined,
          ...mainStyle,
        }}
      >
        {children}
      </main>

      <TutorialFooter {...footer} />
    </div>
  );
}

// ─── Sidebar layout (optional 2-column with sticky nav) ───────────────────

export interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function SidebarLayout({
  sidebar,
  children,
}: SidebarLayoutProps): React.ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "var(--tf-sidebar-width) 1fr",
        gap: "var(--tf-space-12)",
        maxWidth: "var(--tf-content-width)",
        margin: "0 auto",
        padding: "var(--tf-space-8) var(--tf-space-6)",
        alignItems: "start",
      }}
    >
      <aside
        style={{
          position: "sticky",
          top: "calc(var(--tf-header-height) + var(--tf-space-6))",
        }}
      >
        {sidebar}
      </aside>
      <div>{children}</div>
    </div>
  );
}
