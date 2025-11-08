import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import { Order, OrderItem, OrderResponse } from '@/types/order.type'

class OrderService {
  async createOrder(courseIds: string[]): Promise<
    ApiResponse<{
      items: OrderItem[]
      user_id: string
      customer_name: string
      customer_email: string
      total: number
      status: 'Unconfirmed' | 'Confirmed' | 'Cancelled'
    }>
  > {
    const response = await axiosClient.axiosInstance.post('/sale/orders', {
      items: courseIds.map((id) => {
        return { courseId: id }
      })
    })
    return response.data
  }

  async getOrder(): Promise<ApiResponse<Order>> {
    const response = await axiosClient.axiosInstance.get('/sale/orders')
    return response.data
  }

  async applyDiscount(discountCode: string): Promise<ApiResponse<Order>> {
    const response = await axiosClient.axiosInstance.post('/sale/orders/apply-discount', {
      discountCode
    })
    return response.data
  }

  async processPayment(paymentMethod: 'momo' | 'VNPAY', email: string): Promise<ApiResponse<OrderResponse>> {
    const response = await axiosClient.axiosInstance.post(`/sale/orders/payment/${paymentMethod}`, {
      email
    })
    return response.data
  }

  async getOrderInfo(orderId: string): Promise<ApiResponse<Order>> {
    const response = await axiosClient.axiosInstance.get(`/sale/orders/${orderId}/info`)
    return response.data
  }
}

export default new OrderService()
