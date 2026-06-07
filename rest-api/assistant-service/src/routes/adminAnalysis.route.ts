import express, { Router } from 'express'
import Authentication from '~/middleware/auth.midleware'
import { checkAdminRole } from '~/middleware/checkAdminRole.middleware'
import analysisController from '~/controllers/analysis.controller'
import lessonTestController from '~/controllers/lesson_test.controller'

const adminAnalysisRouter: Router = express.Router()

const adminChain = [Authentication(true), checkAdminRole] as const

/**
 * Admin read-only: lesson segments + review quizzes (chunks[].quizzes).
 * Gateway path: assistant/admin/analysis/lessons/:lessonId/intelligence
 */
adminAnalysisRouter.get(
  '/lessons/:lessonId/intelligence',
  ...adminChain,
  analysisController.getLessonIntelligence
)

/**
 * Admin read-only: full lesson test blueprint (includes DRAFT) with correct answers.
 * Gateway path: assistant/admin/analysis/lessons/:lessonId/lesson-test
 */
adminAnalysisRouter.get(
  '/lessons/:lessonId/lesson-test',
  ...adminChain,
  lessonTestController.getLessonTest
)

export default adminAnalysisRouter
