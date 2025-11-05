import prismaService from '../utils/prisma.service';
import ApiError from '~/middleware/ApiError';
import redisService from '../utils/redis.service';
import courseGrpcClient from '~/grpc/courseClient.grpc';

class CartService {
    async addToCart(cartId: string, courseId: string, isGuest = false): Promise<{
        id: string;
        cart_id: string;
        course_id: string;
    }> {
        if (isGuest) {
            // save cart for guest user in redis
            await redisService.sadd(`cart:${cartId}`, courseId);
            return {
                id: cartId,
                cart_id: cartId,
                course_id: courseId
            };
        }

        // DB work inside a transaction
        const createdItem = await prismaService.$transaction(async (tx) => {
            const cart = await tx.cart.findUnique({
                where: { id: cartId }
            });

            if (!cart) {
                throw new ApiError(404, 'Giỏ hàng không tồn tại !');
            }

            const existing = await tx.cart_Item.findFirst({
                where: {
                    cart_id: cart.id,
                    course_id: courseId
                }
            });

            if (existing) {
                throw new ApiError(400, 'Khóa học đã có trong giỏ hàng');
            }

            const item = await tx.cart_Item.create({
                data: {
                    cart_id: cart.id,
                    course_id: courseId
                }
            });
            return item;
        });

        // update redis after successful transaction
        try {
            await redisService.sadd(`cart:${cartId}`, courseId);
        } catch (e) {
            console.warn('redis sadd failed after addToCart:', e);
        }

        return createdItem;
    }

    async removeFromCart(cartId: string, courseId: string, isGuest = false): Promise<void> {
        if (isGuest) {
            await redisService.srem(`cart:${cartId}`, courseId);
            return;
        }

        // DB work inside a transaction
        await prismaService.$transaction(async (tx) => {
            const cart = await tx.cart.findUnique({
                where: { id: cartId }
            });

            if (!cart) {
                throw new ApiError(404, 'Giỏ hàng không tồn tại !');
            }

            const cartItem = await tx.cart_Item.findFirst({
                where: {
                    cart_id: cart.id,
                    course_id: courseId
                }
            });

            if (!cartItem) {
                throw new ApiError(404, 'Khóa học không có trong giỏ hàng');
            }

            await tx.cart_Item.delete({
                where: { id: cartItem.id }
            });
        });

        // update redis after successful transaction
        try {
            await redisService.srem(`cart:${cartId}`, courseId);
        } catch (e) {
            console.warn('redis srem failed after removeFromCart:', e);
        }
    }

    // del other cart related methods here
    async getCartItems(cartId: string): Promise<{
        courses: {
            id: string;
            title: string;
            short_description: string;
            long_description: string;
            thumbnail_url: string;
            rating: number;
            introductory_video: string;
            language: string;
            original_price: number;
            final_price: number;
            instructor: {
            id: string;
            name: string;
            email: string;
            image: string;
            };
        }[];
    }> {
        // find redis first
        const cart = await redisService.smembers(`cart:${cartId}`);

        // only use redis when set has members
        if (cart && cart.length > 0) {
            if (cart.length > 0) {
                const coursesResponse = await courseGrpcClient.getBulkCourses(cart);
                return { courses: coursesResponse.courses };
            }
        }

        // if not found in redis, find in db
        const dbCart = await prismaService.cart.findUnique({
            where: { id: cartId },
            include: { items: true }
        });

        if (!dbCart) {
            return { courses: [] };
        }

        const courseIds = dbCart.items.map(item => item.course_id as string);
        // set in redis for future use
        if (courseIds.length > 0) {
            courseIds.forEach(courseId => {
                redisService.sadd(`cart:${cartId}`, courseId);
            });
        }

        const coursesResponse = await courseGrpcClient.getBulkCourses(courseIds);
        return { courses: coursesResponse.courses };
    }

    async getCartItemCount(cartId: string): Promise<number> {
         // find redis first
        const cart = await redisService.smembers(`cart:${cartId}`);

        // only use redis when set has members
        if (cart && cart.length > 0) {
            if (cart.length > 0) {
                return cart.length;
            }
        }

        // if not found in redis, find in db
        const dbCart = await prismaService.cart.findUnique({
            where: { id: cartId },
            include: { items: true }
        });

        if (!dbCart) {
            return 0;
        }

        return dbCart.items.length;
    }
}

export default new CartService();