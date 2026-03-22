"use client";

import { useState } from "react";

type ApiResponse = {
  videoId: string;
  title: string;
  language: string;
  transcript: Array<{ start: number; duration: number; text: string }>;
  fullText: string;
};

export function LiveTester() {
  const [urlInput, setUrlInput] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [responseText, setResponseText] = useState<string>("");

  async function onTest() {
    setLoading(true);
    setStatus("");
    setResponseText("");

    try {
      const response = await fetch("/api/playground/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = (await response.json()) as ApiResponse | { error?: { code?: string; message?: string } };

      if (!response.ok) {
        const code = "error" in data ? data.error?.code ?? "UNKNOWN" : "UNKNOWN";
        setStatus(`${response.status} ${code}`);
        setResponseText(JSON.stringify(data, null, 2));
        return;
      }

      const okData = data as ApiResponse;
      setStatus(`200 OK • ${okData.transcript.length} segments • ${okData.language}`);
      setResponseText(JSON.stringify(okData, null, 2));
    } catch {
      setStatus("NETWORK_ERROR");
      setResponseText("Could not reach the API route.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Try it live</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Paste a YouTube URL and run a live transcript request inline.</p>

      <div className="mt-4 space-y-3">
        <label className="block text-sm text-[var(--muted)]" htmlFor="tester-url">
          YouTube URL
        </label>
        <input
          id="tester-url"
          type="text"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)] transition focus:ring-2"
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        />

        <button
          type="button"
          onClick={onTest}
          disabled={loading}
          className="w-full rounded-lg bg-[var(--brand)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Testing..." : "Run Test Request"}
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] p-3 text-sm">
        <p className="font-medium text-[var(--foreground)]">{status || "No request yet"}</p>
        <pre className="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-white p-3 text-xs leading-5 text-[var(--foreground)]">
          {responseText || "Live JSON response will appear here."}
        </pre>
      </div>
    </section>
  );
}
