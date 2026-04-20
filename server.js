const express = require('express');
const jwt = require('jsonwebtoken');

const movieRoutes = require('./routes/movieRoutes');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Configuration (fall back to defaults if env vars not set)
const SECRET_KEY = process.env.JWT_SECRET || 'secretkey';

// Default Browser Route (Check backend status)
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background-color: #f9f9f9; padding: 30px; border-radius: 10px; width: 60%; margin-left: auto; margin-right: auto; box-shadow: 0px 4px 10px rgba(0,0,0,0.1);">
      <h1 style="color: #4CAF50;">✅ Movie Backend is Running!</h1>
      <p style="font-size: 18px; color: #555;">All APIs are in working condition.</p>
      <hr style="border: 1px solid #ddd; margin: 20px 0;">
      <h3 style="color: #333;">Available Endpoints:</h3>
      <ul style="list-style: none; padding: 0; font-size: 16px; text-align: left; display: inline-block;">
        <li style="margin: 10px 0;"><strong style="color: #007BFF;">POST</strong> /register - Register a new user</li>
        <li style="margin: 10px 0;"><strong style="color: #007BFF;">POST</strong> /login - Login to get JWT index token</li>
        <li style="margin: 10px 0;"><strong style="color: #28A745;">GET &nbsp;</strong> /movies - Get all movies (Requires Token)</li>
        <li style="margin: 10px 0;"><strong style="color: #28A745;">GET &nbsp;</strong> /movies/:id - Get movie by ID (Requires Token)</li>
        <li style="margin: 10px 0;"><strong style="color: #FFC107;">POST</strong> /movies - Create a movie (Requires Token)</li>
        <li style="margin: 10px 0;"><strong style="color: #17A2B8;">PUT &nbsp;</strong> /movies/:id - Update a movie (Requires Token)</li>
        <li style="margin: 10px 0;"><strong style="color: #DC3545;">DELETE</strong> /movies/:id - Delete a movie (Requires Token)</li>
      </ul>
    </div>
  `);
});

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