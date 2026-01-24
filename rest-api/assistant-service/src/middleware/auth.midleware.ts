import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiError from './ApiError';
import { JwtPayloadDto } from '../dto/request/auth.dto';

// isBlock -> block request if token is invalid or token is missing
const Authentication = (isBlock = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const hdr = req.headers.authorization;
      if (!hdr?.startsWith('Bearer '))
        throw new ApiError(401, 'Thiếu token xác thực');
      const payload = jwt.verify(hdr.split(' ')[1], process.env.JWT_SECRET!) as JwtPayloadDto;
      req.user = payload;
      next();
    } catch(e: any) {
      if (isBlock) {
        return next(new ApiError(e.status || 401, 'Token không hợp lệ'));
      }
      next();
    }
  };
}

export default Authentication;