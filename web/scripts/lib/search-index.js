/**
 * Build a serializable search corpus across all loaded APIs.
 *
 * Each entry is one indexable document. The runtime side reads this corpus and feeds it into
 * MiniSearch. We deliberately keep the corpus, not a pre-built MiniSearch index — MiniSearch
 * indices are not stable across versions and are larger than the source.
 *
 * Document kinds:
 *   operation  — REST endpoint
 *   event      — AsyncAPI channel/operation
 *   schema     — named component schema
 *   guide      — markdown guide
 *   page       — overview / changelog / errors
 */
export function buildSearchCorpus(apis) {
  const docs = []
  let id = 0
  for (const { api } of apis) {
    if (api.hasRest) {
      for (const op of api.rest.operations) {
        const paramText = op.parameters.map((p) => `${p.name} ${stripHtml(p.descriptionHtml)}`).join(' ')
        const requestText = op.requestBody?.contents
          ?.flatMap((c) => describeSchema(c.schema, api.schemas))
          ?.join(' ') ?? ''
        const responseText = op.responses
          .flatMap((r) => r.contents.flatMap((c) => describeSchema(c.schema, api.schemas)))
          .join(' ')
        docs.push({
          id: ++id,
          api: api.slug,
          kind: 'operation',
          title: `${op.method.toUpperCase()} ${op.path}`,
          subtitle: op.summary,
          tag: op.tag,
          method: op.method,
          path: op.path,
          operationId: op.id,
          body: [op.summary, stripHtml(op.descriptionHtml), paramText, requestText, responseText].join(' '),
          url: `/${api.slug}/rest/${encodeURIComponent(op.tag)}/${op.id}`,
        })
      }
    }
    if (api.hasAsync) {
      for (const op of api.async.operations) {
        docs.push({
          id: ++id,
          api: api.slug,
          kind: 'event',
          title: op.channel,
          subtitle: op.summary,
          direction: op.direction,
          operationId: op.id,
          body: [op.summary, stripHtml(op.descriptionHtml), describeSchema(op.message.payload, api.schemas).join(' ')].join(' '),
          url: `/${api.slug}/events/${op.id}`,
        })
      }
    }
    for (const name of api.schemaIndex) {
      const schema = api.schemas[name]
      docs.push({
        id: ++id,
        api: api.slug,
        kind: 'schema',
        title: name,
        subtitle: 'schema',
        body: describeSchema(schema, api.schemas).join(' '),
        url: `/${api.slug}/schemas/${name}`,
      })
    }
    for (const guide of api.guides) {
      docs.push({
        id: ++id,
        api: api.slug,
        kind: 'guide',
        title: guide.title,
        subtitle: 'guide',
        body: stripHtml(guide.html),
        url: `/${api.slug}/guides/${guide.slug}`,
      })
    }
    docs.push({
      id: ++id,
      api: api.slug,
      kind: 'page',
      title: `${api.name} overview`,
      subtitle: 'overview',
      body: stripHtml(api.overviewHtml + ' ' + api.descriptionHtml),
      url: `/${api.slug}`,
    })
    if (api.changelogHtml) {
      docs.push({
        id: ++id,
        api: api.slug,
        kind: 'page',
        title: 'Changelog',
        subtitle: api.name,
        body: stripHtml(api.changelogHtml),
        url: `/${api.slug}/changelog`,
      })
    }
    if (api.errorsHtml) {
      docs.push({
        id: ++id,
        api: api.slug,
        kind: 'page',
        title: 'Errors',
        subtitle: api.name,
        body: stripHtml(api.errorsHtml) + ' ' + api.errors.map((e) => `${e.code} ${e.messages.join(' ')}`).join(' '),
        url: `/${api.slug}/errors`,
      })
    }
  }
  return docs
}

function stripHtml(s) {
  if (!s) return ''
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function describeSchema(schema, schemas, depth = 0, seen = new Set()) {
  if (!schema || depth > 4) return []
  switch (schema.kind) {
    case 'ref':
      if (seen.has(schema.name)) return [schema.name]
      seen.add(schema.name)
      return [schema.name, ...describeSchema(schemas[schema.name], schemas, depth + 1, seen)]
    case 'object':
      return schema.properties.flatMap((p) => [p.name, p.description ?? '', ...describeSchema(p.schema, schemas, depth + 1, seen)])
    case 'array':
      return describeSchema(schema.items, schemas, depth + 1, seen)
    case 'union':
      return schema.options.flatMap((o) => describeSchema(o, schemas, depth + 1, seen))
    case 'composition':
      return schema.parts.flatMap((p) => describeSchema(p, schemas, depth + 1, seen))
    case 'primitive':
      return [schema.type, schema.format, ...(schema.enum ?? [])].filter(Boolean).map(String)
    default:
      return []
  }
}
