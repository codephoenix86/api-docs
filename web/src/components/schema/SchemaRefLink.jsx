import { Link } from 'react-router-dom'
import { schemaUrl } from '@/lib/url.js'

export function SchemaRefLink({ apiSlug, name }) {
  return (
    <Link
      to={schemaUrl(apiSlug, name)}
      className="font-mono text-[12.5px] text-[color:var(--color-brand)] hover:underline underline-offset-2"
    >
      {name}
    </Link>
  )
}
