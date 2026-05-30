import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import { CourseCompletionCertificate, CertificateVerifyResult } from '@/types/course-certificate'
import { parseFilenameFromContentDisposition, triggerBlobDownload } from '@/utils/download/triggerBlobDownload'

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

  async downloadCertificatePdf(id: string, fallbackFilename?: string): Promise<void> {
    const response = await axiosClient.axiosInstance.get(`learning/course-certificates/${id}/download`, {
      responseType: 'blob'
    })

    const filename = parseFilenameFromContentDisposition(
      response.headers['content-disposition'],
      fallbackFilename ?? `Learnova-Chung-chi.pdf`
    )

    triggerBlobDownload(new Blob([response.data], { type: 'application/pdf' }), filename)
  }

  async downloadCertificatePdfByCode(code: string): Promise<void> {
    const response = await axiosClient.axiosInstance.get(
      `learning/course-certificates/verify/${code}/download`,
      { responseType: 'blob' }
    )

    const filename = parseFilenameFromContentDisposition(
      response.headers['content-disposition'],
      `Learnova-Chung-chi-${code}.pdf`
    )

    triggerBlobDownload(new Blob([response.data], { type: 'application/pdf' }), filename)
  }
}

export default new CourseCertificateService()
