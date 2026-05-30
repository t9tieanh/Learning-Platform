# Lesson test — học viên

Tài liệu mô tả API phía học viên cho **lesson test** (xem đề, nộp bài, chấm điểm).

| Tài liệu | Nội dung |
|----------|----------|
| [api-spec.md](./api-spec.md) | Spec đầy đủ: `GET` lấy đề (ẩn đáp án), `POST` nộp bài và tính điểm |
| [output.md](./output.md) | `curl` terminal + **raw cURL import Postman** |
| [lesson-test-student.postman_collection.json](./lesson-test-student.postman_collection.json) | Collection Postman (Variables: `baseUrl`, `token`, `lessonId`) |

Sau khi chỉnh `prisma/schema.prisma`, đồng bộ DB (ví dụ `npx prisma db push` hoặc migrate tương đương) để tạo bảng `lesson_test_submissions` và `lesson_test_submission_answers`.

Các endpoint này dự kiến dùng **`checkViewLesson`** (enroll) + kiểm tra **lesson đã sẵn sàng / duyệt** và **`LessonTest.status === PUBLISHED`** ở **tầng service** (chi tiết trong spec).
