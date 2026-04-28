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
export {
  PresentationLayout,
  PresentationControlPanel,
  ShortsLayout,
  ShortsFeedLayout,
  usePresentationStep,
  isShortDeck,
  supportsShortsCapture,
  isFeedCapable,
  type DeckType,
  type PresentationDeck,
  type PresentationSlide,
  type PresentationStep,
  type PresentationBranding,
} from "./PresentationControlEngine";
export type {
  TranscriptLanguageCode,
  TranscriptLanguageMap,
} from "./transcript-utils";
export { SlideDrawer } from "./SlideDrawer";
export { SlideFooter } from "./SlideFooter";
export { SlideNavButtons } from "./SlideNavButtons";
export {
  ShortsTitleStack,
  type ShortsTitleStackProps,
} from "./ShortsTitleStack";
export { ShortsOutroCTA, type ShortsOutroCTAProps } from "./ShortsOutroCTA";

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
  PracticalNoteCallout,
  ComparisonTable,
  SlideCodeBlock,
  GradientDivider,
  StatRow,
  MathBlock,
  MermaidDiagram,
  type BulletItem,
} from "./SlideContent";
export {
  StepSequenceWidget,
  type StepActor,
  type StepSequenceItem,
} from "./StepSequenceWidget";
export {
  FlowDiagramWidget,
  type FlowNode as FlowDiagramNodeConfig,
  type FlowEdge,
  type FlowStep,
} from "./FlowDiagramWidget";
export {
  AnimatedMermaidWidget,
  type AnimatedMermaidStep,
  type AnimatedMermaidEdge,
} from "./AnimatedMermaidWidget";
export {
  AnimatedSvgFocusWidget,
  type AnimatedSvgFocusStep,
} from "./AnimatedSvgFocusWidget";
export { HandsOnLabBridge, type HandsOnLabFocusArea } from "./HandsOnLabBridge";
export {
  MechanismSnapshotCard,
  type MechanismSnapshotCardProps,
} from "./MechanismSnapshotCard";
export { ProcessStagesWidget, type ProcessStage } from "./ProcessStagesWidget";
export {
  ColorLegend,
  ComparisonPipeline,
  PillarGrid,
  type ColorLegendItem,
  type ColorLegendProps,
  type PipelineNode,
  type PipelineStep,
  type PipelineCompareRow,
  type ComparisonPipelineProps,
  type PillarData,
  type PillarGridProps,
} from "./ComparisonWidgets";
export {
  CourseRoadmapRecap,
  type CourseRoadmapLesson,
  type CourseRoadmapRecapProps,
  type CourseRoadmapRecapStep,
} from "./CourseRoadmapRecap";

// Teleprompter
export {
  TeleprompterOverlay,
  type TeleprompterOverlayProps,
} from "./TeleprompterOverlay";

// Diagram components
export {
  DiagramBox,
  FlowNode,
  Arrow,
  TwoColumn,
  Timeline,
} from "./SlideDiagram";
