import { NextRequest, NextResponse } from "next/server";
import { setSecurityQuestion } from "@/lib/security-questions";

/**
 * POST /api/auth/set-security-question
 * Saves a user's security question and hashed answer securely on the server.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, question, answer } = body;

    if (!email || !question || !answer) {
      return NextResponse.json(
        { success: false, error: "Email, security question, and answer are required." },
        { status: 400 }
      );
    }

    setSecurityQuestion(email, question, answer);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in set-security-question:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save security question." },
      { status: 500 }
    );
  }
}
