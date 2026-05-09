const store = require('./src/movieStore')

const DEMO = [
  {
    title: 'The Grand Budapest Hotel',
    director: 'Wes Anderson',
    release_year: 2014,
    genre: 'Comedy',
    rating: 8.1,
    notes: 'Pastel caper with a perfect ensemble.',
    poster_url: 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Grand_Budapest_Hotel.png',
  },
  {
    title: 'Arrival',
    director: 'Denis Villeneuve',
    release_year: 2016,
    genre: 'Sci-Fi',
    rating: 7.9,
    notes: 'Language and time, not lasers.',
    poster_url: null,
  },
  {
    title: 'Portrait of a Lady on Fire',
    director: 'Céline Sciamma',
    release_year: 2019,
    genre: 'Drama',
    rating: 8.3,
    notes: 'Coastal France, slow burn.',
    poster_url: null,
  },
  {
    title: 'Paddington 2',
    director: 'Paul King',
    release_year: 2017,
    genre: 'Family',
    rating: 8.8,
    notes: 'The rare sequel that tops the first.',
    poster_url: null,
  },
  {
    title: 'Spirited Away',
    director: 'Hayao Miyazaki',
    release_year: 2001,
    genre: 'Animation',
    rating: 8.6,
    notes: 'Bathhouse dreams.',
    poster_url: null,
  },
]

function run() {
  if (store.listMovies({}).length > 0) {
    console.log('Movies already present; skipping seed.')
    return
  }
  for (const row of DEMO) {
    store.createMovie(row)
  }
  console.log(`Seeded ${DEMO.length} movies.`)
}

run()
