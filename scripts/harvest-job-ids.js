const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const SEARCH_QUERIES = [
  "AI Native Developer OR Gen AI OR AI ML",
  "Agentic AI OR LLM Engineer OR AI Engineer",
  "Generative AI Developer OR AI Full Stack Developer",
  "AI Python Developer OR Machine Learning Engineer"
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes("linkedin.com")) || pages[0];

    const allJobIds = new Set();
    const jobList = [];

    // Load existing applied if exists
    const appliedFile = path.join(__dirname, "../linkedin-jobs-applied.json");
    let appliedData = [];
    if (fs.existsSync(appliedFile)) {
      try {
        appliedData = JSON.parse(fs.readFileSync(appliedFile, "utf8"));
      } catch (e) {}
    }
    const appliedSet = new Set(appliedData.map(j => j.jobId));

    console.log(`Already applied to ${appliedSet.size} jobs previously.`);

    for (const query of SEARCH_QUERIES) {
      console.log(`\n--- Searching: "${query}" ---`);
      for (let pageNum = 0; pageNum < 4; pageNum++) {
        const start = pageNum * 25;
        const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&f_WT=2&f_TPR=r2592000&f_AL=true&sortBy=R&start=${start}`;
        console.log(`Loading page ${pageNum + 1} (${searchUrl})...`);
        
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
        await sleep(3500);

        // Scroll the job list to trigger lazy loading
        await page.evaluate(async () => {
          const list = document.querySelector(".jobs-search-results-list, .scaffold-layout__list");
          if (list) {
            for (let i = 0; i < 6; i++) {
              list.scrollBy(0, 700);
              await new Promise(r => setTimeout(r, 400));
            }
          } else {
            window.scrollBy(0, 1000);
          }
        });
        await sleep(1500);

        // Extract job cards
        const cards = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll("[data-occludable-job-id]"));
          return items.map(c => {
            const jobId = c.getAttribute("data-occludable-job-id");
            const link = c.querySelector("a[href*='/jobs/view/']");
            const titleEl = c.querySelector(".job-card-list__title--link, a.job-card-container__link");
            const companyEl = c.querySelector(".artdeco-entity-lockup__subtitle, .job-card-container__primary-description");
            const isEasyApply = (c.innerText || "").includes("Easy Apply");

            return {
              jobId,
              title: titleEl ? titleEl.innerText.trim().replace(/\n+/g, " ") : (link ? link.innerText.trim().replace(/\n+/g, " ") : ""),
              company: companyEl ? companyEl.innerText.trim() : "",
              isEasyApply
            };
          }).filter(c => c.jobId && c.jobId.length > 5);
        });

        console.log(`Found ${cards.length} cards on page ${pageNum + 1}.`);
        for (const c of cards) {
          if (!allJobIds.has(c.jobId) && !appliedSet.has(c.jobId)) {
            allJobIds.add(c.jobId);
            jobList.push(c);
          }
        }
        console.log(`Total unique unapplied jobs collected so far: ${jobList.length}`);

        if (jobList.length >= 90) break;
        await sleep(2000);
      }
      if (jobList.length >= 90) break;
    }

    const outputFile = path.join(__dirname, "../harvested-jobs.json");
    fs.writeFileSync(outputFile, JSON.stringify(jobList, null, 2), "utf8");
    console.log(`\nSuccessfully harvested ${jobList.length} jobs into ${outputFile}`);
    process.exit(0);
  } catch (err) {
    console.error("Harvest error:", err);
    process.exit(1);
  }
})();
