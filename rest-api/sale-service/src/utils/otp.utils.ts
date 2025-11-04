import { randomInt } from 'crypto'

export interface OtpDto {
  code: string
  createdAt: Date
  maxAttempts: number
  attempts: number
}

// Định nghĩa enum cho các lý do xác thực OTP
export enum OtpValidationReason {
  Expired = 'OTP đã hết hạn, vui lòng tạo lại !',
  MaxAttemptsExceeded = 'Bạn đã quá số lần thử OTP, vui lòng thử lại sau !',
  InvalidCode = 'OTP sai, xin vui lòng thử lại !'
}

export type OtpValidationResult = { success: true } | { success: false; reason: OtpValidationReason }

export class OTPUtil {
  static OTP_TTL_SECONDS = 300

  //Tạo mới 1 phiên OTP
  static create(length = 4, maxAttempts = 5): OtpDto {
    const code = Array.from({ length }, () => randomInt(0, 10)).join('')
    return {
      code,
      createdAt: new Date(),
      maxAttempts,
      attempts: 0
    }
  }

  static validate(otp: OtpDto, input: string): OtpValidationResult {
    // Kiểm tra số lần thử
    if (otp.attempts >= otp.maxAttempts) {
      return { success: false, reason: OtpValidationReason.MaxAttemptsExceeded }
    }

    // 3.Tăng counter
    otp.attempts++

    // 4. So sánh code
    if (input === otp.code) {
      return { success: true }
    } else {
      return { success: false, reason: OtpValidationReason.InvalidCode }
    }
  }

  /**
   * Trả về Date hết hạn dựa trên createdAt
   */
  static getExpireDateTime(otp: OtpDto): Date {
    return new Date(otp.createdAt.getTime() + this.OTP_TTL_SECONDS * 1000)
  }
}
