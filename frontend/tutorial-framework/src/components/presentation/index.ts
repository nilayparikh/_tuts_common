/**
 * Presentation — Spectacle-based slide components for LocalM tutorials.
 *
 * These components wrap the Spectacle presentation framework with the
 * tutorial-framework design system (MD3 dark palette, --tf-* CSS vars).
 *
 * Spectacle is a **peer dependency** — install it only in projects
 * that use these presentation components.
 *
 * Usage:
 *   import { PresentationShell, DarkSlide, ContentSlide, ... } from "@localm/tutorial-framework";
 */

// Shell & navigation
export {
  PresentationShell,
  type PresentationConfig,
  type DeckEntry,
} from "./PresentationShell";
export { SlideDrawer } from "./SlideDrawer";
export { SlideFooter } from "./SlideFooter";
export { SlideNavButtons } from "./SlideNavButtons";

// Base slide wrappers
export {
  DarkSlide,
  SurfaceSlide,
  TitleSlide,
  SectionDivider as SlideSectionDivider,
  ContentSlide,
  DiagramSlide,
  type SlideBaseProps,
} from "./SlideBase";

// Content components
export {
  BulletList,
  InfoCard,
  ComparisonTable,
  SlideCodeBlock,
  GradientDivider,
  StatRow,
  MathBlock,
  MermaidDiagram,
  type BulletItem,
} from "./SlideContent";

// Diagram components
export {
  DiagramBox,
  FlowNode,
  Arrow,
  TwoColumn,
  Timeline,
} from "./SlideDiagram";
