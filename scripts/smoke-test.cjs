const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];

  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push(`${msg.type()}: ${msg.text()}`);
    }
  });

  await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "networkidle" });
  await page.locator(".landing-actions a").first().click();
  await page.locator(".command-row input").fill("help");
  await page.locator(".command-row button").click();
  await page.locator(".command-row input").fill("find badge");
  await page.locator(".command-row button").click();
  await page.locator(".command-row input").fill("open nt-014");
  await page.locator(".command-row button").click();
  await page.screenshot({ path: "dist/smoke.png", fullPage: true });

  const text = await page.locator("body").innerText();
  await browser.close();

  if (!text.includes("show known commands")) {
    throw new Error("Smoke test failed: help output missing.");
  }
  if (!text.includes("nt-014-badge")) {
    throw new Error("Smoke test failed: archive did not open.");
  }
  if (errors.length) {
    throw new Error(`Smoke test console errors:\n${errors.join("\n")}`);
  }

  console.log("Smoke test passed.");
})();
