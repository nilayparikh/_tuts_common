/**
 * SlideDrawer — standalone export for the lesson navigation drawer.
 * (Used internally by PresentationShell; exposed for advanced layouts.)
 */

import React from "react";
import type { DeckEntry } from "./PresentationShell";

export interface SlideDrawerProps {
  courseTitle: string;
  decks: DeckEntry[];
  activeDeckId?: string;
  open: boolean;
  onClose: () => void;
  onSelectDeck?: (id: string) => void;
}

export function SlideDrawer({
  courseTitle,
  decks,
  activeDeckId,
  open,
  onClose,
  onSelectDeck,
}: SlideDrawerProps): React.ReactElement {
  return (
    <>
      <div
        className={`pres-drawer-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
      />
      <nav className={`pres-drawer ${open ? "open" : ""}`}>
        <div className="pres-drawer-header">
          <span className="pres-drawer-title">{courseTitle}</span>
          <button
            className="pres-drawer-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
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
                      if (!isActive) onClose();
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
                        href={`?deck=${deck.id}#/${idx + 1}`}
                        onClick={() => onClose()}
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
    </>
  );
}
