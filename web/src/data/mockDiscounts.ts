import { Discount, DiscountType } from '@/types/discount.type'

export const mockDiscounts: Discount[] = [
  {
    id: '1',
    name: 'Khuyến mãi tháng 11',
    code: 'KMAI11',
    value: 50000,
    type: DiscountType.FIXED,
    minOrderValue: 100000,
    startDate: '2024-11-01T00:00:00',
    endDate: '2024-11-30T23:59:59',
    isActive: true
  },
  {
    id: '2',
    name: 'Giảm giá sinh viên',
    code: 'STUDENT20',
    value: 20,
    type: DiscountType.PERCENT,
    maxDiscount: 500000,
    startDate: '2024-10-01T00:00:00',
    endDate: '2024-12-31T23:59:59',
    isActive: true
  },
  {
    id: '3',
    name: 'Flash sale 12/12',
    code: 'FLASH1212',
    value: 100000,
    type: DiscountType.FIXED,
    minOrderValue: 500000,
    maxDiscount: 300000,
    startDate: '2024-12-12T00:00:00',
    endDate: '2024-12-12T23:59:59',
    isActive: false
  },
  {
    id: '4',
    name: 'VIP member discount',
    code: 'VIP30',
    value: 30,
    type: DiscountType.PERCENT,
    maxDiscount: 1000000,
    startDate: '2024-09-01T00:00:00',
    endDate: '2025-08-31T23:59:59',
    isActive: true
  }
]
