const buildDate = new Date(__BUILD_DATE__)
const lastUpdated = buildDate.toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

export function Footer({ version }) {
  return (
    <footer className="mt-20 border-t border-[color:var(--color-border)] py-6 text-[12.5px] text-[color:var(--color-text-muted)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{version ? `v${version}` : 'API Docs'}</span>
        <span>
          Last updated{' '}
          <time dateTime={buildDate.toISOString()}>{lastUpdated}</time>
        </span>
      </div>
    </footer>
  )
}
