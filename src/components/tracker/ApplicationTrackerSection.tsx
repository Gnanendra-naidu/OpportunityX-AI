"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Opportunity, ApplicationStage } from "@/types";
import { SavedOpportunityItem } from "@/lib/supabase/saved";
import { useSaved } from "@/context/SavedContext";
import {
  APPLICATION_STAGES,
  STAGES_LIST,
  StageConfig,
  normalizeApplicationStage,
} from "@/lib/tracker/constants";
import { VerificationStatusBadge } from "@/components/common/VerificationStatusBadge";
import { DeadlineVisualIndicator } from "@/components/common/DeadlineVisualIndicator";
import {
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  FileText,
  Send,
  Building,
  MapPin,
  IndianRupee,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Edit3,
  Save,
  X,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface ApplicationTrackerSectionProps {
  onOpenDetails?: (opportunity: Opportunity) => void;
  defaultStageFilter?: "all" | ApplicationStage;
}

export function ApplicationTrackerSection({
  onOpenDetails,
  defaultStageFilter = "all",
}: ApplicationTrackerSectionProps) {
  const { savedItems, removeOpportunity, updateStage, isLoading } = useSaved();

  // Active filter state
  const [activeStageFilter, setActiveStageFilter] = useState<"all" | ApplicationStage>(defaultStageFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>("");
  const [notice, setNotice] = useState<string | null>(null);

  // Grouping & Counts by the 5 canonical stages
  const stageCounts = useMemo(() => {
    const counts: Record<ApplicationStage, number> = {
      saved: 0,
      planning_to_apply: 0,
      application_started: 0,
      submitted: 0,
      completed: 0,
    };

    savedItems.forEach((item) => {
      const stage = item.stage || normalizeApplicationStage(item.status, item.userNotes);
      if (counts[stage] !== undefined) {
        counts[stage]++;
      } else {
        counts.saved++;
      }
    });

    return counts;
  }, [savedItems]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return savedItems.filter((item) => {
      const opp = item.opportunity;
      if (!opp) return false;

      const stage = item.stage || normalizeApplicationStage(item.status, item.userNotes);

      // Stage Filter
      if (activeStageFilter !== "all" && stage !== activeStageFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchProvider = (opp.providerName || opp.provider).toLowerCase().includes(q);
        const matchNotes = (item.userNotes || "").toLowerCase().includes(q);
        const matchState = (opp.stateJurisdiction || opp.state || "").toLowerCase().includes(q);
        if (!matchTitle && !matchProvider && !matchNotes && !matchState) {
          return false;
        }
      }

      return true;
    });
  }, [savedItems, activeStageFilter, searchQuery]);

  // Handlers
  const handleStageChange = async (opportunityId: string, newStage: ApplicationStage, currentNotes?: string) => {
    await updateStage(opportunityId, newStage, currentNotes);
    const config = APPLICATION_STAGES[newStage];
    setNotice(`Updated stage to: ${config.label}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleStartEditNotes = (item: SavedOpportunityItem) => {
    setEditingNotesId(item.opportunityId);
    // Strip technical stage prefixes if any
    const cleanNotes = (item.userNotes || "").replace(/\[stage:[a-z_]+\]/g, "").trim();
    setTempNotes(cleanNotes);
  };

  const handleSaveNotes = async (opportunityId: string, currentStage: ApplicationStage) => {
    await updateStage(opportunityId, currentStage, tempNotes);
    setEditingNotesId(null);
    setNotice("Application notes updated!");
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRemove = async (opportunityId: string, title: string) => {
    await removeOpportunity(opportunityId);
    setNotice(`Removed "${title.slice(0, 25)}..." from your tracker.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & PIPELINE METRICS BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200 mb-2">
              <Bookmark className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
              <span>Scholarship & Scheme Application Tracker</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Track Applications Through Every Stage
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Monitor your scholarship and welfare applications from initial discovery to document preparation, portal submission, and grant sanctioning.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/scholarships"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>+ Add Scholarships</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Live Notification Message */}
        {notice && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notice}</span>
            </span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 5-Stage Visual Stepper Pipeline Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {STAGES_LIST.map((stage) => {
            const count = stageCounts[stage.key];
            const isActive = activeStageFilter === stage.key;

            return (
              <button
                key={stage.key}
                type="button"
                onClick={() =>
                  setActiveStageFilter(activeStageFilter === stage.key ? "all" : stage.key)
                }
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-brand-500/50"
                    : `${stage.badgeBg} border-slate-200/80 hover:border-slate-300 text-slate-900 shadow-2xs`
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span
                    className={`uppercase tracking-wider ${
                      isActive ? "text-slate-300" : stage.badgeText
                    }`}
                  >
                    Step {stage.stepNumber}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${stage.dotColor} ${
                      isActive ? "ring-2 ring-white" : ""
                    }`}
                  />
                </div>

                <div className={`text-base font-black mt-1 leading-tight ${isActive ? "text-white" : "text-slate-900"}`}>
                  {stage.label}
                </div>

                <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-slate-200/40">
                  <span className={`text-xl font-black ${isActive ? "text-brand-300" : stage.badgeText}`}>
                    {count}
                  </span>
                  <span className={`text-[10px] font-semibold ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                    {count === 1 ? "application" : "applications"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & SEARCH CONTROLS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Stage Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveStageFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStageFilter === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Tracked ({savedItems.length})
          </button>

          {STAGES_LIST.map((stage) => {
            const isSelected = activeStageFilter === stage.key;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => setActiveStageFilter(stage.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                    : `${stage.badgeBg} ${stage.badgeText} ${stage.badgeBorder} hover:opacity-80`
                }`}
              >
                <span>{stage.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isSelected ? "bg-white/20 text-white" : "bg-white text-slate-700"}`}>
                  {stageCounts[stage.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px] sm:min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracked applications..."
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

      {/* ─────────────────────────────────────────────────────────────
          3. APPLICATION TRACKING CARDS STREAM
          ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          Loading your tracked applications...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {activeStageFilter !== "all"
                ? `No applications currently in "${APPLICATION_STAGES[activeStageFilter].label}" stage`
                : "You are not tracking any scholarship applications yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {activeStageFilter !== "all"
                ? "Try selecting 'All Tracked' or move another saved opportunity to this stage."
                : "Browse verified scholarships and click 'Bookmark' or 'Save' on any card to track it through Saved, Planning to Apply, Application Started, Submitted, and Completed."}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            {activeStageFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setActiveStageFilter("all")}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                View All Tracked Applications ({savedItems.length})
              </button>
            ) : (
              <Link
                href="/scholarships"
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs"
              >
                Browse Scholarships Catalog →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const opp = item.opportunity;
            const currentStage = item.stage || normalizeApplicationStage(item.status, item.userNotes);
            const stageConfig = APPLICATION_STAGES[currentStage];
            const isEditingNotes = editingNotesId === opp.id;

            return (
              <div
                key={opp.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                {/* Top Meta Bar */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                      {opp.type.replace("_", " ")}
                    </span>

                    <VerificationStatusBadge status={opp.verificationStatus} size="sm" />

                    <div className="flex items-center text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>{opp.stateJurisdiction || opp.state}</span>
                    </div>
                  </div>

                  {/* Stage Badge & Trash */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${stageConfig.badgeBg} ${stageConfig.badgeText} ${stageConfig.badgeBorder}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${stageConfig.dotColor}`} />
                      <span>Stage {stageConfig.stepNumber}: {stageConfig.label}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemove(opp.id, opp.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from tracker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Provider */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 hover:text-brand-600 transition-colors leading-snug">
                      <button
                        type="button"
                        onClick={() => onOpenDetails && onOpenDetails(opp)}
                        className="text-left cursor-pointer hover:underline"
                      >
                        {opp.title}
                      </button>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{opp.providerName || opp.provider}</span>
                    </p>
                  </div>

                  <div className="shrink-0 text-left md:text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Grant / Benefit
                    </span>
                    <strong className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-0.5 md:justify-end">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                      <span>{opp.financialAmount || opp.amount}</span>
                    </strong>
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    INTERACTIVE 5-STAGE PROGRESS STEPPER
                    ───────────────────────────────────────────────────────── */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Application Progress Pipeline</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        ({stageConfig.percentage}% complete)
                      </span>
                    </span>

                    {/* Stage Selector Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium text-[11px]">Move stage:</span>
                      <select
                        data-testid="stage-select"
                        value={currentStage}
                        onChange={(e) =>
                          handleStageChange(opp.id, e.target.value as ApplicationStage, item.userNotes)
                        }
                        className="stage-selector-dropdown py-1 px-2.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 cursor-pointer"
                      >
                        <option value="saved">📌 1. Saved</option>
                        <option value="planning_to_apply">📝 2. Planning to Apply</option>
                        <option value="application_started">✍️ 3. Application Started</option>
                        <option value="submitted">🚀 4. Submitted</option>
                        <option value="completed">🏆 5. Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Visual 5-Step Pipeline Bar */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {STAGES_LIST.map((step) => {
                      const isPast = step.stepNumber < stageConfig.stepNumber;
                      const isCurrent = step.stepNumber === stageConfig.stepNumber;

                      return (
                        <button
                          key={step.key}
                          type="button"
                          onClick={() => handleStageChange(opp.id, step.key, item.userNotes)}
                          title={`Click to set stage to: ${step.label}`}
                          className={`group relative text-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-brand-600 text-white shadow-xs font-black ring-2 ring-brand-300"
                              : isPast
                              ? "bg-emerald-100 text-emerald-900 font-bold hover:bg-emerald-200"
                              : "bg-slate-200/70 text-slate-500 font-medium hover:bg-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 text-[11px]">
                            {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                            <span>{step.shortLabel}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    ℹ️ Current Stage Description: <strong>{stageConfig.description}</strong>
                  </p>
                </div>

                {/* Application Notes & Details Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                  {/* Notes Section */}
                  <div className="flex-1">
                    {isEditingNotes ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="e.g. Application No: APP-2026-9812, Aadhaar OTP pending..."
                          className="flex-1 py-1.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                        />
                        <button
                          type="button"
                          data-testid="save-notes-btn"
                          onClick={() => handleSaveNotes(opp.id, currentStage)}
                          className="save-notes-btn px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-2 py-1.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">Notes / App ID:</span>
                        <span className="text-slate-700 font-semibold truncate max-w-md">
                          {(item.userNotes || "").replace(/\[stage:[a-z_]+\]/g, "").trim() || (
                            <span className="text-slate-400 italic font-normal">
                              No notes added yet (Click Edit to record Application No)
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartEditNotes(item)}
                          className="p-1 text-slate-400 hover:text-brand-600 rounded"
                          title="Edit application notes"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions: View Details & Official Portal */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {onOpenDetails && (
                      <button
                        type="button"
                        onClick={() => onOpenDetails(opp)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        View Guidelines
                      </button>
                    )}

                    <a
                      href={opp.applicationUrl || opp.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
