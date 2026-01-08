import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/useAuth.stores'

function getAccessToken(): string | null {
  try {
    const tokenFromStore = useAuthStore.getState().data?.accessToken
    if (tokenFromStore) return tokenFromStore
  } catch {
    // ignore
  }
  try {
    const persisted = localStorage.getItem('user-storage')
    if (persisted) {
      const parsed = JSON.parse(persisted)
      const token = parsed?.state?.data?.accessToken as string | undefined
      if (token) return token
    }
  } catch {
    // ignore
  }
  const legacy = localStorage.getItem('access_token')
  return legacy
}

class AxiosClient {
  public axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: (import.meta.env.VITE_API as string) + '/api/v1',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
    this._initializeInterceptors()
  }

  private _initializeInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // Lấy access_token từ Zustand store (persist) hoặc localStorage
        const token = getAccessToken()
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
