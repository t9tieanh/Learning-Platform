import { createClient, RedisClientType } from 'redis'
import { env } from './env'

let redisClient: RedisClientType | null = null

const CONNECT_REDIS_DB = async (): Promise<RedisClientType> => {
  // nếu đã connect
  redisClient = createClient({
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT as number
    }
  })

  try {
    await redisClient.connect()
    console.log('Redis connected')
  } catch (err) {
    // Có thể trả ApiError để middleware xử lý chung
    throw new Error('Cannot connect to Redis')
  }

  return redisClient
}

const getRedisClient = () => {
  if (!redisClient) throw new Error('Redis not connect !')
  return redisClient
}

const Redis = {
  getRedisClient,
  CONNECT_REDIS_DB
}

export default Redis
