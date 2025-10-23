import { StatusCodes } from 'http-status-codes'

export default class ApiError extends Error {
  public status: StatusCodes
  public message: string

  constructor(status: StatusCodes, message: string) {
    super(message)
    this.status = status
    this.message = message

    // Ghi lại Stack Trace (dấu vết ngăn xếp) để thuận tiện cho việc debug
    Error.captureStackTrace(this, this.constructor)
  }
}
