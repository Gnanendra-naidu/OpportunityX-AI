import { NextRequest, NextResponse } from "next/server";
import { verifyAnswer } from "@/lib/security-questions";

/**
 * POST /api/auth/verify-security-answer
 * Verifies the security answer securely on the server with rate limiting.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;
    const answer = body?.answer;

    if (!email || !answer || typeof answer !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your security answer." },
        { status: 400 }
      );
    }

    const verification = verifyAnswer(email, answer);

    if (verification.locked) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error,
          locked: true,
          lockoutRemainingSeconds: verification.lockoutRemainingSeconds,
        },
        { status: 429 }
      );
    }

    if (!verification.success) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error,
          attemptsRemaining: verification.attemptsRemaining,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      resetToken: verification.resetToken,
    });
  } catch (err: any) {
    console.error("Error in verify-security-answer:", err);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
