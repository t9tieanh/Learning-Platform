import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import { AdminCertificateResponse, CertificateUpdateStatus, UpdateCertificateRequest } from '@/types/certificate'

export type CreateCertReq = {
  title?: string
  organization?: string
  credentialUrl: string
  imageUrl?: string
  issueDate?: string
  status?: string
}

export type CreateCertRes = {
  id?: string
  title: string
  organization: string
  credentialUrl: string
  imageUrl: string
  issueDate: string
}

class CertificateService {
  async createCertificate(userId: string, body: CreateCertReq): Promise<ApiResponse<CreateCertRes>> {
    const response = await axiosClient.axiosInstance.post('user/certificates', body, {
      headers: { 'X-User-Id': userId }
    })
    return response.data
  }

  async getCertificates(userId: string): Promise<ApiResponse<Array<CreateCertRes | any>>> {
    const response = await axiosClient.axiosInstance.get('user/certificates', {
      params: { userId }
    })
    return response.data
  }

  async deleteCertificate(certificateId: string): Promise<ApiResponse<boolean | any>> {
    const response = await axiosClient.axiosInstance.delete('user/del-certificate', {
      params: { id: certificateId }
    })
    return response.data
  }

  async adminGetCertificates(): Promise<ApiResponse<AdminCertificateResponse[]>> {
    const response = await axiosClient.axiosInstance.get('user/ad-certificates')
    return response.data
  }

  async updateCertificate(
    id: string,
    status: CertificateUpdateStatus,
    reason: string = ''
  ): Promise<ApiResponse<boolean>> {
    const body: UpdateCertificateRequest = {
      id,
      status,
      reason: status === 'confirmed' ? '' : reason ?? ''
    }
    const response = await axiosClient.axiosInstance.post('user/update-certificate', body)
    return response.data
  }
}

export default new CertificateService()
