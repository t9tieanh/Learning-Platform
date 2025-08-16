import { JwtPayloadDto } from '~/dto/request'

declare module 'socket.io' {
  interface Socket {
    user?: JwtPayloadDto
  }
}
