import { Request, Response, NextFunction } from 'express';
import { AddToCartRequest } from '~/dto/request/cart.dto';
import sendResponse from '~/dto/response/send-response';
import ApiError from '~/middleware/ApiError';
import cartService from '~/service/models/cart.service';

class CartController {
    async addToCart(req: Request, res: Response, next: NextFunction) {
        try {
            const { courseId } = req.data as AddToCartRequest;
            const cart = await cartService.addToCart(req.session.cartId as string, courseId, req.user?.sub as string);
            sendResponse(res, {
                code: 200,
                message: 'Thêm khóa học vào giỏ hàng thành công',
                result: cart
            });
        } catch (error) {
            next(error);
        }
    }

    async getCartItems(req: Request, res: Response, next: NextFunction) {
        try {
            const cartItems = await cartService.getCartItems(req.session.cartId as string);
            sendResponse(res, {
                code: 200,
                message: 'Lấy danh sách giỏ hàng thành công',
                result: cartItems.courses
            });
        } catch (error) {
            next(error);
        }
    }

    async getCartItemCount(req: Request, res: Response, next: NextFunction) {
        try {
            const cartItemCount = await cartService.getCartItemCount(req.session.cartId as string);
            sendResponse(res, {
                code: 200,
                message: 'Lấy số lượng giỏ hàng thành công',
                result: {
                    count: cartItemCount
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async removeFromCart(req: Request, res: Response, next: NextFunction) {
        try {
            const { courseId } = req.params;

            if (!courseId || Array.isArray(courseId)) {
                throw new ApiError(400, 'courseId không hợp lệ');
            }

            await cartService.removeFromCart(req.session.cartId as string, courseId as string, !req.user);
            sendResponse(res, {
                code: 200,
                message: 'Xoá khóa học khỏi giỏ hàng thành công'
            });
        } catch (error) {
            next(error);
        }
    }
}


export default new CartController();