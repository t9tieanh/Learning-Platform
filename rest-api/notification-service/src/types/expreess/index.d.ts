import { Request } from 'express'
import { JwtPayloadDto } from '~/dto/request/Auth.dto'

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayloadDto
    data?: any
  }
}
