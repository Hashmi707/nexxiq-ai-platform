const puppeteer = require("puppeteer-core");

(async () => {
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes("linkedin.com/jobs")) || pages[0];

    console.log("Filling out step 4 inputs...");
    const fillResult = await page.evaluate(() => {
      const dialog = document.querySelector("dialog");
      if (!dialog) return { error: "No dialog" };

      // Helper to trigger react / input events
      function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value') ? Object.getOwnPropertyDescriptor(element, 'value').set : null;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value') ? Object.getOwnPropertyDescriptor(prototype, 'value').set : null;
        
        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else if (valueSetter) {
          valueSetter.call(element, value);
        } else {
          element.value = value;
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const inputs = Array.from(dialog.querySelectorAll("input, select, textarea"));
      const filled = [];

      for (const el of inputs) {
        let cur = el.parentElement;
        let text = "";
        while (cur && cur !== dialog) {
          const t = cur.innerText.replace(/\n+/g, " ").trim();
          if (t && !t.startsWith("0/20") && t.length > 5) {
            text = t.toLowerCase();
            break;
          }
          cur = cur.parentElement;
        }

        if (el.tagName === "INPUT" && (el.type === "text" || el.type === "number")) {
          if (text.includes("notice period")) {
            setNativeValue(el, "15");
            filled.push({ id: el.id, field: "notice period", val: "15" });
          } else if (text.includes("current ctc") || text.includes("current annual")) {
            setNativeValue(el, "1200000");
            filled.push({ id: el.id, field: "current ctc", val: "1200000" });
          } else if (text.includes("expected ctc") || text.includes("expected annual")) {
            setNativeValue(el, "1800000");
            filled.push({ id: el.id, field: "expected ctc", val: "1800000" });
          } else if (text.includes("linkedin")) {
            setNativeValue(el, "https://www.linkedin.com/in/syed-akbar-hashmi");
            filled.push({ id: el.id, field: "linkedin profile", val: "https://www.linkedin.com/in/syed-akbar-hashmi" });
          } else if (!el.value) {
            // default number / text
            setNativeValue(el, "4");
            filled.push({ id: el.id, field: "generic input", val: "4" });
          }
        } else if (el.tagName === "SELECT") {
          if (text.includes("years") || text.includes("experience")) {
            // select option with 4
            const opt = Array.from(el.options).find(o => o.value === "4" || o.text.includes("4"));
            if (opt) {
              el.value = opt.value;
              el.dispatchEvent(new Event('change', { bubbles: true }));
              filled.push({ id: el.id, field: "years exp", val: opt.value });
            }
          } else if (text.includes("months")) {
            const opt = Array.from(el.options).find(o => o.value === "6" || o.text.includes("6"));
            if (opt) {
              el.value = opt.value;
              el.dispatchEvent(new Event('change', { bubbles: true }));
              filled.push({ id: el.id, field: "months exp", val: opt.value });
            }
          }
        }
      }

      return { filled };
    });

    console.log("Fill result:", JSON.stringify(fillResult, null, 2));
    await new Promise(r => setTimeout(r, 2000));

    // Now click Review button
    const reviewClicked = await page.evaluate(() => {
      const dialog = document.querySelector("dialog");
      const btns = Array.from(dialog.querySelectorAll("button"));
      const reviewBtn = btns.find(b => (b.innerText || "").trim().toLowerCase() === "review");
      if (reviewBtn) {
        reviewBtn.click();
        return true;
      }
      return false;
    });

    console.log("Review button clicked:", reviewClicked);
    await new Promise(r => setTimeout(r, 3000));

    const finalStepInfo = await page.evaluate(() => {
      const dialog = document.querySelector("dialog");
      if (!dialog) return { error: "No dialog" };
      return {
        bodySnippet: dialog.innerText.slice(0, 400).replace(/\n+/g, " "),
        buttons: Array.from(dialog.querySelectorAll("button")).map(b => (b.innerText || b.getAttribute("aria-label") || "").trim().replace(/\n+/g, " "))
      };
    });

    console.log("Final Step Info:", JSON.stringify(finalStepInfo, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
