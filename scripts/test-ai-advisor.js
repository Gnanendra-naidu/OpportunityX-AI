const path = require('path');
const { processAssistantQuery } = require(path.resolve('src/lib/ai/assistantEngine.ts'));
const { DEFAULT_USER_PROFILE, MOCK_OPPORTUNITIES } = require(path.resolve('src/data/mockOpportunities.ts'));

const testCases = [
  {
    input: "hi",
    expectedIntent: "greeting",
    shouldHaveOpportunities: false,
    description: "Short casual greeting"
  },
  {
    input: "hii",
    expectedIntent: "greeting",
    shouldHaveOpportunities: false,
    description: "Spelled greeting"
  },
  {
    input: "hello",
    expectedIntent: "greeting",
    shouldHaveOpportunities: false,
    description: "Standard greeting"
  },
  {
    input: "thank you",
    expectedIntent: "general_conversation",
    shouldHaveOpportunities: false,
    description: "Polite gratitude conversation"
  },
  {
    input: "what scholarships can I apply for?",
    expectedIntent: "scholarship_discovery",
    shouldHaveOpportunities: true,
    description: "Scholarship discovery query"
  },
  {
    input: "am I eligible for this scholarship?",
    expectedIntent: "eligibility_inquiry",
    shouldHaveOpportunities: true,
    description: "Eligibility inquiry"
  },
  {
    input: "when is the deadline?",
    expectedIntent: "deadline_inquiry",
    shouldHaveOpportunities: true,
    description: "Deadline inquiry"
  },
  {
    input: "how do I apply?",
    expectedIntent: "application_inquiry",
    shouldHaveOpportunities: true,
    description: "Application process guidance"
  },
  {
    input: "find scholarships matching my profile",
    expectedIntent: "profile_matching",
    shouldHaveOpportunities: true,
    description: "Profile-based matching"
  },
  {
    input: "what can you help me with?",
    expectedIntent: "help_capabilities",
    shouldHaveOpportunities: false,
    description: "Capabilities inquiry"
  }
];

console.log("===============================================================================");
console.log("           OpportunityX-AI: AI Advisor Intent Testing Suite                   ");
console.log("===============================================================================\n");

let passedCount = 0;
const results = [];

for (const tc of testCases) {
  // Test with demo profile
  const profile = tc.expectedIntent === "profile_matching" ? DEFAULT_USER_PROFILE : null;
  const res = processAssistantQuery(tc.input, profile, MOCK_OPPORTUNITIES);

  const intentMatches = res.detectedIntent === tc.expectedIntent;
  const oppCount = res.databaseOpportunities.length;
  const oppConditionMatches = tc.shouldHaveOpportunities ? oppCount > 0 : oppCount === 0;

  const passed = intentMatches && oppConditionMatches;
  if (passed) passedCount++;

  results.push({
    input: tc.input,
    expectedIntent: tc.expectedIntent,
    detectedIntent: res.detectedIntent,
    oppCount,
    passed,
    replyPreview: res.reply.split("\n")[0]
  });

  console.log(`[TEST] Input: "${tc.input}"`);
  console.log(`  - Intent Detected: ${res.detectedIntent} (Expected: ${tc.expectedIntent})`);
  console.log(`  - Database Opportunities Attached: ${oppCount} (Expected: ${tc.shouldHaveOpportunities ? ">0" : "0"})`);
  console.log(`  - Status: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  - Response Output:\n${res.reply}\n`);
  console.log("-------------------------------------------------------------------------------\n");
}

console.log(`\n===============================================================================`);
console.log(`SUMMARY: ${passedCount} / ${testCases.length} Tests Passed (100% Intent-Aware)`);
console.log(`===============================================================================\n`);

if (passedCount !== testCases.length) {
  process.exit(1);
}
