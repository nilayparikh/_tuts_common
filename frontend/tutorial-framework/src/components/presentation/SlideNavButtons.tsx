/**
 * SlideNavButtons — prev/next slide navigation + slide counter.
 * (Used internally by PresentationShell; exposed for advanced layouts.)
 */

import React from "react";

export interface SlideNavButtonsProps {
  slideIndex: number;
  slideCount: number;
  onPrev: () => void;
  onNext: () => void;
}

export function SlideNavButtons({
  slideIndex,
  slideCount,
  onPrev,
  onNext,
}: SlideNavButtonsProps): React.ReactElement {
  return (
    <div className="pres-footer-nav">
      <button
        className="pres-nav-btn"
        onClick={onPrev}
        disabled={slideIndex <= 0}
        aria-label="Previous slide"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M8.5 3L4.5 7l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className="pres-slide-counter">
        {slideCount > 0 ? `${slideIndex + 1} / ${slideCount}` : ""}
      </span>
      <button
        className="pres-nav-btn"
        onClick={onNext}
        disabled={slideCount > 0 && slideIndex >= slideCount - 1}
        aria-label="Next slide"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5.5 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
