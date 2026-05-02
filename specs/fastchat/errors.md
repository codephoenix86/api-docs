# Errors

Every error response uses the same shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request data",
    "details": [
      { "path": "body.email", "message": "Invalid email address" }
    ]
  },
  "timestamp": "2024-01-21T10:30:00.000Z",
  "requestId": "5b1d6df8-3e0d-4f7d-bc55-d9b2dfb1a4f7"
}
```

- `error.code` is **machine-readable** — branch on it. Never rely on `error.message`.
- `error.details` is only present when `code = VALIDATION_FAILED`.
- `requestId` mirrors the `X-Request-Id` response header — log both client-side to make support easier.
- `stack` is only included when the server runs with `NODE_ENV=development`.

## Reading the auto-generated table

The table below is mined directly from the spec — every distinct `error.code` that appears in a response example is listed, along with the operations that produce it. If you need to add a new code, add it as an example in `openapi.yaml` and it will appear here on the next deploy.
