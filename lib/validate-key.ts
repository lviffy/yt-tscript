import { ApiError } from "@/lib/errors";
import { getServiceSupabase } from "@/lib/supabase";

type ApiKeyProjection = {
  id: string;
  key: string;
  is_active: boolean;
  requests_used: number;
  requests_limit: number;
};

type QueryError = { message: string } | null;

type ApiKeysUpdater = {
  update(values: { requests_used: number }): {
    eq(column: "id", value: string): Promise<{ error: QueryError }>;
  };
};

type UsageLogsInserter = {
  insert(values: {
    api_key_id: string;
    endpoint: string;
    video_id: string | null;
    status_code: number;
  }): Promise<{ error: QueryError }>;
};

export type ValidatedApiKey = {
  id: string;
};

export async function validateAndConsumeApiKey(rawApiKey: string): Promise<ValidatedApiKey> {
  const apiKey = rawApiKey.trim();
  if (!apiKey) {
    throw new ApiError(401, "INVALID_API_KEY", "API key is required.");
  }

  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("api_keys")
    .select("id,key,is_active,requests_used,requests_limit")
    .eq("key", apiKey)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "FETCH_FAILED", "Failed to validate API key.");
  }

  const row = data as unknown as ApiKeyProjection | null;

  if (!row || !row.is_active) {
    throw new ApiError(401, "INVALID_API_KEY", "API key is invalid or inactive.");
  }

  if (row.requests_used >= row.requests_limit) {
    throw new ApiError(402, "LIMIT_EXCEEDED", "Monthly request limit reached.");
  }

  const apiKeysTable = supabase.from("api_keys") as unknown as ApiKeysUpdater;
  const { error: updateError } = await apiKeysTable
    .update({ requests_used: row.requests_used + 1 })
    .eq("id", row.id);

  if (updateError) {
    throw new ApiError(500, "FETCH_FAILED", "Failed to update API key usage.");
  }

  return { id: row.id };
}

export async function logUsage(params: {
  apiKeyId: string;
  endpoint: string;
  videoId: string | null;
  statusCode: number;
}): Promise<void> {
  const supabase = getServiceSupabase();

  const usageLogsTable = supabase.from("usage_logs") as unknown as UsageLogsInserter;

  const { error } = await usageLogsTable.insert({
    api_key_id: params.apiKeyId,
    endpoint: params.endpoint,
    video_id: params.videoId,
    status_code: params.statusCode,
  });

  if (error) {
    console.error("Failed to write usage log", error.message);
  }
}
