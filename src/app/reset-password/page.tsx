"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const { updatePassword, isLoading: authLoading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate active recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient();
        if (supabase && isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          // Active user session exists (established by PKCE or hash token from callback)
          if (session?.user) {
            setHasValidSession(true);
            return;
          }

          // In case onAuthStateChange is still firing
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user || event === "PASSWORD_RECOVERY") {
              setHasValidSession(true);
            }
          });

          // Wait 1.5s before declaring session absent
          setTimeout(() => {
            setHasValidSession((current) => (current === null ? false : current));
            authListener.subscription.unsubscribe();
          }, 1500);
        } else {
          // Local/mock fallback: allow testing UI freely
          setHasValidSession(true);
        }
      } catch (err) {
        console.warn("Session check error:", err);
        setHasValidSession(false);
      }
    };

    checkSession();
  }, []);

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
            This password reset link is invalid or has expired. For your security, password reset sessions are valid for a single use only.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Request New Reset Link</span>
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
