import { Router } from 'express';
import discountController from '~/controllers/discount.controller';

const router = Router();

router.get('/all-valid', discountController.getAllValidDiscounts);

export default router;
