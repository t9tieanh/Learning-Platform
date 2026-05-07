import { LessonChatMessageRole } from '@prisma/client';
import Logger from '~/utils/logger';
import prismaService from '~/service/utils/prisma.service';
import { EmbeddingE5Service } from '~/service/embedding/embeddingE5.service';
import { lessonChatMessageRoleDisplayLabel } from '~/utils/lessonChatMessageRole.labels';

export interface LessonChatSemanticHit {
    id: string;
    role: LessonChatMessageRole;
    content: string;
    similarity: number;
}

/**
 * Embedding-based retrieval of lesson chat messages within one session (mirrors chunk RPC pattern).
 */
export class LessonChatSemanticSearchService {
    private static readonly SEMANTIC_RECALL_CONTENT_MAX_CHARS = 2500;

    constructor(
        private readonly embeddingService: EmbeddingE5Service = new EmbeddingE5Service()
    ) {}

    async searchRelatedMessages(
        sessionId: string,
        question: string,
        limit: number = 5
    ): Promise<LessonChatSemanticHit[]> {
        const queryEmbedding = await this.embeddingService.embedQuery(question);
        if (!queryEmbedding?.length) {
            return [];
        }

        try {
            const rows = await prismaService.$queryRaw<
                Array<{
                    message_id: string;
                    role: string;
                    content: string;
                    similarity: number;
                }>
            >`
                SELECT message_id, role, content, similarity
                FROM search_lesson_chat_messages_by_embedding_v1(
                    ${sessionId},
                    ${queryEmbedding}::vector(768),
                    ${limit}::int
                )
            `;

            const maxLen =
                LessonChatSemanticSearchService.SEMANTIC_RECALL_CONTENT_MAX_CHARS;
            return rows.map((row) => ({
                id: row.message_id,
                role: row.role as LessonChatMessageRole,
                content: this.truncateForPrompt(row.content, maxLen),
                similarity: Number(row.similarity),
            }));
        } catch (error) {
            Logger.error(
                `[LessonChatSemanticSearchService] searchRelatedMessages failed – ${error}`
            );
            return [];
        }
    }

    /** Vietnamese-labeled excerpts for the RAG user prompt */
    formatHitsForPrompt(hits: LessonChatSemanticHit[]): string {
        if (hits.length === 0) {
            return '';
        }
        return hits
            .map((hit) => {
                const label = lessonChatMessageRoleDisplayLabel(hit.role);
                return `[${label}] (semantic match): ${hit.content.trim()}`;
            })
            .join('\n\n');
    }

    private truncateForPrompt(text: string, maxChars: number): string {
        const t = text.trim();
        if (t.length <= maxChars) {
            return t;
        }
        return `${t.slice(0, maxChars)}\n[... truncated]`;
    }
}

export const lessonChatSemanticSearchService = new LessonChatSemanticSearchService();
