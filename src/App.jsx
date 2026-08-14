import { useState, useRef, useEffect } from "react";
import { API_BASE, APP_URL, ADMIN_URL, getDeviceId, LOGO_URL, LOGO_DARK_URL } from "./config";
import { t, getLang, useT } from "./lib/ek-i18n";
import ThemeSelect from "./components/ek/ThemeSelect";
import LangSelect from "./components/ek/LangSelect";
import { CodeField, UsernameField, OtpField, NameField, PhoneField, EmailField } from "./components/ek/EkFields";

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
    const e = new Error(humanError(res.status, json.message));
    e.status = res.status;
    /* ⚠ Javob tanasi ham ilova qilinadi: 428 da `twoFactorRequired`
       bayrog'i keladi va uni XATO deb ko'rsatib bo'lmaydi — bu «kod
       maydonini oching» degan signal. */
    e.data = json;
    throw e;
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

/* Pochtadagi havola `?token=…&type=admin` bilan keladi — shu bo'lsa
   ekran darhol «yangi parol» ko'rinishida ochiladi. */
const _resetToken = new URLSearchParams(window.location.search).get("token") || "";

/* Ro'yxatdan o'tishni tasdiqlash havolasi `?signup=…` bilan keladi (V31) —
   shu bo'lsa do'kon yaratiladi va odam darhol tizimga kiritiladi.
   `?register=1&plan=…` esa landing'dan: formani ochadi, tarifni oldindan
   tanlab qo'yadi (parametr nomlari ATAYLAB har xil — token bilan
   adashmasin). */
const _signupToken = new URLSearchParams(window.location.search).get("signup") || "";
const _openSignup = new URLSearchParams(window.location.search).get("register") === "1";
const _planParam = (() => {
  const p = new URLSearchParams(window.location.search).get("plan");
  return ["FREE", "BASIC", "PREMIUM"].includes(p) ? p : "FREE";
})();

export default function App() {
  const { t } = useT();
  const [tab, setTab]           = useState("user");
  const [form, setForm]         = useState({ shopCode: "", username: "", password: "", totpCode: "", deviceCode: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [notice, setNotice]     = useState("");  // muvaffaqiyat xabari (xato emas)
  const [shake, setShake]       = useState(0);   // har xatoda ortadi → bir martalik silkinish
  const [showPass, setShowPass] = useState(false);
  const [leaving, setLeaving]   = useState(false);
  /* Ekran: kirish · parolni unutdim · yangi parol.
     ⚠ Router qo'shilmadi: bu ilovada uchta ko'rinish bor va router
     uchun 40 KB kutubxona olib kelish — kirish sahifasini og'irlashtirish
     demak (05-AUTH.md: «Eng kichik ilova, lekin birinchi taassurot»). */
  const [view, setView] = useState(
    _resetToken ? "reset" : _signupToken ? "confirmSignup" : _openSignup ? "signup" : "login");
  /* Ro'yxatdan o'tish formasi (V31). `plan` — xohlagan tarif; pullik
     tanlansa ham sinovda boshlanadi (superadmin to'lovni qo'lda kiritadi). */
  const [signup, setSignup] = useState({
    shopName: "", ownerName: "", phone: "", email: "", username: "", password: "", plan: _planParam,
  });
  const [signupSent, setSignupSent] = useState(false);
  /* Parol to'g'ri, endi 2FA kodi kerak (server 428 qaytardi). */
  const [twoFactor, setTwoFactor] = useState(false);
  /* Parol to'g'ri, lekin qurilma YANGI — pochtadagi kod kerak (V29, 428). */
  const [deviceConfirm, setDeviceConfirm] = useState(false);
  /* Ega/admin oilasida bir nechta do'kon — tanlash ekrani (V29).
     `pending` — kirish natijasi: do'kon tanlangunicha tokenlar shu yerda
     turadi, redirect esa tanlovdan KEYIN bo'ladi. */
  const [stores, setStores]   = useState(null);
  const [pending, setPending] = useState(null);

  const firstFieldRef = useRef(null);
  const errorRef      = useRef(null);
  const codeRef       = useRef(null);
  const deviceRef     = useRef(null);

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
          {
            username: form.username.trim(),
            password: form.password,
            // 2FA yoqilmagan hisobda bo'sh ketadi va e'tiborsiz qoladi.
            totpCode: form.totpCode.trim() || undefined,
          },
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
          {
            shopCode: form.shopCode.trim(), username: form.username.trim(), password: form.password,
            // Yangi qurilma kodi — server 428 qaytargandan keyingi urinishda (V29)
            deviceCode: form.deviceCode.trim() || undefined,
          },
          { "X-Device-Id": getDeviceId() });
        let meData = {};
        try { meData = (await get("/auth/me", r1.data.accessToken)).data || {}; } catch (_) {}
        const roles = meData.roles || r1.data?.roles || [];
        const roleStr = roles.map((r) => r?.type || r?.name || String(r || "")).filter(Boolean).join(",");
        const meta = {
          type: "user",
          username: meData.username || r1.data?.username || form.username.trim(),
          fullName: meData.fullName || r1.data?.fullName || form.username.trim(),
          role: roleStr,
        };

        /* Oilada bir nechta do'kon — avval tanlov (V29, /select-store).
           Tokenlar `pending` da turadi, redirect tanlovdan keyin. */
        if (Array.isArray(r1.data.stores) && r1.data.stores.length > 1) {
          setPending({ r1: r1.data, meta });
          setStores(r1.data.stores);
          setDeviceConfirm(false);
          setLoading(false);
          return;
        }

        setLeaving(true);
        redirectWithToken({
          ...meta,
          accessToken:  r1.data.accessToken,
          refreshToken: r1.data.refreshToken,
          shopCode: r1.data.shopCode || form.shopCode.trim(),
        });
      }
    } catch (err) {
      /* ⚠ 428 — XATO EMAS: parol to'g'ri, endi kod kerak. «Login yoki
         parol noto'g'ri» deb ko'rsatilsa, foydalanuvchi to'g'ri parolini
         qayta-qayta terib o'zini bloklab qo'yardi. */
      if (err.status === 428 && err.data?.twoFactorRequired) {
        setTwoFactor(true);
        setLoading(false);
        setNotice(err.data.message || t("login.twoFactorHint"));
        setTimeout(() => codeRef.current?.focus(), 30);
        return;
      }
      /* Xuddi shu qoida — qurilma tasdig'i ham XATO EMAS (V29). */
      if (err.status === 428 && err.data?.deviceConfirmationRequired) {
        setDeviceConfirm(true);
        setLoading(false);
        setNotice(err.data.message || t("login.deviceHint"));
        setTimeout(() => deviceRef.current?.focus(), 30);
        return;
      }
      fail(err.message);
      errorRef.current?.focus?.();
    }
  };

  /* ── Do'kon tanlash (V29) ─────────────────────────────────────────────
     O'z do'koni tanlansa kirishdagi tokenlar ishlatiladi; filial tanlansa
     server o'sha filial nomidan YANGI tokenlar beradi. */
  const pickStore = async (s) => {
    if (!pending) return;
    setError("");
    if (s.code === pending.r1.shopCode) {
      setLeaving(true);
      redirectWithToken({
        ...pending.meta,
        accessToken:  pending.r1.accessToken,
        refreshToken: pending.r1.refreshToken,
        shopCode: pending.r1.shopCode,
      });
      return;
    }
    setLoading(true);
    try {
      const r2 = await post("/auth/select-store", { shopId: s.id }, {
        "X-Device-Id": getDeviceId(),
        Authorization: `Bearer ${pending.r1.accessToken}`,
      });
      setLeaving(true);
      redirectWithToken({
        ...pending.meta,
        accessToken:  r2.data.accessToken,
        refreshToken: r2.data.refreshToken,
        shopCode: r2.data.shopCode || s.code,
      });
    } catch (err) {
      fail(err.message);
    }
  };

  /* ── Ro'yxatdan o'tish (V31) ─────────────────────────────────────── */
  const setS = (k) => (e) => { setError(""); setSignup((p) => ({ ...p, [k]: e.target.value })); };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); setNotice("");
    const s = signup;
    if (!s.shopName.trim() || !s.ownerName.trim() || !s.email.trim()
        || !s.username.trim() || !s.password) {
      return fail(t("signup.fillAll"));
    }
    if (s.password.length < 8) return fail(t("login.resetTooShort"));
    // Telefon: maskadan qat'i nazar to'liq +998XXXXXXXXX ga keltiriladi
    const digits = s.phone.replace(/\D/g, "");
    const phone = !digits ? undefined
      : digits.length === 9 ? `+998${digits}`
      : digits.length === 12 && digits.startsWith("998") ? `+${digits}`
      : null;
    if (phone === null) return fail(t("signup.phoneInvalid"));
    setLoading(true);
    try {
      const r = await post("/public/signup", {
        shopName: s.shopName.trim(),
        ownerName: s.ownerName.trim(),
        phone,
        email: s.email.trim(),
        username: s.username.trim(),
        password: s.password,
        plan: s.plan,
      });
      setSignupSent(true);
      setNotice(r.message || t("signup.sent"));
      setLoading(false);
    } catch (err) {
      fail(err.message);
    }
  };

  /* Pochtadagi havola: do'kon YARATILADI va tokenlar qaytadi — kutish
     ekrani ko'rsatib turib, tayyor bo'lgach ilovaga yo'naltiramiz. */
  const confirmRan = useRef(false);
  useEffect(() => {
    if (view !== "confirmSignup" || confirmRan.current) return;
    confirmRan.current = true;
    (async () => {
      try {
        const r = await post("/public/signup/confirm", { token: _signupToken },
          { "X-Device-Id": getDeviceId() });
        let meData = {};
        try { meData = (await get("/auth/me", r.data.accessToken)).data || {}; } catch (_) {}
        // Havola manzil qatorida qolmasin — yangilashda «yaroqsiz» chiqardi
        window.history.replaceState({}, "", window.location.pathname);
        setLeaving(true);
        redirectWithToken({
          type: "user",
          accessToken:  r.data.accessToken,
          refreshToken: r.data.refreshToken,
          username: meData.username || "",
          fullName: meData.fullName || "",
          role: (meData.roles || []).map((x) => x?.type || x?.name || "").filter(Boolean).join(","),
          shopCode: r.data.shopCode,
        });
      } catch (err) {
        window.history.replaceState({}, "", window.location.pathname);
        setView("signup");
        fail(err.message);
      }
    })();
  }, [view]);

  /* ── Parolni unutdim ──────────────────────────────────────────────
     ⚠ Javob har doim bir xil («yubordik»): server hisob bor-yo'qligini
     oshkor qilmaydi va front ham qilmasligi kerak. */
  const handleForgot = async (e) => {
    e.preventDefault();
    setError(""); setNotice("");
    if (!form.username.trim()) return fail(t("login.needUsername"));
    if (tab === "user" && !form.shopCode.trim()) return fail(t("login.needShopCode"));
    setLoading(true);
    try {
      const r = await post("/auth/password/forgot", {
        accountType: tab === "admin" ? "ADMIN" : "USER",
        username: form.username.trim(),
        shopCode: tab === "admin" ? null : form.shopCode.trim(),
      }, { "X-Device-Id": getDeviceId() });
      setNotice(r.message || t("login.forgotSent"));
      setLoading(false);
    } catch (err) {
      fail(err.message);
    }
  };

  /* ── Yangi parol (pochtadagi havoladan) ───────────────────────────── */
  const handleReset = async (e) => {
    e.preventDefault();
    setError(""); setNotice("");
    if (!form.password || form.password.length < 8) return fail(t("login.resetTooShort"));
    setLoading(true);
    try {
      const r = await post("/auth/password/reset", {
        token: _resetToken, newPassword: form.password,
      }, { "X-Device-Id": getDeviceId() });
      setNotice(r.message || t("login.resetDone"));
      setLoading(false);
      setForm((p) => ({ ...p, password: "" }));
      // Havolani URL dan tozalaymiz: sahifa yangilansa token qayta
      // ishlatilmaydi (u baribir bir martalik) va manzil qatorida turmaydi.
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => setView("login"), 1500);
    } catch (err) {
      fail(err.message);
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
        {stores ? (
          /* ── Do'kon tanlash (V29, /select-store) ─────────────────────
             Kirish MUVAFFAQIYATLI bo'ldi, faqat qaysi do'kon nomidan
             ishlash qoldi. Birinchisi — xodimning o'z do'koni. */
          <div className="auth__form"
               style={leaving
                 ? { opacity: 0, transform: "scale(.98)", transition: "opacity var(--dur-base) var(--ease-in), transform var(--dur-base) var(--ease-in)" }
                 : undefined}>
            <img src={LOGO_URL} alt="e-Kassam" className="auth__logo logo--light ek-in-fade"
                 onError={(e) => { e.target.style.display = "none"; }} />
            <img src={LOGO_DARK_URL} alt="" aria-hidden="true" className="auth__logo logo--dark ek-in-fade"
                 onError={(e) => { e.target.style.display = "none"; }} />
            <h1 className="auth__title ek-in-up" style={{ animationDelay: "60ms" }}>
              {t("login.selectStoreTitle")}
            </h1>
            <p className="auth__sub ek-in-up" style={{ animationDelay: "120ms" }}>
              {t("login.selectStoreSub")}
            </p>

            {error && (
              <div className="auth__error" role="alert" aria-live="assertive">
                <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 2 }} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="auth__stores" role="list">
              {stores.map((s, i) => (
                <button key={s.id} type="button" role="listitem"
                        className="auth__store ek-in-up"
                        style={{ animationDelay: `${160 + i * 50}ms` }}
                        disabled={loading}
                        onClick={() => pickStore(s)}>
                  <i className={`fa-solid ${s.branch ? "fa-code-branch" : "fa-store"}`} aria-hidden="true" />
                  <span className="auth__store-text">
                    <b>{s.name}</b>
                    <small>
                      {s.code === pending?.r1?.shopCode
                        ? t("login.myStore")
                        : s.branch ? t("login.branchStore") : t("login.mainStore")}
                    </small>
                  </span>
                  {loading
                    ? <span className="ek-spinner" aria-hidden="true" />
                    : <i className="fa-solid fa-chevron-right" aria-hidden="true" />}
                </button>
              ))}
            </div>

            <button type="button" className="auth__link"
                    onClick={() => { setStores(null); setPending(null); setError(""); }}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {t("login.backToLogin")}
            </button>
          </div>
        ) : view === "confirmSignup" ? (
          /* ── Pochta havolasi tasdiqlanyapti (V31) — do'kon yaratilmoqda ── */
          <div className="auth__form">
            <img src={LOGO_URL} alt="e-Kassam" className="auth__logo logo--light ek-in-fade"
                 onError={(e) => { e.target.style.display = "none"; }} />
            <img src={LOGO_DARK_URL} alt="" aria-hidden="true" className="auth__logo logo--dark ek-in-fade"
                 onError={(e) => { e.target.style.display = "none"; }} />
            <h1 className="auth__title ek-in-up">{t("signup.confirming")}</h1>
            <p className="auth__sub ek-in-up" style={{ animationDelay: "80ms" }}>
              {t("signup.confirmingSub")}
            </p>
            <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
              <span className="ek-spinner" aria-hidden="true" style={{ width: 28, height: 28 }} />
            </div>
          </div>
        ) : view === "signup" ? (
          /* ── Ro'yxatdan o'tish (V31) ──────────────────────────────────── */
          <form className="auth__form" onSubmit={handleSignup}>
            <img src={LOGO_URL} alt="e-Kassam" className="auth__logo logo--light ek-in-fade"
                 onError={(e) => { e.target.style.display = "none"; }} />
            <img src={LOGO_DARK_URL} alt="" aria-hidden="true" className="auth__logo logo--dark ek-in-fade"
                 onError={(e) => { e.target.style.display = "none"; }} />
            <h1 className="auth__title ek-in-up">{t("signup.title")}</h1>
            <p className="auth__sub ek-in-up" style={{ animationDelay: "80ms" }}>{t("signup.sub")}</p>

            {signupSent ? (
              <>
                <div className="auth__note" role="status" aria-live="polite">
                  <i className="fa-solid fa-envelope-circle-check" aria-hidden="true" />
                  <span>{notice || t("signup.sent")}</span>
                </div>
                <button type="button" className="auth__link"
                        onClick={() => { setView("login"); setSignupSent(false); setNotice(""); }}>
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {t("login.backToLogin")}
                </button>
              </>
            ) : (
              <>
                <div className="auth__field">
                  <label className="auth__label" htmlFor="s-shop">{t("signup.shopName")}</label>
                  <input id="s-shop" className="auth__input" maxLength={120}
                         value={signup.shopName} onChange={setS("shopName")}
                         placeholder={t("signup.shopNamePh")} autoFocus />
                </div>
                <div className="auth__grid2">
                  <div className="auth__field">
                    <label className="auth__label" htmlFor="s-owner">{t("signup.ownerName")}</label>
                    <NameField id="s-owner" className="auth__input"
                               value={signup.ownerName} onChange={setS("ownerName")}
                               placeholder="Ali Valiyev" autoComplete="name" />
                  </div>
                  <div className="auth__field">
                    <label className="auth__label" htmlFor="s-phone">{t("signup.phone")}</label>
                    <PhoneField id="s-phone" className="auth__input ek-num"
                                value={signup.phone} onChange={setS("phone")} />
                  </div>
                </div>
                <div className="auth__field">
                  <label className="auth__label" htmlFor="s-email">{t("signup.email")}</label>
                  <EmailField id="s-email" className="auth__input"
                              value={signup.email} onChange={setS("email")}
                              placeholder="siz@pochta.uz" autoComplete="email" />
                  <p className="auth__foot" style={{ marginTop: 6 }}>{t("signup.emailHint")}</p>
                </div>
                <div className="auth__grid2">
                  <div className="auth__field">
                    <label className="auth__label" htmlFor="s-user">{t("login.login")}</label>
                    <UsernameField id="s-user" className="auth__input"
                                   value={signup.username} onChange={setS("username")}
                                   placeholder="username" autoComplete="username" />
                  </div>
                  <div className="auth__field">
                    <label className="auth__label" htmlFor="s-pass">{t("login.password")}</label>
                    <input id="s-pass" className="auth__input" type="password"
                           value={signup.password} onChange={setS("password")}
                           placeholder={t("signup.passPh")} autoComplete="new-password" />
                  </div>
                </div>

                {/* Tarif tanlash: pullik tanlansa ham SINOVDA boshlanadi —
                    to'lov onlayn emas, biz bog'lanamiz (halol shartlar). */}
                <div className="auth__field">
                  <span className="auth__label">{t("signup.plan")}</span>
                  <div className="auth__stores" role="radiogroup" aria-label={t("signup.plan")}>
                    {[
                      { k: "FREE",    icon: "fa-seedling",  name: t("signup.planFree"),    sub: t("signup.planFreeSub") },
                      { k: "BASIC",   icon: "fa-store",     name: t("signup.planBasic"),   sub: t("signup.planBasicSub") },
                      { k: "PREMIUM", icon: "fa-crown",     name: t("signup.planPremium"), sub: t("signup.planPremiumSub") },
                    ].map((p) => (
                      <button key={p.k} type="button" role="radio"
                              aria-checked={signup.plan === p.k}
                              aria-pressed={signup.plan === p.k}
                              className="auth__store"
                              onClick={() => setSignup((s) => ({ ...s, plan: p.k }))}>
                        <i className={`fa-solid ${p.icon}`} aria-hidden="true" />
                        <span className="auth__store-text">
                          <b>{p.name}</b>
                          <small>{p.sub}</small>
                        </span>
                        {signup.plan === p.k
                          ? <i className="fa-solid fa-circle-check" aria-hidden="true" style={{ marginLeft: "auto", color: "var(--fg-brand)" }} />
                          : <i className="fa-regular fa-circle" aria-hidden="true" style={{ marginLeft: "auto", color: "var(--fg-tertiary)" }} />}
                      </button>
                    ))}
                  </div>
                  {signup.plan !== "FREE" && (
                    <p className="auth__foot" style={{ marginTop: 6 }}>{t("signup.paidNote")}</p>
                  )}
                </div>

                {error && (
                  <div className="auth__error ek-shake" role="alert" aria-live="assertive">
                    <i className="fa-solid fa-circle-exclamation" style={{ marginTop: 2 }} aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="auth__submit">
                  {loading
                    ? <><span className="ek-spinner" aria-hidden="true" /> {t("common.checking")}</>
                    : <><i className="fa-solid fa-rocket" aria-hidden="true" /> {t("signup.submit")}</>}
                </button>
                <button type="button" className="auth__link"
                        onClick={() => { setView("login"); setError(""); setNotice(""); }}>
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {t("login.backToLogin")}
                </button>
                <p className="auth__foot">{t("signup.trialFoot")}</p>
              </>
            )}
          </form>
        ) : (
        <form
          className="auth__form"
          onSubmit={view === "login" ? handleSubmit : view === "forgot" ? handleForgot : handleReset}
          style={leaving
            ? { opacity: 0, transform: "scale(.98)", transition: "opacity var(--dur-base) var(--ease-in), transform var(--dur-base) var(--ease-in)" }
            : undefined}
        >
          {/* Logotip temaga qarab almashadi — so'z belgisi to'q siyoh rangida */}
          <img src={LOGO_URL} alt="e-Kassam" className="auth__logo logo--light ek-in-fade"
               onError={(e) => { e.target.style.display = "none"; }} />
          <img src={LOGO_DARK_URL} alt="" aria-hidden="true" className="auth__logo logo--dark ek-in-fade"
               onError={(e) => { e.target.style.display = "none"; }} />

          <h1 className="auth__title ek-in-up" style={{ animationDelay: "60ms" }}>
            {view === "login" ? t("login.welcome")
              : view === "forgot" ? t("login.forgotTitle") : t("login.resetTitle")}
          </h1>
          <p className="auth__sub ek-in-up" style={{ animationDelay: "120ms" }}>
            {view === "login" ? t("login.subtitle")
              : view === "forgot" ? t("login.forgotSub") : t("login.resetSub")}
          </p>

          {view !== "reset" && (
          <div className="auth__seg" role="tablist" aria-label={t("login.tabType")}>
            {[
              { k: "user",  icon: "fa-store",         label: t("login.tabUser") },
              { k: "admin", icon: "fa-shield-halved", label: t("login.tabAdmin") },
            ].map(({ k, icon, label }) => (
              <button
                key={k} type="button" role="tab"
                aria-selected={tab === k}
                onClick={() => { setTab(k); setError(""); setNotice(""); setTwoFactor(false); setDeviceConfirm(false); }}
              >
                <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} aria-hidden="true" />{label}
              </button>
            ))}
          </div>
          )}

          {isAdmin && view === "login" && (
            <div className="auth__note">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
              {t("login.adminNote")}
            </div>
          )}

          {!isAdmin && view !== "reset" && (
            <div className="auth__field">
              <label className="auth__label" htmlFor="shopCode">{t("login.shopCode")}</label>
              <CodeField
                id="shopCode" ref={firstFieldRef}
                className="auth__input"
                value={form.shopCode} onChange={set("shopCode")}
                placeholder="baraka-shop" autoComplete="organization"
                aria-invalid={!!error || undefined}
                aria-describedby={error ? "auth-error" : undefined}
              />
            </div>
          )}

          {view !== "reset" && (
          <div className="auth__field">
            <label className="auth__label" htmlFor="username">{t("login.login")}</label>
            <UsernameField
              id="username"
              ref={isAdmin ? firstFieldRef : undefined}
              className="auth__input"
              value={form.username} onChange={set("username")}
              placeholder="username" autoComplete="username"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "auth-error" : undefined}
            />
          </div>
          )}

          {view !== "forgot" && (
          <div className="auth__field">
            <label className="auth__label" htmlFor="password">
              {view === "reset" ? t("login.newPassword") : t("login.password")}
            </label>
            <div className="auth__input-wrap">
              <input
                id="password"
                className="auth__input auth__input--pass"
                type={showPass ? "text" : "password"}
                value={form.password} onChange={set("password")}
                placeholder="••••••••"
                autoComplete={view === "reset" ? "new-password" : "current-password"}
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
          )}

          {/* ── Ikki bosqichli kod ─────────────────────────────────────
              Faqat server so'raganda ko'rinadi (428). Doim ko'rsatilsa,
              2FA yoqmagan hamma odam «bu nima?» deb to'xtab qolardi.
              Maydon BITTA: telefon yo'q bo'lsa shu yerga tiklash kodi
              yoziladi (backenddagi bilan bir xil qoida). */}
          {twoFactor && view === "login" && (
            <div className="auth__field">
              <label className="auth__label" htmlFor="totpCode">{t("login.twoFactorCode")}</label>
              <OtpField
                id="totpCode" ref={codeRef}
                className="auth__input ek-num"
                value={form.totpCode} onChange={set("totpCode")}
                placeholder="123456"
                aria-describedby="auth-2fa-hint"
              />
              <p id="auth-2fa-hint" className="auth__foot" style={{ marginTop: 6 }}>
                {t("login.twoFactorHint")}
              </p>
            </div>
          )}

          {/* ── Yangi qurilma kodi (V29) ───────────────────────────────
              2FA bilan bir xil qoida: faqat server so'raganda (428)
              ko'rinadi, kirish o'sha forma bilan qaytariladi. */}
          {deviceConfirm && view === "login" && (
            <div className="auth__field">
              <label className="auth__label" htmlFor="deviceCode">{t("login.deviceCode")}</label>
              <OtpField
                id="deviceCode" ref={deviceRef}
                className="auth__input ek-num"
                value={form.deviceCode} onChange={set("deviceCode")}
                placeholder="123456"
                aria-describedby="auth-device-hint"
              />
              <p id="auth-device-hint" className="auth__foot" style={{ marginTop: 6 }}>
                {t("login.deviceHint")}
              </p>
            </div>
          )}

          {notice && (
            <div className="auth__note" role="status" aria-live="polite">
              <i className="fa-solid fa-circle-info" aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}

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
              : view === "forgot"
                ? <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> {t("login.forgotSubmit")}</>
                : view === "reset"
                  ? <><i className="fa-solid fa-key" aria-hidden="true" /> {t("login.resetSubmit")}</>
                  : <><i className={`fa-solid ${isAdmin ? "fa-shield-halved" : "fa-right-to-bracket"}`} aria-hidden="true" />
                      {isAdmin ? t("login.submitAdmin") : t("login.submit")}</>}
          </button>

          {/* «Parolni unutdim» — 05-AUTH.md dagi maketda ko'rsatilgan
              joyda: tugmadan keyin, kichik havola sifatida. */}
          {view === "login" && (
            <button type="button" className="auth__link"
                    onClick={() => { setView("forgot"); setError(""); setNotice(""); }}>
              {t("login.forgotLink")}
            </button>
          )}
          {/* Ro'yxatdan o'tish (V31) — faqat do'kon xodimi yorlig'ida:
              admin hisobini o'zi ochib bo'lmaydi. */}
          {view === "login" && !isAdmin && (
            <button type="button" className="auth__link" style={{ marginTop: 2 }}
                    onClick={() => { setView("signup"); setError(""); setNotice(""); }}>
              <i className="fa-solid fa-store" aria-hidden="true" /> {t("signup.cta")}
            </button>
          )}
          {view !== "login" && (
            <button type="button" className="auth__link"
                    onClick={() => { setView("login"); setError(""); setNotice(""); }}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {t("login.backToLogin")}
            </button>
          )}

          <p className="auth__foot">
            {view === "login"
              ? t("login.redirectNote", { host: isAdmin ? "admin.e-kassam.uz" : "app.e-kassam.uz" })
              : t("login.resetFoot")}
          </p>
        </form>
        )}
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
