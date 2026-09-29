"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useOpportunities } from "@/hooks/useOpportunities";
import { runOpportunityMatcher } from "@/lib/matching/engine";
import { MatchCategory, MatchResult } from "@/lib/matching/types";
import { MatchResultCard } from "@/components/matching/MatchResultCard";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import { Opportunity } from "@/types";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  User,
  Filter,
  Layers,
  ArrowRight,
  Info,
  Loader2,
  Database,
  Lock,
  RotateCcw,
  GraduationCap,
  Landmark,
  Search,
  X,
} from "lucide-react";
import { useSaved } from "@/context/SavedContext";

function MatchingContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "scholarship" ? "scholarship" : "all";

  const { user, profile, loginAsDemoPersona, isLoading: authLoading } = useAuth();
  const { opportunities: allOpportunities, isLoading: oppsLoading, dataSource } = useOpportunities();
  const { savedIds, toggleSave } = useSaved();

  // Tab filter: 'likely_match' (default) | 'needs_verification' | 'all' | 'does_not_match'
  const [activeTab, setActiveTab] = useState<"all" | MatchCategory>("likely_match");
  // Opportunity type filter: 'all' | 'scholarship' | 'scheme'
  const [typeFilter, setTypeFilter] = useState<"all" | "scholarship" | "scheme">(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Run deterministic matching engine
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

  // Counts for type pills
  const typeCounts = useMemo(() => {
    const isScholarship = (o: Opportunity) =>
      o.type === "scholarship" || o.type === "fellowship" || o.type === "grant";

    return {
      all: matchingData.likelyMatches.length + matchingData.needsVerification.length,
      scholarship: matchingData.allResults.filter((r) => isScholarship(r.opportunity) && r.category !== "does_not_match").length,
      scheme: matchingData.allResults.filter((r) => !isScholarship(r.opportunity) && r.category !== "does_not_match").length,
      scholarshipLikely: matchingData.likelyMatches.filter((r) => isScholarship(r.opportunity)).length,
    };
  }, [matchingData]);

  // Filter by active tab, type filter, and search query
  const displayedResults = useMemo(() => {
    let list: MatchResult[] = [];
    if (activeTab === "likely_match") {
      list = matchingData.likelyMatches;
    } else if (activeTab === "needs_verification") {
      list = matchingData.needsVerification;
    } else if (activeTab === "does_not_match") {
      list = matchingData.doesNotMatch;
    } else {
      // "all" shows eligible matches (Likely + Verification), keeping clear separation from does_not_match
      list = [...matchingData.likelyMatches, ...matchingData.needsVerification];
    }

    // Filter by type
    if (typeFilter === "scholarship") {
      list = list.filter(
        (r) =>
          r.opportunity.type === "scholarship" ||
          r.opportunity.type === "fellowship" ||
          r.opportunity.type === "grant"
      );
    } else if (typeFilter === "scheme") {
      list = list.filter(
        (r) =>
          r.opportunity.type !== "scholarship" &&
          r.opportunity.type !== "fellowship" &&
          r.opportunity.type !== "grant"
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.opportunity.title.toLowerCase().includes(q) ||
          r.opportunity.provider.toLowerCase().includes(q) ||
          (r.opportunity.category || "").toLowerCase().includes(q) ||
          (r.summaryReason || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [matchingData, activeTab, typeFilter, searchQuery]);

  // Protected route check
  if (!authLoading && !user && !profile) {
    return (
      <div className="max-w-2xl mx-auto my-14 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-900 border border-brand-300">
            Personalized Opportunity Matcher
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Sign In or Select a Test Profile to Run Matching
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            OpportunityX-AI evaluates your state domicile, caste quota, education stream, qualifying marks, and family income against published government guidelines without hallucinations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login?redirect=/matching"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
          >
            Sign In to Match
          </Link>
          <Link
            href="/profile"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition-all shadow-2xs"
          >
            Configure Profile
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
              🎓 Student (Pooja - B.Tech • KA)
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoPersona("farmer")}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
            >
              🌾 Farmer (Ramesh - Maharashtra)
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoPersona("entrepreneur")}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-amber-500 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
            >
              💼 Entrepreneur (Lakshmi - Tamil Nadu)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12 space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & AI TRANSPARENCY NOTICE
          ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold mb-2 border border-brand-200 shadow-2xs">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Deterministic Eligibility Engine • Zero Hallucinations</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Personalized Opportunity & Scholarship Matcher
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          OpportunityX-AI reads your profile parameters and evaluates them against verified scheme criteria retrieved from Supabase PostgreSQL. Opportunities and eligibility requirements are never fabricated.
        </p>
      </div>

      {/* Mandatory Non-Guarantee Caveat Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-black text-amber-900">
            Official Pre-Screening Disclaimer & Transparency Notice
          </h4>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            A <strong>"Likely Match"</strong> status indicates high preliminary alignment between your self-reported profile and statutory guidelines. <strong>It does not guarantee financial grant, college admission, or statutory approval.</strong> Final sanction is strictly subject to institutional review and physical document verification by the respective state or central nodal departments.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ACTIVE PROFILE EVALUATION BAR & PERSONA SWITCHER
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {(profile?.name || "U")[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  {profile?.name}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  Active Profile
                </span>
                {typeCounts.scholarshipLikely > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    🎓 {typeCounts.scholarshipLikely} Scholarships Matched
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Age: <strong>{profile?.age}</strong></span>
                <span>•</span>
                <span>Domicile: <strong>{profile?.state}</strong></span>
                <span>•</span>
                <span>Category: <strong>{profile?.category}</strong></span>
                <span>•</span>
                <span>Education: <strong>{profile?.educationLevel}</strong></span>
                {profile?.courseStream && (
                  <>
                    <span>•</span>
                    <span>Stream: <strong>{profile.courseStream}</strong></span>
                  </>
                )}
                {profile?.academicPercentage !== undefined && (
                  <>
                    <span>•</span>
                    <span>Marks: <strong>{profile.academicPercentage}%</strong></span>
                  </>
                )}
                <span>•</span>
                <span>Income: <strong>{profile?.incomeRange}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-brand-500 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Edit Parameters
            </Link>
          </div>
        </div>

        {/* 1-Click Evaluation Switcher for Hackathon Judges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Test Different Citizen Profiles:</span>
          </span>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loginAsDemoPersona("student")}
              className={`px-3 py-1 rounded-xl font-semibold border transition-all cursor-pointer ${
                profile?.lifeStage === "college_students"
                  ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              🎓 Pooja (Student • KA)
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoPersona("farmer")}
              className={`px-3 py-1 rounded-xl font-semibold border transition-all cursor-pointer ${
                profile?.lifeStage === "farmers"
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              🌾 Ramesh (Farmer • MH)
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoPersona("entrepreneur")}
              className={`px-3 py-1 rounded-xl font-semibold border transition-all cursor-pointer ${
                profile?.lifeStage === "entrepreneurs"
                  ? "bg-amber-700 text-white border-amber-700 shadow-2xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              💼 Lakshmi (Entrepreneur • TN)
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORIZED MATCH TABS & TYPE FILTER
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Benefit Type Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-brand-600" />
              <span>Type:</span>
            </span>
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === "all"
                  ? "bg-brand-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Types ({typeCounts.all})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("scholarship")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === "scholarship"
                  ? "bg-brand-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Scholarships Only ({typeCounts.scholarship})</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("scheme")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === "scheme"
                  ? "bg-brand-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Govt Schemes ({typeCounts.scheme})</span>
            </button>
          </div>

          {/* Quick search input */}
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matched results..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs: All, Likely Match, Needs Verification, Does Not Match */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Results</span>
          </button>

          {/* 1. Likely Match */}
          <button
            type="button"
            onClick={() => setActiveTab("likely_match")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeTab === "likely_match"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Likely Match ({matchingData.likelyMatches.length})</span>
          </button>

          {/* 2. Needs Verification */}
          <button
            type="button"
            onClick={() => setActiveTab("needs_verification")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeTab === "needs_verification"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Needs Verification ({matchingData.needsVerification.length})</span>
          </button>

          {/* 3. Does Not Appear to Match */}
          <button
            type="button"
            onClick={() => setActiveTab("does_not_match")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeTab === "does_not_match"
                ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Does Not Appear to Match ({matchingData.doesNotMatch.length})</span>
          </button>
        </div>

        {/* Status Tag */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{displayedResults.length}</strong> matched opportunities
            {typeFilter === "scholarship" && " (Scholarships Only)"}
            {typeFilter === "scheme" && " (Govt Schemes Only)"}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
            <Database className="w-3 h-3 text-brand-600" />
            <span>Source: {dataSource === "supabase" ? "Supabase PostgreSQL Live" : "Verified Opportunity Catalog"}</span>
          </span>
        </div>

        {/* Results Grid */}
        {displayedResults.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No opportunities currently match this filter
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select another evaluation filter tab above or modify your profile parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedResults.map((result) => (
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

      {/* ─────────────────────────────────────────────────────────────
          4. COMPREHENSIVE OPPORTUNITY DETAIL MODAL
          ───────────────────────────────────────────────────────────── */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        isSaved={selectedOpportunity ? savedIds.includes(selectedOpportunity.id) : false}
        onToggleSave={toggleSave}
      />
    </div>
  );
}

export default function MatchingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading Personalized Matching Engine...</p>
        </div>
      }
    >
      <MatchingContent />
    </Suspense>
  );
}
