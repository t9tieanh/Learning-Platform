import { LessonChatMessageRole } from '@prisma/client';
import prismaService from '~/service/utils/prisma.service';
import ApiError from '~/middleware/ApiError';
import { StatusCodes } from 'http-status-codes';

export interface LessonChatSessionListItem {
    id: string;
    lessonId: string;
    title: string | null;
    summaryLast: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
}

export interface LessonChatMessageItem {
    id: string;
    role: LessonChatMessageRole;
    content: string;
    metadata: unknown | null;
    createdAt: Date;
}

/** Read-only helpers for lesson chat history APIs */
export class LessonChatQueryService {
    async listSessionsForUser(
        lessonId: string,
        userId: string
    ): Promise<LessonChatSessionListItem[]> {
        const rows = await prismaService.lessonChatSession.findMany({
            where: { lessonId, userId },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                lessonId: true,
                title: true,
                summaryLast: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
            },
        });

        return rows.map((r) => ({
            id: r.id,
            lessonId: r.lessonId,
            title: r.title,
            summaryLast: r.summaryLast,
            notes: (r as any).notes ?? null,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            messageCount: r._count.messages,
        }));
    }

    async getSessionDetail(sessionId: string, userId: string): Promise<LessonChatSessionListItem> {
        const r = await prismaService.lessonChatSession.findFirst({
            where: { id: sessionId, userId },
            select: {
                id: true,
                lessonId: true,
                title: true,
                summaryLast: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
            },
        });
        if (!r) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy phiên chat.');
        }
        return {
            id: r.id,
            lessonId: r.lessonId,
            title: r.title,
            summaryLast: r.summaryLast,
            notes: (r as any).notes ?? null,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            messageCount: r._count.messages,
        };
    }

    async getMessagesForSession(
        sessionId: string,
        lessonId: string,
        userId: string
    ): Promise<LessonChatMessageItem[]> {
        const session = await prismaService.lessonChatSession.findFirst({
            where: { id: sessionId, lessonId, userId },
            select: { id: true },
        });
        if (!session) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Không tìm thấy phiên chat hoặc bạn không có quyền truy cập.'
            );
        }

        const messages = await prismaService.lessonChatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                role: true,
                content: true,
                metadata: true,
                createdAt: true,
            },
        });

        return messages;
    }
}

export const lessonChatQueryService = new LessonChatQueryService();
