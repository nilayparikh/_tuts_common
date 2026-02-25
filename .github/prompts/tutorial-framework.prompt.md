---
description: "Create or update a tutorial page using @localm/tutorial-framework components"
---

# Tutorial Page Development

## Task

${input:task_description:Describe the tutorial page to create or modify. Include: topic, audience, sections needed, any embeds (YouTube IDs, Gist IDs, tweet URLs), and whether it's a new page or an update.}

---

## Framework: @localm/tutorial-framework

### Available Components (import from `@localm/tutorial-framework`)

**Layout:** `TutorialLayout`, `TutorialHeader`, `TutorialFooter`, `SidebarLayout`

**Content:** `HeroSection`, `SectionHeading`, `ConceptCard`, `ConceptGrid`, `StepCard`, `StepList`, `CodeBlock`, `KeyPoint`, `TutorialNav`, `SectionDivider`

**Embeds:** `YouTubeEmbed`, `GitHubGistEmbed`, `TwitterEmbed`, `LinkedInEmbed`

**Sharing:** `ShareButtons`

**Theme:** `TutorialGlobalStyles`, `tokens`, `palette`

### Constraints

1. **Static only** — `output: 'export'` in next.config.ts; no server-side code
2. **Components only** — no raw HTML containers; fill props, not JSX structure
3. **SEO** — `export const metadata: Metadata` on every page file
4. **Token-based theming** — use `--tf-*` CSS variables; no arbitrary inline styles

---

## Deliverables

Produce:

1. The complete page file (`app/(tutorials)/<slug>/page.tsx`)
2. Any updates to `config/site.ts` if new nav items are needed
3. Type-check and build validation steps

---

## Pattern to Follow

```tsx
// app/(tutorials)/my-topic/page.tsx
import type { Metadata } from "next";
import {
  TutorialLayout,
  HeroSection,
  SectionHeading,
  ConceptCard,
  ConceptGrid,
  StepList,
  StepCard,
  CodeBlock,
  KeyPoint,
  YouTubeEmbed,
  ShareButtons,
  TutorialNav,
} from "@localm/tutorial-framework";
import { SITE_CONFIG } from "@/config/site";

export const metadata: Metadata = {
  title: "Topic Title | My Tutorials",
  description: "Short, compelling description under 160 characters.",
  openGraph: { title: "...", description: "...", type: "article" },
};

export default function TopicPage() {
  return (
    <TutorialLayout
      header={SITE_CONFIG.header}
      footer={SITE_CONFIG.footer}
      maxWidth="narrow"
    >
      <HeroSection
        eyebrow="Tutorial"
        headline="**Topic** in Plain Terms"
        subheading="What you will learn and why it matters."
        primaryAction={{ label: "Jump to steps", href: "#steps" }}
        tags={["Tag1", "Tag2"]}
      />

      {/* Video overview */}
      <YouTubeEmbed
        videoId="YOUTUBE_ID"
        title="Video title"
        caption="Watch the full walkthrough"
      />

      <SectionHeading eyebrow="Concepts" title="What You Need to Know" />
      <ConceptGrid>
        <ConceptCard
          title="Concept A"
          description="Why it matters."
          icon="🧩"
        />
        <ConceptCard
          title="Concept B"
          description="How it works."
          icon="⚙️"
          variant="primary"
        />
      </ConceptGrid>

      <SectionHeading
        eyebrow="Step by Step"
        title="Let's Build It"
        id="steps"
      />
      <StepList>
        <StepCard
          step={1}
          title="First step"
          description="Do this."
          code="npm install thing"
          codeLanguage="bash"
        />
        <StepCard step={2} title="Second step" description="Then this." />
      </StepList>

      <KeyPoint variant="tip" title="Pro Tip">
        Something useful to remember.
      </KeyPoint>

      <ShareButtons title="Topic Title" hashtags={["tutorial"]} />

      <TutorialNav
        prev={{ label: "Previous Topic", href: "/tutorials/prev" }}
        next={{ label: "Next Topic", href: "/tutorials/next" }}
      />
    </TutorialLayout>
  );
}
```
