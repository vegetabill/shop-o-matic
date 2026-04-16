# Shop-o-matic API

Rails 8 API backend for the Shop-o-matic household shopping list app.

## Requirements

- Ruby 3.3+
- PostgreSQL 14+
- Bundler 2.x

## Setup

### 1. Install dependencies

```bash
cd api
bundle install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and a strong `JWT_SECRET`.

Alternatively, use Rails credentials:

```bash
bin/rails credentials:edit
```

Add:
```yaml
jwt_secret: your-strong-secret-here
```

### 3. Create and migrate the database

```bash
bin/rails db:create
bin/rails db:migrate
```

### 4. (Optional) Seed development data

```bash
bin/rails db:seed
```

This creates a demo user, household, and some sample items. It also prints a JWT you can use immediately for testing.

### 5. Start the server

```bash
bin/rails server
# or
bin/rails s -p 3000
```

The API will be available at `http://localhost:3000`.

---

## Authentication Flow

1. The mobile app obtains a Google ID token via Google Sign-In SDK.
2. POST the token to `/api/v1/auth/google`:
   ```json
   { "id_token": "<google_id_token>" }
   ```
3. The server verifies it with Google, creates/finds the user, and returns a JWT:
   ```json
   {
     "token": "<jwt>",
     "user": { "id": 1, "email": "...", "name": "...", "google_avatar_url": "..." }
   }
   ```
4. Include the JWT in all subsequent requests:
   ```
   Authorization: Bearer <jwt>
   ```

JWTs expire after 30 days.

---

## API Reference

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/google` | Exchange Google ID token for JWT |

**Request:**
```json
{ "id_token": "eyJ..." }
```

**Response (200):**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "email": "user@example.com", "name": "Jane", "google_avatar_url": "https://..." }
}
```

---

### Households

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/households` | List user's households |
| POST | `/api/v1/households` | Create a new household |
| GET | `/api/v1/households/:id` | Get a household |
| POST | `/api/v1/households/join` | Join via share token |

**Create household:**
```json
{ "household": { "name": "The Smith Family" } }
```

**Join household:**
```json
{ "share_token": "uuid-here" }
```

Creating or joining a household automatically seeds:
- 1 store: "Grocery Store" (#4CAF50)
- 14 default categories (Produce, Dairy Case, Meat & Seafood, etc.)

---

### Stores

All scoped under `/api/v1/households/:household_id/stores`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stores` | List stores |
| POST | `/stores` | Create store |
| PUT | `/stores/:id` | Update store |
| DELETE | `/stores/:id` | Delete store |

**Create/update store:**
```json
{ "store": { "name": "Costco", "color": "#E53935" } }
```

---

### Categories

All scoped under `/api/v1/households/:household_id/categories`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

**Create/update category:**
```json
{ "category": { "name": "International Foods" } }
```

---

### Items

All scoped under `/api/v1/households/:household_id/items`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/items` | List items (supports `?on_list=true`, `?q=search`) |
| POST | `/items` | Create item and add to list |
| PUT | `/items/:id` | Update item |
| POST | `/items/:id/add_to_list` | Put item back on list |
| POST | `/items/:id/purchase` | Mark item as purchased |
| POST | `/items/:id/unpurchase` | Unmark item as purchased |
| POST | `/items/:id/mark_unavailable` | Remove from list without purchasing |

**Create item:**
```json
{
  "item": {
    "name": "Almond Milk",
    "notes": "Unsweetened, 64oz",
    "category_id": 2,
    "store_ids": [1, 3]
  }
}
```

**Update item:**
```json
{
  "item": {
    "name": "Oat Milk",
    "category_id": 2,
    "store_ids": [1]
  }
}
```

**Item response shape:**
```json
{
  "id": 1,
  "name": "Almond Milk",
  "notes": "Unsweetened, 64oz",
  "on_list": true,
  "purchased_at": null,
  "household_id": 1,
  "category": { "id": 2, "name": "Dairy Case" },
  "stores": [{ "id": 1, "name": "Grocery Store", "color": "#4CAF50" }],
  "added_by_user_id": 1,
  "updated_by_user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Item filters:**
- `GET /items?on_list=true` — only items currently on the list
- `GET /items?q=milk` — search by name (case-insensitive, for autocomplete)

---

### Shopping Mode

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/households/:household_id/shopping/end` | End shopping mode |

Ending shopping mode sets `on_list=false` and `purchased_at=nil` for all items that have been purchased. Items remain in the database for autocomplete history.

**Response:**
```json
{ "message": "Shopping mode ended", "items_cleared": 5 }
```

---

## Item Lifecycle

```
History (on_list=false, purchased_at=nil)
    ↑ end shopping / mark_unavailable
    |
    ├─ add_to_list → On List (on_list=true, purchased_at=nil)
    |                        ↓ purchase
    |                Purchased (on_list=true, purchased_at=<time>)
    |                        ↓ end shopping
    └─────────────────────────
```

Items are **never deleted** — they remain as autocomplete history. When a user types an item name, query `?q=<name>` to suggest previously used items.

---

## Error Responses

All errors return JSON with an `error` key:

```json
{ "error": "Unauthorized: Token has expired" }
```

Validation errors also include `details`:

```json
{
  "error": "Validation failed: Name can't be blank",
  "details": ["Name can't be blank"]
}
```

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (missing required param) |
| 401 | Unauthorized (missing/invalid/expired JWT) |
| 404 | Not found |
| 422 | Validation error |

---

## Health Check

```
GET /health
→ 200 { "status": "ok" }
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Full Postgres URL (overrides individual DB_ vars) | — |
| `DB_HOST` | Postgres host | `localhost` |
| `DB_PORT` | Postgres port | `5432` |
| `DB_USERNAME` | Postgres username | — |
| `DB_PASSWORD` | Postgres password | — |
| `JWT_SECRET` | Secret key for signing JWTs | Dev fallback in development |
| `PORT` | Port to listen on | `3000` |
| `RAILS_ENV` | Rails environment | `development` |
| `RAILS_MAX_THREADS` | Puma thread count | `5` |
| `WEB_CONCURRENCY` | Puma worker count (production) | `2` |
