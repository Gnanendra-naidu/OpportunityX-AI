import { processAssistantQuery } from "../src/lib/ai/assistantEngine";
import { evaluateOpportunityMatch } from "../src/lib/matching/engine";
import { MOCK_OPPORTUNITIES } from "../src/data/mockOpportunities";
import { UserProfile } from "../src/types";

console.log("=== OPPORTUNITYX-AI RELEVANCE & MATCHING AUDIT ===");
console.log(`Loaded ${MOCK_OPPORTUNITIES.length} mock opportunities for testing.`);

let allPassed = true;

// Profile A: Male, B.Tech, Karnataka, General, Income ₹5,00,000, non-farmer
const profileA: UserProfile = {
  id: "profile-a",
  name: "Arjun Sharma",
  email: "arjun@example.com",
  gender: "male",
  age: 20,
  state: "Karnataka",
  lifeStage: "college_students",
  educationLevel: "Undergraduate (B.Tech)",
  courseStream: "Engineering / Technology",
  category: "General",
  annualFamilyIncome: 500000,
  incomeRange: "₹2,50,000 - ₹5,00,000",
  occupation: "Student",
  disabilityStatus: false,
  isDisabled: false,
  isMinority: false,
  preferredOpportunityTypes: ["scholarship"],
  savedOpportunityIds: [],
};

// Profile B: Female, B.Tech, Maharashtra, OBC, Income ₹4,00,000
const profileB: UserProfile = {
  id: "profile-b",
  name: "Pooja Patel",
  email: "pooja@example.com",
  gender: "female",
  age: 19,
  state: "Maharashtra",
  lifeStage: "college_students",
  educationLevel: "Undergraduate (B.Tech)",
  courseStream: "Engineering / Technology",
  category: "OBC",
  annualFamilyIncome: 400000,
  incomeRange: "₹2,50,000 - ₹5,00,000",
  occupation: "Student",
  disabilityStatus: false,
  isDisabled: false,
  isMinority: false,
  preferredOpportunityTypes: ["scholarship"],
  savedOpportunityIds: [],
};

// Profile C: Farmer, Karnataka, Income ₹1,50,000
const profileC: UserProfile = {
  id: "profile-c",
  name: "Ramesh Gowda",
  email: "ramesh@example.com",
  gender: "male",
  age: 45,
  state: "Karnataka",
  lifeStage: "farmers",
  educationLevel: "Class 10 or Below",
  category: "OBC",
  annualFamilyIncome: 150000,
  incomeRange: "Below ₹1,50,000",
  occupation: "Farmer",
  disabilityStatus: false,
  isDisabled: false,
  isMinority: false,
  preferredOpportunityTypes: ["scheme"],
  savedOpportunityIds: [],
};

console.log("\n--- TEST 1: MATCHING ENGINE TEST FOR MALE B.TECH (Arjun) ---");
const matchesA = MOCK_OPPORTUNITIES.map((opp) => ({
  opp,
  result: evaluateOpportunityMatch(opp, profileA),
}));

const likelyA = matchesA.filter((m) => m.result.category === "likely_match");
const doesNotMatchA = matchesA.filter((m) => m.result.category === "does_not_match");

console.log(`Profile A (Male B.Tech) Likely matches: ${likelyA.length}, Disqualified: ${doesNotMatchA.length}`);

// Check that Pragati (Female only) is in doesNotMatch
const pragatiMatchA = matchesA.find((m) => m.opp.title.includes("Pragati"));
if (pragatiMatchA && pragatiMatchA.result.category === "does_not_match") {
  console.log("✅ PASS: AICTE Pragati correctly disqualified for Male student. Reason:", pragatiMatchA.result.summaryReason);
} else {
  console.error("❌ FAIL: AICTE Pragati was NOT disqualified for Male student!");
  allPassed = false;
}

// Check that PM-KISAN (Farmer only) is in doesNotMatch
const kisanMatchA = matchesA.find((m) => m.opp.title.includes("Kisan") || m.opp.title.includes("KISAN"));
if (kisanMatchA && kisanMatchA.result.category === "does_not_match") {
  console.log("✅ PASS: PM-KISAN correctly disqualified for non-farmer student. Reason:", kisanMatchA.result.summaryReason);
} else {
  console.error("❌ FAIL: PM-KISAN was NOT disqualified for non-farmer student!");
  allPassed = false;
}

// Check that Raitha Vidya Nidhi (Farmer parent only) is disqualified for non-farmer student
const raithaMatchA = matchesA.find((m) => m.opp.title.includes("Raitha"));
if (raithaMatchA && raithaMatchA.result.category === "does_not_match") {
  console.log("✅ PASS: Raitha Vidya Nidhi correctly disqualified for non-farmer student. Reason:", raithaMatchA.result.summaryReason);
} else {
  console.error("❌ FAIL: Raitha Vidya Nidhi was NOT disqualified for non-farmer student!");
  allPassed = false;
}

console.log("\n--- TEST 2: MATCHING ENGINE TEST FOR FEMALE B.TECH (Pooja) ---");
const matchesB = MOCK_OPPORTUNITIES.map((opp) => ({
  opp,
  result: evaluateOpportunityMatch(opp, profileB),
}));

const pragatiMatchB = matchesB.find((m) => m.opp.title.includes("Pragati"));
if (pragatiMatchB && (pragatiMatchB.result.category === "likely_match" || pragatiMatchB.result.category === "needs_verification")) {
  console.log("✅ PASS: AICTE Pragati eligible for Female B.Tech student:", pragatiMatchB.result.category);
} else {
  console.error("❌ FAIL: AICTE Pragati was disqualified for Female B.Tech student!");
  allPassed = false;
}

console.log("\n--- TEST 3: MATCHING ENGINE TEST FOR FARMER (Ramesh) ---");
const matchesC = MOCK_OPPORTUNITIES.map((opp) => ({
  opp,
  result: evaluateOpportunityMatch(opp, profileC),
}));

const kisanMatchC = matchesC.find((m) => m.opp.title.includes("Kisan") || m.opp.title.includes("KISAN"));
if (kisanMatchC && kisanMatchC.result.category === "likely_match") {
  console.log("✅ PASS: PM-KISAN eligible for Farmer Ramesh:", kisanMatchC.result.category);
} else {
  console.error("❌ FAIL: PM-KISAN was not likely_match for Farmer Ramesh!");
  allPassed = false;
}

console.log("\n--- TEST 4: INELIGIBLE PRIMARY PUPIL ZERO-MATCH TEST (Kabir) ---");
const profileKabir: UserProfile = {
  id: "profile-kabir",
  name: "Kabir",
  email: "kabir@example.com",
  gender: "male",
  age: 8,
  state: "Goa",
  lifeStage: "school_students",
  educationLevel: "Primary School (Class 1-5)",
  category: "General",
  annualFamilyIncome: 2000000,
  incomeRange: "Above ₹8,00,000",
  occupation: "Student",
  disabilityStatus: false,
  isDisabled: false,
  isMinority: false,
  preferredOpportunityTypes: ["scholarship"],
  savedOpportunityIds: [],
};

const resD = processAssistantQuery("find scholarships matching my profile", profileKabir, MOCK_OPPORTUNITIES);
console.log("Ineligible User Response Intent:", resD.detectedIntent);
console.log("Ineligible User Matching Count:", resD.databaseOpportunities.length);
if (resD.reply.includes("No strong matches found") && resD.databaseOpportunities.length === 0) {
  console.log("✅ PASS: Disqualified student receives clear 'No strong matches found' with 0 unrelated cards.");
} else {
  console.error("❌ FAIL: Ineligible user was served unrelated scholarships!");
  allPassed = false;
}

console.log("\n--- TEST 5: AI ADVISOR INTENT TESTS ---");
const testCases = [
  { msg: "hii", expectedIntent: "greeting", expectZeroOpps: true },
  { msg: "hello", expectedIntent: "greeting", expectZeroOpps: true },
  { msg: "thank you", expectedIntent: "general_conversation", expectZeroOpps: true },
  { msg: "bye", expectedIntent: "general_conversation", expectZeroOpps: true },
  { msg: "what can you help me with?", expectedIntent: "help_capabilities", expectZeroOpps: true },
  { msg: "what scholarships can I apply for?", expectedIntent: "scholarship_discovery", expectZeroOpps: false, profile: profileB },
  { msg: "find scholarships for me", expectedIntent: "scholarship_discovery", expectZeroOpps: false, profile: profileB },
  { msg: "when is the deadline?", expectedIntent: "deadline_inquiry", targetOpp: pragatiMatchB?.opp },
  { msg: "how do I apply?", expectedIntent: "application_inquiry", targetOpp: pragatiMatchB?.opp },
  { msg: "what documents do I need?", expectedIntent: "document_inquiry", targetOpp: pragatiMatchB?.opp },
  { msg: "am I eligible for this scholarship?", expectedIntent: "eligibility_inquiry", targetOpp: pragatiMatchB?.opp, profile: profileA }, // Male for Pragati
  { msg: "why am I not eligible?", expectedIntent: "why_not_eligible", targetOpp: pragatiMatchB?.opp, profile: profileA }, // Male for Pragati
];

for (const tc of testCases) {
  const res = processAssistantQuery(tc.msg, tc.profile || null, MOCK_OPPORTUNITIES, tc.targetOpp || null);
  const intentMatch = res.detectedIntent === tc.expectedIntent;
  const zeroMatch = tc.expectZeroOpps ? res.databaseOpportunities.length === 0 : true;

  if (intentMatch && zeroMatch) {
    console.log(`✅ PASS: "${tc.msg}" -> ${res.detectedIntent} (Opps: ${res.databaseOpportunities.length})`);
    if (tc.msg === "why am I not eligible?") {
      console.log("   Disqualification explanation snippet:", res.reply.slice(0, 160).replace(/\n/g, " "));
    }
  } else {
    console.error(`❌ FAIL: "${tc.msg}" -> Got ${res.detectedIntent}, expected ${tc.expectedIntent}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
} else {
  console.error("\n❌ SOME TESTS FAILED!");
  process.exit(1);
}
