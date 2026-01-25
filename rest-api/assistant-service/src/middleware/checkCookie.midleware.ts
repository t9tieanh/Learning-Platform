import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtPayloadDto } from '../dto/request/auth.dto';
import { env } from '~/config/env';

const checkCookie = (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Check Authorization header for User ID
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayloadDto;
                req.user = payload;
                // If user is logged in, we use their user ID, no need for guest cookie logic
                // But we might want to attach a session ID if needed later
                return next();
            } catch (error) {
                // Token invalid, treat as guest or error? 
                // For this middleware, let's treat invalid token as fall-through to guest logic 
                // or just ignore and let auth middleware handle strict checks if needed.
                // But here we want to identify the user.
                console.warn('Token invalid in checkCookie, falling back to guest logic');
            }
        }

        // 2. If no valid user, check for guest cookie
        let guestId = req.cookies?.[env.COOKIE_NAME];

        if (!guestId) {
            // Generate new guest ID
            guestId = `guest-${crypto.randomBytes(16).toString('hex')}`;

            // Set cookie
            res.cookie(env.COOKIE_NAME, guestId, {
                httpOnly: true,
                secure: false, // Set to true in production with HTTPS
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'lax'
            });
        }

        // Attach guest ID to request (maybe in a custom property or reuse req.user for uniformity?)
        // Let's attach to req.session for consistency with sale-service logic if we had session, 
        // but here we just need an ID.
        // Let's attach to req.guestId
        (req as any).guestId = guestId;

        next();
    } catch (error) {
        console.error('Error in checkCookie middleware:', error);
        next();
    }
};

export default checkCookie;
