---
applyTo: "**/_tuts/**,**/tutorial*/**"
---

# LocalM Tutorial Framework — AI Development Guidelines

## Overview

Tutorial websites are **fully static** (GitHub Pages) and use `@localm/tutorial-framework` for ALL UI — no raw HTML equivalents.

## Technology Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Framework  | Next.js 15 + App Router                                |
| Export     | `output: 'export'` (static HTML per page)              |
| Language   | TypeScript strict mode                                 |
| Components | `@localm/tutorial-framework` (local workspace package) |
| Hosting    | GitHub Pages via `gh-pages` branch                     |

## Package Resolution

```json
// In _tuts/package.json
"@localm/tutorial-framework": "file:../../common/frontend/tutorial-framework"
```

The `@tf` path alias in `tsconfig.json` maps to the framework source for DX:

```json
{ "@tf/*": ["../../common/frontend/tutorial-framework/src/*"] }
```

## Directory Structure

```
_tuts/
├── app/
│   ├── layout.tsx           # Root layout — TutorialGlobalStyles here
│   ├── page.tsx             # Index page (tutorial list)
│   └── (tutorials)/
│       └── [slug]/
│           └── page.tsx     # Each tutorial page
├── config/
│   └── site.ts              # SITE_CONFIG — header + footer props
├── public/                  # Static assets (images, favicons)
├── next.config.ts           # output: 'export'
└── package.json
```

## Strict Rules

### 1. Components

- ✅ Import ALL UI from `@localm/tutorial-framework`
- ❌ Never recreate `<header>`, `<footer>`, `<nav>` manually
- ❌ Never use raw `<div>` wrappers when a layout component exists
- ❌ Never add third-party component libraries (MUI, shadcn, etc.)

### 2. Static Export Compliance

- ✅ `generateStaticParams()` for dynamic routes
- ✅ `export const metadata: Metadata = { ... }` on every page
- ❌ No `getServerSideProps`, no `fetch` at runtime, no API routes
- ❌ No `window.*` or browser APIs at module level — wrap in `useEffect`

### 3. SEO

Every page MUST export:

```tsx
export const metadata: Metadata = {
  title: "Page Title | Site Name",
  description: "Concise description under 160 chars.",
  openGraph: {
    title: "...",
    description: "...",
    type: "article",
    publishedTime: "YYYY-MM-DD",
  },
};
```

### 4. Theme

Override tutorial framework tokens in `app/globals.css`:

```css
:root {
  /* Example: site-specific accent */
  --tf-color-accent: #f59e0b;
}
```

Never use inline style for values that should be tokens.

### 5. Token Tiers

The framework provides multiple tiers of semantic tokens. Always choose the
most specific tier available instead of hard-coding values.

| Tier            | Prefix / Example                    | When to use                        |
| --------------- | ----------------------------------- | ---------------------------------- |
| Base container  | `--tf-color-primary-container`      | Light fills, backgrounds           |
| Container-high  | `--tf-color-primary-container-high` | Stronger fills, hover/active state |
| Semantic border | `--tf-color-primary-border`         | Outline / border colours           |
| Brand           | `--tf-brand-youtube`                | Third-party service colours        |
| Decorative      | `--tf-decor-red`                    | Traffic-light dots, cosmetic only  |
| Letter-spacing  | `--tf-tracking-wide` / `widest`     | Caps, badges, subtitles            |

**Never** append hex alpha to a CSS variable (e.g. `${color}44`). Instead,
use the appropriate `*-border` or `*-container-high` token.

### 6. Layout Architecture

The framework provides two mutually exclusive page layouts.
**Never mix them or build custom wrappers.**

#### Home / Tutorial Pages — `TutorialLayout` (1 column, centered)

```
┌─────────────────────────────────────────────┐
│  TutorialHeader (full viewport width)       │
├─────────────────────────────────────────────┤
│          <main> (centered, max-width)       │
│                                             │
│             page content                    │
│                                             │
├─────────────────────────────────────────────┤
│  TutorialFooter (full viewport width)       │
└─────────────────────────────────────────────┘
```

- Outer wrapper: `flex-column`, `min-height: 100vh`
- Header + Footer: always **full viewport width**
- Main: centered via `max-width` + `margin: 0 auto`
- `maxWidth` prop: `"content"` (wide) or `"narrow"` (reading)

#### Course / Lesson Pages — `CoursePlayerLayout` (2 column, centered)

```
┌─────────────────────────────────────────────┐
│  TutorialHeader (full viewport width)       │
├─────────┬───────────────────────────────────┤
│         │                                   │
│ Sidebar │       <main> (flex: 1)            │
│ (sticky,│                                   │
│  fixed  │       lesson content              │
│  width) │                                   │
│         │                                   │
├─────────┴───────────────────────────────────┤
│  TutorialFooter (full viewport width)       │
└─────────────────────────────────────────────┘
```

- Outer wrapper: `flex-column`, `min-height: 100vh`
- Header + Footer: always **full viewport width** (outside the 2-col body)
- Body: `display: flex`, centered via `max-width: var(--tf-course-max-width)` + `margin: 0 auto`, has `flex: 1` so footer is pushed to bottom
- Sidebar: fixed width (`sidebarWidth` prop, default 384px), `position: sticky`, `height: calc(100vh - header)`, independent scroll
- Main: `flex: 1`, `min-width: 0`, scrolls with the page

**Critical invariants:**

- Header and Footer are **siblings of** the 2-col body (not children of it)
- Footer `marginTop` must be `0` — the body's `flex: 1` handles vertical fill
- On ≤ 768px: body stacks vertically, sidebar becomes `position: static` with max-height
- On ultra-wide: `--tf-course-max-width` (100rem) centers the body with equal gutters

### 7. Responsive Classes

Components use framework-provided CSS classes for responsive layout:

- `.tf-concept-grid` — collapses at ≤ 768px
- `.tf-sidebar-layout` — collapses at ≤ 768px
- `.tf-step-card` — collapses at ≤ 768px
- `.tf-hero-actions` — stacks at ≤ 640px
- `.tf-nav-buttons` — stacks at ≤ 640px

Site CSS (`globals.css`) must **not** override these with `!important`.
If layout needs differ, add a new class to `GlobalStyles.tsx`.

### 8. Content Updates

Content goes INSIDE component props. If you need to add new content:

1. Identify the right component (e.g. `ConceptCard`, `StepCard`)
2. Pass text/data as props
3. Never mix raw JSX text and component boundaries

## Mandatory Verification Checklist

Before claiming a page is complete:

- [ ] `npm run build` succeeds (no error)
- [ ] All TypeScript errors resolved
- [ ] `out/` directory contains `.html` file for the page
- [ ] Page title and meta description are set
- [ ] No console errors when served with `npx serve out`
