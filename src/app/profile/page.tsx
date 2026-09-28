"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LIFE_STAGES } from "@/data/lifeStages";
import { STATES_LIST } from "@/data/mockOpportunities";
import { UserProfile, LifeStageKey } from "@/types";
import {
  User,
  GraduationCap,
  Briefcase,
  Save,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Info,
  LogOut,
  Lock,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";

const OPPORTUNITY_TYPES = [
  { id: "scholarship", label: "Scholarships & Fellowships" },
  { id: "scheme", label: "Government Welfare Schemes" },
  { id: "skill_training", label: "Skill Training & Certifications" },
  { id: "grant", label: "Research & Higher Education Grants" },
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, updateProfile, signOut, loginAsDemoPersona, isLoading: authLoading } = useAuth();

  // 9 Required Profile Fields
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

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with active profile
  useEffect(() => {
    if (profile) {
      setName(profile.name || profile.fullName || "");
      setAge(profile.age || 20);
      setState(profile.state || "Karnataka");
      setEducationLevel(profile.educationLevel || EDUCATION_LEVELS[4]);
      setLifeStage(profile.lifeStage || "college_students");
      setIncomeRange(profile.incomeRange || INCOME_RANGES[1]);
      setCategory((profile.category || profile.casteCategory || "General") as any);
      setDisabilityStatus(profile.disabilityStatus ?? profile.isDisabled ?? false);
      setPreferredOpportunityTypes(
        profile.preferredOpportunityTypes?.length
          ? profile.preferredOpportunityTypes
          : ["scholarship", "scheme"]
      );
    }
  }, [profile]);

  // Protected route check
  if (!authLoading && !user) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Protected Area
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Sign In to Manage Your Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Your socioeconomic parameters are saved securely to your account. Sign in to edit your profile or test with a sample persona.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login?redirect=/profile"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-xs"
          >
            Sign In to Account
          </Link>
          <Link
            href="/signup?redirect=/profile"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs"
          >
            Create New Profile
          </Link>
        </div>
      </div>
    );
  }

  const toggleOpportunityType = (typeId: string) => {
    setPreferredOpportunityTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await updateProfile({
      name,
      fullName: name,
      age: Number(age) || 20,
      state,
      educationLevel,
      lifeStage,
      incomeRange,
      category,
      casteCategory: category,
      disabilityStatus,
      isDisabled: disabilityStatus,
      preferredOpportunityTypes,
    });

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200">
            <User className="w-3.5 h-3.5" />
            <span>Profile & Matching Parameters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Citizen Socioeconomic Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            These 9 parameters configure your personalized algorithm for scholarships, welfare grants, and state-level benefits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Switch Demo Persona Bar for Evaluators */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <div>
            <p className="text-xs font-bold text-slate-800">1-Click Test Personas (Hackathon Evaluation):</p>
            <p className="text-[11px] text-slate-500">Quickly toggle between different demographic citizen profiles</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loginAsDemoPersona("student")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-brand-500 text-slate-800 cursor-pointer shadow-2xs"
          >
            🎓 Student (Pooja)
          </button>
          <button
            type="button"
            onClick={() => loginAsDemoPersona("farmer")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 cursor-pointer shadow-2xs"
          >
            🌾 Farmer (Ramesh)
          </button>
          <button
            type="button"
            onClick={() => loginAsDemoPersona("entrepreneur")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-amber-500 text-slate-800 cursor-pointer shadow-2xs"
          >
            💼 Entrepreneur (Lakshmi)
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Profile saved successfully! Your personalized matching recommendations have been updated.</span>
        </div>
      )}

      {/* Zero Sensitive Data Storage Notice */}
      <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <span className="text-[11px] leading-relaxed">
          <strong>Privacy Preserving Architecture:</strong> OpportunityX-AI strictly adheres to minimal data storage principles. We do not store sensitive identification numbers, bank passwords, or financial credentials.
        </span>
      </div>

      {/* Main Profile Form with the 9 Fields */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* 1. Name */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          {/* 2. Age */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Age (Years) *
            </label>
            <input
              type="number"
              min={1}
              max={110}
              required
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          {/* 3. State */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              State of Residence (Domicile) *
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              {STATES_LIST.filter((s) => s.name !== "All India (Central)").map((st) => (
                <option key={st.name} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Education Level */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Education Level *
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              {EDUCATION_LEVELS.map((ed) => (
                <option key={ed} value={ed}>
                  {ed}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Life Stage */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Life Stage *
            </label>
            <select
              value={lifeStage}
              onChange={(e) => setLifeStage(e.target.value as LifeStageKey)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              {LIFE_STAGES.map((ls) => (
                <option key={ls.key} value={ls.key}>
                  {ls.title} ({ls.ageRange})
                </option>
              ))}
            </select>
          </div>

          {/* 6. Income Range */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Annual Family Income Range *
            </label>
            <select
              value={incomeRange}
              onChange={(e) => setIncomeRange(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              {INCOME_RANGES.map((inc) => (
                <option key={inc} value={inc}>
                  {inc}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Category */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Social Category (Reservation / Quota) *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="General">General / Open Category</option>
              <option value="OBC">Other Backward Class (OBC)</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="EWS">Economically Weaker Section (EWS)</option>
            </select>
          </div>

          {/* 8. Disability Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <label className="font-bold text-slate-800 block text-xs">
                Person with Disabilities (PwD)
              </label>
              <span className="text-[11px] text-slate-500">
                Qualifies for Divyangjan assistance & assistive grants.
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

        {/* 9. Preferred Opportunity Types */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-700 text-xs mb-2 uppercase tracking-wider">
            Preferred Opportunity Types
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

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            ← View Matching Schemes on Dashboard
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Profile..." : "Save Profile & Update Matches"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
