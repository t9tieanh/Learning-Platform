# Quiz Schema - Developer Quick Start

## What Changed?

Updated Prisma schema to support quiz creation, management, and answer tracking in the lesson system.

### Files Modified
- `rest-api/assistant-service/prisma/schema.prisma` - Added 3 new models + 4 enums
- `rest-api/assistant-service/prisma/migrations/20260411_add_quiz_schema/migration.sql` - New migration

### No Breaking Changes ✅
- Existing `Lesson` and `LessonChunk` data untouched
- New quiz tables start empty
- Optional relationship added to `LessonChunk`

---

## New Models Added

### 1. Quiz
Stores quiz questions with metadata:
```typescript
{
  id: string
  chunkId: string          // FK → LessonChunk
  question: string         // The question text
  explanation: string      // Why answer is correct
  type: QuestionType       // MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
  difficulty: DifficultyLevel  // EASY, MEDIUM, HARD
  bloomLevel: BloomLevel   // REMEMBER...CREATE
  
  // AI Tracking
  aiGenerated: boolean
  aiModel?: string         // e.g., "gpt-4", "claude"
  aiConfidence?: number    // 0.0-1.0
  
  // Workflow
  createdBy: string        // User who created
  isApproved: boolean      // Instructor approval
  status: QuizStatus       // ACTIVE, ARCHIVED, FLAGGED
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Indexes:**
- `chunkId` - Fast lookup by lesson chunk
- `createdBy` - Track quizzes by creator
- `aiGenerated` - Filter AI quizzes
- `isApproved` - Approval workflow

---

### 2. QuizChoice
Answer options for each quiz:
```typescript
{
  id: string
  quizId: string      // FK → Quiz
  text: string        // Choice text
  isCorrect: boolean  // Correct answer?
  order: number       // Display order (1, 2, 3...)
  feedback?: string   // Optional feedback if selected
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Index:**
- `quizId` - Get all choices for quiz

---

### 3. QuizAnswer ⭐ Answer History
Tracks every student answer submission:
```typescript
{
  id: string
  userId: string         // Who answered
  quizId: string        // Which quiz
  selectedChoiceId: string  // Which choice they picked
  isCorrect: boolean    // Correct?
  timeSpent?: number    // Seconds to answer
  
  answeredAt: DateTime  // When they answered
  createdAt: DateTime
}
```

**Indexes:**
- `userId` - Get user's answer history
- `quizId` - Get all answers for quiz
- `answeredAt` - Time-based queries
- `userId, quizId` - User performance on specific quiz

---

## New Enums

### QuestionType
```typescript
'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
```

### DifficultyLevel
```typescript
'EASY' | 'MEDIUM' | 'HARD'
```

### BloomLevel
```typescript
'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE'
```

### QuizStatus
```typescript
'ACTIVE' | 'ARCHIVED' | 'FLAGGED'
```

---

## Database Relationships

```
LessonChunk
  └─ quizzes: Quiz[]
      ├─ choices: QuizChoice[]
      │   └─ answers: QuizAnswer[]
      └─ answers: QuizAnswer[]
          └─ choice: QuizChoice
```

### Delete Cascade Rules
- Delete `Quiz` → Delete all `QuizChoice` and `QuizAnswer`
- Delete `QuizChoice` → Can't delete if has answers (RESTRICT)
- Delete `LessonChunk` → Delete all related `Quiz` records

---

## How to Deploy

### Step 1: Apply Migration
```bash
cd rest-api/assistant-service
npx prisma migrate dev
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Types Available
After generation, use in code:
```typescript
import { Prisma } from '@prisma/client'

type Quiz = Prisma.QuizCreateInput
type QuizAnswer = Prisma.QuizAnswerCreateInput
// etc.
```

---

## Example Usage (Future Implementation)

### Create Quiz
```typescript
const quiz = await prisma.quiz.create({
  data: {
    chunkId: 'chunk-123',
    question: 'What is 2+2?',
    explanation: 'Basic arithmetic: 2+2=4',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    bloomLevel: 'REMEMBER',
    createdBy: 'user-456',
    choices: {
      create: [
        { text: '3', order: 1, isCorrect: false },
        { text: '4', order: 2, isCorrect: true },
        { text: '5', order: 3, isCorrect: false },
      ]
    }
  },
  include: { choices: true }
})
```

### Record Answer
```typescript
const answer = await prisma.quizAnswer.create({
  data: {
    userId: 'user-789',
    quizId: 'quiz-456',
    selectedChoiceId: 'choice-2',
    isCorrect: true,
    timeSpent: 15  // seconds
  }
})
```

### Get User's Quiz History
```typescript
const history = await prisma.quizAnswer.findMany({
  where: { userId: 'user-789' },
  include: { 
    quiz: { include: { choices: true } },
    choice: true
  },
  orderBy: { answeredAt: 'desc' }
})
```

---

## Performance Considerations

✅ **Optimized For:**
- Finding quizzes by chunk
- Getting answers by user
- Filtering AI-generated quizzes
- User performance analytics

🔍 **Total Indexes:** 9 strategic indexes covering all query patterns

⚡ **Estimated Query Times:**
- Get quizzes for chunk: ~1-2ms (indexed)
- Get user answer history: ~2-3ms (indexed)
- Get quiz answers: ~1-2ms (indexed)

---

## What's Next?

After schema is deployed:
1. ✅ Database schema done (this task)
2. Create `QuizService` for CRUD operations
3. Create API endpoints for quiz management
4. Create answer submission endpoint
5. Connect frontend UI to new API

---

## Troubleshooting

### Migration fails?
Check:
- PostgreSQL is running
- DATABASE_URL is correct
- No conflicting table/enum names

### Types not generated?
```bash
# Regenerate
npx prisma generate --skip-engine

# Or full reset
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

### Foreign key errors?
Ensure:
- `chunkId` references valid `lesson_chunks` IDs
- `quizId` references valid `quizzes` IDs
- `selectedChoiceId` references valid `quiz_choices` IDs

---

## Reference Docs

- Prisma Docs: https://www.prisma.io/docs/
- Schema Guide: See `QUIZ_SCHEMA_IMPLEMENTATION_SUMMARY.md`
- API Spec: See `QUIZ_SCHEMA_QUICK_REFERENCE.md`

