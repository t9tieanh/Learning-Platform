import type { RAGSource } from '@/services/assistant/analysis.service'

/** Một bubble tin trong sidebar hỏi đáp AI theo bài học */
export interface LessonAiChatMessage {
    role: 'user' | 'assistant'
    content: string
    sources?: RAGSource[]
    id: string
}

export interface AIChatSectionProps {
    lessonId: string
    lessonType?: 'video' | 'article'
    onSeek?: (timestamp: string) => void
    /** When false (e.g. another sidebar tab visible), skips network refreshes until true */
    isTabVisible?: boolean
    subtitlesRaw?: string | null
}
