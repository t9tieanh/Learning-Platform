# Notification Service

Handles everything communication-related in Learnova: transactional emails, course feedback/reviews, blogs, and instructor–student chat. It consumes events from RabbitMQ (saga participant), sends templated emails, stores data in MongoDB, and exposes the `BlogService` gRPC server.

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![gRPC](https://img.shields.io/badge/gRPC-244c5a?style=for-the-badge&logo=google&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

## Responsibilities

- **Emails** (Nodemailer + Handlebars templates in `src/templates/`): email verification, password reset, order confirmation, VIP confirmation / payment failure, course approved / rejected, study reminders, certificate issued, payment refund, admin payment-failure alerts.
- **Feedback** — course reviews and instructor feedback overview.
- **Blog** — public blog listing/trending/details, instructor CRUD.
- **Chat** — direct conversations and messages between instructors and students; real-time updates are pushed through [socket-server](../../socket-server/README.md).
- **gRPC server** — implements `BlogService` (blog totals, feedback by course, AI conversations, etc.) for other services.

## Ports

| Protocol | Default | Env var |
|----------|---------|---------|
| HTTP | `8017` | `APP_PORT` |
| gRPC (`BlogService`) | `9092` | `NOTIFICATION_POST` |

## Main endpoints

All routes are mounted under `/notify` (gateway: `/api/v1/notify/...`).

| Base path | Auth | Endpoints |
|-----------|------|-----------|
| `/notify/blog` | Mixed | `GET /all`, `GET /new`, `GET /trending`, `GET /details/:id` (public); `GET /tc-all`, `POST /create`, `PATCH /update/:id`, `DELETE /:id` (authenticated) |
| `/notify/feedback` | Required | `GET /gets`, `GET /v2/instructor-overview`, `POST /`, `GET /course/:courseId` |
| `/notify/chat` | Required | `POST /conversations/direct`, `GET /conversations`, `GET /messages`, `POST /messages`, `POST /messages/read`, `PATCH /messages`, `DELETE /messages` |
| `/health` | — | Health check |

## Messaging

RabbitMQ queues consumed (see `src/enums/rabbitQueue.enum.ts` and `src/sagas/`):

| Queue | Purpose |
|-------|---------|
| `register-user-queue` | Email verification (published by user-service) |
| `forgot-password-queue` | Password reset email |
| `order-confirm` | Order confirmation email |
| `course.approval.queue` | Course approved / rejected email |
| `study-reminder.queue` | Study reminder email |
| `certificate-issued.queue` | Certificate issued email |
| `payment-refund`, `payment-fail-admin` | Refund / admin alert emails |
| `notification.service.queue`, `payment.refund.service.queue` | Order saga participant queues |

## Requirements

- Node.js >= 18.x, npm
- MongoDB
- Redis
- RabbitMQ
- A Gmail account / app password for sending emails
- `../proto-shared` present (the `.proto` files are loaded at runtime)

## Configuration

Copy the example file and fill in the values:

```sh
cp .env.example .env
```

Key variables (full list in [`src/config/env.ts`](src/config/env.ts)):

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI`, `DATABASE_NAME` | MongoDB connection |
| `APP_HOST`, `APP_PORT` | HTTP bind address |
| `APP_SECRET` | JWT secret used to verify access tokens |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD` | Redis |
| `RABBIT_MQ_HOST`, `RABBIT_MQ_PORT`, `RABBIT_MQ_USER_NAME`, `RABBIT_MQ_PASSWORD`, `RABBIT_MQ_VHOST` (or `RABBIT_MQ_URI`) | RabbitMQ |
| `GMAIL_USER`, `GMAIL_PASS`, `ADMIN_EMAIL` | Email sender and admin recipient |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image uploads |
| `COURSE_GRPC_URL`, `USER_GRPC_URL` | gRPC clients |
| `NOTIFICATION_POST` | gRPC server port |
| `SOCKET_URL` | socket-server URL for real-time chat events |
| `FRONTEND_ORIGIN` | Frontend URL used in email links |

## Running locally

```sh
npm install
npm run dev        # nodemon + tsx, reloads on src/ and .env changes
```

From the repository root you can also use `make notification-install` and `make notification-dev`.

Production build:

```sh
npm run build
npm start
```

Other scripts: `npm run lint`, `npm run lint:fix`, `npm run prettier`, `npm run prettier:fix`.

## Docker

```sh
cd rest-api
docker build -t notification-service:latest -f notification-service/Dockerfile .
```
