const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    const formItems = await page.evaluate(() => {
      // Find all form elements inside the modal
      // Let's find the main modal container
      const modal = Array.from(document.querySelectorAll("div")).find(d => 
        (d.innerText || "").includes("Apply to") && (d.innerText || "").includes("pages")
      );
      if (!modal) return { error: "modal not found" };

      // Get every label or question block
      const blocks = Array.from(modal.querySelectorAll("div, fieldset")).filter(el => {
        // Find elements that directly contain an input or select
        return el.querySelector("input, select, textarea") && !el.querySelector("div > div > input");
      });

      return blocks.map(b => ({
        text: b.innerText.replace(/\n+/g, " | "),
        input: b.querySelector("input, select, textarea") ? {
          tag: b.querySelector("input, select, textarea").tagName,
          type: b.querySelector("input, select, textarea").type,
          id: b.querySelector("input, select, textarea").id,
          placeholder: b.querySelector("input, select, textarea").placeholder
        } : null
      }));
    });

    console.log("Form Items:", JSON.stringify(formItems, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
