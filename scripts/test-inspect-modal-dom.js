const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    const structure = await page.evaluate(() => {
      // Find buttons currently visible on the page
      const buttons = Array.from(document.querySelectorAll("button")).map(b => ({
        text: (b.innerText || "").trim().replace(/\n+/g, " "),
        aria: b.getAttribute("aria-label"),
        id: b.id,
        className: b.className
      })).filter(b => b.text.length > 0 || (b.aria && b.aria.length > 0));

      // Find form inputs
      const inputs = Array.from(document.querySelectorAll("input, select, textarea")).map(i => ({
        tag: i.tagName,
        type: i.type,
        id: i.id,
        name: i.name,
        value: i.value,
        ariaLabel: i.getAttribute("aria-label"),
        placeholder: i.placeholder
      }));

      return { buttons, inputs };
    });

    console.log("Visible Buttons & Inputs:", JSON.stringify(structure, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
