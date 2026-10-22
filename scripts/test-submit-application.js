const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    console.log("Clicking 'Submit application'...");
    const submitted = await page.evaluate(() => {
      const dialog = document.querySelector("dialog");
      if (!dialog) return { error: "No dialog" };
      const btns = Array.from(dialog.querySelectorAll("button"));
      const submitBtn = btns.find(b => (b.innerText || "").trim().toLowerCase().includes("submit application"));
      if (submitBtn) {
        submitBtn.click();
        return { success: true };
      }
      return { error: "Submit button not found" };
    });

    console.log("Submit result:", JSON.stringify(submitted, null, 2));
    await new Promise(r => setTimeout(r, 4000));

    // Check if dialog is closed or has a "Done" button or success modal
    const postSubmit = await page.evaluate(() => {
      const dialog = document.querySelector("dialog");
      if (!dialog) return { dialogOpen: false };
      return {
        dialogOpen: true,
        text: dialog.innerText.slice(0, 300).replace(/\n+/g, " "),
        buttons: Array.from(dialog.querySelectorAll("button")).map(b => (b.innerText || b.getAttribute("aria-label") || "").trim())
      };
    });

    console.log("Post Submit Status:", JSON.stringify(postSubmit, null, 2));

    // If there is a dismiss / done button in the confirmation modal, click it
    if (postSubmit.dialogOpen) {
      await page.evaluate(() => {
        const dialog = document.querySelector("dialog");
        if (dialog) {
          const btn = Array.from(dialog.querySelectorAll("button")).find(b => {
            const t = (b.innerText || b.getAttribute("aria-label") || "").toLowerCase();
            return t.includes("done") || t.includes("dismiss") || t.includes("close");
          });
          if (btn) btn.click();
        }
      });
      console.log("Closed confirmation modal.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
