import amqp, { Channel } from 'amqplib'
import { QueueNameEnum } from '../../enums/emailType.enum'
import Logger from '~/utils/logger'
import VideoAnalysisService from '../models/videoAnalysis.service'
import { env } from '~/config/env'

const RabbitMQConf = {
  protocol: 'amqp',
  hostname: env.RABBIT_MQ_HOST,
  port: env.RABBIT_MQ_PORT,
  username: env.RABBIT_MQ_USER_NAME,
  password: env.RABBIT_MQ_PASSWORD,
  authMechanism: 'AMQPLAIN',
  vhost: '/',
  uri: process.env.RABBIT_MQ_URI || null
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
        Logger.info(data.content.toString());
        const parsed: T & { type?: string } = JSON.parse(data.content.toString())
        parsed.type = queue // Gán type cho parsed để biết queue nào đã gửi message

        await handler(parsed)
        RabbitClient.channel?.ack(data)
      } catch (err) {
        Logger.error(`Lỗi xử lý message ở queue ${queue}: ${err}`)
        RabbitClient.channel?.nack(data, false, true)
      }
    })
  }

  // created connection and ...
  private static async createConnection(): Promise<void> {
    try {
      const uri = RabbitMQConf.uri || `${RabbitMQConf.protocol}://${RabbitMQConf.username}:${RabbitMQConf.password}@${RabbitMQConf.hostname}:${RabbitMQConf.port}${RabbitMQConf.vhost}`
      RabbitClient.connection = await amqp.connect(uri)
      RabbitClient.channel = await RabbitClient.connection.createChannel()

      // check connection -> throw error if connection is not initialized
      if (!RabbitClient.channel) {
        throw new Error('RabbitMQ channel is not initialized')
      }


      // Register consumer for video analysis
      await RabbitClient.registerConsumer(
        QueueNameEnum.VIDEO_ANALYSIS,
        'video.analysis.exchange',
        'video.analysis.#',
        async (envelope) => {
          const payload = envelope as unknown as { lessonId: string; videoUrl: string };
          await VideoAnalysisService.getInstance().handleVideoAnalysisEvent(payload);
        }
      )

      Logger.info('Connection to RabbitMQ established')
    } catch (error) {
      Logger.error(`RabbitMQ connection failed: ${error}`)
      throw new Error('RabbitMQ connection failed')
    }
  }

  // send message to message queue
  public static async sendMessage(data: any, queueName: QueueNameEnum): Promise<boolean> {
    try {
      if (!RabbitClient.channel) {
        throw new Error('RabbitMQ channel is not initialized')
      }

      // make sure queue exists
      await RabbitClient.channel.assertQueue(queueName, { durable: true })

      const msgBuffer = Buffer.from(JSON.stringify(data))
      const sent = RabbitClient.channel.sendToQueue(queueName, msgBuffer)
      Logger.info('Message sent to RabbitMQ')
      return sent
    } catch (error) {
      Logger.error(`Failed to send message: ${error}`)
      return false
    }
  }

  // Publish message to an exchange (topic/direct/fanout)
  public static async sendMessageTopic(
    data: any,
    exchange: string,
    routingKey = '',
    exchangeType: 'topic' | 'direct' | 'fanout' = 'topic',
    persistent = true
  ): Promise<boolean> {
    try {
      if (!RabbitClient.channel) {
        throw new Error('RabbitMQ channel is not initialized')
      }

      // Ensure exchange exists
      await RabbitClient.channel.assertExchange(exchange, exchangeType, { durable: true })

      const payload = Buffer.from(JSON.stringify(data))
      const published = RabbitClient.channel.publish(exchange, routingKey, payload, { persistent })
      Logger.info(`Message published to exchange ${exchange} with routingKey '${routingKey}'`)
      return published
    } catch (error) {
      Logger.error(`Failed to publish message to exchange: ${error}`)
      return false
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
    Logger.info(`Bound queue ${queue} -> ${exchange} [${keys.join(',')}]`)
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

    RabbitClient.channel.consume(queue, async (msg) => {
      if (!msg) return
      try {
        const envelope = JSON.parse(msg.content.toString())
        await handler(envelope)
        RabbitClient.channel?.ack(msg)
      } catch (err) {
        Logger.error(`Error processing message from ${queue}: ${err}`)
        // nack and move to DLQ or drop depending on your policy
        RabbitClient.channel?.nack(msg, false, false)
      }
    }, { noAck: false })

    Logger.info(`Consumer registered on queue ${queue}`)
  }
}

export default RabbitClient