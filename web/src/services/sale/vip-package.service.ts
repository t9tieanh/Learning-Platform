import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import { VipPackage } from '@/types/vip-package.type'

class VipPackageService {
  async getVipPackages(): Promise<ApiResponse<VipPackage[]>> {
    const response = await axiosClient.axiosInstance.get('/sale/vip-packages')
    return response.data
  }

  async getVipPackageByDuration(duration: number): Promise<ApiResponse<VipPackage>> {
    const response = await axiosClient.axiosInstance.get(`/sale/vip-packages/${duration}`)
    return response.data
  }
}

export default new VipPackageService()
