# @localm/tutorial-framework — Full Reference

Complete documentation for the shared component library used by all LocalM tutorial sites.

## Architecture

```
@localm/tutorial-framework
├── theme/          → Design tokens (CSS variables), palette, GlobalStyles
├── components/
│   ├── layout/     → TutorialLayout, TutorialHeader, TutorialFooter, SidebarLayout
│   ├── content/    → HeroSection, ConceptCard, StepCard, CodeBlock, KeyPoint, …
│   ├── course/     → CoursePlayerLayout, CourseSidebar, QuizBlock, QABlock, …
│   ├── embeds/     → YouTubeEmbed, GitHubGistEmbed, TwitterEmbed, LinkedInEmbed
│   └── sharing/    → ShareButtons
└── index.ts        → Single public entry point
```

## Design Tokens

All styling uses CSS custom properties prefixed `--tf-`. They are injected by `<TutorialGlobalStyles />` in the root layout.

### Core Tokens

| Token                 | Default   | Purpose                         |
| --------------------- | --------- | ------------------------------- |
| `--tf-bg-base`        | `#0a0a0f` | Page background                 |
| `--tf-bg-surface`     | `#12121a` | Card / section background       |
| `--tf-bg-elevated`    | `#1a1a28` | Hover / elevated surfaces       |
| `--tf-text-primary`   | `#f1f1f4` | Headings, important text        |
| `--tf-text-secondary` | `#a1a1b5` | Body text                       |
| `--tf-text-muted`     | `#6b6b80` | Captions, timestamps            |
| `--tf-color-primary`  | `#6366f1` | Primary brand (indigo)          |
| `--tf-color-accent`   | `#f59e0b` | Accent (amber)                  |
| `--tf-color-success`  | `#10b981` | Success states (emerald)        |
| `--tf-color-danger`   | `#ef4444` | Error / current highlight (red) |

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
  showFooter={false}
>
  {lessonContent}
</CoursePlayerLayout>
```

### Content Components

#### `HeroSection`

Page hero with headline, actions, and tag chips.

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
