const https = require("https");
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);
    const req = https.request(
      {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let resp = "";
        res.on("data", (c) => (resp += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(resp) });
          } catch (e) {
            resolve({ status: res.statusCode, body: resp });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function httpGet(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const req = https.get(
      {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers,
      },
      (res) => {
        let resp = "";
        res.on("data", (c) => (resp += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(resp) });
          } catch (e) {
            resolve({ status: res.statusCode, body: resp });
          }
        });
      }
    );
    req.on("error", reject);
  });
}

async function run() {
  console.log("=== Testing Mail.tm Inbox for Supabase Email Delivery Speed ===");

  // 1. Get available domains
  const domRes = await httpGet("https://api.mail.tm/domains");
  console.log("Domains available:", domRes.status, domRes.body["hydra:member"]?.length);
  if (!domRes.body["hydra:member"] || domRes.body["hydra:member"].length === 0) {
    console.log("Mail.tm not available");
    return;
  }
  const domain = domRes.body["hydra:member"][0].domain;
  const username = "oppxtest" + Math.floor(Math.random() * 1000000);
  const email = `${username}@${domain}`;
  const password = "TestPassword123!";

  console.log("Creating temporary mailbox:", email);
  const accountRes = await httpPost("https://api.mail.tm/accounts", {
    address: email,
    password: password,
  });
  console.log("Account created:", accountRes.status);

  // Login to get token
  const tokenRes = await httpPost("https://api.mail.tm/token", {
    address: email,
    password: password,
  });
  const token = tokenRes.body.token;
  console.log("Authenticated token received:", !!token);

  // 2. Register user in Supabase
  console.log("\nRegistering test user in Supabase...");
  const signupStart = Date.now();
  const { data: signData, error: signErr } = await supabase.auth.signUp({
    email,
    password: "Password123!",
    options: {
      data: { name: "Delivery Speed Tester" },
    },
  });

  if (signErr) {
    console.error("SignUp Error in Supabase:", signErr);
    return;
  }
  console.log("User registered in Supabase. User ID:", signData.user ? signData.user.id : "null");

  // 3. Measure time to receive email in inbox
  console.log("\nMeasuring email delivery time (polling every 1 second)...");
  let emailReceived = false;
  let receivedAt = 0;
  let messageDetails = null;

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const elapsed = Math.round((Date.now() - signupStart) / 1000);
    const msgs = await httpGet("https://api.mail.tm/messages", token);
    const count = msgs.body["hydra:member"] ? msgs.body["hydra:member"].length : 0;
    process.stdout.write(`Elapsed: ${elapsed}s | Messages: ${count}\r`);

    if (count > 0) {
      emailReceived = true;
      receivedAt = Date.now();
      messageDetails = msgs.body["hydra:member"][0];
      break;
    }
  }

  console.log("\n");
  if (emailReceived) {
    const totalTimeSec = ((receivedAt - signupStart) / 1000).toFixed(2);
    console.log("✓ EMAIL RECEIVED!");
    console.log("Total Delivery Time:", totalTimeSec, "seconds");
    console.log("From:", messageDetails.from);
    console.log("Subject:", messageDetails.subject);
  } else {
    console.log("✗ NO EMAIL RECEIVED after 60 seconds.");
  }
}

run().catch(console.error);
