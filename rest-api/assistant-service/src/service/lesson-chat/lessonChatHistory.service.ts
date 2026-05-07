import prismaService from '~/service/utils/prisma.service';
import { lessonChatMessageRoleDisplayLabel } from '~/utils/lessonChatMessageRole.labels';

/** Max chat messages pulled as verbatim recent context for RAG */
const DEFAULT_MAX_MESSAGES = 10;
/** Bound per-message size to limit prompt growth */
const MAX_CONTENT_CHARS_PER_MESSAGE = 2000;

export interface RecentTranscriptForRag {
    transcript: string;
    /** Message IDs included above (used to de-duplicate semantic recall) */
    messageIds: string[];
}

/**
 * Verbatim transcript for the current lesson chat session (avoids importing RAG types).
 */
export class LessonChatHistoryService {
    /**
     * Loads the newest `maxMessages`, ordered chronologically in the transcript.
     */
    async buildRecentTranscriptForRag(
        sessionId: string,
        maxMessages: number = DEFAULT_MAX_MESSAGES
    ): Promise<RecentTranscriptForRag> {
        const rows = await prismaService.lessonChatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
            take: maxMessages,
            select: { id: true, role: true, content: true },
        });

        if (rows.length === 0) {
            return { transcript: '', messageIds: [] };
        }

        const chronological = [...rows].reverse();
        const messageIds = chronological.map((r) => r.id);

        const transcript = chronological
            .map(({ role, content }) => {
                const label = lessonChatMessageRoleDisplayLabel(role);
                let text = content.trim();
                if (text.length > MAX_CONTENT_CHARS_PER_MESSAGE) {
                    text =
                        text.slice(0, MAX_CONTENT_CHARS_PER_MESSAGE) +
                        '\n[... truncated]';
                }
                return `[${label}]: ${text}`;
            })
            .join('\n\n');

        return { transcript, messageIds };
    }

    /**
     * Merges recent-turn text and embedding recall into one optional user-prompt block.
     */
    static composeSessionHistoryForPrompt(
        recentTranscript: string,
        semanticRecallTranscript: string
    ): string | undefined {
        const recent = recentTranscript.trim();
        const semantic = semanticRecallTranscript.trim();
        if (!recent && !semantic) {
            return undefined;
        }
        const parts: string[] = [];
        if (recent) {
            parts.push(`=== SESSION — RECENT TURNS ===\n${recent}`);
        }
        if (semantic) {
            parts.push(
                `=== SESSION — SEMANTIC RECALL (related to the current question) ===\n${semantic}`
            );
        }
        return parts.join('\n\n');
    }
}

export const lessonChatHistoryService = new LessonChatHistoryService();
