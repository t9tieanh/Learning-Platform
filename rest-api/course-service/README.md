# Course Service

Core learning domain of Learnova: courses, chapters, lessons, categories, tags, lesson comments, video upload and secure playback, course approval workflow, completion certificates, and instructor/admin analytics.

## Tech Stack

![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3_+_CloudFront-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![gRPC](https://img.shields.io/badge/gRPC-244c5a?style=for-the-badge&logo=google&logoColor=white)

## Responsibilities

- **Course authoring (instructor)** — create/edit courses, chapters, video & article lessons, tags, price, intro video; submit a course for approval.
- **Video upload** — multipart/chunked upload sessions to **AWS S3** with presigned part URLs (`/lessons/video/v2/sessions`).
- **Secure playback** — CloudFront signed URLs / signed cookies for enrolled students.
- **Catalog (public)** — course list, details, best sellers, trending, categories, tags.
- **Learning (student)** — enrolled courses, lesson progress (`mark-done`), notes, lesson comments.
- **Approval workflow (admin)** — approve/reject courses; approved courses are indexed into Elasticsearch through a RabbitMQ consumer with retry + DLQ.
- **Certificates** — course completion certificates rendered to PDF (Thymeleaf + OpenHTMLtoPDF) with public verification by code.
- **Analytics** — instructor learner & revenue analytics, admin business performance.

## Ports

| Protocol | Port |
|----------|------|
| HTTP | `8081` |
| gRPC (server, `CourseService`) | `50054` |

## Main endpoints

Exposed through the gateway as `/api/v1/learning/<path>` (e.g. `/api/v1/learning/courses`).

| Base path | Audience | Endpoints |
|-----------|----------|-----------|
| `/courses` | Public | `GET /`, `GET /{id}`, `GET /count`, `GET /best-seller`, `GET /trend`, `GET /enrolled`, `GET /instructors/{instructorId}` |
| `/categories`, `/tags` | Public | `GET /`, `GET /active` |
| `/chapters-user` | Public | `GET /{id}/public` |
| `/courses-student` | Student | `GET /self`, `GET /{id}` |
| `/lesson-student` | Student | `GET /{id}`, `GET /{id}/info`, `GET /{id}/presigned-url`, `GET /{id}/presigned-cookies`, `GET /{id}/media-url`, `POST /{id}/access-cookie`, `POST /{id}/mark-done`, `POST /{id}/make-note` |
| `/lesson-comment` | Student | `GET /`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| `/course-certificates` | Student / public | `GET /self`, `GET /{id}`, `GET /{id}/download`, `GET /verify/{code}`, `GET /verify/{code}/download` |
| `/instructor/courses` | Instructor | CRUD, `PATCH /{id}/tags`, `PATCH /{id}/avatar`, `PATCH /{id}/price`, `GET /{id}/overview`, `POST /{id}/video-introduction`, `POST /{id}/request-approval` |
| `/chapters` | Instructor | `GET`, `POST`, `PATCH /{id}`, `DELETE /{id}` |
| `/lessons` | Instructor | `POST /video`, `POST /article`, `PATCH /{id}`, `PATCH /{id}/name`, `DELETE /{id}` |
| `/lessons/video/v2` | Instructor | `POST /sessions`, `POST /sessions/{id}/presign`, `POST /sessions/{id}/complete`, `GET /sessions/{id}`, `DELETE /sessions/{id}` |
| `/courses-instructor/analytics` | Instructor | `GET /learners`, `GET /revenue` |
| `/admin/courses` | Admin | `GET /`, `GET /{id}`, `POST /{id}/approve`, `POST /{id}/reject` |
| `/admin/instructors` | Admin | `GET /`, `GET /{instructorId}/summary`, `GET /{instructorId}/courses` |
| `/admin` | Admin | `GET /business-performance` |
| `/auth` | Internal | `GET /lesson-verify` |
| `/storage` | Internal | `POST /upload-file` |

More detail on the upload flow: [../docs/chunked-upload-guide.md](../docs/chunked-upload-guide.md), [../docs/presign.md](../docs/presign.md).

## Integrations

- **gRPC clients** → user-service (`USER_SERVICE_GRPC_ADDRESS`), sale-service (`SALE_SERVICE_GRPC_ADDRESS`), notification-service `BlogService` (`BLOG_SERVICE_GRPC_ADDRESS`), assistant-service (`ASSISTANT_GRPC_ADDRESS`).
- **RabbitMQ** → course approval events (consumed by notification-service and assistant-service), search-index consumer with DLQ.
- **AWS S3 + CloudFront** → lesson video storage and signed delivery.
- **Cloudinary** → images (course avatars, etc.).
- **Elasticsearch** → course search index.
- **Redis** → caching / short-lived tokens.

## Requirements

- Java 21, Maven 3.8+
- MySQL 8
- Redis
- RabbitMQ
- Elasticsearch
- AWS S3 bucket + CloudFront distribution with a key pair (private key `.pem` file)
- `proto-shared` installed in the local Maven repo (see [../proto-shared/README.md](../proto-shared/README.md))

## Configuration

Configuration lives in [`src/main/resources/application.yaml`](src/main/resources/application.yaml). Commonly overridden environment variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL JDBC URL |
| `RABBITMQ_HOST` | RabbitMQ host |
| `USER_SERVICE_GRPC_ADDRESS` | user-service gRPC address |
| `SALE_SERVICE_GRPC_ADDRESS` | sale-service gRPC address |
| `BLOG_SERVICE_GRPC_ADDRESS` | notification-service gRPC address |
| `ASSISTANT_GRPC_ADDRESS` | assistant-service gRPC address |
| `AWS_CLOUDFRONT_PRIVATE_KEY_PATH` | Path to the CloudFront private key `.pem` |
| `CERTIFICATE_MIN_QUIZ_PASS_PERCENT` | Minimum quiz score required to issue a certificate |

> Do not commit real credentials (AWS keys, CloudFront key pair, JWT signer key, DB / Redis / Cloudinary secrets). Provide them via environment variables or a mounted `application.yaml`.

Max upload size for multipart requests is `500MB`.

## Running locally

```sh
# 1. Install the shared gRPC contracts
cd rest-api
mvn -pl proto-shared install

# 2. Start the service
cd course-service
./mvnw spring-boot:run
```

Hibernate runs with `ddl-auto: update`, so tables are created/updated automatically on startup.

## Docker

```sh
cd rest-api
docker build -t course-service:latest -f course-service/Dockerfile .
```

The image reads extra configuration from `/app/application.yaml`, so you can mount an environment-specific config file there.

## Health check

`GET /actuator/health`
