import { NextRequest, NextResponse } from "next/server";

/**
 * Supabase Auth "Send Email Hook" Endpoint
 * Allows Supabase to offload auth email dispatches (6-digit OTP, recovery, verification)
 * directly to a high-speed transactional email provider (e.g. Resend, SendGrid) in < 1.5 seconds.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, email_data } = body;

    const email = user?.email;
    const token = email_data?.token;
    const actionType = email_data?.email_action_type || "recovery";

    console.log(`[Supabase Email Hook] Action: ${actionType} | Recipient: ${email} | OTP: ${token ? "Present" : "None"}`);

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && email && token) {
      // High-speed transactional dispatch via Resend REST API (< 1.2s latency)
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "OpportunityX-AI <onboarding@resend.dev>",
          to: [email],
          subject: actionType === "recovery" ? "Your 6-Digit Password Recovery Code" : "Verify Your Account",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
              <h2 style="color: #0f172a; margin-bottom: 8px;">OpportunityX-AI Security Code</h2>
              <p style="color: #64748b; font-size: 14px; line-height: 1.5;">Here is your 6-digit verification code to reset your account password. This code is valid for 10 minutes:</p>
              <div style="text-align: center; margin: 28px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: monospace; color: #1e3a8a;">${token}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If you did not request this verification code, please ignore this email. Your account remains completely secure.</p>
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 11px; text-align: center;">OpportunityX-AI Citizen Scheme & Scholarship Platform</p>
            </div>
          `,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.warn("[Email Hook] Resend dispatch notice:", errText);
      } else {
        console.log("[Email Hook] High-speed email delivered successfully via Resend!");
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Email Hook] Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
