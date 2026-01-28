import Redis from 'ioredis'
import { env } from '~/config/env'
import Logger from '~/utils/logger'

class RedisService {
  private redis: Redis

  constructor() {
    // init redis connection
    this.redis = new Redis({
      host: env.REDIS_DB_HOST,
      port: env.REDIS_DB_PORT,
      password: env.REDIS_DB_PASSWORD,
      username: env.REDIS_DB_USER,
      db: env.REDIS_DB_NAME
    })

    this.redis.on('connect', () => {
      Logger.info('🔌 Connected to Redis')
    })

    this.redis.on('error', (err: Error) => {
      Logger.error(`❌ Redis error: ${err}`)
    })
  }

  async set(key: string, value: any, ttlInSec: number | null = null): Promise<void> {
    const stringValue = JSON.stringify(value)
    if (ttlInSec) {
      await this.redis.set(key, stringValue, 'EX', ttlInSec)
    } else {
      await this.redis.set(key, stringValue)
    }
  }

  // set lock for booking
  async setLock(key: string, value: any, ttlInSec: number) {
    const stringValue = JSON.stringify(value)
    return await this.redis.set(key, stringValue, 'EX', ttlInSec, 'NX') // NX (only set if not exists), EX (expire time) de tao lock, tranh 2 tien trinh cung thao tac mot tai nguyen
  }

  // handle for map
  async setMap(key: string, map: Map<string, any>, ttlInSec: number | null = null): Promise<void> {
    const obj = Object.fromEntries(map)
    await this.set(key, obj, ttlInSec)
  }

  async getMap<K extends string, V = any>(key: string): Promise<Map<K, V> | null> {
    const obj = await this.get(key)
    if (!obj) return null
    return new Map(Object.entries(obj)) as Map<K, V>
  }

  // del keys
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
    // store primitives as plain strings, only JSON.stringify objects/arrays
    if (member === null || member === undefined) {
      return await this.redis.sadd(key, String(member))
    }
    const t = typeof member
    if (t === 'string' || t === 'number' || t === 'boolean') {
      return await this.redis.sadd(key, String(member))
    }
    // objects/arrays: keep JSON so complex data can be restored
    return await this.redis.sadd(key, JSON.stringify(member))
  }

  /**
   * Get all members from Redis set
   * @param key - set key
   */
  async smembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key)
  }

  async srem(key: string, member: string): Promise<number> {
    return await this.redis.srem(key, member)
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

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redis.lrange(key, start, stop)
  }

  async type(key: string): Promise<string> {
    return await this.redis.type(key)
  }

  async getList(key: string): Promise<any[]> {
    const type = await this.type(key)
    if (type === 'list') {
      const list = await this.redis.lrange(key, 0, -1)
      return list.map((item) => {
        try {
          return JSON.parse(item)
        } catch {
          return item
        }
      })
    }

    const data = await this.get(key)
    if (data) {
      return Array.isArray(data) ? data : [data]
    }
    return []
  }
  async rpush(key: string, value: any): Promise<number> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    return await this.redis.rpush(key, stringValue)
  }
}

export default new RedisService()