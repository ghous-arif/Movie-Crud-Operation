## Movie API

A simple RESTful API for managing a movie collection, built with Node.js and Express.  
The API uses an in-memory data store (JavaScript objects in memory) and JSON Web Tokens (JWT) for authentication and authorisation.

This README is written to help you clearly understand the project so you can write your assignment documentation.

---

### 1. Overall project idea

- **Theme**: Movie database – managing records for movies (title, director, year, genre).
- **Goal**: Provide a REST API that:
  - Issues a token through a login endpoint.
  - Allows only authorised users to perform CRUD operations on movie data.
- **Data storage**: Instead of a real database, the project uses a simple **in-memory array**.  
  This keeps the focus on API design, routing, validation, and testing.

Because data is stored in memory, it is reset every time the server restarts.  
From an API-design perspective, it behaves similarly to using a real database.

---

### 2. Folder and file structure

Project root:

- `server.js` – Application entry point
  - Creates the Express application.
  - Enables JSON body parsing with `app.use(express.json())`.
  - Reads the JWT secret from environment variables (`JWT_SECRET`).
  - Defines a root route `/` as a health check.
  - Implements the `/login` endpoint (static username/password + JWT token).
  - Mounts all `/movies` routes from `movieRoutes`.
  - Starts the server on port `3000`.

- `controllers/`
  - `movieController.js` – Business logic for movies:
    - `createMovie` – creates a new movie record with validation.
    - `getMovies` – returns all movies.
    - `getMovieById` – returns a single movie by id (or 404 if not found).
    - `updateMovie` – updates existing movie fields (with validation on `year`).
    - `deleteMovie` – deletes a movie (404 if not found).

- `routes/`
  - `movieRoutes.js` – Connects URLs to controller functions:
    - `POST /movies` → `createMovie` (requires authentication)
    - `GET /movies` → `getMovies` (requires authentication)
    - `GET /movies/:id` → `getMovieById` (requires authentication)
    - `PUT /movies/:id` → `updateMovie` (requires authentication)
    - `DELETE /movies/:id` → `deleteMovie` (requires authentication)
    - All routes are protected by the `verifyToken` middleware.

- `models/`
  - `Movie.js` – In-memory “model” that behaves like a simple database layer:
    - Internal array `movies` stores all movie objects.
    - `new Movie(data)` – constructor that creates a movie object with:
      - Generated string `_id`
      - `title`, `director`, `year`, `genre`
      - `createdAt`, `updatedAt` timestamps
    - `save()` – saves the movie into the in-memory array.
    - `static find()` – returns all movies.
    - `static findById(id)` – returns a single movie by id or `null`.
    - `static findByIdAndUpdate(id, updates)` – updates a movie and returns it.
    - `static findByIdAndDelete(id)` – deletes a movie and returns it.
    - `static deleteMany()` – clears all movies (used in tests).

- `middleware/`
  - `authMiddleware.js` – JWT-based authentication middleware:
    - `verifyToken(req, res, next)`:
      - Reads the `Authorization` header in the form `Bearer <token>`.
      - Verifies the token using `JWT_SECRET`.
      - If valid:
        - Attaches the decoded user payload to `req.user`.
        - Calls `next()` to continue.
      - If missing or invalid:
        - Returns `403` or `401` with an appropriate error message.

- `tests/`
  - `movie.test.js` – Jest + Supertest integration tests:
    - Before each test: calls `Movie.deleteMany()` to clear the in-memory store.
    - Helper `getAuthToken()`:
      - Calls `POST /login` to get a valid token for protected routes.
    - Tests include:
      - `POST /login` success → status `200` + token in the response body.
      - `POST /login` with invalid password → status `401`.
      - `GET /movies` without token → status `403`.
      - Full CRUD flow with a valid token:
        - Create a movie.
        - List movies.
        - Get movie by id.
        - Update movie.
        - Delete movie.
        - Confirm that fetching the deleted movie now returns `404`.

- `package.json`
  - **Dependencies**: `express`, `jsonwebtoken`.
  - **Dev dependencies**: `jest`, `supertest`.
  - **Scripts**:
    - `"start": "node server.js"` – run the server.
    - `"dev": "nodemon server.js"` – development mode (if `nodemon` installed globally).
    - `"test": "jest --runInBand"` – run the Jest test suite.

- `.env.example`
  - Example environment file showing only:

    ```bash
    JWT_SECRET=secretkey
    ```

  - For real use, you copy this to `.env` and change the secret.

---

### 3. Request flow (high level)

#### 3.1 Login (unauthorised user)

- Client sends a `POST` request to `/login`:

  ```json
  {
    "username": "admin",
    "password": "1234"
  }
  ```

- If the credentials are correct:
  - Server uses `jwt.sign` to create a token (e.g. with 1 hour expiry).
  - Response:

    ```json
    {
      "token": "<jwt>"
    }
    ```

- If the credentials are incorrect:
  - Status: `401 Unauthorized`
  - Response:

    ```json
    {
      "message": "Invalid credentials"
    }
    ```

#### 3.2 Protected movie endpoints (authorised user)

- Client includes the token in the `Authorization` header:

  ```http
  Authorization: Bearer <jwt>
  ```

- The `authMiddleware`:
  - Verifies the token using the secret.
  - If valid: allows the request to continue to the movie controller.
  - If invalid or missing: returns `401` or `403`.

#### 3.3 Movie CRUD operations

- **Create** – `POST /movies`

  - Example request body:

    ```json
    {
      "title": "Inception",
      "director": "Christopher Nolan",
      "year": 2010,
      "genre": "Sci-Fi"
    }
    ```

  - Required fields: `title`, `year`, `genre`.
  - `year` must be a number `>= 1888`.
  - **Success**:
    - Status: `201 Created`
    - Body: created movie object.
  - **Validation error**:
    - Status: `400 Bad Request`
    - Body: error message.

- **Read all** – `GET /movies`

  - Returns an array of all movies.
  - Status: `200 OK`.

- **Read one** – `GET /movies/:id`

  - If the id exists:
    - Status: `200 OK`
    - Body: movie object.
  - If not found:
    - Status: `404 Not Found`
    - Body:

      ```json
      { "message": "Movie not found" }
      ```

- **Update** – `PUT /movies/:id`

  - Request body can contain any fields to update (e.g. `title`, `genre`, `year`).
  - If `year` is provided, it must still be a number `>= 1888`.
  - If the movie does not exist:
    - Status: `404 Not Found`.
  - If validation fails:
    - Status: `400 Bad Request`.
  - On success:
    - Status: `200 OK`
    - Body: updated movie object.

- **Delete** – `DELETE /movies/:id`

  - If the movie exists:
    - Status: `200 OK`
    - Body:

      ```json
      { "message": "Movie deleted successfully" }
      ```

  - If the movie does not exist:
    - Status: `404 Not Found`
    - Body:

      ```json
      { "message": "Movie not found" }
      ```

---

### 4. Setup and running the project

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   - Create a `.env` file in the project root based on `.env.example`:

     ```bash
     JWT_SECRET=your_jwt_secret
     ```

3. **Run the server**

   ```bash
   npm start
   ```

   - The server will run on `http://localhost:3000`.
   - `GET /` will return a simple text response:
     - `"Movie API using in-memory data store"`.

4. **Run tests**

   ```bash
   npm test
   ```

   - This runs the Jest test suite which calls the real endpoints using Supertest.

---

### 5. Summary for your assignment report

You can use these points directly in your report:

- **Theme**: Movie database with categorised information (genre, year, director).
- **Storage**: Simple in-memory data structure (array of movie objects). This keeps the focus on API design and testing rather than database configuration.
- **Authentication**: Static credentials (`admin` / `1234`) with a login endpoint that issues a JWT. All movie endpoints require a valid token.
- **API endpoints**: A login endpoint and full CRUD on `/movies`, using appropriate HTTP status codes and basic validation.
- **Testing**: Automated tests written with Jest and Supertest that cover:
  - Successful and failed login.
  - Access control (forbidden without token).
  - Full CRUD behaviour on the movies resource.

You can copy sections from this README into your Word document and rephrase slightly in formal academic language if needed.

