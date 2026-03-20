const request = require('supertest');
const app = require('../server');
const Movie = require('../models/Movie');

// Helper to get auth token for tests
const getAuthToken = async () => {
  const res = await request(app)
    .post('/login')
    .send({ username: 'admin', password: '1234' });

  return res.body.token;
};

describe('Movie API', () => {
  beforeEach(async () => {
    await Movie.deleteMany({});
  });

  test('POST /login should return a token for valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: '1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /login should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'wrong' });

    expect(res.statusCode).toBe(401);
  });

  test('GET /movies without token should be forbidden', async () => {
    const res = await request(app).get('/movies');
    expect(res.statusCode).toBe(403);
  });

  test('CRUD flow on /movies with valid token', async () => {
    const token = await getAuthToken();

    // Create
    const createRes = await request(app)
      .post('/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        genre: 'Sci-Fi',
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body._id).toBeDefined();

    const movieId = createRes.body._id;

    // Read all
    const listRes = await request(app)
      .get('/movies')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBe(1);

    // Read by id
    const getRes = await request(app)
      .get(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.title).toBe('Inception');

    // Update
    const updateRes = await request(app)
      .put(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ genre: 'Thriller' });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.genre).toBe('Thriller');

    // Delete
    const deleteRes = await request(app)
      .delete(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe('Movie deleted successfully');

    // Ensure deleted
    const getDeletedRes = await request(app)
      .get(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getDeletedRes.statusCode).toBe(404);
  });
});