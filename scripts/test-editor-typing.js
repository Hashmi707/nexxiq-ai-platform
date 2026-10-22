const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com")) || pages[0];

    // Focus editor and type a test word
    const res = await page.evaluate(() => {
      const ed = document.querySelector("div[role='textbox'][aria-label*='comment' i], div.tiptap.ProseMirror");
      if (!ed) return { error: "No editor found" };
      ed.focus();
      return { focused: true };
    });

    console.log("Focus result:", res);
    await page.keyboard.type("Test ", { delay: 50 });
    await new Promise(r => setTimeout(r, 1000));

    // Inspect buttons now
    const buttons = await page.evaluate(() => {
      const card = document.querySelector("div[role='listitem'], .feed-shared-update-v2, div[data-view-name*='feed-full-update']");
      return Array.from(card.querySelectorAll("button")).map(b => ({
        text: (b.innerText || "").trim(),
        ariaLabel: b.getAttribute("aria-label"),
        disabled: b.disabled || b.getAttribute("aria-disabled") === "true",
        className: b.className
      }));
    });

    console.log("Buttons after typing:", JSON.stringify(buttons, null, 2));

    // Clear the test text
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    console.log("Test text cleared.");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
