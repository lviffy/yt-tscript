import { redirect } from "next/navigation";
import { CopyApiKeyButton } from "@/app/components/copy-api-key-button";
import { ensureUserApiKey } from "@/lib/generate-api-key";
import { getServerSupabase } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const keyRow = await ensureUserApiKey(user.id);

  async function signOutAction() {
    "use server";
    const actionSupabase = await getServerSupabase();
    await actionSupabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 px-5 py-10 sm:px-8">
      <section className="card w-full p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              Log out
            </button>
          </form>
        </div>

        <p className="mt-3 text-sm text-[var(--muted)]">Signed in as {user.email}</p>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <p className="text-sm font-medium text-[var(--foreground)]">Your API key</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="block flex-1 overflow-x-auto rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm">
              {keyRow.key}
            </code>
            <CopyApiKeyButton apiKey={keyRow.key} />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">Use this key in the x-api-key header when calling /api/v1/transcript.</p>
        </div>
      </section>
    </div>
  );
}
