import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import sendResponse from '~/dto/response/send-response'
import redisService from '~/service/utils/redis.service'
import { env } from '~/config/env'
import Logger from '~/utils/logger'

const VN_OFFSET_MS = 7 * 60 * 60 * 1000

function getVnDayWindow(): { dayKey: string; ttlInSec: number } {
  const now = new Date()
  const vnNow = new Date(now.getTime() + VN_OFFSET_MS)
  const dayKey = vnNow.toISOString().slice(0, 10)
  const nextMidnightVnUtcMs = Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate() + 1)
  const ttlInSec = Math.ceil((nextMidnightVnUtcMs - vnNow.getTime()) / 1000) + 5
  return { dayKey, ttlInSec }
}

const chatRateLimit = (limit: number = env.DAILY_CHAT_LIMIT) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.sub
      const guestId = (req as any).guestId
      const identityType = userId ? 'user' : 'guest'
      const identifier = userId || guestId

      if (!identifier) {
        Logger.warn('[ChatRateLimit] Không có user/guest identifier, bỏ qua kiểm tra')
        return next()
      }

      const { dayKey, ttlInSec } = getVnDayWindow()
      const key = `chatlimit:${identityType}:${identifier}:${dayKey}`

      const count = await redisService.incrWithExpire(key, ttlInSec)

      if (count > limit) {
        Logger.warn(`[ChatRateLimit] ${identityType} ${identifier} đã vượt giới hạn ${limit} lần/ngày`)
        res.set('Retry-After', String(ttlInSec))
        sendResponse(res, {
          code: StatusCodes.TOO_MANY_REQUESTS,
          message: `Bạn đã đạt giới hạn ${limit} câu hỏi trong hôm nay. Vui lòng quay lại vào ngày mai.`,
          result: null,
        })
        return
      }

      next()
    } catch (error) {
      Logger.error(`[ChatRateLimit] Lỗi Redis, fail-open: ${error}`)
      next()
    }
  }
}

export default chatRateLimit
