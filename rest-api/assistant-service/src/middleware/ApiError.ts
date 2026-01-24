import { StatusCodes } from 'http-status-codes'

export default class ApiError extends Error {
  public status: StatusCodes
  public message: string

  constructor(status: StatusCodes, message: string) {
    super(message)
    this.status = status
    this.message = message
    Error.captureStackTrace(this, this.constructor)
  }
}
