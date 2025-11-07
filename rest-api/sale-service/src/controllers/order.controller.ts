import { Request, Response, NextFunction } from 'express';
import orderService from '~/service/models/order.service';
import sendResposne from '~/dto/response/send-response';

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

            const paymentResult = await orderService.processPayment(userId as string, paymentMethod, ipAddress);
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
}

export default new OrderController();