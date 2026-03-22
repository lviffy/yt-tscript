import { NextResponse } from "next/server";
import { ApiError, toApiError } from "@/lib/errors";
import { fetchVideoTranscript, resolveVideoId } from "@/lib/fetch-transcript";
import { logUsage, validateAndConsumeApiKey } from "@/lib/validate-key";

type RequestPayload = {
  videoId?: string;
  url?: string;
};

export async function POST(request: Request) {
  const apiKeyHeader = request.headers.get("x-api-key") ?? "";
  let keyContext: { id: string } | null = null;
  let videoIdForLog: string | null = null;

  try {
    keyContext = await validateAndConsumeApiKey(apiKeyHeader);

    let payload: RequestPayload = {};
    try {
      payload = (await request.json()) as RequestPayload;
    } catch {
      throw new ApiError(400, "MISSING_VIDEO_ID", "A JSON body is required.");
    }

    const videoId = resolveVideoId(payload);
    videoIdForLog = videoId;

    const transcript = await fetchVideoTranscript(videoId);

    await logUsage({
      apiKeyId: keyContext.id,
      endpoint: "/api/v1/transcript",
      videoId,
      statusCode: 200,
    });

    return NextResponse.json(transcript, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);

    if (keyContext) {
      await logUsage({
        apiKeyId: keyContext.id,
        endpoint: "/api/v1/transcript",
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
