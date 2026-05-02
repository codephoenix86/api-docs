# Authentication

fastchat issues two tokens at login:

- **Access token** — JWT (HS256), 15-minute TTL by default. Sent as `Authorization: Bearer <token>` on every authenticated REST call and as `auth.token` on the Socket.io handshake.
- **Refresh token** — opaque 128-character hex string, 7-day TTL by default. Sent as the `refresh_token` field of an `application/x-www-form-urlencoded` body to `/auth/logout` and `/auth/refresh`.

The refresh token is **rotated** on every successful refresh — the previous token is burned atomically. Always replace your stored refresh token with the new one returned by `/auth/refresh`.

## Token lifecycle

```
signup ──► login ──┬─► access (15m)  ──► expires ──► /auth/refresh ──► new pair
                   └─► refresh (7d)  ──► /auth/logout ──► revoked
```

## Socket.io handshake

```js
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: { token: accessToken }
})

socket.on('connect_error', (err) => {
  // err.message is one of: MISSING_TOKEN, INVALID_TOKEN, TOKEN_EXPIRED, TOKEN_NOT_ACTIVE
})
```

The token is **not** re-validated for the lifetime of the connection — reconnect after rotating tokens.
