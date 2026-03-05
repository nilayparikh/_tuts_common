"use client";

/**
 * PresentationShell — full-page wrapper that provides:
 *   • Collapsible left-hand lesson navigation drawer (two-level: lessons + slides)
 *   • Slide footer with LocalM™ copyright
 *   • Prev / Next slide navigation buttons with N/total counter
 *   • 16:9 aspect ratio enforcement
 *   • Theme-aware styling via --tf-* CSS vars
 *
 * Wrap your Spectacle <Deck> inside <PresentationShell>.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";

/* ── Types ────────────────────────────────────────────────────────────── */

export interface DeckEntry {
  id: string;
  title: string;
  /** Short label like "01", "02" */
  number: string;
  /** Optional nested slides within the lesson for two-level nav */
  slides?: { id: string; title: string }[];
}

export interface PresentationConfig {
  /** Course title shown above the lesson list */
  courseTitle: string;
  /** Copyright holder (default: "LocalM™") */
  copyright?: string;
  /** All available decks for the drawer */
  decks: DeckEntry[];
  /** Currently active deck id */
  activeDeckId?: string;
  /** Callback when user selects a deck */
  onSelectDeck?: (id: string) => void;
  /** The Spectacle Deck element */
  children: React.ReactNode;
}

/* ── Styles ───────────────────────────────────────────────────────────── */

const CSS = `
  .pres-shell {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: #000;
    font-family: var(--tf-font-body, "Inter", system-ui, sans-serif);
    color: var(--tf-text-primary, #e2e6f0);
  }

  .pres-drawer-toggle {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1000;
    width: 36px;
    height: 36px;
    border-radius: var(--tf-radius-sm, 8px);
    background: rgba(25,28,35,0.85);
    backdrop-filter: blur(8px);
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-secondary, #bfc5d4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 150ms ease;
    font-size: 18px;
    line-height: 1;
    padding: 0;
  }
  .pres-drawer-toggle:hover {
    background: rgba(31,34,42,0.95);
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--tf-color-primary, #6366f1);
  }

  .pres-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
    background: #000;
  }

  .pres-deck-area {
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background: #000;
  }

  /* 16:9 aspect ratio container */
  .pres-aspect-wrapper {
    width: 100%;
    height: 100%;
    max-width: calc((100vh - 44px) * 16 / 9);
    max-height: calc(100vw * 9 / 16);
    position: relative;
    overflow: hidden;
  }

  /* Make Spectacle fill our container */
  .pres-aspect-wrapper > div {
    width: 100% !important;
    height: 100% !important;
  }

  .pres-footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 20px;
    height: 44px;
    background: var(--tf-bg-surface, #111318);
    border-top: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    font-size: 12px;
    gap: 16px;
    z-index: 10;
  }

  .pres-footer-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .pres-footer-logo {
    width: 84px;
    height: 18px;
    border-radius: 4px;
    object-fit: contain;
    display: block;
  }

  .pres-footer-copy {
    color: var(--tf-text-muted, #8892a8);
    white-space: nowrap;
  }

  .pres-footer-nav {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pres-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 28px;
    border-radius: var(--tf-radius-sm, 8px);
    background: var(--tf-bg-elevated, #191c23);
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-secondary, #bfc5d4);
    cursor: pointer;
    transition: all 150ms ease;
    font-size: 14px;
    padding: 0;
  }
  .pres-nav-btn:hover:not(:disabled) {
    background: var(--tf-bg-overlay, #1f222a);
    color: var(--tf-color-primary-light, #818cf8);
    border-color: var(--tf-color-primary-light, #818cf8);
  }
  .pres-nav-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .pres-slide-counter {
    color: var(--tf-text-muted, #8892a8);
    font-family: var(--tf-font-mono, monospace);
    font-size: 12px;
    min-width: 60px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  /* ── Drawer ──────────────────────────────────────────── */

  .pres-drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 900;
    opacity: 0;
    transition: opacity 200ms ease;
    pointer-events: none;
  }
  .pres-drawer-backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }

  .pres-drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 320px;
    background: var(--tf-bg-surface, #111318);
    border-right: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    z-index: 950;
    transform: translateX(-100%);
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .pres-drawer.open {
    transform: translateX(0);
  }

  .pres-drawer-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--tf-border-subtle, rgba(202,211,230,0.08));
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .pres-drawer-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--tf-text-primary, #e2e6f0);
    font-family: var(--tf-font-display, "Inter", sans-serif);
    letter-spacing: 0.02em;
  }

  .pres-drawer-close {
    width: 28px;
    height: 28px;
    border-radius: var(--tf-radius-sm, 8px);
    background: transparent;
    border: 1px solid transparent;
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    padding: 0;
    transition: all 150ms ease;
  }
  .pres-drawer-close:hover {
    background: var(--tf-bg-elevated, #191c23);
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--tf-border-default, rgba(202,211,230,0.14));
  }

  .pres-drawer-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }
  .pres-drawer-list::-webkit-scrollbar {
    width: 4px;
  }
  .pres-drawer-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .pres-drawer-list::-webkit-scrollbar-thumb {
    background: rgba(202,211,230,0.12);
    border-radius: 2px;
  }

  .pres-drawer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 20px;
    cursor: pointer;
    transition: all 150ms ease;
    text-decoration: none;
    border-left: 3px solid transparent;
  }
  .pres-drawer-item:hover {
    background: var(--tf-bg-elevated, #191c23);
  }
  .pres-drawer-item.active {
    background: rgba(99,102,241,0.08);
    border-left-color: var(--tf-color-primary, #6366f1);
  }

  .pres-drawer-number {
    font-family: var(--tf-font-mono, monospace);
    font-size: 12px;
    color: var(--tf-text-muted, #8892a8);
    min-width: 24px;
    font-weight: 600;
  }
  .pres-drawer-item.active .pres-drawer-number {
    color: var(--tf-color-primary-light, #818cf8);
  }

  .pres-drawer-label {
    font-size: 14px;
    color: var(--tf-text-secondary, #bfc5d4);
    font-weight: 500;
  }
  .pres-drawer-item.active .pres-drawer-label {
    color: var(--tf-text-primary, #e2e6f0);
    font-weight: 600;
  }

  /* Two-level drawer: sublist of slides */
  .pres-drawer-sublist {
    padding: 4px 0 8px 36px;
    display: flex;
    flex-direction: column;
  }

  .pres-drawer-subitem {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 12px;
    font-size: 13px;
    color: var(--tf-text-muted, #8892a8);
    text-decoration: none;
    border-radius: 6px;
    transition: all 150ms ease;
    cursor: pointer;
  }
  .pres-drawer-subitem:hover {
    color: var(--tf-text-secondary, #bfc5d4);
    background: var(--tf-bg-elevated, #191c23);
  }
  .pres-drawer-subitem .pres-sub-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--tf-color-primary, #6366f1);
    flex-shrink: 0;
    opacity: 0.6;
  }
  .pres-drawer-subitem:hover .pres-sub-dot {
    opacity: 1;
  }

  /* Fullscreen btn */
  .pres-fullscreen-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--tf-radius-sm, 8px);
    background: transparent;
    border: 1px solid var(--tf-border-default, rgba(202,211,230,0.14));
    color: var(--tf-text-muted, #8892a8);
    cursor: pointer;
    transition: all 150ms ease;
    padding: 0;
    margin-left: 4px;
  }
  .pres-fullscreen-btn:hover {
    color: var(--tf-text-primary, #e2e6f0);
    border-color: var(--tf-color-primary, #6366f1);
    background: var(--tf-bg-elevated, #191c23);
  }
`;

/* ── SVG Icons ────────────────────────────────────────────────────────── */

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M2 4.5h14M2 9h14M2 13.5h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M8.5 3L4.5 7l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M5.5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── PresentationShell ────────────────────────────────────────────────── */

export function PresentationShell({
  courseTitle,
  copyright = "LocalM\u2122",
  decks,
  activeDeckId,
  onSelectDeck,
  children,
}: PresentationConfig): React.ReactElement {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const shellRef = useRef<HTMLDivElement>(null);

  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  /* ── Slide tracking via MutationObserver + URL params ── */
  useEffect(() => {
    const updateFromUrl = () => {
      // Spectacle v10 uses URL search params: ?slideIndex=N&stepIndex=M
      const params = new URLSearchParams(window.location.search);
      const si = params.get("slideIndex");
      if (si !== null) setSlideIndex(parseInt(si, 10));

      // Fallback: also check hash (#/N) for older Spectacle versions
      if (si === null) {
        const hash = window.location.hash;
        const m = hash.match(/#\/(?:slide\/)?(\d+)/);
        if (m) setSlideIndex(parseInt(m[1], 10));
      }
    };

    const countSlides = () => {
      // Spectacle v10 uses class "spectacle-v7-slide"
      const slides = document.querySelectorAll(
        ".spectacle-v7-slide, [data-testid='html-slide'], .spectacle-slide",
      );
      if (slides.length > 0) setSlideCount(slides.length);
    };

    updateFromUrl();

    // Observe DOM for slide count (Spectacle renders lazily)
    const observer = new MutationObserver(() => {
      countSlides();
      updateFromUrl();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for URL changes (popstate covers back/forward, hashchange for hash nav)
    window.addEventListener("popstate", updateFromUrl);
    window.addEventListener("hashchange", updateFromUrl);

    // Poll URL periodically since Spectacle's replaceState doesn't fire popstate
    const urlPoll = setInterval(updateFromUrl, 300);

    const t1 = setTimeout(countSlides, 300);
    const t2 = setTimeout(countSlides, 800);
    const t3 = setTimeout(countSlides, 2000);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", updateFromUrl);
      window.removeEventListener("hashchange", updateFromUrl);
      clearInterval(urlPoll);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  /* ── Keyboard: Escape closes drawer ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  /* ── Slide navigation ── */
  const goTo = useCallback(
    (direction: "prev" | "next") => {
      // Spectacle v10: update URL search param slideIndex directly
      const params = new URLSearchParams(window.location.search);
      const current = parseInt(params.get("slideIndex") ?? "0", 10);
      const next =
        direction === "next"
          ? Math.min(current + 1, Math.max(slideCount - 1, 0))
          : Math.max(current - 1, 0);

      if (next === current) return;

      params.set("slideIndex", String(next));
      params.set("stepIndex", "0");
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
      window.dispatchEvent(new PopStateEvent("popstate"));
      setSlideIndex(next);

      // Fallback: also dispatch keyboard event for non-URL-param Spectacle versions
      const key = direction === "prev" ? "ArrowLeft" : "ArrowRight";
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );
    },
    [slideCount],
  );

  /* ── Fullscreen ── */
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      shellRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const year = new Date().getFullYear();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="pres-shell" ref={shellRef}>
        {/* Drawer toggle */}
        <button
          className="pres-drawer-toggle"
          onClick={toggleDrawer}
          aria-label="Toggle lesson navigation"
        >
          <MenuIcon />
        </button>

        {/* Backdrop */}
        <div
          className={`pres-drawer-backdrop ${drawerOpen ? "open" : ""}`}
          onClick={closeDrawer}
        />

        {/* Drawer — two-level */}
        <nav className={`pres-drawer ${drawerOpen ? "open" : ""}`}>
          <div className="pres-drawer-header">
            <span className="pres-drawer-title">{courseTitle}</span>
            <button
              className="pres-drawer-close"
              onClick={closeDrawer}
              aria-label="Close navigation"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="pres-drawer-list">
            {decks.map((deck) => {
              const isActive = deck.id === activeDeckId;
              return (
                <React.Fragment key={deck.id}>
                  <a
                    className={`pres-drawer-item ${isActive ? "active" : ""}`}
                    href={`?deck=${deck.id}`}
                    onClick={(e) => {
                      if (onSelectDeck) {
                        e.preventDefault();
                        onSelectDeck(deck.id);
                        if (!isActive) closeDrawer();
                      }
                    }}
                  >
                    <span className="pres-drawer-number">{deck.number}</span>
                    <span className="pres-drawer-label">{deck.title}</span>
                  </a>
                  {isActive && deck.slides && deck.slides.length > 0 && (
                    <div className="pres-drawer-sublist">
                      {deck.slides.map((slide, idx) => (
                        <a
                          key={slide.id}
                          className="pres-drawer-subitem"
                          href={`?deck=${deck.id}&slideIndex=${idx}&stepIndex=0`}
                          onClick={() => closeDrawer()}
                        >
                          <span className="pres-sub-dot" />
                          <span>{slide.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </nav>

        {/* Main content */}
        <div className="pres-main">
          <div className="pres-deck-area">
            <div className="pres-aspect-wrapper">{children}</div>
          </div>

          {/* Footer */}
          <div className="pres-footer">
            <div className="pres-footer-brand">
              <img
                className="pres-footer-logo"
                src="/brand/og-image-template-1200x630.png"
                alt="LocalM"
              />
              <span className="pres-footer-copy">
                &copy; {year} {copyright}. All rights reserved.
              </span>
            </div>

            <div className="pres-footer-nav">
              <button
                className="pres-nav-btn"
                onClick={() => goTo("prev")}
                disabled={slideIndex <= 0}
                aria-label="Previous slide"
              >
                <ChevronLeft />
              </button>
              <span className="pres-slide-counter">
                {slideCount > 0
                  ? `${slideIndex + 1} / ${slideCount}`
                  : "\u2026"}
              </span>
              <button
                className="pres-nav-btn"
                onClick={() => goTo("next")}
                disabled={slideCount > 0 && slideIndex >= slideCount - 1}
                aria-label="Next slide"
              >
                <ChevronRight />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                className="pres-fullscreen-btn"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen"
              >
                <FullscreenIcon />
              </button>
              <a
                href="https://github.com/nilayparikh"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--tf-text-muted)",
                  display: "flex",
                  padding: "4px",
                }}
                aria-label="GitHub"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@ergosumxlabs"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--tf-text-muted)",
                  display: "flex",
                  padding: "4px",
                }}
                aria-label="YouTube"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
