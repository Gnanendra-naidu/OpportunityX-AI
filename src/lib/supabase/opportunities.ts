import { getSupabaseClient, isSupabaseConfigured } from "./client";
import { JoinedOpportunityRow, DbRequiredDocumentRow, DbEligibilityCriteriaRow, DbOpportunityDeadlineRow, DbOfficialSourceRow } from "./types";
import { Opportunity, LifeStageKey, OpportunityType, ProviderType, VerificationStatus, ApplicationMethod, SocialCategory, GenderEligibility, RequiredDocument } from "@/types";
import { MOCK_OPPORTUNITIES } from "@/data/mockOpportunities";
import { getAdminLocalOpportunities } from "@/lib/admin/opportunityManager";

export interface FetchOpportunitiesOptions {
  type?: string;
  state?: string;
  category?: string;
  lifeStage?: string;
  verificationStatus?: string;
  searchQuery?: string;
}

export interface FetchResult {
  opportunities: Opportunity[];
  source: "supabase" | "local_fallback";
  totalCount: number;
  errorMessage?: string;
}

/**
 * Transforms a joined database row into the rich frontend Opportunity object
 */
export function mapDbRowToOpportunity(row: JoinedOpportunityRow): Opportunity {
  // Normalize 1-to-1 relations that might be returned as an array or object
  const eligibility: DbEligibilityCriteriaRow | undefined = Array.isArray(row.eligibility_criteria)
    ? row.eligibility_criteria[0]
    : row.eligibility_criteria || undefined;

  const deadline: DbOpportunityDeadlineRow | undefined = Array.isArray(row.opportunity_deadlines)
    ? row.opportunity_deadlines[0]
    : row.opportunity_deadlines || undefined;

  const source: DbOfficialSourceRow | undefined = Array.isArray(row.official_sources)
    ? row.official_sources[0]
    : row.official_sources || undefined;

  const docsList: DbRequiredDocumentRow[] = Array.isArray(row.required_documents)
    ? row.required_documents
    : [];

  const mappedDocs: RequiredDocument[] = docsList.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.document_type as any,
    isMandatory: d.is_mandatory,
    issuingAuthority: d.issuing_authority || undefined,
    description: d.description || undefined,
    acceptableFormats: d.acceptable_formats || ["PDF"],
  }));

  const lifeStages = (eligibility?.life_stages || []) as LifeStageKey[];
  const genderEligibility = (eligibility?.gender_eligibility || ["all"]) as GenderEligibility[];
  const categoryEligibility = (eligibility?.category_eligibility || ["all"]) as SocialCategory[];

  const deadlineDate = row.application_deadline_date || deadline?.closing_date || "";

  return {
    id: row.id,
    slug: row.slug || undefined,
    title: row.title,
    description: row.description,
    type: row.type as OpportunityType,
    category: row.category,
    provider: row.provider,
    state: row.state,
    country: row.country || "India",
    lifeStages,
    educationLevels: eligibility?.min_education_level ? [eligibility.min_education_level] : [],
    genderEligibility,
    incomeCriteria: {
      isRestricted: eligibility?.is_income_restricted || false,
      maxAnnualIncome: eligibility?.max_annual_income || undefined,
      currency: eligibility?.income_currency || "INR",
      incomeCertificateRequired: eligibility?.income_certificate_required || false,
      notes: eligibility?.income_notes || undefined,
    },
    categoryEligibility,
    disabilityEligibility: {
      applicable: eligibility?.is_disability_applicable || false,
      isExclusiveForDisability: eligibility?.is_exclusive_for_disability || false,
      minDisabilityPercentage: eligibility?.min_disability_percentage || undefined,
      udidCardRequired: eligibility?.udid_card_required || false,
    },
    ageRange: {
      minAge: eligibility?.min_age || undefined,
      maxAge: eligibility?.max_age || undefined,
    },
    residencyRequirements: {
      domicileRequired: eligibility?.domicile_required || false,
      eligibleStates: eligibility?.eligible_states || [row.state],
    },
    educationRequirements: {
      minEducationLevel: eligibility?.min_education_level || undefined,
      minAcademicPercentage: eligibility?.min_academic_percentage || undefined,
    },
    benefits: row.benefits,
    amount: row.amount,
    amountNumeric: row.amount_numeric ? Number(row.amount_numeric) : undefined,
    documents: mappedDocs,
    applicationStartDate: row.application_start_date || undefined,
    applicationDeadline: {
      type: (deadline?.deadline_type || "fixed_date") as any,
      closingDate: deadline?.closing_date || row.application_deadline_date || undefined,
      cycleName: deadline?.cycle_name || undefined,
      isTentative: deadline?.is_tentative || false,
      academicYear: deadline?.academic_year || undefined,
      notes: deadline?.notes || undefined,
    },
    applicationMethod: row.application_method as ApplicationMethod,
    officialWebsite: row.official_website,
    officialSource: {
      portalName: source?.portal_name || row.provider,
      departmentOrMinistry: source?.department_or_ministry || row.provider,
      domain: source?.domain || new URL(row.official_website).hostname,
      url: source?.url || row.official_website,
      isGovernmentDomain: source?.is_government_domain ?? true,
      guidelinesPdfUrl: source?.guidelines_pdf_url || undefined,
      helplinePhone: source?.helpline_phone || undefined,
      helplineEmail: source?.helpline_email || undefined,
      nodalOfficerDesignation: source?.nodal_officer_designation || undefined,
    },
    verificationStatus: row.verification_status as VerificationStatus,
    lastVerifiedAt: row.last_verified_at || row.updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDemoData: row.is_demo_data,
    demoDisclaimer: row.demo_disclaimer || undefined,

    // UI compatibility aliases
    providerName: row.provider,
    providerType: row.provider_type as ProviderType,
    stateJurisdiction: row.state,
    financialAmount: row.amount,
    benefitsSummary: row.benefits,
    deadlineDate,
    isYearRound: row.is_year_round,
    officialPortalUrl: row.official_website,
    applicationUrl: source?.url || row.official_website,
    isVerified: row.verification_status === "verified",
    verifiedAt: row.last_verified_at || row.updated_at,
    targetLifeStages: lifeStages,
    eligibleGenders: genderEligibility,
    casteCategories: categoryEligibility,
    maxFamilyIncome: eligibility?.max_annual_income || undefined,
    minAcademicPercentage: eligibility?.min_academic_percentage || undefined,
    minEducationLevel: eligibility?.min_education_level || undefined,
    disabilityEligibleOnly: eligibility?.is_exclusive_for_disability || false,
    tags: row.tags || [],
    eligibilityBullets: eligibility?.criteria_summary_bullets || [],
  };
}

/**
 * Fetch opportunities from Supabase with relational joins,
 * falling back gracefully to MOCK_OPPORTUNITIES when Supabase is not reachable.
 */
export async function getOpportunities(
  options: FetchOpportunitiesOptions = {}
): Promise<FetchResult> {
  const supabase = getSupabaseClient();

  if (!supabase || !isSupabaseConfigured()) {
    return filterMockOpportunities(options, "Supabase environment not configured; using local verified dataset.");
  }

  try {
    let query = supabase
      .from("opportunities")
      .select(`
        *,
        eligibility_criteria (*),
        required_documents (*),
        opportunity_deadlines (*),
        official_sources (*)
      `);

    if (options.type) {
      query = query.eq("type", options.type);
    }
    if (options.state && options.state !== "All India (Central)") {
      query = query.or(`state.eq.${options.state},state.eq."All India (Central)"`);
    }
    if (options.category) {
      query = query.ilike("category", `%${options.category}%`);
    }
    if (options.verificationStatus) {
      query = query.eq("verification_status", options.verificationStatus);
    }
    if (options.searchQuery) {
      query = query.or(`title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase query error:", error.message);
      return filterMockOpportunities(options, `Database query notice: ${error.message}`);
    }

    if (!data || data.length === 0) {
      // If table is empty, fall back to mock catalog to keep demo interactive
      return filterMockOpportunities(options, "Database returned 0 rows; operating with local sample dataset.");
    }

    const mapped = (data as JoinedOpportunityRow[]).map(mapDbRowToOpportunity);

    // Filter by life stage in memory if requested
    let filtered = mapped;
    if (options.lifeStage) {
      filtered = mapped.filter((opp) => opp.lifeStages.includes(options.lifeStage as LifeStageKey));
    }

    return {
      opportunities: filtered,
      source: "supabase",
      totalCount: filtered.length,
    };
  } catch (err: any) {
    console.error("Supabase fetch exception:", err);
    return filterMockOpportunities(options, `Supabase connection exception: ${err.message || String(err)}`);
  }
}

/**
 * Helper to filter local mock opportunities with same contract
 */
function filterMockOpportunities(
  options: FetchOpportunitiesOptions,
  errorMessage?: string
): FetchResult {
  let list = getAdminLocalOpportunities();

  if (options.type) {
    list = list.filter((o) => o.type === options.type);
  }
  if (options.state && options.state !== "All India (Central)") {
    list = list.filter(
      (o) => o.state === options.state || o.state === "All India (Central)"
    );
  }
  if (options.category) {
    list = list.filter((o) =>
      o.category.toLowerCase().includes(options.category!.toLowerCase())
    );
  }
  if (options.lifeStage) {
    list = list.filter((o) =>
      o.lifeStages.includes(options.lifeStage as LifeStageKey)
    );
  }
  if (options.verificationStatus) {
    list = list.filter(
      (o) => o.verificationStatus === options.verificationStatus
    );
  }
  if (options.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    list = list.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return {
    opportunities: list,
    source: "local_fallback",
    totalCount: list.length,
    errorMessage,
  };
}
