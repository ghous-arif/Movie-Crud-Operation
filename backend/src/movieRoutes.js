const express = require('express')
const {
  movieCreateSchema,
  movieUpdateSchema,
  moviePatchSchema,
  listQuerySchema,
  formatZodError,
} = require('./schemas')
const store = require('./movieStore')

const router = express.Router()

router.get('/', (req, res) => {
  const parsed = listQuerySchema.safeParse({
    q: req.query.q,
    genre: req.query.genre,
    sort: req.query.sort ?? 'year',
    order: req.query.order ?? 'desc',
  })
  if (!parsed.success) {
    return res.status(422).json(formatZodError(parsed.error))
  }
  // Pass the logged-in user to filter movies
  const movies = store.listMovies({ ...parsed.data, user: req.user })
  res.json(movies)
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  if (!id) {
    return res.status(422).json({ detail: 'Invalid id' })
  }
  const movie = store.getById(id)
  if (!movie) {
    return res.status(404).json({ detail: 'Movie not found' })
  }
  // Only allow access to the user's own movie
  if (movie.createdBy && movie.createdBy !== req.user) {
    return res.status(404).json({ detail: 'Movie not found' })
  }
  res.json(movie)
})

router.post('/', (req, res) => {
  const parsed = movieCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json(formatZodError(parsed.error))
  }
  // Pass the logged-in user as owner
  const movie = store.createMovie(parsed.data, req.user)
  res.status(201).json(movie)
})

router.put('/:id', (req, res) => {
  const id = req.params.id
  if (!id) {
    return res.status(422).json({ detail: 'Invalid id' })
  }
  const parsed = movieUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json(formatZodError(parsed.error))
  }
  const existing = store.getById(id)
  if (!existing) {
    return res.status(404).json({ detail: 'Movie not found' })
  }
  // Only allow the owner to update
  if (existing.createdBy && existing.createdBy !== req.user) {
    return res.status(403).json({ detail: 'Not your movie' })
  }
  const movie = store.updateMovie(id, parsed.data)
  res.json(movie)
})

router.patch('/:id', (req, res) => {
  const id = req.params.id
  if (!id) {
    return res.status(422).json({ detail: 'Invalid id' })
  }
  const parsed = moviePatchSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json(formatZodError(parsed.error))
  }
  if (Object.keys(parsed.data).length === 0) {
    return res.status(422).json({
      detail: [{ loc: [], msg: 'At least one field required', type: 'validation_error' }],
    })
  }
  const existing = store.getById(id)
  if (!existing) {
    return res.status(404).json({ detail: 'Movie not found' })
  }
  if (existing.createdBy && existing.createdBy !== req.user) {
    return res.status(403).json({ detail: 'Not your movie' })
  }
  const movie = store.patchMovie(id, parsed.data)
  res.json(movie)
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  if (!id) {
    return res.status(422).json({ detail: 'Invalid id' })
  }
  const existing = store.getById(id)
  if (!existing) {
    return res.status(404).json({ detail: 'Movie not found' })
  }
  // Only allow the owner to delete
  if (existing.createdBy && existing.createdBy !== req.user) {
    return res.status(403).json({ detail: 'Not your movie' })
  }
  const ok = store.deleteMovie(id)
  if (!ok) {
    return res.status(404).json({ detail: 'Movie not found' })
  }
  res.status(204).send()
})

module.exports = router
