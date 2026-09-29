"use client";

import React from "react";
import Link from "next/link";
import { Opportunity } from "@/types";
import { VerificationStatusBadge } from "../common/VerificationStatusBadge";
import { OfficialSourceBadge } from "../common/OfficialSourceBadge";
import { DeadlineBadge } from "../common/DeadlineBadge";
import { useSaved } from "@/context/SavedContext";
import { getVerifiedOpportunityUrl } from "@/lib/opportunities/urls";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Building,
  GraduationCap,
  IndianRupee,
  MapPin,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onOpenDetails?: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  isSaved: propIsSaved,
  onToggleSave,
  onOpenDetails,
}) => {
  const { isSaved: contextIsSaved, toggleSave: contextToggleSave } = useSaved();
  const saved = propIsSaved !== undefined ? propIsSaved : contextIsSaved(opportunity.id);

  const verifiedUrlInfo = getVerifiedOpportunityUrl(opportunity);

  const handleOpenDetails = () => {
    if (onOpenDetails) {
      onOpenDetails(opportunity);
    }
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(opportunity.id);
    } else {
      contextToggleSave(opportunity.id);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "scholarship":
        return "bg-blue-50 text-blue-800 border-blue-200/80";
      case "scheme":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
      case "fellowship":
        return "bg-purple-50 text-purple-800 border-purple-200/80";
      case "skill_training":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      default:
        return "bg-slate-50 text-slate-800 border-slate-200/80";
    }
  };

  const formatTypeLabel = (type: string) => {
    switch (type) {
      case "scholarship":
        return "Scholarship";
      case "scheme":
        return "Govt Scheme";
      case "fellowship":
        return "Fellowship";
      case "skill_training":
        return "Skill Program";
      default:
        return "Opportunity";
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 hover:border-brand-400 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Tags */}
      <div className="p-5 sm:p-6 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border uppercase ${getTypeStyle(
                opportunity.type
              )}`}
            >
              {formatTypeLabel(opportunity.type)}
            </span>

            <VerificationStatusBadge
              status={opportunity.verificationStatus}
              size="sm"
            />

            <div className="flex items-center text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
              <span className="truncate max-w-[130px]">
                {opportunity.stateJurisdiction || opportunity.state}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveToggle}
            className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              saved
                ? "bg-brand-50 border-brand-300 text-brand-700 hover:bg-brand-100"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
            title={saved ? "Saved in your checklist (click to remove)" : "Save opportunity to checklist"}
            aria-label={saved ? `Remove ${opportunity.title} from saved` : `Save ${opportunity.title}`}
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
                <span className="text-[11px] font-bold">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-600">Save</span>
              </>
            )}
          </button>
        </div>

        {/* Title */}
        {onOpenDetails ? (
          <h3
            onClick={handleOpenDetails}
            className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
            title="Click to view full scholarship guidelines and eligibility"
          >
            {opportunity.title}
          </h3>
        ) : (
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
            <Link
              href={`/opportunities?id=${opportunity.id}`}
              className="hover:underline cursor-pointer"
              title="Click to view full scholarship guidelines and eligibility"
            >
              {opportunity.title}
            </Link>
          </h3>
        )}

        {/* Provider */}
        <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{opportunity.providerName || opportunity.provider}</span>
        </p>

        {/* Financial Amount & Key Benefit */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Benefit / Grant
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-0.5">
              <IndianRupee className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{opportunity.financialAmount || opportunity.amount}</span>
            </div>
          </div>
          <DeadlineBadge
            opportunity={opportunity}
            deadlineDate={opportunity.deadlineDate}
            startDate={opportunity.applicationStartDate}
            isYearRound={opportunity.isYearRound}
          />
        </div>

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Eligibility quick points */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Key Criteria:
          </div>
          <ul className="text-xs text-slate-600 space-y-1">
            {opportunity.eligibilityBullets.slice(0, 2).map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-brand-600 font-bold">•</span>
                <span className="line-clamp-1">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3">
        <OfficialSourceBadge
          url={verifiedUrlInfo.url || opportunity.officialPortalUrl || opportunity.officialWebsite}
          verifiedAt={opportunity.verifiedAt || opportunity.lastVerifiedAt}
        />

        <div className="flex items-center gap-2">
          {onOpenDetails ? (
            <button
              type="button"
              onClick={handleOpenDetails}
              data-testid="details-btn"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 hover:underline cursor-pointer py-1.5 px-2"
              aria-label={`View details for ${opportunity.title}`}
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href={`/opportunities?id=${opportunity.id}`}
              data-testid="details-btn"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 hover:underline py-1.5 px-2"
              aria-label={`View details for ${opportunity.title}`}
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {verifiedUrlInfo.isAvailable && verifiedUrlInfo.url ? (
            <a
              href={verifiedUrlInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              title={`Opens official sovereign portal (${verifiedUrlInfo.domain}) in a new tab`}
              aria-label={`Visit official portal for ${opportunity.title} (opens in new tab)`}
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium border border-slate-200 cursor-not-allowed select-none"
              title="Official portal registration link is currently unavailable for this record"
              aria-label="Official link unavailable"
            >
              <span>Official link unavailable</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
