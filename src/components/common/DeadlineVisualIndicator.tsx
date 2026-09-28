"use client";

import React from "react";
import { Opportunity } from "@/types";
import {
  getDeadlineEvaluation,
  DeadlineEvaluation,
  formatDisplayDate,
} from "@/lib/deadlines/tracker";
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  Archive,
  Hourglass,
  Sparkles,
} from "lucide-react";

interface DeadlineVisualIndicatorProps {
  opportunity?: Opportunity;
  deadlineDate?: string;
  startDate?: string;
  isYearRound?: boolean;
  variant?: "badge" | "card" | "banner" | "mini";
  showProgressBar?: boolean;
  className?: string;
}

export const DeadlineVisualIndicator: React.FC<DeadlineVisualIndicatorProps> = ({
  opportunity,
  deadlineDate,
  startDate,
  isYearRound,
  variant = "badge",
  showProgressBar = false,
  className = "",
}) => {
  // Synthesize opportunity if partial props provided
  const targetOpp: Opportunity = opportunity || {
    id: "temp",
    title: "",
    description: "",
    type: "scholarship",
    category: "",
    provider: "",
    providerName: "",
    providerType: "central_gov",
    state: "All India (Central)",
    stateJurisdiction: "All India (Central)",
    country: "India",
    lifeStages: [],
    targetLifeStages: [],
    educationLevels: [],
    genderEligibility: ["all"],
    eligibleGenders: ["all"],
    incomeCriteria: { isRestricted: false, currency: "INR", incomeCertificateRequired: false },
    categoryEligibility: ["all"],
    casteCategories: ["all"],
    disabilityEligibility: { applicable: false, isExclusiveForDisability: false, udidCardRequired: false },
    residencyRequirements: { domicileRequired: false, eligibleStates: [] },
    benefits: "",
    benefitsSummary: "",
    amount: "",
    financialAmount: "",
    documents: [],
    applicationDeadline: {
      type: "fixed_date",
      closingDate: deadlineDate,
      isTentative: false,
    },
    applicationStartDate: startDate,
    applicationMethod: "online_portal",
    officialWebsite: "",
    officialPortalUrl: "",
    applicationUrl: "",
    officialSource: {
      portalName: "",
      departmentOrMinistry: "",
      domain: "",
      url: "",
      isGovernmentDomain: true,
    },
    verificationStatus: "verified",
    isVerified: true,
    lastVerifiedAt: "",
    verifiedAt: "",
    createdAt: "",
    updatedAt: "",
    isDemoData: false,
    tags: [],
    eligibilityBullets: [],
    deadlineDate: deadlineDate || "",
    isYearRound: Boolean(isYearRound),
  };

  const evaluation: DeadlineEvaluation = getDeadlineEvaluation(targetOpp);

  const getStatusIcon = (size: string = "w-3.5 h-3.5") => {
    switch (evaluation.status) {
      case "closing_soon":
        return <Clock className={`${size} text-amber-600 animate-pulse`} />;
      case "upcoming":
        return <CalendarClock className={`${size} text-indigo-600`} />;
      case "open":
        return evaluation.isYearRound ? (
          <CheckCircle2 className={`${size} text-emerald-600`} />
        ) : (
          <Calendar className={`${size} text-emerald-600`} />
        );
      case "deadline_passed":
        return <Archive className={`${size} text-slate-500`} />;
      default:
        return <Calendar className={`${size} text-slate-500`} />;
    }
  };

  // 1. MINI VARIANT: Tiny status dot + text
  if (variant === "mini") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${evaluation.colorClasses.badgeText} ${className}`}>
        <span className={`w-2 h-2 rounded-full ${evaluation.colorClasses.dotColor} ${evaluation.status === "closing_soon" ? "animate-ping" : ""}`} />
        <span>{evaluation.badgeText}</span>
      </span>
    );
  }

  // 2. BADGE VARIANT: Standard pill for cards and lists
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${evaluation.colorClasses.badgeBg} ${evaluation.colorClasses.badgeText} ${evaluation.colorClasses.badgeBorder} shadow-2xs ${className}`}
        title={`Status: ${evaluation.statusLabel} • ${evaluation.formattedDeadline}`}
      >
        {getStatusIcon("w-3.5 h-3.5")}
        <span>{evaluation.badgeText}</span>
      </div>
    );
  }

  // 3. BANNER VARIANT: Detailed alert with progress bar & dates (for detail modals)
  if (variant === "banner") {
    return (
      <div className={`p-4 rounded-2xl border ${evaluation.colorClasses.alertBg} ${evaluation.colorClasses.alertBorder} ${evaluation.colorClasses.alertText} space-y-3 ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {getStatusIcon("w-4 h-4")}
            <span className="font-bold text-xs sm:text-sm uppercase tracking-wide">
              {evaluation.statusLabel}
            </span>
            <span className="text-xs opacity-75">
              ({evaluation.badgeText})
            </span>
          </div>

          <div className="text-xs font-semibold">
            {evaluation.isYearRound ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Rolling Admissions
              </span>
            ) : (
              <span>Target: <strong>{evaluation.formattedDeadline}</strong></span>
            )}
          </div>
        </div>

        {/* Visual Progress Meter between start date and deadline */}
        {!evaluation.isYearRound && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] opacity-75">
              <span>Opens: {evaluation.formattedStartDate || "Cycle Start"}</span>
              <span>Deadline: {evaluation.formattedDeadline}</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${evaluation.colorClasses.progressBar}`}
                style={{ width: `${evaluation.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Tentative Notice */}
        {evaluation.isTentative && (
          <div className="text-[11px] flex items-center gap-1.5 opacity-80 pt-1 border-t border-slate-200/60">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Dates tentative based on annual nodal ministry portal notification schedule.</span>
          </div>
        )}
      </div>
    );
  }

  // 4. CARD VARIANT: Full widget with countdown, timeline, and dates
  return (
    <div className={`p-4 bg-white rounded-2xl border ${evaluation.colorClasses.badgeBorder} shadow-2xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${evaluation.colorClasses.badgeBg} ${evaluation.colorClasses.badgeText} ${evaluation.colorClasses.badgeBorder} flex items-center gap-1`}>
          {getStatusIcon("w-3 h-3")}
          <span>{evaluation.statusLabel}</span>
        </span>

        {evaluation.daysRemaining !== null && evaluation.daysRemaining >= 0 && (
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Hourglass className="w-3.5 h-3.5 text-slate-400" />
            <span>{evaluation.daysRemaining} days remaining</span>
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-sm font-black text-slate-900 leading-snug">
          {evaluation.badgeText}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>Application Window: {evaluation.formattedStartDate || "Announced"} → {evaluation.formattedDeadline}</span>
        </div>
      </div>

      {showProgressBar && !evaluation.isYearRound && (
        <div className="space-y-1 pt-1">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${evaluation.colorClasses.progressBar}`}
              style={{ width: `${evaluation.progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
