# Performance Tests

This test suite uses `k6` and only calls endpoints verified in the codebase, through the API Gateway `http://localhost:8888/api/v1` as defined in [rest-api/api-gateway/target/classes/application.yaml](/home/ducsang4869/HCMUTE/Learning-Platform/rest-api/api-gateway/target/classes/application.yaml).

## Verified from source

- Auth: `POST /auth`, `GET /self`, `POST /auth/refresh`
- Public learning: `GET /learning/courses`, `GET /learning/courses/{id}`, `GET /learning/categories`, `GET /learning/tags`
- Learner: `GET /learning/courses-student/self`
- Sale: `GET /sale/status`, `GET /sale/health`, `POST /sale/cart`, `POST /sale/orders`
- Admin: `GET /user/home-admin`, `GET /user/admin/pending-actions`, `GET /user/admin/top-courses`, `GET /user/admin/top-instructors`, `GET /learning/admin/business-performance`
- Instructor: `GET /instructor/statistic`, `GET /instructor/chart`, `GET /learning/instructor/courses`, `GET /learning/courses-instructor/analytics/learners`, `GET /learning/courses-instructor/analytics/revenue`

## Remaining TODOs

- `TODO`: no shared global health endpoint was found on the gateway, so the smoke test uses `GET /user` and `GET /sale/status`
- `TODO`: old frontend routes such as `learning/courses-user...` are not used because the current backend has no matching controller for them
- `TODO`: cart, order, and payment are write flows. The scripts only run them when `ENABLE_WRITE_FLOWS=true`
- `TODO`: order/payment only run when `ENABLE_SANDBOX_ORDER_FLOW=true` and a sandbox/test environment is available
- `TODO`: `browser-test.js` only logs in after you have verified the selectors yourself and set `ENABLE_BROWSER_LOGIN=true`

## Structure

```text
performance-tests/
├── helpers/
├── scripts/
├── data/
├── results/
└── README.md
```

## Environment variables

```bash
export BASE_URL=http://localhost:8888/api/v1
export WEB_URL=http://localhost:3000
export HTTP_TIMEOUT=30s

export USER_EMAIL=student@example.com
export USER_PASSWORD=ChangeMe123!

export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=ChangeMe123!

export INSTRUCTOR_EMAIL=instructor@example.com
export INSTRUCTOR_PASSWORD=ChangeMe123!

export COURSE_ID=replace-with-real-course-id

export ENABLE_WRITE_FLOWS=false
export ENABLE_SANDBOX_ORDER_FLOW=false
export ENABLE_BROWSER_LOGIN=false
```

Notes:

- The backend `POST /auth` accepts the payload `{ "username": "...", "password": "..." }`
- Therefore the `USER_EMAIL`, `ADMIN_EMAIL`, `INSTRUCTOR_EMAIL` variables are used as the login principal for the `username` field
- If the system logs in by username instead of email, you can use `USER_LOGIN`, `ADMIN_LOGIN`, `INSTRUCTOR_LOGIN`
- If you already have tokens, you can set `USER_TOKEN`, `ADMIN_TOKEN`, `INSTRUCTOR_TOKEN`

## Installing k6

1. Install `k6` on your local machine.
2. Update the sample files in `performance-tests/data/*.sample.json` or set env vars from the shell/CI.
3. Make sure the API Gateway and the services are running.

## Run commands

```bash
k6 run performance-tests/scripts/smoke-test.js
k6 run performance-tests/scripts/load-test.js
k6 run performance-tests/scripts/stress-test.js
k6 run performance-tests/scripts/spike-test.js
k6 run performance-tests/scripts/soak-test.js
k6 run performance-tests/scripts/api-flow-test.js
k6 run performance-tests/scripts/admin-dashboard-test.js
k6 run performance-tests/scripts/instructor-dashboard-test.js
K6_BROWSER_ENABLED=true k6 run performance-tests/scripts/browser-test.js
```

Each script automatically generates:

- `performance-tests/results/<script-name>-report.html`
- `performance-tests/results/<script-name>-summary.json`
- a formatted summary table in the terminal

Example:

```bash
k6 run performance-tests/scripts/smoke-test.js
xdg-open performance-tests/results/smoke-report.html
```

If you are inside the `k6-performance-test` directory, use paths that go up one level:

```bash
k6 run ../performance-tests/scripts/smoke-test.js
xdg-open ../performance-tests/results/smoke-report.html
```

## Script descriptions

- `smoke-test.js`: quick endpoint check for 30s, includes login/profile if credentials are provided
- `load-test.js`: simulates normal load with browse, search, course detail, and my learning
- `stress-test.js`: gradually ramps up VUs to find the limits
- `spike-test.js`: simulates traffic spikes
- `soak-test.js`: long-running test to watch for leaks and queue backlog
- `api-flow-test.js`: guest -> user flow, only adds cart/order when the safety flag is enabled
- `admin-dashboard-test.js`: admin dashboard via `user-service` and `course-service`
- `instructor-dashboard-test.js`: instructor dashboard, prefers logging in with credentials to obtain `userId`
- `browser-test.js`: lightweight browser smoke test for the home page

## Thresholds

- Smoke: `http_req_duration p95 < 1000ms`, `http_req_failed < 1%`, `checks > 99%`
- Load: separate thresholds for course list, search, detail; `http_req_failed < 1%`, `checks > 95%`
- Stress: `http_req_failed < 5%`
- Spike: `http_req_failed < 10%`
- Soak: `http_req_duration p95 < 2000ms`, `http_req_failed < 1%`
- Admin/Instructor: `http_req_duration p95 < 2000ms`, `http_req_failed < 1%`

## Operational notes

- Do not run write flows against production unless `testMode`, staging, or sandbox has been confirmed.
- For soak tests, also monitor CPU, RAM, DB, Redis, RabbitMQ, Elasticsearch, and server logs.
- The payment flow should currently only be used with a sandbox. Do not trigger real payments.
- If `INSTRUCTOR_TOKEN` does not come with a `userId`, the instructor dashboard script reports a `TODO` and skips statistic/chart.
