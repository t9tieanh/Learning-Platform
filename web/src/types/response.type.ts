// cấu trúc của api response trả về client
export interface ApiResponse<T> {
  code: number
  message?: string
  result?: T
}
