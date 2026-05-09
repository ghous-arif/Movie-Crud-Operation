const path = require('path')
const fs = require('fs')

let request
let app

beforeAll(() => {
  const dataPath = path.join(__dirname, '..', 'movies.test.json')
  if (fs.existsSync(dataPath)) {
    fs.unlinkSync(dataPath)
  }
  const usersPath = path.join(__dirname, '..', 'users.test.json')
  if (fs.existsSync(usersPath)) {
    fs.unlinkSync(usersPath)
  }
  process.env.MOVIES_DATA_FILE = dataPath
  process.env.USERS_DATA_FILE = usersPath
  process.env.JWT_SECRET = 'test-secret'
  jest.resetModules()
  request = require('supertest')
  app = require('../src/app')
})

describe('movies API', () => {
  async function getToken() {
    const res = await request(app).post('/login').send({ username: 'admin', password: '1234' }).expect(200)
    expect(res.body && typeof res.body.token === 'string').toBe(true)
    return res.body.token
  }

  it('creates and lists a movie', async () => {
    const token = await getToken()
    const create = await request(app)
      .post('/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Film',
        director: 'Test Director',
        year: 2020,
        genre: 'Thriller',
        rating: 7.5,
      })
      .expect(201)

    expect(create.body.title).toBe('Test Film')
    const id = create.body._id

    const list = await request(app).get('/movies').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(list.body)).toBe(true)
    expect(list.body.some((m) => m._id === id)).toBe(true)
  })

  it('deletes a movie', async () => {
    const token = await getToken()
    const create = await request(app)
      .post('/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'To Delete',
        director: null,
        year: 2000,
        genre: null,
        rating: 5,
      })
      .expect(201)

    const id = create.body._id
    await request(app).delete(`/movies/${id}`).set('Authorization', `Bearer ${token}`).expect(204)
    await request(app).get(`/movies/${id}`).set('Authorization', `Bearer ${token}`).expect(404)
  })
})
