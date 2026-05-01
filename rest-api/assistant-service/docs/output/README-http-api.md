# Lesson test — HTTP API (`curl` + mô tả)

Chỉ các endpoint **lesson-test** đã implement trong assistant-service. Path gốc là **`/analysis`** (service chạy trực tiếp, ví dụ `http://localhost:4000`). Nếu có gateway prefix (ví dụ `/assistant`), ghép vào `BASE_URL`.

**Biến**

| Biến | Ý nghĩa |
|------|---------|
| `BASE_URL` | Origin service |
| `TOKEN` | JWT — `Authorization: Bearer …` |
| `LESSON_ID` | UUID bài học |
| `CHUNK_ID` | UUID lesson chunk (1–3 id khi tạo group) |
| `GROUP_ID` | UUID bảng `lesson_test_chunk_groups` |
| `JOB_ID` | ID job Bull sau `POST …/generate-quizzes` |

Script gọi tuần tự: [`lesson-test-api-curls.sh`](./lesson-test-api-curls.sh).

**Middleware chung**

- Mọi route dưới đây: **`Authentication(true)`** + **`checkLessonOwnership`** (trừ khi ghi chú khác).
- **`POST …/generate-quizzes`**: thêm **`checkQuizGenerationVip`** (VIP).
- Nhóm chỉ có **`groupId`**: **`resolveLessonIdFromLessonTestChunkGroup`** → resolve `lessonId` rồi mới kiểm tra ownership.

---

## A. Blueprint & bulk — theo `lessonId`

File route: `src/routes/lesson_test.route.ts`

### `GET /analysis/lessons/:lessonId/lesson-test`

Lấy blueprint (`lesson_tests`) + danh sách chunk groups + trường **generation** gợi ý (idle / queued / …) cho UI.

```bash
curl -sS "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test" \
  -H "Authorization: Bearer ${TOKEN}"
```

### `PUT /analysis/lessons/:lessonId/lesson-test`

Tạo hoặc cập nhật **header** blueprint (`title`, `status`, `targetTotalQuestions`, `notes`). Không tự tạo/xóa chunk groups.

```bash
curl -sS -X PUT "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Đề cương kiểm tra","status":"DRAFT","targetTotalQuestions":10,"notes":null}'
```

### `DELETE /analysis/lessons/:lessonId/lesson-test`

Xóa blueprint (hành vi cascade theo Prisma).

```bash
curl -sS -X DELETE "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test" \
  -H "Authorization: Bearer ${TOKEN}"
```

### `POST /analysis/lessons/:lessonId/lesson-test/generate-quizzes`

Enqueue **nhiều** job — mặc định **tất cả** chunk group của lesson, hoặc lọc **`groupIds`**.  
**Mỗi job** lấy **`questionCount`**, **`distribution`**, **`batchUserPrompt`** đã lưu trên row nhóm (tạo/sửa qua `POST`/`PATCH` chunk group). **Không** có một `userPrompt` chung cho cả bulk; muốn chỉnh hướng dẫn theo nhóm thì cập nhật `batchUserPrompt` (hoặc gọi `POST …/chunk-groups/:groupId/generate-quizzes` với `userPrompt` tùy chọn cho **một** nhóm).

Response **`202`** + `{ jobs: [{ groupId, jobId }] }`.

Body **`BulkGenerateLessonTestDto`**: optional **`groupIds`** — bỏ hoặc `{}` = enqueue mọi nhóm có `questionCount >= 1`.
curl -sS -X POST "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/generate-quizzes" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"groupIds":["00000000-0000-4000-8000-000000000001"]}'
```

Tất cả nhóm:

```bash
curl -sS -X POST "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/generate-quizzes" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### `GET /analysis/lessons/:lessonId/lesson-test/generate-quizzes/status`

Snapshot trạng thái nhiều job (**polling ngắn**, không long-poll). Query lặp: **`jobId`** (nhiều lần).

```bash
curl -sS "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/generate-quizzes/status?jobId=${JOB_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### `POST /analysis/lessons/:lessonId/lesson-test/chunk-groups`

Tạo chunk group: **`chunkIds`** (1–3 UUID), **`questionCount`**, tùy chọn `label`, `distribution`, `batchUserPrompt`.

```bash
curl -sS -X POST "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/chunk-groups" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"chunkIds\":[\"${CHUNK_ID}\"],\"questionCount\":2,\"label\":\"Nhóm A\"}"
```

DTO: `src/dto/request/lesson-test.dto.ts` (`PutLessonTestDto`, `BulkGenerateLessonTestDto`, `CreateLessonTestChunkGroupDto`).

---

## B. Chunk group — chỉ cần `groupId`

File route: `src/routes/lesson_test_chunk_group.route.ts`  
Prefix: **`/analysis/lesson-test/chunk-groups/:groupId`** — **không** có `lessonId` trên URL.

### `PATCH /analysis/lesson-test/chunk-groups/:groupId`

Cập nhật một phần nhóm (chunkIds, questionCount, label, distribution, batchUserPrompt). Ít nhất một field trong body.

```bash
curl -sS -X PATCH "${BASE_URL}/analysis/lesson-test/chunk-groups/${GROUP_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"questionCount":3,"label":"Đã sửa"}'
```

### `DELETE /analysis/lesson-test/chunk-groups/:groupId`

Xóa chunk group.

```bash
curl -sS -X DELETE "${BASE_URL}/analysis/lesson-test/chunk-groups/${GROUP_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### `POST /analysis/lesson-test/chunk-groups/:groupId/generate-quizzes`

Enqueue generation **một** nhóm. Body tùy chọn **`userPrompt`**. **`202`** + `{ groupId, jobId }`.

```bash
curl -sS -X POST "${BASE_URL}/analysis/lesson-test/chunk-groups/${GROUP_ID}/generate-quizzes" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"Tập trung vào khái niệm X"}'
```

### `GET /analysis/lesson-test/chunk-groups/:groupId/generate-quizzes/status`

Long-poll (timeout ~25s nội bộ). Query **`jobId`** (bắt buộc). Response phụ thuộc outcome (PROCESSING / COMPLETED / FAILED / client đóng connection → ABORTED không trả body).

```bash
curl -sS "${BASE_URL}/analysis/lesson-test/chunk-groups/${GROUP_ID}/generate-quizzes/status?jobId=${JOB_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

DTO: `PatchLessonTestChunkGroupDto`, `GenerateLessonTestGroupQuizzesDto`.

---

## Tóm tắt

| Method | Path |
|--------|------|
| GET | `/analysis/lessons/:lessonId/lesson-test` |
| PUT | `/analysis/lessons/:lessonId/lesson-test` |
| DELETE | `/analysis/lessons/:lessonId/lesson-test` |
| POST | `/analysis/lessons/:lessonId/lesson-test/generate-quizzes` |
| GET | `/analysis/lessons/:lessonId/lesson-test/generate-quizzes/status` |
| POST | `/analysis/lessons/:lessonId/lesson-test/chunk-groups` |
| PATCH | `/analysis/lesson-test/chunk-groups/:groupId` |
| DELETE | `/analysis/lesson-test/chunk-groups/:groupId` |
| POST | `/analysis/lesson-test/chunk-groups/:groupId/generate-quizzes` |
| GET | `/analysis/lesson-test/chunk-groups/:groupId/generate-quizzes/status` |
