import { readFile } from 'node:fs/promises'
import YAML from 'yaml'
import RefParser from '@apidevtools/json-schema-ref-parser'

export async function loadYaml(filePath) {
  const raw = await readFile(filePath, 'utf8')
  return YAML.parse(raw)
}

/**
 * Dereference $refs while preserving named component references as { $ref: '#/components/schemas/<name>' }
 * tokens for OpenAPI schemas, so the renderer can link to them. Other refs (parameters, responses)
 * are resolved inline.
 */
export async function dereferenceOpenApi(filePath) {
  const doc = await loadYaml(filePath)
  // We don't use full $RefParser.dereference — we want named-schema $refs to remain visible.
  // Strategy: bundle (resolve external refs only, keep internal pointers), then walk and resolve
  // every internal ref except those into components/schemas.
  const bundled = await RefParser.bundle(doc)
  const schemasNode = bundled?.components?.schemas ?? {}
  return resolveExceptSchemas(bundled, bundled, schemasNode)
}

export async function dereferenceAsyncApi(filePath) {
  const doc = await loadYaml(filePath)
  const bundled = await RefParser.bundle(doc)
  const schemasNode = bundled?.components?.schemas ?? {}
  return resolveExceptSchemas(bundled, bundled, schemasNode)
}

const SCHEMA_REF_PREFIX = '#/components/schemas/'

function resolveExceptSchemas(node, root, schemasNode, seen = new WeakMap()) {
  if (node === null || typeof node !== 'object') return node
  if (seen.has(node)) return seen.get(node)

  if (Array.isArray(node)) {
    const out = []
    seen.set(node, out)
    for (const item of node) out.push(resolveExceptSchemas(item, root, schemasNode, seen))
    return out
  }

  if (typeof node.$ref === 'string') {
    if (node.$ref.startsWith(SCHEMA_REF_PREFIX)) {
      // Keep the schema $ref intact so the normalizer can emit { kind: 'ref', name }.
      return node
    }
    const resolved = resolvePointer(root, node.$ref)
    return resolveExceptSchemas(resolved, root, schemasNode, seen)
  }

  const out = {}
  seen.set(node, out)
  for (const key of Object.keys(node)) {
    out[key] = resolveExceptSchemas(node[key], root, schemasNode, seen)
  }
  return out
}

function resolvePointer(root, ref) {
  if (!ref.startsWith('#/')) return undefined
  const parts = ref.slice(2).split('/').map(decodePointer)
  let cur = root
  for (const p of parts) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = cur[p]
  }
  return cur
}

function decodePointer(s) {
  return s.replace(/~1/g, '/').replace(/~0/g, '~')
}
