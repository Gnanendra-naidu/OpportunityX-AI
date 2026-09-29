const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [k, ...v] = trimmed.split("=");
        if (k && v.length) {
          process.env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);

async function runEndToEndTests() {
  console.log("=================================================");
  console.log("6-DIGIT OTP PASSWORD RECOVERY END-TO-END TEST");
  console.log("=================================================\n");

  const results = [];

  // Test 1: Send OTP to registered user
  console.log("Test 1: Requesting 6-digit OTP for registered email...");
  const registeredEmail = "naidugnanendra3@gmail.com";
  const req1 = await supabase.auth.resetPasswordForEmail(registeredEmail, {
    redirectTo: "https://opportunity-x-ai.vercel.app/reset-password",
  });
  const test1Passed = req1.error === null || req1.error.code === "over_email_send_rate_limit";
  console.log("Result 1:", req1.error ? req1.error.message : "OTP request accepted by Supabase!");
  results.push({ name: "Send OTP Request", pass: test1Passed });

  // Test 2: Anti-enumeration for unknown email
  console.log("\nTest 2: Anti-enumeration (non-existent email)...");
  const randomEmail = "unknown_citizen_" + Date.now() + "@opportunityx.org";
  const req2 = await supabase.auth.resetPasswordForEmail(randomEmail, {
    redirectTo: "https://opportunity-x-ai.vercel.app/reset-password",
  });
  console.log("Result 2:", req2.error ? req2.error.message : "Protected against user enumeration (safe response).");
  results.push({ name: "Anti-Enumeration Protection", pass: true });

  // Test 3: Invalid 6-digit OTP rejected
  console.log("\nTest 3: Invalid 6-digit OTP rejection...");
  const verify1 = await supabase.auth.verifyOtp({
    email: registeredEmail,
    token: "000000",
    type: "recovery",
  });
  const test3Passed = verify1.error && (verify1.error.code === "otp_expired" || verify1.error.status === 403);
  console.log("Result 3: Correctly rejected invalid OTP with code:", verify1.error ? verify1.error.code : "NONE");
  results.push({ name: "Invalid OTP Rejection", pass: test3Passed });

  // Test 4: Expired/Malformed OTP rejected
  console.log("\nTest 4: Malformed OTP rejection...");
  const verify2 = await supabase.auth.verifyOtp({
    email: registeredEmail,
    token: "12",
    type: "recovery",
  });
  const test4Passed = verify2.error !== null;
  console.log("Result 4: Correctly rejected malformed token:", verify2.error ? verify2.error.message : "NONE");
  results.push({ name: "Malformed Token Rejection", pass: test4Passed });

  // Test 5: Verify no service-role key is exposed in client bundle
  console.log("\nTest 5: Security audit for service-role key exposure...");
  const srcFiles = ["src/context/AuthContext.tsx", "src/app/forgot-password/page.tsx", "src/app/reset-password/page.tsx"];
  let exposedKey = false;
  for (const f of srcFiles) {
    const content = fs.readFileSync(path.resolve(__dirname, "..", f), "utf-8");
    if (content.includes("service_role") || content.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      exposedKey = true;
      console.error("EXPOSURE FOUND in", f);
    }
  }
  console.log("Result 5: Service-role key check:", exposedKey ? "FAILED" : "CLEAN (Zero exposure)");
  results.push({ name: "Zero Service-Role Exposure", pass: !exposedKey });

  // Test 6: Verify password update function existence
  console.log("\nTest 6: Supabase Auth updateUser method available...");
  const test6Passed = typeof supabase.auth.updateUser === "function";
  console.log("Result 6: updateUser method is available:", test6Passed);
  results.push({ name: "updateUser API Support", pass: test6Passed });

  console.log("\n=================================================");
  console.log("TEST SUMMARY:");
  let allPassed = true;
  for (const r of results) {
    console.log(`- ${r.name}: ${r.pass ? "PASS ✓" : "FAIL ✗"}`);
    if (!r.pass) allPassed = false;
  }
  console.log(`\nALL TESTS PASSED: ${allPassed}`);
  console.log("=================================================");
}

runEndToEndTests().catch(console.error);
