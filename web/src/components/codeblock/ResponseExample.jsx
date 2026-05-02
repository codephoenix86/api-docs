import { CodeBlock } from './CodeBlock.jsx'

export function ResponseExample({ example, lang = 'json' }) {
  if (!example?.html) return null
  return <CodeBlock raw={example.json ?? ''} html={example.html} lang={lang} />
}
