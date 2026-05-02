export function EnumChips({ values }) {
  if (!values?.length) return null
  return (
    <span className="inline-flex flex-wrap gap-1 align-middle">
      {values.map((v) => (
        <code
          key={String(v)}
          className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-[color:color-mix(in_oklab,var(--color-text)_8%,transparent)] text-[color:var(--color-text)]"
        >
          {String(v)}
        </code>
      ))}
    </span>
  )
}
