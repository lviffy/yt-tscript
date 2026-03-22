import { NextResponse } from "next/server";
import { ApiError, toApiError } from "@/lib/errors";
import { fetchVideoTranscript, resolveVideoId } from "@/lib/fetch-transcript";
import { getRequiredEnv } from "@/lib/supabase";

type PlaygroundPayload = {
  url?: string;
};

export async function POST(request: Request) {
  getRequiredEnv("INTERNAL_PLAYGROUND_API_KEY");

  try {
    let payload: PlaygroundPayload = {};
    try {
      payload = (await request.json()) as PlaygroundPayload;
    } catch {
      throw new ApiError(400, "MISSING_VIDEO_ID", "A JSON body is required.");
    }

    if (!payload.url?.trim()) {
      throw new ApiError(400, "MISSING_VIDEO_ID", "Provide a YouTube `url`.");
    }

    const videoId = resolveVideoId({ url: payload.url });
    const transcript = await fetchVideoTranscript(videoId);

    return NextResponse.json(transcript, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);

    return NextResponse.json(
      {
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      },
      { status: apiError.status },
    );
  }
}
