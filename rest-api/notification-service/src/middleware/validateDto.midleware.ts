import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import ApiError from './ApiError'
import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'

const validateDto = (dtoClass: any) => async (req: Request, res: Response, next: NextFunction) => {
  const payload: any = {
    ...req.body
  }

  // Nếu có file được upload thì thêm buffer & fileName
  if (req.file && req.file.buffer) {
    payload.image = req.file.buffer
    payload.fileName = req.file.originalname
  }

  const instance = plainToInstance(dtoClass, payload)

  if (!instance) throw new ApiError(StatusCodes.BAD_REQUEST, 'Dữ liệu không hợp lệ !')

  const errors = await validate(instance)

  if (errors.length > 0) {
    const messages = errors.flatMap((e) => (e.constraints ? Object.values(e.constraints) : ['Dữ liệu không hợp lệ']))
    throw new ApiError(400, messages.toString())
  }

  req.data = instance
  next()
}

export default validateDto
