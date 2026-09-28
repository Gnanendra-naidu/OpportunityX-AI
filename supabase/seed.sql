-- ============================================================================
-- OpportunityX-AI: Supabase PostgreSQL Seed Data
-- ============================================================================

-- Clean existing data in dependency order
TRUNCATE TABLE public.saved_opportunities CASCADE;
TRUNCATE TABLE public.official_sources CASCADE;
TRUNCATE TABLE public.opportunity_deadlines CASCADE;
TRUNCATE TABLE public.required_documents CASCADE;
TRUNCATE TABLE public.eligibility_criteria CASCADE;
TRUNCATE TABLE public.opportunities CASCADE;

-- ----------------------------------------------------------------------------
-- 1. Insert Opportunities
-- ----------------------------------------------------------------------------
INSERT INTO public.opportunities (
    id, slug, title, description, type, category, provider, provider_type,
    state, country, benefits, amount, amount_numeric, application_start_date,
    application_deadline_date, is_year_round, application_method,
    official_website, verification_status, last_verified_at, is_demo_data,
    demo_disclaimer, tags
) VALUES
(
    'sch-aicte-pragati',
    'aicte-pragati-scholarship-girls',
    'AICTE Pragati Scholarship for Girl Students',
    'Direct financial incentive provided by AICTE under the Ministry of Education to empower girl students admitted to first-year AICTE-approved Degree/Diploma courses in Technical Education.',
    'scholarship',
    'Higher Education & Technical',
    'All India Council for Technical Education (AICTE)',
    'central_gov',
    'All India (Central)',
    'India',
    '₹50,000 per annum paid as a lump sum through DBT towards college tuition, laptop, books, and academic equipment for up to 4 years.',
    '₹50,000 / year',
    50000.00,
    '2026-07-01',
    '2026-10-31',
    FALSE,
    'online_portal',
    'https://scholarships.gov.in',
    'verified',
    NOW(),
    TRUE,
    'Demo record structured from AICTE official guidelines for verification testing.',
    ARRAY['Girls Education', 'Engineering', 'AICTE', 'Degree', 'Diploma', 'Central']
),
(
    'sch-post-matric-sc',
    'post-matric-scholarship-sc-students',
    'Centrally Sponsored Post-Matric Scholarship for SC Students',
    'Flagship welfare scholarship by the Ministry of Social Justice and Empowerment offering 100% compulsory non-refundable fee coverage plus monthly maintenance allowance for Scheduled Caste students.',
    'scholarship',
    'Social Justice & Education',
    'Ministry of Social Justice and Empowerment, GoI',
    'central_gov',
    'All India (Central)',
    'India',
    'Complete tuition & non-refundable college fee waiver plus monthly living allowance of ₹1,200 (hostellers) or ₹550 (day scholars).',
    'Full Tuition + ₹1,200/mo',
    25000.00,
    '2026-08-01',
    '2026-11-30',
    FALSE,
    'online_portal',
    'https://scholarships.gov.in',
    'verified',
    NOW(),
    TRUE,
    'Demo record modeled after Post-Matric SC national portal guidelines.',
    ARRAY['SC Welfare', 'Post Matric', 'Higher Education', 'Fee Waiver', 'DBT']
),
(
    'sch-national-overseas',
    'national-overseas-scholarship-sc-st',
    'National Overseas Scholarship (NOS) for Higher Studies Abroad',
    'Prestigious central scholarship facilitating low-income students from marginalized groups to pursue Master’s degree and Ph.D. programs abroad at QS top 500 universities.',
    'scholarship',
    'International Higher Studies',
    'Ministry of Social Justice & Empowerment',
    'central_gov',
    'All India (Central)',
    'India',
    'Full international university tuition fees, annual maintenance allowance (USD 15,400 / GBP 9,900), medical insurance, and economy class international airfare.',
    'Full Tuition + $15,400/yr',
    3500000.00,
    '2026-02-15',
    '2026-04-30',
    FALSE,
    'online_portal',
    'https://nosmsje.gov.in',
    'verified',
    NOW(),
    TRUE,
    'Demo record modeled after NOS official ministry notification.',
    ARRAY['Study Abroad', 'Masters', 'PhD', 'Overseas', 'SC', 'ST']
),
(
    'opp-karnataka-raitha-vidya-nidhi',
    'karnataka-raitha-vidya-nidhi-scheme',
    'Karnataka Raitha Vidya Nidhi Scholarship',
    'Chief Minister scholarship scheme funded exclusively by the Government of Karnataka to provide education stipends to children of registered farmers across PUC, ITI, Degree, and Post-Graduation.',
    'scheme',
    'Agriculture & Higher Education',
    'Department of Agriculture, Government of Karnataka',
    'state_gov',
    'Karnataka',
    'India',
    'Annual scholarship ranging from ₹2,000 to ₹11,000 disbursed directly into student bank accounts via Karnataka DBT portal.',
    '₹2,000 - ₹11,000 / year',
    11000.00,
    '2026-08-15',
    '2026-12-15',
    FALSE,
    'online_portal',
    'https://karnataka.gov.in',
    'verified',
    NOW(),
    TRUE,
    'Demo state record modeled after Karnataka Raitha Vidya Nidhi portal specifications.',
    ARRAY['Karnataka', 'Farmers Children', 'State Domicile', 'Higher Education', 'DBT']
),
(
    'opp-maharashtra-ebc',
    'maharashtra-rajarshi-chhatrapati-shahu-ebc',
    'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti (EBC)',
    'Higher education tuition fee reimbursement scheme by the Government of Maharashtra for students belonging to the Economically Backward Class (EBC) in approved higher education courses.',
    'scheme',
    'Higher Education & Fee Concession',
    'Directorate of Higher Education, Government of Maharashtra',
    'state_gov',
    'Maharashtra',
    'India',
    '50% reimbursement of tuition fees and exam fees in government-aided and private un-aided professional higher education colleges.',
    '50% Tuition Fee Waiver',
    40000.00,
    '2026-07-01',
    '2026-11-30',
    FALSE,
    'online_portal',
    'https://mahadbt.maharashtra.gov.in',
    'verified',
    NOW(),
    TRUE,
    'Demo state record modeled after Maharashtra MahaDBT EBC regulations.',
    ARRAY['Maharashtra', 'EBC', 'Tuition Waiver', 'MahaDBT', 'State Domicile']
),
(
    'opp-tn-pudhumai-penn',
    'tamil-nadu-pudhumai-penn-scheme',
    'Tamil Nadu Moovalur Ramamirtham Ammaiyar Higher Education (Pudhumai Penn)',
    'Flagship girl child empowerment scheme by Government of Tamil Nadu providing monthly financial assistance to female students who studied from Class 6 to 12 in Tamil Nadu government schools.',
    'scheme',
    'Women & Higher Education',
    'Social Welfare and Women Empowerment Department, TN',
    'state_gov',
    'Tamil Nadu',
    'India',
    'Monthly direct cash assistance of ₹1,000 per month credited directly to the student bank account until successful graduation or completion of diploma.',
    '₹1,000 / month (₹12,000/yr)',
    12000.00,
    '2026-06-01',
    NULL,
    TRUE,
    'online_portal',
    'https://www.pudhumaipenn.tn.gov.in',
    'verified',
    NOW(),
    TRUE,
    'Demo state record modeled after Tamil Nadu Pudhumai Penn official guidelines.',
    ARRAY['Tamil Nadu', 'Women', 'Girl Child', 'Govt School Students', 'DBT']
);

-- ----------------------------------------------------------------------------
-- 2. Insert Eligibility Criteria
-- ----------------------------------------------------------------------------
INSERT INTO public.eligibility_criteria (
    opportunity_id, life_stages, gender_eligibility, category_eligibility,
    is_income_restricted, max_annual_income, income_notes, is_disability_applicable,
    is_exclusive_for_disability, min_age, max_age, domicile_required, eligible_states,
    min_education_level, min_academic_percentage, criteria_summary_bullets, pre_screening_caveat
) VALUES
(
    'sch-aicte-pragati',
    ARRAY['college_students', 'women'],
    ARRAY['female'],
    ARRAY['all'],
    TRUE,
    800000.00,
    'Family annual gross income from all sources must not exceed ₹8,00,000.',
    TRUE,
    FALSE,
    16,
    25,
    FALSE,
    ARRAY['All India (Central)'],
    'Class 12 / Polytechnic',
    60.00,
    ARRAY[
        'Exclusively for female students admitted to 1st year AICTE degree/diploma',
        'Maximum 2 girl children per family eligible',
        'Annual family income under ₹8 Lakh from all sources'
    ],
    'Pre-screening requires valid AICTE approval code for the admitted college.'
),
(
    'sch-post-matric-sc',
    ARRAY['college_students', 'graduates'],
    ARRAY['all'],
    ARRAY['SC'],
    TRUE,
    250000.00,
    'Total family income from all sources must not exceed ₹2,50,000 per annum.',
    TRUE,
    FALSE,
    15,
    35,
    FALSE,
    ARRAY['All India (Central)'],
    'Class 10 Pass',
    NULL,
    ARRAY[
        'Must belong to Scheduled Caste (SC) category with valid certificate',
        'Enrolled in recognized Post-Matriculation degree, diploma, or certificate course',
        'Annual parental income should not exceed ₹2,50,000'
    ],
    'Aadhaar seeded bank account mandatory for Public Financial Management System (PFMS) DBT.'
),
(
    'sch-national-overseas',
    ARRAY['graduates', 'college_students'],
    ARRAY['all'],
    ARRAY['SC', 'ST'],
    TRUE,
    800000.00,
    'Family income must be below ₹8,00,000 for the preceding financial year.',
    TRUE,
    FALSE,
    NULL,
    35,
    FALSE,
    ARRAY['All India (Central)'],
    'Bachelor’s Degree / Master’s Degree',
    60.00,
    ARRAY[
        'Candidate must have secured unconditional admission to top 500 QS ranked university abroad',
        'Minimum 60% marks in qualifying degree exam',
        'Age must not exceed 35 years as on 1st April of selection year'
    ],
    'Only candidates with unconditional admission offers from top 500 QS universities are evaluated.'
),
(
    'opp-karnataka-raitha-vidya-nidhi',
    ARRAY['school_students', 'college_students', 'graduates', 'farmers'],
    ARRAY['all'],
    ARRAY['all'],
    FALSE,
    NULL,
    'No income restriction; based on Farmer Registration and Identification System (FRUITS ID).',
    TRUE,
    FALSE,
    15,
    28,
    TRUE,
    ARRAY['Karnataka'],
    'SSLC / 10th Standard',
    NULL,
    ARRAY[
        'Parent must be a registered agriculturalist or farmer holding valid Karnataka FRUITS ID',
        'Student must be bonafide resident of Karnataka enrolled in recognized institution',
        'Applicable across PUC, ITI, Diploma, Undergraduate, and Postgraduate streams'
    ],
    'Requires active FRUITS (Farmer Registration and Unified Beneficiary Information System) ID.'
),
(
    'opp-maharashtra-ebc',
    ARRAY['college_students', 'graduates'],
    ARRAY['all'],
    ARRAY['General', 'EWS'],
    TRUE,
    800000.00,
    'Family annual gross income must not exceed ₹8,00,000.',
    TRUE,
    FALSE,
    17,
    30,
    TRUE,
    ARRAY['Maharashtra'],
    'Class 12 / Diploma',
    50.00,
    ARRAY[
        'Must be a bonafide resident and domicile of Maharashtra State',
        'Admitted through Centralized Admission Process (CAP) in approved degree/diploma course',
        'Family income cap of ₹8 Lakh with Tahsildar issued Income Certificate'
    ],
    'Only admissions through CAP rounds are eligible; management quota is not covered.'
),
(
    'opp-tn-pudhumai-penn',
    ARRAY['college_students', 'women'],
    ARRAY['female'],
    ARRAY['all'],
    FALSE,
    NULL,
    'No family income ceiling; criteria strictly based on government school education history.',
    TRUE,
    FALSE,
    17,
    24,
    TRUE,
    ARRAY['Tamil Nadu'],
    'Class 12 (TN Govt School)',
    NULL,
    ARRAY[
        'Must be a female student bonafide resident of Tamil Nadu',
        'Must have completed Class 6 through Class 12 continuously in Tamil Nadu Government schools',
        'Currently enrolled in accredited undergraduate degree or diploma institution'
    ],
    'EMIS (Educational Management Information System) verification from Tamil Nadu school education dept is required.'
);

-- ----------------------------------------------------------------------------
-- 3. Insert Required Documents
-- ----------------------------------------------------------------------------
INSERT INTO public.required_documents (
    id, opportunity_id, name, document_type, is_mandatory, issuing_authority, description, acceptable_formats
) VALUES
('doc-pragati-aadhaar', 'sch-aicte-pragati', 'Aadhaar Card', 'identity', TRUE, 'UIDAI', 'Proof of citizen identity linked to active bank account', ARRAY['PDF', 'JPG']),
('doc-pragati-income', 'sch-aicte-pragati', 'Income Certificate', 'income', TRUE, 'Revenue Officer / Tehsildar', 'Must show annual family income < ₹8,00,000', ARRAY['PDF']),
('doc-pragati-admission', 'sch-aicte-pragati', 'College Admission Proof', 'academic', TRUE, 'AICTE Approved Institute', 'Fee receipt or seat allotment letter', ARRAY['PDF']),
('doc-sc-caste', 'sch-post-matric-sc', 'Caste Certificate (SC)', 'caste', TRUE, 'Sub-Divisional Magistrate / Tehsildar', 'Valid community certificate', ARRAY['PDF']),
('doc-sc-income', 'sch-post-matric-sc', 'Income Certificate', 'income', TRUE, 'Revenue Department', 'Family income under ₹2.5 Lakh per annum', ARRAY['PDF']),
('doc-sc-marksheet', 'sch-post-matric-sc', 'Previous Year Marksheet', 'academic', TRUE, 'State Board / University', 'Mark sheet of qualifying exam', ARRAY['PDF']),
('doc-nos-passport', 'sch-national-overseas', 'Valid Indian Passport', 'identity', TRUE, 'Ministry of External Affairs', 'Must have at least 2 years remaining validity', ARRAY['PDF']),
('doc-nos-offer', 'sch-national-overseas', 'Unconditional Admission Letter', 'academic', TRUE, 'Host Foreign University', 'Offer from QS top 500 university abroad', ARRAY['PDF']),
('doc-karnataka-fruits', 'opp-karnataka-raitha-vidya-nidhi', 'FRUITS Farmer ID Card', 'land_record', TRUE, 'Department of Agriculture Karnataka', 'Registered Farmer ID number verification', ARRAY['PDF', 'JPG']),
('doc-karnataka-domicile', 'opp-karnataka-raitha-vidya-nidhi', 'Karnataka Domicile Certificate', 'domicile', TRUE, 'Tahsildar / Nadakacheri', 'Proof of state residence', ARRAY['PDF']),
('doc-maha-domicile', 'opp-maharashtra-ebc', 'Maharashtra Domicile Certificate', 'domicile', TRUE, 'MahaOnline / Tehsildar', 'Mandatory state residency certificate', ARRAY['PDF']),
('doc-maha-cap', 'opp-maharashtra-ebc', 'CAP Allotment Letter', 'academic', TRUE, 'State CET Cell Maharashtra', 'Confirmation of admission under CAP quota', ARRAY['PDF']),
('doc-tn-school-cert', 'opp-tn-pudhumai-penn', 'Class 6-12 Govt School Study Certificate', 'academic', TRUE, 'Headmaster / Chief Educational Officer (CEO)', 'Certificate verifying continuous study in government schools', ARRAY['PDF']);

-- ----------------------------------------------------------------------------
-- 4. Insert Opportunity Deadlines
-- ----------------------------------------------------------------------------
INSERT INTO public.opportunity_deadlines (
    opportunity_id, deadline_type, closing_date, cycle_name, is_tentative, academic_year, notes
) VALUES
('sch-aicte-pragati', 'fixed_date', '2026-10-31', 'AY 2026-27 National Cycle', FALSE, '2026-2027', 'Apply early to allow college nodal verification.'),
('sch-post-matric-sc', 'fixed_date', '2026-11-30', 'AY 2026-27 DBT Cycle', FALSE, '2026-2027', 'State nodal approval deadline follows application closing.'),
('sch-national-overseas', 'fixed_date', '2026-04-30', 'Cycle 1 (Fall Intake 2026)', FALSE, '2026-2027', 'Portal opens twice yearly for Fall and Spring admissions.'),
('opp-karnataka-raitha-vidya-nidhi', 'fixed_date', '2026-12-15', 'K-DBT Annual Cycle 2026', TRUE, '2026-2027', 'Dates extended annually based on agricultural season reviews.'),
('opp-maharashtra-ebc', 'fixed_date', '2026-11-30', 'MahaDBT First Term Cycle', FALSE, '2026-2027', 'Colleges must verify documents by 15th December.'),
('opp-tn-pudhumai-penn', 'year_round', NULL, 'Ongoing College Enrolment', FALSE, '2026-2027', 'Rolling applications for first-year degree/diploma entrants.');

-- ----------------------------------------------------------------------------
-- 5. Insert Official Sources
-- ----------------------------------------------------------------------------
INSERT INTO public.official_sources (
    opportunity_id, portal_name, department_or_ministry, domain, url,
    is_government_domain, guidelines_pdf_url, helpline_phone, helpline_email, nodal_officer_designation
) VALUES
('sch-aicte-pragati', 'National Scholarship Portal (NSP)', 'All India Council for Technical Education (AICTE)', 'scholarships.gov.in', 'https://scholarships.gov.in', TRUE, 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati', '0120-6619540', 'helpdesk@nsp.gov.in', 'Director (Student Development Cell), AICTE'),
('sch-post-matric-sc', 'National Scholarship Portal (NSP)', 'Ministry of Social Justice and Empowerment', 'scholarships.gov.in', 'https://scholarships.gov.in', TRUE, 'https://socialjustice.gov.in/schemes/42', '0120-6619540', 'helpdesk@nsp.gov.in', 'Joint Secretary (SCD), MoSJE'),
('sch-national-overseas', 'NOS Online Portal', 'Ministry of Social Justice & Empowerment', 'nosmsje.gov.in', 'https://nosmsje.gov.in', TRUE, 'https://nosmsje.gov.in/guidelines.pdf', '011-23388145', 'nos-msje@gov.in', 'Under Secretary (SCD-V), MoSJE'),
('opp-karnataka-raitha-vidya-nidhi', 'Karnataka State Scholarship Portal (SSP)', 'Department of Agriculture, Govt of Karnataka', 'karnataka.gov.in', 'https://karnataka.gov.in', TRUE, 'https://ssp.postmatric.karnataka.gov.in', '1902', 'postmatrichelp@karnataka.gov.in', 'Nodal Officer, Karnataka Agriculture Welfare'),
('opp-maharashtra-ebc', 'MahaDBT Portal', 'Directorate of Higher Education, Maharashtra', 'mahadbt.maharashtra.gov.in', 'https://mahadbt.maharashtra.gov.in', TRUE, 'https://mahadbt.maharashtra.gov.in/SchemeData/SchemeData?str=E9DD5947C3D2952E742055BD092CECAE', '022-49150800', 'support.mahadbt@maharashtra.gov.in', 'Joint Director of Higher Education, Maharashtra'),
('opp-tn-pudhumai-penn', 'Tamil Nadu Pudhumai Penn Portal', 'Social Welfare Department, Government of Tamil Nadu', 'pudhumaipenn.tn.gov.in', 'https://www.pudhumaipenn.tn.gov.in', TRUE, 'https://www.pudhumaipenn.tn.gov.in/guidelines', '044-25670876', 'pudhumaipenn@tn.gov.in', 'State Nodal Officer, Pudhumai Penn Scheme');
