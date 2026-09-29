import { NextRequest, NextResponse } from "next/server";
import { getSecurityQuestionForEmail } from "@/lib/security-questions";

/**
 * POST /api/auth/security-question
 * Returns the security question for the provided email.
 * Anti-enumeration: returns standard question if account does not exist.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const question = getSecurityQuestionForEmail(email);

    return NextResponse.json({
      success: true,
      question,
    });
  } catch (err: any) {
    console.error("Error retrieving security question:", err);
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
