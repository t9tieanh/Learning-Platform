# Seed Purchases Design

Date: 2026-06-14

## Goal

Add a safe bulk seed tool that creates completed course-purchase data from a JSON file by writing directly to the existing service databases.

The seed must match the current codebase's real purchase outcome, not an idealized future flow.

## Current Purchase Flow Found In Code

### Services involved

- `sale-service` owns cart, order, order item, payment schema, payment callback handling, and course-purchase saga orchestration.
- `course-service` owns course data and enrollments.
- `user-service` owns users, roles, instructor/student identity, and source-of-truth `name` and `email`.

### Sale-service flow

Files read:

- `rest-api/sale-service/src/service/models/order.service.ts`
- `rest-api/sale-service/src/service/models/order-payment.service.ts`
- `rest-api/sale-service/src/sagas/order_course/course.handler.ts`
- `rest-api/sale-service/prisma/schema.prisma`

Observed runtime flow:

1. `POST /orders` validates user and courses, rejects self-purchase, rejects already-purchased courses, computes order total from `course-service`, and stores a draft order in Redis.
2. `POST /orders/payment/:method` persists `orders` and `order_items` into the sale-service MySQL database with `status=Pending`.
3. Payment verification callback changes the order to `Processing`, publishes `order.created.v1` to RabbitMQ, and waits for saga completion through Redis Pub/Sub.
4. When `course-service` confirms enrollment, `sale-service` marks the order `Completed`.

### Course-service flow

Files read:

- `rest-api/course-service/src/main/java/com/freeclassroom/courseservice/sagas/ConsumerRegistrationService.java`
- `rest-api/course-service/src/main/java/com/freeclassroom/courseservice/entity/member/EnrollmentsEntity.java`
- `rest-api/course-service/src/main/java/com/freeclassroom/courseservice/entity/course/CourseEntity.java`
- `rest-api/course-service/src/main/java/com/freeclassroom/courseservice/repository/entity/EnrollmentRepository.java`

Observed runtime flow:

1. `course-service` consumes `order.created.v1`.
2. It loads the purchased courses.
3. It creates one `enrollments` row per `(student, course)`.
4. It publishes `register.updated.v1` on success or `register.update.failed.v1` on failure.

### User-service role in course purchase

Files read:

- `rest-api/user-service/src/main/java/com/freeclassroom/userservice/entity/user/UserEntity.java`
- `rest-api/user-service/src/main/java/com/freeclassroom/userservice/grpc/server/UserGrpcService.java`

Observed runtime flow:

- `user-service` does not create course-purchase records.
- `user-service` is the source of `users.id`, `users.name`, `users.email`, and user roles.
- Instructor and student are not stored in separate tables. They are users with roles.

### Databases and records created by the real runtime

When a normal course purchase succeeds, the current codebase produces:

- sale-service database:
  - `orders`
  - `order_items`
- course-service database:
  - `enrollments`

Important finding:

- The current normal course-purchase flow does not create a `payments` record, even though `sale-service` defines a `Payment` model in Prisma.
- The seed tool must preserve this behavior and must not create `payments` rows for course-purchase seeding.

## Real Schema Boundaries Used By The Seed

### sale-service

From `rest-api/sale-service/prisma/schema.prisma`:

- `orders`
  - `id`
  - `user_id`
  - `status`
  - `type`
  - `customer_name`
  - `customer_email`
  - `total`
  - `discount_id`
  - `created_at`
  - `updated_at`
- `order_items`
  - `id`
  - `order_id`
  - `course_id`
  - `price`
  - `created_at`

Relevant enums:

- `OrderStatus`: `Cancel`, `Pending`, `Processing`, `Completed`
- `OrderType`: `COURSE`, `VIP_SUBSCRIPTION`

### course-service

From `EnrollmentsEntity` and `CourseEntity`:

- `enrollments`
  - `id`
  - `user_id`
  - `is_owner_enrollment`
  - `enrollment_date`
  - `status`
  - `progress`
  - `course_id`
  - inherited audit columns from `AbstractEntity`
- unique constraint on `(user_id, course_id)`

- `courses`
  - `id`
  - `instructor_id`
  - `final_price`
  - `status`

### user-service

From `UserEntity`:

- `users`
  - `id`
  - `name`
  - `email`

## Seed Objective

Create a direct database seeding flow that produces the same final state as a completed course purchase:

- `orders.status = Completed`
- `orders.type = COURSE`
- `order_items` attached to those orders
- `enrollments` for each purchased course

The seed must not simulate:

- payment gateway callbacks
- RabbitMQ
- Redis
- runtime saga execution

## Input JSON Design

The JSON file references existing IDs only. It does not create new users, instructors, or courses.

```json
{
  "metadata": {
    "source": "manual-seed",
    "createdAt": "2026-06-14T10:00:00Z",
    "currency": "VND"
  },
  "instructors": [
    {
      "instructorId": "usr_instructor_001",
      "courseIds": [
        "course_001",
        "course_002"
      ]
    }
  ],
  "students": [
    {
      "studentId": "usr_student_001",
      "purchases": [
        {
          "courseId": "course_001",
          "instructorId": "usr_instructor_001",
          "purchasedAt": "2026-06-01T08:00:00Z"
        },
        {
          "courseId": "course_002",
          "instructorId": "usr_instructor_001",
          "purchasedAt": "2026-06-01T08:00:00Z"
        }
      ]
    }
  ]
}
```

### JSON rules

- `studentId`, `instructorId`, and `courseId` must already exist in databases.
- `customerName` and `customerEmail` are not allowed in the file.
- `customer_name` and `customer_email` for orders must be loaded from `user-service.users` by `studentId`.
- `instructors[]` is used only for validation and documentation of expected course ownership.
- `students[].purchases[]` is the authoritative seed input.

## Grouping And Order Creation Rules

- Purchases are grouped by `studentId + purchasedAt`.
- Each group becomes one `orders` row.
- Each purchased course in that group becomes one `order_items` row.
- A single order may contain courses from multiple instructors, because the current `sale-service` order model supports that behavior.

If all purchases in a group are skipped by idempotency, no order is created for that group.

## Validation Rules

Before any write, the seed command must batch-load and validate:

- all student IDs from `user-service.users`
- all course IDs from `course-service.courses`
- all instructor IDs referenced in JSON
- all existing enrollments for `(studentId, courseId)` pairs in input

Checks:

1. `studentId` exists in `user-service.users`
2. `courseId` exists in `course-service.courses`
3. `course.instructor_id == instructorId` declared in JSON
4. `studentId != course.instructor_id`, to match the runtime self-purchase rejection rule
5. purchased course is eligible for seeding

Recommended compatibility validation:

- reject courses not in a usable published state if they would have been rejected by the runtime purchase flow

## Idempotency Design

The idempotency key is `(studentId, courseId)`.

Behavior:

- if an enrollment already exists for `(studentId, courseId)`, that purchase is skipped
- the script does not use an order reference key from JSON
- the script does not create a duplicate order just because the same file runs twice

This matches the business goal of preserving final purchased state rather than replaying checkout attempts.

## Consistency Design

This seed writes to separate service databases, so there is no real distributed transaction available.

The design uses:

- transaction in sale-service database for `orders` and `order_items`
- transaction in course-service database for `enrollments`
- explicit compensation if cross-database consistency fails

### Write sequence

1. Validate and plan all writes.
2. Start sale DB transaction.
3. Insert one `orders` row per valid group.
4. Insert matching `order_items`.
5. Commit sale DB transaction.
6. Start course DB transaction.
7. Insert matching `enrollments`.
8. Commit course DB transaction.
9. If course DB insert fails after sale DB commit, run compensation in sale DB to remove only the order rows created by this seed run.

### Seeded values

`orders`:

- `user_id = studentId`
- `customer_name = users.name`
- `customer_email = users.email`
- `total = sum(course.final_price)`
- `status = Completed`
- `type = COURSE`
- `discount_id = null`
- timestamps derived from `purchasedAt` where practical, otherwise database defaults

`order_items`:

- `order_id = created order id`
- `course_id = courseId`
- `price = course.final_price`

`enrollments`:

- `user_id = studentId`
- `course_id = courseId`
- `is_owner_enrollment = false`
- `progress = 0`
- `status = null`
- `enrollment_date = purchasedAt`

## Aiven Connection Contract

The shell script must support separate databases per service.

Required env vars:

- `AIVEN_SALE_DB_HOST`
- `AIVEN_SALE_DB_PORT`
- `AIVEN_SALE_DB_NAME`
- `AIVEN_SALE_DB_USER`
- `AIVEN_SALE_DB_PASSWORD`
- `AIVEN_SALE_DB_SSL_MODE`
- `AIVEN_SALE_DB_CA_CERT`
- `AIVEN_COURSE_DB_HOST`
- `AIVEN_COURSE_DB_PORT`
- `AIVEN_COURSE_DB_NAME`
- `AIVEN_COURSE_DB_USER`
- `AIVEN_COURSE_DB_PASSWORD`
- `AIVEN_COURSE_DB_SSL_MODE`
- `AIVEN_COURSE_DB_CA_CERT`
- `AIVEN_USER_DB_HOST`
- `AIVEN_USER_DB_PORT`
- `AIVEN_USER_DB_NAME`
- `AIVEN_USER_DB_USER`
- `AIVEN_USER_DB_PASSWORD`
- `AIVEN_USER_DB_SSL_MODE`
- `AIVEN_USER_DB_CA_CERT`

### Connection rules

- Do not write back into project `.env`.
- Build runtime connection settings in the shell script.
- For `sale-service`, temporarily set `DATABASE_URL` for Prisma runtime only.
- For `course-service` and `user-service`, connect with direct MySQL client configuration in the seed command.
- Test all required database connections before starting the seed.
- Never print passwords or full connection strings.
- Log only masked connection targets such as host, port, and database name.

## Runtime Components To Add

Files to create:

- `scripts/seed-purchases.sh`
- `rest-api/sale-service/scripts/seed-purchases.ts`
- `data/mock-purchases.json`
- `docs/seed-purchases.md`

Files to update:

- `Makefile`

## Command Design

### Shell entrypoint

`scripts/seed-purchases.sh`

Responsibilities:

- load `.env` if present
- validate required env vars
- validate input file path
- test DB connectivity
- export runtime connection env vars
- invoke the Node seed command

### Makefile target

```make
seed-purchases:
	./scripts/seed-purchases.sh $(or $(FILE),./data/mock-purchases.json)
```

Supported usage:

```bash
make seed-purchases FILE=./data/mock-purchases.json
DRY_RUN=1 make seed-purchases FILE=./data/mock-purchases.json
```

## Seed Command Design

`rest-api/sale-service/scripts/seed-purchases.ts`

Responsibilities:

- parse and validate JSON structure
- connect to sale, course, and user databases
- preload users, courses, and enrollments in batches
- group valid purchases into orders
- execute writes with compensation
- print final report
- support `DRY_RUN`

Recommended implementation details:

- reuse Prisma for sale-service writes
- use a MySQL client from Node for course-service and user-service direct access
- keep all high-risk business rules in focused helper functions

## Logging And Reporting

The tool should log:

- start of run
- input file path
- dry-run mode on/off
- validated DB targets
- total purchases scanned
- purchases skipped because enrollment already exists
- invalid references
- orders created
- order items created
- enrollments created
- compensated failures
- final success or failure summary

## Testing Strategy

Minimum coverage:

- JSON parse and shape validation
- grouping by `studentId + purchasedAt`
- idempotency filtering by existing enrollment
- preflight validation failures
- compensation behavior when course DB write fails after sale DB commit

Operational safeguards:

- `DRY_RUN=1` mode must perform full validation and planning without writing
- post-run verification must confirm:
  - expected number of orders inserted
  - expected number of order items inserted
  - expected number of enrollments inserted
  - no duplicate `(studentId, courseId)` enrollments from the seeded set

## Out Of Scope

- creating new users
- creating new instructors
- creating new courses
- creating `payments` rows
- simulating RabbitMQ, Redis, or payment gateways
- refactoring the real purchase runtime

## Risks And Mitigations

### Risk: partial cross-database success

Mitigation:

- use explicit compensation for newly created sale DB orders if course DB enrollment creation fails

### Risk: stale or invalid input IDs

Mitigation:

- fail in preflight before any write

### Risk: rerunning the same file

Mitigation:

- idempotency based on existing `(studentId, courseId)` enrollment

### Risk: leaking secrets in logs

Mitigation:

- log masked targets only
- never print passwords or full DSNs

## Implementation Recommendation

Implement a direct DB seed tool with service-aware validation and compensation.

This matches the current architecture, preserves real purchased end-state, supports Aiven cleanly, and avoids introducing fake runtime behavior that the production checkout path does not currently execute.
