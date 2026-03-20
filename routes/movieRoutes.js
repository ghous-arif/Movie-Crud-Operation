const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');

const {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');

router.post('/', verifyToken, createMovie);
router.get('/', verifyToken, getMovies);
router.get('/:id', verifyToken, getMovieById);
router.put('/:id', verifyToken, updateMovie);
router.delete('/:id', verifyToken, deleteMovie);

module.exports = router;