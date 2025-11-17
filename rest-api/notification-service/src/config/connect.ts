import CONNECT_DB from './mongodb'
import Redis from './redis'
import RabbitClient from './rabbitmq'

export const CONNECT_DATABASES = async (): Promise<void> => {
  try {
    await Promise.all([
      CONNECT_DB()
        .then(() => console.log('Connected MongoDB'))
        .catch((error) => {
          console.error('MongoDB connection error:', error)
        }),
      // Redis.CONNECT_REDIS_DB().then(() => console.log('Connected Redis')),
      // có thể kết nối rabbit mq hoặc không
      RabbitClient.getInstance()
        .then(() => console.log('Connected RabbitMQ'))
        .catch((error) => {
          console.log(error)
        })
    ])
  } catch (err) {
    console.error('Database connection failed:', err)
  }
}
