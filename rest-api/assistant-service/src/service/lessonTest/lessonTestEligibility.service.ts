import {
  LessonTestStatus,
  QuestionType,
  QuizScope,
  QuizStatus,
} from '@prisma/client';
import prismaService from '~/service/utils/prisma.service';

const GRADABLE_TYPES: QuestionType[] = [QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE];

export type LessonTestEligibilityRow = {
  lessonId: string;
  hasPublishedTest: boolean;
  bestPercent: number;
  passed: boolean;
  bestEarnedPoints: number;
  maxPoints: number;
};

type BestSubmission = {
  percent: number;
  earnedPoints: number;
  maxPoints: number;
};

export class LessonTestEligibilityService {
  private buildNoTestRow(lessonId: string): LessonTestEligibilityRow {
    return {
      lessonId,
      hasPublishedTest: false,
      bestPercent: -1,
      passed: true,
      bestEarnedPoints: 0,
      maxPoints: 0,
    };
  }

  private buildRow(
    lessonId: string,
    minPassPercent: number,
    maxPoints: number,
    best?: BestSubmission
  ): LessonTestEligibilityRow {
    const bestPercent = best?.percent ?? -1;
    return {
      lessonId,
      hasPublishedTest: true,
      bestPercent,
      passed: bestPercent >= minPassPercent,
      bestEarnedPoints: best?.earnedPoints ?? 0,
      maxPoints: best?.maxPoints ?? maxPoints,
    };
  }

  async getLessonEligibility(
    lessonId: string,
    userId: string,
    minPassPercent: number
  ): Promise<LessonTestEligibilityRow> {
    const [row] = await this.batchGetEligibility(userId, [lessonId], minPassPercent);
    return row ?? this.buildNoTestRow(lessonId);
  }

  async batchGetEligibility(
    userId: string,
    lessonIds: string[],
    minPassPercent: number
  ): Promise<LessonTestEligibilityRow[]> {
    const uniqueIds = [...new Set(lessonIds.filter((id) => id && id.trim()))];
    if (uniqueIds.length === 0) {
      return [];
    }

    const publishedTests = await prismaService.lessonTest.findMany({
      where: {
        lessonId: { in: uniqueIds },
        status: LessonTestStatus.PUBLISHED,
      },
      select: {
        lessonId: true,
        chunkGroups: { select: { id: true } },
      },
    });

    const chunkGroupToLesson = new Map<string, string>();
    const chunkGroupIds: string[] = [];
    for (const test of publishedTests) {
      for (const group of test.chunkGroups) {
        chunkGroupIds.push(group.id);
        chunkGroupToLesson.set(group.id, test.lessonId);
      }
    }

    const gradableCountByLesson = new Map<string, number>();
    if (chunkGroupIds.length > 0) {
      const quizCounts = await prismaService.quiz.groupBy({
        by: ['lessonTestChunkGroupId'],
        where: {
          lessonTestChunkGroupId: { in: chunkGroupIds },
          quizScope: QuizScope.LESSON_TEST,
          type: { in: GRADABLE_TYPES },
          status: QuizStatus.ACTIVE,
        },
        _count: { _all: true },
      });

      for (const row of quizCounts) {
        if (!row.lessonTestChunkGroupId) continue;
        const lessonId = chunkGroupToLesson.get(row.lessonTestChunkGroupId);
        if (!lessonId) continue;
        gradableCountByLesson.set(
          lessonId,
          (gradableCountByLesson.get(lessonId) ?? 0) + row._count._all
        );
      }
    }

    const lessonsWithTest = uniqueIds.filter((lessonId) => (gradableCountByLesson.get(lessonId) ?? 0) > 0);

    const bestByLesson = new Map<string, BestSubmission>();
    if (lessonsWithTest.length > 0) {
      const submissions = await prismaService.lessonTestSubmission.findMany({
        where: {
          userId,
          lessonId: { in: lessonsWithTest },
        },
        orderBy: [{ lessonId: 'asc' }, { percent: 'desc' }],
        select: {
          lessonId: true,
          percent: true,
          earnedPoints: true,
          maxPoints: true,
        },
      });

      for (const submission of submissions) {
        if (bestByLesson.has(submission.lessonId)) continue;
        bestByLesson.set(submission.lessonId, {
          percent: submission.percent,
          earnedPoints: submission.earnedPoints,
          maxPoints: submission.maxPoints,
        });
      }
    }

    return uniqueIds.map((lessonId) => {
      const maxPoints = gradableCountByLesson.get(lessonId) ?? 0;
      if (maxPoints <= 0) {
        return this.buildNoTestRow(lessonId);
      }
      return this.buildRow(lessonId, minPassPercent, maxPoints, bestByLesson.get(lessonId));
    });
  }
}

export default new LessonTestEligibilityService();
