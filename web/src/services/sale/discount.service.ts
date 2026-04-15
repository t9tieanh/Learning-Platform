import axiosClient from '@/lib/axiosClient.lib'

const discountService = {
    getAllValidDiscounts: async () => {
        const response = await axiosClient.axiosInstance.get('/sale/discounts/all-valid')
        return response.data
    }
}

export default discountService
