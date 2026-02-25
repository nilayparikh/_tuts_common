import React from "react";

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
  /** Current page path (for active link highlighting) */
  currentPath?: string;
}

const s: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: "var(--tf-header-height)",
    background: "rgba(9,9,11,0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--tf-border-subtle)",
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
    gap: "var(--tf-space-8)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "var(--tf-space-2)",
    textDecoration: "none",
    flexShrink: 0,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: "var(--tf-radius-md)",
    objectFit: "cover",
  },
  logoFallback: {
    width: 28,
    height: 28,
    borderRadius: "var(--tf-radius-md)",
    background:
      "linear-gradient(135deg, var(--tf-color-primary) 0%, var(--tf-color-accent) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
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
    flex: 1,
    listStyle: "none",
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
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "var(--tf-space-3)",
    marginLeft: "auto",
    flexShrink: 0,
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "var(--tf-radius-md)",
    background: "transparent",
    border: "1px solid var(--tf-border-default)",
    color: "var(--tf-text-secondary)",
    cursor: "pointer",
    textDecoration: "none",
    transition:
      "color var(--tf-transition-fast), border-color var(--tf-transition-fast)",
  },
};

export function TutorialHeader({
  siteName,
  logoUrl,
  navItems = [],
  githubUrl,
  youtubeUrl,
  currentPath = "/",
}: TutorialHeaderProps): React.ReactElement {
  const initial = siteName.charAt(0).toUpperCase();

  return (
    <header style={s.header}>
      <div style={s.inner}>
        {/* Brand */}
        <a href="/" style={s.brand}>
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} style={s.logo} />
          ) : (
            <span style={s.logoFallback}>{initial}</span>
          )}
          <span style={s.siteName}>{siteName}</span>
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

        {/* External actions */}
        <div style={s.actions}>
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={s.iconBtn}
              aria-label="YouTube channel"
              title="YouTube"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={s.iconBtn}
              aria-label="GitHub repository"
              title="GitHub"
            >
              <svg
                width="16"
                height="16"
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
