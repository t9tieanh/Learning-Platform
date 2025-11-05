import { Request, Response, NextFunction } from 'express';
import prismaService from '~/service/utils/prisma.service';
import crypto from 'crypto';

const checkSession = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.cartId) {
        return next();
    }

    if (req.user) {
        prismaService.cart.findUnique({
            where: {
                user_id: req.user.sub
            },
            select: {
                id: true
            }
        }).then(async cart => {
            if (cart) {
                req.session.cartId = cart.id;
                // cart found for user, use existing cart id
                return next();
            } else {
                // if no cart found for user, create a new cart id
                const newCart = await prismaService.cart.create({
                    data: {
                        user_id: req.user?.sub as string
                    }
                });
                req.session.cartId = newCart.id;
                return next();
            }
        });
        return;
    }

    // create a new cart id for guest user
    const cartId = crypto.randomBytes(16).toString('hex');
    req.session.cartId = cartId;
    next();
};

export default checkSession;