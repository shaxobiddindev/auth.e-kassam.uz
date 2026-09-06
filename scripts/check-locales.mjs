/* ══════════════════════════════════════════════════════════════════════════
   YOZUVLAR TEKSHIRUVI (V69)

   ⚠ BU TEKSHIRUV `trim-locales.mjs` NI QO'RIQLAYDI. `ek-locales.js`
   manba fayl EMAS — u `packages/ui/` dan `sync-tokens.ps1` bilan
   tarqatiladi. Sinxrondan keyin fayl to'liq holiga qaytadi va o'lik
   yozuvlar (3 651 qator, gzip'da ~55 KB) yana bundle'ga kiradi.

   Sinxron aybdor emas — uni ESLATIB TURADIGAN narsa yo'q edi. Endi
   bor: `npm run check` yiqiladi va yechim bitta buyruq —
   `node scripts/trim-locales.mjs`.

   Uch shart tekshiriladi:
     1. kodda ishlatiladigan har bir kalit lug'atda BOR
        (yo'qi ekranda XOM KALIT bo'lib chiqadi);
     2. lug'atda ortiqcha (hech qayerda ishlatilmaydigan) kalit YO'Q;
     3. uchala til bir xil to'plamda
        (kalit bir tilda yo'q bo'lsa, o'sha tildagi ekranda o'zbekcha
        matn chiqadi va buni hech kim sezmaydi).

   Ishga tushirish:  node scripts/check-locales.mjs
   ══════════════════════════════════════════════════════════════════════════ */
import { usage, isLive, LOCALES } from "./locale-usage.mjs";

const DICT = (await import(LOCALES)).default;
const u = usage();
let bad = 0;
const ok = (m) => console.log("  ✅ " + m);
const no = (m, list) => {
  bad++;
  console.log("  ❌ " + m);
  if (list?.length) console.log("     " + list.slice(0, 12).join(", ")
    + (list.length > 12 ? ` … (jami ${list.length})` : ""));
};

const langs = Object.keys(DICT);
const uz = Object.keys(DICT.uz);

console.log("\n═══ 1. Kodda ishlatiladigan kalit lug'atda bor ═══");
{
  const missing = [...u.keys].filter((k) => !DICT.uz[k]);
  /* ⚠ YECHIM — KESISH EMAS, TIKLASH. Kalit yo'q bo'lsa ekranda xom
     kalit chiqadi («login.welcome»). Odatda sabab bitta: ilgari hech
     kim import qilmaydigan fayl endi ishlatilyapti va uning
     yozuvlari kesilgan edi. Kerakli qatorlarni `packages/ui/` dagi
     to'liq lug'atdan ko'chiring. */
  missing.length ? no("lug'atda yo'q — ekranda xom kalit chiqadi "
                    + "(`packages/ui/` dagi to'liq lug'atdan ko'chiring)", missing)
                 : ok(`${u.keys.size} ta kalit joyida`);
}

console.log("\n═══ 2. Ortiqcha yozuv yo'q ═══");
{
  const dead = uz.filter((k) => !isLive(u, k));
  dead.length
    ? no(`${dead.length} ta o'lik yozuv — «node scripts/trim-locales.mjs» ni ishga tushiring`, dead)
    : ok(`${uz.length} ta yozuvning hammasi ishlatiladi`);
}

console.log("\n═══ 3. Uchala til mos ═══");
{
  const set = new Set(uz);
  let diff = 0;
  for (const l of langs.filter((x) => x !== "uz")) {
    const k = Object.keys(DICT[l]);
    const miss = uz.filter((x) => !DICT[l][x]);
    const extra = k.filter((x) => !set.has(x));
    if (miss.length || extra.length) {
      diff++;
      no(`${l}: yo'q ${miss.length}, ortiqcha ${extra.length}`, [...miss, ...extra]);
    }
  }
  if (!diff) ok(`uchala til ham ${uz.length} kalit`);
}

console.log(bad ? `\n❌ Yozuvlar: ${bad} ta muammo\n` : "\n✅ Yozuvlar: hammasi joyida\n");
process.exit(bad ? 1 : 0);
