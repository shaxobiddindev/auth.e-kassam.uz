/* ══════════════════════════════════════════════════════════════════════════
   SERVER JAVOBIDAN RO'YXAT — himoya haqiqiymi

   ═══ NEGA KIRISH EKRANIDA BU ALOHIDA OG'IR ════════════════════════════

   `asArray` butun platformada ishlatiladi, lekin bu yerda uning
   yiqilishi eng qimmat: yagona chaqiruv joyi — `App.jsx` dagi KIRISH
   ishlovchisi ichida:

       const roles = asArray(meData.roles || r1.data?.roles);
       const roleStr = roles.map(...)

   Boshqa sahifada `.map is not a function` bitta bo'limni yiqitadi.
   Bu yerda esa istisno kirish ishlovchisining O'RTASIDA bo'ladi:
   tugma aylanaveradi, xato ko'rinmaydi va odam tizimga UMUMAN kira
   olmaydi — kassa ham, ombor ham, admin ham. Ya'ni server `roles` ni
   ro'yxatdan sahifalangan javobga (`{content: [...]}`) o'tkazgan kuni
   butun platforma yopilardi.

   ═══ SINOV IKKI QISMDAN IBORAT ════════════════════════════════════════

     1. `asArray` to'g'ri ishlaydimi — shu fayl;
     2. kod uni HAQIQATAN chaqiradimi — `scripts/check-array.mjs`.

   Ikkinchisisiz birinchisining ma'nosi yo'q: to'g'ri funksiya yozib,
   uni chaqirmaslik hech narsani o'zgartirmaydi.

   Ishga tushirish:  node test/array-guard.test.mjs
   ══════════════════════════════════════════════════════════════════════════ */
import { asArray } from "../src/lib/ek-array.js";

let pass = 0, fail = 0;
const ok  = (m) => { pass++; console.log("  ✅ " + m); };
const bad = (m, got) => { fail++; console.log("  ❌ " + m);
                          if (got !== undefined) console.log("     olindi: " + JSON.stringify(got)); };
const eqArr = (actual, expected, msg) =>
  (JSON.stringify(actual) === JSON.stringify(expected) ? ok(msg) : bad(msg, actual));

console.log("\n══ asArray ══");

eqArr(asArray([{ type: "CASHIER" }]), [{ type: "CASHIER" }], "massiv o'zgarmaydi");
eqArr(asArray(null), [], "null → bo'sh");
eqArr(asArray(undefined), [], "undefined → bo'sh");

/* ⚠ ASOSIY BAND. `|| []` aynan shu yerda ishlamaydi: `{}` truthy va u
   shundoq o'tib ketadi, keyin `.map` kirish ishlovchisini yiqitadi. */
eqArr(asArray({}), [], "bo'sh OBYEKT → bo'sh massiv (`|| []` buni o'tkazib yuborardi)");
eqArr(asArray({ error: "x" }), [], "begona obyekt → bo'sh");
eqArr(asArray("ADMIN"), [], "matn → bo'sh");
eqArr(asArray(0), [], "nol → bo'sh");

/* ⚠ Sahifalangan javob: server `List<Role>` dan `Page<Role>` ga o'tsa,
   kirish TO'XTAMASLIGI kerak — odam haqiqiy rolini olishi kerak. */
eqArr(asArray({ content: [{ type: "ADMIN" }] }), [{ type: "ADMIN" }],
      "sahifalangan javob → ichidagi ro'yxat");
eqArr(asArray({ content: null }), [], "content massiv emas → bo'sh");

/* Natija HAR DOIM massiv — chaqiruvchi tekshirmasdan `.map` qila oladi. */
const always = [[], null, undefined, {}, "x", 5, { content: [] }, [1]]
  .every((v) => Array.isArray(asArray(v)));
always ? ok("natija har doim massiv") : bad("ba'zi kirishda massiv emas");

/* ⚠ KIRISH YO'LINING O'ZI. `App.jsx` roldan satr yasaydi; agar
   `asArray` massiv qaytarmasa shu qator yiqiladi. Shakl serverdan
   har xil keladi — obyekt (`type`/`name`) yoki oddiy satr. */
const roleStr = (data) =>
  asArray(data).map((r) => r?.type || r?.name || String(r || "")).filter(Boolean).join(",");

eqArr(roleStr({ content: [{ type: "ADMIN" }, { name: "CASHIER" }] }), "ADMIN,CASHIER",
      "sahifalangan roldan ham satr chiqadi");
eqArr(roleStr({}), "", "rolsiz javobda bo'sh satr — istisno emas");

console.log(`\n${fail ? "❌" : "✅"} massiv himoyasi: ${pass} o'tdi, ${fail} yiqildi`);
process.exit(fail ? 1 : 0);
