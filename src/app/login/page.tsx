"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Sprout,
  Briefcase,
  Layers,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const isVerifiedParam = searchParams.get("verified") === "true";
  const isResetParam = searchParams.get("reset") === "success";

  const { signIn, resendVerificationEmail, loginAsDemoPersona, isLoading: authLoading, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unconfirmed email resend state
  const [isUnconfirmedEmail, setIsUnconfirmedEmail] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && !isSubmitting) {
      router.push(redirectPath);
    }
  }, [user, redirectPath, router, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setIsUnconfirmedEmail(false);
    setResendNotice(null);

    const res = await signIn(email, password);
    if (res.success) {
      router.push(redirectPath);
    } else {
      setErrorMessage(res.error || "Authentication failed. Please verify credentials.");
      if (res.unconfirmedEmail) {
        setIsUnconfirmedEmail(true);
      }
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    setResendNotice(null);
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        setResendNotice("Verification email resent! Please check your inbox and spam folder.");
      } else {
        setResendNotice(res.error || "Failed to resend verification email.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleQuickDemoLogin = (persona: "student" | "farmer" | "entrepreneur") => {
    loginAsDemoPersona(persona);
    router.push(redirectPath);
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome to OpportunityX-AI
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Sign in to access your saved opportunities, deadline trackers, and personalized citizen scheme matching.
        </p>
      </div>

      {/* Verification Success Banner */}
      {isVerifiedParam && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">
            Email verified successfully! You can now sign in to your OpportunityX-AI account.
          </span>
        </div>
      )}

      {/* Password Reset Success Banner */}
      {isResetParam && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">
            Password reset successfully! Please sign in with your new password.
          </span>
        </div>
      )}

      {/* Public Search Notice */}
      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Open Public Access:</strong> You can search and filter all scholarships and government schemes without an account. Sign-in is only needed for saving bookmarks and profile matching.
        </span>
      </div>

      {/* Error alert with Resend Option */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>

          {isUnconfirmedEmail && (
            <div className="pt-1 border-t border-rose-200/60 flex items-center justify-between">
              <span className="text-[11px] text-rose-700">Need a new link?</span>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="text-[11px] font-bold text-rose-900 underline hover:text-rose-950 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : (
                  <span>Resend verification email</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resend Feedback Notice */}
      {resendNotice && (
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <span>{resendNotice}</span>
        </div>
      )}

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. citizen@example.com"
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || authLoading}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In to OpportunityX-AI</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* 1-Click Evaluation Personas for Hackathon Evaluators */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Hackathon 1-Click Test Logins:</span>
          </span>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
            Instant Demo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("student")}
            className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/50 text-left transition-all flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Pooja Sharma (Student)</p>
                <p className="text-[11px] text-slate-500">B.Tech Engineering • Karnataka • OBC</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-brand-700">Select →</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin("farmer")}
            className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Ramesh Patil (Farmer)</p>
                <p className="text-[11px] text-slate-500">Small Landholding • Maharashtra • General</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">Select →</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin("entrepreneur")}
            className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/50 text-left transition-all flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Lakshmi Narayanan (Entrepreneur)</p>
                <p className="text-[11px] text-slate-500">Micro-Enterprise • Tamil Nadu • OBC</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-amber-700">Select →</span>
          </button>
        </div>
      </div>

      {/* Switch to Signup */}
      <div className="text-center pt-2 text-xs text-slate-500">
        Don't have an account?{" "}
        <Link
          href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
          className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
        >
          Create Profile & Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
