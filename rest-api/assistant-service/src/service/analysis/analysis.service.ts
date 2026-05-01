import prismaService from '~/service/utils/prisma.service'
import redisService from '~/service/utils/redis.service'
import Logger from '~/utils/logger'
import { toAnalysisResponseDto, AnalysisResponseDto, FullLessonWithIntelligence } from '~/dto/response/analysis-response.dto'
import { AnalysisOutcome } from '~/enums/analysisOutcome.enum'
import { AnalysisStatus } from '@prisma/client'

/** Max ms to hold a long-poll subscription open */
const LONG_POLL_TIMEOUT_MS = 25_000

export type WaitResult =
    | { outcome: AnalysisOutcome.COMPLETED; data: AnalysisResponseDto }
    | { outcome: AnalysisOutcome.PROCESSING; data: AnalysisResponseDto }
    | { outcome: AnalysisOutcome.NOT_FOUND }
    | { outcome: AnalysisOutcome.ABORTED }
    | { outcome: AnalysisOutcome.FAILED; reason: string }

export class AnalysisService {
    /**
     * Fetches the AI analysis result for a lesson.
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
                },
                lessonTest: {
                    include: {
                        chunkGroups: {
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                },
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
     * Long-poll: waits until summarization completes or times out.
     */
    async waitForAnalysis(lessonId: string, signal?: AbortSignal): Promise<WaitResult> {
        const existing = await this.getLessonAnalysis(lessonId)

        if (!existing) return { outcome: AnalysisOutcome.NOT_FOUND }
        if (existing.status === AnalysisStatus.COMPLETED) return { outcome: AnalysisOutcome.COMPLETED, data: existing }
        if (existing.status === AnalysisStatus.FAILED) return { outcome: AnalysisOutcome.FAILED, reason: existing.qualityReason || 'Xử lý thất bại' }

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

            signal?.addEventListener('abort', () => {
                if (!settled) {
                    Logger.info(`[AnalysisService] Aborted for lessonId=${lessonId}`)
                    settle({ outcome: AnalysisOutcome.ABORTED })
                }
            })

            const timeoutHandle = setTimeout(() => {
                Logger.info(`[AnalysisService] Timeout for lessonId=${lessonId}`)
                settle({ outcome: AnalysisOutcome.PROCESSING, data: existing })
            }, LONG_POLL_TIMEOUT_MS)

            subscriber.subscribe(channel).then(() => {
                subscriber.on('message', async (chan, message) => {
                    if (settled) return
                    try {
                        const payload = JSON.parse(message);

                        if (payload.status === AnalysisOutcome.FAILED) {
                            settle({ outcome: AnalysisOutcome.FAILED, reason: payload.reason || 'Xử lý thất bại' })
                            return;
                        }

                        const fresh = await this.getLessonAnalysis(lessonId)
                        if (fresh) {
                            settle(
                                fresh.status === AnalysisStatus.COMPLETED
                                    ? { outcome: AnalysisOutcome.COMPLETED, data: fresh }
                                    : { outcome: AnalysisOutcome.PROCESSING, data: fresh }
                            )
                        } else {
                            settle({ outcome: AnalysisOutcome.PROCESSING, data: existing })
                        }
                    } catch (err) {
                        Logger.error(`[AnalysisService] Message processing error: ${err}`)
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
