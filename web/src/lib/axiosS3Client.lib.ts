/**
 * Axios client for S3 uploads (no authentication headers)
 * Presigned URLs already contain auth info in query parameters
 */

import axios, { AxiosInstance } from 'axios'

class AxiosS3Client {
  public axiosInstance: AxiosInstance

  constructor() {
    // Create instance WITHOUT auth interceptors
    // Presigned URLs handle authentication via query parameters
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      // Don't include credentials since presigned URL has them
      withCredentials: false
    })
  }
}

export default new AxiosS3Client()
