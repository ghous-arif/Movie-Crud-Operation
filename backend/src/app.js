const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const movieRoutes = require('./movieRoutes')
const { authSchema, formatZodError } = require('./schemas')
const userStore = require('./userStore')

// Attribution: learning approach inspired by Justin Fletcher's REST/Expo tutorial patterns (module teaching materials).
const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
]

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(null, true)
    },
  })
)

app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h'

app.get('/', (req, res) => {
  res.json({
    service: 'Movie Library API',
    movies: '/movies',
  })
})

app.post('/register', (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json(formatZodError(parsed.error))
  const { username, password } = parsed.data
  try {
    userStore.createUser({ username, password })
    return res.status(201).json({ message: 'User created' })
  } catch (e) {
    if (e && typeof e === 'object' && e.code === 'USER_EXISTS') {
      return res.status(400).json({ message: 'User already exists' })
    }
    return res.status(500).json({ message: 'Failed to create user' })
  }
})

app.post('/login', (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json(formatZodError(parsed.error))
  const { username, password } = parsed.data
  const user = userStore.findByUsername(username)
  if (!user || !userStore.verifyPassword(user, password)) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
  return res.json({ token })
})

// Auth middleware for movies
app.use('/movies', (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (!payload || typeof payload !== 'object' || !('username' in payload)) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    req.user = String(payload.username)
    return next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}, movieRoutes)

module.exports = app
