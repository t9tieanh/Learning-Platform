# Quiz Schema Implementation Summary

## ✅ Completed Tasks

### 1. Schema.prisma Updated
**Location:** `/rest-api/assistant-service/prisma/schema.prisma`

**Changes Made:**
- Added relationship to `LessonChunk`: `quizzes Quiz[]`
- Created 3 new models: `Quiz`, `QuizChoice`, `QuizAnswer`
- Created 4 new enums: `QuestionType`, `DifficultyLevel`, `BloomLevel`, `QuizStatus`

### 2. Migration Created
**Location:** `/rest-api/assistant-service/prisma/migrations/20260411_add_quiz_schema/migration.sql`

**Contains 20 SQL statements:**
- 4 CREATE TYPE (enums)
- 3 CREATE TABLE (quizzes, quiz_choices, quiz_answers)
- 9 CREATE INDEX (for query performance)
- 4 ALTER TABLE (foreign key constraints)

---

## 📊 Database Schema Details

### Quiz Table
```sql
CREATE TABLE "quizzes" (
    id TEXT PRIMARY KEY,
    chunkId TEXT FOREIGN KEY → lesson_chunks(id),
    question TEXT NOT NULL,
    explanation TEXT NOT NULL,
    type QuestionType DEFAULT 'MULTIPLE_CHOICE',
    difficulty DifficultyLevel DEFAULT 'MEDIUM',
    bloomLevel BloomLevel DEFAULT 'REMEMBER',
    aiGenerated BOOLEAN DEFAULT false,
    aiModel TEXT,
    aiConfidence DOUBLE PRECISION,
    createdBy TEXT NOT NULL,
    isApproved BOOLEAN DEFAULT false,
    status QuizStatus DEFAULT 'ACTIVE',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP
);

INDEXES:
  - quizzes_chunkId_idx
  - quizzes_createdBy_idx
  - quizzes_aiGenerated_idx
  - quizzes_isApproved_idx
```

### QuizChoice Table
```sql
CREATE TABLE "quiz_choices" (
    id TEXT PRIMARY KEY,
    quizId TEXT FOREIGN KEY → quizzes(id),
    text TEXT NOT NULL,
    isCorrect BOOLEAN DEFAULT false,
    order INTEGER NOT NULL,
    feedback TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP
);

INDEXES:
  - quiz_choices_quizId_idx
```

### QuizAnswer Table (Answer History)
```sql
CREATE TABLE "quiz_answers" (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    quizId TEXT FOREIGN KEY → quizzes(id),
    selectedChoiceId TEXT FOREIGN KEY → quiz_choices(id),
    isCorrect BOOLEAN NOT NULL,
    timeSpent INTEGER,
    answeredAt TIMESTAMP DEFAULT NOW(),
    createdAt TIMESTAMP DEFAULT NOW()
);

INDEXES:
  - quiz_answers_userId_idx
  - quiz_answers_quizId_idx
  - quiz_answers_answeredAt_idx
  - quiz_answers_userId_quizId_idx (composite)
```

### Enums
```
QuestionType: MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
DifficultyLevel: EASY, MEDIUM, HARD
BloomLevel: REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
QuizStatus: ACTIVE, ARCHIVED, FLAGGED
```

---

## 🔗 Relationships

```
Lesson
  └─ LessonChunk
      └─ Quiz (NEW)
          ├─ QuizChoice (NEW) [cascade delete]
          └─ QuizAnswer (NEW) [cascade delete]
              └─ QuizChoice [restrict delete]
```

### Relationship Details:
1. **Quiz → LessonChunk**: Many-to-one (cascade delete)
   - A chunk can have multiple quizzes
   - When chunk deleted, all its quizzes deleted

2. **QuizChoice → Quiz**: Many-to-one (cascade delete)
   - A quiz has multiple choices
   - When quiz deleted, all choices deleted

3. **QuizAnswer → Quiz**: Many-to-one (cascade delete)
   - Multiple answers can reference same quiz
   - When quiz deleted, all answers deleted

4. **QuizAnswer → QuizChoice**: Many-to-one (restrict delete)
   - Each answer references one choice
   - Prevents accidental deletion of choice with answers

---

## 🗄️ Data Consistency & Existing Data

### Impact on Existing Data:
✅ **NO breaking changes** - The migration only adds new tables and relationships
- Existing `Lesson` data remains unchanged
- Existing `LessonChunk` data remains unchanged
- New `quizzes` relationship is optional in `LessonChunk`

### Migration Strategy:
1. Migration adds empty quiz tables (no data yet)
2. All new quiz data will be created by API
3. Frontend can optionally populate quizzes when lessons are created

### Data Flow:
```
Lesson (existing)
  → LessonChunk (existing, now with optional quizzes)
      → Quiz (starts empty, populated by API)
          → QuizChoice (starts empty, populated by API)
          → QuizAnswer (starts empty, populated on submission)
```

---

## 📋 Prisma Models (TypeScript types generated)

After running `prisma generate`, these types will be available:

```typescript
// From schema
type Quiz = {
  id: string;
  chunkId: string;
  question: string;
  explanation: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  bloomLevel: BloomLevel;
  aiGenerated: boolean;
  aiModel: string | null;
  aiConfidence: number | null;
  createdBy: string;
  isApproved: boolean;
  status: QuizStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  chunk?: LessonChunk;
  choices?: QuizChoice[];
  answers?: QuizAnswer[];
};

type QuizChoice = {
  id: string;
  quizId: string;
  text: string;
  isCorrect: boolean;
  order: number;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  quiz?: Quiz;
  answers?: QuizAnswer[];
};

type QuizAnswer = {
  id: string;
  userId: string;
  quizId: string;
  selectedChoiceId: string;
  isCorrect: boolean;
  timeSpent: number | null;
  answeredAt: Date;
  createdAt: Date;
  
  // Relations
  quiz?: Quiz;
  choice?: QuizChoice;
};

// Enums
enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

enum BloomLevel {
  REMEMBER = 'REMEMBER',
  UNDERSTAND = 'UNDERSTAND',
  APPLY = 'APPLY',
  ANALYZE = 'ANALYZE',
  EVALUATE = 'EVALUATE',
  CREATE = 'CREATE'
}

enum QuizStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  FLAGGED = 'FLAGGED'
}
```

---

## 🚀 Next Steps for Implementation

### Phase 1: Deploy Migration
```bash
# In development
cd rest-api/assistant-service
npx prisma migrate dev --name "add_quiz_schema"

# In production
npx prisma migrate deploy
```

### Phase 2: Generate Prisma Client
```bash
npx prisma generate
# This will create types in node_modules/.prisma/client
```

### Phase 3: API Implementation (not included in this task)
- Create QuizService
- Create API endpoints for CRUD operations
- Implement answer tracking endpoints
- Add VIP feature gates

### Phase 4: Frontend Integration (not included in this task)
- Update LearnovaQuizBuilder to use new API
- Connect to answer tracking
- Display quiz history

---

## 🔒 Foreign Key Constraints Summary

| From Table | To Table | Action on Delete | Action on Update |
|-----------|----------|-----------------|-----------------|
| quizzes | lesson_chunks | CASCADE | CASCADE |
| quiz_choices | quizzes | CASCADE | CASCADE |
| quiz_answers | quizzes | CASCADE | CASCADE |
| quiz_answers | quiz_choices | RESTRICT | CASCADE |

**CASCADE**: Automatically delete related records
**RESTRICT**: Prevent deletion if related records exist

---

## ✨ Key Features of Schema Design

### 1. Answer History Tracking ✅
- Tracks every user answer with `QuizAnswer` table
- Records: who answered, what they chose, correctness, time spent
- Enables performance analytics and quiz review

### 2. AI Metadata ✅
- `aiGenerated`: Know which quizzes are AI vs manual
- `aiModel`: Track which LLM created it
- `aiConfidence`: Show confidence scores to users (optional)

### 3. Approval Workflow ✅
- `isApproved`: Instructors can review AI quizzes before publishing
- `status`: Track ACTIVE/ARCHIVED/FLAGGED quizzes

### 4. Cognitive Levels ✅
- `bloomLevel`: REMEMBER through CREATE per Bloom's taxonomy
- `difficulty`: EASY, MEDIUM, HARD for differentiation

### 5. Performance Optimization ✅
- Strategic indexes on all query paths
- Composite index for user performance queries
- Foreign key constraints for data integrity

---

## 📝 Files Changed

| File | Type | Status |
|------|------|--------|
| `rest-api/assistant-service/prisma/schema.prisma` | Schema Definition | ✅ Updated |
| `rest-api/assistant-service/prisma/migrations/20260411_add_quiz_schema/migration.sql` | Migration | ✅ Created |

---

## ✅ Validation Checklist

- [x] Schema contains all required models (Quiz, QuizChoice, QuizAnswer)
- [x] All enums defined (QuestionType, DifficultyLevel, BloomLevel, QuizStatus)
- [x] Foreign key relationships properly configured
- [x] Cascade delete rules appropriate
- [x] All required indexes created
- [x] Migration file syntax validated
- [x] No breaking changes to existing data
- [x] Relationships between models correct

---

## 📚 Reference

**Document this was created from:** `QUIZ_SCHEMA_QUICK_REFERENCE.md`

**Schema follows best practices:**
- Proper normalization (separate tables for quiz, choice, answer)
- Strategic indexing for performance
- Clear audit trail (createdAt, updatedAt)
- Flexible enum types for future expansion
- Data integrity via foreign keys and constraints

---

## 🔄 Migration Execution Instructions

### Local Development
```bash
cd rest-api/assistant-service
npx prisma migrate dev --name "add_quiz_schema"
```

### Staging/Production
```bash
cd rest-api/assistant-service
npx prisma migrate deploy
```

The migration will:
1. Create PostgreSQL ENUMs for question type, difficulty, bloom level, and status
2. Create quizzes, quiz_choices, and quiz_answers tables
3. Create all 9 indexes for performance
4. Setup 4 foreign key relationships

**Estimated execution time:** < 100ms
**Data loss:** None (additive only)

