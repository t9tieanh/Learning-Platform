# Gợi ý cải tiến: Hỏi–đáp học sinh về nội dung bài học (RAG theo lesson)

Tài liệu này mô tả **trạng thái hiện tại** của feature `POST /assistant/lessons/:lessonId/chat`, liên kết với các ý tưởng cải tiến (tầng LLM trước retrieval, schema lịch sử hội thoại, embedding trên tin nhắn cũ để bổ sung context), và gợi ý triển khai theo giai đoạn.

---

## 1. Luồng hiện tại (assistant-service)

### 1.1 HTTP layer

- **Route**: `analysis.route.ts` — `POST /lessons/:lessonId/chat`, auth + `checkViewLesson`, validate `RAGQuestionRequest` (`question`).
- **Controller**: `analysis.controller.ts` → `answerQuestion`: lấy `lessonId` từ params, `question` từ `req.data`, gọi `lessonRAGService.answerQuestion(lessonId, question)`.

**Hạn chế liên quan đến UX ngữ cảnh**

- Mỗi request **không có** `conversationId`, `sessionId`, hay `previousMessages`; mọi turn là **stateless**.
- Không có lưu trữ persistent cho câu hỏi/đáp án của học sinh theo lesson (ngoài các service khác nếu có).

### 1.2 RAG layer (`lesson.rag.service.ts`)

Luồng đã được mã hóa:

1. **Retrieval**: `searchService.searchChunks(lessonId, question, 3)` — semantic search trên embedding chunk (E5 + `search_lesson_chunks_by_embedding_v2`).
2. **Context**: `formatContext(chunks)` — ghép title, summary, content.
3. **Generation**: `generateAnswer(context, question)` → `openaiQueueService.queueRAGAnswer(RAGPrompts.system(), RAGPrompts.human(context, question))`.

Nếu không có chunk: trả message cố định “không có nội dung liên quan…”.

---

## 2. Định vị các ý tưởng cải tiến trong pipeline

Pipeline đề xuất (khái niệm):

```
User message
    → [2.1 Query understanding / rewrite] (LLM có thể + structured output)
    → [2.2] Embedding search chunks (lesson) — có thể dùng query đã làm giàu
    → [2.4] Embedding search turns hội thoại cũ (reply/assistant + tóm tắt user intent)
    → [2.3] Ghép context: chunks + history snippets + (optional) vài turn gần nhất verbatim
    → generateAnswer (bước tương đương hiện tại tại LessonRAGService ~79–80)
```

Các mục 2.1–2.4 tương ứng trực tiếp với ý tưởng bạn đã nêu.

---

## 2.1 Tầng LLM trước khi search chunk (Query refinement / retrieval query)

**Mục tiêu**: Câu hỏi tự nhiên của học sinh thường chứa đại từ (“cái đó”, “phần trước”), typo, hoặc nhiều ý trong một tin — embedding search một chuỗi thô có thể **trượt semantic**.

**Đề xuất**: Một call LLM nhẹ (structured output) trước `searchChunks`, ví dụ trả về:

| Trường | Mục đích |
|--------|----------|
| `standalone_question` | Câu hỏi đứng một mình, thay thế đại từ bằng thực thể (cần 2–3 turn gần nhất làm input) |
| `search_queries` | 1–3 biến thể ngắn tối ưu cho embedding (synonyms / từ khóa khóa học) |
| `needs_lesson_retrieval` | `boolean` — nếu `false`, có thể trả lời chỉ từ lịch sử hoặc từ chung (policy team) |
| `language` | Giữ nhất quán tiếng Việt/khác |

**Gợi ý implementation**

- Tái sử dụng pattern `openaiQueueService` + schema JSON (giống RAG) để ổn định parse.
- **Cost / latency**: thêm 1 round-trip; có thể dùng model nhỏ hơn model trả lời cuối.
- **Fallback**: Nếu call lỗi timeout → dùng nguyên `question` cho `searchChunks` như hiện tại.

---

## 2.2 Schema lưu lịch sử cuộc trò chuyện (per user, per lesson hoặc per “session”)

**Mục tiêu**: Phục vụ đa lượt, audit, personalization, và nguồn dữ liệu cho retrieval lịch sử (mục 2.4).

### 2.2.1 Thực thể gợi ý (Prisma / Postgres, phù hợp codebase hiện có)

Dự án đã dùng `vector` trong Postgres (`LessonChunk.embedding`). Có thể mở rộng theo hướng:

**`LessonChatSession`** (một “sổ” hội thoại)

- `id` (uuid)
- `lessonId`
- `userId`
- `title` hoặc `summaryLast` (optional — LLM summarize định kỳ để tiết kiệm context)
- `createdAt`, `updatedAt`
- Indexes: `[lessonId, userId]`, `userId`

**`LessonChatMessage`**

- `id` (uuid)
- `sessionId` → FK `LessonChatSession`
- `role`: enum `USER` | `ASSISTANT` | `SYSTEM` (tuỳ policy)
- `content` (text) — plain text đã hiển thị cho user
- `embedding` (`vector(768)`) — **chỉ bắt buộc cho message cần semantic recall** (thường là USER + ASSISTANT); hoặc embedding riêng cho “searchable excerpt”
- `metadata` (Json): ví dụ `chunkIdsUsed`, `latencyMs`, `model`, `rewritePayload` (kết quả bước 2.1)
- `createdAt`

**Ràng buộc & GDPR**

- Xoá cascade theo lesson/user theo policy sản phẩm.
- Tránh log PII không cần thiết trong `metadata`.

### 2.2.2 Migration & an toàn DB remote (không làm mất dữ liệu hiện có)

- Migration `20260507140000_add_lesson_chat_history` là **additive**: `CREATE TYPE`, `CREATE TABLE`, `CREATE INDEX`, `ALTER TABLE … ADD CONSTRAINT` (FK vào `lessons` chỉ là *thêm ràng buộc*, không chỉnh sửa/ghi đè nội dung bảng cũ).
- **Không** có `DROP TABLE`, `TRUNCATE`, `DELETE`, hay `ALTER COLUMN` trên các bảng business hiện tại `(lessons`, chunks, quizzes, …) — dữ liệu remote đang có không bị migration này xoá hay ghi đè.
- Cascade `ON DELETE CASCADE` chỉ có nghĩa: khi một **lesson** bị xoá trong CSDL (thao tác tương lai của ứng dụng/admin), các dòng trong `lesson_chat_sessions` / `lesson_chat_messages` gắn lesson đó cũng bị xoá — đây là dữ liệu chat **mới**, không ảnh hưởng dữ liệu lesson khác.
- Khuyến nghị vẫn **backup/snaphot remote** trước `prisma migrate deploy` trong quy trình team bạn — đây là thói quen tốt, không phải vì migration này mang tính phá huỷ.

### 2.2.3 API contract (mở rộng sau)

- Body `POST .../chat` có thể thêm: `sessionId` optional — nếu absent thì tạo session mới.
- Response mở rộng: `sessionId`, `messageId` (để frontend sync).

Điều này đồng bộ controller hiện tại (`answerQuestion`) với một service orchestration mới (`lessonChatService`) gọi RAG + persistence.

---

## 2.3 Đưa lịch sử vào context tại bước generate (tương đương `generateAnswer`)

**Mục tiêu**: LLM cuối nhận không chỉ chunk lesson mà còn **grounding** từ những gì đã nói với học sinh trong session (tránh mâu thuẫn, hiểu follow-up).

**Chiến lược context (layered)**

1. **Turns gần nhất (verbatim, giới hạn token)**: VD 4–8 message cuối — để xử lý đại từ và continuity.
2. **Semantic recall (mục 2.4)**: 3–5 đoạn assistant/user cũ có similarity cao với `standalone_question` hoặc `search_queries`.
3. **Lesson chunks**: như hiện tại, có thể tăng `limit` nhẹ hoặc rerank sau khi đã có query tốt hơn.

**Prompt**: Cập nhật `RAGPrompts.human(...)` để có section rõ: `Lịch sử hội thoại liên quan`, `Nội dung bài học (nguồn chính)`, `Câu hỏi hiện tại` — và quy tắc ưu tiên trích dẫn từ chunk khi conflict với lịch sử cũ.

---

## 2.4 Search embedding trên reply/ack liên quan đến prompt hiện tại

**Mục tiêu**: Giống “memory RAG” trong session: tìm lại các câu trả lời trước (hoặc câu hỏi user tương tự) **gần nghĩa** với prompt hiện tại, không chỉ dựa vào tin nhắn liền kề.

**Cách làm**

- Khi lưu mỗi `LessonChatMessage` (USER/ASSISTANT), generate embedding (cùng E5, prefix `query:` / `passage:` thống nhất với chunk search).
- Thêm hàm SQL (tương tự `search_lesson_chunks_by_embedding_v2`) scoped theo `session_id` (và optional `lesson_id`) để trả về top-k message.
- Trước `generateAnswer`: merge kết quả vào chuỗi context (kèm timestamp hoặc thứ tự để model phân biệt).

**Lưu ý**

- Tránh “polluted context”: assistant message dài → có thể lưu thêm `contentSearch` (bản rút gọn để embed) khác `content` hiển thị.
- Dedup: nếu message vừa là turn liền kề thì không cần lấy lại qua vector.

---

## 3. Rủi ro và giảm thiểu

| Rủi ro | Giảm thiểu |
|--------|-------------|
| Chi phí LLM/embed tăng | Bật rewrite chỉ khi heuristic (câu có đại từ / session có history); cache embedding theo hash nội dung |
| Latency chồng chất | song song embedding history + chunk search sau khi có `search_queries[0]`; timeout + fallback |
| Hallucination từ lịch sử cũ | System prompt: ưu tiên chunk lesson; citations bắt buộc từ chunks cho factual claims |
| Schema migration | rollout thêm nullable columns / bảng mới, không phá endpoint cũ ngay |

---

## 4. KPI gợi ý

- **Retrieval**: click-through hoặc “helpful” trên sources; tỉ lệ “no chunks” trước/sau rewrite.
- **Conversation**: satisfaction / số turn để đạt đáp án; tỉ lệ lặp câu hỏi.
- **Kiểm thử offline**: benchmark Q–A có đại từ + transcript ngắn.

---

## 5. Lộ trình triển khai đề xuất

1. **Phase A — Persistence**: Bảng session + message, API `sessionId`; vẫn RAG một turn như cũ + lưu log.
2. **Phase B — History trong prompt**: verbatim N turn cuối vào `generateAnswer` (không cần vector).
3. **Phase C — Query rewrite**: LLM structured trước `searchChunks` + chỉnh prompt.
4. **Phase D — Vector search trên history**: RPC + ingest embedding async (queue) để không chặn response hoặc chấp nhận slight delay.

---

## 6. Tham chiếu mã (điểm neo trong repo)

| Thành phần | File / vị trí |
|------------|----------------|
| Controller Q&A lesson | `src/controllers/analysis.controller.ts` (`answerQuestion`) |
| Pipeline RAG | `src/service/search/lesson.rag.service.ts` (`answerQuestion`, `generateAnswer`) |
| Search chunk | `src/service/search/search.service.ts` (`searchChunks`) |
| Validation body | `src/dto/request/ragQuestion.dto.ts` |
| Route | `src/routes/analysis.route.ts` (`POST .../chat`) |

---

*Tài liệu mang tính đề xuất kiến trúc; chi tiết schema và RPC nên được review cùng team backend/Infra Postgres (index `ivfflat` / `hnsw`, kích thước vector 768 nhất quán với E5 hiện tại).*
