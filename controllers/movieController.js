const Movie = require('../models/Movie');

// Create new movie
exports.createMovie = async (req, res) => {
  try {
    const { title, year, genre } = req.body;

    if (!title || !year || !genre) {
      return res.status(400).json({ message: 'title, year and genre are required' });
    }

    if (typeof year !== 'number' || year < 1888) {
      return res.status(400).json({ message: 'year must be a number greater than or equal to 1888' });
    }

    const movie = new Movie(req.body);
    const savedMovie = await movie.save();
    return res.status(201).json(savedMovie);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create movie' });
  }
};

// get all movies
exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    return res.json(movies);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch movies' });
  }
};

// get one movie by id
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    return res.json(movie);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch movie' });
  }
};

// update movie
exports.updateMovie = async (req, res) => {
  try {
    if (req.body.year !== undefined) {
      if (typeof req.body.year !== 'number' || req.body.year < 1888) {
        return res.status(400).json({ message: 'year must be a number greater than or equal to 1888' });
      }
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body);
    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    return res.json(updatedMovie);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update movie' });
  }
};

// delete movie
exports.deleteMovie = async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    return res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete movie' });
  }
};