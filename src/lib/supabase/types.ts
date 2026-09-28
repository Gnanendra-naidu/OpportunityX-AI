/**
 * Database Row Types representing the PostgreSQL Supabase schema
 */

export interface DbOpportunityRow {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  type: string;
  category: string;
  provider: string;
  provider_type: string;
  state: string;
  country: string;
  benefits: string;
  amount: string;
  amount_numeric: number | null;
  application_start_date: string | null;
  application_deadline_date: string | null;
  is_year_round: boolean;
  application_method: string;
  official_website: string;
  verification_status: string;
  last_verified_at: string | null;
  is_demo_data: boolean;
  demo_disclaimer: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbEligibilityCriteriaRow {
  id: string;
  opportunity_id: string;
  life_stages: string[];
  gender_eligibility: string[];
  category_eligibility: string[];
  is_income_restricted: boolean;
  max_annual_income: number | null;
  income_currency: string;
  income_certificate_required: boolean;
  income_notes: string | null;
  is_disability_applicable: boolean;
  is_exclusive_for_disability: boolean;
  min_disability_percentage: number | null;
  udid_card_required: boolean;
  min_age: number | null;
  max_age: number | null;
  domicile_required: boolean;
  eligible_states: string[];
  min_education_level: string | null;
  min_academic_percentage: number | null;
  criteria_summary_bullets: string[];
  pre_screening_caveat: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRequiredDocumentRow {
  id: string;
  opportunity_id: string;
  name: string;
  document_type: string;
  is_mandatory: boolean;
  issuing_authority: string | null;
  description: string | null;
  acceptable_formats: string[];
  created_at: string;
  updated_at: string;
}

export interface DbOpportunityDeadlineRow {
  id: string;
  opportunity_id: string;
  deadline_type: string;
  closing_date: string | null;
  cycle_name: string | null;
  is_tentative: boolean;
  academic_year: string | null;
  timezone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOfficialSourceRow {
  id: string;
  opportunity_id: string;
  portal_name: string;
  department_or_ministry: string;
  domain: string;
  url: string;
  is_government_domain: boolean;
  guidelines_pdf_url: string | null;
  helpline_phone: string | null;
  helpline_email: string | null;
  nodal_officer_designation: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbUserProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  life_stage: string;
  date_of_birth: string | null;
  gender: string | null;
  state: string;
  district: string | null;
  caste_category: string | null;
  annual_family_income: number;
  education_level: string | null;
  course_stream: string | null;
  academic_percentage: number | null;
  occupation: string | null;
  is_disabled: boolean;
  disability_percentage: number | null;
  is_minority: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbSavedOpportunityRow {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: string;
  user_notes: string | null;
  reminder_enabled: boolean;
  target_deadline_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Joined record structure returned from Supabase SELECT queries
 */
export interface JoinedOpportunityRow extends DbOpportunityRow {
  eligibility_criteria?: DbEligibilityCriteriaRow[] | DbEligibilityCriteriaRow | null;
  required_documents?: DbRequiredDocumentRow[] | null;
  opportunity_deadlines?: DbOpportunityDeadlineRow[] | DbOpportunityDeadlineRow | null;
  official_sources?: DbOfficialSourceRow[] | DbOfficialSourceRow | null;
}
