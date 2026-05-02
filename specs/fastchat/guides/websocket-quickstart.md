# WebSocket quickstart

The fastchat real-time layer is **Socket.io 4.8.1**, not raw WebSocket. Use the `socket.io-client` library.

## Connect

```js
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: { token: accessToken }
})

socket.on('connect', () => {
  console.log('connected as', socket.id)
})
```

## Join your active chats

Room membership is **not** persisted across reconnects. Re-emit `chat:join` for every chat the user is currently looking at, ideally from the `connect` handler:

```js
socket.on('connect', () => {
  for (const chatId of openChatIds) {
    socket.emit('chat:join', { chatId })
  }
})
```

## Receive messages

```js
socket.on('message:new', (message) => {
  // append to the chat view
})

socket.on('message:updated', (message) => {
  // replace by message.id
})

socket.on('message:deleted', ({ messageId }) => {
  // remove by messageId
})
```

## Acknowledge delivery and reads

```js
socket.emit('message:delivered', { messageId })
socket.emit('message:read', { messageId })
```

The server updates the message status in MongoDB. There is no acknowledgement callback — failures are logged server-side only.

## Typing indicators

Debounce keystrokes; don't emit on every character. A common pattern:

```js
let typingTimer
input.addEventListener('input', () => {
  socket.emit('message:start-typing', { chatId })
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    socket.emit('message:stop-typing', { chatId })
  }, 3000)
})
```

The server broadcasts `{ userId, chatId }` to other sockets in the room.
