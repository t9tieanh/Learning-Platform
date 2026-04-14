import { LessonChunk } from '@prisma/client';
import { SearchChunkResult } from '~/service/search/search.service';

/**
 * SearchChunkResponseDto maps a Prisma LessonChunk and a similarity score
 * to the SearchChunkResult interface used by the RAG service.
 */
export class SearchChunkResponseDto implements SearchChunkResult {
    id: string;
    lessonId: string;
    content: string;
    title: string | null;
    summary: string | null;
    chunkIndex: number;
    startTime: string | null;
    endTime: string | null;
    timestamp: string | null;
    similarity: number;

    constructor(dbChunk: LessonChunk, similarity: number) {
        this.id = dbChunk.id;
        this.lessonId = dbChunk.lessonId;
        this.content = dbChunk.content;
        this.title = dbChunk.title;
        this.summary = dbChunk.summary;
        this.chunkIndex = dbChunk.chunkIndex;
        this.startTime = dbChunk.startTime;
        this.endTime = dbChunk.endTime;
        this.timestamp = dbChunk.timestamp;
        this.similarity = similarity;
    }

    /**
     * Optional static helper for array mapping
     */
    static fromEntity(dbChunk: LessonChunk, similarity: number): SearchChunkResponseDto {
        return new SearchChunkResponseDto(dbChunk, similarity);
    }
}
