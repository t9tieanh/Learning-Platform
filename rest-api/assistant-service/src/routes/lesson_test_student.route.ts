import express, { Router } from 'express';
import lessonTestStudentController from '~/controllers/lesson_test_student.controller';
import Authentication from '~/middleware/auth.midleware';
import { checkViewLesson } from '~/middleware/checkViewLesson.middleware';
import validateDto from '~/middleware/validateDto.midleware';
import { LessonTestStudentSubmissionDto } from '~/dto/request/lesson-test-student.dto';

const lessonTestStudentRouter: Router = express.Router();

const studentLessonChain = [Authentication(true), checkViewLesson] as const;

lessonTestStudentRouter.get(
  '/lessons/:lessonId/lesson-test/student',
  ...studentLessonChain,
  lessonTestStudentController.getStudentLessonTest
);

lessonTestStudentRouter.post(
  '/lessons/:lessonId/lesson-test/student/submissions',
  ...studentLessonChain,
  validateDto(LessonTestStudentSubmissionDto),
  lessonTestStudentController.postStudentSubmission
);

lessonTestStudentRouter.get(
  '/lessons/:lessonId/lesson-test/student/submissions',
  ...studentLessonChain,
  lessonTestStudentController.listStudentSubmissions
);

lessonTestStudentRouter.get(
  '/lessons/:lessonId/lesson-test/student/submissions/:submissionId',
  ...studentLessonChain,
  lessonTestStudentController.getStudentSubmissionDetail
);

export default lessonTestStudentRouter;
