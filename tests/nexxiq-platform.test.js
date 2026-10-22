/**
 * tests/nexxiq-platform.test.js
 * Comprehensive automated verification for NexxIQ AI Platform (nexxiqai.com).
 * Tests Lead Finder, SMTP Service, Multi-Platform Jobs, Resume ATS Enhancer, and Unified Workflow.
 */

const assert = require("assert");
const leadEngine = require("../src/leads/lead-engine");
const smtpService = require("../src/email/smtp-service");
const linkedInEngine = require("../src/jobs/application/linkedin-engine");
const indeedEngine = require("../src/jobs/application/indeed-engine");
const customBoardEngine = require("../src/jobs/application/custom-board-engine");
const resumeEnhancer = require("../src/resume/resume-enhancer");
const unifiedWorkflow = require("../src/orchestrator/unified-workflow");

async function runNexxIQPlatformTests() {
  console.log("\n==================================================");
  console.log("  NEXXIQ AI PLATFORM (nexxiqai.com) — TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // 1. LEAD FINDER TESTS
  console.log("--- 1. Lead Finder & Intent Scorer ---");
  test("LeadEngine loads default leads and computes statistics", () => {
    const stats = leadEngine.getStatistics();
    assert(stats.total >= 3, "Must have at least 3 default leads");
    assert(stats.averageScore >= 80, "Average score must be >= 80");
  });

  test("LeadEngine filters by category and search query", () => {
    const webLeads = leadEngine.searchLeads({ category: "WEB_DEVELOPMENT" });
    assert(webLeads.length >= 1, "Must find at least 1 Web Development lead");
    assert(webLeads.every(l => l.category === "WEB_DEVELOPMENT"), "Category filtering must be exact");

    const searchRes = leadEngine.searchLeads({ query: "Rohit" });
    assert(searchRes.length >= 1, "Search query must find Rohit Yadav");
  });

  test("LeadEngine scores and categorizes buyer post text", () => {
    const post = "Looking to hire a Flutter developer to build our iOS and Android mobile app. Budget is $15k, ready to start immediately.";
    const scored = leadEngine.scoreAndClassifyPost(post, "LinkedIn", { name: "Test Client" });
    assert.strictEqual(scored.category, "MOBILE_APP", "Must classify as MOBILE_APP");
    assert(scored.score >= 85, `Score must be >= 85 for high intent budget post, got ${scored.score}`);
    assert(scored.detectedKeywords.includes("High Buying Intent"), "Must flag high buying intent");
  });

  test("LeadEngine exports valid CSV format", () => {
    const csv = leadEngine.exportToCsv();
    assert(csv.includes("ID,Name,Company"), "CSV must include valid headers");
    assert(csv.includes("Rohit Yadav"), "CSV must contain seeded lead rows");
  });

  // 2. SMTP & EMAIL TESTS
  console.log("\n--- 2. Secure SMTP & Email Service ---");
  test("SmtpService masks credentials and provides safe public config", () => {
    const safe = smtpService.getSafeConfig();
    assert.strictEqual(typeof safe.host, "string", "Host must be a string");
    assert.strictEqual(typeof safe.port, "number", "Port must be a number");
    assert(safe.passwordMasked !== undefined, "Password must be masked");
    assert(!safe.passwordMasked.includes("secret"), "Masked password must not leak plain text");
  });

  test("SmtpService templates interpolate dynamic variables cleanly", () => {
    const interpolated = smtpService.interpolate("Hello {{name}} from {{company}}!", {
      name: "Syed Akbar Hashmi",
      company: "NexxIQ AI"
    });
    assert.strictEqual(interpolated, "Hello Syed Akbar Hashmi from NexxIQ AI!");
  });

  // 3. MULTI-PLATFORM JOB APPLICATION TESTS
  console.log("\n--- 3. Multi-Platform Job Application Engine ---");
  test("LinkedInEngine verifies 50 applied jobs in persistent DB", () => {
    const applied = linkedInEngine.getAppliedJobs();
    assert(applied.length >= 50, `Expected at least 50 applied jobs, found ${applied.length}`);
    assert(applied.every(j => j.status === "SUCCESS" || j.status === "ALREADY_APPLIED"), "All jobs must have valid status");
  });

  test("IndeedEngine builds proper remote search query", () => {
    const url = indeedEngine.buildSearchUrl({ query: "AI Native Developer", location: "Remote" });
    assert(url.includes("indeed.com/jobs"), "Must point to Indeed jobs domain");
    assert(url.includes("AI%20Native%20Developer"), "Must encode keywords");
  });

  test("CustomBoardEngine detects ATS vendors accurately", () => {
    assert.strictEqual(customBoardEngine.detectAtsVendor("https://boards.greenhouse.io/openai/jobs/123"), "Greenhouse");
    assert.strictEqual(customBoardEngine.detectAtsVendor("https://jobs.lever.co/anthropic/456"), "Lever");
    assert.strictEqual(customBoardEngine.detectAtsVendor("https://company.myworkdayjobs.com/careers/789"), "Workday");
    assert.strictEqual(customBoardEngine.detectAtsVendor("https://company.bamboohr.com/jobs/view.php?id=10"), "BambooHR");
    assert.strictEqual(customBoardEngine.detectAtsVendor("https://example.com/careers"), "Generic Career Portal");
  });

  // 4. RESUME ENHANCER & ATS OPTIMIZATION TESTS
  console.log("\n--- 4. AI Resume Enhancer & ATS Optimizer ---");
  test("ResumeEnhancer extracts keywords and computes accurate score", () => {
    const jd = "We are seeking a Senior AI Native Developer skilled in Next.js, Python, PostgreSQL, Docker, and LangChain for building autonomous agent workflows.";
    const resume = "Syed Akbar Hashmi. Full Stack Developer skilled in Next.js, Python, PostgreSQL, and Docker. Delivered high performance web applications.";
    
    const analysis = resumeEnhancer.analyzeResume({ resumeText: resume, jobDescription: jd });
    assert(analysis.atsScore >= 60, `ATS Score should be >= 60, got ${analysis.atsScore}`);
    assert(analysis.matchedKeywords.includes("Next.js"), "Next.js must be matched");
    assert(analysis.matchedKeywords.includes("Python"), "Python must be matched");
    assert(analysis.missingKeywords.includes("LangChain"), "LangChain must be detected as missing");
  });

  test("ResumeEnhancer rewrites bullet points and boosts ATS score", () => {
    const jd = "Hiring AI Developer with LangChain, FastAPI, and Kubernetes experience.";
    const resume = `
Syed Akbar Hashmi
Experience:
• Built web platforms using Next.js and Python.
• Managed databases and server deployments.
    `.trim();

    const enhanced = resumeEnhancer.enhanceResume({ resumeText: resume, jobDescription: jd });
    assert(enhanced.projectedAtsScore > enhanced.originalAtsScore, "Projected score must be higher than original");
    assert(enhanced.enhancedResume.includes("PROFESSIONAL SUMMARY"), "Enhanced resume must contain summary");
    assert(enhanced.enhancedResume.includes("CORE ATS COMPETENCIES"), "Enhanced resume must contain core competencies");
  });

  // 5. UNIFIED WORKFLOW ORCHESTRATOR TESTS
  console.log("\n--- 5. Unified Autonomous Workflow ---");
  await asyncTest("UnifiedWorkflow executes lead outreach pipeline", async () => {
    const result = await unifiedWorkflow.runLeadOutreachPipeline({
      leadId: "lead_nexx_101",
      templateName: "agency_pitch"
    });
    assert.strictEqual(result.status, "SUCCESS", "Workflow run must succeed");
    assert(result.steps.length >= 4, "Must execute at least 4 pipeline steps");
    assert(result.durationMs >= 0, "Duration must be positive");
  });

  await asyncTest("UnifiedWorkflow executes job application pipeline", async () => {
    const result = await unifiedWorkflow.runJobApplicationPipeline({
      platform: "Indeed",
      jobId: "ind_test_pipeline_01"
    });
    assert.strictEqual(result.runRecord.status, "SUCCESS", "Job pipeline run must succeed");
    assert(result.enhancement.projectedAtsScore >= 70, "Must calculate high ATS score");
  });

  console.log("\n--------------------------------------------------");
  console.log(`NexxIQ Platform Results: ${passed} Passed, ${failed} Failed`);
  console.log("--------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  runNexxIQPlatformTests().catch(err => {
    console.error("Test runner crashed:", err);
    process.exit(1);
  });
}

module.exports = { runNexxIQPlatformTests };
