import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { dereferenceOpenApi, dereferenceAsyncApi } from './parse-yaml.js'
import { normalizeSchema } from './normalize-schema.js'
import { renderMarkdown, deriveTitle, extractToc } from './markdown.js'
import { synthesizeExample } from './example-synth.js'
import { generateRestSamples, generateAsyncSamples } from './code-samples.js'
import { highlight } from './highlight.js'

export async function normalizeApi(specDir, slug) {
  const meta = await readJson(path.join(specDir, 'meta.json'))
  const restPath = path.join(specDir, 'openapi.yaml')
  const asyncPath = path.join(specDir, 'asyncapi.yaml')

  const restDoc = await fileExists(restPath) ? await dereferenceOpenApi(restPath) : null
  const asyncDoc = await fileExists(asyncPath) ? await dereferenceAsyncApi(asyncPath) : null

  if (!restDoc && !asyncDoc) {
    throw new Error(`No openapi.yaml or asyncapi.yaml in ${specDir}`)
  }

  // ---- Schemas (combined REST + Async, since AsyncAPI also has a Message component)
  const schemas = {}
  if (restDoc?.components?.schemas) {
    for (const [name, sub] of Object.entries(restDoc.components.schemas)) {
      schemas[name] = normalizeSchema(sub)
    }
  }
  if (asyncDoc?.components?.schemas) {
    for (const [name, sub] of Object.entries(asyncDoc.components.schemas)) {
      // Don't overwrite a REST-side schema with the same name (REST is canonical).
      if (!schemas[name]) schemas[name] = normalizeSchema(sub)
    }
  }
  const schemaIndex = Object.keys(schemas).sort((a, b) => a.localeCompare(b))

  // ---- Security schemes
  const security = {
    schemes: restDoc?.components?.securitySchemes ?? asyncDoc?.components?.securitySchemes ?? {},
    defaults: extractSecurityDefaults(restDoc?.security),
  }

  // ---- REST: tags + operations
  const rest = await normalizeRest(restDoc, slug, security, schemas)

  // ---- Async: channels + operations
  const async = await normalizeAsync(asyncDoc, schemas)

  // ---- Errors mined from response examples
  const errors = mineErrors(restDoc)

  // ---- Markdown content
  const overviewMd = await readFileOrEmpty(path.join(specDir, 'overview.md'))
  const changelogMd = await readFileOrEmpty(path.join(specDir, 'changelog.md'))
  const errorsMd = await readFileOrEmpty(path.join(specDir, 'errors.md'))
  const overviewHtml = await renderMarkdown(overviewMd)
  const changelogHtml = await renderMarkdown(changelogMd)
  const errorsHtml = await renderMarkdown(errorsMd)

  const guides = await loadGuides(path.join(specDir, 'guides'))

  const descriptionHtml = await renderMarkdown(restDoc?.info?.description ?? asyncDoc?.info?.description ?? '')

  return {
    meta,
    api: {
      slug,
      name: meta.name ?? slug,
      tagline: meta.tagline ?? '',
      brand: meta.brand ?? '#5b5bd6',
      version: restDoc?.info?.version ?? asyncDoc?.info?.version ?? '',
      summary: restDoc?.info?.summary ?? asyncDoc?.info?.summary ?? '',
      descriptionHtml,
      servers: extractServers(restDoc, asyncDoc),
      security,
      rest,
      async,
      schemas,
      schemaIndex,
      errors,
      guides,
      overviewHtml,
      changelogHtml,
      errorsHtml,
      hasRest: Boolean(rest && rest.operations.length),
      hasAsync: Boolean(async && async.operations.length),
    },
  }
}

async function normalizeRest(restDoc, slug, security, schemas) {
  if (!restDoc) return { tags: [], operations: [] }
  const tagDocs = restDoc.tags ?? []
  const tags = []
  for (const t of tagDocs) {
    tags.push({ name: t.name, descriptionHtml: await renderMarkdown(t.description ?? '') })
  }
  const server = restDoc.servers?.[0]?.url ?? 'http://localhost:3000'

  const operations = []
  const paths = restDoc.paths ?? {}
  const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete']

  for (const [pathStr, pathItem] of Object.entries(paths)) {
    const sharedParams = (pathItem.parameters ?? []).map(normalizeParameter)
    for (const method of HTTP_METHODS) {
      const op = pathItem[method]
      if (!op) continue
      const opParams = [...sharedParams, ...((op.parameters ?? []).map(normalizeParameter))]
      const opSecurity = op.security !== undefined
        ? extractSecurityDefaults(op.security)
        : security.defaults

      // Augment param with description html
      for (const p of opParams) {
        p.descriptionHtml = await renderMarkdown(p.description ?? '')
      }

      const requestBody = await normalizeRequestBody(op.requestBody, schemas)
      const responses = await normalizeResponses(op.responses, schemas)

      const sampleBody = pickSampleBody(requestBody)
      const samples = generateRestSamples({
        method,
        path: pathStr,
        server,
        parameters: opParams,
        body: sampleBody,
        security: opSecurity,
      })
      const samplesHtml = {}
      for (const [k, raw] of Object.entries(samples)) {
        samplesHtml[k] = { raw, html: await highlight(raw, k) }
      }

      operations.push({
        id: op.operationId ?? `${method}_${pathStr}`,
        method,
        path: pathStr,
        tag: op.tags?.[0] ?? 'Other',
        summary: op.summary ?? '',
        descriptionHtml: await renderMarkdown(op.description ?? ''),
        deprecated: Boolean(op.deprecated),
        security: opSecurity,
        parameters: opParams,
        requestBody,
        responses,
        samples: samplesHtml,
      })
    }
  }
  return { tags, operations }
}

function normalizeParameter(p) {
  return {
    in: p.in,
    name: p.name,
    required: Boolean(p.required),
    description: p.description ?? '',
    descriptionHtml: '',
    schema: p.schema ? normalizeSchema(p.schema) : { kind: 'primitive', type: 'string' },
    example: p.example,
  }
}

async function normalizeRequestBody(rb, schemas) {
  if (!rb) return undefined
  const contents = []
  for (const [mediaType, media] of Object.entries(rb.content ?? {})) {
    const schema = media.schema ? normalizeSchema(media.schema) : { kind: 'primitive', type: 'string' }
    const examples = collectExamples(media)
    contents.push({ mediaType, schema, examples })
  }
  return { required: Boolean(rb.required), contents, descriptionHtml: await renderMarkdown(rb.description ?? '') }
}

async function normalizeResponses(responses, schemas) {
  const out = []
  if (!responses) return out
  for (const [status, resp] of Object.entries(responses)) {
    const contents = []
    for (const [mediaType, media] of Object.entries(resp.content ?? {})) {
      const schema = media.schema ? normalizeSchema(media.schema) : { kind: 'primitive', type: 'string' }
      const examples = collectExamples(media)
      // synthesize example if absent
      if (examples.length === 0) {
        const synth = synthesizeExample(schema, schemas)
        if (synth !== null) examples.push({ name: 'default', summary: '', value: synth })
      }
      // pre-render JSON example HTML
      for (const ex of examples) {
        const json = JSON.stringify(ex.value, null, 2)
        ex.json = json
        ex.html = await highlight(json, 'json')
      }
      contents.push({ mediaType, schema, examples })
    }
    out.push({
      status,
      descriptionHtml: await renderMarkdown(resp.description ?? ''),
      headers: resp.headers ? Object.entries(resp.headers).map(([name, h]) => ({ name, description: h.description ?? '', schema: h.schema ? normalizeSchema(h.schema) : null })) : undefined,
      contents,
    })
  }
  return out
}

function collectExamples(media) {
  const out = []
  if (media.example !== undefined) {
    out.push({ name: 'default', summary: '', value: media.example })
  }
  if (media.examples && typeof media.examples === 'object') {
    for (const [name, ex] of Object.entries(media.examples)) {
      out.push({ name, summary: ex.summary ?? '', value: ex.value })
    }
  }
  return out
}

function pickSampleBody(requestBody) {
  if (!requestBody) return null
  const c = requestBody.contents[0]
  if (!c) return null
  const ex = c.examples[0]
  if (!ex) return null
  if (c.mediaType === 'application/x-www-form-urlencoded') {
    return { ...ex.value, __contentType: 'application/x-www-form-urlencoded' }
  }
  return ex.value
}

async function normalizeAsync(asyncDoc, schemas) {
  if (!asyncDoc) return undefined
  const channels = []
  const operations = []
  for (const [channelName, channelDoc] of Object.entries(asyncDoc.channels ?? {})) {
    const direction =
      channelDoc.publish && channelDoc.subscribe ? 'both'
        : channelDoc.publish ? 'pub'
        : channelDoc.subscribe ? 'sub'
        : 'none'
    channels.push({
      name: channelName,
      direction,
      descriptionHtml: await renderMarkdown(channelDoc.description ?? ''),
    })

    for (const dir of ['publish', 'subscribe']) {
      const op = channelDoc[dir]
      if (!op) continue
      const messageDoc = op.message ?? {}
      const payloadSchema = messageDoc.payload ? normalizeSchema(messageDoc.payload) : { kind: 'primitive', type: 'string' }
      const examples = []
      if (Array.isArray(messageDoc.examples)) {
        for (const ex of messageDoc.examples) {
          const value = ex.payload ?? ex
          const json = JSON.stringify(value, null, 2)
          examples.push({ name: ex.name ?? 'default', summary: ex.summary ?? '', value, json, html: await highlight(json, 'json') })
        }
      }
      if (examples.length === 0) {
        const synth = synthesizeExample(payloadSchema, schemas)
        if (synth !== null) {
          const json = JSON.stringify(synth, null, 2)
          examples.push({ name: 'default', summary: '', value: synth, json, html: await highlight(json, 'json') })
        }
      }
      const dirCode = dir === 'publish' ? 'pub' : 'sub'
      const samples = generateAsyncSamples({
        direction: dirCode,
        channel: channelName,
        payload: examples[0]?.value ?? null,
      })
      const samplesHtml = {}
      for (const [k, raw] of Object.entries(samples)) {
        samplesHtml[k] = { raw, html: await highlight(raw, k) }
      }
      operations.push({
        id: op.operationId ?? `${dir}_${channelName}`,
        channel: channelName,
        direction: dirCode,
        summary: op.summary ?? '',
        descriptionHtml: await renderMarkdown(channelDoc.description ?? ''),
        message: {
          name: messageDoc.name ?? '',
          title: messageDoc.title ?? '',
          summary: messageDoc.summary ?? '',
          payload: payloadSchema,
          examples,
        },
        samples: samplesHtml,
      })
    }
  }
  return { channels, operations }
}

function mineErrors(restDoc) {
  if (!restDoc) return []
  const found = new Map() // code → { code, messages: Set, sourceOps: Set }
  walk(restDoc, (node, ctx) => {
    if (node && typeof node === 'object' && typeof node.code === 'string' && typeof node.message === 'string') {
      const entry = found.get(node.code) ?? { code: node.code, messages: new Set(), sourceOps: new Set() }
      entry.messages.add(node.message)
      if (ctx.opId) entry.sourceOps.add(ctx.opId)
      found.set(node.code, entry)
    }
  })
  return [...found.values()].map((e) => ({
    code: e.code,
    messages: [...e.messages],
    sourceOps: [...e.sourceOps],
  })).sort((a, b) => a.code.localeCompare(b.code))
}

function walk(root, visit) {
  function recurse(node, ctx) {
    if (node === null || typeof node !== 'object') return
    if (typeof node.operationId === 'string') ctx = { ...ctx, opId: node.operationId }
    visit(node, ctx)
    if (Array.isArray(node)) for (const item of node) recurse(item, ctx)
    else for (const k of Object.keys(node)) recurse(node[k], ctx)
  }
  recurse(root, {})
}

function extractServers(restDoc, asyncDoc) {
  if (restDoc?.servers?.length) return restDoc.servers.map((s) => ({ url: s.url, description: s.description ?? '' }))
  if (asyncDoc?.servers) {
    return Object.entries(asyncDoc.servers).map(([name, s]) => ({
      url: s.url,
      description: s.description ?? name,
      protocol: s.protocol,
    }))
  }
  return []
}

function extractSecurityDefaults(security) {
  if (!Array.isArray(security)) return []
  // OpenAPI security is a list of {schemeName: scopes[]} objects; an empty object disables auth.
  const names = []
  for (const item of security) {
    for (const k of Object.keys(item)) names.push(k)
  }
  return [...new Set(names)]
}

async function loadGuides(guidesDir) {
  if (!(await fileExists(guidesDir))) return []
  const out = []
  const entries = await readdir(guidesDir)
  for (const filename of entries.sort()) {
    if (!filename.endsWith('.md')) continue
    const filePath = path.join(guidesDir, filename)
    const md = await readFile(filePath, 'utf8')
    const html = await renderMarkdown(md)
    out.push({
      slug: filename.replace(/\.md$/, ''),
      title: deriveTitle(md) || filename.replace(/\.md$/, ''),
      html,
      tocHtml: extractToc(html),
    })
  }
  return out
}

async function readJson(p) {
  try { return JSON.parse(await readFile(p, 'utf8')) }
  catch { return {} }
}

async function readFileOrEmpty(p) {
  try { return await readFile(p, 'utf8') }
  catch { return '' }
}

async function fileExists(p) {
  try { await stat(p); return true } catch { return false }
}
