/**
 * src/api/routes.js
 * Consolidated RESTful API router for Agentic Social & Client Finder.
 * Exposes endpoints for Leads, SMTP Email, Multi-Platform Jobs, ATS Resume Enhancer, and Workflows.
 */

const express = require("express");
const router = express.Router();

const leadEngine = require("../leads/lead-engine");
const smtpService = require("../email/smtp-service");
const resumeEnhancer = require("../resume/resume-enhancer");
const linkedInEngine = require("../jobs/application/linkedin-engine");
const indeedEngine = require("../jobs/application/indeed-engine");
const customBoardEngine = require("../jobs/application/custom-board-engine");
const workflowOrchestrator = require("../orchestrator/unified-workflow");

// ---------------------------------------------------------------------------
// 1. HEALTH & METRICS
// ---------------------------------------------------------------------------
router.get("/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    platform: "Agentic Social & Client Finder",
    officialWebsite: "https://nexxiqai.com",
    domain: "https://syed-akber-hashmi-v2.vercel.app/",
    version: "2.1.0",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// ---------------------------------------------------------------------------
// 2. LEAD FINDER ENDPOINTS
// ---------------------------------------------------------------------------
router.get("/leads", (req, res) => {
  try {
    const { query, category, status, minScore, limit } = req.query;
    const results = leadEngine.searchLeads({
      query,
      category,
      status,
      minScore: minScore ? Number(minScore) : 0,
      limit: limit ? Number(limit) : 100
    });
    res.json({ success: true, count: results.length, leads: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/leads/stats", (req, res) => {
  try {
    const stats = leadEngine.getStatistics();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/leads/export/csv", (req, res) => {
  try {
    const csv = leadEngine.exportToCsv(req.query.category || "ALL", req.query.status || "ALL");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="agentic_leads.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/leads/:id", (req, res) => {
  const lead = leadEngine.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: "Lead not found" });
  res.json({ success: true, lead });
});

router.post("/leads", (req, res) => {
  try {
    const newLead = leadEngine.addLead(req.body);
    res.status(201).json({ success: true, lead: newLead });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch("/leads/:id/status", (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ success: false, error: "Status is required" });
    const updated = leadEngine.updateLeadStatus(req.params.id, status, notes);
    res.json({ success: true, lead: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post("/leads/classify", (req, res) => {
  try {
    const { text, source, metadata } = req.body;
    if (!text) return res.status(400).json({ success: false, error: "Text is required for classification" });
    const scored = leadEngine.scoreAndClassifyPost(text, source || "Web", metadata || {});
    res.json({ success: true, result: scored });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/leads/score-text", (req, res) => {
  try {
    const { text, source, metadata } = req.body;
    if (!text) return res.status(400).json({ success: false, error: "Text is required for scoring" });
    const scored = leadEngine.scoreAndClassifyPost(text, source || "Web", metadata || {});
    res.json({ success: true, score: scored.score, category: scored.category, result: scored });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/leads/:id", (req, res) => {
  const deleted = leadEngine.deleteLead(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: "Lead not found" });
  res.json({ success: true, message: "Lead removed successfully" });
});

// ---------------------------------------------------------------------------
// 3. SECURE SMTP & EMAIL ENDPOINTS
// ---------------------------------------------------------------------------
router.get("/email/config", (req, res) => {
  try {
    const safe = smtpService.getSafeConfig();
    res.json({ success: true, config: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/email/verify", async (req, res) => {
  try {
    const result = await smtpService.verifyConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/email/templates", (req, res) => {
  res.json({
    success: true,
    templates: Object.keys(smtpService.templates).map(k => ({
      id: k,
      name: smtpService.templates[k].name,
      subject: smtpService.templates[k].subject
    }))
  });
});

router.post("/email/send", async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    const result = await smtpService.sendEmail({ to, subject, html, text });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post("/email/send-template", async (req, res) => {
  try {
    const { templateName, to, data } = req.body;
    const result = await smtpService.sendTemplatedEmail({ templateName, to, data });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get("/email/history", (req, res) => {
  try {
    const history = smtpService.getHistory(50);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 4. MULTI-PLATFORM JOB APPLICATION ENDPOINTS
// ---------------------------------------------------------------------------
router.get("/jobs/overview", (req, res) => {
  try {
    const metrics = workflowOrchestrator.getOverallMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/jobs/linkedin", (req, res) => {
  try {
    const jobs = linkedInEngine.getAppliedJobs();
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/jobs/linkedin/harvest", async (req, res) => {
  try {
    const { keywords, limit } = req.body;
    const harvested = await linkedInEngine.harvestJobs({ keywords, limit });
    res.json({ success: true, count: harvested.length, jobs: harvested });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/jobs/indeed", (req, res) => {
  try {
    const jobs = indeedEngine.getAppliedJobs();
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/jobs/indeed/search", async (req, res) => {
  try {
    const { query, location, limit } = req.body;
    const results = await indeedEngine.searchJobs({ query, location, limit });
    res.json({ success: true, count: results.length, jobs: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/jobs/indeed/apply", async (req, res) => {
  try {
    const { jobKey, applicantProfile } = req.body;
    const result = await indeedEngine.applyToIndeedJob(jobKey, applicantProfile);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get("/jobs/custom", (req, res) => {
  try {
    const jobs = customBoardEngine.getAllJobs();
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/jobs/custom/inspect", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: "URL is required" });
    const info = await customBoardEngine.inspectJobUrl(url);
    res.json({ success: true, job: info });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/jobs/custom/apply", async (req, res) => {
  try {
    const { url, title, company, candidateProfile } = req.body;
    const result = await customBoardEngine.applyToCustomJob({ url, title, company, candidateProfile });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 5. RESUME ENHANCER & ATS OPTIMIZATION ENDPOINTS
// ---------------------------------------------------------------------------
router.get("/resume/default", (req, res) => {
  try {
    res.json({
      success: true,
      candidate: {
        name: process.env.CANDIDATE_NAME || "Syed Akbar Hashmi",
        title: process.env.CANDIDATE_TITLE || "AI Native Full Stack Developer",
        email: process.env.CANDIDATE_EMAIL || "syedakbarhashmi519@gmail.com",
        phone: process.env.CANDIDATE_PHONE || "",
        portfolio: process.env.CANDIDATE_PORTFOLIO || "https://syed-akber-hashmi-v2.vercel.app/",
        company: "Agentic Social AI"
      },
      sampleResume: `Syed Akbar Hashmi\nAI Native Full Stack Developer | Agentic Social & Client Finder\nEmail: syedakbarhashmi519@gmail.com | Portfolio: https://syed-akber-hashmi-v2.vercel.app/\n\nSUMMARY\nAI Native Full Stack Developer with 4+ years experience engineering high-performance web applications, mobile platforms, and autonomous agent workflows. Specialized in React, Next.js, Flutter, Python, Node.js, and scalable cloud architectures.\n\nTECHNICAL SKILLS\n• Frontend: React, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux, HTML5, CSS3\n• Mobile: Flutter, React Native, Dart, Cross-Platform Mobile Apps\n• Backend: Node.js, Express, Python, FastAPI, REST APIs, Microservices\n• Cloud & Databases: PostgreSQL, MongoDB, Redis, Docker, AWS, GCP, CI/CD\n• AI & Automation: Autonomous Agents, CDP Browser Automation, Puppeteer, LLM Prompt Engineering\n\nEXPERIENCE\nAI Native Full Stack Developer | Autonomous Client Systems (2022 - Present)\n• Developed full-stack SaaS platforms and responsive web applications using Next.js, TypeScript, and Node.js.\n• Built cross-platform mobile applications in Flutter with offline synchronization and real-time backend updates.\n• Automated high-frequency browser operations and lead qualification engines using Puppeteer and CDP protocols.\n• Integrated Stripe payments, multi-tenant databases with PostgreSQL, and microservices architectures.\n• Optimized application performance, reducing page load times by 45% and improving API throughput.`,
      sampleJobDescription: `Senior AI Native Full Stack Developer\nCompany: Cognitive Cloud Systems (Remote)\nRequirements:\n- 4+ years of professional engineering experience with React, Next.js, and TypeScript.\n- Strong proficiency in Python, FastAPI, and Node.js for scalable backend microservices.\n- Hands-on experience developing Generative AI, LLM workflows, LangChain, and Agentic Workflows.\n- Deep expertise in PostgreSQL, Redis, Docker, and CI/CD pipelines.\n- Experience with Browser Automation (Puppeteer / Playwright) and web scraping.\n- Demonstrated ability to deliver production-grade code, reduce API latency, and scale to thousands of users.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/resume/analyze", (req, res) => {
  try {
    const { resumeText } = req.body;
    const jobDescription = req.body.jobDescription || req.body.targetJobDescription || "";
    const analysis = resumeEnhancer.analyzeResume({ resumeText, jobDescription });
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post("/resume/enhance", (req, res) => {
  try {
    const { resumeText, candidateName, targetRole } = req.body;
    const jobDescription = req.body.jobDescription || req.body.targetJobDescription || "";
    const enhanced = resumeEnhancer.enhanceResume({
      resumeText,
      jobDescription,
      candidateName,
      targetRole
    });
    res.json({ success: true, result: enhanced });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 6. UNIFIED WORKFLOW PIPELINE ENDPOINTS
// ---------------------------------------------------------------------------
router.get("/workflow/metrics", (req, res) => {
  try {
    const metrics = workflowOrchestrator.getOverallMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/workflow/runs", (req, res) => {
  try {
    const runs = workflowOrchestrator.getRuns(50);
    res.json({ success: true, runs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/workflow/run-lead", async (req, res) => {
  try {
    const { leadId, templateName, customNote } = req.body;
    const run = await workflowOrchestrator.runLeadOutreachPipeline({ leadId, templateName, customNote });
    res.json({ success: true, run });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post("/workflow/run-job", async (req, res) => {
  try {
    const { platform, jobId, jobUrl, jobDescription, baseResumeText, candidateProfile } = req.body;
    const result = await workflowOrchestrator.runJobApplicationPipeline({
      platform,
      jobId,
      jobUrl,
      jobDescription,
      baseResumeText,
      candidateProfile
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
