# Quiz Schema Recommendation - Quick Reference Guide

## 🎯 At a Glance

### **Recommended Schema Overview**
```
┌─────────────────────────────────────────────────┐
│            Database Schema                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Lesson (existing)                              │
│  ├── LessonChunk (existing)                     │
│  │   └── Quiz ⭐ (NEW)                          │
│  │       ├── QuizChoice ⭐ (NEW)                │
│  │       └── QuizAnswer ⭐ (NEW)                │
│  │                                              │
│  └── User (existing - monitored in other svc)  │
│                                                 │
│  QuizAnswer tracks:                             │
│  ├── userId: UUID                              │
│  ├── quizId: UUID                              │
│  ├── selectedChoiceId: UUID                    │
│  ├── isCorrect: Boolean                        │
│  └── answeredAt: DateTime                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📊 Database Schema - Simplified

### **Table: Quiz** (Core quiz data)
| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Primary key |
| `chunkId` | UUID FK | Link to lesson chunk |
| `question` | TEXT | Question text |
| `type` | ENUM | Multiple choice, T/F, etc. |
| `difficulty` | ENUM | Easy/Medium/Hard |
| `bloomLevel` | ENUM | Cognitive level |
| `explanation` | TEXT | Why answer is correct |
| `aiGenerated` | BOOL | Track AI vs manual |
| `aiModel` | ENUM | "gpt-4", "claude", etc. |
| `aiConfidence` | FLOAT | 0.0-1.0 confidence |
| `createdBy` | UUID FK | User who created |
| `isApproved` | BOOL | Instructor approval |
| `status` | ENUM | Active/Archived/Flagged |
| `createdAt` | DATETIME | Creation time |
| `updatedAt` | DATETIME | Last modification |

### **Table: QuizChoice** (Answer options)
| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Primary key |
| `quizId` | UUID FK | Link to quiz |
| `text` | TEXT | Choice text |
| `isCorrect` | BOOL | Correct answer? |
| `order` | INT | Display order |
| `feedback` | TEXT | If student selects this |

### **Table: QuizAnswer** (Answer history - tracks user responses)
| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Primary key |
| `userId` | UUID FK | User who answered |
| `quizId` | UUID FK | Which quiz |
| `selectedChoiceId` | UUID FK | Which answer they picked |
| `isCorrect` | BOOL | True/False result |
| `timeSpent` | INT | Seconds to answer |
| `answeredAt` | DATETIME | When they answered |
| `createdAt` | DATETIME | Record creation time |

---

## 🔐 VIP Feature Differentiation

### **Comparison Table**
ONLY VIP USER can be user feature automation generate quizz 

---

## 🔄 API Endpoints Summary

### **Core Endpoints**
```
GET    /assistant/analysis/lessons/:lid/chunks/:cid/quizzes
       → List quizzes for chunk

POST   /assistant/analysis/lessons/:lid/chunks/:cid/quizzes
       → Create quiz manually

PATCH  /assistant/analysis/lessons/:lid/chunks/:cid/quizzes/:qid
       → Update quiz

DELETE /assistant/analysis/lessons/:lid/chunks/:cid/quizzes/:qid
       → Delete quiz

POST   /assistant/analysis/lessons/:lid/chunks/:cid/quizzes/generate
       → Generate quizzes with AI (VIP only)

GET    /assistant/analysis/jobs/:jobId
       → Check generation progress

PATCH  /assistant/analysis/lessons/:lid/chunks/:cid/quizzes/:qid/approve
       → Approve AI quiz (instructor only)

POST   /assistant/analysis/quizzes/:qid/answers
       → Submit user answer (track history)

GET    /assistant/analysis/quizzes/:qid/answers
       → Get all answers for a quiz

GET    /assistant/analysis/users/:uid/quiz-history
       → Get user's answer history
```

---

## 📝 Frontend Types (Updated)

### **Minimal Addition to @/types/ai.ts**
```typescript
// Enums
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER'
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

// Updated Quiz Type
export interface Quiz {
  id?: string
  chunkId?: string
  question: string
  choices: QuizChoice[]
  explanation: string
  
  // NEW FIELDS
  type?: QuestionType
  difficulty?: DifficultyLevel
  bloomLevel?: BloomLevel
  aiGenerated?: boolean
  aiModel?: string
  aiConfidence?: number
  createdBy?: string
  isApproved?: boolean
  status?: 'ACTIVE' | 'ARCHIVED' | 'FLAGGED'
  createdAt?: string
  updatedAt?: string
}

export interface QuizChoice {
  id: string
  text: string
  isCorrect: boolean
  order?: number
  feedback?: string
}

// NEW: Answer History Type
export interface QuizAnswer {
  id: string
  userId: string
  quizId: string
  selectedChoiceId: string
  isCorrect: boolean
  timeSpent?: number  // seconds
  answeredAt: string
  createdAt: string
}
```

---

## 🚀 Implementation Phases (Quick Timeline)

### **Phase 1: Database** (1-2 days)
```
✓ Create Quiz & QuizChoice tables
✓ Update LessonChunk relationship
✓ Add VIP fields to User
✓ Create migrations
```

### **Phase 2: Manual Creation** (3-4 days)
```
✓ Backend: CRUD service & API
✓ Frontend: Connect UI to API
✓ Non-VIP quota limits
✓ Validation & error handling
```

### **Phase 3: AI Generation** (5-7 days)
```
✓ Backend: LLM integration
✓ Async job processing (Bull queue)
✓ VIP lock/dialog
✓ Progress indicator
✓ Confidence scoring
```

### **Phase 4: Polish & Advanced** (2-3 days)
```
✓ Approval workflow UI
✓ Quiz analytics dashboard
✓ Performance optimization
✓ Testing & bug fixes
```

**Total: 2-3 weeks for full feature**

---

## 💡 Key Design Decisions Explained

### **1. Why Separate Quiz & QuizChoice Tables?**
```
❌ Option: Store as JSON in LessonChunk
  Problem: Can't query/filter by difficulty
           Can't index for performance
           Limits analytics

✅ Option: Separate normalized tables
  Benefit: Query quizzes by difficulty
           Build dashboard/analytics
           Support advanced features
```

### **2. Why NOT Store VIP Status Here?**
```
✅ VIP status is monitored in another service:
   - User model managed by user-service
   - VIP checks happen via API call to user-service
   - Quiz service only needs to track quiz history
   - Cleaner separation of concerns
```

### **3. Why Answer History Table (QuizAnswer)?**
```
✅ Core responsibility of quiz-service:
   - Track every user answer submission
   - Know: Who answered, What answer, When, Correct?
   - Enable: Student performance analytics
   - Enables: Quiz review/retry functionality
   - Time tracking: How long per question
   
Example use cases:
   - "Show student their past attempts"
   - "Calculate quiz accuracy per student"
   - "Identify difficult questions (low accuracy)"
   - "Generate performance report"
```

### **4. Why AI Metadata Fields?**
```
✅ Track quiz quality:
   - aiGenerated: Know which are AI vs manual
   - aiModel: Track which model created it
   - aiConfidence: Show confidence to VIP users
   - Helps improve generation over time
```

### **5. Why Approval Workflow?**
```
✅ Quality control for AI:
   - Instructors review before students see
   - Can reject low-confidence quizzes
   - Can edit/fix AI mistakes
   - Builds trust in feature
```

---

## 🔌 Integration with Existing Code

### **LearnovaQuizBuilder.tsx - What Changes**
```typescript
// BEFORE
interface LearnovaQuizBuilderProps {
  chunkId: string
  initialQuizzes?: Quiz[]
  onSave: (quizzes: Quiz[]) => void
}

// AFTER (ADD)
interface LearnovaQuizBuilderProps {
  chunkId: string
  lessonId: string                    // ← NEW
  initialQuizzes?: Quiz[]
  onSave: (quizzes: Quiz[]) => void
  
  // VIP-aware props
  isVip: boolean                      // ← NEW
  monthlyQuizQuotaRemaining: number   // ← NEW
  canUseAI: boolean                   // ← NEW
  onGenerateWithAI?: (req) => Promise // ← NEW
}
```

### **UI Changes**
```
✅ "Gợi ý từ AI" button:
   - Normal state: Blue, clickable (VIP only)
   - Disabled state: Gray with lock icon (non-VIP)
   
✅ Quiz card enhancements:
   - Add AI badge (✨) for AI-generated
   - Show confidence score: "95% confident"
   - Show type: "Multiple choice"
   - Show difficulty: "Hard"
   
✅ Quota counter:
   - Display for non-VIP: "3/10 quizzes this month"
   - Hidden for VIP: Unlimited
   
✅ Generation progress:
   - Modal with progress bar
   - "Generating 5 quizzes... (3/5 done)"
   - Cancel button
```

---

## 🛡️ Critical Validations

### **Input Validation Rules**
```
Question:
  ✓ 10-500 characters (1000 for VIP)
  ✓ No XSS/SQL injection
  ✓ At least 1 letter

Choices:
  ✓ 2-4 choices (6 max for VIP)
  ✓ Each 5-200 characters
  ✓ No duplicates
  ✓ Exactly 1 correct answer

Explanation:
  ✓ 50-500 characters (2000 for VIP)
  ✓ Support basic Markdown

Answer Submission:
  ✓ User must be authenticated
  ✓ Choice must exist in quiz
  ✓ Quiz must be ACTIVE
  ✓ Can't submit if already answered (unless retry)
  ✓ Track timestamp automatically
  ✓ Calculate correctness server-side

Authorization:
  ✓ Must be authenticated
  ✓ Must be lesson creator (for quiz creation)
  ✓ VIP-only for AI generation
```

---

## 📈 Performance Considerations

### **Indexes to Create**
```sql
-- Fast retrieval by chunk
CREATE INDEX idx_quizzes_chunk_id 
  ON quizzes(chunkId);

-- Filter AI-generated
CREATE INDEX idx_quizzes_ai_generated 
  ON quizzes(aiGenerated);

-- Approval workflow
CREATE INDEX idx_quizzes_is_approved 
  ON quizzes(isApproved);

-- Creator tracking
CREATE INDEX idx_quizzes_created_by 
  ON quizzes(createdBy);

-- Answer history queries
CREATE INDEX idx_quiz_answers_user_id 
  ON quiz_answers(userId);

CREATE INDEX idx_quiz_answers_quiz_id 
  ON quiz_answers(quizId);

CREATE INDEX idx_quiz_answers_answered_at 
  ON quiz_answers(answeredAt);

-- Composite index for user performance per quiz
CREATE INDEX idx_quiz_answers_user_quiz 
  ON quiz_answers(userId, quizId);
```

### **Query Optimization**
```
List Quizzes:
  ✓ Paginate (20 per page)
  ✓ Lazy-load choices
  ✓ Cache counts
  
Get Single:
  ✓ Include choices in 1 query
  ✓ Cache for 5 min
  
Generate:
  ✓ Async job (return jobId)
  ✓ Batch insert choices
  ✓ Don't wait for LLM

Answer History:
  ✓ Paginate by date (newest first)
  ✓ Cache user stats (accuracy %, attempts)
  ✓ Use indexed queries for user/quiz combo
  ✓ Aggregate stats daily instead of on-demand
```

---

## 🎓 Example Data

### **Manual True/False Quiz**
```json
{
  "id": "q-001",
  "chunkId": "chunk-123",
  "question": "Is photosynthesis an exothermic process?",
  "type": "TRUE_FALSE",
  "difficulty": "EASY",
  "bloomLevel": "REMEMBER",
  "explanation": "Photosynthesis requires light energy input, making it endothermic.",
  "aiGenerated": false,
  "createdBy": "user-456",
  "isApproved": true,
  "status": "ACTIVE",
  "choices": [
    {"id": "c1", "text": "True", "isCorrect": false},
    {"id": "c2", "text": "False", "isCorrect": true}
  ]
}
```

### **AI-Generated Multiple Choice Quiz**
```json
{
  "id": "q-002",
  "chunkId": "chunk-123",
  "question": "What is the primary electron acceptor in the electron transport chain?",
  "type": "MULTIPLE_CHOICE",
  "difficulty": "HARD",
  "bloomLevel": "ANALYZE",
  "explanation": "NAD+ is reduced to NADH as the final electron acceptor in the electron transport chain.",
  "aiGenerated": true,
  "aiModel": "gpt-4-turbo",
  "aiConfidence": 0.94,
  "createdBy": "ai-service",
  "isApproved": true,
  "status": "ACTIVE",
  "choices": [
    {"id": "c3", "text": "NAD+", "isCorrect": true},
    {"id": "c4", "text": "ATP", "isCorrect": false, "feedback": "ATP is produced, not used as acceptor"},
    {"id": "c5", "text": "O2", "isCorrect": false},
    {"id": "c6", "text": "H2O", "isCorrect": false}
  ]
}
```

---

## 🎯 Success Criteria

### **Feature is "Done" When:**
```
✅ Database:
   ✓ Quiz, QuizChoice & QuizAnswer tables created
   ✓ Indexes added & performance tested
   ✓ Migration tested on dev/staging
   ✓ Answer history tracking verified

✅ Backend:
   ✓ All Quiz CRUD endpoints working
   ✓ Answer submission endpoint working
   ✓ Answer history queries working
   ✓ VIP feature checks via user-service
   ✓ AI generation working
   ✓ Approval workflow functional
   ✓ Authorization checks passing
   ✓ Error handling tested

✅ Frontend:
   ✓ Quiz creation UI working
   ✓ VIP lock displaying correctly
   ✓ Quiz submission & answer tracking working
   ✓ AI generation progress shown
   ✓ Confidence scores displaying (VIP)
   ✓ User answer history viewable
   ✓ Performance stats showing
   ✓ All UI states tested

✅ Testing:
   ✓ Unit tests: 80%+ coverage
   ✓ Integration tests passing
   ✓ E2E tests for quiz submission flow
   ✓ Answer tracking accuracy verified
   ✓ Manual testing complete
   ✓ Performance acceptable

✅ Documentation:
   ✓ API docs updated
   ✓ Answer history API documented
   ✓ Database schema documented
   ✓ Developer guide written
```

---

## ⚡ Quick Reference: What's NEW vs EXISTING

### **EXISTING (Don't touch)**
```
✓ LessonChunk table (add relationship only)
✓ LessonAnalysisService
✓ ChunkItem component
✓ User authentication
✓ VIP status checking
```

### **NEW (Must create)**
```
✓ Quiz table (Prisma model)
✓ QuizChoice table (Prisma model)
✓ QuizService (backend)
✓ QuizGenerationService (LLM integration)
✓ Quiz endpoints (API routes)
✓ Quiz DTOs (request/response types)
✓ Quiz UI enhancements (LearnovaQuizBuilder)
✓ SRT Parser (already done for subtitles!)
```

### **MODIFIED (Update)**
```
✓ LessonChunk: Add quizzes relationship
✓ Quiz type in web/src/types/ai.ts
✓ LearnovaQuizBuilder interface
```

---

## 📞 Before You Start Coding

**Ask yourself:**
1. ✅ Do we already have quizzes stored somewhere?
2. ✅ Which LLM for AI generation? (OpenAI, Claude, LLaMA)
3. ✅ Do students see AI-generated quizzes immediately or after approval?
4. ✅ Is AI quota per-user or global?
5. ✅ Export/import quiz features needed?

**If yes to migration question:**
- Audit where quizzes currently live
- Create migration/import script
- Test data integrity carefully
- Run on staging first!

---

## 🎬 Ready to Implement?

1. **Start Here**: Create Prisma models (Quiz, QuizChoice)
2. **Then**: Backend CRUD service & API
3. **Then**: Frontend types & UI components
4. **Finally**: AI generation & approval workflow

**Estimated: 2-3 weeks for complete feature**

