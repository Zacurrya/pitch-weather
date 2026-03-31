import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      '@components': '/src/components',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
      '@contexts': '/src/contexts',
      '@assets': '/src/assets',
      '@screens': '/src/screens',
      '@': '/src',
    },
  },
})
