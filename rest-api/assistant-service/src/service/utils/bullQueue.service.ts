import Bull from 'bull';
import Logger from '~/utils/logger';
import { BullJobType } from '~/enums/bullJobType.enum';
import { bullRedisFactory } from '~/service/utils/bullRedis.factory';

class BullQueueService {
    public lessonChunkingQueue: Bull.Queue;
    public lessonSummarizationQueue: Bull.Queue;
    public lessonTestGroupQuizQueue: Bull.Queue;

    constructor() {
        const defaultJobOptions = {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 3,
            backoff: {
                type: 'exponential' as const,
                delay: 5000,
            },
        };

        const bullOpts = {
            redis: bullRedisFactory.getRedisConfig(),
            createClient: bullRedisFactory.createClient,
            defaultJobOptions,
        };

        this.lessonChunkingQueue = new Bull(BullJobType.LESSON_CHUNKING, bullOpts);
        this.lessonSummarizationQueue = new Bull(BullJobType.LESSON_SUMMARIZATION, bullOpts);
        this.lessonTestGroupQuizQueue = new Bull(BullJobType.LESSON_TEST_GROUP_QUIZ, bullOpts);

        this.setupErrorHandlers();

        Logger.info(`[BullQueueService] Initialized with queues: ${BullJobType.LESSON_CHUNKING}, ${BullJobType.LESSON_SUMMARIZATION}, ${BullJobType.LESSON_TEST_GROUP_QUIZ}`);
    }

    private setupErrorHandlers(): void {
        this.lessonChunkingQueue.on('failed', (job, err) => {
            Logger.error(
                `[BullQueueService] Chunking job #${job.id} for lessonId=${job.data.lessonId} failed – ${err.message}`
            );
        });

        this.lessonChunkingQueue.on('error', (err) => {
            Logger.error(`[BullQueueService] Chunking queue error – ${err.message}`);
        });

        this.lessonSummarizationQueue.on('failed', (job, err) => {
            Logger.error(
                `[BullQueueService] Summarization job #${job.id} for lessonId=${job.data.lessonId} failed – ${err.message}`
            );
        });

        this.lessonSummarizationQueue.on('error', (err) => {
            Logger.error(`[BullQueueService] Summarization queue error – ${err.message}`);
        });

        this.lessonTestGroupQuizQueue.on('failed', (job, err) => {
            Logger.error(
                `[BullQueueService] Lesson-test group quiz job #${job.id} failed – ${err.message}`
            );
        });

        this.lessonTestGroupQuizQueue.on('error', (err) => {
            Logger.error(`[BullQueueService] Lesson-test group quiz queue error – ${err.message}`);
        });
    }

    public async close(): Promise<void> {
        await Promise.all([
            this.lessonChunkingQueue.close(),
            this.lessonSummarizationQueue.close(),
            this.lessonTestGroupQuizQueue.close(),
        ]);
        await bullRedisFactory.quitSharedConnections();
        Logger.info('[BullQueueService] All queues closed');
    }
}

export const bullQueueService = new BullQueueService();
export default bullQueueService;
