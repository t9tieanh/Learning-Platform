# Feedback & UX/UI Recommendations — Lesson Test Student

Tài liệu này tổng hợp các đề xuất về trải nghiệm người dùng (UX) và giao diện (UI) cho tính năng làm bài kiểm tra dành cho học viên.

---

## 1. Thành phần Component (Reusability)

Cần tách logic render câu hỏi ra các component dùng chung để đảm bảo tính nhất quán giữa Instructor (Preview) và Student (Exam).

### QuestionCard Component
- **Props**: `quiz`, `mode` ('PREVIEW', 'EXAM', 'RESULT'), `onSelect`.
- **Logic**:
    - `EXAM`: Ẩn đáp án đúng, cho phép click vào Choice để select. Lưu state tạm thời.
    - `RESULT`: Hiển thị rõ câu nào đúng (xanh), câu nào sai (đỏ), hiển thị đáp án đúng thực tế và phần giải thích (`explanation`).
    - `PREVIEW`: Giống `RESULT` nhưng không có trạng thái "học viên đã chọn".

---

## 2. Trải nghiệm làm bài (UX Exam)

- **Auto-save**: Do bài kiểm tra có thể dài, cần lưu trạng thái các câu đã chọn vào `localStorage` hoặc `sessionStorage`. Nếu học viên lỡ tay F5 hoặc mất kết nối, họ có thể tiếp tục làm bài mà không mất dữ liệu đã chọn.
- **Progress Tracking**: Hiển thị thanh tiến trình (ví dụ: "Đã làm 4/10 câu") hoặc một danh sách số thứ tự câu hỏi ở bên cạnh (Question Navigator) để học viên dễ dàng nhảy đến câu chưa làm.
- **Confirmation**: Trước khi nộp bài (`Submit`), cần hiển thị thông báo xác nhận, đặc biệt nếu còn câu hỏi chưa được trả lời.
- **Loading State**: Hiển thị skeleton hoặc loading spinner khi đang chấm bài (lệnh `POST`) vì server có thể mất một chút thời gian để xử lý kết quả.

---

## 3. Trải nghiệm kết quả (UX Result)

- **Summary Dashboard**: Hiển thị tổng quan điểm số ngay đầu trang (ví dụ: 80% - Đạt). Sử dụng biểu đồ tròn hoặc thanh tiến trình màu sắc để tăng tính trực quan.
- **Review Mode**: Cho phép học viên xem lại toàn bộ đề bài với các chỉ báo:
    - Lựa chọn của học viên.
    - Đáp án đúng của hệ thống.
    - Giải thích (`explanation`) và phản hồi cho từng lựa chọn (`feedback`).
- **Retake Action**: Nếu chính sách cho phép làm lại, hiển thị nút "Làm lại bài" rõ ràng.

---

## 4. Kỹ thuật (Frontend Architecture)

- **State Management**: Sử dụng một store (như Redux, Zustand hoặc React Context) để quản lý mảng `answers` của học viên trước khi nộp.
- **API integration**: 
    - `GET /analysis/lessons/:lessonId/lesson-test/student`
    - `POST /analysis/lessons/:lessonId/lesson-test/student/submissions`
- **Error Handling**: Xử lý các mã lỗi 403 (chưa enroll) hoặc 404 (chưa publish bài test) bằng các trang thông báo thân thiện thay vì chỉ hiện lỗi console.

---

## 5. Lộ trình mở rộng (AI-Enhanced UI)

1. **AI Interactive Feedback (Hỏi đáp về câu hỏi):**
   - Bên cạnh `explanation` tĩnh, cung cấp nút "Hỏi AI về câu này".
   - AI sẽ giải thích dựa trên ngữ cảnh bài học và câu hỏi, có thể tùy chỉnh phong cách (ví dụ: giải thích cho người mới, dùng code mẫu, hoặc dùng ví dụ thực tế).

2. **Adaptive Difficulty (Độ khó thích nghi):**
   - Hệ thống hiển thị thanh trạng thái độ khó hiện tại của bài test.
   - Dựa trên lịch sử làm bài, AI tự động điều chỉnh độ khó của các câu hỏi tiếp theo để phù hợp với trình độ hiện tại của học viên.
