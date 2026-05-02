/**
 * Generate per-language code samples for an OpenAPI operation. Hand-rolled (no openapi-snippet
 * runtime dep at build) so the output matches our exact style and uses our chosen client libraries.
 *
 * Each language returns just the raw source string; the orchestrator highlights it with shiki.
 */

export function generateRestSamples({ method, path, server, parameters, body, security }) {
  const url = buildUrl(server, path, parameters)
  const queryParams = (parameters ?? []).filter((p) => p.in === 'query')
  const headerParams = (parameters ?? []).filter((p) => p.in === 'header')
  const isAuth = security && security.length > 0
  const bodyJson = body ? JSON.stringify(body, null, 2) : null
  const bodyForm = body && typeof body === 'object' ? body : null
  const isFormUrlEncoded = body && body.__contentType === 'application/x-www-form-urlencoded'
  return {
    curl: curlSample({ method, url, headerParams, queryParams, isAuth, bodyJson, bodyForm, isFormUrlEncoded }),
    'js-fetch': jsFetchSample({ method, url, headerParams, queryParams, isAuth, bodyJson, isFormUrlEncoded, bodyForm }),
    'js-axios': jsAxiosSample({ method, url, headerParams, queryParams, isAuth, bodyJson, isFormUrlEncoded, bodyForm }),
    python: pythonSample({ method, url, headerParams, queryParams, isAuth, bodyJson, isFormUrlEncoded, bodyForm }),
  }
}

export function generateAsyncSamples({ direction, channel, payload }) {
  const evt = channel
  const payloadJson = payload ? JSON.stringify(payload, null, 2) : '{}'
  if (direction === 'pub') {
    return {
      'js-fetch': jsSocketEmit(evt, payloadJson),
      python: pySocketEmit(evt, payloadJson),
    }
  }
  return {
    'js-fetch': jsSocketOn(evt, payloadJson),
    python: pySocketOn(evt, payloadJson),
  }
}

function buildUrl(server, path, parameters) {
  let p = path
  for (const param of parameters ?? []) {
    if (param.in !== 'path') continue
    const v = param.example ?? sampleFor(param.schema)
    p = p.replace(`{${param.name}}`, encodeURIComponent(String(v ?? `:${param.name}`)))
  }
  const query = (parameters ?? [])
    .filter((p) => p.in === 'query' && p.example !== undefined)
    .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(String(p.example))}`)
    .join('&')
  const base = (server ?? 'http://localhost:3000').replace(/\/+$/, '')
  return `${base}${p}${query ? `?${query}` : ''}`
}

function sampleFor(schema) {
  if (!schema) return ''
  if (schema.example !== undefined) return schema.example
  if (schema.kind === 'primitive' && schema.format === 'uuid') return '00000000-0000-0000-0000-000000000000'
  return ''
}

function authHeaderLine(isAuth) {
  return isAuth ? 'Authorization: Bearer <ACCESS_TOKEN>' : null
}

function curlSample({ method, url, headerParams, isAuth, bodyJson, bodyForm, isFormUrlEncoded }) {
  const lines = [`curl -X ${method.toUpperCase()} '${url}' \\`]
  const auth = authHeaderLine(isAuth)
  if (auth) lines.push(`  -H '${auth}' \\`)
  for (const h of headerParams) {
    if (h.example !== undefined) lines.push(`  -H '${h.name}: ${h.example}' \\`)
  }
  if (isFormUrlEncoded && bodyForm) {
    lines.push(`  -H 'Content-Type: application/x-www-form-urlencoded' \\`)
    const data = Object.entries(bodyForm)
      .filter(([k]) => k !== '__contentType')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    lines.push(`  --data '${data}'`)
  } else if (bodyJson) {
    lines.push(`  -H 'Content-Type: application/json' \\`)
    lines.push(`  --data '${escapeSingleQuotes(bodyJson)}'`)
  } else {
    // remove trailing backslash on last line
    lines[lines.length - 1] = lines[lines.length - 1].replace(/ \\$/, '')
  }
  return lines.join('\n')
}

function jsFetchSample({ method, url, headerParams, isAuth, bodyJson, isFormUrlEncoded, bodyForm }) {
  const headerLines = []
  if (isAuth) headerLines.push(`    Authorization: 'Bearer <ACCESS_TOKEN>',`)
  for (const h of headerParams) {
    if (h.example !== undefined) headerLines.push(`    '${h.name}': '${h.example}',`)
  }
  let bodyLine = ''
  if (isFormUrlEncoded && bodyForm) {
    headerLines.push(`    'Content-Type': 'application/x-www-form-urlencoded',`)
    const data = Object.entries(bodyForm)
      .filter(([k]) => k !== '__contentType')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    bodyLine = `\n  body: '${data}',`
  } else if (bodyJson) {
    headerLines.push(`    'Content-Type': 'application/json',`)
    bodyLine = `\n  body: JSON.stringify(${bodyJson}),`
  }
  return `const res = await fetch('${url}', {
  method: '${method.toUpperCase()}',
  headers: {
${headerLines.join('\n') || '    /* no headers */'}
  },${bodyLine}
})
const data = await res.json()`
}

function jsAxiosSample({ method, url, headerParams, isAuth, bodyJson, isFormUrlEncoded, bodyForm }) {
  const headerLines = []
  if (isAuth) headerLines.push(`    Authorization: 'Bearer <ACCESS_TOKEN>',`)
  for (const h of headerParams) {
    if (h.example !== undefined) headerLines.push(`    '${h.name}': '${h.example}',`)
  }
  let dataLine = ''
  if (isFormUrlEncoded && bodyForm) {
    headerLines.push(`    'Content-Type': 'application/x-www-form-urlencoded',`)
    const data = Object.entries(bodyForm)
      .filter(([k]) => k !== '__contentType')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    dataLine = `\n  data: '${data}',`
  } else if (bodyJson) {
    headerLines.push(`    'Content-Type': 'application/json',`)
    dataLine = `\n  data: ${bodyJson},`
  }
  return `import axios from 'axios'

const { data } = await axios({
  method: '${method.toUpperCase()}',
  url: '${url}',
  headers: {
${headerLines.join('\n') || '    /* no headers */'}
  },${dataLine}
})`
}

function pythonSample({ method, url, headerParams, isAuth, bodyJson, isFormUrlEncoded, bodyForm }) {
  const headerEntries = []
  if (isAuth) headerEntries.push(`    "Authorization": "Bearer <ACCESS_TOKEN>",`)
  for (const h of headerParams) {
    if (h.example !== undefined) headerEntries.push(`    "${h.name}": "${h.example}",`)
  }
  let bodyLine = ''
  if (isFormUrlEncoded && bodyForm) {
    const dataPy = Object.entries(bodyForm)
      .filter(([k]) => k !== '__contentType')
      .map(([k, v]) => `        "${k}": "${v}"`)
      .join(',\n')
    bodyLine = `\n    data={\n${dataPy}\n    },`
  } else if (bodyJson) {
    bodyLine = `\n    json=${bodyJson},`
  }
  return `import requests

response = requests.request(
    "${method.toUpperCase()}",
    "${url}",
    headers={
${headerEntries.join('\n') || '        # no headers'}
    },${bodyLine}
)
data = response.json()`
}

function jsSocketEmit(evt, payload) {
  return `import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: { token: '<ACCESS_TOKEN>' },
})

socket.emit('${evt}', ${payload})`
}

function jsSocketOn(evt, payload) {
  return `import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: { token: '<ACCESS_TOKEN>' },
})

socket.on('${evt}', (payload) => {
  // payload shape:
  // ${payload.replace(/\n/g, '\n  // ')}
})`
}

function pySocketEmit(evt, payload) {
  return `import socketio

sio = socketio.Client()
sio.connect("http://localhost:3000", auth={"token": "<ACCESS_TOKEN>"})
sio.emit("${evt}", ${jsonToPy(payload)})`
}

function pySocketOn(evt, payload) {
  return `import socketio

sio = socketio.Client()

@sio.on("${evt}")
def on_event(payload):
    # payload shape:
    # ${payload.replace(/\n/g, '\n    # ')}
    pass

sio.connect("http://localhost:3000", auth={"token": "<ACCESS_TOKEN>"})
sio.wait()`
}

function jsonToPy(json) {
  // simplistic: works for objects with string/number/boolean leaves; replaces JSON booleans/null.
  return json
    .replace(/\btrue\b/g, 'True')
    .replace(/\bfalse\b/g, 'False')
    .replace(/\bnull\b/g, 'None')
}

function escapeSingleQuotes(s) {
  return s.replace(/'/g, `'\\''`)
}
