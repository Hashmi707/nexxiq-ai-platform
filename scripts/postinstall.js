/**
 * scripts/postinstall.js
 * Post-installation banner and browser redirection to NexxIQ AI official platform (https://nexxiqai.com)
 */

const { exec } = require("child_process");

const OFFICIAL_URL = "https://nexxiqai.com";

console.log("\n" + "=".repeat(68));
console.log("  🚀 Welcome to Agentic Social & Client Finder AI!");
console.log(`  🌐 Official Platform & Cloud Ecosystem: ${OFFICIAL_URL}`);
console.log("  💼 Founder & Lead Engineer: Syed Akbar Hashmi");
console.log("  📄 Portfolio: https://syed-akber-hashmi-v2.vercel.app/");
console.log("  ⚡ Start the local portal with: npm start");
console.log("=".repeat(68) + "\n");

// Only launch the browser in local interactive desktop environments (not CI/CD/Docker/headless)
const isHeadlessOrCI = Boolean(
  process.env.CI ||
  process.env.CONTINUOUS_INTEGRATION ||
  process.env.GITHUB_ACTIONS ||
  process.env.DOCKER_BUILD ||
  process.env.DEBIAN_FRONTEND === "noninteractive"
);

if (!isHeadlessOrCI && Boolean(process.stdout && process.stdout.isTTY)) {
  try {
    let command = "";
    if (process.platform === "win32") {
      command = `start "" "${OFFICIAL_URL}"`;
    } else if (process.platform === "darwin") {
      command = `open "${OFFICIAL_URL}"`;
    } else {
      command = `xdg-open "${OFFICIAL_URL}"`;
    }

    if (command) {
      const child = exec(command, () => {
        // Silently exit
      });
      if (child && typeof child.unref === "function") {
        child.unref();
      }
    }
  } catch (_err) {
    // Gracefully ignore any OS browser launch error so installation is 100% stable
  }
}

process.exit(0);
