"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Inbox,
  ShieldAlert,
} from "lucide-react";

type ForgotPasswordStep = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 300; // 5 minutes

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    updatePassword,
    isLoading: authLoading,
  } = useAuth();

  // Multi-step state
  const [step, setStep] = useState<ForgotPasswordStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP State (6 individual digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  // Brute-force attempt tracking
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // New Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Lockout Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutRemaining > 0) {
      timer = setTimeout(() => setLockoutRemaining((prev) => prev - 1), 1000);
    } else if (lockoutRemaining === 0 && failedAttempts >= MAX_FAILED_ATTEMPTS) {
      // Reset lockout after timer finishes
      setFailedAttempts(0);
    }
    return () => clearTimeout(timer);
  }, [lockoutRemaining, failedAttempts]);

  // Auto-redirect to login after successful reset
  useEffect(() => {
    if (step === "SUCCESS") {
      const redirectTimer = setTimeout(() => {
        router.push("/login?reset=success");
      }, 2500);
      return () => clearTimeout(redirectTimer);
    }
  }, [step, router]);

  // STEP 1: Request 6-digit OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await sendPasswordResetOtp(email);
      if (res.success) {
        setStep("OTP");
        setResendCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        setFailedAttempts(0);
      } else {
        setErrorMessage(res.error || "Failed to send verification code. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Handle OTP input changes (single-digit focus advancement)
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue && value !== "") return;

    const newOtp = [...otpDigits];
    newOtp[index] = cleanValue.slice(-1); // Only take last typed digit
    setOtpDigits(newOtp);

    // Auto-advance to next input
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtpDigits(newOtp);

    // Focus last filled or next input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const fullOtpCode = otpDigits.join("");

  // STEP 2: Verify OTP
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullOtpCode.length < 6 || isSubmitting || lockoutRemaining > 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await verifyPasswordResetOtp(email, fullOtpCode);
      if (res.success) {
        setStep("NEW_PASSWORD");
        setFailedAttempts(0);
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          setLockoutRemaining(LOCKOUT_SECONDS);
          setErrorMessage(
            `Too many failed attempts. For your security, verification is locked for ${LOCKOUT_SECONDS / 60} minutes. Please wait before trying again.`
          );
        } else {
          setErrorMessage(
            `${res.error || "Invalid 6-digit code."} (${MAX_FAILED_ATTEMPTS - nextAttempts} attempt${MAX_FAILED_ATTEMPTS - nextAttempts === 1 ? "" : "s"} remaining)`
          );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting || lockoutRemaining > 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await sendPasswordResetOtp(email);
      if (res.success) {
        setResendCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setErrorMessage(res.error || "Failed to resend 6-digit code. Please try again shortly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: Validate & Submit New Password
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && passwordsMatch;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setStep("SUCCESS");
      } else {
        setErrorMessage(res.error || "Failed to update password. Your reset session may have expired.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto shadow-2xs">
          {step === "EMAIL" && <KeyRound className="w-6 h-6" />}
          {step === "OTP" && <ShieldCheck className="w-6 h-6" />}
          {step === "NEW_PASSWORD" && <Lock className="w-6 h-6" />}
          {step === "SUCCESS" && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {step === "EMAIL" && "Forgot Your Password?"}
          {step === "OTP" && "Enter 6-Digit Code"}
          {step === "NEW_PASSWORD" && "Create New Password"}
          {step === "SUCCESS" && "Password Reset Successfully!"}
        </h1>

        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {step === "EMAIL" &&
            "Enter your registered email address below and we will send you a secure 6-digit recovery code."}
          {step === "OTP" && (
            <>
              Enter the 6-digit code sent to{" "}
              <span className="font-bold text-slate-800">{email}</span>.
            </>
          )}
          {step === "NEW_PASSWORD" &&
            "Your code was verified successfully. Please choose a new secure password."}
          {step === "SUCCESS" &&
            "Your password has been changed. You can now sign in with your new credentials."}
        </p>
      </div>

      {/* Progress Dots Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`h-1.5 rounded-full transition-all ${
            step === "EMAIL" ? "w-8 bg-brand-600" : "w-2 bg-slate-200"
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all ${
            step === "OTP" ? "w-8 bg-brand-600" : "w-2 bg-slate-200"
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all ${
            step === "NEW_PASSWORD" ? "w-8 bg-brand-600" : "w-2 bg-slate-200"
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all ${
            step === "SUCCESS" ? "w-8 bg-emerald-600" : "w-2 bg-slate-200"
          }`}
        />
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block">Verification Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Lockout Warning */}
      {lockoutRemaining > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Security Lockout Active</span>
            <span>
              Too many invalid code attempts. Please wait {Math.floor(lockoutRemaining / 60)}m{" "}
              {lockoutRemaining % 60}s before retrying.
            </span>
          </div>
        </div>
      )}

      {/* STEP 1: EMAIL ENTRY FORM */}
      {step === "EMAIL" && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
              We will send a 6-digit verification code. Never share your recovery code with anyone.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Sending 6-Digit Code...</span>
            ) : (
              <>
                <span>Send 6-Digit Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: 6-DIGIT OTP VERIFICATION FORM */}
      {step === "OTP" && (
        <form onSubmit={handleOtpVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 text-center">
              Enter 6-Digit Verification Code
            </label>

            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={lockoutRemaining > 0 || isSubmitting}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-hidden focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all disabled:opacity-50"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={fullOtpCode.length < 6 || isSubmitting || lockoutRemaining > 0}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Verifying 6-Digit Code...</span>
            ) : (
              <>
                <span>Verify Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend & Deliverability Guidance */}
          <div className="pt-2 flex flex-col gap-2.5 text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isSubmitting || lockoutRemaining > 0}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white text-xs font-semibold text-slate-700 hover:text-brand-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
              {resendCooldown > 0 ? (
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  Resend code in {resendCooldown}s
                </span>
              ) : (
                <span>Resend 6-Digit Code</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setErrorMessage(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Change email address
            </button>
          </div>

          {/* Spam / Deliverability Advice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-950 text-left space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-900">
              <Inbox className="w-3.5 h-3.5 text-amber-700" />
              <span>Don't see your 6-digit code?</span>
            </div>
            <p className="leading-relaxed">
              Check your <strong>Spam / Junk</strong> folder. Emails from Supabase (
              <code>noreply@mail.app.supabase.io</code>) may be filtered by Gmail or Outlook.
            </p>
          </div>
        </form>
      )}

      {/* STEP 3: NEW PASSWORD FORM */}
      {step === "NEW_PASSWORD" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          {/* Validation Checklist */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-[11px]">
            <span className="font-bold text-slate-700 block">Password Requirements:</span>
            <div className="grid grid-cols-1 gap-1">
              <div
                className={`flex items-center gap-1.5 ${
                  hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-500"
                }`}
              >
                {hasMinLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>At least 8 characters long</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasLetter ? "text-emerald-700 font-semibold" : "text-slate-500"
                }`}
              >
                {hasLetter ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Contains at least one letter (a-z, A-Z)</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasNumber ? "text-emerald-700 font-semibold" : "text-slate-500"
                }`}
              >
                {hasNumber ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Contains at least one number (0-9)</span>
              </div>
              {newPassword.length > 0 && confirmPassword.length > 0 && (
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordsMatch ? "text-emerald-700 font-semibold" : "text-rose-600"
                  }`}
                >
                  {passwordsMatch ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span>Passwords match</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isPasswordValid || isSubmitting || authLoading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Saving New Password...</span>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION */}
      {step === "SUCCESS" && (
        <div className="space-y-5 text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              Password Reset Successfully!
            </h2>
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-medium leading-relaxed">
              Your password has been securely reset. You can now sign in with your new credentials.
            </div>
            <p className="text-xs text-slate-500">Redirecting you to the sign-in page...</p>
          </div>

          <div className="pt-2">
            <Link
              href="/login?reset=success"
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>Sign In to OpportunityX-AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Back to Sign In Link */}
      {step !== "SUCCESS" && (
        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      )}
    </div>
  );
}
