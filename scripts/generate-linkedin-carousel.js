const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

async function generateCarouselPdf(options = {}) {
  const title = options.title || "The 2026 SaaS Architecture Blueprint";
  const outputPath = options.outputPath || path.resolve(__dirname, "../portfolio_images/saas_architecture_carousel.pdf");

  const slides = [
    {
      num: 1,
      tag: "SAAS ARCHITECTURE • 2026 EDITION",
      title: "Why 80% of SaaS MVPs Fail to Scale",
      subtitle: "And the 4 architectural principles we use to ship battle-tested web platforms in weeks.",
      highlight: "SWIPE FOR BLUEPRINT ➔",
      bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      accent: "#38bdf8"
    },
    {
      num: 2,
      tag: "PRINCIPLE 1",
      title: "Keep The Core Data Model Lean",
      subtitle: "Premature microservices and sharding will kill your startup before you get 100 users.",
      points: [
        "Use a single, clean PostgreSQL instance with strict schema constraints.",
        "Normalize tenant IDs at the row level (RLS) instead of separate databases.",
        "Index your query paths early to keep response times sub-50ms."
      ],
      bgGradient: "linear-gradient(135deg, #091e3a 0%, #082f49 100%)",
      accent: "#60a5fa"
    },
    {
      num: 3,
      tag: "PRINCIPLE 2",
      title: "Bulletproof Billing & Auth",
      subtitle: "Don't treat Stripe and user identity as an afterthought on launch day.",
      points: [
        "Implement webhook idempotency keys to avoid double-charging.",
        "Store customer subscription status in cache to avoid Stripe API throttling.",
        "Decouple role-based access control (RBAC) from business logic."
      ],
      bgGradient: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
      accent: "#34d399"
    },
    {
      num: 4,
      tag: "PRINCIPLE 3",
      title: "Fast Iteration Over Framework Hype",
      subtitle: "Pick boring, production-proven technology so your team ships daily.",
      points: [
        "Next.js / Node / TypeScript gives full-stack velocity.",
        "Tailwind CSS guarantees consistent design tokens across components.",
        "Automated GitHub Actions CI/CD with zero-downtime deployments."
      ],
      bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
      accent: "#a78bfa"
    },
    {
      num: 5,
      tag: "JUST SMART IT SOLUTIONS",
      title: "Ready to Build Your SaaS, App or Web Platform?",
      subtitle: "We partner with ambitious startups and businesses to build high-performance digital products.",
      points: [
        "🌐 Custom Websites & Web Applications",
        "📱 Cross-Platform Mobile Apps (Flutter & React Native)",
        "⚡ Scalable SaaS MVPs & AI Automation Systems"
      ],
      cta: "Explore portfolio: https://syed-akber-hashmi-v2.vercel.app/ • Email: syedakbarhashmi519@gmail.com",
      bgGradient: "linear-gradient(135deg, #022c22 0%, #064e3b 100%)",
      accent: "#10b981"
    }
  ];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #000; color: #fff; }
    
    .slide {
      width: 1080px;
      height: 1080px;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px;
      position: relative;
      overflow: hidden;
    }
    
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(255,255,255,0.1);
      padding-bottom: 24px;
    }
    .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #f8fafc; }
    .brand span { color: #38bdf8; }
    .slide-num { font-family: 'JetBrains Mono', monospace; font-size: 18px; color: rgba(255,255,255,0.5); }
    
    .content { margin: auto 0; }
    .tag {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 8px 16px;
      border-radius: 9999px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      margin-bottom: 32px;
    }
    
    .title {
      font-size: 58px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -1.5px;
      margin-bottom: 24px;
    }
    
    .subtitle {
      font-size: 26px;
      font-weight: 400;
      line-height: 1.45;
      color: #94a3b8;
      max-width: 900px;
      margin-bottom: 32px;
    }
    
    .points {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;
    }
    .points li {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 24px;
      font-weight: 600;
      color: #e2e8f0;
      background: rgba(255,255,255,0.04);
      padding: 20px 24px;
      border-radius: 16px;
      border-left: 6px solid #38bdf8;
    }
    
    .cta-box {
      margin-top: 32px;
      background: #10b981;
      color: #022c22;
      padding: 24px 32px;
      border-radius: 16px;
      font-size: 26px;
      font-weight: 800;
      text-align: center;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px solid rgba(255,255,255,0.1);
      padding-top: 24px;
      font-size: 18px;
      color: #64748b;
    }
    .swipe-text { font-weight: 700; color: #38bdf8; letter-spacing: 1px; }
  </style>
</head>
<body>
  ${slides.map(s => `
    <div class="slide" style="background: ${s.bgGradient};">
      <div class="top-bar">
        <div class="brand">JUST SMART <span>IT SOLUTIONS</span></div>
        <div class="slide-num">0${s.num} / 05</div>
      </div>
      
      <div class="content">
        <div class="tag" style="color: ${s.accent}; border-color: ${s.accent}40;">${s.tag}</div>
        <div class="title">${s.title}</div>
        <div class="subtitle">${s.subtitle}</div>
        
        ${s.points ? `
          <ul class="points">
            ${s.points.map(p => `<li style="border-left-color: ${s.accent};">${p}</li>`).join("")}
          </ul>
        ` : ""}
        
        ${s.cta ? `<div class="cta-box">${s.cta}</div>` : ""}
      </div>
      
      <div class="footer">
        <div>syed-akber-hashmi-v2.vercel.app • Syed Akbar Hashmi</div>
        <div class="swipe-text" style="color: ${s.accent};">${s.highlight || "SWIPE FOR MORE ➔"}</div>
      </div>
    </div>
  `).join("")}
</body>
</html>
  `;

  const htmlPath = path.resolve(__dirname, "../portfolio_images/carousel_preview.html");
  fs.writeFileSync(htmlPath, html, "utf8");

  // Connect to Chrome CDP to render PDF
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  await page.pdf({
    path: outputPath,
    width: "1080px",
    height: "1080px",
    printBackground: true,
    pageRanges: "1-5"
  });

  await page.close();
  console.log(`✅ LinkedIn Carousel PDF successfully generated at: ${outputPath}`);
  return outputPath;
}

if (require.main === module) {
  generateCarouselPdf()
    .then(p => {
      console.log("Carousel ready for LinkedIn:", p);
      process.exit(0);
    })
    .catch(err => {
      console.error("Error generating carousel:", err);
      process.exit(1);
    });
}

module.exports = { generateCarouselPdf };
