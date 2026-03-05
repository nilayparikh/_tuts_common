"use client";
import React from "react";
import { ThemeSelector } from "./ThemeSelector";

export interface NavItem {
  label: string;
  href: string;
}

export interface TutorialHeaderProps {
  /** Site or series name shown on the left */
  siteName: string;
  /** Optional logo URL */
  logoUrl?: string;
  /** Navigation links */
  navItems?: NavItem[];
  /** GitHub repository URL */
  githubUrl?: string;
  /** YouTube channel / playlist URL */
  youtubeUrl?: string;
  /** X / Twitter profile URL */
  twitterUrl?: string;
  /** LinkedIn profile URL */
  linkedinUrl?: string;
  /** Current page path (for active link highlighting) */
  currentPath?: string;
}

const s: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: "var(--tf-header-height)",
    background:
      "var(--tf-glass-bg, color-mix(in srgb, var(--tf-bg-base) 85%, transparent))",
    backdropFilter: "blur(var(--tf-glass-blur, 12px))",
    WebkitBackdropFilter: "blur(var(--tf-glass-blur, 12px))",
    borderBottom: "1px solid var(--tf-glass-border, var(--tf-border-subtle))",
    display: "flex",
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: "var(--tf-content-width)",
    margin: "0 auto",
    padding: "0 var(--tf-space-6)",
    display: "flex",
    alignItems: "center",
    gap: "var(--tf-space-6)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "var(--tf-space-1)",
    textDecoration: "none",
    flexShrink: 0,
  },
  logoMark: {
    width: 24,
    height: 24,
    borderRadius: "var(--tf-radius-md)",
    background:
      "linear-gradient(135deg, var(--tf-color-primary) 0%, var(--tf-color-accent) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--tf-text-xs)",
    fontWeight: 700,
    color: "var(--tf-text-inverse)",
    fontFamily: "var(--tf-font-mono)",
  },
  siteName: {
    fontFamily: "var(--tf-font-display)",
    fontWeight: 700,
    fontSize: "var(--tf-text-md)",
    color: "var(--tf-text-primary)",
    letterSpacing: "var(--tf-tracking-tight)",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "var(--tf-space-1)",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  navLink: {
    padding: "0.35em 0.75em",
    borderRadius: "var(--tf-radius-md)",
    fontFamily: "var(--tf-font-display)",
    fontWeight: 500,
    fontSize: "var(--tf-text-sm)",
    color: "var(--tf-text-secondary)",
    textDecoration: "none",
    transition:
      "color var(--tf-transition-fast), background var(--tf-transition-fast)",
  },
  navLinkActive: {
    color: "var(--tf-color-primary-light)",
    background: "var(--tf-color-primary-bg)",
  },
  spacer: {
    flex: 1,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "var(--tf-space-2)",
    flexShrink: 0,
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: "var(--tf-radius-md)",
    background: "transparent",
    border: "1px solid var(--tf-border-default)",
    color: "var(--tf-text-muted)",
    cursor: "pointer",
    textDecoration: "none",
    transition:
      "color var(--tf-transition-fast), border-color var(--tf-transition-fast), background var(--tf-transition-fast)",
  },
  followBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.3rem 0.7rem",
    borderRadius: "var(--tf-radius-full, 9999px)",
    background: "transparent",
    border: "1px solid var(--tf-border-default)",
    color: "var(--tf-text-muted)",
    fontSize: "var(--tf-text-xs)",
    fontFamily: "var(--tf-font-display)",
    fontWeight: 500,
    textDecoration: "none",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    transition:
      "color var(--tf-transition-fast), border-color var(--tf-transition-fast), background var(--tf-transition-fast)",
  },
};

export function TutorialHeader({
  siteName,
  logoUrl,
  navItems = [],
  githubUrl,
  youtubeUrl,
  twitterUrl,
  linkedinUrl,
  currentPath = "/",
}: TutorialHeaderProps): React.ReactElement {
  const initial = siteName.charAt(0).toUpperCase();

  return (
    <header style={s.header}>
      <div style={s.inner}>
        {/* Brand */}
        <a href="/" style={s.brand}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              style={{
                width: 156,
                height: 35,
                borderRadius: 0,
                objectFit: "contain",
              }}
            />
          ) : (
            <span style={s.logoMark}>{initial}</span>
          )}
          {!logoUrl && <span style={s.siteName}>{siteName}</span>}
        </a>

        {/* Nav */}
        {navItems.length > 0 && (
          <nav aria-label="Main navigation">
            <ul style={s.nav}>
              {navItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      style={{
                        ...s.navLink,
                        ...(isActive ? s.navLinkActive : {}),
                      }}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Spacer */}
        <div style={s.spacer} />

        {/* Actions */}
        <div style={s.actions}>
          {/* Follow pill buttons */}
          {twitterUrl && (
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={s.followBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--tf-text-primary)";
                e.currentTarget.style.borderColor = "var(--tf-border-strong)";
                e.currentTarget.style.background = "var(--tf-bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--tf-text-muted)";
                e.currentTarget.style.borderColor = "var(--tf-border-default)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Follow
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={s.followBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--tf-text-primary)";
                e.currentTarget.style.borderColor = "var(--tf-border-strong)";
                e.currentTarget.style.background = "var(--tf-bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--tf-text-muted)";
                e.currentTarget.style.borderColor = "var(--tf-border-default)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Follow
            </a>
          )}
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={s.followBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--tf-text-primary)";
                e.currentTarget.style.borderColor = "var(--tf-border-strong)";
                e.currentTarget.style.background = "var(--tf-bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--tf-text-muted)";
                e.currentTarget.style.borderColor = "var(--tf-border-default)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Subscribe
            </a>
          )}

          {/* Separator */}
          <span
            style={{
              width: 1,
              height: 18,
              background: "var(--tf-border-subtle)",
              flexShrink: 0,
            }}
          />

          {/* Theme selector */}
          <ThemeSelector />

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={s.iconBtn}
              aria-label="GitHub repository"
              title="GitHub"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--tf-text-primary)";
                e.currentTarget.style.borderColor = "var(--tf-border-strong)";
                e.currentTarget.style.background = "var(--tf-bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--tf-text-muted)";
                e.currentTarget.style.borderColor = "var(--tf-border-default)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
