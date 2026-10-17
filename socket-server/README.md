# Socket Server

Lightweight **Socket.IO** server that delivers real-time chat events between instructors and students in Learnova. It holds no data of its own: messages are persisted by [notification-service](../rest-api/notification-service/README.md), and this server only relays events to the right rooms.

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

## Rooms

| Room | Format | Purpose |
|------|--------|---------|
| Conversation room | `instructor_<instructorId>_student_<studentId>` (sorted) | Messages between one instructor and one student |
| User inbox | `user_<userId>` | New-message notifications for a user |

## Events

Client → server:

| Event | Payload | Effect |
|-------|---------|--------|
| `join_room` | `{ instructorId, studentId }` | Join a conversation room |
| `join_user_inbox` | `userId` | Join the user's inbox room |
| `server_message_send` | `{ conversationId, messageId, content, senderId, peerId, senderRole }` | Emits `receive_message` to the room and `message_notification` to the peer's inbox |
| `server_message_read` | `{ conversationId, senderId, peerId }` | Emits `message_read` |
| `server_message_update` | `{ conversationId, messageId, content, senderId, peerId, senderRole }` | Emits `message_update` |
| `server_last_message_update` | same as above | Emits `last_message_update` |
| `server_message_delete` | `{ conversationId, messageId, instructorId, studentId }` | Emits `message_delete` |
| `server_message_delete_last` | `{ conversationId, deletedMessageId, newLastMessage, instructorId, studentId }` | Emits `message_delete_last` |

Server → client: `receive_message`, `message_notification`, `message_read`, `message_update`, `last_message_update`, `message_delete`, `message_delete_last`.

`senderRole` is `instructor` or anything else (treated as student). Handlers live in [`src/socket/events/chat.handler.ts`](src/socket/events/chat.handler.ts).

## Ports & endpoints

- Default port: **5001** (override with `PORT`)
- `GET /health` → `200 OK`
- Through the gateway: `/api/v1/socket.io/...`

## Requirements

- Node.js >= 18.x, npm

## Running locally

```sh
npm install
npm run dev        # ts-node-dev with auto reload
```

From the repository root: `make socket-dev`.

Production build:

```sh
npm run build
npm start
```

## Docker

```sh
docker build -t socket-server:latest -f socket-server/Dockerfile .
```

Run the command from the repository root.
