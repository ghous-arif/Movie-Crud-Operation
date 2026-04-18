const express = require('express');
const jwt = require('jsonwebtoken');

const movieRoutes = require('./routes/movieRoutes');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Configuration (fall back to defaults if env vars not set)
const SECRET_KEY = process.env.JWT_SECRET || 'secretkey';

// register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const newUser = new User({ username, password });
  await newUser.save();

  res.status(201).json({ 
    message: 'User registered successfully', 
    user: { _id: newUser._id, username: newUser.username } 
  });
});

// login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findByUsername(username);

  if (user && user.password === password) {
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