const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    console.log("Navigating directly to job view: 4478863108 (Agentic AI Developer)...");
    await page.goto("https://www.linkedin.com/jobs/view/4478863108/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    const pageInfo = await page.evaluate(() => {
      const title = document.title;
      const h1 = document.querySelector("h1") ? document.querySelector("h1").innerText : null;
      const buttons = Array.from(document.querySelectorAll("button")).map(b => ({
        text: (b.innerText || "").trim().replace(/\n+/g, " "),
        aria: b.getAttribute("aria-label"),
        class: b.className
      })).filter(b => b.text.toLowerCase().includes("apply") || (b.aria && b.aria.toLowerCase().includes("apply")));

      return { title, h1, buttons };
    });

    console.log("Job Page Details:", JSON.stringify(pageInfo, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
