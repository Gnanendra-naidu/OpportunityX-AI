import { NextResponse } from "next/server";
import { processAssistantQuery } from "@/lib/ai/assistantEngine";
import { getOpportunities } from "@/lib/supabase/opportunities";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, userProfile, selectedOpportunity, selectedOpportunityId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Query message is required." },
        { status: 400 }
      );
    }

    // Retrieve live opportunities from Supabase
    const { opportunities } = await getOpportunities();

    // Resolve target opportunity if ID was supplied or object passed
    let activeOpportunity = selectedOpportunity || null;
    if (!activeOpportunity && selectedOpportunityId && Array.isArray(opportunities)) {
      activeOpportunity = opportunities.find((o) => o.id === selectedOpportunityId) || null;
    }

    // Process query server-side (keeping all keys / logic protected)
    const assistantResult = processAssistantQuery(
      message,
      userProfile,
      opportunities,
      activeOpportunity
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...assistantResult,
    });
  } catch (error: any) {
    console.error("AI Assistant API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error processing assistant request.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
