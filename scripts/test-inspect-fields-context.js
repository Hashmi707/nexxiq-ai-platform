const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    const fields = await page.evaluate(() => {
      // Find all divs or containers inside the form
      const elements = Array.from(document.querySelectorAll("input, select, textarea"));
      return elements.map(el => {
        let p = el.parentElement;
        let text = "";
        for (let i = 0; i < 5 && p; i++) {
          if (p.innerText && p.innerText.trim().length > 0) {
            text = p.innerText.replace(/\n+/g, " | ");
            break;
          }
          p = p.parentElement;
        }
        return {
          id: el.id,
          tag: el.tagName,
          type: el.type,
          surrounding: text.slice(0, 150)
        };
      });
    });

    console.log("Fields with surrounding context:", JSON.stringify(fields, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
