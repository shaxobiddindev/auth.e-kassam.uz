/* ══════════════════════════════════════════════════════════════════════════
   QAYSI YOZUV HAQIQATAN KERAK — yagona manba (V69)

   `trim-locales.mjs` (tozalaydi) va `check-locales.mjs` (tekshiradi)
   IKKALASI ham shu yerdan o'qiydi. Ikki joyda ikki xil qoida bo'lsa,
   tozalagich o'chirgan kalitni tekshirgich «kerak» deb qaytarardi va
   ikkalasi bir-biri bilan urishardi.
   ══════════════════════════════════════════════════════════════════════════ */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

/**
 * `main.jsx` dan boshlab HAQIQATAN yuklanadigan fayllar.
 *
 * ⚠ Papkani ko'r-ko'rona o'qish YARAMAYDI: `src/` da hech kim import
 * qilmaydigan fayllar bor (`Kpi.jsx`, `Loading.jsx`, `ek-format.js`…) —
 * ular bundle'ga umuman tushmaydi. Ularni «tirik» deb sanash o'sha
 * fayllardagi yozuvlarni ham abadiy saqlab qolardi.
 */
export function liveFiles() {
  const seen = new Set();
  const resolve = (from, spec) => {
    if (!spec.startsWith(".")) return null;
    const base = path.resolve(path.dirname(from), spec);
    for (const c of [base, base + ".js", base + ".jsx", base + "/index.js", base + "/index.jsx"]) {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    }
    return null;
  };
  (function walk(f) {
    if (seen.has(f)) return;
    seen.add(f);
    for (const m of fs.readFileSync(f, "utf8").matchAll(/from\s+"([^"]+)"/g)) {
      const r = resolve(f, m[1]);
      if (r) walk(r);
    }
  })(path.join(ROOT, "src/main.jsx"));
  return [...seen];
}

/** Izohlarni olib tashlaydi — izoh ichidagi misol kalit deb sanalmasin. */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * Kerakli kalitlar va GURUH prefikslari.
 *
 * ⚠ IKKI XIL MANBA BOR va ikkalasi ham hisobga olinishi SHART:
 *
 *   · `t("aniq.kalit")` — to'g'ridan-to'g'ri yoziladi, oson topiladi;
 *   · GURUH — kalit ish paytida quriladi va kodda YOZILMAGAN bo'ladi:
 *       `t(`theme.${v}`)`     — mavzu tanlovi;
 *       `dict("enum.unit",…)` — `ek-labels.js` lug'atlari
 *                               (`enum.unit.KG`, `…KG.short`).
 *     Bunday kalitni «o'lik» deb o'chirish ekranga XOM KALIT chiqarardi.
 */
export function usage() {
  const keys = new Set();
  const groups = new Set();
  for (const f of liveFiles()) {
    const s = strip(fs.readFileSync(f, "utf8"));
    for (const m of s.matchAll(/\bt\(\s*"([^"]+)"/g)) keys.add(m[1]);
    for (const m of s.matchAll(/\bt\(\s*`([a-zA-Z][\w.]*)\.\$\{/g)) groups.add(m[1]);
    for (const m of s.matchAll(/\bdict\(\s*"([^"]+)"/g)) groups.add(m[1]);
  }
  return { keys, groups };
}

/** Shu kalit kerakmi? */
export function isLive({ keys, groups }, key) {
  if (keys.has(key)) return true;
  for (const g of groups) if (key.startsWith(g + ".")) return true;
  return false;
}

export const LOCALES = path.join(ROOT, "src/lib/ek-locales.js");
