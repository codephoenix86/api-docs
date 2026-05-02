import { Link } from 'react-router-dom'
import clsx from 'clsx'

/** Drop-in replacement for <Link> that styles like an inline brand link. */
export function Anchor({ to, children, className, ...rest }) {
  return (
    <Link
      to={to}
      {...rest}
      className={clsx(
        'text-[color:var(--color-brand)] underline decoration-1 underline-offset-2 hover:decoration-2',
        className,
      )}
    >
      {children}
    </Link>
  )
}
