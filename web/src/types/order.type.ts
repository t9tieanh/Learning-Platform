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
  id: string
  type: 'COURSE' | 'VIP_SUBSCRIPTION'
  items: OrderItem[]
  user_id: string
  customer_name: string
  customer_email: string
  total: number
  status: OrderStatus
  ttl: number
  created_at?: string
  discount?: {
    code: string
    type: 'Percent' | 'Amount'
    value: number
    maxDiscount: number
  }
  vip_package?: {
    name: string
    duration_months: number
    description?: string
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
