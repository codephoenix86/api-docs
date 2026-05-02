# api-docs

A multi-API documentation portal. Specs live in `specs/<api>/`; a custom React + Vite + Tailwind frontend in `web/` renders them into a fast, beautiful, dark-mode-aware site that ships to GitHub Pages on every push to `main`.

## Today

| API | Spec | Highlights |
| --- | --- | --- |
| **fastchat** | [`specs/fastchat`](specs/fastchat/) | OpenAPI 3.1 (REST) + AsyncAPI 2.6 (Socket.io) |

## Repo layout

```
specs/<api>/
  openapi.yaml        # REST surface (optional)
  asyncapi.yaml       # WebSocket surface (optional)
  meta.json           # display name, slug, brand, repo URL
  overview.md         # API landing page
  guides/*.md         # long-form guides
  changelog.md
  errors.md

web/                  # Vite + React + Tailwind app
  scripts/build-specs.js   # parses + dereferences + normalizes every spec at build time
  src/components/...        # custom UI
  src/pages/...
  src/lib/spec/...          # runtime spec helpers
```

## Local development

```bash
cd web
npm install
npm run dev          # http://localhost:5173
```

The dev server runs the spec build pipeline on startup, then watches `specs/**/*` and reloads on every change.

```bash
npm run build:specs  # one-shot rebuild of generated/ JSON
npm run build        # full production build (runs build:specs first via prebuild)
npm run preview      # serve the production build
```

To preview the production build under the GitHub Pages base path:

```bash
npm run build && npm run preview -- --base /api-docs/
```

## Adding another API

1. Create `specs/<new-api>/` with at least an `openapi.yaml` (or `asyncapi.yaml`) and a `meta.json`.
2. Optionally add `overview.md`, `guides/*.md`, `changelog.md`, `errors.md`.
3. Run `npm run dev` — the new API appears in the sidebar API switcher and gets its own routes automatically.

No router changes, no UI changes. The build pipeline picks it up.

## Deployment

`main` → GitHub Actions → GitHub Pages, via `.github/workflows/deploy.yml`. Specs are linted with [Spectral](https://github.com/stoplightio/spectral) on every PR via `.github/workflows/lint-specs.yml`.

## Tech

- React 18, React Router 6, Vite 6, Tailwind v4 (CSS-first config).
- Build-time: `yaml`, `@apidevtools/json-schema-ref-parser`, `unified` + remark/rehype, `shiki`.
- Runtime: `minisearch` (Cmd-K palette), `lucide-react` (icons), `clsx`.
- All `$ref` resolution, markdown rendering, and Shiki highlighting happen at build time. The browser ships pre-built JSON and pre-highlighted HTML — no parser dep at runtime.
