import checkSession from '~/middleware/checkSession.midleware'
import { Router } from 'express';
import cartController from '~/controllers/cart.controller';
import validateDto from '~/middleware/validateDto.midleware';
import { AddToCartRequest } from '~/dto/request/cart.dto';
import Authentication from '~/middleware/auth.midleware';

export const cartRouter = Router();
cartRouter.use(Authentication(false));
cartRouter.use(checkSession);

cartRouter.post('/', validateDto(AddToCartRequest), cartController.addToCart);
cartRouter.get('/', cartController.getCartItems);
cartRouter.get('/count', cartController.getCartItemCount);
cartRouter.delete('/:courseId', cartController.removeFromCart);

export default cartRouter;