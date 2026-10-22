#!/usr/bin/env node
/**
 * scripts/show-deals.js
 * Instant Lead & Deal Inspector for Meta Automation
 */

const fs = require("fs");
const path = require("path");

const stateFile = path.resolve(__dirname, "../threads-engagement-state.json");
if (!fs.existsSync(stateFile)) {
  console.log("No engagement state file found at:", stateFile);
  process.exit(0);
}

const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
const posts = Object.values(state.posts || {});

const deals = posts.filter(p => 
  p.status === "QUALIFIED" || 
  p.status === "COMMENT_PENDING" || 
  p.status === "COMMENTED_SIMULATED" ||
  p.intent === "BUYER" || 
  p.intent === "PROJECT_BUYER" ||
  p.is_genuine_buyer === true ||
  (p.matchedServices && p.matchedServices.length > 0)
);

console.log("\n================================================================================");
console.log("            🎯 LIVE CLIENT DEALS & LEADS DISCOVERY REPORT");
console.log("================================================================================");
console.log(`Total Posts Scanned : ${state.stats?.total_scanned || posts.length}`);
console.log(`Total Deals Qualified : ${deals.length}`);
console.log("================================================================================\n");

if (deals.length === 0) {
  console.log("No qualified deals in state yet. Run 'npm run start:linkedin' to discover new leads.");
  process.exit(0);
}

deals.forEach((d, idx) => {
  const platform = (d.platform || "unknown").toUpperCase();
  const author = d.username || "unknown";
  const url = d.url || "N/A";
  const intent = d.intent || "BUYER";
  const categories = (d.matchedCategories || []).join(", ") || "Custom Development";
  const budgetMatch = (d.text || "").match(/\$\s*(\d+[,\d]*)/i);
  const budget = budgetMatch ? budgetMatch[0] : "Not specified (Inquiry)";

  console.log(`┌── [DEAL #${idx + 1}] [${platform}] @${author} ─────────────────────────────`);
  console.log(`│ Category : ${categories}`);
  console.log(`│ Budget   : ${budget}`);
  console.log(`│ Post URL : ${url}`);
  console.log(`├───────────────────────────────────────────────────────────────────────────────`);
  console.log(`│ Client Post:`);
  const lines = (d.text || "").trim().split("\n").slice(0, 5);
  lines.forEach(l => console.log(`│   ${l}`));
  console.log(`├───────────────────────────────────────────────────────────────────────────────`);
  console.log(`│ Pre-Synthesized Pitch:`);
  console.log(`│   ${(d.commentText || d.comment || "N/A").trim()}`);
  console.log(`└───────────────────────────────────────────────────────────────────────────────\n`);
});

console.log("================================================================================");
console.log("👉 To approve & publish pitches live: npm run approve");
console.log("👉 To scan for more deals: npm run start:linkedin");
console.log("================================================================================\n");
