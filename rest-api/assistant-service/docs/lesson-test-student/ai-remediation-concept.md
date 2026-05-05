# Concept: AI Remediation & Timestamp-based Recommendation

Tài liệu này trình bày chi tiết về tính năng chỉ dẫn học lại chính xác dựa trên kết quả bài kiểm tra và dữ liệu phân đoạn (chunks) của bài học.

---

## 1. Mục tiêu tính năng

Giúp học viên không chỉ biết mình sai ở đâu mà còn biết chính xác cần **xem lại đoạn nào trong video** để bù đắp lỗ hổng kiến thức đó ngay lập tức.

---

## 2. Cơ chế hoạt động (Technical Flow)

### Bước 1: Liên kết dữ liệu (Data Linking & Grounding)

**Thực trạng hiện tại:** 
Các câu hỏi (`Quiz`) thuộc một `LessonTestChunkGroup` đang có `chunkId = null` trong database. Chúng chỉ được liên kết chung qua `lessonTestChunkGroupId`. Điều này khiến hệ thống không biết chính xác câu hỏi đó nằm ở đoạn video nào.

**Giải pháp đề xuất:**
Yêu cầu AI xác định "Giai đoạn gốc" (Grounding) ngay khi sinh câu hỏi. Trong `mergedContext` gửi cho AI, mỗi đoạn đã được đánh dấu:
- `### Chunk X`
- `chunk_id: UUID`

Hệ thống sẽ yêu cầu AI trích xuất và trả về `groundedChunkId` cho từng câu hỏi.

---

## 3. Ảnh hưởng tới luồng Generate Quiz (Kỹ thuật)

Để tính năng này hoạt động, luồng sinh câu hỏi cần thay đổi như sau:

### 3.1 Cập nhật Prompt
Bổ sung yêu cầu trích xuất `chunk_id` vào Prompt gửi OpenAI:

```markdown
HƯỚNG DẪN QUAN TRỌNG:
1. Mỗi câu hỏi PHẢI bám sát nội dung của MỘT phần (chunk) cụ thể trong danh sách cung cấp.
2. Bạn PHẢI xác định chính xác `chunk_id` (UUID) của phần đó và điền vào trường "groundedChunkId" trong JSON kết quả.

ĐỊNH DẠNG PHẢN HỒI:
[
  {
    "question": "...",
    "groundedChunkId": "UUID_CỦA_CHUNK_TƯƠNG_ỨNG",
    "choices": [...],
    "explanation": "..."
  }
]
```

### 3.2 Cập nhật Persistence Logic
Khi xử lý kết quả trả về từ AI:
1. Map trường `groundedChunkId` từ JSON vào trường `chunkId` của model `Quiz`.
2. Khi lưu xuống DB, mỗi Quiz sẽ có cả `lessonTestChunkGroupId` (để quản lý group) và `chunkId` (để định vị video timestamp).

---

## 4. UI/UX Suggestions

- **"Review" Button:** Bên cạnh câu hỏi sai, hiển thị nút "Xem lại đoạn này". Khi nhấn vào, player video sẽ tự động nhảy đến đúng `startTime` của `chunkId` được gắn kèm.
- **Learning Path:** Hiển thị một danh sách các đoạn cần học lại sau khi kết thúc bài test để học viên có cái nhìn tổng quan về những gì mình còn yếu.
