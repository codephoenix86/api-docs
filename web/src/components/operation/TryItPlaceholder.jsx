import { Callout } from '@/components/ui/Callout.jsx'

/** Placeholder slot for the future live request console. Today renders only an info callout. */
export function TryItPlaceholder() {
  return (
    <Callout variant="info" title="Try it (coming soon)">
      A live request console will land here. For now, copy a code sample on the right and run it
      against your local fastchat backend or your deployment.
    </Callout>
  )
}
