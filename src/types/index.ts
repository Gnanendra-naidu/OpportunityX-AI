/**
 * OpportunityX-AI: Data Model Definitions
 * 
 * Comprehensive TypeScript types and interfaces for scholarships,
 * government welfare schemes, eligibility criteria, official verification,
 * user profiles, and saved opportunities.
 */

// ==========================================
// 1. Core Enumerations & Supporting Types
// ==========================================

export type LifeStageKey =
  | "newborns_infants"
  | "children"
  | "newborns_children" // legacy compatibility
  | "school_students"
  | "college_students"
  | "graduates"
  | "job_seekers"
  | "women"
  | "farmers"
  | "entrepreneurs"
  | "families"
  | "people_with_disabilities"
  | "senior_citizens";

export type OpportunityType =
  | "scholarship"
  | "scheme"
  | "fellowship"
  | "skill_training"
  | "grant"
  | "subsidy";

export type ProviderType =
  | "central_gov"
  | "state_gov"
  | "private_trust"
  | "ngo"
  | "international";

export type VerificationStatus =
  | "verified"
  | "under_review"
  | "source_updated"
  | "unverified";

export type ApplicationMethod =
  | "online_portal"
  | "offline_form"
  | "nodal_agency"
  | "institution_submission";

export type DisbursementMethod =
  | "direct_benefit_transfer"
  | "tuition_fee_waiver"
  | "subsidized_loan"
  | "direct_stipend";

export type SocialCategory = "all" | "General" | "OBC" | "SC" | "ST" | "EWS";

export type GenderEligibility = "all" | "male" | "female" | "transgender";

// ==========================================
// 2. Official Source & Verification
// ==========================================

export interface OfficialSource {
  portalName: string;
  departmentOrMinistry: string;
  domain: string; // e.g. "scholarships.gov.in"
  url: string;
  isGovernmentDomain: boolean; // true for .gov.in, .nic.in
  guidelinesPdfUrl?: string;
  helplinePhone?: string;
  helplineEmail?: string;
  nodalOfficerDesignation?: string;
}

// ==========================================
// 3. Deadline Information
// ==========================================

export interface Deadline {
  type: "fixed_date" | "rolling_annual" | "multiple_cycles" | "year_round";
  closingDate?: string; // ISO date string YYYY-MM-DD
  cycleName?: string; // e.g. "AY 2026-27 Demo Cycle"
  isTentative: boolean; // Indicates cycle dates may vary by state or notification
  academicYear?: string;
  timezone?: string;
  notes?: string;
}

// ==========================================
// 4. Required Documents
// ==========================================

export interface RequiredDocument {
  id: string;
  name: string;
  type:
    | "identity"
    | "income"
    | "caste"
    | "academic"
    | "domicile"
    | "disability"
    | "bank"
    | "land_record"
    | "other";
  isMandatory: boolean;
  issuingAuthority?: string;
  description?: string;
  validityPeriodMonths?: number;
  acceptableFormats?: string[];
}

export type OpportunityDocument = RequiredDocument;

// ==========================================
// 5. Granular Eligibility Sub-Models
// ==========================================

export interface IncomeCriteria {
  isRestricted: boolean;
  maxAnnualIncome?: number; // In INR
  currency: string;
  incomeCertificateRequired: boolean;
  notes?: string;
}

export interface DisabilityEligibility {
  applicable: boolean;
  isExclusiveForDisability: boolean;
  minDisabilityPercentage?: number;
  acceptedDisabilityTypes?: string[];
  udidCardRequired?: boolean;
}

export interface AgeRange {
  minAge?: number;
  maxAge?: number;
  asOfDate?: string;
}

export interface ResidencyRequirements {
  domicileRequired: boolean;
  eligibleStates: string[]; // ["All India (Central)"] or list of states
  eligibleDistricts?: string[];
  ruralOnly?: boolean;
}

export interface EducationRequirements {
  minEducationLevel?: string;
  eligibleCourses?: string[];
  minAcademicPercentage?: number;
  institutionTypeAllowed?: string[];
}

export interface EligibilityCriteria {
  lifeStages: LifeStageKey[];
  genderEligibility: GenderEligibility[];
  categoryEligibility: SocialCategory[];
  incomeCriteria: IncomeCriteria;
  disabilityEligibility: DisabilityEligibility;
  ageRange?: AgeRange;
  residencyRequirements: ResidencyRequirements;
  educationRequirements?: EducationRequirements;
  criteriaSummaryBullets: string[];
  preScreeningCaveat: string;
}

// ==========================================
// 6. Application Information
// ==========================================

export interface ApplicationInformation {
  method: ApplicationMethod;
  applicationUrl: string;
  applicationFee: number; // 0 for government schemes
  selectionProcess: string;
  disbursementType: DisbursementMethod;
  stepByStepGuide?: string[];
}

// ==========================================
// 7. Base Opportunity Model
// ==========================================

export interface Opportunity {
  id: string;
  slug?: string;
  title: string;
  description: string;
  type: OpportunityType;
  category: string;
  provider: string; // Nodal authority or foundation
  state: string; // "All India (Central)" or specific State
  country: string; // "India"
  lifeStages: LifeStageKey[];
  educationLevels: string[];
  genderEligibility: GenderEligibility[];
  incomeCriteria: IncomeCriteria;
  categoryEligibility: SocialCategory[];
  disabilityEligibility: DisabilityEligibility;
  ageRange?: AgeRange;
  residencyRequirements: ResidencyRequirements;
  educationRequirements?: EducationRequirements;
  benefits: string; // Detailed description of awards/benefits
  amount: string; // Human-readable e.g. "₹50,000 / year"
  amountNumeric?: number;
  documents: RequiredDocument[];
  applicationStartDate?: string;
  applicationDeadline: Deadline;
  applicationMethod: ApplicationMethod;
  applicationInfo?: ApplicationInformation;
  officialWebsite: string;
  officialSource: OfficialSource;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
  isDemoData: boolean; // DEMO flag: explicitly marks non-production sample data
  demoDisclaimer?: string;

  // Convenience aliases ensuring seamless backward-compatibility with UI
  providerName: string;
  providerType: ProviderType;
  stateJurisdiction: string;
  financialAmount: string;
  benefitsSummary: string;
  deadlineDate: string;
  isYearRound?: boolean;
  officialPortalUrl: string;
  applicationUrl: string;
  isVerified: boolean;
  verifiedAt: string;
  targetLifeStages: LifeStageKey[];
  eligibleGenders: GenderEligibility[];
  casteCategories: SocialCategory[];
  maxFamilyIncome?: number;
  minAcademicPercentage?: number;
  minEducationLevel?: string;
  disabilityEligibleOnly?: boolean;
  tags: string[];
  eligibilityBullets: string[];
}

// ==========================================
// 8. Specialized Scholarship Model
// ==========================================

export interface Scholarship extends Opportunity {
  type: "scholarship" | "fellowship" | "grant";
  scholarshipType:
    | "merit"
    | "merit_cum_means"
    | "post_matric"
    | "pre_matric"
    | "doctoral_fellowship"
    | "higher_education_grant";
  stipendFrequency?: "monthly" | "annual" | "one_time";
  renewalRequirements?: string[];
  reservedSeatQuota?: string;
  hostelSubsidyIncluded?: boolean;
}

// ==========================================
// 9. Specialized Government Scheme Model
// ==========================================

export interface GovernmentScheme extends Opportunity {
  type: "scheme" | "skill_training" | "subsidy";
  schemeType:
    | "central_sector"
    | "centrally_sponsored"
    | "state_welfare"
    | "dbt_income_support"
    | "credit_linked_subsidy";
  implementingDepartment: string;
  targetBeneficiaryGroup: string;
  subsidyRatePercent?: number;
  isDirectBenefitTransfer: boolean;
  pfmsIntegrated?: boolean;
}

// ==========================================
// 10. User Profile Model
// ==========================================

export interface UserProfile {
  id: string;
  name: string; // Required field
  fullName?: string; // Backward compatibility alias
  email: string;
  phone?: string;
  age: number; // Required field
  state: string; // Required field
  educationLevel: string; // Required field
  lifeStage: LifeStageKey; // Required field
  incomeRange: string; // Required field e.g. "Below ₹2.5 Lakh", "₹2.5L - ₹8L", "Above ₹8 Lakh"
  annualFamilyIncome?: number; // Numeric equivalent
  category: "General" | "OBC" | "SC" | "ST" | "EWS"; // Required field
  casteCategory?: "General" | "OBC" | "SC" | "ST" | "EWS"; // Alias
  disabilityStatus: boolean; // Required field
  isDisabled?: boolean; // Alias
  preferredOpportunityTypes: string[]; // Required field e.g. ["scholarship", "scheme", "skill_training", "fellowship", "grant"]
  dateOfBirth?: string;
  gender?: "male" | "female" | "transgender" | "other";
  district?: string;
  courseStream?: string;
  academicPercentage?: number;
  occupation?: string;
  isMinority?: boolean;
  savedOpportunityIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// 11. Saved Opportunity Model
// ==========================================

export interface SavedOpportunity {
  id: string;
  userId: string;
  opportunityId: string;
  status:
    | "bookmarked"
    | "preparing_documents"
    | "applied"
    | "awarded"
    | "rejected";
  userNotes?: string;
  reminderEnabled: boolean;
  targetDeadlineDate?: string;
  documentsPreparedIds?: string[];
  savedAt: string;
  updatedAt: string;
}

// ==========================================
// 12. UI Helper Types
// ==========================================

export interface LifeStageInfo {
  key: LifeStageKey;
  title: string;
  subtitle: string;
  ageRange: string;
  description: string;
  iconName: string;
  accentColor: string;
  tags: string[];
  relevantCategories?: string[];
  eligibilityDisclaimer?: string;
}

export interface FilterState {
  searchQuery: string;
  lifeStage: string;
  type: string;
  state: string;
  casteCategory: string;
  gender: string;
  maxIncome: string;
}
