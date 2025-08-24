import { TokenType } from '~/enums/tokenType.enum'

// payload cho jwt token
export interface JwtPayloadDto {
  userId: string
  username: string
  role: string
  tokenType: TokenType
}
