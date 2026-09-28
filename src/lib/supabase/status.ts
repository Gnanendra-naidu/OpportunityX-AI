import { getSupabaseClient, isSupabaseConfigured } from "./client";

export interface SupabaseHealthCheckResult {
  isConfigured: boolean;
  isConnected: boolean;
  latencyMs?: number;
  message: string;
  tablesDetected?: string[];
  opportunityRowCount?: number;
  supabaseUrl?: string;
}

/**
 * Checks connection to the Supabase PostgreSQL database
 */
export async function checkSupabaseConnection(): Promise<SupabaseHealthCheckResult> {
  const isConfigured = isSupabaseConfigured();

  if (!isConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      message: "Supabase environment variables are using placeholder values or not configured. OpportunityX-AI is running in verified local fallback mode.",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not specified",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      isConfigured: true,
      isConnected: false,
      message: "Failed to initialize Supabase client instance.",
    };
  }

  const startTime = Date.now();
  try {
    const tableNames = [
      "opportunities",
      "eligibility_criteria",
      "required_documents",
      "opportunity_deadlines",
      "official_sources",
      "user_profiles",
      "saved_opportunities",
    ];

    const verifiedTables: string[] = [];

    // Verify opportunities table first
    const { data, count, error } = await supabase
      .from("opportunities")
      .select("id", { count: "exact", head: false })
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        latencyMs,
        message: `Database connection attempted, but error returned: ${error.message} (Code: ${error.code})`,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      };
    }

    verifiedTables.push("opportunities");

    // Check remaining tables
    await Promise.all(
      tableNames.slice(1).map(async (table) => {
        try {
          const res = await supabase.from(table).select("*", { count: "exact", head: true });
          if (!res.error) {
            verifiedTables.push(table);
          }
        } catch {
          // Ignore individual table check exceptions
        }
      })
    );

    return {
      isConfigured: true,
      isConnected: true,
      latencyMs,
      message: "Successfully connected to Supabase PostgreSQL database.",
      opportunityRowCount: count ?? (data ? data.length : 0),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tablesDetected: verifiedTables,
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      latencyMs: Date.now() - startTime,
      message: `Failed to connect to Supabase: ${err.message || String(err)}`,
    };
  }
}
