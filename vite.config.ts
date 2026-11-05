import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 개발 서버가 /v1 호출을 넘겨 줄 백엔드 주소. 서버 IP 는 레포에 적지 않고 .env.local 에 둔다
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.DEV_API_PROXY || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/v1': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
