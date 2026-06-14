import {
  AnalysisStatus,
  LessonTest,
  LessonTestChunkGroup,
  LessonTestStatus,
  Prisma,
  QuestionType,
  QuizScope,
  QuizStatus,
} from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/middleware/ApiError';
import prismaService from '~/service/utils/prisma.service';
import lessonTestService from '~/service/lessonTest/lessonTest.service';
import lessonTestEligibilityService from '~/service/lessonTest/lessonTestEligibility.service';
import { shuffleArray, stringSetsEqual } from '~/utils/array.util';
import courseClient from '~/grpc/courseClient.grpc';
import Logger from '~/utils/logger';

const MIN_PASS_PERCENT_FOR_CERTIFICATE = 50;

/** MCQ + true/false only; short answer is out of scope for auto-grading v1. */
const GRADABLE_TYPES: QuestionType[] = [QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE];

type GradedSubmissionItem = {
  quizId: string;
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  selectedChoiceIds: string[];
  correctChoiceIds: string[];
  explanation: string;
  chunkId: string | null;
};

type QuizWithChoicesAndGroup = Prisma.QuizGetPayload<{
  include: {
    choices: true;
    lessonTestChunkGroup: { select: { id: true; createdAt: true } };
  };
}>;

export class LessonTestStudentService {
  /**
   * Ensures the lesson is safe to expose to learners: analysis completed and quality passed.
   */
  async assertLessonApprovedForStudent(lessonId: string): Promise<void> {
    const lesson = await prismaService.lesson.findUnique({
      where: { id: lessonId },
      select: { deleted: true, status: true, isQualityValid: true },
    });

    if (!lesson) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài học');
    }

    if (
      lesson.deleted ||
      lesson.status !== AnalysisStatus.COMPLETED ||
      lesson.isQualityValid !== true
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Bài học chưa sẵn sàng hoặc chưa được duyệt để làm bài kiểm tra'
      );
    }
  }

  assertPublishedLessonTest(lessonTest: LessonTest | null): asserts lessonTest is LessonTest {
    if (!lessonTest || lessonTest.status !== LessonTestStatus.PUBLISHED) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không có bài kiểm tra cho bài học này');
    }
  }

  /**
   * Loads lesson-test quizzes that can be auto-graded. No `isApproved` filter:
   * generated rows default `isApproved: false` in Prisma, and instructors still need students to see them once the test is published.
   */
  private async loadGradableQuizzes(lessonId: string): Promise<QuizWithChoicesAndGroup[]> {
    return prismaService.quiz.findMany({
      where: {
        quizScope: QuizScope.LESSON_TEST,
        lessonTestChunkGroup: { lessonId },
        type: { in: GRADABLE_TYPES },
        status: QuizStatus.ACTIVE,
        lessonTestChunkGroupId: { not: null },
      },
      include: {
        choices: true,
        lessonTestChunkGroup: { select: { id: true, createdAt: true } },
      },
    });
  }

  /**
   * Stable grading / results order: chunk groups by `createdAt` asc, then quizzes in each group by `createdAt` asc.
   */
  orderQuizzesForLesson(
    chunkGroups: LessonTestChunkGroup[],
    quizzes: QuizWithChoicesAndGroup[]
  ): QuizWithChoicesAndGroup[] {
    const byGroup = new Map<string, QuizWithChoicesAndGroup[]>();
    for (const q of quizzes) {
      const gid = q.lessonTestChunkGroupId;
      if (!gid) continue;
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid)!.push(q);
    }
    for (const list of byGroup.values()) {
      list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    const ordered: QuizWithChoicesAndGroup[] = [];
    for (const g of chunkGroups) {
      const list = byGroup.get(g.id) ?? [];
      ordered.push(...list);
    }
    return ordered;
  }

  /**
   * Published lesson test for learners: hides answers/explanations, shuffles question and choice order per spec.
   */
  async getStudentLessonTestView(lessonId: string) {
    await this.assertLessonApprovedForStudent(lessonId);

    const bundle = await lessonTestService.getLessonTestBundle(lessonId);
    if (!bundle) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không có bài kiểm tra cho bài học này');
    }
    this.assertPublishedLessonTest(bundle);

    const quizzes = await this.loadGradableQuizzes(lessonId);
    const byGroup = new Map<string, QuizWithChoicesAndGroup[]>();
    for (const q of quizzes) {
      const gid = q.lessonTestChunkGroupId!;
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid)!.push(q);
    }

    const chunkGroups = bundle.chunkGroups.map((group: LessonTestChunkGroup) => {
      const groupQuizzes = byGroup.get(group.id) ?? [];
      const sorted = [...groupQuizzes].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const shuffledQuizzes = shuffleArray(sorted);

      const quizzesOut = shuffledQuizzes.map((quiz) => {
        const choicesOrdered = [...quiz.choices].sort((a, b) => a.order - b.order);
        const choicesShuffled = shuffleArray(choicesOrdered);
        return {
          id: quiz.id,
          question: quiz.question,
          type: quiz.type,
          difficulty: quiz.difficulty,
          bloomLevel: quiz.bloomLevel,
          choices: choicesShuffled.map((c) => ({
            id: c.id,
            text: c.text,
          })),
          isApproved: quiz.isApproved,
          status: quiz.status,
          createdAt: quiz.createdAt.toISOString(),
          updatedAt: quiz.updatedAt.toISOString(),
          chunkId: quiz.chunkId,
        };
      });

      return {
        id: group.id,
        lessonId: group.lessonId,
        chunkIds: lessonTestService.parseStoredChunkIds(group.chunkIds),
        questionCount: group.questionCount,
        label: group.label,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
        quizzes: quizzesOut,
      };
    });

    return {
      lessonTest: {
        lessonId: bundle.lessonId,
        title: bundle.title,
        status: bundle.status,
        createdAt: bundle.createdAt.toISOString(),
        updatedAt: bundle.updatedAt.toISOString(),
      },
      chunkGroups,
    };
  }

  /**
   * Grade MCQ/TF only, persist submission + per-question rows, return scored breakdown.
   */
  async submitLessonTest(
    lessonId: string,
    userId: string,
    answersInput: { quizId: string; selectedChoiceIds: string[] }[]
  ) {
    await this.assertLessonApprovedForStudent(lessonId);

    const lesson = await prismaService.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chunks: {
          orderBy: { chunkIndex: 'asc' },
          select: {
            id: true,
            chunkIndex: true,
            title: true,
            summary: true,
            timestamp: true,
            startTime: true,
            endTime: true,
            sentenceCount: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài học');
    }

    const bundle = await lessonTestService.getLessonTestBundle(lessonId);
    if (!bundle) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không có bài kiểm tra cho bài học này');
    }
    this.assertPublishedLessonTest(bundle);

    const rawQuizzes = await this.loadGradableQuizzes(lessonId);
    const orderedQuizzes = this.orderQuizzesForLesson(bundle.chunkGroups, rawQuizzes);
    const gradableIds = new Set(orderedQuizzes.map((q) => q.id));

    for (const row of answersInput) {
      if (!gradableIds.has(row.quizId)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Có quiz không thuộc bài kiểm tra được phép làm hoặc không được chấm tự động'
        );
      }
    }

    const answerByQuiz = new Map<string, string[]>();
    for (const row of answersInput) {
      const uniq = [...new Set(row.selectedChoiceIds)];
      answerByQuiz.set(row.quizId, uniq);
    }

    const items: GradedSubmissionItem[] = [];

    let earnedPoints = 0;
    const maxPoints = orderedQuizzes.length;

    for (const quiz of orderedQuizzes) {
      const selectedChoiceIds = answerByQuiz.get(quiz.id) ?? [];
      const choiceIdSet = new Set(quiz.choices.map((c) => c.id));
      for (const cid of selectedChoiceIds) {
        if (!choiceIdSet.has(cid)) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Lựa chọn không thuộc câu hỏi (quizId=${quiz.id})`
          );
        }
      }

      const correctChoiceIds = quiz.choices.filter((c) => c.isCorrect).map((c) => c.id);
      const isCorrect = stringSetsEqual(selectedChoiceIds, correctChoiceIds);
      const points = isCorrect ? 1 : 0;
      earnedPoints += points;

      items.push({
        quizId: quiz.id,
        isCorrect,
        pointsEarned: points,
        maxPoints: 1,
        selectedChoiceIds,
        correctChoiceIds,
        explanation: quiz.explanation,
        chunkId: quiz.chunkId,
      });
    }

    const percent =
      maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 10000) / 100 : 0;

    const submission = await prismaService.$transaction(async (tx) => {
      const sub = await tx.lessonTestSubmission.create({
        data: {
          lessonId,
          userId,
          earnedPoints,
          maxPoints,
          percent,
        },
      });

      if (items.length > 0) {
        await tx.lessonTestSubmissionAnswer.createMany({
          data: items.map((it) => ({
            submissionId: sub.id,
            quizId: it.quizId,
            selectedChoiceIds: it.selectedChoiceIds,
            isCorrect: it.isCorrect,
            pointsEarned: it.pointsEarned,
          })),
        });
      }

      return sub;
    });

    let certificatePayload: {
      isCompletedCourse: boolean;
      certificateId: string | null;
      certificateCode: string | null;
      courseScore: number | null;
      courseScoreTotal: number | null;
    } = {
      isCompletedCourse: false,
      certificateId: null,
      certificateCode: null,
      courseScore: null,
      courseScoreTotal: null,
    };

    if (percent >= MIN_PASS_PERCENT_FOR_CERTIFICATE) {
      try {
        const allCourseTestsPassed = await this.areAllCourseLessonTestsPassed(userId, lessonId);
        if (allCourseTestsPassed) {
          const issueResult = await courseClient.tryIssueCourseCompletionCertificate(userId, lessonId);
          certificatePayload = {
            isCompletedCourse: issueResult.isNewlyCompletedCourse,
            certificateId: issueResult.certificateId,
            certificateCode: issueResult.certificateCode,
            courseScore: issueResult.courseScore,
            courseScoreTotal: issueResult.courseScoreTotal,
          };
        }
      } catch (error) {
        Logger.error(`Failed to try issue certificate after lesson test submit: ${error}`);
      }
    }

    const answersRevealed = this.shouldRevealAnswers(percent);

    return {
      submissionId: submission.id,
      lessonId,
      summary: {
        earnedPoints,
        maxPoints,
        percent,
      },
      answersRevealed,
      items: this.toStudentResponseItems(items, answersRevealed),
      chunks: lesson.chunks,
      subtitles: lesson.subtitles,
      ...certificatePayload,
    };
  }

  /**
   * Past attempts for this learner on this lesson (newest first).
   * Requires lesson approved for student; does not require the test to stay published.
   */
  async listStudentSubmissions(lessonId: string, userId: string) {
    await this.assertLessonApprovedForStudent(lessonId);

    const rows = await prismaService.lessonTestSubmission.findMany({
      where: { lessonId, userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        earnedPoints: true,
        maxPoints: true,
        percent: true,
      },
    });

    return rows.map((r) => ({
      submissionId: r.id,
      submittedAt: r.createdAt.toISOString(),
      summary: {
        earnedPoints: r.earnedPoints,
        maxPoints: r.maxPoints,
        percent: r.percent,
      },
      answersRevealed: this.shouldRevealAnswers(r.percent),
    }));
  }

  private parseStoredChoiceIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is string => typeof x === 'string');
  }

  private shouldRevealAnswers(percent: number): boolean {
    return percent >= MIN_PASS_PERCENT_FOR_CERTIFICATE;
  }

  /**
   * True when every lesson in the course that has a published gradable test
   * has a best submission at or above the pass threshold (50%).
   */
  private async areAllCourseLessonTestsPassed(userId: string, lessonId: string): Promise<boolean> {
    const courseLessonIds = await courseClient.getCourseLessonIdsByLessonId(lessonId);
    if (courseLessonIds.length === 0) {
      return false;
    }

    const rows = await lessonTestEligibilityService.batchGetEligibility(
      userId,
      courseLessonIds,
      MIN_PASS_PERCENT_FOR_CERTIFICATE
    );

    return rows.every((row) => !row.hasPublishedTest || row.passed);
  }

  private toStudentResponseItems<T extends { correctChoiceIds?: string[]; explanation?: string }>(
    items: T[],
    answersRevealed: boolean
  ): T[] {
    if (answersRevealed) return items;
    return items.map(({ correctChoiceIds: _c, explanation: _e, ...rest }) => rest as T);
  }

  /**
   * Full review for one stored submission: ownership + lesson scoped, with question/choice snapshots from DB.
   */
  async getStudentSubmissionDetail(lessonId: string, userId: string, submissionId: string) {
    await this.assertLessonApprovedForStudent(lessonId);

    const lesson = await prismaService.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chunks: {
          orderBy: { chunkIndex: 'asc' },
          select: {
            id: true,
            chunkIndex: true,
            title: true,
            summary: true,
            timestamp: true,
            startTime: true,
            endTime: true,
            sentenceCount: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài học');
    }

    const submission = await prismaService.lessonTestSubmission.findFirst({
      where: { id: submissionId, lessonId, userId },
      include: { answers: true },
    });

    if (!submission) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài nộp');
    }

    const bundle = await lessonTestService.getLessonTestBundle(lessonId);
    if (!bundle) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không có bài kiểm tra cho bài học này');
    }

    const rawQuizzes = await this.loadGradableQuizzes(lessonId);
    const orderedQuizzes = this.orderQuizzesForLesson(bundle.chunkGroups, rawQuizzes);
    const orderedIds = new Set(orderedQuizzes.map((q) => q.id));

    const answerByQuiz = new Map(submission.answers.map((a) => [a.quizId, a]));
    const orphanQuizIds = submission.answers
      .map((a) => a.quizId)
      .filter((id) => !orderedIds.has(id));

    const orphanQuizzes: QuizWithChoicesAndGroup[] = [];
    if (orphanQuizIds.length > 0) {
      const extras = await prismaService.quiz.findMany({
        where: {
          id: { in: orphanQuizIds },
          quizScope: QuizScope.LESSON_TEST,
          lessonTestChunkGroup: { is: { lessonId } },
        },
        include: {
          choices: true,
          lessonTestChunkGroup: { select: { id: true, createdAt: true } },
        },
      });
      extras.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      orphanQuizzes.push(...extras);
    }

    const buildItem = (quiz: QuizWithChoicesAndGroup) => {
      const ans = answerByQuiz.get(quiz.id);
      if (!ans) return null;

      const choicesOrdered = [...quiz.choices].sort((a, b) => a.order - b.order);
      const correctChoiceIds = choicesOrdered.filter((c) => c.isCorrect).map((c) => c.id);
      const selectedChoiceIds = this.parseStoredChoiceIds(ans.selectedChoiceIds);

      return {
        quizId: quiz.id,
        isCorrect: ans.isCorrect,
        pointsEarned: ans.pointsEarned,
        maxPoints: 1,
        selectedChoiceIds,
        correctChoiceIds,
        explanation: quiz.explanation,
        question: quiz.question,
        type: quiz.type,
        difficulty: quiz.difficulty,
        bloomLevel: quiz.bloomLevel,
        choices: choicesOrdered.map((c) => ({ id: c.id, text: c.text })),
        chunkId: quiz.chunkId,
      };
    };

    const items: NonNullable<ReturnType<typeof buildItem>>[] = [];
    for (const q of orderedQuizzes) {
      const row = buildItem(q);
      if (row) items.push(row);
    }
    for (const q of orphanQuizzes) {
      const row = buildItem(q);
      if (row) items.push(row);
    }

    const answersRevealed = this.shouldRevealAnswers(submission.percent);

    return {
      submissionId: submission.id,
      lessonId,
      submittedAt: submission.createdAt.toISOString(),
      summary: {
        earnedPoints: submission.earnedPoints,
        maxPoints: submission.maxPoints,
        percent: submission.percent,
      },
      answersRevealed,
      items: this.toStudentResponseItems(items, answersRevealed),
      chunks: lesson.chunks,
      subtitles: lesson.subtitles,
    };
  }
}

export default new LessonTestStudentService();
