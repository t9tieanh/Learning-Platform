import { Router } from 'express';
import orderController from '~/controllers/order.controller';
import validateDto from '~/middleware/validateDto.midleware';
import { ApplyDiscountDto, CreateOrderDto, CreatePaymentUrlDto } from '~/dto/request/order.dto'
import Authentication from '~/middleware/auth.midleware';

export const orderRouter = Router();
orderRouter.get('/verify-order', orderController.verifyOrder);
orderRouter.use(Authentication());

orderRouter.post('/', validateDto(CreateOrderDto), orderController.createOrder);
orderRouter.get('/', orderController.getOrder);
orderRouter.get('/:orderId/info', orderController.getOrderInfo);
orderRouter.post('/payment/:method',  validateDto(CreatePaymentUrlDto), orderController.processPayment);
orderRouter.post('/apply-discount', validateDto(ApplyDiscountDto), orderController.applyDiscount);

export default orderRouter;