# Court Renter App — Claude Code Project Instructions
## BALANCED Tier (Optimized for Speed + Quality)

## Role & Objective
You are an autonomous full-stack engineer. Implement a production-grade sports court renting application using **FastAPI**, **React**, and **MySQL** inside the existing workspace. Users can discover nearby courts, book hourly slots, and manage their reservations.

---

## Workflow Rules (Non-Negotiable)

1. **One step at a time.** Complete a step fully, then stop and ask: *"Step [X] complete — ready to proceed to Step [Y]?"*
2. **Wait for explicit confirmation** before starting the next step.
3. **Write into existing folders only.** The directory structure is already on disk. Do not create new top-level folders or rename anything.

---

## Hard Constraints

| ❌ Never | ✅ Always |
|---|---|
| Create or rename folders | Write only into the existing structure |
| Admin features / `is_admin` flags | User-only flows |
| Payment systems or mock currencies | Booking confirmation only |
| Encrypt emails, names, time slots | Hash passwords only (bcrypt one-way) |
| Paid UI libraries | Tailwind CSS (free, utility-first) |
| Complex custom loop logic | Clean `while` loops / list comprehensions |

---

## Tech Stack (BALANCED Tier)

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router, Leaflet, react-hot-toast, lucide-react |
| Backend | FastAPI, Uvicorn |
| Database | MySQL, SQLAlchemy ORM, mysql-connector-python |
| Auth | Passlib (bcrypt) + PyJWT |
| Dev Tools | ESLint, Prettier |

---

## Existing Directory Structure

```
court-renter/
├── client/
│   ├── public/markers/
│   └── src/
│       ├── components/
│       ├── features/
│       │   ├── auth/
│       │   ├── map/
│       │   └── booking/
│       ├── hooks/
│       └── services/
└── server/
    └── app/
        ├── api/
        ├── core/
        ├── db/
        ├── models/
        ├── schemas/
        └── services/
```

---

## Database Schema

**`users`**
- `id` INT PK Auto-Increment
- `email` VARCHAR Unique
- `hashed_password` VARCHAR

**`courts`**
- `id` INT PK Auto-Increment
- `name` VARCHAR
- `sport_type` VARCHAR (e.g. `"basketball"`, `"football"`, `"volleyball"`, `"multi-sport"`)
- `latitude` DECIMAL(9,6)
- `longitude` DECIMAL(9,6)
- `description` TEXT
- `open_hour` INT (e.g. `8` = 08:00)
- `close_hour` INT (e.g. `22` = 22:00)

**`bookings`**
- `id` INT PK Auto-Increment
- `user_id` INT FK → users.id
- `court_id` INT FK → courts.id
- `booking_date` DATE
- `time_slot` INT (e.g. `10` = 10:00–11:00)
- **Composite Unique Constraint** on `(court_id, booking_date, time_slot)` — let the DB prevent double-bookings natively; return HTTP 409 on violation.

---

## Core Business Logic

### Availability Engine
- Never store available slots. Store only bookings.
- Available slots for a given court + date = court's `[open_hour..close_hour-1]` range **minus** any `time_slot` values already in `bookings` for that court + date.
- The UI displays this list as a clickable hourly grid.

### Cancellation Rule
- A user may only cancel their own bookings.
- Cancellation is blocked if the booking's datetime (date + time_slot hour) is **less than 24 hours from now**.
- Return HTTP 403 with a clear message if the deadline has passed.

### Nearest Court Query
- Use MySQL `ST_Distance_Sphere` on court coordinates vs. user-supplied lat/lng to sort results by proximity inside the SQL query.

### Auth Flow
- Stateless JWT sessions. Token stored in `localStorage` on the client.
- Every authenticated API request sends `Authorization: Bearer <token>` via an Axios request interceptor.
- CORS restricted to `http://localhost:5173` only.

---

## Seed Script

Create `server/app/db/seed.py`. Populate the following demo courts (mix of real-sounding locations):

| Name | Sport | Open | Close | Notes |
|---|---|---|---|---|
| Tel Aviv Beach Basketball Court | basketball | 7 | 22 | |
| Ramat Gan Football Arena | football | 8 | 23 | |
| HaYarkon Volleyball Park | volleyball | 9 | 21 | |
| Central Multi-Sport Complex | multi-sport | 6 | 24 | basketball + football + volleyball |
| Jaffa Football Ground | football | 8 | 22 | |
| North Tel Aviv Volleyball Club | volleyball | 8 | 21 | |
| Bat Yam Multi-Sport Center | multi-sport | 7 | 23 | |

Use realistic Tel Aviv–area coordinates. The seed script must be **idempotent** (safe to run multiple times — skip if courts already exist).

---

## Design System

- **Mode:** Forced dark mode only. No light-mode fallback.
- **Palette:**
  - Background: `#0a0a0a` / `#111111`
  - Surface/cards: `#1a1a1a` / `#222222`
  - Text: `#f1f5f9` (slate-100)
  - Accent (open slots, CTAs, active states): neon green `#39ff14` or electric blue `#00d4ff`
  - Muted/taken slots: `#333333` with `#555555` text
- **Components:** rounded-xl, generous padding, subtle border `border-white/10`
- **Typography:** Clean sans-serif, high contrast, no decorative fonts

---

## Step-by-Step Execution Plan

---

### Step 1 — Backend Setup & Security
**Files:** `server/requirements.txt`, `server/.env.example`, `server/app/core/config.py`, `server/app/core/security.py`

**Dependencies (requirements.txt):**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic[email]==2.5.0
python-dotenv==1.0.0
sqlalchemy==2.0.23
mysql-connector-python==8.2.0
passlib[bcrypt]==1.7.4
PyJWT==2.12.1
cryptography==41.0.7
```

**Tasks:**
- `requirements.txt`: Use the list above
- `.env.example`: `DATABASE_URL=mysql+mysqlconnector://user:password@localhost:3306/court_renter`, `SECRET_KEY=your-secret-key-here`, `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=60`
- `config.py`: load all env vars via Pydantic `BaseSettings`
- `security.py`: `hash_password(plain)`, `verify_password(plain, hashed)`, `create_access_token(data, expires_delta)`, `decode_access_token(token)` → returns `TokenData` or raises 401

---

### Step 2 — Database Engine & ORM Models
**Files:** `server/app/db/database.py`, `server/app/db/session.py`, `server/app/models/user.py`, `server/app/models/court.py`, `server/app/models/booking.py`

**Tasks:**
- `database.py`: SQLAlchemy engine from `DATABASE_URL`, `Base = declarative_base()`
- `session.py`: `SessionLocal`, `get_db` FastAPI dependency (yields session, closes on exit)
- `user.py`: ORM model matching schema above
- `court.py`: ORM model including `open_hour`, `close_hour`, `sport_type`
- `booking.py`: ORM model with `UniqueConstraint("court_id", "booking_date", "time_slot")` inside `__table_args__`

---

### Step 3 — Pydantic Schemas
**Files:** `server/app/schemas/auth.py`, `server/app/schemas/court.py`, `server/app/schemas/booking.py`

**Tasks:**
- `auth.py`: `UserCreate` (email, password), `UserOut` (id, email), `Token` (access_token, token_type), `TokenData` (email)
- `court.py`: `CourtOut` (all fields including open_hour, close_hour, sport_type), `NearbyRequest` (lat, lng)
- `booking.py`: `BookingCreate` (court_id, booking_date, time_slot), `BookingOut` (id, court_id, booking_date, time_slot), `AvailabilityResponse` (court_id, date, available_slots: list[int])

---

### Step 4 — Auth API & FastAPI Entry Point
**Files:** `server/main.py`, `server/app/api/auth.py`

**Tasks:**
- `main.py`: FastAPI instance, CORS middleware allowing only `http://localhost:5173`, include routers for auth / courts / bookings, call `Base.metadata.create_all(bind=engine)` on startup
- `auth.py`:
  - `POST /auth/register` — validate email uniqueness (409 if taken), hash password, store user, return `UserOut`
  - `POST /auth/login` — verify credentials, return `Token` (using PyJWT)
  - `GET /auth/me` — protected; return current user from JWT

---

### Step 5 — Courts & Bookings API
**Files:** `server/app/api/courts.py`, `server/app/api/bookings.py`, `server/app/db/seed.py`

**Tasks:**

`courts.py`:
- `GET /courts/nearby?lat=&lng=` — query with `ST_Distance_Sphere`, return list of `CourtOut` sorted by distance
- `GET /courts/{id}` — return single `CourtOut`
- `GET /courts/{id}/availability?date=YYYY-MM-DD` — compute available slots: `list(range(court.open_hour, court.close_hour))` minus booked `time_slot` values for that date; return `AvailabilityResponse`

`bookings.py`:
- `POST /bookings/` — authenticated; insert booking; catch `IntegrityError` → return HTTP 409 `{"detail": "This slot is already booked."}`
- `GET /bookings/me` — authenticated; return all bookings for current user, joined with court name and sport_type
- `DELETE /bookings/{id}` — authenticated; verify ownership (403 if not owner); check 24-hour cancellation window (403 with message `"Cancellations must be made at least 24 hours before the slot."` if too late); delete and return 204

`seed.py`:
- Idempotent seed function; import and call from `main.py` on startup after `create_all`

---

### Step 6 — Frontend Bootstrap & API Service
**Files:** `client/package.json`, `client/vite.config.js`, `client/tailwind.config.js`, `client/.eslintrc.cjs`, `client/.prettierrc.json`, `client/src/services/api.js`

**Dependencies (package.json):**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.298.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

**Tasks:**
- `package.json`: Use the list above
- `vite.config.js`: standard React + Vite setup (plugin @vitejs/plugin-react, server port 5173)
- `tailwind.config.js`: `darkMode: 'class'`, extend colors: `accent-green: '#39ff14'`, `accent-blue: '#00d4ff'`, `surface: '#1a1a1a'`, `base: '#0a0a0a'`
- `.eslintrc.cjs`: basic React + ESLint config
- `.prettierrc.json`: `{ "semi": true, "singleQuote": true, "trailingComma": "es5" }`
- `api.js`: Axios instance `baseURL: http://localhost:8000`; request interceptor reads token from `localStorage` and injects `Authorization: Bearer <token>` if present; response interceptor redirects to `/login` on 401

---

### Step 7 — UI Component Library & Auth Views
**Files:** `client/src/components/Button.jsx`, `client/src/components/Input.jsx`, `client/src/components/Navbar.jsx`, `client/src/components/Card.jsx`, `client/src/components/Toast.jsx`, `client/src/features/auth/Login.jsx`, `client/src/features/auth/Register.jsx`, `client/src/features/auth/authContext.jsx`

**Tasks:**
- Components: dark-mode, rounded-xl, generous padding, subtle border `border-white/10`. Button variants: `primary` (accent fill), `ghost` (border only), `danger` (red, for cancel).
- `Toast.jsx`: wrapper around `react-hot-toast` (zero config, just `toast.success()` / `toast.error()`)
- `authContext.jsx`: React Context providing `user`, `token`, `login(token)`, `logout()`. `login` decodes JWT payload to extract user email and stores token in `localStorage`.
- `Login.jsx` / `Register.jsx`: clean centered dark forms; call auth API; redirect to `/` on success; show inline error messages on failure. Use `toast()` for quick feedback.

---

### Step 8 — Map, Booking UI & App Router
**Files:** `client/src/hooks/useGeolocation.js`, `client/src/features/map/MapView.jsx`, `client/src/features/map/CourtMarker.jsx`, `client/src/features/booking/CourtDetail.jsx`, `client/src/features/booking/AvailabilityGrid.jsx`, `client/src/features/booking/MyBookings.jsx`, `client/src/App.jsx`

**Tasks:**

`useGeolocation.js`: wraps `navigator.geolocation.getCurrentPosition`; returns `{ lat, lng, error, loading }`.

`MapView.jsx`:
- On mount, get user coordinates via `useGeolocation`, fetch `/courts/nearby?lat=&lng=`
- Render Leaflet map centered on user; place a marker for each court
- Clicking a marker navigates to `/courts/:id`
- Show sport type badge on each marker popup (use `lucide-react` icon for the sport)

`CourtDetail.jsx`:
- Fetch court info (`GET /courts/:id`) and show name, sport, open/close hours
- Date picker (HTML `<input type="date">`, min = today) to select a booking date
- On date change, fetch `/courts/:id/availability?date=` and render `<AvailabilityGrid />`

`AvailabilityGrid.jsx`:
- Receives `availableSlots: number[]` and `courtId`, `date`
- Renders a grid of hour blocks for the court's full operating range
- **Open slots:** accent-colored (neon green), clickable, with hover effect → `POST /bookings/` on click → use `toast.success()` → refresh availability
- **Taken slots:** muted dark, not clickable, labeled "Taken"
- On error: use `toast.error()` (e.g., "Slot already booked")

`MyBookings.jsx`:
- Fetch `GET /bookings/me`; display a list of booking cards (court name, sport, date, time)
- Each card has a **Cancel** button (danger variant); disabled + tooltip `"Cannot cancel within 24h"` if within window
- On cancel: call `DELETE /bookings/:id`; use `toast()` for feedback (success or error); refresh list on success

`App.jsx`:
- Wrap app in `<AuthProvider>` and `<BrowserRouter>`
- Routes: `/login`, `/register`, `/` (MapView, protected), `/courts/:id` (CourtDetail, protected), `/my-bookings` (MyBookings, protected)
- Protected route wrapper: redirect to `/login` if no token in context
- `<Navbar />` shows app name, links to Map and My Bookings, and a Logout button. Use `lucide-react` for icons.

---

## Final Audit Checklist (Self-verify after Step 8)

- [ ] No admin routes, flags, or UI anywhere
- [ ] No payment logic anywhere
- [ ] Only `hashed_password` is hashed — all other DB fields are plain text
- [ ] Double-booking returns HTTP 409 with a clear message
- [ ] Cancellation within 24h returns HTTP 403 with a clear message
- [ ] Cancellation of another user's booking returns HTTP 403
- [ ] CORS allows only `http://localhost:5173`
- [ ] All UI is dark mode — no light-mode styles or fallback
- [ ] Availability grid never shows already-booked slots as open
- [ ] Seed script is idempotent
- [ ] Court availability reflects each court's own `open_hour`/`close_hour`
- [ ] Toast notifications used for success/error feedback (no console logs for users)
- [ ] All UI components use Tailwind + `clsx` (no inline styles)
- [ ] Lucide icons used for UI elements (court markers, navbar, buttons)
- [ ] ESLint and Prettier config present (optional: run linting before final review)

---

## Development Startup Commands

Once all steps are complete:

**Backend:**
```bash
cd server
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

The frontend dev server will start on `http://localhost:5173` and hot-reload on file changes.

---

**Begin with Step 1.**
