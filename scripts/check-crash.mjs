/* ══════════════════════════════════════════════════════════════════════════
   KIRISH EKRANI HECH QANDAY JAVOBDA YIQILMASIN

   ═══ NEGA BU EKRAN ALOHIDA ════════════════════════════════════════════

   Boshqa ilovalarda yiqilgan sahifa BITTA bo'limni o'chiradi va
   foydalanuvchi boshqasiga o'tadi. Bu yerda esa yiqilish
   **butun platformani** yopadi: kirish ekrani ishlamasa, kassa ham,
   ombor ham, admin paneli ham ochilmaydi. Do'kon savdo qila olmaydi.

   ⚠ Va bu ekran eng ko'p KUTILMAGAN javob oladigan joy: u tizimga
   kirmagan holda ishlaydi, ya'ni server nosozligi, eskirgan API,
   proksi xatosi va HTML qaytargan 502 — hammasi aynan shu yerga
   tushadi.

   ═══ NIMA QILINADI ════════════════════════════════════════════════════

   Ekran to'rt xil «yomon dunyo»da ochiladi:

     1. ro'yxat o'rniga obyekt  → `{ success: true, data: {} }`
     2. server nosozligi        → 500
     3. buzuq javob             → JSON emas (proksi HTML qaytardi)
     4. tarmoq yo'q             → so'rov umuman bajarilmaydi

   Har holatda KIRISH FORMASI joyida bo'lishi shart. Ekran bo'sh
   ko'rinishi yoki xato yozuvi chiqarishi mumkin — bu normal.
   Yo'qolishi mumkin emas.

   ⚠ Sahifaning holatlari ham tekshiriladi: parolni tiklash havolasi
   (`?token=…`) va chiqishdan keyingi qaytish (`?logged_out=1`).
   Ular alohida shox va bir xil xavfga ega.

   Ishga tushirish:  node scripts/check-crash.mjs
   ══════════════════════════════════════════════════════════════════════════ */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = 4643;
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
               ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
               ".json": "application/json", ".woff2": "font/woff2" };

if (!fs.existsSync(DIST)) {
  console.error("dist topilmadi — avval `npm run build`.");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  let file = path.join(DIST, url === "/" ? "index.html" : url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html");
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--no-proxy-server"],
});

/* Server qanday javob berayotgani — har biri haqiqiy nosozlik. */
const WORLDS = {
  "ro'yxat o'rniga obyekt": (r, CORS) =>
    r.respond({ status: 200, contentType: "application/json", headers: CORS,
                body: JSON.stringify({ success: true, data: {} }) }),
  "server nosozligi (500)": (r, CORS) =>
    r.respond({ status: 500, contentType: "application/json", headers: CORS,
                body: JSON.stringify({ success: false, message: "boom" }) }),
  "buzuq javob (JSON emas)": (r, CORS) =>
    r.respond({ status: 200, contentType: "text/html", headers: CORS,
                body: "<html><body>502 Bad Gateway</body></html>" }),
  "tarmoq yo'q": (r) => r.abort("failed"),
};

/* Ekranning shoxlari — har biri alohida yo'l. */
const STATES = {
  "kirish": "/",
  "parolni tiklash": "/?token=abc123&type=admin",
  "chiqishdan keyin": "/?logged_out=1",
};

let bad = 0;

async function visit(stateName, url, worldName, respond) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.setRequestInterception(true);
  page.on("request", (r) => {
    if (!/\/(api|auth)\//.test(r.url()) || r.url().startsWith(`http://127.0.0.1:${PORT}/assets`)) {
      return r.continue();
    }
    const CORS = {
      "Access-Control-Allow-Origin": `http://127.0.0.1:${PORT}`,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers":
        r.headers()["access-control-request-headers"] || "authorization,content-type",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    };
    if (r.method() === "OPTIONS") return r.respond({ status: 204, headers: CORS });
    return respond(r, CORS);
  });

  await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: "networkidle2", timeout: 30_000 });
  await new Promise((r) => setTimeout(r, 600));

  /* ⚠ «Xato yozuvi yo'qmi» EMAS, «forma bormi». Kirish ekranida xato
     yozuvi CHIQISHI KERAK — muhimi, forma qolsin va odam qayta
     urinib ko'ra olsin. */
  const alive = await page.evaluate(() =>
    !!document.querySelector("form") && document.body.innerText.trim().length > 0);
  await page.close();

  const label = `${stateName} · ${worldName}`;
  if (alive) {
    console.log(`  ✅ ${label.padEnd(42)} forma joyida`);
  } else {
    bad++;
    console.log(`  ❌ ${label.padEnd(42)} EKRAN YO'QOLDI`);
  }
}

console.log("\n══ Kirish ekrani yomon javobda ham yiqilmaydi ══");
for (const [stateName, url] of Object.entries(STATES)) {
  for (const [worldName, respond] of Object.entries(WORLDS)) {
    await visit(stateName, url, worldName, respond);
  }
}

await browser.close();
server.close();

if (bad) {
  console.log(`\n❌ ${bad} ta holatda kirish ekrani yo'qoldi.`);
  console.log("   ⚠ Bu bitta sahifa emas: kirish ishlamasa, kassa ham,");
  console.log("   ombor ham, admin paneli ham ochilmaydi.");
  console.log("   Ro'yxatni `asArray(...)` bilan oling (`src/lib/ek-array.js`),");
  console.log("   maydonlarni esa `?.` bilan.");
  process.exit(1);
}
console.log("\n✅ kirish ekrani: hamma holatda tirik");
process.exit(0);
