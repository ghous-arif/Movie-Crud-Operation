const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const dataFile =
  process.env.USERS_DATA_FILE || path.join(__dirname, '..', 'users.json')

let state = { users: [] }

function load() {
  if (!fs.existsSync(dataFile)) {
    state = { users: [] }
    return
  }
  try {
    const raw = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
    state = { users: Array.isArray(raw.users) ? raw.users : [] }
  } catch {
    state = { users: [] }
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

function ensureSeedAdmin() {
  if (state.users.some((u) => u.username === 'admin')) return
  const passwordHash = bcrypt.hashSync('1234', 10)
  state.users.push({
    id: 'admin',
    username: 'admin',
    passwordHash,
    createdAt: new Date().toISOString(),
  })
  persist()
}

ensureSeedAdmin()

function findByUsername(username) {
  return state.users.find((u) => u.username === username) || null
}

function createUser({ username, password }) {
  const existing = findByUsername(username)
  if (existing) {
    const err = new Error('User already exists')
    err.code = 'USER_EXISTS'
    throw err
  }
  const id = username
  const passwordHash = bcrypt.hashSync(password, 10)
  const user = { id, username, passwordHash, createdAt: new Date().toISOString() }
  state.users.push(user)
  persist()
  return { id: user.id, username: user.username, createdAt: user.createdAt }
}

function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.passwordHash)
}

module.exports = {
  findByUsername,
  createUser,
  verifyPassword,
}

