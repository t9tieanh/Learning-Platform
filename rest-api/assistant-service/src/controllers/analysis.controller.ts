import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import sendResponse from '~/dto/response/send-response'
import analysisService from '~/service/analysis/analysis.service'
import { AnalysisOutcome } from '~/enums/analysisOutcome.enum'
import { RAGResult, lessonRAGService } from '~/service/search/lesson.rag.service'

class AnalysisController {
    /**
     * GET /lessons/:lessonId/analysis
     *
     * Thin HTTP adapter — delegates all long-polling logic to AnalysisService.
     * Creates an AbortController so the service can clean up if the client disconnects.
     */
    getAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const lessonId = String(req.params.lessonId)

        try {
            const abort = new AbortController()
            req.on('close', () => abort.abort())

            const result = await analysisService.waitForAnalysis(lessonId, abort.signal)

            switch (result.outcome) {
                case AnalysisOutcome.NOT_FOUND:
                    sendResponse(res, {
                        code: StatusCodes.OK,
                        message: `Bài học chưa được xử lý trong hệ thống`,
                        result: null,
                    })
                    break

                case AnalysisOutcome.COMPLETED:
                    sendResponse(res, {
                        code: StatusCodes.OK,
                        message: 'Phân tích nội dung hoàn tất',
                        result: result.data,
                    })
                    break

                case AnalysisOutcome.PROCESSING:
                    sendResponse(res, {
                        code: StatusCodes.ACCEPTED,
                        message: 'Nội dung đang được phân tích, vui lòng thử lại sau',
                        result: result.data,
                    })
                    break

                case AnalysisOutcome.ABORTED:
                    // Client ngắt kết nối — không cần gửi response
                    break
            }
        } catch (error) {
            next(error)
        }
    }

    /**
     * PATCH /lessons/:lessonId/chunks/:chunkId/summary
     */
    updateChunkSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const chunkId = String(req.params.chunkId)
            const { summary } = req.body

            const updatedChunk = await analysisService.updateChunkSummary(chunkId, summary)

            sendResponse(res, {
                code: StatusCodes.OK,
                message: 'Cập nhật tóm tắt thành công',
                result: updatedChunk
            })
        } catch (error) {
            next(error)
        }
    }


    /**
     * Answer a question about lesson content using RAG (Retrieval-Augmented Generation).
     *
     * Request:
     * POST /lessons/:lessonId/chat
     * Body: { "question": "User's question about the lesson" }
     *
     * Response:
     * {
     *   "code": 200,
     *   "message": "Answer generated successfully",
     *   "result": {
     *     "answer": "LLM-generated answer based on lesson content",
     *     "sources": [
     *       {
     *         "chunkId": "chunk-id",
     *         "title": "Chunk title",
     *         "chunkIndex": 0,
     *         "similarity": 0.95
     *       }
     *     ]
     *   }
     * }
     */
    answerQuestion = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const lessonId = String(req.params.lessonId);
            const { question } = req.data;

            const result: RAGResult = await lessonRAGService.answerQuestion(lessonId, question);

            sendResponse(res, {
                code: StatusCodes.OK,
                message: 'Answer generated successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new AnalysisController()
