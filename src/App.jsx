import { useState } from "react";
import { API_BASE, APP_URL, ADMIN_URL, K, getDeviceId, LOGO_URL } from "./config";

async function post(path, body, extraHeaders = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Xatolik: ${res.status}`);
  return json;
}

async function get(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
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
  localStorage.clear();
  // URL dan ?logged_out=1 ni olib tashlash
  window.history.replaceState({}, "", window.location.pathname);
}

// Token ni URL query param orqali yuborish
function redirectWithToken({ type, accessToken, refreshToken, username, fullName, role, shopCode }) {
  const params = new URLSearchParams({
    token:    accessToken,
    refresh:  refreshToken || "",
    type:     type,
    username: username || "",
    fullName: fullName || username || "",
    role:     role || "",
    // Refresh token shu deviceId ga bog'langan. localStorage origin ga xos,
    // shuning uchun uni maqsad domenga o'zimiz uzatamiz — aks holda u yerda
    // boshqa id yaraladi va refresh "boshqa qurilma" deb rad etiladi.
    deviceId: getDeviceId(),
  });
  if (shopCode) params.set("shopCode", shopCode);

  const dest = type === "admin" ? ADMIN_URL : APP_URL;
  const authUrl = `${dest}?auth=${encodeURIComponent(params.toString())}`;
  console.log("[LOGIN] redirect →", dest, "| type:", type, "| token:", accessToken?.slice(0,20));
  window.location.replace(authUrl);
}

export default function App() {
  const [tab, setTab]           = useState("user");
  const [form, setForm]         = useState({ shopCode: "", username: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => { setError(""); setForm((p) => ({ ...p, [k]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim()) { setError("Foydalanuvchi nomini kiriting"); return; }
    if (!form.password)        { setError("Parolni kiriting"); return; }
    if (tab === "user" && !form.shopCode.trim()) { setError("Do'kon kodini kiriting"); return; }

    setLoading(true);
    try {
      if (tab === "admin") {
        const r1 = await post(
          "/auth/admin/login",
          { username: form.username.trim(), password: form.password },
          { "X-Device-Id": getDeviceId() }
        );
        const me = await get("/auth/admin/me", r1.data.accessToken);
        redirectWithToken({
          type:         "admin",
          accessToken:  r1.data.accessToken,
          refreshToken: r1.data.refreshToken,
          username:     me.data?.username || me.data?.login || form.username.trim(),
          fullName:     me.data?.fullName || me.data?.name  || form.username.trim(),
          role:         me.data?.role || "SUPER_ADMIN",
        });
      } else {
        const r1 = await post(
          "/auth/login",
          { shopCode: form.shopCode.trim(), username: form.username.trim(), password: form.password },
          { "X-Device-Id": getDeviceId() }
        );
        // /auth/me 403 qaytarsa login response dan olamiz
        let meData = {};
        try {
          const me = await get("/auth/me", r1.data.accessToken);
          meData = me.data || {};
        } catch (_) {
          // /auth/me ishlamasa login form dan foydalanamiz
        }
        const roles    = meData.roles || r1.data?.roles || [];
        const mainRoleStr = roles.map(r => r?.type || r?.name || String(r || "")).filter(Boolean).join(",");
        redirectWithToken({
          type:         "user",
          accessToken:  r1.data.accessToken,
          refreshToken: r1.data.refreshToken,
          username:     meData.username || r1.data?.username || form.username.trim(),
          fullName:     meData.fullName || r1.data?.fullName || form.username.trim(),
          role:         mainRoleStr,
          shopCode:     form.shopCode.trim(),
        });
      }
    } catch (err) {
      setError(err.message || "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.glow1} /><div style={S.glow2} />
      <div style={S.card}>

        <div style={S.logoWrap}>
          <img src={LOGO_URL} alt="e-Kassam" style={S.logoImg}
            onError={(e) => { e.target.style.display = "none"; }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={S.title}>e-Kassam CRM</div>
          <div style={S.subtitle}>Tizimga kirish</div>
        </div>

        <div style={S.tabBar}>
          {[
            { k: "user",  icon: "fa-store",        label: "Do'kon xodimi" },
            { k: "admin", icon: "fa-shield-halved", label: "Admin" },
          ].map(({ k, icon, label }) => (
            <button key={k} type="button" onClick={() => { setTab(k); setError(""); }}
              style={{ ...S.tabBtn, ...(tab === k ? S.tabOn : S.tabOff) }}>
              <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />{label}
            </button>
          ))}
        </div>

        {tab === "admin" && (
          <div style={S.adminNote}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
            Faqat tizim administratorlari uchun
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === "user" && (
            <Field label="Do'kon kodi" icon="fa-store">
              <input style={S.input} value={form.shopCode} onChange={set("shopCode")}
                placeholder="baraka-shop" autoComplete="off" />
            </Field>
          )}
          <Field label="Foydalanuvchi nomi" icon="fa-user">
            <input style={S.input} value={form.username} onChange={set("username")}
              placeholder="username" autoFocus={tab === "admin"} autoComplete="username" />
          </Field>
          <Field label="Parol" icon="fa-lock">
            <input style={{ ...S.input, paddingRight: 44 }}
              type={showPass ? "text" : "password"}
              value={form.password} onChange={set("password")}
              placeholder="••••••••" autoComplete="current-password" />
            <button type="button" onClick={() => setShowPass(p => !p)} style={S.eyeBtn}>
              <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </Field>

          {error && (
            <div style={S.errBox}>
              <i className="fa-solid fa-circle-xmark" style={{ marginRight: 8, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{error}</span>
              <button type="button" onClick={() => setError("")} style={S.dismissBtn}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ ...S.submitBtn, ...(tab === "admin" ? S.submitDark : S.submitBlue), opacity: loading ? .7 : 1 }}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Tekshirilmoqda...</>
              : <><i className={`fa-solid ${tab === "admin" ? "fa-shield-halved" : "fa-right-to-bracket"}`} />
                  {tab === "admin" ? "Admin sifatida kirish" : "Kirish"}</>}
          </button>
        </form>

        <div style={S.footer}>
          Kirganingizdan so'ng <strong>{tab === "user" ? "app.e-kassam.uz" : "admin.e-kassam.uz"}</strong> ga yo'naltirasiz
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      <div style={{ position: "relative" }}>
        <i className={`fa-solid ${icon}`} style={S.fieldIcon} />
        {children}
      </div>
    </div>
  );
}

const S = {
  page:      { minHeight:"100vh", background:"linear-gradient(145deg,#020617,#0c1a3d,#0f172a)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Nunito',sans-serif" },
  glow1:     { position:"fixed", width:500, height:500, borderRadius:"50%", background:"rgba(1,125,202,.18)", filter:"blur(90px)", top:-200, right:-150, pointerEvents:"none" },
  glow2:     { position:"fixed", width:400, height:400, borderRadius:"50%", background:"rgba(1,54,141,.15)", filter:"blur(90px)", bottom:-150, left:-100, pointerEvents:"none" },
  card:      { background:"white", borderRadius:24, padding:"32px 36px 24px", width:"100%", maxWidth:420, boxShadow:"0 40px 80px rgba(0,0,0,.45)", position:"relative", zIndex:1 },
  logoWrap:  { background:"#f0f6fb", borderRadius:14, padding:"12px 18px", display:"flex", justifyContent:"center", alignItems:"center", marginBottom:18, minHeight:64 },
  logoImg:   { height:44, objectFit:"contain", display:"block" },
  title:     { fontSize:22, fontWeight:900, color:"#0f172a" },
  subtitle:  { fontSize:13, color:"#64748b", fontWeight:600, marginTop:3 },
  tabBar:    { display:"flex", background:"#f1f5f9", borderRadius:12, padding:4, marginBottom:16, gap:4 },
  tabBtn:    { flex:1, padding:"10px 0", border:"none", borderRadius:9, fontSize:13, fontWeight:700, fontFamily:"'Nunito',sans-serif", cursor:"pointer", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center" },
  tabOn:     { background:"white", color:"#017dca", boxShadow:"0 2px 8px rgba(0,0,0,.1)" },
  tabOff:    { background:"transparent", color:"#64748b" },
  adminNote: { background:"#fffbeb", border:"1.5px solid #fcd34d", borderRadius:10, padding:"9px 14px", marginBottom:14, fontSize:12, fontWeight:700, color:"#92400e", display:"flex", alignItems:"center" },
  label:     { display:"block", fontSize:11, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:".5px", marginBottom:5 },
  fieldIcon: { position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", fontSize:14, pointerEvents:"none" },
  input:     { width:"100%", padding:"12px 14px 12px 40px", border:"1.5px solid #e2e8f0", borderRadius:11, fontSize:14, fontFamily:"'Nunito',sans-serif", color:"#0f172a", background:"#f8fafc", boxSizing:"border-box" },
  eyeBtn:    { position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:14, padding:0 },
  errBox:    { background:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:10, padding:"11px 14px", marginBottom:12, fontSize:13, fontWeight:700, color:"#dc2626", display:"flex", alignItems:"center" },
  dismissBtn:{ border:"none", background:"none", cursor:"pointer", color:"#dc2626", fontSize:15, padding:"0 0 0 8px", flexShrink:0 },
  submitBtn: { width:"100%", padding:13, border:"none", borderRadius:12, fontSize:15, fontWeight:800, fontFamily:"'Nunito',sans-serif", color:"white", cursor:"pointer", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:9, marginTop:4 },
  submitBlue:{ background:"linear-gradient(135deg,#017dca,#01368d)", boxShadow:"0 4px 16px rgba(1,125,202,.4)" },
  submitDark:{ background:"linear-gradient(135deg,#1e293b,#0f172a)", boxShadow:"0 4px 16px rgba(0,0,0,.35)" },
  footer:    { marginTop:16, fontSize:12, color:"#94a3b8", fontWeight:600, textAlign:"center", paddingTop:12, borderTop:"1px solid #f1f5f9" },
};
