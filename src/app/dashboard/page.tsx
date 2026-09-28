"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOpportunities } from "@/hooks/useOpportunities";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import { MatchResultCard } from "@/components/matching/MatchResultCard";
import { runOpportunityMatcher } from "@/lib/matching/engine";
import { useSaved } from "@/context/SavedContext";
import { Opportunity } from "@/types";
import {
  getDeadlineEvaluation,
  groupOpportunitiesByDeadline,
  DeadlineStatus,
} from "@/lib/deadlines/tracker";
import { DeadlineBadge } from "@/components/common/DeadlineBadge";
import { DeadlineVisualIndicator } from "@/components/common/DeadlineVisualIndicator";
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
} from "lucide-react";

export default function DashboardPage() {
  const { user, profile, signOut, loginAsDemoPersona, isLoading: authLoading } = useAuth();
  const { opportunities: allOpportunities, isLoading: oppsLoading } = useOpportunities();

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const { savedIds, toggleSave } = useSaved();
  const [activeDeadlineFilter, setActiveDeadlineFilter] = useState<"all" | DeadlineStatus>("all");

  // Deterministic matching algorithm based on user's 9 profile fields
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

  // Actual Database Deadline Breakdown
  const deadlineBreakdown = useMemo(() => {
    return groupOpportunitiesByDeadline(allOpportunities);
  }, [allOpportunities]);

  // Filtered matched opportunities by active deadline filter
  const deadlineFilteredMatches = useMemo(() => {
    if (activeDeadlineFilter === "all") return matchingData.likelyMatches;
    return matchingData.likelyMatches.filter(
      (m) => getDeadlineEvaluation(m.opportunity).status === activeDeadlineFilter
    );
  }, [matchingData.likelyMatches, activeDeadlineFilter]);

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
            The personalized matching dashboard and saved scheme tracker require an active account. You can freely explore the public scholarship finder without signing in.
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12 space-y-8">
      {/* Welcome & Persona Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Authenticated Citizen Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.name || user?.email}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
            <span>Age: {profile?.age || 20}</span>
            <span>•</span>
            <span>{profile?.state}</span>
            <span>•</span>
            <span>{profile?.educationLevel}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-brand-200 text-xs">
              Category: {profile?.category}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/matching"
            className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Matcher</span>
          </Link>
          <Link
            href="/profile"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-xs border border-rose-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: 3 Categories + Saved */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Likely Match */}
        <Link
          href="/matching"
          className="bg-white rounded-2xl p-5 border border-emerald-200 hover:border-emerald-400 transition-all shadow-2xs group"
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
            High alignment (Pre-screened) →
          </span>
        </Link>

        {/* Metric 2: Needs Verification */}
        <Link
          href="/matching"
          className="bg-white rounded-2xl p-5 border border-amber-200 hover:border-amber-400 transition-all shadow-2xs group"
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
        </Link>

        {/* Metric 3: Does Not Appear to Match */}
        <Link
          href="/matching"
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Excluded Schemes
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {matchingData.doesNotMatch.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block group-hover:underline">
            View exclusion reasons →
          </span>
        </Link>

        {/* Metric 4: Saved Checklists */}
        <Link
          href="/saved"
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-brand-300 transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Saved Checklists
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {savedOpportunities.length}
          </div>
          <span className="text-[11px] text-brand-600 font-semibold mt-1 inline-block group-hover:underline">
            Active application tracks →
          </span>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DEADLINE TRACKING RADAR & VISUAL INDICATOR SYSTEM
          ───────────────────────────────────────────────────────────── */}
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
              Reset Deadline Filter (Show All)
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

        {/* Urgent Action Alert for Closing Soon Schemes */}
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
              onClick={() => setActiveDeadlineFilter("closing_soon")}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
            >
              View Closing Soon ({deadlineBreakdown.counts.closingSoon})
            </button>
          </div>
        )}
      </section>

      {/* SECTION 1: Matched Opportunities Stream */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>
                Top Likely Matches for Your Profile ({deadlineFilteredMatches.length}
                {activeDeadlineFilter !== "all" && ` • ${activeDeadlineFilter.replace("_", " ").toUpperCase()}`})
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic pre-screening based on domicile ({profile?.state}), category ({profile?.category}), and life stage.
            </p>
          </div>
          <Link
            href="/matching"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
          >
            <span>Open Full AI Matcher & Audit ({matchingData.allResults.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {deadlineFilteredMatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
            <p>
              {activeDeadlineFilter !== "all"
                ? `No likely matched schemes currently under "${activeDeadlineFilter.replace("_", " ")}" status.`
                : "No immediate Likely Matches under current parameters. Some schemes may be under 'Needs Verification'."}
            </p>
            {activeDeadlineFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setActiveDeadlineFilter("all")}
                className="font-bold text-brand-600 hover:underline cursor-pointer"
              >
                Clear Deadline Filter →
              </button>
            ) : (
              <Link href="/matching" className="font-bold text-brand-600 hover:underline">
                Check Needs Verification Tab →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deadlineFilteredMatches.slice(0, 4).map((result) => (
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

      {/* SECTION 2: Saved Opportunities & Deadlines */}
      <section className="space-y-4 pt-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-600" />
            <span>Your Saved Schemes & Application Checklists ({savedOpportunities.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track documents and deadlines for opportunities you have bookmarked.
          </p>
        </div>

        {savedOpportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            You haven't bookmarked any opportunities yet. Click the bookmark icon on any card to save it.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isSaved={true}
                onToggleSave={toggleSave}
                onOpenDetails={(item) => setSelectedOpportunity(item)}
              />
            ))}
          </div>
        )}
      </section>

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
