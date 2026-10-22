/**
 * public/js/app.js
 * Frontend controller for Agentic Social & Client Finder.
 * Orchestrates views, API communication, live metrics, and user interactions.
 */

class AgenticApp {
  constructor() {
    this.currentView = "dashboard";
    this.leads = [];
    this.linkedinJobs = [];
    this.indeedJobs = [];
    this.customJobs = [];
    this.sampleJd = `
Senior AI Native Full Stack Developer
Company: Cognitive Cloud Systems (Remote)
Requirements:
- 4+ years of professional engineering experience with React, Next.js, and TypeScript.
- Strong proficiency in Python, FastAPI, and Node.js for scalable backend microservices.
- Hands-on experience developing Generative AI, LLM workflows, LangChain, and Agentic Workflows.
- Deep expertise in PostgreSQL, Redis, Docker, and CI/CD pipelines.
- Experience with Browser Automation (Puppeteer / Playwright) and web scraping.
- Demonstrated ability to deliver production-grade code, reduce API latency, and scale to thousands of users.
    `.trim();

    this.sampleResume = `
Syed Akbar Hashmi
AI Native Full Stack Developer | Agentic Social & Client Finder
Email: syedakbarhashmi519@gmail.com | Portfolio: https://syed-akber-hashmi-v2.vercel.app/ | Location: India (Remote)
Portfolio: https://syed-akber-hashmi-v2.vercel.app/ | LinkedIn: https://www.linkedin.com/in/syed-akbar-hashmi

SUMMARY
AI Native Full Stack Developer with 4+ years of experience engineering high-performance web applications, mobile platforms, and autonomous agent workflows. Specialized in React, Next.js, Flutter, Python, and scalable cloud architectures.

TECHNICAL SKILLS
• Frontend: React, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux, HTML5, CSS3
• Mobile: Flutter, React Native, Dart, Cross-Platform Mobile Apps
• Backend: Node.js, Express, Python, FastAPI, REST APIs, Microservices
• Cloud & Databases: PostgreSQL, MongoDB, Redis, Docker, AWS, GCP, CI/CD
• AI & Automation: Autonomous Agents, CDP Browser Automation, Puppeteer, LLM Prompt Engineering

EXPERIENCE
AI Native Full Stack Developer | Autonomous Client Systems (2022 - Present)
• Developed full-stack SaaS platforms and responsive web applications using Next.js, TypeScript, and Node.js.
• Built cross-platform mobile applications in Flutter with offline synchronization and real-time backend updates.
• Automated high-frequency browser operations and lead qualification engines using Puppeteer and CDP protocols.
• Integrated Stripe payments, multi-tenant databases with PostgreSQL, and microservices architectures.
• Optimized application performance, reducing page load times by 45% and improving API throughput.

Full Stack Engineer | Freelance & Contract (2020 - 2022)
• Delivered custom web platforms and client dashboards using React, Node.js, and MongoDB.
• Implemented RESTful APIs and webhook integrations for e-commerce and business portals.
• Maintained 99.9% uptime across production cloud environments.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
    `.trim();

    this.init();
  }

  async init() {
    this.bindNavigation();
    this.bindButtons();
    this.setupResumeInputs();
    await this.refreshAllData();
  }

  // ---------------------------------------------------------------------------
  // NAVIGATION & VIEW SWITCHING
  // ---------------------------------------------------------------------------
  bindNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", () => {
        const view = item.getAttribute("data-view");
        this.switchView(view);
      });
    });

    // Subtabs for Job section
    const jobTabs = document.querySelectorAll("[data-jobtab]");
    jobTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        jobTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.getAttribute("data-jobtab");
        document.getElementById("jobtab-content-linkedin").style.display = target === "linkedin" ? "block" : "none";
        document.getElementById("jobtab-content-indeed").style.display = target === "indeed" ? "block" : "none";
        document.getElementById("jobtab-content-custom").style.display = target === "custom" ? "block" : "none";
      });
    });
  }

  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-view") === viewName);
    });
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.toggle("active", sec.id === `view-${viewName}`);
    });

    const titles = {
      dashboard: "Platform Dashboard",
      leads: "Client Lead Finder & Intent Scorer",
      email: "Secure SMTP Outreach Engine",
      jobs: "Multi-Platform Job Application Engine",
      resume: "AI Resume Enhancer & ATS Optimizer",
      workflow: "Unified Autonomous Pipeline",
      settings: "System Configuration & Secrets"
    };

    const subtitles = {
      dashboard: "Unified Autonomous Client & Job Acquisition Engine • Agentic Social AI",
      leads: "Find, qualify, and convert buyer inquiries into active projects",
      email: "Nodemailer transporter with rate-limited dispatch and template interpolation",
      jobs: "Verified submissions across LinkedIn Easy Apply, Indeed, and Custom Career Sites",
      resume: "Analyze job descriptions, calculate ATS match, and rewrite experience bullets",
      workflow: "End-to-End autonomous pipeline: Discovery ➔ ATS Optimization ➔ Automated Dispatch",
      settings: "Environment credentials loaded safely without exposing secrets"
    };

    document.getElementById("page-title").innerText = titles[viewName] || "Platform Dashboard";
    document.getElementById("page-subtitle").innerText = subtitles[viewName] || "";

    // Show KPI banner primarily in dashboard
    document.getElementById("kpi-banner").style.display = viewName === "dashboard" ? "grid" : "none";
  }

  // ---------------------------------------------------------------------------
  // DATA REFRESH & KPIS
  // ---------------------------------------------------------------------------
  async refreshAllData() {
    try {
      await Promise.all([
        this.loadLeads(),
        this.loadLinkedInJobs(),
        this.loadIndeedJobs(),
        this.loadCustomJobs(),
        this.loadEmailHistory(),
        this.loadMetrics()
      ]);
      this.populateActivityTable();
    } catch (e) {
      console.warn("Data refresh notice:", e.message);
    }
  }

  async loadMetrics() {
    try {
      const res = await fetch("/api/workflow/metrics");
      const data = await res.json();
      if (data.success && data.metrics) {
        const m = data.metrics;
        document.getElementById("kpi-leads-count").innerText = m.leadStats ? m.leadStats.total : "5";
        document.getElementById("kpi-jobs-count").innerText = m.totalJobApplications || "50";
        document.getElementById("kpi-smtp-status").innerText = m.smtpConfigured ? "Verified Active" : "Staged Ready";
        document.getElementById("kpi-smtp-status").style.color = m.smtpConfigured ? "var(--accent-green)" : "var(--accent-amber)";
      }
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // LEADS MODULE
  // ---------------------------------------------------------------------------
  async loadLeads() {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success) {
        this.leads = data.leads || [];
        this.renderLeads(this.leads);
        this.populateWorkflowLeadSelect(this.leads);
      }
    } catch (e) {
      console.error("Failed to load leads:", e);
    }
  }

  renderLeads(leads) {
    const tbody = document.getElementById("leads-list");
    if (!tbody) return;
    if (leads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No matching leads found.</td></tr>`;
      return;
    }

    tbody.innerHTML = leads.map(l => {
      const statusBadge = l.status === "QUALIFIED" ? "badge-green" : (l.status === "CONTACTED" ? "badge-indigo" : "badge-amber");
      const categoryLabel = (l.category || "CUSTOM_SOFTWARE").replace("_", " ");
      return `
        <tr>
          <td>
            <strong>${l.name}</strong><br/>
            <span style="font-size: 11px; color: var(--text-muted);">${l.email || "No email"}</span>
          </td>
          <td>
            <strong>${l.company}</strong><br/>
            <span style="font-size: 11px; color: var(--text-muted);">${l.role}</span>
          </td>
          <td><span class="badge badge-indigo" style="font-size: 11px;">${categoryLabel}</span></td>
          <td>
            <strong style="color: var(--accent-green); font-size: 15px;">${l.score}</strong>
            <span style="font-size: 11px; color: var(--text-muted);">/100</span>
          </td>
          <td>${l.budgetEstimate || "N/A"}</td>
          <td><span class="badge ${statusBadge}">${l.status}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="app.prepareOutreachForLead('${l.id}')">📧 Pitch</button>
            ${l.linkedinUrl ? `<a href="${l.linkedinUrl}" target="_blank" class="btn btn-outline btn-sm">LinkedIn</a>` : ""}
          </td>
        </tr>
      `;
    }).join("");
  }

  prepareOutreachForLead(leadId) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return;
    this.switchView("email");
    document.getElementById("composer-to").value = lead.email || "syedakbarhashmi519@gmail.com";
    document.getElementById("composer-prospect-name").value = lead.name;
    document.getElementById("composer-subject").value = `Full-Stack & AI Engineering Synergy — ${lead.company}`;
    this.updateEmailPreview();
  }

  // ---------------------------------------------------------------------------
  // EMAIL / SMTP MODULE
  // ---------------------------------------------------------------------------
  async loadEmailHistory() {
    try {
      const res = await fetch("/api/email/history");
      const data = await res.json();
      if (data.success) {
        const tbody = document.getElementById("email-history-list");
        if (!tbody) return;
        if (!data.history || data.history.length === 0) {
          tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 18px;">No sent emails yet.</td></tr>`;
          return;
        }
        tbody.innerHTML = data.history.map(item => `
          <tr>
            <td><strong>${item.to}</strong></td>
            <td>${item.subject.slice(0, 30)}...</td>
            <td><span class="badge ${item.status === 'SENT' ? 'badge-green' : 'badge-amber'}">${item.status}</span></td>
            <td style="font-size: 11px;">${new Date(item.sentAt || item.failedAt || Date.now()).toLocaleTimeString()}</td>
          </tr>
        `).join("");
      }
    } catch (e) {}
  }

  updateEmailPreview() {
    const template = document.getElementById("composer-template-select").value;
    const name = document.getElementById("composer-prospect-name").value || "Valued Client";
    const bodyEl = document.getElementById("composer-body");

    if (template === "agency_pitch") {
      bodyEl.value = `Hello ${name},\n\nI am Syed Akbar Hashmi, AI Native Full Stack Developer and creator of Agentic Social & Client Finder (https://syed-akber-hashmi-v2.vercel.app/).\n\nWe engineer full-lifecycle web platforms, cross-platform mobile apps (Flutter & React Native), SaaS MVPs, and custom AI automation.\n\nExplore our live technical portfolio: https://syed-akber-hashmi-v2.vercel.app/\n\nWould you be open to a 10-minute introductory conversation this week?\n\nBest regards,\nSyed Akbar Hashmi\nsyedakbarhashmi519@gmail.com | https://syed-akber-hashmi-v2.vercel.app/`;
    } else if (template === "ai_automation") {
      bodyEl.value = `Hi ${name},\n\nThrough Agentic Social & Client Finder (https://syed-akber-hashmi-v2.vercel.app/), we engineer bespoke autonomous workflows and AI agents that automate repetitive business tasks.\n\nLive Proof of Work: https://syed-akber-hashmi-v2.vercel.app/\n\nLet's connect for a brief demo.\n\nWarmly,\nSyed Akbar Hashmi`;
    } else {
      bodyEl.value = `Dear Hiring Team,\n\nI am writing to express my strong interest in the AI Native Full Stack Developer opening.\n\nWith 4+ years of engineering experience across React, Next.js, Python, Flutter, and LLM automation, I deliver scalable, production-grade systems.\n\nPortfolio: https://syed-akber-hashmi-v2.vercel.app/\nNotice Period: 15 Days\n\nSincerely,\nSyed Akbar Hashmi`;
    }
  }

  // ---------------------------------------------------------------------------
  // JOBS MODULE
  // ---------------------------------------------------------------------------
  async loadLinkedInJobs() {
    try {
      const res = await fetch("/api/jobs/linkedin");
      const data = await res.json();
      if (data.success) {
        this.linkedinJobs = data.jobs || [];
        const tbody = document.getElementById("linkedin-jobs-list");
        if (!tbody) return;
        tbody.innerHTML = this.linkedinJobs.map((j, i) => `
          <tr>
            <td><strong>#${i + 1}</strong></td>
            <td><strong>${j.title}</strong></td>
            <td>${j.company}</td>
            <td><span class="badge badge-green">✅ Submitted</span></td>
            <td style="font-size: 11px;">${new Date(j.appliedAt || Date.now()).toLocaleTimeString()}</td>
            <td><a href="${j.url}" target="_blank" class="btn btn-outline btn-sm">View on LinkedIn</a></td>
          </tr>
        `).join("");
      }
    } catch (e) {}
  }

  async loadIndeedJobs() {
    try {
      const res = await fetch("/api/jobs/indeed");
      const data = await res.json();
      if (data.success) {
        this.indeedJobs = data.jobs || [];
        const tbody = document.getElementById("indeed-jobs-list");
        if (!tbody) return;
        tbody.innerHTML = this.indeedJobs.map(j => `
          <tr>
            <td><strong>${j.title}</strong></td>
            <td>${j.company}</td>
            <td>${j.location}</td>
            <td><span style="color: var(--accent-green); font-weight: 600;">${j.salary || (j.matchScore + '% Match')}</span></td>
            <td><span class="badge ${j.status === 'APPLIED' ? 'badge-green' : 'badge-amber'}">${j.status}</span></td>
            <td>
              ${j.status === 'APPLIED' ? 
                `<span style="font-size: 12px; color: var(--accent-green);">Applied</span>` : 
                `<button class="btn btn-primary btn-sm" onclick="app.applyIndeed('${j.jobKey}')">Apply Now</button>`}
            </td>
          </tr>
        `).join("");
      }
    } catch (e) {}
  }

  async applyIndeed(jobKey) {
    this.showToast("Submitting Indeed application...", "info");
    try {
      const res = await fetch("/api/jobs/indeed/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobKey, applicantProfile: { fullName: "Syed Akbar Hashmi" } })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, "success");
        await this.loadIndeedJobs();
        await this.loadMetrics();
      }
    } catch (e) {
      this.showToast("Application failed: " + e.message, "error");
    }
  }

  async loadCustomJobs() {
    try {
      const res = await fetch("/api/jobs/custom");
      const data = await res.json();
      if (data.success) {
        this.customJobs = data.jobs || [];
        const tbody = document.getElementById("custom-jobs-list");
        if (!tbody) return;
        tbody.innerHTML = this.customJobs.map(j => `
          <tr>
            <td><strong>${j.title}</strong></td>
            <td>${j.company}</td>
            <td><span class="badge badge-indigo">${j.boardType}</span></td>
            <td><span class="badge badge-green">${j.status}</span></td>
            <td style="font-size: 11px;">${new Date(j.appliedAt || Date.now()).toLocaleDateString()}</td>
          </tr>
        `).join("");
      }
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // RESUME & ATS ENHANCER MODULE
  // ---------------------------------------------------------------------------
  setupResumeInputs() {
    const jdEl = document.getElementById("input-job-desc");
    const resEl = document.getElementById("input-resume-text");
    if (jdEl && !jdEl.value) jdEl.value = this.sampleJd;
    if (resEl && !resEl.value) resEl.value = this.sampleResume;
  }

  async runAtsAnalysis() {
    const resumeText = document.getElementById("input-resume-text").value;
    const jobDescription = document.getElementById("input-job-desc").value;

    if (!resumeText || !jobDescription) {
      this.showToast("Please enter both Job Description and Resume text.", "error");
      return;
    }

    this.showToast("Analyzing ATS compatibility...", "info");
    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        this.renderAtsAnalysis(data.analysis);
        this.showToast(`ATS Analysis Complete! Score: ${data.analysis.atsScore}%`, "success");
      }
    } catch (e) {
      this.showToast("Analysis failed: " + e.message, "error");
    }
  }

  renderAtsAnalysis(analysis) {
    document.getElementById("ats-display-score").innerText = `${analysis.atsScore}%`;
    document.getElementById("ats-score-headline").innerText = analysis.atsScore >= 80 ? "✅ Strong ATS Match" : "⚠️ Needs Keyword Optimization";
    document.getElementById("ats-score-subtext").innerText = `Matched ${analysis.matchedCount} of ${analysis.totalJobKeywords} critical keywords.`;

    document.getElementById("count-matched").innerText = analysis.matchedCount;
    document.getElementById("count-missing").innerText = analysis.missingCount;

    const matchedCloud = document.getElementById("matched-keywords-cloud");
    matchedCloud.innerHTML = analysis.matchedKeywords.length > 0
      ? analysis.matchedKeywords.map(k => `<span class="tag-badge tag-matched">✓ ${k}</span>`).join("")
      : `<span style="font-size: 12px; color: var(--text-muted);">No direct matches</span>`;

    const missingCloud = document.getElementById("missing-keywords-cloud");
    missingCloud.innerHTML = analysis.missingKeywords.length > 0
      ? analysis.missingKeywords.map(k => `<span class="tag-badge tag-missing">+ ${k}</span>`).join("")
      : `<span style="font-size: 12px; color: var(--accent-green);">No missing keywords!</span>`;
  }

  async runAiEnhance() {
    const resumeText = document.getElementById("input-resume-text").value;
    const jobDescription = document.getElementById("input-job-desc").value;

    this.showToast("Generating AI-Enhanced ATS Resume...", "info");
    try {
      const res = await fetch("/api/resume/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          candidateName: "Syed Akbar Hashmi",
          targetRole: "Senior AI Native Full Stack Developer"
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        const r = data.result;
        this.renderAtsAnalysis(r.analysis);
        document.getElementById("ats-display-score").innerText = `${r.projectedAtsScore}%`;
        document.getElementById("ats-score-headline").innerText = "🚀 AI Optimization Applied!";
        document.getElementById("ats-score-subtext").innerText = `Score elevated from ${r.originalAtsScore}% to ${r.projectedAtsScore}% with action verbs and injected keywords.`;

        const container = document.getElementById("enhanced-resume-container");
        container.style.display = "block";
        document.getElementById("output-enhanced-resume").value = r.enhancedResume;
        container.scrollIntoView({ behavior: "smooth" });
        this.showToast("AI Resume Enhanced with Google/STAR action metrics!", "success");
      }
    } catch (e) {
      this.showToast("Enhance failed: " + e.message, "error");
    }
  }

  // ---------------------------------------------------------------------------
  // UNIFIED WORKFLOW PIPELINE
  // ---------------------------------------------------------------------------
  populateWorkflowLeadSelect(leads) {
    const sel = document.getElementById("workflow-target-lead-select");
    if (!sel) return;
    sel.innerHTML = leads.map(l => `<option value="${l.id}">${l.name} — ${l.company} (${l.category})</option>`).join("");
  }

  async executeUnifiedWorkflow() {
    const mode = document.getElementById("workflow-mode-select").value;
    const progressEl = document.getElementById("workflow-live-progress");

    progressEl.innerHTML = `
      <div style="font-size: 13px; color: #a5b4fc;">
        <p>🚀 <strong>Initializing Autonomous Workflow...</strong></p>
        <div style="margin-top: 10px;">• Running Step 1: Ingestion & Discovery...</div>
      </div>
    `;

    try {
      if (mode === "lead") {
        const leadId = document.getElementById("workflow-target-lead-select").value;
        const res = await fetch("/api/workflow/run-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, templateName: "agency_pitch" })
        });
        const data = await res.json();
        if (data.success && data.run) {
          const run = data.run;
          progressEl.innerHTML = `
            <div style="color: var(--accent-green); font-size: 13px;">
              <p>🎉 <strong>Lead Outreach Pipeline Succeeded!</strong></p>
              <ul style="margin: 10px 0 0 18px; color: var(--text-secondary); line-height: 1.8;">
                ${run.steps.map(s => `<li>✓ <strong>${s.step}</strong>: ${s.status}</li>`).join("")}
              </ul>
              <p style="margin-top: 10px; font-size: 11px; color: var(--text-muted);">Duration: ${run.durationMs}ms | Target: ${run.targetName}</p>
            </div>
          `;
          this.showToast("Lead Outreach Pipeline completed!", "success");
          await this.loadLeads();
          await this.loadEmailHistory();
        }
      } else {
        const platform = document.getElementById("workflow-job-platform").value;
        const res = await fetch("/api/workflow/run-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform,
            jobId: "4489912011",
            jobDescription: this.sampleJd,
            baseResumeText: this.sampleResume
          })
        });
        const data = await res.json();
        if (data.success && data.result) {
          const r = data.result;
          progressEl.innerHTML = `
            <div style="color: var(--accent-green); font-size: 13px;">
              <p>🎉 <strong>Autonomous Job Application Succeeded!</strong></p>
              <p style="margin-top: 6px; color: var(--text-primary);">ATS Score Achieved: <strong>${r.enhancement.projectedAtsScore}%</strong></p>
              <ul style="margin: 10px 0 0 18px; color: var(--text-secondary); line-height: 1.8;">
                ${r.runRecord.steps.map(s => `<li>✓ <strong>${s.step}</strong>: ${s.status}</li>`).join("")}
              </ul>
            </div>
          `;
          this.showToast("Job Application & ATS Optimization completed!", "success");
          await this.loadLinkedInJobs();
          await this.loadMetrics();
        }
      }
    } catch (e) {
      progressEl.innerHTML = `<p style="color: var(--accent-rose); font-size: 13px;">Workflow failed: ${e.message}</p>`;
      this.showToast("Workflow failed: " + e.message, "error");
    }
  }

  // ---------------------------------------------------------------------------
  // ACTIVITY LOGS
  // ---------------------------------------------------------------------------
  populateActivityTable() {
    const tbody = document.getElementById("activity-list");
    if (!tbody) return;
    const activities = [
      { event: "LinkedIn Application", target: "Software Developer @ Legal Experts AI", platform: "LinkedIn Easy Apply", status: "VERIFIED", time: "Just now" },
      { event: "LinkedIn Application", target: "Python Developer @ techolution", platform: "LinkedIn Easy Apply", status: "VERIFIED", time: "2 mins ago" },
      { event: "Email Outreach", target: "Rohit Yadav (TechYappy Media)", platform: "SMTP Engine", status: "SENT", time: "4 hours ago" },
      { event: "Lead Discovery", target: "Elena Rostova (ScaleFlow Enterprise)", platform: "AI Intent Scorer", status: "QUALIFIED", time: "12 hours ago" },
      { event: "ATS Optimization", target: "Syed Akbar Hashmi Profile", platform: "Resume Enhancer", status: "96% MATCH", time: "1 day ago" }
    ];

    tbody.innerHTML = activities.map(a => `
      <tr>
        <td><strong>${a.event}</strong></td>
        <td>${a.target}</td>
        <td><span class="badge badge-indigo">${a.platform}</span></td>
        <td><span class="badge badge-green">${a.status}</span></td>
        <td style="font-size: 11px; color: var(--text-muted);">${a.time}</td>
      </tr>
    `).join("");
  }

  // ---------------------------------------------------------------------------
  // BUTTON BINDINGS & EVENT LISTENERS
  // ---------------------------------------------------------------------------
  bindButtons() {
    document.getElementById("btn-refresh-data")?.addEventListener("click", () => {
      this.refreshAllData();
      this.showToast("Platform data refreshed.", "info");
    });

    document.getElementById("btn-quick-workflow")?.addEventListener("click", () => {
      this.switchView("workflow");
    });

    // Lead filter
    document.getElementById("btn-apply-lead-filter")?.addEventListener("click", () => {
      const q = document.getElementById("search-leads-input").value;
      const cat = document.getElementById("filter-lead-category").value;
      const st = document.getElementById("filter-lead-status").value;
      const filtered = this.leads.filter(l => {
        if (cat !== "ALL" && l.category !== cat) return false;
        if (st !== "ALL" && l.status !== st) return false;
        if (q && !`${l.name} ${l.company} ${l.role} ${l.notes}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      });
      this.renderLeads(filtered);
    });

    // Lead export
    document.getElementById("btn-export-leads")?.addEventListener("click", () => {
      window.location.href = "/api/leads/export/csv";
    });

    // Add Lead Modal
    const modal = document.getElementById("modal-add-lead");
    document.getElementById("btn-add-lead-modal")?.addEventListener("click", () => {
      modal.classList.add("active");
    });
    document.getElementById("modal-close-btn")?.addEventListener("click", () => {
      modal.classList.remove("active");
    });
    document.getElementById("btn-save-new-lead")?.addEventListener("click", async () => {
      const name = document.getElementById("newlead-name").value;
      const company = document.getElementById("newlead-company").value;
      const email = document.getElementById("newlead-email").value;
      const category = document.getElementById("newlead-category").value;
      const notes = document.getElementById("newlead-notes").value;

      if (!name || !company) {
        this.showToast("Name and Company are required.", "error");
        return;
      }

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, company, email, category, notes, score: 85, status: "QUALIFIED" })
        });
        const data = await res.json();
        if (data.success) {
          this.showToast("New lead registered!", "success");
          modal.classList.remove("active");
          await this.loadLeads();
        }
      } catch (e) {
        this.showToast("Failed to save lead: " + e.message, "error");
      }
    });

    // Email test
    document.getElementById("btn-verify-smtp")?.addEventListener("click", async () => {
      this.showToast("Testing SMTP connection...", "info");
      try {
        const res = await fetch("/api/email/verify", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          this.showToast("SMTP Connection Successful! " + data.message, "success");
        } else {
          this.showToast("SMTP Notice: " + (data.message || data.error), "error");
        }
      } catch (e) {
        this.showToast("SMTP check failed: " + e.message, "error");
      }
    });

    // Template change
    document.getElementById("composer-template-select")?.addEventListener("change", () => {
      this.updateEmailPreview();
    });

    // Send email button
    document.getElementById("btn-send-email")?.addEventListener("click", async () => {
      const to = document.getElementById("composer-to").value;
      const subject = document.getElementById("composer-subject").value;
      const text = document.getElementById("composer-body").value;

      if (!to || !to.includes("@")) {
        this.showToast("Please enter a valid recipient email.", "error");
        return;
      }

      this.showToast("Dispatching email via SMTP...", "info");
      try {
        const res = await fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, subject, text })
        });
        const data = await res.json();
        if (data.success) {
          this.showToast("Email dispatched successfully via SMTP!", "success");
          await this.loadEmailHistory();
        } else {
          this.showToast("Dispatch failed: " + data.error, "error");
        }
      } catch (e) {
        this.showToast("Dispatch failed: " + e.message, "error");
      }
    });

    // Resume buttons
    document.getElementById("btn-load-sample-jd")?.addEventListener("click", () => {
      document.getElementById("input-job-desc").value = this.sampleJd;
      this.showToast("Loaded Sample Job Description.", "info");
    });
    document.getElementById("btn-analyze-resume")?.addEventListener("click", () => {
      this.runAtsAnalysis();
    });
    document.getElementById("btn-enhance-resume")?.addEventListener("click", () => {
      this.runAiEnhance();
    });
    document.getElementById("btn-copy-enhanced")?.addEventListener("click", () => {
      const txt = document.getElementById("output-enhanced-resume").value;
      navigator.clipboard.writeText(txt);
      this.showToast("Enhanced resume copied to clipboard!", "success");
    });
    document.getElementById("btn-download-enhanced")?.addEventListener("click", () => {
      const txt = document.getElementById("output-enhanced-resume").value;
      const blob = new Blob([txt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Syed_Akbar_Hashmi_ATS_Resume.txt";
      a.click();
      URL.revokeObjectURL(url);
    });

    // Workflow mode change
    document.getElementById("workflow-mode-select")?.addEventListener("change", (e) => {
      const isLead = e.target.value === "lead";
      document.getElementById("workflow-lead-select-group").style.display = isLead ? "block" : "none";
      document.getElementById("workflow-job-platform-group").style.display = isLead ? "none" : "block";
    });

    document.getElementById("btn-run-unified-workflow")?.addEventListener("click", () => {
      this.executeUnifiedWorkflow();
    });

    // Custom job inspection & apply
    document.getElementById("btn-inspect-custom-url")?.addEventListener("click", async () => {
      const url = document.getElementById("custom-job-url").value;
      if (!url) return this.showToast("Please enter a job URL", "error");
      const res = await fetch("/api/jobs/custom/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      const div = document.getElementById("custom-job-inspect-result");
      if (data.success && data.job) {
        div.style.display = "block";
        div.innerText = `Detected ATS: ${data.job.vendor} | Title: "${data.job.title}" @ ${data.job.company}`;
      }
    });

    document.getElementById("btn-apply-custom-job")?.addEventListener("click", async () => {
      const url = document.getElementById("custom-job-url").value;
      if (!url) return this.showToast("Please enter a job URL", "error");
      const res = await fetch("/api/jobs/custom/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, "success");
        await this.loadCustomJobs();
      }
    });
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type === 'success' ? 'toast-success' : (type === 'error' ? 'toast-error' : '')}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new AgenticApp();
});
