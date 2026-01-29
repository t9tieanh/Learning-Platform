import CONNECT_DB from './mongodb'
import RabbitClient from './rabbitmq'
import Logger from '~/utils/logger'

export const CONNECT_DATABASES = async (): Promise<void> => {
  try {
    await Promise.all([
      CONNECT_DB()
        .then(() => Logger.info('Connected MongoDB'))
        .catch((error) => {
          Logger.error(`MongoDB connection error: ${error}`)
        }),
      RabbitClient.getInstance()
        .then(() => Logger.info('Connected RabbitMQ'))
        .catch((error) => {
          Logger.error(`RabbitMQ connection error: ${error}`)
        })
    ])
  } catch (err) {
    Logger.error(`Database connection failed: ${err}`)
  }
}
