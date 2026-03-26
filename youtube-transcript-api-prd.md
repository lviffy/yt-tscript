# Product Requirements Document
## YouTube Transcript API

**Version:** 1.0  
**Stack:** Next.js · TypeScript · Vercel · Supabase  
**Status:** Draft

---

## 1. Overview

A simple, developer-friendly REST API that accepts a YouTube video URL or video ID and returns the full transcript as structured text. Built on Next.js App Router, deployed on Vercel, with Supabase handling API key management and usage tracking.

---

## 2. Problem Statement

Developers who need YouTube transcripts today have to scrape the page manually, use fragile third-party libraries, or pay for expensive video intelligence platforms. There is no clean, authenticated API that does one thing well: **give me the transcript for this video**.

---

## 3. Goals

- Return a clean, timestamped transcript for any public YouTube video
- Authenticate requests via API keys
- Rate-limit usage per key
- Log all requests for analytics and abuse detection
- Ship a clear landing page with a working code example

---

## 4. Non-Goals

- No audio transcription (only videos with existing captions/transcripts)
- No video downloading or storage
- No support for private or age-restricted videos (v1)
- No dashboard UI for managing API keys (manual provisioning in v1)

---

## 5. API Endpoint

### `POST /api/v1/transcript`

**Request Headers**

| Header | Required | Description |
|---|---|---|
| `x-api-key` | ✅ | Your API key |
| `Content-Type` | ✅ | `application/json` |

**Request Body**

```json
{
  "videoId": "dQw4w9WgXcQ"
}
```

_Alternatively, a full YouTube URL is also accepted:_

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Success Response `200`**

```json
{
  "videoId": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "language": "en",
  "transcript": [
    { "start": 0.0, "duration": 3.2, "text": "We're no strangers to love" },
    { "start": 3.2, "duration": 2.8, "text": "You know the rules and so do I" }
  ],
  "fullText": "We're no strangers to love You know the rules and so do I ..."
}
```

**Error Responses**

| Status | Code | Reason |
|---|---|---|
| `400` | `MISSING_VIDEO_ID` | No `videoId` or `url` provided |
| `400` | `INVALID_VIDEO_ID` | Could not parse a valid video ID |
| `401` | `INVALID_API_KEY` | Key not found or inactive |
| `402` | `LIMIT_EXCEEDED` | Monthly request limit reached |
| `404` | `NO_TRANSCRIPT` | Video has no available captions |
| `500` | `FETCH_FAILED` | Upstream error fetching transcript |

---

## 6. File Structure

```
/
├── app/
│   ├── page.tsx                  # Landing page
│   └── api/
│       └── v1/
│           └── transcript/
│               └── route.ts      # Main API handler
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── validate-key.ts           # API key auth + usage increment
│   └── fetch-transcript.ts       # YouTube transcript fetch logic
├── middleware.ts                 # Edge middleware for key checks
├── .env.local                    # Secrets (never committed)
└── README.md
```

---

## 7. Database Schema

### Table: `api_keys`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `key` | `text` | Unique API key (e.g. `yt_live_xxxx`) |
| `email` | `text` | Owner's email address |
| `created_at` | `timestamptz` | Default `now()` |
| `requests_used` | `int4` | Incremented on each request |
| `requests_limit` | `int4` | Default `1000` |
| `is_active` | `bool` | Default `true`; set false to revoke |

### Table: `usage_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `api_key_id` | `uuid` | Foreign key → `api_keys.id` |
| `endpoint` | `text` | e.g. `/api/v1/transcript` |
| `video_id` | `text` | The requested video ID |
| `status_code` | `int2` | HTTP status returned |
| `created_at` | `timestamptz` | Default `now()` |

### Row Level Security

- Public role: **no access**
- Service role: full read/write on both tables
- All requests go through the server-side Supabase client using the service key

---

## 8. Middleware Logic

On every request to `/api/v1/*`:

1. Extract `x-api-key` from headers
2. Query `api_keys` for a matching active key
3. If not found or `is_active = false` → return `401`
4. If `requests_used >= requests_limit` → return `402`
5. Increment `requests_used` by 1
6. Insert a row into `usage_logs`
7. Pass the request to the route handler

---

## 9. Transcript Fetch Logic

1. Parse `videoId` from the request body (strip from URL if needed)
2. Fetch the YouTube video page to extract available transcript tracks
3. Select the best available language (prefer `en`, fallback to auto-generated)
4. Parse the timed text XML into a clean array of `{ start, duration, text }` objects
5. Build a `fullText` string by joining all segments
6. Return the structured response

**Library:** Use `youtube-transcript` npm package as the fetch layer, or a lightweight custom fetch against YouTube's internal timedtext endpoint.

---

## 10. Landing Page (`/`)

The landing page at the root route should include:

- **Hero:** One-line description of what the API does
- **Quick start:** Copy-paste `curl` example (shown below)
- **Response example:** Formatted JSON output
- **Pricing / limits:** Free tier = 1,000 requests/month
- **Get API key:** Simple email form that provisions a key and emails it (v1 can be manual)

**Example code snippet on the page:**

```bash
curl -X POST https://yt-tscript.vercel.app/api/v1/transcript \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"videoId": "dQw4w9WgXcQ"}'
```

---

## 11. Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, never exposed) |


---

## 12. Deployment

1. Push repo to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy — API goes live at `yt-tscript.vercel.app/api/v1/transcript`

No custom server config needed. Vercel handles scaling automatically.

---

## 13. Out of Scope for v1

- OAuth / user accounts
- API key dashboard
- Webhook support
- Batch requests (multiple videos in one call)
- Translation of transcripts
- Support for non-public videos

---

## 14. Success Metrics

| Metric | Target |
|---|---|
| p95 response time | < 1500ms |
| Uptime | > 99.5% |
| Error rate (5xx) | < 1% |
| Keys provisioned in first month | 50+ |
