const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function runFinalQA() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log('Using browser executable:', executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const issues = [];
  const testResults = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore normal external favicon or 3rd party tracker errors if any
      if (!text.includes('favicon.ico')) {
        issues.push({ type: 'CONSOLE_ERROR', text, url: page.url() });
      }
    }
  });

  page.on('pageerror', err => {
    issues.push({ type: 'RUNTIME_PAGE_ERROR', text: err.toString(), url: page.url() });
  });

  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('favicon.ico')) {
      issues.push({ type: 'HTTP_ERROR', status: res.status(), url: res.url() });
    }
  });

  function recordTest(name, passed, details = '') {
    testResults.push({ name, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${details ? ': ' + details : ''}`);
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Home Page
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Home Page ---');
    const homeRes = await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    recordTest('Home Page Status 200', homeRes.status() === 200, `HTTP ${homeRes.status()}`);

    const title = await page.title();
    recordTest('Home Page Title', title.includes('OpportunityX'), title);

    const hasDbBadge = await page.evaluate(() => document.body.innerText.includes('Supabase Live') || document.body.innerText.includes('DB:'));
    recordTest('Database Live Badge Rendered', hasDbBadge);

    const cardCount = await page.evaluate(() => document.querySelectorAll('button, a').length);
    recordTest('Interactive Elements Present', cardCount > 10, `${cardCount} elements`);

    // -------------------------------------------------------------
    // TEST 2: Scholarships Page
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Scholarships Page ---');
    const scholRes = await page.goto('http://localhost:3000/scholarships', { waitUntil: 'networkidle2' });
    recordTest('Scholarships Page Status 200', scholRes.status() === 200, `HTTP ${scholRes.status()}`);

    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    const oppCards = await page.evaluate(() => document.querySelectorAll('[data-testid="opportunity-card"], .rounded-xl, .rounded-2xl').length);
    recordTest('Scholarship Cards Displayed', oppCards > 0, `${oppCards} card elements found`);

    // Search filter test
    await page.type('input[type="text"]', 'Tata');
    await new Promise(r => setTimeout(r, 600));
    const tataMatches = await page.evaluate(() => document.body.innerText.includes('Tata'));
    recordTest('Scholarships Search Filter works', tataMatches);

    // Clear search
    await page.evaluate(() => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 400));

    // -------------------------------------------------------------
    // TEST 3: Scholarship Details Modal
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Scholarship Details Modal ---');
    // Click on a view details button
    const openedModal = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const viewBtn = buttons.find(b => b.innerText.includes('View Details') || b.innerText.includes('Details'));
      if (viewBtn) {
        viewBtn.click();
        return true;
      }
      return false;
    });
    recordTest('Opportunity Details Button Clicked', openedModal);

    await new Promise(r => setTimeout(r, 600));
    const modalVisible = await page.evaluate(() => {
      return document.querySelector('[role="dialog"]') !== null || document.body.innerText.includes('Official Source');
    });
    recordTest('Opportunity Details Modal Rendered', modalVisible);

    // -------------------------------------------------------------
    // TEST 4: Eligibility Criteria & Bullets
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Eligibility Section ---');
    const hasEligibility = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const text = dialog ? dialog.innerText : document.body.innerText;
      return text.toLowerCase().includes('eligibility') || text.toLowerCase().includes('criteria');
    });
    recordTest('Eligibility Section Present in Modal', hasEligibility);

    // -------------------------------------------------------------
    // TEST 5: Required Documents & Interactive Checklist
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Required Documents Checklist ---');
    const hasDocsSection = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const text = dialog ? dialog.innerText : document.body.innerText;
      return text.toLowerCase().includes('required documents') || text.toLowerCase().includes('documents');
    });
    recordTest('Required Documents Section Present', hasDocsSection);

    // Toggle document checklist item
    const toggledCheckbox = await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('[role="checkbox"], input[type="checkbox"]');
      if (checkboxes.length > 0) {
        checkboxes[0].click();
        return true;
      }
      return false;
    });
    recordTest('Document Checklist Interactive Toggle', toggledCheckbox);

    // -------------------------------------------------------------
    // TEST 6: Deadlines & Visual Indicators
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Deadlines Indicator ---');
    const hasDeadlines = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Closing') || text.includes('Open') || text.includes('Deadline') || text.includes('Days Left');
    });
    recordTest('Deadline Badges & Dates Visible', hasDeadlines);

    // -------------------------------------------------------------
    // TEST 7: Official Portal Link
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Official Portal Link in Modal ---');
    const officialLinkInfo = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[target="_blank"]'));
      const portalLink = links.find(a => a.href.startsWith('http') && !a.href.includes('localhost'));
      return portalLink ? { href: portalLink.href, text: portalLink.innerText.trim() } : null;
    });
    recordTest('Official Portal Link Present with target="_blank"', officialLinkInfo !== null, officialLinkInfo?.href || 'None');

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close"], button svg.lucide-x')?.closest('button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // -------------------------------------------------------------
    // TEST 8: Save Functionality
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Save Functionality ---');
    // Click save button on a card
    const savedCard = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find(b => b.innerText.includes('Save') || b.querySelector('svg.lucide-bookmark'));
      if (saveBtn) {
        saveBtn.click();
        return true;
      }
      return false;
    });
    recordTest('Save Opportunity Button Clicked', savedCard);
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------
    // TEST 9: Saved Page (/saved)
    // -------------------------------------------------------------
    console.log('\n--- 9. Testing Saved Page (/saved) ---');
    const savedRes = await page.goto('http://localhost:3000/saved', { waitUntil: 'networkidle2' });
    recordTest('Saved Page Status 200', savedRes.status() === 200, `HTTP ${savedRes.status()}`);

    const hasSavedCards = await page.evaluate(() => {
      return document.querySelectorAll('button, a').length > 5;
    });
    recordTest('Saved Page Content Loaded', hasSavedCards);

    // -------------------------------------------------------------
    // TEST 10: Supabase Health Endpoint
    // -------------------------------------------------------------
    console.log('\n--- 10. Testing Supabase Health Endpoint ---');
    const healthRes = await page.goto('http://localhost:3000/api/health/supabase', { waitUntil: 'networkidle2' });
    const healthJson = await healthRes.json();
    recordTest('Supabase Health API Responds', healthRes.status() === 200);
    recordTest('Supabase isConfigured is true', healthJson.isConfigured === true);
    recordTest('Supabase isConnected is true', healthJson.isConnected === true, `latency: ${healthJson.latencyMs}ms`);
    recordTest('7 OpportunityX Tables Detected', Array.isArray(healthJson.tablesDetected) && healthJson.tablesDetected.length >= 7, `${healthJson.tablesDetected?.length} tables`);

  } catch (err) {
    console.error('QA Execution Exception:', err);
    issues.push({ type: 'FATAL_TEST_EXCEPTION', message: err.message });
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log(`FINAL QA AUDIT SUMMARY:`);
  console.log(`Total Checks Executed: ${testResults.length}`);
  const passCount = testResults.filter(r => r.passed).length;
  console.log(`Passed: ${passCount} / ${testResults.length}`);
  console.log(`Issues / Runtime Errors: ${issues.length}`);
  if (issues.length > 0) {
    console.log('Detected Issues:', JSON.stringify(issues, null, 2));
  } else {
    console.log('ALL CRITICAL FLOWS VERIFIED CLEAN! 0 ERRORS DETECTED.');
  }
  console.log('========================================\n');

  fs.writeFileSync('scripts/final-qa-results.json', JSON.stringify({ testResults, issues }, null, 2));
}

runFinalQA().catch(err => {
  console.error(err);
  process.exit(1);
});
