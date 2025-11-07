import prismaService from '~/service/utils/prisma.service';
import type { Discount } from '@prisma/client';
import ApiError from '~/middleware/ApiError';
import { DiscountType } from '@prisma/client'

class DiscountService {
    async getValidDiscountByCode(code: string, basePrice: number): Promise<Discount> {
        const discount = await prismaService.discount.findUnique({
            where: { code }
        });
        if (!discount) throw new ApiError(400, 'Mã giảm giá không hợp lệ !');

        const now = new Date();
        if (now < discount.startDate || now > discount.endDate) {
            throw new ApiError(400, 'Mã giảm giá không còn hiệu lực !');
        }

        if (discount.minOrderValue && basePrice < discount.minOrderValue) {
            throw new ApiError(400, 'Giá trị đơn hàng không đủ điều kiện áp dụng mã giảm giá !');
        }

        return discount;
    }

    async calculateDiscountedTotal(code: string, basePrice: number): Promise<{ discountedTotal: number; discount: Discount }> {
        const discount = await this.getValidDiscountByCode(code, basePrice);
        if (!discount) {
            throw new ApiError(400, 'Mã giảm giá không hợp lệ !');
        }

        let discountedTotal = basePrice;

        if (discount.type === DiscountType.Percent) {
            const rawDeduction = (basePrice * (discount.value / 100));
            const deduction = (typeof discount.maxDiscount === 'number') ? Math.min(rawDeduction, discount.maxDiscount) : rawDeduction;
            discountedTotal = basePrice - deduction;
        } else if (discount.type === DiscountType.Amount) {
            discountedTotal = basePrice - discount.value;
        }

        if (discountedTotal < 0) discountedTotal = 0;

        return { discountedTotal, discount };
    }
}

export default new DiscountService();