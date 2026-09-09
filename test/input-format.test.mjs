/* ══════════════════════════════════════════════════════════════════════════
   KIRISH EKRANINING MAYDONLARI — sinov

   ═══ NEGA AYNAN BU ALTI FUNKSIYA ══════════════════════════════════════

   Kirish ekranida oltita maydon bor va har biri `ek-input.js` dagi
   bitta sof funksiya ustida turadi (`EkFields.jsx`):

       CodeField     → codeInput       do'kon kodi
       UsernameField → usernameInput   login
       OtpField      → otpInput        ikki bosqichli kod
       NameField     → nameInput       ism-familiya (ro'yxatdan o'tish)
       PhoneField    → phoneInput      telefon
       EmailField    → emailInput      parolni tiklash

   ⚠ BU MAYDONLAR — XATO XABARI EMAS, TO'SIQ. Loyihaning qoidasi:
   noto'g'ri qiymat KIRITILMAYDI, keyin «nega kirmadi?» deb qidirilmaydi.
   Ya'ni bu funksiyalar buzilsa, ekran o'zi ishlayotgandek ko'rinadi —
   odam esa hisobiga kira olmaydi. Aynan shu bo'lgan (§51).

   ═══ NEGA SON QISMI HAM BOR ═══════════════════════════════════════════

   Kirish ekranida son maydoni YO'Q. Lekin `ek-input.js` — UCHALA
   ilovaga ko'chiriladigan UMUMIY fayl (`packages/ui/`, sync-tokens).
   Nusxalar bir-biridan ajralib ketishi mumkin va bu jimgina bo'ladi:
   `app` da tuzatilgan nuqson `auth` va `admin` nusxasida QOLAVERADI.
   Shu bo'lim aynan shuni ushladi — pastdagi «7 249.» bandiga qarang.

   Ishga tushirish:  node test/input-format.test.mjs
   ══════════════════════════════════════════════════════════════════════════ */
import {
  codeInput, usernameInput, isUsername, otpInput, nameInput,
  phoneInput, isPhone, emailInput, isEmail, displayNumber, numberInput,
} from "../src/lib/ek-input.js";

let pass = 0, fail = 0;
const ok  = (m) => { pass++; console.log("  ✅ " + m); };
const bad = (m, got) => { fail++; console.log("  ❌ " + m);
                          if (got !== undefined) console.log("     olindi: " + JSON.stringify(got)); };
const eq  = (actual, expected, msg) =>
  (actual === expected ? ok(msg) : bad(`${msg} (kutilgan: ${JSON.stringify(expected)})`, actual));

/* ⚠ QOCHIRISH BILAN YOZILADI, HARFI BILAN EMAS. Razryad ajratgichi
   — tor bo'shliq (U+202F), u ekranda oddiy probeldan farq qilmaydi.
   Sinovga uni harfi bilan yozsak, muharrir yoki nusxa ko'chirish uni
   jimgina oddiy probelga almashtirishi mumkin va sinov o'zi noto'g'ri
   sababdan yiqilardi — aynan shu bo'ldi. */
const NNBSP = "\u202F";

/* ══════════════════════════════════════════════════════════════════════════
   1. LOGIN — «katta harf va bo'sh joy tufayli kira olmaslik» (§51)

   Foydalanuvchi shikoyati aynan shunday edi: telefon klaviaturasi
   birinchi harfni O'ZI kattalashtiradi, ko'chirib qo'yilgan loginda esa
   oxirida bo'shliq qoladi. Server loginni AYNAN solishtiradi, ya'ni
   «Kassir » bilan «kassir» — ikki xil hisob. Ekran esa sababni
   AYTMAYDI (hisob bor-yo'qligini oshkor qilmaslik uchun), shuning
   uchun odam nima qilishini ham bilmasdi.
   ══════════════════════════════════════════════════════════════════════════ */
console.log("\n═══ 1. Login: katta harf va bo'shliq (§51) ═══");

eq(usernameInput("  Kassir  "), "kassir", "bosh harf va bo'shliq — ikkalasi ham yo'qoladi");
eq(usernameInput("ADMIN_01"), "admin_01", "butun boshli katta harf ham tushadi");
eq(usernameInput("ali-2024"), "ali2024", "chiziqcha login belgisi EMAS — tashlanadi");

/* ⚠ KIRILL ATAYLAB TASHLANADI. Rus tilidagi klaviaturada «Кассир» va
   lotin «Kassir» ko'zga BIR XIL ko'rinadi, bazada esa boshqa satr.
   Bo'sh natija — «bu klaviatura bilan bo'lmaydi» degan ko'rinadigan
   javob; jimgina o'tib ketgan kirill esa hech qachon topilmaydigan
   login bo'lardi. */
eq(usernameInput("Кассир"), "", "kirill login — umuman kiritilmaydi");
eq(usernameInput("kassirКассир"), "kassir", "aralash yozuvda faqat lotin qismi qoladi");

eq(usernameInput("a".repeat(40)), "a".repeat(32), "32 belgidan uzuni kesiladi");
eq(usernameInput(null), "", "null — bo'sh satr, istisno emas");

console.log("");
eq(isUsername("abc"), true, "uch belgi — eng qisqa ruxsat etilgan login");
eq(isUsername("ab"), false, "ikki belgi rad etiladi");
eq(isUsername("Abc"), false, "katta harf bilan tekshiruvdan o'tmaydi");
eq(isUsername(""), false, "bo'sh login rad etiladi");

/* ══════════════════════════════════════════════════════════════════════════
   2. DO'KON KODI — yashirin maydon, lekin YAGONA yo'l

   Kod maydoni «Do'kon kodi bilan kirish» havolasi ortida turadi
   (`scripts/check-login.mjs` shuni qulflaydi). U faqat bitta holatda
   kerak: eski bazada harfi bilan farq qiladigan ikkita login bo'lsa.
   Ya'ni bu maydon ishlamasa, o'sha hisoblar UMUMAN kira olmaydi.
   ══════════════════════════════════════════════════════════════════════════ */
console.log("\n═══ 2. Do'kon kodi ═══");

eq(codeInput(" MAGAZIN-01 "), "magazin-01", "kod kichik harfga tushadi, bo'shliq ketadi");
eq(codeInput("do'kon 2"), "dokon2", "apostrof va bo'shliq kodda yo'q");
eq(codeInput("shop_1"), "shop_1", "pastki chiziq va chiziqcha kodda RUXSAT");
eq(codeInput("Магазин"), "", "kirill kod — bo'sh");

/* ══════════════════════════════════════════════════════════════════════════
   3. IKKI BOSQICHLI KOD — bitta maydon, IKKI xil kod

   Maydon TOTP (6 raqam) va tiklash kodini («ABCD-EFGH») birga qabul
   qiladi, shuning uchun uni faqat raqamga cheklab bo'lmaydi.

   ⚠ KICHIK HARF — HAQIQIY NUQSON EDI: odam tiklash kodini qog'ozdan
   ko'chirganda kichik yozadi, server esa uni RAD ETADI. Bu esa ikkinchi
   omil yoqilgan hisobning yagona zaxira yo'li.
   ══════════════════════════════════════════════════════════════════════════ */
console.log("\n═══ 3. Ikki bosqichli kod ═══");

eq(otpInput("123 456"), "123456", "TOTP dagi bo'shliq tashlanadi");
eq(otpInput("abcd-efgh"), "ABCD-EFGH", "tiklash kodi KATTA harfga o'tadi");
eq(otpInput("abcd efgh"), "ABCDEFGH", "bo'shliq bilan yozilgan tiklash kodi ham o'tadi");
eq(otpInput("1234567890123"), "123456789", "9 belgidan uzuni kesiladi (ABCD-EFGH uzunligi)");

/* ══════════════════════════════════════════════════════════════════════════
   4. TELEFON — `+998` prefiksi (ro'yxatdan o'tish va parol tiklash)

   ⚠ IKKITA ALOHIDA NUQSON, ikkalasi ham foydalanuvchi shikoyatidan.
   ══════════════════════════════════════════════════════════════════════════ */
console.log("\n═══ 4. Telefon ═══");

eq(phoneInput("901234567").display, "(90) 123-45-67", "9 raqam niqobga tushadi");
eq(phoneInput("901234567").raw, "+998901234567", "serverga to'liq raqam ketadi");

/* ⚠ 13 RAQAM. Ilgari maydon ham, backend qoidasi ham
   (`^\+?[0-9]{9,13}$`) buni o'tkazardi. Bunday raqamga na SMS ketadi,
   na qo'ng'iroq — mijoz bazasi jimgina buziladi. */
eq(phoneInput("+9989962806286").digits.length, 9, "13 raqamli raqam 9 taga kesiladi");

/* ⚠ QISQARAYOTGAN RAQAM. Kod FAQAT raqamlar soni 9 dan oshganda
   kesiladi. Ilgari u HAR DOIM kesilardi va odam raqamni o'chira
   boshlaganda «998» abonent raqamiga aylanib ketardi: `+998901234`
   dan «(99) 890-12-34» chiqardi. Ya'ni raqam qisqarish o'rniga
   O'ZGARIB ketardi — foydalanuvchi shikoyati aynan shu edi. */
eq(phoneInput("+998901234").display, "(90) 123-4", "raqam o'chirilganda «998» abonentga aylanmaydi");
eq(phoneInput("+998901234").valid, false, "yarim raqam haqiqiy emas");

eq(phoneInput("998901234567").display, "(90) 123-45-67", "kod bilan joylashtirilgan raqam");
eq(phoneInput("+998 (90) 123-45-67").display, "(90) 123-45-67", "niqob o'z natijasini qayta o'qiy oladi");
eq(isPhone("901234567"), true, "to'liq raqam haqiqiy");
eq(isPhone("90123456"), false, "8 raqam — haqiqiy emas");
eq(phoneInput("").raw, "", "bo'sh maydon `+998` qoldirmaydi");

/* ══════════════════════════════════════════════════════════════════════════
   5. POCHTA — parolni tiklash havolasi shu manzilga ketadi

   Bu yerda xato «keyin tuzataman» degan xato emas: xat noto'g'ri
   manzilga ketsa, odam parolini TIKLAY OLMAYDI va buni bilmaydi ham.
   ══════════════════════════════════════════════════════════════════════════ */
console.log("\n═══ 5. Pochta ═══");

eq(emailInput(" Ali@Mail.RU "), "ali@mail.ru", "bo'shliq ketadi, harflar kichrayadi");
eq(emailInput("a li@mail.uz"), "ali@mail.uz", "ichkaridagi bo'shliq ham ketadi");
eq(isEmail("ali@mail.uz"), true, "oddiy manzil o'tadi");
eq(isEmail("ali@mail"), false, "domensiz manzil rad etiladi");
eq(isEmail("ali@@mail.uz"), false, "ikkita «@» rad etiladi");
eq(isEmail(""), false, "bo'sh manzil rad etiladi");

/* ══════════════════════════════════════════════════════════════════════════
   6. ISM — ro'yxatdan o'tish formasi
   ══════════════════════════════════════════════════════════════════════════ */
console.log("\n═══ 6. Ism-familiya ═══");

eq(nameInput("Ali Valiyev 7"), "Ali Valiyev ", "ismda raqam bo'lmaydi");
eq(nameInput("Ali  Valiyev"), "Ali Valiyev", "ikkilangan bo'shliq bittaga tushadi");
eq(nameInput("Oʻtkir-Sh."), "Oʻtkir-Sh.", "apostrof, chiziqcha va nuqta ismda QOLADI");
eq(nameInput("Пётр"), "Пётр", "kirill ISM — qoladi (login emas, bu odamning ismi)");

/* ══════════════════════════════════════════════════════════════════════════
   7. UMUMIY FAYL NUSXASI AJRALIB KETMASIN

   ⚠ BU BO'LIM HAQIQIY AJRALISHNI USHLADI. `ek-input.js` uchala
   ilovada bir xil bo'lishi kerak, lekin nusxalar QO'LDA ko'chiriladi.
   `app` nusxasida «7 249.» nuqsoni (§65) tuzatilgan edi, `auth` va
   `admin` nusxasida esa TUZATILMAGAN holicha qolgan — sinov yozilgunga
   qadar buni hech narsa ko'rsatmasdi.

   Kirish ekranida son maydoni yo'q, ya'ni bu yerda nuqson KO'RINMAYDI.
   Lekin nusxa keyingi safar `app` ga ko'chirilsa, tuzatish ORQAGA
   qaytib ketardi. Shuning uchun shartnoma shu yerda ham qulflanadi.
   ══════════════════════════════════════════════════════════════════════════ */
console.log("\n═══ 7. Umumiy fayl: son shartnomasi ═══");

/* ⚠ BUTUN SON MAYDONIDA NUQTA HECH QACHON CHIQMAYDI. Server 2 kasr
   bilan yuborgan qiymat («7249.99») butun son maydoniga tushganda
   kasr kesilar-u NUQTA qolardi va maydonda «7 249.» degan chala raqam
   turardi — do'kon egasi aynan shuni ko'rsatdi (§65). */
eq(displayNumber("7249.99", { decimals: 0 }), "7" + NNBSP + "249",
   "butun son maydonida chala «7 249.» chiqmaydi");
eq(displayNumber("7249.99", { decimals: 2 }), "7" + NNBSP + "249.99",
   "ikki kasrli maydonda kasr QOLADI");
eq(displayNumber("", { decimals: 0 }), "", "bo'sh qiymat bo'sh ko'rinadi");
eq(displayNumber(null, { decimals: 0 }), "", "null — bo'sh, «0» emas");

/* Manfiy son loyihaning HECH BIR maydonida ma'noga ega emas. */
eq(numberInput("-500", { decimals: 0 }).raw, "500", "minus tashlanadi");
eq(numberInput("12abc34", { decimals: 0 }).raw, "1234", "harflar tashlanadi");

console.log(`\n${fail ? "❌" : "✅"} kirish maydonlari: ${pass} o'tdi, ${fail} yiqildi`);
process.exit(fail ? 1 : 0);
