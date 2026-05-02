/**
 * Base-path-aware URL helpers. All in-app navigation should go through these so that the
 * GitHub Pages base prefix (/<repo>/) is applied transparently.
 */

const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '')

export function withBase(p) {
  if (!p) return BASE + '/'
  if (/^https?:\/\//.test(p)) return p
  if (p.startsWith(BASE + '/')) return p
  return BASE + (p.startsWith('/') ? p : `/${p}`)
}

export function operationUrl(slug, op) {
  return `/${slug}/rest/${encodeURIComponent(op.tag)}/${op.id}`
}

export function asyncOperationUrl(slug, op) {
  return `/${slug}/events/${op.id}`
}

export function schemaUrl(slug, schemaName) {
  return `/${slug}/schemas/${schemaName}`
}

export function tagUrl(slug, tag) {
  return `/${slug}/rest/${encodeURIComponent(tag)}`
}

export function guideUrl(slug, guideSlug) {
  return `/${slug}/guides/${guideSlug}`
}

export function apiHomeUrl(slug) {
  return `/${slug}`
}
