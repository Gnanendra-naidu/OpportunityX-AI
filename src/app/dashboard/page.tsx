"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOpportunities } from "@/hooks/useOpportunities";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import { MatchResultCard } from "@/components/matching/MatchResultCard";
import { runOpportunityMatcher } from "@/lib/matching/engine";
import { MatchCategory, MatchResult } from "@/lib/matching/types";
import { useSaved } from "@/context/SavedContext";
import { ApplicationTrackerSection } from "@/components/tracker/ApplicationTrackerSection";
import { Opportunity } from "@/types";
import { getVerifiedOpportunityUrl } from "@/lib/opportunities/urls";
import {
  getDeadlineEvaluation,
  groupOpportunitiesByDeadline,
  DeadlineStatus,
  formatDisplayDate,
} from "@/lib/deadlines/tracker";
import { DeadlineBadge } from "@/components/common/DeadlineBadge";
import { DeadlineVisualIndicator } from "@/components/common/DeadlineVisualIndicator";
import { VerificationStatusBadge } from "@/components/common/VerificationStatusBadge";
import {
  LayoutDashboard,
  User,
  Bookmark,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  GraduationCap,
  LogOut,
  Lock,
  Layers,
  MapPin,
  HeartHandshake,
  Sprout,
  Briefcase,
  AlertCircle,
  AlertTriangle,
  XCircle,
  CalendarClock,
  Archive,
  Calendar,
  Search,
  Filter,
  Check,
  ExternalLink,
  ChevronRight,
  IndianRupee,
  BookOpen,
  Hourglass,
  RotateCcw,
  Edit3,
} from "lucide-react";

type DashboardTab = "overview" | "matches" | "tracker" | "deadlines" | "profile";

export default function DashboardPage() {
  const { user, profile, signOut, loginAsDemoPersona, isLoading: authLoading } = useAuth();
  const { opportunities: allOpportunities, isLoading: oppsLoading } = useOpportunities();
  const { savedIds, savedItems, toggleSave } = useSaved();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Detail Modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Deadlines filter state
  const [activeDeadlineFilter, setActiveDeadlineFilter] = useState<"all" | DeadlineStatus>("all");

  // Matching category filter state (within matches view)
  const [matchCategoryFilter, setMatchCategoryFilter] = useState<"all" | MatchCategory>("likely_match");
  const [matchingSearchQuery, setMatchingSearchQuery] = useState("");
  const [matchingTypeFilter, setMatchingTypeFilter] = useState<"all" | "scholarship" | "scheme">("all");

  // Deterministic matching algorithm based on user's profile fields
  const matchingData = useMemo(() => {
    if (!profile || allOpportunities.length === 0) {
      return {
        likelyMatches: [],
        needsVerification: [],
        doesNotMatch: [],
        allResults: [],
      };
    }
    return runOpportunityMatcher(allOpportunities, profile);
  }, [allOpportunities, profile]);

  // Saved Opportunities list
  const savedOpportunities = useMemo(() => {
    return allOpportunities.filter((opp) => savedIds.includes(opp.id));
  }, [allOpportunities, savedIds]);

  // Sovereign circular deadline breakdown
  const deadlineBreakdown = useMemo(() => {
    return groupOpportunitiesByDeadline(allOpportunities);
  }, [allOpportunities]);

  // Filtered matched opportunities by active deadline filter (for overview)
  const deadlineFilteredMatches = useMemo(() => {
    if (activeDeadlineFilter === "all") return matchingData.likelyMatches;
    return matchingData.likelyMatches.filter(
      (m) => getDeadlineEvaluation(m.opportunity).status === activeDeadlineFilter
    );
  }, [matchingData.likelyMatches, activeDeadlineFilter]);

  // Filtered matched results for the dedicated Matches tab
  const displayedMatchingResults = useMemo(() => {
    let list: MatchResult[] = matchingData.allResults;
    if (matchCategoryFilter === "likely_match") list = matchingData.likelyMatches;
    else if (matchCategoryFilter === "needs_verification") list = matchingData.needsVerification;
    else if (matchCategoryFilter === "does_not_match") list = matchingData.doesNotMatch;

    // Filter by type
    if (matchingTypeFilter === "scholarship") {
      list = list.filter(
        (r) =>
          r.opportunity.type === "scholarship" ||
          r.opportunity.type === "fellowship" ||
          r.opportunity.type === "grant"
      );
    } else if (matchingTypeFilter === "scheme") {
      list = list.filter(
        (r) =>
          r.opportunity.type !== "scholarship" &&
          r.opportunity.type !== "fellowship" &&
          r.opportunity.type !== "grant"
      );
    }

    // Filter by search query
    if (matchingSearchQuery.trim()) {
      const q = matchingSearchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.opportunity.title.toLowerCase().includes(q) ||
          r.opportunity.provider.toLowerCase().includes(q) ||
          (r.opportunity.category || "").toLowerCase().includes(q) ||
          (r.summaryReason || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [matchingData, matchCategoryFilter, matchingTypeFilter, matchingSearchQuery]);

  // Opportunities filtered for the Deadlines tab
  const displayedDeadlinesList = useMemo(() => {
    if (activeDeadlineFilter === "all") return allOpportunities;
    return allOpportunities.filter(
      (opp) => getDeadlineEvaluation(opp).status === activeDeadlineFilter
    );
  }, [allOpportunities, activeDeadlineFilter]);

  // Protected route check: If not logged in
  if (!authLoading && !user) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Protected Citizen Area
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Sign In to Access Your Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            The personalized matching dashboard, application tracker, and saved scheme reminders require an active account. You can freely explore the public scholarship finder without signing in.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login?redirect=/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
          >
            Sign In to Account
          </Link>
          <Link
            href="/signup?redirect=/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition-all shadow-2xs"
          >
            Create New Profile
          </Link>
        </div>

        {/* 1-Click Evaluation shortcut */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 mt-6">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Hackathon Quick Preview (1-Click Test Personas):</span>
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => loginAsDemoPersona("student")}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-brand-500 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
            >
              🎓 Pooja Sharma (Student)
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoPersona("farmer")}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
            >
              🌾 Ramesh Patil (Farmer)
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoPersona("entrepreneur")}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-amber-500 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
            >
              💼 Lakshmi Narayanan (Entrepreneur)
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/scholarships"
            className="text-xs text-brand-600 font-bold hover:underline"
          >
            ← Or continue to Public Scholarship Finder without login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24 lg:pb-12 space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. CITIZEN EXECUTIVE PROFILE HEADER & PERSONA BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Unified Citizen Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.name || user?.email}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
              <span>{profile?.email || user?.email}</span>
              <span>•</span>
              <span>Domicile: {profile?.state || "Not specified"}</span>
              <span>•</span>
              <span>Age: {profile?.age || 20} yrs</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/profile"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-xs border border-rose-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 9 Profile Eligibility Badges Strip */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <div className="text-[10px] uppercase font-bold text-slate-400">Education Level</div>
            <div className="font-semibold text-white mt-0.5 truncate">{profile?.educationLevel || "Undergraduate"}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <div className="text-[10px] uppercase font-bold text-slate-400">Stream / Course</div>
            <div className="font-semibold text-white mt-0.5 truncate">{profile?.courseStream || "General"}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <div className="text-[10px] uppercase font-bold text-slate-400">Qualifying Marks</div>
            <div className="font-semibold text-brand-300 mt-0.5 truncate">
              {profile?.academicPercentage ? `${profile.academicPercentage}%` : "Not specified"}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <div className="text-[10px] uppercase font-bold text-slate-400">Social Category</div>
            <div className="font-semibold text-emerald-300 mt-0.5 truncate">{profile?.category || "General"}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Family Income</div>
            <div className="font-semibold text-amber-300 mt-0.5 truncate">{profile?.incomeRange || "Not specified"}</div>
          </div>
        </div>

        {/* Quick Demo Persona Switcher */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Different Citizen Personas:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loginAsDemoPersona("student")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                profile?.category === "OBC" && profile?.educationLevel === "Undergraduate"
                  ? "bg-brand-500 text-white border-brand-400 shadow-xs"
                  : "bg-white/10 text-slate-200 border-white/20 hover:bg-white/20"
              }`}
            >
              🎓 Pooja Sharma (Student • OBC • 78%)
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoPersona("farmer")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                profile?.lifeStage === "farmers"
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                  : "bg-white/10 text-slate-200 border-white/20 hover:bg-white/20"
              }`}
            >
              🌾 Ramesh Patil (Farmer • EWS • MH)
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoPersona("entrepreneur")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                profile?.lifeStage === "entrepreneurs"
                  ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                  : "bg-white/10 text-slate-200 border-white/20 hover:bg-white/20"
              }`}
            >
              💼 Lakshmi Narayanan (Woman Entrepreneur)
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DASHBOARD MAIN NAVIGATION TABS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "overview"
              ? "bg-brand-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("matches")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "matches"
              ? "bg-brand-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Personalized Matches</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold ml-1">
            {matchingData.likelyMatches.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tracker")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "tracker"
              ? "bg-brand-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileCheck className="w-4 h-4 text-brand-500" />
          <span>Application Tracker</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-800 font-extrabold ml-1">
            {savedItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("deadlines")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "deadlines"
              ? "bg-brand-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>Deadlines & Reminders</span>
          {deadlineBreakdown.counts.closingSoon > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold ml-1 animate-pulse">
              {deadlineBreakdown.counts.closingSoon} Soon
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "profile"
              ? "bg-brand-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <User className="w-4 h-4 text-slate-500" />
          <span>Citizen Profile</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TAB CONTENT: OVERVIEW
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Likely Matches */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("matches");
                setMatchCategoryFilter("likely_match");
              }}
              className="bg-white rounded-2xl p-5 border border-emerald-200 hover:border-emerald-400 transition-all shadow-2xs group text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Likely Matches
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                {matchingData.likelyMatches.length}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block group-hover:underline">
                High alignment schemes →
              </span>
            </button>

            {/* Metric 2: Needs Verification */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("matches");
                setMatchCategoryFilter("needs_verification");
              }}
              className="bg-white rounded-2xl p-5 border border-amber-200 hover:border-amber-400 transition-all shadow-2xs group text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Needs Verification
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-700 mt-2">
                {matchingData.needsVerification.length}
              </div>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block group-hover:underline">
                Requires document checks →
              </span>
            </button>

            {/* Metric 3: Application Tracker */}
            <button
              type="button"
              onClick={() => setActiveTab("tracker")}
              className="bg-white rounded-2xl p-5 border border-brand-200 hover:border-brand-400 transition-all shadow-2xs group text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tracked Applications
                </span>
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-brand-700 mt-2">
                {savedItems.length}
              </div>
              <span className="text-[11px] text-brand-600 font-semibold mt-1 inline-block group-hover:underline">
                5-stage progress pipeline →
              </span>
            </button>

            {/* Metric 4: Closing Soon */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("deadlines");
                setActiveDeadlineFilter("closing_soon");
              }}
              className="bg-white rounded-2xl p-5 border border-amber-200 hover:border-amber-400 transition-all shadow-2xs group text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Closing Soon
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-700 mt-2">
                {deadlineBreakdown.counts.closingSoon}
              </div>
              <span className="text-[11px] text-amber-800 font-semibold mt-1 inline-block group-hover:underline">
                Window closes &le; 30 days →
              </span>
            </button>
          </div>

          {/* Urgent Action Alert if any closing soon */}
          {deadlineBreakdown.counts.closingSoon > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Action Needed:</strong> {deadlineBreakdown.counts.closingSoon} opportunities have application windows closing within 30 days. Complete document verification to avoid portal congestion.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("deadlines");
                  setActiveDeadlineFilter("closing_soon");
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
              >
                View Closing Soon Schemes
              </button>
            </div>
          )}

          {/* Top Likely Matches Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  <span>
                    Top Likely Matches for Your Profile ({matchingData.likelyMatches.length})
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deterministic pre-screening based on domicile ({profile?.state}), category ({profile?.category}), and academic marks ({profile?.academicPercentage || 0}%).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("matches");
                  setMatchCategoryFilter("likely_match");
                }}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Evaluated ({matchingData.allResults.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {matchingData.likelyMatches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
                <p>No immediate Likely Matches under current parameters. Some schemes may be under 'Needs Verification'.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("matches");
                    setMatchCategoryFilter("needs_verification");
                  }}
                  className="font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  Check Needs Verification Schemes →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchingData.likelyMatches.slice(0, 4).map((result) => (
                  <MatchResultCard
                    key={result.opportunity.id}
                    result={result}
                    isSaved={savedIds.includes(result.opportunity.id)}
                    onToggleSave={toggleSave}
                    onOpenDetails={() => setSelectedOpportunity(result.opportunity)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Interactive Application Tracker Section */}
          <section className="pt-2">
            <ApplicationTrackerSection
              onOpenDetails={(opp) => setSelectedOpportunity(opp)}
            />
          </section>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. TAB CONTENT: PERSONALIZED MATCHES (FULL EXPLORER)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "matches" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  <span>Personalized Scholarship & Scheme Matching</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluated rule-by-rule against your profile ({profile?.state}, {profile?.category}, {profile?.educationLevel}, {profile?.academicPercentage || 0}% marks).
                </p>
              </div>

              {/* Type pills: All, Scholarships, Schemes */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMatchingTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    matchingTypeFilter === "all" ? "bg-white text-brand-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Types
                </button>
                <button
                  type="button"
                  onClick={() => setMatchingTypeFilter("scholarship")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    matchingTypeFilter === "scholarship" ? "bg-white text-brand-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Scholarships
                </button>
                <button
                  type="button"
                  onClick={() => setMatchingTypeFilter("scheme")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    matchingTypeFilter === "scheme" ? "bg-white text-brand-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Govt Schemes
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMatchCategoryFilter("likely_match")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  matchCategoryFilter === "likely_match"
                    ? "bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/30"
                    : "bg-slate-50 border-slate-200 hover:bg-emerald-50/40"
                }`}
              >
                <div className="text-[11px] font-bold uppercase text-emerald-800 flex items-center justify-between">
                  <span>Likely Match</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-black text-emerald-700 mt-1">
                  {matchingData.likelyMatches.length}
                </div>
                <div className="text-[10px] text-emerald-800/80">Pre-screened criteria passed</div>
              </button>

              <button
                type="button"
                onClick={() => setMatchCategoryFilter("needs_verification")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  matchCategoryFilter === "needs_verification"
                    ? "bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/30"
                    : "bg-slate-50 border-slate-200 hover:bg-amber-50/40"
                }`}
              >
                <div className="text-[11px] font-bold uppercase text-amber-800 flex items-center justify-between">
                  <span>Needs Verification</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-xl font-black text-amber-700 mt-1">
                  {matchingData.needsVerification.length}
                </div>
                <div className="text-[10px] text-amber-800/80">Needs document or quota check</div>
              </button>

              <button
                type="button"
                onClick={() => setMatchCategoryFilter("does_not_match")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  matchCategoryFilter === "does_not_match"
                    ? "bg-slate-200 border-slate-400 ring-2 ring-slate-400/30"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="text-[11px] font-bold uppercase text-slate-700 flex items-center justify-between">
                  <span>Excluded Schemes</span>
                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="text-xl font-black text-slate-800 mt-1">
                  {matchingData.doesNotMatch.length}
                </div>
                <div className="text-[10px] text-slate-500">Criteria mismatch identified</div>
              </button>

              <button
                type="button"
                onClick={() => setMatchCategoryFilter("all")}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  matchCategoryFilter === "all"
                    ? "bg-brand-50 border-brand-400 ring-2 ring-brand-400/30"
                    : "bg-slate-50 border-slate-200 hover:bg-brand-50/40"
                }`}
              >
                <div className="text-[11px] font-bold uppercase text-brand-800 flex items-center justify-between">
                  <span>All Evaluated</span>
                  <Layers className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <div className="text-xl font-black text-brand-700 mt-1">
                  {matchingData.allResults.length}
                </div>
                <div className="text-[10px] text-brand-800/80">Total database schemes</div>
              </button>
            </div>

            {/* Keyword Search Input */}
            <div className="relative pt-2">
              <Search className="w-4 h-4 absolute left-3.5 top-5 text-slate-400" />
              <input
                type="text"
                value={matchingSearchQuery}
                onChange={(e) => setMatchingSearchQuery(e.target.value)}
                placeholder="Search matching results by scheme name, provider, or criteria keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Results List */}
          {displayedMatchingResults.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs space-y-2">
              <p>No schemes found matching the selected filters and search query.</p>
              <button
                type="button"
                onClick={() => {
                  setMatchCategoryFilter("all");
                  setMatchingSearchQuery("");
                  setMatchingTypeFilter("all");
                }}
                className="font-bold text-brand-600 hover:underline cursor-pointer"
              >
                Reset Matching Filters →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedMatchingResults.map((result) => (
                <MatchResultCard
                  key={result.opportunity.id}
                  result={result}
                  isSaved={savedIds.includes(result.opportunity.id)}
                  onToggleSave={toggleSave}
                  onOpenDetails={() => setSelectedOpportunity(result.opportunity)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB CONTENT: APPLICATION TRACKER & SAVED SCHEMES
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "tracker" && (
        <div className="space-y-6">
          <ApplicationTrackerSection
            onOpenDetails={(opp) => setSelectedOpportunity(opp)}
          />

          {/* Quick link to Saved page */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-brand-600" />
                <span>Document Readiness Checklist & Bulk Export</span>
              </h4>
              <p className="text-xs text-slate-500">
                Manage your physical Aadhaar DBT linkage, income certificates, and bonafide college attestations.
              </p>
            </div>
            <Link
              href="/saved"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <span>Open Document Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. TAB CONTENT: DEADLINES & REMINDERS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "deadlines" && (
        <div className="space-y-6">
          {/* National Opportunity Deadline Radar */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-1 border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  <span>National Opportunity Deadline Radar</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Application Timelines & Status Breakdown
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live tracking calculated directly from actual sovereign circular dates and portal intake schedules.
                </p>
              </div>

              {activeDeadlineFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setActiveDeadlineFilter("all")}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline self-start sm:self-auto cursor-pointer"
                >
                  Reset Filter (Show All Schemes)
                </button>
              )}
            </div>

            {/* 4 Interactive Deadline State Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Closing Soon */}
              <button
                type="button"
                onClick={() =>
                  setActiveDeadlineFilter(
                    activeDeadlineFilter === "closing_soon" ? "all" : "closing_soon"
                  )
                }
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  activeDeadlineFilter === "closing_soon"
                    ? "bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/40 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Closing Soon
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-700 mt-2">
                  {deadlineBreakdown.counts.closingSoon}
                </div>
                <div className="text-[11px] text-amber-800/80 font-medium mt-0.5">
                  Target &le; 30 days left
                </div>
                {activeDeadlineFilter === "closing_soon" && (
                  <span className="absolute bottom-1 right-2 text-[10px] font-bold text-amber-700">
                    ● Active Filter
                  </span>
                )}
              </button>

              {/* Card 2: Upcoming */}
              <button
                type="button"
                onClick={() =>
                  setActiveDeadlineFilter(
                    activeDeadlineFilter === "upcoming" ? "all" : "upcoming"
                  )
                }
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  activeDeadlineFilter === "upcoming"
                    ? "bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-400/40 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                    Upcoming
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <CalendarClock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-indigo-700 mt-2">
                  {deadlineBreakdown.counts.upcoming}
                </div>
                <div className="text-[11px] text-indigo-800/80 font-medium mt-0.5">
                  Opening in future cycles
                </div>
                {activeDeadlineFilter === "upcoming" && (
                  <span className="absolute bottom-1 right-2 text-[10px] font-bold text-indigo-700">
                    ● Active Filter
                  </span>
                )}
              </button>

              {/* Card 3: Open */}
              <button
                type="button"
                onClick={() =>
                  setActiveDeadlineFilter(
                    activeDeadlineFilter === "open" ? "all" : "open"
                  )
                }
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  activeDeadlineFilter === "open"
                    ? "bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Open
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2">
                  {deadlineBreakdown.counts.open}
                </div>
                <div className="text-[11px] text-emerald-800/80 font-medium mt-0.5">
                  Active &amp; Year-round
                </div>
                {activeDeadlineFilter === "open" && (
                  <span className="absolute bottom-1 right-2 text-[10px] font-bold text-emerald-700">
                    ● Active Filter
                  </span>
                )}
              </button>

              {/* Card 4: Deadline Passed */}
              <button
                type="button"
                onClick={() =>
                  setActiveDeadlineFilter(
                    activeDeadlineFilter === "deadline_passed" ? "all" : "deadline_passed"
                  )
                }
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  activeDeadlineFilter === "deadline_passed"
                    ? "bg-slate-200 border-slate-400 ring-2 ring-slate-400/40 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Deadline Passed
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                    <Archive className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-700 mt-2">
                  {deadlineBreakdown.counts.deadlinePassed}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Cycle closed / Archived
                </div>
                {activeDeadlineFilter === "deadline_passed" && (
                  <span className="absolute bottom-1 right-2 text-[10px] font-bold text-slate-700">
                    ● Active Filter
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* Deadlines List */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>
                Schemes Matching Filter: {activeDeadlineFilter === "all" ? "All Timelines" : activeDeadlineFilter.replace("_", " ").toUpperCase()} ({displayedDeadlinesList.length})
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedDeadlinesList.map((opp) => {
                const evalResult = getDeadlineEvaluation(opp);
                const isSaved = savedIds.includes(opp.id);

                return (
                  <div
                    key={opp.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded uppercase">
                          {opp.type}
                        </span>
                        <DeadlineBadge opportunity={opp} variant="badge" />
                      </div>

                      <h4
                        onClick={() => setSelectedOpportunity(opp)}
                        className="text-sm font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-brand-600 transition-colors"
                        title="Click to view scheme details"
                      >
                        {opp.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {opp.provider} • {opp.state}
                      </p>

                      <div className="pt-1">
                        <DeadlineVisualIndicator opportunity={opp} showProgressBar={true} variant="mini" />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOpportunity(opp)}
                        className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Scheme Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSave(opp.id)}
                          className={`p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-colors ${
                            isSaved
                              ? "bg-brand-50 text-brand-700 border-brand-200"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                          title={isSaved ? "Saved in Application Tracker" : "Save to Application Tracker"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-brand-600 text-brand-600" : ""}`} />
                        </button>
                        {(() => {
                          const verifiedUrl = getVerifiedOpportunityUrl(opp);
                          if (!verifiedUrl.isAvailable) return null;
                          return (
                            <a
                              href={verifiedUrl.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition-colors"
                              title={`Official Portal (${verifiedUrl.domain})`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. TAB CONTENT: CITIZEN PROFILE DETAILS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-600" />
                  <span>Citizen Eligibility Profile Record</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  These verified attributes are strictly matched against sovereign database rules with zero hallucinations.
                </p>
              </div>
              <Link
                href="/profile"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Full Profile</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Full Name</span>
                <div className="text-sm font-bold text-slate-900">{profile?.name || "Not provided"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Email Address</span>
                <div className="text-sm font-bold text-slate-900">{profile?.email || user?.email}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Age</span>
                <div className="text-sm font-bold text-slate-900">{profile?.age || 20} years old</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Domicile State</span>
                <div className="text-sm font-bold text-slate-900">{profile?.state || "All India"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Education Level</span>
                <div className="text-sm font-bold text-slate-900">{profile?.educationLevel || "Undergraduate"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Course / Stream</span>
                <div className="text-sm font-bold text-slate-900">{profile?.courseStream || "General"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Qualifying Exam Marks</span>
                <div className="text-sm font-bold text-brand-700">
                  {profile?.academicPercentage ? `${profile.academicPercentage}%` : "Not specified"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Social Category (Quota)</span>
                <div className="text-sm font-bold text-emerald-700">{profile?.category || "General"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Annual Family Income</span>
                <div className="text-sm font-bold text-amber-700">{profile?.incomeRange || "Not specified"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Gender</span>
                <div className="text-sm font-bold text-slate-900 capitalize">{profile?.gender || "Not specified"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Person with Disability (PwD)</span>
                <div className="text-sm font-bold text-slate-900">
                  {profile?.disabilityStatus ? "Yes (PwD Eligible)" : "No"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Religious Minority</span>
                <div className="text-sm font-bold text-slate-900">
                  {profile?.isMinority ? "Yes (Minority Scheme Eligible)" : "No"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        isSaved={selectedOpportunity ? savedIds.includes(selectedOpportunity.id) : false}
        onToggleSave={toggleSave}
      />
    </div>
  );
}
