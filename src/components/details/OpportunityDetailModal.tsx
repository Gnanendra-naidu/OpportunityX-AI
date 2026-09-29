"use client";

import React, { useState } from "react";
import { Opportunity, ApplicationStage } from "@/types";
import { APPLICATION_STAGES, normalizeApplicationStage } from "@/lib/tracker/constants";
import { VerificationStatusBadge } from "@/components/common/VerificationStatusBadge";
import { DeadlineBadge } from "@/components/common/DeadlineBadge";
import { DeadlineVisualIndicator } from "@/components/common/DeadlineVisualIndicator";
import { formatDisplayDate } from "@/lib/deadlines/tracker";
import { RequiredDocumentsSection } from "@/components/documents/RequiredDocumentsSection";
import {
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  GraduationCap,
  IndianRupee,
  MapPin,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  Globe,
  Share2,
  Bookmark,
  BookmarkCheck,
  Phone,
  Mail,
  FileCheck,
  ListOrdered,
} from "lucide-react";
import { useSaved } from "@/context/SavedContext";

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  isSaved: propIsSaved,
  onToggleSave,
}) => {
  const [activeTab, setActiveTab] = useState<
    "all" | "eligibility" | "documents" | "process" | "source"
  >("all");

  const {
    isSaved: contextIsSaved,
    toggleSave: contextToggleSave,
    savedItems,
    updateStage,
  } = useSaved();
  const activeIsSaved =
    propIsSaved !== undefined
      ? propIsSaved
      : opportunity
      ? contextIsSaved(opportunity.id)
      : false;

  const currentSavedItem = opportunity
    ? savedItems.find((it) => it.opportunityId === opportunity.id)
    : undefined;
  const currentStage: ApplicationStage =
    currentSavedItem?.stage ||
    normalizeApplicationStage(currentSavedItem?.status, currentSavedItem?.userNotes);

  const handleToggleSave = () => {
    if (!opportunity) return;
    if (onToggleSave) {
      onToggleSave(opportunity.id);
    } else {
      contextToggleSave(opportunity.id);
    }
  };

  if (!opportunity) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Opportunity details"
      >
        {/* ─────────────────────────────────────────────────────────────
            MODAL HEADER
            ───────────────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
          <div className="flex flex-wrap items-center gap-2">
            <VerificationStatusBadge
              status={opportunity.verificationStatus}
              isDemo={opportunity.isDemoData}
            />
            <span className="text-xs text-slate-500 font-semibold px-2.5 py-1 bg-slate-100 rounded-md">
              {opportunity.type.toUpperCase()}
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {opportunity.stateJurisdiction || opportunity.state}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSave}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeIsSaved
                  ? "bg-brand-50 border-brand-300 text-brand-700"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title={activeIsSaved ? "Saved to your list (click to remove)" : "Save opportunity"}
            >
              {activeIsSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-brand-600 fill-brand-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MODAL BODY
            ───────────────────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 space-y-8 flex-1">
          {/* 1. OVERVIEW */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {opportunity.title}
              </h2>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium mt-2">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {opportunity.provider || opportunity.providerName}
                </span>
                <span>•</span>
                <span className="text-brand-700 font-semibold">
                  {opportunity.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {opportunity.state}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {opportunity.description}
            </p>

            {/* Snapshot Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Financial Grant / Award
                </span>
                <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-0.5 mt-0.5">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span>{opportunity.amount || opportunity.financialAmount}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Application Deadline
                </span>
                <div className="mt-1">
                  <DeadlineBadge
                    opportunity={opportunity}
                    deadlineDate={
                      opportunity.applicationDeadline?.closingDate ||
                      opportunity.deadlineDate ||
                      "Open"
                    }
                    startDate={opportunity.applicationStartDate}
                    isYearRound={
                      opportunity.applicationDeadline?.type === "year_round" ||
                      opportunity.isYearRound
                    }
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Application Method
                </span>
                <div className="text-xs sm:text-sm font-bold text-slate-800 capitalize mt-1">
                  {(opportunity.applicationMethod || "online_portal").replace(
                    "_",
                    " "
                  )}
                </div>
              </div>
            </div>

            {/* TRACKED APPLICATION STAGE BANNER */}
            {activeIsSaved && (
              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 fill-brand-600 text-brand-600 shrink-0" />
                  <div>
                    <span className="font-bold text-brand-950 block">
                      Tracked in Application Tracker
                    </span>
                    <span className="text-[11px] text-brand-700">
                      Current Stage: <strong>{APPLICATION_STAGES[currentStage]?.label || "Saved"}</strong> (Step {APPLICATION_STAGES[currentStage]?.stepNumber}/5)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">Update Stage:</span>
                  <select
                    value={currentStage}
                    onChange={(e) => updateStage(opportunity.id, e.target.value as ApplicationStage)}
                    className="py-1 px-2.5 text-xs font-bold rounded-lg border border-brand-300 bg-white text-brand-950 focus:outline-hidden focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-2xs"
                  >
                    <option value="saved">📌 1. Saved</option>
                    <option value="planning_to_apply">📝 2. Planning to Apply</option>
                    <option value="application_started">✍️ 3. Application Started</option>
                    <option value="submitted">🚀 4. Submitted</option>
                    <option value="completed">🏆 5. Completed</option>
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* 2. BENEFITS */}
          <section className="bg-emerald-50/60 rounded-2xl border border-emerald-200/80 p-5 space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <span>2. Benefits & Financial Assistance Breakdown</span>
            </h3>
            <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
              {opportunity.benefits || opportunity.benefitsSummary}
            </p>
          </section>

          {/* 3. ELIGIBILITY */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-4 h-4 text-brand-600" />
              <span>3. Eligibility Criteria & Conditions</span>
            </h3>

            {/* Granular Criteria Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Income Ceiling
                </span>
                <span className="font-bold text-slate-800">
                  {opportunity.incomeCriteria?.isRestricted &&
                  opportunity.incomeCriteria.maxAnnualIncome
                    ? `₹${opportunity.incomeCriteria.maxAnnualIncome.toLocaleString(
                        "en-IN"
                      )} / yr`
                    : opportunity.maxFamilyIncome
                    ? `₹${opportunity.maxFamilyIncome.toLocaleString(
                        "en-IN"
                      )} / yr`
                    : "No Income Ceiling"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Min. Academic Marks
                </span>
                <span className="font-bold text-slate-800">
                  {opportunity.educationRequirements?.minAcademicPercentage ||
                  opportunity.minAcademicPercentage
                    ? `${
                        opportunity.educationRequirements
                          ?.minAcademicPercentage ||
                        opportunity.minAcademicPercentage
                      }% aggregate`
                    : "Passing Marks"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Gender Eligibility
                </span>
                <span className="font-bold text-slate-800 capitalize">
                  {opportunity.genderEligibility?.join(", ") ||
                    opportunity.eligibleGenders?.join(", ") ||
                    "All"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Social Category
                </span>
                <span className="font-bold text-slate-800">
                  {opportunity.categoryEligibility?.includes("all")
                    ? "All Categories"
                    : opportunity.categoryEligibility?.join(", ") ||
                      opportunity.casteCategories?.join(", ") ||
                      "All"}
                </span>
              </div>
            </div>

            {/* Bullets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Detailed Qualification Requirements:
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {opportunity.eligibilityBullets?.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pre-Screening Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Pre-Screening Notice:</strong> This criteria summary is
                compiled from published guidelines. Final eligibility decisions,
                tie-breaking, and quota allocations are determined solely by the
                issuing government authority during formal application scrutiny.
              </span>
            </div>
          </section>

          {/* 4. REQUIRED DOCUMENTS */}
          <RequiredDocumentsSection
            opportunity={opportunity}
            documents={opportunity.documents}
            opportunityId={opportunity.id}
            officialSourceUrl={
              opportunity.applicationUrl ||
              opportunity.officialPortalUrl ||
              opportunity.officialWebsite
            }
            portalName={opportunity.officialSource?.portalName}
          />

          {/* 5. APPLICATION PROCESS */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ListOrdered className="w-4 h-4 text-brand-600" />
              <span>5. Application Process & Steps</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Application Fee
                </span>
                <span className="font-bold text-emerald-700 text-sm">
                  {opportunity.applicationInfo?.applicationFee === 0
                    ? "₹0 (Free / No Fee)"
                    : `₹${opportunity.applicationInfo?.applicationFee || 0}`}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Selection Mode
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {opportunity.applicationInfo?.selectionProcess ||
                    "Merit-cum-Means verification on official portal"}
                </span>
              </div>
            </div>

            {opportunity.applicationInfo?.stepByStepGuide &&
            opportunity.applicationInfo.stepByStepGuide.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Step-by-Step Walkthrough:
                </span>
                <div className="space-y-2">
                  {opportunity.applicationInfo.stepByStepGuide.map((step, sidx) => (
                    <div
                      key={sidx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 font-medium"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Submit through the official portal using your Aadhaar or State
                Scholarship ID, attach scanned verification certificates, and
                submit to your institutional nodal officer.
              </p>
            )}
          </section>

          {/* 6. IMPORTANT DATES */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>6. Important Dates & Cycle Timeline</span>
            </h3>

            {/* Visual Deadline Indicator Banner with Progress Meter */}
            <DeadlineVisualIndicator
              opportunity={opportunity}
              variant="banner"
              showProgressBar={true}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  Application Window
                </span>
                <span className="font-bold text-slate-800 mt-1 block">
                  {opportunity.applicationStartDate ? formatDisplayDate(opportunity.applicationStartDate) : "Announced Annually"} →{" "}
                  {opportunity.applicationDeadline?.closingDate
                    ? formatDisplayDate(opportunity.applicationDeadline.closingDate)
                    : opportunity.deadlineDate
                    ? formatDisplayDate(opportunity.deadlineDate)
                    : "Open Year-Round"}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  Academic Cycle / Cohort
                </span>
                <span className="font-bold text-slate-800 mt-1 block">
                  {opportunity.applicationDeadline?.cycleName ||
                    "AY 2026-27 Cycle"}
                </span>
              </div>
            </div>

            {opportunity.applicationDeadline?.isTentative && (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>
                  Portal dates may be extended or modified by the state or
                  nodal ministry. Check the official portal for latest circulars.
                </span>
              </div>
            )}
          </section>

          {/* 7. OFFICIAL SOURCE */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>7. Official Source of Truth</span>
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {opportunity.officialSource?.isGovernmentDomain
                  ? "Sovereign Portal (.gov.in)"
                  : "Verified Trust Domain"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 text-xs">Official Portal: </span>
                <strong className="text-slate-900">
                  {opportunity.officialSource?.portalName ||
                    opportunity.providerName}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Nodal Authority: </span>
                <span className="text-slate-800 font-medium">
                  {opportunity.officialSource?.departmentOrMinistry ||
                    opportunity.provider}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Domain Address: </span>
                <code className="text-xs bg-slate-200/80 px-2 py-0.5 rounded text-slate-800 font-mono">
                  {opportunity.officialSource?.domain || "Official Website"}
                </code>
              </div>
            </div>

            {/* Helpline info if available */}
            {(opportunity.officialSource?.helplinePhone ||
              opportunity.officialSource?.helplineEmail) && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                {opportunity.officialSource.helplinePhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Helpline: {opportunity.officialSource.helplinePhone}</span>
                  </div>
                )}
                {opportunity.officialSource.helplineEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email: {opportunity.officialSource.helplineEmail}</span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 8. VERIFICATION INFORMATION */}
          <section className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>8. Verification & Audit Information</span>
              </h3>
              <VerificationStatusBadge
                status={opportunity.verificationStatus}
                size="sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block">Audit Timestamp:</span>
                <span className="font-semibold text-white">
                  {opportunity.lastVerifiedAt || opportunity.verifiedAt}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Dataset Class:</span>
                <span className="font-semibold text-white">
                  {opportunity.isDemoData
                    ? "Demo Prototype (Simulated Record)"
                    : "Production Verified"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
              OpportunityX-AI verifies scheme guidelines against public gazettes
              and government portal updates. We do not accept application fees or
              directly disburse funds. All applications must be submitted on
              official sovereign portals.
            </p>
          </section>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MODAL FOOTER
            ───────────────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Opens official provider portal in a new tab</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleToggleSave}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeIsSaved
                  ? "bg-brand-50 border-brand-300 text-brand-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {activeIsSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-brand-600 fill-brand-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Save Opportunity</span>
                </>
              )}
            </button>
            <a
              href={opportunity.applicationUrl || opportunity.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <span>Proceed to Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
