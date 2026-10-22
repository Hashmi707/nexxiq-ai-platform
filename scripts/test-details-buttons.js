const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    const detailsButtons = await page.evaluate(() => {
      const details = document.querySelector(".jobs-details__main-content, .jobs-search__job-details, div.job-details-module") || document.body;
      const btns = Array.from(details.querySelectorAll("button")).map(b => ({
        text: (b.innerText || "").trim().replace(/\n+/g, " "),
        ariaLabel: b.getAttribute("aria-label"),
        className: b.className
      })).filter(b => b.text.length > 0 && b.text.length < 50);

      return btns;
    });

    console.log("Details Pane Buttons:", JSON.stringify(detailsButtons, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
