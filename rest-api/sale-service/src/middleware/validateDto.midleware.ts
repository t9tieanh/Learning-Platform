import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import ApiError from './ApiError'
import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import  sendResponse from '../dto/response/send-response'

const validateDto = (dtoClass: any) => async (req: Request, res: Response, next: NextFunction) => {
  const payload: any = {
    ...req.body
  }

  const instance = plainToInstance(dtoClass, payload)

  if (!instance) throw new ApiError(StatusCodes.BAD_REQUEST, 'Dữ liệu không hợp lệ !')

  const errors = await validate(instance)

  if (errors.length > 0) {
    const messages = errors.flatMap((e) => (e.constraints ? Object.values(e.constraints) : ['Dữ liệu không hợp lệ']))
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: messages.join(', '),
    })
    return
  }

  req.data = instance
  next()
}

export default validateDto
