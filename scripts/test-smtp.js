const nodemailer = require("nodemailer");
require("../config");

(async () => {
  const user = process.env.GMAIL_USER || "syedakbarhashmi519@gmail.com";
  const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  console.log("Testing SMTP login for user:", user);
  console.log("Password length:", pass.length);
  console.log("Password first 4 chars:", pass.slice(0, 4));

  // Test 1: Service gmail
  try {
    const t1 = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass }
    });
    await t1.verify();
    console.log("✅ SMTP port 465 verify SUCCESS!");
  } catch (e1) {
    console.log("❌ Port 465 verify failed:", e1.message);
  }

  // Test 2: Port 587 STARTTLS
  try {
    const t2 = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user, pass }
    });
    await t2.verify();
    console.log("✅ SMTP port 587 verify SUCCESS!");
  } catch (e2) {
    console.log("❌ Port 587 verify failed:", e2.message);
  }
})();
