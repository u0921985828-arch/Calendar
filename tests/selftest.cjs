// Ejecuta el auto-test in-app de public/demo.html en Chromium headless y
// falla (exit 1) si no pasan todas las aserciones. Sirve como prueba e2e en CI.
// Requiere: npm i playwright  +  npx playwright install chromium
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..", "public");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};
const PORT = 8199;

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/demo.html";
  const f = path.join(ROOT, p);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "text/plain" });
    res.end(d);
  });
});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 820 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(`http://localhost:${PORT}/demo.html?selftest`, { waitUntil: "load" });
  await page.waitForFunction("window.__selftest", null, { timeout: 15000 }).catch(() => {});
  const r = await page.evaluate(() => window.__selftest || null);
  const panel = await page.evaluate(() => {
    const s = document.querySelector(".selftest");
    return s ? s.innerText : "(sin panel)";
  });
  console.log(panel);
  if (errs.length) console.log("ERRORES DE PÁGINA:\n" + errs.join("\n"));
  await browser.close();
  await new Promise((r) => server.close(r));

  if (!r || r.pass !== r.total || errs.length) {
    console.error(`FALLO: ${r ? r.pass + "/" + r.total : "sin resultado"}${errs.length ? " · " + errs.length + " errores de página" : ""}`);
    process.exit(1);
  }
  console.log(`OK: ${r.pass}/${r.total} aserciones`);
})().catch((e) => { console.error(e); process.exit(1); });
