/**
 * @localm/tutorial-framework
 *
 * Shared React component library for LocalM tutorial static websites.
 *
 * Usage:
 *   import { TutorialLayout, HeroSection, CodeBlock } from '@localm/tutorial-framework';
 *   import { TutorialGlobalStyles } from '@localm/tutorial-framework';
 *
 * Add <TutorialGlobalStyles /> once in your root layout, then use any component.
 */

// Theme
export {
  palette,
  tokens,
  tokensToCSS,
  TutorialGlobalStyles,
  ThemeProvider,
  useTheme,
  THEMES,
} from "./theme";
export type { Palette, Tokens, ThemeDef, ThemeColors } from "./theme";

// Layout
export {
  TutorialHeader,
  TutorialFooter,
  TutorialLayout,
  SidebarLayout,
  ThemeSelector,
} from "./components/layout";
export type {
  TutorialHeaderProps,
  NavItem,
  TutorialFooterProps,
  FooterLink,
  TutorialLayoutProps,
  SidebarLayoutProps,
} from "./components/layout";

// Content
export {
  HeroSection,
  ConceptCard,
  ConceptGrid,
  StepCard,
  StepList,
  CodeBlock,
  TutorialNav,
  KeyPoint,
  SectionDivider,
  SectionHeading,
  CalloutBox,
  InfoBox,
  NoteBox,
  TipBox,
  SuccessBox,
  WarningBox,
  DangerBox,
  MermaidDiagram,
  DescriptionBox,
  PollBlock,
  StepByStepGuide,
  Paragraph,
} from "./components/content";
export type {
  HeroSectionProps,
  ConceptCardProps,
  ConceptCardVariant,
  ConceptGridProps,
  StepCardProps,
  StepListProps,
  CodeBlockProps,
  TutorialNavProps,
  KeyPointProps,
  KeyPointVariant,
  SectionDividerProps,
  SectionHeadingProps,
  CalloutBoxProps,
  CalloutVariant,
  MermaidDiagramProps,
  DescriptionBoxProps,
  PollBlockProps,
  PollOption,
  StepByStepGuideProps,
  StepGuideStep,
  ParagraphProps,
} from "./components/content";

// Content — extended
export {
  LabSettings,
  CodePreview,
  VideoTranscript,
  AccordionList,
} from "./components/content";
export type {
  LabSettingsProps,
  LabRequirement,
  CodePreviewProps,
  CodePreviewSegment,
  VideoTranscriptProps,
  TranscriptEntry,
  AccordionListProps,
  AccordionItem,
} from "./components/content";

// Embeds
export {
  YouTubeEmbed,
  GitHubGistEmbed,
  TwitterEmbed,
  LinkedInEmbed,
} from "./components/embeds";
export type {
  YouTubeEmbedProps,
  GitHubGistEmbedProps,
  TwitterEmbedProps,
  LinkedInEmbedProps,
} from "./components/embeds";

// Sharing
export { ShareButtons, FollowBar } from "./components/sharing";
export type { ShareButtonsProps, FollowBarProps } from "./components/sharing";

// Course
export {
  CourseSidebar,
  CoursePlayerLayout,
  QuizBlock,
  ArticleBlock,
  PodcastEmbed,
  SlideshowEmbed,
  PartTypeBadge,
  QABlock,
  LessonHeader,
  LessonList,
  LessonSocialBar,
} from "./components/course";
export type {
  CourseSidebarProps,
  CoursePart,
  PartType,
  CoursePlayerLayoutProps,
  QuizBlockProps,
  QuizQuestion,
  QuizOption,
  ArticleBlockProps,
  ArticleAuthor,
  PodcastEmbedProps,
  PodcastProvider,
  SlideshowEmbedProps,
  SlideshowProvider,
  PartTypeBadgeProps,
  QABlockProps,
  QAItem,
  LessonHeaderProps,
  LessonListProps,
  LessonSocialBarProps,
} from "./components/course";
