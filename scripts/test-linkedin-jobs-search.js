const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes("linkedin.com"));
    if (!page) {
      page = await browser.newPage();
    }

    const searchUrl = "https://www.linkedin.com/jobs/search/?keywords=AI%20Native%20Developer%20OR%20Gen%20AI%20OR%20AI%20ML&f_WT=2&f_TPR=r2592000&f_AL=true&sortBy=R";
    console.log("Navigating to LinkedIn Easy Apply Jobs search:", searchUrl);
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise(r => setTimeout(r, 4000));

    // Inspect job cards
    const jobData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.job-card-container, li.jobs-search-results__list-item, div[data-job-id]"));
      return {
        totalFound: cards.length,
        jobs: cards.slice(0, 10).map(c => {
          const titleEl = c.querySelector("a.job-card-list__title, .artdeco-entity-lockup__title, strong");
          const companyEl = c.querySelector(".job-card-container__primary-description, .artdeco-entity-lockup__subtitle");
          const jobId = c.getAttribute("data-job-id") || (c.querySelector("a") ? c.querySelector("a").getAttribute("data-control-id") : null);
          const hasEasyApply = (c.innerText || "").toLowerCase().includes("easy apply");
          return {
            title: titleEl ? titleEl.innerText.trim() : "Unknown Title",
            company: companyEl ? companyEl.innerText.trim() : "Unknown Company",
            jobId,
            hasEasyApply
          };
        })
      };
    });

    console.log("Job Search Inspection Result:", JSON.stringify(jobData, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
