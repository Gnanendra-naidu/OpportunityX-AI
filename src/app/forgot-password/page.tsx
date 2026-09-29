"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await resetPasswordForEmail(email);
      setSubmitted(true);
      setCooldown(60);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting || !email) return;

    setIsSubmitting(true);
    try {
      await resetPasswordForEmail(email);
      setCooldown(60);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto shadow-2xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Forgot Your Password?
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Enter your registered email address below and we will send you secure instructions to reset your password.
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Account Email Address
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

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <span>
              For security, the password reset link is temporary and can only be used once. Check your spam folder if you do not receive it in 2 minutes.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Sending Instructions...</span>
            ) : (
              <>
                <span>Send Password Reset Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-5 text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              Check Your Email
            </h2>
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-medium leading-relaxed">
              If an account exists for this email, we've sent password reset instructions.
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We sent an email to <span className="font-semibold text-slate-800">{email}</span>. Please click the secure reset link inside to choose a new password.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isSubmitting}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white text-xs font-semibold text-slate-700 hover:text-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
              {cooldown > 0 ? (
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  Resend available in {cooldown}s
                </span>
              ) : (
                <span>Resend Reset Email</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Back to Login link */}
      <div className="text-center pt-2 border-t border-slate-100">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
