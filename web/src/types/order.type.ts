export interface OrderItem {
  course_id: string
  title: string
  price: number
  instructor_name: string
  image: string
}

export enum OrderStatus {
  Cancel = 'Cancel',
  Pending = 'Pending',
  Completed = 'Completed'
}

export interface Order {
  items: OrderItem[]
  user_id: string
  customer_name: string
  customer_email: string
  total: number
  status: OrderStatus
  ttl: number
  discount?: {
    code: string
    type: 'Percent' | 'Amount'
    value: number
    maxDiscount: number
  }
}

export interface OrderResponse {
  id: string
  user_id: string
  status: 'Pending' | 'Paid' | 'Cancelled' | string
  created_at: string
  updated_at: string
  customer_name: string
  customer_email: string
  total: number
  discount_id?: string
  payment: {
    payUrl: string
  }
}
