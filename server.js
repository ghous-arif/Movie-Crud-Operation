const express = require('express');
const jwt = require('jsonwebtoken');

const movieRoutes = require('./routes/movieRoutes');

const app = express();
app.use(express.json());

// Configuration (fall back to defaults if env vars not set)
const SECRET_KEY = process.env.JWT_SECRET || 'secretkey';

app.get('/', (req, res) => {
  res.send('Movie API using in-memory data store');
});

// login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === '1234') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// routes
app.use('/movies', movieRoutes);

if (require.main === module) {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

module.exports = app;