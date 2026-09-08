/* ══════════════════════════════════════════════════════════════════════════
   KIRISH EKRANIDA IKKITA MAYDON (V98)

   ═══ NEGA QO'RIQCHI KERAK ═════════════════════════════════════════════

   Ekran uchta maydon so'rardi: DO'KON KODI, login, parol. Uchinchisi
   ortiqcha edi va buni kodning o'zi isbotlaydi:

     · `users_username_key UNIQUE (username)` — login BUTUN TIZIM
       bo'yicha noyob (V1, V3);
     · `assertUsernameFree` yangi xodimni do'kon FILTRISIZ tekshiradi
       (`UserAdminService`, `SignupService`), ustiga `admins` bilan
       birga;
     · `users.shop_id NOT NULL` — bitta login, bitta do'kon.

   Ya'ni login o'zi do'konni aniqlaydi.

   ⚠ MAYDON O'CHIRILMADI, YASHIRILDI — «Do'kon kodi bilan kirish»
   havolasi ortida. Eski bazada faqat harfi bilan farq qiladigan
   loginlar bo'lishi mumkin («Kassir» va «kassir» ikki do'konda) va
   ular uchun bu yagona yo'l. Server sababni AYTMAYDI — hisob
   mavjudligini oshkor qilmaslik uchun — demak yo'l ekranda hammaga
   ko'rinib turishi SHART.

   Bu qo'riqchi uchta narsani qulflaydi:

     1. odatiy holatda do'kon kodi maydoni YO'Q;
     2. havola bosilsa u PAYDO BO'LADI (yo'l yopilib qolmagan);
     3. qurilma eslab qolgan hisob kartochkada KO'RINADI va parol
        maydoni fokusda bo'ladi.

   Ishga tushirish:  node scripts/check-login.mjs
   ══════════════════════════════════════════════════════════════════════════ */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = 4644;
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

let bad = 0;
const ok   = (m) => console.log(`  ✅ ${m}`);
const fail = (m) => { bad++; console.log(`  ❌ ${m}`); };

async function open(seed) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  if (seed) {
    await page.evaluateOnNewDocument((v) => {
      try { localStorage.setItem("ek_lastLogin", JSON.stringify(v)); } catch (_) {}
    }, seed);
  }
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle2", timeout: 30_000 });
  return page;
}

const has = (page, sel) => page.$(sel).then((el) => !!el);

/* ── 1. Odatiy holat: do'kon kodi so'ralmaydi ─────────────────────────── */
console.log("\n══ Kirish ekrani ══");
{
  const page = await open(null);

  if (await has(page, "#shopCode")) fail("do'kon kodi maydoni odatiy holatda ko'rinyapti");
  else ok("do'kon kodi maydoni yo'q");

  const fields = await page.$$eval("form input:not([type=hidden])",
    (els) => els.filter((e) => e.offsetParent !== null).length);
  if (fields === 2) ok(`ekranda ${fields} ta maydon — login va parol`);
  else fail(`ekranda ${fields} ta maydon, 2 ta bo'lishi kerak`);

  const focused = await page.evaluate(() => document.activeElement?.id || "");
  if (focused === "username") ok("fokus login maydonida");
  else fail(`fokus «${focused}» da, «username» da bo'lishi kerak`);

  await page.close();
}

/* ── 2. Havola do'kon kodini QAYTARADI ────────────────────────────────── */
console.log("\n══ «Do'kon kodi bilan kirish» ══");
{
  const page = await open(null);

  const link = await page.$$eval("button.auth__link",
    (els) => els.findIndex((e) => /do'kon kodi|shop code|кодом магазина/i.test(e.textContent)));
  if (link < 0) {
    fail("havola topilmadi — eski hisoblar uchun chiqish yo'li yopiq");
  } else {
    ok("havola ekranda");
    await page.$$eval("button.auth__link", (els, i) => els[i].click(), link);
    await new Promise((r) => setTimeout(r, 250));
    if (await has(page, "#shopCode")) ok("bosilgach do'kon kodi maydoni ochildi");
    else fail("havola bosildi, lekin maydon ochilmadi");
  }
  await page.close();
}

/* ── 3. Qurilma eslab qoladi ──────────────────────────────────────────── */
console.log("\n══ Eslab qolingan hisob ══");
{
  const page = await open({ shopCode: "baraka", shopName: "Baraka Shop", username: "kassir7" });

  const card = await page.$eval(".auth__known", (el) => el.innerText).catch(() => "");
  if (card.includes("Baraka Shop")) ok("do'kon NOMI ekranda");
  else fail(`do'kon nomi ko'rinmadi: «${card}»`);
  if (card.includes("kassir7")) ok("login ekranda");
  else fail(`login ko'rinmadi: «${card}»`);

  const user = await page.$eval("#username", (el) => el.value).catch(() => "");
  if (user === "kassir7") ok("login maydoni to'ldirilgan");
  else fail(`login maydonida «${user}»`);

  const focused = await page.evaluate(() => document.activeElement?.id || "");
  if (focused === "password") ok("fokus PAROLDA — kassir faqat parolini teradi");
  else fail(`fokus «${focused}» da, «password» da bo'lishi kerak`);

  /* «Boshqa hisob» xotirani tozalasin. */
  const other = await page.$$eval(".auth__known button.auth__link", (els) => els.length);
  if (other !== 1) {
    fail("«Boshqa hisob» tugmasi topilmadi");
  } else {
    await page.click(".auth__known button.auth__link");
    await new Promise((r) => setTimeout(r, 250));
    const stored = await page.evaluate(() => localStorage.getItem("ek_lastLogin"));
    const left = await page.$eval("#username", (el) => el.value).catch(() => "x");
    if (!stored && left === "") ok("«Boshqa hisob» xotirani va maydonni tozaladi");
    else fail(`tozalanmadi (xotira: ${stored}, login: «${left}»)`);
  }
  await page.close();
}

await browser.close();
server.close();

console.log(bad ? `\n❌ ${bad} ta nosozlik\n` : "\n✅ kirish ekrani: ikkita maydon, yo'llar joyida\n");
process.exit(bad ? 1 : 0);
