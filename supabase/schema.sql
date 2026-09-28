-- ============================================================================
-- OpportunityX-AI: Supabase PostgreSQL Database Schema
--
-- Tables:
-- 1. opportunities: Core opportunity and scheme metadata
-- 2. eligibility_criteria: Normalized eligibility rules & criteria
-- 3. required_documents: Verification and compliance documents
-- 4. opportunity_deadlines: Application cycles and deadline dates
-- 5. official_sources: Verified government/portal origins and helpline details
-- 6. user_profiles: Citizen profile for personalized opportunity matching
-- 7. saved_opportunities: User bookmarking, tracker, and reminders
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 1. TABLE: opportunities
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('scholarship', 'scheme', 'fellowship', 'skill_training', 'grant', 'subsidy')),
    category TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('central_gov', 'state_gov', 'private_trust', 'ngo', 'international')),
    state TEXT NOT NULL DEFAULT 'All India (Central)',
    country TEXT NOT NULL DEFAULT 'India',
    benefits TEXT NOT NULL,
    amount TEXT NOT NULL,
    amount_numeric NUMERIC(12, 2) DEFAULT 0,
    application_start_date DATE,
    application_deadline_date DATE,
    is_year_round BOOLEAN DEFAULT FALSE,
    application_method TEXT NOT NULL CHECK (application_method IN ('online_portal', 'offline_form', 'nodal_agency', 'institution_submission')),
    official_website TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'under_review', 'source_updated', 'unverified')),
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    is_demo_data BOOLEAN DEFAULT TRUE,
    demo_disclaimer TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments on opportunities
COMMENT ON TABLE public.opportunities IS 'Master catalog of national & state scholarships and welfare schemes';
COMMENT ON COLUMN public.opportunities.state IS 'State jurisdiction. "All India (Central)" for nationwide central schemes';

-- ----------------------------------------------------------------------------
-- 2. TABLE: eligibility_criteria
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eligibility_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    life_stages TEXT[] NOT NULL DEFAULT '{}',
    gender_eligibility TEXT[] NOT NULL DEFAULT '{"all"}',
    category_eligibility TEXT[] NOT NULL DEFAULT '{"all"}',
    is_income_restricted BOOLEAN NOT NULL DEFAULT FALSE,
    max_annual_income NUMERIC(12, 2),
    income_currency TEXT DEFAULT 'INR',
    income_certificate_required BOOLEAN DEFAULT FALSE,
    income_notes TEXT,
    is_disability_applicable BOOLEAN DEFAULT FALSE,
    is_exclusive_for_disability BOOLEAN DEFAULT FALSE,
    min_disability_percentage NUMERIC(5, 2),
    udid_card_required BOOLEAN DEFAULT FALSE,
    min_age INTEGER,
    max_age INTEGER,
    domicile_required BOOLEAN DEFAULT FALSE,
    eligible_states TEXT[] DEFAULT '{}',
    min_education_level TEXT,
    min_academic_percentage NUMERIC(5, 2),
    criteria_summary_bullets TEXT[] DEFAULT '{}',
    pre_screening_caveat TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_eligibility_opportunity UNIQUE (opportunity_id)
);

-- ----------------------------------------------------------------------------
-- 3. TABLE: required_documents
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.required_documents (
    id TEXT PRIMARY KEY,
    opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('identity', 'income', 'caste', 'academic', 'domicile', 'disability', 'bank', 'land_record', 'other')),
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    issuing_authority TEXT,
    description TEXT,
    acceptable_formats TEXT[] DEFAULT '{"PDF", "JPG", "PNG"}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. TABLE: opportunity_deadlines
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunity_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    deadline_type TEXT NOT NULL CHECK (deadline_type IN ('fixed_date', 'rolling_annual', 'multiple_cycles', 'year_round')),
    closing_date DATE,
    cycle_name TEXT,
    is_tentative BOOLEAN NOT NULL DEFAULT FALSE,
    academic_year TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_deadline_opportunity UNIQUE (opportunity_id)
);

-- ----------------------------------------------------------------------------
-- 5. TABLE: official_sources
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.official_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    portal_name TEXT NOT NULL,
    department_or_ministry TEXT NOT NULL,
    domain TEXT NOT NULL,
    url TEXT NOT NULL,
    is_government_domain BOOLEAN NOT NULL DEFAULT TRUE,
    guidelines_pdf_url TEXT,
    helpline_phone TEXT,
    helpline_email TEXT,
    nodal_officer_designation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_source_opportunity UNIQUE (opportunity_id)
);

-- ----------------------------------------------------------------------------
-- 6. TABLE: user_profiles (Socioeconomic Citizen Profile)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    age INTEGER,
    state TEXT NOT NULL,
    education_level TEXT,
    life_stage TEXT NOT NULL,
    income_range TEXT,
    annual_family_income NUMERIC(12, 2) DEFAULT 0,
    category TEXT CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
    caste_category TEXT,
    disability_status BOOLEAN DEFAULT FALSE,
    is_disabled BOOLEAN DEFAULT FALSE,
    preferred_opportunity_types TEXT[] DEFAULT '{}',
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'transgender', 'other')),
    district TEXT,
    course_stream TEXT,
    academic_percentage NUMERIC(5, 2),
    occupation TEXT,
    is_minority BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. TABLE: saved_opportunities
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'bookmarked' CHECK (status IN ('bookmarked', 'preparing_documents', 'applied', 'awarded', 'rejected')),
    user_notes TEXT,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    target_deadline_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_opportunity UNIQUE (user_id, opportunity_id)
);

-- ============================================================================
-- INDEXES FOR FAST FILTERING & RETRIEVAL
-- ============================================================================

-- Opportunities Indexes
CREATE INDEX IF NOT EXISTS idx_opps_type ON public.opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opps_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opps_state ON public.opportunities(state);
CREATE INDEX IF NOT EXISTS idx_opps_verification_status ON public.opportunities(verification_status);
CREATE INDEX IF NOT EXISTS idx_opps_deadline_date ON public.opportunities(application_deadline_date);
CREATE INDEX IF NOT EXISTS idx_opps_tags ON public.opportunities USING GIN(tags);

-- Eligibility Criteria Indexes
CREATE INDEX IF NOT EXISTS idx_eligibility_opp_id ON public.eligibility_criteria(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_life_stages ON public.eligibility_criteria USING GIN(life_stages);
CREATE INDEX IF NOT EXISTS idx_eligibility_gender ON public.eligibility_criteria USING GIN(gender_eligibility);
CREATE INDEX IF NOT EXISTS idx_eligibility_caste ON public.eligibility_criteria USING GIN(category_eligibility);
CREATE INDEX IF NOT EXISTS idx_eligibility_income ON public.eligibility_criteria(max_annual_income);

-- Required Documents Indexes
CREATE INDEX IF NOT EXISTS idx_req_docs_opp_id ON public.required_documents(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_req_docs_type ON public.required_documents(document_type);

-- Deadlines & Sources Indexes
CREATE INDEX IF NOT EXISTS idx_deadlines_opp_id ON public.opportunity_deadlines(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_sources_opp_id ON public.official_sources(opportunity_id);

-- User Profiles & Saved Opportunities Indexes
CREATE INDEX IF NOT EXISTS idx_saved_opps_user_id ON public.saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opps_opp_id ON public.saved_opportunities(opportunity_id);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_opps_updated_at ON public.opportunities;
CREATE TRIGGER trg_opps_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_eligibility_updated_at ON public.eligibility_criteria;
CREATE TRIGGER trg_eligibility_updated_at
    BEFORE UPDATE ON public.eligibility_criteria
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_req_docs_updated_at ON public.required_documents;
CREATE TRIGGER trg_req_docs_updated_at
    BEFORE UPDATE ON public.required_documents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_deadlines_updated_at ON public.opportunity_deadlines;
CREATE TRIGGER trg_deadlines_updated_at
    BEFORE UPDATE ON public.opportunity_deadlines
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_sources_updated_at ON public.official_sources;
CREATE TRIGGER trg_sources_updated_at
    BEFORE UPDATE ON public.official_sources
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_saved_opps_updated_at ON public.saved_opportunities;
CREATE TRIGGER trg_saved_opps_updated_at
    BEFORE UPDATE ON public.saved_opportunities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Public READ access for opportunities and related metadata
CREATE POLICY "Public opportunities are viewable by everyone"
    ON public.opportunities FOR SELECT USING (true);

CREATE POLICY "Public eligibility criteria are viewable by everyone"
    ON public.eligibility_criteria FOR SELECT USING (true);

CREATE POLICY "Public required documents are viewable by everyone"
    ON public.required_documents FOR SELECT USING (true);

CREATE POLICY "Public opportunity deadlines are viewable by everyone"
    ON public.opportunity_deadlines FOR SELECT USING (true);

CREATE POLICY "Public official sources are viewable by everyone"
    ON public.official_sources FOR SELECT USING (true);

-- User Profiles: Users can view and manage their own profile
CREATE POLICY "Users can view and manage their own profile"
    ON public.user_profiles FOR ALL
    USING (auth.uid() = id OR auth.uid() IS NULL);

-- Saved Opportunities: Users can view and manage their saved items
CREATE POLICY "Users can manage their saved opportunities"
    ON public.saved_opportunities FOR ALL
    USING (auth.uid() = user_id OR auth.uid() IS NULL);
