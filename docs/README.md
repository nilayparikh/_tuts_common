# \_common — Shared Libraries & Tooling

Shared, reusable code, AI agent configurations, and documentation used across **all** LocalM tutorial sites.

**Repository**: <a href="https://github.com/nilayparikh/_tuts_common" target="_blank" rel="noopener noreferrer">`nilayparikh/_tuts_common`</a>

## What's Inside

```
_common/
├── .agents/
│   └── skills/                   # Discoverable agent skills (VS Code)
├── .github/
│   ├── agents/                   # Copilot Chat agent definitions
│   │   └── tutorial-framework.agent.md
│   ├── instructions/             # AI coding assistant rules
│   │   └── tutorial-framework.instructions.md
│   ├── prompts/                  # Reusable prompt templates
│   │   └── tutorial-framework.prompt.md
│   └── skills/                   # Copilot agent skills (14 skills)
├── frontend/
│   └── tutorial-framework/       # @localm/tutorial-framework (React component library)
│       ├── src/
│       │   ├── components/       # All UI components (layout, content, course, embeds, sharing)
│       │   ├── theme/            # Design tokens, global styles, palette, ThemeProvider
│       │   └── index.ts          # Single public entry point — all exports
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md             # Component catalogue + quick start
├── docs/
│   ├── README.md                 # ← You are here
│   └── tutorial-framework.md     # Full component + token reference
├── skills-lock.json              # Lock file for installed Copilot skills
└── README.md                     # Repo overview
```

---

## Packages

### `@localm/tutorial-framework`

Zero-dependency React component library for building tutorial static sites. Material Design 3 dark theme with fluid typography.

| Fact                | Value                                                                        |
| ------------------- | ---------------------------------------------------------------------------- |
| **Location**        | [`frontend/tutorial-framework/`](../frontend/tutorial-framework/)            |
| **Public API**      | [`src/index.ts`](../frontend/tutorial-framework/src/index.ts)                |
| **Full reference**  | [`docs/tutorial-framework.md`](tutorial-framework.md)                        |
| **Component count** | 40+ (layout, content, course, embeds, sharing, theme)                        |
| **Dependencies**    | Zero — only `react` and `react-dom` as peer deps                             |
| **Build tool**      | `tsup` (for production); Next.js transpiles from source in dev via Turbopack |

#### Component Groups

| Group   | Components                                                                                                           |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| Layout  | `TutorialLayout`, `TutorialHeader`, `TutorialFooter`, `SidebarLayout`, `ThemeSelector`                               |
| Content | `HeroSection`, `ConceptCard`, `ConceptGrid`, `StepCard`, `StepList`, `CodeBlock`, `KeyPoint`, `SectionDivider`, etc. |
| Course  | `CoursePlayerLayout`, `CourseSidebar`, `LessonHeader`, `LessonList`, `QuizBlock`, `QABlock`, `ArticleBlock`, etc.    |
| Embeds  | `YouTubeEmbed`, `GitHubGistEmbed`, `TwitterEmbed`, `LinkedInEmbed`                                                   |
| Sharing | `ShareButtons`                                                                                                       |
| Theme   | `TutorialGlobalStyles`, `ThemeProvider`, `palette`, `tokens`                                                         |

---

## AI Agent Configurations

### Instructions (`.github/instructions/`)

Auto-applied rules for AI coding assistants when working on tutorial files. These enforce:

- Framework-only component usage (no raw HTML)
- Static export compliance (no server-side code)
- `--tf-*` CSS token system (no hardcoded colours/spacing)
- SEO metadata requirements
- Responsive design rules

### Agents (`.github/agents/`)

**`tutorial-framework`** — specialised agent for creating and maintaining tutorial pages. Knows the full component API, prop signatures, and architectural constraints.

### Prompts (`.github/prompts/`)

**`tutorial-framework`** — reusable prompt template for creating/updating tutorial pages. Accepts topic, slug, and content description as inputs.

### Skills (`.github/skills/`)

14 pre-installed Copilot skills covering brand guidelines, frontend design, component building, testing, web design review, and more. See `skills-lock.json` for the full list and sources.

---

## How Tutorial Sites Consume \_common

Tutorial repos (e.g. `_tuts`) include `_common` as a **git submodule**. This provides:

1. **Single source of truth** — framework code lives in one repo
2. **Source-linked development** — Next.js transpiles TypeScript directly from `_common/` via Turbopack alias
3. **No pre-build in dev** — changes to framework components are reflected instantly
4. **Self-contained forks** — `git clone --recurse-submodules` gives a fully working site

### Submodule Configuration (in `_tuts`)

```gitmodules
[submodule "_common"]
    path = _common
    url = https://github.com/nilayparikh/_tuts_common.git
```

```json
// package.json
"@localm/tutorial-framework": "file:./_common/frontend/tutorial-framework"
```

### Sync Workflow

```powershell
# From the _tuts/ directory — pulls latest _common commits
./scripts/sync-common.ps1

# Then commit the updated submodule pointer
git add _common
git commit -m "chore: update _common submodule"
```

### CI/CD (GitHub Actions)

```yaml
- uses: actions/checkout@v4
  with:
    submodules: recursive # ← fetches _common automatically
```

---

## When to Edit \_common vs \_tuts

| Change                               | Where to edit           | Then do                                 |
| ------------------------------------ | ----------------------- | --------------------------------------- |
| New/updated UI component             | `_common`               | Push, then `sync-common.ps1` in `_tuts` |
| New design token (`--tf-*`)          | `_common`               | Push, then `sync-common.ps1` in `_tuts` |
| Framework docs or agent instructions | `_common`               | Push, then `sync-common.ps1` in `_tuts` |
| Site-specific page content           | `_tuts`                 | Commit directly                         |
| Site config (header, footer, nav)    | `_tuts`                 | Commit directly                         |
| Token overrides for one site         | `_tuts/globals.css`     | Commit directly                         |
| New Copilot skill (shared)           | `_common`               | Push, then `sync-common.ps1` in `_tuts` |
| Site-specific skill                  | `_tuts/.github/skills/` | Commit directly                         |

---

## Development Workflow

### Working on the framework

```bash
cd _common/frontend/tutorial-framework

# Edit components in src/components/
# Edit tokens in src/theme/
# All exports go through src/index.ts

# The tutorial site's dev server picks up changes instantly
# (no build step needed — Next.js transpiles from source)
```

### Production build

```bash
cd _common/frontend/tutorial-framework
npm install
npm run build   # tsup bundles to dist/
```

### Adding a new component

1. Create component in the appropriate `src/components/<group>/` directory
2. Export from the group's `index.ts`
3. Export from the root `src/index.ts`
4. Update `docs/tutorial-framework.md`
5. Push to `_tuts_common`, then sync in tutorial repos
