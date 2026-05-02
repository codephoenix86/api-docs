# Rate limiting

Two route families are rate-limited via a Redis-backed `express-rate-limit` store:

| Family | Limit |
| --- | --- |
| `/auth/*` | 5 requests per 15 minutes per IP |
| `/chats/{chatId}/messages` | 100 requests per 15 minutes per IP |

Limits can be disabled at deploy time with `DISABLE_RATE_LIMIT=true`.

## Reading the headers

When a request is throttled, rely on the standard headers — **not** the body shape (the body is a default `express-rate-limit` plain text string and is not part of the contract):

| Header | Meaning |
| --- | --- |
| `RateLimit-Limit` | Maximum requests permitted in the window |
| `RateLimit-Remaining` | Requests left in the current window |
| `RateLimit-Reset` | Seconds until the window resets |
| `Retry-After` | Seconds the client should wait before retrying |

A reasonable client retries after `Retry-After` seconds with a small jitter (e.g., ± 250 ms) to avoid synchronized retries from many clients.
