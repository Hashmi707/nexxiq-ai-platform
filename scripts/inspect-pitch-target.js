const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com"));
    if (!page) {
      console.log("No LinkedIn page found!");
      process.exit(1);
    }

    console.log("Found LinkedIn page:", page.url());
    
    // Test navigating to Rohit Yadav's recent activity
    const targetUrl = "https://www.linkedin.com/in/rohit-yadav-4a88ba440/recent-activity/all/";
    console.log("Navigating to:", targetUrl);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    const postsFound = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll("div[role='listitem'], .feed-shared-update-v2, div[data-view-name*='feed-full-update']"));
      return items.slice(0, 5).map(item => {
        const text = (item.innerText || "").slice(0, 150).replace(/\n+/g, " ");
        const buttons = Array.from(item.querySelectorAll("button")).map(b => (b.innerText || b.getAttribute("aria-label") || "").trim()).filter(Boolean);
        return { text, buttons: buttons.slice(0, 6) };
      });
    });

    console.log("Posts on activity page:", JSON.stringify(postsFound, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
