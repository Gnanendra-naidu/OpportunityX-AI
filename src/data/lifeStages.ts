import { LifeStageInfo } from "@/types";

export const LIFE_STAGES: LifeStageInfo[] = [
  {
    key: "newborns_infants",
    title: "Newborn & Infants",
    subtitle: "Maternal care, essential immunization & newborn healthcare",
    ageRange: "0 - 2 Years",
    description:
      "Direct nutritional incentives, institutional delivery cash transfers under PMMVY, mandatory newborn screenings, and immunization schedules.",
    iconName: "Baby",
    accentColor: "from-blue-500 to-indigo-600",
    tags: ["Maternity Benefit", "Immunization", "POSHAN", "Infant Healthcare"],
    relevantCategories: [
      "Maternal & Child Health",
      "Cash Incentives (DBT)",
      "Universal Immunization",
      "Supplementary Nutrition",
    ],
    eligibilityDisclaimer:
      "Assistance typically requires registration at an Anganwadi Center / MCP card, institutional hospital delivery, and adherence to child immunization milestones.",
  },
  {
    key: "children",
    title: "Children",
    subtitle: "Early childhood development, nutrition & girl child savings",
    ageRange: "2 - 6 Years",
    description:
      "Early childhood education (ECCE), Balika Samriddhi girl child assistance, Anganwadi fortified nutrition, and Sukanya Samriddhi high-interest savings accounts.",
    iconName: "Baby",
    accentColor: "from-sky-500 to-cyan-600",
    tags: ["Early Childhood", "Sukanya Samriddhi", "Pre-School", "Balika Samriddhi"],
    relevantCategories: [
      "Girl Child Savings",
      "Pre-School & ECCE",
      "Nutritional Support",
      "Child Protection Grants",
    ],
    eligibilityDisclaimer:
      "Eligibility depends on the child's age bracket (e.g. Sukanya Samriddhi requires girl age < 10), household ration card status, and state domicile.",
  },
  {
    key: "school_students",
    title: "School Students",
    subtitle: "Pre-matric scholarships, merit awards & talent exams",
    ageRange: "6 - 17 Years (Classes 1 - 12)",
    description:
      "Centrally sponsored pre-matric grants for SC/ST/OBC/Minority students, National Means-cum-Merit awards (NMMSS), free textbook distribution, and Kasturba Gandhi Balika Vidyalayas.",
    iconName: "GraduationCap",
    accentColor: "from-blue-600 to-indigo-700",
    tags: ["Pre-Matric", "NMMS", "Kasturba Gandhi", "Merit Awards"],
    relevantCategories: [
      "Pre-Matric Scholarships",
      "Merit-cum-Means Awards",
      "Boarding & Hostel Grants",
      "STEM & Olympiad Encouragement",
    ],
    eligibilityDisclaimer:
      "Scholarships mandate minimum prior exam marks (e.g. 55%), enrollment in government or recognized schools, and family income ceiling usually under ₹3.50 LPA.",
  },
  {
    key: "college_students",
    title: "College Students",
    subtitle: "Post-matric scholarships, fee waivers & technical grants",
    ageRange: "17 - 24 Years",
    description:
      "AICTE Pragati & Saksham technical scholarships, central post-matric fee reimbursement, free laptop/device distributions, and state scholarship portal (SSP/MahaDBT) grants.",
    iconName: "BookOpen",
    accentColor: "from-emerald-600 to-teal-700",
    tags: ["Post-Matric", "Engineering/Medical", "Fee Waiver", "AICTE Pragati"],
    relevantCategories: [
      "Higher Education Scholarships",
      "Tuition Fee Reimbursement",
      "Girls in Technical Degrees",
      "Hostel Maintenance Allowance",
    ],
    eligibilityDisclaimer:
      "Programs require enrollment in an accredited degree/diploma program, qualifying cutoff percentile, caste certification (for reserved schemes), and valid annual income certificates.",
  },
  {
    key: "graduates",
    title: "Graduates",
    subtitle: "Doctoral stipends, national research fellowships & GATE grants",
    ageRange: "21 - 30 Years",
    description:
      "Prime Minister's Research Fellowship (PMRF), UGC-CSIR NET Junior Research Fellowships (JRF), National Overseas Scholarships, and higher degree research contingency funds.",
    iconName: "Award",
    accentColor: "from-purple-600 to-indigo-800",
    tags: ["PMRF", "UGC JRF", "Doctoral Stipend", "Higher Studies"],
    relevantCategories: [
      "Doctoral & PhD Fellowships",
      "Frontier Science & Technology",
      "National Overseas Grants",
      "Post-Doctoral Travel Grants",
    ],
    eligibilityDisclaimer:
      "Requires high academic ranking, GATE/NET qualification, admission to CFTIs/premier universities, and defense of a competitive research proposal.",
  },
  {
    key: "job_seekers",
    title: "Job Seekers",
    subtitle: "Paid apprenticeships, PMKVY skill vouchers & exam coaching",
    ageRange: "18 - 35 Years",
    description:
      "National Apprenticeship Promotion Scheme (NAPS) stipends, PMKVY 4.0 free vocational certification, free civil services coaching subsidies for SC/OBC youth, and National Career Service (NCS) job matching.",
    iconName: "Briefcase",
    accentColor: "from-amber-500 to-orange-600",
    tags: ["Skill India", "Apprenticeships", "Free Coaching", "PMKVY"],
    relevantCategories: [
      "Vocational Skill Vouchers",
      "Industry Apprenticeships",
      "Competitive Exam Coaching",
      "Placement Support",
    ],
    eligibilityDisclaimer:
      "Open to unemployed youth with minimum qualification (Class 8, 10, or Graduate depending on course) and Aadhaar-seeded bank account for stipend DBT.",
  },
  {
    key: "women",
    title: "Women",
    subtitle: "Direct income transfers, enterprise capital & self-reliance grants",
    ageRange: "All Ages",
    description:
      "State DBT programs (e.g. Gruha Lakshmi, Ladli Behna), Stand-Up India collateral-free loans up to ₹1 Crore, Mahila Samman Savings Certificates, and widow/destitute welfare pensions.",
    iconName: "HeartHandshake",
    accentColor: "from-rose-500 to-pink-600",
    tags: ["Women Entrepreneurship", "Maternity Benefit", "Safety", "Higher Ed"],
    relevantCategories: [
      "Direct Cash Transfers (DBT)",
      "Women-Led Micro-Enterprises",
      "Single Mother & Widow Pension",
      "Higher Education Subsidies",
    ],
    eligibilityDisclaimer:
      "Applicants must meet gender eligibility, state domicile, and specific economic criteria (non-income tax payee status is frequently mandated).",
  },
  {
    key: "farmers",
    title: "Farmers",
    subtitle: "Direct income support, crop insurance & solar pump subsidies",
    ageRange: "18+ Years",
    description:
      "PM-KISAN ₹6,000/yr annual cash installments, Pradhan Mantri Fasal Bima Yojana (PMFBY), Kisan Credit Card (KCC) low-interest working capital, and PM-KUSUM 90% solar water pump subsidies.",
    iconName: "Sprout",
    accentColor: "from-lime-600 to-green-700",
    tags: ["PM-KISAN", "Kisan Credit Card", "Solar Pump", "Crop Insurance"],
    relevantCategories: [
      "Direct Farm Income Support",
      "Subsidized Agricultural Credit",
      "Crop Loss Insurance (PMFBY)",
      "Solar & Farm Equipment Grants",
    ],
    eligibilityDisclaimer:
      "Requires cultivable land ownership recorded in state revenue records (RoR/Khatauni) and completion of biometric e-KYC. Institutional landholders are excluded.",
  },
  {
    key: "entrepreneurs",
    title: "Entrepreneurs",
    subtitle: "Collateral-free credit, startup grants & technology vouchers",
    ageRange: "18+ Years",
    description:
      "PMEGP credit-linked subsidies up to 35%, Pradhan Mantri MUDRA Yojana (Shishu, Kishore, Tarun) collateral-free bank loans, Startup India Seed Fund, and CGTMSE credit guarantees.",
    iconName: "Building2",
    accentColor: "from-blue-600 to-cyan-700",
    tags: ["MUDRA Loan", "PMEGP", "Startup India", "Credit Guarantee"],
    relevantCategories: [
      "Capital Margin Subsidies",
      "Collateral-Free MUDRA Loans",
      "Tech Upgradation Grants",
      "Startup Seed Funding",
    ],
    eligibilityDisclaimer:
      "Applicant must be 18+ with viable Detailed Project Report (DPR). Projects above ₹10L for manufacturing require minimum Class 8 passed education.",
  },
  {
    key: "families",
    title: "Families",
    subtitle: "Universal healthcare coverage, affordable housing & food security",
    ageRange: "Household Unit",
    description:
      "Ayushman Bharat PM-JAY free health hospitalization up to ₹5 Lakhs, Pradhan Mantri Awas Yojana (PMAY) pucca house construction subsidies, and National Food Security subsidized grain rations.",
    iconName: "Home",
    accentColor: "from-teal-600 to-emerald-800",
    tags: ["Ayushman Bharat", "PM Awas", "Food Security", "LPG Subsidy"],
    relevantCategories: [
      "Cashless Health Protection",
      "Affordable Housing (PMAY)",
      "Subsidized Food & Ration",
      "Clean Cooking Fuel (Ujjwala)",
    ],
    eligibilityDisclaimer:
      "Coverage is determined at the household unit level through Socio-Economic Caste Census (SECC) registers, NFSA ration cards, or non-pucca house status.",
  },
  {
    key: "people_with_disabilities",
    title: "Persons with Disabilities",
    subtitle: "Motorized assistive aids, specialized scholarships & mobility grants",
    ageRange: "All Ages",
    description:
      "Assistance to Disabled Persons for Purchase of Aids (ADIP) free motorized tricycles and hearing aids, National Fellowship for Persons with Disabilities, and Divyangjan Swavalamban concessional loans.",
    iconName: "Accessibility",
    accentColor: "from-indigo-600 to-violet-800",
    tags: ["Assistive Devices", "Divyangjan", "Accessible Ed", "ADIP"],
    relevantCategories: [
      "Free Assistive Devices (ALIMCO)",
      "Higher Education Fellowships",
      "Concessional Business Loans",
      "Disability Social Pension",
    ],
    eligibilityDisclaimer:
      "Applicants must possess a valid Unique Disability ID (UDID) card or Medical Board certificate confirming 40% or greater benchmark disability.",
  },
  {
    key: "senior_citizens",
    title: "Senior Citizens",
    subtitle: "Old age pensions, universal health cover & assisted living devices",
    ageRange: "60+ Years",
    description:
      "Indira Gandhi National Old Age Pension Scheme (IGNOAPS) monthly DBT, Ayushman Bharat health coverage expanded to all seniors aged 70+, and Rashtriya Vayoshri Yojana free hearing aids/wheelchairs.",
    iconName: "ShieldCheck",
    accentColor: "from-stone-600 to-slate-800",
    tags: ["Old Age Pension", "Ayushman Vaya", "Atal Pension", "Vayoshri"],
    relevantCategories: [
      "Monthly Social Security Pension",
      "Universal Geriatric Healthcare (70+)",
      "Free Mobility & Hearing Aids",
      "Day Care & Geriatric Centers",
    ],
    eligibilityDisclaimer:
      "Applicant must meet age verification (60+ for general pension, 70+ for universal Ayushman cover). Standard pensions require Below Poverty Line (BPL) ration documentation.",
  },
];
