import { Request, Response, NextFunction } from 'express';
import orderService from '~/service/models/order.service';
import sendResponse from '~/dto/response/send-response';
import { env } from '~/config/env'
import ApiError from '~/middleware/ApiError';
import orderPaymentService from '~/service/models/order-payment.service';
import orderHistoryService from '~/service/models/order-history.service';
import orderVerifyRedirectService from '~/service/utils/order-verify-redirect.service';
import { PaymentProviderEnum } from '~/enums/paymentProvider.enum';
import Logger from '~/utils/logger';
import { Webhook } from '@payos/node';

class OrderController {
    async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.sub;

            const orderData = req.data;

            const newOrder = await orderService.createOrder(orderData, userId as string);
            sendResponse(res, {
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
            sendResponse(res, {
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
            sendResponse(res, {
                code: 200,
                message: 'Xử lý thanh toán thành công !',
                result: paymentResult
            });
        } catch (error) {
            next(error);
        }
    }

    async processVipPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.sub;
            const paymentMethod = req.params.method;
            const ipAddress = req.ip;
            const { email } = req.data;

            const paymentResult = await orderService.processVipPayment(userId as string, email, paymentMethod, ipAddress);
            sendResponse(res, {
                code: 200,
                message: 'Khởi tạo thanh toán VIP thành công !',
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
            sendResponse(res, {
                code: 200,
                message: 'Áp dụng mã giảm giá thành công !',
                result: updatedOrder
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyOrderForVnpay(req: Request, res: Response, next: NextFunction) {
        return orderVerifyRedirectService.handleVerifyRedirect(
            res,
            req.query,
            PaymentProviderEnum.VNPAY,
            () => orderPaymentService.verifyOrderForVnPay(req.query)
        );
    }

    async verifyOrderForMomo(req: Request, res: Response, next: NextFunction) {
        return orderVerifyRedirectService.handleVerifyRedirect(
            res,
            req.query,
            PaymentProviderEnum.MOMO,
            () => orderPaymentService.verifyOrderForMomo(req.query)
        );
    }

    async verifyVipOrderForVnpay(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query;
            const verificationResult = await orderPaymentService.verifyVipOrderForVnpay(query);
            if (!verificationResult.isSuccess) {
                sendResponse(res, {
                    code: 400,
                    message: 'Xác thực đơn vip thất bại !',
                    result: verificationResult
                });
                return;
            }
            return res.redirect(env.WEB_URL + 'vip-success/' + verificationResult.orderId);
        } catch (error) {
            next(error);
        }
    }

    async verifyVipOrderForMomo(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query;
            const verificationResult = await orderPaymentService.verifyVipOrderForMomo(query);
            if (!verificationResult.isSuccess) {
                return res.redirect(env.WEB_URL + verificationResult.orderId);
            }
            return res.redirect(env.WEB_URL + 'vip-success/' + verificationResult.orderId);
        } catch (error) {
            next(error);
        }
    }

    async verifyOrderForPayos(req: Request, res: Response, next: NextFunction) {
        return orderVerifyRedirectService.handleVerifyRedirect(
            res,
            req.query,
            PaymentProviderEnum.PAYOS,
            () => orderPaymentService.verifyOrderForPayos(req.query)
        );
    }

    async verifyVipOrderForPayos(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query;
            const verificationResult = await orderPaymentService.verifyVipOrderForPayos(query);
            if (!verificationResult.isSuccess) {
                return res.redirect(env.WEB_URL + verificationResult.orderId);
            }
            return res.redirect(env.WEB_URL + 'vip-success/' + verificationResult.orderId);
        } catch (error) {
            next(error);
        }
    }

    async cancelOrderForPayos(req: Request, res: Response, next: NextFunction) {
        try {
            return res.redirect(env.WEB_URL);
        } catch (error) {
            next(error);
        }
    }

    async payosWebhook(req: Request, res: Response) {
        try {
            const result = await orderPaymentService.handlePayosWebhook(req.body as Webhook);
            Logger.info(
                `PayOS webhook OK order processed (alreadyCompleted=${result.alreadyCompleted}, refundNotified=${result.refundNotified})`
            );
            return res.status(200).json({ error: 0, message: 'Ok' });
        } catch (err) {
            Logger.error(`PayOS webhook failed: ${err}`);
            const status = err instanceof ApiError ? err.status : 500;
            const isClientError = status >= 400 && status < 500;
            if (isClientError) {
                return res.status(400).json({
                    error: -1,
                    message: err instanceof Error ? err.message : 'Invalid webhook',
                });
            }
            return res.status(200).json({ error: 0, message: 'Ok' });
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
            sendResponse(res, {
                code: 200,
                message: 'Lấy thông tin đơn hàng thành công !',
                result: data
            });
        } catch (error) {
            next(error);
        }
    }

    async getOrderHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                throw new ApiError(401, 'Bạn không có quyền truy cập !');
            }

            const history = await orderHistoryService.getOrderHistoryByUserId(userId as string);
            sendResponse(res, {
                code: 200,
                message: 'Lấy lịch sử đơn hàng thành công !',
                result: history
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new OrderController();