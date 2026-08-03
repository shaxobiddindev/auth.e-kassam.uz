import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initTheme } from "./lib/ek-theme";
import { initLang } from "./lib/ek-i18n";

initTheme();

// Til — URL dagi `?lang=` (ilovalararo yo'naltirishdan) localStorage ga
// ko'chiriladi va <html lang> qo'yiladi. Faqat INTERFEYSGA ta'sir qiladi.
initLang();

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
