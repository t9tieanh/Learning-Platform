import { LessonTestStatus, Prisma, QuizScope } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/middleware/ApiError';
import prismaService from '~/service/utils/prisma.service';
import Logger from '~/utils/logger';
import lessonTestMergedContextService from '~/service/lessonTest/lessonTestMergedContext.service';

const MAX_CHUNKS_PER_GROUP = 3;

export class LessonTestService {
  async getLessonTestBundle(lessonId: string) {
    const lessonTest = await prismaService.lessonTest.findUnique({
      where: { lessonId },
      include: { chunkGroups: { orderBy: { createdAt: 'asc' } } },
    });
    return lessonTest;
  }

  async assertLessonTestPublishable(lessonId: string): Promise<void> {
    const bundle = await this.getLessonTestBundle(lessonId);
    if (!bundle) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson test blueprint not found');
    }
    if (bundle.chunkGroups.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cần ít nhất một nhóm nội dung trước khi xuất bản bài kiểm tra.'
      );
    }
    const groupIds = bundle.chunkGroups.map((g) => g.id);
    const counts = await prismaService.quiz.groupBy({
      by: ['lessonTestChunkGroupId'],
      where: {
        lessonTestChunkGroupId: { in: groupIds },
        quizScope: QuizScope.LESSON_TEST,
      },
      _count: { _all: true },
    });
    const countByGroup = new Map(
      counts
        .filter((c): c is typeof c & { lessonTestChunkGroupId: string } => c.lessonTestChunkGroupId != null)
        .map((c) => [c.lessonTestChunkGroupId, c._count._all])
    );
    for (const g of bundle.chunkGroups) {
      const n = countByGroup.get(g.id) ?? 0;
      if (n < 1) {
        const label = g.label?.trim() || 'Một nhóm nội dung';
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Chưa thể xuất bản: « ${label} » chưa có câu hỏi. Hãy sinh câu hoặc kiểm tra lại nhóm.`
        );
      }
    }
  }

  async upsertLessonTestHeader(
    lessonId: string,
    userId: string,
    body: {
      title?: string | null;
      status?: LessonTestStatus;
      targetTotalQuestions?: number | null;
      notes?: string | null;
    }
  ) {
    if (body.status === LessonTestStatus.PUBLISHED) {
      await this.assertLessonTestPublishable(lessonId);
    }
    return prismaService.lessonTest.upsert({
      where: { lessonId },
      create: {
        lessonId,
        createdBy: userId,
        title: body.title ?? null,
        status: body.status ?? LessonTestStatus.DRAFT,
        targetTotalQuestions: body.targetTotalQuestions ?? null,
        notes: body.notes ?? null,
      },
      update: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.targetTotalQuestions !== undefined
          ? { targetTotalQuestions: body.targetTotalQuestions }
          : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
    });
  }

  async ensureLessonTestRow(lessonId: string, userId: string) {
    const existing = await prismaService.lessonTest.findUnique({ where: { lessonId } });
    if (existing) return existing;
    return prismaService.lessonTest.create({
      data: {
        lessonId,
        createdBy: userId,
        status: LessonTestStatus.DRAFT,
      },
    });
  }

  async deleteLessonTest(lessonId: string) {
    await prismaService.lessonTest.deleteMany({ where: { lessonId } });
    Logger.info(`[LessonTestService] Deleted lesson test lessonId=${lessonId}`);
  }

  async validateChunksBelongToLesson(lessonId: string, chunkIds: string[]): Promise<void> {
    const unique = [...new Set(chunkIds)];
    const rows = await prismaService.lessonChunk.findMany({
      where: { lessonId, id: { in: unique } },
      select: { id: true },
    });
    if (rows.length !== unique.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'One or more chunkIds are invalid for this lesson');
    }
  }

  async createChunkGroup(
    lessonId: string,
    userId: string,
    input: {
      chunkIds: string[];
      questionCount: number;
      label?: string | null;
      distribution?: Prisma.InputJsonValue | null;
      batchUserPrompt?: string | null;
    }
  ) {
    if (input.chunkIds.length === 0 || input.chunkIds.length > MAX_CHUNKS_PER_GROUP) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `chunkIds must have 1–${MAX_CHUNKS_PER_GROUP} entries`
      );
    }
    if (input.questionCount < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'questionCount must be at least 1');
    }

    await this.validateChunksBelongToLesson(lessonId, input.chunkIds);

    await this.ensureLessonTestRow(lessonId, userId);

    return prismaService.lessonTestChunkGroup.create({
      data: {
        lessonId,
        chunkIds: input.chunkIds,
        questionCount: input.questionCount,
        label: input.label ?? null,
        distribution:
          input.distribution === undefined ? undefined : (input.distribution as Prisma.InputJsonValue),
        batchUserPrompt: input.batchUserPrompt ?? null,
      },
    });
  }

  async updateChunkGroup(
    lessonId: string,
    groupId: string,
    patch: {
      chunkIds?: string[];
      questionCount?: number;
      label?: string | null;
      distribution?: Prisma.InputJsonValue | null;
      batchUserPrompt?: string | null;
    }
  ) {
    const existing = await prismaService.lessonTestChunkGroup.findFirst({
      where: { id: groupId, lessonId },
    });
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Chunk group not found');
    }

    if (patch.chunkIds !== undefined) {
      if (patch.chunkIds.length === 0 || patch.chunkIds.length > MAX_CHUNKS_PER_GROUP) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `chunkIds must have 1–${MAX_CHUNKS_PER_GROUP} entries`
        );
      }
      await this.validateChunksBelongToLesson(lessonId, patch.chunkIds);
    }

    if (patch.questionCount !== undefined && patch.questionCount < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'questionCount must be at least 1');
    }

    return prismaService.lessonTestChunkGroup.update({
      where: { id: groupId },
      data: {
        ...(patch.chunkIds !== undefined ? { chunkIds: patch.chunkIds } : {}),
        ...(patch.questionCount !== undefined ? { questionCount: patch.questionCount } : {}),
        ...(patch.label !== undefined ? { label: patch.label } : {}),
        ...(patch.distribution !== undefined
          ? { distribution: patch.distribution as Prisma.InputJsonValue }
          : {}),
        ...(patch.batchUserPrompt !== undefined ? { batchUserPrompt: patch.batchUserPrompt } : {}),
      },
    });
  }

  async deleteChunkGroup(lessonId: string, groupId: string) {
    const existing = await prismaService.lessonTestChunkGroup.findFirst({
      where: { id: groupId, lessonId },
    });
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Chunk group not found');
    }
    await prismaService.lessonTestChunkGroup.delete({ where: { id: groupId } });
  }

  async assertChunkGroupExists(lessonId: string, groupId: string) {
    const row = await prismaService.lessonTestChunkGroup.findFirst({
      where: { id: groupId, lessonId },
    });
    if (!row) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Chunk group not found');
    }
    return row;
  }

  async getExamBlueprintStats(lessonId: string) {
    const lessonTest = await prismaService.lessonTest.findUnique({
      where: { lessonId },
      include: {
        chunkGroups: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!lessonTest) return null;

    const allChunks = await prismaService.lessonChunk.findMany({
      where: { lessonId },
    });
    const chunkMap = new Map(allChunks.map((c) => [c.id, c]));

    const quizCounts = await prismaService.quiz.groupBy({
      by: ['lessonTestChunkGroupId'],
      where: {
        lessonTestChunkGroup: { lessonId },
        quizScope: QuizScope.LESSON_TEST,
      },
      _count: { _all: true },
    });
    const countMap = new Map(
      quizCounts
        .filter((c): c is typeof c & { lessonTestChunkGroupId: string } => c.lessonTestChunkGroupId != null)
        .map((c) => [c.lessonTestChunkGroupId, c._count._all])
    );

    let globalIndex = 1;
    const matrix = lessonTest.chunkGroups.map((group, idx) => {
      const count = countMap.get(group.id) ?? 0;
      const start = globalIndex;
      const end = globalIndex + count - 1;
      const questionRange =
        count > 0 ? (count === 1 ? `Câu ${start}` : `Câu ${start} - ${end}`) : '—';

      globalIndex += count;

      const chunkIds = this.parseStoredChunkIds(group.chunkIds);
      const chunks = chunkIds
        .map((id) => chunkMap.get(id))
        .filter((c) => !!c)
        .map((c) => ({
          id: c!.id,
          chunkIndex: c!.chunkIndex,
          title: c!.title,
          summary: c!.summary,
          timestamp: c!.timestamp,
          startTime: c!.startTime,
          endTime: c!.endTime,
        }));

      return {
        id: group.id,
        label: group.label?.trim() || `Nhóm nội dung ${idx + 1}`,
        questionRange,
        hasQuizzes: count > 0,
        chunks,
      };
    });

    const generatedTotal = Array.from(countMap.values()).reduce((a, b) => a + b, 0);

    return {
      lessonId,
      targetTotalQuestions: lessonTest.targetTotalQuestions,
      generatedTotalQuestions: generatedTotal,
      matrix,
    };
  }

  async getLessonChunks(lessonId: string) {
    return prismaService.lessonChunk.findMany({
      where: { lessonId },
      orderBy: { chunkIndex: 'asc' },
    });
  }

  parseStoredChunkIds(chunkIdsJson: unknown): string[] {
    return lessonTestMergedContextService.parseChunkIds(chunkIdsJson);
  }
}

export default new LessonTestService();
