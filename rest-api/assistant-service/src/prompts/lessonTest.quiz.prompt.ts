/**
 * Prompt copy specific to lesson-test **merged chunk-group** batch generation.
 * Used as the synthetic “chunk topic” line in batch quiz prompts (`QuizPrompts.buildBatchQuizPrompt`)
 * while merged chunk blocks are passed as chunk content.
 */
export class LessonTestQuizPrompts {
  /** Vietnamese instructions for multi-chunk merged context (passed as chunkSummary in batch flow). */
  static mergedChunkTopicVi(): string {
    return (
      'Đây là ngữ cảnh gộp từ một nhóm phần nội dung (lesson test). ' +
      'Mọi câu hỏi phải dựa trên toàn bộ MERGED CONTEXT — có thể liên quan nhiều phần được đánh dấu Chunk 1, Chunk 2, …'
    );
  }

  /** English variant if batch generation is switched to `en` later. */
  static mergedChunkTopicEn(): string {
    return (
      'This is merged context from a lesson-test chunk group. ' +
      'Every question must be grounded in the full MERGED CONTEXT — possibly spanning multiple sections labeled Chunk 1, Chunk 2, …'
    );
  }
}
