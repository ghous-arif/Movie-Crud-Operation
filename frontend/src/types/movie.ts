export type Movie = {
  _id: string
  title: string
  director?: string | null
  year: number
  genre?: string | null
  rating?: number | null
}

export type MoviePayload = {
  title: string
  director?: string | null
  year: number
  genre?: string | null
  rating?: number | null
}

export type ListQuery = {
  q?: string
  genre?: string
  sort?: 'year' | 'rating'
  order?: 'asc' | 'desc'
}
