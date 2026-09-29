import { createClient, SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function getEnvUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
}

function getEnvKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY
  );
}

/**
 * Validates if the configured Supabase environment variables are real active keys
 * or placeholder defaults.
 */
export function isSupabaseConfigured(): boolean {
  const url = getEnvUrl();
  const key = getEnvKey();

  if (!url || !key) return false;
  if (url.includes("placeholder-project") || key.includes("placeholder-anon-key")) {
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
  const url = getEnvUrl();
  const key = getEnvKey();

  if (!url || !key || !isSupabaseConfigured()) {
    return null;
  }

  if (typeof window === "undefined") {
    // Server execution: check env directly
    return createClient(url, key);
  }

  if (browserClient) return browserClient;

  browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}
