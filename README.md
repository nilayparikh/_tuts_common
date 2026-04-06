# LocalM Common (`_tuts_common`)

Shared libraries, components, AI agent configurations, and tooling used across all LocalM tutorial sites.

## What's in here

| Directory                      | Purpose                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| `frontend/tutorial-framework/` | `@localm/tutorial-framework` — React component library (40+ components) |
| `.github/agents/`              | Copilot Chat agent definitions                                          |
| `.github/instructions/`        | AI coding assistant rules (auto-applied)                                |
| `.github/prompts/`             | Reusable prompt templates                                               |
| `.github/skills/`              | 14 pre-installed Copilot agent skills                                   |
| `docs/`                        | Full documentation                                                      |

## Tutorial Framework

The main deliverable is `@localm/tutorial-framework` — a zero-dependency React component library for building static tutorial websites with Material Design 3.

**40+ components** covering layout, content, course navigation, embeds, quizzes, interactive polls, and social sharing.

See [`docs/tutorial-framework.md`](docs/tutorial-framework.md) for the full component + token reference.

## How Tutorial Sites Use This

Tutorial repos (e.g. <a href="https://github.com/nilayparikh/_tuts" target="_blank" rel="noopener noreferrer">`_tuts`</a>) include this as a **git submodule** at `_common/`:

```gitmodules
[submodule "_common"]
    path = _common
    url = https://github.com/nilayparikh/_tuts_common.git
```

The framework is linked in `package.json` via:

```json
"@localm/tutorial-framework": "file:./_common/frontend/tutorial-framework"
```

### Development

Next.js transpiles the framework from source via `transpilePackages` + Turbopack alias — **no pre-build needed during dev**. Changes to components in `_common/` are reflected instantly in the tutorial site's dev server.

### Syncing Updates

```powershell
# From the tutorial repo (_tuts/)
./scripts/sync-common.ps1

# Then commit the updated submodule pointer
git add _common
git commit -m "chore: update _common submodule"
```

### CI/CD

GitHub Actions checks out the submodule automatically:

```yaml
- uses: actions/checkout@v4
  with:
    submodules: recursive
```

## Documentation

| Document                                                                         | Content                               |
| -------------------------------------------------------------------------------- | ------------------------------------- |
| [`docs/README.md`](docs/README.md)                                               | Full \_common structure + usage guide |
| [`docs/tutorial-framework.md`](docs/tutorial-framework.md)                       | Component API + design tokens         |
| [`frontend/tutorial-framework/README.md`](frontend/tutorial-framework/README.md) | Quick start + component catalogue     |

## License

MIT
