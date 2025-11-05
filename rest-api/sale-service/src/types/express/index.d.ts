import { Request } from 'express'
import 'express-session'
import { JwtPayloadDto } from '~/dto/request/auth.dto'

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayloadDto
    data?: any
  }
}

declare module 'express-session' {
  interface SessionData {
    cartId?: string
  }
}