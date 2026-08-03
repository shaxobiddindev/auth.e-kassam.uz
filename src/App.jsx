import { useState, useRef, useEffect } from "react";
import { API_BASE, APP_URL, ADMIN_URL, getDeviceId, LOGO_URL } from "./config";

/* ══════════════════════════════════════════════════════════════════════════
   Kirish ekrani — 05-AUTH.md

   Xatti-harakat qoidalari:
     · Login maydoni AVTOMATIK fokusda — kassir sichqonchaga tegmasin
     · Enter formani yuboradi
     · Parol ko'rsatish tugmasi bor
     · Yuborilayotganda tugma o'lchami O'ZGARMAYDI
     · Xato: aniq matn + 6px silkinish, BIR MARTA
     · Autofill ishlaydi (autocomplete="username" / "current-password")
   ══════════════════════════════════════════════════════════════════════════ */

/** Xato hech qachon uzr so'ramaydi va hech qachon noaniq bo'lmaydi. */
function humanError(status, message) {
  if (status === 401 || status === 403) return "Login yoki parol noto'g'ri";
  if (status === 423) return "Hisob 15 daqiqaga bloklandi. Egangizga murojaat qiling.";
  if (status === 429) return "Juda ko'p urinish. Bir necha daqiqadan keyin qayta urining.";
  if (status === 0)   return "Serverga ulanib bo'lmadi. Internetni tekshiring.";
  return message || "Kirishda xatolik yuz berdi";
}

async function post(path, body, extraHeaders = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      credentials: "include",           // refresh token httpOnly cookie'da keladi
      headers: { "Content-Type": "application/json", ...extraHeaders },
      body: JSON.stringify(body),
    });
  } catch (_) {
    const e = new Error(humanError(0)); e.status = 0; throw e;
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(humanError(res.status, json.message)); e.status = res.status; throw e;
  }
  return json;
}

async function get(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Device-Id": getDeviceId(),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Xatolik: ${res.status}`);
  return json;
}

// ── Logout bo'lganda localStorage tozalash va URL tozalash ──
const _lp = new URLSearchParams(window.location.search);
if (_lp.get("logged_out") === "1") {
  const dev = localStorage.getItem("ek_deviceId");   // qurilma identifikatori saqlanadi
  localStorage.clear();
  if (dev) localStorage.setItem("ek_deviceId", dev);
  window.history.replaceState({}, "", window.location.pathname);
}

function redirectWithToken({ type, accessToken, refreshToken, username, fullName, role, shopCode }) {
  const params = new URLSearchParams({
    token:    accessToken,
    refresh:  refreshToken || "",
    type,
    username: username || "",
    fullName: fullName || username || "",
    role:     role || "",
    // Refresh token shu deviceId ga bog'langan. localStorage origin ga xos,
    // shuning uchun uni maqsad domenga o'zimiz uzatamiz.
    deviceId: getDeviceId(),
  });
  if (shopCode) params.set("shopCode", shopCode);
  const dest = type === "admin" ? ADMIN_URL : APP_URL;
  window.location.replace(`${dest}?auth=${encodeURIComponent(params.toString())}`);
}

export default function App() {
  const [tab, setTab]           = useState("user");
  const [form, setForm]         = useState({ shopCode: "", username: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [shake, setShake]       = useState(0);   // har xatoda ortadi → bir martalik silkinish
  const [showPass, setShowPass] = useState(false);
  const [leaving, setLeaving]   = useState(false);

  const firstFieldRef = useRef(null);
  const errorRef      = useRef(null);

  // Login maydoni avtomatik fokusda — kassir sichqonchaga tegmasin
  useEffect(() => { firstFieldRef.current?.focus(); }, [tab]);

  const set = (k) => (e) => { setError(""); setForm((p) => ({ ...p, [k]: e.target.value })); };

  const fail = (msg) => { setError(msg); setShake((n) => n + 1); setLoading(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (tab === "user" && !form.shopCode.trim()) return fail("Do'kon kodini kiriting");
    if (!form.username.trim())                   return fail("Foydalanuvchi nomini kiriting");
    if (!form.password)                          return fail("Parolni kiriting");

    setLoading(true);
    try {
      if (tab === "admin") {
        const r1 = await post("/auth/admin/login",
          { username: form.username.trim(), password: form.password },
          { "X-Device-Id": getDeviceId() });
        const me = await get("/auth/admin/me", r1.data.accessToken).catch(() => ({ data: {} }));
        setLeaving(true);
        redirectWithToken({
          type: "admin",
          accessToken:  r1.data.accessToken,
          refreshToken: r1.data.refreshToken,
          username: me.data?.username || me.data?.login || form.username.trim(),
          fullName: me.data?.fullName || me.data?.name  || form.username.trim(),
          role:     me.data?.role || "SUPER_ADMIN",
        });
      } else {
        const r1 = await post("/auth/login",
          { shopCode: form.shopCode.trim(), username: form.username.trim(), password: form.password },
          { "X-Device-Id": getDeviceId() });
        let meData = {};
        try { meData = (await get("/auth/me", r1.data.accessToken)).data || {}; } catch (_) {}
        const roles = meData.roles || r1.data?.roles || [];
        const roleStr = roles.map((r) => r?.type || r?.name || String(r || "")).filter(Boolean).join(",");
        setLeaving(true);
        redirectWithToken({
          type: "user",
          accessToken:  r1.data.accessToken,
          refreshToken: r1.data.refreshToken,
          username: meData.username || r1.data?.username || form.username.trim(),
          fullName: meData.fullName || r1.data?.fullName || form.username.trim(),
          role: roleStr,
          shopCode: form.shopCode.trim(),
        });
      }
    } catch (err) {
      fail(err.message);
      errorRef.current?.focus?.();
    }
  };

  const isAdmin = tab === "admin";

  return (
    <div className="auth">
      {/* ══ CHAP: forma ══ */}
      <div className="auth__form-side">
        {/* Muvaffaqiyatli kirishda forma scale(.98)+opacity 0 → yo'naltirish.
            Sekin animatsiya bilan kutdirilmaydi. */}
        <form
          className="auth__form"
          onSubmit={handleSubmit}
          style={leaving
            ? { opacity: 0, transform: "scale(.98)", transition: "opacity var(--dur-base) var(--ease-in), transform var(--dur-base) var(--ease-in)" }
            : undefined}
        >
          <img src={LOGO_URL} alt="e-Kassam" className="auth__logo ek-in-fade"
               onError={(e) => { e.target.style.display = "none"; }} />

          <h1 className="auth__title ek-in-up" style={{ animationDelay: "60ms" }}>Xush kelibsiz</h1>
          <p className="auth__sub ek-in-up" style={{ animationDelay: "120ms" }}>
            Do'koningizni boshqarish uchun tizimga kiring
          </p>

          <div className="auth__seg" role="tablist" aria-label="Kirish turi">
            {[
              { k: "user",  icon: "fa-store",         label: "Do'kon xodimi" },
              { k: "admin", icon: "fa-shield-halved", label: "Admin" },
            ].map(({ k, icon, label }) => (
              <button
                key={k} type="button" role="tab"
                aria-selected={tab === k}
                onClick={() => { setTab(k); setError(""); }}
              >
                <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} aria-hidden="true" />{label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <div className="auth__note">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
              Faqat tizim administratorlari uchun
            </div>
          )}

          {!isAdmin && (
            <div className="auth__field">
              <label className="auth__label" htmlFor="shopCode">Do'kon kodi</label>
              <input
                id="shopCode" ref={firstFieldRef}
                className="auth__input"
                value={form.shopCode} onChange={set("shopCode")}
                placeholder="baraka-shop" autoComplete="organization"
                aria-invalid={!!error || undefined}
                aria-describedby={error ? "auth-error" : undefined}
              />
            </div>
          )}

          <div className="auth__field">
            <label className="auth__label" htmlFor="username">Login</label>
            <input
              id="username"
              ref={isAdmin ? firstFieldRef : undefined}
              className="auth__input"
              value={form.username} onChange={set("username")}
              placeholder="username" autoComplete="username"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "auth-error" : undefined}
            />
          </div>

          <div className="auth__field">
            <label className="auth__label" htmlFor="password">Parol</label>
            <div className="auth__input-wrap">
              <input
                id="password"
                className="auth__input auth__input--pass"
                type={showPass ? "text" : "password"}
                value={form.password} onChange={set("password")}
                placeholder="••••••••" autoComplete="current-password"
                aria-invalid={!!error || undefined}
                aria-describedby={error ? "auth-error" : undefined}
              />
              <button type="button" className="auth__eye"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? "Parolni yashirish" : "Parolni ko'rsatish"}
                aria-pressed={showPass}>
                <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {error && (
            <div
              id="auth-error" ref={errorRef} tabIndex={-1}
              key={shake}                       /* har xatoda qayta o'rnatiladi → bir marta silkinadi */
              className="auth__error ek-shake"
              role="alert" aria-live="assertive"
            >
              <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 2 }} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Tugma o'lchami yuklanishda o'zgarmaydi — matn o'rnini spinner egallaydi */}
          <button type="submit" disabled={loading}
            className={`auth__submit ${isAdmin ? "auth__submit--admin" : ""}`}>
            {loading
              ? <><span className="ek-spinner" aria-hidden="true" /> Tekshirilmoqda…</>
              : <><i className={`fa-solid ${isAdmin ? "fa-shield-halved" : "fa-right-to-bracket"}`} aria-hidden="true" />
                  {isAdmin ? "Admin sifatida kirish" : "Kirish"}</>}
          </button>

          <p className="auth__foot">
            Kirganingizdan so'ng{" "}
            <strong>{isAdmin ? "admin.e-kassam.uz" : "app.e-kassam.uz"}</strong> ga yo'naltirilasiz
          </p>
        </form>
      </div>

      {/* ══ O'NG: ko'k panel — mobilda yo'qoladi ══ */}
      <aside className="auth__brand-side" aria-hidden="true">
        <div className="auth__brand-inner">
          <div className="auth__brand-eyebrow">e-Kassam</div>
          <div className="auth__brand-title">
            Do'koningiz bugun qancha ishladi —<br />bir qarashda ko'ring
          </div>

          <div className="auth__receipt ek-tear ek-in-up" style={{ animationDelay: "180ms" }}>
            <div className="auth__receipt-head">
              <span>Bugun · 14:32</span>
              <span>Kassa №1</span>
            </div>
            <div className="auth__receipt-label">Bugungi tushum</div>
            <div className="auth__receipt-total">4 218 000</div>
            <div className="auth__receipt-row"><span>Sotuvlar</span><b>128</b></div>
            <div className="auth__receipt-row"><span>O'rtacha chek</span><b>32 950</b></div>
            <div className="auth__receipt-row"><span>Naqd / Karta</span><b>61% / 39%</b></div>
          </div>

          <ul className="auth__points">
            <li><i className="fa-solid fa-wifi" aria-hidden="true" />Internet uzilsa savdo to'xtamaydi — sotuvlar qurilmada saqlanadi</li>
            <li><i className="fa-solid fa-boxes-stacked" aria-hidden="true" />Qoldiq tugashidan oldin bildirishnoma keladi</li>
            <li><i className="fa-solid fa-lock" aria-hidden="true" />Har bir amal jurnalga yoziladi</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
