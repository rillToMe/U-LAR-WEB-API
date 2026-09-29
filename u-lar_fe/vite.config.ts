import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Satu dokumen saja (index.html). Halaman materi kini rute SPA di /materi,
// jadi tidak ada lagi dokumen materi.html terpisah.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
