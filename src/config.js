// ╔══════════════════════════════════════════════════════════════╗
// ║           BARCHA URL VA SOZLAMALAR SHU YERDA               ║
// ║   Deployment uchun faqat DOMAIN ni o'zgartiring            ║
// ╚══════════════════════════════════════════════════════════════╝


// `npm run dev` → LOCALHOST, `npm run build` → PRODUCTION (avtomatik).
// Boshqa qiymat kerak bo'lsa .env faylida VITE_* ni bering.
const PROD = import.meta.env.PROD;

export const API_BASE  = import.meta.env.VITE_API_BASE
  ?? (PROD ? `https://api.e-kassam.uz/api` : `http://localhost:8080/api`);
export const APP_URL   = import.meta.env.VITE_APP_URL
  ?? (PROD ? `https://app.e-kassam.uz`     : `http://localhost:5173`);
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL
  ?? (PROD ? `https://admin.e-kassam.uz`   : `http://localhost:5174`);

// ── Brend fayllari ────────────────────────────────────────────
// SVG — rastr emas: har qanday ekranda aniq va ~20 barobar yengil.
// Fayllar packages/brand/logo/ dan sync-tokens.ps1 orqali public/ ga tushadi.
export const LOGO_URL      = "/lockup-light.svg";   // yorug' fonda (oq plastinka)
export const LOGO_DARK_URL = "/lockup-dark.svg";    // qorong'i panelda
export const MARK_URL      = "/mark-color.svg";     // yolg'iz belgi, 32px+
export const MARK_SMALL_URL= "/mark-small.svg";     // 32px dan kichik

// ── localStorage kalitlari ─────────────────────────────────────
export const K = {
  token:    "ek_token",
  refresh:  "ek_refresh",
  type:     "ek_type",      // "admin" | "user"
  username: "ek_username",
  fullName: "ek_fullName",
  role:     "ek_role",
  shopCode: "ek_shopCode",
  deviceId: "ek_deviceId",
  /* ⚠ QURILMA XOTIRASI (V98) — kirish ekrani uchun.
     Monoblok bir yil davomida bitta do'konda tursa ham forma har
     safar bo'sh ochilardi. `{ shopCode, shopName, username }` shu
     yerda saqlanadi va keyingi safar ekranda «Baraka Shop — kassir»
     turadi, faqat PAROL so'raladi.

     ⚠ PAROL SAQLANMAYDI va hech qachon saqlanmaydi. Bu xotira —
     QULAYLIK, himoya emas: uni bilgan odam baribir parolsiz kira
     olmaydi. */
  lastLogin: "ek_lastLogin",
};

/**
 * Oxirgi muvaffaqiyatli kirish — shu qurilmada.
 *
 * ⚠ `try/catch`: shaxsiy oynada yoki saqlash o'chirilgan brauzerda
 * `localStorage` ning O'ZI istisno tashlaydi va kirish sahifasi
 * umuman ochilmasdi.
 */
export function readLastLogin() {
  try {
    const raw = localStorage.getItem(K.lastLogin);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && typeof v === "object" && v.username ? v : null;
  } catch (_) { return null; }
}

export function saveLastLogin(v) {
  try {
    if (v && v.username) localStorage.setItem(K.lastLogin, JSON.stringify({
      shopCode: v.shopCode || "", shopName: v.shopName || "", username: v.username,
    }));
  } catch (_) { /* xotira yo'q — qulaylik yo'qoladi, kirish ishlayveradi */ }
}

export function clearLastLogin() {
  try { localStorage.removeItem(K.lastLogin); } catch (_) { /* yuqoridagi sabab */ }
}

// ── Yordamchi funksiyalar ──────────────────────────────────────
export function getDeviceId() {
  let id = localStorage.getItem(K.deviceId);
  if (!id) {
    id = "web-" + Math.random().toString(36).slice(2, 12);
    localStorage.setItem(K.deviceId, id);
  }
  return id;
}

export const money = (n) =>
  new Intl.NumberFormat("uz-UZ").format(Number(n) || 0) + " so'm";

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("uz-UZ") : "—";

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("uz-UZ") : "—";

export const initials = (s = "") =>
  (s || "").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
