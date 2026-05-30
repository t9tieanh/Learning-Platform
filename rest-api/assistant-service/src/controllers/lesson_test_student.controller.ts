import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '~/dto/response/send-response';
import { LessonTestStudentSubmissionDto } from '~/dto/request/lesson-test-student.dto';
import lessonTestStudentService from '~/service/lessonTest/lessonTestStudent.service';

class LessonTestStudentController {
  getStudentLessonTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const result = await lessonTestStudentService.getStudentLessonTestView(lessonId);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'OK',
        result,
      });
    } catch (e) {
      next(e);
    }
  };

  postStudentSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const userId = String(req.user?.sub);
      const body = req.data as LessonTestStudentSubmissionDto;

      const result = await lessonTestStudentService.submitLessonTest(lessonId, userId, body.answers);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'OK',
        result,
      });
    } catch (e) {
      next(e);
    }
  };

  listStudentSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const userId = String(req.user?.sub);
      const rows = await lessonTestStudentService.listStudentSubmissions(lessonId, userId);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'OK',
        result: rows,
      });
    } catch (e) {
      next(e);
    }
  };

  getStudentSubmissionDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lessonId = String(req.params.lessonId);
      const submissionId = String(req.params.submissionId);
      const userId = String(req.user?.sub);
      const result = await lessonTestStudentService.getStudentSubmissionDetail(lessonId, userId, submissionId);

      sendResponse(res, {
        code: StatusCodes.OK,
        message: 'OK',
        result,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default new LessonTestStudentController();
