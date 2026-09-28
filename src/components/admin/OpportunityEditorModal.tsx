"use client";

import React, { useState, useEffect } from "react";
import {
  Opportunity,
  OpportunityType,
  ProviderType,
  VerificationStatus,
  LifeStageKey,
  SocialCategory,
  GenderEligibility,
  RequiredDocument,
} from "@/types";
import {
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  Calendar,
  ShieldCheck,
  Building,
  UserCheck,
  Award,
  Globe,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  validateOpportunityData,
  saveOpportunityRecord,
  OpportunityValidationError,
} from "@/lib/admin/opportunityManager";

interface OpportunityEditorModalProps {
  opportunity?: Opportunity | null;
  onClose: () => void;
  onSaved: (savedOpp: Opportunity) => void;
}

const ALL_LIFE_STAGES: { key: LifeStageKey; label: string }[] = [
  { key: "newborns_infants", label: "Newborn & Infants" },
  { key: "children", label: "Children" },
  { key: "school_students", label: "School Students" },
  { key: "college_students", label: "College Students" },
  { key: "graduates", label: "Graduates" },
  { key: "job_seekers", label: "Job Seekers" },
  { key: "women", label: "Women" },
  { key: "farmers", label: "Farmers" },
  { key: "entrepreneurs", label: "Entrepreneurs" },
  { key: "families", label: "Families" },
  { key: "people_with_disabilities", label: "Persons with Disabilities" },
  { key: "senior_citizens", label: "Senior Citizens" },
];

const ALL_SOCIAL_CATEGORIES: SocialCategory[] = [
  "all",
  "General",
  "OBC",
  "SC",
  "ST",
  "EWS",
];

const ALL_GENDERS: { key: GenderEligibility; label: string }[] = [
  { key: "all", label: "All Genders" },
  { key: "female", label: "Female Only" },
  { key: "male", label: "Male Only" },
  { key: "transgender", label: "Transgender" },
];

const ALL_STATES: string[] = [
  "All India (Central)",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi (NCT)",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

const DOCUMENT_TYPES: { key: RequiredDocument["type"]; label: string }[] = [
  { key: "identity", label: "Identity Document (Aadhaar / Voter ID)" },
  { key: "academic", label: "Education Marksheet / Certificate" },
  { key: "income", label: "Income Certificate (Tehsildar / Revenue)" },
  { key: "domicile", label: "Residence / Domicile Certificate" },
  { key: "caste", label: "Category / Caste Certificate (SC/ST/OBC/EWS)" },
  { key: "disability", label: "Disability Certificate / UDID Card" },
  { key: "bank", label: "Bank Passbook / Cancelled Cheque (DBT)" },
  { key: "land_record", label: "Land Ownership Record (RoR / Khasra)" },
  { key: "other", label: "Other Supporting Document" },
];

export const OpportunityEditorModal: React.FC<OpportunityEditorModalProps> = ({
  opportunity,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(opportunity?.id);

  // Active section tab in editor
  const [activeTab, setActiveTab] = useState<
    "basics" | "eligibility" | "official_source" | "deadline" | "documents"
  >("basics");

  // Form State
  const [formData, setFormData] = useState<Opportunity>(() => {
    if (opportunity) {
      return { ...opportunity };
    }
    const defaultId = `opp-demo-${Date.now().toString(36)}`;
    return {
      id: defaultId,
      slug: defaultId,
      title: "",
      description: "",
      type: "scholarship",
      category: "Higher Education",
      provider: "",
      providerName: "",
      providerType: "central_gov",
      state: "All India (Central)",
      stateJurisdiction: "All India (Central)",
      country: "India",
      benefits: "",
      benefitsSummary: "",
      amount: "₹50,000 / year",
      amountNumeric: 50000,
      financialAmount: "₹50,000 / year",
      lifeStages: ["college_students"],
      targetLifeStages: ["college_students"],
      educationLevels: ["Undergraduate"],
      genderEligibility: ["all"],
      eligibleGenders: ["all"],
      categoryEligibility: ["all"],
      casteCategories: ["all"],
      incomeCriteria: {
        isRestricted: true,
        maxAnnualIncome: 250000,
        currency: "INR",
        incomeCertificateRequired: true,
        notes: "Family annual income from all sources must not exceed ₹2.5 Lakhs.",
      },
      disabilityEligibility: {
        applicable: true,
        isExclusiveForDisability: false,
        minDisabilityPercentage: 40,
        udidCardRequired: false,
      },
      ageRange: {
        minAge: 17,
        maxAge: 25,
      },
      residencyRequirements: {
        domicileRequired: false,
        eligibleStates: ["All India (Central)"],
      },
      applicationStartDate: new Date().toISOString().split("T")[0],
      deadlineDate: "2026-11-30",
      isYearRound: false,
      applicationDeadline: {
        type: "fixed_date",
        closingDate: "2026-11-30",
        cycleName: "AY 2026-27 Demo Cycle",
        academicYear: "2026-2027",
        isTentative: false,
      },
      applicationMethod: "online_portal",
      officialWebsite: "https://scholarships.gov.in",
      officialPortalUrl: "https://scholarships.gov.in",
      applicationUrl: "https://scholarships.gov.in",
      officialSource: {
        portalName: "National Scholarship Portal (NSP)",
        departmentOrMinistry: "Ministry of Education / Govt of India",
        domain: "scholarships.gov.in",
        url: "https://scholarships.gov.in",
        isGovernmentDomain: true,
      },
      verificationStatus: "verified",
      isVerified: true,
      lastVerifiedAt: new Date().toISOString().split("T")[0],
      verifiedAt: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemoData: true,
      demoDisclaimer:
        "DEMO SCHEME RECORD: Registered via OpportunityX-AI Administrative Demo Console.",
      tags: ["scholarship", "higher_education", "merit_cum_means"],
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name: "Aadhaar Card (Linked to Active Bank DBT)",
          type: "identity",
          isMandatory: true,
          issuingAuthority: "UIDAI",
          description: "Proof of individual identity and DBT grant transfer.",
        },
        {
          id: `doc-${Date.now()}-2`,
          name: "Annual Family Income Certificate",
          type: "income",
          isMandatory: true,
          issuingAuthority: "Tehsildar / Sub-Divisional Magistrate",
          description: "Certified income certificate for current financial year.",
        },
        {
          id: `doc-${Date.now()}-3`,
          name: "Previous Class Qualifying Marksheet",
          type: "academic",
          isMandatory: true,
          issuingAuthority: "State / Central Examination Board",
          description: "Proof of academic eligibility and marks threshold.",
        },
      ],
      eligibilityBullets: [
        "Applicants must meet citizenship and age eligibility requirements.",
        "Annual family income must be within the specified scheme thresholds.",
        "Official documentation must be submitted on the sovereign government portal.",
      ],
    };
  });

  // Errors state
  const [validationErrors, setValidationErrors] = useState<OpportunityValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Sync title and slug
  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }));
  };

  // Toggle Life Stage
  const toggleLifeStage = (stage: LifeStageKey) => {
    setFormData((prev) => {
      const exists = prev.lifeStages.includes(stage);
      const updated = exists
        ? prev.lifeStages.filter((s) => s !== stage)
        : [...prev.lifeStages, stage];
      return {
        ...prev,
        lifeStages: updated,
        targetLifeStages: updated,
      };
    });
  };

  // Toggle Social Category
  const toggleSocialCategory = (cat: SocialCategory) => {
    setFormData((prev) => {
      if (cat === "all") {
        return {
          ...prev,
          categoryEligibility: ["all"],
          casteCategories: ["all"],
        };
      }
      const current = prev.categoryEligibility.filter((c) => c !== "all");
      const exists = current.includes(cat);
      const updated = exists ? current.filter((c) => c !== cat) : [...current, cat];
      const finalCats = updated.length === 0 ? ["all" as SocialCategory] : updated;
      return {
        ...prev,
        categoryEligibility: finalCats,
        casteCategories: finalCats,
      };
    });
  };

  // Toggle Gender
  const toggleGender = (g: GenderEligibility) => {
    setFormData((prev) => {
      if (g === "all") {
        return {
          ...prev,
          genderEligibility: ["all"],
          eligibleGenders: ["all"],
        };
      }
      const current = prev.genderEligibility.filter((x) => x !== "all");
      const exists = current.includes(g);
      const updated = exists ? current.filter((x) => x !== g) : [...current, g];
      const finalGenders = updated.length === 0 ? ["all" as GenderEligibility] : updated;
      return {
        ...prev,
        genderEligibility: finalGenders,
        eligibleGenders: finalGenders,
      };
    });
  };

  // Document management
  const addDocument = () => {
    const newDoc: RequiredDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: "",
      type: "identity",
      isMandatory: true,
      issuingAuthority: "",
      description: "",
      acceptableFormats: ["PDF", "JPG"],
    };
    setFormData((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), newDoc],
    }));
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => {
      const docs = [...(prev.documents || [])];
      docs.splice(index, 1);
      return { ...prev, documents: docs };
    });
  };

  const updateDocumentField = (index: number, field: keyof RequiredDocument, val: any) => {
    setFormData((prev) => {
      const docs = [...(prev.documents || [])];
      docs[index] = { ...docs[index], [field]: val };
      return { ...prev, documents: docs };
    });
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Sync financialAmount and providerName aliases
    const prepared: Opportunity = {
      ...formData,
      providerName: formData.provider,
      financialAmount: formData.amount,
      stateJurisdiction: formData.state,
      deadlineDate: formData.isYearRound ? "Open Year-Round" : formData.applicationDeadline?.closingDate || formData.deadlineDate,
      officialPortalUrl: formData.officialWebsite,
      applicationUrl: formData.officialWebsite,
      isVerified: formData.verificationStatus === "verified",
      officialSource: {
        ...formData.officialSource,
        url: formData.officialWebsite,
        portalName: formData.officialSource?.portalName || formData.provider,
        domain: formData.officialSource?.domain || (formData.officialWebsite.replace(/https?:\/\//, "").split("/")[0]),
      },
    };

    // Client validation
    const validation = validateOpportunityData(prepared);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      // Switch to relevant tab if possible
      const firstErr = validation.errors[0]?.field;
      if (firstErr?.includes("officialSource") || firstErr?.includes("officialWebsite")) {
        setActiveTab("official_source");
      } else if (firstErr?.includes("applicationDeadline") || firstErr?.includes("deadline")) {
        setActiveTab("deadline");
      } else if (firstErr?.includes("lifeStages") || firstErr?.includes("income") || firstErr?.includes("gender")) {
        setActiveTab("eligibility");
      } else if (firstErr?.includes("documents")) {
        setActiveTab("documents");
      } else {
        setActiveTab("basics");
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveOpportunityRecord(prepared, isEditing);
      if (res.success && res.data) {
        onSaved(res.data);
      } else {
        setGeneralError(res.error || "Failed to save opportunity record.");
      }
    } catch (err: any) {
      setGeneralError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black">
              ⚡
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {isEditing ? "Edit Opportunity Record" : "Add New Opportunity Record"}
              </h2>
              <p className="text-xs text-slate-400">
                Hackathon Demo Sandbox Management Console
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Validation Banner */}
        {validationErrors.length > 0 && (
          <div className="p-3.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Please resolve {validationErrors.length} validation error(s) before saving:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-rose-700 pl-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>
                  <strong className="font-semibold">{err.field}:</strong> {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {generalError && (
          <div className="p-3.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto gap-2 text-xs font-semibold py-2">
          <button
            type="button"
            onClick={() => setActiveTab("basics")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "basics"
                ? "bg-brand-600 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            1. Overview & Basics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("eligibility")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "eligibility"
                ? "bg-brand-600 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            2. Eligibility Criteria
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("official_source")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "official_source"
                ? "bg-brand-600 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            3. Official Source
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("deadline")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "deadline"
                ? "bg-brand-600 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            4. Deadline & Cycle
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "documents"
                ? "bg-brand-600 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            5. Required Documents ({formData.documents?.length || 0})
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASICS */}
          {activeTab === "basics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. National Overseas Scholarship Scheme 2026"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Opportunity ID / Slug
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value, slug: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the opportunity, objectives, and scope..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Opportunity Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as OpportunityType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  >
                    <option value="scholarship">Scholarship</option>
                    <option value="scheme">Government Welfare Scheme</option>
                    <option value="fellowship">Fellowship</option>
                    <option value="skill_training">Skill Training</option>
                    <option value="grant">Grant</option>
                    <option value="subsidy">Subsidy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Higher Education, Agriculture"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Verification Status *
                  </label>
                  <select
                    value={formData.verificationStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        verificationStatus: e.target.value as VerificationStatus,
                        isVerified: e.target.value === "verified",
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  >
                    <option value="verified">✅ Verified Sovereign Record</option>
                    <option value="under_review">⚠️ Needs Verification (Under Review)</option>
                    <option value="unverified">🧪 Unverified / Demo Prototype</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nodal Authority / Provider *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value, providerName: e.target.value })}
                    placeholder="e.g. Ministry of Social Justice"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Provider Type *
                  </label>
                  <select
                    value={formData.providerType}
                    onChange={(e) => setFormData({ ...formData, providerType: e.target.value as ProviderType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  >
                    <option value="central_gov">Central Government Ministry</option>
                    <option value="state_gov">State Government Department</option>
                    <option value="ngo">NGO / Foundation</option>
                    <option value="private_trust">Private Trust / CSR</option>
                    <option value="international">International Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State Jurisdiction *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value, stateJurisdiction: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  >
                    {ALL_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Financial Benefit / Grant Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value, financialAmount: e.target.value })}
                    placeholder="e.g. ₹50,000 / year or 100% Tuition Waiver"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Numeric Value (for sorting in INR)
                  </label>
                  <input
                    type="number"
                    value={formData.amountNumeric || ""}
                    onChange={(e) => setFormData({ ...formData, amountNumeric: Number(e.target.value) || 0 })}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Benefits Details
                </label>
                <textarea
                  rows={2}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value, benefitsSummary: e.target.value })}
                  placeholder="Detailed breakdown of awards, allowances, equipment support..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Demo Flags */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Mark as Hackathon Demo / Prototype Record
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Flag indicates record is for hackathon simulation and test evaluation.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isDemoData}
                  onChange={(e) => setFormData({ ...formData, isDemoData: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ELIGIBILITY CRITERIA */}
          {activeTab === "eligibility" && (
            <div className="space-y-5">
              {/* 1. Life Stages */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Eligible Life Stages * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_LIFE_STAGES.map((ls) => {
                    const isChecked = formData.lifeStages.includes(ls.key);
                    return (
                      <button
                        type="button"
                        key={ls.key}
                        onClick={() => toggleLifeStage(ls.key)}
                        className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? "bg-brand-50 border-brand-300 text-brand-800 font-bold"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{ls.label}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Social Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category / Caste Eligibility *
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SOCIAL_CATEGORIES.map((cat) => {
                    const isChecked = formData.categoryEligibility.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleSocialCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                          isChecked
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {cat === "all" ? "All Categories" : cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gender Eligibility *
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENDERS.map((g) => {
                    const isChecked = formData.genderEligibility.includes(g.key);
                    return (
                      <button
                        type="button"
                        key={g.key}
                        onClick={() => toggleGender(g.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                          isChecked
                            ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Income Criteria */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Income Restriction & Certificate Requirement
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.incomeCriteria?.isRestricted}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incomeCriteria: {
                            ...formData.incomeCriteria,
                            isRestricted: e.target.checked,
                            currency: "INR",
                            incomeCertificateRequired: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                    <span>Income Cap Applicable</span>
                  </label>
                </div>

                {formData.incomeCriteria?.isRestricted && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Max Annual Family Income (INR) *
                      </label>
                      <input
                        type="number"
                        value={formData.incomeCriteria?.maxAnnualIncome || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            incomeCriteria: {
                              ...formData.incomeCriteria,
                              maxAnnualIncome: Number(e.target.value),
                            },
                          })
                        }
                        placeholder="e.g. 250000"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Income Guideline Notes
                      </label>
                      <input
                        type="text"
                        value={formData.incomeCriteria?.notes || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            incomeCriteria: {
                              ...formData.incomeCriteria,
                              notes: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Current FY Tehsildar certificate required"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Age Range */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Min Age
                  </label>
                  <input
                    type="number"
                    value={formData.ageRange?.minAge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ageRange: {
                          ...formData.ageRange,
                          minAge: Number(e.target.value) || undefined,
                        },
                      })
                    }
                    placeholder="e.g. 17"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Age
                  </label>
                  <input
                    type="number"
                    value={formData.ageRange?.maxAge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ageRange: {
                          ...formData.ageRange,
                          maxAge: Number(e.target.value) || undefined,
                        },
                      })
                    }
                    placeholder="e.g. 25"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Education Level
                  </label>
                  <input
                    type="text"
                    value={formData.educationLevels?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        educationLevels: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. Class 12 Passed, Undergraduate"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* 6. Disability Criteria */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Persons with Disabilities (PwD) Criteria
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.disabilityEligibility?.isExclusiveForDisability}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          disabilityEligibility: {
                            ...formData.disabilityEligibility,
                            isExclusiveForDisability: e.target.checked,
                            applicable: true,
                          },
                        })
                      }
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                    <span>Exclusive for PwD Only</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL SOURCE */}
          {activeTab === "official_source" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <strong>Anti-Hallucination Source Rule:</strong> Every opportunity record must link to an official nodal department or ministry website. Do not invent links.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Portal / Application URL *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={formData.officialWebsite}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        officialWebsite: e.target.value,
                        officialPortalUrl: e.target.value,
                        applicationUrl: e.target.value,
                      })
                    }
                    placeholder="https://scholarships.gov.in"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Portal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.officialSource?.portalName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        officialSource: {
                          ...formData.officialSource,
                          portalName: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. National Scholarship Portal"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department or Ministry
                  </label>
                  <input
                    type="text"
                    value={formData.officialSource?.departmentOrMinistry || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        officialSource: {
                          ...formData.officialSource,
                          departmentOrMinistry: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Ministry of Minority Affairs"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Domain (e.g. scholarships.gov.in)
                  </label>
                  <input
                    type="text"
                    value={formData.officialSource?.domain || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        officialSource: {
                          ...formData.officialSource,
                          domain: e.target.value,
                        },
                      })
                    }
                    placeholder="scholarships.gov.in"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.officialSource?.isGovernmentDomain}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          officialSource: {
                            ...formData.officialSource,
                            isGovernmentDomain: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Official Sovereign Domain (.gov.in / .nic.in / .edu.in)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEADLINE & CYCLE */}
          {activeTab === "deadline" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Is Open Year-Round / Rolling Intake?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Welfare schemes and institutional grants that remain perpetually active.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isYearRound}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isYearRound: e.target.checked,
                      deadlineDate: e.target.checked ? "Open Year-Round" : formData.deadlineDate,
                    })
                  }
                  className="w-4 h-4 text-brand-600 rounded"
                />
              </div>

              {!formData.isYearRound && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Application Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.applicationStartDate || ""}
                      onChange={(e) => setFormData({ ...formData, applicationStartDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Application Closing Date *
                    </label>
                    <input
                      type="date"
                      required={!formData.isYearRound}
                      value={formData.applicationDeadline?.closingDate || formData.deadlineDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deadlineDate: e.target.value,
                          applicationDeadline: {
                            ...formData.applicationDeadline,
                            closingDate: e.target.value,
                            type: "fixed_date",
                            isTentative: formData.applicationDeadline?.isTentative || false,
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Intake Cycle Name
                  </label>
                  <input
                    type="text"
                    value={formData.applicationDeadline?.cycleName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicationDeadline: {
                          ...formData.applicationDeadline,
                          cycleName: e.target.value,
                          isTentative: formData.applicationDeadline?.isTentative || false,
                          type: formData.applicationDeadline?.type || "fixed_date",
                        },
                      })
                    }
                    placeholder="e.g. AY 2026-27 National Cycle"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={formData.applicationDeadline?.academicYear || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicationDeadline: {
                          ...formData.applicationDeadline,
                          academicYear: e.target.value,
                          isTentative: formData.applicationDeadline?.isTentative || false,
                          type: formData.applicationDeadline?.type || "fixed_date",
                        },
                      })
                    }
                    placeholder="e.g. 2026-2027"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REQUIRED DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Required Verification Documents List
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add certificates that are officially required for this opportunity.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addDocument}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Document</span>
                </button>
              </div>

              {formData.documents?.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500">
                    No documents currently registered for this opportunity.
                  </p>
                  <button
                    type="button"
                    onClick={addDocument}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    + Add First Document
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.documents?.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeDocument(idx)}
                        className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pr-8">
                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Document Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={doc.name}
                            onChange={(e) => updateDocumentField(idx, "name", e.target.value)}
                            placeholder="e.g. Annual Family Income Certificate"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Document Type *
                          </label>
                          <select
                            value={doc.type}
                            onChange={(e) => updateDocumentField(idx, "type", e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-semibold"
                          >
                            {DOCUMENT_TYPES.map((dt) => (
                              <option key={dt.key} value={dt.key}>
                                {dt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Issuing Authority
                          </label>
                          <input
                            type="text"
                            value={doc.issuingAuthority || ""}
                            onChange={(e) => updateDocumentField(idx, "issuingAuthority", e.target.value)}
                            placeholder="e.g. Tehsildar / District Revenue Office"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Description / Instructions
                          </label>
                          <input
                            type="text"
                            value={doc.description || ""}
                            onChange={(e) => updateDocumentField(idx, "description", e.target.value)}
                            placeholder="e.g. Must be issued for current financial year"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1 border-t border-slate-200/60">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.isMandatory}
                            onChange={(e) => updateDocumentField(idx, "isMandatory", e.target.checked)}
                            className="w-3.5 h-3.5 text-rose-600 rounded"
                          />
                          <span>Mandatory Document (Application rejected if missing)</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving Opportunity..." : isEditing ? "Save Opportunity Changes" : "Create Opportunity"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
