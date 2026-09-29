"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_OPPORTUNITIES, STATES_LIST, DEMO_DATA_NOTICE } from "@/data/mockOpportunities";
import { Opportunity, LifeStageKey } from "@/types";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import { VerificationStatusBadge } from "@/components/common/VerificationStatusBadge";
import { LIFE_STAGES } from "@/data/lifeStages";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useSaved } from "@/context/SavedContext";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { runScholarshipMatcher } from "@/lib/matching/engine";
import { MatchResultCard } from "@/components/matching/MatchResultCard";
import { MatchCategory, MatchResult } from "@/lib/matching/types";
import {
  GraduationCap,
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  X,
  ChevronDown,
  ArrowUpDown,
  ShieldCheck,
  Clock,
  IndianRupee,
  Layers,
  Sparkles,
  BookOpen,
  Database,
  Loader2,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";
import { OpportunityCardSkeleton } from "@/components/common/OpportunityCardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface ScholarshipFilterState {
  keyword: string;
  state: string;
  lifeStage: string;
  educationLevel: string;
  opportunityType: string;
  category: string;
  incomeRange: string;
  ageRange: string;
  deadline: string;
  verificationStatus: string;
}

const INITIAL_FILTERS: ScholarshipFilterState = {
  keyword: "",
  state: "",
  lifeStage: "",
  educationLevel: "",
  opportunityType: "",
  category: "",
  incomeRange: "",
  ageRange: "",
  deadline: "",
  verificationStatus: "",
};

function ScholarshipFinderContent() {
  const searchParams = useSearchParams();

  // Filter state
  const [filters, setFilters] = useState<ScholarshipFilterState>({
    ...INITIAL_FILTERS,
    keyword: searchParams.get("q") || "",
    state: searchParams.get("state") || "",
    lifeStage: searchParams.get("stage") || "",
  });

  // UI State
  const [sortBy, setSortBy] = useState<
    "relevant" | "amount_desc" | "deadline_asc" | "verified_recent"
  >("relevant");
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const { savedIds, toggleSave } = useSaved();

  // Personalized Matching State
  const { user, profile, loginAsDemoPersona } = useAuth();
  const [isMatchingMode, setIsMatchingMode] = useState<boolean>(
    searchParams.get("matched") === "true"
  );
  const [matchedTab, setMatchedTab] = useState<"all" | MatchCategory>("likely_match");

  const updateFilter = (key: keyof ScholarshipFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setVisibleCount(6); // reset pagination when filter changes
  };

  const resetAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    setVisibleCount(6);
  };

  // Supabase dynamic opportunity loader
  const {
    opportunities: allOpportunities,
    isLoading,
    dataSource,
    error: loadError,
  } = useOpportunities();

  // Filter only educational opportunities: scholarships, fellowships, grants
  const baseScholarships = useMemo(() => {
    return allOpportunities.filter(
      (opp) =>
        opp.type === "scholarship" ||
        opp.type === "fellowship" ||
        opp.type === "grant"
    );
  }, [allOpportunities]);

  // Personalized scholarship matching engine results
  const matchedScholarships = useMemo(() => {
    if (!profile || baseScholarships.length === 0) {
      return {
        likelyMatches: [],
        needsVerification: [],
        doesNotMatch: [],
        allResults: [],
      };
    }
    return runScholarshipMatcher(baseScholarships, profile);
  }, [baseScholarships, profile]);

  const displayedMatchedResults = useMemo(() => {
    let list: MatchResult[] = [];
    if (matchedTab === "likely_match") list = matchedScholarships.likelyMatches;
    else if (matchedTab === "needs_verification") list = matchedScholarships.needsVerification;
    else if (matchedTab === "does_not_match") list = matchedScholarships.doesNotMatch;
    else list = matchedScholarships.allResults;

    if (!filters.keyword) return list;
    const q = filters.keyword.toLowerCase().trim();
    return list.filter(
      (res) =>
        res.opportunity.title.toLowerCase().includes(q) ||
        res.opportunity.provider.toLowerCase().includes(q) ||
        res.summaryReason.toLowerCase().includes(q) ||
        res.profileAttributesUsed.some(
          (attr) =>
            attr.attribute.toLowerCase().includes(q) ||
            attr.value.toLowerCase().includes(q)
        )
    );
  }, [matchedScholarships, matchedTab, filters.keyword]);

  // Comprehensive multi-factor filtering
  const filteredScholarships = useMemo(() => {
    return baseScholarships.filter((opp) => {
      // 1. Keyword search
      if (filters.keyword) {
        const q = filters.keyword.toLowerCase().trim();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchProvider = (opp.provider || opp.providerName).toLowerCase().includes(q);
        const matchCategory = (opp.category || "").toLowerCase().includes(q);
        const matchDesc = opp.description.toLowerCase().includes(q);
        const matchTags = (opp.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchEdu = (opp.educationLevels || []).some((e) => e.toLowerCase().includes(q));
        if (!matchTitle && !matchProvider && !matchCategory && !matchDesc && !matchTags && !matchEdu) {
          return false;
        }
      }

      // 2. State
      if (filters.state) {
        if (
          filters.state !== "All India (Central)" &&
          opp.state !== "All India (Central)" &&
          opp.stateJurisdiction !== "All India (Central)" &&
          opp.state !== filters.state &&
          opp.stateJurisdiction !== filters.state
        ) {
          return false;
        }
      }

      // 3. Life Stage
      if (filters.lifeStage) {
        const stages = opp.lifeStages || opp.targetLifeStages || [];
        if (!stages.includes(filters.lifeStage as LifeStageKey)) {
          return false;
        }
      }

      // 4. Education Level
      if (filters.educationLevel) {
        const text = (
          (opp.educationLevels || []).join(" ") +
          " " +
          (opp.educationRequirements?.minEducationLevel || "") +
          " " +
          (opp.minEducationLevel || "")
        ).toLowerCase();

        if (filters.educationLevel === "school" && !text.includes("class") && !text.includes("school")) {
          return false;
        }
        if (filters.educationLevel === "undergraduate" && !text.includes("degree") && !text.includes("b.tech") && !text.includes("undergraduate") && !text.includes("graduation")) {
          return false;
        }
        if (filters.educationLevel === "postgraduate" && !text.includes("postgraduate") && !text.includes("master") && !text.includes("m.tech")) {
          return false;
        }
        if (filters.educationLevel === "phd" && !text.includes("phd") && !text.includes("doctoral") && !text.includes("research")) {
          return false;
        }
      }

      // 5. Opportunity Type
      if (filters.opportunityType && opp.type !== filters.opportunityType) {
        return false;
      }

      // 6. Social / Caste Category
      if (filters.category) {
        const cats = opp.categoryEligibility || opp.casteCategories || [];
        if (!cats.includes("all") && !cats.includes(filters.category as any)) {
          return false;
        }
      }

      // 7. Income Range
      if (filters.incomeRange) {
        const threshold = parseInt(filters.incomeRange, 10);
        const oppIncome =
          opp.incomeCriteria?.maxAnnualIncome || opp.maxFamilyIncome;
        if (oppIncome && oppIncome > threshold) {
          return false;
        }
      }

      // 8. Age Range
      if (filters.ageRange) {
        const min = opp.ageRange?.minAge;
        const max = opp.ageRange?.maxAge;
        if (filters.ageRange === "under18" && min && min >= 18) return false;
        if (filters.ageRange === "18-25" && ((max && max < 18) || (min && min > 25))) return false;
        if (filters.ageRange === "25plus" && max && max < 25) return false;
      }

      // 9. Deadline
      if (filters.deadline) {
        if (filters.deadline === "year_round") {
          const isYR =
            opp.applicationDeadline?.type === "year_round" || opp.isYearRound;
          if (!isYR) return false;
        } else if (filters.deadline === "closing_soon") {
          const closeStr =
            opp.applicationDeadline?.closingDate || opp.deadlineDate;
          if (!closeStr || closeStr.includes("Round")) return false;
          const diffDays = Math.ceil(
            (new Date(closeStr).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (diffDays <= 0 || diffDays > 45) return false;
        }
      }

      // 10. Verification Status
      if (filters.verificationStatus) {
        if (filters.verificationStatus === "verified" && opp.verificationStatus !== "verified") {
          return false;
        }
        if (filters.verificationStatus === "under_review" && opp.verificationStatus !== "under_review" && opp.verificationStatus !== "source_updated") {
          return false;
        }
        if (filters.verificationStatus === "unverified" && opp.verificationStatus !== "unverified") {
          return false;
        }
      }

      return true;
    });
  }, [baseScholarships, filters]);

  // Sorting
  const sortedScholarships = useMemo(() => {
    return [...filteredScholarships].sort((a, b) => {
      if (sortBy === "amount_desc") {
        const aAmt = a.amountNumeric || 0;
        const bAmt = b.amountNumeric || 0;
        return bAmt - aAmt;
      }
      if (sortBy === "deadline_asc") {
        const aDate = a.applicationDeadline?.closingDate || a.deadlineDate || "9999-99-99";
        const bDate = b.applicationDeadline?.closingDate || b.deadlineDate || "9999-99-99";
        return aDate.localeCompare(bDate);
      }
      if (sortBy === "verified_recent") {
        const aVer = a.lastVerifiedAt || a.verifiedAt || "";
        const bVer = b.lastVerifiedAt || b.verifiedAt || "";
        return bVer.localeCompare(aVer);
      }
      // Default: most relevant (verified first)
      if (a.verificationStatus === "verified" && b.verificationStatus !== "verified") return -1;
      if (b.verificationStatus === "verified" && a.verificationStatus !== "verified") return 1;
      return 0;
    });
  }, [filteredScholarships, sortBy]);

  // Paginated slice
  const displayedScholarships = useMemo(() => {
    return sortedScholarships.slice(0, visibleCount);
  }, [sortedScholarships, visibleCount]);

  // Active filter count
  const activeFilterList = useMemo(() => {
    const list: { key: keyof ScholarshipFilterState; label: string }[] = [];
    if (filters.state) list.push({ key: "state", label: `State: ${filters.state}` });
    if (filters.lifeStage) list.push({ key: "lifeStage", label: `Stage: ${filters.lifeStage.replace("_", " ")}` });
    if (filters.educationLevel) list.push({ key: "educationLevel", label: `Edu: ${filters.educationLevel}` });
    if (filters.opportunityType) list.push({ key: "opportunityType", label: `Type: ${filters.opportunityType}` });
    if (filters.category) list.push({ key: "category", label: `Category: ${filters.category}` });
    if (filters.incomeRange) list.push({ key: "incomeRange", label: `Income <= ₹${parseInt(filters.incomeRange)/100000}L` });
    if (filters.ageRange) list.push({ key: "ageRange", label: `Age: ${filters.ageRange}` });
    if (filters.deadline) list.push({ key: "deadline", label: `Deadline: ${filters.deadline}` });
    if (filters.verificationStatus) list.push({ key: "verificationStatus", label: `Status: ${filters.verificationStatus}` });
    return list;
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12 space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
          ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-2 border border-blue-200 shadow-2xs">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span>Educational Grants & Scholarship Finder</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Find Verified Scholarships & Fellowships
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Search and filter verified pre-matric, post-matric, STEM, and research fellowships across Central Government, State Portals, and Private Foundations.
        </p>

        {/* Verification Status Legend Alert */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <span>Audit Status Guide:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              VERIFIED (Official Portal)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
              NEEDS VERIFICATION (Under Audit)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
              DEMO RECORD (Hackathon Prototype)
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PERSONALIZED SCHOLARSHIP MATCHING HERO CARD
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Personalized Scholarship Matching Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {profile ? `Scholarships Matched for ${profile.name}` : "Pre-Screen Scholarships Against Your Profile"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {profile
                ? `Evaluated against your state (${profile.state}), education (${profile.educationLevel}), field of study (${profile.courseStream || "Technical Stream"}), academic marks (${profile.academicPercentage ? `${profile.academicPercentage}%` : "Passed"}), category (${profile.category}), and family income.`
                : "Evaluate published scholarships against your academic stream, marks, state domicile, and social category with zero hallucinations."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="toggle-matched-scholarships-btn"
              type="button"
              onClick={() => setIsMatchingMode(!isMatchingMode)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                isMatchingMode
                  ? "bg-white text-slate-900 hover:bg-slate-100"
                  : "bg-brand-600 hover:bg-brand-700 text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>{isMatchingMode ? "View Standard Catalog" : "View Personalized Matches"}</span>
            </button>
            <Link
              href="/profile"
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* 1-Click Evaluation Switcher */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
            Quick Persona Switcher (Test with Different Student Profiles):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { loginAsDemoPersona("student"); setIsMatchingMode(true); }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              🎓 Pooja (B.Tech • 88.5% • KA • OBC)
            </button>
            <button
              type="button"
              onClick={() => { loginAsDemoPersona("farmer"); setIsMatchingMode(true); }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              🌾 Ramesh (Farmer • Class 10 • MH)
            </button>
            <button
              type="button"
              onClick={() => { loginAsDemoPersona("entrepreneur"); setIsMatchingMode(true); }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              💼 Lakshmi (B.Com • 33 yrs • TN)
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SEARCH BAR & MOBILE FILTER TRIGGER
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="relative flex items-center shadow-md rounded-2xl bg-white border border-slate-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 transition-all">
          <div className="pl-4 sm:pl-5 text-slate-400">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => updateFilter("keyword", e.target.value)}
            placeholder="Search by scholarship title, subject, college level, or provider (e.g. 'Engineering', 'AICTE', 'OBC', 'Maharashtra')..."
            className="w-full py-4 pl-3 pr-24 text-slate-800 placeholder-slate-400 text-xs sm:text-base font-normal bg-transparent focus:outline-hidden"
          />
          {filters.keyword && (
            <button
              type="button"
              onClick={() => updateFilter("keyword", "")}
              className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter & Sort Bar */}
        <div className="lg:hidden flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filters ({activeFilterList.length})</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <option value="relevant">Most Relevant</option>
            <option value="amount_desc">Highest Grant</option>
            <option value="deadline_asc">Closing Soonest</option>
            <option value="verified_recent">Recently Verified</option>
          </select>
        </div>
      </div>

      {isMatchingMode ? (
        /* ─────────────────────────────────────────────────────────────
            PERSONALIZED MATCHING VIEW
            ───────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Active Profile Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-black text-sm shrink-0">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {profile ? `Evaluating Profile: ${profile.name}` : "No Profile Loaded"}
                  </h3>
                  {profile && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active Profile
                    </span>
                  )}
                </div>
                {profile ? (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                    <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">
                      Edu: {profile.educationLevel}
                    </span>
                    {profile.courseStream && (
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">
                        Stream: {profile.courseStream}
                      </span>
                    )}
                    {profile.academicPercentage && (
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">
                        Marks: {profile.academicPercentage}%
                      </span>
                    )}
                    <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">
                      State: {profile.state}
                    </span>
                    <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">
                      Category: {profile.category}
                    </span>
                    {(profile.annualFamilyIncome !== undefined || profile.incomeRange) && (
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">
                        Income: {profile.annualFamilyIncome ? `₹${profile.annualFamilyIncome.toLocaleString("en-IN")}/yr` : profile.incomeRange}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Select a student persona from the quick switcher above or configure your profile.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-500 text-xs font-semibold text-slate-700 hover:text-brand-600 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Category Tabs: Likely Match, Needs Verification, Excluded, All */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Likely Match */}
              <button
                type="button"
                onClick={() => setMatchedTab("likely_match")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  matchedTab === "likely_match"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Likely Matches ({matchedScholarships.likelyMatches.length})</span>
              </button>

              {/* Needs Verification */}
              <button
                type="button"
                onClick={() => setMatchedTab("needs_verification")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  matchedTab === "needs_verification"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Needs Verification ({matchedScholarships.needsVerification.length})</span>
              </button>

              {/* Does Not Match */}
              <button
                type="button"
                onClick={() => setMatchedTab("does_not_match")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  matchedTab === "does_not_match"
                    ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Excluded ({matchedScholarships.doesNotMatch.length})</span>
              </button>

              {/* All Evaluated */}
              <button
                type="button"
                onClick={() => setMatchedTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  matchedTab === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Evaluated ({matchedScholarships.allResults.length})</span>
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {displayedMatchedResults.length} matching scholarships
              {filters.keyword && ` matching "${filters.keyword}"`}
            </span>
          </div>

          {/* Results List */}
          {!profile ? (
            <EmptyState
              icon={User}
              title="No student profile active"
              description="Click one of the Quick Persona buttons above (such as 🎓 Pooja Sharma or 🌾 Ramesh Patil) or set up your student profile to view personalized matches."
              actionText="Set Up Profile"
              onAction={() => (window.location.href = "/profile")}
            />
          ) : displayedMatchedResults.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No scholarships in this match category"
              description="Try switching to 'All Evaluated' or clearing your search keywords to view all evaluated opportunities."
              actionText="View All Evaluated"
              onAction={() => setMatchedTab("all")}
            />
          ) : (
            <div className="space-y-6">
              {displayedMatchedResults.map((result) => (
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
      ) : (
        <>
          {/* ─────────────────────────────────────────────────────────────
              ACTIVE FILTER CHIPS & RESULTS META
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-slate-900">
            Showing {filteredScholarships.length} scholarships & fellowships
          </span>

          {isLoading ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
              <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
              <span>Fetching from DB...</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                dataSource === "supabase"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <Database className="w-3 h-3 text-brand-600" />
              <span>{dataSource === "supabase" ? "Source: Supabase PostgreSQL" : "Source: Supabase Data Engine"}</span>
            </span>
          )}

          {activeFilterList.length > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1 ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          )}
        </div>

        {/* Desktop Sorting Dropdown */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            <option value="relevant">Most Relevant (Verified First)</option>
            <option value="amount_desc">Highest Financial Grant</option>
            <option value="deadline_asc">Closing Soonest</option>
            <option value="verified_recent">Recently Audited / Verified</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
          {activeFilterList.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-medium border border-brand-200"
            >
              <span>{f.label}</span>
              <button
                type="button"
                onClick={() => updateFilter(f.key, "")}
                className="hover:text-brand-950 p-0.5"
                title={`Remove ${f.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT GRID: SIDEBAR + OPPORTUNITY CARDS
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </h3>
            {activeFilterList.length > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs text-brand-600 font-semibold hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Verification Status Filter */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Audit Verification Status
              </label>
              <select
                value={filters.verificationStatus}
                onChange={(e) => updateFilter("verificationStatus", e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="">All Verification Classes</option>
                <option value="verified">🛡️ VERIFIED (Official Portal)</option>
                <option value="under_review">⚠️ NEEDS VERIFICATION</option>
                <option value="unverified">🧪 DEMO RECORD</option>
              </select>
            </div>

            {/* 2. State Filter */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                State Domicile
              </label>
              <select
                value={filters.state}
                onChange={(e) => updateFilter("state", e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="">All States & Central</option>
                {STATES_LIST.map((st) => (
                  <option key={st.name} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Education Level */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Education Level
              </label>
              <select
                value={filters.educationLevel}
                onChange={(e) => updateFilter("educationLevel", e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="">All Academic Levels</option>
                <option value="school">School (Classes 1 - 12)</option>
                <option value="undergraduate">Undergraduate (B.Tech, BSc, BA, MBBS)</option>
                <option value="postgraduate">Postgraduate (M.Tech, MSc, MA, MBA)</option>
                <option value="phd">Doctoral / PhD Research</option>
              </select>
            </div>

            {/* 4. Opportunity Type */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Opportunity Type
              </label>
              <select
                value={filters.opportunityType}
                onChange={(e) => updateFilter("opportunityType", e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="">All Educational Types</option>
                <option value="scholarship">Scholarships</option>
                <option value="fellowship">Research Fellowships</option>
                <option value="grant">Higher Education Grants</option>
              </select>
            </div>

            {/* 5. Life Stage */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Life Stage
              </label>
              <select
                value={filters.lifeStage}
                onChange={(e) => updateFilter("lifeStage", e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="">All Beneficiary Stages</option>
                <option value="school_students">School Students</option>
                <option value="college_students">College Students</option>
                <option value="graduates">Graduates & Researchers</option>
                <option value="women">Women & Girls</option>
                <option value="people_with_disabilities">Students with Disabilities</option>
              </select>
            </div>

            {/* 6. Social Category / Reservation */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Social / Reservation Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="">All Social Categories</option>
                <option value="General">General / Open</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>

            {/* 7. Income Range */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Annual Family Income
              </label>
              <select
                value={filters.incomeRange}
                onChange={(e) => updateFilter("incomeRange", e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="">No Income Restriction</option>
                <option value="250000">Up to ₹2.5 Lakhs / yr</option>
                <option value="450000">Up to ₹4.5 Lakhs / yr</option>
                <option value="800000">Up to ₹8.0 Lakhs / yr</option>
                <option value="1500000">Up to ₹15.0 Lakhs / yr</option>
              </select>
            </div>

            {/* 8. Age Range */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Age Range
              </label>
              <select
                value={filters.ageRange}
                onChange={(e) => updateFilter("ageRange", e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="">All Ages</option>
                <option value="under18">Under 18 Years</option>
                <option value="18-25">18 - 25 Years</option>
                <option value="25plus">25+ Years (PhD / Fellowships)</option>
              </select>
            </div>

            {/* 9. Deadline Status */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Deadline Status
              </label>
              <select
                value={filters.deadline}
                onChange={(e) => updateFilter("deadline", e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="">All Deadlines</option>
                <option value="closing_soon">Closing in Next 45 Days</option>
                <option value="year_round">Open Year-Round</option>
              </select>
            </div>
          </div>
        </aside>

        {/* OPPORTUNITY CARDS STREAM */}
        <main className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OpportunityCardSkeleton count={6} />
            </div>
          ) : displayedScholarships.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No scholarships match your filter criteria"
              description="Try clearing some filters, expanding your income ceiling, or selecting 'All States' to view Pan-India scholarships."
              actionText="Reset All Filters"
              onAction={resetAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedScholarships.map((opp) => (
                  <div key={opp.id} className="relative">
                    <OpportunityCard
                      opportunity={opp}
                      isSaved={savedIds.includes(opp.id)}
                      onToggleSave={toggleSave}
                      onOpenDetails={(item) => setSelectedOpportunity(item)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination / Load More */}
              {visibleCount < sortedScholarships.length && (
                <div className="pt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="px-8 py-3 rounded-xl bg-white border border-slate-300 hover:border-brand-500 text-slate-800 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Load More Opportunities ({sortedScholarships.length - visibleCount} remaining)</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE FILTER DRAWER (SLIDE-OVER)
          ───────────────────────────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl animate-slideLeft">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-black text-base uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-brand-600" />
                  <span>Filter Scholarships</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Controls */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Verification Status
                  </label>
                  <select
                    value={filters.verificationStatus}
                    onChange={(e) => updateFilter("verificationStatus", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="">All</option>
                    <option value="verified">VERIFIED (Official Portal)</option>
                    <option value="under_review">NEEDS VERIFICATION</option>
                    <option value="unverified">DEMO RECORD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    State
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => updateFilter("state", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="">All States</option>
                    {STATES_LIST.map((st) => (
                      <option key={st.name} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Education Level
                  </label>
                  <select
                    value={filters.educationLevel}
                    onChange={(e) => updateFilter("educationLevel", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="">All Levels</option>
                    <option value="school">School (1-12)</option>
                    <option value="undergraduate">Undergraduate (UG)</option>
                    <option value="postgraduate">Postgraduate (PG)</option>
                    <option value="phd">PhD / Research</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Social Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter("category", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="">All Categories</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Max Annual Income
                  </label>
                  <select
                    value={filters.incomeRange}
                    onChange={(e) => updateFilter("incomeRange", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="">No Limit</option>
                    <option value="250000">Up to ₹2.5L / yr</option>
                    <option value="450000">Up to ₹4.5L / yr</option>
                    <option value="800000">Up to ₹8.0L / yr</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md"
              >
                Apply Filters ({filteredScholarships.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          COMPREHENSIVE 8-SECTION OPPORTUNITY DETAIL MODAL
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

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Scholarship Finder...</div>}>
      <ScholarshipFinderContent />
    </Suspense>
  );
}
