import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

class AxiosClient {
  public axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'http://localhost:8888/api/v1',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this._initializeInterceptors()
  }

  private _initializeInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // Lấy access_token từ localStorage thay vì AsyncStorage
        const token = localStorage.getItem('access_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: any) => Promise.reject(error)
    )

    this.axiosInstance.interceptors.response.use(this._handleResponse, this._handleError)
  }

  private _handleResponse(response: AxiosResponse): AxiosResponse {
    return response
  }

  private _handleError(error: AxiosError): Promise<unknown> {
    console.error('Axios error:', error.message)
    return Promise.reject(error)
  }
}

export default new AxiosClient()
