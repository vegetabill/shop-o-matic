# Shop-o-Matic

A household shopping list app for families. Multi-user households share a single shopping list; items persist across sessions as history (never hard-deleted) so autocomplete works from past entries.

## Architecture

Monorepo with two top-level directories:

```
api/   → Rails 8 API (Ruby 3.2.5, PostgreSQL)
app/   → React Native / Expo frontend (TypeScript)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Rails 8 (API-only mode), Puma 6.4 |
| Database | PostgreSQL 14+ |
| Auth | JWT (HS256, 30-day expiry) + Google OAuth 2.0 |
| Frontend | React Native 0.74.3, Expo 51 |
| Language (FE) | TypeScript 5.3.3 |
| Navigation | React Navigation v6 (bottom tabs + native stack) |
| HTTP Client | Axios 1.7.2 with request/response interceptors |
| State | React Context API + useReducer |
| Secure Storage | Expo SecureStore (JWT + user JSON) |

## Data Models

All resources are scoped to a **Household** (the multi-tenant boundary).

```
User ──< HouseholdMembership >── Household ──< Store
                                            ──< Category
                                            ──< Item ──< ItemStore >── Store
```

**Item state flags:**
- `on_list` (bool) — currently on the shopping list
- `purchased_at` (datetime) — set when checked off; cleared when shopping session ends
- Items are never deleted; `on_list=false` means historical (autocomplete source)

**Category** and **Store** names are unique per household (case-insensitive for categories).

Household creation auto-seeds one "Grocery Store" and 14 default categories in a DB transaction.

## API Routes

All routes under `/api/v1`. Auth required on everything except `/auth/*`.

```
POST   /auth/google                           Google ID/access token → JWT
POST   /auth/mock                             Dev-only mock login

GET    /households                            List user's households
POST   /households                            Create household
GET    /households/:id
POST   /households/join                       Join via share_token

GET    /households/:hid/stores
POST   /households/:hid/stores
PUT    /households/:hid/stores/:id
DELETE /households/:hid/stores/:id

GET    /households/:hid/categories
POST   /households/:hid/categories
PUT    /households/:hid/categories/:id
DELETE /households/:hid/categories/:id

GET    /households/:hid/items                 ?on_list=true | ?q=search (autocomplete)
POST   /households/:hid/items
PUT    /households/:hid/items/:id
POST   /households/:hid/items/:id/add_to_list
POST   /households/:hid/items/:id/purchase
POST   /households/:hid/items/:id/unpurchase
POST   /households/:hid/items/:id/mark_unavailable   sets on_list=false

POST   /households/:hid/shopping/end          clears purchased_at + on_list for bought items

GET    /health                                → { "status": "ok" }
```

## Authentication Flow

1. Frontend: Expo Auth Session → Google OAuth → id_token or access_token
2. POST token to `/auth/google`
3. Backend: GoogleAuthService verifies with Google's `/tokeninfo` endpoint, finds/creates User
4. Returns JWT (`{ user_id, email, exp, iat }`) + user payload
5. Frontend stores both in SecureStore; axios request interceptor attaches `Authorization: Bearer <jwt>`
6. Axios response interceptor: 401 → clears storage → triggers sign-out

## Frontend Structure

```
app/src/
  api/           axios instance + modules: auth, households, items, stores, categories
  context/       AuthContext, HouseholdContext (useReducer)
  screens/       Login, HouseholdList, List, Shopping, Stores, Categories
  navigation/    AppNavigator (root), MainNavigator (tab + stack)
  components/    AutocompleteInput, ItemRow, StoreTag, ColorPicker
  types/         TypeScript interfaces
  constants/     API_BASE_URL, OAuth client IDs, SecureStore keys
```

**Navigation tree:**
```
AppNavigator
├─ LoginScreen (unauthenticated)
├─ HouseholdSetup (authenticated, no household)
└─ MainNavigator (tab bar)
   ├─ ListStack → ListScreen / ShoppingScreen (modal) / HouseholdListScreen (modal)
   ├─ StoresScreen
   └─ CategoriesScreen
```

**State notes:**
- HouseholdContext manages all item/store/category CRUD; updates state optimistically after API calls
- Shopping mode tracks purchases in local component Sets until "Done Shopping" fires `/shopping/end`
- `useCallback` used extensively in context to avoid unnecessary re-renders

## Running Locally

**Backend:**
```bash
cd api
bundle install
cp .env.example .env   # set DB credentials, JWT_SECRET
bin/rails db:create db:migrate
bin/rails db:seed      # optional: creates demo user, prints test JWT
bin/rails server       # → http://localhost:3000
```

**Frontend:**
```bash
cd app
npm install
# set in .env: EXPO_PUBLIC_API_BASE_URL, EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
npm start              # Expo dev server
npm run ios            # iOS simulator
npm run web            # browser
npm run tsc            # type check
npm run lint
```

**API env vars:**
- `JWT_SECRET` — signing key (dev fallback exists but change for production)
- `DATABASE_URL` or individual `DB_HOST/PORT/USERNAME/PASSWORD`
- `GOOGLE_CLIENT_ID` — used to validate OAuth token audience
- `RAILS_ENV`, `PORT`, `RAILS_MAX_THREADS`, `WEB_CONCURRENCY`

## Key Design Decisions

- **Items never deleted** — `on_list=false` makes them history; enables autocomplete suggestions from past items
- **Household = tenant** — Every resource is household-scoped; share token (UUID) lets users join
- **No real-time sync** — Context refreshes via explicit API calls; no WebSocket
- **Inline JSON serialization** — Controllers build response hashes directly (no serializer layer yet)
- **Dev mock auth** — `POST /auth/mock` creates `demo@example.com` so you can test without Google OAuth

## Tests

No test suite exists yet. The framework supports it (RSpec or Minitest for Rails; Jest for RN).
