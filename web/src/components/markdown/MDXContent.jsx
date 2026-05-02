import clsx from 'clsx'

/** Renders pre-compiled, sanitized markdown HTML. */
export function MDXContent({ html, className }) {
  if (!html) return null
  return (
    <div
      className={clsx('prose-doc max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
