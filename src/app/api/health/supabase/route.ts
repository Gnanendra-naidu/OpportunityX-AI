import { NextResponse } from "next/server";
import { checkSupabaseConnection } from "@/lib/supabase/status";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await checkSupabaseConnection();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    service: "OpportunityX-AI Supabase Engine",
    ...result,
  });
}
