const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com")) || pages[0];

    // Inspect current DOM of the card
    const cardDetails = await page.evaluate(() => {
      const card = document.querySelector("div[role='listitem'], .feed-shared-update-v2, div[data-view-name*='feed-full-update']");
      if (!card) return "No card found";
      
      const inputs = Array.from(card.querySelectorAll("input, textarea, div[contenteditable], [role='textbox']")).map(el => ({
        tag: el.tagName,
        contenteditable: el.getAttribute("contenteditable"),
        role: el.getAttribute("role"),
        ariaLabel: el.getAttribute("aria-label"),
        className: el.className
      }));

      const buttons = Array.from(card.querySelectorAll("button")).map(b => ({
        text: (b.innerText || "").trim(),
        ariaLabel: b.getAttribute("aria-label"),
        className: b.className
      }));

      return { inputs, buttonCount: buttons.length, buttons: buttons.slice(0, 10) };
    });

    console.log("Card Details after clicking Comment:", JSON.stringify(cardDetails, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
