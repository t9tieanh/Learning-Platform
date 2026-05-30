# API spec — Lesson test (học viên)

Phiên bản tài liệu: **draft** (để review trước khi implement).

Kiến trúc đề xuất:

| Lớp | Đề xuất |
|-----|---------|
| Controller | `lesson_test_student.controller.ts` (tách khỏi `LessonTestController`) |
| Routes | `lesson_test_student.route.ts`, mount `IndexRouter.use('/analysis', lessonTestStudentRouter)` |
| Service | `lessonTestStudent.service.ts` — rule lesson “approved”, lesson test published, map quiz không có đáp án; submit + chấm điểm |

Envelope response: giống `sendResponse` hiện tại (`code`, `message`, `result`).

---

## Chung: điều kiện lesson “approved” (tầng service)

Sau khi middleware `checkViewLesson` pass, **service** kiểm tra bài học trong DB assistant (model `Lesson`):

| Điều kiện | Chi tiết |
|------------|----------|
| Tồn tại | Có bản ghi `Lesson` với `lessonId` |
| Chưa xóa mềm | `deleted === false` |
| Phân tích xong | `status === 'COMPLETED'` (`AnalysisStatus`) |
| Chất lượng hợp lệ | `isQualityValid === true` |

Nếu không thỏa → **403** (message kiểu “Bài học chưa sẵn sàng / chưa được duyệt”) — tách message với lỗi enroll.

**Lesson test:** chỉ expose nội dung khi tồn tại `LessonTest` và `status === 'PUBLISHED'`. Ngược lại → **404** (hoặc message thống nhất “Không có bài kiểm tra cho bài học này”).

---

## 1. GET — Lấy đề làm (ẩn đúp án)

### HTTP

| | |
|--|--|
| **Method** | `GET` |
| **Path** | `/analysis/lessons/:lessonId/lesson-test/student` |

### Path params

| Param | Type | Mô tả |
|-------|------|--------|
| `lessonId` | `string` (UUID) | ID bài học |

### Middleware (thứ tự)

1. `Authentication(true)`
2. `checkViewLesson` — `req.user.sub` + `req.params.lessonId`

### Service

- Áp rule **lesson approved** và **lesson test PUBLISHED** (mục “Chung” phía trên).
- Load `chunkGroups` theo `createdAt` **ascending**.
- Load quiz `quizScope = LESSON_TEST` thuộc lesson (theo group), map sang DTO học viên.

### Quy tắc DTO — Bảo mật tối đa

1.  **Không lộ đúng/sai:** Trên mỗi **choice** trong response **không** có field `isCorrect`.
2.  **Ẩn gợi ý & giải thích:** Trong lệnh `GET`, **không** trả về `explanation` của Quiz và `feedback` của Choice. Những thông tin này chỉ được trả về sau khi nộp bài (`POST`).
3.  **Shuffling (Trộn đề):** 
    - **Choices:** Thứ tự các `choices` trong mỗi câu hỏi phải được xáo trộn ngẫu nhiên.
    - **Quizzes:** Thứ tự các câu hỏi trong mỗi `chunkGroup` (hoặc trên toàn bài test) cũng nên được xáo trộn ngẫu nhiên để đảm bảo không có hai lần làm bài nào có thứ tự giống hệt nhau.

**`StudentQuizChoice`**

| Field | Type | Ghi chú |
|-------|------|--------|
| `id` | `string` | |
| `text` | `string` | |

**`StudentQuizItem`**

| Field | Type |
|-------|------|
| `id` | `string` |
| `question` | `string` |
| `type` | enum — **v1:** chỉ `MULTIPLE_CHOICE`, `TRUE_FALSE` |
| `difficulty` | enum |
| `bloomLevel` | enum |
| `choices` | `StudentQuizChoice[]` (thứ tự đã được trộn ngẫu nhiên) |
| `isApproved` | `boolean` |
| `status` | enum |
| `createdAt`, `updatedAt` | ISO string |
| `chunkId` | optional, thường absent với LESSON_TEST |

**`lessonTest` trong `result`:** `lessonId`, `title`, `status` (luôn `PUBLISHED` khi thành công), `targetTotalQuestions`, `createdAt`, `updatedAt`.

**`chunkGroups`:** `id`, `lessonId`, `chunkIds`, `questionCount`, `label`, `createdAt`, `updatedAt`, `quizzes` — **không** `distribution`, `batchUserPrompt`, `generation`.

### Response 200 — ví dụ

```json
{
  "code": 200,
  "message": "OK",
  "result": {
    "lessonTest": {
      "lessonId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Kiểm tra cuối bài: React hooks",
      "status": "PUBLISHED",
      "targetTotalQuestions": 10,
      "createdAt": "2026-04-10T08:15:00.000Z",
      "updatedAt": "2026-04-28T14:22:33.000Z"
    },
    "chunkGroups": [
      {
        "id": "11111111-2222-3333-4444-555555555501",
        "lessonId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "chunkIds": [
          "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0101"
        ],
        "questionCount": 4,
        "label": "Phần 1",
        "createdAt": "2026-04-12T10:00:00.000Z",
        "updatedAt": "2026-04-20T09:30:00.000Z",
        "quizzes": [
          {
            "id": "quiz-uuid-0001",
            "question": "useState trả về gì?",
            "type": "MULTIPLE_CHOICE",
            "difficulty": "MEDIUM",
            "bloomLevel": "UNDERSTAND",
            "choices": [
              { "id": "choice-uuid-01", "text": "…" },
              { "id": "choice-uuid-02", "text": "…" }
            ],
            "isApproved": true,
            "status": "ACTIVE",
            "createdAt": "2026-04-21T07:45:12.000Z",
            "updatedAt": "2026-04-21T07:45:12.000Z"
          }
        ]
      }
    ]
  }
}
```

Lưu ý: trong `choices` **không** có `isCorrect`.

### Lỗi

| `code` | Tình huống |
|--------|------------|
| 401 | Chưa xác thực |
| 400 | Thiếu `lessonId` |
| 403 | Không enroll (`checkViewLesson`) hoặc lesson chưa approved (service) |
| 404 | Không có lesson test / chưa `PUBLISHED` (policy thống nhất message) |
| 500 | Lỗi hệ thống |

---

## 2. POST — Nộp bài và tính điểm

Một lần gửi danh sách đáp án; server chấm tự động các loại câu hỗ trợ, trả **điểm + chi tiết đúng/sai** (chỉ sau khi nộp).

### HTTP

| | |
|--|--|
| **Method** | `POST` |
| **Path** | `/analysis/lessons/:lessonId/lesson-test/student/submissions` |

### Path params

Giống GET: `lessonId`.

### Middleware

1. `Authentication(true)`
2. `checkViewLesson`

### Headers

| Header | Bắt buộc |
|--------|----------|
| `Content-Type: application/json` | Có |

### Service (trước khi chấm)

- Cùng rule **lesson approved** + **lesson test PUBLISHED**.
- Chỉ chấm quiz thuộc `LESSON_TEST` của đúng `lessonId` (tránh gửi `quizId` lạ).
- Quiz không thuộc lesson / không active → có thể **400** (invalid quiz) hoặc bỏ qua với flag — khuyến nghị **400** rõ ràng.

### Request body

**v1:** chỉ `MULTIPLE_CHOICE` và `TRUE_FALSE` — mỗi câu gửi `quizId` + `selectedChoiceIds`.

```json
{
  "answers": [
    {
      "quizId": "quiz-uuid-0001",
      "selectedChoiceIds": ["choice-uuid-01"]
    },
    {
      "quizId": "quiz-uuid-0002",
      "selectedChoiceIds": ["choice-uuid-04"]
    }
  ]
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `answers` | `array` | Bắt buộc, có thể rỗng |
| `answers[].quizId` | `string` | Bắt buộc |
| `answers[].selectedChoiceIds` | `string[]` | Bắt buộc cho mọi phần tử trong v1; so khớp với đáp án đúng trong DB |

**Quy tắc gửi (v1):**

- Mỗi `quizId` xuất hiện **tối đa một lần** trong `answers`.
- Chỉ chấm quiz có `type` là `MULTIPLE_CHOICE` hoặc `TRUE_FALSE`. So khớp tập `selectedChoiceIds` (unique) với tập choice `isCorrect === true` trong DB.
- Câu **SHORT_ANSWER** (nếu vẫn tồn tại trong DB từ luồng khác): không nằm trong scope v1 — có thể trả **400** khi client gửi đáp án cho quiz đó, hoặc bỏ qua / 0 điểm (thống nhất khi implement).

**Điểm tối đa (v1 đề xuất):** mỗi câu hỏi tính **1 điểm** nếu đúng hoàn toàn, **0** nếu sai hoặc chưa trả lời (quiz có trong đề nhưng không có trong `answers`).

### Response 200 — `result`

```json
{
  "code": 200,
  "message": "OK",
  "result": {
    "submissionId": "optional-uuid-khi-luu-db",
    "lessonId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "summary": {
      "earnedPoints": 8,
      "maxPoints": 10,
      "percent": 80
    },
    "items": [
      {
        "quizId": "quiz-uuid-0001",
        "isCorrect": true,
        "pointsEarned": 1,
        "maxPoints": 1,
        "selectedChoiceIds": ["choice-uuid-01"],
        "correctChoiceIds": ["choice-uuid-01"],
        "explanation": "useState trả về một cặp [state, setState]."
      },
      {
        "quizId": "quiz-uuid-0002",
        "isCorrect": false,
        "pointsEarned": 0,
        "maxPoints": 1,
        "selectedChoiceIds": ["choice-uuid-99"],
        "correctChoiceIds": ["choice-uuid-04"],
        "explanation": "…"
      }
    ]
  }
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `submissionId` | `string` (optional) | Có khi persist lịch sử nộp bài |
| `lessonId` | `string` | Echo |
| `summary.earnedPoints` | `number` | Tổng điểm đạt được |
| `summary.maxPoints` | `number` | Tổng điểm tối đa (số câu được chấm tự động trong v1) |
| `summary.percent` | `number` | `0–100`, có thể `round` 2 chữ số: `maxPoints > 0 ? earned/max*100 : 0` |
| `items` | `array` | Một phần tử **cho mỗi quiz** thuộc lesson test published (kể cả câu không gửi đáp án) |
| `items[].quizId` | `string` | |
| `items[].isCorrect` | `boolean` | |
| `items[].pointsEarned` / `maxPoints` | `number` | |
| `items[].selectedChoiceIds` | `string[]` | Rỗng nếu không nộp |
| `items[].correctChoiceIds` | `string[]` | Lấy từ DB — chỉ sau submit |
| `items[].explanation` | `string` | Stem giải thích (có thể ẩn một phần nếu product yêu cầu) |

**Thứ tự `items`:** khuyến nghị cùng thứ tự “học viên” như GET (group `createdAt` asc, quiz `createdAt` asc trong group).

### Lỗi (submit)

| `code` | Tình huống |
|--------|------------|
| 400 | Body không hợp lệ; `quizId` trùng; `quizId` không thuộc lesson test; choice không thuộc quiz |
| 401 | Chưa xác thực |
| 403 | Enroll hoặc lesson chưa approved |
| 404 | Không có lesson test published |
| 500 | Lỗi hệ thống |

---

## 3. Yêu cầu Persistence (Đề xuất Schema)

Để lưu trữ lịch sử làm bài và hỗ trợ `submissionId` trong response, cần bổ sung các bảng sau vào Prisma:

### LessonTestSubmission
Lưu thông tin tổng quát của một lần nộp bài.

| Field | Type | Ghi chú |
|-------|------|---------|
| `id` | `string` (UUID) | PK |
| `lessonId` | `string` | FK tới Lesson |
| `userId` | `string` | ID học viên |
| `earnedPoints` | `float` | Tổng điểm đạt được |
| `maxPoints` | `int` | Tổng điểm tối đa |
| `percent` | `float` | Tỷ lệ phần trăm (0-100) |
| `createdAt` | `datetime` | Thời điểm nộp bài |

### LessonTestSubmissionAnswer
Lưu chi tiết từng câu trả lời trong một submission.

| Field | Type | Ghi chú |
|-------|------|---------|
| `id` | `string` (UUID) | PK |
| `submissionId` | `string` | FK tới LessonTestSubmission |
| `quizId` | `string` | FK tới Quiz |
| `selectedChoiceIds` | `json` | Mảng các ID choice học viên đã chọn |
| `isCorrect` | `boolean` | Kết quả chấm điểm |
| `pointsEarned` | `float` | Điểm đạt được cho câu này |

---

## 4. Ghi chú implement sau

1. **`checkViewLesson`:** hiện tại cần dùng kết quả `canView === false` để trả 403 thật (không hard-code `if (false)`).
2. **Chính sách nộp bài:** Cần xác định cho phép nộp lại (retake) không. Nếu có, `POST` sẽ luôn tạo submission mới. Nếu không, cần check tồn tại submission trước khi chấm.
3. **SHORT_ANSWER:** không có trong spec lesson test học viên v1; bổ sung API/body/grading sau.

