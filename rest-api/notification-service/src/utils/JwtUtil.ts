import { JwtPayloadDto } from '~/dto/request/Auth.dto'
import jwt from 'jsonwebtoken'
import { env } from '~/config/env'
import { TokenType } from '~/enums/tokenType.enum'
import ApiError from '~/middleware/ApiError'
import { StatusCodes } from 'http-status-codes'

export const GenerateSignature = async (payload: JwtPayloadDto) => {
  console.log('GenerateSignature', payload)

  return jwt.sign(payload, env.APP_SECRET, { expiresIn: '90d' })
}

/**
 *
 * @param authorizationHeader header authrization của request
 * @param expectedTokenType loại token xác thực
 * @returns payload đã decode
 */
export const ValidateSignature = async (
  authorizationHeader: string,
  expectedTokenType: TokenType
): Promise<JwtPayloadDto> => {
  const token = authorizationHeader?.split(' ')[1]

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token không tồn tại hoặc sai định dạng')
  }

  try {
    const decoded = jwt.verify(token, env.APP_SECRET) as JwtPayloadDto
    console.log('decode', decoded)

    return decoded
  } catch {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Token không hợp lệ hoặc đã hết hạn')
  }
}
