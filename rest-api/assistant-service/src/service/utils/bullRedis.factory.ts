import IORedis, { Redis, RedisOptions } from 'ioredis';
import { env } from '~/config/env';
import { BullRedisClientType } from '~/enums/bullRedisClientType.enum';
import Logger from '~/utils/logger';

export class BullRedisFactory {
    private sharedClient: Redis | null = null;
    private sharedSubscriber: Redis | null = null;

    private mergeIoredisOptions(bullOverride?: RedisOptions): RedisOptions {
        const base: RedisOptions = {
            host: env.REDIS_DB_HOST || '127.0.0.1',
            port: env.REDIS_DB_PORT,
            db: env.REDIS_DB_NAME,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        };
        if (env.REDIS_DB_PASSWORD) {
            base.password = env.REDIS_DB_PASSWORD;
        }
        if (env.REDIS_DB_USER) {
            base.username = env.REDIS_DB_USER;
        }
        return { ...base, ...bullOverride, maxRetriesPerRequest: null };
    }

    getRedisConfig(): RedisOptions {
        return this.mergeIoredisOptions();
    }

    createClient = (
        type: BullRedisClientType | 'client' | 'subscriber' | 'bclient',
        bullOverride?: RedisOptions
    ): Redis => {
        const opts = this.mergeIoredisOptions(bullOverride);
        switch (type) {
            case BullRedisClientType.CLIENT:
                if (!this.sharedClient) {
                    this.sharedClient = new IORedis(opts);
                    this.sharedClient.on('error', (err) => {
                        Logger.error(`[Bull Redis client] ${err.message}`);
                    });
                }
                return this.sharedClient;
            case BullRedisClientType.SUBSCRIBER:
                if (!this.sharedSubscriber) {
                    this.sharedSubscriber = new IORedis(opts);
                    this.sharedSubscriber.on('error', (err) => {
                        Logger.error(`[Bull Redis subscriber] ${err.message}`);
                    });
                }
                return this.sharedSubscriber;
            case BullRedisClientType.BCLIENT: {
                const b = new IORedis(opts);
                b.on('error', (err) => {
                    Logger.error(`[Bull Redis bclient] ${err.message}`);
                });
                return b;
            }
            default:
                throw new Error(
                    `Unexpected Bull createClient type: ${String(type)} (expected one of ${Object.values(
                        BullRedisClientType
                    ).join(', ')})`
                );
        }
    };

    async quitSharedConnections(): Promise<void> {
        await Promise.all(
            [this.sharedClient, this.sharedSubscriber].map(async (c) => {
                if (c) {
                    try {
                        await c.quit();
                    } catch {
                        c.disconnect();
                    }
                }
            })
        );
        this.sharedClient = null;
        this.sharedSubscriber = null;
    }
}

export const bullRedisFactory = new BullRedisFactory();
