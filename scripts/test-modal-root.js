const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    const modalDOM = await page.evaluate(() => {
      // Find the element containing "Apply to TestUnity"
      const el = Array.from(document.querySelectorAll("*")).find(e => 
        e.children.length === 0 && (e.innerText || "").includes("Apply to")
      );
      if (!el) return { found: false };

      // Find the modal root (ancestor with role='dialog' or fixed position or highest z-index)
      let cur = el;
      let modalRoot = null;
      while (cur && cur !== document.body) {
        if (cur.getAttribute("role") === "dialog" || cur.className.includes("modal") || window.getComputedStyle(cur).position === "fixed") {
          modalRoot = cur;
          break;
        }
        cur = cur.parentElement;
      }
      if (!modalRoot) modalRoot = el.parentElement.parentElement;

      return {
        rootTag: modalRoot.tagName,
        rootClass: modalRoot.className,
        rootRole: modalRoot.getAttribute("role"),
        formHtml: modalRoot.innerHTML.slice(0, 3000)
      };
    });

    console.log("Modal Root:", JSON.stringify(modalDOM, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
