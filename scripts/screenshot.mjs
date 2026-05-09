// Capture portfolio screenshots from the running dev server.
// Usage: from repo root, with `npm run dev` running →
//   node scripts/screenshot.js
//
// Output → client/public/screenshots/

import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "client", "public", "screenshots");

fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = process.env.SHOT_BASE || "http://localhost:5173";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 2 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2 },
};

const PAGES = [
  { route: "/", file: "01-home", scrollSequence: true },
  { route: "/pricing", file: "02-pricing", scrollSequence: true },
  { route: "/login", file: "03-login" },
  { route: "/register", file: "04-register" },
  { route: "/this-page-doesnt-exist", file: "05-404" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fillGeneratorAndShoot = async (page) => {
  // Try to register a temp user (or login) so we can hit /generator
  const ts = Date.now();
  const email = `demo_${ts}@example.com`;
  const password = "demo12345";

  await page.goto(`${BASE}/register`, { waitUntil: "networkidle2" });
  await page.type('input[name="name"]', "Alex Carter");
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click('button[type="submit"]'),
  ]);

  // Now at /dashboard — go to /generator
  await page.goto(`${BASE}/generator`, { waitUntil: "networkidle2" });
  await sleep(800);

  // Click "Fill sample" pill
  const filled = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => /fill sample|try sample/i.test(b.textContent || ""));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (!filled) {
    console.warn("[screenshot] Could not find sample-fill button");
  }

  await sleep(1500); // let live preview update

  await screenshot(page, "06-generator", "desktop");
  await screenshot(page, "06-generator-dashboard", "desktop", `${BASE}/dashboard`);
};

async function screenshot(page, file, viewport, navigateTo) {
  if (navigateTo) {
    await page.goto(navigateTo, { waitUntil: "networkidle2" });
    await sleep(1000);
  }
  await page.setViewport(VIEWPORTS[viewport]);
  const out = path.join(OUT_DIR, `${file}-${viewport}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log(`  → ${path.relative(ROOT, out)}`);
}

async function fullPageShot(page, file, viewport) {
  await page.setViewport(VIEWPORTS[viewport]);
  const out = path.join(OUT_DIR, `${file}-${viewport}-full.png`);
  await page.screenshot({ path: out, fullPage: true });
  console.log(`  → ${path.relative(ROOT, out)}`);
}

(async () => {
  console.log(`📸 Capturing screenshots from ${BASE}`);
  console.log(`   → ${OUT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath:
      process.env.CHROME_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);

    for (const p of PAGES) {
      console.log(`\n→ ${p.route}`);
      await page.setViewport(VIEWPORTS.desktop);
      await page.goto(`${BASE}${p.route}`, { waitUntil: "networkidle2" });
      await sleep(1200); // let animations settle

      await screenshot(page, p.file, "desktop");
      await fullPageShot(page, p.file, "desktop");
      await screenshot(page, p.file, "mobile");
    }

    console.log(`\n→ Generator + Dashboard (with sample data, requires backend)`);
    try {
      await fillGeneratorAndShoot(page);
    } catch (err) {
      console.warn(`  ⚠ Skipped: ${err.message}`);
    }

    console.log(`\n✓ Done.`);
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
