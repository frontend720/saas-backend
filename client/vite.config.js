import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'http://localhost:4500',
      '/graphql': 'http://localhost:4500',
      //   '/api': 'http://127.0.0.1:4040',
      // '/graphql': 'https://8292-83-136-182-237.ngrok-free.app',
    },
    // http: '192.168.1.142'
    http: '172.20.10.2' // Starbucks
  },
})
