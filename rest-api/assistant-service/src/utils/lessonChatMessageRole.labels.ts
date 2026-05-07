import { LessonChatMessageRole } from '@prisma/client';

/**
 * Prompt-facing Vietnamese labels keyed by {@link LessonChatMessageRole} (schema: prisma/schema.prisma).
 */
export const LESSON_CHAT_MESSAGE_ROLE_LABELS: Readonly<
    Record<LessonChatMessageRole, string>
> = {
    [LessonChatMessageRole.USER]: 'Học sinh',
    [LessonChatMessageRole.ASSISTANT]: 'Trợ lý',
    [LessonChatMessageRole.SYSTEM]: 'Hệ thống',
};

export function isLessonChatMessageRole(value: string): value is LessonChatMessageRole {
    return (Object.values(LessonChatMessageRole) as string[]).includes(value);
}

/**
 * Display string for chat transcript / RAG snippets. Unknown roles pass through verbatim.
 */
export function lessonChatMessageRoleDisplayLabel(role: string): string {
    if (isLessonChatMessageRole(role)) {
        return LESSON_CHAT_MESSAGE_ROLE_LABELS[role];
    }
    return role;
}
