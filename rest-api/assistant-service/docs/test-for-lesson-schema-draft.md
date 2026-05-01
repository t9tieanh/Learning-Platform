# Phác thảo DB: bài kiểm tra theo mảng nội dung (tinh gọn)

Tài liệu tham khảo — **chưa implement**. Đồng bộ ý tưởng với UI “Bài kiểm tra theo từng mảng nội dung”; **một lesson chỉ có một** định nghĩa bài kiểm tra; **không lưu thứ tự** nhóm/chunk/câu cho học viên vì khi làm bài câu hỏi sẽ **random**.

---

## 1. Nguyên tắc

| Nguyên tắc | Chi tiết |
|------------|----------|
| **1–1 `lessons` ↔ `lesson_tests`** | **Quan hệ một–một (tuỳ chọn):** mỗi lesson có **tối đa một** hàng trong `lesson_tests`. PK của `lesson_tests` là **`lesson_id`** = **`lessons.id`** (không surrogate id). Chiều ngược: mỗi hàng `lesson_tests` **chỉ** thuộc đúng một lesson. Lesson có thể **chưa** có bài test → **chưa** có hàng `lesson_tests`. |
| **Không sort / rank cho blueprint** | Không có `sort_order`, `display_order`, … trên nhóm mảng nội dung. |
| **Random khi show student** | Thứ tự câu do **ứng dụng** randomize khi load (không phụ thuộc cột sort trong DB cho phần đề). |
| **Tận dụng `quizzes`** | Câu hỏi vẫn là hàng trong `quizzes` + `quiz_choices`; **`quiz_scope`** phân biệt quiz **lẻ theo chunk** vs **thuộc bài kiểm tra lesson**. Khi `LESSON_TEST`, quiz **FK tới đúng hàng** **`lesson_test_chunk_groups`** — không FK trực tiếp `lesson_tests`; lesson suy ra qua `lesson_test_chunk_groups.lesson_id` → `lesson_tests`. |
| **Default = hành vi cũ** | Cột mới trên `quizzes` **bắt buộc** có default khớp quiz hiện tại: **`quiz_scope` DEFAULT `CHUNK_STANDALONE`**, **`lesson_test_chunk_group_id` DEFAULT NULL**. Migration `ADD COLUMN ... DEFAULT` + backfill (nếu cần) để mọi hàng cũ và mọi INSERT không chỉ định cột mới vẫn giống feature cũ; chỉ luồng bài kiểm tra lesson mới set `LESSON_TEST` + FK nhóm. |
| **Bảng `lessons` trong diagram** | Chỉ để ERD rõ quan hệ; trong monolith thực tế lesson có thể nằm service khác — giữ `lesson_id`/`lessonId` khớp hiện trạng. |
| **Nhóm chunk trong blueprint = JSON** | `lesson_test_chunk_groups.chunk_ids` là **jsonb** (mảng id `lesson_chunks`). Không FK tới `lesson_chunks`; map UI (“nhóm mảng nội dung”). Ràng buộc business xử lý ở **ứng dụng**. |

**Lưu ý:** Trường **`quiz_choices.order`** trong schema hiện tại là thứ tự **đáp án trong một câu** (UI có thể shuffle đáp án riêng); không phải thứ tự **câu** trong bài test — document **không** đề xuất thêm `sort` cho cấp blueprint hay danh sách câu.

---

## 2. Quan hệ (khái niệm)

```
lessons (1)
   │
   ├── lesson_chunks (n)
   │
   └── lesson_tests (0..1)     ← PK/FK lesson_id = lessons.id  (đúng quan hệ 1–1 khi đã có blueprint)
           │
           └── lesson_test_chunk_groups (n)
                 └─ chunk_ids: jsonb ["chunk_uuid", …]   (không FK tới lesson_chunks)

lesson_chunks ← quizzes ← quiz_choices
       ↑                    ↑
       chunk_id             lesson_test_chunk_group_id (khi quiz_scope = LESSON_TEST)
                                    → lesson_test_chunk_groups.id
       quiz_scope: CHUNK_STANDALONE | LESSON_TEST
```

---

## 3. Bảng đề xuất

### `lessons` (diagram / tham chiếu)

Chỉ các cột tối thiểu để ERD dễ đọc; khi implement có thể mirror bảng lesson thật của LMS.

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id` | text/uuid, PK | Trùng `lesson_chunks.lessonId` |
| `title` | text, nullable | |

### `lesson_tests`

**Quan hệ 1–1 với `lessons` (khi đã tạo blueprint):** khóa chính là `lesson_id` (vừa PK vừa FK → `lessons.id`; không dùng surrogate `id` riêng). Đây là dạng **identifying one-to-one**: một lesson — nhiều nhất một `lesson_tests`.

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `lesson_id` | text/uuid, PK, FK → `lessons.id` | Định danh bài test = định danh lesson |
| `title` | text, nullable | |
| `status` | varchar/enum | `draft` / `published` / `archived` |
| `target_total_questions` | int, nullable | Snapshot tổng câu mục tiêu (UI) |
| `notes` | text, nullable | |
| `created_by` | text | |
| `created_at` / `updated_at` | timestamptz | |

### `lesson_test_chunk_groups`

Một **nhóm chunk** trong blueprint (map UI “mảng nội dung” / chunk group): số câu mục tiêu + **danh sách chunk id trong JSON**. Không thứ tự hiển thị; không FK tới `lesson_chunks`.

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id` | uuid, PK | |
| `lesson_id` | text/uuid, FK → `lesson_tests.lesson_id` | |
| `chunk_ids` | jsonb, **not null** (thường mảng không rỗng) | Ví dụ Postgres: `'["uuid1","uuid2"]'::jsonb` — id khớp `lesson_chunks.id`. **Business:** tối đa **3** phần tử (validate API/UI); sinh quiz nhóm dùng ngữ cảnh gộp — xem **`lesson-test-group-generation-context.md`**. |
| `label` | text, nullable | Nhãn nhóm (nếu cần hiển thị GV) |
| `question_count` | int | Số câu mục tiêu cho nhóm |
| `distribution` | jsonb, nullable | Snapshot Bloom/độ khó khi generate |
| `batch_user_prompt` | text, nullable | |
| `created_at` / `updated_at` | timestamptz | |

**Ghi chú:** Để biết chunk X thuộc nhóm nào, quét các hàng `lesson_test_chunk_groups` của `lesson_id` và kiểm tra `chunk_ids` chứa X (hoặc cache app). GIN trên `chunk_ids` chỉ khi cần.

### `quizzes` (mở rộng)

**Tương thích ngược:** Hàng quiz **cũ** (= chỉ có `chunk_id`, không khái niệm bài kiểm tra lesson) phải tiếp tục hoạt động **không đổi** sau migration. Vì vậy:

| Cột thêm | Kiểu | Default / NOT NULL | Ý nghĩa |
|----------|------|-------------------|---------|
| `quiz_scope` | varchar / enum | **DEFAULT `CHUNK_STANDALONE`**, NOT NULL | Hàng cũ & INSERT không truyền field → coi như quiz lẻ theo chunk (như trước). |
| `lesson_test_chunk_group_id` | uuid, FK nullable | **DEFAULT NULL** | Hàng cũ & luồng cũ luôn NULL. Chỉ set khi `quiz_scope = LESSON_TEST` (khi đó **nên** NOT NULL ở tầng app hoặc CHECK). |

**Liên hệ với `lesson_tests`:** gián tiếp — `quiz → lesson_test_chunk_groups → lesson_tests` (cùng `lesson_id`). Không cần FK quiz → header.

**Ràng buộc gợi ý (app hoặc CHECK):** `quizzes.chunk_id` nên nằm trong `lesson_test_chunk_groups.chunk_ids` của nhóm được trỏ tới; `lesson_chunks.lesson_id` của chunk đó khớp `lesson_test_chunk_groups.lesson_id`.

**Migration (Postgres ví dụ):**  
`ALTER TABLE quizzes ADD COLUMN quiz_scope ... NOT NULL DEFAULT 'CHUNK_STANDALONE';`  
`ALTER TABLE quizzes ADD COLUMN lesson_test_chunk_group_id uuid NULL REFERENCES lesson_test_chunk_groups(id) ON DELETE SET NULL DEFAULT NULL;`  
(Không bắt buộc `UPDATE` backfill nếu default đã khớp.)

**API / Prisma:** Endpoint và service **cũ** tạo quiz có thể **không** gửi hai field này — DB/ORM áp default. Luồng mới (bài kiểm tra lesson) mới truyền `quiz_scope = LESSON_TEST` và `lesson_test_chunk_group_id`.

---

## 4. Index gợi ý

- `lesson_tests` — PK `lesson_id` đã đủ tra cứu.
- `lesson_test_chunk_groups(lesson_id)`.
- `quizzes(quiz_scope)` và `quizzes(lesson_test_chunk_group_id)` (nullable; partial index WHERE scope = LESSON_TEST nếu muốn).
- (Tuỳ chọn) GIN trên `lesson_test_chunk_groups.chunk_ids` nếu cần `@>` / `?|`.

---

## 5. Mở rộng sau

- `student_test_attempt`, `student_test_attempt_answer` — gắn `lesson_id` (= PK `lesson_tests` / `lessons`) + user.

---

## 6. DBML cho [dbdiagram.io](https://dbdiagram.io/d)

Copy vào dbdiagram (**Import → Paste**).

```dbml
// lessons 1–1 lesson_tests (PK/FK shared on lesson_id); optional row = lesson chưa có blueprint
// Student question order: randomized in app
// https://dbdiagram.io/d

Table lessons {
  id text [pk, note: 'Matches lesson_chunks.lessonId']
  title text
}

Table lesson_chunks {
  id uuid [pk]
  lesson_id text [not null, note: 'FK → lessons.id']
  content text [not null]
  chunk_index int [not null]
  title text
  summary text
  embedding varchar [note: 'pgvector in production; simplified here']
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table lesson_tests {
  lesson_id text [pk, note: 'FK → lessons.id; one blueprint row per lesson when present']
  title text
  status varchar [not null, default: 'draft']
  target_total_questions int
  notes text
  created_by text [not null]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table lesson_test_chunk_groups {
  id uuid [pk, default: `gen_random_uuid()`]
  lesson_id text [not null, note: 'FK → lesson_tests.lesson_id']
  chunk_ids jsonb [not null, note: 'JSON array of lesson_chunks.id; max 3 elements (app); see lesson-test-group-generation-context.md']
  label text
  question_count int [not null]
  distribution jsonb
  batch_user_prompt text
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table quizzes {
  id uuid [pk, default: `gen_random_uuid()`]
  chunk_id uuid [not null]
  quiz_scope varchar [not null, default: 'CHUNK_STANDALONE', note: 'CHUNK_STANDALONE | LESSON_TEST']
  lesson_test_chunk_group_id uuid [note: 'DEFAULT NULL; FK → lesson_test_chunk_groups when LESSON_TEST']
  question text [not null]
  explanation text [not null]
  type varchar [not null, default: 'MULTIPLE_CHOICE']
  difficulty varchar [not null, default: 'MEDIUM']
  bloom_level varchar [not null, default: 'REMEMBER']
  ai_generated boolean [not null, default: false]
  ai_model text
  ai_confidence float
  created_by text [not null]
  is_approved boolean [not null, default: false]
  status varchar [not null, default: 'ACTIVE']
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]

  indexes {
    chunk_id
    quiz_scope
    lesson_test_chunk_group_id
  }
}

Table quiz_choices {
  id uuid [pk, default: `gen_random_uuid()`]
  quiz_id uuid [not null]
  text text [not null]
  is_correct boolean [not null, default: false]
  order int [not null, note: 'Answer option order within one MCQ; shuffle at display if needed']
  feedback text
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]

  indexes {
    quiz_id
  }
}

Ref: lesson_chunks.lesson_id > lessons.id
Ref: lesson_tests.lesson_id > lessons.id [delete: cascade]

Ref: lesson_test_chunk_groups.lesson_id > lesson_tests.lesson_id [delete: cascade]

Ref: quizzes.chunk_id > lesson_chunks.id [delete: cascade]
Ref: quizzes.lesson_test_chunk_group_id > lesson_test_chunk_groups.id [delete: set null]

Ref: quiz_choices.quiz_id > quizzes.id [delete: cascade]
```

---

## 7. Enum Prisma / Postgres

Trên diagram `type`, `difficulty`, `bloom_level`, `status` là `varchar`; khi implement có thể map về ENUM như `schema.prisma` hiện tại.

Thêm enum **`QuizScope`** (hoặc tên tương đương):

| Giá trị | Ý nghĩa |
|---------|---------|
| `CHUNK_STANDALONE` | Quiz riêng theo chunk, không thuộc bài kiểm tra lesson |
| `LESSON_TEST` | Thuộc bài kiểm tra lesson — **gắn với một `lesson_test_chunk_groups`** (không gắn trực tiếp header `lesson_tests`) |

---

## 8. Migration & an toàn dữ liệu

- Migration **`20260501120000_add_lesson_tests_quiz_scope`** trong `prisma/migrations/` chỉ **thêm** enum, bảng `lesson_tests` / `lesson_test_chunk_groups`, và **hai cột** trên `quizzes` với default (`CHUNK_STANDALONE`, `NULL`). **Không** `DROP`/`TRUNCATE`/`DELETE` dữ liệu cũ.
- **Không** dùng `prisma db push` cho DB production đã có dữ liệu nếu muốn lịch sử migration rõ ràng; ưu tiên `npm run migrate:deploy` (hoặc `prisma migrate deploy`) sau khi backup.
- Nếu DB đã được `db push` cùng schema trước đó, có thể trùng object — cần baseline/`migrate resolve` hoặc chỉnh tay; tránh chạy migration trùng trên DB đã có đủ object.

---

## 9. HTTP API (bản nháp)

Chi tiết endpoint (controller `lesson_test`, CRUD từng chunk group, **generate hàng loạt**, snapshot **`GET .../lesson-test/generate-quizzes/status`**, **long-poll** chỉ trên **`GET .../chunk-groups/.../generate-quizzes/status`** — §2–3 API draft): **`docs/lesson-test-api-draft.md`**. Chiến lược **một lần gọi LLM / nhóm**, giới hạn token ngữ cảnh, cắt bớt content, và **tối đa 3 chunk / nhóm**: **`docs/lesson-test-group-generation-context.md`**.