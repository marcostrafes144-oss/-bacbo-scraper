const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();
app.use(cors());
app.use(express.json());

let results = [];

/**
 * 🔥 SCRAPER BAC BO (ROBUSTO)
 */
async function scrapeBacBo() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.casino.org/casinoscores/pt-br/bac-bo/",
    { waitUntil: "domcontentloaded" }
  );

  await page.waitForTimeout(5000);

  const rawResults = await page.evaluate(() => {
    const text = document.body.innerText || "";

    return text
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean);
  });

  await browser.close();

  const cleaned = rawResults
    .map(t => t.toUpperCase())
    .filter(t =>
      t.includes("BANKER") ||
      t.includes("PLAYER") ||
      t.includes("TIE")
    )
    .map(t => {
      if (t.includes("BANKER")) return "BANKER";
      if (t.includes("PLAYER")) return "PLAYER";
      return "TIE";
    });

  const deduped = cleaned.filter((v, i, arr) =>
    i === 0 ? true : v !== arr[i - 1]
  );

  results = deduped.slice(0, 30).map(r => ({
    result: r,
    timestamp: new Date().toISOString()
  }));
}

/**
 * LOOP AUTOMÁTICO
 */
async function start() {
  await scrapeBacBo();
  setInterval(scrapeBacBo, 8000);
}

start();

/**
 * API ENDPOINTS
 */

app.get("/history", (req, res) => {
  res.json(results);
});

app.get("/stats", (req, res) => {
  const stats = { BANKER: 0, PLAYER: 0, TIE: 0 };

  results.forEach(r => {
    stats[r.result]++;
  });

  res.json(stats);
});

app.get("/status", (req, res) => {
  res.json({
    ok: true,
    total: results.length,
    lastUpdate: new Date().toISOString()
  });
});

/**
 * START SERVER
 */
app.listen(3000, () => {
  console.log("🚀 Bac Bo scraper rodando na porta 3000");
});
