const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com")) || pages[0];

    console.log("Navigating to Rohit Yadav profile...");
    await page.goto("https://www.linkedin.com/in/rohit-yadav-4a88ba440/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise(r => setTimeout(r, 3500));

    // Check main profile buttons
    const profileActions = await page.evaluate(() => {
      const topCard = document.querySelector(".pv-top-card, section.artdeco-card") || document.body;
      const buttons = Array.from(topCard.querySelectorAll("button, a")).map(b => ({
        tag: b.tagName,
        text: (b.innerText || "").trim().replace(/\n+/g, " "),
        ariaLabel: b.getAttribute("aria-label"),
        href: b.getAttribute("href")
      })).filter(b => b.text.length > 0 && b.text.length < 50);

      return buttons.slice(0, 15);
    });

    console.log("Profile Buttons:", JSON.stringify(profileActions, null, 2));

    // Now inspect contact info overlay
    console.log("Navigating to contact info overlay...");
    await page.goto("https://www.linkedin.com/in/rohit-yadav-4a88ba440/overlay/contact-info/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const contactInfo = await page.evaluate(() => {
      const modal = document.querySelector(".artdeco-modal, section[role='dialog']") || document.body;
      const text = modal.innerText;
      const links = Array.from(modal.querySelectorAll("a")).map(a => a.href);
      return { text: text.slice(0, 500).replace(/\n+/g, " | "), links };
    });

    console.log("Contact info extracted:", JSON.stringify(contactInfo, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
