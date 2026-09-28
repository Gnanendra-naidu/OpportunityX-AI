"use client";

import React, { useState } from "react";
import { MatchResult, MatchCategory } from "@/lib/matching/types";
import { VerificationStatusBadge } from "@/components/common/VerificationStatusBadge";
import { DeadlineBadge } from "@/components/common/DeadlineBadge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  FileCheck,
  Building,
  UserCheck,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import { useSaved } from "@/context/SavedContext";

interface MatchResultCardProps {
  result: MatchResult;
  isSaved?: boolean;
  onToggleSave?: (opportunityId: string) => void;
  onOpenDetails?: () => void;
}

export function MatchResultCard({
  result,
  isSaved: propIsSaved,
  onToggleSave,
  onOpenDetails,
}: MatchResultCardProps) {
  const [showFullAudit, setShowFullAudit] = useState(false);
  const { opportunity, category, summaryReason, profileAttributesUsed, verificationChecklist, ruleEvaluations, officialSource, deadline } = result;

  const { isSaved: contextIsSaved, toggleSave: contextToggleSave } = useSaved();
  const isSaved = propIsSaved !== undefined ? propIsSaved : contextIsSaved(opportunity.id);

  const handleToggleSave = () => {
    if (onToggleSave) {
      onToggleSave(opportunity.id);
    } else {
      contextToggleSave(opportunity.id);
    }
  };

  // Category Theme
  const categoryConfig: Record<
    MatchCategory,
    {
      badgeLabel: string;
      badgeClasses: string;
      icon: any;
      cardBorder: string;
      headerBg: string;
    }
  > = {
    likely_match: {
      badgeLabel: "Likely Match",
      badgeClasses: "bg-emerald-100 text-emerald-900 border-emerald-300",
      icon: CheckCircle2,
      cardBorder: "border-emerald-200 hover:border-emerald-400",
      headerBg: "bg-emerald-50/60",
    },
    needs_verification: {
      badgeLabel: "Needs Verification",
      badgeClasses: "bg-amber-100 text-amber-900 border-amber-300",
      icon: AlertTriangle,
      cardBorder: "border-amber-200 hover:border-amber-400",
      headerBg: "bg-amber-50/60",
    },
    does_not_match: {
      badgeLabel: "Does Not Appear to Match",
      badgeClasses: "bg-slate-100 text-slate-800 border-slate-300",
      icon: XCircle,
      cardBorder: "border-slate-200 hover:border-slate-300 opacity-90",
      headerBg: "bg-slate-50",
    },
  };

  const config = categoryConfig[category];
  const CategoryIcon = config.icon;

  return (
    <div className={`bg-white rounded-3xl border ${config.cardBorder} shadow-2xs transition-all overflow-hidden flex flex-col justify-between`}>
      {/* ─────────────────────────────────────────────────────────────
          1. CARD HEADER & MATCH CATEGORY BADGE
          ───────────────────────────────────────────────────────────── */}
      <div>
        <div className={`p-4 sm:p-5 ${config.headerBg} border-b border-slate-100 flex items-start justify-between gap-3`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${config.badgeClasses}`}>
                <CategoryIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{config.badgeLabel}</span>
              </span>

              <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                {opportunity.type === "scholarship" ? "Scholarship" : "Government Scheme"}
              </span>

              <VerificationStatusBadge
                status={opportunity.verificationStatus}
                size="sm"
              />

              <DeadlineBadge
                opportunity={opportunity}
                deadlineDate={opportunity.deadlineDate}
                startDate={opportunity.applicationStartDate}
                isYearRound={opportunity.isYearRound}
              />
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug pt-1">
              {opportunity.title}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{opportunity.provider}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleSave}
            className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              isSaved
                ? "bg-brand-50 text-brand-700 border-brand-300 hover:bg-brand-100"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
            title={isSaved ? "Saved to your list (click to remove)" : "Save Opportunity"}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
                <span className="text-[11px] font-bold">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium text-slate-600">Save</span>
              </>
            )}
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. STRUCTURED EXPLANATION SECTIONS (AS REQUESTED)
            ───────────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Benefit summary */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="font-semibold text-slate-600">Financial Award / Assistance:</span>
            <span className="font-black text-slate-900 text-sm">{opportunity.amount}</span>
          </div>

          {/* Explanation Point 1: Why it matched */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Why it Matched:</span>
            </h4>
            <p className="text-slate-700 leading-relaxed bg-brand-50/40 p-3 rounded-xl border border-brand-100">
              {summaryReason}
            </p>
          </div>

          {/* Explanation Point 2: Which profile attributes were used */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Profile Attributes Evaluated:</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profileAttributesUsed.map((attr, idx) => {
                const colorMap: Record<string, string> = {
                  matched: "bg-emerald-50 text-emerald-800 border-emerald-200",
                  verified: "bg-blue-50 text-blue-800 border-blue-200",
                  unverified: "bg-amber-50 text-amber-800 border-amber-200",
                  unspecified: "bg-slate-50 text-slate-700 border-slate-200",
                  mismatched: "bg-rose-50 text-rose-800 border-rose-200",
                };
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${colorMap[attr.impact] || colorMap.unspecified}`}
                  >
                    <span>{attr.attribute}:</span>
                    <strong>{attr.value}</strong>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Explanation Point 3: What the user must verify */}
          {verificationChecklist.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>What You Must Verify Before Applying:</span>
              </h4>
              <ul className="space-y-1 bg-amber-50/50 p-3 rounded-xl border border-amber-200/80">
                {verificationChecklist.slice(0, 3).map((check, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-700 leading-normal text-[11px]">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explanation Points 4 & 5: Official Source & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Official Ministry Source:
              </span>
              <a
                href={officialSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1 truncate max-w-full hover:underline"
              >
                <span className="truncate">{officialSource.portalName}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
              <span className="text-[10px] text-slate-500 block truncate">
                {officialSource.department}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Application Deadline:
              </span>
              <DeadlineBadge
                opportunity={opportunity}
                deadlineDate={opportunity.deadlineDate || deadline.formattedDate}
                startDate={opportunity.applicationStartDate}
                isYearRound={opportunity.isYearRound}
              />
              {deadline.cycleName && (
                <span className="text-[10px] text-slate-500 block truncate mt-1">
                  {deadline.cycleName}
                </span>
              )}
            </div>
          </div>

          {/* Mandatory Disclaimer for "Likely Match" */}
          {category === "likely_match" && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Legal Pre-Screening Caveat:</strong> A Likely Match is not an official guarantee of sanction or reservation. Final approval is subject to document scrutiny by the issuing authority.
              </span>
            </div>
          )}

          {/* Rule-by-rule expandable inspector */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowFullAudit(!showFullAudit)}
              className="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{showFullAudit ? "Hide Rule-by-Rule Audit" : "Inspect All Rule Evaluations (Deterministic Engine)"}</span>
              {showFullAudit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showFullAudit && (
              <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-100 text-[11px] animate-in fade-in">
                {ruleEvaluations.map((rule, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{rule.ruleName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          rule.status === "pass"
                            ? "bg-emerald-100 text-emerald-800"
                            : rule.status === "needs_verification"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {rule.status === "pass" ? "Passed" : rule.status === "needs_verification" ? "Verification Req." : "Excluded"}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-medium">Rule Requirement:</span> {rule.schemeRequirement}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-medium">Profile Value:</span> {rule.userValue}
                    </div>
                    <div className="text-slate-500 italic pt-0.5">
                      {rule.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CARD ACTION BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        {onOpenDetails && (
          <button
            type="button"
            onClick={onOpenDetails}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand-500 text-slate-800 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Full Details & Guidelines
          </button>
        )}

        <a
          href={officialSource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs ml-auto"
        >
          <span>Official Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
