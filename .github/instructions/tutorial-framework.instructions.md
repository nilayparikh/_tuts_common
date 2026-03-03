---
applyTo: "**/_tuts/**,**/tutorial*/**"
---

# LocalM Tutorial Framework — Constraints

Tutorial websites are **fully static** (GitHub Pages) and use `@localm/tutorial-framework` for ALL UI.

## Technology Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Framework  | Next.js 15 + App Router                                |
| Export     | `output: 'export'` (static HTML per page)              |
| Language   | TypeScript strict mode                                 |
| Components | `@localm/tutorial-framework` (local workspace package) |
| Hosting    | GitHub Pages via `gh-pages` branch                     |

## Package Resolution

The framework is consumed via a git submodule at `_common/` and linked in `package.json`:

```json
"@localm/tutorial-framework": "file:./_common/frontend/tutorial-framework"
```

Next.js transpiles from source via `transpilePackages` + Turbopack alias — no pre-build needed.

## Strict Rules

### 1. Components

- Import ALL UI from `@localm/tutorial-framework`
- Never recreate `<header>`, `<footer>`, `<nav>` manually
- Never use raw `<div>` wrappers when a layout component exists
- Never add third-party component libraries (MUI, shadcn, etc.)

### 2. Static Export Compliance

- `generateStaticParams()` for dynamic routes
- `export const metadata: Metadata = { ... }` on every page
- No `getServerSideProps`, no `fetch` at runtime, no API routes
- No `window.*` or browser APIs at module level — wrap in `useEffect`

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

### 4. Theme Tokens

Override tokens in `app/globals.css` only:

```css
:root {
  --tf-color-accent: #f59e0b;
}
```

Never use inline style for values that should be tokens.

### 5. Token Tiers

| Tier            | Prefix / Example                    | When to use                        |
| --------------- | ----------------------------------- | ---------------------------------- |
| Base container  | `--tf-color-primary-container`      | Light fills, backgrounds           |
| Container-high  | `--tf-color-primary-container-high` | Stronger fills, hover/active state |
| Semantic border | `--tf-color-primary-border`         | Outline / border colours           |
| Brand           | `--tf-brand-youtube`                | Third-party service colours        |
| Decorative      | `--tf-decor-red`                    | Traffic-light dots, cosmetic only  |
| Letter-spacing  | `--tf-tracking-wide` / `widest`     | Caps, badges, subtitles            |

**Never** append hex alpha to a CSS variable (e.g. `${color}44`). Use the `*-border` or `*-container-high` token.

### 6. Layout Architecture

Two mutually exclusive page layouts — **never mix them or build custom wrappers**.

**`TutorialLayout`** (1-column, centered) — for standalone tutorial / home pages:

- Header + Footer: full viewport width
- Main: centered via `max-width` + `margin: 0 auto`
- `maxWidth` prop: `"content"` (wide) or `"narrow"` (reading)

**`CoursePlayerLayout`** (2-column, sidebar) — for course lesson pages:

- Header + Footer: full viewport width, siblings of the 2-col body
- Body: `display: flex`, centered via `max-width: var(--tf-course-max-width)`
- Sidebar: fixed width, `position: sticky`, independent scroll
- Main: `flex: 1`, `min-width: 0`
- Footer `marginTop` must be `0` — body's `flex: 1` handles vertical fill
- On ≤ 768px: body stacks, sidebar becomes `position: static` with max-height

### 7. Responsive Classes

Framework classes handle responsive layout:

- `.tf-concept-grid`, `.tf-sidebar-layout`, `.tf-step-card` — collapse at ≤ 768px
- `.tf-hero-actions`, `.tf-nav-buttons` — stack at ≤ 640px

Site CSS must **not** override these with `!important`.

### 8. Client Components (`"use client"`)

Next.js App Router renders all components as Server Components by default.
Any framework component that uses `useState`, `useEffect`, or JS event handlers
(`onClick`, `onMouseEnter`, etc.) **must** have `"use client"` as its **first line**.

| Component        | Reason for "use client"                            |
| ---------------- | -------------------------------------------------- |
| `GitHubRepoCard` | `onMouseEnter`/`onMouseLeave` hover lift           |
| `MermaidDiagram` | `useEffect` to load mermaid.js from CDN            |
| `PollBlock`      | vote state (`useState`)                            |
| `QuizBlock`      | quiz state (`useState`)                            |
| `QABlock`        | accordion expand state                             |
| `CodePreview`    | tab selection state                                |

**Never** add `onMouseEnter`/`onMouseLeave` or other JS event handlers to a
component that does not already declare `"use client"`. Use pure CSS hover (`:hover`
via a className) or add the directive to the component file.

### 9. Lesson Content Components

Use these components instead of inline JSX for standard lesson blocks:

| Use case                     | Component           | Notes                                      |
| ---------------------------- | ------------------- | ------------------------------------------ |
| Learning objectives list     | `LessonObjectives`  | Server Component; `title` prop optional    |
| GitHub repo / external link  | `GitHubRepoCard`    | Client Component; replaces `InfoBox` + `SuccessBox` for links |
| Section dividers             | `SectionDivider`    | `label` prop for section name              |



## Verification Checklist

- [ ] `npm run build` succeeds
- [ ] All TypeScript errors resolved
- [ ] `out/` contains `.html` for the page
- [ ] Title and meta description are set
- [ ] No console errors when served
