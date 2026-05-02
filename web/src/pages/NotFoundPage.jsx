import { Link } from 'react-router-dom'

export function NotFoundPage({ label = 'Page' }) {
  return (
    <div className="py-16 text-center max-w-md mx-auto">
      <div className="text-[80px] font-semibold leading-none tracking-tight text-[color:var(--color-text-muted)]/40">404</div>
      <h1 className="mt-3 text-[20px] font-semibold tracking-tight">{label} not found</h1>
      <p className="mt-2 text-[14px] text-[color:var(--color-text-muted)]">
        The thing you were looking for isn't here. It may have moved, or maybe the URL is wrong.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-white"
        style={{ background: 'var(--color-brand)' }}
      >
        Go home
      </Link>
    </div>
  )
}
