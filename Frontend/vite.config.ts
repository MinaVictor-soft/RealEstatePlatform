import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // loadEnv reads .env files (and OS environment) with no prefix filter, so
  // server-side-only variables like BACKEND_URL are accessible here even
  // though they lack the VITE_ prefix required for browser exposure.
  const env = loadEnv(mode, process.cwd(), '');

  // The Vite dev-server proxy runs inside the container (Node.js process), so
  // it can always reach the backend on localhost regardless of Replit's public
  // proxy. BACKEND_URL lets you override the target when the backend runs on a
  // different host (e.g. a remote server or a non-default port).
  const backendUrl = env.BACKEND_URL || 'http://localhost:5238';

  return {
    plugins: [react()],
    build: {
      outDir: '../dist/wwwroot',
      emptyOutDir: true,
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allowedHosts: true as any,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
