# API Gateway

Single entry point for all Learnova backend traffic. Built on **Spring Cloud Gateway** (reactive), it routes requests under `/api/v1` to the downstream services and applies global CORS.

## Tech Stack

![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Spring Cloud Gateway](https://img.shields.io/badge/Spring_Cloud_Gateway-6DB33F?style=for-the-badge&logo=spring&logoColor=white)

## Routing

All routes share the prefix `app.api-prefix` = `/api/v1`. Default port: **8888**.

| Route id | Incoming path (`/api/v1/...`) | Target (env var) | Filter |
|----------|-------------------------------|------------------|--------|
| `user` | `/user/**`, `/auth/**`, `/self/**`, `/instructor/**` | `USER_SERVICE_URI` | `StripPrefix=2` |
| `course` | `/learning/**` | `COURSE_SERVICE_URI` | `StripPrefix=3` |
| `sale` | `/sale/**` | `SALE_SERVICE_URI` | `StripPrefix=3` |
| `notify` | `/notify/**` | `NOTIFY_SERVICE_URI` | `StripPrefix=2`, adds `X-Gateway: passed` |
| `socket` | `/socket.io/**` | `SOCKET_SERVICE_URI` | `StripPrefix=2` |
| `assistant` | `/assistant/**` | `ASSISTANT_SERVICE_URI` | `StripPrefix=3` |

Examples:

- `GET /api/v1/auth/refresh` → user-service `GET /auth/refresh`
- `GET /api/v1/learning/courses` → course-service `GET /courses`
- `GET /api/v1/notify/blog/all` → notification-service `GET /notify/blog/all`

Routes and their default URIs are defined in [`src/main/resources/application.yaml`](src/main/resources/application.yaml).

## CORS

Global CORS is configured for `http://localhost:3000` and `learnova.t9tieanh.io.vn` (methods `GET`, `POST`, `OPTIONS`, credentials allowed). Add new frontend origins under `spring.cloud.gateway.globalcors`.

## Requirements

- Java 21
- Maven 3.8+

## Running locally

```sh
cd rest-api/api-gateway
./mvnw spring-boot:run
```

Override the downstream targets with environment variables if the services do not run on their default addresses:

```sh
export USER_SERVICE_URI=http://localhost:8080
export COURSE_SERVICE_URI=http://localhost:8081
export SALE_SERVICE_URI=http://localhost:4000
export NOTIFY_SERVICE_URI=http://localhost:8017
export SOCKET_SERVICE_URI=http://localhost:5001
export ASSISTANT_SERVICE_URI=http://localhost:4000
```

> Adjust the ports to match how you start each service — sale-service and assistant-service both default to `4000`, so one of them must be moved when running both locally.

## Docker

The build context is the `rest-api/` folder (parent Maven project):

```sh
cd rest-api
docker build -t api-gateway:latest -f api-gateway/Dockerfile .
```

Or run it together with the rest of the stack from the repository root with `docker-compose.local.yml`.

## Health check

Spring Boot Actuator exposes `GET /actuator/health`.
