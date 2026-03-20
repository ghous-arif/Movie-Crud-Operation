let movies = [];
let idCounter = 1;

class Movie {
  constructor(data) {
    this._id = String(idCounter++);
    this.title = data.title;
    this.director = data.director;
    this.year = data.year;
    this.genre = data.genre;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    movies.push(this);
    return this;
  }

  static async find() {
    return movies;
  }

  static async findById(id) {
    return movies.find((m) => m._id === id) || null;
  }

  static async findByIdAndUpdate(id, updates) {
    const movie = await Movie.findById(id);
    if (!movie) return null;
    Object.assign(movie, updates);
    movie.updatedAt = new Date();
    return movie;
  }

  static async findByIdAndDelete(id) {
    const index = movies.findIndex((m) => m._id === id);
    if (index === -1) return null;
    const [deleted] = movies.splice(index, 1);
    return deleted;
  }

  static async deleteMany() {
    movies = [];
  }
}

module.exports = Movie;