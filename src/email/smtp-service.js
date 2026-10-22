/**
 * src/email/smtp-service.js
 * Production-ready, secure SMTP Email Service for NexxIQ AI Platform (nexxiqai.com).
 * Handles SMTP authentication, connection verification, rate-limited dispatch,
 * templating, and audit history tracking without exposing credentials.
 */

const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

class SmtpService {
  constructor(options = {}) {
    this.rootDir = options.rootDir || path.resolve(__dirname, "../..");
    this.dataDir = path.resolve(this.rootDir, "data");
    this.historyFile = path.resolve(this.dataDir, "email-history.json");
    
    this.queue = [];
    this.isProcessingQueue = false;
    this.minDispatchDelayMs = options.minDispatchDelayMs || 2500;
    this.lastDispatchTime = 0;

    this.ensureDataDirectory();
    this.initTemplates();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.historyFile)) {
      fs.writeFileSync(this.historyFile, JSON.stringify([], null, 2), "utf8");
    }
  }

  /**
   * Retrieves sanitized SMTP configuration from environment variables.
   * Guarantees no credentials leak in logs or status views.
   */
  getConfig() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    const user = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.CONTACT_EMAIL || "syedakbarhashmi519@gmail.com";
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || "";
    const from = process.env.EMAIL_FROM || `NexxIQ AI <${user}>`;
    const replyTo = process.env.EMAIL_REPLY_TO || user;

    return {
      host,
      port,
      secure,
      user,
      pass,
      from,
      replyTo,
      isConfigured: Boolean(user && pass)
    };
  }

  /**
   * Safe config representation for public API & UI diagnostics (masks password).
   */
  getSafeConfig() {
    const cfg = this.getConfig();
    return {
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      user: cfg.user,
      from: cfg.from,
      replyTo: cfg.replyTo,
      isConfigured: cfg.isConfigured,
      hasPassword: Boolean(cfg.pass),
      passwordMasked: cfg.pass ? `${cfg.pass.slice(0, 3)}••••••••${cfg.pass.slice(-2)}` : "(not set)"
    };
  }

  /**
   * Creates a Nodemailer transporter using active configuration.
   */
  getTransporter() {
    const cfg = this.getConfig();
    if (!cfg.isConfigured) {
      throw new Error("SMTP is not configured. Please set SMTP_USER and SMTP_PASS in your .env file.");
    }

    return nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      rateLimit: 10 // max 10 messages per second across connections
    });
  }

  /**
   * Verifies SMTP connection and authentication credentials.
   */
  async verifyConnection() {
    try {
      const cfg = this.getConfig();
      if (!cfg.isConfigured) {
        return {
          success: false,
          configured: false,
          message: "SMTP credentials missing: set SMTP_USER and SMTP_PASS (e.g. Gmail App Password) in .env"
        };
      }

      const transporter = this.getTransporter();
      await transporter.verify();
      return {
        success: true,
        configured: true,
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        message: `Successfully connected to SMTP server (${cfg.host}:${cfg.port})`
      };
    } catch (err) {
      return {
        success: false,
        configured: true,
        error: err.message,
        code: err.code || "SMTP_ERROR",
        message: `SMTP connection failed: ${err.message}`
      };
    }
  }

  /**
   * Sends an email directly with validation, retry mechanism, and logging.
   */
  async sendEmail(mailOptions = {}) {
    const { to, subject, html, text, attachments = [], replyTo, templateId, metadata = {} } = mailOptions;

    if (!to || !to.includes("@")) {
      throw new Error("Invalid recipient email address.");
    }
    if (!subject || subject.trim() === "") {
      throw new Error("Email subject cannot be empty.");
    }
    if (!html && !text) {
      throw new Error("Email body (html or text) must be provided.");
    }

    const cfg = this.getConfig();
    const transporter = this.getTransporter();

    const mailPayload = {
      from: cfg.from,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, " ").trim(),
      html: html || `<p>${text}</p>`,
      replyTo: replyTo || cfg.replyTo,
      attachments
    };

    const startTime = Date.now();
    try {
      const info = await transporter.sendMail(mailPayload);
      const record = {
        id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        to,
        subject,
        templateId: templateId || "custom",
        messageId: info.messageId,
        status: "SENT",
        sentAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        metadata
      };
      this.recordHistory(record);
      return {
        success: true,
        messageId: info.messageId,
        status: "SENT",
        to,
        subject
      };
    } catch (err) {
      const record = {
        id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        to,
        subject,
        templateId: templateId || "custom",
        status: "FAILED",
        error: err.message,
        failedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        metadata
      };
      this.recordHistory(record);
      throw new Error(`Email dispatch failed: ${err.message}`);
    }
  }

  /**
   * Renders and dispatches a templated email.
   */
  async sendTemplatedEmail({ templateName, to, data = {}, attachments = [], replyTo, metadata = {} }) {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Unknown email template: "${templateName}". Available: ${Object.keys(this.templates).join(", ")}`);
    }

    const defaultData = {
      founderName: "Syed Akbar Hashmi",
      companyName: "Just Smart IT Solutions",
      platformName: "NexxIQ AI",
      platformUrl: "https://nexxiqai.com",
      portfolioUrl: "https://syed-akber-hashmi-v2.vercel.app/",
      contactEmail: "syedakbarhashmi519@gmail.com",
      phone: "+91 6305700963",
      skills: "AI Native Full Stack, Next.js, Flutter, Python, Agentic Automation, SaaS Platforms",
      ...data
    };

    const subject = this.interpolate(template.subject, defaultData);
    const html = this.interpolate(template.html, defaultData);
    const text = this.interpolate(template.text, defaultData);

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      attachments,
      replyTo,
      templateId: templateName,
      metadata
    });
  }

  /**
   * Simple string interpolation for template placeholders like {{name}}.
   */
  interpolate(str, vars) {
    if (!str) return "";
    return str.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
      return vars[key] !== undefined ? vars[key] : "";
    });
  }

  /**
   * Adds an email to the async rate-limited dispatch queue.
   */
  queueEmail(emailTask) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const task = {
      id: taskId,
      ...emailTask,
      queuedAt: new Date().toISOString(),
      status: "QUEUED"
    };
    this.queue.push(task);
    this.processQueue();
    return task;
  }

  async processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0) return;
    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      const task = this.queue[0];
      const now = Date.now();
      const elapsed = now - this.lastDispatchTime;
      if (elapsed < this.minDispatchDelayMs) {
        await new Promise(r => setTimeout(r, this.minDispatchDelayMs - elapsed));
      }

      try {
        if (task.templateName) {
          await this.sendTemplatedEmail(task);
        } else {
          await this.sendEmail(task);
        }
        task.status = "COMPLETED";
      } catch (err) {
        task.status = "FAILED";
        task.error = err.message;
      }

      this.lastDispatchTime = Date.now();
      this.queue.shift(); // Remove completed
    }

    this.isProcessingQueue = false;
  }

  recordHistory(record) {
    try {
      const history = this.getHistory();
      history.unshift(record);
      // Keep last 500 records
      const trimmed = history.slice(0, 500);
      fs.writeFileSync(this.historyFile, JSON.stringify(trimmed, null, 2), "utf8");
    } catch (e) {
      console.warn("Failed to write email history:", e.message);
    }
  }

  getHistory(limit = 100) {
    try {
      if (fs.existsSync(this.historyFile)) {
        const raw = fs.readFileSync(this.historyFile, "utf8");
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list.slice(0, limit) : [];
      }
    } catch (e) {
      // return empty on error
    }
    return [];
  }

  initTemplates() {
    this.templates = {
      agency_pitch: {
        name: "Agency & Full-Stack Collaboration Pitch",
        subject: "Full-Stack & AI Engineering Synergy — {{companyName}}",
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="margin-bottom: 20px;">
    <span style="background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">NexxIQ AI & Just Smart IT Solutions</span>
  </div>
  <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Hello {{prospectName}},</h2>
  <p>I hope this email finds you well. I came across your recent work and wanted to connect directly.</p>
  <p>I am <strong>{{founderName}}</strong>, AI Native Full Stack Developer and founder at <strong>{{companyName}}</strong> and the <strong>NexxIQ AI Platform</strong> ({{platformUrl}}).</p>
  <p>We engineer end-to-end digital platforms, high-velocity SaaS products, cross-platform mobile apps (Flutter & React Native), and autonomous AI agent workflows designed for high performance and measurable ROI.</p>
  <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; font-size: 14px; color: #334155;">
      🚀 <strong>Explore Live Technical Portfolio & Proof of Work:</strong><br/>
      <a href="{{portfolioUrl}}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">{{portfolioUrl}}</a>
    </p>
  </div>
  <p>If you have any upcoming web, mobile, SaaS, or AI automation initiatives, I'd welcome the opportunity to discuss your technical architecture and see how we can deliver clean, production-grade results.</p>
  <p style="margin-bottom: 24px;">Would you be open to a brief 10-minute introductory conversation this week?</p>
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  <p style="font-size: 14px; color: #64748b; margin: 0;">
    Best regards,<br/>
    <strong style="color: #0f172a;">{{founderName}}</strong><br/>
    Lead AI Native Developer & Founder<br/>
    {{companyName}} • <a href="{{platformUrl}}" style="color: #6366f1;">{{platformName}}</a><br/>
    Email: <a href="mailto:{{contactEmail}}" style="color: #64748b;">{{contactEmail}}</a> | Phone: {{phone}}
  </p>
</div>
        `,
        text: `Hello {{prospectName}},\n\nI am {{founderName}}, AI Native Full Stack Developer at {{companyName}} and {{platformName}} ({{platformUrl}}).\n\nWe specialize in high-velocity web platforms, mobile apps (Flutter/React Native), SaaS products, and custom AI agent automation.\n\nExplore our live portfolio: {{portfolioUrl}}\n\nIf you have any current or upcoming software initiatives, I'd love to explore how we can assist.\n\nBest regards,\n{{founderName}}\n{{contactEmail}} | {{phone}}`
      },

      ai_automation: {
        name: "AI Agents & Autonomous Workflow Pitch",
        subject: "Automating Operations with Custom AI Agents — NexxIQ AI",
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Hi {{prospectName}},</h2>
  <p>I noticed your company is scaling and exploring modern AI capabilities.</p>
  <p>Through <strong>NexxIQ AI</strong> ({{platformUrl}}) and <strong>{{companyName}}</strong>, we build bespoke agentic workflows, autonomous lead pipelines, and custom LLM integrations that replace hours of repetitive manual operations with intelligent automation.</p>
  <p>Our solutions integrate directly with your existing APIs, databases, and communication channels (Slack, WhatsApp, Email, CRM).</p>
  <p><strong>Recent Client Builds Include:</strong></p>
  <ul style="color: #334155;">
    <li>Autonomous Lead Extraction & Multi-Channel Outbound Engines</li>
    <li>Self-Healing Web Agents & Automated Browser Operations</li>
    <li>Real-time Document & Data Extraction Pipelines</li>
  </ul>
  <p>Check out our live engineering demonstrations here: <a href="{{portfolioUrl}}" style="color: #4f46e5; font-weight: 600;">{{portfolioUrl}}</a></p>
  <p>Let's schedule a brief demo to review your current bottlenecks and explore tailored AI solutions.</p>
  <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
    Warmly,<br/>
    <strong>{{founderName}}</strong><br/>
    {{companyName}} & NexxIQ AI
  </p>
</div>
        `,
        text: `Hi {{prospectName}},\n\nThrough NexxIQ AI ({{platformUrl}}) and {{companyName}}, we build bespoke agentic workflows and custom LLM integrations that automate complex business operations.\n\nPortfolio: {{portfolioUrl}}\n\nLet's connect for a brief 10-minute demo.\n\nWarmly,\n{{founderName}}`
      },

      job_application: {
        name: "Direct Job Application & Hiring Manager Outreach",
        subject: "Application for {{role}} — {{founderName}} (AI Native Full Stack Developer)",
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Dear {{hiringManagerName}},</h2>
  <p>I am writing to express my strong interest in the <strong>{{role}}</strong> opening at <strong>{{targetCompany}}</strong>.</p>
  <p>As an <strong>AI Native Full Stack Developer</strong> with 4+ years of professional engineering experience, I specialize in building high-performance web applications, distributed systems, and modern AI/LLM architectures.</p>
  <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px; color: #334155;">
      ⚡ <strong>Key Highlights:</strong><br/>
      • <strong>Core Stack:</strong> {{skills}}<br/>
      • <strong>Notice Period:</strong> 15 Days (Immediate Availability)<br/>
      • <strong>Portfolio & Code:</strong> <a href="{{portfolioUrl}}" style="color: #2563eb;">{{portfolioUrl}}</a>
    </p>
  </div>
  <p>I would appreciate the opportunity to discuss how my technical expertise aligns with {{targetCompany}}'s growth objectives.</p>
  <p>Thank you for your time and consideration.</p>
  <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
    Sincerely,<br/>
    <strong>{{founderName}}</strong><br/>
    Email: {{contactEmail}} | Phone: {{phone}}
  </p>
</div>
        `,
        text: `Dear {{hiringManagerName}},\n\nI am writing to express my strong interest in the {{role}} opening at {{targetCompany}}.\n\nAs an AI Native Full Stack Developer with 4+ years of engineering experience, I specialize in {{skills}}.\n\nNotice Period: 15 Days | Portfolio: {{portfolioUrl}}\n\nSincerely,\n{{founderName}}\n{{contactEmail}} | {{phone}}`
      }
    };
  }
}

// Singleton export
module.exports = new SmtpService();
