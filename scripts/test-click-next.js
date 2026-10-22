const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    // Click Next
    const clickedNext = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const nextBtn = btns.find(b => (b.innerText || "").trim().toLowerCase() === "next");
      if (nextBtn) {
        nextBtn.click();
        return true;
      }
      return false;
    });

    console.log("Clicked Next:", clickedNext);
    await new Promise(r => setTimeout(r, 2500));

    // Inspect the new modal contents
    const content = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button")).map(b => ({
        text: (b.innerText || "").trim().replace(/\n+/g, " "),
        aria: b.getAttribute("aria-label")
      })).filter(b => b.text.length > 0 || (b.aria && b.aria.length > 0));

      const fieldsets = Array.from(document.querySelectorAll("fieldset, div.fb-dash-form-element, div.jobs-easy-apply-form-section__grouping, div[data-test-form-element]")).map(f => ({
        text: f.innerText.replace(/\n+/g, " ").slice(0, 150)
      }));

      const bodySnippet = document.body.innerText.slice(0, 500).replace(/\n+/g, " ");

      return { buttons, fieldsets, bodySnippet };
    });

    console.log("After Next:", JSON.stringify(content, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
