import amqp, { Channel } from 'amqplib'
import { env } from '~/config/env'
import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import nodemailService from '~/services/mails/nodemail.service'
import { VerifyEmail } from '~/dto/request/notification.dto'

const RabbitMQConf = {
  protocol: 'amqp',
  hostname: env.RABBIT_MQ_HOST,
  port: env.RABBIT_MQ_PORT,
  username: env.RABBIT_MQ_USER_NAME,
  password: env.RABBIT_MQ_PASSWORD,
  authMechanism: 'AMQPLAIN',
  vhost: '/'
}

class RabbitClient {
  private static instance: RabbitClient
  private static connection: any | null = null
  private static channel: Channel | null = null

  private constructor() {
    // private để ép buộc singleton
  }

  // Singleton accessor
  public static async getInstance(): Promise<RabbitClient> {
    if (!RabbitClient.instance) {
      RabbitClient.instance = new RabbitClient()
      await RabbitClient.createConnection()
    }
    return RabbitClient.instance
  }

  // generic function handler event
  private static consumeQueue<T>(queue: QueueNameEnum, handler: (parsed: T) => Promise<void>) {
    RabbitClient.channel?.consume(queue, async (data) => {
      if (!data) return
      try {
        const parsed: T = JSON.parse(data.content.toString())
        await handler(parsed)
        RabbitClient.channel?.ack(data)
      } catch (err) {
        console.error(`Lỗi xử lý message ở queue ${queue}:`, err)
        RabbitClient.channel?.nack(data, false, true)
      }
    })
  }

  // Tạo kết nối và channel -> đăng ký consumer để lắng nghe data trên queue
  private static async createConnection(): Promise<void> {
    try {
      const uri = `${RabbitMQConf.protocol}://${RabbitMQConf.username}:${RabbitMQConf.password}@${RabbitMQConf.hostname}:${RabbitMQConf.port}${RabbitMQConf.vhost}`
      RabbitClient.connection = await amqp.connect(uri)
      RabbitClient.channel = await RabbitClient.connection.createChannel()

      // Đảm bảo queue tồn tại
      if (!RabbitClient.channel) {
        throw new Error('RabbitMQ channel is not initialized')
      }
      await RabbitClient.channel.assertQueue(QueueNameEnum.VERIFY_EMAIL, { durable: true })

      // Đăng ký consumer cho queue VERIFY_EMAIL
      this.consumeQueue<VerifyEmail>(QueueNameEnum.VERIFY_EMAIL, async (parsed) => {
        await nodemailService.sendMail(parsed)
      })

      console.log('Connection to RabbitMQ established')
    } catch (error) {
      console.error('RabbitMQ connection failed:', error)
      throw new Error('RabbitMQ connection failed')
    }
  }
}

export default RabbitClient
