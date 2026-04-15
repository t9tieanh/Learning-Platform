import { Request, Response, NextFunction } from 'express';
import discountService from '~/service/models/discount.service';

class DiscountController {
    async getAllValidDiscounts(req: Request, res: Response, next: NextFunction) {
        try {
            const discounts = await discountService.getAllValidDiscounts();
            res.status(200).json({
                code: 200,
                message: 'Lấy danh sách mã giảm giá thành công',
                result: discounts
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DiscountController();
