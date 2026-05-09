import type { ListQuery, Movie, MoviePayload } from '../types/movie'

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000').replace(/\/$/, '')

let authToken: string | null = null

export function setToken(token: string | null) {
  authToken = token
}

function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

async function readError(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json()
    if (data && typeof data === 'object' && 'message' in data) {
      return String((data as { message: unknown }).message)
    }
    if (data && typeof data === 'object' && 'detail' in data) {
      const d = (data as { detail: unknown }).detail
      if (typeof d === 'string') return d
      if (Array.isArray(d)) {
        return d
          .map((item) => {
            if (item && typeof item === 'object' && 'msg' in item) {
              return String((item as { msg: unknown }).msg)
            }
            return JSON.stringify(item)
          })
          .join(' ')
      }
    }
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed'
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export async function loginUser(username: string, password: string):Promise<string> {
  const res = await fetch(apiUrl('/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new ApiError(res.status, await readError(res))
  const data = await res.json()
  setToken(data.token)
  return data.token
}

export async function registerUser(username: string, password: string): Promise<void> {
  const res = await fetch(apiUrl('/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new ApiError(res.status, await readError(res))
}

export async function listMovies(query: ListQuery = {}): Promise<Movie[]> {
  const sp = new URLSearchParams()
  if (query.q?.trim()) sp.set('q', query.q.trim())
  if (query.genre?.trim()) sp.set('genre', query.genre.trim())
  if (query.sort) sp.set('sort', query.sort)
  if (query.order) sp.set('order', query.order)
  const qs = sp.toString()
  const res = await fetch(apiUrl(`/movies${qs ? `?${qs}` : ''}`), {
    headers: getHeaders()
  })
  if (!res.ok) throw new ApiError(res.status, await readError(res))
  return res.json() as Promise<Movie[]>
}

export async function getMovie(id: string): Promise<Movie> {
  const res = await fetch(apiUrl(`/movies/${id}`), {
    headers: getHeaders()
  })
  if (!res.ok) throw new ApiError(res.status, await readError(res))
  return res.json() as Promise<Movie>
}

export async function createMovie(body: MoviePayload): Promise<Movie> {
  const res = await fetch(apiUrl('/movies'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new ApiError(res.status, await readError(res))
  return res.json() as Promise<Movie>
}

export async function updateMovie(id: string, body: MoviePayload): Promise<Movie> {
  const res = await fetch(apiUrl(`/movies/${id}`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new ApiError(res.status, await readError(res))
  return res.json() as Promise<Movie>
}

export async function deleteMovie(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/movies/${id}`), { 
    method: 'DELETE',
    headers: getHeaders()
  })
  if (!res.ok) throw new ApiError(res.status, await readError(res))
}
