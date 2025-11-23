export interface HistoryOrderItem {
  course_id: string
  course_name: string
  image: string
}

export interface HistoryOrder {
  id: string
  total: number
  created_at: string
  items: HistoryOrderItem[]
}
