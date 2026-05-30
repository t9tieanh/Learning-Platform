import amqp, { Channel, ChannelModel } from 'amqplib'
import { env } from '~/config/env'
import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import nodemailService from '~/services/mails/nodemail.service'
import { VerifyEmail } from '~/dto/request/notification.dto'
import { CourseApprovalEvent } from '~/dto/event/course-approval-event.dto'
import { handleCourseApprovalEvent } from '~/services/course.service'
import { handleStudyReminderEvent } from '~/services/studyReminder.service'
import type { StudyReminderEvent } from '~/dto/event/study-reminder-event.dto'
import Logger from '~/utils/logger'

const RabbitMQConf = {
  protocol: 'amqp',
  hostname: env.RABBIT_MQ_HOST,
  port: env.RABBIT_MQ_PORT,
  username: env.RABBIT_MQ_USER_NAME,
  password: env.RABBIT_MQ_PASSWORD,
  authMechanism: 'AMQPLAIN',
  vhost: env.RABBIT_MQ_VHOST || '/',
  uri: env.RABBIT_MQ_URI || null
}

interface ConsumerDef {
  queue: string
  exchange?: string
  routingKeys?: string | string[]
  handler: (envelope: any) => Promise<void>
  exchangeType?: 'topic' | 'direct' | 'fanout'
}

class RabbitClient {
  private static instance: RabbitClient
  private static connection: ChannelModel | null = null
  private static channel: Channel | null = null
  private static isConnecting = false

  // Keep track of registered consumers to re-subscribe on reconnection
  private static consumers: ConsumerDef[] = []

  private constructor() {
    // private to enforce singleton
  }

  // Singleton accessor
  public static async getInstance(): Promise<RabbitClient> {
    if (!RabbitClient.instance) {
      RabbitClient.instance = new RabbitClient()
      await RabbitClient.createConnection()
    }
    return RabbitClient.instance
  }

  // Generic event handler function
  private static consumeQueue<T>(queue: QueueNameEnum, handler: (parsed: T) => Promise<void>) {
    // This helper is for the internal hardcoded queues. 
    // We wrap the handler to handle parsing and ack/nack/logging.
    RabbitClient.channel?.consume(queue, async (data) => {
      if (!data) return
      try {
        const parsed: T & { type?: string } = JSON.parse(data.content.toString())
        parsed.type = queue

        await handler(parsed)
        RabbitClient.channel?.ack(data)
      } catch (err) {
        Logger.error(`Error processing message in queue ${queue}: ${err}`)
        RabbitClient.channel?.nack(data, false, true)
      }
    })
  }

  // Create connection and channel -> register consumers to listen to data on queue
  private static async createConnection(): Promise<void> {
    if (this.isConnecting) return
    this.isConnecting = true

    try {
      const uri = RabbitMQConf.uri || `${RabbitMQConf.protocol}://${RabbitMQConf.username}:${RabbitMQConf.password}@${RabbitMQConf.hostname}:${RabbitMQConf.port}${RabbitMQConf.vhost}`

      Logger.info('Attempting to connect to RabbitMQ...')
      RabbitClient.connection = await amqp.connect(uri)

      // Handle connection events
      RabbitClient.connection.on('error', (err) => {
        Logger.error(`RabbitMQ Connection Error: ${err}`)
        // Connection error usually leads to close, so we handle reconnect there or if close isn't emitted
      })

      RabbitClient.connection.on('close', () => {
        Logger.warn('RabbitMQ Connection Closed so re-connecting...')
        RabbitClient.connection = null
        RabbitClient.channel = null
        RabbitClient.scheduleReconnect()
      })

      RabbitClient.channel = await RabbitClient.connection.createChannel()
      RabbitClient.channel.on('error', (err) => {
        Logger.error(`RabbitMQ Channel Error: ${err}`)
      })

      if (!RabbitClient.channel) {
        throw new Error('RabbitMQ channel is not initialized')
      }

      Logger.info('RabbitMQ Connected and Channel created')

      // --- Setup Consumers ---
      // 1. Setup Static/Internal Consumers
      await RabbitClient.setupStaticConsumers()

      // 2. Setup Dynamic Consumers (re-register ones added via registerConsumer)
      for (const consumer of RabbitClient.consumers) {
        await RabbitClient.setupDynamicConsumer(consumer)
      }

      this.isConnecting = false

    } catch (error) {
      Logger.error(`RabbitMQ connection initial failed: ${error}`)
      this.isConnecting = false
      // If initial connection fails, we should retry
      RabbitClient.scheduleReconnect()
    }
  }

  private static scheduleReconnect() {
    setTimeout(async () => {
      Logger.info('Reconnecting to RabbitMQ...')
      await RabbitClient.createConnection()
    }, 5000)
  }

  private static async setupStaticConsumers() {
    if (!RabbitClient.channel) return

    // VERIFY_EMAIL
    await RabbitClient.channel.assertQueue(QueueNameEnum.VERIFY_EMAIL, { durable: true })
    this.consumeQueue<VerifyEmail>(QueueNameEnum.VERIFY_EMAIL, async (parsed) => {
      await nodemailService.sendMail(parsed)
    })

    // RESET_PASSWORD
    await RabbitClient.channel.assertQueue(QueueNameEnum.RESET_PASSWORD, { durable: true })
    this.consumeQueue<VerifyEmail>(QueueNameEnum.RESET_PASSWORD, async (parsed) => {
      await nodemailService.sendMail(parsed)
    })

    // COURSE_APPROVAL
    await RabbitClient.channel.assertQueue(QueueNameEnum.COURSE_APPROVAL, { durable: true })
    this.consumeQueue<CourseApprovalEvent>(QueueNameEnum.COURSE_APPROVAL, handleCourseApprovalEvent)

    // STUDY_REMINDER (daily learning nudge from course-service)
    await RabbitClient.channel.assertQueue(QueueNameEnum.STUDY_REMINDER, { durable: true })
    this.consumeQueue<StudyReminderEvent>(QueueNameEnum.STUDY_REMINDER, handleStudyReminderEvent)
  }

  private static async setupDynamicConsumer(consumer: ConsumerDef) {
    if (!RabbitClient.channel) return

    // Note: Bindings are handled usually before registration, or assumed durable.
    // If we wanted to ensure binding, we could do it here if we had all info. 
    // registerConsumer in original code didn't call bindQueueToExchange, so we follow that pattern
    // but we execute the consume logic.

    RabbitClient.channel.consume(
      consumer.queue,
      async (msg) => {
        if (!msg) return
        try {
          const envelope = JSON.parse(msg.content.toString())
          await consumer.handler(envelope)
          RabbitClient.channel?.ack(msg)
        } catch (err) {
          Logger.error(`Error processing message from ${consumer.queue}: ${err}`)
          RabbitClient.channel?.nack(msg, false, false)
        }
      },
      { noAck: false }
    )
  }

  // Ensure exchange + queue exist and bind routing keys
  public static async bindQueueToExchange(
    queue: string,
    exchange: string,
    routingKeys: string | string[],
    exchangeType: 'topic' | 'direct' | 'fanout' = 'topic'
  ): Promise<void> {
    if (!RabbitClient.channel) {
      // If channel missing, wait or error. 
      // Since this is typically called during init, and init waits for getInstance, 
      // channel should be there. If we are in reconnect flux, this might fail.
      // Warning implies we might be disconnected.
      Logger.warn(`Cannot bind ${queue} to ${exchange}, channel not ready`)
      return
    }
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

    const consumerDef: ConsumerDef = { queue, exchange, routingKeys, handler, exchangeType }
    RabbitClient.consumers.push(consumerDef)

    if (RabbitClient.channel) {
      await RabbitClient.setupDynamicConsumer(consumerDef)
      Logger.info(`Consumer registered on queue ${queue}`)
    } else {
      Logger.warn(`Channel not ready for ${queue}, will register on connect`)
    }
  }
}

export default RabbitClient
