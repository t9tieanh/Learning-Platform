import express, { Router } from 'express';
import lessonTestController from '~/controllers/lesson_test.controller';
import Authentication from '~/middleware/auth.midleware';
import { checkLessonOwnership } from '~/middleware/checkLessonOwnership.middleware';
import validateDto from '~/middleware/validateDto.midleware';
import checkQuizGenerationVip from '~/middleware/checkQuizGenerationVip.middleware';
import {
  BulkGenerateLessonTestDto,
  CreateLessonTestChunkGroupDto,
  PutLessonTestDto,
} from '~/dto/request/lesson-test.dto';

const lessonTestRouter: Router = express.Router();

lessonTestRouter.get(
  '/lessons/:lessonId/lesson-test',
  Authentication(true),
  checkLessonOwnership,
  lessonTestController.getLessonTest
);

lessonTestRouter.put(
  '/lessons/:lessonId/lesson-test',
  Authentication(true),
  checkLessonOwnership,
  validateDto(PutLessonTestDto),
  lessonTestController.putLessonTest
);

lessonTestRouter.delete(
  '/lessons/:lessonId/lesson-test',
  Authentication(true),
  checkLessonOwnership,
  lessonTestController.deleteLessonTest
);

lessonTestRouter.post(
  '/lessons/:lessonId/lesson-test/generate-quizzes',
  Authentication(true),
  checkLessonOwnership,
  checkQuizGenerationVip,
  validateDto(BulkGenerateLessonTestDto),
  lessonTestController.postBulkGenerateQuizzes
);

lessonTestRouter.get(
  '/lessons/:lessonId/lesson-test/generate-quizzes/status',
  Authentication(true),
  checkLessonOwnership,
  lessonTestController.getBulkGenerationStatus
);

lessonTestRouter.post(
  '/lessons/:lessonId/lesson-test/chunk-groups',
  Authentication(true),
  checkLessonOwnership,
  validateDto(CreateLessonTestChunkGroupDto),
  lessonTestController.postChunkGroup
);

export default lessonTestRouter;
