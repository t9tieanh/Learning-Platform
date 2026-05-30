# Lesson test (học viên) — `curl` & Postman

## Import Postman (khuyến nghị)

1. Postman → **Import** → kéo file hoặc chọn  
   [`lesson-test-student.postman_collection.json`](./lesson-test-student.postman_collection.json)
2. Vào collection → tab **Variables**: điền `baseUrl`, `token` (JWT), `lessonId`.
3. Request **POST**: sửa body `quizId` / `selectedChoiceIds` theo response GET.

**Import bằng raw cURL:** dùng khối dưới (Postman → Import → Raw text). Format `--location` + `--request` + `--header` + `--data-raw` là dạng Postman hay nhận diện.

### GET (paste vào Postman → Import)

```text
curl --location 'http://localhost:4000/analysis/lessons/LESSON_UUID_HERE/lesson-test/student' \
--header 'Authorization: Bearer YOUR_JWT_HERE'
```

### POST (paste vào Postman → Import)

```text
curl --location 'http://localhost:4000/analysis/lessons/LESSON_UUID_HERE/lesson-test/student/submissions' \
--header 'Authorization: Bearer YOUR_JWT_HERE' \
--header 'Content-Type: application/json' \
--data-raw '{
  "answers": [
    {
      "quizId": "00000000-0000-4000-8000-000000000001",
      "selectedChoiceIds": ["00000000-0000-4000-8000-000000000002"]
    }
  ]
}'
```

*(Thay `LESSON_UUID_HERE`, `YOUR_JWT_HERE` và UUID trong `answers` sau khi import, hoặc dùng file `.postman_collection.json` ở trên.)*

---

## Bash (terminal)

Các biến:

| Biến | Ý nghĩa |
|------|---------|
| `BASE_URL` | Origin assistant-service (ví dụ `http://localhost:4000`) |
| `TOKEN` | JWT — header `Authorization: Bearer …` |
| `LESSON_ID` | UUID bài học |

**Middleware:** `Authentication(true)` → `checkViewLesson` (user phải được enroll / xem được bài).

---

## GET — Lấy đề (ẩn đáp án, đã trộn thứ tự)

```bash
export BASE_URL="http://localhost:4000"
export TOKEN="<your-jwt>"
export LESSON_ID="<lesson-uuid>"

curl -sS "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/student" \
  -H "Authorization: Bearer ${TOKEN}"
```

Pretty JSON (có `jq`):

```bash
curl -sS "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/student" \
  -H "Authorization: Bearer ${TOKEN}" | jq .
```

---

## POST — Nộp bài và tính điểm

`quizId` / `choice-*` lấy từ response GET (sau khi làm bài locally, gửi đúng id đã chọn).

```bash
curl -sS -X POST "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/student/submissions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      { "quizId": "quiz-uuid-0001", "selectedChoiceIds": ["choice-uuid-01"] },
      { "quizId": "quiz-uuid-0002", "selectedChoiceIds": ["choice-uuid-04"] }
    ]
  }' | jq .
```

Chỉ nộp một câu:

```bash
curl -sS -X POST "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/student/submissions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"quizId":"<quiz-uuid>","selectedChoiceIds":["<choice-uuid>"]}]}'
```

Danh sách đáp án rỗng (mọi câu chưa làm vẫn được chấm 0 điểm nếu vẫn có trong đề):

```bash
curl -sS -X POST "${BASE_URL}/analysis/lessons/${LESSON_ID}/lesson-test/student/submissions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"answers":[]}' | jq .
```

---

## Ghi chú

- Nếu có gateway prefix (ví dụ `/assistant`), ghép vào `BASE_URL` (ví dụ `http://localhost:8080/assistant`).
- Đảm bảo đã chạy `prisma db push` / migrate để có bảng `lesson_test_submissions` và `lesson_test_submission_answers` trước khi POST.
- DTO body: `src/dto/request/lesson-test-student.dto.ts` (`LessonTestStudentSubmissionDto`).
