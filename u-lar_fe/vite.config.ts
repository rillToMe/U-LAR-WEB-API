import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Dua dokumen: aplikasi web (index.html) dan halaman materi untuk
      // WebView game (materi.html). Yang kedua punya viewport dan gaya sendiri.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        materi: fileURLToPath(new URL('./materi.html', import.meta.url)),
      },
    },
  },
})
