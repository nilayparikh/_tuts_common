---
applyTo: "**"
---

# LocalM Media Mods - AI Development Guidelines

## Project Overview

LocalM Media Mods is a **Modular Local Media Modification Platform** built with Python FastAPI backends and React TypeScript frontends. It provides a collection of standalone mini-apps for video/audio processing, all sharing a common design system and utilities.

## Architecture

Each app is **standalone** with its own frontend and backend:

```
voice_clone_translate/
├── .github/                      # AI agents, instructions, prompts, skills
├── .vscode/                      # VS Code tasks & launch configs
├── apps/                         # Standalone applications
│   ├── static_auto_clip/         # Video clipping (8080/5173)
│   │   ├── backend/              # FastAPI server
│   │   ├── frontend/             # React app
│   │   ├── docs/                 # App documentation
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   ├── audio_studio/             # Audio enhancement (8081/5175)
│   └── q3tts/                    # Text-to-speech (8082/5176)
├── common/                       # Shared libraries
│   ├── frontend/                 # MUI theme, layouts, components
│   └── backend/                  # FFmpeg utilities, logging
├── projects/                     # User project storage
└── docs/                         # Platform documentation
```

## Core Architectural Principles

1. **Standalone Apps** - Each app runs independently with own frontend/backend
2. **Shared Common** - All apps use common theme and utilities
3. **Local Processing** - All media processing happens locally (no cloud)
4. **Type Safety** - Python type hints and TypeScript strict mode
5. **Docker Ready** - Each app has Dockerfile for deployment

## Technology Stack

### Backends

- Python 3.12, FastAPI, Uvicorn, FFmpeg, Pydantic

### Frontends

- React 19, TypeScript, MUI v7, Vite 6

### Testing

- Pytest (backend tests)
- Playwright (E2E tests)

## Service Ports

| App              | Backend | Frontend | Description         |
| ---------------- | ------- | -------- | ------------------- |
| Static Auto Clip | 8080    | 5173     | Video clipping      |
| Audio Studio     | 8081    | 5175     | Audio enhancement   |
| Q3TTS            | 8082    | 5176     | Text-to-speech      |
| Touch Up         | 8083    | 5177     | Facial enhancement  |
| Audio Visualiser | 8084    | 5178     | Audio visualization |
| Audio Caption    | 8085    | 5179     | Caption banners     |
| Banner Generator | 8086    | 5180     | Social banners      |
| Audio Deep       | 8088    | 5180     | Voice conversion    |

## Mini-Apps

### Static Auto Clip (SAC)

Video clipping with scene detection and multi-aspect ratio export.

**Location**: `apps/static_auto_clip/`
**Features**: Video upload, scene detection, crop positioning, multi-ratio export

### Audio Studio

Studio-grade audio enhancement with noise removal and voice processing.

**Location**: `apps/audio_studio/`
**Features**: Media upload, enhancement, diarization, voice cloning

### Q3TTS

Text-to-speech with voice cloning using Qwen3-TTS.

**Location**: `apps/q3tts/`
**Features**: Text input, voice cloning, voice design

### Touch Up

High-speed video facial enhancement with GPU-accelerated processing.

**Location**: `apps/touch_up/`
**Features**: Face detection, skin smoothing, color correction

### Audio Visualiser (VibeWave)

Audio visualization with FFT analysis and customizable wave types.

**Location**: `apps/audio_visualiser/`
**Features**: Audio upload, waveform analysis, video generation

### Audio Caption (StripCap)

Video/audio captioning with extreme aspect ratio banners.

**Location**: `apps/audio_caption/`
**Features**: Transcription, SRT editing, Remotion rendering

### Banner Generator (VibeBanner)

Social media banner generation with React templates.

**Location**: `apps/banner_generator/`
**Features**: Template selection, theme customization, multi-platform export

### Audio Deep (Deep Voice Studio)

AI voice conversion with studio effects.

**Location**: `apps/audio_deep/`
**Features**: RVC voice conversion, Pedalboard effects, quick profiles

## Common Frontend Component Standards (MANDATORY)

All apps **MUST** use shared components from `common/frontend/` via the `@common` alias. Local implementations of generic UI patterns are **forbidden**. See `docs/ui/consistency.md` for full details.

### Required Components

| Category     | Components                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**   | `PageLayout`, `AppBar`, `EditorLayout`, `UploadPage`, `UploadView`, `SettingsPanel`, `SplitLayout`                                          |
| **Cards**    | `SectionCard`, `FieldLabel`, `AppCard`, `PageCard`                                                                                          |
| **Controls** | `SliderControl`, `SelectControl`, `SwitchControl`, `CheckboxControl`, `SettingsAccordion`, `ActionButton`, `IconActionButton`, `StatusChip` |
| **Media**    | `ProcessingStatus`, `MediaInfoChips`                                                                                                        |
| **Projects** | `ProjectBrowser`, `createProjectClient`                                                                                                     |
| **Theme**    | `theme`, `BRAND_COLORS`, `BRAND_PRESETS`, design tokens (`colors`, `spacing`, `radius`, `typography`)                                       |

### Forbidden Patterns

- ❌ Raw MUI `AppBar`, `Slider`, `Select`, `Switch`, `Accordion` when common wrappers exist
- ❌ Local style files duplicating common layouts (e.g., `styles.ts` with `uploadZone`, `pageLayout`)
- ❌ Custom `useDropzone` inline implementations — use `UploadPage` or `UploadView`
- ❌ Local branding/theme files duplicating `common/frontend/branding.ts`
- ❌ Alternative icon libraries (e.g., `lucide-react`) — use `@mui/icons-material` only
- ❌ Custom flex-based editor splits — use `EditorLayout` or `SplitLayout`

### Reference Implementation

`apps/audio_deep/frontend/src/pages/MainPage.tsx` is the **gold standard** — uses 12+ common components correctly. All other apps must follow this pattern.

## Common Commands

```bash
# Start an app (example: Audio Studio)
# Use VS Code tasks: "Audio: Start All"

# Or manually:
# Terminal 1 - Backend
python -m uvicorn apps.audio_studio.backend.main:app --port 8081 --reload

# Terminal 2 - Frontend
cd apps/audio_studio/frontend && npm run dev

# Run all backend tests
python -m pytest -v apps/*/backend/tests

# Run specific app tests
python -m pytest -v apps/audio_studio/backend/tests
```

## Adding a New App

1. Create `apps/<app_name>/backend/` with FastAPI server
2. Create `apps/<app_name>/frontend/` with React app
3. Create `apps/<app_name>/docs/` with documentation
4. Add Dockerfile and docker-compose.yml
5. Update `.vscode/tasks.json` with app tasks
6. Update `.vscode/launch.json` with debug configs
7. Add instructions in `.github/instructions/<app_name>.instructions.md`

## Development Skills Reference

For best practices and development workflows, refer to these skills in `.github/skills/`:

| Skill                              | When to Use                                                            |
| ---------------------------------- | ---------------------------------------------------------------------- |
| **test-driven-development**        | Before implementing any feature or bugfix - follow RED-GREEN-REFACTOR  |
| **systematic-debugging**           | When debugging issues - follow root cause investigation process        |
| **verification-before-completion** | Before marking any task complete - verify all claims with evidence     |
| **react-best-practices**           | When modifying React components - 45 rules across 8 categories         |
| **webapp-testing**                 | When writing Playwright E2E tests - reconnaissance-then-action pattern |
| **writing-plans**                  | When planning multi-step implementations - create bite-sized tasks     |
| **docker-deploy**                  | When building/deploying apps with `scripts/docker-deploy.ps1`          |

### Key Principles from Skills

1. **No production code without a failing test** (TDD)
2. **No fixes without root cause investigation** (Debugging)
3. **Evidence before claims** (Verification)
4. **Wait for networkidle before DOM inspection** (E2E Testing)
5. **Frequent commits with atomic changes** (Development)

### Change Acceptance Criteria (MANDATORY)

Before claiming ANY code change is complete, you MUST verify:

#### 1. No Errors (Lint & TypeScript)

- Run `get_errors` on modified files - MUST show no errors
- No lint warnings or errors in terminal output

#### 2. Backend Tests Pass (if backend modified)

```bash
python -m pytest -v apps/<app_name>/backend/tests
```

#### 3. E2E Tests Pass (for ALL frontend/UI changes)

```bash
# For Docker (preferred - tests against production build):
cd apps/<app_name>/frontend
$env:BASE_URL="http://localhost:<docker_port>"; npx playwright test --reporter=list

# For development server:
cd apps/<app_name>/frontend
npx playwright test --reporter=list
```

- ALL tests MUST pass (no failures)
- For major changes, rebuild Docker: `docker compose build --no-cache && docker compose up -d`

#### 4. Runtime Verification

- **Browser test**: Navigate to the page - MUST load without console errors
- **Runtime null safety**: All async data accessed with optional chaining (`?.`)
- **API interface match**: TypeScript interface MUST match actual API response structure exactly
- **Initial state**: Test page load BEFORE data arrives (loading states, null checks)

#### Test Scope Guidelines

| Change Type     | Required Tests                               |
| --------------- | -------------------------------------------- |
| Bug fix         | Related test suite                           |
| UI component    | E2E tests for affected page                  |
| API endpoint    | Backend unit tests + E2E if frontend uses it |
| New feature     | Full E2E suite for the app                   |
| Template change | E2E + visual check in browser                |

**Common pitfalls to verify against:**

- `capabilities.foo.bar` when `capabilities` is null initially → Use `capabilities?.foo?.bar`
- Interface says `denoising` but API returns `denoise` → Verify exact property names
- TypeScript compiles but page crashes → ALWAYS test in browser
- Docker has stale code → Rebuild with `--no-cache` before testing
