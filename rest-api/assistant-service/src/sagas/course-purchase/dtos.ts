export interface CoursePurchasedItemDto {
  course_id: string
}

export interface CoursePurchasedSyncPayload {
  user_id: string
  order_id: string
  items: CoursePurchasedItemDto[]
}
