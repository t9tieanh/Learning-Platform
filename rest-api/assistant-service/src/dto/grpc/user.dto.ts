export interface Expertise {
  id: string
  name: string
  image?: string
}

export interface Role {
  id: string
  name?: string
}

export interface UserGrpc {
  id: string
  name?: string
  image?: string
  phone?: string
  description?: string
  email?: string
  username?: string
  status?: string
  roles: Role[]
  expertises: Expertise[]
}