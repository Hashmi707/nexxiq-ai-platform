const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    console.log("Current page URL:", page.url());

    // Click the Easy Apply button
    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(b => {
        const text = (b.innerText || "").trim().toLowerCase();
        const aria = (b.getAttribute("aria-label") || "").toLowerCase();
        return text.includes("easy apply") || aria.includes("easy apply to this job");
      });
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    console.log("Easy Apply button clicked:", clicked);
    await new Promise(r => setTimeout(r, 3000));

    // Inspect the modal
    const modalInfo = await page.evaluate(() => {
      const modal = document.querySelector("div[role='dialog'], div.jobs-easy-apply-modal");
      if (!modal) return { open: false, body: document.body.innerText.slice(0, 300) };

      const header = modal.querySelector("h2, h3, h1") ? modal.querySelector("h2, h3, h1").innerText : "No title";
      const buttons = Array.from(modal.querySelectorAll("button")).map(b => ({
        text: (b.innerText || "").trim().replace(/\n+/g, " "),
        aria: b.getAttribute("aria-label"),
        class: b.className
      }));

      const inputs = Array.from(modal.querySelectorAll("input, select, textarea")).map(i => ({
        tag: i.tagName,
        type: i.type,
        id: i.id,
        name: i.name,
        value: i.value,
        ariaLabel: i.getAttribute("aria-label"),
        placeholder: i.placeholder,
        label: i.labels && i.labels[0] ? i.labels[0].innerText.trim() : null
      }));

      return {
        open: true,
        header,
        buttons,
        inputs
      };
    });

    console.log("Modal Info:", JSON.stringify(modalInfo, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
