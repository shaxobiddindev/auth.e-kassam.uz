/* ==========================================================================
   e-Kassam — interfeys matnlari lug'ati (uz · ru · en)

   QOIDALAR
   1. Faqat INTERFEYS matni. Tovar nomi, mijoz ismi, do'kon nomi, kategoriya,
      izoh — bularning hammasi FOYDALANUVCHI MA'LUMOTI va tarjima qilinmaydi.
   2. Kalitlar tekis (`common.save`), ierarxik obyekt emas — qidirish oson va
      yetishmayotgan kalit darrov ko'rinadi.
   3. Uchala obyektda BIR XIL kalitlar bo'lishi shart. Kalit tushib qolsa
      `ek-i18n.js` uni `uz` dan oladi, u ham bo'lmasa kalitning o'zini
      ko'rsatadi — ya'ni ekranda `products.title` chiqadi va xato yashirinmaydi.
   4. O'rin egallovchi: `{n}`, `{name}` — `t("x", { n: 5 })`.

   MANBA FAYL — packages/ui/ da tahrirlanadi, sync-tokens.ps1 tarqatadi.
   ========================================================================== */

/* ══════════════════════════════════════════════════════════════════════════
   O'ZBEKCHA
   ══════════════════════════════════════════════════════════════════════════ */
/* ⚠ BU FAYL KESILGAN — `scripts/trim-locales.mjs`.

   To'liq lug'at butun tizimniki (kassa, ombor, hisobot, audit…), auth
   esa faqat kirish va ro'yxatdan o'tish formasi. Kesilmagan holda
   3 651 ortiqcha kalit qatori HAR BIR TASHRIFCHIGA yuklanardi
   (gzip'da ~55 KB, bundle'ning yarmi) — auth esa foydalanuvchi
   ko'radigan BIRINCHI ekran.

   `packages/ui` dan sinxrondan KEYIN qayta ishga tushiring:
       npm run trim
   `npm run check` esa kesish kerakligini o'zi aytadi. */

/* ⚠ BU FAYL KESILGAN — `scripts/trim-locales.mjs`.

   To'liq lug'at butun tizimniki (kassa, ombor, hisobot, audit…), auth
   esa faqat kirish va ro'yxatdan o'tish formasi. Kesilmagan holda
   3 651 ortiqcha kalit qatori HAR BIR TASHRIFCHIGA yuklanardi
   (gzip'da ~55 KB, bundle'ning yarmi) — auth esa foydalanuvchi
   ko'radigan BIRINCHI ekran.

   `packages/ui` dan sinxrondan KEYIN qayta ishga tushiring:
       npm run trim
   `npm run check` esa kesish kerakligini o'zi aytadi. */

const uz = {
  /* ── Umumiy ─────────────────────────────────────────────────────────── */
  "validation.dateInvalid": "Bunday sana yo'q",
  "common.checking": "Tekshirilmoqda…",
  "common.error": "Xatolik",

  /* ── Sozlamalar sahifasi ────────────────────────────────────────────── */
  "settings.language": "Interfeys tili",

  /* ── Tema ───────────────────────────────────────────────────────────── */
  "theme.label": "Ko'rinish rejimi",
  "theme.system": "Tizim",
  "theme.light": "Yorug'",
  "theme.dark": "Qorong'i",

  /* ── Kirish ekrani ──────────────────────────────────────────────────── */
  "login.welcome": "Xush kelibsiz",
  "login.twoFactorCode": "Ikki bosqichli kod",
  "login.twoFactorHint": "Autentifikator ilovasidagi 6 xonali kod. Telefoningiz yo'q bo'lsa \u2014 tiklash kodini yozing.",
  "signup.cta": "Do'kon ochish — bepul sinab ko'ring",
  "signup.title": "Do'kon ochish",
  "signup.sub": "14 kunlik bepul sinov. Karta shart emas.",
  "signup.shopName": "Do'kon nomi",
  "signup.shopNamePh": "Baraka market",
  "signup.ownerName": "Ismingiz",
  "signup.phone": "Telefon",
  "signup.email": "Pochta",
  "signup.emailHint": "Tasdiqlash havolasi va parolni tiklash shu manzilga boradi.",
  "signup.passPh": "Kamida 8 belgi",
  "signup.plan": "Tarif",
  "signup.planFree": "Sinov",
  "signup.planFreeSub": "14 kun bepul, keyin tarif tanlaysiz",
  "signup.planBasic": "Boshlang'ich — 240 000 so'm/oy",
  "signup.planBasicSub": "Kichik do'kon uchun",
  "signup.planPremium": "Professional — 620 000 so'm/oy",
  "signup.planPremiumSub": "Filiallar va katta jamoa uchun",
  "signup.paidNote": "Pullik tarif tanlaganingizda ham sinovda boshlaysiz — to'lov uchun o'zimiz bog'lanamiz.",
  "signup.submit": "Ro'yxatdan o'tish",
  "signup.sent": "Pochtangizga tasdiqlash havolasi yubordik. 24 soat amal qiladi.",
  "signup.fillAll": "Barcha majburiy maydonlarni to'ldiring",
  "signup.phoneInvalid": "Telefon raqami noto'g'ri (9 ta raqam)",
  "signup.trialFoot": "Ro'yxatdan o'tish orqali xizmat shartlariga rozilik bildirasiz.",
  "signup.confirming": "Do'koningiz tayyorlanmoqda…",
  "signup.confirmingSub": "Bir necha soniya — sizni ilovaga o'zimiz olib kiramiz.",
  "login.deviceCode": "Qurilma tasdiqlash kodi",
  "login.deviceHint": "Yangi qurilma aniqlandi. Pochtangizga yuborilgan 6 xonali kodni kiriting.",
  "login.selectStoreTitle": "Do'konni tanlang",
  "login.selectStoreSub": "Qaysi do'kon nomidan ishlaysiz?",
  "login.mainStore": "Bosh do'kon",
  "login.branchStore": "Filial",
  "login.myStore": "O'z do'koningiz",
  "login.forgotLink": "Parolni unutdim",
  "login.forgotTitle": "Parolni tiklash",
  "login.forgotSub": "Hisobingizga biriktirilgan pochtaga havola yuboramiz",
  "login.forgotSubmit": "Havola yuborish",
  "login.forgotSent": "Agar bunday hisob mavjud bo'lsa, unga havola yuborildi",
  "login.backToLogin": "Kirishga qaytish",
  "login.resetTitle": "Yangi parol",
  "login.resetSub": "Kamida 8 belgi. Eskisini qayta ishlatmang.",
  "login.resetSubmit": "Parolni saqlash",
  "login.resetDone": "Parol yangilandi. Endi kirishingiz mumkin",
  "login.resetTooShort": "Parol kamida 8 belgidan iborat bo'lsin",
  "login.newPassword": "Yangi parol",
  "login.resetFoot": "Havola 30 daqiqa amal qiladi va bir marta ishlaydi",
  "login.subtitle": "Do'koningizni boshqarish uchun tizimga kiring",
  "login.tabType": "Kirish turi",
  "login.tabUser": "Do'kon xodimi",
  "login.tabAdmin": "Admin",
  "login.adminNote": "Faqat tizim administratorlari uchun",
  "login.shopCode": "Do'kon kodi",
  "login.login": "Login",
  "login.password": "Parol",
  "login.showPassword": "Parolni ko'rsatish",
  "login.hidePassword": "Parolni yashirish",
  "login.submit": "Kirish",
  "login.submitAdmin": "Admin sifatida kirish",
  "login.redirectNote": "Kirganingizdan so'ng {host} ga yo'naltirilasiz",
  "login.needShopCode": "Do'kon kodini kiriting",
  "login.needUsername": "Foydalanuvchi nomini kiriting",
  "login.needPassword": "Parolni kiriting",
  "login.errBadCredentials": "Login yoki parol noto'g'ri",
  "login.errLocked": "Hisob 15 daqiqaga bloklandi. Egangizga murojaat qiling.",
  "login.errTooMany": "Juda ko'p urinish. Bir necha daqiqadan keyin qayta urining.",
  "login.errNetwork": "Serverga ulanib bo'lmadi. Internetni tekshiring.",
  "login.errGeneric": "Kirishda xatolik yuz berdi",
  "login.brandTitle": "Do'koningiz bugun qancha ishladi — bir qarashda ko'ring",
  "login.receiptToday": "Bugun",
  "login.receiptRegister": "Kassa №1",
  "login.receiptLabel": "Bugungi tushum",
  "login.receiptSales": "Sotuvlar",
  "login.receiptAvg": "O'rtacha chek",
  "login.receiptSplit": "Naqd / Karta",
  "login.point1": "Internet uzilsa savdo to'xtamaydi — sotuvlar qurilmada saqlanadi",
  "login.point2": "Qoldiq tugashidan oldin bildirishnoma keladi",
  "login.point3": "Har bir amal jurnalga yoziladi",

  /* ── Enumlar: to'lov turi ───────────────────────────────────────────── */
  "enum.payment.CASH": "Naqd",
  "enum.payment.CARD": "Karta",
  "enum.payment.CLICK": "Click",
  "enum.payment.PAYME": "Payme",
  "enum.payment.MIXED": "Aralash",

  /* ── Enumlar: sotuv holati ──────────────────────────────────────────── */
  "enum.sale.CREATED": "Yangi",
  "enum.sale.PAID": "To'langan",
  "enum.sale.CREDIT": "Nasiya",
  "enum.sale.CANCELLED": "Bekor qilingan",

  /* ── Enumlar: do'kon holati ─────────────────────────────────────────── */
  "enum.shopStatus.ACTIVE": "Faol",
  "enum.shopStatus.BLOCKED": "Bloklangan",
  "enum.shopStatus.SUSPENDED": "To'xtatilgan",
  "enum.shopStatus.INACTIVE": "Nofaol",
  "enum.shopStatus.DELETED": "O'chirilgan",

  /* ── Enumlar: tarif ─────────────────────────────────────────────────── */
  "enum.plan.FREE": "Bepul",
  "enum.plan.BASIC": "Boshlang'ich",
  "enum.plan.PREMIUM": "Professional",

  /* ── Enumlar: do'kon roli ───────────────────────────────────────────── */
  "enum.role.OWNER": "Do'kon egasi",
  "enum.role.OWNER.short": "Egasi",
  "enum.role.SHOP_ADMIN": "Do'kon admini",
  "enum.role.SHOP_ADMIN.short": "Admin",
  "enum.role.CASHIER": "Kassir",
  "enum.role.CASHIER.short": "Kassir",
  "enum.role.STOREKEEPER": "Omborchi",
  "enum.role.STOREKEEPER.short": "Omborchi",

  /* ── Enumlar: tizim admini ──────────────────────────────────────────── */
  "enum.adminRole.SUPER_ADMIN": "Super admin",
  "enum.adminRole.SYSTEM_ADMIN": "Tizim admini",
  "enum.adminRole.SUPPORT_ADMIN": "Qo'llab-quvvatlash",
  "enum.adminRole.AUDITOR": "Auditor",

  /* ── Enumlar: ombor holati ──────────────────────────────────────────── */
  "enum.inventory.ACTIVE": "Yaroqli",
  "enum.inventory.EXPIRED": "Muddati o'tgan",

  /* ── Admin: dashboard ───────────────────────────────────────────────── */
  "enum.plan.ENTERPRISE": "Korporativ",
  "enum.provider.MANUAL": "Qo'lda",
  "enum.provider.PAYME": "Payme",
  "enum.provider.CLICK": "Click",

  /* ── Filiallararo ko'chirish (V22) ───────────────────────────────── */
  "enum.transferStatus.SENT": "Yo'lda",
  "enum.transferStatus.RECEIVED": "Qabul qilindi",
  "enum.transferStatus.CANCELLED": "Bekor qilindi",

  /* ── Chek va kassa apparatlari ─────────────────────────────────────────── */

  // Auto-update (faqat `.exe`). Matn kassirga qaratilgan: nima
  // bo'layotganini va necha vaqt kutishini aytadi.
  "enum.payment.CREDIT": "Nasiya",

  // Xato to'sig'i — matn KASSIRGA qaratilgan: ayb qidirmaydi, nima
  // qilishni aytadi va sotuv ma'lumoti joyidaligini bildiradi.

  /* ── v2: o'lchov birligi ─────────────────────────────────────────────── */
  "enum.unit.DONA": "dona",
  "enum.unit.QUTI": "quti",
  "enum.unit.QOP": "qop",
  "enum.unit.JUFT": "juft",
  "enum.unit.RULON": "rulon",
  "enum.unit.TO_PLAM": "to'plam",
  "enum.unit.KG": "kg",
  "enum.unit.GRAM": "gramm",
  "enum.unit.LITR": "litr",
  "enum.unit.MILLILITR": "ml",
  "enum.unit.METR": "metr",
  "enum.unit.METR_KV": "m²",
  "enum.unit.METR_KUB": "m³",
  "enum.unit.SOAT": "soat",

  /* ── v2: tovar turi ──────────────────────────────────────────────────── */
  "enum.productType.GOODS": "Tovar",
  "enum.productType.SERVICE": "Xizmat",

  /* ── v2: markirovka guruhi ───────────────────────────────────────────── */
  "enum.marking.TAMAKI": "Tamaki",
  "enum.marking.ALKOGOL": "Alkogol",
  "enum.marking.PIVO": "Pivo",
  "enum.marking.SUV_ICHIMLIK": "Suv va ichimlik",
  "enum.marking.DORI": "Dori",
  "enum.marking.TIBBIY_VOSITA": "Tibbiy vosita",
  "enum.marking.OYOQ_KIYIM": "Oyoq kiyim",
  "enum.marking.MAISHIY_TEXNIKA": "Maishiy texnika",
  "enum.marking.ZARGARLIK": "Zargarlik",
  "enum.marking.YOG_MOY": "Yog' va moy",
  "enum.marking.BOSHQA": "Boshqa",

  /* ── v2: faoliyat turi ───────────────────────────────────────────────── */
  "enum.business.GROCERY": "Oziq-ovqat",
  "enum.business.CONSTRUCTION": "Qurilish-xo'jalik",
  "enum.business.CLOTHING": "Kiyim-kechak",
  "enum.business.COSMETICS": "Kosmetika va maishiy kimyo",
  "enum.business.STATIONERY": "Kanstovar",
  "enum.business.ELECTRONICS": "Elektronika",
  "enum.business.AUTO_PARTS": "Avto ehtiyot qismlar",
  "enum.business.SERVICE": "Xizmat ko'rsatish",
  "enum.business.OTHER": "Boshqa",

  /* ── v2: global katalog ──────────────────────────────────────────────── */
  "enum.globalStatus.PENDING": "Tekshirilmagan",
  "enum.globalStatus.VERIFIED": "Tasdiqlangan",
  "enum.globalStatus.REJECTED": "Rad etilgan",

};

/* ══════════════════════════════════════════════════════════════════════════
   РУССКИЙ
   ══════════════════════════════════════════════════════════════════════════ */
const ru = {
  "validation.dateInvalid": "Такой даты не существует",
  "common.checking": "Проверка…",
  "common.error": "Ошибка",

  "settings.language": "Язык интерфейса",

  "theme.label": "Режим отображения",
  "theme.system": "Системная",
  "theme.light": "Светлая",
  "theme.dark": "Тёмная",

  "login.welcome": "Добро пожаловать",
  "login.twoFactorCode": "\u041a\u043e\u0434 \u0434\u0432\u0443\u0445\u0444\u0430\u043a\u0442\u043e\u0440\u043d\u043e\u0439 \u0430\u0443\u0442\u0435\u043d\u0442\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0438",
  "login.twoFactorHint": "6-\u0437\u043d\u0430\u0447\u043d\u044b\u0439 \u043a\u043e\u0434 \u0438\u0437 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f-\u0430\u0443\u0442\u0435\u043d\u0442\u0438\u0444\u0438\u043a\u0430\u0442\u043e\u0440\u0430. \u041d\u0435\u0442 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430 \u2014 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u0434 \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f.",
  "signup.cta": "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d \u2014 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e",
  "signup.title": "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d",
  "signup.sub": "14 \u0434\u043d\u0435\u0439 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e. \u041a\u0430\u0440\u0442\u0430 \u043d\u0435 \u043d\u0443\u0436\u043d\u0430.",
  "signup.shopName": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0430",
  "signup.shopNamePh": "Baraka market",
  "signup.ownerName": "\u0412\u0430\u0448\u0435 \u0438\u043c\u044f",
  "signup.phone": "\u0422\u0435\u043b\u0435\u0444\u043e\u043d",
  "signup.email": "\u041f\u043e\u0447\u0442\u0430",
  "signup.emailHint": "\u0421\u0441\u044b\u043b\u043a\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u0438 \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u0430\u0440\u043e\u043b\u044f \u043f\u0440\u0438\u0434\u0443\u0442 \u043d\u0430 \u044d\u0442\u043e\u0442 \u0430\u0434\u0440\u0435\u0441.",
  "signup.passPh": "\u041c\u0438\u043d\u0438\u043c\u0443\u043c 8 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432",
  "signup.plan": "\u0422\u0430\u0440\u0438\u0444",
  "signup.planFree": "\u041f\u0440\u043e\u0431\u043d\u044b\u0439",
  "signup.planFreeSub": "14 \u0434\u043d\u0435\u0439 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e, \u0437\u0430\u0442\u0435\u043c \u0432\u044b\u0431\u0435\u0440\u0435\u0442\u0435 \u0442\u0430\u0440\u0438\u0444",
  "signup.planBasic": "\u041d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0439 \u2014 240 000 \u0441\u0443\u043c/\u043c\u0435\u0441",
  "signup.planBasicSub": "\u0414\u043b\u044f \u043d\u0435\u0431\u043e\u043b\u044c\u0448\u043e\u0433\u043e \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0430",
  "signup.planPremium": "\u041f\u0440\u043e\u0444\u0435\u0441\u0441\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0439 \u2014 620 000 \u0441\u0443\u043c/\u043c\u0435\u0441",
  "signup.planPremiumSub": "\u0414\u043b\u044f \u0444\u0438\u043b\u0438\u0430\u043b\u043e\u0432 \u0438 \u0431\u043e\u043b\u044c\u0448\u043e\u0439 \u043a\u043e\u043c\u0430\u043d\u0434\u044b",
  "signup.paidNote": "\u0414\u0430\u0436\u0435 \u0441 \u043f\u043b\u0430\u0442\u043d\u044b\u043c \u0442\u0430\u0440\u0438\u0444\u043e\u043c \u0432\u044b \u043d\u0430\u0447\u043d\u0451\u0442\u0435 \u0441 \u043f\u0440\u043e\u0431\u043d\u043e\u0433\u043e \u043f\u0435\u0440\u0438\u043e\u0434\u0430 \u2014 \u043f\u043e \u043e\u043f\u043b\u0430\u0442\u0435 \u043c\u044b \u0441\u0432\u044f\u0436\u0435\u043c\u0441\u044f \u0441\u0430\u043c\u0438.",
  "signup.submit": "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c\u0441\u044f",
  "signup.sent": "\u041c\u044b \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u043b\u0438 \u0441\u0441\u044b\u043b\u043a\u0443 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u043d\u0430 \u0432\u0430\u0448\u0443 \u043f\u043e\u0447\u0442\u0443. \u0414\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 24 \u0447\u0430\u0441\u0430.",
  "signup.fillAll": "\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u0432\u0441\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u043b\u044f",
  "signup.phoneInvalid": "\u041d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u043d\u043e\u043c\u0435\u0440 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430 (9 \u0446\u0438\u0444\u0440)",
  "signup.trialFoot": "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u044f\u0441\u044c, \u0432\u044b \u0441\u043e\u0433\u043b\u0430\u0448\u0430\u0435\u0442\u0435\u0441\u044c \u0441 \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u043c\u0438 \u0441\u0435\u0440\u0432\u0438\u0441\u0430.",
  "signup.confirming": "\u0413\u043e\u0442\u043e\u0432\u0438\u043c \u0432\u0430\u0448 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u2026",
  "signup.confirmingSub": "\u041d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434 \u2014 \u0438 \u043c\u044b \u0441\u0430\u043c\u0438 \u043e\u0442\u043a\u0440\u043e\u0435\u043c \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435.",
  "login.deviceCode": "\u041a\u043e\u0434 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u0430",
  "login.deviceHint": "\u041e\u0431\u043d\u0430\u0440\u0443\u0436\u0435\u043d\u043e \u043d\u043e\u0432\u043e\u0435 \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u043e. \u0412\u0432\u0435\u0434\u0438\u0442\u0435 6-\u0437\u043d\u0430\u0447\u043d\u044b\u0439 \u043a\u043e\u0434, \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043d\u044b\u0439 \u043d\u0430 \u0432\u0430\u0448\u0443 \u043f\u043e\u0447\u0442\u0443.",
  "login.selectStoreTitle": "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d",
  "login.selectStoreSub": "\u041e\u0442 \u0438\u043c\u0435\u043d\u0438 \u043a\u0430\u043a\u043e\u0433\u043e \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0430 \u0432\u044b \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442\u0435?",
  "login.mainStore": "\u0413\u043b\u0430\u0432\u043d\u044b\u0439 \u043c\u0430\u0433\u0430\u0437\u0438\u043d",
  "login.branchStore": "\u0424\u0438\u043b\u0438\u0430\u043b",
  "login.myStore": "\u0412\u0430\u0448 \u043c\u0430\u0433\u0430\u0437\u0438\u043d",
  "login.forgotLink": "\u0417\u0430\u0431\u044b\u043b\u0438 \u043f\u0430\u0440\u043e\u043b\u044c?",
  "login.forgotTitle": "\u0412\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u0430\u0440\u043e\u043b\u044f",
  "login.forgotSub": "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u043c \u0441\u0441\u044b\u043b\u043a\u0443 \u043d\u0430 \u043f\u043e\u0447\u0442\u0443, \u043f\u0440\u0438\u0432\u044f\u0437\u0430\u043d\u043d\u0443\u044e \u043a \u0443\u0447\u0451\u0442\u043d\u043e\u0439 \u0437\u0430\u043f\u0438\u0441\u0438",
  "login.forgotSubmit": "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u0441\u044b\u043b\u043a\u0443",
  "login.forgotSent": "\u0415\u0441\u043b\u0438 \u0442\u0430\u043a\u0430\u044f \u0443\u0447\u0451\u0442\u043d\u0430\u044f \u0437\u0430\u043f\u0438\u0441\u044c \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442, \u0441\u0441\u044b\u043b\u043a\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430",
  "login.backToLogin": "\u041d\u0430\u0437\u0430\u0434 \u043a \u0432\u0445\u043e\u0434\u0443",
  "login.resetTitle": "\u041d\u043e\u0432\u044b\u0439 \u043f\u0430\u0440\u043e\u043b\u044c",
  "login.resetSub": "\u041c\u0438\u043d\u0438\u043c\u0443\u043c 8 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432. \u041d\u0435 \u043f\u043e\u0432\u0442\u043e\u0440\u044f\u0439\u0442\u0435 \u0441\u0442\u0430\u0440\u044b\u0439.",
  "login.resetSubmit": "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043f\u0430\u0440\u043e\u043b\u044c",
  "login.resetDone": "\u041f\u0430\u0440\u043e\u043b\u044c \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d. \u0422\u0435\u043f\u0435\u0440\u044c \u043c\u043e\u0436\u043d\u043e \u0432\u043e\u0439\u0442\u0438",
  "login.resetTooShort": "\u041f\u0430\u0440\u043e\u043b\u044c \u2014 \u043d\u0435 \u043c\u0435\u043d\u0435\u0435 8 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432",
  "login.newPassword": "\u041d\u043e\u0432\u044b\u0439 \u043f\u0430\u0440\u043e\u043b\u044c",
  "login.resetFoot": "\u0421\u0441\u044b\u043b\u043a\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 30 \u043c\u0438\u043d\u0443\u0442 \u0438 \u0441\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0435\u0442 \u043e\u0434\u0438\u043d \u0440\u0430\u0437",
  "login.subtitle": "Войдите, чтобы управлять своим магазином",
  "login.tabType": "Тип входа",
  "login.tabUser": "Сотрудник магазина",
  "login.tabAdmin": "Админ",
  "login.adminNote": "Только для системных администраторов",
  "login.shopCode": "Код магазина",
  "login.login": "Логин",
  "login.password": "Пароль",
  "login.showPassword": "Показать пароль",
  "login.hidePassword": "Скрыть пароль",
  "login.submit": "Войти",
  "login.submitAdmin": "Войти как админ",
  "login.redirectNote": "После входа вы будете перенаправлены на {host}",
  "login.needShopCode": "Введите код магазина",
  "login.needUsername": "Введите имя пользователя",
  "login.needPassword": "Введите пароль",
  "login.errBadCredentials": "Неверный логин или пароль",
  "login.errLocked": "Аккаунт заблокирован на 15 минут. Обратитесь к владельцу.",
  "login.errTooMany": "Слишком много попыток. Повторите через несколько минут.",
  "login.errNetwork": "Не удалось подключиться к серверу. Проверьте интернет.",
  "login.errGeneric": "Ошибка при входе",
  "login.brandTitle": "Сколько магазин заработал сегодня — видно с одного взгляда",
  "login.receiptToday": "Сегодня",
  "login.receiptRegister": "Касса №1",
  "login.receiptLabel": "Выручка за сегодня",
  "login.receiptSales": "Продажи",
  "login.receiptAvg": "Средний чек",
  "login.receiptSplit": "Наличные / Карта",
  "login.point1": "Продажи не останавливаются без интернета — они сохраняются на устройстве",
  "login.point2": "Уведомление приходит до того, как товар закончится",
  "login.point3": "Каждое действие записывается в журнал",

  "enum.payment.CASH": "Наличные",
  "enum.payment.CARD": "Карта",
  "enum.payment.CLICK": "Click",
  "enum.payment.PAYME": "Payme",
  "enum.payment.MIXED": "Смешанно",

  "enum.sale.CREATED": "Новая",
  "enum.sale.PAID": "Оплачена",
  "enum.sale.CREDIT": "В долг",
  "enum.sale.CANCELLED": "Отменена",

  "enum.shopStatus.ACTIVE": "Активен",
  "enum.shopStatus.BLOCKED": "Заблокирован",
  "enum.shopStatus.SUSPENDED": "Приостановлен",
  "enum.shopStatus.INACTIVE": "Неактивен",
  "enum.shopStatus.DELETED": "Удалён",

  "enum.plan.FREE": "Бесплатный",
  "enum.plan.BASIC": "Начальный",
  "enum.plan.PREMIUM": "Профессиональный",

  "enum.role.OWNER": "Владелец магазина",
  "enum.role.OWNER.short": "Владелец",
  "enum.role.SHOP_ADMIN": "Администратор магазина",
  "enum.role.SHOP_ADMIN.short": "Админ",
  "enum.role.CASHIER": "Кассир",
  "enum.role.CASHIER.short": "Кассир",
  "enum.role.STOREKEEPER": "Кладовщик",
  "enum.role.STOREKEEPER.short": "Кладовщик",

  "enum.adminRole.SUPER_ADMIN": "Суперадмин",
  "enum.adminRole.SYSTEM_ADMIN": "Системный админ",
  "enum.adminRole.SUPPORT_ADMIN": "Поддержка",
  "enum.adminRole.AUDITOR": "Аудитор",

  "enum.inventory.ACTIVE": "Годен",
  "enum.inventory.EXPIRED": "Просрочен",

  "enum.plan.ENTERPRISE": "Корпоративный",
  "enum.provider.MANUAL": "Вручную",
  "enum.provider.PAYME": "Payme",
  "enum.provider.CLICK": "Click",

  /* ── Filiallararo ko'chirish (V22) ───────────────────────────────── */
  "enum.transferStatus.SENT": "В пути",
  "enum.transferStatus.RECEIVED": "Принято",
  "enum.transferStatus.CANCELLED": "Отменено",

  /* ── Чек и кассовое оборудование ───────────────────────────────────────── */

  "enum.payment.CREDIT": "В долг",

  /* ── v2: единица измерения ───────────────────────────────────────────── */
  "enum.unit.DONA": "шт",
  "enum.unit.QUTI": "коробка",
  "enum.unit.QOP": "мешок",
  "enum.unit.JUFT": "пара",
  "enum.unit.RULON": "рулон",
  "enum.unit.TO_PLAM": "набор",
  "enum.unit.KG": "кг",
  "enum.unit.GRAM": "г",
  "enum.unit.LITR": "л",
  "enum.unit.MILLILITR": "мл",
  "enum.unit.METR": "м",
  "enum.unit.METR_KV": "м²",
  "enum.unit.METR_KUB": "м³",
  "enum.unit.SOAT": "час",

  /* ── v2: тип товара ──────────────────────────────────────────────────── */
  "enum.productType.GOODS": "Товар",
  "enum.productType.SERVICE": "Услуга",

  /* ── v2: группа маркировки ───────────────────────────────────────────── */
  "enum.marking.TAMAKI": "Табак",
  "enum.marking.ALKOGOL": "Алкоголь",
  "enum.marking.PIVO": "Пиво",
  "enum.marking.SUV_ICHIMLIK": "Вода и напитки",
  "enum.marking.DORI": "Лекарства",
  "enum.marking.TIBBIY_VOSITA": "Медизделия",
  "enum.marking.OYOQ_KIYIM": "Обувь",
  "enum.marking.MAISHIY_TEXNIKA": "Бытовая техника",
  "enum.marking.ZARGARLIK": "Ювелирные изделия",
  "enum.marking.YOG_MOY": "Масла и жиры",
  "enum.marking.BOSHQA": "Прочее",

  /* ── v2: вид деятельности ────────────────────────────────────────────── */
  "enum.business.GROCERY": "Продукты",
  "enum.business.CONSTRUCTION": "Стройматериалы",
  "enum.business.CLOTHING": "Одежда",
  "enum.business.COSMETICS": "Косметика и бытовая химия",
  "enum.business.STATIONERY": "Канцтовары",
  "enum.business.ELECTRONICS": "Электроника",
  "enum.business.AUTO_PARTS": "Автозапчасти",
  "enum.business.SERVICE": "Услуги",
  "enum.business.OTHER": "Прочее",

  /* ── v2: общий каталог ───────────────────────────────────────────────── */
  "enum.globalStatus.PENDING": "Не проверено",
  "enum.globalStatus.VERIFIED": "Подтверждено",
  "enum.globalStatus.REJECTED": "Отклонено",

};

/* ══════════════════════════════════════════════════════════════════════════
   ENGLISH
   ══════════════════════════════════════════════════════════════════════════ */
const en = {
  "validation.dateInvalid": "No such date",
  "common.checking": "Checking…",
  "common.error": "Error",

  "settings.language": "Interface language",

  "theme.label": "Display mode",
  "theme.system": "System",
  "theme.light": "Light",
  "theme.dark": "Dark",

  "login.welcome": "Welcome",
  "login.twoFactorCode": "Two-factor code",
  "login.twoFactorHint": "The 6-digit code from your authenticator app. No phone \u2014 enter a recovery code.",
  "signup.cta": "Open a store — try it free",
  "signup.title": "Open a store",
  "signup.sub": "14-day free trial. No card required.",
  "signup.shopName": "Store name",
  "signup.shopNamePh": "Baraka market",
  "signup.ownerName": "Your name",
  "signup.phone": "Phone",
  "signup.email": "Email",
  "signup.emailHint": "The confirmation link and password recovery go to this address.",
  "signup.passPh": "At least 8 characters",
  "signup.plan": "Plan",
  "signup.planFree": "Trial",
  "signup.planFreeSub": "14 days free, choose a plan later",
  "signup.planBasic": "Basic — 240,000 UZS/mo",
  "signup.planBasicSub": "For a small store",
  "signup.planPremium": "Professional — 620,000 UZS/mo",
  "signup.planPremiumSub": "For branches and bigger teams",
  "signup.paidNote": "Even with a paid plan you start on the trial — we'll contact you about payment.",
  "signup.submit": "Sign up",
  "signup.sent": "We sent a confirmation link to your email. It is valid for 24 hours.",
  "signup.fillAll": "Fill in all required fields",
  "signup.phoneInvalid": "Invalid phone number (9 digits)",
  "signup.trialFoot": "By signing up you agree to the terms of service.",
  "signup.confirming": "Preparing your store…",
  "signup.confirmingSub": "A few seconds — we'll take you into the app.",
  "login.deviceCode": "Device confirmation code",
  "login.deviceHint": "New device detected. Enter the 6-digit code sent to your email.",
  "login.selectStoreTitle": "Choose a store",
  "login.selectStoreSub": "Which store will you work in?",
  "login.mainStore": "Main store",
  "login.branchStore": "Branch",
  "login.myStore": "Your store",
  "login.forgotLink": "Forgot password?",
  "login.forgotTitle": "Password reset",
  "login.forgotSub": "We will email a link to the address on your account",
  "login.forgotSubmit": "Send the link",
  "login.forgotSent": "If such an account exists, a link has been sent",
  "login.backToLogin": "Back to sign in",
  "login.resetTitle": "New password",
  "login.resetSub": "At least 8 characters. Do not reuse the old one.",
  "login.resetSubmit": "Save the password",
  "login.resetDone": "Password updated. You can sign in now",
  "login.resetTooShort": "The password must be at least 8 characters",
  "login.newPassword": "New password",
  "login.resetFoot": "The link is valid for 30 minutes and works once",
  "login.subtitle": "Sign in to manage your shop",
  "login.tabType": "Sign-in type",
  "login.tabUser": "Shop staff",
  "login.tabAdmin": "Admin",
  "login.adminNote": "For system administrators only",
  "login.shopCode": "Shop code",
  "login.login": "Login",
  "login.password": "Password",
  "login.showPassword": "Show password",
  "login.hidePassword": "Hide password",
  "login.submit": "Sign in",
  "login.submitAdmin": "Sign in as admin",
  "login.redirectNote": "After signing in you will be redirected to {host}",
  "login.needShopCode": "Enter the shop code",
  "login.needUsername": "Enter your username",
  "login.needPassword": "Enter your password",
  "login.errBadCredentials": "Incorrect login or password",
  "login.errLocked": "Account locked for 15 minutes. Contact the owner.",
  "login.errTooMany": "Too many attempts. Try again in a few minutes.",
  "login.errNetwork": "Could not reach the server. Check your connection.",
  "login.errGeneric": "Sign-in failed",
  "login.brandTitle": "See at a glance how much your shop earned today",
  "login.receiptToday": "Today",
  "login.receiptRegister": "Register #1",
  "login.receiptLabel": "Today’s revenue",
  "login.receiptSales": "Sales",
  "login.receiptAvg": "Average ticket",
  "login.receiptSplit": "Cash / Card",
  "login.point1": "Selling continues offline — sales are stored on the device",
  "login.point2": "You are notified before stock runs out",
  "login.point3": "Every action is written to the log",

  "enum.payment.CASH": "Cash",
  "enum.payment.CARD": "Card",
  "enum.payment.CLICK": "Click",
  "enum.payment.PAYME": "Payme",
  "enum.payment.MIXED": "Mixed",

  "enum.sale.CREATED": "New",
  "enum.sale.PAID": "Paid",
  "enum.sale.CREDIT": "On credit",
  "enum.sale.CANCELLED": "Cancelled",

  "enum.shopStatus.ACTIVE": "Active",
  "enum.shopStatus.BLOCKED": "Blocked",
  "enum.shopStatus.SUSPENDED": "Suspended",
  "enum.shopStatus.INACTIVE": "Inactive",
  "enum.shopStatus.DELETED": "Deleted",

  "enum.plan.FREE": "Free",
  "enum.plan.BASIC": "Basic",
  "enum.plan.PREMIUM": "Professional",

  "enum.role.OWNER": "Shop owner",
  "enum.role.OWNER.short": "Owner",
  "enum.role.SHOP_ADMIN": "Shop admin",
  "enum.role.SHOP_ADMIN.short": "Admin",
  "enum.role.CASHIER": "Cashier",
  "enum.role.CASHIER.short": "Cashier",
  "enum.role.STOREKEEPER": "Storekeeper",
  "enum.role.STOREKEEPER.short": "Storekeeper",

  "enum.adminRole.SUPER_ADMIN": "Super admin",
  "enum.adminRole.SYSTEM_ADMIN": "System admin",
  "enum.adminRole.SUPPORT_ADMIN": "Support",
  "enum.adminRole.AUDITOR": "Auditor",

  "enum.inventory.ACTIVE": "Valid",
  "enum.inventory.EXPIRED": "Expired",

  "enum.plan.ENTERPRISE": "Enterprise",
  "enum.provider.MANUAL": "Manual",
  "enum.provider.PAYME": "Payme",
  "enum.provider.CLICK": "Click",

  /* ── Filiallararo ko'chirish (V22) ───────────────────────────────── */
  "enum.transferStatus.SENT": "In transit",
  "enum.transferStatus.RECEIVED": "Received",
  "enum.transferStatus.CANCELLED": "Cancelled",

  /* ── Receipt and cash hardware ─────────────────────────────────────────── */

  "enum.payment.CREDIT": "On credit",

  /* ── v2: unit of measure ─────────────────────────────────────────────── */
  "enum.unit.DONA": "pcs",
  "enum.unit.QUTI": "box",
  "enum.unit.QOP": "sack",
  "enum.unit.JUFT": "pair",
  "enum.unit.RULON": "roll",
  "enum.unit.TO_PLAM": "set",
  "enum.unit.KG": "kg",
  "enum.unit.GRAM": "g",
  "enum.unit.LITR": "L",
  "enum.unit.MILLILITR": "ml",
  "enum.unit.METR": "m",
  "enum.unit.METR_KV": "m²",
  "enum.unit.METR_KUB": "m³",
  "enum.unit.SOAT": "hour",

  /* ── v2: product type ────────────────────────────────────────────────── */
  "enum.productType.GOODS": "Goods",
  "enum.productType.SERVICE": "Service",

  /* ── v2: marking group ───────────────────────────────────────────────── */
  "enum.marking.TAMAKI": "Tobacco",
  "enum.marking.ALKOGOL": "Alcohol",
  "enum.marking.PIVO": "Beer",
  "enum.marking.SUV_ICHIMLIK": "Water & drinks",
  "enum.marking.DORI": "Medicine",
  "enum.marking.TIBBIY_VOSITA": "Medical devices",
  "enum.marking.OYOQ_KIYIM": "Footwear",
  "enum.marking.MAISHIY_TEXNIKA": "Home appliances",
  "enum.marking.ZARGARLIK": "Jewellery",
  "enum.marking.YOG_MOY": "Oils & fats",
  "enum.marking.BOSHQA": "Other",

  /* ── v2: business type ───────────────────────────────────────────────── */
  "enum.business.GROCERY": "Grocery",
  "enum.business.CONSTRUCTION": "Construction & hardware",
  "enum.business.CLOTHING": "Clothing",
  "enum.business.COSMETICS": "Cosmetics & household",
  "enum.business.STATIONERY": "Stationery",
  "enum.business.ELECTRONICS": "Electronics",
  "enum.business.AUTO_PARTS": "Auto parts",
  "enum.business.SERVICE": "Services",
  "enum.business.OTHER": "Other",

  /* ── v2: global catalog ──────────────────────────────────────────────── */
  "enum.globalStatus.PENDING": "Unverified",
  "enum.globalStatus.VERIFIED": "Verified",
  "enum.globalStatus.REJECTED": "Rejected",

};

export default { uz, ru, en };
