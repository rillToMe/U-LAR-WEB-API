import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "./styles/material.css";
import MaterialReaderPage from "./pages/material/MaterialReaderPage";

/**
 * Titik masuk dokumen materi (`materi.html`) yang dimuat WebView game.
 *
 * Masih terpisah dari `main.tsx` - tanpa router dan tanpa kerangka web admin -
 * tapi memakai gaya yang sama dengan web ujian: `styles/index.css` memuat
 * Tailwind, token desain, dan tema ujian, sedangkan `material.css` hanya
 * menyisakan aturan tingkat dokumen khusus WebView.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MaterialReaderPage />
  </StrictMode>
);
