import { Callout } from '@/components/ui/Callout.jsx'

export function DeprecatedBanner({ note }) {
  return (
    <Callout variant="warn" title="Deprecated">
      {note ?? 'This operation is deprecated and may be removed in a future release.'}
    </Callout>
  )
}
