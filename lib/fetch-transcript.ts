import { fetchTranscript } from "youtube-transcript";
import { ApiError } from "@/lib/errors";

type RawTranscriptSegment = {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
};

export type TranscriptSegment = {
  start: number;
  duration: number;
  text: string;
};

export type TranscriptResult = {
  videoId: string;
  title: string;
  language: string;
  transcript: TranscriptSegment[];
  fullText: string;
};

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function parseVideoIdFromUrl(rawUrl: string): string | null {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const maybeId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return VIDEO_ID_RE.test(maybeId) ? maybeId : null;
  }

  if (host === "youtube.com" || host.endsWith(".youtube.com")) {
    const v = url.searchParams.get("v");
    if (v && VIDEO_ID_RE.test(v)) {
      return v;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const taggedId = parts.length >= 2 && ["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : null;
    if (taggedId && VIDEO_ID_RE.test(taggedId)) {
      return taggedId;
    }
  }

  return null;
}

export function resolveVideoId(payload: { videoId?: string; url?: string }): string {
  const rawVideoId = payload.videoId?.trim();

  if (rawVideoId && VIDEO_ID_RE.test(rawVideoId)) {
    return rawVideoId;
  }

  if (rawVideoId) {
    throw new ApiError(400, "INVALID_VIDEO_ID", "Could not parse a valid YouTube video ID.");
  }

  const rawUrl = payload.url?.trim();
  if (!rawUrl) {
    throw new ApiError(400, "MISSING_VIDEO_ID", "Provide either `videoId` or `url`.");
  }

  const parsedId = parseVideoIdFromUrl(rawUrl);
  if (!parsedId) {
    throw new ApiError(400, "INVALID_VIDEO_ID", "Could not parse a valid YouTube video ID.");
  }

  return parsedId;
}

async function fetchVideoTitle(videoId: string): Promise<string> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    return videoId;
  }

  const json = (await response.json()) as { title?: string };
  return json.title?.trim() || videoId;
}

export async function fetchVideoTranscript(videoId: string): Promise<TranscriptResult> {
  let transcriptRows: RawTranscriptSegment[];

  try {
    transcriptRows = (await fetchTranscript(videoId)) as RawTranscriptSegment[];
  } catch {
    throw new ApiError(404, "NO_TRANSCRIPT", "No transcript found for this video.");
  }

  if (!transcriptRows.length) {
    throw new ApiError(404, "NO_TRANSCRIPT", "No transcript found for this video.");
  }

  const transcript = transcriptRows.map((row) => ({
    start: Number(row.offset ?? 0),
    duration: Number(row.duration ?? 0),
    text: (row.text ?? "").trim(),
  }));

  const fullText = transcript
    .map((segment) => segment.text)
    .filter(Boolean)
    .join(" ");

  return {
    videoId,
    title: await fetchVideoTitle(videoId),
    language: transcriptRows[0]?.lang ?? "unknown",
    transcript,
    fullText,
  };
}
