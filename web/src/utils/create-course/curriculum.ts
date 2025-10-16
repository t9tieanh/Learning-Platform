export interface Chapter {
  id: string
  title: string
  isOpen: boolean
  description?: string
  position?: number
  lectures: Lecture[]
}

export interface Lecture {
  id: string
  title: string
  content: string
  position: number
  isPublic: boolean
  url: string
  type: 'video' | 'article'
}
