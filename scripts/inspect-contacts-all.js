const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com")) || pages[0];

    const inspectUser = async (username) => {
      console.log(`Inspecting @${username}...`);
      await page.goto(`https://www.linkedin.com/in/${username}/overlay/contact-info/`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await new Promise(r => setTimeout(r, 3000));
      return await page.evaluate(() => {
        const modal = document.querySelector(".artdeco-modal, section[role='dialog']") || document.body;
        const mailto = Array.from(modal.querySelectorAll("a[href^='mailto:']")).map(a => a.href.replace("mailto:", ""));
        const msgLinks = Array.from(document.querySelectorAll("a[href*='/messaging/compose']")).map(a => a.href);
        const websites = Array.from(modal.querySelectorAll("a")).map(a => a.href).filter(h => !h.includes("linkedin.com") && !h.startsWith("mailto:"));
        return { emails: mailto, msgLinks: msgLinks.slice(0, 1), websites };
      });
    };

    const haris = await inspectUser("muhammad-haris-125941394");
    console.log("Muhammad Haris Contact:", haris);

    const hitesh = await inspectUser("hitesh-prajapat-29bb7a419");
    console.log("Hitesh Prajapat Contact:", hitesh);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
