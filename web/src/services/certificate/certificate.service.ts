import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

export type CreateCertReq = {
    title?: string
    organization?: string
    credentialUrl: string
    imageUrl?: string
    issueDate?: string
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

    async deleteCertificate(certificateId: string): Promise<ApiResponse<Boolean | any>> {
        const response = await axiosClient.axiosInstance.delete('user/del-certificate', {
            params: { id: certificateId }
        })
        return response.data
    }
}

export default new CertificateService()
