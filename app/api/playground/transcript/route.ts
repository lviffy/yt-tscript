import { NextResponse } from "next/server";
import { ApiError, toApiError } from "@/lib/errors";
import { fetchVideoTranscript, resolveVideoId } from "@/lib/fetch-transcript";
import { getRequiredEnv } from "@/lib/supabase";
import { ensureUserApiKey } from "@/lib/generate-api-key";
import { getServerSupabase } from "@/lib/supabase-server";
import { consumeQuotaForApiKey, logUsage, validateAndConsumeApiKey } from "@/lib/validate-key";

type PlaygroundPayload = {
  url?: string;
};

export async function POST(request: Request) {
  const internalKey = getRequiredEnv("INTERNAL_PLAYGROUND_API_KEY");
  let keyContext: { id: string } | null = null;
  let videoIdForLog: string | null = null;

  try {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const keyRow = await ensureUserApiKey(user.id);
      await consumeQuotaForApiKey(keyRow.id, keyRow.requests_limit);
      keyContext = { id: keyRow.id };
    } else {
      keyContext = await validateAndConsumeApiKey(internalKey);
    }

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
    videoIdForLog = videoId;
    const transcript = await fetchVideoTranscript(videoId);

    if (keyContext) {
      await logUsage({
        apiKeyId: keyContext.id,
        endpoint: "/api/playground/transcript",
        videoId,
        statusCode: 200,
      });
    }

    return NextResponse.json(transcript, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);

    if (keyContext) {
      await logUsage({
        apiKeyId: keyContext.id,
        endpoint: "/api/playground/transcript",
        videoId: videoIdForLog,
        statusCode: apiError.status,
      });
    }

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
