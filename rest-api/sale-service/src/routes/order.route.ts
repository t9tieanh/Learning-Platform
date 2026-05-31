import { Router } from 'express';
import orderController from '~/controllers/order.controller';
import validateDto from '~/middleware/validateDto.midleware';
import { ApplyDiscountDto, CreateOrderDto, CreatePaymentUrlDto } from '~/dto/request/order.dto'
import Authentication from '~/middleware/auth.midleware';

export const orderRouter = Router();
orderRouter.get('/verify-order/vnpay', orderController.verifyOrderForVnpay);
orderRouter.get('/verify-order/momo', orderController.verifyOrderForMomo);
orderRouter.get('/verify-vip-order/vnpay', orderController.verifyVipOrderForVnpay);
orderRouter.get('/verify-vip-order/momo', orderController.verifyVipOrderForMomo);
orderRouter.get('/verify-order/payos', orderController.verifyOrderForPayos);
orderRouter.get('/verify-vip-order/payos', orderController.verifyVipOrderForPayos);
orderRouter.get('/cancel-order/payos', orderController.cancelOrderForPayos);
orderRouter.get('/cancel-vip-order/payos', orderController.cancelOrderForPayos);
orderRouter.post('/payment/payos/webhook', orderController.payosWebhook);
orderRouter.use(Authentication());

orderRouter.post('/', validateDto(CreateOrderDto), orderController.createOrder);
orderRouter.get('/', orderController.getOrder);
orderRouter.get('/:orderId/info', orderController.getOrderInfo);
orderRouter.post('/payment/:method', validateDto(CreatePaymentUrlDto), orderController.processPayment);
orderRouter.post('/vip-payment/:method', validateDto(CreatePaymentUrlDto), orderController.processVipPayment);
orderRouter.post('/apply-discount', validateDto(ApplyDiscountDto), orderController.applyDiscount);
orderRouter.get('/history', orderController.getOrderHistory);

export default orderRouter;