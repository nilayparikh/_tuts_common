# common/ — Shared Libraries

Shared, reusable code and assets used across **all** LocalM tutorial sites.

## Structure

```
common/
├── .github/
│   ├── instructions/         # AI coding assistant rules
│   │   ├── base.instructions.md
│   │   └── tutorial-framework.instructions.md
│   └── skills/               # Copilot agent skills
├── frontend/
│   └── tutorial-framework/   # @localm/tutorial-framework React component library
│       ├── src/
│       │   ├── components/   # All UI components
│       │   ├── theme/        # Design tokens, global styles, palette
│       │   └── index.ts      # Public API
│       ├── package.json
│       └── README.md         # Component catalogue + quick start
└── docs/                     # This directory — documentation
```

## Packages

### `@localm/tutorial-framework`

Zero-dependency React component library for building tutorial static sites.

- **Location**: [`frontend/tutorial-framework/`](../frontend/tutorial-framework/)
- **README**: [`frontend/tutorial-framework/README.md`](../frontend/tutorial-framework/README.md)
- **Docs**: [`docs/tutorial-framework.md`](tutorial-framework.md)

## How Template Sites Consume This

Each tutorial template repo (e.g. `_tuts/`) includes a **vendored copy** of the framework at `packages/tutorial-framework/`. This keeps the template self-contained — anyone who forks it gets a working site without needing access to this repo.

### Sync workflow

When you update components in `common/frontend/tutorial-framework/`, run the sync script in the template repo to copy changes:

```bash
# From the _tuts/ directory
./scripts/sync-common.ps1
```

See the [template repo docs](../../_tuts/docs/README.md) for the full update workflow.
