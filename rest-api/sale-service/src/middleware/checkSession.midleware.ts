import { Request, Response, NextFunction } from 'express';
import prismaService from '~/service/utils/prisma.service';
import crypto from 'crypto';
import redisService from '~/service/utils/redis.service';

const checkSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sess = req.session;
    const userId = req.user?.sub as string | undefined;

    // case: guest user with existing session cart -> ok
    if (sess && sess.cartId && !userId) {
      return next();
    }

    // case: logged-in user
    if (userId) {
      // if session has a non-guest cartId (presumably user's cart) -> keep it
      if (sess && sess.cartId && !sess.cartId.startsWith('guest-')) {
        return next();
      }

      // now: either no session cartId OR session cartId is guest- -> ensure user has a DB cart
      let userCart = await prismaService.cart.findUnique({
        where: { user_id: userId },
        select: { id: true }
      });

      if (!userCart) {
        userCart = await prismaService.cart.create({
          data: { user_id: userId },
          select: { id: true }
        });
      }

      // if there is a guest cart in session, merge Redis guest items into user's cart
      if (sess && sess.cartId && sess.cartId.startsWith('guest-')) {
        const guestKey = `cart:${sess.cartId}`;
        const courseIds = await redisService.smembers(guestKey);

        if (courseIds.length > 0) {
          // upsert cart items inside a transaction to avoid duplicates
          await prismaService.$transaction(async (tx) => {
            for (const courseId of courseIds) {
              const exists = await tx.cart_Item.findFirst({
                where: { cart_id: userCart!.id, course_id: courseId }
              });
              if (!exists) {
                await tx.cart_Item.create({
                  data: { cart_id: userCart!.id, course_id: courseId }
                });
              }
            }
          });

          // cleanup guest redis key
          try {
            await redisService.del(guestKey);
          } catch (e) {
            console.warn('Lỗi khi gộp cart của guest với user đã đăng nhập:', e);
          }
        }

        // set session to user's cart id after merge
        sess.cartId = userCart.id;
        return next();
      }

      // no guest cart in session -> just set session to user's cart id
      sess.cartId = userCart.id;
      return next();
    }

    // default: create a new guest cart id
    const cartId = crypto.randomBytes(16).toString('hex');
    if (!req.session) req.session = {} as any;
    req.session.cartId = `guest-${cartId}`;
    return next();

  } catch (err) {
    console.error('checkSession middleware error:', err);
    // fail-safe: create a guest id so subsequent handlers have a cartId
    const cartId = crypto.randomBytes(16).toString('hex');
    if (!req.session) req.session = {} as any;
    req.session.cartId = `guest-${cartId}`;
    return next();
  }
};

export default checkSession;