/**
 * src/leads/lead-engine.js
 * Production-ready Lead Finder & Relationship Engine for NexxIQ AI Platform (nexxiqai.com).
 * Discovers, filters, scores, categorizes, and tracks high-value client leads
 * across Web Development, Mobile Apps, SaaS MVPs, and AI Automation.
 */

const fs = require("fs");
const path = require("path");

class LeadEngine {
  constructor(options = {}) {
    this.rootDir = options.rootDir || path.resolve(__dirname, "../..");
    this.dataDir = path.resolve(this.rootDir, "data");
    this.leadsFile = path.resolve(this.dataDir, "leads.json");
    this.ensureDataDirectory();
    this.seedDefaultLeadsIfEmpty();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.leadsFile)) {
      fs.writeFileSync(this.leadsFile, JSON.stringify([], null, 2), "utf8");
    }
  }

  seedDefaultLeadsIfEmpty() {
    try {
      const existing = this.getAllLeads();
      if (existing.length === 0) {
        const seedLeads = [
          {
            id: "lead_nexx_101",
            name: "Rohit Yadav",
            company: "TechYappy Media",
            role: "Founder & CTO",
            email: "info@techyappy.com",
            linkedinUrl: "https://www.linkedin.com/in/rohit-yadav-4a88ba440/",
            source: "LinkedIn",
            category: "WEB_DEVELOPMENT",
            score: 95,
            budgetEstimate: "$3,000 - $7,000",
            status: "CONTACTED",
            notes: "Needs responsive web application, high-converting landing pages, and SaaS architecture.",
            detectedKeywords: ["Next.js", "SaaS MVP", "React", "Mobile App"],
            lastContactedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: "lead_nexx_102",
            name: "Muhammad Haris",
            company: "Apex Growth Ventures",
            role: "Managing Director",
            email: "m.haris@apexgrowth.io",
            linkedinUrl: "https://www.linkedin.com/in/muhammad-haris-125941394/",
            source: "LinkedIn",
            category: "SAAS_MVP",
            score: 92,
            budgetEstimate: "$5,000 - $12,000",
            status: "CONTACTED",
            notes: "Seeking full-stack team to build multi-tenant analytics SaaS with Stripe payments.",
            detectedKeywords: ["Multi-tenant", "Stripe", "PostgreSQL", "Node.js"],
            lastContactedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          },
          {
            id: "lead_nexx_103",
            name: "Hitesh Prajapat",
            company: "OmniHealth Labs",
            role: "Head of Digital Products",
            email: "hitesh@omnihealth.tech",
            linkedinUrl: "https://www.linkedin.com/in/hitesh-prajapat-29bb7a419/",
            source: "LinkedIn",
            category: "MOBILE_APP",
            score: 89,
            budgetEstimate: "$8,000 - $15,000",
            status: "CONTACTED",
            notes: "Looking for Flutter cross-platform mobile developer with offline sync capabilities.",
            detectedKeywords: ["Flutter", "Cross-Platform", "iOS", "Android", "BLE"],
            lastContactedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          },
          {
            id: "lead_nexx_104",
            name: "Elena Rostova",
            company: "ScaleFlow Enterprise",
            role: "VP of Engineering",
            email: "elena@scaleflow.ai",
            linkedinUrl: "https://www.linkedin.com/in/elena-rostova-ai",
            source: "Web",
            category: "AI_AUTOMATION",
            score: 98,
            budgetEstimate: "$15,000 - $35,000",
            status: "QUALIFIED",
            notes: "Autonomous agent pipeline to extract data, automate back-office operations, and connect to CRM.",
            detectedKeywords: ["Autonomous Agents", "LLM", "CDP Browser Automation", "Python", "FastAPI"],
            lastContactedAt: null,
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
          },
          {
            id: "lead_nexx_105",
            name: "David Chen",
            company: "QuantumLogix Systems",
            role: "Co-Founder",
            email: "david.chen@quantumlogix.co",
            linkedinUrl: "https://www.linkedin.com/in/david-chen-ql",
            source: "Threads",
            category: "CUSTOM_SOFTWARE",
            score: 88,
            budgetEstimate: "$6,000 - $14,000",
            status: "NEW",
            notes: "Rebuilding legacy inventory portal into modern React + Node cloud microservices.",
            detectedKeywords: ["Portal", "Database Migration", "REST API", "Docker"],
            lastContactedAt: null,
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          }
        ];
        this.saveAllLeads(seedLeads);
      }
    } catch (e) {
      console.warn("Could not seed default leads:", e.message);
    }
  }

  getAllLeads() {
    try {
      if (fs.existsSync(this.leadsFile)) {
        const raw = fs.readFileSync(this.leadsFile, "utf8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error("Failed to read leads file:", e.message);
    }
    return [];
  }

  saveAllLeads(leads) {
    fs.writeFileSync(this.leadsFile, JSON.stringify(leads, null, 2), "utf8");
  }

  /**
   * Search and filter leads by category, query, minimum score, and status.
   */
  searchLeads(options = {}) {
    const { query = "", category = "ALL", status = "ALL", minScore = 0, limit = 50 } = options;
    const leads = this.getAllLeads();

    const normalizedQuery = query.toLowerCase().trim();

    return leads.filter(lead => {
      // Category filter
      if (category !== "ALL" && lead.category !== category) return false;

      // Status filter
      if (status !== "ALL" && lead.status !== status) return false;

      // Score filter
      if (lead.score < Number(minScore)) return false;

      // Text query match
      if (normalizedQuery) {
        const combined = `${lead.name} ${lead.company} ${lead.role} ${lead.notes} ${lead.category} ${(lead.detectedKeywords || []).join(" ")}`.toLowerCase();
        if (!combined.includes(normalizedQuery)) return false;
      }

      return true;
    }).slice(0, limit);
  }

  getLeadById(id) {
    const leads = this.getAllLeads();
    return leads.find(l => l.id === id) || null;
  }

  /**
   * Evaluates text/post to extract a scored lead object.
   */
  scoreAndClassifyPost(rawText, source = "Web", authorMetadata = {}) {
    const text = String(rawText || "");
    const lower = text.toLowerCase();

    // Determine Category
    let category = "CUSTOM_SOFTWARE";
    let baseScore = 60;
    const detectedKeywords = [];

    if (/flutter|react\s*native|ios|android|mobile\s*app/i.test(lower)) {
      category = "MOBILE_APP";
      detectedKeywords.push("Mobile App", "Cross-Platform");
      baseScore += 15;
    } else if (/saas|mvp|multi-tenant|stripe|subscription/i.test(lower)) {
      category = "SAAS_MVP";
      detectedKeywords.push("SaaS Platform", "MVP");
      baseScore += 20;
    } else if (/ai|agent|llm|automation|bot|gpt|crawler|scraping/i.test(lower)) {
      category = "AI_AUTOMATION";
      detectedKeywords.push("AI Native", "Autonomous Agent");
      baseScore += 25;
    } else if (/website|landing\s*page|frontend|web\s*dev|next\.js/i.test(lower)) {
      category = "WEB_DEVELOPMENT";
      detectedKeywords.push("Web Architecture", "Frontend");
      baseScore += 15;
    }

    // High Intent / Buyer signals
    if (/looking\s+to\s+hire|need\s+a\s+developer|budget|dm\s+portfolio|ready\s+to\s+pay|urgent/i.test(lower)) {
      baseScore += 15;
      detectedKeywords.push("High Buying Intent");
    }

    // Budget estimation
    let budgetEstimate = "$2,000 - $5,000";
    if (/\$10k|\$15k|\$20k|\$30k|\$50k/i.test(lower)) {
      budgetEstimate = "$15,000+";
      baseScore += 10;
    } else if (/\$5k|\$6k|\$7k|\$8k/i.test(lower)) {
      budgetEstimate = "$5,000 - $10,000";
      baseScore += 5;
    }

    const finalScore = Math.min(100, Math.max(40, baseScore));

    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLead = {
      id,
      name: authorMetadata.name || "Prospective Client",
      company: authorMetadata.company || "Enterprise Lead",
      role: authorMetadata.role || "Product Decision Maker",
      email: authorMetadata.email || "",
      linkedinUrl: authorMetadata.linkedinUrl || "",
      source,
      category,
      score: finalScore,
      budgetEstimate,
      status: finalScore >= 80 ? "QUALIFIED" : "NEW",
      notes: text.slice(0, 300),
      detectedKeywords,
      lastContactedAt: null,
      createdAt: new Date().toISOString()
    };

    return newLead;
  }

  /**
   * Adds or registers a newly discovered lead.
   */
  addLead(leadData) {
    const leads = this.getAllLeads();
    const id = leadData.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLead = {
      id,
      name: leadData.name || "Prospective Client",
      company: leadData.company || "Company",
      role: leadData.role || "Decision Maker",
      email: leadData.email || "",
      linkedinUrl: leadData.linkedinUrl || "",
      source: leadData.source || "Manual",
      category: leadData.category || "WEB_DEVELOPMENT",
      score: Number(leadData.score) || 75,
      budgetEstimate: leadData.budgetEstimate || "$3,000 - $8,000",
      status: leadData.status || "NEW",
      notes: leadData.notes || "",
      detectedKeywords: leadData.detectedKeywords || [],
      lastContactedAt: leadData.lastContactedAt || null,
      createdAt: leadData.createdAt || new Date().toISOString()
    };

    leads.unshift(newLead);
    this.saveAllLeads(leads);
    return newLead;
  }

  updateLeadStatus(id, newStatus, additionalNotes = "") {
    const leads = this.getAllLeads();
    const lead = leads.find(l => l.id === id);
    if (!lead) {
      throw new Error(`Lead with ID ${id} not found.`);
    }

    lead.status = newStatus;
    if (newStatus === "CONTACTED") {
      lead.lastContactedAt = new Date().toISOString();
    }
    if (additionalNotes) {
      lead.notes = `${lead.notes || ""}\n[Update ${new Date().toLocaleDateString()}]: ${additionalNotes}`.trim();
    }

    this.saveAllLeads(leads);
    return lead;
  }

  deleteLead(id) {
    const leads = this.getAllLeads();
    const filtered = leads.filter(l => l.id !== id);
    if (filtered.length !== leads.length) {
      this.saveAllLeads(filtered);
      return true;
    }
    return false;
  }

  /**
   * Exports all leads to CSV format.
   */
  exportToCsv(category = "ALL", status = "ALL") {
    const leads = this.searchLeads({ category, status, limit: 1000 });
    const headers = ["ID", "Name", "Company", "Role", "Email", "LinkedIn", "Source", "Category", "Score", "Budget", "Status", "Created At"];
    
    const rows = leads.map(l => [
      `"${l.id}"`,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      `"${(l.role || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.linkedinUrl || "").replace(/"/g, '""')}"`,
      `"${l.source}"`,
      `"${l.category}"`,
      l.score,
      `"${(l.budgetEstimate || "").replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.createdAt}"`
    ]);

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  }

  getStatistics() {
    const leads = this.getAllLeads();
    return {
      total: leads.length,
      qualified: leads.filter(l => l.status === "QUALIFIED").length,
      contacted: leads.filter(l => l.status === "CONTACTED").length,
      converted: leads.filter(l => l.status === "CONVERTED").length,
      byCategory: {
        WEB_DEVELOPMENT: leads.filter(l => l.category === "WEB_DEVELOPMENT").length,
        MOBILE_APP: leads.filter(l => l.category === "MOBILE_APP").length,
        SAAS_MVP: leads.filter(l => l.category === "SAAS_MVP").length,
        AI_AUTOMATION: leads.filter(l => l.category === "AI_AUTOMATION").length,
        CUSTOM_SOFTWARE: leads.filter(l => l.category === "CUSTOM_SOFTWARE").length
      },
      averageScore: leads.length > 0 ? Math.round(leads.reduce((acc, l) => acc + (l.score || 0), 0) / leads.length) : 0
    };
  }
}

// Singleton export
module.exports = new LeadEngine();
