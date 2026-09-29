"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Opportunity, OpportunityDocument } from "@/types";
import { validateAndNormalizeUrl } from "@/lib/opportunities/urls";
import {
  FileText,
  CheckSquare,
  Square,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Info,
  GraduationCap,
  UserCheck,
  CreditCard,
  Home,
  HeartPulse,
  Award,
  Landmark,
  Trees,
  Check,
  Printer,
  Sparkles,
  FileCheck,
} from "lucide-react";

export interface RequiredDocumentsSectionProps {
  opportunity?: Opportunity;
  documents?: OpportunityDocument[];
  opportunityId?: string;
  officialSourceUrl?: string;
  portalName?: string;
  className?: string;
  showHeader?: boolean;
}

export interface DocumentCategoryMeta {
  label: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  description: string;
}

export const DOCUMENT_CATEGORIES_META: Record<string, DocumentCategoryMeta> = {
  identity: {
    label: "Identity Documents",
    icon: UserCheck,
    colorClass: "text-blue-700",
    bgClass: "bg-blue-50/70",
    borderClass: "border-blue-200",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Proof of Indian citizenship and individual identification (e.g., Aadhaar card, Voter ID, Passport).",
  },
  academic: {
    label: "Education Documents",
    icon: GraduationCap,
    colorClass: "text-indigo-700",
    bgClass: "bg-indigo-50/70",
    borderClass: "border-indigo-200",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Academic transcripts, passing certificates, and bonafide student enrollment proofs.",
  },
  income: {
    label: "Income-Related Documents",
    icon: Award,
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50/70",
    borderClass: "border-emerald-200",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Income certificate issued by competent authority (Tehsildar/Revenue) or salary proofs.",
  },
  domicile: {
    label: "Residence Documents",
    icon: Home,
    colorClass: "text-purple-700",
    bgClass: "bg-purple-50/70",
    borderClass: "border-purple-200",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    description: "State domicile, nativity, or permanent residential proof as officially mandated.",
  },
  caste: {
    label: "Category Certificates",
    icon: ShieldCheck,
    colorClass: "text-amber-700",
    bgClass: "bg-amber-50/70",
    borderClass: "border-amber-200",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Caste/social category certificate (SC, ST, OBC-NCL, EWS) from authorized state revenue authorities.",
  },
  disability: {
    label: "Disability Certificates (Where Applicable)",
    icon: HeartPulse,
    colorClass: "text-rose-700",
    bgClass: "bg-rose-50/70",
    borderClass: "border-rose-200",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    description: "UDID Card or medical board certificate verifying disability percentage (>=40%).",
  },
  bank: {
    label: "Bank-Related Documents (Where Officially Required)",
    icon: Landmark,
    colorClass: "text-cyan-700",
    bgClass: "bg-cyan-50/70",
    borderClass: "border-cyan-200",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    description: "Active bank passbook or cancelled cheque with Aadhaar DBT seeding for direct grant transfer.",
  },
  land_record: {
    label: "Land & Agricultural Records",
    icon: Trees,
    colorClass: "text-lime-700",
    bgClass: "bg-lime-50/70",
    borderClass: "border-lime-200",
    badgeClass: "bg-lime-50 text-lime-700 border-lime-200",
    description: "Landholding ownership proof (RoR, Khasra, Khatauni, or 7/12 extract) for farmer schemes.",
  },
  other: {
    label: "Other Supporting Documents",
    icon: FileText,
    colorClass: "text-slate-700",
    bgClass: "bg-slate-50/70",
    borderClass: "border-slate-200",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    description: "Affidavits, self-declarations, project proposals, or special annexures required by nodal agency.",
  },
};

export const RequiredDocumentsSection: React.FC<RequiredDocumentsSectionProps> = ({
  opportunity,
  documents: propDocuments,
  opportunityId: propOpportunityId,
  officialSourceUrl: propOfficialSourceUrl,
  portalName: propPortalName,
  className = "",
  showHeader = true,
}) => {
  // 1. Resolve raw document items strictly from database / opportunity
  const rawDocuments: OpportunityDocument[] = useMemo(() => {
    if (propDocuments && Array.isArray(propDocuments)) {
      return propDocuments;
    }
    if (opportunity?.documents && Array.isArray(opportunity.documents)) {
      return opportunity.documents;
    }
    return [];
  }, [propDocuments, opportunity]);

  const oppId = propOpportunityId || opportunity?.id || "default";
  const rawPortalUrl =
    propOfficialSourceUrl ||
    opportunity?.applicationUrl ||
    opportunity?.officialPortalUrl ||
    opportunity?.officialWebsite ||
    opportunity?.officialSource?.url;
  const verifiedPortalInfo = validateAndNormalizeUrl(rawPortalUrl);
  const portalUrl = verifiedPortalInfo.isAvailable ? verifiedPortalInfo.url : "";
  const portalTitle =
    propPortalName ||
    opportunity?.officialSource?.portalName ||
    opportunity?.providerName ||
    opportunity?.provider ||
    "Official Government Portal";

  // 2. Checklist State with LocalStorage Persistence
  const storageKey = `opportunityx_docs_${oppId}`;
  const [preparedDocs, setPreparedDocs] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Load saved checklist on mount or opportunity change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPreparedDocs(JSON.parse(saved));
      } else {
        setPreparedDocs({});
      }
    } catch {
      setPreparedDocs({});
    }
  }, [storageKey]);

  // Toggle document preparation status
  const toggleDoc = (docId: string) => {
    setPreparedDocs((prev) => {
      const updated = {
        ...prev,
        [docId]: !prev[docId],
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save document preparation status to localStorage:", err);
      }
      return updated;
    });
  };

  // Mark all as prepared
  const handleCheckAll = () => {
    const allChecked: Record<string, boolean> = {};
    rawDocuments.forEach((doc) => {
      allChecked[doc.id] = true;
    });
    setPreparedDocs(allChecked);
    try {
      localStorage.setItem(storageKey, JSON.stringify(allChecked));
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }
  };

  // Reset checklist
  const handleResetChecklist = () => {
    setPreparedDocs({});
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.warn("Could not clear localStorage:", err);
    }
  };

  // 3. Computed Metrics
  const totalCount = rawDocuments.length;
  const mandatoryDocs = useMemo(
    () => rawDocuments.filter((d) => d.isMandatory),
    [rawDocuments]
  );
  const optionalDocs = useMemo(
    () => rawDocuments.filter((d) => !d.isMandatory),
    [rawDocuments]
  );

  const preparedCount = useMemo(() => {
    return rawDocuments.filter((doc) => preparedDocs[doc.id]).length;
  }, [rawDocuments, preparedDocs]);

  const preparedMandatoryCount = useMemo(() => {
    return mandatoryDocs.filter((doc) => preparedDocs[doc.id]).length;
  }, [mandatoryDocs, preparedDocs]);

  const progressPercentage =
    totalCount > 0 ? Math.round((preparedCount / totalCount) * 100) : 0;
  const isAllMandatoryReady =
    mandatoryDocs.length > 0 && preparedMandatoryCount === mandatoryDocs.length;
  const isAllReady = totalCount > 0 && preparedCount === totalCount;

  // 4. Category Groups Available in this Opportunity
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    rawDocuments.forEach((doc) => {
      const cat = doc.type || "other";
      categorySet.add(cat);
    });
    return Array.from(categorySet);
  }, [rawDocuments]);

  // 5. Filtered Documents based on category tab
  const filteredDocuments = useMemo(() => {
    if (selectedCategory === "all") return rawDocuments;
    return rawDocuments.filter((doc) => (doc.type || "other") === selectedCategory);
  }, [rawDocuments, selectedCategory]);

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6 ${className}`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & GROUNDED NOTICE
          ───────────────────────────────────────────────────────────── */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-1.5 border border-brand-200">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Grounded Verification Checklist</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600 shrink-0" />
              <span>Required Application Documents</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              These documents are retrieved directly from the scheme database record.
              Ensure you have certified digital copies (PDF/JPEG) ready before applying
              on the sovereign portal.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <span>{totalCount} Total Documents</span>
            </span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. EMPTY STATE: NO FABRICATION NOTICE
          ───────────────────────────────────────────────────────────── */}
      {totalCount === 0 ? (
        <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            No Specific Documents Registered in Database
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            In accordance with our zero-hallucination policy, we do not fabricate or guess
            required certificates. This opportunity record currently does not list specific
            documents. Please verify the official application portal guidelines.
          </p>
          {portalUrl && (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-2xs mt-2"
            >
              <span>Consult {portalTitle} Guidelines</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      ) : (
        <>
          {/* ─────────────────────────────────────────────────────────
              3. INTERACTIVE CHECKLIST PROGRESS MONITOR
              ───────────────────────────────────────────────────────── */}
          <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Your Document Readiness
                  </span>
                  {isAllReady ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>All Documents Prepared!</span>
                    </span>
                  ) : isAllMandatoryReady ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>All Mandatory Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>
                        {mandatoryDocs.length - preparedMandatoryCount} Mandatory Pending
                      </span>
                    </span>
                  )}
                </div>

                <div className="text-sm sm:text-base font-black text-slate-900 mt-1 flex items-baseline gap-2">
                  <span>
                    {preparedCount} of {totalCount} Prepared
                  </span>
                  <span className="text-xs font-normal text-slate-500">
                    ({progressPercentage}% completed)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleCheckAll}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Mark All Ready
                </button>
                <button
                  type="button"
                  onClick={handleResetChecklist}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Reset prepared documents checklist"
                  aria-label="Reset checklist"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    progressPercentage === 100
                      ? "bg-emerald-600"
                      : isAllMandatoryReady
                      ? "bg-blue-600"
                      : "bg-brand-600"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Mandatory: <strong>{preparedMandatoryCount}</strong> of{" "}
                  <strong>{mandatoryDocs.length}</strong> ready
                </span>
                <span>
                  Optional / As Applicable:{" "}
                  <strong>
                    {preparedCount - preparedMandatoryCount} of {optionalDocs.length}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              4. CATEGORY FILTER TABS (When Multiple Categories Present)
              ───────────────────────────────────────────────────────── */}
          {availableCategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Documents ({totalCount})
              </button>

              {availableCategories.map((catKey) => {
                const meta = DOCUMENT_CATEGORIES_META[catKey] || DOCUMENT_CATEGORIES_META.other;
                const count = rawDocuments.filter(
                  (d) => (d.type || "other") === catKey
                ).length;
                const isSelected = selectedCategory === catKey;
                const CatIcon = meta.icon;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    <span>{meta.label.split(" (")[0]}</span>
                    <span className="opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              5. CHECKLIST DOCUMENT CARDS
              ───────────────────────────────────────────────────────── */}
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const isChecked = Boolean(preparedDocs[doc.id]);
              const docTypeKey = doc.type || "other";
              const meta =
                DOCUMENT_CATEGORIES_META[docTypeKey] || DOCUMENT_CATEGORIES_META.other;
              const DocIcon = meta.icon;

              return (
                <div
                  key={doc.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isChecked
                      ? "bg-emerald-50/50 border-emerald-200/90 shadow-2xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Interactive Checkbox Control */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggleDoc(doc.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-0.5 transition-all cursor-pointer shrink-0 ${
                        isChecked
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs scale-105"
                          : "bg-white border-slate-300 hover:border-brand-500 text-transparent"
                      }`}
                      title={isChecked ? "Mark as not prepared" : "Mark as prepared"}
                      aria-label={`Toggle preparation status for ${doc.name}`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    {/* Document Details Body */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Badges: Category & Mandatory Status */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${meta.badgeClass}`}
                          >
                            <DocIcon className="w-3 h-3" />
                            <span>{meta.label.split(" (")[0]}</span>
                          </span>

                          {doc.isMandatory ? (
                            <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                              Optional / As Applicable
                            </span>
                          )}

                          {doc.acceptableFormats && doc.acceptableFormats.length > 0 && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                              {doc.acceptableFormats.join(", ")}
                            </span>
                          )}
                        </div>

                        {/* Readiness Tag Indicator */}
                        <span
                          className={`text-[11px] font-bold ${
                            isChecked ? "text-emerald-700" : "text-slate-400"
                          }`}
                        >
                          {isChecked ? "✓ Prepared & Ready" : "Pending Preparation"}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4
                          className={`text-sm sm:text-base font-bold leading-snug ${
                            isChecked
                              ? "text-emerald-950 line-through decoration-emerald-500/70"
                              : "text-slate-900"
                          }`}
                        >
                          {doc.name}
                        </h4>

                        {doc.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {doc.description}
                          </p>
                        )}
                      </div>

                      {/* Issuing Authority & Validity Footer */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        {doc.issuingAuthority && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              Issuing Authority:{" "}
                              <strong className="text-slate-700 font-semibold">
                                {doc.issuingAuthority}
                              </strong>
                            </span>
                          </div>
                        )}

                        {doc.validityPeriodMonths && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              Validity:{" "}
                              <strong className="text-slate-700 font-semibold">
                                {doc.validityPeriodMonths} months
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────
              6. OFFICIAL SOURCE PRIVACY & FRAUD SAFETY NOTICE
              ───────────────────────────────────────────────────────── */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Submission Safety Guidelines:</span>
            </div>
            <p className="text-amber-900/90 leading-relaxed">
              OpportunityX-AI is a public transparency engine and{" "}
              <strong>never asks you to upload confidential documents</strong>, Aadhaar
              passwords, or pay processing fees. Prepare self-attested digital copies
              offline and upload them exclusively through the authorized sovereign portal:
            </p>
            {portalUrl && (
              <div className="pt-1">
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  <span>Proceed to {portalTitle}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
