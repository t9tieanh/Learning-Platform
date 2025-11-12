import { Request, Response, NextFunction } from 'express';
import orderService from '~/service/models/order.service';
import sendResposne from '~/dto/response/send-response';
import { env } from '~/config/env'
import ApiError from '~/middleware/ApiError';

class OrderController {
    async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.sub;

            const orderData = req.data;

            const newOrder = await orderService.createOrder(orderData, userId as string);
            sendResposne(res, {
                code: 200,
                message: 'Tạo order thành công !',
                result: newOrder
            });
        } catch (error) {
            next(error);
        }
    }

    async getOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.sub;

            const order = await orderService.getOrder(userId as string);
            sendResposne(res, {
                code: 200,
                message: 'Lấy order thành công !',
                result: order
            });
        } catch (error) {
            next(error);
        }
    }

    async processPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.sub;
            const paymentMethod = req.params.method;
            const ipAddress = req.ip;
            const { email } = req.data;

            const paymentResult = await orderService.processPayment(userId as string, email, paymentMethod, ipAddress);
            sendResposne(res, {
                code: 200,
                message: 'Xử lý thanh toán thành công !',
                result: paymentResult
            });
        } catch (error) {
            next(error);
        }
    }

    async applyDiscount(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.sub;
            const { discountCode } = req.data;

            const updatedOrder = await orderService.applyDiscount(userId as string, discountCode);
            sendResposne(res, {
                code: 200,
                message: 'Áp dụng mã giảm giá thành công !',
                result: updatedOrder
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query;
            const verificationResult = await orderService.verifyOrder(query);
            if (!verificationResult.isSuccess) {
                sendResposne(res, {
                    code: 400,
                    message: 'Xác thực đơn hàng thất bại !',
                    result: verificationResult
                });
                return;
            }
            return res.redirect(env.WEB_URL + verificationResult.orderId);
        } catch (error) {
            next(error);
        }
    }

    async getOrderInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;

            if (!orderId || Array.isArray(orderId)) {
                throw new ApiError(400, 'orderId không hợp lệ');
            }

            if (!req?.user?.sub)
                throw new ApiError(401, 'Bạn không có quyền truy cập !');

            const data = await orderService.getOrderInfo(req.user.sub as string, orderId);
            sendResposne(res, {
                code: 200,
                message: 'Lấy thông tin đơn hàng thành công !',
                result: data
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new OrderController();