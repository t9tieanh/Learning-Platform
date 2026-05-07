import type {
    RAGSource,
    LessonChatMessageItemDto,
    LessonChatSessionListItemDto,
} from '@/services/assistant/analysis.service'

import type { LessonAiChatMessage } from '@/types/lesson-ai-chat.type'

export function formatSessionPickLabel(row: LessonChatSessionListItemDto): string {
    const d = new Date(row.updatedAt)
    const dateStr = Number.isFinite(d.getTime())
        ? d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })
        : '—'
    return `${dateStr} · ${row.messageCount} tin nhắn`
}

export function mapLessonChatHistoryToUi(rows: LessonChatMessageItemDto[]): LessonAiChatMessage[] {
    return rows
        .filter((m) => m.role === 'USER' || m.role === 'ASSISTANT')
        .map((m) => {
            const md = m.metadata
            const sources =
                m.role === 'ASSISTANT' &&
                md &&
                typeof md === 'object' &&
                Array.isArray((md as { sources?: RAGSource[] }).sources)
                    ? (md as { sources: RAGSource[] }).sources
                    : undefined
            return {
                id: m.id,
                role: m.role === 'USER' ? 'user' : 'assistant',
                content: m.content,
                sources,
            }
        })
}
