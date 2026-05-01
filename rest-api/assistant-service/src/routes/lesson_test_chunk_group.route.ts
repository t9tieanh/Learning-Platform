import express, { Router } from 'express';
import lessonTestChunkGroupController from '~/controllers/lesson_test_chunk_group.controller';
import Authentication from '~/middleware/auth.midleware';
import { checkLessonOwnership } from '~/middleware/checkLessonOwnership.middleware';
import checkQuizGenerationVip from '~/middleware/checkQuizGenerationVip.middleware';
import { resolveLessonIdFromLessonTestChunkGroup } from '~/middleware/resolveLessonIdFromLessonTestChunkGroup.middleware';
import validateDto from '~/middleware/validateDto.midleware';
import {
  GenerateLessonTestGroupQuizzesDto,
  PatchLessonTestChunkGroupDto,
} from '~/dto/request/lesson-test.dto';

const lessonTestChunkGroupRouter: Router = express.Router();

const groupScoped = [
  Authentication(true),
  resolveLessonIdFromLessonTestChunkGroup,
  checkLessonOwnership,
] as const;

lessonTestChunkGroupRouter.get(
  '/lesson-test/chunk-groups/:groupId/quizzes',
  ...groupScoped,
  lessonTestChunkGroupController.getChunkGroupQuizzes
);

lessonTestChunkGroupRouter.patch(
  '/lesson-test/chunk-groups/:groupId',
  ...groupScoped,
  validateDto(PatchLessonTestChunkGroupDto),
  lessonTestChunkGroupController.patchChunkGroup
);

lessonTestChunkGroupRouter.delete(
  '/lesson-test/chunk-groups/:groupId',
  ...groupScoped,
  lessonTestChunkGroupController.deleteChunkGroup
);

lessonTestChunkGroupRouter.post(
  '/lesson-test/chunk-groups/:groupId/generate-quizzes',
  Authentication(true),
  resolveLessonIdFromLessonTestChunkGroup,
  checkLessonOwnership,
  checkQuizGenerationVip,
  validateDto(GenerateLessonTestGroupQuizzesDto),
  lessonTestChunkGroupController.postGenerateQuizzes
);

lessonTestChunkGroupRouter.get(
  '/lesson-test/chunk-groups/:groupId/generate-quizzes/status',
  ...groupScoped,
  lessonTestChunkGroupController.getGenerateQuizzesStatus
);

export default lessonTestChunkGroupRouter;
