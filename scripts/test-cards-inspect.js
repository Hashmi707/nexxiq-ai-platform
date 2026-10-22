const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    const cards = await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll("[data-occludable-job-id]"));
      return list.slice(0, 10).map(c => {
        const link = c.querySelector("a[href*='/jobs/view/']");
        return {
          jobId: c.getAttribute("data-occludable-job-id"),
          title: link ? link.innerText.trim().replace(/\n+/g, " ") : "",
          href: link ? link.href : "",
          snippet: c.innerText.slice(0, 120).replace(/\n+/g, " ")
        };
      });
    });

    console.log("Job Cards:", JSON.stringify(cards, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
