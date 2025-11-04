import amqp, { Channel } from 'amqplib'
import { QueueNameEnum } from '../../enums/emailType.enum'
import { NotificationDto } from '../../dto/request/notification.dto'

const RabbitMQConf = {
  protocol: 'amqp',
  hostname: process.env.RABBIT_MQ_HOST,
  port: process.env.RABBIT_MQ_PORT,
  username: process.env.RABBIT_MQ_USER_NAME,
  password: process.env.RABBIT_MQ_PASSWORD,
  authMechanism: 'AMQPLAIN',
  vhost: '/'
}

class RabbitClient {
  private static instance: RabbitClient
  private static connection: any | null = null
  private static channel: Channel | null = null

  private constructor() {
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
        console.log(data.content.toString());
        const parsed: T & { type?: string } = JSON.parse(data.content.toString())
        parsed.type = queue // Gán type cho parsed để biết queue nào đã gửi message

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
      await RabbitClient.channel.assertQueue(QueueNameEnum.ORDER_CONFIRMATION, { durable: true })

      // // register consumer cho queue ORDER_CONFIRMATION
      // this.consumeQueue<OrderConfirmationData>(QueueNameEnum.ORDER_CONFIRMATION, async (parsed) => {
      //   await nodemailService.sendMail(parsed as any)
      // })

      console.log('Connection to RabbitMQ established')
    } catch (error) {
      console.error('RabbitMQ connection failed:', error)
      throw new Error('RabbitMQ connection failed')
    }
  }

  // Gửi message tới queue
  public static async sendMessage(data: NotificationDto, queueName: QueueNameEnum): Promise<boolean> {
    try {
      if (!RabbitClient.channel) {
        throw new Error('RabbitMQ channel is not initialized')
      }

      // Đảm bảo queue tồn tại
      await RabbitClient.channel.assertQueue(queueName, { durable: true })

      const msgBuffer = Buffer.from(JSON.stringify(data))
      const sent = RabbitClient.channel.sendToQueue(queueName, msgBuffer)
      console.log('Message sent to RabbitMQ')
      return sent
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }
}

export default RabbitClient