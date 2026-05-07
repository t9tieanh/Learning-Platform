import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import sendResponse from '~/dto/response/send-response'
import analysisService from '~/service/analysis/analysis.service'
import { AnalysisOutcome } from '~/enums/analysisOutcome.enum'
import { RAGResult, lessonRAGService } from '~/service/search/lesson.rag.service'
import { CHATBOT_ERROR_MESSAGE } from '~/utils/constants'
import lessonChatPersistenceService from '~/service/lesson-chat/lessonChat.persistence.service'
import { lessonChatQueryService } from '~/service/lesson-chat/lessonChat.query.service'
import { RAGQuestionRequest } from '~/dto/request/ragQuestion.dto'
import ApiError from '~/middleware/ApiError'
import Logger from '~/utils/logger'

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

                case AnalysisOutcome.FAILED:
                    const failedResult = await analysisService.getLessonAnalysis(lessonId)
                    sendResponse(res, {
                        code: StatusCodes.OK,
                        message: `Bài học không đạt yêu cầu: ${result.reason}`,
                        result: failedResult,
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
     * GET /lessons/:lessonId/detail
     *
     * Directly returns the complete AI intelligence bundle for a lesson.
     * Unlike the main /analysis endpoint, this does not long-poll; it simply returns
     * what's currently in the DB or null if not processed.
     */
    getLessonIntelligence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const lessonId = String(req.params.lessonId)
            const result = await analysisService.getLessonAnalysis(lessonId)

            if (!result) {
                sendResponse(res, {
                    code: StatusCodes.OK,
                    message: 'Bài học chưa có dữ liệu phân tích AI',
                    result: null,
                })
                return
            }

            sendResponse(res, {
                code: StatusCodes.OK,
                message: 'Lấy thông tin AI hoàn tất',
                result,
            })
        } catch (error) {
            sendResponse(res, {
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                message: CHATBOT_ERROR_MESSAGE,
                result: null
            })
        }
    }

    /**
     * Answer a question about lesson content using RAG (Retrieval-Augmented Generation).
     *
     * Request:
     * POST /lessons/:lessonId/chat
     * Body: `{ "question": string, "sessionId"?: string }`
     *
     * Response `result`: RAG payload (answer, sources) and `sessionId`.
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
     *     ],
     *     "sessionId": "<uuid>"
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
            const { question, sessionId } = req.data as RAGQuestionRequest;
            const userId = String(req.user?.sub);

            const activeSessionId = await lessonChatPersistenceService.ensureSession(
                lessonId,
                userId,
                sessionId
            );

            const result: RAGResult = await lessonRAGService.answerQuestion(
                lessonId,
                question,
                activeSessionId
            );

            await lessonChatPersistenceService.appendMessages(
                activeSessionId,
                question,
                result
            );
            sendResponse(res, {
                code: StatusCodes.OK,
                message: 'Answer generated successfully',
                result: { ...result, sessionId: activeSessionId },
            });
        } catch (error) {
            if (error instanceof ApiError) {
                sendResponse(res, {
                    code: error.status,
                    message: error.message,
                    result: null,
                });
                return;
            }
            Logger.error(`[AnalysisController.answerQuestion] Error answering question – ${error}`);
            sendResponse(res, {
                code: StatusCodes.OK,
                message: CHATBOT_ERROR_MESSAGE,
                result: null,
            });
        }
    };

    /** GET .../chat/sessions */
    listLessonChatSessions = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const lessonId = String(req.params.lessonId);
            const userId = String(req.user?.sub);
            const result = await lessonChatQueryService.listSessionsForUser(
                lessonId,
                userId
            );
            sendResponse(res, {
                code: StatusCodes.OK,
                message: 'OK',
                result,
            });
        } catch (error) {
            Logger.error(`[AnalysisController.listLessonChatSessions] ${error}`);
            sendResponse(res, {
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                message: CHATBOT_ERROR_MESSAGE,
                result: null,
            });
        }
    };

    /** GET .../chat/sessions/:sessionId/messages */
    getLessonChatMessages = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const lessonId = String(req.params.lessonId);
            const sessionId = String(req.params.sessionId);
            const userId = String(req.user?.sub);
            const result = await lessonChatQueryService.getMessagesForSession(
                sessionId,
                lessonId,
                userId
            );
            sendResponse(res, {
                code: StatusCodes.OK,
                message: 'OK',
                result,
            });
        } catch (error) {
            if (error instanceof ApiError) {
                sendResponse(res, {
                    code: error.status,
                    message: error.message,
                    result: null,
                });
                return;
            }
            Logger.error(`[AnalysisController.getLessonChatMessages] ${error}`);
            sendResponse(res, {
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                message: CHATBOT_ERROR_MESSAGE,
                result: null,
            });
        }
    };

    /** POST .../chat/sessions — empty thread */
    createLessonChatSession = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const lessonId = String(req.params.lessonId);
            const userId = String(req.user?.sub);
            const sessionId = await lessonChatPersistenceService.createEmptySession(
                lessonId,
                userId
            );
            sendResponse(res, {
                code: StatusCodes.CREATED,
                message: 'Session created',
                result: { sessionId },
            });
        } catch (error) {
            Logger.error(`[AnalysisController.createLessonChatSession] ${error}`);
            sendResponse(res, {
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                message: CHATBOT_ERROR_MESSAGE,
                result: null,
            });
        }
    };
}

export default new AnalysisController()
