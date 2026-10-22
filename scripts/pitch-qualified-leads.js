#!/usr/bin/env node
/**
 * scripts/pitch-qualified-leads.js
 * Autonomous Live Pitch Execution Engine for Qualified LinkedIn Leads
 */

const fs = require("fs");
const path = require("path");
const { launchBrowser, isCdpActive } = require("./launch-browser-cdp");
const linkedInActions = require("../src/platforms/linkedin/linkedin-actions");
const linkedInPoster = require("../src/platforms/linkedin/linkedin-poster");
const stateStore = require("../src/storage/state-store");
const rateLimiter = require("../src/safety/rate-limiter");
const logger = require("../src/logging/logger");

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runPitching() {
  console.log("\n================================================================================");
  console.log("            🚀 AUTONOMOUS LINKEDIN PITCH & DEAL CONVERSION RUNNER");
  console.log("================================================================================");

  // 1. Ensure Chrome CDP is active on port 9222
  let cdpReady = await isCdpActive(9222);
  if (!cdpReady) {
    console.log("🌐 CDP port 9222 not yet responding. Launching Google Chrome with CDP debugging...");
    const launched = await launchBrowser();
    if (!launched) {
      console.error("❌ Failed to launch browser with CDP. Exiting.");
      process.exit(1);
    }
    await sleep(3000);
  } else {
    console.log("🟢 Chrome CDP is active and verified on http://127.0.0.1:9222");
  }

  // 2. Load state
  stateStore.loadState();
  const allPosts = Object.values(stateStore.state.posts || {});

  // High priority buyer leads discovered
  const targets = [
    {
      postId: "li_ck_273110813",
      username: "rohit-yadav-4a88ba440",
      category: "Web Development, Mobile Apps & SaaS Products",
      pitch: "Hi Rohit, Great initiative! We specialize in end-to-end full-stack web platforms, mobile applications (React Native & Flutter), and scalable SaaS MVPs (https://syed-akber-hashmi-v2.vercel.app/). Always keen to partner with talented developers and agencies on client builds and technical architecture. Let's definitely connect and explore collaboration!"
    },
    {
      postId: "li_ck_2009226648",
      username: "muhammad-haris-125941394",
      category: "Remote Web Development & Client Outreach",
      pitch: "Hi Muhammad, Love the proactive outreach! We build high-converting web applications, bespoke landing pages, and scalable web solutions (https://syed-akber-hashmi-v2.vercel.app/). Happy to stay connected and exchange notes on upcoming client web projects and agency collaborations!"
    },
    {
      postId: "expandedhftrRQvRuPcpSy5YKTIngxJB8mg6KtRBVXWucWf-rr8FeedType_",
      username: "hitesh-prajapat-29bb7a419",
      category: "Mobile App Development & Flutter Architecture",
      pitch: "Hi Hitesh, Building slick, low-latency mobile interfaces with Flutter is a fantastic direction—especially for IoT flows like EV charging where real-time socket updates and state management matter. At Agentic Social AI (https://syed-akber-hashmi-v2.vercel.app/), we focus on high-performance mobile and web solutions. Would be glad to connect and chat Flutter architecture!"
    }
  ];

  console.log(`Found ${targets.length} priority buyer leads to pitch.\n`);

  let pitchedCount = 0;

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`[PITCH ${i + 1}/${targets.length}] TARGET: @${target.username}`);
    console.log(`Category : ${target.category}`);
    console.log(`Post ID  : ${target.postId}`);
    console.log(`Pitch Text:\n"${target.pitch}"`);
    console.log(`--------------------------------------------------------------------------------`);

    // Fetch or construct post object
    let post = stateStore.state.posts[target.postId] || stateStore.state.posts[`linkedin:${target.postId}`] || {
      postId: target.postId,
      platform: "linkedin",
      username: target.username,
      url: `https://www.linkedin.com/in/${target.username}/recent-activity/all/`
    };

    post.platform = "linkedin";
    post.username = target.username;

    // Check if already commented
    if (stateStore.hasCommented(post.postId, "linkedin")) {
      console.log(`ℹ️ Post ${post.postId} already pitched. Skipping.`);
      continue;
    }

    try {
      console.log(`🚀 Executing live comment pitch via CDP...`);
      const result = await linkedInActions.postComment(post, target.pitch, {
        dryRun: false,
        approvalMode: false,
        postingEnabled: true
      });

      console.log(`Result:`, result);

      if (result && (result.success || result.verified)) {
        pitchedCount++;
        stateStore.updatePostStatus(post.postId, "COMMENTED", {
          commentText: target.pitch,
          verifiedAt: new Date().toISOString(),
          platform: "linkedin"
        }, "linkedin");
        stateStore.saveState();
        console.log(`✅ Successfully published pitch to @${target.username}!`);
      } else {
        console.warn(`⚠️ Pitch execution returned:`, result);
      }
    } catch (err) {
      console.error(`❌ Error pitching @${target.username}:`, err.message);
    }

    // Stealth delay between pitches (15 seconds)
    if (i < targets.length - 1) {
      console.log(`⏳ Waiting 15s stealth delay before next lead to protect LinkedIn account...`);
      await sleep(15000);
    }
  }

  console.log(`\n================================================================================`);
  console.log(`            📢 PUBLISHING DAILY LINKEDIN THOUGHT-LEADERSHIP POST`);
  console.log(`================================================================================`);

  try {
    const postContent = {
      pillar: "saas_platforms",
      text: `Most SaaS startups don't fail because of weak tech stacks. They fail because they over-engineer infrastructure before validating their core workflow.\n\n3 principles we apply when engineering SaaS platforms:\n1. Keep data models clean and normalized before premature sharding.\n2. Build a robust authentication & billing lifecycle first—don't treat payments as an afterthought.\n3. Ship a functional MVP in weeks, not quarters, to get live customer feedback immediately.\n\nWhat is your biggest priority when architecting a new web platform or SaaS?\n\n#SaaS #SoftwareEngineering #CloudArchitecture #TechFounders #WebDevelopment`
    };

    console.log(`Drafting daily B2B post on LinkedIn feed...`);
    const pubRes = await linkedInPoster.publishPost({
      dryRun: false,
      postingEnabled: true,
      text: postContent.text
    });

    console.log(`Daily Post Result:`, pubRes);
    if (pubRes && (pubRes.success || pubRes.verified)) {
      console.log(`✅ Daily thought-leadership post successfully published on LinkedIn feed!`);
    }
  } catch (err) {
    console.error(`❌ Error publishing daily post:`, err.message);
  }

  console.log(`\n================================================================================`);
  console.log(`            🏁 PITCHING & DAILY POSTING CYCLE COMPLETE`);
  console.log(`Total Leads Pitched: ${pitchedCount}`);
  console.log(`================================================================================\n`);
  process.exit(0);
}

runPitching().catch(err => {
  console.error("Fatal runner error:", err);
  process.exit(1);
});
