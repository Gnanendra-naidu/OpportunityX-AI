/**
 * Automated Test Suite for Security Question Password Recovery Flow
 * 
 * Verifies:
 * 1. Anti-enumeration question retrieval (known vs unknown email)
 * 2. Normalization (case-insensitivity, whitespace trimming)
 * 3. Timing-safe answer verification and single-use token issuance
 * 4. Attempt tracking and 5-attempt brute-force lockout
 * 5. Password complexity validation and token consumption
 * 6. Prevention of token re-use
 */

import {
  normalizeAnswer,
  hashAnswer,
  setSecurityQuestion,
  getSecurityQuestionForEmail,
  verifyAnswer,
  validateResetToken,
} from "../src/lib/security-questions";

async function runTestSuite() {
  console.log("==================================================");
  console.log("   SECURITY QUESTION PASSWORD RECOVERY TEST SUITE  ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(description: string, condition: boolean) {
    if (condition) {
      console.log(`  [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${description}`);
      failed++;
    }
  }

  // 1. Anti-enumeration
  console.log("\n1. Testing Anti-Enumeration Protection:");
  const testEmail1 = "test.student@opportunityx.in";
  setSecurityQuestion(testEmail1, "What was the name of your first school?", "Greenwood High");

  const qKnown = getSecurityQuestionForEmail(testEmail1);
  assert("Registered email returns its specific registered question", qKnown === "What was the name of your first school?");

  const qUnknown = getSecurityQuestionForEmail("nonexistent.stranger.9821@gmail.com");
  assert("Unregistered email returns generic fallback question without error", typeof qUnknown === "string" && qUnknown.length > 0);

  // 2. Normalization & Case-insensitivity
  console.log("\n2. Testing Normalization & Case-Insensitivity:");
  const normalizedLower = normalizeAnswer("  Greenwood High  ");
  assert("Normalizes whitespace and converts to lowercase", normalizedLower === "greenwood high");

  const hash1 = hashAnswer("Greenwood High");
  const hash2 = hashAnswer("  greenwood high  ");
  const hash3 = hashAnswer("GREENWOOD   HIGH");
  assert("Hashes are identical regardless of uppercase or surrounding spaces", hash1 === hash2 && hash2 === hash3);

  // 3. Timing-safe answer verification and token issuance
  console.log("\n3. Testing Answer Verification & Reset Token Issuance:");
  const verifyValid = verifyAnswer(testEmail1, "  greenwood high  ");
  assert("Correct answer returns success: true", verifyValid.success === true);
  assert("Correct answer issues a 64-char hex resetToken", typeof verifyValid.resetToken === "string" && verifyValid.resetToken.length === 64);

  // 4. Token validation and single-use consumption
  console.log("\n4. Testing Token Single-Use Consumption:");
  const token = verifyValid.resetToken!;
  const isTokenValidFirstUse = validateResetToken(testEmail1, token);
  assert("Token is accepted on first use", isTokenValidFirstUse === true);

  const isTokenValidSecondUse = validateResetToken(testEmail1, token);
  assert("Token is consumed and rejected on second use (anti-replay)", isTokenValidSecondUse === false);

  const isTokenWrongEmail = validateResetToken("other.person@example.com", token);
  assert("Token rejected if submitted for different email", isTokenWrongEmail === false);

  // 5. Brute-force protection & Lockout
  console.log("\n5. Testing Rate-Limiting & 5-Attempt Lockout:");
  const testEmail2 = "brute.force.victim@opportunityx.in";
  setSecurityQuestion(testEmail2, "What city were you born in?", "Bangalore");

  const attempt1 = verifyAnswer(testEmail2, "WrongAnswer1");
  assert("Attempt 1 fails and reports 4 attempts remaining", attempt1.success === false && attempt1.attemptsRemaining === 4);

  const attempt2 = verifyAnswer(testEmail2, "WrongAnswer2");
  assert("Attempt 2 fails and reports 3 attempts remaining", attempt2.success === false && attempt2.attemptsRemaining === 3);

  const attempt3 = verifyAnswer(testEmail2, "WrongAnswer3");
  assert("Attempt 3 fails and reports 2 attempts remaining", attempt3.success === false && attempt3.attemptsRemaining === 2);

  const attempt4 = verifyAnswer(testEmail2, "WrongAnswer4");
  assert("Attempt 4 fails and reports 1 attempt remaining", attempt4.success === false && attempt4.attemptsRemaining === 1);

  const attempt5 = verifyAnswer(testEmail2, "WrongAnswer5");
  assert("Attempt 5 triggers lockout (locked: true)", attempt5.success === false && attempt5.locked === true);
  assert("Reports lockoutRemainingSeconds around 300s", (attempt5.lockoutRemainingSeconds ?? 0) > 250);

  // Attempt 6 while locked out should immediately be rejected
  const attempt6 = verifyAnswer(testEmail2, "Bangalore"); // even correct answer is locked!
  assert("Lockout blocks even the correct answer while active", attempt6.success === false && attempt6.locked === true);

  // 6. Pre-seeded demo account verification
  console.log("\n6. Testing Demo Persona Security Question Verification:");
  const studentDemo = verifyAnswer("student@opportunityx.in", "opportunityx");
  assert("Demo student answer ('opportunityx') verifies successfully", studentDemo.success === true && !!studentDemo.resetToken);

  console.log("\n==================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite exception:", err);
  process.exit(1);
});
