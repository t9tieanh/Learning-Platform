import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/useAuth.stores'
import axiosAuthUtils from '@/utils/auth/axios.utils'

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
        const token = axiosAuthUtils.getAccessToken()
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

  private _handleError = async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (axiosAuthUtils.isRefreshing) {
        return new Promise(function (resolve, reject) {
          axiosAuthUtils.addToFailedQueue({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return this.axiosInstance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      axiosAuthUtils.isRefreshing = true

      const refreshToken = axiosAuthUtils.getRefreshToken()

      if (!refreshToken) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          (import.meta.env.VITE_API as string) + '/api/v1/auth/refresh',
          { token: refreshToken }
        )

        if (response.data?.code === 1009) {
          useAuthStore.getState().logout()
          window.location.href = '/auth'
          throw new Error('Refresh token invalid')
        }

        const { accessToken, refreshToken: newRefreshToken } = response.data.result

        const currentData = useAuthStore.getState().data
        if (currentData) {
          useAuthStore.getState().setData({
            ...currentData,
            accessToken: accessToken,
            refreshToken: newRefreshToken
          })
        }

        axiosAuthUtils.processQueue(null, accessToken)
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken
        return this.axiosInstance(originalRequest)
      } catch (err) {
        axiosAuthUtils.processQueue(err, null)
        useAuthStore.getState().logout()
        return Promise.reject(err)
      } finally {
        axiosAuthUtils.isRefreshing = false
      }
    }

    console.error('Axios error:', error.message)
    return Promise.reject(error)
  }
}

export default new AxiosClient()
