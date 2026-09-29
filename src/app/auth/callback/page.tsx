"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Mail,
  KeyRound,
} from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [callbackType, setCallbackType] = useState<string>("signup");

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        const queryType = searchParams.get("type") || "signup";
        setCallbackType(queryType);

        // Check for error parameters in query string or URL hash
        const queryError = searchParams.get("error");
        const queryErrorDesc = searchParams.get("error_description");
        const queryErrorCode = searchParams.get("error_code");

        // Hash parameters (implicit flow fallback)
        let hashParams = new URLSearchParams();
        if (typeof window !== "undefined" && window.location.hash) {
          hashParams = new URLSearchParams(window.location.hash.substring(1));
        }

        const hashError = hashParams.get("error");
        const hashErrorDesc = hashParams.get("error_description");

        if (queryError || hashError) {
          const desc =
            queryErrorDesc ||
            hashErrorDesc ||
            "The verification link has expired or has already been used.";
          setStatus("error");
          setErrorMessage(decodeURIComponent(desc.replace(/\+/g, " ")));
          return;
        }

        const supabase = getSupabaseClient();
        if (!supabase || !isSupabaseConfigured()) {
          // In offline/mock mode, redirect gracefully
          setStatus("success");
          setTimeout(() => {
            if (queryType === "recovery") {
              router.push("/reset-password");
            } else {
              router.push("/dashboard?verified=true");
            }
          }, 1000);
          return;
        }

        // Check for PKCE auth code
        const code = searchParams.get("code");
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.warn("exchangeCodeForSession notice:", error.message);
            setStatus("error");
            setErrorMessage(error.message || "Failed to verify security token. Link may have expired.");
            return;
          }

          if (data.session) {
            // Check if this was a password recovery callback
            if (queryType === "recovery" || searchParams.get("next")?.includes("reset-password")) {
              setStatus("success");
              router.push("/reset-password");
              return;
            }

            // Otherwise, it is an email verification signup callback
            setStatus("success");
            setTimeout(() => {
              router.push("/dashboard?verified=true");
            }, 1200);
            return;
          }
        }

        // If no code, probe current active session (e.g. from hash tokens)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (queryType === "recovery") {
            setStatus("success");
            router.push("/reset-password");
            return;
          }
          setStatus("success");
          setTimeout(() => {
            router.push("/dashboard?verified=true");
          }, 1200);
          return;
        }

        // If neither code nor session is present, check hash access token
        const accessToken = hashParams.get("access_token");
        const hashType = hashParams.get("type");

        if (accessToken) {
          if (hashType === "recovery" || queryType === "recovery") {
            setStatus("success");
            router.push("/reset-password");
            return;
          }
          setStatus("success");
          setTimeout(() => {
            router.push("/dashboard?verified=true");
          }, 1200);
          return;
        }

        // If nothing matches and no session
        setStatus("error");
        setErrorMessage("No active authentication tokens found or link has already been consumed.");
      } catch (err: any) {
        console.warn("Auth callback exception:", err);
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred while verifying your link.");
      }
    };

    handleAuthRedirect();
  }, [searchParams, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
        {status === "processing" && (
          <div className="space-y-4 py-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-2xs">
              <RefreshCw className="w-7 h-7 animate-spin text-brand-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Verifying Your Link...
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Please wait a moment while OpportunityX-AI securely verifies your security credentials.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {callbackType === "recovery"
                ? "Security Verified!"
                : "Email Verified Successfully!"}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              {callbackType === "recovery"
                ? "Redirecting you to set a new password..."
                : "Your OpportunityX-AI account is now activated. Redirecting you to your dashboard..."}
            </p>
            <div className="pt-2">
              <div className="h-1.5 w-32 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-5 py-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Link Expired or Invalid
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {errorMessage ||
                  "This verification or reset link has expired or has already been used. Security links expire quickly to protect your account."}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 text-left space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Next Steps:</span>
              </div>
              <p>
                {callbackType === "recovery"
                  ? "You can request a fresh password reset email from the login page."
                  : "You can request a new verification email or sign in if already verified."}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {callbackType === "recovery" ? (
                <Link
                  href="/forgot-password"
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Request New Reset Link</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Go to Sign In & Resend</span>
                </Link>
              )}

              <Link
                href="/"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Back to Homepage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-500">
          Loading authentication...
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
