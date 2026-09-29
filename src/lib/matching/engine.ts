import { Opportunity, UserProfile } from "@/types";
import { MatchResult, MatchCategory, RuleEvaluation } from "./types";

/**
 * Standard legal disclaimer attached to all evaluations
 */
export const MATCHING_DISCLAIMER =
  "A 'Likely Match' result indicates preliminary alignment with published eligibility criteria based on your self-reported profile. It is NOT a guarantee of award, reservation, or government approval. Final eligibility and disbursement decisions are made solely by the competent nodal authority upon physical or digital document verification.";

/**
 * Resolves a numeric annual income from either the numeric field or the string range.
 */
export function resolveUserIncome(profile: UserProfile): number | undefined {
  if (profile.annualFamilyIncome !== undefined && profile.annualFamilyIncome > 0) {
    return profile.annualFamilyIncome;
  }
  const range = (profile.incomeRange || "").toLowerCase();
  if (range.includes("below 1.5") || range.includes("below ₹1.5") || range.includes("below 1.5l")) return 140000;
  if ((range.includes("1.5") && range.includes("2.5")) || range.includes("below 2.5") || range.includes("below ₹2.5")) return 200000;
  if (range.includes("2.5") && range.includes("8")) return 450000;
  if (range.includes("above 8")) return 900000;
  return undefined;
}

/**
 * Evaluates a single opportunity against a citizen's profile deterministically.
 * Grounded 100% in database records with zero hallucinations.
 */
export function evaluateOpportunityMatch(
  opportunity: Opportunity,
  profile: UserProfile
): MatchResult {
  const ruleEvaluations: RuleEvaluation[] = [];
  const profileAttributesUsed: MatchResult["profileAttributesUsed"] = [];
  const verificationChecklist: string[] = [];

  let hasFail = false;
  let hasNeedsVerification = false;
  let passCount = 0;

  // --------------------------------------------------------------------------
  // 1. Domicile & State Jurisdiction Evaluation
  // --------------------------------------------------------------------------
  const oppState = opportunity.state || opportunity.stateJurisdiction || "All India (Central)";
  const eligibleStates = opportunity.residencyRequirements?.eligibleStates || [];
  const isCentral =
    oppState === "All India (Central)" ||
    eligibleStates.some(
      (s) => s.toLowerCase().includes("all india") || s.toLowerCase().includes("central")
    );

  const userState = (profile.state || "").trim();

  if (isCentral) {
    ruleEvaluations.push({
      ruleName: "State Domicile & Jurisdiction",
      status: "pass",
      userValue: userState || "All India (Central)",
      schemeRequirement: "All India (Central) - Open Nationwide",
      explanation: `Scheme is centrally sponsored by Government of India and open to eligible residents in ${userState || "all states"} and nationwide.`,
    });
    profileAttributesUsed.push({
      attribute: "Domicile State",
      value: userState || "All India",
      impact: "matched",
    });
    passCount += 1;
  } else if (!userState) {
    hasNeedsVerification = true;
    ruleEvaluations.push({
      ruleName: "State Domicile & Jurisdiction",
      status: "needs_verification",
      userValue: "Unspecified in profile",
      schemeRequirement: `State Domicile: ${oppState}`,
      explanation: `This program requires permanent residency/domicile in ${oppState}. State is not specified in your profile.`,
    });
    profileAttributesUsed.push({
      attribute: "Domicile State",
      value: "Unspecified",
      impact: "unspecified",
    });
  } else {
    const isStateMatch =
      oppState.toLowerCase() === userState.toLowerCase() ||
      eligibleStates.some((s) => s.toLowerCase() === userState.toLowerCase());

    if (isStateMatch) {
      ruleEvaluations.push({
        ruleName: "State Domicile & Jurisdiction",
        status: "pass",
        userValue: userState,
        schemeRequirement: `State Domicile: ${oppState}`,
        explanation: `Your domicile state (${userState}) matches the issuing state government's mandatory residency requirement.`,
      });
      profileAttributesUsed.push({
        attribute: "Domicile State",
        value: userState,
        impact: "matched",
      });
      verificationChecklist.push(
        `Valid ${userState} Domicile / Residence Certificate issued by Tehsildar/Revenue Authority.`
      );
      passCount += 1;
    } else {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "State Domicile & Jurisdiction",
        status: "fail",
        userValue: userState,
        schemeRequirement: `State Domicile: ${oppState} only`,
        explanation: `This program is exclusively funded by the Government of ${oppState} for its registered residents. Residents of ${userState} are not eligible.`,
      });
      profileAttributesUsed.push({
        attribute: "Domicile State",
        value: userState,
        impact: "mismatched",
      });
    }
  }

  // --------------------------------------------------------------------------
  // 2. Life Stage & Milestone Evaluation
  // --------------------------------------------------------------------------
  const oppStages = (opportunity.lifeStages || opportunity.targetLifeStages || []) as string[];
  const userStage = (profile.lifeStage || "") as string;
  const eduLower = (profile.educationLevel || "").toLowerCase();

  const isStudentUser = userStage === "student" || userStage === "college_students" || userStage === "school_students";
  const isCollegeUser =
    userStage === "college_students" ||
    (isStudentUser &&
      (eduLower.includes("undergraduate") ||
        eduLower.includes("postgraduate") ||
        eduLower.includes("b.tech") ||
        eduLower.includes("degree") ||
        eduLower.includes("diploma") ||
        eduLower.includes("college") ||
        eduLower.includes("higher")));
  const isSchoolUser =
    userStage === "school_students" ||
    (isStudentUser &&
      (eduLower.includes("class") || eduLower.includes("school") || eduLower.includes("10")));

  // Disqualify students from senior citizens programs or programs with minAge >= 50
  const isSeniorOnly =
    (oppStages.includes("senior_citizens") || (opportunity.ageRange?.minAge && opportunity.ageRange.minAge >= 50)) &&
    !oppStages.includes("college_students") &&
    !oppStages.includes("school_students");

  if (isSeniorOnly && isStudentUser) {
    hasFail = true;
    ruleEvaluations.push({
      ruleName: "Citizen Life Stage",
      status: "fail",
      userValue: profile.lifeStage,
      schemeRequirement: "Senior Citizens (60+ Years)",
      explanation: "This program is exclusively designated for elderly senior citizens; students are not eligible.",
    });
    profileAttributesUsed.push({
      attribute: "Life Stage",
      value: profile.lifeStage,
      impact: "mismatched",
    });
  } else {
    const isFarmerUser = userStage === "farmer" || userStage === "farmers";
    const oppHasFarmer = oppStages.includes("farmer") || oppStages.includes("farmers");

    const stageMatched =
      oppStages.includes(userStage) ||
      (isFarmerUser && oppHasFarmer) ||
      (isCollegeUser && oppStages.includes("college_students")) ||
      (isSchoolUser && oppStages.includes("school_students")) ||
      (isStudentUser && (oppStages.includes("college_students") || oppStages.includes("school_students"))) ||
      (userStage === "college_students" && oppStages.includes("graduates")) ||
      (userStage === "graduates" && oppStages.includes("college_students")) ||
      (userStage === "school_students" && oppStages.includes("children")) ||
      (oppStages.includes("women") && profile.gender === "female");

    if (stageMatched) {
      ruleEvaluations.push({
        ruleName: "Citizen Life Stage",
        status: "pass",
        userValue: profile.lifeStage,
        schemeRequirement: `Target Stages: ${oppStages.join(", ")}`,
        explanation: `Your current life milestone (${profile.lifeStage}) aligns with the program's target beneficiary group.`,
      });
      profileAttributesUsed.push({
        attribute: "Life Stage",
        value: profile.lifeStage,
        impact: "matched",
      });
      passCount += 1;
    } else {
      // If not matching stage, check if it's open to all families (and not senior/farmer restricted)
      const isRestrictedTarget = oppStages.includes("senior_citizens") || oppStages.includes("farmers");
      if (!isRestrictedTarget && (oppStages.length === 0 || oppStages.includes("families"))) {
        ruleEvaluations.push({
          ruleName: "Citizen Life Stage",
          status: "pass",
          userValue: profile.lifeStage,
          schemeRequirement: "Open / Family Beneficiary",
          explanation: "Scheme applies broadly across households or families.",
        });
        passCount += 1;
      } else {
        hasFail = true;
        ruleEvaluations.push({
          ruleName: "Citizen Life Stage",
          status: "fail",
          userValue: profile.lifeStage,
          schemeRequirement: `Target: ${oppStages.join(", ")}`,
          explanation: `Scheme is designed for ${oppStages.join(", ")}, which does not match your active life stage (${profile.lifeStage}).`,
        });
        profileAttributesUsed.push({
          attribute: "Life Stage",
          value: profile.lifeStage,
          impact: "mismatched",
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. Social Reservation Category Evaluation
  // --------------------------------------------------------------------------
  const oppCategories = opportunity.categoryEligibility || opportunity.casteCategories || ["all"];
  const userCategory = profile.category || profile.casteCategory || "General";

  const isCategoryOpen = oppCategories.includes("all");
  const isCategoryMatched = isCategoryOpen || oppCategories.includes(userCategory as any);

  if (isCategoryOpen) {
    ruleEvaluations.push({
      ruleName: "Social Category (Reservation)",
      status: "pass",
      userValue: userCategory,
      schemeRequirement: "Open to All Social Categories",
      explanation: "Opportunity does not restrict eligibility by caste or affirmative action quota.",
    });
    profileAttributesUsed.push({
      attribute: "Social Category",
      value: userCategory,
      impact: "matched",
    });
    passCount += 1;
  } else if (isCategoryMatched) {
    ruleEvaluations.push({
      ruleName: "Social Category (Reservation)",
      status: "pass",
      userValue: userCategory,
      schemeRequirement: `Reserved for: ${oppCategories.join(", ")}`,
      explanation: `Your category (${userCategory}) matches the designated reservation group for this scheme.`,
    });
    profileAttributesUsed.push({
      attribute: "Social Category",
      value: userCategory,
      impact: "matched",
    });
    verificationChecklist.push(`Valid ${userCategory} Community/Caste Certificate issued by competent government authority.`);
    passCount += 1;
  } else {
    hasFail = true;
    ruleEvaluations.push({
      ruleName: "Social Category (Reservation)",
      status: "fail",
      userValue: userCategory,
      schemeRequirement: `Exclusively for: ${oppCategories.join(", ")}`,
      explanation: `This program is legally designated exclusively for ${oppCategories.join(", ")}; candidates belonging to ${userCategory} are not eligible.`,
    });
    profileAttributesUsed.push({
      attribute: "Social Category",
      value: userCategory,
      impact: "mismatched",
    });
  }

  // --------------------------------------------------------------------------
  // 4. Family Income Ceiling Evaluation
  // --------------------------------------------------------------------------
  const maxIncome =
    opportunity.incomeCriteria?.maxAnnualIncome ||
    opportunity.maxFamilyIncome ||
    null;

  const notesLower = (opportunity.incomeCriteria?.notes || "").toLowerCase();
  const isBplScheme =
    notesLower.includes("bpl") ||
    notesLower.includes("below poverty line") ||
    notesLower.includes("secc");

  const effectiveMaxIncome = maxIncome || (isBplScheme ? 250000 : null);
  const isIncomeRestricted =
    opportunity.incomeCriteria?.isRestricted || (effectiveMaxIncome !== null && effectiveMaxIncome > 0);

  if (!isIncomeRestricted || !effectiveMaxIncome) {
    ruleEvaluations.push({
      ruleName: "Annual Family Income Ceiling",
      status: "pass",
      userValue: profile.incomeRange || "Unrestricted",
      schemeRequirement: "No Income Restriction",
      explanation: "This program does not impose a maximum parental or household income ceiling.",
    });
    passCount += 1;
  } else {
    const userIncomeNum = resolveUserIncome(profile);

    if (userIncomeNum !== undefined && userIncomeNum > 0) {
      if (userIncomeNum <= effectiveMaxIncome) {
        ruleEvaluations.push({
          ruleName: "Annual Family Income Ceiling",
          status: "pass",
          userValue: `₹${userIncomeNum.toLocaleString("en-IN")} / year`,
          schemeRequirement: `Maximum: ₹${effectiveMaxIncome.toLocaleString("en-IN")} / year`,
          explanation: `Your family income (₹${userIncomeNum.toLocaleString("en-IN")}) is within the statutory maximum cap (<= ₹${effectiveMaxIncome.toLocaleString("en-IN")}).`,
        });
        profileAttributesUsed.push({
          attribute: "Family Income",
          value: `₹${userIncomeNum.toLocaleString("en-IN")}`,
          impact: "matched",
        });
        verificationChecklist.push(`Income Certificate from Revenue Department verifying annual family income <= ₹${effectiveMaxIncome.toLocaleString("en-IN")}.`);
        passCount += 1;
      } else {
        hasFail = true;
        ruleEvaluations.push({
          ruleName: "Annual Family Income Ceiling",
          status: "fail",
          userValue: `₹${userIncomeNum.toLocaleString("en-IN")} / year`,
          schemeRequirement: `Maximum: ₹${effectiveMaxIncome.toLocaleString("en-IN")} / year`,
          explanation: `Reported family income (₹${userIncomeNum.toLocaleString("en-IN")}) exceeds the statutory maximum ceiling of ₹${effectiveMaxIncome.toLocaleString("en-IN")}.`,
        });
        profileAttributesUsed.push({
          attribute: "Family Income",
          value: `₹${userIncomeNum.toLocaleString("en-IN")}`,
          impact: "mismatched",
        });
      }
    } else {
      hasNeedsVerification = true;
      ruleEvaluations.push({
        ruleName: "Annual Family Income Ceiling",
        status: "needs_verification",
        userValue: profile.incomeRange || "Unspecified in profile",
        schemeRequirement: `Maximum: ₹${effectiveMaxIncome.toLocaleString("en-IN")} / year`,
        explanation: `Scheme imposes an income ceiling of ₹${effectiveMaxIncome.toLocaleString("en-IN")}. Please verify your official Income Certificate issued by a Tehsildar.`,
      });
      profileAttributesUsed.push({
        attribute: "Income Range",
        value: profile.incomeRange || "Unspecified",
        impact: "unverified",
      });
      verificationChecklist.push(`Check that your Income Certificate states annual income below ₹${effectiveMaxIncome.toLocaleString("en-IN")}.`);
    }
  }

  // --------------------------------------------------------------------------
  // 5. Gender Eligibility Evaluation
  // --------------------------------------------------------------------------
  const oppGenders = opportunity.genderEligibility || opportunity.eligibleGenders || ["all"];
  const userGender = profile.gender || "unspecified";

  if (oppGenders.includes("all")) {
    ruleEvaluations.push({
      ruleName: "Gender Eligibility",
      status: "pass",
      userValue: userGender,
      schemeRequirement: "All Genders Eligible",
      explanation: "Scheme is open to all genders without gender-based quotas.",
    });
    passCount += 1;
  } else if (userGender !== "unspecified" && oppGenders.includes(userGender as any)) {
    ruleEvaluations.push({
      ruleName: "Gender Eligibility",
      status: "pass",
      userValue: userGender,
      schemeRequirement: `Restricted to: ${oppGenders.join(", ")}`,
      explanation: `Program is tailored for ${oppGenders.join(", ")}, matching your profile.`,
    });
    profileAttributesUsed.push({
      attribute: "Gender",
      value: userGender,
      impact: "matched",
    });
    passCount += 1;
  } else if (userGender === "unspecified") {
    hasNeedsVerification = true;
    ruleEvaluations.push({
      ruleName: "Gender Eligibility",
      status: "needs_verification",
      userValue: "Not specified in profile",
      schemeRequirement: `Restricted to: ${oppGenders.join(", ")}`,
      explanation: `Program requires beneficiary to be ${oppGenders.join(", ")}. Gender is unspecified in your profile.`,
    });
    profileAttributesUsed.push({
      attribute: "Gender",
      value: "Unspecified",
      impact: "unspecified",
    });
  } else {
    hasFail = true;
    ruleEvaluations.push({
      ruleName: "Gender Eligibility",
      status: "fail",
      userValue: userGender,
      schemeRequirement: `Exclusively for: ${oppGenders.join(", ")}`,
      explanation: `Scheme is exclusively for ${oppGenders.join(", ")}; candidates of ${userGender} gender are not eligible.`,
    });
    profileAttributesUsed.push({
      attribute: "Gender",
      value: userGender,
      impact: "mismatched",
    });
  }

  // --------------------------------------------------------------------------
  // 6. Disability (PwD / Divyangjan) Evaluation
  // --------------------------------------------------------------------------
  const isExclusiveDisability =
    opportunity.disabilityEligibility?.isExclusiveForDisability ||
    opportunity.disabilityEligibleOnly ||
    false;

  const isUserDisabled = profile.disabilityStatus ?? profile.isDisabled ?? false;

  if (isExclusiveDisability) {
    if (isUserDisabled) {
      ruleEvaluations.push({
        ruleName: "Persons with Disabilities (PwD)",
        status: "pass",
        userValue: "PwD Status Active",
        schemeRequirement: "Exclusively for Persons with Disabilities",
        explanation: "Scheme provides specialized assistive funding for registered persons with disabilities.",
      });
      profileAttributesUsed.push({
        attribute: "Disability Status",
        value: "Registered PwD",
        impact: "matched",
      });
      verificationChecklist.push("Unique Disability ID (UDID) Card or Medical Board Certificate (min 40% disability).");
      passCount += 1;
    } else {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "Persons with Disabilities (PwD)",
        status: "fail",
        userValue: "Not declared as PwD",
        schemeRequirement: "Exclusively for Persons with Disabilities (min 40%)",
        explanation: "This scheme is legally reserved exclusively for Divyangjan / persons with disabilities.",
      });
      profileAttributesUsed.push({
        attribute: "Disability Status",
        value: "Non-PwD",
        impact: "mismatched",
      });
    }
  }

  // --------------------------------------------------------------------------
  // 7. Education Level Evaluation
  // --------------------------------------------------------------------------
  const oppEduLevels = opportunity.educationLevels || [];
  const minEdu = opportunity.minEducationLevel || opportunity.educationRequirements?.minEducationLevel || "";
  const userEdu = profile.educationLevel || "Undergraduate";

  if (oppEduLevels.length > 0 || minEdu) {
    const eduString = (oppEduLevels.join(" ") + " " + minEdu).toLowerCase();
    const userEduLower = userEdu.toLowerCase();

    const isDoctoral =
      eduString.includes("doctoral") ||
      eduString.includes("phd") ||
      eduString.includes("research fellowship");

    const isSchoolOnly =
      (eduString.includes("class 8") ||
        eduString.includes("class 10") ||
        eduString.includes("class 11") ||
        eduString.includes("pre-matric") ||
        eduString.includes("school")) &&
      !eduString.includes("undergraduate") &&
      !eduString.includes("degree") &&
      !eduString.includes("post-matric") &&
      !eduString.includes("graduates");

    const isHigherEduOnly =
      (eduString.includes("undergraduate") ||
        eduString.includes("b.tech") ||
        eduString.includes("b.e.") ||
        eduString.includes("b.sc") ||
        eduString.includes("b.com") ||
        eduString.includes("b.a.") ||
        eduString.includes("degree") ||
        eduString.includes("post-matric") ||
        eduString.includes("higher education") ||
        (oppStages.includes("college_students") && !oppStages.includes("school_students"))) &&
      !eduString.includes("class 10 or below") &&
      !eduString.includes("class 8 to");

    const isPrimaryPupil =
      userEduLower.includes("primary") ||
      userEduLower.includes("class 1") ||
      userEduLower.includes("class 2") ||
      userEduLower.includes("class 3") ||
      userEduLower.includes("class 4") ||
      userEduLower.includes("class 5");

    const isSchoolPupil =
      isPrimaryPupil ||
      userEduLower.includes("class 10 or below") ||
      userEduLower.includes("class 10 passed") ||
      userEduLower.includes("class 8") ||
      userEduLower.includes("class 6") ||
      userEduLower.includes("class 7") ||
      userEduLower.includes("class 9") ||
      userEduLower.includes("pre-matric");

    const requiresSecondaryOrAbove =
      eduString.includes("class 8") ||
      eduString.includes("class 10") ||
      eduString.includes("high school") ||
      eduString.includes("matric") ||
      eduString.includes("b.sc") ||
      eduString.includes("undergraduate");

    if (isDoctoral && !userEduLower.includes("doctoral") && !userEduLower.includes("phd") && !userEduLower.includes("postgraduate") && !userEduLower.includes("master")) {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "Education Level",
        status: "fail",
        userValue: userEdu,
        schemeRequirement: `Postgraduate / Doctoral (Ph.D.) Level`,
        explanation: `This advanced fellowship strictly requires enrollment in Doctoral / Master's research, whereas your profile indicates ${userEdu}.`,
      });
      profileAttributesUsed.push({
        attribute: "Education Level",
        value: userEdu,
        impact: "mismatched",
      });
    } else if (isPrimaryPupil && (requiresSecondaryOrAbove || isHigherEduOnly || isDoctoral)) {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "Education Level",
        status: "fail",
        userValue: userEdu,
        schemeRequirement: "Class 8 / Class 10 / Higher Education Level",
        explanation: `This program requires enrollment in Class 8, Class 10, or higher education, whereas your profile indicates Primary School (${userEdu}).`,
      });
      profileAttributesUsed.push({
        attribute: "Education Level",
        value: userEdu,
        impact: "mismatched",
      });
    } else if (isSchoolOnly && (userEduLower.includes("undergraduate") || userEduLower.includes("degree") || userEduLower.includes("postgraduate") || userEduLower.includes("doctoral") || userEduLower.includes("working"))) {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "Education Level",
        status: "fail",
        userValue: userEdu,
        schemeRequirement: `School Level (Class 8 - 12 / Pre-Matric)`,
        explanation: `This scheme is exclusively designed for school-level pupils, whereas your profile indicates ${userEdu}.`,
      });
      profileAttributesUsed.push({
        attribute: "Education Level",
        value: userEdu,
        impact: "mismatched",
      });
    } else if (isHigherEduOnly && isSchoolPupil) {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "Education Level",
        status: "fail",
        userValue: userEdu,
        schemeRequirement: "Post-Matric / Undergraduate Degree Level",
        explanation: `This program strictly requires enrollment in post-matric / undergraduate degree or diploma studies, whereas your profile indicates ${userEdu}.`,
      });
      profileAttributesUsed.push({
        attribute: "Education Level",
        value: userEdu,
        impact: "mismatched",
      });
    } else {
      ruleEvaluations.push({
        ruleName: "Education Level",
        status: "pass",
        userValue: userEdu,
        schemeRequirement: oppEduLevels.length > 0 ? oppEduLevels.slice(0, 2).join(", ") : (minEdu || "Post-Matric / Higher Education"),
        explanation: `Your current education level (${userEdu}) satisfies the qualifying academic stage requirements.`,
      });
      profileAttributesUsed.push({
        attribute: "Education Level",
        value: userEdu,
        impact: "matched",
      });
      passCount += 1;
    }
  } else {
    ruleEvaluations.push({
      ruleName: "Education Level",
      status: "pass",
      userValue: userEdu,
      schemeRequirement: "Open Across Education Levels",
      explanation: "Scheme does not impose restrictions on academic education level.",
    });
    passCount += 1;
  }

  // --------------------------------------------------------------------------
  // 8. Field of Study / Course Stream Evaluation
  // --------------------------------------------------------------------------
  const eligibleCourses = opportunity.educationRequirements?.eligibleCourses || [];
  const userStream = profile.courseStream || "";
  const userStreamLower = userStream.toLowerCase();
  const oppCategoryLower = (opportunity.category || "").toLowerCase();
  const oppTitleLower = opportunity.title.toLowerCase();

  const isTechnicalOnly =
    oppTitleLower.includes("aicte") ||
    oppTitleLower.includes("pragati") ||
    oppCategoryLower.includes("technical") ||
    oppTitleLower.includes("engineering") ||
    eligibleCourses.some(c => c.toLowerCase().includes("b.tech") || c.toLowerCase().includes("engineering"));

  const isMedicalOnly =
    oppTitleLower.includes("medical") ||
    oppCategoryLower.includes("medical") ||
    oppCategoryLower.includes("healthcare") ||
    eligibleCourses.some(c => c.toLowerCase().includes("mbbs"));

  const isAgricultureOnly =
    oppTitleLower.includes("raitha") ||
    oppTitleLower.includes("kisan") ||
    oppCategoryLower.includes("agriculture");

  if (isTechnicalOnly) {
    const isTechStudent =
      userStreamLower.includes("engineering") ||
      userStreamLower.includes("technology") ||
      userStreamLower.includes("computer") ||
      userStreamLower.includes("it") ||
      userStreamLower.includes("polytechnic") ||
      userStreamLower.includes("diploma");

    if (isTechStudent) {
      ruleEvaluations.push({
        ruleName: "Course Stream / Discipline",
        status: "pass",
        userValue: userStream || "Technical Stream",
        schemeRequirement: "Technical / Engineering (AICTE / State Technical Board)",
        explanation: `Your field of study (${userStream || "Engineering"}) matches the mandatory technical/engineering curriculum requirement.`,
      });
      profileAttributesUsed.push({
        attribute: "Course Stream",
        value: userStream || "Technical / Engineering",
        impact: "matched",
      });
      verificationChecklist.push("Bonafide Student Certificate issued by AICTE/State-approved technical institution.");
      passCount += 1;
    } else if (userStream) {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "Course Stream / Discipline",
        status: "fail",
        userValue: userStream,
        schemeRequirement: "Technical / Engineering Degrees (B.Tech / B.E. / Engineering Diploma)",
        explanation: `This program is legally designated exclusively for AICTE technical/engineering candidates; ${userStream} is not eligible.`,
      });
      profileAttributesUsed.push({
        attribute: "Course Stream",
        value: userStream,
        impact: "mismatched",
      });
    } else {
      hasNeedsVerification = true;
      ruleEvaluations.push({
        ruleName: "Course Stream / Discipline",
        status: "needs_verification",
        userValue: "Not specified in profile",
        schemeRequirement: "Technical / Engineering Degrees",
        explanation: "Scheme requires technical degree/diploma enrollment. Please confirm your academic stream.",
      });
    }
  } else if (isMedicalOnly) {
    const isMedStudent =
      userStreamLower.includes("med") ||
      userStreamLower.includes("mbbs") ||
      userStreamLower.includes("nurs") ||
      userStreamLower.includes("pharm") ||
      userStreamLower.includes("health");

    if (isMedStudent) {
      ruleEvaluations.push({
        ruleName: "Course Stream / Discipline",
        status: "pass",
        userValue: userStream,
        schemeRequirement: "Medical / Healthcare / Allied Sciences",
        explanation: `Your field of study (${userStream}) fulfills the medical/healthcare discipline requirement.`,
      });
      profileAttributesUsed.push({
        attribute: "Course Stream",
        value: userStream,
        impact: "matched",
      });
      passCount += 1;
    } else if (userStream) {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "Course Stream / Discipline",
        status: "fail",
        userValue: userStream,
        schemeRequirement: "Medical / Healthcare Disciplines Only",
        explanation: `Exclusively for students pursuing Medical, Healthcare, or Allied Health Sciences.`,
      });
      profileAttributesUsed.push({
        attribute: "Course Stream",
        value: userStream,
        impact: "mismatched",
      });
    }
  } else if (isAgricultureOnly) {
    const isAgri =
      (profile.lifeStage as string) === "farmer" ||
      profile.lifeStage === "farmers" ||
      userStreamLower.includes("agri") ||
      (profile.occupation || "").toLowerCase().includes("farmer");

    if (isAgri) {
      ruleEvaluations.push({
        ruleName: "Course Stream / Beneficiary Category",
        status: "pass",
        userValue: userStream || "Farmer Beneficiary",
        schemeRequirement: "Agricultural Community / Farmer Children",
        explanation: "Qualifies under farmer family educational / agricultural beneficiary criteria.",
      });
      profileAttributesUsed.push({
        attribute: "Beneficiary Group",
        value: "Agricultural Family",
        impact: "matched",
      });
      passCount += 1;
    } else {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "Course Stream / Beneficiary Category",
        status: "fail",
        userValue: userStream || "Non-Agricultural",
        schemeRequirement: "Registered Agricultural Landholders / Farmer Beneficiaries Only",
        explanation: "This program is statutorily designated exclusively for farmers or children of registered agricultural landholders.",
      });
      profileAttributesUsed.push({
        attribute: "Beneficiary Group",
        value: "Non-Agricultural",
        impact: "mismatched",
      });
    }
  } else {
    ruleEvaluations.push({
      ruleName: "Course Stream / Discipline",
      status: "pass",
      userValue: userStream || "Open Stream",
      schemeRequirement: "Open Across All Academic Disciplines",
      explanation: "Scheme accepts applications across all recognized academic disciplines and degree programs.",
    });
    passCount += 1;
  }

  // --------------------------------------------------------------------------
  // 9. Academic Marks / Qualifying Percentage Evaluation
  // --------------------------------------------------------------------------
  const minPercent =
    opportunity.minAcademicPercentage ||
    opportunity.educationRequirements?.minAcademicPercentage ||
    null;
  const userPercent = profile.academicPercentage;

  if (minPercent !== null && minPercent > 0) {
    if (userPercent !== undefined && userPercent > 0) {
      if (userPercent >= minPercent) {
        ruleEvaluations.push({
          ruleName: "Qualifying Academic Merit Score",
          status: "pass",
          userValue: `${userPercent}% Marks / CGPA Equivalent`,
          schemeRequirement: `Minimum Cutoff: ${minPercent}%`,
          explanation: `Your qualifying academic percentage (${userPercent}%) satisfies the minimum statutory cutoff (>= ${minPercent}%).`,
        });
        profileAttributesUsed.push({
          attribute: "Academic Marks",
          value: `${userPercent}%`,
          impact: "matched",
        });
        verificationChecklist.push(`Marksheet verifying score >= ${minPercent}% in qualifying board / university examination.`);
        passCount += 1;
      } else {
        hasFail = true;
        ruleEvaluations.push({
          ruleName: "Qualifying Academic Merit Score",
          status: "fail",
          userValue: `${userPercent}% Marks`,
          schemeRequirement: `Minimum Cutoff: ${minPercent}%`,
          explanation: `Your academic percentage (${userPercent}%) is below the statutory qualifying threshold of ${minPercent}%.`,
        });
        profileAttributesUsed.push({
          attribute: "Academic Marks",
          value: `${userPercent}%`,
          impact: "mismatched",
        });
      }
    } else {
      hasNeedsVerification = true;
      ruleEvaluations.push({
        ruleName: "Qualifying Academic Merit Score",
        status: "needs_verification",
        userValue: "Marks unspecified in profile",
        schemeRequirement: `Minimum Cutoff: ${minPercent}%`,
        explanation: `A minimum cutoff of ${minPercent}% in qualifying exam applies. Verify marksheet against portal criteria.`,
      });
      profileAttributesUsed.push({
        attribute: "Academic Marks",
        value: "Not Specified",
        impact: "unverified",
      });
      verificationChecklist.push(`Verify that your qualifying examination marksheet shows at least ${minPercent}%.`);
    }
  } else {
    ruleEvaluations.push({
      ruleName: "Qualifying Academic Merit Score",
      status: "pass",
      userValue: userPercent !== undefined ? `${userPercent}%` : "Passed",
      schemeRequirement: "Passing Qualifying Examination",
      explanation: "No statutory minimum percentage cutoff prescribed; passing the previous qualifying exam is required.",
    });
    passCount += 1;
  }

  // --------------------------------------------------------------------------
  // 10. Religious / Linguistic Minority Eligibility
  // --------------------------------------------------------------------------
  const isMinorityScheme =
    (opportunity.category || "").toLowerCase().includes("minority") ||
    (opportunity.tags || []).some((t) => t.toLowerCase().includes("minority"));

  if (isMinorityScheme) {
    if (profile.isMinority) {
      ruleEvaluations.push({
        ruleName: "Minority Community Reservation",
        status: "pass",
        userValue: "Minority Community Status Active",
        schemeRequirement: "Notified Minority Community Beneficiary",
        explanation: "Your self-reported minority community status aligns with the scheme's statutory mandate.",
      });
      profileAttributesUsed.push({
        attribute: "Minority Status",
        value: "Minority Beneficiary",
        impact: "matched",
      });
      verificationChecklist.push("Self-declaration / Community Certificate confirming minority status.");
      passCount += 1;
    } else {
      hasFail = true;
      ruleEvaluations.push({
        ruleName: "Minority Community Reservation",
        status: "fail",
        userValue: "Not declared as Minority",
        schemeRequirement: "Exclusively for Registered Minority Communities",
        explanation: "This scholarship is statutorily designated exclusively for students belonging to notified minority communities.",
      });
      profileAttributesUsed.push({
        attribute: "Minority Status",
        value: "Non-Minority",
        impact: "mismatched",
      });
    }
  }

  // --------------------------------------------------------------------------
  // 11. Specialized Scheme Prerequisites (What the User Must Verify)
  // --------------------------------------------------------------------------
  if (opportunity.eligibilityBullets && opportunity.eligibilityBullets.length > 0) {
    opportunity.eligibilityBullets.forEach((bullet) => {
      if (
        bullet.toLowerCase().includes("aicte") ||
        bullet.toLowerCase().includes("cap round") ||
        bullet.toLowerCase().includes("fruits") ||
        bullet.toLowerCase().includes("government school") ||
        bullet.toLowerCase().includes("admission") ||
        bullet.toLowerCase().includes("attendance")
      ) {
        verificationChecklist.push(`Prerequisite: ${bullet}`);
      }
    });
  }

  // Add document checks from the required_documents table
  if (opportunity.documents && opportunity.documents.length > 0) {
    opportunity.documents.forEach((doc) => {
      if (doc.isMandatory) {
        verificationChecklist.push(`Mandatory Document: ${doc.name} (Issuing Authority: ${doc.issuingAuthority || "Competent Government Officer"})`);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 12. Determine Final Match Category & Explanations
  // --------------------------------------------------------------------------
  let category: MatchCategory;
  let summaryReason: string;
  let matchScore: number;

  const failedRules = ruleEvaluations.filter((r) => r.status === "fail");
  const unverifiedRules = ruleEvaluations.filter((r) => r.status === "needs_verification");
  const passedRules = ruleEvaluations.filter((r) => r.status === "pass");

  if (hasFail) {
    category = "does_not_match";
    summaryReason = `Does not meet ${failedRules.length} mandatory requirement(s): ${failedRules
      .map((r) => `${r.ruleName} (${r.explanation})`)
      .slice(0, 2)
      .join("; ")}.`;
    matchScore = Math.max(10, Math.min(35, 100 - failedRules.length * 25));
  } else if (hasNeedsVerification) {
    category = "needs_verification";
    summaryReason = `Potential match, but ${unverifiedRules.length} requirement(s) (${unverifiedRules
      .map((r) => r.ruleName)
      .join(", ")}) could not be confirmed from profile data alone. Official verification required.`;
    matchScore = 65;
  } else {
    category = "likely_match";
    const keyPassed = passedRules
      .filter((r) => r.ruleName !== "Specialized Prerequisites")
      .map((r) => r.ruleName)
      .slice(0, 4);
    summaryReason = `Strong preliminary match across ${passCount} verified profile parameters including ${keyPassed.join(", ")}.`;
    matchScore = Math.min(98, 85 + passCount * 2);
  }

  // Deadline formatting
  const deadlineDate = opportunity.deadlineDate || opportunity.applicationDeadline?.closingDate || "";
  const formattedDeadline = deadlineDate
    ? new Date(deadlineDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : opportunity.isYearRound
    ? "Open Year-Round (Continuous DBT)"
    : "Cycle Dates Vary / Pending Notification";

  const matchedRules = passedRules.map((r) => `${r.ruleName}: ${r.explanation}`);
  const disqualifyingRules = failedRules.map((r) => `${r.ruleName}: ${r.explanation}`);
  const unknownRules = unverifiedRules.map((r) => `${r.ruleName}: ${r.explanation}`);

  return {
    opportunity,
    category,
    matchScore,
    summaryReason,
    profileAttributesUsed,
    verificationChecklist: Array.from(new Set(verificationChecklist)),
    ruleEvaluations,
    matchedRules,
    disqualifyingRules,
    unknownRules,
    officialSource: {
      portalName: opportunity.officialSource?.portalName || opportunity.provider,
      department: opportunity.officialSource?.departmentOrMinistry || opportunity.provider,
      url: opportunity.officialSource?.url || opportunity.officialWebsite,
      isGovernmentDomain: opportunity.officialSource?.isGovernmentDomain ?? true,
    },
    deadline: {
      formattedDate: formattedDeadline,
      cycleName: opportunity.applicationDeadline?.cycleName,
      isTentative: opportunity.applicationDeadline?.isTentative ?? false,
      isYearRound: opportunity.isYearRound ?? false,
    },
    disclaimer: MATCHING_DISCLAIMER,
  };
}

/**
 * Runs batch evaluation on a list of opportunities for a given profile
 */
export function runOpportunityMatcher(
  opportunities: Opportunity[],
  profile: UserProfile
): {
  likelyMatches: MatchResult[];
  needsVerification: MatchResult[];
  doesNotMatch: MatchResult[];
  allResults: MatchResult[];
} {
  const evaluated = opportunities.map((opp) => evaluateOpportunityMatch(opp, profile));

  const likelyMatches = evaluated
    .filter((r) => r.category === "likely_match")
    .sort((a, b) => b.matchScore - a.matchScore);

  const needsVerification = evaluated
    .filter((r) => r.category === "needs_verification")
    .sort((a, b) => b.matchScore - a.matchScore);

  const doesNotMatch = evaluated
    .filter((r) => r.category === "does_not_match");

  return {
    likelyMatches,
    needsVerification,
    doesNotMatch,
    allResults: evaluated,
  };
}

/**
 * Filters specifically for educational scholarships, fellowships, and grants
 * and performs deterministic eligibility matching against the citizen's profile.
 */
export function runScholarshipMatcher(
  opportunities: Opportunity[],
  profile: UserProfile
): {
  likelyMatches: MatchResult[];
  needsVerification: MatchResult[];
  doesNotMatch: MatchResult[];
  allResults: MatchResult[];
} {
  const scholarshipsOnly = opportunities.filter(
    (opp) =>
      opp.type === "scholarship" ||
      opp.type === "fellowship" ||
      opp.type === "grant"
  );
  return runOpportunityMatcher(scholarshipsOnly, profile);
}
