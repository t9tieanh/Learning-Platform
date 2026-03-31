import Bull from 'bull';
import Logger from '~/utils/logger';
import { env } from '~/config/env';
import { BullJobType } from '~/enums/bullJobType.enum';

/**
 * Redis Bull Queue Service
 * Manages job queues for long-running AI analysis tasks.
 * 
 * Queues:
 * - lessonChunkingQueue: Semantic chunking of lesson transcripts
 * - lessonSummarizationQueue: Map-Reduce summarization + embedding generation
 */
class BullQueueService {
    public lessonChunkingQueue: Bull.Queue;
    public lessonSummarizationQueue: Bull.Queue;

    constructor() {
        // Build Redis connection URL from environment config
        const redisUrl = this.buildRedisUrl();

        // Initialize queues with Redis connection
        this.lessonChunkingQueue = new Bull(BullJobType.LESSON_CHUNKING, redisUrl, {
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        });

        this.lessonSummarizationQueue = new Bull(BullJobType.LESSON_SUMMARIZATION, redisUrl, {
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        });

        // Global error handler
        this.setupErrorHandlers();

        Logger.info(`[BullQueueService] Initialized with queues: ${BullJobType.LESSON_CHUNKING}, ${BullJobType.LESSON_SUMMARIZATION}`);
    }

    /**
     * Build Redis connection URL from environment variables
     */
    private buildRedisUrl(): string {
        const host = env.REDIS_DB_HOST || 'localhost';
        const port = env.REDIS_DB_PORT || 6379;
        const password = env.REDIS_DB_PASSWORD;
        const username = env.REDIS_DB_USER || 'default';

        if (password) {
            return `redis://${username}:${password}@${host}:${port}`;
        } else {
            return `redis://${host}:${port}`;
        }
    }

    private setupErrorHandlers(): void {
        // Chunking queue errors
        this.lessonChunkingQueue.on('failed', (job, err) => {
            Logger.error(
                `[BullQueueService] Chunking job #${job.id} for lessonId=${job.data.lessonId} failed – ${err.message}`
            );
        });

        this.lessonChunkingQueue.on('error', (err) => {
            Logger.error(`[BullQueueService] Chunking queue error – ${err.message}`);
        });

        // Summarization queue errors
        this.lessonSummarizationQueue.on('failed', (job, err) => {
            Logger.error(
                `[BullQueueService] Summarization job #${job.id} for lessonId=${job.data.lessonId} failed – ${err.message}`
            );
        });

        this.lessonSummarizationQueue.on('error', (err) => {
            Logger.error(`[BullQueueService] Summarization queue error – ${err.message}`);
        });
    }

    /**
     * Close all queues when service shuts down
     */
    public async close(): Promise<void> {
        await Promise.all([
            this.lessonChunkingQueue.close(),
            this.lessonSummarizationQueue.close(),
        ]);
        Logger.info('[BullQueueService] All queues closed');
    }
}

// Export singleton
export const bullQueueService = new BullQueueService();
export default bullQueueService;
