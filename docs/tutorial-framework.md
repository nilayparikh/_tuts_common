# @localm/tutorial-framework — Full Reference

Complete documentation for the shared component library used by all LocalM tutorial sites.
Uses **Material Design 3** dark theme with fluid typography and CSS custom properties.

## Architecture

```
@localm/tutorial-framework
├── theme/          → Material Design 3 tokens (CSS variables), palette, GlobalStyles
├── components/
│   ├── layout/     → TutorialLayout, TutorialHeader, TutorialFooter, SidebarLayout
│   ├── content/    → HeroSection, ConceptCard, StepCard, CodeBlock, KeyPoint,
│   │                  CalloutBox (Info/Note/Tip/Success/Warning/Danger),
│   │                  MermaidDiagram, DescriptionBox, PollBlock,
│   │                  StepByStepGuide, Paragraph, SectionDivider, TutorialNav
│   ├── course/     → CoursePlayerLayout, CourseSidebar, QuizBlock, QABlock,
│   │                  LessonList, LessonHeader, ArticleBlock, PodcastEmbed
│   ├── embeds/     → YouTubeEmbed, GitHubGistEmbed, TwitterEmbed, LinkedInEmbed
│   └── sharing/    → ShareButtons
└── index.ts        → Single public entry point
```

## Design System (Material Design 3)

### Typography

All font sizes use `clamp()` for fluid scaling — **no fixed px values**.

| Font Stack       | CSS Variable                           | Usage                |
| ---------------- | -------------------------------------- | -------------------- |
| Inter (Variable) | `--tf-font-display` / `--tf-font-body` | Headlines, body text |
| JetBrains Mono   | `--tf-font-mono`                       | Code blocks, badges  |
| Material Symbols | Google Fonts CDN                       | Icons in components  |

**Fluid type scale** — sizes interpolate between mobile and desktop:

| Token           | Range       | MD3 Role       |
| --------------- | ----------- | -------------- |
| `--tf-text-xs`  | 11px → 12px | Label Small    |
| `--tf-text-sm`  | 13px → 14px | Label / Body S |
| `--tf-text-md`  | 15px → 16px | Body Medium    |
| `--tf-text-lg`  | 17px → 18px | Body Large     |
| `--tf-text-xl`  | 18px → 20px | Title Small    |
| `--tf-text-2xl` | 22px → 24px | Title Medium   |
| `--tf-text-3xl` | 26px → 30px | Headline Small |
| `--tf-text-4xl` | 32px → 36px | Headline Med   |
| `--tf-text-5xl` | 40px → 48px | Display Small  |
| `--tf-text-6xl` | 48px → 60px | Display Medium |

### Design Tokens

All styling uses CSS custom properties prefixed `--tf-`. They are injected by `<TutorialGlobalStyles />` in the root layout.

#### Surface System (MD3)

| Token              | Default   | Purpose                                   |
| ------------------ | --------- | ----------------------------------------- |
| `--tf-bg-base`     | `#09090b` | Page background (Surface)                 |
| `--tf-bg-surface`  | `#111318` | Card / section (Surface Container)        |
| `--tf-bg-elevated` | `#1a1d25` | Hover / elevated (Surface Container High) |
| `--tf-bg-overlay`  | `#22252e` | Overlays / dialogs                        |
| `--tf-bg-highest`  | `#2a2d37` | Highest elevation surface                 |

#### Color Roles

| Token                            | Default                 | Purpose                  |
| -------------------------------- | ----------------------- | ------------------------ |
| `--tf-color-primary`             | `#6366f1` (Indigo)      | Primary interactions     |
| `--tf-color-primary-container`   | `rgba(99,102,241,0.12)` | Primary container fill   |
| `--tf-color-secondary`           | `#14b8a6` (Teal)        | Secondary actions        |
| `--tf-color-secondary-container` | `rgba(20,184,166,0.12)` | Secondary container fill |
| `--tf-color-accent`              | `#f59e0b` (Amber)       | Tertiary / accent        |
| `--tf-color-success`             | `#10b981` (Emerald)     | Success states           |
| `--tf-color-warning`             | `#fbbf24` (Gold)        | Warning states           |
| `--tf-color-danger`              | `#ef4444` (Red)         | Error / danger states    |

#### Elevation (MD3 Shadow Levels)

| Token                | Description               |
| -------------------- | ------------------------- |
| `--tf-shadow-level0` | No shadow                 |
| `--tf-shadow-level1` | Subtle (cards)            |
| `--tf-shadow-level2` | Moderate (dropdowns)      |
| `--tf-shadow-level3` | Prominent (modals)        |
| `--tf-shadow-level4` | High (sticky headers)     |
| `--tf-shadow-level5` | Maximum (overlays)        |
| `--tf-shadow-glow`   | Primary color glow effect |

#### Radius (MD3 Shape)

| Token              | Value     | MD3 Role    |
| ------------------ | --------- | ----------- |
| `--tf-radius-xs`   | `0.25rem` | Extra Small |
| `--tf-radius-sm`   | `0.5rem`  | Small       |
| `--tf-radius-md`   | `0.75rem` | Medium      |
| `--tf-radius-lg`   | `1rem`    | Large       |
| `--tf-radius-xl`   | `1.75rem` | Extra Large |
| `--tf-radius-full` | `9999px`  | Full (pill) |

#### Motion (MD3 Easing)

| Token                        | Value                                   |
| ---------------------------- | --------------------------------------- |
| `--tf-transition-fast`       | `150ms cubic-bezier(0.2, 0, 0, 1)`      |
| `--tf-transition-normal`     | `300ms cubic-bezier(0.2, 0, 0, 1)`      |
| `--tf-transition-slow`       | `500ms cubic-bezier(0.2, 0, 0, 1)`      |
| `--tf-transition-emphasized` | `500ms cubic-bezier(0.05, 0.7, 0.1, 1)` |

### Overriding Tokens

```css
/* In your app/globals.css */
:root {
  --tf-color-primary: #7c3aed; /* Swap indigo for violet */
  --tf-font-display: "Outfit", sans-serif;
}
```

## Component Reference

### Layout Components

#### `TutorialLayout`

Full-page shell: header → main → footer.

```tsx
<TutorialLayout
  header={{ siteName: "My Tuts", navItems: [...] }}
  footer={{ siteName: "My Tuts", tagline: "Learn by building." }}
  maxWidth="narrow"    // "content" | "narrow" | "full"
>
  {children}
</TutorialLayout>
```

#### `CoursePlayerLayout`

Two-panel layout with sticky sidebar for course-style pages.

```tsx
<CoursePlayerLayout
  header={headerProps}
  footer={footerProps}
  sidebar={{ courseTitle: "...", parts: [...], currentSlug: "...", basePath: "" }}
  sidebarWidth={288}
  showFooter={false}
>
  {lessonContent}
</CoursePlayerLayout>
```

### Content Components

#### `HeroSection`

Page hero with headline, actions, and tag chips.

#### `CalloutBox` (+ Convenience Aliases)

Versatile callout/admonition box with 6 variants. Each variant has its own alias component.

```tsx
import { InfoBox, NoteBox, TipBox, SuccessBox, WarningBox, DangerBox } from "@localm/tutorial-framework";

<InfoBox title="Prerequisites">Requires Python 3.11+</InfoBox>
<NoteBox title="Remember">This is a note callout.</NoteBox>
<TipBox title="Pro Tip">Use virtual environments.</TipBox>
<SuccessBox title="Complete">All tests pass!</SuccessBox>
<WarningBox title="Security">Never commit secrets.</WarningBox>
<DangerBox title="Breaking Change">This removes the old API.</DangerBox>

// Or use the base component with variant prop:
<CalloutBox variant="info" title="Custom">Content</CalloutBox>
```

**Variants**: `info` (blue), `note` (purple), `tip` (teal), `success` (emerald), `warning` (amber), `danger` (red)

#### `StepByStepGuide`

Interactive timeline-style guide with checkable steps and code blocks.

```tsx
<StepByStepGuide
  title="Setup Instructions"
  steps={[
    {
      title: "Clone the repository",
      description: "Get the source code.",
      code: "git clone https://...",
      codeLanguage: "bash",
      note: "Optional note text",
    },
    {
      title: "Install dependencies",
      description: "Run pip install.",
      code: "pip install -r requirements.txt",
      codeLanguage: "bash",
    },
  ]}
/>
```

#### `MermaidDiagram`

Client-side Mermaid.js diagram renderer. Loads mermaid@11 from CDN on demand.

```tsx
<MermaidDiagram
  chart={`graph LR
    A[Client] --> B[Server]
    B --> C[Agent]`}
  caption="System architecture"
  alt="Architecture diagram"
  theme="dark" // "dark" | "default" | "forest" | "neutral"
/>
```

#### `DescriptionBox`

Rich "below-the-video" description panel with title, subtitle, tags, and body content.

```tsx
<DescriptionBox
  title="Lesson Title"
  subtitle="Brief description"
  tags={["python", "a2a"]}
  meta="5 mins"
>
  <p>Detailed description content goes here.</p>
</DescriptionBox>
```

#### `PollBlock`

Interactive polling/voting component with animated results.

```tsx
<PollBlock
  question="Which framework do you prefer?"
  options={[
    { id: "adk", text: "Google ADK" },
    { id: "langchain", text: "LangChain" },
  ]}
  simulatedVotes={{ adk: 42, langchain: 38 }}
  multiple={false}
/>
```

#### `Paragraph`

Styled paragraph with variant support.

```tsx
<Paragraph lead>Lead paragraph with larger text.</Paragraph>
<Paragraph muted>Muted paragraph for secondary content.</Paragraph>
<Paragraph center>Centered paragraph text.</Paragraph>
```

#### `ConceptCard` / `ConceptGrid`

Card grid for key concepts. Supports 6 color variants.

```tsx
<ConceptGrid columns={3}>
  <ConceptCard title="Concept 1" description="..." variant="primary" />
  <ConceptCard title="Concept 2" description="..." variant="accent" />
  <ConceptCard title="Concept 3" description="..." variant="success" />
</ConceptGrid>
```

#### `LessonHeader`

Renders type badge + title + description for a single lesson.

```tsx
<LessonHeader
  type="video-code"
  duration="4 mins"
  title="..."
  description="..."
/>
```

#### `LessonList`

Clickable ordered list of lessons for course overview pages.

```tsx
<LessonList parts={course.parts} basePath="" />
```

#### `QABlock`

Renders a list of question/answer pairs with styled Q badges.

```tsx
<QABlock items={[{ question: "...", answer: "..." }]} title="Q & A" />
```

#### `QuizBlock`

Interactive quiz with grading, explanations, and score summary.

#### `ArticleBlock`, `PodcastEmbed`, `SlideshowEmbed`

Content-type-specific blocks for article, podcast, and slideshow lessons.

### Embeds

| Component         | Props                                     | Description              |
| ----------------- | ----------------------------------------- | ------------------------ |
| `YouTubeEmbed`    | `videoId`, `title`, `lazyLoad`, `caption` | Privacy-enhanced YouTube |
| `GitHubGistEmbed` | `gistId`, `file`                          | Sandboxed Gist iframe    |
| `TwitterEmbed`    | `tweetId`                                 | X/Twitter widget         |
| `LinkedInEmbed`   | `postUrl`                                 | LinkedIn embed           |

### Part Types

The framework supports these lesson types via `PartType`:

| Type         | Icon | Description              |
| ------------ | ---- | ------------------------ |
| `video`      | ▶    | Video-only lesson        |
| `video-code` | 💻   | Video + code walkthrough |
| `reading`    | 📖   | Text-based resource      |
| `quiz`       | 📝   | Interactive quiz         |
| `article`    | 📰   | Long-form article        |
| `podcast`    | 🎙   | Audio episode            |
| `slideshow`  | 📑   | Presentation slides      |
| `lab`        | 🧪   | Hands-on lab exercise    |

## Adding New Components

1. Create the component in the appropriate subdirectory under `src/components/`
2. Export it from the subdirectory `index.ts`
3. Export it from the root `src/index.ts`
4. Copy to all template repos: run `sync-common.ps1` in each template
5. Update this doc

## Versioning

The library is consumed via `file:` references (vendored copy), not via npm registry. There is no semver versioning — templates pin to a copy at a point in time and sync forward manually.
