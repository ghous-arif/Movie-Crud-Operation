# Movie Library (school assignment)

Full-stack **movie-only** CRUD: list, search, filter, sort, create, update, delete.

- **Backend:** Node.js + **Express**, JSON file persistence (`backend/movies.json`), **Zod** validation.
- **Mobile app:** React Native (**Expo**) + TypeScript, `fetch` to the REST API.

Includes **authentication** (register/login) and protected CRUD (Bearer token using **JWT**). Passwords are stored as **bcrypt hashes** in `backend/users.json`.

**Design + evaluation document:** `docs/design-and-evaluation.md`

---

## Prerequisites

- **Node.js 18+** and npm (backend + Expo)
- **Android Studio** / **Xcode** (for emulator), or Expo Go on a phone

---

## Backend (API)

```bash
cd backend
npm install
npm run seed
npm start
```

- Default URL: **http://0.0.0.0:3000** (listen on all interfaces so a phone on Wi‑Fi can reach `http://<your-PC-IP>:3000`).
- From the same machine: [http://127.0.0.1:3000](http://127.0.0.1:3000)

**Dev (auto-restart on file change):**

```bash
npm run dev
```

**Tests:**

```bash
npm test
```

---

## Mobile app (Expo)

```bash
cd frontend
copy .env.example .env
npm install
npm run start
```

Set **`EXPO_PUBLIC_API_URL`** in `frontend/.env`:

| Where you run the app | Example URL |
|------------------------|---------------|
| Android **emulator** | `http://10.0.2.2:3000` |
| iOS **simulator** | `http://127.0.0.1:3000` |
| **Physical device** (same Wi‑Fi) | `http://192.168.x.x:3000` (your PC’s LAN IP) |

Then:

```bash
npm run android
# or
npm run ios
```

---

## REST API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/movies` | List. Query: `q`, `genre`, `sort=year\|rating`, `order=asc\|desc` |
| `GET` | `/movies/:id` | One movie |
| `POST` | `/movies` | Create (JSON body) |
| `PUT` | `/movies/:id` | Full replace |
| `PATCH` | `/movies/:id` | Partial update (at least one field) |
| `DELETE` | `/movies/:id` | Delete (**204**, no body) |

- `POST /register` → create user (demo)
- `POST /login` → returns `{ token }` (JWT)
- All `/movies` endpoints require `Authorization: Bearer <token>`

- **404:** `{ "detail": "Movie not found" }`
- **422:** `{ "detail": [ { "loc", "msg", "type" } ] }` (Zod / validation)

---

## Demo (Task 5)

If you are submitting a recorded demo, put the link here:

- Demo video link: **TODO**

## Attribution

- **Justin Fletcher**: module teaching materials / tutorial patterns (auth + CRUD via API), adapted and extended for this coursework.

Suggested demo flow (3–5 minutes):

1. Start backend + show terminal running on port 3000
2. Open app and **register** (or log in with `admin` / `1234`)
3. Show **List** and **Search/Filter/Sort**
4. Show **Create** a movie, then refresh list
5. Show **Update** and **Delete** and confirm list changes
6. (Optional) show Postman calls using the included collection

### Example `curl` (Windows `cmd`)

**List:**

```bat
curl -s http://127.0.0.1:3000/movies
```

**Create:**

```bat
curl -s -X POST http://127.0.0.1:3000/movies -H "Content-Type: application/json" -d "{\"title\":\"Test\",\"director\":null,\"release_year\":2021,\"genre\":\"Drama\",\"rating\":8.5,\"notes\":null,\"poster_url\":null}"
```

**Delete** (replace `ID`):

```bat
curl -s -o NUL -w "%%{http_code}" -X DELETE http://127.0.0.1:3000/movies/ID
```

---

## Project layout

```
backend/
  src/           # app.js, index.js, movieRoutes.js, movieStore.js, schemas.js
  tests/         # Jest + Supertest
  seed.js
  package.json
frontend/
  App.tsx
  src/
    api/
    types/
```
