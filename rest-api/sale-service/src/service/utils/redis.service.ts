import Redis from 'ioredis'
import { env } from '~/config/env'
import Logger from '~/utils/logger'

export interface SagaResult {
  success: boolean
  reason?: string
}

class RedisService {
  private redis: Redis
  private subscriber: Redis  // dedicated connection for SUBSCRIBE mode

  constructor() {
    const redisOptions = {
      host: env.REDIS_DB_HOST,
      port: env.REDIS_DB_PORT,
      password: env.REDIS_DB_PASSWORD,
      username: env.REDIS_DB_USER,
      db: env.REDIS_DB_NAME
    }

    this.redis = new Redis(redisOptions)
    this.subscriber = new Redis(redisOptions)

    this.redis.on('connect', () => {
      Logger.info('🔌 Connected to Redis')
    })

    this.redis.on('error', (err: Error) => {
      Logger.error(`❌ Redis error: ${err}`)
    })
  }

  // ─── Pub/Sub ────────────────────────────────────────────────────────────────

  /** Publish a message to a Redis channel */
  async publish(channel: string, message: any): Promise<void> {
    await this.redis.publish(channel, JSON.stringify(message))
  }

  /**
   * Subscribe to a channel and wait for exactly one message.
   * Automatically unsubscribes after receiving the message or on timeout.
   * @param channel - Redis channel to subscribe
   * @param timeoutMs - max wait time in ms (default: 30s)
   */
  waitForMessage<T = any>(channel: string, timeoutMs = 30_000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let settled = false

      const cleanup = () => {
        this.subscriber.unsubscribe(channel).catch(() => { })
      }

      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        cleanup()
        reject(new Error(`Timeout waiting for Redis message on channel: ${channel}`))
      }, timeoutMs)

      this.subscriber.subscribe(channel, (err) => {
        if (err) {
          clearTimeout(timer)
          reject(err)
          return
        }
      })

      this.subscriber.on('message', (ch, rawMessage) => {
        if (ch !== channel || settled) return
        settled = true
        clearTimeout(timer)
        cleanup()
        try {
          resolve(JSON.parse(rawMessage) as T)
        } catch {
          reject(new Error(`Failed to parse Redis message from channel ${channel}: ${rawMessage}`))
        }
      })
    })
  }

  /**
   * Publish the result of a saga transaction so the payment handler can resume.
   * Channel convention: saga:result:<orderId>
   */
  async publishSagaResult(orderId: string, result: SagaResult): Promise<void> {
    const channel = `saga:result:${orderId}`
    await this.publish(channel, result)
    Logger.info(`publishSagaResult → ${channel}: ${JSON.stringify(result)}`)
  }

  // ─── Key-Value ──────────────────────────────────────────────────────────────

  async set(key: string, value: any, ttlInSec: number | null = null): Promise<void> {
    const stringValue = JSON.stringify(value)
    if (ttlInSec) {
      await this.redis.set(key, stringValue, 'EX', ttlInSec)
    } else {
      await this.redis.set(key, stringValue)
    }
  }

  async setLock(key: string, value: any, ttlInSec: number) {
    const stringValue = JSON.stringify(value)
    return await this.redis.set(key, stringValue, 'EX', ttlInSec, 'NX')
  }

  async setMap(key: string, map: Map<string, any>, ttlInSec: number | null = null): Promise<void> {
    const obj = Object.fromEntries(map)
    await this.set(key, obj, ttlInSec)
  }

  async getMap<K extends string, V = any>(key: string): Promise<Map<K, V> | null> {
    const obj = await this.get(key)
    if (!obj) return null
    return new Map(Object.entries(obj)) as Map<K, V>
  }

  async delMany(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0
    return await this.redis.del(...keys)
  }

  async has(key: string): Promise<boolean> {
    const exists = await this.redis.exists(key)
    return exists === 1
  }

  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? (JSON.parse(data) as T) : null
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const exists = await this.redis.exists(key)
    return exists === 1
  }

  async sadd(key: string, member: any): Promise<number> {
    if (member === null || member === undefined) {
      return await this.redis.sadd(key, String(member))
    }
    const t = typeof member
    if (t === 'string' || t === 'number' || t === 'boolean') {
      return await this.redis.sadd(key, String(member))
    }
    return await this.redis.sadd(key, JSON.stringify(member))
  }

  async smembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key)
  }

  async srem(key: string, member: string): Promise<number> {
    return await this.redis.srem(key, member)
  }

  async sremMany(key: string, members: string[]): Promise<number> {
    if (members.length === 0) return 0
    return await this.redis.srem(key, ...members)
  }

  async sismember(key: string, member: string): Promise<number> {
    return await this.redis.sismember(key, member)
  }

  async scard(key: string): Promise<number> {
    return await this.redis.scard(key)
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds)
  }

  async getTtl(key: string): Promise<number> {
    return await this.redis.ttl(key)
  }

  async scanKeys(pattern: string): Promise<string[]> {
    const stream = this.redis.scanStream({ match: pattern })
    const keys: string[] = []

    return new Promise<string[]>((resolve, reject) => {
      stream.on('data', (resultKeys: string[]) => {
        keys.push(...resultKeys)
      })
      stream.on('end', () => {
        resolve(keys)
      })
      stream.on('error', (err) => {
        reject(err)
      })
    })
  }

  async tryLockWithRetry(lockKey: string, value: any, ttl: number, maxRetry = 5, delayMs = 300): Promise<boolean> {
    for (let i = 0; i < maxRetry; i++) {
      const lock = await this.setLock(lockKey, value, ttl)
      if (lock) return true
      await new Promise((res) => setTimeout(res, delayMs))
    }
    return false
  }
}

export default new RedisService()