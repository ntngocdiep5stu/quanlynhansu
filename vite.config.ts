import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor_react: ['react', 'react-dom'],
          vendor_charts: ['recharts'],
          vendor_motion: ['framer-motion'],
          vendor_docs: ['xlsx', 'docx', 'file-saver'],
        }
      }
    }
  }
});
