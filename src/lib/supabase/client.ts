import { createClient, SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * Validates if the configured Supabase environment variables are real active keys
 * or placeholder defaults.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes("placeholder-project") || anonKey.includes("placeholder-anon-key")) {
    return false;
  }
  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    return false;
  }

  return true;
}

/**
 * Returns a singleton browser Supabase client.
 * Safe for use in client components and server components without exposing secrets.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") {
    // Server execution: check env directly
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey || !isSupabaseConfigured()) {
      return null;
    }
    return createClient(url, anonKey);
  }

  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || !isSupabaseConfigured()) {
    return null;
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}
