# Performance Tests

Bo test nay su dung `k6` va chi goi cac endpoint da xac thuc tu codebase qua API Gateway `http://localhost:8888/api/v1` theo [rest-api/api-gateway/target/classes/application.yaml](/home/ducsang4869/HCMUTE/Learning-Platform/rest-api/api-gateway/target/classes/application.yaml).

## Da xac thuc tu source

- Auth: `POST /auth`, `GET /self`, `POST /auth/refresh`
- Public learning: `GET /learning/courses`, `GET /learning/courses/{id}`, `GET /learning/categories`, `GET /learning/tags`
- Learner: `GET /learning/courses-student/self`
- Sale: `GET /sale/status`, `GET /sale/health`, `POST /sale/cart`, `POST /sale/orders`
- Admin: `GET /user/home-admin`, `GET /user/admin/pending-actions`, `GET /user/admin/top-courses`, `GET /user/admin/top-instructors`, `GET /learning/admin/business-performance`
- Instructor: `GET /instructor/statistic`, `GET /instructor/chart`, `GET /learning/instructor/courses`, `GET /learning/courses-instructor/analytics/learners`, `GET /learning/courses-instructor/analytics/revenue`

## TODO da giu nguyen

- `TODO`: khong thay global health endpoint chung cua gateway, nen smoke test dung `GET /user` va `GET /sale/status`
- `TODO`: khong dung cac route frontend cu nhu `learning/courses-user...` vi backend hien tai khong xac thuc thay controller tuong ung
- `TODO`: cart, order, payment la write flow. Script chi chay khi `ENABLE_WRITE_FLOWS=true`
- `TODO`: order/payment chi chay khi `ENABLE_SANDBOX_ORDER_FLOW=true` va co sandbox/test environment
- `TODO`: `browser-test.js` chi login khi ban tu xac nhan selector va bat `ENABLE_BROWSER_LOGIN=true`

## Cau truc

```text
performance-tests/
├── helpers/
├── scripts/
├── data/
├── results/
└── README.md
```

## Bien moi truong

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

Luu y:

- Backend `POST /auth` nhan payload `{ "username": "...", "password": "..." }`
- Vi vay cac bien `USER_EMAIL`, `ADMIN_EMAIL`, `INSTRUCTOR_EMAIL` duoc dung nhu login principal cho truong `username`
- Neu he thong dang dang nhap bang username thay vi email, ban co the dung `USER_LOGIN`, `ADMIN_LOGIN`, `INSTRUCTOR_LOGIN`
- Neu da co token san, co the set `USER_TOKEN`, `ADMIN_TOKEN`, `INSTRUCTOR_TOKEN`

## Cai dat k6

1. Cai `k6` tren may local.
2. Cap nhat file mau trong `performance-tests/data/*.sample.json` hoac set env tu shell/CI.
3. Dam bao API Gateway va cac service dang chay.

## Lenh chay

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

Moi script se tu dong sinh:

- `performance-tests/results/<ten-script>-report.html`
- `performance-tests/results/<ten-script>-summary.json`
- bang tong ket dep tren terminal

Vi du:

```bash
k6 run performance-tests/scripts/smoke-test.js
xdg-open performance-tests/results/smoke-report.html
```

Neu dang o thu muc `k6-performance-test`, dung duong dan lui len:

```bash
k6 run ../performance-tests/scripts/smoke-test.js
xdg-open ../performance-tests/results/smoke-report.html
```

## Mo ta script

- `smoke-test.js`: check nhanh endpoint trong 30s, co login/profile neu cung cap credentials
- `load-test.js`: mo phong tai binh thuong voi browse, search, course detail va my learning
- `stress-test.js`: tang VU dan de tim gioi han
- `spike-test.js`: mo phong dot bien traffic
- `soak-test.js`: chay lau de theo doi leak va queue backlog
- `api-flow-test.js`: flow guest -> user, chi them cart/order khi bat cờ an toan
- `admin-dashboard-test.js`: dashboard admin qua `user-service` va `course-service`
- `instructor-dashboard-test.js`: dashboard instructor, uu tien login bang credentials de lay `userId`
- `browser-test.js`: smoke browser nhe cho trang home

## Thresholds

- Smoke: `http_req_duration p95 < 1000ms`, `http_req_failed < 1%`, `checks > 99%`
- Load: threshold rieng cho course list, search, detail; `http_req_failed < 1%`, `checks > 95%`
- Stress: `http_req_failed < 5%`
- Spike: `http_req_failed < 10%`
- Soak: `http_req_duration p95 < 2000ms`, `http_req_failed < 1%`
- Admin/Instructor: `http_req_duration p95 < 2000ms`, `http_req_failed < 1%`

## Luu y van hanh

- Khong chay write flow tren production neu chua xac nhan `testMode`, staging, hoac sandbox.
- Với soak test, can theo doi them CPU, RAM, DB, Redis, RabbitMQ, Elasticsearch va log server.
- Payment flow hien chi nen dung voi sandbox. Khong goi thanh toan that.
- Neu `INSTRUCTOR_TOKEN` khong di kem `userId`, script instructor dashboard se bao `TODO` va bo qua statistic/chart.
