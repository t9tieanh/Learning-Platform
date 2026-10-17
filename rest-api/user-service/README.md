# User Service

Handles identity and user data for Learnova: authentication (JWT + Google OAuth2), registration and password recovery, user/instructor profiles, VIP status, admin dashboard statistics, and course recommendation / personalization signals.

## Tech Stack

![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)
![gRPC](https://img.shields.io/badge/gRPC-244c5a?style=for-the-badge&logo=google&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

## Responsibilities

- **Authentication** — login, logout, token introspection & refresh, Google OAuth2, forgot/reset password with OTP.
- **Users** — registration + email verification, profile updates (multipart avatar upload to Cloudinary), certificates, expertises.
- **Instructors** — instructor profile, statistics and chart data.
- **Admin dashboard** — home stats, pending actions, top courses, top instructors.
- **Personalization** — tracks user events into Elasticsearch (`user-personalization-signals` index) and serves course recommendations.
- **VIP** — consumes VIP registration events from RabbitMQ and exposes VIP status.

## Ports

| Protocol | Port |
|----------|------|
| HTTP | `8080` |
| gRPC (server, `UserService`) | `50051` |

## Main endpoints

Exposed through the gateway as `/api/v1/<path>` (e.g. `/api/v1/auth/refresh`).

| Base path | Endpoints |
|-----------|-----------|
| `/auth` | `POST /`, `POST /logout`, `POST /introspect`, `POST /refresh`, `POST /oauth2/google`, `POST /forgot-password`, `GET /forgot-password/{code}`, `POST /reset-password` |
| `/user` | `GET /`, `GET /{id}`, `POST /` (register), `POST /verify`, `PUT /` (multipart profile update), certificates, `POST /track-event`, `GET /recommendations/courses`, `POST /personalization`, `GET /personalization/{userId}` |
| `/user` (admin) | `GET /home-admin`, `GET /admin/pending-actions`, `GET /admin/top-courses`, `GET /admin/top-instructors` |
| `/self` | `GET /`, `GET /vip-status`, `GET /instructor`, `POST /expertises`, `POST /expertises/{expertiseId}` |
| `/instructor` | `GET /statistic`, `GET /chart` |
| `/expertises` | `POST /` |

See the controllers in `src/main/java/com/freeclassroom/userservice/controller/` for request/response details.

## Integrations

- **gRPC clients** → course-service (`COURSE_SERVICE_GRPC_ADDRESS`), notification-service `BlogService` (`BLOG_SERVICE_GRPC_ADDRESS`), sale-service.
- **RabbitMQ** → publishes registration / forgot-password emails consumed by notification-service; consumes VIP registration events.
- **Redis** → token / OTP storage and guest-event consumption.
- **Elasticsearch** → personalization signals and course recommendations.

## Requirements

- Java 21, Maven 3.8+
- MySQL 8
- Redis
- RabbitMQ
- Elasticsearch (for personalization features)
- `proto-shared` installed in the local Maven repo (see [../proto-shared/README.md](../proto-shared/README.md))

## Configuration

Configuration lives in [`src/main/resources/application.yaml`](src/main/resources/application.yaml). Commonly overridden environment variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL JDBC URL |
| `RABBITMQ_HOST` | RabbitMQ host |
| `COURSE_SERVICE_GRPC_ADDRESS` | course-service gRPC address |
| `BLOG_SERVICE_GRPC_ADDRESS` | notification-service gRPC address |
| `APP_MULTIPART_MAX_FILE_SIZE` / `APP_MULTIPART_MAX_REQUEST_SIZE` | Upload limits (default `5MB` / `10MB`) |
| `BOOTSTRAP_USER_SIGNALS_INDEX_ON_STARTUP` | Create the Elasticsearch user-signals index on startup |
| `BOOTSTRAP_USER_SIGNALS_INDEX_FAIL_FAST` | Fail startup if the index bootstrap fails |

> Do not commit real credentials (JWT signer key, DB / Redis / Cloudinary / OAuth secrets). Provide them via environment variables or a mounted `application.yaml`.

## Running locally

```sh
# 1. Install the shared gRPC contracts
cd rest-api
mvn -pl proto-shared install

# 2. Start the service
cd user-service
./mvnw spring-boot:run
```

Hibernate runs with `ddl-auto: update`, so tables are created/updated automatically on startup.

## Docker

```sh
cd rest-api
docker build -t user-service:latest -f user-service/Dockerfile .
```

The image reads extra configuration from `/app/application.yaml` (`--spring.config.location=optional:classpath:/,file:/app/application.yaml`), so you can mount an environment-specific config file there.

## Health check

`GET /actuator/health`
