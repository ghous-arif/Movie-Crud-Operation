## CS4S763 CW2 – Movie Library (Design + Evaluation)

### Goal

Build a mobile application that communicates with an API to demonstrate:

- **Authentication**
- **CRUD actions** (Create/Read/Update/Delete)
- **Validation / basic security checks**

### Technology choices

- **Mobile app**: React Native (Expo) + TypeScript
- **API**: Node.js + Express
- **Validation**:
  - Backend: Zod
  - Frontend: Formik + Yup
- **Storage**: JSON file persistence on the backend (simple coursework-friendly approach)

### Basic screen designs (wireframe-level)

#### Screen 1: Auth (Login / Signup)

- Inputs: **username**, **password**
- Signup additionally shows **confirm password**
- Buttons:
  - Primary: Login / Sign Up
  - Secondary: Toggle mode (login ↔ signup)
- Validation:
  - Required username + password
  - Signup: password must match confirm password

#### Screen 2: Home (Movies)

- Header: App title + **Logout**
- Search/Filter/Sort section:
  - Search text (`q`)
  - Genre filter (`genre`)
  - Sort toggle (`year` ↔ `rating`)
  - Order toggle (`asc` ↔ `desc`)
  - Apply button
- Movies list:
  - Movie title
  - Genre + year
  - Actions per row: **Edit**, **Delete**
- Floating action button (FAB): **Add movie**

#### Screen 3: Add/Edit Movie (Modal)

- Form fields:
  - Title (required)
  - Director (optional)
  - Release year (required, numeric, >= 1888)
  - Genre (optional)
- Buttons:
  - Create/Update
  - Cancel
- Validation:
  - Required title/year
  - Year numeric and sensible range

### API design (what the app calls)

- Auth:
  - `POST /register` → `{ username, password }`
  - `POST /login` → `{ token }`
- Movies (requires `Authorization: Bearer <token>`):
  - `GET /movies?q=&genre=&sort=year|rating&order=asc|desc`
  - `GET /movies/:id`
  - `POST /movies`
  - `PUT /movies/:id`
  - `PATCH /movies/:id`
  - `DELETE /movies/:id`

### Validation & security considerations (what was implemented)

- **Backend input validation**: Zod schemas reject invalid requests (returns **422**).
- **Protected endpoints**: `/movies` routes require a valid Bearer token (returns **401** if missing/invalid).
- **Ownership**: Movies are associated with the logged-in user (`createdBy`) and update/delete is blocked for non-owners.
- **Frontend validation**: Formik/Yup prevents obvious bad inputs before API calls.

### Evaluation (what went well / what to improve)

#### What worked well

- **End-to-end flow**: login → list → create/update/delete → list refresh works cleanly.
- **User-friendly UI**: clear screens, feedback via alerts/loading states, easy to find actions.
- **Validation**: invalid data is blocked both client-side and server-side.

#### Limitations / future improvements

- **Auth is demo-level**: tokens are in-memory and reset when backend restarts; passwords are not hashed.
- **Persistence**: JSON file persistence is simple, but a database would be more robust.
- **Error messages**: could show more user-friendly errors consistently across all API failures.
- **More fields**: poster URL / notes could be added to match richer “movie” data models.

### Attribution

This coursework follows patterns taught in module materials/tutorial style credited to **Justin Fletcher** (auth + CRUD via API). The code was written and adapted by the student for this project.

