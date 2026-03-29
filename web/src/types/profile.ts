export type Profile = {
  image: string
  name: string
  phone: string | null
  description: string
  position: string | null
  email: string
  username: string
  isVip?: boolean
  expertises: {
    id: string
    name: string
    image: string
  }[]
}

export interface VipStatusResult {
  isVip: boolean
  durationMonths?: number
  activatedAt?: string
  expiresAt?: string
  daysRemaining?: number
}
