const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com")) || pages[0];
    if (!page) {
      console.log("No LinkedIn page found!");
      process.exit(1);
    }

    console.log("Starting from URL:", page.url());
    const targetUrl = "https://www.linkedin.com/in/rohit-yadav-4a88ba440/recent-activity/all/";
    console.log("Navigating to:", targetUrl);
    
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    console.log("DOM loaded, waiting for feed cards...");
    
    await page.waitForSelector("div[role='listitem'], .feed-shared-update-v2, div[data-view-name*='feed-full-update']", { timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));

    console.log("Feed cards rendered! Inspecting cards...");
    const cardInfo = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div[role='listitem'], .feed-shared-update-v2, div[data-view-name*='feed-full-update']")).filter(c => {
        return (c.innerText || "").includes("Comment") && (c.innerText || "").length > 40;
      });
      return {
        count: cards.length,
        firstSnippet: cards[0] ? cards[0].innerText.slice(0, 100).replace(/\n/g, " ") : "none"
      };
    });

    console.log("Card Info:", cardInfo);

    // Now click the Comment button on the first card
    const clickRes = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div[role='listitem'], .feed-shared-update-v2, div[data-view-name*='feed-full-update']")).filter(c => {
        return (c.innerText || "").includes("Comment") && (c.innerText || "").length > 40;
      });
      if (!cards.length) return { error: "No card found" };
      const card = cards[0];
      const commentBtn = Array.from(card.querySelectorAll("button")).find(b => {
        const t = (b.innerText || "").trim().toLowerCase();
        const l = (b.getAttribute("aria-label") || "").toLowerCase();
        return t === "comment" || (l.includes("comment") && !l.includes("reaction"));
      });
      if (!commentBtn) return { error: "No comment button found" };
      commentBtn.scrollIntoView({ behavior: "instant", block: "center" });
      commentBtn.click();
      return { clicked: true, text: commentBtn.innerText };
    });

    console.log("Click result:", clickRes);
    await new Promise(r => setTimeout(r, 2500));

    // Check for comment input
    const inputStatus = await page.evaluate(() => {
      const ed = document.querySelector("div.tiptap.ProseMirror[role='textbox'], div[role='textbox'][aria-label*='comment' i], div[role='textbox'][contenteditable='true'], .comments-comment-box__form [contenteditable='true']");
      if (!ed) return { editorFound: false };
      return {
        editorFound: true,
        ariaLabel: ed.getAttribute("aria-label"),
        isVisible: ed.offsetParent !== null
      };
    });

    console.log("Editor Status:", inputStatus);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
