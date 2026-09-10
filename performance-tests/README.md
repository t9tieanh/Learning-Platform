# Performance Tests

This test suite uses `k6` and only calls endpoints verified from the codebase through the API Gateway at `http://localhost:8888/api/v1`, based on the API Gateway configuration.

## Verified from the source

- Auth: `POST /auth`, `GET /self`, `POST /auth/refresh`
- Public learning: `GET /learning/courses`, `GET /learning/courses/{id}`, `GET /learning/categories`, `GET /learning/tags`
- Learner: `GET /learning/courses-student/self`
- Sale: `GET /sale/status`, `GET /sale/health`, `POST /sale/cart`, `POST /sale/orders`
- Admin: `GET /user/home-admin`, `GET /user/admin/pending-actions`, `GET /user/admin/top-courses`, `GET /user/admin/top-instructors`, `GET /learning/admin/business-performance`
- Instructor: `GET /instructor/statistic`, `GET /instructor/chart`, `GET /learning/instructor/courses`, `GET /learning/courses-instructor/analytics/learners`, `GET /learning/courses-instructor/analytics/revenue`

## Known TODOs

- `TODO`: No shared global health endpoint was found for the gateway, so the smoke test uses `GET /user` and `GET /sale/status`
- `TODO`: Do not use legacy frontend routes such as `learning/courses-user...` because the current backend does not have a verified corresponding controller
- `TODO`: Cart, order, and payment are write flows. The script runs them only when `ENABLE_WRITE_FLOWS=true`
- `TODO`: Order/payment flows run only when `ENABLE_SANDBOX_ORDER_FLOW=true` and a sandbox/test environment is available
- `TODO`: `browser-test.js` performs login only after you confirm the selector and enable `ENABLE_BROWSER_LOGIN=true`

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
- Therefore, `USER_EMAIL`, `ADMIN_EMAIL`, and `INSTRUCTOR_EMAIL` are used as the login principals for the `username` field
- If the system uses usernames instead of email addresses for login, you can use `USER_LOGIN`, `ADMIN_LOGIN`, and `INSTRUCTOR_LOGIN`
- If tokens are already available, you can set `USER_TOKEN`, `ADMIN_TOKEN`, and `INSTRUCTOR_TOKEN`

## Install k6

1. Install `k6` locally.
2. Update the sample files in `performance-tests/data/*.sample.json` or set the environment variables from your shell/CI.
3. Make sure the API Gateway and all services are running.

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
- A formatted summary in the terminal

Example:

```bash
k6 run performance-tests/scripts/smoke-test.js
xdg-open performance-tests/results/smoke-report.html
```

If you are in the `k6-performance-test` directory, go up one level in the path:

```bash
k6 run ../performance-tests/scripts/smoke-test.js
xdg-open ../performance-tests/results/smoke-report.html
```

## Script descriptions

- `smoke-test.js`: Quickly checks endpoints for 30 seconds, including login/profile when credentials are provided
- `load-test.js`: Simulates normal traffic with browsing, search, course details, and my learning
- `stress-test.js`: Gradually increases VUs to find the system limit
- `spike-test.js`: Simulates a sudden traffic spike
- `soak-test.js`: Runs for an extended period to monitor leaks and queue backlogs
- `api-flow-test.js`: Guest-to-user flow, with cart/order added only when the safety flag is enabled
- `admin-dashboard-test.js`: Tests the admin dashboard through `user-service` and `course-service`
- `instructor-dashboard-test.js`: Tests the instructor dashboard, preferring credential-based login to obtain `userId`
- `browser-test.js`: Lightweight browser smoke test for the home page

## Thresholds

- Smoke: `http_req_duration p95 < 1000ms`, `http_req_failed < 1%`, `checks > 99%`
- Load: threshold rieng cho course list, search, detail; `http_req_failed < 1%`, `checks > 95%`
- Stress: `http_req_failed < 5%`
- Spike: `http_req_failed < 10%`
- Soak: `http_req_duration p95 < 2000ms`, `http_req_failed < 1%`
- Admin/Instructor: `http_req_duration p95 < 2000ms`, `http_req_failed < 1%`

## Operational notes

- Do not run write flows in production without confirming `testMode`, staging, or a sandbox.
- For soak tests, also monitor CPU, RAM, the database, Redis, RabbitMQ, Elasticsearch, and server logs.
- Payment flows should currently be used only with a sandbox. Do not trigger real payments.
- If `INSTRUCTOR_TOKEN` is not accompanied by a `userId`, the instructor dashboard script reports `TODO` and skips statistic/chart requests.
