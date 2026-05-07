# Implementation Plan: AI Remediation Citation (Marker Approach)

Kế hoạch triển khai tính năng chỉ dẫn học lại (Remediation) bằng cách yêu cầu AI chèn marker `@{{chunkId}}@` vào phần giải thích của câu hỏi.

## 1. Mục tiêu
- Giúp học viên biết chính xác đoạn video cần xem lại ngay trong phần giải thích (Explanation) của câu hỏi.
- Giảm thiểu thay đổi logic phức tạp ở Backend, tận dụng khả năng của AI và xử lý hiển thị ở Frontend.

## 2. Các thành phần thay đổi

### 2.1 Prompt (Quan trọng nhất)
Cập nhật `QuizPrompts` (đặc biệt là các phần liên quan đến `LESSON_TEST` hoặc `batch flow`):
- Thêm chỉ dẫn AI phải xác định `chunk_id` nguồn của kiến thức.
- Yêu cầu chèn marker `@{{chunk_id}}@` vào chuỗi `explanation`.
- Vẫn yêu cầu trả về `groundedChunkId` trong JSON để lưu vào DB field cho mục đích thống kê/Learning Path sau này.

### 2.2 DTO & Persistence
- **DTO**: Cập nhật `GeneratedQuizResponse` để nhận thêm trường `groundedChunkId?: string` từ AI.
- **Persistence**: Cập nhật `QuizPersistenceService.saveLessonTestBatchQuizzes` để map dữ liệu từ AI vào cột `chunkId` trong DB.

### 2.3 API Student
- **`GET /lesson-test/student`**: Đảm bảo trả về thông tin `chunkGroups` kèm danh sách `chunkIds` để Frontend có dữ liệu đối chiếu.
- **`POST /submissions`**: Trả về `explanation` (đã chứa marker) và `chunkId` của từng câu hỏi.

---

## 3. Chi tiết các bước thực hiện

### Bước 1: Cập nhật DTO
File: `src/dto/response/quiz-response.dto.ts`
- Thêm `groundedChunkId?: string` vào class `GeneratedQuizResponse`.

### Bước 2: Cập nhật Prompt
File: `src/prompts/quiz.prompt.ts`
- Cập nhật `batchSystemVi` và `batchUserVi` để hướng dẫn AI cách chèn marker.
- Quy định định dạng: `"Mỗi câu hỏi phải gắn với một groundedChunkId. Trong phần explanation, hãy chèn @{{groundedChunkId}}@ tại vị trí liên quan."`

### Bước 3: Cập nhật Persistence logic
File: `src/service/quizz/quizPersistence.service.ts`
- Hàm `saveLessonTestBatchQuizzes`: Cập nhật logic `create` để nhận `chunkId` từ `quiz.groundedChunkId`.

### Bước 4: Cập nhật Student Service
File: `src/service/lessonTest/lessonTestStudent.service.ts`
- Hàm `getStudentLessonTestView`: Trả về thêm `chunkId` (nếu có) trong danh sách quizzes của học viên.
- Hàm `submitLessonTest`: Trả về thêm `chunkId` trong từng item kết quả chấm điểm.

---

## 4. Frontend Workflow (Tham khảo)
1. Frontend nhận `explanation`: `"Khái niệm này được giải thích tại @{{uuid-abc-123}}@..."`.
2. Dùng Regex `/(@{{.*?}}@)/g` để tìm và thay thế marker bằng một Component (ví dụ: `JumpToVideoButton`).
3. Khi click: Tìm trong danh sách `chunks` bài học để lấy `startTime` tương ứng với UUID đó và thực hiện `player.seek(startTime)`.

## 5. Kiểm tra & Verify
- [ ] Chạy Job sinh Quiz cho Lesson Test.
- [ ] Kiểm tra JSON AI trả về có marker trong `explanation` không.
- [ ] Kiểm tra DB xem trường `chunkId` của Quiz có được điền không.
- [ ] Test API Student trả về dữ liệu đúng định dạng.
