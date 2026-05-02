import registry from '@/generated/registry.json'

/** @typedef {import('./types.js').RegistryEntry} RegistryEntry */
/** @typedef {import('./types.js').NormalizedApi} NormalizedApi */

/** @returns {RegistryEntry[]} */
export function getRegistry() {
  return registry
}

/** @returns {RegistryEntry | undefined} */
export function getRegistryEntry(slug) {
  return registry.find((r) => r.slug === slug)
}

const apiCache = new Map()

/**
 * Lazily load an API's normalized JSON. Vite splits each `apis/<slug>.json` into its own chunk.
 * @returns {Promise<NormalizedApi>}
 */
export async function loadApi(slug) {
  if (!getRegistryEntry(slug)) throw new Error(`Unknown API: ${slug}`)
  if (apiCache.has(slug)) return apiCache.get(slug)
  const mod = await import(`@/generated/apis/${slug}.json`)
  const api = mod.default ?? mod
  apiCache.set(slug, api)
  return api
}
