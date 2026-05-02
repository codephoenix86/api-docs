# fastchat

A real-time chat backend exposing a versioned REST API at `/api/v1` and a Socket.io WebSocket layer for delivery, presence, typing, and read receipts.

## What's in here

- **REST API** — auth, users, chats, members, and messages. Standardized success and error envelopes with rich validation details.
- **WebSocket events** — bidirectional Socket.io channels for live message broadcast, typing indicators, and online presence.
- **Schemas** — every request and response shape, including the `Message` discriminated union and the chat-creation variants.
- **Reference** — error code catalogue and changelog.

## Quickstart

1. Sign up via `POST /api/v1/auth/signup`.
2. Log in via `POST /api/v1/auth/login` to get an access + refresh token pair.
3. Send the access token as `Authorization: Bearer <token>` on every authenticated request.
4. Open a Socket.io connection with the same token in `auth.token`, then `chat:join` each chat to receive `message:*` events.
