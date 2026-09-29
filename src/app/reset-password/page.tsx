"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword, isLoading: authLoading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Validate active recovery session on mount
  useEffect(() => {
    let authListenerSub: { unsubscribe: () => void } | null = null;

    const checkSession = async () => {
      try {
        // Check for URL query errors
        const queryError = searchParams.get("error");
        const queryErrorDesc = searchParams.get("error_description");

        // Check hash parameters for implicit flow
        let hashParams = new URLSearchParams();
        if (typeof window !== "undefined" && window.location.hash) {
          hashParams = new URLSearchParams(window.location.hash.substring(1));
        }

        const hashError = hashParams.get("error");
        const hashErrorDesc = hashParams.get("error_description");

        if (queryError || hashError) {
          const desc = queryErrorDesc || hashErrorDesc || "This password reset link is invalid or has expired.";
          setSessionError(decodeURIComponent(desc.replace(/\+/g, " ")));
          setHasValidSession(false);
          return;
        }

        const supabase = getSupabaseClient();
        if (supabase && isSupabaseConfigured()) {
          // 1. Check for PKCE exchange code in URL
          const code = searchParams.get("code");
          if (code) {
            const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeErr) {
              console.warn("exchangeCodeForSession error in reset-password:", exchangeErr.message);
              setSessionError(exchangeErr.message || "Failed to verify reset token. Link may have expired.");
              setHasValidSession(false);
              return;
            }
            if (data?.session) {
              setHasValidSession(true);
              return;
            }
          }

          // 2. Check for access_token in hash fragment (implicit token flow)
          const accessToken = hashParams.get("access_token");
          if (accessToken) {
            const refreshToken = hashParams.get("refresh_token") || "";
            const { data, error: setSessionErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setSessionErr) {
              console.warn("setSession error in reset-password:", setSessionErr.message);
              setSessionError(setSessionErr.message);
              setHasValidSession(false);
              return;
            }
            if (data?.session) {
              setHasValidSession(true);
              return;
            }
          }

          // 3. Check existing active session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setHasValidSession(true);
            return;
          }

          // 4. Subscribe to auth state change in case of delayed token parsing
          const { data: listenerData } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user || event === "PASSWORD_RECOVERY") {
              setHasValidSession(true);
            }
          });
          authListenerSub = listenerData.subscription;

          // Allow up to 2 seconds for session propagation before failing
          setTimeout(() => {
            setHasValidSession((current) => (current === null ? false : current));
          }, 2000);
        } else {
          // Local/mock fallback: allow testing UI freely
          setHasValidSession(true);
        }
      } catch (err: any) {
        console.warn("Session check exception in reset-password:", err);
        setSessionError(err.message || "Failed to verify reset session.");
        setHasValidSession(false);
      }
    };

    checkSession();

    return () => {
      if (authListenerSub) {
        authListenerSub.unsubscribe();
      }
    };
  }, [searchParams]);

  // Validation rules
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isValid = hasMinLength && hasLetter && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await updatePassword(password);
    if (res.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(res.error || "Failed to update password. Your reset link may have expired.");
    }
    setIsSubmitting(false);
  };

  // Checking session state
  if (hasValidSession === null) {
    return (
      <div className="max-w-md mx-auto my-14 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto animate-pulse">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Verifying Reset Session...</h2>
        <p className="text-xs text-slate-500">Checking security permissions...</p>
      </div>
    );
  }

  // Session invalid or expired
  if (!hasValidSession && !isSuccess) {
    return (
      <div className="max-w-md mx-auto my-14 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <AlertCircle className="w-7 h-7 text-rose-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Invalid or Expired Reset Session
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {sessionError ||
              "This password reset link is invalid or has expired. For your security, password reset sessions are valid for a single use only."}
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 text-left space-y-1">
          <span className="font-bold text-slate-800 block">Why did this happen?</span>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>The reset link was already clicked or used once.</li>
            <li>More than 60 minutes have passed since requesting the link.</li>
            <li>A newer password reset was requested afterwards.</li>
          </ul>
        </div>

        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Recover with Security Question</span>
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto my-14 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Password Updated Successfully!
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your OpportunityX-AI account password has been changed. You can now sign in with your new password.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login?reset=success"
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>Sign In with New Password</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Password Reset Form
  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Create New Password
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please enter and confirm your new secure password for OpportunityX-AI.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-[11px]">
          <span className="font-bold text-slate-700 block">Password Requirements:</span>
          <div className="grid grid-cols-1 gap-1">
            <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
              {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
              <span>At least 8 characters long</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasLetter ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
              {hasLetter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
              <span>Contains at least one letter (a-z, A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
              {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
              <span>Contains at least one number (0-9)</span>
            </div>
            {password.length > 0 && confirmPassword.length > 0 && (
              <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-700 font-semibold" : "text-rose-600"}`}>
                {passwordsMatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                <span>Passwords match</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting || authLoading}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span>Updating Password...</span>
          ) : (
            <>
              <span>Save New Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading password reset...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
