const fs = require("fs");
const path = require("path");
const CONFIG = require("../../../config");
const JobAgentRunner = require("../browser/job-runner");
const { readBaseResume } = require("../documents/document-engine");

function loadCandidateProfile() {
  if (!fs.existsSync(CONFIG.JOB_PROFILE_PATH)) return null;
  return JSON.parse(fs.readFileSync(CONFIG.JOB_PROFILE_PATH, "utf8"));
}

function createCandidateProfile(data = {}) {
  const preferences = data.preferences || {};
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    googleAccountEmail: String(data.googleAccountEmail || "").trim(),
    baseResumePath: String(data.baseResumePath || "").trim(),
    preferences: {
      remoteOnly: preferences.remoteOnly !== false,
      projectOnly: preferences.projectOnly !== false,
      minMatchScore: Number.isFinite(Number(preferences.minMatchScore))
        ? Number(preferences.minMatchScore)
        : 75,
      aiPortfolioSync: preferences.aiPortfolioSync !== false
    },
    portfolioUrl: data.portfolioUrl || "https://syed-akber-hashmi-v2.vercel.app/",
    portfolioItemsCount: Number(data.portfolioItemsCount || 0),
    name: data.name || "Syed Akbar Hashmi",
    title: data.title || "AI Native Full Stack Developer & Founder",
    company: data.company || "Agentic Social AI",
    email: data.email || data.googleAccountEmail || "syedakbarhashmi519@gmail.com",
    phone: data.phone || "",
    location: data.location || "Remote",
    website: data.website || "https://syed-akber-hashmi-v2.vercel.app/",
    linkedin: data.linkedin || "https://syed-akber-hashmi-v2.vercel.app/",
    skills: Array.isArray(data.skills) ? data.skills : [
      "Web Development",
      "Full Stack Development",
      "Mobile Application Development",
      "AI Systems & Automation",
      "JavaScript",
      "TypeScript",
      "Node.js",
      "React",
      "Next.js",
      "Python",
      "FastAPI",
      "PHP",
      "CodeIgniter",
      "Flutter",
      "Android",
      "Docker",
      "Redis",
      "AWS",
      "WebSockets"
    ]
  };
}

function saveCandidateProfile(profile) {
  fs.mkdirSync(path.dirname(CONFIG.JOB_PROFILE_PATH), { recursive: true });
  fs.writeFileSync(CONFIG.JOB_PROFILE_PATH, JSON.stringify(profile, null, 2), "utf8");
}

async function inspectAndCompleteProfile({ platform, page, browserAgent, aiRuntime, candidateProfile }) {
  const runner = new JobAgentRunner({ aiRuntime, browserAgent });
  const resume = await readBaseResume().catch(() => ({ text: "" }));
  const enrichedProfile = {
    ...candidateProfile,
    baseResumeText: resume.text || ""
  };
  return runner.run({
    goal: "Open the platform profile/account settings and complete every field that can be populated from verified candidate data, approved knowledge, or explicit facts in the base resume. Re-inspect the page after each action batch. Never guess. Stop with USER_ACTION_REQUIRED for required data not present in the candidate source.",
    platform,
    candidateProfile: enrichedProfile,
    allowedOrigin: new URL(platform.url).origin,
    targetId: `profile:${platform.id}`,
    context: { workflow: "PROFILE_COMPLETION", resumeAttached: Boolean(resume.present) }
  });
}

module.exports = { createCandidateProfile, loadCandidateProfile, saveCandidateProfile, inspectAndCompleteProfile };
