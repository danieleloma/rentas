#!/usr/bin/env bash
# Full local setup from repo root. Requires backend/.env (service role, JWT, etc.).
# Add DATABASE_URL + DIRECT_URL from Supabase → Settings → Database before migrations apply.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Step 1/7 — Supabase CLI: link project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx supabase link --project-ref "${SUPABASE_PROJECT_REF:-mgpteqncubkxchavikvr}" --yes

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Step 2/7 — Backend: npm install"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd "$ROOT/backend" && npm install

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Step 3/7 — Backend: Prisma generate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run prisma:generate

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Step 4/7 — Backend: TypeScript build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Step 5/7 — Frontend: npm install"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd "$ROOT/frontend" && npm install

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Step 6/7 — Frontend env from example (if missing)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ! -f "$ROOT/frontend/.env.local" ] && [ -f "$ROOT/frontend/.env.local.example" ]; then
  cp "$ROOT/frontend/.env.local.example" "$ROOT/frontend/.env.local"
  echo "Created frontend/.env.local from .env.local.example."
else
  echo ".env.local already exists or no example — skipped."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Step 7/7 — Database migrations (needs DATABASE_URL + DIRECT_URL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd "$ROOT/backend"
if grep -qE '^DATABASE_URL=.+' .env && grep -qE '^DIRECT_URL=.+' .env; then
  MIG_DIR="prisma/migrations"
  if [ -d "$MIG_DIR" ] && [ -n "$(ls -A "$MIG_DIR" 2>/dev/null)" ]; then
    npx prisma migrate dev
  else
    npx prisma migrate dev --name init
  fi
else
  echo "DATABASE_URL or DIRECT_URL is empty in backend/.env"
  echo "→ https://supabase.com/dashboard/project/mgpteqncubkxchavikvr/settings/database"
  echo "   • Transaction pooler → DATABASE_URL (?pgbouncer=true if needed)"
  echo "   • Direct connection → DIRECT_URL"
  echo "Then: cd backend && npm run prisma:migrate"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Done.  cd backend && npm run dev   |   cd frontend && npm run dev"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
