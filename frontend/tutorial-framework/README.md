# @localm/tutorial-framework

Shared React component library for **LocalM** tutorial static websites. Drop in the components, fill in your content — zero style conflicts, full SEO.

## Stack

| Layer      | Choice                            |
| ---------- | --------------------------------- |
| Framework  | React 18/19 + TypeScript          |
| Styling    | CSS custom properties (zero deps) |
| SSG target | Next.js `output: 'export'`        |

## Installation

```bash
# From the _tuts project (monorepo workspace)
npm install file:../../common/frontend/tutorial-framework

# Or add to package.json
"@localm/tutorial-framework": "file:../../common/frontend/tutorial-framework"
```

## Quick Start

```tsx
// app/layout.tsx (Next.js App Router)
import { TutorialGlobalStyles } from "@localm/tutorial-framework";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TutorialGlobalStyles />
        {children}
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
import {
  TutorialLayout,
  HeroSection,
  SectionHeading,
  ConceptCard,
  ConceptGrid,
  StepList,
  StepCard,
  CodeBlock,
  YouTubeEmbed,
  ShareButtons,
} from "@localm/tutorial-framework";

const HEADER = {
  siteName: "My Tutorials",
  githubUrl: "https://github.com/you/repo",
};
const FOOTER = { siteName: "My Tutorials", tagline: "Learn by doing." };

export default function HomePage() {
  return (
    <TutorialLayout header={HEADER} footer={FOOTER}>
      <HeroSection
        eyebrow="Tutorial Series"
        headline="Learn **Next.js** in 30 Minutes"
        subheading="From zero to static site."
        primaryAction={{ label: "Start tutorial", href: "/tutorials/nextjs" }}
        tags={["Next.js", "React", "TypeScript"]}
      />

      <SectionHeading title="Core Concepts" eyebrow="Foundations" />
      <ConceptGrid>
        <ConceptCard
          title="SSG"
          description="Static Site Generation explained."
          icon="📦"
        />
        <ConceptCard
          title="Routing"
          description="File-based routing."
          icon="🗂️"
          variant="primary"
        />
      </ConceptGrid>
    </TutorialLayout>
  );
}
```

## Component Catalogue

### Layout

| Component        | Purpose                                       |
| ---------------- | --------------------------------------------- |
| `TutorialLayout` | Full-page wrapper with header + footer        |
| `TutorialHeader` | Sticky top nav with logo, links, social icons |
| `TutorialFooter` | Footer with branding, links, social icons     |
| `SidebarLayout`  | Two-column layout with sticky sidebar         |

### Content

| Component        | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `HeroSection`    | Page hero with headline, actions, tags               |
| `SectionHeading` | Section title with eyebrow + subtitle                |
| `ConceptCard`    | Feature / concept card with icon + variant           |
| `ConceptGrid`    | 2/3/4-column responsive grid                         |
| `StepCard`       | Numbered step with optional code + note              |
| `StepList`       | Vertical list wrapper for StepCards                  |
| `CodeBlock`      | Syntax-aware code block with copy button             |
| `KeyPoint`       | Callout / admonition block (info/tip/warning/danger) |
| `TutorialNav`    | Previous / Next page navigation                      |
| `SectionDivider` | Visual separator (line, gradient, dots)              |

### Embeds

| Component         | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `YouTubeEmbed`    | Lazy-loaded YouTube video (privacy-enhanced) |
| `GitHubGistEmbed` | GitHub Gist via sandboxed iframe             |
| `TwitterEmbed`    | X/Twitter post via official widget           |
| `LinkedInEmbed`   | LinkedIn post via embed API                  |

### Sharing

| Component      | Purpose                                          |
| -------------- | ------------------------------------------------ |
| `ShareButtons` | Social share row (X, LinkedIn, Email, copy link) |

## Theme

All styles use CSS custom properties prefixed `--tf-`. Override any token in your own CSS:

```css
/* globals.css in your Next.js app */
:root {
  --tf-color-primary: #7c3aed; /* swap indigo for violet */
  --tf-font-display: "Outfit", sans-serif;
}
```

See `src/theme/tokens.ts` for the full token list.
