#!/usr/bin/env node
/**
 * scripts/send-email-pitch.js
 * Dual Mode Email Pitching Engine:
 *  - Mode A: Direct Autonomous SMTP sending via nodemailer (if SMTP_PASS/GMAIL_APP_PASSWORD set)
 *  - Mode B: Native Windows 1-Click Mailto & .eml draft generation for instant sending
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const nodemailer = require("nodemailer");
require("../config");

const SENDER = {
  name: "Syed Akbar Hashmi",
  title: "AI Native Full Stack Developer & Founder",
  company: "Agentic Social AI",
  email: process.env.CONTACT_EMAIL || "syedakbarhashmi519@gmail.com",
  portfolio: "https://syed-akber-hashmi-v2.vercel.app/"
};

const EMAIL_PITCHES = [
  {
    recipient: "info@techyappy.com",
    name: "Rohit Yadav",
    subject: "Collaboration on Web, Mobile App & SaaS Projects — Agentic Social AI",
    bodyText: `Hi Rohit,

Hope you're having a productive week!

I came across your recent update regarding partnerships for Web development, Mobile applications, and SaaS platforms.

I lead Agentic Social AI (https://syed-akber-hashmi-v2.vercel.app/). We specialize in:
• Full-stack web applications & enterprise portals (Next.js, Node.js, TypeScript)
• Fluid, high-performance cross-platform mobile apps (Flutter & React Native)
• Scalable SaaS MVPs engineered and deployed in 3–4 weeks
• AI Native workflow automation & intelligent integrations

We frequently partner with tech founders and agencies on client builds and technical architecture. I'd love to connect and explore how we can team up on upcoming project pipelines.

Feel free to reply here or check out our live builds at https://syed-akber-hashmi-v2.vercel.app/.

Best regards,
Syed Akbar Hashmi
Founder & Lead Developer, Agentic Social AI
Email: syedakbarhashmi519@gmail.com
Portfolio: https://syed-akber-hashmi-v2.vercel.app/`
  }
];

async function dispatchEmailPitches() {
  console.log("================================================================================");
  console.log("            📧 COLD EMAIL & OUTREACH PITCH DISPATCHER");
  console.log("================================================================================");
  console.log(`Sender : ${SENDER.name} (${SENDER.company}) <${SENDER.email}>`);
  console.log(`Portfolio: ${SENDER.portfolio}\n`);

  const smtpUser = SENDER.email;
  const cleanPass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  for (const pitch of EMAIL_PITCHES) {
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`Target Recipient : ${pitch.name} <${pitch.recipient}>`);
    console.log(`Subject          : ${pitch.subject}`);
    console.log(`--------------------------------------------------------------------------------`);

    // 1. Generate local .eml draft file
    const draftsDir = path.resolve(__dirname, "../drafts");
    fs.mkdirSync(draftsDir, { recursive: true });
    const emlPath = path.join(draftsDir, `pitch_${pitch.name.replace(/\s+/g, "_")}.eml`);
    const emlContent = [
      `From: "${SENDER.name}" <${SENDER.email}>`,
      `To: "${pitch.name}" <${pitch.recipient}>`,
      `Subject: ${pitch.subject}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      ``,
      pitch.bodyText
    ].join("\r\n");
    fs.writeFileSync(emlPath, emlContent, "utf8");
    console.log(`📄 1-Click .eml Draft Generated: ${emlPath}`);

    // 2. If SMTP configured, send autonomously
    const cleanPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "").replace(/\s+/g, "");
    if (cleanPass && cleanPass !== "PASTE_YOUR_GMAIL_APP_PASSWORD_HERE") {
      console.log(`🚀 Sending email autonomously via SMTP (${smtpUser})...`);
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: smtpUser, pass: cleanPass }
        });
        await transporter.sendMail({
          from: `"${SENDER.name}" <${SENDER.email}>`,
          to: pitch.recipient,
          subject: pitch.subject,
          text: pitch.bodyText
        });
        console.log(`✅ Email autonomously delivered to ${pitch.recipient}!`);
      } catch (err) {
        console.warn(`⚠️ SMTP send encountered an error: ${err.message}`);
      }
    } else {
      console.log(`💡 NOTE: SMTP password not configured in .env.`);
      console.log(`👉 To send automatically, add GMAIL_APP_PASSWORD=your_app_password to .env.`);
      console.log(`👉 In the meantime, you can open the ready-to-send draft directly in your email client!`);
      
      // Launch mailto
      try {
        const mailtoUrl = `mailto:${encodeURIComponent(pitch.recipient)}?subject=${encodeURIComponent(pitch.subject)}&body=${encodeURIComponent(pitch.bodyText)}`;
        if (process.platform === "win32") {
          execSync(`powershell -Command "Start-Process '${mailtoUrl}'" 2>nul`);
          console.log(`📬 Opened default email client pre-filled with recipient, subject, and proposal!`);
        }
      } catch (e) {}
    }
  }

  console.log("\n================================================================================");
  console.log("🏁 EMAIL OUTREACH DISPATCH COMPLETE");
  console.log("================================================================================\n");
}

if (require.main === module) {
  dispatchEmailPitches().then(() => process.exit(0)).catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
}

module.exports = { dispatchEmailPitches };
