const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    console.log("On page:", page.url());

    // Click on the second job card (e.g. Senior AI Engineer or Agentic AI Developer)
    const cardInfo = await page.evaluate(async () => {
      const cards = Array.from(document.querySelectorAll("div.job-card-container, li.jobs-search-results__list-item"));
      if (cards.length < 2) return { error: "Not enough cards" };

      const card = cards[1];
      card.scrollIntoView({ behavior: "instant", block: "center" });
      const link = card.querySelector("a");
      if (link) link.click();
      return { clicked: true, text: card.innerText.slice(0, 80).replace(/\n/g, " ") };
    });

    console.log("Card click info:", cardInfo);
    await new Promise(r => setTimeout(r, 3000));

    // Check for Easy Apply button in the details pane
    const applyBtnInfo = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button")).filter(b => {
        const t = (b.innerText || "").trim().toLowerCase();
        const a = (b.getAttribute("aria-label") || "").toLowerCase();
        return t.includes("easy apply") || a.includes("easy apply");
      });
      return {
        count: btns.length,
        buttons: btns.map(b => ({
          text: b.innerText.trim(),
          aria: b.getAttribute("aria-label"),
          className: b.className
        }))
      };
    });

    console.log("Easy Apply button info:", applyBtnInfo);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
