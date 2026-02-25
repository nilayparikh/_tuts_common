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

### 5. Content Updates

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
