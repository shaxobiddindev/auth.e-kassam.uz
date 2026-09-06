/* ══════════════════════════════════════════════════════════════════════════
   O'LIK YOZUVLARNI TOZALASH (V69)

   ═══ MUAMMO ═══════════════════════════════════════════════════════════

   `ek-locales.js` — butun tizimning lug'ati: kassa, ombor, hisobot,
   audit, fiskal, markirovka… Auth ilovasi esa faqat KIRISH va
   RO'YXATDAN O'TISH formasi. Natijada 4 146 kalit qatoridan 3 500 dan
   ortig'i hech qachon ekranga chiqmasdi.

   Va u shunchaki repozitoriyda yotmaydi — HAR BIR TASHRIFCHIGA
   YUKLANADI. `ek-i18n.js` lug'atni STATIK import qiladi, ya'ni uchala
   til ham birinchi so'rovda keladi. Auth — kirish sahifasi, ya'ni
   foydalanuvchi ko'radigan BIRINCHI ekran, ko'pincha mobil internetda.

       o'lik yozuvlar bilan:  363 KB  (gzip 120 KB)
       o'lik yozuvlarsiz:     205 KB  (gzip  65 KB)   −46%

   ⚠ JS byudjeti allaqachon shiftda edi (118/120 KB): keyingi funksiya
   umuman sig'masdi.

   ═══ NEGA QO'LDA KESILMAYDI ═══════════════════════════════════════════

   `ek-locales.js` — MANBA FAYL EMAS: u `packages/ui/` dan
   `sync-tokens.ps1` bilan tarqatiladi. Qo'lda kesilgan fayl keyingi
   sinxronda to'liq holiga qaytardi va hech kim buni sezmasdi.

   Shuning uchun tozalash — SKRIPT: sinxrondan keyin qayta ishga
   tushiriladi. `check-locales.mjs` esa o'lik yozuv qaytib kelganini
   `npm run check` da darhol aytadi.

   Ishga tushirish:  node scripts/trim-locales.mjs
   ══════════════════════════════════════════════════════════════════════════ */
import fs from "node:fs";
import { usage, isLive, LOCALES } from "./locale-usage.mjs";

const u = usage();
const src = fs.readFileSync(LOCALES, "utf8");

/* ⚠ FAYL SARLAVHASI TEGILMAYDI. Unda lug'atning QOIDALARI va — eng
   muhimi — «MANBA FAYL packages/ui/ da» degan eslatma turadi. Birinchi
   urinishda u ham kesilib ketdi (ostida darrov boshqa izoh keladi,
   ya'ni «bo'shab qolgan sarlavha» qoidasiga tushdi) va fayl o'zining
   qayerdan kelishini aytmay qoldi. */
const head = src.indexOf("const uz");
const header = head > 0 ? src.slice(0, head) : "";
const lines = src.slice(head > 0 ? head : 0).split("\n");

const KEY = /^\s*"([^"]+)"\s*:/;
let dropped = 0;
let kept = 0;

/* 1-o'tish: o'lik kalit qatorlarini belgilaymiz. */
const alive = lines.map((l) => {
  const m = l.match(KEY);
  if (!m) return true;
  if (isLive(u, m[1])) { kept++; return true; }
  dropped++;
  return false;
});

/* 2-o'tish: BO'SHAB QOLGAN bo'lim izohlarini olib tashlaymiz.
   ⚠ Izohning o'zi qolib, ostidagi kalitlar ketsa, faylda «SOTUVLAR»
   degan sarlavha ostida hech narsa bo'lmasdi — o'quvchi uni yo'qolgan
   deb o'ylardi. */
const out = [];
for (let i = 0; i < lines.length; i++) {
  if (!alive[i]) continue;
  if (/^\s*\/\*/.test(lines[i])) {
    /* Izoh bloki qayerda tugaydi? */
    let end = i;
    while (end < lines.length && !/\*\//.test(lines[end])) end++;
    /* Undan keyin tirik kalit bormi (keyingi izohgacha)? */
    let has = false;
    for (let j = end + 1; j < lines.length; j++) {
      if (/^\s*\/\*/.test(lines[j])) break;
      if (KEY.test(lines[j])) { if (alive[j]) { has = true; } continue; }
      if (/^\s*\}/.test(lines[j])) break;
    }
    if (!has) { i = end; continue; }
    for (let j = i; j <= end; j++) out.push(lines[j]);
    i = end;
    continue;
  }
  out.push(lines[i]);
}

/* Ketma-ket bo'sh qatorlarni bittaga siqamiz. */
const tidy = out.filter((l, i) => !(l.trim() === "" && out[i - 1]?.trim() === ""));

const NOTE = `/* ⚠ BU FAYL KESILGAN — \`scripts/trim-locales.mjs\`.

   To'liq lug'at butun tizimniki (kassa, ombor, hisobot, audit…), auth
   esa faqat kirish va ro'yxatdan o'tish formasi. Kesilmagan holda
   3 651 ortiqcha kalit qatori HAR BIR TASHRIFCHIGA yuklanardi
   (gzip'da ~55 KB, bundle'ning yarmi) — auth esa foydalanuvchi
   ko'radigan BIRINCHI ekran.

   \`packages/ui\` dan sinxrondan KEYIN qayta ishga tushiring:
       npm run trim
   \`npm run check\` esa kesish kerakligini o'zi aytadi. */

`;

fs.writeFileSync(LOCALES, header + NOTE + tidy.join("\n"));
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0);
console.log(`  qoldirildi: ${kept} kalit qatori`);
console.log(`  o'chirildi: ${dropped} kalit qatori`);
console.log(`  fayl: ${kb(src)} KB → ${kb(header + NOTE + tidy.join("\n"))} KB`);
