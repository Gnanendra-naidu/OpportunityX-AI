import { Opportunity, UserProfile, RequiredDocument } from "@/types";
import { MOCK_OPPORTUNITIES } from "@/data/mockOpportunities";
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
  detectedIntent?: string;
}

const DEFAULT_DISCLAIMER =
  "Official Pre-Screening Caveat: Information provided by the OpportunityX-AI Assistant is strictly grounded in our verified opportunities database. Recommendations do not constitute a guarantee of award, reservation, or government approval. Please verify guidelines and apply exclusively through designated official government portals.";

/**
 * Intelligent Intent-Aware Conversational Assistant Engine.
 * Operates strictly over verified database records without hallucinating or inventing schemes.
 * Understands user intent, profile, and selected scholarship context before answering.
 */
export function processAssistantQuery(
  query: string,
  userProfile?: UserProfile | null,
  catalog: Opportunity[] = MOCK_OPPORTUNITIES,
  selectedOpportunity?: Opportunity | null
): AssistantResponse {
  const rawQuery = (query || "").trim();
  const normalizedQuery = rawQuery.toLowerCase();
  const cleanAlpha = normalizedQuery.replace(/[^\w\s]/g, "").trim();

  // Resolve target opportunity: query mention takes highest priority, then active selected opportunity context
  const mentionedOpp = findMentionedOpportunity(normalizedQuery, catalog);
  const targetOpp = mentionedOpp || selectedOpportunity || null;

  // --------------------------------------------------------------------------
  // 1. GREETINGS INTENT
  // User: "hi", "hii", "hello", "hey", "good morning", "namaste", etc.
  // --------------------------------------------------------------------------
  if (isGreeting(cleanAlpha)) {
    const greetingReply =
      "Hi! 👋 Welcome to OpportunityX-AI. How can I help you today? You can ask about scholarships, eligibility, deadlines, applications, or scholarships matching your profile.";

    return {
      reply: greetingReply,
      databaseOpportunities: [],
      documentChecklist: [],
      officialSources: [
        {
          portalName: "National Scholarship Portal (NSP)",
          department: "Ministry of Education & MeitY",
          url: "https://scholarships.gov.in",
          isGovernmentDomain: true,
        },
        {
          portalName: "myScheme Portal",
          department: "Government of India",
          url: "https://www.myscheme.gov.in",
          isGovernmentDomain: true,
        },
      ],
      verificationNotes: [
        "Ask any question regarding verified scholarships, welfare schemes, eligibility criteria, or deadlines.",
      ],
      disclaimer: DEFAULT_DISCLAIMER,
      detectedIntent: "greeting",
    };
  }

  // --------------------------------------------------------------------------
  // 2. GENERAL CONVERSATION INTENT
  // User: "thanks", "thank you", "okay", "great", "bye", etc.
  // Do NOT perform a scholarship search for these messages.
  // --------------------------------------------------------------------------
  const conversationMatch = isGeneralConversation(cleanAlpha);
  if (conversationMatch.isMatch) {
    let reply = "";
    if (conversationMatch.type === "thanks") {
      reply =
        "You're very welcome! 😊 Feel free to ask whenever you need help finding scholarships, checking eligibility rules, or preparing application documents.";
    } else if (conversationMatch.type === "ack" || conversationMatch.type === "praise") {
      reply =
        "Glad to help! 👍 Let me know if you would like to explore scholarships, check deadlines, or find schemes matching your profile.";
    } else if (conversationMatch.type === "bye") {
      reply =
        "Goodbye! 👋 Best of luck with your applications. Don't hesitate to return whenever you need scholarship guidance or deadline alerts!";
    } else {
      reply = "Happy to assist! Feel free to ask anytime about scholarships, schemes, or eligibility.";
    }

    return {
      reply,
      databaseOpportunities: [],
      documentChecklist: [],
      officialSources: [],
      verificationNotes: [],
      disclaimer: DEFAULT_DISCLAIMER,
      detectedIntent: "general_conversation",
    };
  }

  // --------------------------------------------------------------------------
  // 3. CAPABILITIES / HELP INTENT
  // User: "what can you help me with?", "what can you do?", "help", etc.
  // --------------------------------------------------------------------------
  if (isHelpCapabilities(cleanAlpha)) {
    const reply = `I am your **OpportunityX-AI Conversational Advisor**, dedicated to helping Indian citizens discover and apply for verified government scholarships and welfare schemes.

### 💡 What I Can Help You With:
1. **🔍 Scholarship Discovery**: Search and explore central and state government scholarships, fellowships, and subsidies.
2. **🎯 Profile-Based Matching**: Match opportunities against your education, state domicile, social category, and family income.
3. **📋 Eligibility Pre-Screening**: Check statutory requirements, income limits, academic criteria, and reservation norms.
4. **⏰ Deadlines & Timelines**: Find upcoming application closing dates and annual cycle schedules.
5. **📝 Application Guidance**: Learn step-by-step application procedures and access official government portals (NSP, State SSP, myScheme).
6. **📄 Document Checklists**: Review mandatory certificates (Income, Domicile, Caste, AISHE Bonafide) needed for scrutiny.

What would you like to explore today?`;

    return {
      reply,
      databaseOpportunities: [],
      documentChecklist: [],
      officialSources: [
        {
          portalName: "National Scholarship Portal (NSP)",
          department: "Ministry of Education & MeitY",
          url: "https://scholarships.gov.in",
          isGovernmentDomain: true,
        },
        {
          portalName: "myScheme Portal",
          department: "Government of India",
          url: "https://www.myscheme.gov.in",
          isGovernmentDomain: true,
        },
      ],
      verificationNotes: [
        "Select any suggested prompt above or type your specific question to get started.",
      ],
      disclaimer: DEFAULT_DISCLAIMER,
      detectedIntent: "help_capabilities",
    };
  }

  // --------------------------------------------------------------------------
  // 4. WHY NOT ELIGIBLE INTENT
  // User: "why am I not eligible?", "why did I not qualify?", "why am I ineligible?"
  // --------------------------------------------------------------------------
  if (isWhyNotEligible(cleanAlpha, normalizedQuery)) {
    if (targetOpp) {
      if (userProfile) {
        const matchRes = evaluateOpportunityMatch(targetOpp, userProfile);

        if (matchRes.category === "does_not_match") {
          const failReasons = (matchRes.disqualifyingRules || []).map((r) => `- ${r}`);

          const reply = `### ❌ Disqualification Analysis for **${targetOpp.title}**:

Based on your active profile (**${userProfile.name}**, **${userProfile.state}**, **${userProfile.category}**, **${userProfile.educationLevel}**), you do not meet the statutory criteria for this program:

${failReasons.length > 0 ? failReasons.join("\n") : `- **Primary Reason**: ${matchRes.summaryReason}`}

### 💡 Statutory Reference for ${targetOpp.title}:
- **Jurisdiction**: ${targetOpp.state}
- **Provider**: ${targetOpp.provider}
- **Official Details**: [${targetOpp.provider} Portal](${targetOpp.officialWebsite})

You can update your profile parameters if your qualifications or income have changed.`;

          return formatResponse(
            reply,
            [targetOpp],
            [`Disqualification evaluated deterministically against ${targetOpp.title} official guidelines.`],
            undefined,
            "why_not_eligible"
          );
        } else if (matchRes.category === "likely_match") {
          const reply = `### ✅ Good News! You appear **Eligible** for **${targetOpp.title}**!

According to your profile details (**${userProfile.name}**, **${userProfile.state}**, **${userProfile.category}**, **${userProfile.educationLevel}**), you meet all key statutory conditions:
${(matchRes.matchedRules || []).map((r) => `- ${r}`).join("\n")}

You can proceed to apply on the [Official Portal](${targetOpp.officialWebsite}) before the deadline (${targetOpp.deadlineDate || "Year-Round"}).`;

          return formatResponse(
            reply,
            [targetOpp],
            [`Evaluated as Likely Match for ${userProfile.name}.`],
            undefined,
            "why_not_eligible"
          );
        } else {
          // needs_verification
          const reply = `### ⚠️ Verification Required for **${targetOpp.title}**:

You have **not** been disqualified for this opportunity, but your profile needs further verification on the following criteria:
${(matchRes.unknownRules || []).map((r) => `- ${r}`).join("\n")}

Ensure you have the required statutory certificates ready when applying.`;

          return formatResponse(
            reply,
            [targetOpp],
            [`Verification required on specific criteria for ${targetOpp.title}.`],
            undefined,
            "why_not_eligible"
          );
        }
      } else {
        // Guest mode for why not eligible with targetOpp
        const isGenderRestricted =
          Array.isArray(targetOpp.genderEligibility) && !targetOpp.genderEligibility.includes("all");

        const reply = `### 📋 Standard Disqualification Conditions for **${targetOpp.title}**:
Applicants are typically disqualified from **${targetOpp.title}** due to:
- **Residency Mismatch**: Requires domicile in **${targetOpp.state}**.
- **Income Ceiling**: Family gross annual income must be within government limits.
- **Academic Enrollment**: Must be actively enrolled in an AISHE/AICTE-approved institution.
${isGenderRestricted ? `- **Gender**: Restricted strictly to ${targetOpp.genderEligibility.join(", ")} applicants.` : ""}

**Sign In** or select a persona to evaluate your exact profile against this program.`;

        return formatResponse(
          reply,
          [targetOpp],
          ["Sign in to see an automated rule-by-rule eligibility check."],
          undefined,
          "why_not_eligible"
        );
      }
    }

    // Generic why not eligible (no specific opp specified)
    if (userProfile) {
      const reply = `In OpportunityX-AI, eligibility is evaluated strictly against statutory government criteria. Common reasons why scholarships may not match your profile (**${userProfile.name}**, **${userProfile.state}**):

1. **State Domicile Barrier**: State welfare schemes (e.g. Karnataka SSP, Tamil Nadu Pudhumai Penn) require permanent residency in that specific state.
2. **Income Ceiling Restrictions**: Central Post-Matric schemes cap income at ₹2.5 Lakh, while technical schemes like Pragati cap at ₹8.0 Lakh.
3. **Gender or Target Category Restrictions**: Certain schemes are exclusively for female students, PwD, or specific social categories (SC/ST/OBC).
4. **Discipline / Course Mismatch**: Agricultural schemes are restricted to farming families; technical schemes require engineering/diploma programs.

To inspect why a specific scholarship didn't match, select the scholarship or ask *"Why am I not eligible for [Scheme Name]?"*`;

      return formatResponse(
        reply,
        [],
        ["Evaluated against active profile criteria."],
        undefined,
        "why_not_eligible"
      );
    }

    const reply = `Common reasons for government scholarship ineligibility in India include:
1. **Income Ceiling**: Exceeding the maximum annual family income limit (commonly ₹2.5 Lakh or ₹8.0 Lakh).
2. **State Residency**: Lacking the required state domicile certificate for state-funded schemes.
3. **Course / Institute Recognition**: Enrolled institution lacks valid AISHE or AICTE recognition codes.
4. **Reservation Category**: Lacking a valid digital caste/community certificate.

Sign in or select a demo persona to run an automated profile evaluation!`;

    return formatResponse(reply, [], [], undefined, "why_not_eligible");
  }

  // --------------------------------------------------------------------------
  // 5. DEADLINE QUESTIONS INTENT
  // User: "when is the deadline?", "what is the deadline?", "last date to apply"
  // --------------------------------------------------------------------------
  if (isDeadlineInquiry(cleanAlpha, normalizedQuery)) {
    if (targetOpp) {
      const deadline = targetOpp.deadlineDate || targetOpp.applicationDeadline?.closingDate;
      const isYearRound = targetOpp.isYearRound || targetOpp.applicationDeadline?.type === "year_round";

      const reply = `### ⏰ Deadline Information for **${targetOpp.title}**:
- **Application Deadline**: **${isYearRound ? "Year-Round / Continuous Applications" : deadline || "Published in Portal Cycle"}**
- **Cycle Type**: ${targetOpp.applicationDeadline?.type?.replace(/_/g, " ").toUpperCase() || "Annual Cycle"}
- **Provider**: ${targetOpp.provider}
- **Official Website**: [${targetOpp.officialWebsite}](${targetOpp.officialWebsite})

${
  isYearRound
    ? "💡 This program accepts continuous applications across the financial year with periodic batch sanctioning."
    : "⚠️ Applications must be submitted online before 11:59 PM IST on the closing date. We recommend applying at least one week early to allow time for institutional verification."
}`;

      return formatResponse(
        reply,
        [targetOpp],
        ["Dates reflect published portal schedules and may be extended by ministry notification."],
        undefined,
        "deadline_inquiry"
      );
    }

    // Generic deadline inquiry: extract active closing dates from catalog
    const oppsWithDeadlines = catalog
      .filter((o) => o.deadlineDate || o.applicationDeadline?.closingDate)
      .slice(0, 4);

    const yearRoundOpps = catalog
      .filter((o) => o.isYearRound || o.applicationDeadline?.type === "year_round")
      .slice(0, 2);

    const reply = `### ⏰ Upcoming Scholarship Deadlines from Our Database:

Application cycles generally operate in distinct windows:
- **National Scholarship Portal (NSP) Central Schemes**: Annual cycle typically open from August through October/November.
- **State e-Pass / SSP Welfare Schemes**: Usually align with state university academic admission calendars.
- **Welfare & DBT Schemes (e.g. PM-KISAN)**: Open year-round for continuous beneficiary onboarding.

### 📅 Active Closing Dates in Database:
${oppsWithDeadlines
  .map(
    (o) =>
      `- **${o.title}**: Closing Date: **${o.deadlineDate || o.applicationDeadline?.closingDate}** (${o.provider})`
  )
  .join("\n")}
${
  yearRoundOpps.length > 0
    ? `\n**Continuous / Year-Round Opportunities**:\n${yearRoundOpps
        .map((o) => `- **${o.title}**: Open Year-Round (${o.provider})`)
        .join("\n")}`
    : ""
}

Explore the cards below to view deadline details and official portals:`;

    const combined = [...oppsWithDeadlines.slice(0, 3), ...yearRoundOpps.slice(0, 1)];
    return formatResponse(
      reply,
      combined,
      ["Always verify on the official portal as state ministries periodically notify deadline extensions."],
      undefined,
      "deadline_inquiry"
    );
  }

  // --------------------------------------------------------------------------
  // 6. APPLICATION QUESTIONS INTENT
  // User: "how do I apply?", "where can I apply?", "steps to apply", etc.
  // --------------------------------------------------------------------------
  if (isApplicationInquiry(cleanAlpha, normalizedQuery)) {
    if (targetOpp) {
      const reply = `### 📝 How to Apply for **${targetOpp.title}**:

1. **Visit the Designated Portal**:
   Access the official application portal: [${targetOpp.officialWebsite}](${targetOpp.officialWebsite}) (${targetOpp.officialSource?.portalName || targetOpp.provider}).
2. **Register with Aadhaar / OTR**:
   Complete One-Time Registration using your Aadhaar number and mobile OTP.
3. **Upload Mandatory Documents**:
   Prepare: ${
     targetOpp.documents && targetOpp.documents.length > 0
       ? targetOpp.documents.map((d) => `**${d.name}**`).join(", ")
       : "Income Certificate, Domicile, Marksheets, Fee Receipt, and Bank Passbook"
   }.
4. **Submit for Institutional Scrutiny**:
   Submit your application online and forward a printed copy with receipts to your college/school scholarship nodal officer.
5. **Direct Benefit Transfer (DBT)**:
   Upon approval by the State/Central Nodal Ministry, funds will be disbursed via PFMS into your Aadhaar-seeded bank account.`;

      return formatResponse(
        reply,
        [targetOpp],
        ["Never pay fees to third-party agents; all central and state scholarship applications are free."],
        undefined,
        "application_inquiry"
      );
    }

    // Generic application process
    const reply = `### 📝 Official Step-by-Step Scholarship Application Process in India:

1. **Step 1: Identify the Designated Government Portal**
   - **Central Scholarships**: [National Scholarship Portal (NSP)](https://scholarships.gov.in)
   - **State Welfare & Fee Waivers**: Your state's official portal (e.g. Karnataka SSP, Maharashtra MahaDBT, UP Scholarship)
   - **Welfare Schemes & Subsidies**: [myScheme Portal](https://www.myscheme.gov.in)
2. **Step 2: Complete One-Time Registration (OTR)**
   Complete e-KYC using your **Aadhaar** and mobile number to receive a permanent OTR ID.
3. **Step 3: Upload Certified Documents**
   Upload valid Income Certificate (Tehsildar issued), State Domicile Certificate, Caste/Community Certificate (if applicable), and Institute Bonafide/Fee Receipt.
4. **Step 4: Institute Level Verification**
   Your institution's designated scholarship nodal officer must digitally scrutinize and approve your application on the portal.
5. **Step 5: Direct Benefit Transfer (DBT)**
   Approved scholarships are transferred directly to your bank account via PFMS. Ensure your bank account is active and mapped to your Aadhaar on the NPCI mapper.

Below are verified programs you can apply for directly through their official portals:`;

    const sample = catalog.slice(0, 3);
    return formatResponse(
      reply,
      sample,
      ["Application submissions on official government portals are completely free of charge."],
      undefined,
      "application_inquiry"
    );
  }

  // --------------------------------------------------------------------------
  // 7. REQUIRED DOCUMENTS INTENT
  // User: "what documents do I need?", "required documents", "certificates needed"
  // --------------------------------------------------------------------------
  if (
    normalizedQuery.includes("document") ||
    normalizedQuery.includes("certificate") ||
    normalizedQuery.includes("paperwork") ||
    normalizedQuery.includes("what do i need")
  ) {
    if (targetOpp) {
      const docList: AssistantResponse["documentChecklist"] = (targetOpp.documents || []).map((doc) => ({
        docName: doc.name,
        docType: doc.type,
        isMandatory: doc.isMandatory,
        issuingAuthority: doc.issuingAuthority,
        schemeTitle: targetOpp.title,
      }));

      const reply = `### 📄 Required Documents for **${targetOpp.title}**:

To apply for **${targetOpp.title}** through the [Official Portal](${targetOpp.officialWebsite}), you must have the following documents ready for digital upload and nodal scrutiny:

${
  docList.length > 0
    ? docList
        .map(
          (d) =>
            `- **${d.docName}** ${d.isMandatory ? "*(Mandatory)*" : "*(Optional)*"}${
              d.issuingAuthority ? ` — Issued by: ${d.issuingAuthority}` : ""
            }`
        )
        .join("\n")
    : `- **Aadhaar Card** (Identity and e-KYC)
- **State Domicile Certificate** (Proof of Residence)
- **Family Income Certificate** (Tehsildar / Revenue Department)
- **Current Academic Bonafide / Fee Receipt** (College/School)
- **Bank Passbook** (Aadhaar-seeded account for DBT)`
}

### ⚠️ Scrutiny Requirement:
All certificates must be for the current academic/financial year and verifiable on DigiLocker or the state revenue portal.`;

      return formatResponse(
        reply,
        [targetOpp],
        [`Document list extracted directly from official guidelines for ${targetOpp.title}.`],
        docList,
        "document_inquiry"
      );
    }

    // Generic documents inquiry
    const docList: AssistantResponse["documentChecklist"] = [];
    const relevantOpps = userProfile
      ? catalog
          .filter(
            (o) =>
              o.state === "All India (Central)" ||
              o.state === userProfile.state ||
              o.stateJurisdiction === userProfile.state
          )
          .slice(0, 3)
      : catalog.slice(0, 3);

    relevantOpps.forEach((opp) => {
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

    const reply = `Required application documents depend on the specific scheme and granting ministry. Below is the verified compliance checklist extracted directly from our database records:

### 📋 Standard Verification Checklist Across Government Schemes:
1. **Proof of Citizen Identity**: Aadhaar Card (UIDAI) linked with active mobile number for e-KYC.
2. **Domicile / Residence Certificate**: Issued by the State Revenue Department / Tehsildar (mandatory for all state-specific programs).
3. **Income Certificate**: Form issued by a Revenue Officer showing gross family income within statutory limits for the current financial year.
4. **Community / Caste Certificate**: Mandatory if claiming reservation benefits under SC, ST, OBC, or EWS quotas.
5. **Academic Bonafide / Fee Receipt**: Current academic year fee receipt or college principal bonafide certificate with AISHE / AICTE institute code.
6. **Bank Passbook Copy**: Showing active bank account with IFSC code, mapped to Aadhaar via NPCI.`;

    return formatResponse(
      reply,
      relevantOpps,
      [
        "All certificates must be valid for the current financial year and issued by authorized revenue authorities.",
      ],
      docList,
      "document_inquiry"
    );
  }

  // --------------------------------------------------------------------------
  // 8. ELIGIBILITY QUESTIONS INTENT
  // User: "am I eligible?", "am I eligible for this scholarship?", "can I apply for this?"
  // --------------------------------------------------------------------------
  if (isEligibilityInquiry(cleanAlpha, normalizedQuery)) {
    if (targetOpp) {
      const isCentral = targetOpp.state === "All India (Central)";
      const verificationNotes = [
        `Grounded in verified criteria for: ${targetOpp.title}`,
        "Income certificate and academic marksheets must be verified by the issuing nodal officer.",
      ];

      let matchSummary = "";
      if (userProfile) {
        const matchRes = evaluateOpportunityMatch(targetOpp, userProfile);
        const statusBadge =
          matchRes.category === "likely_match"
            ? "✅ Likely Eligible"
            : matchRes.category === "needs_verification"
            ? "⚠️ Verification Required"
            : "❌ Does Not Match Criteria";

        matchSummary = `\n\n### 🎯 Preliminary Check for ${userProfile.name}:
- **Status**: **${statusBadge}**
- **Details**: ${matchRes.summaryReason}
${
  (matchRes.matchedRules || []).length > 0
    ? `\n**Criteria Met**:\n${(matchRes.matchedRules || []).map((r) => `- ✅ ${r}`).join("\n")}`
    : ""
}
${
  (matchRes.disqualifyingRules || []).length > 0
    ? `\n**Disqualifying Points**:\n${(matchRes.disqualifyingRules || []).map((r) => `- ❌ ${r}`).join("\n")}`
    : ""
}
${
  (matchRes.unknownRules || []).length > 0
    ? `\n**Pending Verification**:\n${(matchRes.unknownRules || []).map((r) => `- ⚠️ ${r}`).join("\n")}`
    : ""
}`;
      }

      const reply = `Here are the official eligibility requirements for **${targetOpp.title}** (${targetOpp.provider}):

### 📋 Key Eligibility Criteria:
- **Jurisdiction / Domicile**: ${
        isCentral ? "Open Pan-India (All States)" : `Mandatory permanent domicile of **${targetOpp.state}**`
      }
- **Benefit & Amount**: ${targetOpp.amount} (${targetOpp.benefits})
- **Application Method**: ${targetOpp.applicationMethod.replace(/_/g, " ").toUpperCase()} via [Official Portal](${targetOpp.officialWebsite})
- **Required Documents**: ${
        targetOpp.documents && targetOpp.documents.length > 0
          ? targetOpp.documents.map((d) => d.name).join(", ")
          : "Income certificate, Aadhaar, marksheet, fee receipt"
      }${matchSummary}

### ⚠️ Scrutiny Note:
Final selection is subject to document scrutiny by the nodal department. Ensure your bank account is Aadhaar-linked.`;

      return formatResponse(reply, [targetOpp], verificationNotes, undefined, "eligibility_inquiry");
    }

    // Generic eligibility question
    if (userProfile) {
      const searchCatalog =
        userProfile.lifeStage?.includes("student") || normalizedQuery.includes("scholarship")
          ? catalog.filter(
              (o) =>
                o.type === "scholarship" ||
                (o.lifeStages || []).some((s) => s.includes("student")) ||
                (o.tags || []).some((t) => t.toLowerCase().includes("scholarship") || t.toLowerCase().includes("education"))
            )
          : catalog;

      const evaluated = searchCatalog.map((opp) => ({
        opp,
        match: evaluateOpportunityMatch(opp, userProfile),
      }));
      const likely = evaluated.filter((e) => e.match.category === "likely_match");
      const needsVerif = evaluated.filter((e) => e.match.category === "needs_verification");

      if (likely.length === 0 && needsVerif.length === 0) {
        const reply = `No strong matches found based on your current profile (**${userProfile.name}**, **${userProfile.state}**, **${userProfile.category}**, **${userProfile.educationLevel}**).

### 🔍 Statutory Pre-Screening Evaluation:
- **State Domicile**: Domiciled in **${userProfile.state}** (State-specific schemes from other states were excluded).
- **Life Stage / Education**: **${userProfile.educationLevel || userProfile.lifeStage}** (Schemes for other educational stages were excluded).
- **Income Ceiling**: **${userProfile.incomeRange || "Not specified"}**

💡 You can update your profile details on the [Profile](/profile) page or explore all national opportunities on the [Scholarship Directory](/opportunities).`;

        return formatResponse(
          reply,
          [],
          ["Evaluated against your active profile criteria with zero hallucination."],
          undefined,
          "eligibility_inquiry"
        );
      }

      const displayList = [...likely.map((e) => e.opp), ...needsVerif.map((e) => e.opp)].slice(0, 4);

      const verificationNotes = [
        `Evaluated for ${userProfile.name}: State ${userProfile.state}, Category ${userProfile.category}, Education ${userProfile.educationLevel}.`,
        "Pre-screening does not guarantee government approval.",
      ];

      const reply = `Whether you are eligible depends on five statutory government criteria:
1. **Domicile / Residence**: You reside in **${userProfile.state}** (qualifying for central programs and ${userProfile.state} state welfare).
2. **Family Income Ceiling**: Your annual family income is reported as **${userProfile.incomeRange}** (must be certified by a Tehsildar).
3. **Category Quota**: You belong to the **${userProfile.category}** category (requires caste certificate if claiming reservations).
4. **Academic Course**: Must be enrolled in a recognized institution with valid AISHE/AICTE codes.
5. **No Dual Availment**: Most ministries forbid claiming multiple government scholarships for the same course simultaneously.

Based on your current profile, here are top programs where you appear **pre-qualified**:`;

      return formatResponse(reply, displayList, verificationNotes, undefined, "eligibility_inquiry");
    }

    // Guest generic eligibility
    const verificationNotes = [
      "To check your exact eligibility, provide your state, education level, category, and family income.",
    ];

    const reply = `Government scholarship eligibility in India is determined by five primary statutory factors:

1. **State Domicile**: Central government schemes are open nationwide; state schemes strictly require a permanent residence/domicile certificate from that state.
2. **Family Annual Income**: Most merit-cum-means scholarships require gross annual family income below **₹2.5 Lakh** (Post-Matric SC/ST) or **₹8.0 Lakh** (EBC / AICTE Pragati).
3. **Academic Merit**: A minimum aggregate percentage (usually 50% to 60%) in the qualifying examination.
4. **Approved Institution**: Admission must be secured through regular/merit channels in an AISHE, UGC, or AICTE-recognized institution.
5. **Category & Social Group**: Specialized schemes exist for SC, ST, OBC, EWS, minorities, and girls/women.

Tell me your **course, state, and category**, or review these standard national programs:`;

    const sample = catalog.filter((o) => o.state === "All India (Central)").slice(0, 3);
    return formatResponse(reply, sample, verificationNotes, undefined, "eligibility_inquiry");
  }

  // --------------------------------------------------------------------------
  // 9. PROFILE-BASED QUESTIONS INTENT
  // User: "find scholarships for my profile", "find scholarships matching my profile", etc.
  // --------------------------------------------------------------------------
  if (isProfileMatching(cleanAlpha, normalizedQuery)) {
    if (userProfile) {
      const searchCatalog =
        userProfile.lifeStage?.includes("student") || normalizedQuery.includes("scholarship")
          ? catalog.filter(
              (o) =>
                o.type === "scholarship" ||
                (o.lifeStages || []).some((s) => s.includes("student")) ||
                (o.tags || []).some((t) => t.toLowerCase().includes("scholarship") || t.toLowerCase().includes("education"))
            )
          : catalog;

      // Evaluate against active citizen profile
      const evaluated = searchCatalog.map((opp) => ({
        opp,
        match: evaluateOpportunityMatch(opp, userProfile),
      }));

      const likely = evaluated.filter((e) => e.match.category === "likely_match");
      const needsVerif = evaluated.filter((e) => e.match.category === "needs_verification");

      if (likely.length === 0 && needsVerif.length === 0) {
        const reply = `No strong matches found based on your current profile (**${userProfile.name}**, **${userProfile.state}**, **${userProfile.category}**, **${userProfile.educationLevel}**).

### 🔍 Why Were No Strong Matches Found?
1. **State Domicile**: Schemes from states other than **${userProfile.state}** were excluded.
2. **Income Ceiling**: Certain schemes require annual income strictly below ₹2,50,000.
3. **Course / Target Group**: Incompatible schemes (e.g. farmer-specific schemes, exclusive female-only programs, or disability-only programs) were excluded.

💡 **Suggested Action**: You can update your profile parameters on the [Profile](/profile) page or explore nationwide open schemes on the [All Opportunities](/opportunities) page.`;

        return formatResponse(
          reply,
          [],
          ["Zero incompatible schemes returned. No strong matches for current profile."],
          undefined,
          "profile_matching"
        );
      }

      const matched: Opportunity[] = [];
      likely.forEach((e) => matched.push(e.opp));
      if (matched.length < 3) {
        needsVerif.forEach((e) => matched.push(e.opp));
      }

      const displayList = matched.slice(0, 4);

      const verificationNotes = [
        `Matched against your profile: **${userProfile.name}** (${userProfile.state} Domicile, ${userProfile.category} Category, ${userProfile.educationLevel}).`,
        "Final eligibility is determined exclusively by issuing ministries following physical/digital scrutiny of statutory certificates.",
      ];

      const reply = `Based on your authenticated profile (**${userProfile.name}**, **${userProfile.state}** domicile, **${userProfile.category}** category, **${userProfile.educationLevel}**), I found **${likely.length} likely matching** and **${needsVerif.length} pending verification** opportunities in our verified database.

### 📌 Top Opportunities Matched for You:
Review the program cards below for grant amounts, deadlines, and official portals. Programs from the Government of ${userProfile.state} require state residency, while Central Ministry schemes apply nationwide.

### ⚠️ Key Verification Points for Your Profile:
- **Income Certificate**: Must be issued by a competent Revenue Officer (Tehsildar) for the current financial year.
- **Institute Approval**: Admitted course must carry active AISHE / AICTE / UGC approval codes.
- **Aadhaar Seeding**: Your bank account must be mapped to your Aadhaar on the NPCI mapper for Direct Benefit Transfer (DBT).`;

      return formatResponse(reply, displayList, verificationNotes, undefined, "profile_matching");
    } else {
      // Guest / unauthenticated profile prompt
      const nationalOpps = catalog
        .filter((o) => o.state === "All India (Central)")
        .slice(0, 3);

      const verificationNotes = [
        "Sign in or select a demo persona to enable automated rule-by-rule matching against your parameters.",
      ];

      const reply = `To find scholarships matching your specific profile, you can **Sign In** or select one of our 1-click demo personas (🎓 Student, 🌾 Farmer, 💼 Entrepreneur) from the top bar.

### 💡 Alternatively, tell me:
1. **Your State of residence** (e.g. Karnataka, Maharashtra, Uttar Pradesh)
2. **Current education level or life stage** (e.g. B.Tech 1st year, Class 12, Farmer)
3. **Social Category** (General, OBC, SC, ST, EWS)
4. **Annual Family Income**

In the meantime, here are open nationwide government scholarships you can explore:`;

      return formatResponse(reply, nationalOpps, verificationNotes, undefined, "profile_matching");
    }
  }

  // --------------------------------------------------------------------------
  // 10. SCHOLARSHIP DISCOVERY INTENT
  // User: "what scholarships can I apply for?", "find scholarships for me", "show me scholarships"
  // --------------------------------------------------------------------------
  if (isScholarshipDiscovery(cleanAlpha, normalizedQuery)) {
    if (userProfile) {
      const searchCatalog =
        userProfile.lifeStage?.includes("student") || normalizedQuery.includes("scholarship")
          ? catalog.filter(
              (o) =>
                o.type === "scholarship" ||
                (o.lifeStages || []).some((s) => s.includes("student")) ||
                (o.tags || []).some((t) => t.toLowerCase().includes("scholarship") || t.toLowerCase().includes("education"))
            )
          : catalog;

      const evaluated = searchCatalog.map((opp) => ({
        opp,
        match: evaluateOpportunityMatch(opp, userProfile),
      }));

      const likely = evaluated.filter((e) => e.match.category === "likely_match");
      const needsVerif = evaluated.filter((e) => e.match.category === "needs_verification");

      if (likely.length === 0 && needsVerif.length === 0) {
        const reply = `No strong matches found based on your current profile (**${userProfile.name}**, **${userProfile.state}**, **${userProfile.category}**, **${userProfile.educationLevel}**).

### 🔍 Why Were No Strong Matches Found?
- Verified state-specific schemes require permanent residency in that respective state.
- Some programs cap annual family income strictly below ₹2,50,000.
- Specialized schemes (farmer subsidies, female-only programs, PwD schemes) require specific eligibility criteria.

💡 Try updating your profile details or browse the full directory to see all open schemes.`;

        return formatResponse(
          reply,
          [],
          ["Zero matches found for active profile. Incompatible schemes excluded."],
          undefined,
          "scholarship_discovery"
        );
      }

      const matched = [...likely.map((e) => e.opp), ...needsVerif.map((e) => e.opp)].slice(0, 4);

      const reply = `I searched our verified database for scholarships matching your citizen profile (**${userProfile.name}**, **${userProfile.state}**, **${userProfile.category}**, **${userProfile.educationLevel}**).

Here are the top **${matched.length} scholarships and schemes** you can apply for:

Review the cards below for funding amounts, deadlines, and direct links to official government application portals.`;

      return formatResponse(
        reply,
        matched,
        [
          `Grounded in your profile: Domicile in ${userProfile.state}, Category ${userProfile.category}, Education ${userProfile.educationLevel}.`,
        ],
        undefined,
        "scholarship_discovery"
      );
    } else {
      // Guest discovery
      const topOpps = catalog.slice(0, 4);

      const reply = `Here are prominent verified scholarships and welfare schemes from our database:

You can explore these programs below. For personalized eligibility matching, you can **Sign In** or select a demo persona (Student, Farmer, Entrepreneur) from the top bar to filter specifically by your state, course, and income!`;

      return formatResponse(
        reply,
        topOpps,
        ["Sign in to filter automatically by your state residency and course level."],
        undefined,
        "scholarship_discovery"
      );
    }
  }

  // --------------------------------------------------------------------------
  // 11. SPECIFIC KEYWORD SEARCH OVER DATABASE
  // --------------------------------------------------------------------------
  const matchingKeywords = catalog.filter((opp) => {
    const titleMatch = opp.title.toLowerCase().includes(normalizedQuery);
    const descMatch = opp.description.toLowerCase().includes(normalizedQuery);
    const providerMatch = (opp.provider || "").toLowerCase().includes(normalizedQuery);
    const tagMatch = (opp.tags || []).some((t) => t.toLowerCase().includes(normalizedQuery));
    const catMatch = opp.category.toLowerCase().includes(normalizedQuery);
    return titleMatch || descMatch || providerMatch || tagMatch || catMatch;
  });

  if (matchingKeywords.length > 0 && cleanAlpha.length >= 3) {
    const matched = matchingKeywords.slice(0, 4);
    const reply = `I found **${matchingKeywords.length} verified record(s)** in our database relating to **"${rawQuery}"**:

Review the program details below for eligibility criteria, financial amounts, and official application portals.`;

    return formatResponse(
      reply,
      matched,
      ["Retrieved matching records based on keywords from our verified database."],
      undefined,
      "specific_search"
    );
  }

  // --------------------------------------------------------------------------
  // 12. UNKNOWN OR UNCLEAR QUESTIONS
  // Do not hallucinate. Ask a short clarifying question.
  // Do NOT return generic scholarship recommendations or invent scholarships.
  // --------------------------------------------------------------------------
  const clarifyingReply = `I am your **OpportunityX-AI Scholarship & Scheme Advisor**, strictly grounded in our verified Indian government schemes database.

I didn't quite catch your question. Could you please clarify what you're looking for? 

For example, you can ask:
- *"What scholarships can I apply for?"*
- *"Am I eligible for engineering scholarships?"*
- *"When is the application deadline?"*
- *"How do I apply on the National Scholarship Portal?"*
- *"Find scholarships matching my profile"*

What specific scholarship, state, course, or eligibility topic would you like help with?`;

  return {
    reply: clarifyingReply,
    databaseOpportunities: [],
    documentChecklist: [],
    officialSources: [
      {
        portalName: "National Scholarship Portal (NSP)",
        department: "Ministry of Education & MeitY",
        url: "https://scholarships.gov.in",
        isGovernmentDomain: true,
      },
    ],
    verificationNotes: [
      "Zero Hallucination Policy: OpportunityX-AI only provides verified information from published government notifications.",
    ],
    disclaimer: DEFAULT_DISCLAIMER,
    detectedIntent: "unknown_clarification",
  };
}

// ============================================================================
// INTENT RECOGNITION HELPERS
// ============================================================================

function isGreeting(clean: string): boolean {
  if (!clean) return false;
  // Match single or short greeting phrases: "hi", "hii", "hello", "hey", "good morning", etc.
  const regex =
    /^(h+i+|h+e+l+l+o+|h+e+y+|good\s*(morning|afternoon|evening|day)|namaste|vanakkam|pranam|greetings|howdy)(\s+(there|assistant|bot|opportunityx|team|all|sir|madam))?$/i;
  return regex.test(clean);
}

function isGeneralConversation(clean: string): {
  isMatch: boolean;
  type?: "thanks" | "ack" | "praise" | "bye";
} {
  if (!clean) return { isMatch: false };

  // Thanks
  if (
    /^(thanks|thank\s*(you|u)|thx|thanks\s+a\s+lot|thank\s+you\s+so\s+much|many\s+thanks)(\s+(very\s+much|a\s+lot|assistant|for\s+help|for\s+the\s+help))?$/i.test(
      clean
    )
  ) {
    return { isMatch: true, type: "thanks" };
  }

  // Acknowledgments
  if (
    /^(ok|okay|got\s*it|understood|sure|alright|all\s*right|fine|k)(\s+(thanks|thank\s*you))?$/i.test(
      clean
    )
  ) {
    return { isMatch: true, type: "ack" };
  }

  // Praise
  if (
    /^(great|awesome|perfect|cool|nice|wonderful|excellent|superb|sounds\s+good)(\s+(thanks|thank\s*you|job|work))?$/i.test(
      clean
    )
  ) {
    return { isMatch: true, type: "praise" };
  }

  // Bye
  if (
    /^(bye|goodbye|see\s*you|cya|have\s+a\s+(good|nice)\s+day|take\s*care|see\s*ya|exit|quit)$/i.test(
      clean
    )
  ) {
    return { isMatch: true, type: "bye" };
  }

  return { isMatch: false };
}

function isHelpCapabilities(clean: string): boolean {
  if (!clean) return false;
  return (
    /^(what\s+can\s+you\s+(help\s+(me\s+)?with|do)|how\s+can\s+you\s+help(\s+me)?|what\s+do\s+you\s+do|how\s+does\s+(this|opportunityx|it)\s+work|help(\s+me)?|what\s+are\s+your\s+capabilities)$/i.test(
      clean
    ) ||
    clean.includes("what can you help me with") ||
    clean.includes("what can you do") ||
    clean.includes("how can you help") ||
    clean === "help"
  );
}

function isWhyNotEligible(clean: string, fullQuery: string): boolean {
  return (
    clean.includes("why am i not eligible") ||
    clean.includes("why am i ineligible") ||
    clean.includes("why did i not qualify") ||
    clean.includes("why do i not qualify") ||
    clean.includes("why not eligible") ||
    clean.includes("why ineligible") ||
    clean.includes("why did i fail") ||
    clean.includes("why does not match") ||
    clean.includes("why doesnt match") ||
    clean.includes("why am i disqualified") ||
    clean.includes("disqualification reasons") ||
    clean.includes("reason for rejection") ||
    clean.includes("reason for ineligibility")
  );
}

function isProfileMatching(clean: string, fullQuery: string): boolean {
  return (
    clean.includes("matching my profile") ||
    clean.includes("for my profile") ||
    clean.includes("match my profile") ||
    clean.includes("match me") ||
    clean.includes("scholarships match me") ||
    clean.includes("scholarships that match me") ||
    clean.includes("recommend for my profile") ||
    clean.includes("based on my profile") ||
    clean.includes("fit my profile") ||
    clean === "find scholarships matching my profile" ||
    clean === "find scholarships for my profile"
  );
}

function isEligibilityInquiry(clean: string, fullQuery: string): boolean {
  // If the user asks for a list or discovery ("what scholarships can I apply for"), that is discovery
  if (
    clean.includes("what scholarships") ||
    clean.includes("which scholarships") ||
    clean.includes("find scholarships") ||
    clean.includes("show me scholarships") ||
    clean.includes("show scholarships") ||
    clean.includes("list scholarships") ||
    clean.includes("available scholarships")
  ) {
    return false;
  }

  return (
    clean.includes("am i eligible") ||
    clean.includes("eligible for this") ||
    clean.includes("can i apply for this") ||
    clean.includes("can i apply to this") ||
    clean.includes("can i apply for it") ||
    clean === "can i apply" ||
    clean.startsWith("can i apply for ") ||
    clean.includes("eligibility criteria") ||
    clean.includes("eligibility requirement") ||
    clean.includes("check my eligibility") ||
    clean.includes("am i qualified") ||
    clean.includes("who is eligible")
  );
}

function isDeadlineInquiry(clean: string, fullQuery: string): boolean {
  return (
    clean.includes("when is the deadline") ||
    clean.includes("when should i apply") ||
    clean.includes("what is the deadline") ||
    clean.includes("closing date") ||
    clean.includes("last date to apply") ||
    clean.includes("last date") ||
    clean.includes("application deadline") ||
    clean.includes("deadlines") ||
    clean.includes("deadline") ||
    clean.includes("when to apply") ||
    clean.includes("due date")
  );
}

function isApplicationInquiry(clean: string, fullQuery: string): boolean {
  return (
    clean.includes("how do i apply") ||
    clean.includes("how to apply") ||
    clean.includes("where can i apply") ||
    clean.includes("where do i apply") ||
    clean.includes("application process") ||
    clean.includes("how can i apply") ||
    clean.includes("steps to apply") ||
    clean.includes("how to submit") ||
    clean.includes("application steps") ||
    clean.includes("apply online")
  );
}

function isScholarshipDiscovery(clean: string, fullQuery: string): boolean {
  return (
    clean.includes("what scholarships can i apply for") ||
    clean.includes("scholarships can i apply") ||
    clean.includes("find scholarships for me") ||
    clean.includes("show me scholarships") ||
    clean.includes("what scholarships are available") ||
    clean.includes("find scholarships") ||
    clean.includes("show scholarships") ||
    clean.includes("list scholarships") ||
    clean.includes("available scholarships") ||
    clean.includes("scholarships for me") ||
    clean.includes("scholarship options") ||
    clean.includes("get scholarships") ||
    clean === "scholarships"
  );
}

function findMentionedOpportunity(query: string, catalog: Opportunity[]): Opportunity | undefined {
  const q = query.toLowerCase();

  // 1. Direct ID match
  const idMatch = catalog.find((o) => o.id.toLowerCase() === q);
  if (idMatch) return idMatch;

  // 2. Specific key phrase / scheme name mappings
  if (q.includes("pragati")) return catalog.find((o) => o.title.toLowerCase().includes("pragati"));
  if (q.includes("saksham")) return catalog.find((o) => o.title.toLowerCase().includes("saksham"));
  if (q.includes("pm-kisan") || q.includes("pm kisan") || (q.includes("kisan") && !q.includes("vidya"))) {
    return catalog.find((o) => o.title.toLowerCase().includes("kisan"));
  }
  if (q.includes("raitha") || q.includes("vidya nidhi") || q.includes("vidyanidhi")) {
    return catalog.find((o) => o.title.toLowerCase().includes("vidya nidhi"));
  }
  if (q.includes("pudhumai") || q.includes("penn")) {
    return catalog.find((o) => o.title.toLowerCase().includes("pudhumai"));
  }
  if (q.includes("pmegp") || q.includes("employment generation")) {
    return catalog.find(
      (o) => o.title.toLowerCase().includes("pmegp") || o.title.toLowerCase().includes("employment generation")
    );
  }
  if (q.includes("post-matric") || q.includes("post matric")) {
    return catalog.find(
      (o) => o.title.toLowerCase().includes("post-matric") || o.title.toLowerCase().includes("post matric")
    );
  }
  if (q.includes("overseas")) {
    return catalog.find((o) => o.title.toLowerCase().includes("overseas"));
  }
  if (q.includes("reliance")) {
    return catalog.find((o) => o.title.toLowerCase().includes("reliance"));
  }
  if (q.includes("tata")) {
    return catalog.find((o) => o.title.toLowerCase().includes("tata"));
  }

  // 3. Substring match in title
  for (const opp of catalog) {
    const titleLower = opp.title.toLowerCase();
    if (q.length >= 6 && titleLower.includes(q)) return opp;
  }

  // 4. Word-level match against significant words in title (>= 5 chars, non-stopword)
  const stopwords = new Set([
    "scholarship", "scheme", "national", "central", "state", "portal",
    "eligible", "apply", "deadline", "documents", "about", "which",
    "government", "yojana", "program", "programme", "fellowship"
  ]);
  const words = q.split(/\s+/).filter((w) => w.length >= 4 && !stopwords.has(w));
  for (const word of words) {
    const match = catalog.find((o) => o.title.toLowerCase().includes(word));
    if (match) return match;
  }

  return undefined;
}

function formatResponse(
  reply: string,
  opportunities: Opportunity[],
  verificationNotes: string[],
  documents?: AssistantResponse["documentChecklist"],
  detectedIntent?: string
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
    detectedIntent,
  };
}
