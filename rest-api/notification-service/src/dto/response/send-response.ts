import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'

interface ApiResponse<T> {
  code: StatusCodes
  message: string
  result: T
}

const sendResponse = <T>(res: Response, result: ApiResponse<T>) => {
  res.status(result.code).json(result)
}

export default sendResponse
