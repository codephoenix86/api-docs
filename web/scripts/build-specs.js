/**
 * Build pipeline entry point.
 *
 * Reads every API folder under /specs, normalizes it, and writes:
 *   web/src/generated/registry.json
 *   web/src/generated/apis/<slug>.json
 *   web/src/generated/search.json
 *
 * Run via `npm run build:specs` (or implicitly through `prebuild` before `vite build`).
 * Also imported by vite-plugin-specs.js for HMR-driven re-runs in dev.
 */
import { readdir, mkdir, writeFile, stat, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeApi } from './lib/normalize-api.js'
import { buildSearchCorpus } from './lib/search-index.js'
import { disposeHighlighter } from './lib/highlight.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const SPECS_DIR = path.join(REPO_ROOT, 'specs')
const OUT_DIR = path.resolve(__dirname, '../src/generated')
const APIS_OUT_DIR = path.join(OUT_DIR, 'apis')

export async function buildAll({ quiet = false } = {}) {
  const t0 = Date.now()
  await mkdir(APIS_OUT_DIR, { recursive: true })

  const slugs = await listApis()
  if (!quiet) console.log(`[specs] found ${slugs.length} API folder(s): ${slugs.join(', ')}`)

  const apis = []
  for (const slug of slugs) {
    const specDir = path.join(SPECS_DIR, slug)
    const result = await normalizeApi(specDir, slug)
    apis.push(result)
  }

  const registry = apis.map(({ api }) => ({
    slug: api.slug,
    name: api.name,
    tagline: api.tagline,
    brand: api.brand,
    version: api.version,
    summary: api.summary,
    hasRest: api.hasRest,
    hasAsync: api.hasAsync,
    restCount: api.rest?.operations?.length ?? 0,
    asyncCount: api.async?.operations?.length ?? 0,
    schemaCount: api.schemaIndex.length,
    guides: api.guides.map((g) => ({ slug: g.slug, title: g.title })),
  }))
  await writeFile(path.join(OUT_DIR, 'registry.json'), JSON.stringify(registry, null, 2))

  for (const { api } of apis) {
    await writeFile(path.join(APIS_OUT_DIR, `${api.slug}.json`), JSON.stringify(api))
  }

  const corpus = buildSearchCorpus(apis)
  await writeFile(path.join(OUT_DIR, 'search.json'), JSON.stringify(corpus))

  await disposeHighlighter()

  if (!quiet) {
    const ms = Date.now() - t0
    const totalOps = apis.reduce((n, { api }) => n + (api.rest?.operations?.length ?? 0) + (api.async?.operations?.length ?? 0), 0)
    console.log(`[specs] built ${apis.length} API(s), ${totalOps} operations, ${corpus.length} search docs in ${ms} ms`)
  }
  return { apis, registry, corpus }
}

export async function buildOne(slug) {
  await mkdir(APIS_OUT_DIR, { recursive: true })
  const specDir = path.join(SPECS_DIR, slug)
  const result = await normalizeApi(specDir, slug)
  await writeFile(path.join(APIS_OUT_DIR, `${result.api.slug}.json`), JSON.stringify(result.api))
  return result
}

async function listApis() {
  try {
    const entries = await readdir(SPECS_DIR)
    const out = []
    for (const e of entries) {
      const s = await stat(path.join(SPECS_DIR, e))
      if (s.isDirectory()) out.push(e)
    }
    return out.sort()
  } catch {
    return []
  }
}

export const PATHS = { REPO_ROOT, SPECS_DIR, OUT_DIR, APIS_OUT_DIR }

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isMain) {
  buildAll().catch((err) => {
    console.error('[specs] build failed:', err)
    process.exit(1)
  })
}
