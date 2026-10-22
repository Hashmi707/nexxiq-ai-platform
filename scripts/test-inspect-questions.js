const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    const questions = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input, select, textarea"));
      return inputs.map(i => {
        let labelText = "";
        if (i.labels && i.labels.length > 0) {
          labelText = Array.from(i.labels).map(l => l.innerText).join(" ");
        } else {
          // Look up parent container
          const parent = i.closest("div, fieldset");
          labelText = parent ? parent.innerText.slice(0, 100) : "";
        }
        return {
          tag: i.tagName,
          type: i.type,
          id: i.id,
          name: i.name,
          value: i.value,
          label: labelText.replace(/\n+/g, " ").trim(),
          options: i.tagName === "SELECT" ? Array.from(i.options).map(o => ({ val: o.value, text: o.text })) : null
        };
      });
    });

    console.log("Form Questions:", JSON.stringify(questions, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
