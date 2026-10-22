const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CANDIDATE = {
  fullName: "Syed Akbar Hashmi",
  firstName: "Syed Akbar",
  lastName: "Hashmi",
  email: "syedakbarhashmi519@gmail.com",
  phone: "6305700963",
  location: "Hyderabad, Telangana, India",
  city: "Hyderabad",
  company: "Just Smart IT Solutions",
  title: "AI Native Full Stack Developer",
  noticePeriodDays: "15",
  currentCTC: "1200000",
  expectedCTC: "1800000",
  yearsExperience: "4",
  monthsExperience: "6",
  portfolio: "https://syed-akber-hashmi-v2.vercel.app/",
  linkedin: "https://www.linkedin.com/in/syed-akbar-hashmi",
  github: "https://github.com/syed-akber-hashmi"
};

const APPLIED_FILE = path.join(__dirname, "../linkedin-jobs-applied.json");
const HARVESTED_FILE = path.join(__dirname, "../harvested-jobs.json");
const TARGET_APPLICATIONS = 50;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jitter(min = 1200, max = 2800) {
  return sleep(Math.floor(Math.random() * (max - min + 1)) + min);
}

function loadAppliedJobs() {
  if (fs.existsSync(APPLIED_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(APPLIED_FILE, "utf8"));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveAppliedJob(job) {
  const current = loadAppliedJobs();
  const existingIdx = current.findIndex(j => j.jobId === job.jobId);
  if (existingIdx >= 0) {
    current[existingIdx] = job;
  } else {
    current.push(job);
  }
  fs.writeFileSync(APPLIED_FILE, JSON.stringify(current, null, 2), "utf8");
}

async function extractJobMeta(page, fallbackJob) {
  return await page.evaluate((fallback) => {
    let title = fallback.title || "";
    let company = fallback.company || "";

    const h1 = document.querySelector("h1, .job-details-jobs-unified-top-card__job-title");
    if (h1 && h1.innerText.trim()) {
      title = h1.innerText.trim();
    } else if (!title && document.title) {
      const parts = document.title.split("|");
      if (parts[0]) title = parts[0].trim();
    }

    const compEl = document.querySelector(".job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, a[href*='/company/']");
    if (compEl && compEl.innerText.trim()) {
      company = compEl.innerText.trim();
    } else if (!company && document.title) {
      const parts = document.title.split("|");
      if (parts[1]) company = parts[1].trim();
    }

    return { title, company };
  }, fallbackJob);
}

async function fillFormStep(page) {
  return await page.evaluate((cand) => {
    const dialog = document.querySelector("dialog");
    if (!dialog) return { hasDialog: false };

    function setNativeValue(element, value) {
      const valueSetter = Object.getOwnPropertyDescriptor(element, 'value') ? Object.getOwnPropertyDescriptor(element, 'value').set : null;
      const prototype = Object.getPrototypeOf(element);
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value') ? Object.getOwnPropertyDescriptor(prototype, 'value').set : null;
      
      if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
      } else if (valueSetter) {
        valueSetter.call(element, value);
      } else {
        element.value = value;
      }
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    let fieldsModified = 0;
    const stepText = (dialog.innerText || "").slice(0, 300).replace(/\n+/g, " ");

    // 1. Text / Number Inputs & Textareas
    const textInputs = Array.from(dialog.querySelectorAll("input[type='text'], input[type='number'], input[type='tel'], input:not([type]), textarea"));
    for (const el of textInputs) {
      if (el.value && el.value.trim().length > 0) continue; // Already filled

      let cur = el.parentElement;
      let labelText = "";
      while (cur && cur !== dialog) {
        const t = (cur.innerText || "").replace(/\n+/g, " ").trim();
        if (t && !t.startsWith("0/") && t.length > 3) {
          labelText = t.toLowerCase();
          break;
        }
        cur = cur.parentElement;
      }

      if (labelText.includes("notice period")) {
        setNativeValue(el, cand.noticePeriodDays);
        fieldsModified++;
      } else if (labelText.includes("current ctc") || labelText.includes("current compensation") || labelText.includes("current salary")) {
        setNativeValue(el, cand.currentCTC);
        fieldsModified++;
      } else if (labelText.includes("expected ctc") || labelText.includes("expected compensation") || labelText.includes("expected salary")) {
        setNativeValue(el, cand.expectedCTC);
        fieldsModified++;
      } else if (labelText.includes("linkedin")) {
        setNativeValue(el, cand.linkedin);
        fieldsModified++;
      } else if (labelText.includes("portfolio") || labelText.includes("website")) {
        setNativeValue(el, cand.portfolio);
        fieldsModified++;
      } else if (labelText.includes("github") || labelText.includes("git")) {
        setNativeValue(el, cand.github);
        fieldsModified++;
      } else if (labelText.includes("city") || labelText.includes("location")) {
        setNativeValue(el, cand.city);
        fieldsModified++;
      } else if (labelText.includes("experience") || labelText.includes("years") || labelText.includes("how many")) {
        setNativeValue(el, cand.yearsExperience);
        fieldsModified++;
      } else if (el.type === "number") {
        setNativeValue(el, cand.yearsExperience);
        fieldsModified++;
      } else {
        setNativeValue(el, "Yes");
        fieldsModified++;
      }
    }

    // 2. Select Dropdowns
    const selects = Array.from(dialog.querySelectorAll("select"));
    for (const sel of selects) {
      if (sel.value && sel.value !== "" && sel.value !== "Select an option") continue;

      let cur = sel.parentElement;
      let labelText = "";
      while (cur && cur !== dialog) {
        const t = (cur.innerText || "").replace(/\n+/g, " ").trim();
        if (t && t.length > 5) {
          labelText = t.toLowerCase();
          break;
        }
        cur = cur.parentElement;
      }

      const options = Array.from(sel.options);
      let chosenOpt = null;

      if (labelText.includes("year") || labelText.includes("experience")) {
        chosenOpt = options.find(o => o.value === cand.yearsExperience || o.text.includes(cand.yearsExperience));
      } else if (labelText.includes("month")) {
        chosenOpt = options.find(o => o.value === cand.monthsExperience || o.text.includes(cand.monthsExperience));
      } else if (labelText.includes("sponsorship") || labelText.includes("visa")) {
        chosenOpt = options.find(o => o.text.toLowerCase().trim() === "no" || o.value.toLowerCase().trim() === "no");
      } else {
        chosenOpt = options.find(o => o.text.toLowerCase().trim() === "yes" || o.value.toLowerCase().trim() === "yes");
      }

      if (!chosenOpt && options.length > 1) {
        chosenOpt = options.find(o => o.value !== "" && !o.text.toLowerCase().includes("select"));
      }

      if (chosenOpt) {
        sel.value = chosenOpt.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsModified++;
      }
    }

    // 3. Radio Buttons
    const radioContainers = Array.from(dialog.querySelectorAll("fieldset, div[role='radiogroup'], div[data-test-form-element]"));
    for (const container of radioContainers) {
      const radios = Array.from(container.querySelectorAll("input[type='radio']"));
      if (radios.length === 0) continue;
      if (radios.some(r => r.checked)) continue;

      const cText = (container.innerText || "").toLowerCase();
      let targetRadio = null;

      if (cText.includes("sponsorship") || cText.includes("require visa") || cText.includes("disciplinary")) {
        targetRadio = radios.find(r => {
          const l = r.parentElement ? (r.parentElement.innerText || "").toLowerCase() : "";
          return l.includes("no");
        });
      } else {
        targetRadio = radios.find(r => {
          const l = r.parentElement ? (r.parentElement.innerText || "").toLowerCase() : "";
          return l.includes("yes");
        });
      }

      if (!targetRadio && radios.length > 0) {
        targetRadio = radios[0];
      }

      if (targetRadio) {
        targetRadio.click();
        targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsModified++;
      }
    }

    // 4. Checkboxes (agreements, acknowledgements)
    const checkboxes = Array.from(dialog.querySelectorAll("input[type='checkbox']"));
    for (const cb of checkboxes) {
      const parentText = cb.parentElement ? (cb.parentElement.innerText || "").toLowerCase() : "";
      if (parentText.includes("follow") && parentText.includes("company")) {
        continue;
      }
      if (!cb.checked) {
        cb.click();
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsModified++;
      }
    }

    // 5. Buttons detection
    const buttons = Array.from(dialog.querySelectorAll("button"));
    const submitBtn = buttons.find(b => (b.innerText || "").trim().toLowerCase().includes("submit application"));
    const reviewBtn = buttons.find(b => (b.innerText || "").trim().toLowerCase() === "review");
    const nextBtn = buttons.find(b => (b.innerText || "").trim().toLowerCase() === "next");

    return {
      hasDialog: true,
      fieldsModified,
      stepText,
      hasSubmit: !!submitBtn,
      hasReview: !!reviewBtn,
      hasNext: !!nextBtn
    };
  }, CANDIDATE);
}

async function clickDialogAction(page, actionName) {
  return await page.evaluate((action) => {
    const dialog = document.querySelector("dialog");
    if (!dialog) return false;
    const buttons = Array.from(dialog.querySelectorAll("button"));
    let target = null;
    if (action === "submit") {
      target = buttons.find(b => (b.innerText || "").trim().toLowerCase().includes("submit application"));
    } else if (action === "review") {
      target = buttons.find(b => (b.innerText || "").trim().toLowerCase() === "review");
    } else if (action === "next") {
      target = buttons.find(b => (b.innerText || "").trim().toLowerCase() === "next");
    } else if (action === "dismiss") {
      target = buttons.find(b => {
        const aria = (b.getAttribute("aria-label") || "").toLowerCase();
        const text = (b.innerText || "").toLowerCase();
        return aria.includes("dismiss") || text.includes("dismiss") || aria.includes("cancel") || text.includes("cancel");
      });
    }
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, actionName);
}

async function discardApplication(page) {
  try {
    await clickDialogAction(page, "dismiss");
    await sleep(1000);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const discardBtn = btns.find(b => (b.innerText || "").trim().toLowerCase().includes("discard"));
      if (discardBtn) discardBtn.click();
    });
    await sleep(1000);
  } catch (e) {}
}

async function applyToJob(page, job) {
  console.log(`\n==================================================`);
  console.log(`Job ID: ${job.jobId} | Initial: "${job.title}" @ "${job.company}"`);

  await page.goto(`https://www.linkedin.com/jobs/view/${job.jobId}/`, { waitUntil: "domcontentloaded", timeout: 35000 });
  await jitter(2000, 3000);

  // Enrich title & company from page
  const meta = await extractJobMeta(page, job);
  job.title = meta.title || job.title || "AI Developer";
  job.company = meta.company || job.company || "Direct Employer";
  console.log(`Verified Role: "${job.title}" @ "${job.company}"`);

  // Check if already applied
  const isAlreadyApplied = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes("Application submitted") || text.includes("Applied ") || text.includes("You applied on");
  });

  if (isAlreadyApplied) {
    console.log(`[ALREADY APPLIED] Job ${job.jobId} already submitted.`);
    saveAppliedJob({
      jobId: job.jobId,
      title: job.title,
      company: job.company,
      appliedAt: new Date().toISOString(),
      url: `https://www.linkedin.com/jobs/view/${job.jobId}/`,
      status: "ALREADY_APPLIED"
    });
    return true;
  }

  // Look for Easy Apply button
  const hasEasyApply = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const applyBtn = btns.find(b => {
      const t = (b.innerText || "").trim().toLowerCase();
      const a = (b.getAttribute("aria-label") || "").toLowerCase();
      return t === "easy apply" || a.includes("easy apply to this job");
    });
    if (applyBtn) {
      applyBtn.click();
      return true;
    }
    return false;
  });

  if (!hasEasyApply) {
    console.log(`[NO EASY APPLY] Job ${job.jobId} only offers external apply. Skipping.`);
    return false;
  }

  await jitter(2000, 3000);

  let lastStepSummary = "";
  let stuckCount = 0;

  for (let step = 1; step <= 8; step++) {
    const dialogState = await fillFormStep(page);
    if (!dialogState.hasDialog) {
      console.log(`Step ${step}: Dialog closed. Verifying completion...`);
      break;
    }

    const currentStepSummary = `${dialogState.stepText.slice(0, 40)} | ${dialogState.fieldsModified}`;
    if (currentStepSummary === lastStepSummary) {
      stuckCount++;
      if (stuckCount >= 2) {
        console.log(`[FAST FAIL] Step stuck on validation / unfillable field after 2 attempts. Discarding.`);
        await discardApplication(page);
        return false;
      }
    } else {
      stuckCount = 0;
    }
    lastStepSummary = currentStepSummary;

    console.log(`Step ${step}: Mod: ${dialogState.fieldsModified} | Next: ${dialogState.hasNext} | Rev: ${dialogState.hasReview} | Sub: ${dialogState.hasSubmit}`);
    await jitter(1000, 1800);

    if (dialogState.hasSubmit) {
      console.log(`Submitting application...`);
      await clickDialogAction(page, "submit");
      await jitter(3000, 4500);

      // Dismiss confirmation if present
      await page.evaluate(() => {
        const dialog = document.querySelector("dialog");
        if (dialog) {
          const btn = Array.from(dialog.querySelectorAll("button")).find(b => {
            const t = (b.innerText || b.getAttribute("aria-label") || "").toLowerCase();
            return t.includes("done") || t.includes("dismiss") || t.includes("close");
          });
          if (btn) btn.click();
        }
      });

      saveAppliedJob({
        jobId: job.jobId,
        title: job.title,
        company: job.company,
        appliedAt: new Date().toISOString(),
        url: `https://www.linkedin.com/jobs/view/${job.jobId}/`,
        status: "SUCCESS"
      });

      console.log(`>>> [SUCCESS] Applied: "${job.title}" @ "${job.company}"`);
      return true;
    } else if (dialogState.hasReview) {
      await clickDialogAction(page, "review");
      await jitter(1800, 2600);
    } else if (dialogState.hasNext) {
      await clickDialogAction(page, "next");
      await jitter(1800, 2600);
    } else {
      console.log(`Neither Next/Review/Submit available. Discarding.`);
      await discardApplication(page);
      return false;
    }
  }

  // Final check
  const finalCheck = await page.evaluate(() => {
    return document.body.innerText.includes("Application submitted") || document.body.innerText.includes("Applied ");
  });

  if (finalCheck) {
    saveAppliedJob({
      jobId: job.jobId,
      title: job.title,
      company: job.company,
      appliedAt: new Date().toISOString(),
      url: `https://www.linkedin.com/jobs/view/${job.jobId}/`,
      status: "SUCCESS"
    });
    return true;
  }

  return false;
}

async function harvestMoreJobs(page, appliedSet) {
  const MORE_QUERIES = [
    "AI Engineer Remote",
    "Generative AI Engineer Remote",
    "LLM Engineer Remote",
    "Full Stack AI Developer Remote",
    "AI Software Engineer Remote"
  ];

  console.log(`\nHarvesting additional jobs to replenish queue...`);
  const newJobs = [];

  for (const q of MORE_QUERIES) {
    for (let p = 0; p < 2; p++) {
      const start = p * 25;
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&f_WT=2&f_TPR=r2592000&f_AL=true&sortBy=R&start=${start}`;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await sleep(3000);
        await page.evaluate(() => window.scrollBy(0, 1000));
        await sleep(1500);

        const items = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("[data-occludable-job-id]")).map(c => {
            const jobId = c.getAttribute("data-occludable-job-id");
            const link = c.querySelector("a[href*='/jobs/view/']");
            return {
              jobId,
              title: link ? link.innerText.trim().replace(/\n+/g, " ") : "",
              company: ""
            };
          }).filter(c => c.jobId && c.jobId.length > 5);
        });

        for (const item of items) {
          if (!appliedSet.has(item.jobId) && !newJobs.some(x => x.jobId === item.jobId)) {
            newJobs.push(item);
          }
        }
      } catch (e) {}
    }
    if (newJobs.length >= 60) break;
  }

  return newJobs;
}

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com")) || pages[0];

    // Load state
    let harvested = [];
    if (fs.existsSync(HARVESTED_FILE)) {
      harvested = JSON.parse(fs.readFileSync(HARVESTED_FILE, "utf8"));
    }

    const applied = loadAppliedJobs();
    const appliedSet = new Set(applied.map(j => j.jobId));

    console.log(`Initial Applied Count: ${applied.length} / ${TARGET_APPLICATIONS}`);
    let appliedCount = applied.length;

    let queue = harvested.filter(h => !appliedSet.has(h.jobId));
    console.log(`Initial Queue Length: ${queue.length}`);

    while (appliedCount < TARGET_APPLICATIONS) {
      if (queue.length === 0) {
        console.log(`Queue empty! Harvesting additional remote AI jobs...`);
        const freshJobs = await harvestMoreJobs(page, appliedSet);
        if (freshJobs.length === 0) {
          console.log(`No more jobs found. Stopping.`);
          break;
        }
        queue.push(...freshJobs);
        console.log(`Added ${freshJobs.length} fresh jobs to queue.`);
      }

      const job = queue.shift();
      if (appliedSet.has(job.jobId)) continue;

      try {
        const success = await applyToJob(page, job);
        if (success) {
          appliedCount++;
          appliedSet.add(job.jobId);
          console.log(`\n🎯 TARGET PROGRESS: [${appliedCount}/${TARGET_APPLICATIONS}] applications completed!`);
        }
      } catch (err) {
        console.error(`Error on job ${job.jobId}:`, err.message);
        await discardApplication(page);
      }

      if (appliedCount >= TARGET_APPLICATIONS) break;

      const restTime = Math.floor(Math.random() * 4000) + 5000;
      console.log(`Resting ${Math.round(restTime / 1000)}s...`);
      await sleep(restTime);
    }

    console.log(`\n==================================================`);
    console.log(`🎉 50 HIGH-RESPONSE AI JOBS APPLIED SUCCESSFULLY!`);
    console.log(`Total applied: ${appliedCount}`);
    console.log(`Persistent log: ${APPLIED_FILE}`);
    process.exit(0);
  } catch (err) {
    console.error("Fatal Error:", err);
    process.exit(1);
  }
})();
