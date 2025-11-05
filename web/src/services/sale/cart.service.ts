import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import { CourseCart } from '@/types/cart.type'

class CartService {
  async addToCart(courseId: string) {
    const response = await axiosClient.axiosInstance.post('sale/cart', {
      courseId: courseId
    })
    return response.data
  }

  async removeFromCart(courseId: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.axiosInstance.delete(`sale/cart/${courseId}`)
    return response.data
  }

  async getCartItems(): Promise<ApiResponse<CourseCart[]>> {
    const response = await axiosClient.axiosInstance.get('sale/cart')
    return response.data
  }

  async getCartItemCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await axiosClient.axiosInstance.get('sale/cart/count')
    return response.data
  }
}

export default new CartService()
