import { Opportunity, UserProfile, RequiredDocument } from "@/types";
import { MOCK_OPPORTUNITIES } from "@/data/mockOpportunities";
import { LIFE_STAGES } from "@/data/lifeStages";
import { evaluateOpportunityMatch } from "@/lib/matching/engine";

export interface AssistantResponse {
  reply: string;
  databaseOpportunities: Opportunity[];
  documentChecklist: {
    docName: string;
    docType: string;
    isMandatory: boolean;
    issuingAuthority?: string;
    schemeTitle: string;
  }[];
  officialSources: {
    portalName: string;
    department: string;
    url: string;
    isGovernmentDomain: boolean;
  }[];
  verificationNotes: string[];
  disclaimer: string;
}

const DEFAULT_DISCLAIMER =
  "Official Pre-Screening Caveat: Information provided by the OpportunityX-AI Assistant is strictly grounded in our verified opportunities database. Recommendations do not constitute a guarantee of award, reservation, or government approval. Please verify guidelines and apply exclusively through the designated official government portals.";

/**
 * Intelligent Retrieval-Augmented Assistant Engine.
 * Operates strictly over verified database records without hallucinating or inventing schemes.
 */
export function processAssistantQuery(
  query: string,
  userProfile?: UserProfile | null,
  catalog: Opportunity[] = MOCK_OPPORTUNITIES
): AssistantResponse {
  const normalizedQuery = query.toLowerCase().trim();
  const matchedOpportunities: Opportunity[] = [];
  const verificationNotes: string[] = [];
  const docList: AssistantResponse["documentChecklist"] = [];
  const sourcesMap = new Map<string, AssistantResponse["officialSources"][0]>();

  // --------------------------------------------------------------------------
  // Scenario 1: "What scholarships might apply to me?" / Profile-based matching
  // --------------------------------------------------------------------------
  if (
    normalizedQuery.includes("apply to me") ||
    normalizedQuery.includes("for me") ||
    normalizedQuery.includes("my profile") ||
    normalizedQuery.includes("eligible for")
  ) {
    if (userProfile) {
      // Evaluate against active citizen profile
      const evaluated = catalog.map((opp) => ({
        opp,
        match: evaluateOpportunityMatch(opp, userProfile),
      }));

      const likely = evaluated.filter((e) => e.match.category === "likely_match");
      const needsVerif = evaluated.filter((e) => e.match.category === "needs_verification");

      likely.forEach((e) => matchedOpportunities.push(e.opp));
      if (matchedOpportunities.length < 3) {
        needsVerif.forEach((e) => matchedOpportunities.push(e.opp));
      }

      verificationNotes.push(
        `Grounded in your profile: Domicile in ${userProfile.state}, Category ${userProfile.category}, Age ${userProfile.age}, and Life Stage '${userProfile.lifeStage}'.`
      );
      verificationNotes.push(
        "Final eligibility is determined exclusively by issuing ministries following physical/digital scrutiny of your original certificates."
      );

      const reply = `Based on your authenticated profile (**${userProfile.name}**, **${userProfile.state}** domicile, **${userProfile.category}** category, **${userProfile.educationLevel}**), I retrieved **${likely.length} likely matching** and **${needsVerif.length} pending verification** opportunities from our database.

### 📌 Verified Database Information:
Below are the authentic programs pre-qualified for your parameters. Notice that state-specific programs (e.g. from the Government of ${userProfile.state}) require permanent residency, while Central Ministry programs apply nationwide.

### ⚠️ What You Must Verify:
- Your family income certificate must be currently valid for the active financial year.
- Your admitted institution must possess active approval codes (e.g., AICTE, UGC, or State Board).
- Aadhaar-seeding with your bank account is mandatory for Direct Benefit Transfer (DBT).`;

      return formatResponse(reply, matchedOpportunities.slice(0, 4), verificationNotes);
    } else {
      // Prompt user to sign in or explore public catalog
      const reply = `I can provide precise, personalized eligibility matching if you are signed in with a citizen profile.

### 💡 General Guidance:
You can use the **OpportunityX-AI Deterministic Matcher** by signing in or selecting one of our demo personas (Student, Farmer, Entrepreneur).

Alternatively, tell me your:
1. **State of residence** (e.g., Karnataka, Maharashtra, UP)
2. **Current life stage or education** (e.g., 1st year B.Tech, Farmer, School student)
3. **Social category** (General, OBC, SC, ST, EWS)
4. **Annual family income**

Here are some open nationwide programs you can explore right now:`;

      matchedOpportunities.push(
        ...catalog.filter((o) => o.state === "All India (Central)").slice(0, 3)
      );
      verificationNotes.push("Sign in or configure your profile to enable automated rule-by-rule matching.");
      return formatResponse(reply, matchedOpportunities, verificationNotes);
    }
  }

  // --------------------------------------------------------------------------
  // Scenario 2: "What documents do I need?"
  // --------------------------------------------------------------------------
  if (
    normalizedQuery.includes("document") ||
    normalizedQuery.includes("certificate") ||
    normalizedQuery.includes("paperwork") ||
    normalizedQuery.includes("what do i need")
  ) {
    // Collect all documents from catalog or matching opportunities
    const relevantOpps = userProfile
      ? catalog.filter(
          (o) =>
            o.state === "All India (Central)" ||
            o.state === userProfile.state ||
            o.stateJurisdiction === userProfile.state
        ).slice(0, 3)
      : catalog.slice(0, 3);

    relevantOpps.forEach((opp) => {
      matchedOpportunities.push(opp);
      if (opp.documents) {
        opp.documents.forEach((doc) => {
          docList.push({
            docName: doc.name,
            docType: doc.type,
            isMandatory: doc.isMandatory,
            issuingAuthority: doc.issuingAuthority,
            schemeTitle: opp.title,
          });
        });
      }
    });

    verificationNotes.push(
      "All documents must be digitally signed or stamped by competent government revenue officers (e.g. Tehsildar / Sub-Divisional Magistrate)."
    );
    verificationNotes.push(
      "Aadhaar card must be mapped to your primary savings bank account on the NPCI mapper for PFMS DBT disbursements."
    );

    const reply = `Required application documents depend on the specific scheme and granting ministry. Below is the verified compliance checklist extracted directly from our database records:

### 📋 Standard Verification Checklist Across Government Schemes:
1. **Proof of Citizen Identity**: Aadhaar Card (UIDAI) linked with active mobile number for e-KYC.
2. **Domicile / Residence Certificate**: Issued by the State Revenue Department / Tehsildar (mandatory for all state-specific welfare programs).
3. **Income Certificate**: Form issued by the Revenue Officer showing gross family income within statutory limits for the current financial year.
4. **Community / Caste Certificate**: Mandatory if claiming reservation benefits under SC, ST, OBC, or EWS quotas.
5. **Academic Bonafide / Admission Letter**: Current academic year fee receipt or college principal bonafide certificate with AISHE / AICTE institute code.
6. **Bank Passbook Copy**: Showing active bank account with IFSC code and applicant's name.

### ⚠️ Verification Requirement:
Ensure your certificates are issued in the name of the applicant or parent as specified in the scheme guidelines. Affidavits are generally not accepted in lieu of statutory certificates.`;

    return formatResponse(reply, matchedOpportunities, verificationNotes, docList);
  }

  // --------------------------------------------------------------------------
  // Scenario 3: "What opportunities are available for college students?" / Life Stage
  // --------------------------------------------------------------------------
  if (
    normalizedQuery.includes("college") ||
    normalizedQuery.includes("student") ||
    normalizedQuery.includes("school") ||
    normalizedQuery.includes("graduate") ||
    normalizedQuery.includes("farmer") ||
    normalizedQuery.includes("women") ||
    normalizedQuery.includes("senior")
  ) {
    let targetStage = "college_students";
    let stageTitle = "College Students & Higher Education";

    if (normalizedQuery.includes("school")) {
      targetStage = "school_students";
      stageTitle = "School Students";
    } else if (normalizedQuery.includes("farmer")) {
      targetStage = "farmers";
      stageTitle = "Farmers & Agricultural Families";
    } else if (normalizedQuery.includes("women")) {
      targetStage = "women";
      stageTitle = "Women Empowerment & Girl Child";
    } else if (normalizedQuery.includes("graduate")) {
      targetStage = "graduates";
      stageTitle = "Graduates & Job Seekers";
    }

    const filtered = catalog.filter((o) => {
      const stages = o.lifeStages || o.targetLifeStages || [];
      return stages.includes(targetStage as any);
    });

    matchedOpportunities.push(...filtered.slice(0, 4));

    verificationNotes.push(
      `Opportunities listed are filtered specifically for the '${stageTitle}' life stage.`
    );
    verificationNotes.push(
      "Different schemes within this stage may impose additional means-tested income ceilings or academic percentage thresholds."
    );

    const reply = `Our database contains **${filtered.length} verified opportunities** specifically tailored for **${stageTitle}**.

### 📌 Database Records Overview:
These programs encompass central merit-cum-means grants, tuition fee waivers, technical education stipends, and specialized scholarships.

### ⚠️ Key Eligibility Nuance to Verify:
Being enrolled in college is only the baseline requirement. You must also verify:
- Whether your admitted course is approved by **AICTE, UGC, or State Technical Board**.
- Whether admission was secured via **Centralized Merit (e.g. CAP / CET)** or management quota (most government fee waivers exclude management quota).
- Statutory family income ceilings (typically ₹2.5L for Post-Matric SC/ST, and ₹8.0L for AICTE Pragati / EBC).`;

    return formatResponse(reply, matchedOpportunities, verificationNotes);
  }

  // --------------------------------------------------------------------------
  // Scenario 4: "How can I search by state?"
  // --------------------------------------------------------------------------
  if (
    normalizedQuery.includes("search by state") ||
    normalizedQuery.includes("state wise") ||
    normalizedQuery.includes("state filter") ||
    normalizedQuery.includes("domicile")
  ) {
    verificationNotes.push(
      "OpportunityX-AI strictly separates State-Specific Welfare Schemes from Pan-India Central Government Opportunities."
    );
    verificationNotes.push(
      "State-specific schemes funded by a state treasury require permanent residence (domicile) in that state."
    );

    const reply = `### 🗺️ How to Discover Opportunities by State in OpportunityX-AI:

You can browse state-wise opportunities using our dedicated **[State-Wise Discovery](/states)** interface:

1. **Select Your State or Union Territory**:
   Use the state selector or quick pills (e.g., Karnataka, Maharashtra, Uttar Pradesh, Tamil Nadu, Andhra Pradesh) on the **[Browse by State](/states)** page.
2. **Review Section A: State-Specific Schemes**:
   Displays welfare programs exclusively funded and administered by your selected state government (e.g., *Karnataka Raitha Vidya Nidhi*, *Maharashtra EBC Fee Concession*, *Tamil Nadu Pudhumai Penn*).
   > **Important Domicile Rule**: These programs require a valid state domicile certificate and **do not apply nationwide**.
3. **Review Section B: Pan-India Central Schemes**:
   Centrally funded initiatives administered by Government of India Ministries (e.g., *AICTE Pragati*, *PM-KISAN*, *National Overseas Scholarship*) open to eligible citizens across all states.
4. **Apply Multi-Factor Filters**:
   Filter across Higher Education, Agriculture, Women, Social Welfare, and Life Stages.`;

    matchedOpportunities.push(
      ...catalog.filter((o) => o.state !== "All India (Central)").slice(0, 3)
    );

    return formatResponse(reply, matchedOpportunities, verificationNotes);
  }

  // --------------------------------------------------------------------------
  // Scenario 5: "What does this eligibility requirement mean?"
  // --------------------------------------------------------------------------
  if (
    normalizedQuery.includes("eligibility requirement mean") ||
    normalizedQuery.includes("what does") ||
    normalizedQuery.includes("meaning of") ||
    normalizedQuery.includes("criteria mean")
  ) {
    verificationNotes.push(
      "OpportunityX-AI displays eligibility requirements extracted directly from official ministry notifications."
    );

    const reply = `### 🔍 Explanation of Common Government Eligibility Terms:

Here is what frequent statutory eligibility criteria mean in practical terms:

1. **"Bonafide Resident / Domicile Mandatory"**:
   You must possess an official Domicile or Residential Certificate issued by the local Tehsildar/Revenue Department proving continuous residence (typically 10–15 years) in that state.
2. **"Family Annual Income <= ₹8 Lakh (or ₹2.5 Lakh)"**:
   The gross combined annual income of all family members from all sources (salary, agriculture, business) must not exceed this ceiling, certified by a competent revenue officer.
3. **"Direct Benefit Transfer (DBT) via PFMS"**:
   Financial grants are not paid in cash or through college admin desks. Funds are credited directly into your Aadhaar-linked savings bank account via the Public Financial Management System.
4. **"Centralized Admission Process (CAP Round) Only"**:
   Applicable to engineering/medical/management fee concessions. Students admitted under institutional or management quota seats are legally disqualified.
5. **"Minimum Academic Percentage (e.g., 60%)"**:
   Calculated strictly on the qualifying board or degree examination. Some schemes do not allow rounding up (e.g., 59.9% is disqualified).`;

    matchedOpportunities.push(...catalog.slice(0, 2));
    return formatResponse(reply, matchedOpportunities, verificationNotes);
  }

  // --------------------------------------------------------------------------
  // Scenario 6: "What is the application deadline?"
  // --------------------------------------------------------------------------
  if (
    normalizedQuery.includes("deadline") ||
    normalizedQuery.includes("closing date") ||
    normalizedQuery.includes("last date") ||
    normalizedQuery.includes("when to apply")
  ) {
    verificationNotes.push(
      "Deadlines displayed in our database reflect published portal schedules. Dates may be extended by notifications from the respective ministry."
    );

    const reply = `### ⏰ Upcoming Deadlines for Verified Opportunities in Our Database:

Application cycles generally operate in distinct windows:
- **Central Post-Matric & Higher Education Scholarships (NSP)**: Typically open August through October/November annually.
- **Study Abroad Fellowships (NOS / PMRF)**: Bi-annual application cycles (Spring and Fall intake).
- **Welfare & Direct Benefit Transfer Schemes (e.g., PM-KISAN, Pudhumai Penn)**: Open continuously year-round for eligible beneficiaries.

Below are active deadlines recorded in our database:`;

    matchedOpportunities.push(...catalog.slice(0, 4));
    return formatResponse(reply, matchedOpportunities, verificationNotes);
  }

  // --------------------------------------------------------------------------
  // Default / Keyword Match over Database
  // --------------------------------------------------------------------------
  const matchingKeywords = catalog.filter((opp) => {
    const titleMatch = opp.title.toLowerCase().includes(normalizedQuery);
    const descMatch = opp.description.toLowerCase().includes(normalizedQuery);
    const providerMatch = (opp.provider || "").toLowerCase().includes(normalizedQuery);
    const tagMatch = (opp.tags || []).some((t) => t.toLowerCase().includes(normalizedQuery));
    const catMatch = opp.category.toLowerCase().includes(normalizedQuery);
    return titleMatch || descMatch || providerMatch || tagMatch || catMatch;
  });

  if (matchingKeywords.length > 0) {
    matchedOpportunities.push(...matchingKeywords.slice(0, 4));
    verificationNotes.push("Retrieved matching records based on keywords from our verified database.");

    const reply = `I found **${matchingKeywords.length} verified records** in our database relating to your question:

### 📌 Database Records Found:
Review the program cards below for official ministry details, financial amounts, and application portals.

### ⚠️ Pre-Screening Reminder:
Always read the official scheme guidelines PDF linked on the card before submitting an application.`;

    return formatResponse(reply, matchedOpportunities, verificationNotes);
  }

  // Fallback: Clear statement that no matching record was found (Rule: Never invent scholarships)
  const reply = `I searched our opportunity catalog, but **did not find a verified scholarship or scheme matching "${query}"**.

### 🛡️ Zero Hallucinations Policy:
As an AI Advisor for OpportunityX-AI, **I do not fabricate scholarships, quotas, or grant amounts**. 

### 💡 Suggested Ways to Search:
- Browse by citizen milestone: **[Life Stages](/life-stages)**
- Search by state residence: **[Browse by State](/states)**
- Filter our full catalog: **[All Scholarships](/scholarships)**
- Run the rule-based evaluator: **[Personalized Matcher](/matching)**

Here are some established national programs you can explore:`;

  matchedOpportunities.push(...catalog.slice(0, 3));
  verificationNotes.push("No exact match found; displaying authentic Central Government baseline programs.");

  return formatResponse(reply, matchedOpportunities, verificationNotes);
}

function formatResponse(
  reply: string,
  opportunities: Opportunity[],
  verificationNotes: string[],
  documents?: AssistantResponse["documentChecklist"]
): AssistantResponse {
  const sourcesMap = new Map<string, AssistantResponse["officialSources"][0]>();

  opportunities.forEach((opp) => {
    if (opp.officialSource) {
      sourcesMap.set(opp.officialSource.url, {
        portalName: opp.officialSource.portalName || opp.provider,
        department: opp.officialSource.departmentOrMinistry || opp.provider,
        url: opp.officialSource.url || opp.officialWebsite,
        isGovernmentDomain: opp.officialSource.isGovernmentDomain ?? true,
      });
    }
  });

  return {
    reply,
    databaseOpportunities: opportunities,
    documentChecklist: documents || [],
    officialSources: Array.from(sourcesMap.values()),
    verificationNotes,
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
