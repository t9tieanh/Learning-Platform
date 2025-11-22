import { TokenType } from '~/enums/tokenType.enum'

// payload cho jwt token
export interface JwtPayloadDto {
  sub: string
  scope: string[] // thường là mảng scope, có thể rỗng
  iss: string
  exp: number // unix timestamp (seconds)
  type: TokenType | string // 'ACCESS_TOKEN' | 'REFRESH_TOKEN' ...
  iat: number // issued at (seconds)
  jti: string // token id
}
