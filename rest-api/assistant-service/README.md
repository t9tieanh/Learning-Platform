# Assistant Service

AI layer of Learnova. It processes lesson content (transcription, semantic chunking, summaries, embeddings), powers the lesson chatbot with RAG, generates quizzes and lesson tests with OpenAI, grades student submissions, and provides lesson analytics.

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_+_pgvector-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Redis](https://img.shields.io/badge/Redis_+_Bull-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)

## Responsibilities

- **Transcription** — sends lesson videos to **AssemblyAI**; results come back through a signed webhook.
- **Lesson processing** — chunking, per-chunk summaries, and embeddings, run as **Bull** jobs backed by Redis (`src/service/jobs/`).
- **Lesson chatbot (RAG)** — chat sessions per lesson, answers grounded in lesson chunks with citations (pgvector + LangChain + OpenAI).
- **Quizzes** — AI-generated or manual quizzes per chunk, review/approve, bulk approve/delete.
- **Lesson tests** — instructor blueprints split into chunk groups, async quiz generation, student test taking and grading.
- **Analysis** — lesson detail/intelligence views for instructors and admins.
- **Course embeddings** — listens for course approval / purchase events to keep course embeddings and purchase data in sync.
- **gRPC server** — implements `AssistantService` (e.g. `batchGetLessonTestEligibility`) for course-service.

## Ports

| Protocol | Default | Env var |
|----------|---------|---------|
| HTTP | `4000` | `PORT` |
| gRPC (`AssistantService`) | `50055` | `ASSISTANT_GRPC_PORT` |

## Main endpoints

Gateway prefix: `/api/v1/assistant/...`.

| Base path | Endpoints |
|-----------|-----------|
| `/` | `POST /chat-bot`, `GET /chat-history` |
| `/transcription` | `POST /` |
| `/webhook` | `POST /assemblyai` (AssemblyAI callback) |
| `/analysis` | `GET /lessons/:lessonId`, `GET /lessons/:lessonId/detail`, `PATCH /lessons/:lessonId/chunks/:chunkId/summary`, lesson chat sessions (`GET`/`POST /lessons/:lessonId/chat/sessions`, `PATCH .../title`, `PATCH .../notes`, `GET .../messages`), `POST /lessons/:lessonId/chat` |
| `/analysis` (lesson test — instructor) | `GET`/`PUT`/`DELETE /lessons/:lessonId/lesson-test`, `GET /lesson-tests/:lessonId/stats`, generate quizzes + status, chunk group CRUD |
| `/analysis` (lesson test — student) | `GET /lessons/:lessonId/lesson-test/student`, `POST`/`GET .../student/submissions`, `GET .../student/submissions/:submissionId` |
| `/quizzes` | `POST`/`GET /chunks/:chunkId/quizzes`, `POST .../manual`, `POST .../batch`, `GET .../:quizId`, `PATCH /quiz/:quizId`, `PATCH /quiz/:quizId/approve`, `DELETE /quiz/:quizId`, `POST /bulk-approve`, `POST /bulk-delete` |
| `/admin/analysis` | `GET /lessons/:lessonId/intelligence`, `GET /lessons/:lessonId/lesson-test` |
| `/status`, `/health` | Status / health checks |

Detailed docs:

- Lesson test (instructor) API: [docs/output/README-http-api.md](docs/output/README-http-api.md)
- Lesson test (student) API: [docs/lesson-test-student/README.md](docs/lesson-test-student/README.md)

## Data model

PostgreSQL with the `vector` and `uuid-ossp` extensions, managed by Prisma ([`prisma/schema.prisma`](prisma/schema.prisma)). Main models: `Lesson`, `LessonChunk`, `CourseEmbedding`, `Quiz`, `QuizChoice`, `LessonTest`, `LessonTestChunkGroup`, `LessonTestSubmission`, `LessonTestSubmissionAnswer`, `LessonChatSession`, `LessonChatMessage`, `UserPurchasedCourse`.

## Messaging

- **RabbitMQ** — consumes `assistant.course.embedding.queue` (bound to `course.approval.exchange`) and `assistant.course.purchase.queue`.
- **Bull (Redis)** — chunking, summarization, and lesson-test group quiz generation jobs.

## Requirements

- Node.js >= 18.x, npm
- PostgreSQL 15+ with the `pgvector` extension
- Redis
- RabbitMQ
- Elasticsearch
- OpenAI API key, AssemblyAI API key
- `../proto-shared` present (the `.proto` files are loaded at runtime)

## Configuration

Create a `.env` file in this folder. Key variables (full list in [`src/config/env.ts`](src/config/env.ts)):

| Variable | Purpose |
|----------|---------|
| `PORT`, `APP_HOST` | HTTP bind address |
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
| `JWT_SECRET`, `COOKIE_NAME` | Access token verification |
| `OPENAI_API_KEY` | LLM + embeddings |
| `ASSEMBLYAI_API_KEY`, `WEBHOOK_URL`, `ASSEMBLYAI_WEBHOOK_SECRET` | Transcription and its webhook |
| `REDIS_DB_HOST`, `REDIS_DB_PORT`, `REDIS_DB_USER`, `REDIS_DB_PASSWORD`, `REDIS_DB_NAME` | Redis / Bull |
| `RABBIT_MQ_HOST`, `RABBIT_MQ_PORT`, `RABBIT_MQ_USER_NAME`, `RABBIT_MQ_PASSWORD` | RabbitMQ |
| `ES_NODE` | Elasticsearch URL |
| `COURSE_GRPC_URL`, `USER_GRPC_URL` | gRPC clients |
| `ASSISTANT_GRPC_PORT` | gRPC server port |
| `N8N_BASE_URL`, `N8N_WEBHOOK_PATH`, `N8N_AUTH_HEADER`, `N8N_WEBHOOK_TIMEOUT_MS` | n8n chatbot workflow |
| `WEB_URL`, `COURSE_PUBLIC_BASE_URL` | Links used in responses / emails |
| `GMAIL_USER`, `GMAIL_PASS` | Email sending |
| `TEST_API_USERNAME`, `TEST_API_PASSWORD` | Basic auth for `/test` routes |
| `LESSON_TEST_GROUP_CONTEXT_MAX_TOKENS` | Context budget per lesson-test group (default `12000`) |

## Running locally

```sh
npm install

# Database
npx prisma generate
npm run migrate          # prisma migrate dev
npm run seed             # optional

# Dev server (ts-node-dev, auto reload)
npm run dev
```

From the repository root: `make assistant-dev`.

Production build:

```sh
npm run build
npm run migrate:deploy
npm start
```

## Docker

```sh
cd rest-api
docker build -t assistant-service:latest -f assistant-service/Dockerfile .
```
