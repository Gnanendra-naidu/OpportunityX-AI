"use client";

import React, { useState, useEffect } from "react";
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
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

type ForgotPasswordStep = "EMAIL" | "SECURITY_QUESTION" | "NEW_PASSWORD" | "SUCCESS";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 300; // 5 minutes

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    getSecurityQuestion,
    verifySecurityAnswer,
    resetPasswordWithSecurityAnswer,
    isLoading: authLoading,
  } = useAuth();

  // Multi-step state
  const [step, setStep] = useState<ForgotPasswordStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Security Question & Answer state
  const [question, setQuestion] = useState("What is your favorite school/college?");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Rate-limiting / lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // New Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Lockout Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutRemaining > 0) {
      timer = setTimeout(() => setLockoutRemaining((prev) => prev - 1), 1000);
    } else if (lockoutRemaining === 0 && failedAttempts >= MAX_FAILED_ATTEMPTS) {
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

  // STEP 1: Query Security Question for Email (anti-enumeration protected)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await getSecurityQuestion(email);
      if (res.success && res.question) {
        setQuestion(res.question);
      } else {
        // Fallback default question (anti-enumeration defense)
        setQuestion("What is your favorite school/college?");
      }
      setSecurityAnswer("");
      setFailedAttempts(0);
      setStep("SECURITY_QUESTION");
    } catch {
      setQuestion("What is your favorite school/college?");
      setStep("SECURITY_QUESTION");
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify Security Answer
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer.trim() || isSubmitting || lockoutRemaining > 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await verifySecurityAnswer(email, securityAnswer);

      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setStep("NEW_PASSWORD");
        setFailedAttempts(0);
        setErrorMessage(null);
      } else {
        if (res.locked) {
          const seconds = res.lockoutRemainingSeconds || LOCKOUT_SECONDS;
          setLockoutRemaining(seconds);
          setFailedAttempts(MAX_FAILED_ATTEMPTS);
          setErrorMessage(
            `Too many failed attempts. Security question verification is locked for ${Math.ceil(
              seconds / 60
            )} minutes. Please wait before trying again.`
          );
        } else {
          const nextAttempts = failedAttempts + 1;
          setFailedAttempts(nextAttempts);
          const remaining = res.attemptsRemaining ?? (MAX_FAILED_ATTEMPTS - nextAttempts);

          if (remaining <= 0) {
            setLockoutRemaining(LOCKOUT_SECONDS);
            setErrorMessage(
              `Too many failed attempts. Security question verification is locked for 5 minutes.`
            );
          } else {
            setErrorMessage(
              res.error ||
                `Incorrect security answer. Please check spelling. (${remaining} attempt${
                  remaining === 1 ? "" : "s"
                } remaining)`
            );
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify security answer. Please try again.");
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
    if (!isPasswordValid || isSubmitting || !resetToken) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await resetPasswordWithSecurityAnswer(email, resetToken, newPassword);
      if (res.success) {
        setStep("SUCCESS");
      } else {
        setErrorMessage(
          res.error || "Failed to update password. Your reset session may have expired."
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while resetting your password.");
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
          {step === "SECURITY_QUESTION" && <ShieldCheck className="w-6 h-6 text-brand-600" />}
          {step === "NEW_PASSWORD" && <Lock className="w-6 h-6" />}
          {step === "SUCCESS" && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {step === "EMAIL" && "Forgot Your Password?"}
          {step === "SECURITY_QUESTION" && "Security Question"}
          {step === "NEW_PASSWORD" && "Create New Password"}
          {step === "SUCCESS" && "Password Reset Successfully!"}
        </h1>

        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {step === "EMAIL" &&
            "Enter your registered email address to verify your identity using your security question."}
          {step === "SECURITY_QUESTION" && (
            <>
              Answer the security question registered for{" "}
              <span className="font-bold text-slate-800">{email}</span>.
            </>
          )}
          {step === "NEW_PASSWORD" &&
            "Your identity has been verified. Please choose a new secure password."}
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
            step === "SECURITY_QUESTION" ? "w-8 bg-brand-600" : "w-2 bg-slate-200"
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

      {/* Lockout Warning Banner */}
      {lockoutRemaining > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Security Lockout Active</span>
            <span>
              Too many incorrect answers. Please wait {Math.floor(lockoutRemaining / 60)}m{" "}
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
              We verify account ownership via your registered security question. Instant recovery with zero email wait times.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || authLoading || !email.trim()}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Retrieving Question...</span>
            ) : (
              <>
                <span>Continue to Security Question</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: SECURITY QUESTION ANSWER FORM */}
      {step === "SECURITY_QUESTION" && (
        <form onSubmit={handleAnswerSubmit} className="space-y-5">
          {/* Question Card */}
          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 space-y-2">
            <div className="flex items-center gap-2 text-brand-700">
              <HelpCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Security Question
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-snug">{question}</p>
          </div>

          {/* Answer Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Your Answer
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                autoFocus
                disabled={lockoutRemaining > 0 || isSubmitting}
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Type your security answer..."
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Answers are case-insensitive (e.g. &ldquo;college&rdquo; matches &ldquo;College&rdquo;).
            </p>
          </div>

          <button
            type="submit"
            disabled={!securityAnswer.trim() || isSubmitting || lockoutRemaining > 0}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Verifying Answer...</span>
            ) : (
              <>
                <span>Verify Answer</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Navigation Controls */}
          <div className="pt-1 flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setErrorMessage(null);
                setSecurityAnswer("");
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Use a different email address
            </button>
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
