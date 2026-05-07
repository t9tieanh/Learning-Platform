import express, { Router } from 'express'
import analysisController from '~/controllers/analysis.controller'

import Authentication from '~/middleware/auth.midleware'
import { checkLessonOwnership } from '~/middleware/checkLessonOwnership.middleware'
import { checkViewLesson } from '~/middleware/checkViewLesson.middleware'
import validateDto from '~/middleware/validateDto.midleware'
import { UpdateChunkSummaryDto } from '~/dto/request/update-chunk.dto'
import { RAGQuestionRequest } from '~/dto/request/ragQuestion.dto'

const analysisRouter: Router = express.Router()

/**
 * GET /assistant/lessons/:lessonId/analysis
 *
 * Long-polling endpoint that returns the AI analysis for a lesson.
 * If analysis is not yet complete, the connection is held open (up to 25s)
 * and resolved as soon as summarization completes via Redis pub/sub.
 */
analysisRouter.get('/lessons/:lessonId', Authentication(true), checkLessonOwnership, analysisController.getAnalysis)
analysisRouter.get('/lessons/:lessonId/detail', Authentication(true), checkViewLesson, analysisController.getLessonIntelligence)

/**
 * PATCH /assistant/lessons/:lessonId/chunks/:chunkId/summary
 * 
 * Allows the instructor to manually edit the AI-generated summary of a specific chunk.
 */
analysisRouter.patch('/lessons/:lessonId/chunks/:chunkId/summary', Authentication(true), checkLessonOwnership, validateDto(UpdateChunkSummaryDto), analysisController.updateChunkSummary)

/**
 * POST /assistant/lessons/:lessonId/chat
 * 
 * Answer a question about lesson content using RAG (Retrieval-Augmented Generation).
 * 
 * Workflow:
 * 1. Verify user is authenticated
 * 2. Verify user is enrolled in course (can view lesson)
 * 3. Search for relevant chunks by semantic similarity
 * 4. Format chunks as context
 * 5. Send to LLM with question
 * 6. Return answer + source references
 * 
 * Body: { "question": "User's question about the lesson" }
 *
 * Routes below are ordered so `/chat/sessions/...` is matched before `/chat`.
 */

/** Messages in one session */
analysisRouter.get(
    '/lessons/:lessonId/chat/sessions/:sessionId/messages',
    Authentication(true),
    checkViewLesson,
    analysisController.getLessonChatMessages
)

/** Create a new empty chat session */
analysisRouter.post(
    '/lessons/:lessonId/chat/sessions',
    Authentication(true),
    checkViewLesson,
    analysisController.createLessonChatSession
)

analysisRouter.get(
    '/lessons/:lessonId/chat/sessions',
    Authentication(true),
    checkViewLesson,
    analysisController.listLessonChatSessions
)

analysisRouter.post(
    '/lessons/:lessonId/chat',
    Authentication(true),
    checkViewLesson,
    validateDto(RAGQuestionRequest),
    analysisController.answerQuestion
)

export default analysisRouter
