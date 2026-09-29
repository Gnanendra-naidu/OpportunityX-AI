"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LIFE_STAGES } from "@/data/lifeStages";
import { STATES_LIST, DEFAULT_USER_PROFILE } from "@/data/mockOpportunities";
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
  Award,
  BookOpen,
  DollarSign,
  HeartHandshake,
  Check,
  HelpCircle,
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

const COURSE_STREAMS = [
  "Computer Science & Engineering / IT",
  "Electronics & Communication Engineering",
  "Mechanical / Civil / Electrical Engineering",
  "Medicine / MBBS / BDS / Healthcare",
  "Pharmacy / Nursing / Allied Health Sciences",
  "Pure Sciences (Physics, Chemistry, Math, Biology / B.Sc)",
  "Commerce / Accounts / B.Com / BBA",
  "Arts / Humanities / Social Sciences / BA",
  "Law / Legal Studies (LL.B)",
  "Agriculture / Horticulture / Veterinary",
  "Education / B.Ed / Teaching",
  "Vocational / ITI Trades / Polytechnic",
  "Management / MBA / Post-Graduate",
  "General / Other Academic Streams",
];

const SECURITY_QUESTIONS = [
  "What is your favorite school/college?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What city were you born in?",
];

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    profile,
    updateProfile,
    signOut,
    loginAsDemoPersona,
    isLoading: authLoading,
  } = useAuth();

  // Basic Information
  const [name, setName] = useState(DEFAULT_USER_PROFILE.name);
  const [email, setEmail] = useState(DEFAULT_USER_PROFILE.email);
  const [phone, setPhone] = useState(DEFAULT_USER_PROFILE.phone || "");
  const [age, setAge] = useState<number>(DEFAULT_USER_PROFILE.age);
  const [gender, setGender] = useState<"male" | "female" | "transgender" | "other">(
    DEFAULT_USER_PROFILE.gender || "female"
  );

  // Domicile Location
  const [state, setState] = useState(DEFAULT_USER_PROFILE.state);
  const [district, setDistrict] = useState(DEFAULT_USER_PROFILE.district || "Bengaluru Urban");

  // Scholarship & Academic Criteria
  const [educationLevel, setEducationLevel] = useState(EDUCATION_LEVELS[4]);
  const [courseStream, setCourseStream] = useState(
    DEFAULT_USER_PROFILE.courseStream || COURSE_STREAMS[0]
  );
  const [academicPercentage, setAcademicPercentage] = useState<number | "">(
    DEFAULT_USER_PROFILE.academicPercentage || 78.5
  );
  const [lifeStage, setLifeStage] = useState<LifeStageKey>("college_students");

  // Socioeconomic & Reservation
  const [incomeRange, setIncomeRange] = useState(INCOME_RANGES[1]);
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState<number | "">(
    DEFAULT_USER_PROFILE.annualFamilyIncome || 240000
  );
  const [category, setCategory] = useState<"General" | "OBC" | "SC" | "ST" | "EWS">("OBC");
  const [disabilityStatus, setDisabilityStatus] = useState<boolean>(false);
  const [isMinority, setIsMinority] = useState<boolean>(false);

  // Preferences
  const [preferredOpportunityTypes, setPreferredOpportunityTypes] = useState<string[]>([
    "scholarship",
    "scheme",
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Security Question Settings
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const handleUpdateSecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer.trim()) {
      setSecurityError("Please enter your security answer.");
      return;
    }
    const targetEmail = email || user?.email;
    if (!targetEmail) {
      setSecurityError("Email address is required.");
      return;
    }
    setSecuritySaving(true);
    setSecurityError(null);
    setSecuritySuccess(false);
    try {
      const res = await fetch("/api/auth/set-security-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          question: securityQuestion,
          answer: securityAnswer.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSecuritySuccess(true);
        setSecurityAnswer("");
        setTimeout(() => setSecuritySuccess(false), 3000);
      } else {
        setSecurityError(data.error || "Failed to update security question.");
      }
    } catch (err: any) {
      setSecurityError(err.message || "Failed to update security question.");
    } finally {
      setSecuritySaving(false);
    }
  };

  // Sync state with active profile
  useEffect(() => {
    if (profile) {
      setName(profile.name || profile.fullName || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setAge(profile.age || 20);
      if (profile.gender) setGender(profile.gender);
      setState(profile.state || "Karnataka");
      setDistrict(profile.district || "");
      setEducationLevel(profile.educationLevel || EDUCATION_LEVELS[4]);
      if (profile.courseStream) setCourseStream(profile.courseStream);
      if (profile.academicPercentage !== undefined) {
        setAcademicPercentage(profile.academicPercentage);
      }
      setLifeStage(profile.lifeStage || "college_students");
      setIncomeRange(profile.incomeRange || INCOME_RANGES[1]);
      if (profile.annualFamilyIncome !== undefined) {
        setAnnualFamilyIncome(profile.annualFamilyIncome);
      }
      setCategory((profile.category || profile.casteCategory || "General") as any);
      setDisabilityStatus(profile.disabilityStatus ?? profile.isDisabled ?? false);
      setIsMinority(profile.isMinority ?? false);
      setPreferredOpportunityTypes(
        profile.preferredOpportunityTypes?.length
          ? profile.preferredOpportunityTypes
          : ["scholarship", "scheme"]
      );
    }
  }, [profile]);

  const toggleOpportunityType = (typeId: string) => {
    setPreferredOpportunityTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const result = await updateProfile({
      name: name.trim() || "OpportunityX User",
      fullName: name.trim() || "OpportunityX User",
      email: email.trim() || user?.email || "citizen@opportunityx.in",
      phone: phone.trim(),
      age: Number(age) || 20,
      gender,
      state,
      district: district.trim(),
      educationLevel,
      courseStream,
      academicPercentage: academicPercentage !== "" ? Number(academicPercentage) : undefined,
      lifeStage,
      incomeRange,
      annualFamilyIncome: annualFamilyIncome !== "" ? Number(annualFamilyIncome) : undefined,
      category,
      casteCategory: category,
      disabilityStatus,
      isDisabled: disabilityStatus,
      isMinority,
      preferredOpportunityTypes,
    });

    setIsSaving(false);
    if (result?.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200">
            <User className="w-3.5 h-3.5" />
            <span>Profile & Eligibility Parameters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Citizen Socioeconomic Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Configure your scholarship eligibility criteria, academic marks, field of study, and demographic parameters for instant matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/matching"
            className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Matches</span>
          </Link>
          {user && (
            <button
              type="button"
              onClick={signOut}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Switch Demo Persona Bar for Fast Evaluation */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-800">1-Click Test Personas (Instant Load & Match):</p>
            <p className="text-[11px] text-slate-500">Quickly test different scholarship profiles (Engineering student, farmer, entrepreneur)</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loginAsDemoPersona("student")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-brand-500 text-slate-800 cursor-pointer shadow-2xs transition-all hover:bg-brand-50"
          >
            🎓 Student (Pooja - B.Tech)
          </button>
          <button
            type="button"
            onClick={() => loginAsDemoPersona("farmer")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 cursor-pointer shadow-2xs transition-all hover:bg-emerald-50"
          >
            🌾 Farmer (Ramesh)
          </button>
          <button
            type="button"
            onClick={() => loginAsDemoPersona("entrepreneur")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-amber-500 text-slate-800 cursor-pointer shadow-2xs transition-all hover:bg-amber-50"
          >
            💼 Entrepreneur (Lakshmi)
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div
          id="profile-save-success"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 font-semibold animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-emerald-800">Profile saved successfully!</p>
            <p className="text-[11px] text-emerald-700 font-normal">
              Your eligibility parameters and matching recommendations have been updated.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <span className="text-[11px] leading-relaxed">
          <strong>Privacy Preserving Architecture:</strong> OpportunityX-AI strictly adheres to minimal data storage principles. We do not store sensitive identification numbers, bank passwords, or financial credentials.
        </span>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
        
        {/* SECTION 1: Basic Citizen Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              1. Basic Citizen Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                id="profile-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pooja Sharma"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="profile-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@opportunityx.in"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <input
                id="profile-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Age (Years) *
              </label>
              <input
                id="profile-age-input"
                type="number"
                min={1}
                max={110}
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender *
              </label>
              <select
                id="profile-gender-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="female">Female (Qualifies for Girl Child & Women Quotas)</option>
                <option value="male">Male</option>
                <option value="transgender">Transgender (Special Quotas)</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Location & Domicile */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. Domicile Location & District
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* State */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                State of Residence (Domicile) *
              </label>
              <select
                id="profile-state-select"
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
              <span className="text-[11px] text-slate-500 mt-1 block">
                Required for state-specific government welfare & merit scholarships.
              </span>
            </div>

            {/* District */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                District / City
              </label>
              <input
                id="profile-district-input"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Bengaluru Urban, Madurai, Kolhapur"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Used for district-level minority and tribal development schemes.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Scholarship & Academic Criteria */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <GraduationCap className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              3. Scholarship & Academic Eligibility
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Education Level */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Education Level *
              </label>
              <select
                id="profile-education-select"
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

            {/* Course / Field of Study */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Course / Field of Study *
              </label>
              <select
                id="profile-course-select"
                value={courseStream}
                onChange={(e) => setCourseStream(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                {COURSE_STREAMS.map((cs) => (
                  <option key={cs} value={cs}>
                    {cs}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Crucial for technical (AICTE), medical, research, and vocational grants.
              </span>
            </div>

            {/* Academic Percentage */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Marks / Percentage (% or CGPA Equivalent)
              </label>
              <div className="relative">
                <input
                  id="profile-marks-input"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  value={academicPercentage}
                  onChange={(e) =>
                    setAcademicPercentage(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g. 78.50"
                  className="w-full p-2.5 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 font-bold text-xs">%</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Many merit scholarships require ≥50%, ≥60%, or ≥75% in qualifying exam.
              </span>
            </div>

            {/* Life Stage */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Life Stage *
              </label>
              <select
                id="profile-lifestage-select"
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
          </div>
        </div>

        {/* SECTION 4: Socioeconomic & Reservation Category */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Award className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              4. Socioeconomic Category & Income
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Social Category */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Social Category (Reservation / Quota) *
              </label>
              <select
                id="profile-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="General">General / Open Merit (No Quota)</option>
                <option value="OBC">Other Backward Class (OBC / Non-Creamy Layer)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
              </select>
            </div>

            {/* Income Range */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Annual Family Income Bracket *
              </label>
              <select
                id="profile-income-range-select"
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

            {/* Exact Family Income */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exact Annual Family Income (₹ / Year)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  id="profile-exact-income-input"
                  type="number"
                  min={0}
                  step={5000}
                  value={annualFamilyIncome}
                  onChange={(e) =>
                    setAnnualFamilyIncome(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g. 240000"
                  className="w-full p-2.5 pl-7 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Used to evaluate exact statutory income ceilings (e.g. ₹2.5L, ₹4.5L, or ₹8.0L/yr).
              </span>
            </div>

            {/* Special Categories: PwD & Minority */}
            <div className="space-y-3">
              {/* PwD */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <label htmlFor="pwd-checkbox" className="font-bold text-slate-800 block text-xs cursor-pointer">
                    Person with Disabilities (PwD)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Qualifies for Divyangjan assistance & assistive grants.
                  </span>
                </div>
                <input
                  id="pwd-checkbox"
                  type="checkbox"
                  checked={disabilityStatus}
                  onChange={(e) => setDisabilityStatus(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                />
              </div>

              {/* Minority */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <label htmlFor="minority-checkbox" className="font-bold text-slate-800 block text-xs cursor-pointer">
                    Religious / Linguistic Minority Community
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Qualifies for MoMA minority scholarship schemes.
                  </span>
                </div>
                <input
                  id="minority-checkbox"
                  type="checkbox"
                  checked={isMinority}
                  onChange={(e) => setIsMinority(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Preferred Opportunity Types */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-700 text-xs mb-2 uppercase tracking-wider">
            5. Preferred Opportunity Types
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
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit & Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <Link
            href="/matching"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Check AI Matcher with these Parameters →</span>
          </Link>

          <button
            id="profile-save-btn"
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Profile..." : "Save Profile & Update Matches"}</span>
          </button>
        </div>
      </form>

      {/* SECTION 6: Account Security & Recovery Question */}
      <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Password Recovery Security Question
            </h2>
            <p className="text-xs text-slate-500">
              Configure your secret question and answer for instant, zero-delay password recovery.
            </p>
          </div>
        </div>

        {securitySuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Security question and answer updated successfully!</span>
          </div>
        )}

        {securityError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{securityError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateSecurityQuestion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Security Question
              </label>
              <select
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Security Answer
              </label>
              <div className="relative">
                <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Enter your security answer..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-400">
              Answers are securely hashed with a salt. We never store answers in plaintext.
            </p>
            <button
              type="submit"
              disabled={securitySaving || !securityAnswer.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>{securitySaving ? "Saving..." : "Update Security Question"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
