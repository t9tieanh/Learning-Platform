import { Router } from 'express';
import orderController from '~/controllers/order.controller';
import validateDto from '~/middleware/validateDto.midleware';
import { ApplyDiscountDto, CreateOrderDto } from '~/dto/request/order.dto'
import Authentication from '~/middleware/auth.midleware';

export const orderRouter = Router();
orderRouter.use(Authentication());

orderRouter.post('/', validateDto(CreateOrderDto), orderController.createOrder);
orderRouter.get('/', orderController.getOrder);
orderRouter.post('/payment/:method', orderController.processPayment);
orderRouter.post('/apply-discount', validateDto(ApplyDiscountDto), orderController.applyDiscount);

export default orderRouter;