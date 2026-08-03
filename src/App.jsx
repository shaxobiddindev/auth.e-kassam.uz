import { useState, useRef, useEffect } from "react";
import { API_BASE, APP_URL, ADMIN_URL, getDeviceId, LOGO_URL, LOGO_DARK_URL } from "./config";
import { t, getLang, useT } from "./lib/ek-i18n";
import ThemeSelect from "./components/ek/ThemeSelect";
import LangSelect from "./components/ek/LangSelect";

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

/**
 * Xato hech qachon uzr so'ramaydi va hech qachon noaniq bo'lmaydi.
 * `t()` — modul funksiyasi, React'dan tashqarida ham joriy tilni oladi.
 */
function humanError(status, message) {
  if (status === 401 || status === 403) return t("login.errBadCredentials");
  if (status === 423) return t("login.errLocked");
  if (status === 429) return t("login.errTooMany");
  if (status === 0)   return t("login.errNetwork");
  return message || t("login.errGeneric");
}

async function post(path, body, extraHeaders = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      credentials: "include",           // refresh token httpOnly cookie'da keladi
      headers: {
        "Content-Type": "application/json",
        // Backend xato xabarlari ham foydalanuvchi tilida kelsin
        "Accept-Language": getLang(),
        ...extraHeaders,
      },
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
      "Accept-Language": getLang(),
      "X-Device-Id": getDeviceId(),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `${t("common.error")}: ${res.status}`);
  return json;
}

// ── Logout bo'lganda localStorage tozalash va URL tozalash ──
const _lp = new URLSearchParams(window.location.search);
if (_lp.get("logged_out") === "1") {
  // Qurilma identifikatori VA til tanlovi saqlanadi: ikkalasi ham sessiyaga
  // emas, brauzerga tegishli. Tilni o'chirsak, chiqqan foydalanuvchi kirish
  // ekranini yana o'zbekchada ko'rardi.
  const dev  = localStorage.getItem("ek_deviceId");
  const lang = localStorage.getItem("ek_lang");
  localStorage.clear();
  if (dev)  localStorage.setItem("ek_deviceId", dev);
  if (lang) localStorage.setItem("ek_lang", lang);
  // `lang` parametri URL da qolsa `initLang` uni o'qib bo'lgan — endi tozalasa bo'ladi
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

  // Til `auth` blobi ICHIDA emas, ALOHIDA parametr sifatida uzatiladi:
  // maqsad ilovada `initLang()` uni `location.search` dan o'qiydi va bu
  // React ko'tarilishidan oldin bo'ladi. Blob ichida bo'lsa birinchi kadr
  // noto'g'ri tilda chizilardi. deviceId bilan bir xil sabab — originlar
  // turli, localStorage bo'linmaydi (09-CHETLANISHLAR.md §6).
  window.location.replace(
    `${dest}?auth=${encodeURIComponent(params.toString())}&lang=${getLang()}`
  );
}

export default function App() {
  const { t } = useT();
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
    if (tab === "user" && !form.shopCode.trim()) return fail(t("login.needShopCode"));
    if (!form.username.trim())                   return fail(t("login.needUsername"));
    if (!form.password)                          return fail(t("login.needPassword"));

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
      {/* Ko'rinish rejimi va til — kirish ekranida ham bor: kassir smenani
          kechqurun boshlaydi va yorug' ekran charchatadi; til esa kirishdan
          OLDIN tanlanishi kerak, aks holda forma tushunarsiz bo'lishi mumkin. */}
      <div className="auth__theme">
        <LangSelect />
        <ThemeSelect />
      </div>

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
          {/* Logotip temaga qarab almashadi — so'z belgisi to'q siyoh rangida */}
          <img src={LOGO_URL} alt="e-Kassam" className="auth__logo logo--light ek-in-fade"
               onError={(e) => { e.target.style.display = "none"; }} />
          <img src={LOGO_DARK_URL} alt="" aria-hidden="true" className="auth__logo logo--dark ek-in-fade"
               onError={(e) => { e.target.style.display = "none"; }} />

          <h1 className="auth__title ek-in-up" style={{ animationDelay: "60ms" }}>{t("login.welcome")}</h1>
          <p className="auth__sub ek-in-up" style={{ animationDelay: "120ms" }}>
            {t("login.subtitle")}
          </p>

          <div className="auth__seg" role="tablist" aria-label={t("login.tabType")}>
            {[
              { k: "user",  icon: "fa-store",         label: t("login.tabUser") },
              { k: "admin", icon: "fa-shield-halved", label: t("login.tabAdmin") },
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
              {t("login.adminNote")}
            </div>
          )}

          {!isAdmin && (
            <div className="auth__field">
              <label className="auth__label" htmlFor="shopCode">{t("login.shopCode")}</label>
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
            <label className="auth__label" htmlFor="username">{t("login.login")}</label>
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
            <label className="auth__label" htmlFor="password">{t("login.password")}</label>
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
                aria-label={showPass ? t("login.hidePassword") : t("login.showPassword")}
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
              ? <><span className="ek-spinner" aria-hidden="true" /> {t("common.checking")}</>
              : <><i className={`fa-solid ${isAdmin ? "fa-shield-halved" : "fa-right-to-bracket"}`} aria-hidden="true" />
                  {isAdmin ? t("login.submitAdmin") : t("login.submit")}</>}
          </button>

          <p className="auth__foot">
            {t("login.redirectNote", {
              host: isAdmin ? "admin.e-kassam.uz" : "app.e-kassam.uz",
            })}
          </p>
        </form>
      </div>

      {/* ══ O'NG: ko'k panel — mobilda yo'qoladi ══ */}
      <aside className="auth__brand-side" aria-hidden="true">
        <div className="auth__brand-inner">
          <div className="auth__brand-eyebrow">e-Kassam</div>
          <div className="auth__brand-title">{t("login.brandTitle")}</div>

          <div className="auth__receipt ek-tear ek-in-up" style={{ animationDelay: "180ms" }}>
            <div className="auth__receipt-head">
              <span>{t("login.receiptToday")} · 14:32</span>
              <span>{t("login.receiptRegister")}</span>
            </div>
            <div className="auth__receipt-label">{t("login.receiptLabel")}</div>
            <div className="auth__receipt-total">4 218 000</div>
            <div className="auth__receipt-row"><span>{t("login.receiptSales")}</span><b>128</b></div>
            <div className="auth__receipt-row"><span>{t("login.receiptAvg")}</span><b>32 950</b></div>
            <div className="auth__receipt-row"><span>{t("login.receiptSplit")}</span><b>61% / 39%</b></div>
          </div>

          <ul className="auth__points">
            <li><i className="fa-solid fa-wifi" aria-hidden="true" />{t("login.point1")}</li>
            <li><i className="fa-solid fa-boxes-stacked" aria-hidden="true" />{t("login.point2")}</li>
            <li><i className="fa-solid fa-lock" aria-hidden="true" />{t("login.point3")}</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
