import { Request, Response, NextFunction } from 'express';
import { searchService, SearchChunkResult } from '~/service/search/search.service';
import sendResponse from '~/dto/response/send-response';
import { StatusCodes } from 'http-status-codes';

export class SearchController {
    /**
     * Search for lesson chunks semantically similar to a user query.
     *
     * Request body:
     * {
     *   "lessonId": "UUID",
     *   "query": "User's question or search text",
     *   "limit": 5 (optional, default 5, max 20)
     * }
     *
     * Response:
     * {
     *   "code": 200,
     *   "message": "Search completed successfully",
     *   "result": [
     *     {
     *       "id": "chunk-id",
     *       "lessonId": "lesson-id",
     *       "content": "Chunk text content",
     *       "title": "Chunk title",
     *       "summary": "Chunk summary",
     *       "chunkIndex": 0,
     *       "similarity": 0.95
     *     }
     *   ]
     * }
     */
    searchChunks = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { lessonId, query, limit } = req.data;

            const results: SearchChunkResult[] = await searchService.searchChunks(
                lessonId,
                query,
                limit
            );

            sendResponse(res, {
                code: StatusCodes.OK,
                message: 'Search completed successfully',
                result: results,
            });
        } catch (error) {
            next(error);
        }
    };
}

export const searchController = new SearchController();
