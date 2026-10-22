const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com")) || pages[0];

    const composeUrl = "https://www.linkedin.com/messaging/compose/?recipient=ACoAAG8xIUABcoDAsxmmd8ERrlEkE6JumSdE5Pg";
    console.log("Navigating to compose URL:", composeUrl);
    await page.goto(composeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    // Inspect messaging form
    const msgForm = await page.evaluate(() => {
      const activeOverlay = document.querySelector(".msg-overlay-conversation-bubble--is-active, .msg-overlay-conversation-bubble, div.msg-form");
      const textbox = document.querySelector("div[role='textbox'][aria-label*='message' i], div.msg-form__contenteditable[contenteditable='true'], .msg-form [contenteditable='true']");
      const sendBtn = document.querySelector("button.msg-form__send-button, button[type='submit']");
      return {
        hasOverlay: Boolean(activeOverlay),
        hasTextbox: Boolean(textbox),
        textboxAria: textbox ? textbox.getAttribute("aria-label") : null,
        hasSendBtn: Boolean(sendBtn),
        sendBtnText: sendBtn ? sendBtn.innerText : null
      };
    });

    console.log("Message Form Status:", JSON.stringify(msgForm, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
