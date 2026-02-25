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
export { palette, tokens, tokensToCSS, TutorialGlobalStyles } from "./theme";
export type { Palette, Tokens } from "./theme";

// Layout
export {
  TutorialHeader,
  TutorialFooter,
  TutorialLayout,
  SidebarLayout,
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
export { ShareButtons } from "./components/sharing";
export type { ShareButtonsProps } from "./components/sharing";

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
} from "./components/course";
