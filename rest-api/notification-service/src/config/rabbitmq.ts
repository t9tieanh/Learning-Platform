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
      await RabbitClient.channel.assertQueue(QueueNameEnum.VERIFY_EMAIL, { durable: true })

      // Đăng ký consumer cho queue VERIFY_EMAIL
      this.consumeQueue<VerifyEmail>(QueueNameEnum.VERIFY_EMAIL, async (parsed) => {
        await nodemailService.sendMail(parsed)
      })

      await RabbitClient.channel.assertQueue(QueueNameEnum.RESET_PASSWORD, { durable: true })
      // Đăng ký consumer cho queue RESET_PASSWORD
      this.consumeQueue<VerifyEmail>(QueueNameEnum.RESET_PASSWORD, async (parsed) => {
        await nodemailService.sendMail(parsed)
      })

      console.log('Connection to RabbitMQ established')
    } catch (error) {
      console.error('RabbitMQ connection failed:', error)
      throw new Error('RabbitMQ connection failed')
    }
  }

  // Ensure exchange + queue exist and bind routing keys
  public static async bindQueueToExchange(
    queue: string,
    exchange: string,
    routingKeys: string | string[],
    exchangeType: 'topic' | 'direct' | 'fanout' = 'topic'
  ): Promise<void> {
    if (!RabbitClient.channel) throw new Error('RabbitMQ channel is not initialized')
    const keys = Array.isArray(routingKeys) ? routingKeys : [routingKeys]
    await RabbitClient.channel.assertExchange(exchange, exchangeType, { durable: true })
    await RabbitClient.channel.assertQueue(queue, { durable: true })
    for (const k of keys) {
      await RabbitClient.channel.bindQueue(queue, exchange, k)
    }
    console.log(`Bound queue ${queue} -> ${exchange} [${keys.join(',')}]`)
  }

  // Register consumer: bind then consume (handler receives parsed envelope)
  public static async registerConsumer<T = any>(
    queue: string,
    exchange: string,
    routingKeys: string | string[],
    handler: (envelope: { type: string; version?: string; correlationId?: string; payload: T }) => Promise<void>,
    exchangeType: 'topic' | 'direct' | 'fanout' = 'topic'
  ): Promise<void> {
    if (!RabbitClient.channel) throw new Error('RabbitMQ channel is not initialized')

    //await RabbitClient.bindQueueToExchange(queue, exchange, routingKeys, exchangeType)

    RabbitClient.channel.consume(
      queue,
      async (msg) => {
        if (!msg) return
        try {
          const envelope = JSON.parse(msg.content.toString())
          await handler(envelope)
          RabbitClient.channel?.ack(msg)
        } catch (err) {
          console.error(`Error processing message from ${queue}`, err)
          // nack and move to DLQ or drop depending on your policy
          RabbitClient.channel?.nack(msg, false, false)
        }
      },
      { noAck: false }
    )

    console.log(`Consumer registered on queue ${queue}`)
  }
}

export default RabbitClient
