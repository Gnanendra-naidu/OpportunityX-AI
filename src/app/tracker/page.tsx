"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ApplicationTrackerSection } from "@/components/tracker/ApplicationTrackerSection";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import { Opportunity } from "@/types";
import { useSaved } from "@/context/SavedContext";
import { Bookmark, LayoutDashboard, GraduationCap, ChevronRight } from "lucide-react";

export default function TrackerPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const { savedIds, toggleSave } = useSaved();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200 mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
            <span>OpportunityX-AI Application Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Scholarship Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Track your government scholarships, fellowships, and welfare schemes through all 5 stages: Saved, Planning to Apply, Application Started, Submitted, and Completed.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 text-slate-700 font-bold text-xs shadow-2xs transition-colors inline-flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4 text-brand-600" />
            <span>Citizen Dashboard</span>
          </Link>

          <Link
            href="/scholarships"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Find Scholarships</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Tracker Section */}
      <ApplicationTrackerSection onOpenDetails={(opp) => setSelectedOpportunity(opp)} />

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
