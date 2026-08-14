import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the service role key to perform admin actions like
// creating auth users. Never import this from a client component.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY mungon. Shtoje si environment variable (server-only) te Netlify."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
