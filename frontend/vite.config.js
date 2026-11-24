import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Onde está a API. No Docker é o serviço "app"; rodando fora do Docker, localhost.
const API_URL = process.env.API_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // aceita acesso de fora do container
    // No Docker com Windows, o aviso de "arquivo alterado" não chega ao container;
    // o polling faz a tela recarregar sozinha quando você salva um arquivo.
    watch: process.env.VITE_POLLING === 'true' ? { usePolling: true, interval: 300 } : undefined,
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true
      }
    }
  }
});
