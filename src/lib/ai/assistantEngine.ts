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
  detectedIntent?: string;
}

const DEFAULT_DISCLAIMER =
  "Official Pre-Screening Caveat: Information provided by the OpportunityX-AI Assistant is strictly grounded in our verified opportunities database. Recommendations do not constitute a guarantee of award, reservation, or government approval. Please verify guidelines and apply exclusively through designated official government portals.";

/**
 * Intelligent Intent-Aware Conversational Assistant Engine.
 * Operates strictly over verified database records without hallucinating or inventing schemes.
 * Understands user intent before answering.
 */
export function processAssistantQuery(
  query: string,
  userProfile?: UserProfile | null,
  catalog: Opportunity[] = MOCK_OPPORTUNITIES
): AssistantResponse {
  const rawQuery = (query || "").trim();
  const normalizedQuery = rawQuery.toLowerCase();
  const cleanAlpha = normalizedQuery.replace(/[^\w\s]/g, "").trim();

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
  // 4. PROFILE-BASED QUESTIONS INTENT
  // User: "find scholarships for my profile", "what scholarships match me?",
  //       "find scholarships matching my profile", "match me", etc.
  // --------------------------------------------------------------------------
  if (isProfileMatching(cleanAlpha, normalizedQuery)) {
    if (userProfile) {
      // Evaluate against active citizen profile
      const evaluated = catalog.map((opp) => ({
        opp,
        match: evaluateOpportunityMatch(opp, userProfile),
      }));

      const likely = evaluated.filter((e) => e.match.category === "likely_match");
      const needsVerif = evaluated.filter((e) => e.match.category === "needs_verification");

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
  // 5. ELIGIBILITY QUESTIONS INTENT
  // User: "am I eligible?", "am I eligible for this scholarship?",
  //       "can I apply for this?", "can I apply?", "what are the eligibility criteria?"
  // --------------------------------------------------------------------------
  if (isEligibilityInquiry(cleanAlpha, normalizedQuery)) {
    // Check if a specific scholarship is mentioned
    const specificOpp = findMentionedOpportunity(normalizedQuery, catalog);

    if (specificOpp) {
      const isCentral = specificOpp.state === "All India (Central)";
      const verificationNotes = [
        `Grounded in verified criteria for: ${specificOpp.title}`,
        "Income certificate and academic marksheets must be verified by the issuing nodal officer.",
      ];

      let matchSummary = "";
      if (userProfile) {
        const matchRes = evaluateOpportunityMatch(specificOpp, userProfile);
        matchSummary = `\n\n### 🎯 Preliminary Check for ${userProfile.name}:\n- **Status**: **${
          matchRes.category === "likely_match"
            ? "✅ Likely Eligible"
            : matchRes.category === "needs_verification"
            ? "⚠️ Verification Required"
            : "❌ Likely Ineligible"
        }**\n- **Details**: ${matchRes.summaryReason}`;
      }

      const reply = `Here are the official eligibility requirements for **${specificOpp.title}** (${specificOpp.provider}):

### 📋 Key Eligibility Criteria:
- **Jurisdiction / Domicile**: ${
        isCentral ? "Open Pan-India (All States)" : `Mandatory permanent domicile of **${specificOpp.state}**`
      }
- **Benefit & Amount**: ${specificOpp.amount} (${specificOpp.benefits})
- **Application Method**: ${specificOpp.applicationMethod.replace(/_/g, " ").toUpperCase()} via [Official Portal](${specificOpp.officialWebsite})
- **Required Documents**: ${
        specificOpp.documents && specificOpp.documents.length > 0
          ? specificOpp.documents.map((d) => d.name).join(", ")
          : "Income certificate, Aadhaar, marksheet, fee receipt"
      }${matchSummary}

### ⚠️ Scrutiny Note:
Final selection is subject to document scrutiny by the nodal department. Ensure your bank account is Aadhaar-linked.`;

      return formatResponse(reply, [specificOpp], verificationNotes, undefined, "eligibility_inquiry");
    }

    // Generic eligibility question
    if (userProfile) {
      const evaluated = catalog.map((opp) => ({
        opp,
        match: evaluateOpportunityMatch(opp, userProfile),
      }));
      const likely = evaluated.filter((e) => e.match.category === "likely_match").slice(0, 3);

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

      return formatResponse(reply, likely.map((e) => e.opp), verificationNotes, undefined, "eligibility_inquiry");
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
  // 6. DEADLINE QUESTIONS INTENT
  // User: "when is the deadline?", "when should I apply?",
  //       "what is the closing date?", "last date to apply", etc.
  // --------------------------------------------------------------------------
  if (isDeadlineInquiry(cleanAlpha, normalizedQuery)) {
    const specificOpp = findMentionedOpportunity(normalizedQuery, catalog);

    if (specificOpp) {
      const deadline = specificOpp.deadlineDate || specificOpp.applicationDeadline?.closingDate;
      const isYearRound = specificOpp.isYearRound || specificOpp.applicationDeadline?.type === "year_round";

      const reply = `### ⏰ Deadline Information for **${specificOpp.title}**:
- **Application Deadline**: **${isYearRound ? "Year-Round / Continuous Applications" : deadline || "Published in Portal Cycle"}**
- **Cycle Type**: ${specificOpp.applicationDeadline?.type?.replace(/_/g, " ").toUpperCase() || "Annual Cycle"}
- **Provider**: ${specificOpp.provider}
- **Official Website**: [${specificOpp.officialWebsite}](${specificOpp.officialWebsite})

${
  isYearRound
    ? "💡 This program accepts continuous applications across the financial year with periodic batch sanctioning."
    : "⚠️ Applications must be submitted online before 11:59 PM IST on the closing date. We recommend applying at least one week early to allow time for institutional verification."
}`;

      return formatResponse(reply, [specificOpp], ["Dates reflect published portal schedules and may be extended by ministry notification."], undefined, "deadline_inquiry");
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
  // 7. APPLICATION QUESTIONS INTENT
  // User: "how do I apply?", "where can I apply?",
  //       "what is the application process?", "steps to apply", etc.
  // --------------------------------------------------------------------------
  if (isApplicationInquiry(cleanAlpha, normalizedQuery)) {
    const specificOpp = findMentionedOpportunity(normalizedQuery, catalog);

    if (specificOpp) {
      const reply = `### 📝 How to Apply for **${specificOpp.title}**:

1. **Visit the Designated Portal**:
   Access the official application portal: [${specificOpp.officialWebsite}](${specificOpp.officialWebsite}) (${specificOpp.officialSource?.portalName || specificOpp.provider}).
2. **Register with Aadhaar / OTR**:
   Complete One-Time Registration using your Aadhaar number and mobile OTP.
3. **Upload Mandatory Documents**:
   Prepare: ${
     specificOpp.documents && specificOpp.documents.length > 0
       ? specificOpp.documents.map((d) => `**${d.name}**`).join(", ")
       : "Income Certificate, Domicile, Marksheets, Fee Receipt, and Bank Passbook"
   }.
4. **Submit for Institutional Scrutiny**:
   Submit your application online and forward a printed copy with receipts to your college/school scholarship nodal officer.
5. **Direct Benefit Transfer (DBT)**:
   Upon approval by the State/Central Nodal Ministry, funds will be disbursed via PFMS into your Aadhaar-seeded bank account.`;

      return formatResponse(
        reply,
        [specificOpp],
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
  // 8. SCHOLARSHIP DISCOVERY INTENT
  // User: "what scholarships can I apply for?", "find scholarships for me",
  //       "show me scholarships", "what scholarships are available", etc.
  // --------------------------------------------------------------------------
  if (isScholarshipDiscovery(cleanAlpha, normalizedQuery)) {
    if (userProfile) {
      const evaluated = catalog.map((opp) => ({
        opp,
        match: evaluateOpportunityMatch(opp, userProfile),
      }));

      const likely = evaluated.filter((e) => e.match.category === "likely_match");
      const needsVerif = evaluated.filter((e) => e.match.category === "needs_verification");

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
  // 9. REQUIRED DOCUMENTS INTENT
  // User: "what documents do I need?", "required documents", "certificates needed"
  // --------------------------------------------------------------------------
  if (
    normalizedQuery.includes("document") ||
    normalizedQuery.includes("certificate") ||
    normalizedQuery.includes("paperwork") ||
    normalizedQuery.includes("what do i need")
  ) {
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
  // 10. SPECIFIC KEYWORD SEARCH OVER DATABASE
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
  // 11. UNKNOWN OR UNCLEAR QUESTIONS
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
  for (const opp of catalog) {
    const titleLower = opp.title.toLowerCase();
    // Check specific distinct title words or acronyms
    if (q.includes("pragati") && titleLower.includes("pragati")) return opp;
    if (q.includes("kisan") && titleLower.includes("kisan")) return opp;
    if (q.includes("overseas") && titleLower.includes("overseas")) return opp;
    if (q.includes("vidya nidhi") && titleLower.includes("vidya nidhi")) return opp;
    if (q.includes("pudhumai") && titleLower.includes("pudhumai")) return opp;
    if (q.includes("pmegp") && titleLower.includes("pmegp")) return opp;
    if (q.includes("post-matric") && titleLower.includes("post-matric")) return opp;
    if (q.includes("saksham") && titleLower.includes("saksham")) return opp;
    if (q.includes("tata") && titleLower.includes("tata")) return opp;
    if (q.includes("reliance") && titleLower.includes("reliance")) return opp;
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
