import { Request, Response, NextFunction } from 'express'
import { ValidateSignature } from '~/utils/JwtUtil'
import { TokenType } from '~/enums/tokenType.enum'

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    const payload = await ValidateSignature(authHeader || '', TokenType.ACCESS_TOKEN)

    // Lưu user vào request để các middleware / controller sử dụng
    req.user = payload
    next()
  } catch (error) {
    next(error) // sẽ được xử lý ở middleware handle error của bạn
  }
}

export default authenticate
