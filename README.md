# Farmesh

Farmesh is organized into two top-level folders:

- `frontend/` Next.js app (UI + current server actions)
- `backend/` reserved for extracted backend services

## Project Structure

```txt
farmesh/
  frontend/
    app/
    components/
    data/
    lib/
    public/
    types/
  backend/
    src/
```

## Frontend Setup

Create `frontend/.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Commands (run from repo root)

```bash
npm run dev
npm run build
npm run start
npm run lint
```

The root scripts run the Next.js app from `frontend/`.
