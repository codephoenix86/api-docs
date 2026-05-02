import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeShiki from '@shikijs/rehype'

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className']],
    span: [...(defaultSchema.attributes?.span ?? []), ['className'], ['style']],
    pre: [...(defaultSchema.attributes?.pre ?? []), ['className'], ['style'], ['tabindex']],
    a: [...(defaultSchema.attributes?.a ?? []), ['ariaHidden'], ['tabIndex']],
    h1: [...(defaultSchema.attributes?.h1 ?? []), ['id']],
    h2: [...(defaultSchema.attributes?.h2 ?? []), ['id']],
    h3: [...(defaultSchema.attributes?.h3 ?? []), ['id']],
    h4: [...(defaultSchema.attributes?.h4 ?? []), ['id']],
  },
}

let cachedProcessor = null

function buildProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeShiki, {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
    })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
}

export async function renderMarkdown(md) {
  if (!md) return ''
  if (!cachedProcessor) cachedProcessor = buildProcessor()
  const file = await cachedProcessor.process(md)
  return String(file)
}

/**
 * Extract a lightweight TOC (h2 + h3 only) from the rendered HTML.
 */
export function extractToc(html) {
  if (!html) return ''
  const items = []
  const re = /<h([23])[^>]*\bid="([^"]+)"[^>]*>(.*?)<\/h\1>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const level = Number(m[1])
    const id = m[2]
    const text = m[3].replace(/<[^>]+>/g, '').trim()
    items.push({ level, id, text })
  }
  if (items.length === 0) return ''
  let out = '<ul class="toc">'
  for (const it of items) {
    out += `<li class="toc-l${it.level}"><a href="#${it.id}">${escapeHtml(it.text)}</a></li>`
  }
  out += '</ul>'
  return out
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function deriveTitle(md) {
  if (!md) return ''
  const m = md.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}
