import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type Database, getRequiredEnv } from "@/lib/supabase";

let browserClient: SupabaseClient<Database> | null = null;

export function getBrowserSupabase() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );

  return browserClient;
}
