const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    
    const recipient = "info@techyappy.com";
    const subject = encodeURIComponent("Collaboration on Web, Mobile App & SaaS Projects — Agentic Social AI");
    const body = encodeURIComponent(`Hi Rohit,

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
Portfolio: https://syed-akber-hashmi-v2.vercel.app/`);

    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
    console.log("Opening Gmail Web compose URL in Chrome...");
    const page = await browser.newPage();
    await page.goto(gmailComposeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    console.log("Page URL:", page.url());
    console.log("Page Title:", await page.title());

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
