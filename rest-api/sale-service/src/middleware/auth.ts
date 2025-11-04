import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiError from '../middleware/ApiError';
import { JwtPayloadDto } from '../dto/request/auth.dto';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith('Bearer ')) 
    throw new ApiError(401, 'Thiếu token xác thực');
  try {
    const payload = jwt.verify(hdr.split(' ')[1], process.env.JWT_SECRET!) as JwtPayloadDto;
    if (payload.type !== 'access') 
      throw new ApiError(401, 'Token không hợp lệ, lưu ý không dùng refeshToken để truy cập !');
    req.user = payload;
    next();
  } catch(e: any) {
    return next(new ApiError(e.status || 401, 'Token không hợp lệ'));
  }
};
