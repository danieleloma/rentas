# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Monorepo with two independently deployable apps:

```
backend/    Express 5 + Prisma + PostgreSQL (Supabase) + Redis — REST API + WebSocket
frontend/   Next.js 14 (App Router) + Zustand + React Query — deployed to Vercel
supabase/   Migrations and RLS policies
```

---

## Commands

### Frontend (`cd frontend`)
```bash
npm run dev        # dev server on port 3001
npm run build      # production build (runs type-check + lint)
npm run lint       # ESLint
npm run test       # Vitest (run once)
npm run test:watch # Vitest watch mode
```

### Backend (`cd backend`)
```bash
npm run dev              # ts-node-dev with hot reload on port 3000
npm run build            # prisma generate + tsc
npm run lint             # ESLint
npm test                 # Jest
npm run test:coverage    # Jest with lcov coverage
npm run prisma:migrate   # Run DB migrations (dev)
npm run prisma:studio    # Prisma GUI
```

### Full stack local
```bash
docker-compose up   # PostgreSQL (5432), Redis (6379), API (3000), Web (3001)
```

---

## Architecture

### Auth

Auth is **Supabase-based throughout** — there is no custom JWT issuance from the backend for regular usage. The flow is:

1. `supabase.auth.signUp/signIn` on the frontend creates a Supabase session
2. `DashboardAuthGate` resolves the session on mount, fetches the user profile via `getMeApi`, and stores it in `authStore` (Zustand, persisted to localStorage)
3. The Axios `apiClient` (`frontend/src/lib/api/client.ts`) reads `supabase.auth.getSession()` on every request and attaches `Authorization: Bearer <token>`
4. The backend `authenticate` middleware verifies the JWT against `JWT_SECRET`
5. **Public routes**: `/listings` and `/listings/[id]` use `DashboardAuthGate allowGuests={true}` — auth state is resolved (for sidebar display) but unauthenticated users are not redirected

Do **not** add `accessToken`, `refreshToken`, or `setTokens` to `AuthState` — these were removed. Always get tokens from `supabase.auth.getSession()`.

### Frontend routing groups

```
app/(auth)/       login, register, forgot-password — no layout chrome
app/(browse)/     listings/, listings/[id]/ — public, shows sidebar
app/(dashboard)/  messages, visits, movers, profile, listings/new — requires auth
app/page.tsx      Landing page (server component + FeaturedListingsSection client component)
```

Route groups share layouts. `(browse)` and `(dashboard)` both render the full Sidebar + BottomNav shell; the only difference is `allowGuests`.

### Frontend data flow

- **Server state**: React Query (`@tanstack/react-query`) via hooks in `src/hooks/`
- **Client state**: Zustand stores in `src/store/` — `authStore` (user + isAuthenticated), `listingStore` (filters), `uiStore` (toasts/modals), `themeStore`
- **API calls**: `src/lib/api/*.ts` — plain async functions that call either `supabase` directly (listings, auth) or `apiClient` (axios) for backend endpoints
- Listings use Supabase client directly (not the backend API) with a demo-data fallback when the query fails

### Backend structure

```
src/controllers/   HTTP handlers — validate input, call service, send response
src/services/      Business logic + Prisma queries
src/routes/        Express routers — mount controllers, apply middleware
src/middleware/    authenticate, requireRole, validate (Zod), rateLimiter, errorHandler
src/websocket/     Socket.io — JWT auth on connect, real-time messaging rooms
src/workers/       Bull queues — notifications, emails
```

All responses use the shared `sendSuccess` / `sendError` helpers from `src/utils/response.ts`. Errors propagate via `next(error)` to the central error handler.

### Database

Prisma schema in `backend/prisma/schema.prisma`. Key models: `User`, `Listing`, `ListingImage`, `Conversation`, `Message`, `Visit`, `Review`, `Mover`, `MoverBooking`, `Favorite`.

Supabase Storage bucket `listing-media` holds listing images. RLS policies are in `supabase/migrations/`.

### Real-time

`useSocket` (`frontend/src/hooks/useSocket.ts`) connects to the backend Socket.io server only when `isAuthenticated` is true. It fetches the access token via `supabase.auth.getSession()` — do not read it from the store.

---

## Environment variables

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` — backend base URL (e.g. `http://localhost:3000/api`)
- `NEXT_PUBLIC_WS_URL` — WebSocket server URL (e.g. `http://localhost:3000`)

**Backend** (`.env`) — see `backend/.env.example` for the full list. Key ones:
- `DATABASE_URL`, `DIRECT_URL` — Supabase Postgres (pooled + direct)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `REDIS_URL`
- `FRONTEND_URL` — CORS allowlist

---

## Deployment

- **Frontend**: Vercel, auto-deploys from `main`. Build root is `frontend/`.
- **Backend**: Docker (`backend/Dockerfile`). On startup runs `prisma db push` then `node dist/server.js`.
- **CI**: `.github/workflows/ci.yml` — lint + typecheck + test on both apps for every push to `main`/`develop`.
