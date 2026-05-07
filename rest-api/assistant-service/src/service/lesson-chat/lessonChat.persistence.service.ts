import { LessonChatMessageRole, Prisma } from '@prisma/client';
import prismaService from '~/service/utils/prisma.service';
import { EmbeddingE5Service } from '~/service/embedding/embeddingE5.service';
import Logger from '~/utils/logger';
import ApiError from '~/middleware/ApiError';
import { StatusCodes } from 'http-status-codes';
import type { RAGResult } from '~/service/search/lesson.rag.service';

export class LessonChatPersistenceService {
    constructor(private readonly embeddingService: EmbeddingE5Service = new EmbeddingE5Service()) {}

    /**
     * Validates an existing session, or reuses the latest (lessonId + userId), or creates one.
     */
    async ensureSession(
        lessonId: string,
        userId: string,
        sessionId?: string | null
    ): Promise<string> {
        if (sessionId) {
            const existing = await prismaService.lessonChatSession.findFirst({
                where: { id: sessionId, lessonId, userId },
                select: { id: true },
            });
            if (!existing) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    'Phiên chat không hợp lệ hoặc không thuộc bài học này.'
                );
            }
            await prismaService.lessonChatSession.update({
                where: { id: sessionId },
                data: { updatedAt: new Date() },
            });
            return existing.id;
        }

        // Reuse latest session for this user+lesson so multi-turn works when the client omits sessionId
        const latest = await prismaService.lessonChatSession.findFirst({
            where: { lessonId, userId },
            orderBy: { updatedAt: 'desc' },
            select: { id: true },
        });
        if (latest) {
            await prismaService.lessonChatSession.update({
                where: { id: latest.id },
                data: { updatedAt: new Date() },
            });
            return latest.id;
        }

        const session = await prismaService.lessonChatSession.create({
            data: { lessonId, userId },
        });
        return session.id;
    }

    /**
     * Persists USER + ASSISTANT messages with embeddings awaited on the main request thread.
     * Uses Promise.all so the two branches (embed + write + vector update each) run concurrently.
     */
    async appendMessages(
        sessionId: string,
        question: string,
        ragResult: RAGResult
    ): Promise<void> {
        const [userEmb, assistantEmb] = await Promise.all([
            this.embeddingService.embedPassage(question),
            this.embeddingService.embedPassage(ragResult.answer),
        ]);

        try {
            await Promise.all([
                this.createMessageAndEmbedding(
                    sessionId,
                    LessonChatMessageRole.USER,
                    question,
                    undefined,
                    userEmb
                ),
                this.createMessageAndEmbedding(
                    sessionId,
                    LessonChatMessageRole.ASSISTANT,
                    ragResult.answer,
                    { sources: ragResult.sources } as Prisma.InputJsonValue,
                    assistantEmb
                ),
            ]);
        } catch (error) {
            Logger.error(`[LessonChatPersistenceService.appendMessages] failed – ${error}`);
            throw error;
        }
    }

    private async createMessageAndEmbedding(
        sessionId: string,
        role: LessonChatMessageRole,
        content: string,
        metadata: Prisma.InputJsonValue | undefined,
        embedding: number[] | null
    ): Promise<void> {
        const msg = await prismaService.lessonChatMessage.create({
            data: {
                sessionId,
                role,
                content,
                ...(metadata !== undefined ? { metadata } : {}),
            },
        });
        if (embedding) {
            await this.persistMessageEmbedding(msg.id, embedding);
        }
    }

    private async persistMessageEmbedding(messageId: string, vector: number[]): Promise<void> {
        await prismaService.$executeRaw`
            UPDATE "lesson_chat_messages"
            SET embedding = ${vector}::vector(768)
            WHERE id = ${messageId}
        `;
    }
}

export default new LessonChatPersistenceService();
