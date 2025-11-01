export type Profile = {
  image: string
  name: string
  phone: string | null
  description: string
  position: string | null
  email: string
  username: string
  expertises: {
    id: string
    name: string
    image: string
  }[]
}
