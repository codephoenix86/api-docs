import { Callout } from '@/components/ui/Callout.jsx'

export function HandshakeNote() {
  return (
    <Callout variant="tip" title="Socket.io handshake">
      Authenticate during the handshake by setting <code className="font-mono">auth.token</code> on
      the <code className="font-mono">io()</code> options. The server validates the JWT once at
      connect; rotate tokens by reconnecting.
    </Callout>
  )
}
