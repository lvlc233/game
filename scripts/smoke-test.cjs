const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "dist");
const index = path.join(root, "index.html");

if (!fs.existsSync(index)) {
  throw new Error("dist/index.html is missing. Run npm run build first.");
}

const server = http.createServer((req, res) => {
  const filePath = req.url === "/" ? index : path.join(root, req.url.replace(/^\/+/, ""));
  if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "content-type": filePath.endsWith(".html") ? "text/html; charset=utf-8" : "text/plain" });
  fs.createReadStream(filePath).pipe(res);
});

(async () => {
  await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];

  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  async function runCommand(targetPage, command) {
    const input = targetPage.locator("#passages .command-input-wrap input");
    await input.waitFor({ state: "visible" });
    await input.fill(command);
    await input.press("Enter");
    await targetPage.waitForTimeout(250);
    await targetPage.locator(".app-shell, .intro-shell").waitFor({ state: "visible" });
  }

  try {
    await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.locator(".intro-shell").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.body.innerText.includes("欢迎来到第一学院"));
    let body = await page.locator("body").innerText();
    if (body.includes("AUTOLOAD") || body.includes("Load autosave")) {
      throw new Error("SugarCube autoload dialog should not appear");
    }
    if (!body.includes("欢迎来到第一学院")) {
      throw new Error("intro screen missing");
    }
    if (body.includes("这是一款纯文字解谜游戏")) {
      throw new Error("intro lines should type sequentially, not appear all at once");
    }

    await page.locator(".intro-shell").click();
    await page.locator(".intro-shell.is-complete").waitFor({ state: "visible" });
    await page.locator(".intro-shell").click();
    await page.waitForFunction(() => document.body.innerText.includes("档案来自"));
    body = await page.locator("body").innerText();
    if (!body.includes("档案来自")) {
      throw new Error("second intro page missing");
    }
    await page.locator(".intro-back").click();
    await page.waitForFunction(() => document.body.innerText.includes("欢迎来到"));
    body = await page.locator("body").innerText();
    if (!body.includes("欢迎来到")) {
      throw new Error("intro back button did not return");
    }
    await page.locator(".intro-shell").click();
    await page.locator(".intro-shell.is-complete").waitFor({ state: "visible" });
    await page.locator(".intro-shell").click();
    await page.locator(".intro-shell").click();
    await page.locator(".intro-shell.is-complete").waitFor({ state: "visible" });
    await page.locator(".intro-shell").click();
    await page.locator(".entry-panel").waitFor({ state: "visible" });
    body = await page.locator("body").innerText();
    if (!body.includes("开始新故事") || !body.includes("档案") || !body.includes("关于游戏")) {
      throw new Error("entry menu missing");
    }

    await page.locator('[data-menu-action="about"]').click();
    await page.locator(".intro-shell").waitFor({ state: "visible" });
    await page.evaluate(() => {
      const state = SugarCube.State.variables;
      state.introCompleted = true;
      state.menuMode = "home";
      SugarCube.setup.persistProgress();
      SugarCube.Engine.play("Game");
    });
    await page.locator(".entry-panel").waitFor({ state: "visible" });

    await page.locator('[data-menu-action="new-story"]').click();
    await page.getByRole("button", { name: "第一学院" }).click();
    await page.waitForFunction(() => document.body.innerText.includes("你收到"));
    await page.locator(".story-preview").click();
    await page.locator(".story-preview.is-complete").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "开始新游戏" }).click();
    await page.locator(".command-input-wrap input").waitFor({ state: "visible" });

    await runCommand(page, "help");
    body = await page.locator("body").innerText();
    if (!body.includes("> help") || !body.includes("help: 查询指令")) {
      throw new Error("help screen missing");
    }

    await runCommand(page, "find badge");
    body = await page.locator("body").innerText();
    if (!body.includes("> find") || !body.includes("nt-014-badge")) {
      throw new Error("find screen missing");
    }

    const reopened = await context.newPage();
    await reopened.goto("http://127.0.0.1:4173/index.html", { waitUntil: "networkidle" });
    const reopenedBody = await reopened.locator("body").innerText();
    if (!reopenedBody.includes("> find") || !reopenedBody.includes("nt-014-badge")) {
      throw new Error("progress did not auto-continue after reopen");
    }

    await reopened.evaluate(() => {
      SugarCube.State.variables.menuMode = "home";
      SugarCube.setup.persistProgress();
      SugarCube.Engine.play("Game");
    });
    await reopened.locator('[data-menu-action="archive"]').click();
    await reopened.getByRole("button", { name: "第一学院" }).click();
    body = await reopened.locator("body").innerText();
    if (!body.includes("自动存档")) {
      throw new Error("archive sidebar did not show auto save");
    }

    await reopened.getByRole("button", { name: "自动存档" }).click();
    await reopened.locator(".command-input-wrap input").waitFor({ state: "visible" });
    await runCommand(reopened, "doc");
    body = await reopened.locator("body").innerText();
    if (!body.includes("nt-014-badge")) {
      throw new Error("doc list did not include unlocked archive");
    }
    if (body.includes("help: 查询指令")) {
      throw new Error("command screens should refresh instead of appending history");
    }

    await runCommand(reopened, "reset");
    await reopened.waitForFunction(() => SugarCube.State.variables.introCompleted === false);
    await reopened.locator(".intro-shell").waitFor({ state: "visible" });
    await reopened.waitForFunction(() => document.body.innerText.includes("欢迎来到"));
    if (errors.length) {
      throw new Error(errors.join("\n"));
    }

    console.log("Smoke test passed.");
  } finally {
    await browser.close();
    server.close();
  }
})();
