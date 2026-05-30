import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'
import { CourseCompletionCertificate, CertificateVerifyResult } from '@/types/course-certificate'

class CourseCertificateService {
  async getMyCertificates(): Promise<ApiResponse<CourseCompletionCertificate[]>> {
    const response = await axiosClient.axiosInstance.get('learning/course-certificates/self')
    return response.data
  }

  async getCertificate(id: string): Promise<ApiResponse<CourseCompletionCertificate>> {
    const response = await axiosClient.axiosInstance.get(`learning/course-certificates/${id}`)
    return response.data
  }

  async verifyCertificate(code: string): Promise<ApiResponse<CertificateVerifyResult>> {
    const response = await axiosClient.axiosInstance.get(`learning/course-certificates/verify/${code}`)
    return response.data
  }
}

export default new CourseCertificateService()
