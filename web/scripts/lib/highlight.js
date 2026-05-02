import { createHighlighter } from 'shiki'

let highlighterPromise = null

const LANGS = ['bash', 'json', 'javascript', 'python', 'http']
const THEMES = { light: 'github-light', dark: 'github-dark-dimmed' }

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: Object.values(THEMES),
      langs: LANGS,
    })
  }
  return highlighterPromise
}

const LANG_FOR_SAMPLE = {
  curl: 'bash',
  'js-fetch': 'javascript',
  'js-axios': 'javascript',
  python: 'python',
  json: 'json',
  http: 'http',
}

export async function highlight(code, sampleKind) {
  const highlighter = await getHighlighter()
  const lang = LANG_FOR_SAMPLE[sampleKind] ?? sampleKind ?? 'bash'
  return highlighter.codeToHtml(code, {
    lang,
    themes: THEMES,
    defaultColor: false,
  })
}

export async function disposeHighlighter() {
  if (!highlighterPromise) return
  const h = await highlighterPromise
  h.dispose()
  highlighterPromise = null
}
