const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    const labels = await page.evaluate(() => {
      const dialog = document.querySelector("dialog");
      const inputs = Array.from(dialog.querySelectorAll("input, select, textarea"));
      return inputs.map(input => {
        // Walk up until we find an element containing text that is not just the input value/character count
        let cur = input.parentElement;
        let questionText = "";
        while (cur && cur !== dialog) {
          const text = cur.innerText.replace(/\n+/g, " ").trim();
          if (text && !text.startsWith("0/20") && text.length > 5) {
            questionText = text;
            break;
          }
          cur = cur.parentElement;
        }
        return {
          id: input.id,
          tag: input.tagName,
          questionText: questionText.slice(0, 150)
        };
      });
    });

    console.log("Questions Mapping:", JSON.stringify(labels, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
