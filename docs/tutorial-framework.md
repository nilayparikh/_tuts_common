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
│   │                  MermaidDiagram, DescriptionBox, PollBlock, AccordionList,
│   │                  StepByStepGuide, Paragraph, SectionDivider, TutorialNav,
│   │                  LessonObjectives, GitHubRepoCard
│   ├── course/     → CoursePlayerLayout, CourseSidebar, QuizBlock, QABlock,
│   │                  LessonList, LessonHeader, LessonSocialBar, ArticleBlock,
│   │                  PodcastEmbed
│   ├── embeds/     → YouTubeEmbed, GitHubGistEmbed, TwitterEmbed, LinkedInEmbed
│   └── sharing/    → ShareButtons, FollowBar
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

#### Container-High (Stronger Fills)

Used for card backgrounds, hover states, and visual emphasis.

| Token                                 | Default                 | Purpose                  |
| ------------------------------------- | ----------------------- | ------------------------ |
| `--tf-color-primary-container-high`   | `rgba(99,102,241,0.18)` | Primary highlight fill   |
| `--tf-color-secondary-container-high` | `rgba(20,184,166,0.15)` | Secondary highlight fill |
| `--tf-color-accent-container-high`    | `rgba(245,158,11,0.15)` | Accent highlight fill    |
| `--tf-color-success-container-high`   | `rgba(16,185,129,0.15)` | Success highlight fill   |
| `--tf-color-warning-container-high`   | `rgba(251,191,36,0.15)` | Warning highlight fill   |
| `--tf-color-danger-container-high`    | `rgba(239,68,68,0.12)`  | Danger highlight fill    |

#### Semantic Borders

Border colors per semantic role (~35% opacity for visible outlines).

| Token                         | Default                 | Purpose           |
| ----------------------------- | ----------------------- | ----------------- |
| `--tf-color-primary-border`   | `rgba(99,102,241,0.35)` | Primary outline   |
| `--tf-color-secondary-border` | `rgba(20,184,166,0.35)` | Secondary outline |
| `--tf-color-accent-border`    | `rgba(245,158,11,0.35)` | Accent outline    |
| `--tf-color-success-border`   | `rgba(16,185,129,0.35)` | Success outline   |
| `--tf-color-warning-border`   | `rgba(251,191,36,0.35)` | Warning outline   |
| `--tf-color-danger-border`    | `rgba(239,68,68,0.35)`  | Danger outline    |

#### Brand Colors (Third-Party Services)

| Token                 | Default   | Purpose         |
| --------------------- | --------- | --------------- |
| `--tf-brand-youtube`  | `#ff0000` | YouTube embeds  |
| `--tf-brand-spotify`  | `#1DB954` | Spotify embeds  |
| `--tf-brand-apple`    | `#FC3C44` | Apple Podcasts  |
| `--tf-brand-linkedin` | `#0a66c2` | LinkedIn embeds |

#### Decorative Colors

| Token               | Default   | Purpose                             |
| ------------------- | --------- | ----------------------------------- |
| `--tf-decor-red`    | `#ff5f57` | CodeBlock traffic-light dot (close) |
| `--tf-decor-yellow` | `#febc2e` | CodeBlock traffic-light dot (min)   |
| `--tf-decor-green`  | `#28c840` | CodeBlock traffic-light dot (max)   |

#### Letter Spacing

| Token                  | Value    | Purpose                          |
| ---------------------- | -------- | -------------------------------- |
| `--tf-tracking-wide`   | `0.06em` | Button labels, small caps        |
| `--tf-tracking-widest` | `0.08em` | Hero subtitles, section dividers |

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

### Responsive Layout Classes

The framework injects responsive CSS via `<TutorialGlobalStyles />`. Components
add these class names so they collapse gracefully on mobile — **no `!important`
hacks in site CSS are needed**.

| Class                | Breakpoint | Behaviour                         |
| -------------------- | ---------- | --------------------------------- |
| `.tf-concept-grid`   | ≤ 768px    | Grid columns → `1fr`              |
| `.tf-hero-inner`     | ≤ 768px    | Padding reduced to `--tf-space-6` |
| `.tf-sidebar-layout` | ≤ 768px    | Sidebar + content → single col    |
| `.tf-step-card`      | ≤ 768px    | Step grid → stacked               |
| `.tf-hero-actions`   | ≤ 640px    | Hero buttons → vertical stack     |
| `.tf-nav-buttons`    | ≤ 640px    | Prev/Next buttons → full width    |

### Strict Styling Rules

Every colour, spacing, radius, shadow, and motion value in the framework
**must** reference a `--tf-*` token. This ensures visual consistency across
all sites.

| ❌ Forbidden                        | ✅ Use Instead                                 |
| ----------------------------------- | ---------------------------------------------- |
| `rgba(99,102,241,0.12)`             | `var(--tf-color-primary-container)`            |
| `"#fff"` / `"#000"`                 | `var(--tf-text-inverse)` / `var(--tf-bg-base)` |
| `borderRadius: 9999`                | `var(--tf-radius-full)`                        |
| `letterSpacing: "0.06em"`           | `var(--tf-tracking-wide)`                      |
| `transition: "all 0.15s ease"`      | `var(--tf-transition-fast)`                    |
| `fontSize: 18` / `width: 32`        | `var(--tf-text-lg)` / `2rem`                   |
| `${color}44` (hex alpha on CSS var) | Explicit `borderColor` field with token        |
| `padding: "2px 8px"`                | Token-relative values (`0.125rem 0.5rem`)      |

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

#### Course Type Vocabulary

Course part `type` values are an internal rendering contract, not user-facing copy.
Visible labels in `CourseSidebar`, `LessonList`, and `PartTypeBadge` are derived from
actual lesson metadata so the site does not leak template jargon.

Use these conventions consistently:

| Internal `type` | Display label rule                                                                 |
| --------------- | ---------------------------------------------------------------------------------- |
| `video`         | `Video Lesson`, unless a real code example exists                                  |
| `video-code`    | `Video + Code Walkthrough` only when a GitHub/code example exists; otherwise video |
| `reading`       | `Reading Guide`                                                                    |
| `quiz`          | `Assessment`, or `Interview Questions` when the lesson is clearly interview-style  |
| `podcast`       | `Audio Lesson`                                                                     |
| `slideshow`     | `Slide Deck`                                                                       |
| `article`       | `Article`                                                                          |
| `lab`           | `Hands-On Lab`                                                                     |
| `code`          | `Code Example` when example assets exist; otherwise `Code Lab`                     |

Code-example detection should come from real lesson metadata such as `codeUrl`,
`notebookUrl`, `colabUrl`, or populated `codePreview` segments.

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

| Prop          | Type    | Default     | Description                                                         |
| ------------- | ------- | ----------- | ------------------------------------------------------------------- |
| `title`       | string  | —           | Card title                                                          |
| `description` | string  | —           | Card body text                                                      |
| `icon`        | string  | —           | Emoji or image URL                                                  |
| `variant`     | string  | `"default"` | `default` / `primary` / `accent` / `success` / `warning` / `danger` |
| `href`        | string  | —           | Makes the card a clickable link                                     |
| `tag`         | string  | —           | Category label above the title                                      |
| `compact`     | boolean | `false`     | Icon + title on the same row, smaller padding                       |

```tsx
<ConceptGrid columns={3}>
  <ConceptCard title="Concept 1" description="..." variant="primary" />
  <ConceptCard title="Concept 2" description="..." variant="accent" />
  <ConceptCard title="Concept 3" description="..." variant="success" />
</ConceptGrid>;

{
  /* Compact layout */
}
<ConceptCard compact icon="🔌" title="Title" description="Body text." />;
```

#### `AccordionList`

Collapsible `<details>`/`<summary>` list styled with framework tokens. Each item
shows a numbered badge, title, and expandable body text. Fully accessible.

| Prop               | Type              | Default | Description                          |
| ------------------ | ----------------- | ------- | ------------------------------------ |
| `items`            | `AccordionItem[]` | —       | `{ title: string; content: string }` |
| `defaultOpenFirst` | boolean           | `false` | Expand the first item on load        |

```tsx
<AccordionList
  items={[
    { title: "Step one", content: "Details about step one." },
    { title: "Step two", content: "Details about step two." },
  ]}
  defaultOpenFirst
/>
```

#### `LessonObjectives`

Displays a lesson's learning objectives as a clean card with a target icon header,
item-count badge, and checkmark bullets. Use this instead of manual numbered lists.
It is a **Server Component** (no interactivity needed).

| Prop         | Type       | Default                 | Description            |
| ------------ | ---------- | ----------------------- | ---------------------- |
| `objectives` | `string[]` | **required**            | One objective per item |
| `title`      | `string`   | `"Learning Objectives"` | Card header label      |

```tsx
<LessonObjectives
  objectives={[
    "Clone the examples repository",
    "Configure all three model providers",
    "Run the smoke-test script",
  ]}
/>
// With a custom title (e.g. for video-code sidebar):
<LessonObjectives objectives={part.objectives} title="Instructions" />
```

#### `GitHubRepoCard`

A branded anchor card linking to a GitHub repository or folder. Replaces the
generic "External Resource" `InfoBox`. **Client Component** — uses `onMouseEnter`
/ `onMouseLeave` for the hover lift effect.

| Prop          | Type     | Default               | Description                                          |
| ------------- | -------- | --------------------- | ---------------------------------------------------- |
| `url`         | `string` | **required**          | Full GitHub URL (repo root, tree path, or file path) |
| `title`       | `string` | path after github.com | Human-readable label; falls back to URL path         |
| `description` | `string` | —                     | One or two sentences shown under the title           |

```tsx
// Source code for a lesson
<GitHubRepoCard
  url="https://github.com/nilayparikh/tuts-agentic-ai-examples/tree/main/a2a/lessons/05"
  description="Complete source code for this lesson."
/>

// External reading resource
<GitHubRepoCard
  url={part.readingUrl}
  description="This lesson links to an external resource."
/>
```

> **Note:** Because `GitHubRepoCard` is a `"use client"` component it can safely
> be imported in both Server Components and Client Components in Next.js App Router.

#### `LessonSocialBar`

| Prop                    | Type     | Default | Description                         |
| ----------------------- | -------- | ------- | ----------------------------------- |
| `instructorName`        | string   | —       | Instructor name (capsule left side) |
| `instructorImageSrc`    | string   | —       | Avatar image src                    |
| `twitterUrl`            | string   | —       | X / Twitter profile URL             |
| `twitterHandle`         | string   | —       | Display handle, e.g. `@nilayparikh` |
| `linkedinNewsletterUrl` | string   | —       | LinkedIn newsletter subscribe URL   |
| `youtubeSubscribeUrl`   | string   | —       | YouTube channel URL                 |
| `shareTitle`            | string   | **req** | Title for share text                |
| `shareDescription`      | string   | —       | Description for share text          |
| `shareHashtags`         | string[] | `[]`    | Hashtags without `#`                |
| `hideFollow`            | boolean  | `false` | Hide follow buttons (share-only)    |

```tsx
<LessonSocialBar
  instructorName="Name"
  instructorImageSrc="/brand/avatar.jpg"
  twitterUrl="https://x.com/handle"
  shareTitle="Page Title"
/>
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

The library is consumed via git submodule + `file:` references, not via npm registry. There is no semver versioning — tutorial repos pin to a submodule commit and sync forward manually using `sync-common.ps1`.
