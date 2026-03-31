import Logger from '~/utils/logger';
import { registerChunkingProcessor } from '~/service/jobs/chunkingJob.processor';
import { registerSummarizationProcessor } from '~/service/jobs/summarizationJob.processor';
import { bullQueueService } from '~/service/utils/bullQueue.service';

/**
 * Initialize all Bull job processors
 * 
 * Should be called during application startup
 */
export async function initializeBullProcessors(): Promise<void> {
    try {
        Logger.info('[BullProcessorInitializer] Starting Bull processor registration...');

        // Register all processors
        registerChunkingProcessor();
        registerSummarizationProcessor();

        Logger.info('[BullProcessorInitializer] All Bull processors registered successfully');

        // Setup graceful shutdown
        process.on('SIGTERM', async () => {
            Logger.info('[BullProcessorInitializer] Received SIGTERM, gracefully shutting down Bull queues...');
            await bullQueueService.close();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            Logger.info('[BullProcessorInitializer] Received SIGINT, gracefully shutting down Bull queues...');
            await bullQueueService.close();
            process.exit(0);
        });
    } catch (error) {
        Logger.error(`[BullProcessorInitializer] Failed to initialize Bull processors – ${error}`);
        throw error;
    }
}

export default initializeBullProcessors;
