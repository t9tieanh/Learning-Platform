export interface Discount {
  code: string
  type: 'Percent' | 'Fixed' | string
  value: number
  maxDiscount?: number
}

export interface Item {
  course_id: string
  price: number
  title: string
  instructor_name: string
  image: string
}

export interface NotificationPayload {
  user_id: string
  customer_name: string
  customer_email: string
  total: number
  status: string
  discount?: Discount
  items: Item[]
}
