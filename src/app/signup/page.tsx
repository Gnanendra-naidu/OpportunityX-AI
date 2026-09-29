"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LIFE_STAGES } from "@/data/lifeStages";
import { STATES_LIST } from "@/data/mockOpportunities";
import { LifeStageKey } from "@/types";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  MapPin,
  GraduationCap,
  Layers,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Clock,
} from "lucide-react";

const OPPORTUNITY_TYPES = [
  { id: "scholarship", label: "Scholarships & Fellowships" },
  { id: "scheme", label: "Government Welfare Schemes" },
  { id: "skill_training", label: "Skill Training & Certifications" },
  { id: "grant", label: "Research & Higher Grants" },
  { id: "subsidy", label: "Credit Subsidies & Agriculture" },
];

const INCOME_RANGES = [
  "Below ₹1.5 Lakh / year",
  "₹1.5 Lakh - ₹2.5 Lakh / year",
  "₹2.5 Lakh - ₹8.0 Lakh / year",
  "Above ₹8.0 Lakh / year",
];

const EDUCATION_LEVELS = [
  "Class 10 or Below",
  "Class 11 - 12 / Intermediate",
  "ITI / Vocational Certificate",
  "Polytechnic / Diploma",
  "Undergraduate (Degree / B.Tech / B.Sc)",
  "Postgraduate (Master's / M.Tech / MBA)",
  "Doctoral / Ph.D.",
  "Non-Student / Working Professional",
];

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { signUp, resendVerificationEmail, isLoading: authLoading, user } = useAuth();

  // Account credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Profile fields requested by prompt
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(20);
  const [state, setState] = useState("Karnataka");
  const [educationLevel, setEducationLevel] = useState(EDUCATION_LEVELS[4]);
  const [lifeStage, setLifeStage] = useState<LifeStageKey>("college_students");
  const [incomeRange, setIncomeRange] = useState(INCOME_RANGES[1]);
  const [category, setCategory] = useState<"General" | "OBC" | "SC" | "ST" | "EWS">("OBC");
  const [disabilityStatus, setDisabilityStatus] = useState<boolean>(false);
  const [preferredOpportunityTypes, setPreferredOpportunityTypes] = useState<string[]>([
    "scholarship",
    "scheme",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email verification pending state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // Cooldown timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && !isSubmitting && !needsVerification) {
      router.push(redirectPath);
    }
  }, [user, redirectPath, router, isSubmitting, needsVerification]);

  const toggleOpportunityType = (typeId: string) => {
    setPreferredOpportunityTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await signUp(email, password, {
      name,
      age: Number(age) || 20,
      state,
      educationLevel,
      lifeStage,
      incomeRange,
      category,
      disabilityStatus,
      preferredOpportunityTypes,
    });

    if (res.success) {
      if (res.requiresEmailVerification) {
        setNeedsVerification(true);
        setCooldown(60);
        setIsSubmitting(false);
      } else {
        router.push(redirectPath);
      }
    } else {
      setErrorMessage(res.error || "Failed to create account. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;

    setIsResending(true);
    setResendNotice(null);
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        setResendNotice("Verification email resent! Please check your inbox and spam folder.");
        setCooldown(60);
      } else {
        setResendNotice(res.error || "Failed to resend verification email.");
      }
    } finally {
      setIsResending(false);
    }
  };

  // If email verification is pending, display the verification pending screen
  if (needsVerification) {
    return (
      <div className="max-w-md mx-auto my-8 sm:my-14 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-2xs">
          <Mail className="w-7 h-7 text-brand-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Verify Your Email
          </h1>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium leading-relaxed">
            Please check your email and verify your account before continuing.
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            We have sent a verification email to <span className="font-bold text-slate-800">{email}</span>. Click the link inside that email to activate your account.
          </p>
        </div>

        {/* Resend Notice */}
        {resendNotice && (
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{resendNotice}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white text-xs font-semibold text-slate-700 hover:text-brand-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
            {cooldown > 0 ? (
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Resend verification email in {cooldown}s
              </span>
            ) : (
              <span>Resend verification email</span>
            )}
          </button>

          <Link
            href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-left">
          <strong>Tip:</strong> Don't see the email? Check your spam or promotions folder. Security links expire after 24 hours.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-8 sm:my-14 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto shadow-2xs">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Create Citizen Opportunity Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Set up your socioeconomic profile to unlock personalized scheme matching, pre-qualification checks, and deadline reminders.
        </p>
      </div>

      {/* Public Search Notice & Privacy Guarantee */}
      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero Sensitive Data Storage Guarantee</span>
        </div>
        <p className="text-[11px] text-emerald-800 leading-relaxed">
          We strictly do not collect bank accounts, OTPs, or government identity tokens. Profile fields are used exclusively to match public eligibility criteria.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Account Access */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Account Credentials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Socioeconomic Profile Fields (Requested by User Prompt) */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Citizen Eligibility Profile (For Personalized Matching)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Age */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Age (Years) *
              </label>
              <input
                type="number"
                min={1}
                max={110}
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* State */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                State of Residence (Domicile) *
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-brand-500"
              >
                {STATES_LIST.filter((s) => s.name !== "All India (Central)").map((st) => (
                  <option key={st.name} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Life Stage */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Citizen Life Stage *
              </label>
              <select
                value={lifeStage}
                onChange={(e) => setLifeStage(e.target.value as LifeStageKey)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-brand-500"
              >
                {LIFE_STAGES.map((ls) => (
                  <option key={ls.key} value={ls.key}>
                    {ls.title} ({ls.ageRange})
                  </option>
                ))}
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Education Level *
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-brand-500"
              >
                {EDUCATION_LEVELS.map((ed) => (
                  <option key={ed} value={ed}>
                    {ed}
                  </option>
                ))}
              </select>
            </div>

            {/* Income Range */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Annual Family Income Range *
              </label>
              <select
                value={incomeRange}
                onChange={(e) => setIncomeRange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-brand-500"
              >
                {INCOME_RANGES.map((inc) => (
                  <option key={inc} value={inc}>
                    {inc}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Social Category (Reservation / Quota) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-brand-500"
              >
                <option value="General">General / Open Category</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
              </select>
            </div>

            {/* Disability Status */}
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <label className="font-semibold text-slate-800 block text-xs">
                  Person with Disabilities (PwD / Divyangjan)
                </label>
                <span className="text-[11px] text-slate-500">
                  Qualifies for specialized central assistive quotas and scholarships.
                </span>
              </div>
              <input
                type="checkbox"
                checked={disabilityStatus}
                onChange={(e) => setDisabilityStatus(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Preferred Opportunity Types */}
          <div className="pt-2">
            <label className="block font-semibold text-slate-700 text-xs mb-2">
              Preferred Opportunity Types (Select all that interest you)
            </label>
            <div className="flex flex-wrap gap-2">
              {OPPORTUNITY_TYPES.map((type) => {
                const isSelected = preferredOpportunityTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleOpportunityType(type.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-brand-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{type.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || authLoading}
          className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Creating Profile & Account...</span>
          ) : (
            <>
              <span>Create Account & Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2 text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Signup...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
