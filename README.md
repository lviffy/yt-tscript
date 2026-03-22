# YouTube Transcript API

Developer-first API for returning timestamped transcript text from public YouTube videos.

## Stack

- Next.js App Router + TypeScript
- Supabase (API key auth, usage limits, request logs)
- Vercel deployment target

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Set values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=https://yt-tscript.vercel.app
SUPABASE_SERVICE_ROLE_KEY=...
INTERNAL_PLAYGROUND_API_KEY=yt_live_playground_internal_key
```

4. Start dev server:

```bash
npm run dev
```

## API endpoint

### `POST /api/v1/transcript`

Headers:

- `Content-Type: application/json`
- `x-api-key: YOUR_API_KEY`

Body:

```json
{
  "videoId": "dQw4w9WgXcQ"
}
```

or

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

Success response:

```json
{
  "videoId": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "language": "en",
  "transcript": [
    { "start": 0.0, "duration": 3.2, "text": "We're no strangers to love" },
    { "start": 3.2, "duration": 2.8, "text": "You know the rules and so do I" }
  ],
  "fullText": "We're no strangers to love You know the rules and so do I ...",
  "plainEnglishText": "We're no strangers to love. You know the rules and so do I."
}
```

Error codes:

- `MISSING_VIDEO_ID` (`400`)
- `INVALID_VIDEO_ID` (`400`)
- `INVALID_API_KEY` (`401`)
- `LIMIT_EXCEEDED` (`402`)
- `NO_TRANSCRIPT` (`404`)
- `FETCH_FAILED` (`500`)

## Supabase schema

SQL migration files are included in [supabase/migrations/0001_init_api_schema.sql](supabase/migrations/0001_init_api_schema.sql).

You can apply this in one of two ways:

1. Supabase SQL Editor: paste and run the migration SQL.
2. Supabase CLI: link project, then run migration commands.

Optional dev seed is in [supabase/seed.sql](supabase/seed.sql).

### `api_keys`

- `id uuid primary key`
- `key text unique not null`
- `user_id uuid references auth.users(id)`
- `created_at timestamptz default now()`
- `requests_used int4 not null default 0`
- `requests_limit int4 not null default 100`
- `is_active bool not null default true`

### `usage_logs`

- `id uuid primary key`
- `api_key_id uuid references api_keys(id)`
- `endpoint text not null`
- `video_id text`
- `status_code int2 not null`
- `created_at timestamptz default now()`

## Notes

- Proxy enforces `x-api-key` header presence on all `/api/v1/*` routes.
- The route handler enforces monthly limits using `usage_logs` (`100` requests per month by default), increments usage, and logs request status.
- Supabase Auth powers `/signup` and `/login` with redirect to `/dashboard` on success.
- On first dashboard load, the app auto-generates a key in format `yt_live_<nanoid>` and stores it in `api_keys` with `user_id`.
- Dashboard shows remaining requests for the current month and includes a contact button for limit increases.
- Landing page playground calls `/api/playground/transcript` and uses a restricted internal key server-side.

## New routes

- `/signup`
- `/login`
- `/dashboard`
