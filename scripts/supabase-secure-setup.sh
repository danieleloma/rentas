#!/usr/bin/env bash
# Secure Supabase CLI bootstrap for Rentas (run from repo root).
# - Never prints or writes service_role / DB passwords to the repo.
# - Keeps secrets in gitignored paths: ~/.supabase (login), supabase/.temp (link state), backend/.env

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Supabase CLI"
npx supabase --version

echo "==> Initialize config (idempotent)"
npx supabase init --yes 2>/dev/null || true

echo "==> Check login (opens browser on first use: npx supabase login)"
if ! npx supabase projects list >/dev/null 2>&1; then
  echo "Not logged in. Run: npx supabase login"
  exit 1
fi

PROJECT_REF="${SUPABASE_PROJECT_REF:-mgpteqncubkxchavikvr}"
echo "==> Link to project $PROJECT_REF"
npx supabase link --project-ref "$PROJECT_REF" --yes

echo ""
echo "Done. Security notes:"
echo "  - supabase/.temp/ is gitignored — do not commit it."
echo "  - Paste DB URI + service_role only into backend/.env (gitignored)."
echo "  - Anon key belongs in frontend/.env.local only."
echo ""
echo "Next:"
echo "  cd backend && npm run prisma:migrate"
echo "  Create Storage bucket: ${SUPABASE_STORAGE_BUCKET:-listing-media} (public read if using public URLs)"
