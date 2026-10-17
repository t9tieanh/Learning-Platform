# Proto Shared

Shared **gRPC / Protocol Buffers** contracts used for synchronous service-to-service communication in Learnova.

- **Java services** (`user-service`, `course-service`) depend on this module as a Maven artifact; stubs are generated at build time by `protobuf-maven-plugin`.
- **Node.js services** (`notification-service`, `assistant-service`, `sale-service`) load the `.proto` files at runtime with `@grpc/proto-loader`, reading them directly from `rest-api/proto-shared/src/main/proto`.

## Tech Stack

![gRPC](https://img.shields.io/badge/gRPC-244c5a?style=for-the-badge&logo=google&logoColor=white)
![Protobuf](https://img.shields.io/badge/Protocol_Buffers-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)

## Contracts

All files live in [`src/main/proto/`](src/main/proto/). Message definitions are split from service definitions (`user.proto` + `userService.proto`, etc.).

| Service | Files | Implemented by | Default gRPC port |
|---------|-------|----------------|-------------------|
| `UserService` | `user.proto`, `userService.proto` | user-service | `50051` |
| `CourseService` | `course.proto`, `courseService.proto` | course-service | `50054` |
| `SaleService` | `sale.proto`, `saleService.proto` | sale-service | `50053` |
| `BlogService` | `blog.proto`, `blogService.proto` | notification-service | `9092` |
| `AssistantService` | `assistant.proto`, `assistantService.proto` | assistant-service | `50055` |
| `HelloService` | `hello.proto` | course-service (connectivity test) | — |

A few examples of what each contract provides:

- **UserService** — `GetUser`, `GetBulkTeachers`, `GetTeacherDetail`, `CheckIsVip`
- **CourseService** — `getCourse`, `getBulkCourses`, `checkHasPurchased`, `canViewLesson`, `canEditLesson`, `tryIssueCourseCompletionCertificate`
- **SaleService** — `getRevenueAndProfit`, `getTopCoursesRevenue`, `getAdminBusinessRevenue`
- **BlogService** — `getTotalBlog`, `getFeedbackByCourseId`, `createConversationAI`
- **AssistantService** — `batchGetLessonTestEligibility`

## Build

The module is part of the `rest-api` parent POM. Install it into your local Maven repository before building a Java service that depends on it:

```sh
cd rest-api
mvn -pl proto-shared install
```

Generated Java classes end up in `target/generated-sources/protobuf`.

## Changing a contract

1. Edit the `.proto` file(s) in `src/main/proto/`.
2. Keep changes backward compatible: add new fields with new tag numbers, never reuse or renumber existing tags.
3. Re-run `mvn -pl proto-shared install` and rebuild the Java services that use it.
4. Restart the Node.js services that load the changed file (they read it at startup).
