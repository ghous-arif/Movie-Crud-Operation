const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const dataFile =
  process.env.MOVIES_DATA_FILE || path.join(__dirname, '..', 'movies.json')

let state = { movies: [] }

function load() {
  if (!fs.existsSync(dataFile)) {
    state = { movies: [] }
    return
  }
  try {
    const raw = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
    state = {
      movies: Array.isArray(raw.movies) ? raw.movies : []
    }
  } catch {
    state = { movies: [] }
  }
}

function persist() {
  const dir = path.dirname(dataFile)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2), 'utf8')
}

load()

function rowToMovie(row) {
  return {
    _id: row._id || String(row.id),
    title: row.title,
    director: row.director,
    year: row.year || row.release_year,
    genre: row.genre,
    rating: row.rating,
    createdBy: row.createdBy || null,
    createdAt: row.createdAt || null,
  }
}

function matchesQ(movie, q) {
  if (!q || !q.trim()) return true
  const t = q.trim().toLowerCase()
  const title = (movie.title || '').toLowerCase()
  const genre = (movie.genre || '').toLowerCase()
  return title.includes(t) || genre.includes(t)
}

function matchesGenre(movie, genre) {
  if (!genre || !genre.trim()) return true
  const g = genre.trim().toLowerCase()
  return (movie.genre || '').toLowerCase().includes(g)
}

function listMovies({ q, genre, sort, order, user }) {
  const movies = state.movies
    .map(rowToMovie)
    .filter((m) => matchesQ(m, q) && matchesGenre(m, genre) && (user ? m.createdBy === user : true))

  const dir = order === 'asc' ? 1 : -1
  const key = sort === 'rating' ? 'rating' : 'year'

  movies.sort((a, b) => {
    const av = Number(a[key] ?? 0)
    const bv = Number(b[key] ?? 0)
    if (av === bv) {
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    }
    return (av - bv) * dir
  })

  return movies
}

function getById(id) {
  const row = state.movies.find((m) => m._id === id)
  return row ? rowToMovie(row) : null
}

function createMovie(data, user) {
  const _id = crypto.randomUUID()
  const row = { _id, ...data, createdBy: user, createdAt: new Date().toISOString() }
  state.movies.push(row)
  persist()
  return rowToMovie(row)
}

function updateMovie(id, data) {
  const idx = state.movies.findIndex((m) => m._id === id)
  if (idx === -1) return null
  // Preserve createdBy and createdAt from the original row
  const original = state.movies[idx]
  const row = { _id: id, ...data, createdBy: original.createdBy, createdAt: original.createdAt }
  state.movies[idx] = row
  persist()
  return rowToMovie(row)
}

function patchMovie(id, patch) {
  const idx = state.movies.findIndex((m) => m._id === id)
  if (idx === -1) return null
  const row = { ...state.movies[idx], ...patch, createdAt: state.movies[idx].createdAt }
  state.movies[idx] = row
  persist()
  return rowToMovie(row)
}

function deleteMovie(id) {
  const before = state.movies.length
  state.movies = state.movies.filter((m) => m._id !== id)
  if (state.movies.length === before) return false
  persist()
  return true
}

module.exports = {
  listMovies,
  getById,
  createMovie,
  updateMovie,
  patchMovie,
  deleteMovie,
}
