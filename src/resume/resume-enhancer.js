/**
 * src/resume/resume-enhancer.js
 * Production-ready AI Resume Enhancer & ATS Optimization Engine for Agentic Social & Client Finder.
 * Analyzes resumes against target job descriptions, computes ATS compatibility scores (0-100),
 * detects missing critical keywords, and generates enhanced resumes optimized for recruitment algorithms.
 */

class ResumeEnhancer {
  constructor() {
    this.techTaxonomy = [
      // Frontend
      "React", "React.js", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS",
      "Redux", "Vue.js", "Angular", "Webpack", "Vite", "GraphQL", "REST API",
      // Mobile
      "Flutter", "React Native", "Dart", "Swift", "Kotlin", "iOS", "Android",
      // Backend & Distributed Systems
      "Node.js", "Express.js", "Python", "FastAPI", "Django", "Flask", "Go", "Golang", "Java",
      "Microservices", "Serverless", "WebSockets", "Socket.io", "gRPC",
      // Databases & Cloud
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Supabase", "Firebase",
      "AWS", "Amazon Web Services", "GCP", "Google Cloud", "Azure", "Docker", "Kubernetes", "CI/CD", "Terraform",
      // AI / ML & Agentic
      "AI Native", "Generative AI", "LLM", "Large Language Models", "LangChain", "LlamaIndex",
      "OpenAI", "Anthropic", "Claude", "Gemini", "PyTorch", "TensorFlow", "Hugging Face", "RAG",
      "Vector Databases", "ChromaDB", "Pinecone", "Agentic Workflows", "Browser Automation", "Puppeteer", "Playwright",
      // Architecture & Methodologies
      "System Design", "Clean Architecture", "OOP", "TDD", "Agile", "Scrum", "CI/CD Pipelines", "Code Review"
    ];

    this.actionVerbs = [
      "Architected", "Engineered", "Developed", "Deployed", "Implemented", "Designed",
      "Scaled", "Optimized", "Spearheaded", "Automated", "Delivered", "Led", "Integrated",
      "Accelerated", "Orchestrated", "Transformed", "Maximized", "Streamlined"
    ];
  }

  /**
   * Main analysis function: scores resume and generates recommendations.
   */
  analyzeResume({ resumeText = "", jobDescription = "" }) {
    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error("Resume text must be at least 50 characters.");
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new Error("Job description must be at least 50 characters.");
    }

    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeKeywords = this.extractKeywords(resumeText);

    // Keyword matching & missing detection
    const matchedKeywords = [];
    const missingKeywords = [];

    jobKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${this.escapeRegex(kw)}\\b`, "i");
      if (regex.test(resumeText)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    // ATS Score Calculation
    const scoreBreakdown = this.calculateAtsScore({
      jobKeywords,
      matchedKeywords,
      resumeText,
      jobDescription
    });

    // Formatting & Section checks
    const formattingAudit = this.auditFormatting(resumeText);

    // Generate actionable recommendations
    const recommendations = this.generateRecommendations({
      scoreBreakdown,
      missingKeywords,
      formattingAudit
    });

    return {
      atsScore: scoreBreakdown.totalScore,
      scoreBreakdown,
      totalJobKeywords: jobKeywords.length,
      matchedCount: matchedKeywords.length,
      missingCount: missingKeywords.length,
      matchedKeywords,
      missingKeywords,
      formattingAudit,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Enhances the candidate's resume by incorporating missing ATS keywords,
   * rewriting bullet points with quantifiable metrics, and crafting an executive summary.
   */
  enhanceResume({ resumeText = "", jobDescription = "", candidateName = "Syed Akbar Hashmi", targetRole = "AI Native Full Stack Developer" }) {
    const analysis = this.analyzeResume({ resumeText, jobDescription });
    const { matchedKeywords, missingKeywords, scoreBreakdown } = analysis;

    // Build tailored ATS Summary
    const topKeywords = [...matchedKeywords.slice(0, 5), ...missingKeywords.slice(0, 4)];
    const professionalSummary = `Results-driven and adaptive ${targetRole} with 4+ years of hands-on experience engineering scalable software platforms, distributed cloud microservices, and AI-native automation pipelines. Proven track record in ${topKeywords.slice(0, 4).join(", ")}. Adept at translating complex product requirements into robust, high-performance production systems with measurable business impact.`;

    // Enhance bullet points
    const lines = resumeText.split("\n");
    const enhancedLines = [];
    let bulletIndex = 0;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      // Detect bullet points
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const clean = trimmed.replace(/^[•\-\*]\s*/, "");
        // Enhance with action verbs and missing keywords if applicable
        const keywordToInject = missingKeywords[bulletIndex % Math.max(1, missingKeywords.length)];
        const enhancedBullet = this.rewriteBulletPoint(clean, keywordToInject);
        enhancedLines.push(`• ${enhancedBullet}`);
        bulletIndex++;
      } else {
        enhancedLines.push(rawLine);
      }
    }

    const enhancedResume = `
================================================================================
${candidateName.toUpperCase()} — ${targetRole.toUpperCase()}
Portfolio: https://syed-akber-hashmi-v2.vercel.app/ | Email: syedakbarhashmi519@gmail.com | Phone: +91 6305700963
================================================================================

PROFESSIONAL SUMMARY
--------------------------------------------------------------------------------
${professionalSummary}

CORE ATS COMPETENCIES & KEYWORDS
--------------------------------------------------------------------------------
${[...new Set([...matchedKeywords, ...missingKeywords.slice(0, 8)])].join(" • ")}

PROFESSIONAL EXPERIENCE & ACHIEVEMENTS
--------------------------------------------------------------------------------
${enhancedLines.join("\n")}

EDUCATION & CERTIFICATIONS
--------------------------------------------------------------------------------
Bachelor of Technology in Computer Science & Engineering
Specialization: Artificial Intelligence, Cloud Computing & Distributed Systems
`.trim();

    // Projected new score after optimization
    const projectedScore = Math.min(98, scoreBreakdown.totalScore + Math.min(30, missingKeywords.length * 5) + 12);

    return {
      originalAtsScore: scoreBreakdown.totalScore,
      projectedAtsScore: projectedScore,
      professionalSummary,
      enhancedResume,
      injectedKeywords: missingKeywords.slice(0, 10),
      analysis
    };
  }

  rewriteBulletPoint(originalBullet, keywordToInject) {
    // If bullet already has good metrics, preserve context but strengthen verb
    let verb = this.actionVerbs[Math.floor(Math.random() * this.actionVerbs.length)];
    if (!/^[A-Z][a-z]+ed\b/.test(originalBullet)) {
      originalBullet = `${verb} ${originalBullet.charAt(0).toLowerCase()}${originalBullet.slice(1)}`;
    }

    // Inject keyword if not present
    if (keywordToInject && !originalBullet.toLowerCase().includes(keywordToInject.toLowerCase())) {
      return `${originalBullet}, integrating ${keywordToInject} to improve operational performance and latency by 35%`;
    }

    // Ensure quantifiable impact
    if (!/\d+%|\$\d+|\d+x|\d+ms/i.test(originalBullet)) {
      return `${originalBullet}, resulting in a 40% reduction in development cycles and enhanced system reliability`;
    }

    return originalBullet;
  }

  calculateAtsScore({ jobKeywords, matchedKeywords, resumeText, jobDescription }) {
    // 1. Keyword Match Ratio (0 - 55 points)
    const matchRatio = jobKeywords.length > 0 ? (matchedKeywords.length / jobKeywords.length) : 0.8;
    const keywordScore = Math.round(matchRatio * 55);

    // 2. Experience & Quantifiable Impact (0 - 20 points)
    let impactScore = 12;
    const metricMatches = (resumeText.match(/\d+%\b|\$\d+|\b\d+\s*(users|clients|projects|ms|seconds|hours)\b/gi) || []).length;
    impactScore += Math.min(8, metricMatches * 2);

    // 3. Action Verb Strength (0 - 15 points)
    let verbScore = 8;
    for (const v of this.actionVerbs) {
      if (new RegExp(`\\b${v}\\b`, "i").test(resumeText)) {
        verbScore += 2;
      }
    }
    verbScore = Math.min(15, verbScore);

    // 4. Formatting & Section Structure (0 - 10 points)
    let structureScore = 10;
    if (!/experience|work\s*history|developed|engineered|built/i.test(resumeText)) structureScore -= 3;
    if (!/education|academic|degree|university/i.test(resumeText) && resumeText.length > 300) structureScore -= 2;

    const totalScore = Math.min(100, Math.max(30, keywordScore + impactScore + verbScore + structureScore));

    return {
      totalScore,
      keywordScore,
      impactScore,
      verbScore,
      structureScore
    };
  }

  auditFormatting(resumeText) {
    const hasSummary = /summary|profile|about\s*me/i.test(resumeText);
    const hasExperience = /experience|work\s*history|employment/i.test(resumeText);
    const hasSkills = /skills|technical\s*proficiencies|technologies/i.test(resumeText);
    const hasEducation = /education|degree|university/i.test(resumeText);
    const hasContact = /@|\.com|\+?\d{10}/i.test(resumeText);

    return {
      hasSummary,
      hasExperience,
      hasSkills,
      hasEducation,
      hasContact,
      isAtsCompliant: hasExperience && hasSkills && hasEducation && hasContact
    };
  }

  generateRecommendations({ scoreBreakdown, missingKeywords, formattingAudit }) {
    const recs = [];

    if (missingKeywords.length > 0) {
      recs.push({
        type: "CRITICAL_KEYWORDS",
        priority: "HIGH",
        title: "Integrate Essential Missing Keywords",
        description: `Your resume is missing ${missingKeywords.length} key terms from the job description: ${missingKeywords.slice(0, 6).join(", ")}. Adding these into your experience bullets directly increases ATS pass-rates.`
      });
    }

    if (scoreBreakdown.impactScore < 20) {
      recs.push({
        type: "QUANTIFIABLE_METRICS",
        priority: "HIGH",
        title: "Quantify Technical Accomplishments",
        description: "ATS algorithms favor candidates who demonstrate business impact. Use metrics such as '% performance improvement', 'latency reduction from X to Y', or 'serving N daily active users'."
      });
    }

    if (!formattingAudit.hasSummary) {
      recs.push({
        type: "STRUCTURE",
        priority: "MEDIUM",
        title: "Add a Target Professional Summary",
        description: "Include a 3-4 line summary at the top aligning your career highlights with the target job title."
      });
    }

    if (scoreBreakdown.verbScore < 12) {
      recs.push({
        type: "ACTION_VERBS",
        priority: "MEDIUM",
        title: "Strengthen Opening Verbs",
        description: "Begin each accomplishment bullet with strong past-tense engineering verbs (e.g., 'Architected', 'Spearheaded', 'Optimized', 'Automated')."
      });
    }

    return recs;
  }

  extractKeywords(text) {
    const cleanText = text.replace(/[^a-zA-Z0-9\s\.\+#]/g, " ");
    const foundKeywords = new Set();

    // 1. Match against known tech taxonomy
    for (const term of this.techTaxonomy) {
      const regex = new RegExp(`(^|\\s)${this.escapeRegex(term)}([\\s,\\.]|$)`, "i");
      if (regex.test(text)) {
        foundKeywords.add(term);
      }
    }

    // 2. Extract capitalized 2-3 word technical phrases
    const phrases = text.match(/\b[A-Z][a-zA-Z0-9\+#]+(\s+[A-Z][a-zA-Z0-9\+#]+){1,2}\b/g) || [];
    for (const p of phrases) {
      if (p.length > 4 && !/^(The|This|Our|We|You|Please|Apply|Job|Full\s+Time|Years\s+Of)$/i.test(p)) {
        foundKeywords.add(p);
      }
    }

    return Array.from(foundKeywords);
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

module.exports = new ResumeEnhancer();
