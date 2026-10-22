const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    const dialogDetails = await page.evaluate(() => {
      const dialog = document.querySelector("dialog");
      if (!dialog) return { error: "No dialog found" };

      // Look at all input, select, textarea inside dialog
      const elements = Array.from(dialog.querySelectorAll("input, select, textarea"));
      
      const formControls = elements.map(el => {
        // Find the label or nearest descriptive text
        let label = "";
        if (el.labels && el.labels.length > 0) {
          label = Array.from(el.labels).map(l => l.innerText).join(" ");
        } else {
          // Check previous element siblings or parent container
          let cur = el.parentElement;
          while (cur && cur !== dialog) {
            const p = cur.querySelector("label, p, span, h3, h4");
            if (p && p.innerText && p.innerText.trim().length > 0 && !p.contains(el)) {
              label = p.innerText.trim();
              break;
            }
            cur = cur.parentElement;
          }
        }

        return {
          tag: el.tagName,
          type: el.type,
          id: el.id,
          name: el.name,
          value: el.value,
          label: label.replace(/\n+/g, " "),
          options: el.tagName === "SELECT" ? Array.from(el.options).map(o => ({ text: o.text, val: o.value })) : null
        };
      });

      const buttons = Array.from(dialog.querySelectorAll("button")).map(b => ({
        text: (b.innerText || "").trim().replace(/\n+/g, " "),
        aria: b.getAttribute("aria-label"),
        disabled: b.disabled
      }));

      return { formControls, buttons };
    });

    console.log("Dialog Details:", JSON.stringify(dialogDetails, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
