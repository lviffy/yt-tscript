import { LiveTester } from "@/app/components/live-tester";

export default function Home() {
  const curlExample = `curl -X POST https://your-project.vercel.app/api/v1/transcript \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"videoId": "dQw4w9WgXcQ"}'`;

  const responseExample = `{
  "videoId": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "language": "en",
  "transcript": [
    { "start": 0.0, "duration": 3.2, "text": "We're no strangers to love" },
    { "start": 3.2, "duration": 2.8, "text": "You know the rules and so do I" }
  ],
  "fullText": "We're no strangers to love You know the rules and so do I ..."
}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-8 sm:px-8 lg:gap-8 lg:py-14">
      <header className="fade-in-up card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <p className="text-sm font-medium tracking-wide text-[var(--brand-strong)]">YouTube Transcript API</p>
          <p className="text-sm text-[var(--muted)]">v1 • REST + JSON</p>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
              Full timestamped transcripts from public YouTube videos, through one reliable endpoint.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-[17px]">
              Send a video ID or URL and receive structured transcript data ready for search, summarization, or
              downstream NLP workflows.
            </p>
          </div>
          <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 text-sm text-[var(--muted)]">
            <p>p95 response target: &lt; 1500ms</p>
            <p>Free tier: 1,000 requests/month</p>
            <p>Deployment: Vercel + Supabase</p>
          </div>
        </div>
      </header>

      <div className="fade-in-up [animation-delay:70ms]">
        <LiveTester />
      </div>

      <main className="fade-in-up space-y-5 [animation-delay:90ms]">
        <article className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Quick start</h2>
            <span className="text-xs uppercase tracking-wide text-[var(--muted)]">POST /api/v1/transcript</span>
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Pass either videoId or a full YouTube URL in the request body.</p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[#f8faf8] p-4 text-sm leading-6 text-[#22312c]">
            <code>{curlExample}</code>
          </pre>
        </article>

        <article className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Response shape</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Includes canonical metadata, segment timings, and a combined fullText field.
          </p>
          <pre className="mt-4 max-h-[320px] overflow-auto rounded-lg border border-[var(--border)] bg-[#faf8f4] p-4 text-sm leading-6 text-[#2b2318]">
            <code>{responseExample}</code>
          </pre>
        </article>

        <section className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Operational notes</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] p-3">
              <p className="font-medium">Authentication</p>
              <p className="mt-1 leading-6 text-[var(--muted)]">x-api-key required on all /api/v1 requests.</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] p-3">
              <p className="font-medium">Rate limits</p>
              <p className="mt-1 leading-6 text-[var(--muted)]">Per-key monthly limits enforced server-side.</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] p-3">
              <p className="font-medium">Logging</p>
              <p className="mt-1 leading-6 text-[var(--muted)]">Requests logged with status and video ID.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
