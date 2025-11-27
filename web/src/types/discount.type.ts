export enum DiscountType {
  FIXED = 'FIXED',
  PERCENT = 'PERCENT'
}

export interface Discount {
  id: string
  name: string
  code: string
  value: number
  type: DiscountType
  minOrderValue?: number
  maxDiscount?: number
  startDate: string // ISO date
  endDate: string // ISO date
  isActive?: boolean
}
