import { LessonTestStatus, Prisma } from '@prisma/client';
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

  parseStoredChunkIds(chunkIdsJson: unknown): string[] {
    return lessonTestMergedContextService.parseChunkIds(chunkIdsJson);
  }
}

export default new LessonTestService();
