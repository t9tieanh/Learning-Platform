# Lesson test feature — API specification (draft)

Technical draft only — **no implementation yet**. Aligns **assistant-service** HTTP APIs with Prisma (`LessonTest`, `LessonTestChunkGroup`, extended `Quiz`) and authoring UI (**LessonExamBlueprintSection**, **ChunkItem**, etc.).

Gateway prefix assumed **`/assistant`** (same family as `assistant/quizzes/...`).

---

## 1. Backend layout (chosen)

| Piece | Suggested path |
|-------|----------------|
| Controller | `src/controllers/lesson_test.controller.ts` — **`LessonTestController`** (lesson-test header + chunk-group orchestration). Keeps quiz AI logic in existing quiz module; this controller calls services / validates `lessonId`. |
| Router | `src/routes/lesson_test.route.ts` — mount e.g. `IndexRouter.use('/lessons', lessonTestRouter)`. |
| Routes | All paths below are **relative to** `/assistant/lessons` (full path = `/assistant/lessons` + route). |

Quiz listing/generation extensions stay under **`QuizController`** / `quiz.route.ts` (**§4**).

### 1.1 Middleware (mandatory for lesson-scoped authoring routes)

All HTTP handlers registered for **§2** (lesson-test header, **bulk generate**, **bulk job status snapshot**), **§3** (chunk-groups CRUD, per-group `generate-quizzes` **including long-poll status**, optional `sync`), and any other route whose path includes **`/assistant/lessons/:lessonId/...`** from this feature MUST run **`checkLessonOwnership`** before the controller:

- **File:** `src/middleware/checkLessonOwnership.middleware.ts`
- **Export:** `checkLessonOwnership`
- **Behaviour:** Requires authenticated user (`req.user.sub`), reads **`lessonId`** from `req.params`, calls **`CourseGrpcClient.canEditLesson(lessonId, userId)`**; responds **401** / **403** when unauthorized or not allowed to edit the lesson.

Apply it on the **`lesson_test`** router for **every** route in §2–3 (same stack order as other protected lesson APIs).  

**§4** (quiz routes under `/assistant/quizzes/chunks/:chunkId/...`): keep or align with existing quiz auth; when accepting `lessonTestChunkGroupId`, validate that the group belongs to a lesson the caller may edit (or reuse ownership derived from chunk → lesson).  

**§7** (learner runtime): if endpoints are **student-facing read** APIs, **`checkLessonOwnership`** may be inappropriate (it gates **edit** permission). Use enrollment / public-lesson rules separately unless the route remains instructor-only.

---

## 2. Lesson test header (`lesson_tests`) — locked

One row per lesson when blueprint exists (PK = `lesson_id`). Chunk groups are **not** replaced by these handlers unless explicitly deleted via cascade policy.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/assistant/lessons/:lessonId/lesson-test` | Returns **`{ lessonTest, chunkGroups[] }`** or **404** if no blueprint row. Each element of **`chunkGroups`** is the persisted row **plus** a **`generation`** (or equivalent) object so the authoring UI can attach **per-group** long-polls after refresh (see **§2.1**). |
| `PUT` | `/assistant/lessons/:lessonId/lesson-test` | Create/update **header only**: `title`, `status`, `targetTotalQuestions`, `notes`, `createdBy` (or derive `createdBy` from auth). **Does not** create/update/delete chunk groups. |
| `DELETE` | `/assistant/lessons/:lessonId/lesson-test` | Optional product feature. Hard-delete cascades to `lesson_test_chunk_groups` (and `SET NULL` / behaviour on quizzes per FK policy). Confirm **soft-delete** vs **hard-delete** before shipping. |
| `POST` | `/assistant/lessons/:lessonId/lesson-test/generate-quizzes` | **Bulk generate (implement before §3.2 `POST`):** enqueue **one Bull job per chunk group** for every configured row (or a subset — see body). **One instructor click** → **`202`** with **`{ jobs: [{ groupId, jobId }] }`**. Same worker as per-row **`POST .../chunk-groups/:groupId/generate-quizzes`** (**§3.2**), shipped **after** this route. **VIP / auth** same as quiz batch. |
| `GET` | `/assistant/lessons/:lessonId/lesson-test/generate-quizzes/status` | **Bulk status snapshot (no long-poll):** query **`jobId`** repeated once per job (**`?jobId=<id1>&jobId=<id2>`** — OpenAPI **`style: form`**, **`explode: true`**). Server reads each Bull job (and/or cached outcome), verifies **`job.data.lessonId`** matches **`lessonId`**, echoes **`groupId`** from **`job.data`**. Returns **`items[]`** immediately (**200**). **`400`** if no **`jobId`** or duplicate ids. Use for **periodic short polling** or a one-off refresh; **long-polling waits only on** **`GET .../chunk-groups/:groupId/generate-quizzes/status`** (**§3.2**, **§3.2.1**). |

### 2.1 `GET .../lesson-test` — `chunkGroups[]` shape (generation hints)

Persisted fields come from **`lesson_test_chunk_groups`** as today (`id`, `chunkIds`, `questionCount`, `label`, …). Add **derived** fields from app state (recommended: **Redis**, keyed by `lessonId` + `groupId`; optional later columns if you want durability across Redis flush):

| Field on each chunk group DTO | Meaning |
|-------------------------------|---------|
| **`generation.state`** | **`idle`** — no active job; **`queued`** \| **`processing`** — job in flight; **`completed`** \| **`failed`** — last run finished (optional TTL before reverting to **`idle`** or keep **`lastCompletedAt`**). Exact enum names are implementation-defined; keep them stable in OpenAPI. |
| **`generation.jobId`** | Bull **`job.id`** (string) **while** the group has an active or recently finished job the client may still poll (**`queued`** / **`processing`**, and optionally a short window after **`completed`**). **`null`** when **`idle`** and nothing to poll. |
| **`generation.lastError`** | Present when last run **`failed`** (safe message). |

**Frontend flow:** After **`POST .../lesson-test/generate-quizzes`** or **`POST .../chunk-groups/:groupId/generate-quizzes`**, wait for completion using **`GET .../chunk-groups/:groupId/generate-quizzes/status?jobId=`** (**long-poll**, up to **`LONG_POLL_TIMEOUT_MS`** — **§3.2.1**). For **many groups in parallel**, open **one long-poll per `(groupId, jobId)`** (same endpoint per row). Optionally **`GET .../lesson-test/generate-quizzes/status?jobId=...`** on an interval for a **non-blocking dashboard snapshot** (no held connection). Reload **`GET .../lesson-test`** when jobs finish (or merge counts from per-group status responses).

### 2.2 `POST .../lesson-test/generate-quizzes` — bulk enqueue (**primary**)

This is the **first generation endpoint to implement** for authoring (see **§9**). **`POST .../chunk-groups/:groupId/generate-quizzes`** (**§3.2**) reuses the same processor later.

**Body (optional):**

| Field | Meaning |
|-------|---------|
| **`groupIds`** | If **omitted** or empty → enqueue **all** chunk groups under this lesson test (each gets **one** job). If **set** → only those **`groupId`** values (must belong to **`lessonId`**; **400** on unknown / foreign ids). |
| **`distribution?`**, **`userPrompt?`** | Optional defaults applied **per group** where the group row does not already override (product choice: prefer DB **`distribution`** / **`batch_user_prompt`** on each row over body). |

**Behaviour:**

- For each targeted group: validate **`chunkIds`**, **`question_count` > 0** (skip groups with **0** questions or **400** if empty blueprint — pick one rule).
- Idempotency: a **second click** while jobs still **`PROCESSING`** may **409** or enqueue duplicate jobs — recommend **409** if **`generation.state`** already active for that group, unless product explicitly allows parallel runs.

**Response `202`:**

```json
{
  "jobs": [
    { "groupId": "<uuid>", "jobId": "<bull-job-id>" }
  ]
}
```

### 2.3 `GET .../lesson-test/generate-quizzes/status` — bulk snapshot (not long-poll)

**Query:** **`jobId`** — repeat for each job (multi-value query string).

Example:

`/assistant/lessons/:lessonId/lesson-test/generate-quizzes/status?jobId=111&jobId=222`

**Validation:**

- Every **`jobId`** resolves to an existing Bull job whose **`data.lessonId`** equals **`lessonId`** (**403** / **404** otherwise).
- **`job.data.groupId`** must be present so **`items[]`** can echo **`groupId`** without trusting the client (enqueue path **must** write it).

**Response `200`:** immediate (**do not** hold the connection waiting on Redis pub/sub):

- **`items[]`**: one entry per requested **`jobId`**: **`groupId`**, **`jobId`**, **`status`** (`QUEUED` \| `PROCESSING` \| `COMPLETED` \| `FAILED`), optional **`createdCount`**, **`quizIds`** / minimal quiz DTOs when **`COMPLETED`**, **`reason`** when **`FAILED`** — derived from Bull + optional result cache.

**Client:** call **`GET .../chunk-groups/:groupId/generate-quizzes/status`** when you need **long-poll** semantics for a single job; use **this** endpoint only for **polling** or opportunistic refresh.

---

## 3. Chunk groups (`lesson_test_chunk_groups`) — granular (chosen)

Each endpoint operates on **one** group. Use these for add/edit/remove rows in the blueprint UI without sending the full lesson payload.

### 3.1 Persist group definition

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/assistant/lessons/:lessonId/lesson-test/chunk-groups` | **Create** one group. Body e.g. `{ chunkIds: string[] (1–3), questionCount: number, label?, distribution?, batchUserPrompt? }`. **400** if `chunkIds.length > 3`. Ensures parent `lesson_tests` exists (implicit `PUT` header with defaults, or **409** until header created — pick one rule and document in OpenAPI). |
| `PATCH` | `/assistant/lessons/:lessonId/lesson-test/chunk-groups/:groupId` | **Update** one group (partial): `chunkIds` (1–3), `questionCount`, `label`, `distribution`, `batchUserPrompt`. **400** if `chunkIds.length > 3`. **404** if group unknown or not under this `lessonId`. |
| `DELETE` | `/assistant/lessons/:lessonId/lesson-test/chunk-groups/:groupId` | **Delete** one group row. **404** if mismatch. Does not delete quizzes unless product adds cascade rules (today quizzes reference group with `ON DELETE SET NULL` — quizzes remain but lose group link). |

### 3.2 Generate quizzes for a single group

**Implementation priority:** Ship **`POST .../lesson-test/generate-quizzes`** (**§2.2**) **before** this route. Both enqueue **one Bull job per `groupId`** via the **same processor**; this handler is a thin convenience (one row) — add **after** bulk enqueue + status paths work end-to-end.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/assistant/lessons/:lessonId/lesson-test/chunk-groups/:groupId/generate-quizzes` | **Generate** AI quizzes for **this group only** using **one merged-context LLM call per group** (summaries + content concatenated, token cap + truncation). See **`docs/lesson-test-group-generation-context.md`**. Body mirrors batch generation needs: e.g. `{ distribution?, userPrompt? }`. Persist each saved quiz with **`quizScope = LESSON_TEST`** and **`lessonTestChunkGroupId = groupId`**. Prefer **`202`** + **`{ groupId, jobId }`** when queued (**§3.2.1**); optional **`200`** sync MVP. **VIP / auth** same policy as existing quiz batch endpoints. |
| `GET` | `/assistant/lessons/:lessonId/lesson-test/chunk-groups/:groupId/generate-quizzes/status` | **Long-poll** this job: query **`jobId`**. Holds up to **`LONG_POLL_TIMEOUT_MS`** (~25s), **`lesson-test-group-gen:${jobId}`** pub/sub — **§3.2.1**. **`GET .../lesson-test/generate-quizzes/status`** does **not** long-poll; use it only for **immediate multi-job snapshots**. |

**Note:** You can still call **`POST /assistant/quizzes/chunks/:chunkId/quizzes/batch`** with `lessonTestChunkGroupId` from the client instead of this wrapper; this endpoint exists so the client can trigger “generate for this blueprint row” with **one call** and consistent server-side validation.

**Chunk-group limit:** **`chunkIds` must contain at most three ids** — enforced on **`POST`/`PATCH`** chunk groups (**400**). Same merged-context rules apply when generating from the wrapper or from quiz routes that attach a group id.

### 3.2.1 Async: Bull (Redis) + long polling at **chunk-group** status only

When generation is **queued** (LLM can exceed HTTP timeouts):

| Rule | Detail |
|------|--------|
| **One Bull job = one chunk group** | Each row targeted by **`POST .../lesson-test/generate-quizzes`** (**§2.2**) **or** **`POST .../chunk-groups/:groupId/generate-quizzes`** enqueues **one** job that processes **the whole group** (merged context, one primary LLM batch — not one job per chunk). Parallelism = multiple jobs for **different** `groupId`s. |
| **Redis** | Bull uses Redis for queue state; **pub/sub** notifies **chunk-group** status waiters (**below**). |
| **`POST .../lesson-test/generate-quizzes`** (**preferred first**) | **`202`** + **`jobs[]`** — **§2.2**; primary authoring entry (“generate all”). |
| **`POST .../chunk-groups/:groupId/generate-quizzes`** | Prefer **`202 Accepted`** with **`{ groupId, jobId }`** — same processor as bulk; ship **after** bulk path (**§3.2** note). |
| **Long poll (only here)** | **`GET .../chunk-groups/:groupId/generate-quizzes/status?jobId=...`**: hold up to ~**`LONG_POLL_TIMEOUT_MS`**, subscribe to **`lesson-test-group-gen:${jobId}`**; return completed payload or **still processing** — **`docs/lesson-test-group-generation-context.md`** §1.3 & §6. **Bulk “generate all”:** run **one long-poll per group** in parallel (each uses its own **`groupId`** + **`jobId`**). |
| **Bulk snapshot (no hold)** | **`GET .../lesson-test/generate-quizzes/status?jobId=...&jobId=...`** — **§2.3**: instant **`items[]`** from Bull/cache for dashboard / short polling only. |
| **`GET .../lesson-test`** | Includes **`generation.jobId`** per chunk group when a job is active — **§2.1** (frontend can reattach to **per-group** long-polls after refresh). |
| **MVP shortcut** | Optional **`?sync=true`** or small lessons only: inline **200** `{ createdCount, quizzes[] }` per group without Bull — document timeout limits; bulk endpoint may reject **`sync`** or run sequentially (not recommended). |

### 3.3 Optional bulk convenience (not required for MVP)

| Method | Path | Description |
|--------|------|-------------|
| `PUT` | `/assistant/lessons/:lessonId/lesson-test/chunk-groups/sync` | Replace all groups in one transaction from `{ groups: [...] }`. Use if you want a single “Save all rows” without N round-trips; implement later if needed. |

---

## 4. Quiz routes (existing controller — extend only)

Stay on **`/assistant/quizzes`**; backward compatible defaults unchanged.

| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/assistant/quizzes/chunks/:chunkId/quizzes` | Optional body: `lessonTestChunkGroupId`, `quizScope` — see earlier draft. |
| `POST` | `/assistant/quizzes/chunks/:chunkId/quizzes/batch` | Same. |
| `GET` | `/assistant/quizzes/chunks/:chunkId/quizzes` | Optional `?quizScope=`. |
| `GET` | `/assistant/quizzes/chunks/:chunkId/quizzes/:quizId` | Include `quizScope`, `lessonTestChunkGroupId` in DTO. |

---

## 5. Validation (server-side)

- **`chunkIds.length` ≤ 3** for every chunk group (product cap; details in **`lesson-test-group-generation-context.md`**).
- `chunkIds[]` ⊆ `lesson_chunks` for **`lessonId`**.
- **`GET .../chunk-groups/:groupId/generate-quizzes/status`:** **`jobId`** must belong to a job whose **`data.groupId`** matches **`groupId`** and **`data.lessonId`** matches **`lessonId`**.
- On **`generate-quizzes`** (per-group **§3.2**, bulk **§2.2**) and on quiz **POST** with group id: `chunkId` must appear in that group’s `chunk_ids`.
- **Bulk status snapshot (**§2.3**):** each **`jobId`** must resolve to a Bull job with **`data.lessonId`** = **`lessonId`** (and **`data.groupId`** set); otherwise **403** / **404**. No long-poll semantics on this route.
- Enforce non-overlapping `chunkIds` across groups **if** product requires.

---

## 6. Authoring UI ↔ API (updated)

| UI surface | API |
|------------|-----|
| Load blueprint | `GET .../lesson-test` — read **`generation.jobId`** per row for spinners / resume poll |
| Save header only | `PUT .../lesson-test` |
| Add one row | `POST .../chunk-groups` |
| Edit one row | `PATCH .../chunk-groups/:groupId` |
| Remove one row | `DELETE .../chunk-groups/:groupId` |
| **Generate AI for entire blueprint (one click)** — **priority UX** | `POST .../lesson-test/generate-quizzes` → **`jobs[]`** → **parallel** **`GET .../chunk-groups/:groupId/generate-quizzes/status?jobId=`** per row (**long-poll**); optionally **`GET .../lesson-test/generate-quizzes/status`** between rounds for a quick **snapshot** → refresh **`GET .../lesson-test`** |
| Generate AI for one row | **`POST .../chunk-groups/:groupId/generate-quizzes`** (thin wrapper — ship **after** bulk **`POST`**); same **`GET .../chunk-groups/:groupId/generate-quizzes/status`** loop (**long-poll**) |
| Delete entire blueprint | `DELETE .../lesson-test` (policy-dependent) |

---

## 7. Learner runtime (unchanged intent)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/assistant/lessons/:lessonId/lesson-test/questions` | Flat or grouped list of `LESSON_TEST` quizzes; shuffle client or `?shuffle=true`. |
| `GET` | `/assistant/lessons/:lessonId/lesson-test/preview` | Optional payload for player overlay. |

---

## 8. Optional later

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/assistant/quizzes/chunks/:chunkId/quizzes/:quizId` | Persist manual edits from **QuizEditor** |
| `DELETE` | `/assistant/quizzes/chunks/:chunkId/quizzes/:quizId` | Archive/remove quiz |

---

## 9. Suggested implementation order

1. Router + **`LessonTestController`** + services for **GET/PUT/DELETE** header (**§2**) — **`GET`** must merge **`generation`** from Redis (or equivalent) **§2.1**.
2. **POST/PATCH/DELETE** chunk groups (**§3.1**).
3. **Shared worker:** merged-context pipeline + Bull (**one job per `groupId`**) + quiz persistence **`LESSON_TEST`** — invoked only from enqueue handlers below; see **`lesson-test-group-generation-context.md`** §4–6.
4. **`POST .../lesson-test/generate-quizzes`** (**§2.2**) **first** — bulk enqueue (**priority**); **`GET .../lesson-test/generate-quizzes/status`** snapshot (**§2.3**); **`GET .../chunk-groups/:groupId/generate-quizzes/status`** long-poll (**§3.2**) — without these three, authors cannot complete the primary “one click” flow.
5. **`POST .../lesson-test/chunk-groups/:groupId/generate-quizzes`** (**§3.2**) — thin wrapper calling the **same** enqueue logic as step 4 (**optional second** once bulk is stable).
6. Extend **quiz** endpoints + DTOs (**§4**).
7. Wire web **LessonExamBlueprintSection** / services (lead with bulk generate UX).
8. Learner endpoints (**§7**).

---

## 10. References

- Group generation (merged context, token cap, truncation, max 3 chunks, **Bull + Redis**, **long-poll only on chunk-group status**, **bulk snapshot on lesson-test status**, **1 job = 1 chunk group**): `docs/lesson-test-group-generation-context.md`
- Schema: `docs/test-for-lesson-schema-draft.md`
- Quiz routes today: `src/routes/quiz.route.ts`
- Web: `web/src/services/assistant/quiz.service.ts`
