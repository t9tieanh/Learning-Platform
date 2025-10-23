import { StatusCodes } from 'http-status-codes'
import multer, { FileFilterCallback } from 'multer'
import ApiError from '~/middleware/ApiError'
import path from 'path'
import { Request } from 'express'

// Multer config: lưu vào RAM (buffer) + lọc file ảnh
const upload = multer({
  storage: multer.memoryStorage(), // LƯU VÀO RAM (Buffer)
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase()

    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      return cb(new ApiError(StatusCodes.BAD_REQUEST, 'Loại file không được hỗ trợ'))
    }

    cb(null, true)
  },
  limits: {
    // giới hạn 5MB
    fileSize: 10 * 1024 * 1024
  }
})

export default upload
