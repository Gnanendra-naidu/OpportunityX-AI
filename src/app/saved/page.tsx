"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Opportunity, ApplicationStage } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useSaved } from "@/context/SavedContext";
import { APPLICATION_STAGES, normalizeApplicationStage } from "@/lib/tracker/constants";
import { VerificationStatusBadge } from "@/components/common/VerificationStatusBadge";
import { DeadlineBadge } from "@/components/common/DeadlineBadge";
import { DeadlineVisualIndicator } from "@/components/common/DeadlineVisualIndicator";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import {
  getDeadlineEvaluation,
  DeadlineStatus,
  formatDisplayDate,
} from "@/lib/deadlines/tracker";
import { getVerifiedOpportunityUrl } from "@/lib/opportunities/urls";
import {
  Bookmark,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Trash2,
  Clock,
  FileCheck,
  ShieldCheck,
  Building,
  User,
  Lock,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Sparkles,
  Info,
  ChevronRight,
  BookOpen,
  IndianRupee,
  MapPin,
  Check,
  RotateCcw,
  CalendarClock,
  Archive,
  Hourglass,
} from "lucide-react";

type DeadlineFilter = "all" | "closing_soon" | "upcoming" | "open" | "deadline_passed";
type SortOption = "deadline_asc" | "recent" | "amount_desc" | "title_asc";

export default function SavedOpportunitiesPage() {
  const { user, profile } = useAuth();
  const {
    savedItems,
    savedOpportunities,
    removeOpportunity,
    updateStatus,
    isLoading,
  } = useSaved();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Selected opportunity for detail modal
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Status update message notification
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Document Readiness Checklist state
  const [documentChecklist, setDocumentChecklist] = useState<Record<string, boolean>>({
    "Marksheet of Last Qualifying Exam": true,
    "Annual Family Income Certificate (Tehsildar/Revenue)": true,
    "Bonafide Student Certificate / Fee Receipt": false,
    "Aadhaar Card linked to Bank Account (DBT-enabled)": true,
    "Caste / Category Certificate (if applicable)": true,
    "Domicile / Residence Certificate": false,
  });

  const toggleChecklist = (docName: string) => {
    setDocumentChecklist((prev) => ({
      ...prev,
      [docName]: !prev[docName],
    }));
  };

  const totalDocs = Object.keys(documentChecklist).length;
  const completedDocs = Object.values(documentChecklist).filter(Boolean).length;
  const progressPercent = Math.round((completedDocs / totalDocs) * 100);

  // Filtered & Sorted Saved Opportunities
  const filteredSavedItems = useMemo(() => {
    return savedItems
      .filter((item) => {
        const opp = item.opportunity;
        if (!opp) return false;

        // 1. Keyword search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = opp.title.toLowerCase().includes(q);
          const matchProvider = (opp.provider || opp.providerName).toLowerCase().includes(q);
          const matchCategory = opp.category.toLowerCase().includes(q);
          const matchState = (opp.state || opp.stateJurisdiction).toLowerCase().includes(q);
          const matchDesc = opp.description.toLowerCase().includes(q);
          if (!matchTitle && !matchProvider && !matchCategory && !matchState && !matchDesc) {
            return false;
          }
        }

        // 2. Type filter
        if (typeFilter !== "all" && opp.type !== typeFilter) {
          return false;
        }

        // 3. Deadline status filter (Closing Soon, Upcoming, Open, Deadline Passed)
        if (deadlineFilter !== "all") {
          const evalResult = getDeadlineEvaluation(opp);
          if (evalResult.status !== deadlineFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "deadline_asc") {
          const evalA = getDeadlineEvaluation(a.opportunity);
          const evalB = getDeadlineEvaluation(b.opportunity);
          const getWeight = (res: typeof evalA) => {
            if (res.status === "closing_soon") return res.daysRemaining ?? 0;
            if (res.status === "open") return res.daysRemaining ?? 999;
            if (res.status === "upcoming") return 1000 + (res.daysUntilOpen ?? 0);
            return 2000 + Math.abs(res.daysRemaining ?? 0);
          };
          return getWeight(evalA) - getWeight(evalB);
        }
        if (sortBy === "amount_desc") {
          const amountA = a.opportunity.amountNumeric || 0;
          const amountB = b.opportunity.amountNumeric || 0;
          return amountB - amountA;
        }
        if (sortBy === "title_asc") {
          return a.opportunity.title.localeCompare(b.opportunity.title);
        }
        // "recent" default (created_at desc)
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      });
  }, [savedItems, searchQuery, typeFilter, deadlineFilter, sortBy]);

  // Summary Metrics Breakdown by actual deadline status
  const stats = useMemo(() => {
    const total = savedItems.length;
    let closingSoon = 0;
    let upcoming = 0;
    let open = 0;
    let deadlinePassed = 0;

    savedItems.forEach((it) => {
      const opp = it.opportunity;
      if (!opp) return;
      const evaluation = getDeadlineEvaluation(opp);
      if (evaluation.status === "closing_soon") closingSoon++;
      else if (evaluation.status === "upcoming") upcoming++;
      else if (evaluation.status === "open") open++;
      else if (evaluation.status === "deadline_passed") deadlinePassed++;
    });

    return { total, closingSoon, upcoming, open, deadlinePassed };
  }, [savedItems]);

  const handleRemove = async (opportunityId: string, title: string) => {
    await removeOpportunity(opportunityId);
    setStatusNotice(`Removed "${title.substring(0, 30)}..." from your tracker.`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleStatusChange = async (
    opportunityId: string,
    newStage: ApplicationStage | "bookmarked" | "preparing_documents" | "applied" | "awarded" | "rejected"
  ) => {
    await updateStatus(opportunityId, newStage);
    const stage = normalizeApplicationStage(newStage);
    const label = APPLICATION_STAGES[stage]?.label || newStage;
    setStatusNotice(`Application stage updated to: ${label}`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setDeadlineFilter("all");
    setSortBy("recent");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12 space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & AUTH STATUS
          ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200">
          <Bookmark className="w-3.5 h-3.5 fill-brand-600" />
          <span>Personal Application Tracker</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Saved Opportunities & Deadlines
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Track government schemes and scholarships you are targeting, monitor application deadlines, and prepare required verification documents.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-2xs self-start md:self-auto"
          >
            <span>+ Discover More</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Sync Status Banner */}
        {user ? (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Saved opportunities synced to Supabase profile: <strong>{profile?.name || user.email}</strong>
              </span>
            </span>
            <div className="flex items-center gap-3 text-xs">
              <Link href="/dashboard" className="font-bold text-emerald-800 hover:underline">
                View Dashboard →
              </Link>
              <Link href="/matching" className="font-bold text-brand-700 hover:underline">
                Check Eligibility Matches →
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <span className="flex items-center gap-2 font-medium">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Bookmarks are currently stored in your guest session. Sign in to permanently sync your list with Supabase PostgreSQL across all devices.
              </span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login?redirect=/saved"
                className="px-3.5 py-1.5 rounded-lg bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-2xs"
              >
                Sign In to Sync
              </Link>
            </div>
          </div>
        )}

        {/* Transient Notice Toast */}
        {statusNotice && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-900 text-white text-xs flex items-center gap-2 animate-fade-in">
            <Info className="w-4 h-4 text-brand-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SUMMARY KPI STATS & DEADLINE RADAR CARDS
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Saved */}
        <button
          type="button"
          onClick={() => setDeadlineFilter("all")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            deadlineFilter === "all"
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-75">
            Total Saved
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1 flex items-baseline gap-2">
            <span>{stats.total}</span>
            <span className="text-xs font-normal opacity-60">items</span>
          </div>
          <div className="text-[11px] mt-1 font-medium opacity-80">
            All bookmarks
          </div>
        </button>

        {/* Closing Soon */}
        <button
          type="button"
          onClick={() =>
            setDeadlineFilter(deadlineFilter === "closing_soon" ? "all" : "closing_soon")
          }
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            deadlineFilter === "closing_soon"
              ? "bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/40"
              : "bg-white border-slate-200 hover:border-amber-400 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${deadlineFilter === "closing_soon" ? "text-amber-100" : "text-amber-700"}`}>
              Closing Soon
            </span>
            <Clock className={`w-3.5 h-3.5 ${deadlineFilter === "closing_soon" ? "text-white" : "text-amber-600 animate-pulse"}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${deadlineFilter === "closing_soon" ? "text-white" : "text-amber-600"}`}>
            {stats.closingSoon}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${deadlineFilter === "closing_soon" ? "text-amber-100" : "text-amber-700/80"}`}>
            ≤ 30 days left
          </div>
        </button>

        {/* Upcoming */}
        <button
          type="button"
          onClick={() =>
            setDeadlineFilter(deadlineFilter === "upcoming" ? "all" : "upcoming")
          }
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            deadlineFilter === "upcoming"
              ? "bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400/40"
              : "bg-white border-slate-200 hover:border-indigo-400 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${deadlineFilter === "upcoming" ? "text-indigo-100" : "text-indigo-700"}`}>
              Upcoming
            </span>
            <CalendarClock className={`w-3.5 h-3.5 ${deadlineFilter === "upcoming" ? "text-white" : "text-indigo-600"}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${deadlineFilter === "upcoming" ? "text-white" : "text-indigo-600"}`}>
            {stats.upcoming}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${deadlineFilter === "upcoming" ? "text-indigo-100" : "text-indigo-700/80"}`}>
            Opens in future
          </div>
        </button>

        {/* Open */}
        <button
          type="button"
          onClick={() =>
            setDeadlineFilter(deadlineFilter === "open" ? "all" : "open")
          }
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            deadlineFilter === "open"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400/40"
              : "bg-white border-slate-200 hover:border-emerald-400 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${deadlineFilter === "open" ? "text-emerald-100" : "text-emerald-700"}`}>
              Open
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${deadlineFilter === "open" ? "text-white" : "text-emerald-600"}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${deadlineFilter === "open" ? "text-white" : "text-emerald-600"}`}>
            {stats.open}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${deadlineFilter === "open" ? "text-emerald-100" : "text-emerald-700/80"}`}>
            Active / Year-round
          </div>
        </button>

        {/* Deadline Passed */}
        <button
          type="button"
          onClick={() =>
            setDeadlineFilter(deadlineFilter === "deadline_passed" ? "all" : "deadline_passed")
          }
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            deadlineFilter === "deadline_passed"
              ? "bg-slate-700 text-white border-slate-800 shadow-xs ring-2 ring-slate-400/40"
              : "bg-white border-slate-200 hover:border-slate-400 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${deadlineFilter === "deadline_passed" ? "text-slate-200" : "text-slate-600"}`}>
              Deadline Passed
            </span>
            <Archive className={`w-3.5 h-3.5 ${deadlineFilter === "deadline_passed" ? "text-white" : "text-slate-500"}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${deadlineFilter === "deadline_passed" ? "text-white" : "text-slate-600"}`}>
            {stats.deadlinePassed}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${deadlineFilter === "deadline_passed" ? "text-slate-200" : "text-slate-500/80"}`}>
            Previous cycle ended
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH & FILTER CONTROLS BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved by title, provider, or state..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Type Filter */}
          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Types</option>
              <option value="scholarship">Scholarships & Grants</option>
              <option value="scheme">Government Schemes</option>
              <option value="fellowship">Fellowships</option>
              <option value="skill_training">Skill Training</option>
            </select>
          </div>

          {/* Deadline Filter */}
          <div className="md:col-span-2">
            <select
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value as DeadlineFilter)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Deadlines</option>
              <option value="closing_soon">Closing Soon (≤30d)</option>
              <option value="upcoming">Upcoming Cycles</option>
              <option value="open">Open / Year-Round</option>
              <option value="deadline_passed">Deadline Passed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="recent">Recently Saved</option>
              <option value="deadline_asc">Deadline (Soonest)</option>
              <option value="amount_desc">Highest Grant</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(searchQuery || typeFilter !== "all" || deadlineFilter !== "all") && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing {filteredSavedItems.length} of {savedItems.length} saved opportunities
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN CONTENT: SAVED CARDS + READINESS CHECKLIST
          ───────────────────────────────────────────────────────────── */}
      {savedItems.length === 0 ? (
        /* Zero Saved Opportunities Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 mx-auto flex items-center justify-center text-brand-600">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            You haven't saved any opportunities yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Browse verified scholarships and welfare schemes. Tap the <strong>"Save"</strong> button on any opportunity card or detail page to track deadlines here.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/scholarships"
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700 transition-colors shadow-xs"
            >
              Explore Scholarships
            </Link>
            <Link
              href="/schemes"
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200 transition-colors"
            >
              Explore Govt Schemes
            </Link>
          </div>
        </div>
      ) : filteredSavedItems.length === 0 ? (
        /* Filter Empty State */
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            No saved opportunities match your current filters
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try clearing your search query or loosening the deadline filter.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Saved Opportunities Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              <span>Saved Items ({filteredSavedItems.length})</span>
              <span>Sorted by: {sortBy.replace("_", " ")}</span>
            </div>

            {filteredSavedItems.map((item) => {
              const opp = item.opportunity;

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:border-brand-300 transition-all space-y-4"
                >
                  {/* Top Bar: Type, State, Verification, and Status Selector */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                        {opp.type.replace("_", " ")}
                      </span>

                      <VerificationStatusBadge
                        status={opp.verificationStatus}
                        size="sm"
                      />

                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        <span>{opp.stateJurisdiction || opp.state}</span>
                      </div>
                    </div>

                    {/* Remove Action Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(opp.id, opp.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove from saved list"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Provider */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors leading-snug">
                      <button
                        type="button"
                        onClick={() => setSelectedOpportunity(opp)}
                        className="text-left cursor-pointer hover:underline"
                      >
                        {opp.title}
                      </button>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{opp.providerName || opp.provider}</span>
                    </p>
                  </div>

                  {/* Financial Amount & Visual Deadline Status */}
                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                        Benefit / Grant
                      </span>
                      <strong className="text-sm font-bold text-slate-900 flex items-center gap-0.5">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{opp.financialAmount || opp.amount}</span>
                      </strong>
                    </div>

                    <DeadlineVisualIndicator opportunity={opp} variant="badge" />
                  </div>

                  {/* Visual Deadline Indicator Card with Progress Bar & Cycle Dates */}
                  <DeadlineVisualIndicator
                    opportunity={opp}
                    variant="card"
                    showProgressBar={true}
                  />

                  {/* Progress Status Selector */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Application Stage:
                      </span>
                      <select
                        value={item.stage || normalizeApplicationStage(item.status, item.userNotes)}
                        onChange={(e) =>
                          handleStatusChange(opp.id, e.target.value as ApplicationStage)
                        }
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                      >
                        <option value="saved">📌 1. Saved</option>
                        <option value="planning_to_apply">📝 2. Planning to Apply</option>
                        <option value="application_started">✍️ 3. Application Started</option>
                        <option value="submitted">🚀 4. Submitted</option>
                        <option value="completed">🏆 5. Completed</option>
                      </select>
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOpportunity(opp)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        View Details
                      </button>

                      {(() => {
                        const verifiedUrl = getVerifiedOpportunityUrl(opp);
                        if (!verifiedUrl.isAvailable) {
                          return (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold border border-slate-200 cursor-not-allowed"
                              title="Official portal application link is not available for this record"
                            >
                              <span>Official link unavailable</span>
                            </span>
                          );
                        }
                        return (
                          <a
                            href={verifiedUrl.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                            title="Proceed to official sovereign portal"
                          >
                            <span>{verifiedUrl.label || "Official Portal"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Col: Readiness Checklist Tracker & Help */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-brand-600" />
                  <span>Document Readiness</span>
                </h3>
                <span className="text-xs font-bold text-brand-600">
                  {completedDocs} of {totalDocs} Ready
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Pre-certify your certificates to avoid last-minute portal rush before deadlines close.
              </p>

              {/* Checklist items */}
              <div className="space-y-2 pt-1">
                {Object.entries(documentChecklist).map(([name, isChecked]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleChecklist(name)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white flex items-start gap-2.5 transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                        isChecked
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white border-slate-300 text-transparent group-hover:border-slate-400"
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span
                      className={`text-xs font-medium leading-tight ${
                        isChecked
                          ? "text-slate-500 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Official Source Warning Card */}
            <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Fake Application Safety</span>
              </span>
              <p className="text-amber-800 leading-relaxed">
                OpportunityX-AI never asks for credit cards, OTPs, or application processing fees. Always submit your application on official government domains (such as <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">.gov.in</code> or <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">.nic.in</code>).
              </p>
            </div>

            {/* AI Assistant Quick Link */}
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 text-xs space-y-2.5">
              <span className="font-bold flex items-center gap-1.5 text-white">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Need help with eligibility?</span>
              </span>
              <p className="text-slate-400 leading-relaxed">
                Our AI Advisor checks your profile attributes against official guidelines to explain exact documentation criteria.
              </p>
              <Link
                href="/ai-assistant"
                className="inline-block px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors"
              >
                Ask AI Assistant →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. OPPORTUNITY DETAIL MODAL
          ───────────────────────────────────────────────────────────── */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </div>
  );
}
