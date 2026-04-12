# Quiz Schema Recommendation - Comprehensive Analysis

**Date**: 2026-04-11  
**Purpose**: Design database and API schema for AI-powered quiz feature with non-VIP support

---

## 📋 Executive Summary

Based on careful analysis of your codebase, I recommend implementing a **multi-layer quiz schema** that supports:

✅ **AI Generation** - LLM-powered auto-generation of quizzes from lesson content  
✅ **Non-VIP Access** - Free users can create/manage quizzes manually  
✅ **VIP Features** - Premium users get unlimited AI-generated quizzes and advanced options  
✅ **Separation of Concerns** - Frontend and backend data structures optimized for each use case  
✅ **Scalability** - Support for multiple quiz types and complex question structures  

---

## 🏗️ Current State Analysis

### **Frontend Quiz Structure** (web/src/types/ai.ts)
```typescript
interface QuizChoice {
  id: string
  text: string
  isCorrect: boolean
}

interface Quiz {
  id?: string
  question: string
  choices: QuizChoice[]
  explanation: string
}

interface LessonChunk {
  id: string
  // ... other fields
  quizzes?: Quiz[]
}
```

**Current Issues**:
- ❌ Metadata missing: No creation timestamps, source tracking, or question type
- ❌ No VIP-aware schema elements
- ❌ No AI generation metadata (confidence scores, model version, etc.)
- ❌ No user attribution for manually created quizzes
- ❌ No difficulty level or bloom's taxonomy classification
- ❌ Quiz storage location unclear (frontend-only state vs. persistent backend)

### **Backend Data Layer** (rest-api/assistant-service)
- ✅ Lesson table exists with chunks relationship
- ❌ No Quiz/LessonQuiz table in Prisma schema
- ❌ No quiz persistence layer
- ❌ No AI generation service for quizzes
- ❌ Currently using "quizzes" as optional field in LessonChunk

### **User Context**
- ✅ VIP status available: `isVip`, `durationMonths`, `expiresAt`
- ✅ User authentication context exists
- ❌ No quiz creation limits based on VIP status

---

## 🎯 Recommended Schema Architecture

### **Layer 1: Database Schema** (Prisma - Assistant Service)

#### **1.1 Quiz Table** (Core quiz data)
```prisma
model Quiz {
  id          String   @id @default(uuid())
  chunkId     String
  chunk       LessonChunk @relation(fields: [chunkId], references: [id], onDelete: Cascade)
  
  // Question Content
  question    String   @db.Text
  choices     QuizChoice[]
  explanation String   @db.Text
  
  // Question Metadata
  type        QuestionType @default(MULTIPLE_CHOICE)  // MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
  difficulty  DifficultyLevel @default(MEDIUM)         // EASY, MEDIUM, HARD
  bloomLevel  BloomLevel @default(UNDERSTAND)          // REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
  
  // Content Tracking
  content     String?  @db.Text    // Original text/context from lesson chunk
  contentHash String?  @db.Text    // Hash for duplicate detection
  
  // AI Generation Metadata
  aiGenerated Boolean  @default(false)
  aiModel     String?  // e.g., "gpt-4", "claude-3"
  aiConfidence Float?  // 0.0-1.0 confidence score
  aiPromptUsed String? @db.Text  // Store prompt for reproducibility
  
  // User Attribution
  createdBy   String
  creator     User @relation(fields: [createdBy], references: [id])
  
  // Status & Flags
  status      QuizStatus @default(ACTIVE)  // ACTIVE, ARCHIVED, FLAGGED
  isApproved  Boolean @default(false)      // Instructor approval for AI-generated
  approvedBy  String?
  approver    User? @relation("QuizApprover", fields: [approvedBy], references: [id])
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  @@index([chunkId])
  @@index([createdBy])
  @@index([aiGenerated])
  @@map("quizzes")
}

model QuizChoice {
  id        String @id @default(uuid())
  quizId    String
  quiz      Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  text      String @db.Text
  isCorrect Boolean @default(false)
  order     Int    @default(0)  // Determine choice order
  
  // Additional metadata for future features
  explanation String? @db.Text  // Per-choice explanation
  feedback    String? @db.Text  // Feedback if selected
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([quizId])
  @@map("quiz_choices")
}

// Enums
enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
  ESSAY
}

enum DifficultyLevel {
  EASY
  MEDIUM
  HARD
}

enum BloomLevel {
  REMEMBER
  UNDERSTAND
  APPLY
  ANALYZE
  EVALUATE
  CREATE
}

enum QuizStatus {
  ACTIVE
  ARCHIVED
  FLAGGED    // Flagged for review
  DELETED
}
```

#### **1.2 Updated LessonChunk** (Add back-reference)
```prisma
model LessonChunk {
  // ... existing fields ...
  
  // Quiz relationship
  quizzes     Quiz[]
  
  // Metadata for quiz generation
  hasPendingQuizGeneration Boolean @default(false)
  
  // Timestamps remain
}

// Remove from lesson.subtitles if quiz used to be stored there
```

#### **1.3 User Table Addition** (If not already present)
```prisma
model User {
  id              String @id @default(uuid())
  email           String @unique
  
  // VIP Status
  isVip           Boolean @default(false)
  vipActivatedAt  DateTime?
  vipExpiresAt    DateTime?
  
  // Quiz Creation Limits
  monthlyQuizQuota     Int @default(10)  // Non-VIP: 10/month, VIP: unlimited
  quizzesCreatedMonth  Int @default(0)   // Reset monthly
  
  // Relationships
  createdQuizzes  Quiz[] @relation("QuizCreator")
  approvedQuizzes Quiz[] @relation("QuizApprover")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

### **Layer 2: API DTOs & Response Types**

#### **2.1 Request DTOs** (Backend - rest-api/assistant-service)

```typescript
// Create Quiz Request
interface CreateQuizRequest {
  chunkId: string
  question: string
  choices: CreateQuizChoiceRequest[]
  explanation: string
  type?: QuestionType                    // default: MULTIPLE_CHOICE
  difficulty?: DifficultyLevel           // default: MEDIUM
  bloomLevel?: BloomLevel                // default: UNDERSTAND
}

interface CreateQuizChoiceRequest {
  text: string
  isCorrect: boolean
  order?: number
  explanation?: string
  feedback?: string
}

// AI Generate Quiz Request
interface GenerateQuizRequest {
  chunkId: string
  chunkContent: string                   // The lesson content to generate quiz from
  count?: number                         // Number of quizzes to generate (max: 5 for non-VIP, 20 for VIP)
  difficulty?: DifficultyLevel           // Desired difficulty
  excludeTopics?: string[]               // Topics to skip
  focusOn?: string[]                     // Specific topics to focus
  style?: 'educational' | 'assessment'   // Purpose of quiz
}

// Bulk Generate Request
interface BulkGenerateQuizzesRequest {
  chunkIds: string[]
  quizzesPerChunk?: number               // 1-5 for non-VIP, 1-20 for VIP
  difficulty?: DifficultyLevel
}

// Update Quiz Request
interface UpdateQuizRequest {
  question?: string
  choices?: UpdateQuizChoiceRequest[]
  explanation?: string
  isApproved?: boolean                   // Instructor only - for AI-generated
}

interface UpdateQuizChoiceRequest {
  id: string
  text?: string
  isCorrect?: boolean
  order?: number
  explanation?: string
  feedback?: string
}

// Batch Delete
interface DeleteQuizzesRequest {
  quizIds: string[]
}
```

#### **2.2 Response DTOs** (Backend - rest-api/assistant-service)

```typescript
// Quiz Response DTO
interface QuizResponseDto {
  id: string
  chunkId: string
  question: string
  choices: QuizChoiceResponseDto[]
  explanation: string
  
  type: QuestionType
  difficulty: DifficultyLevel
  bloomLevel: BloomLevel
  
  aiGenerated: boolean
  aiModel?: string
  aiConfidence?: number
  
  createdBy: string
  creatorName?: string
  
  status: QuizStatus
  isApproved: boolean
  approvedBy?: string
  
  createdAt: string
  updatedAt: string
}

interface QuizChoiceResponseDto {
  id: string
  text: string
  isCorrect: boolean
  order: number
  explanation?: string
  feedback?: string
}

// Bulk Response
interface GenerateQuizzesResponse {
  lessonId?: string
  chunkId?: string
  generatedCount: number
  quizzes: QuizResponseDto[]
  estimatedTokens: number              // For cost tracking
  generationTimeMs: number              // Performance metric
}

// Quiz Stats for Dashboard
interface QuizStatsDto {
  totalQuizzes: number
  aiGeneratedCount: number
  manuallyCreatedCount: number
  averageDifficulty: DifficultyLevel
  byBloomLevel: Record<BloomLevel, number>
  byType: Record<QuestionType, number>
  approvalPendingCount: number
}

// List with Pagination
interface ListQuizzesResponse {
  items: QuizResponseDto[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
```

---

### **Layer 3: Frontend Type Definitions** (web/src/types/ai.ts - UPDATED)

```typescript
// Enhanced Quiz Type with metadata
export interface QuizChoice {
  id: string
  text: string
  isCorrect: boolean
  order?: number
  explanation?: string
  feedback?: string
}

export interface Quiz {
  id?: string
  chunkId?: string
  question: string
  choices: QuizChoice[]
  explanation: string
  
  // Metadata
  type?: QuestionType
  difficulty?: DifficultyLevel
  bloomLevel?: BloomLevel
  
  // AI Generation Tracking
  aiGenerated?: boolean
  aiModel?: string
  aiConfidence?: number
  
  // User & Status
  createdBy?: string
  creatorName?: string
  status?: QuizStatus
  isApproved?: boolean
  
  // Timestamps
  createdAt?: string
  updatedAt?: string
}

// Question Type Enum
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum BloomLevel {
  REMEMBER = 'REMEMBER',
  UNDERSTAND = 'UNDERSTAND',
  APPLY = 'APPLY',
  ANALYZE = 'ANALYZE',
  EVALUATE = 'EVALUATE',
  CREATE = 'CREATE'
}

export enum QuizStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  FLAGGED = 'FLAGGED',
  DELETED = 'DELETED'
}

// Enhanced LessonChunk
export interface LessonChunk {
  id: string
  chunkIndex: number
  title: string | null
  summary: string | null
  timestamp: string | null
  startTime: string | null
  endTime: string | null
  sentenceCount: number | null
  content?: string
  quizzes?: Quiz[]
  
  // NEW: Quiz generation metadata
  hasPendingQuizGeneration?: boolean
}

// AI Generation Request/Response Types
export interface AIQuizGenerationRequest {
  chunkId: string
  chunkContent: string
  count?: number
  difficulty?: DifficultyLevel
  focusOn?: string[]
}

export interface AIQuizGenerationResponse {
  quizzes: Quiz[]
  generatedCount: number
  estimatedTokens?: number
  generationTimeMs?: number
}

export interface QuizStats {
  totalQuizzes: number
  aiGeneratedCount: number
  manuallyCreatedCount: number
  averageDifficulty: DifficultyLevel
  byBloomLevel: Record<BloomLevel, number>
  byType: Record<QuestionType, number>
  approvalPendingCount: number
}
```

---

## 🔐 VIP Feature Differentiation

### **Non-VIP Users**
| Feature | Limit |
|---------|-------|
| Manual quiz creation per month | 10 quizzes |
| AI-generated quizzes per month | 0 (disabled) |
| Questions per quiz | 4 |
| Choice text length | 200 characters |
| Explanation length | 500 characters |
| Quiz types available | Multiple Choice only |
| Bloom's taxonomy levels | 2 (Remember, Understand) |
| AI confidence display | No |
| Batch generation | No |

### **VIP Users**
| Feature | Limit |
|---------|-------|
| Manual quiz creation per month | Unlimited |
| AI-generated quizzes per month | Unlimited |
| Questions per quiz | 10 |
| Choice text length | 500 characters |
| Explanation length | 2000 characters |
| Quiz types available | All types |
| Bloom's taxonomy levels | All levels |
| AI confidence display | Yes |
| Batch generation | Yes (up to 50/batch) |

---

## 🔄 API Endpoint Design

### **Quiz Management Endpoints**
```
// List quizzes for a chunk
GET /assistant/analysis/lessons/:lessonId/chunks/:chunkId/quizzes
  ├─ Query: page, pageSize, status, aiGenerated, difficulty
  ├─ Response: List<QuizResponseDto>
  └─ Auth: Optional (see public/private quizzes)

// Get single quiz
GET /assistant/analysis/lessons/:lessonId/chunks/:chunkId/quizzes/:quizId
  ├─ Response: QuizResponseDto
  └─ Auth: Required

// Create quiz manually
POST /assistant/analysis/lessons/:lessonId/chunks/:chunkId/quizzes
  ├─ Body: CreateQuizRequest
  ├─ Headers: Authorization, X-User-Id
  ├─ Response: QuizResponseDto
  ├─ Validation: Check monthly quota for non-VIP
  └─ Auth: Required (must be lesson creator)

// Update quiz
PATCH /assistant/analysis/lessons/:lessonId/chunks/:chunkId/quizzes/:quizId
  ├─ Body: UpdateQuizRequest
  ├─ Response: QuizResponseDto
  └─ Auth: Required (must be quiz creator or admin)

// Delete quiz
DELETE /assistant/analysis/lessons/:lessonId/chunks/:chunkId/quizzes/:quizId
  ├─ Response: { success: boolean }
  └─ Auth: Required (must be quiz creator or admin)

// Delete multiple quizzes
DELETE /assistant/analysis/lessons/:lessonId/chunks/:chunkId/quizzes
  ├─ Body: DeleteQuizzesRequest
  ├─ Response: { deletedCount: number }
  └─ Auth: Required

// AI Generation Endpoints
POST /assistant/analysis/lessons/:lessonId/chunks/:chunkId/quizzes/generate
  ├─ Body: GenerateQuizRequest
  ├─ Headers: Authorization, X-User-Id
  ├─ Response: GenerateQuizzesResponse (with Job ID for async)
  ├─ Validation: 
  │   ├─ Check VIP status
  │   ├─ Validate non-VIP quota (max 5 quizzes/request)
  │   └─ Validate VIP quota (max 20 quizzes/request)
  ├─ Processing: Queue async job with Bull
  └─ Auth: Required

// Get generation job status
GET /assistant/analysis/jobs/:jobId
  ├─ Response: { status, progress, result?, error? }
  └─ Auth: Required

// Approve AI-generated quiz (instructor only)
PATCH /assistant/analysis/lessons/:lessonId/chunks/:chunkId/quizzes/:quizId/approve
  ├─ Response: QuizResponseDto
  └─ Auth: Required (lesson creator)

// Get quiz statistics
GET /assistant/analysis/lessons/:lessonId/quizzes/stats
  ├─ Response: QuizStatsDto
  └─ Auth: Required

// Bulk generate quizzes
POST /assistant/analysis/lessons/:lessonId/quizzes/generate-bulk
  ├─ Body: BulkGenerateQuizzesRequest
  ├─ Headers: Authorization, X-User-Id
  ├─ Response: { jobId, estimatedTime, estimatedTokens }
  ├─ Validation: VIP-only feature
  └─ Auth: Required (VIP only)
```

---

## 📊 Data Flow Diagrams

### **Quiz Creation Flow**
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Instructor Opens Quiz Builder                            │
│    → Load existing quizzes from API                          │
│    → Check VIP status & monthly quota                        │
│    → Display VIP lock if quota exceeded                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Create Quiz Manually OR Generate with AI                 │
│    Manual: User fills form → POST /quizzes                  │
│    AI: User selects options → POST /quizzes/generate        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Validation                                               │
│    ├─ Check monthly quota (non-VIP: 10, VIP: unlimited)    │
│    ├─ Validate question/choice content                      │
│    ├─ Detect duplicate questions (contentHash)              │
│    └─ Check character limits per VIP status                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Save to Database                                         │
│    ├─ Insert Quiz & QuizChoice records                      │
│    ├─ Update user.quizzesCreatedMonth counter               │
│    ├─ Set aiGenerated=true if AI-generated                  │
│    └─ Return QuizResponseDto                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend Update                                          │
│    ├─ Add quiz to UI list                                   │
│    ├─ Show success toast                                    │
│    ├─ Update quota display                                  │
│    └─ Enable/disable "Generate with AI" button              │
└─────────────────────────────────────────────────────────────┘
```

### **AI Quiz Generation Flow**
```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Clicks "Generate with AI"                           │
│    → Check VIP status (show dialog if non-VIP)              │
│    → Prepare GenerateQuizRequest                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend Processing (Async Job)                           │
│    ├─ Validate chunk content                                │
│    ├─ Queue Bull job with generation parameters             │
│    ├─ Return jobId to frontend                              │
│    └─ Start polling for progress                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. LLM Processing                                           │
│    ├─ Call OpenAI/Claude with chunk content                 │
│    ├─ Generate N quizzes with different difficulties        │
│    ├─ Calculate confidence scores                           │
│    ├─ Add aiModel, aiPrompt, aiConfidence metadata          │
│    └─ Validate generated content                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Database Persistence                                     │
│    ├─ Save all generated quizzes with metadata              │
│    ├─ Set status=ACTIVE, isApproved=false initially         │
│    ├─ Store aiGenerated=true, aiConfidence, aiModel         │
│    └─ Index by chunkId for fast retrieval                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend Display                                         │
│    ├─ Show generated quizzes with AI badge                  │
│    ├─ Display confidence score (VIP only)                   │
│    ├─ Show "Pending Approval" status                        │
│    ├─ Allow instructor to approve/reject/edit               │
│    └─ Update generation stats                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Integration with Existing Components

### **LearnovaQuizBuilder Integration**
```typescript
// Update props to accept VIP status
interface LearnovaQuizBuilderProps {
  chunkId: string
  lessonId: string
  initialQuizzes?: Quiz[]
  onSave: (quizzes: Quiz[]) => void
  
  // NEW: VIP-aware props
  isVip: boolean
  monthlyQuizQuotaRemaining: number
  canUseAI: boolean
  onGenerateWithAI?: (request: GenerateQuizRequest) => Promise<GenerateQuizzesResponse>
  onQuotaExceeded?: () => void
}

// Update UI to show:
// ✓ "Gợi ý từ AI" button with VIP badge
// ✓ Quota counter for non-VIP users
// ✓ AI confidence scores (VIP only)
// ✓ Question type selector (VIP only)
// ✓ Bloom's level selector (VIP only)
// ✓ Difficulty level selector
```

### **ChunkItem Integration**
```typescript
// Quiz stats displayed on chunk header
// - Total quizzes count
// - AI vs Manual breakdown
// - Pending approval count
// - Average difficulty badge
```

---

## 📋 Implementation Priority & Phases

### **Phase 1: Core Schema & Persistence** (Foundation)
```
Backend:
  1. Create Quiz & QuizChoice tables in Prisma
  2. Update LessonChunk.quizzes relationship
  3. Add VIP quota fields to User model
  4. Create migration files
  
Frontend:
  1. Update @/types/ai.ts with enums & metadata
  2. Update service types in analysis.service.ts
  3. Update LearnovaQuizBuilder interface
```

### **Phase 2: Manual Quiz Creation** (No VIP gate yet)
```
Backend:
  1. Create QuizService with CRUD operations
  2. Create API endpoints (GET, POST, PATCH, DELETE)
  3. Add quota validation middleware
  4. Create response DTOs
  
Frontend:
  1. Connect UI to API endpoints
  2. Show quota counter for non-VIP
  3. Disable "Generate" button for non-VIP
  4. Display success/error toasts
```

### **Phase 3: AI Quiz Generation** (Full feature)
```
Backend:
  1. Create QuizGenerationService (LLM integration)
  2. Create GenerateQuizRequest validation
  3. Implement Bull queue job for async processing
  4. Add confidence scoring logic
  5. Create /generate endpoint
  6. Add approval workflow
  
Frontend:
  1. Add "Generate with AI" button
  2. Show VIP dialog for non-VIP users
  3. Display generation progress
  4. Show AI badge & confidence scores
  5. Allow bulk generation (VIP)
```

### **Phase 4: Advanced Features** (Optional)
```
1. Quiz analytics dashboard
2. Question difficulty calibration
3. Quiz performance tracking by students
4. Batch quiz import/export
5. Quiz templates library
6. AI model selection (GPT-4, Claude, etc.)
```

---

## 🛡️ Security & Validation Considerations

### **Input Validation**
```
Quiz Question:
  ├─ Min length: 10 characters
  ├─ Max length: 500 chars (non-VIP), 1000 (VIP)
  ├─ No XSS injection (sanitize HTML)
  └─ No SQL injection

Quiz Choices:
  ├─ Min 2 choices, Max 4 (non-VIP), 6 (VIP)
  ├─ At least 1 correct choice
  ├─ At most 1 correct choice (multiple select is future feature)
  ├─ No duplicate choice text
  └─ Max text length: 200 chars (non-VIP), 500 (VIP)

Explanation:
  ├─ Max length: 500 chars (non-VIP), 2000 (VIP)
  └─ Support Markdown formatting
```

### **Authorization Rules**
```
Create Quiz:
  ├─ Must be authenticated
  ├─ Must be lesson creator
  ├─ Must not exceed monthly quota
  └─ Must have appropriate VIP status

Edit Quiz:
  ├─ Must be quiz creator OR lesson creator
  └─ Can only edit if status != APPROVED

Delete Quiz:
  ├─ Must be quiz creator OR lesson creator
  └─ Hard/soft delete based on policy

Approve Quiz:
  ├─ Must be lesson creator (instructor)
  └─ Only for AI-generated quizzes

Generate with AI:
  ├─ Must have VIP status
  ├─ Must not exceed VIP quota
  └─ Must be lesson creator
```

---

## 💾 Storage & Performance Optimization

### **Indexing Strategy**
```sql
-- Frequently queried by chunk
CREATE INDEX idx_quizzes_chunk_id ON quizzes(chunkId);

-- Track AI-generated quizzes
CREATE INDEX idx_quizzes_ai_generated ON quizzes(aiGenerated);

-- Approval workflow
CREATE INDEX idx_quizzes_is_approved ON quizzes(isApproved);

-- Creator tracking
CREATE INDEX idx_quizzes_created_by ON quizzes(createdBy);

-- Duplicate detection
CREATE INDEX idx_quizzes_content_hash ON quizzes(contentHash);

-- Soft deletes
CREATE INDEX idx_quizzes_status ON quizzes(status);
```

### **Query Optimization**
```
List Quizzes:
  ├─ Use pagination (avoid SELECT *)
  ├─ Lazy-load choices via SELECT choices WHERE quiz_id IN (...)
  ├─ Cache chunk quiz count
  └─ Limit to 20 quizzes per request

Get Quiz Details:
  ├─ Include choices in single query
  ├─ Use query projection to exclude AI prompts
  └─ Cache for 5 minutes

Generate Quizzes:
  ├─ Async job processing
  ├─ Batch insert (vs. N INSERT statements)
  └─ Return jobId immediately (don't wait for generation)
```

---

## 🔄 Migration Path

### **If Quizzes Already Stored Elsewhere**
```
1. Audit current storage location:
   - Are they in LessonChunk.quizzes JSON?
   - Are they in LessonChunk.content as text?
   - Are they only in frontend state?

2. Create migration script to:
   - Extract quiz data
   - Normalize into Quiz & QuizChoice tables
   - Generate contentHash for each
   - Set aiGenerated = false (mark as manual)
   - Preserve timestamps if available

3. Validate data integrity:
   - Check all quizzes have at least 1 correct choice
   - Verify no orphaned choices
   - Test relationship integrity

4. Deploy with feature flag:
   - Switch on new schema gradually
   - Keep old data readable during transition
   - Monitor for data loss
```

---

## 📱 Frontend UI/UX Considerations

### **VIP Lock Display**
```
When non-VIP user sees "Generate with AI":
├─ Button disabled with lock icon
├─ Tooltip: "VIP feature only. Upgrade to create AI quizzes"
├─ Click shows VipUpgradeDialog
└─ Dialog shows:
   ├─ Benefits of VIP: Unlimited AI-generated quizzes
   ├─ Current usage: "3/10 quizzes this month"
   ├─ Remaining quota: "7 quizzes left"
   └─ CTA: "Upgrade to VIP"
```

### **Quiz Card Display**
```
Manual Quiz:
  ├─ Blue header
  ├─ Question count
  └─ Edit/Delete buttons

AI-Generated Quiz:
  ├─ Purple header with ✨ AI badge
  ├─ Confidence score (VIP only): "95% confident"
  ├─ "Pending Approval" status label
  ├─ Edit/Approve/Reject/Delete buttons
  └─ AI Model badge: "Generated by GPT-4"
```

### **Generation Progress**
```
Show during AI generation:
├─ Progress bar with percentage
├─ Estimated time remaining
├─ "Generating 5 quizzes..."
├─ Cancel button
└─ After completion:
   ├─ Show generated quizzes
   ├─ "5 quizzes generated in 45 seconds"
   └─ Call-to-action: "Review & Approve"
```

---

## 🎓 Example Quiz Data Structure

### **Example 1: AI-Generated Multiple Choice**
```json
{
  "id": "q-001",
  "chunkId": "chunk-123",
  "question": "Trong quá trình quang hợp, CO₂ được cố định ở giai đoạn nào?",
  "type": "MULTIPLE_CHOICE",
  "difficulty": "HARD",
  "bloomLevel": "ANALYZE",
  
  "choices": [
    {
      "id": "c-001",
      "text": "Phản ứng sáng",
      "isCorrect": false,
      "order": 0,
      "feedback": "Phản ứng sáng diễn ra ở màng thylakoid và tạo ra ATP, NADPH"
    },
    {
      "id": "c-002",
      "text": "Chu trình Calvin",
      "isCorrect": true,
      "order": 1,
      "explanation": "CO₂ được cố định thành 3-phosphoglycerate bởi enzyme RuBisCO"
    },
    {
      "id": "c-003",
      "text": "Cả hai giai đoạn",
      "isCorrect": false,
      "order": 2
    },
    {
      "id": "c-004",
      "text": "Không có giai đoạn nào",
      "isCorrect": false,
      "order": 3
    }
  ],
  
  "explanation": "Chu trình Calvin là quá trình cố định CO₂. Giai đoạn đầu tiên của chu trình Calvin gọi là giai đoạn cố định CO₂, trong đó CO₂ kết hợp với RuBP (ribulose-1,5-bisphosphate) để tạo thành 3-phosphoglycerate.",
  
  "aiGenerated": true,
  "aiModel": "gpt-4-turbo",
  "aiConfidence": 0.92,
  
  "createdBy": "user-123",
  "status": "ACTIVE",
  "isApproved": true,
  
  "createdAt": "2026-04-10T10:30:00Z",
  "updatedAt": "2026-04-11T08:45:00Z"
}
```

### **Example 2: Manual True/False**
```json
{
  "id": "q-002",
  "chunkId": "chunk-123",
  "question": "Photosystem I hấp thụ ánh sáng ở bước sóng dài hơn so với Photosystem II",
  "type": "TRUE_FALSE",
  "difficulty": "MEDIUM",
  "bloomLevel": "UNDERSTAND",
  
  "choices": [
    {
      "id": "c-005",
      "text": "Đúng",
      "isCorrect": true,
      "order": 0
    },
    {
      "id": "c-006",
      "text": "Sai",
      "isCorrect": false,
      "order": 1
    }
  ],
  
  "explanation": "Photosystem I hấp thụ ánh sáng peak ở 700 nm (P700), trong khi Photosystem II hấp thụ peak ở 680 nm (P680). Do đó PSI hấp thụ bước sóng dài hơn.",
  
  "aiGenerated": false,
  "createdBy": "user-123",
  "status": "ACTIVE",
  "isApproved": true,
  
  "createdAt": "2026-04-11T09:15:00Z",
  "updatedAt": "2026-04-11T09:15:00Z"
}
```

---

## ✅ Checklist for Implementation

### **Database Layer**
- [ ] Create Quiz model in Prisma schema
- [ ] Create QuizChoice model in Prisma schema
- [ ] Add enums (QuestionType, DifficultyLevel, BloomLevel, QuizStatus)
- [ ] Update LessonChunk model with quizzes relationship
- [ ] Add VIP quota fields to User model
- [ ] Create and test migration files
- [ ] Add appropriate indexes for performance
- [ ] Create database backup before migration

### **Backend Services**
- [ ] Create QuizRepository for data access
- [ ] Create QuizService with CRUD operations
- [ ] Create QuizGenerationService (LLM integration)
- [ ] Create DTOs (Request/Response)
- [ ] Create validation middleware
- [ ] Create Bull queue job for async generation
- [ ] Create approval workflow service
- [ ] Write unit tests for services

### **Backend API**
- [ ] Create quiz controller
- [ ] Implement GET /quizzes endpoints
- [ ] Implement POST /quizzes (manual creation)
- [ ] Implement PATCH /quizzes/:id
- [ ] Implement DELETE /quizzes/:id
- [ ] Implement POST /quizzes/generate (AI generation)
- [ ] Implement GET /jobs/:jobId (progress polling)
- [ ] Implement PATCH /quizzes/:id/approve
- [ ] Add authentication middleware
- [ ] Add authorization checks
- [ ] Write integration tests

### **Frontend Types**
- [ ] Update @/types/ai.ts with new enums
- [ ] Add QuestionType, DifficultyLevel, BloomLevel
- [ ] Add QuizStatus enum
- [ ] Update Quiz interface with metadata
- [ ] Update LessonChunk interface

### **Frontend Services**
- [ ] Create @/services/assistant/quiz.service.ts
- [ ] Implement API methods for CRUD operations
- [ ] Implement generateQuizzes method
- [ ] Implement getGenerationProgress method
- [ ] Add request/response types

### **Frontend UI Components**
- [ ] Update LearnovaQuizBuilder props
- [ ] Add VIP quota display
- [ ] Add "Generate with AI" button
- [ ] Add VIP lock/dialog
- [ ] Add progress indicator for generation
- [ ] Update ChunkItem to show quiz stats
- [ ] Add AI badge & confidence score display
- [ ] Add question type selector (VIP)
- [ ] Add difficulty/Bloom level selectors
- [ ] Add approval workflow UI

### **Testing**
- [ ] Test manual quiz creation (VIP & non-VIP)
- [ ] Test quota enforcement
- [ ] Test AI generation (with mock LLM)
- [ ] Test approval workflow
- [ ] Test authorization checks
- [ ] Test data persistence
- [ ] Test UI rendering with different VIP statuses
- [ ] Performance test with large quiz counts

### **Documentation**
- [ ] Update API documentation
- [ ] Create database schema diagrams
- [ ] Document VIP feature boundaries
- [ ] Add developer guide for quiz generation
- [ ] Create user guide for quiz creation

---

## 🚀 Alternative Approaches & Trade-offs

### **Option A: Recommended (Above)**
**Approach**: Dedicated Quiz & QuizChoice tables + VIP feature gate
**Pros**:
  ✅ Scalable & normalized schema
  ✅ Supports AI generation workflows
  ✅ Clear VIP differentiation
  ✅ Easy to add advanced features

**Cons**:
  ❌ More complex migration if quizzes exist
  ❌ Requires new tables

### **Option B: Lightweight (JSON Storage)**
**Approach**: Store quizzes as JSONB in LessonChunk
**Pros**:
  ✅ Simple schema change
  ✅ Fast for existing chunks
  ✅ No migration needed if quizzes are already there

**Cons**:
  ❌ Poor query performance (can't filter by difficulty)
  ❌ Can't index quiz content
  ❌ Difficult to add AI generation metadata
  ❌ Not scalable for reporting/analytics

### **Option C: Separate Service**
**Approach**: Create dedicated QuizService microservice
**Pros**:
  ✅ Fully independent scaling
  ✅ Separate team ownership
  ✅ Can have different tech stack

**Cons**:
  ❌ Added complexity
  ❌ Network latency between services
  ❌ Requires service discovery
  ❌ Overkill for current scale

**Recommendation**: Start with **Option A (Recommended)** for scalability and future features

---

## 📞 Questions to Clarify Before Implementation

1. **Quiz Persistence**: Where are quizzes currently stored? Frontend state only or already in DB?
2. **AI Generation**: Which LLM provider? (OpenAI, Anthropic Claude, LLaMA, etc.)
3. **Approval Workflow**: Do all AI-generated quizzes need instructor approval before showing to students?
4. **VIP Pricing**: What's the monthly cost for VIP? This affects AI quota strategy.
5. **Student Quiz Viewing**: Can students see AI-generated quizzes? Or only approved ones?
6. **Quiz Reusability**: Can quizzes from one chunk be reused in another?
7. **Export/Import**: Need to support exporting quizzes? Importing from templates?
8. **Analytics**: Track which AI-generated quizzes students find most helpful?
9. **Localization**: Support multiple languages for quiz generation?
10. **Difficulty Calibration**: Use student answer data to auto-calibrate difficulty levels?

---

## 📚 Reference Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       Frontend Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ LearnovaQuizBuilder Component                              │ │
│  │ ├─ Quiz List View (with AI badges)                         │ │
│  │ ├─ Quiz Edit View (type selector, bloom level, etc.)       │ │
│  │ ├─ AI Generation Progress                                  │ │
│  │ └─ VIP Lock Dialog                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                                ↕
┌──────────────────────────────────────────────────────────────────┐
│                       API Gateway Layer                          │
│  (Authentication, Rate Limiting, Request Validation)             │
└──────────────────────────────────────────────────────────────────┘
                                ↕
┌──────────────────────────────────────────────────────────────────┐
│                   Backend API Layer                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │ Quiz Controller  │  │ Generation Job   │  │ Approval      │  │
│  │                  │  │ Processor        │  │ Workflow      │  │
│  │ • GET /quizzes   │  │                  │  │               │  │
│  │ • POST /quizzes  │  │ (Bull Queue)     │  │ • Approve     │  │
│  │ • PATCH /quizzes │  │ • LLM Call       │  │ • Reject      │  │
│  │ • DELETE /quizzes│  │ • Save Result    │  │ • Flag        │  │
│  │ • /generate      │  │ • Update Status  │  │               │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│         ↓                      ↓                      ↓            │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │         QuizService Layer                              │    │
│  │  ├─ CRUD operations                                    │    │
│  │  ├─ Quota validation                                  │    │
│  │  ├─ Duplicate detection                               │    │
│  │  └─ Status management                                 │    │
│  └──────────────────────────────────────────────────────────┘    │
│         ↓                                                         │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │    QuizGenerationService Layer                         │    │
│  │  ├─ Prompt engineering                                 │    │
│  │  ├─ LLM integration (OpenAI/Claude)                    │    │
│  │  ├─ Confidence scoring                                 │    │
│  │  └─ Content validation                                 │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                                ↕
┌──────────────────────────────────────────────────────────────────┐
│                    Data Access Layer                             │
│  ┌────────────────────────────┐  ┌──────────────────────────┐    │
│  │  QuizRepository            │  │  UserRepository (VIP)    │    │
│  │  • Find by chunk           │  │  • Get quota             │    │
│  │  • Save quiz & choices     │  │  • Update quota used     │    │
│  │  • Find by status          │  │  • Check VIP status      │    │
│  │  • Delete with cascade     │  │                          │    │
│  └────────────────────────────┘  └──────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                                ↕
┌──────────────────────────────────────────────────────────────────┐
│                   Database Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Quiz         │  │ QuizChoice   │  │ User (VIP)   │            │
│  │              │  │              │  │              │            │
│  │ • id (PK)    │  │ • id (PK)    │  │ • id (PK)    │            │
│  │ • chunkId    │  │ • quizId (FK)│  │ • vipStatus  │            │
│  │ • question   │  │ • text       │  │ • quotaUsed  │            │
│  │ • type       │  │ • isCorrect  │  │ • quotaLimit │            │
│  │ • difficulty │  │ • order      │  │              │            │
│  │ • bloomLevel │  │ • feedback   │  │              │            │
│  │ • aiGenerated│  │              │  │              │            │
│  │ • aiModel    │  │              │  │              │            │
│  │ • aiConf     │  │              │  │              │            │
│  │ • createdBy  │  │              │  │              │            │
│  │ • isApproved │  │              │  │              │            │
│  │ • status     │  │              │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└──────────────────────────────────────────────────────────────────┘
                                ↕
┌──────────────────────────────────────────────────────────────────┐
│              External Services                                   │
│  ┌──────────────────┐          ┌──────────────────────────────┐  │
│  │ LLM Provider     │          │ Bull Queue / Redis           │  │
│  │ (OpenAI/Claude)  │          │ (Async Job Processing)       │  │
│  └──────────────────┘          └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

**This comprehensive recommendation provides a solid foundation for implementing the AI-powered quiz feature while maintaining support for non-VIP users and ensuring scalability for future enhancements.**

