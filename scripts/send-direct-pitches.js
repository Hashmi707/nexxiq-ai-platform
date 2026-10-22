const puppeteer = require("puppeteer-core");

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const LEADS = [
  {
    name: "Rohit Yadav",
    username: "rohit-yadav-4a88ba440",
    email: "info@techyappy.com",
    composeUrl: "https://www.linkedin.com/messaging/compose/?recipient=ACoAAG8xIUABcoDAsxmmd8ERrlEkE6JumSdE5Pg",
    message: `Hi Rohit,\n\nHope you're doing well! Saw your post regarding partnerships for Web, Mobile App & SaaS projects.\n\nAt Just Smart IT Solutions (https://syed-akber-hashmi-v2.vercel.app/), we specialize in:\n• Full-stack web platforms & dashboards (Next.js, Node, TypeScript)\n• Cross-platform mobile applications (Flutter & React Native)\n• Rapid SaaS MVPs & custom AI automation\n\nWe often partner with tech founders and agencies on client builds and technical architecture. Would love to stay connected and explore collaboration on upcoming pipelines.\n\nBest regards,\nSyed Akbar Hashmi\nFounder, Just Smart IT Solutions\nEmail: syedakbarhashmi519@gmail.com`
  },
  {
    name: "Muhammad Haris",
    username: "muhammad-haris-125941394",
    email: null,
    composeUrl: "https://www.linkedin.com/messaging/compose/?recipient=ACoAAGD1d20B8ooQi8b9lfVyzpP-AMuPgMM3mOY",
    message: `Hi Muhammad,\n\nLove the proactive outreach on your post! We engineer bespoke web applications, high-converting landing pages, and scalable web platforms at Just Smart IT Solutions (https://syed-akber-hashmi-v2.vercel.app/).\n\nAlways keen to partner with proactive developers and agencies on client overflow and upcoming web builds. Let's connect and keep in touch!\n\nBest regards,\nSyed Akbar Hashmi\nEmail: syedakbarhashmi519@gmail.com`
  },
  {
    name: "Hitesh Prajapat",
    username: "hitesh-prajapat-29bb7a419",
    email: null,
    composeUrl: "https://www.linkedin.com/messaging/compose/?recipient=ACoAAGptEBcBl2cSybFuaLyqUEDC3EBLN_vKCXE",
    message: `Hi Hitesh,\n\nSaw your post building the smooth EV Charging experience with Flutter—really clean architecture and UI direction!\n\nAt Just Smart IT Solutions (https://syed-akber-hashmi-v2.vercel.app/), we focus on high-performance mobile (Flutter & React Native) and web platforms. Would love to stay connected and chat Flutter mobile architecture on future projects!\n\nBest regards,\nSyed Akbar Hashmi\nEmail: syedakbarhashmi519@gmail.com`
  }
];

async function runDirectPitches() {
  console.log("================================================================================");
  console.log("            💬 AUTONOMOUS LINKEDIN DIRECT MESSAGE (INMAIL) RUNNER");
  console.log("================================================================================");

  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
  const pages = await browser.pages();
  const page = pages.find(p => p.url().includes("linkedin.com")) || pages[0];

  let sentCount = 0;

  for (let i = 0; i < LEADS.length; i++) {
    const lead = LEADS[i];
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`[DM ${i + 1}/${LEADS.length}] TARGET: ${lead.name} (@${lead.username})`);
    console.log(`Email Contact : ${lead.email || "Not publicly listed"}`);
    console.log(`Compose URL   : ${lead.composeUrl}`);
    console.log(`--------------------------------------------------------------------------------`);

    try {
      console.log(`Navigating to messaging compose for ${lead.name}...`);
      await page.goto(lead.composeUrl, { waitUntil: "domcontentloaded", timeout: 35000 });
      await sleep(4000);

      // Locate textbox
      const found = await page.evaluate(() => {
        const tb = document.querySelector("div[role='textbox'][aria-label*='message' i], div.msg-form__contenteditable[contenteditable='true'], .msg-form [contenteditable='true']");
        if (tb) {
          tb.focus();
          tb.click();
          return true;
        }
        return false;
      });

      if (!found) {
        console.warn(`⚠️ Could not locate message textbox for ${lead.name}.`);
        continue;
      }

      console.log(`Typing personalized direct message for ${lead.name}...`);
      for (const char of lead.message) {
        if (char === "\n") {
          await page.keyboard.down("Shift");
          await page.keyboard.press("Enter");
          await page.keyboard.up("Shift");
        } else {
          await page.keyboard.type(char, { delay: Math.floor(Math.random() * 20) + 15 });
        }
      }

      await sleep(2000);

      // Find and click Send button
      const sendRes = await page.evaluate(() => {
        const btn = document.querySelector("button.msg-form__send-button, button[type='submit']");
        if (btn && !btn.disabled) {
          btn.click();
          return { sent: true };
        }
        // Fallback: search for button with text 'Send'
        const btns = Array.from(document.querySelectorAll("button")).filter(b => (b.innerText || "").trim().toLowerCase() === "send" && !b.disabled);
        if (btns.length > 0) {
          btns[btns.length - 1].click();
          return { sent: true };
        }
        return { sent: false, reason: "Send button disabled or not found" };
      });

      console.log(`Send Result:`, sendRes);
      if (sendRes.sent) {
        sentCount++;
        console.log(`✅ Direct Message successfully sent to ${lead.name}!`);
      } else {
        console.warn(`⚠️ Message typed but send button not clicked:`, sendRes.reason);
      }

    } catch (err) {
      console.error(`❌ Error messaging ${lead.name}:`, err.message);
    }

    if (i < LEADS.length - 1) {
      console.log(`⏳ Waiting 15s stealth cadence before next lead...`);
      await sleep(15000);
    }
  }

  console.log("\n================================================================================");
  console.log(`🏁 DIRECT MESSAGING COMPLETE: ${sentCount}/${LEADS.length} messages sent successfully!`);
  console.log("================================================================================\n");
  process.exit(0);
}

runDirectPitches().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
