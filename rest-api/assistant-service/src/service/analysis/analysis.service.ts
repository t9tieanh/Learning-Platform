import prismaService from '~/service/utils/prisma.service'
import redisService from '~/service/utils/redis.service'
import Logger from '~/utils/logger'
import { toAnalysisResponseDto, AnalysisResponseDto, FullLessonWithIntelligence } from '~/dto/response/analysis-response.dto'
import { AnalysisOutcome } from '~/enums/analysisOutcome.enum'

/** Max ms to hold a long-poll subscription open */
const LONG_POLL_TIMEOUT_MS = 25_000

export type WaitResult =
    | { outcome: AnalysisOutcome.COMPLETED; data: AnalysisResponseDto }
    | { outcome: AnalysisOutcome.PROCESSING; data: AnalysisResponseDto }
    | { outcome: AnalysisOutcome.NOT_FOUND }
    | { outcome: AnalysisOutcome.ABORTED }

export class AnalysisService {
    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Fetches the AI analysis result for a lesson.
     * Returns null when the lesson is not found in the assistant-service DB.
     */
    async getLessonAnalysis(lessonId: string): Promise<AnalysisResponseDto | null> {
        const lesson = await prismaService.lesson.findUnique({
            where: { id: lessonId },
            include: {
                chunks: {
                    include: {
                        quizzes: {
                            include: {
                                choices: true
                            }
                        }
                    }
                }
            },
        }) as FullLessonWithIntelligence | null

        return lesson ? toAnalysisResponseDto(lesson) : null
    }

    /**
     * Updates the summary of a specific lesson chunk.
     */
    async updateChunkSummary(chunkId: string, summary: string) {
        return prismaService.lessonChunk.update({
            where: { id: chunkId },
            data: { summary }
        })
    }

    /**
     * Long-poll: waits until summarization completes (via Redis pub/sub) or
     * times out after LONG_POLL_TIMEOUT_MS.
     *
     * Accepts an AbortSignal so the caller (controller) can cancel the wait when
     * the HTTP client disconnects, preventing resource leaks.
     *
     * Returns a discriminated union so the controller stays free of business logic.
     */
    async waitForAnalysis(lessonId: string, signal?: AbortSignal): Promise<WaitResult> {
        // ── Fast path: data already ready in DB ──────────────────────────────
        const existing = await this.getLessonAnalysis(lessonId)

        if (!existing) return { outcome: AnalysisOutcome.NOT_FOUND }
        if (existing.status === 'completed') return { outcome: AnalysisOutcome.COMPLETED, data: existing }

        // ── Long-poll path ────────────────────────────────────────────────────
        Logger.info(`[AnalysisService] Long-polling started for lessonId=${lessonId}`)

        return new Promise<WaitResult>((resolve) => {
            const channel = `analysis:${lessonId}`
            const subscriber = redisService.createSubscriber()
            let settled = false

            const cleanup = () => {
                if (settled) return
                settled = true
                clearTimeout(timeoutHandle)
                subscriber.unsubscribe(channel).catch(() => { })
                subscriber.disconnect()
            }

            const settle = (result: WaitResult) => {
                cleanup()
                resolve(result)
            }

            // Abort (client disconnect)
            signal?.addEventListener('abort', () => {
                if (!settled) {
                    Logger.info(`[AnalysisService] Aborted for lessonId=${lessonId}`)
                    settle({ outcome: AnalysisOutcome.ABORTED })
                }
            })

            // Timeout
            const timeoutHandle = setTimeout(() => {
                Logger.info(`[AnalysisService] Timeout for lessonId=${lessonId}`)
                settle({ outcome: AnalysisOutcome.PROCESSING, data: existing })
            }, LONG_POLL_TIMEOUT_MS)

            // Subscribe and resolve on first message
            subscriber.subscribe(channel).then(() => {
                subscriber.on('message', async () => {
                    if (settled) return
                    try {
                        const fresh = await this.getLessonAnalysis(lessonId)
                        settle(
                            fresh?.status === AnalysisOutcome.COMPLETED
                                ? { outcome: AnalysisOutcome.COMPLETED, data: fresh }
                                : { outcome: AnalysisOutcome.PROCESSING, data: fresh ?? existing }
                        )
                    } catch (err) {
                        Logger.error(`[AnalysisService] DB fetch error: ${err}`)
                        settle({ outcome: AnalysisOutcome.PROCESSING, data: existing })
                    }
                })
            }).catch((err) => {
                Logger.error(`[AnalysisService] Redis subscribe error: ${err}`)
                settle({ outcome: AnalysisOutcome.PROCESSING, data: existing })
            })
        })
    }
}

export default new AnalysisService()
