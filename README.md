# LocalM Common

Shared libraries, components, and tooling used across all LocalM tutorial sites.

## What's in here

| Directory                      | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| `frontend/tutorial-framework/` | `@localm/tutorial-framework` — React component library |
| `.github/instructions/`        | AI coding assistant rules                              |
| `.github/skills/`              | Copilot agent skills                                   |
| `docs/`                        | Full documentation                                     |

## Tutorial Framework

The main deliverable is `@localm/tutorial-framework` — a zero-dependency React component library for building static tutorial websites.

**30+ components** covering layout, content, course navigation, embeds, quizzes, and social sharing.

See [`docs/tutorial-framework.md`](docs/tutorial-framework.md) for the full reference.

## Usage

Tutorial template repos (like `_tuts/`) include a **vendored copy** of the framework at `packages/tutorial-framework/`. To sync updates:

```powershell
# From the template repo
./scripts/sync-common.ps1
```

## License

MIT
